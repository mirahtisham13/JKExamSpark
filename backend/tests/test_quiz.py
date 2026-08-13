"""
Tests for quiz scoring logic.
Quiz scores are completely separate from actual exam scores.
"""
import pytest
from app.services.quiz import calculate_quiz_score


def make_question(q_id, correct, marks=1.0, neg=0.0):
    class Q:
        id = q_id
        correct_option = correct
    q = Q()
    q.marks = marks
    q.negative_marks = neg
    return q


def make_answer(q_id, selected):
    return {"question_id": q_id, "selected_option": selected}


def test_quiz_scoring_all_correct():
    questions = [make_question(i, "A", marks=2.0) for i in range(1, 6)]
    answers = [make_answer(i, "A") for i in range(1, 6)]
    result = calculate_quiz_score(answers, questions, has_negative=False, negative_per_wrong=0.0)
    assert result["correct_count"] == 5
    assert result["wrong_count"] == 0
    assert result["final_score"] == 10.0


def test_quiz_scoring_with_negative_marking():
    questions = [
        make_question(1, "A", marks=1.0, neg=0.25),
        make_question(2, "B", marks=1.0, neg=0.25),
        make_question(3, "C", marks=1.0, neg=0.25),
    ]
    answers = [
        make_answer(1, "A"),   # correct +1
        make_answer(2, "A"),   # wrong -0.25
        make_answer(3, None),  # unattempted 0
    ]
    result = calculate_quiz_score(answers, questions, has_negative=True, negative_per_wrong=0.25)
    assert result["correct_count"] == 1
    assert result["wrong_count"] == 1
    assert result["unattempted_count"] == 1
    assert result["raw_score"] == pytest.approx(0.75, abs=0.01)
    assert result["final_score"] == pytest.approx(0.75, abs=0.01)


def test_quiz_scoring_unattempted_no_penalty():
    questions = [make_question(i, "A", marks=1.0, neg=0.5) for i in range(1, 4)]
    answers = [make_answer(i, None) for i in range(1, 4)]  # All unattempted
    result = calculate_quiz_score(answers, questions, has_negative=True, negative_per_wrong=0.5)
    assert result["correct_count"] == 0
    assert result["wrong_count"] == 0
    assert result["unattempted_count"] == 3
    assert result["raw_score"] == 0.0
    assert result["final_score"] == 0.0


def test_quiz_score_never_below_zero():
    """Final score must never go below 0 even with heavy negative marking."""
    questions = [make_question(i, "A", marks=1.0, neg=5.0) for i in range(1, 4)]
    answers = [make_answer(i, "B") for i in range(1, 4)]  # All wrong
    result = calculate_quiz_score(answers, questions, has_negative=True, negative_per_wrong=5.0)
    assert result["final_score"] == 0.0
    assert result["raw_score"] == -15.0  # raw can be negative
    assert result["final_score"] >= 0.0  # but final cannot


@pytest.mark.asyncio
async def test_start_attempt(client, student_token, test_admin, admin_token, db_session):
    """Test starting a quiz attempt."""
    from app.models.quiz import Quiz, QuizStatus, DifficultyLevel

    # Admin creates a quiz
    quiz = Quiz(
        title="Test Quiz",
        difficulty=DifficultyLevel.medium,
        duration_minutes=30,
        total_marks=10.0,
        status=QuizStatus.published,
        created_by=test_admin.id,
    )
    db_session.add(quiz)
    await db_session.commit()
    await db_session.refresh(quiz)

    response = await client.post(
        f"/api/v1/quiz-attempts/start?quiz_id={quiz.id}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["quiz_id"] == quiz.id
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_correct_answers_not_exposed_before_submission(client, student_token, test_admin, db_session):
    """Correct answers must not be in the quiz detail response."""
    from app.models.quiz import Quiz, QuizQuestion, QuizStatus, DifficultyLevel, CorrectOption

    quiz = Quiz(
        title="Secret Quiz",
        difficulty=DifficultyLevel.easy,
        duration_minutes=30,
        total_marks=5.0,
        status=QuizStatus.published,
        created_by=test_admin.id,
    )
    db_session.add(quiz)
    await db_session.flush()

    q = QuizQuestion(
        quiz_id=quiz.id,
        question_text="What is 2+2?",
        option_a="3", option_b="4", option_c="5", option_d="6",
        correct_option=CorrectOption.B,
        marks=1.0,
    )
    db_session.add(q)
    await db_session.commit()

    response = await client.get(
        f"/api/v1/quizzes/{quiz.id}",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    for question in data.get("questions", []):
        assert "correct_option" not in question, "Correct answer must NOT be exposed to students"
