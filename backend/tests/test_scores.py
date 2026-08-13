"""
Tests for actual exam score submissions.
These are completely separate from quiz scores.
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.exam import Exam, ExamStatus
from app.models.category import Category



import pytest_asyncio


async def create_exam_and_category(db: AsyncSession):
    exam = Exam(
        name="JKSSB Finance Accounts 2024",
        year=2024,
        total_marks=120.0,
        status=ExamStatus.completed,
        created_by=1,
    )
    db.add(exam)
    await db.flush()

    cat = Category(name="General", code="GEN", description="General Category")
    db.add(cat)
    await db.commit()
    await db.refresh(exam)
    await db.refresh(cat)
    return exam, cat


@pytest.mark.asyncio
async def test_submit_actual_exam_score(client, student_token, test_student, db_session):
    exam, cat = await create_exam_and_category(db_session)
    response = await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "exam_id": exam.id,
            "category_id": cat.id,
            "marks_obtained": 85.5,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["marks_obtained"] == 85.5
    assert data["verification_status"] == "self_reported"
    assert data["total_marks_of_exam"] == 120.0


@pytest.mark.asyncio
async def test_cannot_submit_twice_same_exam(client, student_token, test_student, db_session):
    exam, cat = await create_exam_and_category(db_session)
    # First submission
    await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"exam_id": exam.id, "category_id": cat.id, "marks_obtained": 80.0},
    )
    # Second submission for same exam
    response = await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"exam_id": exam.id, "category_id": cat.id, "marks_obtained": 90.0},
    )
    assert response.status_code == 409  # Conflict


@pytest.mark.asyncio
async def test_marks_cannot_exceed_total(client, student_token, db_session):
    exam, cat = await create_exam_and_category(db_session)
    response = await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"exam_id": exam.id, "category_id": cat.id, "marks_obtained": 999.0},  # > 120
    )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_edit_submission_creates_audit(client, student_token, test_student, db_session):
    exam, cat = await create_exam_and_category(db_session)
    create_resp = await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"exam_id": exam.id, "category_id": cat.id, "marks_obtained": 75.0},
    )
    sub_id = create_resp.json()["id"]

    edit_resp = await client.put(
        f"/api/v1/exam-scores/{sub_id}",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"marks_obtained": 80.0, "change_reason": "Corrected calculation"},
    )
    assert edit_resp.status_code == 200
    assert edit_resp.json()["marks_obtained"] == 80.0

    # Check audit trail
    history_resp = await client.get(
        f"/api/v1/exam-scores/{sub_id}/history",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert len(history) >= 1
    assert history[0]["previous_marks"] == 75.0
    assert history[0]["new_marks"] == 80.0


@pytest.mark.asyncio
async def test_admin_can_verify_submission(client, student_token, admin_token, test_student, db_session):
    exam, cat = await create_exam_and_category(db_session)
    create_resp = await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"exam_id": exam.id, "category_id": cat.id, "marks_obtained": 88.0},
    )
    sub_id = create_resp.json()["id"]

    review_resp = await client.put(
        f"/api/v1/exam-scores/{sub_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"verification_status": "verified"},
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["verification_status"] == "verified"


@pytest.mark.asyncio
async def test_cannot_edit_verified_submission(client, student_token, admin_token, test_student, db_session):
    exam, cat = await create_exam_and_category(db_session)
    create_resp = await client.post(
        "/api/v1/exam-scores/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"exam_id": exam.id, "category_id": cat.id, "marks_obtained": 90.0},
    )
    sub_id = create_resp.json()["id"]

    # Admin verifies
    await client.put(
        f"/api/v1/exam-scores/{sub_id}/review",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"verification_status": "verified"},
    )

    # Student tries to edit
    edit_resp = await client.put(
        f"/api/v1/exam-scores/{sub_id}",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"marks_obtained": 95.0},
    )
    assert edit_resp.status_code == 400  # Cannot edit verified
