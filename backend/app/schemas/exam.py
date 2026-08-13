from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.exam import ExamStatus


class CategoryCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CategoryPublic(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool
    model_config = {"from_attributes": True}


class ExamCategoryCreate(BaseModel):
    category_id: int
    vacancies: Optional[int] = None


class ExamCategoryPublic(BaseModel):
    id: int
    exam_id: int
    category_id: int
    category: Optional[CategoryPublic] = None
    vacancies: Optional[int] = None
    official_cutoff: Optional[float] = None
    official_cutoff_published_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    exam_id: int
    description: Optional[str] = None
    order: int = 0


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class SubjectPublic(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    exam_id: int
    description: Optional[str] = None
    order: int = 0
    model_config = {"from_attributes": True}


class TopicCreate(BaseModel):
    name: str
    subject_id: int
    description: Optional[str] = None
    order: int = 0


class TopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class TopicPublic(BaseModel):
    id: int
    name: str
    subject_id: int
    description: Optional[str] = None
    order: int = 0
    model_config = {"from_attributes": True}


class ExamCreate(BaseModel):
    name: str
    year: int
    notification_number: Optional[str] = None
    exam_date: Optional[datetime] = None
    total_marks: float
    total_vacancies: Optional[int] = None
    status: ExamStatus = ExamStatus.upcoming
    official_difficulty: Optional[str] = None
    total_candidates_estimate: Optional[int] = None


class ExamUpdate(BaseModel):
    name: Optional[str] = None
    year: Optional[int] = None
    notification_number: Optional[str] = None
    exam_date: Optional[datetime] = None
    total_marks: Optional[float] = None
    total_vacancies: Optional[int] = None
    status: Optional[ExamStatus] = None
    official_difficulty: Optional[str] = None
    total_candidates_estimate: Optional[int] = None


class ExamPublic(BaseModel):
    id: int
    name: str
    year: int
    notification_number: Optional[str] = None
    exam_date: Optional[datetime] = None
    total_marks: float
    total_vacancies: Optional[int] = None
    status: ExamStatus
    official_difficulty: Optional[str] = None
    total_candidates_estimate: Optional[int] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}


class ExamDetail(ExamPublic):
    exam_categories: List[ExamCategoryPublic] = []
    subjects: List[SubjectPublic] = []
