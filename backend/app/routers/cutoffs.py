from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import get_current_active_user, require_admin
from ..models.cutoff import OfficialCutoff
from ..models.user import User
from ..schemas.cutoff import CutoffResponse, OfficialCutoffCreate, OfficialCutoffPublic
from ..services.cutoff import get_cutoffs_for_exam
from ..core.exceptions import NotFoundException
from datetime import datetime, timezone

router = APIRouter(prefix="/cutoffs", tags=["cutoffs"])


@router.get("/{exam_id}", response_model=CutoffResponse)
async def get_exam_cutoffs(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get cutoffs for an exam — both official (admin-published) and estimated (from student submissions).
    Estimated cutoffs are clearly labeled and include a disclaimer.
    """
    return await get_cutoffs_for_exam(db, exam_id)


@router.post("/{exam_id}/official", response_model=OfficialCutoffPublic)
async def publish_official_cutoff(
    exam_id: int,
    data: OfficialCutoffCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Publish official cutoff for a category. Admin only."""
    from ..models.exam import Exam
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")

    from ..models.category import Category
    cat_result = await db.execute(select(Category).where(Category.id == data.category_id))
    category = cat_result.scalar_one_or_none()
    if not category:
        raise NotFoundException("Category not found")

    # Upsert
    existing_result = await db.execute(
        select(OfficialCutoff).where(
            OfficialCutoff.exam_id == exam_id,
            OfficialCutoff.category_id == data.category_id,
        )
    )
    oc = existing_result.scalar_one_or_none()
    if oc:
        oc.cutoff_marks = data.cutoff_marks
        oc.source_url = data.source_url
        oc.notes = data.notes
        oc.published_by = current_user.id
        oc.published_at = datetime.now(timezone.utc)
    else:
        oc = OfficialCutoff(
            exam_id=exam_id,
            category_id=data.category_id,
            cutoff_marks=data.cutoff_marks,
            published_by=current_user.id,
            source_url=data.source_url,
            notes=data.notes,
        )
        db.add(oc)
    await db.commit()
    await db.refresh(oc)

    return OfficialCutoffPublic(
        id=oc.id, exam_id=exam_id, category_id=oc.category_id,
        category_name=category.name, cutoff_marks=oc.cutoff_marks,
        published_at=oc.published_at, source_url=oc.source_url, notes=oc.notes,
    )


@router.post("/{exam_id}/recalculate")
async def recalculate_estimates(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Force recalculate estimated cutoffs. Admin only."""
    from ..services.cutoff import estimate_cutoff_for_exam
    estimates, insufficient = await estimate_cutoff_for_exam(db, exam_id)
    return {
        "message": "Cutoff estimates recalculated",
        "categories_estimated": len(estimates),
        "insufficient_data_categories": insufficient,
    }
