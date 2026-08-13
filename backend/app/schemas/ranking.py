from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class RankingEntry(BaseModel):
    """Public ranking entry — username is masked for privacy."""
    overall_rank: int
    category_rank: int
    masked_username: str
    marks_obtained: float
    total_marks: float
    percentile: float
    category_name: str
    verification_status: str


class UserRankingResult(BaseModel):
    """A student's own full ranking result."""
    exam_id: int
    exam_name: str
    marks_obtained: float
    total_marks_of_exam: float
    overall_rank: int
    category_rank: int
    percentile: float
    total_submissions: int
    category_total: int
    category_name: str
    verification_status: str


class RankingStats(BaseModel):
    exam_id: int
    total_submissions: int
    mean_score: float
    median_score: float
    highest_score: float
    lowest_score: float
    category_breakdown: dict
