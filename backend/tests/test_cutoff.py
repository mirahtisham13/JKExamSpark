"""
Tests for cutoff estimation.
Cutoffs are estimated ONLY from actual exam scores.
"""
import pytest
from app.services.cutoff import estimate_cutoff_for_exam, MIN_SAMPLES_REQUIRED


@pytest.mark.asyncio
async def test_insufficient_data_returns_none(db_session, test_admin, test_student):
    from app.models.exam import Exam, ExamStatus
    from app.models.category import Category
    from app.models.exam_category import ExamCategory
    from app.models.score import ExamScoreSubmission
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash

    # Setup
    exam = Exam(name="Cutoff Exam", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    cat = Category(name="OM", code="OM")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(exam)
    await db_session.refresh(cat)

    ec = ExamCategory(exam_id=exam.id, category_id=cat.id, vacancies=5)
    db_session.add(ec)
    await db_session.commit()

    # Create fewer than MIN_SAMPLES_REQUIRED submissions
    for i in range(MIN_SAMPLES_REQUIRED - 1):
        u = User(email=f"u{i}@test.com", username=f"user{i}", hashed_password=get_password_hash("pass"), full_name=f"User {i}", role=UserRole.student)
        db_session.add(u)
        await db_session.commit()
        await db_session.refresh(u)
        
        sub = ExamScoreSubmission(exam_id=exam.id, user_id=u.id, category_id=cat.id, marks_obtained=80.0, total_marks_of_exam=100.0)
        db_session.add(sub)
    await db_session.commit()

    estimates, insufficient = await estimate_cutoff_for_exam(db_session, exam.id)
    assert len(estimates) == 0
    assert "OM" in insufficient

@pytest.mark.asyncio
async def test_low_confidence_with_small_sample(db_session, test_admin, test_student):
    from app.models.exam import Exam, ExamStatus
    from app.models.category import Category
    from app.models.exam_category import ExamCategory
    from app.models.score import ExamScoreSubmission
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash

    exam = Exam(name="Cutoff Exam 2", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    cat = Category(name="RBA", code="RBA")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(exam)
    await db_session.refresh(cat)

    ec = ExamCategory(exam_id=exam.id, category_id=cat.id, vacancies=5)
    db_session.add(ec)
    await db_session.commit()

    # Create exactly MIN_SAMPLES_REQUIRED (10) submissions which is < 30 (LOW confidence)
    for i in range(MIN_SAMPLES_REQUIRED):
        u = User(email=f"u2_{i}@test.com", username=f"user2_{i}", hashed_password=get_password_hash("pass"), full_name=f"User {i}", role=UserRole.student)
        db_session.add(u)
        await db_session.commit()
        await db_session.refresh(u)
        
        # marks 90 to 81
        marks = 90.0 - i
        sub = ExamScoreSubmission(exam_id=exam.id, user_id=u.id, category_id=cat.id, marks_obtained=marks, total_marks_of_exam=100.0)
        db_session.add(sub)
    await db_session.commit()

    estimates, insufficient = await estimate_cutoff_for_exam(db_session, exam.id)
    assert len(estimates) == 1
    est = estimates[0]
    assert est.confidence_level == "LOW"
    # Vacancies = 5. Top 5 marks: 90, 89, 88, 87, 86. Preliminary cutoff is 86.
    # LOW confidence padding is 5.
    assert est.estimated_min == 81.0
    assert est.estimated_max == 91.0


@pytest.mark.asyncio
async def test_high_confidence_with_large_sample_and_official(db_session, test_admin, test_student, client, admin_token):
    from app.models.exam import Exam, ExamStatus
    from app.models.category import Category
    from app.models.exam_category import ExamCategory
    from app.models.score import ExamScoreSubmission
    from app.models.user import User, UserRole
    from app.models.cutoff import OfficialCutoff
    from app.core.security import get_password_hash
    import random

    exam = Exam(name="Cutoff Exam 3", year=2024, total_marks=100.0, status=ExamStatus.completed, created_by=test_admin.id)
    db_session.add(exam)
    cat = Category(name="SC", code="SC")
    db_session.add(cat)
    await db_session.commit()
    await db_session.refresh(exam)
    await db_session.refresh(cat)

    ec = ExamCategory(exam_id=exam.id, category_id=cat.id, vacancies=20)
    db_session.add(ec)
    await db_session.commit()

    # Generate 150 submissions (HIGH confidence) using a synthetic normal-like distribution
    # Mean around 65, stddev around 10
    users = []
    subs = []
    
    # We fix seed for deterministic testing
    random.seed(42)
    for i in range(150):
        u = User(email=f"u3_{i}@test.com", username=f"user3_{i}", hashed_password=get_password_hash("pass"), full_name=f"User {i}", role=UserRole.student)
        users.append(u)
    db_session.add_all(users)
    await db_session.commit()
    
    for u in users:
        marks = min(100.0, max(0.0, random.gauss(65.0, 10.0)))
        sub = ExamScoreSubmission(exam_id=exam.id, user_id=u.id, category_id=cat.id, marks_obtained=round(marks, 2), total_marks_of_exam=100.0)
        subs.append(sub)
    db_session.add_all(subs)
    await db_session.commit()

    # Create an Official Cutoff too
    oc = OfficialCutoff(exam_id=exam.id, category_id=cat.id, cutoff_marks=72.5, published_by=test_admin.id)
    db_session.add(oc)
    await db_session.commit()

    # Fetch using API
    resp = await client.get(f"/api/v1/cutoffs/{exam.id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    data = resp.json()
    
    # Verify Official Cutoff
    assert len(data["official_cutoffs"]) == 1
    assert data["official_cutoffs"][0]["cutoff_marks"] == 72.5
    
    # Verify Estimated Cutoff
    assert len(data["estimated_cutoffs"]) == 1
    est = data["estimated_cutoffs"][0]
    
    assert est["confidence_level"] == "HIGH"
    assert est["sample_size"] == 150
    # For HIGH confidence, padding is 2.0
    assert est["estimated_max"] - est["estimated_min"] == 4.0
