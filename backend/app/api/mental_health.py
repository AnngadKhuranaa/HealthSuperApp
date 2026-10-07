"""Mental Health Screening API routes."""
from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from app.core.questionnaire import (
    QUESTIONNAIRE_TITLE,
    QUESTIONNAIRE_VERSION,
    QUESTIONNAIRE_INSTRUCTIONS,
    QUESTIONS,
    RESPONSE_OPTIONS,
    SCORE_INTERPRETATION,
    DISCLAIMER,
)
from app.schemas.mental_health import QuestionnaireSubmission, ScreeningReport
from app.services.mental_health_service import generate_report

router = APIRouter()


@router.get("/info")
def get_questionnaire_info():
    """
    Return full questionnaire definition: questions, response options,
    scoring information, and limitations.
    """
    return {
        "title": QUESTIONNAIRE_TITLE,
        "version": QUESTIONNAIRE_VERSION,
        "instructions": QUESTIONNAIRE_INSTRUCTIONS,
        "questions": QUESTIONS,
        "response_options": {str(k): v for k, v in RESPONSE_OPTIONS.items()},
        "total_questions": len(QUESTIONS),
        "max_score": 3 * len(QUESTIONS),
        "score_interpretation": SCORE_INTERPRETATION,
        "disclaimer": DISCLAIMER,
        "limitations": [
            "This is a PROTOTYPE questionnaire. It has not been clinically validated.",
            "Results are not a medical diagnosis.",
            "This tool does not replace evaluation by a qualified healthcare professional.",
            "Score interpretation bands are illustrative only.",
            "Self-reported symptoms are not independently verified clinical findings.",
        ],
    }


@router.post("/sessions", response_model=ScreeningReport, status_code=201)
def submit_questionnaire(submission: QuestionnaireSubmission):
    """
    Accept submitted questionnaire answers, validate them server-side,
    calculate the screening result, and return a structured report.

    The frontend score (if any) is ignored — scoring always happens here.
    """
    try:
        report = generate_report(submission.answers)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return report
