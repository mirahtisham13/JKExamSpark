from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import get_current_active_user
from ..models.quiz_attempt import QuizAttempt, AttemptStatus
from ..models.user import User
from ..schemas.quiz import QuizAttemptPublic, AttemptSubmit, QuizAttemptResult
from ..services.quiz import start_quiz_attempt, submit_quiz_attempt
from ..core.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/quiz-attempts", tags=["quiz-attempts"])


@router.post("/start", response_model=QuizAttemptPublic, status_code=201)
async def start_attempt(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    attempt = await start_quiz_attempt(db, quiz_id, current_user.id)
    return attempt


@router.get("/my", response_model=List[QuizAttemptPublic])
async def my_attempts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.started_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/{attempt_id}", response_model=QuizAttemptPublic)
async def get_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(QuizAttempt).where(QuizAttempt.id == attempt_id))
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise NotFoundException("Attempt not found")
    if attempt.user_id != current_user.id:
        raise ForbiddenException("Access denied")
    return attempt


@router.post("/{attempt_id}/submit", response_model=QuizAttemptResult)
async def submit_attempt(
    attempt_id: int,
    data: AttemptSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await submit_quiz_attempt(db, attempt_id, current_user.id, data)


@router.get("/{attempt_id}/result", response_model=QuizAttemptResult)
async def get_result(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get result of a submitted attempt."""
    from ..models.quiz import Quiz, QuizQuestion
    from ..models.quiz_attempt import QuizAnswer
    from ..schemas.quiz import QuestionResult

    result = await db.execute(select(QuizAttempt).where(QuizAttempt.id == attempt_id))
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise NotFoundException("Attempt not found")
    if attempt.user_id != current_user.id:
        raise ForbiddenException("Access denied")
    if attempt.status != AttemptStatus.submitted:
        raise ForbiddenException("Attempt not yet submitted")

    quiz_result = await db.execute(select(Quiz).where(Quiz.id == attempt.quiz_id))
    quiz = quiz_result.scalar_one_or_none()

    questions_result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == attempt.quiz_id)
    )
    questions = {q.id: q for q in questions_result.scalars().all()}

    answers_result = await db.execute(
        select(QuizAnswer).where(QuizAnswer.attempt_id == attempt_id)
    )
    answers = answers_result.scalars().all()

    question_results = []
    if quiz and quiz.show_explanations:
        for ans in answers:
            q = questions.get(ans.question_id)
            if q:
                question_results.append(QuestionResult(
                    question_id=q.id, question_text=q.question_text,
                    option_a=q.option_a, option_b=q.option_b,
                    option_c=q.option_c, option_d=q.option_d,
                    selected_option=ans.selected_option,
                    correct_option=q.correct_option,
                    is_correct=ans.is_correct,
                    marks_awarded=ans.marks_awarded,
                    explanation=q.explanation,
                ))

    percentage = (attempt.final_score / quiz.total_marks * 100) if quiz and quiz.total_marks else 0.0
    passed = None
    if quiz and quiz.pass_marks is not None:
        passed = attempt.final_score >= quiz.pass_marks

    return QuizAttemptResult(
        attempt_id=attempt_id, quiz_id=attempt.quiz_id,
        quiz_title=quiz.title if quiz else "Quiz",
        final_score=attempt.final_score, total_marks=quiz.total_marks if quiz else 0,
        percentage=round(percentage, 2),
        correct_count=attempt.correct_count, wrong_count=attempt.wrong_count,
        unattempted_count=attempt.total_questions - attempt.attempted_count,
        time_taken_seconds=attempt.time_taken_seconds,
        pass_marks=quiz.pass_marks if quiz else None, passed=passed,
        questions=question_results,
    )
