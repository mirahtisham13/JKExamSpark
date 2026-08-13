from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class StudentDashboardStats(BaseModel):
    quizzes_taken: int
    materials_downloaded: int
    exams_submitted: int
    best_rank_text: str


class RecentQuizAttempt(BaseModel):
    id: int
    quiz_title: str
    final_score: float
    total_marks: float
    percentage: float
    submitted_at: datetime


class RecentScoreSubmission(BaseModel):
    id: int
    exam_name: str
    marks_obtained: float
    category_name: str
    verification_status: str
    submitted_at: datetime


class BestRankingHighlight(BaseModel):
    exam_id: int
    exam_name: str
    overall_rank: int
    category_rank: int
    percentile: float
    estimated_cutoff_min: Optional[float] = None
    estimated_cutoff_max: Optional[float] = None
    estimated_confidence: Optional[str] = None


class ActiveExamItem(BaseModel):
    id: int
    name: str
    year: int
    total_marks: float


class AnnouncementItem(BaseModel):
    id: int
    title: str
    content: str
    announcement_type: str
    published_at: datetime


class StudentDashboardResponse(BaseModel):
    stats: StudentDashboardStats
    recent_quizzes: List[RecentQuizAttempt]
    recent_submissions: List[RecentScoreSubmission]
    best_ranking: Optional[BestRankingHighlight] = None
    active_exams: List[ActiveExamItem]
    announcements: List[AnnouncementItem]
