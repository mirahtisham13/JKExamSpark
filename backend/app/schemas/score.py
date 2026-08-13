from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from ..models.score import VerificationStatus


class ScoreSubmissionCreate(BaseModel):
    exam_id: int
    category_id: int
    marks_obtained: float
    notes: Optional[str] = None

    @field_validator("marks_obtained")
    @classmethod
    def marks_must_be_positive(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Marks obtained cannot be negative")
        return v


class ScoreSubmissionUpdate(BaseModel):
    category_id: Optional[int] = None
    marks_obtained: Optional[float] = None
    notes: Optional[str] = None
    change_reason: Optional[str] = None

    @field_validator("marks_obtained")
    @classmethod
    def marks_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v < 0:
            raise ValueError("Marks obtained cannot be negative")
        return v


class ScoreSubmissionPublic(BaseModel):
    """Public view — no sensitive personal info."""
    id: int
    exam_id: int
    category_id: int
    marks_obtained: float
    total_marks_of_exam: float
    verification_status: VerificationStatus
    submitted_at: datetime
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class ScoreSubmissionMine(ScoreSubmissionPublic):
    """Student's own submission — includes notes."""
    notes: Optional[str] = None


class ScoreSubmissionAdmin(BaseModel):
    """Admin view — includes user info."""
    id: int
    exam_id: int
    user_id: int
    category_id: int
    marks_obtained: float
    total_marks_of_exam: float
    verification_status: VerificationStatus
    notes: Optional[str] = None
    submitted_at: datetime
    updated_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class AdminReview(BaseModel):
    verification_status: VerificationStatus
    reviewer_notes: Optional[str] = None


class ScoreEditHistoryPublic(BaseModel):
    id: int
    previous_marks: Optional[float] = None
    new_marks: Optional[float] = None
    previous_category_id: Optional[int] = None
    new_category_id: Optional[int] = None
    change_reason: Optional[str] = None
    changed_at: datetime
    model_config = {"from_attributes": True}
