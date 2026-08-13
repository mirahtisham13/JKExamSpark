from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class OfficialCutoffCreate(BaseModel):
    category_id: int
    cutoff_marks: float
    source_url: Optional[str] = None
    notes: Optional[str] = None


class OfficialCutoffPublic(BaseModel):
    id: int
    exam_id: int
    category_id: int
    category_name: str
    cutoff_marks: float
    published_at: datetime
    source_url: Optional[str] = None
    notes: Optional[str] = None
    model_config = {"from_attributes": True}


class CutoffEstimatePublic(BaseModel):
    id: int
    exam_id: int
    category_id: int
    category_name: str
    estimated_min: float
    estimated_max: float
    sample_size: int
    confidence_level: str  # LOW, MEDIUM, HIGH
    calculated_at: datetime
    model_config = {"from_attributes": True}


class CutoffResponse(BaseModel):
    exam_id: int
    exam_name: str
    official_cutoffs: List[OfficialCutoffPublic] = []
    estimated_cutoffs: List[CutoffEstimatePublic] = []
    disclaimer: str = (
        "Estimated cutoffs are calculated from student-submitted actual exam scores "
        "using statistical modeling. They are NOT official JKSSB cutoffs and may differ "
        "significantly from actual results. Do not make career decisions based solely on these estimates. "
        "Official cutoffs are published by JKSSB only after result declaration."
    )
    insufficient_data_categories: List[str] = []
