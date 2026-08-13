from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class ExamStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    archived = "archived"

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    year = Column(Integer, nullable=False)
    notification_number = Column(String, nullable=True)
    exam_date = Column(DateTime(timezone=True), nullable=True)
    total_marks = Column(Float, nullable=False)
    total_vacancies = Column(Integer, nullable=True)
    status = Column(SQLEnum(ExamStatus), default=ExamStatus.upcoming, nullable=False)
    official_difficulty = Column(String, nullable=True)
    total_candidates_estimate = Column(Integer, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    exam_categories = relationship("ExamCategory", back_populates="exam", cascade="all, delete-orphan")
    subjects = relationship("Subject", back_populates="exam", cascade="all, delete-orphan")
    score_submissions = relationship("ExamScoreSubmission", back_populates="exam")
    quizzes = relationship("Quiz", back_populates="exam")
    materials = relationship("StudyMaterial", back_populates="exam")
