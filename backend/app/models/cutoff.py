from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class CutoffEstimate(Base):
    __tablename__ = "cutoff_estimates"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    estimated_min = Column(Float, nullable=False)
    estimated_max = Column(Float, nullable=False)
    sample_size = Column(Integer, nullable=False)
    confidence_level = Column(String(10), nullable=False)  # LOW, MEDIUM, HIGH
    algorithm_version = Column(String(10), default="1.0")
    calculated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    parameters_used = Column(JSON, nullable=True)

    exam = relationship("Exam")
    category = relationship("Category")


class OfficialCutoff(Base):
    __tablename__ = "official_cutoffs"
    __table_args__ = (
        UniqueConstraint("exam_id", "category_id", name="uq_official_cutoff"),
    )

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    cutoff_marks = Column(Float, nullable=False)
    published_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    published_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    source_url = Column(String(1000), nullable=True)
    notes = Column(String(2000), nullable=True)

    exam = relationship("Exam")
    category = relationship("Category")
    publisher = relationship("User", foreign_keys=[published_by])
