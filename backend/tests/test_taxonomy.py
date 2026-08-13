"""Tests for Exam, Subject, and Topic management (Taxonomy)."""
import pytest
from httpx import AsyncClient
from app.models.exam import ExamStatus


@pytest.mark.asyncio
async def test_create_exam_admin_only(client: AsyncClient, admin_token, student_token):
    # Student should fail
    resp = await client.post(
        "/api/v1/exams/",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "name": "JKSSB VLW 2024",
            "year": 2024,
            "total_marks": 100.0,
            "status": "upcoming"
        }
    )
    assert resp.status_code == 403

    # Admin should succeed
    resp = await client.post(
        "/api/v1/exams/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "JKSSB VLW 2024",
            "year": 2024,
            "total_marks": 100.0,
            "status": "upcoming"
        }
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "JKSSB VLW 2024"


@pytest.mark.asyncio
async def test_list_exams_public(client: AsyncClient, db_session, test_admin):
    # Create an exam directly
    from app.models.exam import Exam
    exam = Exam(name="Public Exam", year=2023, total_marks=100.0, status=ExamStatus.active, created_by=test_admin.id)
    db_session.add(exam)
    await db_session.commit()

    # Public endpoint should not require auth
    resp = await client.get("/api/v1/exams/")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert any(e["name"] == "Public Exam" for e in data)


@pytest.mark.asyncio
async def test_create_subject_and_topic(client: AsyncClient, admin_token, db_session, test_admin):
    from app.models.exam import Exam
    exam = Exam(name="Subject Test", year=2024, total_marks=100.0, status=ExamStatus.upcoming, created_by=test_admin.id)
    db_session.add(exam)
    await db_session.commit()
    await db_session.refresh(exam)

    # Create Subject
    resp = await client.post(
        "/api/v1/subjects/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "General Science", "exam_id": exam.id, "order": 1}
    )
    assert resp.status_code == 201
    subject_id = resp.json()["id"]

    # Create Topic
    resp = await client.post(
        "/api/v1/topics/",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"name": "Physics", "subject_id": subject_id, "order": 1}
    )
    assert resp.status_code == 201
    assert resp.json()["name"] == "Physics"
