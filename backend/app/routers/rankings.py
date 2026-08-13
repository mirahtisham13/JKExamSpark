from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..dependencies import get_current_active_user
from ..models.user import User
from ..schemas.ranking import RankingEntry, UserRankingResult, RankingStats
from ..schemas.common import PaginatedResponse
from ..services.ranking import get_leaderboard, get_user_ranking, get_ranking_stats

router = APIRouter(prefix="/rankings", tags=["rankings"])


@router.get("/{exam_id}", response_model=PaginatedResponse)
async def leaderboard(
    exam_id: int,
    category_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Leaderboard based exclusively on actual exam scores.
    Usernames are masked for privacy.
    Quiz scores are NEVER included here.
    """
    return await get_leaderboard(db, exam_id, category_id=category_id, page=page, size=size)


@router.get("/{exam_id}/my-rank", response_model=Optional[UserRankingResult])
async def my_rank(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get the current user's ranking for an exam."""
    return await get_user_ranking(db, exam_id, current_user.id)


@router.get("/{exam_id}/stats", response_model=RankingStats)
async def ranking_stats(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await get_ranking_stats(db, exam_id)
