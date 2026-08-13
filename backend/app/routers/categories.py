from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import require_admin
from ..models.category import Category
from ..schemas.exam import CategoryCreate, CategoryUpdate, CategoryPublic
from ..core.exceptions import NotFoundException, ConflictException

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[CategoryPublic])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True).order_by(Category.name))
    return result.scalars().all()


@router.post("/", response_model=CategoryPublic, status_code=201)
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    existing = await db.execute(select(Category).where(Category.code == data.code))
    if existing.scalar_one_or_none():
        raise ConflictException(f"Category with code '{data.code}' already exists")
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.put("/{cat_id}", response_model=CategoryPublic)
async def update_category(
    cat_id: int,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise NotFoundException("Category not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat
