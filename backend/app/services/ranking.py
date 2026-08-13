"""
Ranking service.
IMPORTANT: Rankings are calculated EXCLUSIVELY from actual exam score submissions.
Quiz scores are NEVER used in ranking calculations.
"""
import statistics
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from ..models.score import ExamScoreSubmission, VerificationStatus
from ..models.user import User
from ..models.category import Category
from ..models.exam import Exam
from ..schemas.ranking import RankingEntry, UserRankingResult, RankingStats
from ..schemas.common import PaginatedResponse
from ..core.exceptions import NotFoundException


def _mask_username(username: str) -> str:
    """Mask username for privacy: 'rahul123' -> 'rah***3'"""
    if len(username) <= 3:
        return username[0] + "***"
    return username[:3] + "***" + username[-1]


async def get_leaderboard(
    db: AsyncSession,
    exam_id: int,
    category_id: Optional[int] = None,
    page: int = 1,
    size: int = 50,
) -> PaginatedResponse[RankingEntry]:
    """
    Get paginated leaderboard based on actual exam score submissions only.
    Uses efficient SQL window functions for ranking.
    """
    # Verify exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    if not exam_result.scalar_one_or_none():
        raise NotFoundException("Exam not found")

    overall_rank_col = func.rank().over(order_by=desc(ExamScoreSubmission.marks_obtained)).label("overall_rank")
    category_rank_col = func.rank().over(
        partition_by=ExamScoreSubmission.category_id, 
        order_by=desc(ExamScoreSubmission.marks_obtained)
    ).label("category_rank")
    percentile_col = func.percent_rank().over(order_by=desc(ExamScoreSubmission.marks_obtained)).label("percent_rank")
    
    cte = select(
        ExamScoreSubmission.id.label("id"),
        overall_rank_col,
        category_rank_col,
        percentile_col
    ).where(
        ExamScoreSubmission.exam_id == exam_id,
        ExamScoreSubmission.is_active == True
    ).cte("ranked_subs")
    
    # Query original table joined with CTE
    query = select(ExamScoreSubmission, cte.c.overall_rank, cte.c.category_rank, cte.c.percent_rank).join(
        cte, ExamScoreSubmission.id == cte.c.id
    ).options(
        selectinload(ExamScoreSubmission.user),
        selectinload(ExamScoreSubmission.category)
    )
    
    # Count query
    count_query = select(func.count()).select_from(ExamScoreSubmission).where(
        ExamScoreSubmission.exam_id == exam_id, ExamScoreSubmission.is_active == True
    )

    if category_id:
        query = query.where(ExamScoreSubmission.category_id == category_id)
        query = query.order_by(cte.c.category_rank, ExamScoreSubmission.submitted_at)
        count_query = count_query.where(ExamScoreSubmission.category_id == category_id)
    else:
        query = query.order_by(cte.c.overall_rank, ExamScoreSubmission.submitted_at)
        
    total = await db.scalar(count_query)
    
    offset = (page - 1) * size
    result = await db.execute(query.offset(offset).limit(size))
    rows = result.all()

    entries = []
    for sub, overall_rank, category_rank, percent_rank in rows:
        percentile = round((1.0 - float(percent_rank)) * 100, 2) if percent_rank is not None else 0.0
        
        entries.append(RankingEntry(
            overall_rank=overall_rank,
            category_rank=category_rank,
            masked_username=_mask_username(sub.user.username if sub.user else "unknown"),
            marks_obtained=sub.marks_obtained,
            total_marks=sub.total_marks_of_exam,
            percentile=percentile,
            category_name=sub.category.name if sub.category else "Unknown",
            verification_status=sub.verification_status.value,
        ))

    return PaginatedResponse.create(items=entries, total=total or 0, page=page, size=size)


async def get_user_ranking(
    db: AsyncSession, exam_id: int, user_id: int
) -> Optional[UserRankingResult]:
    """Get a specific user's ranking for an exam using SQL window functions."""
    
    overall_rank_col = func.rank().over(order_by=desc(ExamScoreSubmission.marks_obtained)).label("overall_rank")
    category_rank_col = func.rank().over(
        partition_by=ExamScoreSubmission.category_id, 
        order_by=desc(ExamScoreSubmission.marks_obtained)
    ).label("category_rank")
    percentile_col = func.percent_rank().over(order_by=desc(ExamScoreSubmission.marks_obtained)).label("percent_rank")
    
    cte = select(
        ExamScoreSubmission.id.label("id"),
        overall_rank_col,
        category_rank_col,
        percentile_col
    ).where(
        ExamScoreSubmission.exam_id == exam_id,
        ExamScoreSubmission.is_active == True
    ).cte("ranked_subs")
    
    query = select(ExamScoreSubmission, cte.c.overall_rank, cte.c.category_rank, cte.c.percent_rank).join(
        cte, ExamScoreSubmission.id == cte.c.id
    ).options(
        selectinload(ExamScoreSubmission.exam),
        selectinload(ExamScoreSubmission.category)
    ).where(ExamScoreSubmission.user_id == user_id)
    
    result = await db.execute(query)
    row = result.first()
    if not row:
        return None
        
    sub, overall_rank, category_rank, percent_rank = row
    
    total = await db.scalar(
        select(func.count()).select_from(ExamScoreSubmission).where(
            ExamScoreSubmission.exam_id == exam_id, 
            ExamScoreSubmission.is_active == True
        )
    )
    
    cat_total = await db.scalar(
        select(func.count()).select_from(ExamScoreSubmission).where(
            ExamScoreSubmission.exam_id == exam_id, 
            ExamScoreSubmission.category_id == sub.category_id, 
            ExamScoreSubmission.is_active == True
        )
    )
    
    percentile = round((1.0 - float(percent_rank)) * 100, 2) if percent_rank is not None else 0.0
    
    return UserRankingResult(
        exam_id=exam_id,
        exam_name=sub.exam.name if sub.exam else "Unknown",
        marks_obtained=sub.marks_obtained,
        total_marks_of_exam=sub.total_marks_of_exam,
        overall_rank=overall_rank,
        category_rank=category_rank,
        percentile=percentile,
        total_submissions=total or 0,
        category_total=cat_total or 0,
        category_name=sub.category.name if sub.category else "Unknown",
        verification_status=sub.verification_status.value,
    )


async def get_ranking_stats(db: AsyncSession, exam_id: int) -> RankingStats:
    """Get statistical summary of submitted scores for an exam."""
    result = await db.execute(
        select(ExamScoreSubmission).where(
            ExamScoreSubmission.exam_id == exam_id,
            ExamScoreSubmission.is_active == True,
        )
    )
    subs = result.scalars().all()
    if not subs:
        return RankingStats(
            exam_id=exam_id, total_submissions=0, mean_score=0, median_score=0,
            highest_score=0, lowest_score=0, category_breakdown={}
        )

    scores = [s.marks_obtained for s in subs]
    cat_breakdown: dict[int, int] = {}
    for s in subs:
        cat_breakdown[s.category_id] = cat_breakdown.get(s.category_id, 0) + 1

    return RankingStats(
        exam_id=exam_id,
        total_submissions=len(scores),
        mean_score=round(statistics.mean(scores), 2),
        median_score=round(statistics.median(scores), 2),
        highest_score=max(scores),
        lowest_score=min(scores),
        category_breakdown=cat_breakdown,
    )
