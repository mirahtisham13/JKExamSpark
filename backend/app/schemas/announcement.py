from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.announcement import AnnouncementType


class AnnouncementCreate(BaseModel):
    title: str
    content: str
    type: AnnouncementType = AnnouncementType.general
    is_pinned: bool = False
    target_audience: str = "all"
    exam_id: Optional[int] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[AnnouncementType] = None
    is_pinned: Optional[bool] = None
    target_audience: Optional[str] = None
    exam_id: Optional[int] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class AnnouncementPublic(BaseModel):
    id: int
    title: str
    content: str
    type: AnnouncementType
    is_pinned: bool
    target_audience: str
    exam_id: Optional[int] = None
    published_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


