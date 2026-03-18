"""Profile handlers: get and update current user profile."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.profile import update_profile

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["profile"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(user: User = Depends(get_current_user)) -> ProfileResponse:
    """Return the authenticated user's profile."""
    return ProfileResponse.model_validate(user)


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    body: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    """Update the authenticated user's profile (partial update)."""
    data = body.model_dump(exclude_unset=True)
    if "avatar_url" in data and data["avatar_url"] is not None:
        data["avatar_url"] = str(data["avatar_url"])
    try:
        user = await update_profile(db, user, data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return ProfileResponse.model_validate(user)
