from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import require_admin, optional_current_user
from ..models.category import Category
from ..models.exam import Exam, ExamStatus
from ..models.exam_category import ExamCategory
from ..models.user import User
from ..schemas.exam import (ExamCreate, ExamUpdate, ExamPublic, ExamDetail,
                             ExamCategoryCreate, ExamCategoryPublic,
                             CategoryPublic)
from ..core.exceptions import NotFoundException, ConflictException
from datetime import datetime, timezone

router = APIRouter(prefix="/exams", tags=["exams"])


@router.get("/", response_model=List[ExamPublic])
async def list_exams(
    status: Optional[ExamStatus] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(optional_current_user),
):
    """List exams. Public endpoint."""
    query = select(Exam)
    if status:
        query = query.where(Exam.status == status)
    query = query.order_by(Exam.year.desc(), Exam.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{exam_id}", response_model=ExamDetail)
async def get_exam(exam_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")

    # Load categories
    ec_result = await db.execute(
        select(ExamCategory, Category)
        .join(Category, ExamCategory.category_id == Category.id)
        .where(ExamCategory.exam_id == exam_id)
    )
    categories = []
    for ec, cat in ec_result.all():
        categories.append(ExamCategoryPublic(
            id=ec.id, exam_id=ec.exam_id, category_id=ec.category_id,
            category=CategoryPublic.model_validate(cat),
            vacancies=ec.vacancies, official_cutoff=ec.official_cutoff,
            official_cutoff_published_at=ec.official_cutoff_published_at,
        ))

    return ExamDetail(
        id=exam.id, name=exam.name, year=exam.year,
        notification_number=exam.notification_number, exam_date=exam.exam_date,
        total_marks=exam.total_marks, total_vacancies=exam.total_vacancies,
        status=exam.status, official_difficulty=exam.official_difficulty,
        total_candidates_estimate=exam.total_candidates_estimate,
        created_at=exam.created_at, exam_categories=categories, subjects=[],
    )


@router.post("/", response_model=ExamPublic, status_code=201)
async def create_exam(
    data: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    exam = Exam(**data.model_dump(), created_by=current_user.id)
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return exam


@router.put("/{exam_id}", response_model=ExamPublic)
async def update_exam(
    exam_id: int,
    data: ExamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exam, field, value)
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return exam


@router.delete("/{exam_id}")
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")
    exam.status = ExamStatus.archived
    db.add(exam)
    await db.commit()
    return {"message": "Exam archived"}


@router.post("/{exam_id}/categories", response_model=ExamCategoryPublic)
async def set_exam_category(
    exam_id: int,
    data: ExamCategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    # Verify exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    if not exam_result.scalar_one_or_none():
        raise NotFoundException("Exam not found")

    # Check if already exists
    result = await db.execute(
        select(ExamCategory).where(
            ExamCategory.exam_id == exam_id,
            ExamCategory.category_id == data.category_id,
        )
    )
    ec = result.scalar_one_or_none()
    if ec:
        ec.vacancies = data.vacancies
    else:
        ec = ExamCategory(exam_id=exam_id, **data.model_dump())
        db.add(ec)
    await db.commit()
    await db.refresh(ec)

    cat_result = await db.execute(select(Category).where(Category.id == ec.category_id))
    cat = cat_result.scalar_one_or_none()
    return ExamCategoryPublic(
        id=ec.id, exam_id=ec.exam_id, category_id=ec.category_id,
        category=CategoryPublic.model_validate(cat) if cat else None,
        vacancies=ec.vacancies, official_cutoff=ec.official_cutoff,
        official_cutoff_published_at=ec.official_cutoff_published_at,
    )
