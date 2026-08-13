from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from ..models.quiz import DifficultyLevel, QuizStatus, CorrectOption
from ..models.quiz_attempt import AttemptStatus


class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: CorrectOption
    marks: float = 1.0
    negative_marks: float = 0.0
    explanation: Optional[str] = None
    order: int = 0


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[CorrectOption] = None
    marks: Optional[float] = None
    negative_marks: Optional[float] = None
    explanation: Optional[str] = None
    order: Optional[int] = None


class QuestionPublic(BaseModel):
    """Question WITHOUT correct answer — for students during quiz."""
    id: int
    quiz_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    marks: float
    negative_marks: float
    order: int
    model_config = {"from_attributes": True}


class QuestionWithAnswer(QuestionPublic):
    """Question WITH correct answer — for results/admin."""
    correct_option: CorrectOption
    explanation: Optional[str] = None


class QuizCreate(BaseModel):
    title: str
    description: Optional[str] = None
    exam_id: Optional[int] = None
    subject_id: Optional[int] = None
    difficulty: DifficultyLevel = DifficultyLevel.medium
    duration_minutes: int = 60
    total_marks: float = 100.0
    has_negative_marking: bool = False
    negative_marks_per_wrong: float = 0.0
    pass_marks: Optional[float] = None
    show_explanations: bool = True


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    duration_minutes: Optional[int] = None
    total_marks: Optional[float] = None
    has_negative_marking: Optional[bool] = None
    negative_marks_per_wrong: Optional[float] = None
    status: Optional[QuizStatus] = None
    pass_marks: Optional[float] = None
    show_explanations: Optional[bool] = None


class QuizPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    exam_id: Optional[int] = None
    subject_id: Optional[int] = None
    difficulty: DifficultyLevel
    duration_minutes: int
    total_marks: float
    has_negative_marking: bool
    negative_marks_per_wrong: float
    status: QuizStatus
    pass_marks: Optional[float] = None
    show_explanations: bool
    question_count: int = 0
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class QuizDetail(QuizPublic):
    questions: List[QuestionPublic] = []  # No correct answers exposed here


class AnswerSubmit(BaseModel):
    question_id: int
    selected_option: Optional[CorrectOption] = None  # None means unattempted


class AttemptSubmit(BaseModel):
    answers: List[AnswerSubmit]


class QuizAttemptPublic(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    started_at: datetime
    submitted_at: Optional[datetime] = None
    total_questions: int
    attempted_count: int
    correct_count: int
    wrong_count: int
    raw_score: float
    final_score: float
    status: AttemptStatus
    time_taken_seconds: Optional[int] = None
    model_config = {"from_attributes": True}


class QuestionResult(BaseModel):
    question_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    selected_option: Optional[CorrectOption]
    correct_option: CorrectOption
    is_correct: bool
    marks_awarded: float
    explanation: Optional[str] = None


class QuizAttemptResult(BaseModel):
    """Full result shown after quiz submission."""
    attempt_id: int
    quiz_id: int
    quiz_title: str
    final_score: float
    total_marks: float
    percentage: float
    correct_count: int
    wrong_count: int
    unattempted_count: int
    time_taken_seconds: Optional[int]
    pass_marks: Optional[float]
    passed: Optional[bool]
    questions: List[QuestionResult] = []  # Only populated if show_explanations=True
