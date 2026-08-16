from typing import List, Optional
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import require_admin, get_current_active_user
from ..models.material import StudyMaterial, MaterialType
from ..models.user import User
from ..schemas.material import MaterialCreate, MaterialUpdate, MaterialPublic
from ..core.exceptions import NotFoundException, BadRequestException
from ..services.storage import get_storage_service
from ..config import settings
import uuid

router = APIRouter(prefix="/materials", tags=["materials"])

ALLOWED_CONTENT_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}


@router.get("/", response_model=List[MaterialPublic])
async def list_materials(
    exam_id: Optional[int] = Query(None),
    subject_id: Optional[int] = Query(None),
    topic_id: Optional[int] = Query(None),
    material_type: Optional[MaterialType] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(StudyMaterial).where(
        StudyMaterial.deleted_at.is_(None),
        StudyMaterial.is_visible == True,
    )
    if exam_id:
        query = query.where(StudyMaterial.exam_id == exam_id)
    if subject_id:
        query = query.where(StudyMaterial.subject_id == subject_id)
    if topic_id:
        query = query.where(StudyMaterial.topic_id == topic_id)
    if material_type:
        query = query.where(StudyMaterial.material_type == material_type)
    if search:
        query = query.where(StudyMaterial.title.ilike(f"%{search}%"))
    result = await db.execute(query.order_by(StudyMaterial.created_at.desc()))
    return result.scalars().all()


@router.get("/{material_id}", response_model=MaterialPublic)
async def get_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudyMaterial).where(
            StudyMaterial.id == material_id,
            StudyMaterial.deleted_at.is_(None),
        )
    )
    material = result.scalar_one_or_none()
    if not material:
        raise NotFoundException("Material not found")
    return material


@router.get("/{material_id}/download")
async def download_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudyMaterial).where(
            StudyMaterial.id == material_id,
            StudyMaterial.deleted_at.is_(None),
            StudyMaterial.is_visible == True,
        )
    )
    material = result.scalar_one_or_none()
    if not material:
        raise NotFoundException("Material not found")

    # Increment download count
    material.download_count += 1
    db.add(material)
    await db.commit()

    if material.external_url:
        return {"url": material.external_url, "type": "external"}
    if material.file_path:
        try:
            storage = get_storage_service()
            signed_url = storage.get_signed_url(material.file_path)
            return {"url": signed_url, "type": "file"}
        except Exception:
            raise BadRequestException("File not accessible")
    raise BadRequestException("No file or URL available for this material")


@router.post("/", response_model=MaterialPublic, status_code=201)
async def upload_material(
    title: str = Form(...),
    exam_id: int = Form(...),
    material_type: MaterialType = Form(...),
    description: Optional[str] = Form(None),
    subject_id: Optional[int] = Form(None),
    topic_id: Optional[int] = Form(None),
    external_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    file_path = None
    if file and file.filename:
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise BadRequestException(f"File type not allowed: {file.content_type}")
        contents = await file.read()
        max_bytes = settings.max_file_size_mb * 1024 * 1024
        if len(contents) > max_bytes:
            raise BadRequestException(f"File size exceeds {settings.max_file_size_mb}MB limit")
        ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
        path = f"exam-{exam_id}/{uuid.uuid4()}.{ext}"
        try:
            storage = get_storage_service()
            storage.upload_file(path, contents, file.content_type)
            file_path = path
        except Exception as e:
            raise BadRequestException(f"File upload failed: {str(e)}")

    material = StudyMaterial(
        title=title,
        description=description,
        exam_id=exam_id,
        subject_id=subject_id,
        topic_id=topic_id,
        material_type=material_type,
        file_path=file_path,
        external_url=external_url,
        uploaded_by=current_user.id,
    )
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material


@router.put("/{material_id}", response_model=MaterialPublic)
async def update_material(
    material_id: int,
    data: MaterialUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(StudyMaterial).where(StudyMaterial.id == material_id))
    material = result.scalar_one_or_none()
    if not material:
        raise NotFoundException("Material not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(material, field, value)
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material


@router.delete("/{material_id}")
async def delete_material(
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    from datetime import datetime, timezone
    result = await db.execute(select(StudyMaterial).where(StudyMaterial.id == material_id))
    material = result.scalar_one_or_none()
    if not material:
        raise NotFoundException("Material not found")
    material.deleted_at = datetime.now(timezone.utc)
    db.add(material)
    await db.commit()
    return {"message": "Material deleted"}
