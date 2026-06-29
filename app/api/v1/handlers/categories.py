"""Category handlers: list categories."""

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.categories import CategoryResponse
from app.database import get_db
from app.services.categories import list_categories

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories_endpoint(
    db: AsyncSession = Depends(get_db),
) -> list[CategoryResponse]:
    """Return all available wish categories."""
    categories = await list_categories(db)
    return [CategoryResponse.model_validate(category) for category in categories]
