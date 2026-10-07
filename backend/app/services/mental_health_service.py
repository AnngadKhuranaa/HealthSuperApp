"""
Mental Health Screening Service.

All scoring and report-generation logic lives here, separate from API routes.
Scores are calculated server-side from raw submitted answers.
"""
from datetime import datetime, timezone
from typing import Any

from app.core.questionnaire import (
    QUESTIONS,
    QUESTIONNAIRE_TITLE,
    QUESTIONNAIRE_VERSION,
    RESPONSE_OPTIONS,
    SCORE_INTERPRETATION,
    SAFETY_MESSAGE,
    DISCLAIMER,
)
from app.schemas.mental_health import ScreeningReport, SymptomStatus


def calculate_score(answers: dict[str, int]) -> int:
    """
    Sum all submitted answer values.
    Only questions present in QUESTIONS are included — prevents injection
    of extra keys from the client.
    """
    valid_ids = {q["id"] for q in QUESTIONS}
    return sum(
        val for qid, val in answers.items()
        if qid in valid_ids
    )


def get_score_interpretation(score: int) -> dict[str, str] | None:
    """Return the interpretation band for a given score, or None if not found."""
    for band in SCORE_INTERPRETATION:
        if band["min"] <= score <= band["max"]:
            return band
    return None


def build_symptom_checklist(
    answers: dict[str, int],
    answered_ids: set[str],
) -> list[SymptomStatus]:
    """
    Build the symptom checklist from actual submitted answers.
    An unanswered required question becomes 'not_answered', not 'not_reported'.
    """
    checklist: list[SymptomStatus] = []

    for q in QUESTIONS:
        qid = q["id"]
        if qid not in answered_ids:
            checklist.append(
                SymptomStatus(
                    question_id=qid,
                    symptom_label=q["symptom_label"],
                    response_value=None,
                    response_label="Not answered",
                    status="not_answered",
                    safety_flag=q["safety_flag"],
                )
            )
        else:
            val = answers[qid]
            if val == 0:
                status = "not_reported"
            else:
                status = "reported"
            checklist.append(
                SymptomStatus(
                    question_id=qid,
                    symptom_label=q["symptom_label"],
                    response_value=val,
                    response_label=RESPONSE_OPTIONS[val],
                    status=status,
                    safety_flag=q["safety_flag"],
                )
            )

    return checklist


def check_safety_concern(answers: dict[str, int]) -> bool:
    """
    Return True if any safety-flagged question has a response > 0.
    An overall score cannot override a concerning individual response.
    """
    safety_ids = {q["id"] for q in QUESTIONS if q["safety_flag"]}
    return any(answers.get(sid, 0) > 0 for sid in safety_ids)


def build_next_steps(score: int, safety_concern: bool, is_partial: bool) -> list[str]:
    """Generate suggested next steps based on screening results."""
    steps: list[str] = []

    if safety_concern:
        steps.append(
            "Seek support immediately: your response indicates thoughts of self-harm. "
            "Please contact a healthcare professional, crisis line, or trusted person now."
        )

    if is_partial:
        steps.append(
            "The questionnaire was not fully completed. Consider re-taking it with all "
            "questions answered for a more complete screening."
        )

    if score >= 10:
        steps.append(
            "Discuss these results with a qualified healthcare professional "
            "(GP, psychologist, or psychiatrist) as soon as convenient."
        )
    elif score >= 5:
        steps.append(
            "Monitor your mood and wellbeing over the coming weeks. "
            "If symptoms persist or worsen, speak with a healthcare professional."
        )
    else:
        steps.append(
            "Continue to look after your general wellbeing: regular sleep, "
            "physical activity, social connection, and stress management all help."
        )

    steps.append(
        "This screening result is NOT a diagnosis. Only a qualified professional "
        "can assess and diagnose mental health conditions."
    )

    return steps


def generate_report(answers: dict[str, int]) -> ScreeningReport:
    """
    Core service function: validate answer keys, compute score,
    build checklist, and return a structured ScreeningReport.

    Only question IDs present in QUESTIONS are processed.
    """
    valid_question_ids = {q["id"] for q in QUESTIONS}
    required_ids = {q["id"] for q in QUESTIONS if q["required"]}
    answered_ids = set(answers.keys()) & valid_question_ids
    missing = sorted(required_ids - answered_ids)

    is_partial = len(missing) > 0

    score = calculate_score(answers)
    max_score = 3 * len(QUESTIONS)
    interpretation = get_score_interpretation(score) if not is_partial else None

    checklist = build_symptom_checklist(answers, answered_ids)
    safety_concern = check_safety_concern(answers)

    return ScreeningReport(
        screening_name=QUESTIONNAIRE_TITLE,
        questionnaire_version=QUESTIONNAIRE_VERSION,
        completed_at=datetime.now(timezone.utc),
        completion_status="partial" if is_partial else "complete",
        total_score=score,
        max_possible_score=max_score,
        score_interpretation_label=interpretation["label"] if interpretation else None,
        score_interpretation_description=interpretation["description"] if interpretation else None,
        scoring_method=(
            f"Each of the {len(QUESTIONS)} questions is scored 0 (Not at all) to 3 "
            f"(Nearly every day). Scores are summed to give a total out of {max_score}. "
            "Score bands are illustrative and have not been clinically validated for this prototype."
        ),
        symptom_checklist=checklist,
        missing_questions=missing,
        safety_concern=safety_concern,
        safety_message=SAFETY_MESSAGE if safety_concern else None,
        suggested_next_steps=build_next_steps(score, safety_concern, is_partial),
        disclaimer=DISCLAIMER,
    )
