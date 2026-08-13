"""
Quiz scoring service.
IMPORTANT: This service deals ONLY with quiz scores — not actual exam scores.
Quiz scores and actual exam scores are completely separate systems.
"""
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.quiz import Quiz, QuizQuestion
from ..models.quiz_attempt import QuizAttempt, QuizAnswer, AttemptStatus
from ..core.exceptions import NotFoundException, BadRequestException, ForbiddenException
from ..schemas.quiz import AttemptSubmit, QuizAttemptResult, QuestionResult


def calculate_quiz_score(
    answers: list,
    questions: list,
    has_negative: bool,
    negative_per_wrong: float,
) -> dict:
    """
    Calculate quiz score from submitted answers.
    ONLY for quiz-based scoring — never used for actual exam scores.

    Returns:
        dict with raw_score, final_score, correct_count, wrong_count, unattempted_count
    """
    correct_count = 0
    wrong_count = 0
    unattempted_count = 0
    raw_score = 0.0

    question_map = {q.id: q for q in questions}

    for answer in answers:
        question = question_map.get(answer.get("question_id") if isinstance(answer, dict) else answer.question_id)
        if not question:
            continue

        selected = answer.get("selected_option") if isinstance(answer, dict) else answer.selected_option

        if selected is None:
            unattempted_count += 1
            # No penalty for unattempted
        elif selected == question.correct_option.value if hasattr(question.correct_option, 'value') else selected == question.correct_option:
            correct_count += 1
            raw_score += question.marks
        else:
            wrong_count += 1
            if has_negative:
                raw_score -= negative_per_wrong

    # Final score cannot go below 0
    final_score = max(0.0, raw_score)

    return {
        "raw_score": raw_score,
        "final_score": final_score,
        "correct_count": correct_count,
        "wrong_count": wrong_count,
        "unattempted_count": unattempted_count,
    }


async def start_quiz_attempt(db: AsyncSession, quiz_id: int, user_id: int) -> QuizAttempt:
    """Start a new quiz attempt. User must not have an active attempt for this quiz."""
    # Check quiz exists and is published
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise NotFoundException("Quiz not found")
    if quiz.status.value != "published":
        raise BadRequestException("This quiz is not currently available")

    # Check for existing in-progress attempt
    result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.quiz_id == quiz_id,
            QuizAttempt.user_id == user_id,
            QuizAttempt.status == AttemptStatus.in_progress,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing  # Return existing attempt

    # Count questions
    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == quiz_id)
    )
    questions = result.scalars().all()

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=user_id,
        total_questions=len(questions),
        status=AttemptStatus.in_progress,
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt


async def submit_quiz_attempt(
    db: AsyncSession, attempt_id: int, user_id: int, data: AttemptSubmit
) -> QuizAttemptResult:
    """Submit answers for a quiz attempt and calculate score."""
    # Fetch attempt
    result = await db.execute(
        select(QuizAttempt).where(QuizAttempt.id == attempt_id)
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise NotFoundException("Quiz attempt not found")
    if attempt.user_id != user_id:
        raise ForbiddenException("You can only submit your own quiz attempt")
    if attempt.status == AttemptStatus.submitted:
        raise BadRequestException("This quiz attempt has already been submitted")

    # Fetch quiz and questions
    result = await db.execute(select(Quiz).where(Quiz.id == attempt.quiz_id))
    quiz = result.scalar_one_or_none()

    result = await db.execute(
        select(QuizQuestion).where(QuizQuestion.quiz_id == attempt.quiz_id)
    )
    questions = result.scalars().all()
    question_map = {q.id: q for q in questions}

    # Calculate scores
    correct_count = 0
    wrong_count = 0
    unattempted_count = 0
    raw_score = 0.0
    question_results = []

    for answer_data in data.answers:
        question = question_map.get(answer_data.question_id)
        if not question:
            continue

        selected = answer_data.selected_option
        is_correct = False
        marks_awarded = 0.0

        if selected is None:
            unattempted_count += 1
        elif str(selected) == str(question.correct_option):
            is_correct = True
            correct_count += 1
            marks_awarded = question.marks
            raw_score += question.marks
        else:
            wrong_count += 1
            if quiz.has_negative_marking:
                marks_awarded = -quiz.negative_marks_per_wrong
                raw_score -= quiz.negative_marks_per_wrong

        # Save answer record
        answer_record = QuizAnswer(
            attempt_id=attempt_id,
            question_id=answer_data.question_id,
            selected_option=selected,
            is_correct=is_correct,
            marks_awarded=marks_awarded,
        )
        db.add(answer_record)

        if quiz.show_explanations:
            question_results.append(QuestionResult(
                question_id=question.id,
                question_text=question.question_text,
                option_a=question.option_a,
                option_b=question.option_b,
                option_c=question.option_c,
                option_d=question.option_d,
                selected_option=selected,
                correct_option=question.correct_option,
                is_correct=is_correct,
                marks_awarded=marks_awarded,
                explanation=question.explanation,
            ))

    final_score = max(0.0, raw_score)
    now = datetime.now(timezone.utc)
    time_taken = int((now - attempt.started_at.replace(tzinfo=timezone.utc)).total_seconds())

    # Update attempt
    attempt.submitted_at = now
    attempt.attempted_count = correct_count + wrong_count
    attempt.correct_count = correct_count
    attempt.wrong_count = wrong_count
    attempt.raw_score = raw_score
    attempt.final_score = final_score
    attempt.status = AttemptStatus.submitted
    attempt.time_taken_seconds = time_taken
    db.add(attempt)
    await db.commit()

    percentage = (final_score / quiz.total_marks * 100) if quiz.total_marks > 0 else 0.0
    passed = None
    if quiz.pass_marks is not None:
        passed = final_score >= quiz.pass_marks

    return QuizAttemptResult(
        attempt_id=attempt_id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        final_score=final_score,
        total_marks=quiz.total_marks,
        percentage=round(percentage, 2),
        correct_count=correct_count,
        wrong_count=wrong_count,
        unattempted_count=unattempted_count,
        time_taken_seconds=time_taken,
        pass_marks=quiz.pass_marks,
        passed=passed,
        questions=question_results,
    )
