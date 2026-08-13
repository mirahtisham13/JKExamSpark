# Import all models so Alembic can detect them during migrations
from .user import User, UserRole
from .refresh_token import RefreshToken
from .category import Category
from .exam import Exam, ExamStatus
from .exam_category import ExamCategory
from .subject import Subject
from .topic import Topic
from .material import StudyMaterial, MaterialType
from .quiz import Quiz, QuizQuestion, DifficultyLevel, QuizStatus, CorrectOption
from .quiz_attempt import QuizAttempt, QuizAnswer, AttemptStatus
from .score import ExamScoreSubmission, ScoreEditHistory, VerificationStatus
from .cutoff import CutoffEstimate, OfficialCutoff
from .announcement import Announcement, AnnouncementType

__all__ = [
    "User", "UserRole",
    "RefreshToken",
    "Category",
    "Exam", "ExamStatus",
    "ExamCategory",
    "Subject",
    "Topic",
    "StudyMaterial", "MaterialType",
    "Quiz", "QuizQuestion", "DifficultyLevel", "QuizStatus", "CorrectOption",
    "QuizAttempt", "QuizAnswer", "AttemptStatus",
    "ExamScoreSubmission", "ScoreEditHistory", "VerificationStatus",
    "CutoffEstimate", "OfficialCutoff",
    "Announcement", "AnnouncementType",
]
