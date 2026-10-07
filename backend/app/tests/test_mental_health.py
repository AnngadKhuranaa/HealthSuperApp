"""
Automated tests for the HealthOS backend.

Tests cover:
- Health endpoint
- Module listing
- Questionnaire info
- Valid submission and correct scoring
- Known score inputs
- Invalid response values
- Missing required answers
- Incomplete submissions
- Symptom checklist accuracy
- Safety-flagged response handling
- Report structure consistency
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.questionnaire import QUESTIONS
from app.services.mental_health_service import (
    calculate_score,
    check_safety_concern,
    build_symptom_checklist,
    get_score_interpretation,
)

client = TestClient(app)

# ─── Helper ───────────────────────────────────────────────────────────────────

def all_question_ids():
    return [q["id"] for q in QUESTIONS]

def full_answers(value: int = 0) -> dict[str, int]:
    """Build a complete answer dict with all questions set to `value`."""
    return {q["id"]: value for q in QUESTIONS}


# ─── System Endpoints ──────────────────────────────────────────────────────────

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["application"] == "HealthOS"
    assert "docs" in data


def test_health_check():
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "timestamp" in data


# ─── Modules ──────────────────────────────────────────────────────────────────

def test_modules_list():
    r = client.get("/api/modules")
    assert r.status_code == 200
    data = r.json()
    assert "modules" in data
    modules = data["modules"]
    assert len(modules) == 3

    statuses = {m["id"]: m["status"] for m in modules}
    assert statuses["mental-health"] == "available"
    assert statuses["neurological"] == "planned"
    assert statuses["cardiovascular"] == "planned"


# ─── Questionnaire Info ────────────────────────────────────────────────────────

def test_questionnaire_info():
    r = client.get("/api/mental-health/info")
    assert r.status_code == 200
    data = r.json()
    assert "title" in data
    assert "questions" in data
    assert len(data["questions"]) == len(QUESTIONS)
    assert "response_options" in data
    assert "disclaimer" in data
    assert "limitations" in data


# ─── Scoring Unit Tests ────────────────────────────────────────────────────────

def test_score_all_zeros():
    assert calculate_score(full_answers(0)) == 0

def test_score_all_ones():
    assert calculate_score(full_answers(1)) == len(QUESTIONS) * 1

def test_score_all_threes():
    assert calculate_score(full_answers(3)) == len(QUESTIONS) * 3

def test_score_partial_answers():
    # Only q1=2, q2=3, rest missing
    answers = {"q1": 2, "q2": 3}
    assert calculate_score(answers) == 5

def test_score_ignores_unknown_keys():
    # Extra key not in QUESTIONS should not affect score
    answers = full_answers(1)
    answers["q_fake"] = 3
    assert calculate_score(answers) == len(QUESTIONS) * 1


# ─── Score Interpretation ──────────────────────────────────────────────────────

def test_interpretation_minimal():
    band = get_score_interpretation(0)
    assert band is not None
    assert band["label"] == "Minimal symptoms"

def test_interpretation_severe():
    band = get_score_interpretation(25)
    assert band is not None
    assert "severe" in band["label"].lower()

def test_interpretation_boundary():
    # 4 should be minimal, 5 should be mild
    assert get_score_interpretation(4)["label"] == "Minimal symptoms"
    assert get_score_interpretation(5)["label"] == "Mild symptom range"


# ─── Safety Concern ───────────────────────────────────────────────────────────

def test_safety_not_triggered_when_zero():
    answers = full_answers(0)
    assert check_safety_concern(answers) is False

def test_safety_triggered_by_safety_flag_question():
    # q9 is the safety-flagged question
    answers = full_answers(0)
    answers["q9"] = 1
    assert check_safety_concern(answers) is True

def test_safety_not_triggered_by_high_non_safety_score():
    # All non-safety questions at max, safety question at 0
    answers = {q["id"]: (0 if q["safety_flag"] else 3) for q in QUESTIONS}
    assert check_safety_concern(answers) is False


# ─── Symptom Checklist ────────────────────────────────────────────────────────

def test_checklist_reported_status():
    answers = {"q1": 2}
    checklist = build_symptom_checklist(answers, answered_ids={"q1"})
    q1_entry = next(e for e in checklist if e.question_id == "q1")
    assert q1_entry.status == "reported"
    assert q1_entry.response_value == 2

def test_checklist_not_reported_status():
    answers = {"q1": 0}
    checklist = build_symptom_checklist(answers, answered_ids={"q1"})
    q1_entry = next(e for e in checklist if e.question_id == "q1")
    assert q1_entry.status == "not_reported"

def test_checklist_not_answered_status():
    # q2 not in answers
    answers = {"q1": 1}
    checklist = build_symptom_checklist(answers, answered_ids={"q1"})
    q2_entry = next(e for e in checklist if e.question_id == "q2")
    assert q2_entry.status == "not_answered"
    assert q2_entry.response_value is None

def test_checklist_length():
    answers = full_answers(1)
    checklist = build_symptom_checklist(answers, answered_ids=set(answers.keys()))
    assert len(checklist) == len(QUESTIONS)


# ─── API Submission: Valid ─────────────────────────────────────────────────────

def test_valid_complete_submission():
    payload = {
        "answers": full_answers(1),
        "consented": True,
    }
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["total_score"] == len(QUESTIONS) * 1
    assert data["completion_status"] == "complete"
    assert "symptom_checklist" in data
    assert len(data["symptom_checklist"]) == len(QUESTIONS)
    assert "disclaimer" in data

def test_valid_all_zero_submission():
    payload = {"answers": full_answers(0), "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["total_score"] == 0
    assert data["safety_concern"] is False


# ─── API Submission: Invalid Values ───────────────────────────────────────────

def test_invalid_answer_value_rejected():
    answers = full_answers(1)
    answers["q1"] = 5  # 5 is not a valid option
    payload = {"answers": answers, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 422

def test_negative_answer_value_rejected():
    answers = full_answers(0)
    answers["q1"] = -1
    payload = {"answers": answers, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 422


# ─── API Submission: Missing Consent ──────────────────────────────────────────

def test_no_consent_rejected():
    payload = {"answers": full_answers(0), "consented": False}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 422


# ─── API Submission: Incomplete / Partial ─────────────────────────────────────

def test_partial_submission_accepted_as_partial():
    # Only answer q1; all others missing
    payload = {"answers": {"q1": 2}, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["completion_status"] == "partial"
    assert len(data["missing_questions"]) > 0

def test_empty_answers_is_partial():
    payload = {"answers": {}, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["completion_status"] == "partial"
    assert data["total_score"] == 0


# ─── API Submission: Safety Response ──────────────────────────────────────────

def test_safety_flagged_response_triggers_message():
    answers = full_answers(0)
    answers["q9"] = 2  # q9 is the self-harm question
    payload = {"answers": answers, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["safety_concern"] is True
    assert data["safety_message"] is not None
    assert len(data["safety_message"]) > 0

def test_no_safety_message_when_q9_zero():
    answers = full_answers(0)
    payload = {"answers": answers, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    data = r.json()
    assert data["safety_concern"] is False
    assert data["safety_message"] is None


# ─── Report Structure Consistency ─────────────────────────────────────────────

def test_report_structure_has_required_fields():
    payload = {"answers": full_answers(2), "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    data = r.json()
    required_fields = [
        "screening_name", "questionnaire_version", "completed_at",
        "completion_status", "total_score", "max_possible_score",
        "scoring_method", "symptom_checklist", "missing_questions",
        "safety_concern", "suggested_next_steps", "disclaimer",
    ]
    for field in required_fields:
        assert field in data, f"Missing field: {field}"

def test_score_not_inflated_by_unknown_client_keys():
    # Client sends an extra fake question ID — backend must ignore it
    answers = {"q1": 3, "q_injected": 3}
    payload = {"answers": answers, "consented": True}
    r = client.post("/api/mental-health/sessions", json=payload)
    data = r.json()
    # Score should only count q1
    assert data["total_score"] == 3
