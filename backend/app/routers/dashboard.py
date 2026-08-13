from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import Optional

from ..database import get_db
from ..dependencies import get_current_active_user
from ..models.user import User, UserRole
from ..models.quiz import Quiz
from ..models.quiz_attempt import QuizAttempt
from ..models.score import ExamScoreSubmission
from ..models.exam import Exam, ExamStatus
from ..models.announcement import Announcement
from ..models.cutoff import CutoffEstimate
from ..schemas.dashboard import (
    StudentDashboardResponse,
    StudentDashboardStats,
    RecentQuizAttempt,
    RecentScoreSubmission,
    BestRankingHighlight,
    ActiveExamItem,
    AnnouncementItem
)
from ..services.ranking import get_user_ranking

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/student", response_model=StudentDashboardResponse)
async def get_student_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get aggregated data for the student dashboard."""
    
    # 1. Quizzes Taken
    quizzes_count = await db.scalar(select(db.func.count()).select_from(QuizAttempt).where(QuizAttempt.user_id == current_user.id))
    
    # 2. Exams Submitted
    subs_count = await db.scalar(select(db.func.count()).select_from(ExamScoreSubmission).where(ExamScoreSubmission.user_id == current_user.id, ExamScoreSubmission.is_active == True))
    
    # 3. Materials Downloaded (mock for now as we don't track downloads specifically yet)
    materials_downloaded = 0
    
    # 4. Recent Quizzes
    recent_quizzes_result = await db.execute(
        select(QuizAttempt)
        .options(selectinload(QuizAttempt.quiz))
        .where(QuizAttempt.user_id == current_user.id, QuizAttempt.is_completed == True)
        .order_by(desc(QuizAttempt.completed_at))
        .limit(3)
    )
    recent_quizzes = [
        RecentQuizAttempt(
            id=qa.id,
            quiz_title=qa.quiz.title,
            final_score=qa.final_score,
            total_marks=qa.quiz.total_marks,
            percentage=round((qa.final_score / qa.quiz.total_marks) * 100, 1) if qa.quiz.total_marks else 0,
            submitted_at=qa.completed_at
        ) for qa in recent_quizzes_result.scalars().all()
    ]
    
    # 5. Recent Submissions
    recent_subs_result = await db.execute(
        select(ExamScoreSubmission)
        .options(selectinload(ExamScoreSubmission.exam), selectinload(ExamScoreSubmission.category))
        .where(ExamScoreSubmission.user_id == current_user.id, ExamScoreSubmission.is_active == True)
        .order_by(desc(ExamScoreSubmission.submitted_at))
        .limit(3)
    )
    recent_subs = [
        RecentScoreSubmission(
            id=sub.id,
            exam_name=sub.exam.name,
            marks_obtained=sub.marks_obtained,
            category_name=sub.category.name,
            verification_status=sub.verification_status.value,
            submitted_at=sub.submitted_at
        ) for sub in recent_subs_result.scalars().all()
    ]
    
    # 6. Best Ranking Highlight
    # Find the submission with the highest percentile
    best_ranking: Optional[BestRankingHighlight] = None
    best_rank_text = "N/A"
    
    # Get all active submissions for user
    all_subs_result = await db.execute(
        select(ExamScoreSubmission)
        .where(ExamScoreSubmission.user_id == current_user.id, ExamScoreSubmission.is_active == True)
    )
    all_subs = all_subs_result.scalars().all()
    
    if all_subs:
        best_percentile = -1.0
        best_exam_id = None
        best_cat_id = None
        best_overall = None
        best_cat_rank = None
        best_exam_name = None
        
        for sub in all_subs:
            ur = await get_user_ranking(db, sub.exam_id, current_user.id)
            if ur and ur.percentile > best_percentile:
                best_percentile = ur.percentile
                best_exam_id = sub.exam_id
                best_cat_id = sub.category_id
                best_overall = ur.overall_rank
                best_cat_rank = ur.category_rank
                best_exam_name = ur.exam_name
                
        if best_exam_id:
            best_rank_text = f"#{best_overall}"
            
            # Fetch estimated cutoff for this exam/category
            cutoff_res = await db.execute(
                select(CutoffEstimate).where(
                    CutoffEstimate.exam_id == best_exam_id,
                    CutoffEstimate.category_id == best_cat_id
                )
            )
            cutoff = cutoff_res.scalar_one_or_none()
            
            best_ranking = BestRankingHighlight(
                exam_id=best_exam_id,
                exam_name=best_exam_name,
                overall_rank=best_overall,
                category_rank=best_cat_rank,
                percentile=best_percentile,
                estimated_cutoff_min=cutoff.estimated_min if cutoff else None,
                estimated_cutoff_max=cutoff.estimated_max if cutoff else None,
                estimated_confidence=cutoff.confidence_level if cutoff else None
            )

    # 7. Active Exams
    active_exams_result = await db.execute(
        select(Exam).where(Exam.status == ExamStatus.active).order_by(desc(Exam.created_at)).limit(5)
    )
    active_exams = [
        ActiveExamItem(
            id=e.id, name=e.name, year=e.year, total_marks=e.total_marks
        ) for e in active_exams_result.scalars().all()
    ]
    
    # 8. Announcements
    announcements_result = await db.execute(
        select(Announcement).order_by(desc(Announcement.published_at)).limit(3)
    )
    announcements = [
        AnnouncementItem(
            id=a.id, title=a.title, content=a.content, 
            announcement_type=a.type.value, published_at=a.published_at
        ) for a in announcements_result.scalars().all()
    ]

    stats = StudentDashboardStats(
        quizzes_taken=quizzes_count or 0,
        materials_downloaded=materials_downloaded,
        exams_submitted=subs_count or 0,
        best_rank_text=best_rank_text
    )

    return StudentDashboardResponse(
        stats=stats,
        recent_quizzes=recent_quizzes,
        recent_submissions=recent_subs,
        best_ranking=best_ranking,
        active_exams=active_exams,
        announcements=announcements
    )
