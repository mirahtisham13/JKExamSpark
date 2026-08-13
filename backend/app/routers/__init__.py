from .auth import router as auth_router
from .users import router as users_router
from .exams import router as exams_router
from .categories import router as categories_router
from .subjects_topics import subjects_router, topics_router
from .materials import router as materials_router
from .quizzes import router as quizzes_router
from .quiz_attempts import router as quiz_attempts_router
from .exam_scores import router as exam_scores_router
from .rankings import router as rankings_router
from .cutoffs import router as cutoffs_router
from .announcements import router as announcements_router
from .admin import router as admin_router
from .dashboard import router as dashboard_router

__all__ = [
    "auth_router",
    "users_router",
    "exams_router",
    "categories_router",
    "subjects_router",
    "topics_router",
    "materials_router",
    "quizzes_router",
    "quiz_attempts_router",
    "exam_scores_router",
    "rankings_router",
    "cutoffs_router",
    "announcements_router",
    "admin_router",
    "dashboard_router",
]
