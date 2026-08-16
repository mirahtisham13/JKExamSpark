from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import require_admin, get_current_active_user
from ..models.quiz import Quiz, QuizQuestion, QuizStatus
from ..models.user import User
from ..schemas.quiz import (QuizCreate, QuizUpdate, QuizPublic, QuizDetail,
                             QuestionCreate, QuestionUpdate, QuestionPublic)
from ..core.exceptions import NotFoundException, BadRequestException

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/", response_model=List[QuizPublic])
async def list_quizzes(
    exam_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Quiz).where(Quiz.status == QuizStatus.published)
    if exam_id:
        query = query.where(Quiz.exam_id == exam_id)
    if subject_id:
        query = query.where(Quiz.subject_id == subject_id)
    result = await db.execute(query.order_by(Quiz.created_at.desc()))
    quizzes = result.scalars().all()

    # Count questions for each quiz
    output = []
    for quiz in quizzes:
        q_result = await db.execute(
            select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id)
        )
        q_count = len(q_result.scalars().all())
        pub = QuizPublic.model_validate(quiz)
        pub.question_count = q_count
        output.append(pub)
    return output


@router.get("/{quiz_id}", response_model=QuizDetail)
async def get_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id, Quiz.status == QuizStatus.published))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise NotFoundException("Quiz not found")

    q_result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.order)
    )
    questions = [QuestionPublic.model_validate(q) for q in q_result.scalars().all()]

    quiz_dict = quiz.__dict__.copy()
    quiz_dict["questions"] = questions
    quiz_dict["question_count"] = len(questions)
    
    return QuizDetail.model_validate(quiz_dict)


@router.post("/", response_model=QuizPublic, status_code=201)
async def create_quiz(
    data: QuizCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    quiz = Quiz(**data.model_dump(), created_by=current_user.id)
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    pub = QuizPublic.model_validate(quiz)
    pub.question_count = 0
    return pub


@router.put("/{quiz_id}", response_model=QuizPublic)
async def update_quiz(
    quiz_id: int,
    data: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise NotFoundException("Quiz not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(quiz, field, value)
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    pub = QuizPublic.model_validate(quiz)
    return pub


@router.post("/{quiz_id}/questions", response_model=QuestionPublic, status_code=201)
async def add_question(
    quiz_id: int,
    data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    if not result.scalar_one_or_none():
        raise NotFoundException("Quiz not found")

    question = QuizQuestion(quiz_id=quiz_id, **data.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.put("/{quiz_id}/questions/{question_id}", response_model=QuestionPublic)
async def update_question(
    quiz_id: int,
    question_id: int,
    data: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.id == question_id, QuizQuestion.quiz_id == quiz_id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise NotFoundException("Question not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/{quiz_id}/questions/{question_id}")
async def delete_question(
    quiz_id: int,
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.id == question_id, QuizQuestion.quiz_id == quiz_id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise NotFoundException("Question not found")
    await db.delete(question)
    await db.commit()
    return {"message": "Question deleted"}
