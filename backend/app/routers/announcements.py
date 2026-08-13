from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import require_admin, optional_current_user
from ..models.announcement import Announcement
from ..models.user import User
from ..schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementPublic
from ..core.exceptions import NotFoundException

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("/", response_model=List[AnnouncementPublic])
async def list_announcements(
    exam_id: Optional[int] = Query(None),
    pinned_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(optional_current_user),
):
    query = select(Announcement).where(
        Announcement.deleted_at.is_(None),
        Announcement.target_audience.in_(["all", "students"]),
    )
    if exam_id:
        query = query.where(Announcement.exam_id == exam_id)
    if pinned_only:
        query = query.where(Announcement.is_pinned == True)
    result = await db.execute(
        query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{announcement_id}", response_model=AnnouncementPublic)
async def get_announcement(announcement_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement).where(
            Announcement.id == announcement_id,
            Announcement.deleted_at.is_(None),
        )
    )
    a = result.scalar_one_or_none()
    if not a:
        raise NotFoundException("Announcement not found")
    return a


@router.post("/", response_model=AnnouncementPublic, status_code=201)
async def create_announcement(
    data: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    a = Announcement(**data.model_dump(), created_by=current_user.id)
    if not a.published_at:
        a.published_at = datetime.now(timezone.utc)
    db.add(a)
    await db.commit()
    await db.refresh(a)
    return a


@router.put("/{announcement_id}", response_model=AnnouncementPublic)
async def update_announcement(
    announcement_id: int,
    data: AnnouncementUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    a = result.scalar_one_or_none()
    if not a:
        raise NotFoundException("Announcement not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(a, field, value)
    db.add(a)
    await db.commit()
    await db.refresh(a)
    return a


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    a = result.scalar_one_or_none()
    if not a:
        raise NotFoundException("Announcement not found")
    a.deleted_at = datetime.now(timezone.utc)
    db.add(a)
    await db.commit()
    return {"message": "Announcement deleted"}
