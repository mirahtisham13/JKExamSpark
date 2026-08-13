"""Tests for Study Material management."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_upload_material_unauthorized(client: AsyncClient, student_token):
    resp = await client.post(
        "/api/v1/materials/",
        headers={"Authorization": f"Bearer {student_token}"},
        data={
            "title": "Should Fail",
            "exam_id": 1,
            "material_type": "pdf"
        }
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_upload_material_external_url(client: AsyncClient, admin_token, db_session, test_admin):
    from app.models.exam import Exam, ExamStatus
    exam = Exam(name="Material Exam", year=2024, total_marks=100.0, status=ExamStatus.upcoming, created_by=test_admin.id)
    db_session.add(exam)
    await db_session.commit()
    await db_session.refresh(exam)

    resp = await client.post(
        "/api/v1/materials/",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={
            "title": "Important PDF Link",
            "exam_id": exam.id,
            "material_type": "pdf",
            "external_url": "https://example.com/test.pdf"
        }
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Important PDF Link"
    assert data["external_url"] == "https://example.com/test.pdf"


@pytest.mark.asyncio
async def test_upload_material_invalid_file_type(client: AsyncClient, admin_token, db_session, test_admin):
    from app.models.exam import Exam, ExamStatus
    exam = Exam(name="Material Exam 2", year=2024, total_marks=100.0, status=ExamStatus.upcoming, created_by=test_admin.id)
    db_session.add(exam)
    await db_session.commit()
    await db_session.refresh(exam)

    # Fake a bad file upload (.txt which is not in ALLOWED_CONTENT_TYPES)
    files = {"file": ("test.txt", b"Hello", "text/plain")}
    resp = await client.post(
        "/api/v1/materials/",
        headers={"Authorization": f"Bearer {admin_token}"},
        data={
            "title": "Bad File",
            "exam_id": exam.id,
            "material_type": "pdf"
        },
        files=files
    )
    assert resp.status_code == 400
    assert "File type not allowed" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_list_materials_and_visibility(client: AsyncClient, admin_token, student_token, db_session, test_admin):
    from app.models.exam import Exam, ExamStatus
    from app.models.material import StudyMaterial, MaterialType
    
    exam = Exam(name="Material Visibility Exam", year=2024, total_marks=100.0, status=ExamStatus.upcoming, created_by=test_admin.id)
    db_session.add(exam)
    await db_session.commit()
    await db_session.refresh(exam)

    # Visible material
    mat_visible = StudyMaterial(
        title="Visible Mat", exam_id=exam.id, material_type=MaterialType.pdf,
        external_url="http://v.com", is_visible=True, uploaded_by=test_admin.id
    )
    # Hidden material
    mat_hidden = StudyMaterial(
        title="Hidden Mat", exam_id=exam.id, material_type=MaterialType.pdf,
        external_url="http://h.com", is_visible=False, uploaded_by=test_admin.id
    )
    db_session.add_all([mat_visible, mat_hidden])
    await db_session.commit()

    # Student lists materials (should only see visible)
    resp = await client.get(
        "/api/v1/materials/",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    titles = [m["title"] for m in data]
    assert "Visible Mat" in titles
    assert "Hidden Mat" not in titles
