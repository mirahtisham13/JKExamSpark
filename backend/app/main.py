from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .config import settings
from .database import engine, Base
from .routers import (
    auth_router, users_router, exams_router, categories_router,
    subjects_router, topics_router, materials_router, quizzes_router,
    quiz_attempts_router, exam_scores_router, rankings_router,
    cutoffs_router, announcements_router, admin_router, dashboard_router,
)


limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from .database import AsyncSessionLocal
    from .services.auth import seed_admin_if_needed
    async with AsyncSessionLocal() as db:
        await seed_admin_if_needed(db)
    yield
    # Shutdown (cleanup if needed)


@app.get("/health")
def health_check():
    return {"status": "ok", "db_url": settings.database_url}

@app.get("/")
def root():
    return {"message": "Welcome to JKExamSpark API"}


app = FastAPI(
    title="JKExamSpark API",
    description=(
        "Backend API for JKExamSpark — JKSSB Exam Preparation Platform. "
        "Quiz scores and actual exam scores are completely separate systems."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers with API prefix
API_PREFIX = "/api/v1"

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(users_router, prefix=API_PREFIX)
app.include_router(exams_router, prefix=API_PREFIX)
app.include_router(categories_router, prefix=API_PREFIX)
app.include_router(subjects_router, prefix=API_PREFIX)
app.include_router(topics_router, prefix=API_PREFIX)
app.include_router(materials_router, prefix=API_PREFIX)
app.include_router(quizzes_router, prefix=API_PREFIX)
app.include_router(quiz_attempts_router, prefix=API_PREFIX)
app.include_router(exam_scores_router, prefix=API_PREFIX)
app.include_router(rankings_router, prefix=API_PREFIX)
app.include_router(cutoffs_router, prefix=API_PREFIX)
app.include_router(announcements_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(dashboard_router, prefix=API_PREFIX)


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "1.0.0",
    }
