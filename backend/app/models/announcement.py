import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class AnnouncementType(str, enum.Enum):
    general = "general"
    exam_update = "exam_update"
    result = "result"
    important = "important"


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(Enum(AnnouncementType), default=AnnouncementType.general)
    is_pinned = Column(Boolean, default=False)
    target_audience = Column(String(20), default="all")  # all, students, admin
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    exam = relationship("Exam")
    creator = relationship("User", foreign_keys=[created_by])
