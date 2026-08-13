"""
Tests for rankings logic.
Rankings are calculated EXCLUSIVELY from actual exam score submissions.
"""
import pytest
from app.services.ranking import get_leaderboard, get_ranking_stats


@pytest.mark.asyncio
async def test_ranking_calculation_basic(client, admin_token, student_token, test_admin, test_student, db_session):
    # Setup test data (we would normally use fixtures/factories here)
    from app.models.exam import Exam, ExamStatus
    from app.models.category import Category
    from app.models.score import ExamScoreSubmission
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash

    # Create exam and category
    exam = Exam(name="Test Exam", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    cat = Category(name="OM", code="OM")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(exam)
    await db_session.refresh(cat)

    # Create another student
    user2 = User(email="s2@test.com", username="student2", hashed_password=get_password_hash("pass"), full_name="Student 2", role=UserRole.student)
    db_session.add(user2)
    await db_session.commit()
    await db_session.refresh(user2)

    # Submit scores
    sub1 = ExamScoreSubmission(exam_id=exam.id, user_id=test_student.id, category_id=cat.id, marks_obtained=80.0, total_marks_of_exam=100.0)
    sub2 = ExamScoreSubmission(exam_id=exam.id, user_id=user2.id, category_id=cat.id, marks_obtained=90.0, total_marks_of_exam=100.0)
    db_session.add_all([sub1, sub2])
    await db_session.commit()

    # Get leaderboard via API
    resp = await client.get(
        f"/api/v1/rankings/{exam.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    
    items = data["items"]
    assert items[0]["marks_obtained"] == 90.0
    assert items[0]["overall_rank"] == 1
    assert items[0]["percentile"] == 100.0
    assert items[0]["masked_username"] == "stu***2"

    assert items[1]["marks_obtained"] == 80.0
    assert items[1]["overall_rank"] == 2
    assert items[1]["percentile"] == 0.0
    assert items[1]["masked_username"] == "tes***t"

@pytest.mark.asyncio
async def test_leaderboard_masks_username(client, student_token, test_admin, test_student, db_session):
    """Ensure usernames are masked in public leaderboard."""
    from app.models.exam import Exam, ExamStatus
    from app.models.category import Category
    from app.models.score import ExamScoreSubmission
    
    exam = Exam(name="Privacy Test", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    cat = Category(name="OM", code="OM")
    db_session.add(cat)
    await db_session.commit()
    
    sub = ExamScoreSubmission(exam_id=exam.id, user_id=test_student.id, category_id=cat.id, marks_obtained=80.0, total_marks_of_exam=100.0)
    db_session.add(sub)
    await db_session.commit()
    
    resp = await client.get(
        f"/api/v1/rankings/{exam.id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 200
    assert resp.json()["items"][0]["masked_username"] == "tes***t"  # from 'teststudent'


@pytest.mark.asyncio
async def test_leaderboard_handles_ties(client, student_token, test_admin, test_student, db_session):
    """Ensure identical scores receive the exact same rank, followed by the skipped rank."""
    from app.models.exam import Exam, ExamStatus
    from app.models.category import Category
    from app.models.score import ExamScoreSubmission
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash
    
    exam = Exam(name="Ties Test", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    cat = Category(name="OM", code="OM")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(exam)
    await db_session.refresh(cat)
    
    user2 = User(email="t2@t.com", username="stu2", hashed_password=get_password_hash("pass"), full_name="S2", role=UserRole.student)
    user3 = User(email="t3@t.com", username="stu3", hashed_password=get_password_hash("pass"), full_name="S3", role=UserRole.student)
    db_session.add_all([user2, user3])
    await db_session.commit()
    await db_session.refresh(user2)
    await db_session.refresh(user3)
    
    # 2 users score 90, 1 scores 80
    sub1 = ExamScoreSubmission(exam_id=exam.id, user_id=test_student.id, category_id=cat.id, marks_obtained=90.0, total_marks_of_exam=100.0)
    sub2 = ExamScoreSubmission(exam_id=exam.id, user_id=user2.id, category_id=cat.id, marks_obtained=90.0, total_marks_of_exam=100.0)
    sub3 = ExamScoreSubmission(exam_id=exam.id, user_id=user3.id, category_id=cat.id, marks_obtained=80.0, total_marks_of_exam=100.0)
    db_session.add_all([sub1, sub2, sub3])
    await db_session.commit()
    
    resp = await client.get(f"/api/v1/rankings/{exam.id}", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) == 3
    
    # Ranks should be 1, 1, 3
    assert items[0]["marks_obtained"] == 90.0
    assert items[0]["overall_rank"] == 1
    assert items[1]["marks_obtained"] == 90.0
    assert items[1]["overall_rank"] == 1
    assert items[2]["marks_obtained"] == 80.0
    assert items[2]["overall_rank"] == 3


@pytest.mark.asyncio
async def test_leaderboard_empty_dataset(client, student_token, test_admin, db_session):
    """Ensure empty dataset returns properly without divide-by-zero errors."""
    from app.models.exam import Exam, ExamStatus
    
    exam = Exam(name="Empty Test", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    await db_session.commit()
    
    resp = await client.get(f"/api/v1/rankings/{exam.id}", headers={"Authorization": f"Bearer {student_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []
