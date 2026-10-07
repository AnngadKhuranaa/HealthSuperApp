"""
Pydantic schemas for Mental Health Screening requests and responses.
"""
from pydantic import BaseModel, model_validator, field_validator
from typing import Literal
from datetime import datetime


class QuestionnaireSubmission(BaseModel):
    """
    Represents a submitted questionnaire.
    answers: dict mapping question_id -> integer response value (0-3).
    """
    answers: dict[str, int]
    consented: bool

    @field_validator("consented")
    @classmethod
    def must_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Consent must be given before submitting the questionnaire.")
        return v

    @model_validator(mode="after")
    def validate_answer_values(self) -> "QuestionnaireSubmission":
        from app.core.questionnaire import VALID_RESPONSE_VALUES
        invalid = {
            qid: val
            for qid, val in self.answers.items()
            if val not in VALID_RESPONSE_VALUES
        }
        if invalid:
            raise ValueError(
                f"Invalid response values for questions: {list(invalid.keys())}. "
                f"Accepted values are 0, 1, 2, 3."
            )
        return self


class SymptomStatus(BaseModel):
    question_id: str
    symptom_label: str
    response_value: int | None
    response_label: str
    status: Literal["reported", "not_reported", "not_answered", "not_assessed"]
    safety_flag: bool


class ScreeningReport(BaseModel):
    screening_name: str
    questionnaire_version: str
    completed_at: datetime
    completion_status: Literal["complete", "partial"]
    total_score: int | None
    max_possible_score: int
    score_interpretation_label: str | None
    score_interpretation_description: str | None
    scoring_method: str
    symptom_checklist: list[SymptomStatus]
    missing_questions: list[str]
    safety_concern: bool
    safety_message: str | None
    suggested_next_steps: list[str]
    disclaimer: str
