"""
Actual exam score submission router.
IMPORTANT: These endpoints handle ONLY actual JKSSB exam scores submitted by students.
This is completely separate from quiz scores/attempts.
"""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import get_current_active_user, require_admin
from ..models.score import ExamScoreSubmission, ScoreEditHistory, VerificationStatus
from ..models.exam import Exam
from ..models.category import Category
from ..models.user import User
from ..schemas.score import (ScoreSubmissionCreate, ScoreSubmissionUpdate,
                              ScoreSubmissionPublic, ScoreSubmissionMine,
                              ScoreSubmissionAdmin, AdminReview, ScoreEditHistoryPublic)
from ..core.exceptions import NotFoundException, BadRequestException, ConflictException, ForbiddenException

router = APIRouter(prefix="/exam-scores", tags=["exam-scores"])


@router.post("/", response_model=ScoreSubmissionMine, status_code=201)
async def submit_score(
    data: ScoreSubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit actual exam score. One submission per exam per user."""
    # Verify exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == data.exam_id))
    exam = exam_result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")

    # Validate marks
    if data.marks_obtained > exam.total_marks:
        raise BadRequestException(
            f"Marks obtained ({data.marks_obtained}) cannot exceed exam total marks ({exam.total_marks})"
        )

    # Verify category exists
    cat_result = await db.execute(select(Category).where(Category.id == data.category_id))
    if not cat_result.scalar_one_or_none():
        raise NotFoundException("Category not found")

    # Check one submission per exam per user
    existing_result = await db.execute(
        select(ExamScoreSubmission).where(
            ExamScoreSubmission.exam_id == data.exam_id,
            ExamScoreSubmission.user_id == current_user.id,
            ExamScoreSubmission.is_active == True,
        )
    )
    if existing_result.scalar_one_or_none():
        raise ConflictException("You have already submitted a score for this exam. Use the edit endpoint to update.")

    submission = ExamScoreSubmission(
        exam_id=data.exam_id,
        user_id=current_user.id,
        category_id=data.category_id,
        marks_obtained=data.marks_obtained,
        total_marks_of_exam=exam.total_marks,
        notes=data.notes,
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


@router.get("/my", response_model=List[ScoreSubmissionMine])
async def my_submissions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get current user's actual exam score submissions."""
    result = await db.execute(
        select(ExamScoreSubmission).where(
            ExamScoreSubmission.user_id == current_user.id,
            ExamScoreSubmission.is_active == True,
        ).order_by(ExamScoreSubmission.submitted_at.desc())
    )
    return result.scalars().all()


@router.put("/{submission_id}", response_model=ScoreSubmissionMine)
async def edit_submission(
    submission_id: int,
    data: ScoreSubmissionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Edit own submission. Only allowed if not yet verified."""
    result = await db.execute(
        select(ExamScoreSubmission).where(
            ExamScoreSubmission.id == submission_id,
            ExamScoreSubmission.is_active == True,
        )
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise NotFoundException("Submission not found")
    if submission.user_id != current_user.id:
        raise ForbiddenException("You can only edit your own submission")
    if submission.verification_status == VerificationStatus.verified:
        raise BadRequestException("Cannot edit a verified submission")

    # Log change to history
    history = ScoreEditHistory(
        submission_id=submission_id,
        changed_by=current_user.id,
        previous_marks=submission.marks_obtained,
        new_marks=data.marks_obtained,
        previous_category_id=submission.category_id,
        new_category_id=data.category_id,
        change_reason=data.change_reason,
        changed_at=datetime.now(timezone.utc),
    )
    db.add(history)

    if data.marks_obtained is not None:
        # Validate marks
        exam_result = await db.execute(select(Exam).where(Exam.id == submission.exam_id))
        exam = exam_result.scalar_one_or_none()
        if exam and data.marks_obtained > exam.total_marks:
            raise BadRequestException("Marks exceed exam total")
        submission.marks_obtained = data.marks_obtained

    if data.category_id is not None:
        submission.category_id = data.category_id
    if data.notes is not None:
        submission.notes = data.notes
    submission.verification_status = VerificationStatus.self_reported
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission


@router.get("/{submission_id}/history", response_model=List[ScoreEditHistoryPublic])
async def get_edit_history(
    submission_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(ExamScoreSubmission).where(ExamScoreSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise NotFoundException("Submission not found")
    if submission.user_id != current_user.id and current_user.role.value != "admin":
        raise ForbiddenException("Access denied")

    history_result = await db.execute(
        select(ScoreEditHistory)
        .where(ScoreEditHistory.submission_id == submission_id)
        .order_by(ScoreEditHistory.changed_at.desc())
    )
    return history_result.scalars().all()


# Admin endpoints
@router.get("/", response_model=List[ScoreSubmissionAdmin])
async def admin_list_submissions(
    exam_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    status: Optional[VerificationStatus] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = select(ExamScoreSubmission).where(ExamScoreSubmission.is_active == True)
    if exam_id:
        query = query.where(ExamScoreSubmission.exam_id == exam_id)
    if category_id:
        query = query.where(ExamScoreSubmission.category_id == category_id)
    if status:
        query = query.where(ExamScoreSubmission.verification_status == status)
    result = await db.execute(query.order_by(ExamScoreSubmission.submitted_at.desc()))
    return result.scalars().all()


@router.put("/{submission_id}/review", response_model=ScoreSubmissionAdmin)
async def review_submission(
    submission_id: int,
    data: AdminReview,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(
        select(ExamScoreSubmission).where(ExamScoreSubmission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise NotFoundException("Submission not found")

    submission.verification_status = data.verification_status
    submission.reviewed_by = current_user.id
    submission.reviewed_at = datetime.now(timezone.utc)
    if data.reviewer_notes:
        submission.notes = (submission.notes or "") + f"\n[Admin review]: {data.reviewer_notes}"
    db.add(submission)
    await db.commit()
    await db.refresh(submission)
    return submission
