import enum
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from ..database import Base


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class QuizStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class CorrectOption(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="SET NULL"), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.medium)
    duration_minutes = Column(Integer, nullable=False, default=60)
    total_marks = Column(Float, nullable=False, default=100.0)
    has_negative_marking = Column(Boolean, default=False)
    negative_marks_per_wrong = Column(Float, default=0.0)
    status = Column(Enum(QuizStatus), default=QuizStatus.draft)
    pass_marks = Column(Float, nullable=True)
    show_explanations = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    questions = relationship("QuizQuestion", back_populates="quiz", order_by="QuizQuestion.order",
                             cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")
    creator = relationship("User", foreign_keys=[created_by])
    exam = relationship("Exam", back_populates="quizzes")
    subject = relationship("Subject", back_populates="quizzes")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(Enum(CorrectOption), nullable=False)
    marks = Column(Float, default=1.0)
    negative_marks = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("QuizAnswer", back_populates="question")
