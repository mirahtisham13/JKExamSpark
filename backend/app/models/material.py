import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class MaterialType(str, enum.Enum):
    pdf = "pdf"
    notes = "notes"
    previous_paper = "previous_paper"
    link = "link"


class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(String(2000), nullable=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    material_type = Column(Enum(MaterialType), nullable=False)
    file_path = Column(String(500), nullable=True)
    external_url = Column(String(1000), nullable=True)
    is_visible = Column(Boolean, default=True)
    download_count = Column(Integer, default=0)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    exam = relationship("Exam", back_populates="materials")
    subject = relationship("Subject", back_populates="materials")
    topic = relationship("Topic", back_populates="materials")
    uploader = relationship("User", foreign_keys=[uploaded_by])
