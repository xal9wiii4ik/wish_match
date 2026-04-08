"""Swipe handlers: create swipe endpoint."""

import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.swipes import SwipeCreateRequest, SwipeResponse
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.swipes import create_swipe

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/swipes", tags=["swipes"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=SwipeResponse)
async def create_swipe_endpoint(
    body: SwipeCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SwipeResponse:
    """Create a swipe on a wish. Like immediately creates a match."""
    swipe, match = await create_swipe(
        db, user_id=user.id, wish_id=body.wish_id, is_like=body.is_like,
    )
    return SwipeResponse(
        id=swipe.id,
        user_id=swipe.user_id,
        wish_id=swipe.wish_id,
        is_like=swipe.is_like,
        match_id=match.id if match else None,
        created_at=swipe.created_at,
    )
