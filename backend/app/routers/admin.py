"""Admin-only router for user management and analytics dashboard."""
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..database import get_db
from ..dependencies import require_admin
from ..models.user import User, UserRole
from ..models.exam import Exam
from ..models.score import ExamScoreSubmission, VerificationStatus
from ..models.quiz_attempt import QuizAttempt
from ..models.material import StudyMaterial
from ..schemas.user import UserPublic, AdminUserUpdate
from ..schemas.common import PaginatedResponse
from ..core.exceptions import NotFoundException

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=PaginatedResponse)
async def list_users(
    search: Optional[str] = Query(None),
    role: Optional[UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = select(User).where(User.deleted_at.is_(None))
    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) | (User.username.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(
        query.order_by(User.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    users = result.scalars().all()
    return PaginatedResponse.create(
        items=[UserPublic.model_validate(u) for u in users],
        total=total, page=page, size=size,
    )


@router.put("/users/{user_id}", response_model=UserPublic)
async def update_user(
    user_id: int,
    data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundException("User not found")
    if user.id == current_user.id:
        from ..core.exceptions import BadRequestException
        raise BadRequestException("Cannot delete your own account")
    user.deleted_at = datetime.now(timezone.utc)
    user.is_active = False
    db.add(user)
    await db.commit()
    return {"message": "User deleted"}


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin analytics dashboard."""
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    # Total students
    total_students_result = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.student, User.deleted_at.is_(None))
    )
    total_students = total_students_result.scalar_one()

    # Active students (logged in last 30 days)
    active_students_result = await db.execute(
        select(func.count(User.id)).where(
            User.role == UserRole.student,
            User.last_login >= thirty_days_ago,
            User.deleted_at.is_(None),
        )
    )
    active_students = active_students_result.scalar_one()

    # Total exams
    total_exams_result = await db.execute(select(func.count(Exam.id)))
    total_exams = total_exams_result.scalar_one()

    # Total score submissions
    total_submissions_result = await db.execute(
        select(func.count(ExamScoreSubmission.id)).where(ExamScoreSubmission.is_active == True)
    )
    total_submissions = total_submissions_result.scalar_one()

    # Pending submissions
    pending_result = await db.execute(
        select(func.count(ExamScoreSubmission.id)).where(
            ExamScoreSubmission.verification_status == VerificationStatus.self_reported
        )
    )
    pending_submissions = pending_result.scalar_one()

    # Quiz attempts
    total_quiz_attempts_result = await db.execute(select(func.count(QuizAttempt.id)))
    total_quiz_attempts = total_quiz_attempts_result.scalar_one()

    # Total materials
    total_materials_result = await db.execute(
        select(func.count(StudyMaterial.id)).where(StudyMaterial.deleted_at.is_(None))
    )
    total_materials = total_materials_result.scalar_one()

    return {
        "total_students": total_students,
        "active_students_30d": active_students,
        "total_exams": total_exams,
        "total_score_submissions": total_submissions,
        "pending_review_submissions": pending_submissions,
        "total_quiz_attempts": total_quiz_attempts,
        "total_materials": total_materials,
    }
