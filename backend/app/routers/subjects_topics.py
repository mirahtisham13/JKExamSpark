from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..dependencies import require_admin, get_current_active_user
from ..models.subject import Subject
from ..models.topic import Topic
from ..schemas.exam import SubjectCreate, SubjectUpdate, SubjectPublic, TopicCreate, TopicUpdate, TopicPublic
from ..core.exceptions import NotFoundException

subjects_router = APIRouter(prefix="/subjects", tags=["subjects"])
topics_router = APIRouter(prefix="/topics", tags=["topics"])


@subjects_router.get("/", response_model=List[SubjectPublic])
async def list_subjects(
    exam_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    query = select(Subject)
    if exam_id:
        query = query.where(Subject.exam_id == exam_id)
    result = await db.execute(query.order_by(Subject.order, Subject.name))
    return result.scalars().all()


@subjects_router.post("/", response_model=SubjectPublic, status_code=201)
async def create_subject(
    data: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    subject = Subject(**data.model_dump())
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@subjects_router.put("/{subject_id}", response_model=SubjectPublic)
async def update_subject(
    subject_id: int,
    data: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    result = await db.execute(select(Subject).where(Subject.id == subject_id))
    subject = result.scalar_one_or_none()
    if not subject:
        raise NotFoundException("Subject not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(subject, field, value)
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@topics_router.get("/", response_model=List[TopicPublic])
async def list_topics(
    subject_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    query = select(Topic)
    if subject_id:
        query = query.where(Topic.subject_id == subject_id)
    result = await db.execute(query.order_by(Topic.order, Topic.name))
    return result.scalars().all()


@topics_router.post("/", response_model=TopicPublic, status_code=201)
async def create_topic(
    data: TopicCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    topic = Topic(**data.model_dump())
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    return topic


@topics_router.put("/{topic_id}", response_model=TopicPublic)
async def update_topic(
    topic_id: int,
    data: TopicUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_admin),
):
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if not topic:
        raise NotFoundException("Topic not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(topic, field, value)
    db.add(topic)
    await db.commit()
    await db.refresh(topic)
    return topic
