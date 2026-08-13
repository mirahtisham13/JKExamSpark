from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..database import Base

class ExamCategory(Base):
    __tablename__ = "exam_categories"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    vacancies = Column(Integer, nullable=True)
    official_cutoff = Column(Float, nullable=True)
    official_cutoff_published_at = Column(DateTime(timezone=True), nullable=True)
    official_cutoff_published_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    __table_args__ = (UniqueConstraint("exam_id", "category_id", name="_exam_category_uc"),)

    exam = relationship("Exam", back_populates="exam_categories")
