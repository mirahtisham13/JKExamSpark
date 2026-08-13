"""
Cutoff estimation service.
IMPORTANT: Cutoff estimation uses ONLY actual exam score submissions.
Quiz scores are NEVER used in cutoff calculations.
"""
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models.score import ExamScoreSubmission
from ..models.exam import Exam
from ..models.exam_category import ExamCategory
from ..models.category import Category
from ..models.cutoff import CutoffEstimate, OfficialCutoff
from ..schemas.cutoff import CutoffEstimatePublic, OfficialCutoffPublic, CutoffResponse
from ..core.exceptions import NotFoundException

MIN_SAMPLES_REQUIRED = 10


def _get_confidence_and_padding(sample_size: int) -> tuple[str, float]:
    """Return confidence level and score padding based on sample size."""
    if sample_size < 30:
        return "LOW", 5.0
    elif sample_size <= 100:
        return "MEDIUM", 3.0
    else:
        return "HIGH", 2.0


async def estimate_cutoff_for_exam(
    db: AsyncSession, exam_id: int
) -> tuple[List[CutoffEstimatePublic], List[str]]:
    """
    Estimate cutoffs for all categories of an exam.
    Returns: (estimates, insufficient_data_categories)
    Uses ONLY actual exam score submissions.
    """
    # Fetch exam
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")

    # Fetch all exam categories with vacancies
    ec_result = await db.execute(
        select(ExamCategory).where(ExamCategory.exam_id == exam_id)
    )
    exam_categories = ec_result.scalars().all()

    estimates = []
    insufficient_data = []

    for ec in exam_categories:
        # Get all active submissions for this exam + category
        subs_result = await db.execute(
            select(ExamScoreSubmission).where(
                ExamScoreSubmission.exam_id == exam_id,
                ExamScoreSubmission.category_id == ec.category_id,
                ExamScoreSubmission.is_active == True,
            )
        )
        submissions = subs_result.scalars().all()
        sample_size = len(submissions)

        # Get category name
        cat_result = await db.execute(select(Category).where(Category.id == ec.category_id))
        category = cat_result.scalar_one_or_none()
        cat_name = category.name if category else f"Category {ec.category_id}"

        if sample_size < MIN_SAMPLES_REQUIRED:
            insufficient_data.append(cat_name)
            continue

        # Sort descending by marks
        scores = sorted([s.marks_obtained for s in submissions], reverse=True)
        vacancies = ec.vacancies or 1

        # Find preliminary cutoff at vacancy position
        cutoff_idx = min(vacancies - 1, sample_size - 1)
        preliminary_cutoff = scores[cutoff_idx]

        confidence, padding = _get_confidence_and_padding(sample_size)
        estimated_min = max(0.0, preliminary_cutoff - padding)
        estimated_max = min(exam.total_marks, preliminary_cutoff + padding)

        parameters = {
            "vacancies": vacancies,
            "preliminary_cutoff": preliminary_cutoff,
            "padding": padding,
        }

        # Upsert estimate in DB
        existing_result = await db.execute(
            select(CutoffEstimate).where(
                CutoffEstimate.exam_id == exam_id,
                CutoffEstimate.category_id == ec.category_id,
            )
        )
        estimate_record = existing_result.scalar_one_or_none()

        if estimate_record:
            estimate_record.estimated_min = estimated_min
            estimate_record.estimated_max = estimated_max
            estimate_record.sample_size = sample_size
            estimate_record.confidence_level = confidence
            estimate_record.calculated_at = datetime.now(timezone.utc)
            estimate_record.parameters_used = parameters
        else:
            estimate_record = CutoffEstimate(
                exam_id=exam_id,
                category_id=ec.category_id,
                estimated_min=estimated_min,
                estimated_max=estimated_max,
                sample_size=sample_size,
                confidence_level=confidence,
                calculated_at=datetime.now(timezone.utc),
                parameters_used=parameters,
            )
            db.add(estimate_record)

        await db.commit()
        if estimate_record.id is None:
            await db.refresh(estimate_record)

        estimates.append(CutoffEstimatePublic(
            id=estimate_record.id or 0,
            exam_id=exam_id,
            category_id=ec.category_id,
            category_name=cat_name,
            estimated_min=estimated_min,
            estimated_max=estimated_max,
            sample_size=sample_size,
            confidence_level=confidence,
            calculated_at=estimate_record.calculated_at,
        ))

    return estimates, insufficient_data


async def get_cutoffs_for_exam(db: AsyncSession, exam_id: int) -> CutoffResponse:
    """
    Return both official cutoffs and estimated cutoffs for an exam.
    Official cutoffs are entered by admin only.
    Estimated cutoffs are computed from student-submitted actual scores.
    """
    # Verify exam
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    if not exam:
        raise NotFoundException("Exam not found")

    # Get official cutoffs
    official_result = await db.execute(
        select(OfficialCutoff, Category).join(
            Category, OfficialCutoff.category_id == Category.id
        ).where(OfficialCutoff.exam_id == exam_id)
    )
    official_cutoffs = []
    for oc, cat in official_result.all():
        official_cutoffs.append(OfficialCutoffPublic(
            id=oc.id,
            exam_id=exam_id,
            category_id=oc.category_id,
            category_name=cat.name,
            cutoff_marks=oc.cutoff_marks,
            published_at=oc.published_at,
            source_url=oc.source_url,
            notes=oc.notes,
        ))

    # Get or calculate estimates
    estimates, insufficient = await estimate_cutoff_for_exam(db, exam_id)

    return CutoffResponse(
        exam_id=exam_id,
        exam_name=exam.name,
        official_cutoffs=official_cutoffs,
        estimated_cutoffs=estimates,
        insufficient_data_categories=insufficient,
    )
