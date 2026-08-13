import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float, Enum, Text, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class VerificationStatus(str, enum.Enum):
    self_reported = "self_reported"
    under_review = "under_review"
    verified = "verified"
    rejected = "rejected"


class ExamScoreSubmission(Base):
    __tablename__ = "exam_score_submissions"
    __table_args__ = (
        UniqueConstraint("exam_id", "user_id", name="uq_exam_user_submission"),
        Index("ix_exam_score_marks_desc", "exam_id", "marks_obtained", postgresql_using="btree"),
    )

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    total_marks_of_exam = Column(Float, nullable=False)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.self_reported)
    supporting_document_path = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    exam = relationship("Exam", back_populates="score_submissions")
    user = relationship("User", foreign_keys=[user_id], back_populates="score_submissions")
    category = relationship("Category", back_populates="score_submissions")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    edit_history = relationship("ScoreEditHistory", back_populates="submission",
                                cascade="all, delete-orphan")


class ScoreEditHistory(Base):
    __tablename__ = "score_edit_history"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("exam_score_submissions.id", ondelete="CASCADE"),
                           nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    previous_marks = Column(Float, nullable=True)
    new_marks = Column(Float, nullable=True)
    previous_category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    new_category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    change_reason = Column(Text, nullable=True)
    changed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    submission = relationship("ExamScoreSubmission", back_populates="edit_history")
    changer = relationship("User", foreign_keys=[changed_by])
