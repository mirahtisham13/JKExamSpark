from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.material import MaterialType


class MaterialCreate(BaseModel):
    title: str
    description: Optional[str] = None
    exam_id: int
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    material_type: MaterialType
    external_url: Optional[str] = None


class MaterialUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    is_visible: Optional[bool] = None
    external_url: Optional[str] = None


class MaterialPublic(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    exam_id: int
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    material_type: MaterialType
    file_path: Optional[str] = None
    external_url: Optional[str] = None
    is_visible: bool
    download_count: int
    uploaded_by: Optional[int] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}
