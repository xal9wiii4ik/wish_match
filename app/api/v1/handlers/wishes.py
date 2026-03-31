"""Wish handlers: CRUD and feed endpoints."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.wishes import (
    WishCreateRequest,
    WishListResponse,
    WishResponse,
    WishUpdateRequest,
)
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.exceptions import ForbiddenError, NotFoundError
from app.models.user import User
from app.services.wishes import (
    create_wish,
    delete_wish,
    get_feed,
    get_wish,
    list_my_wishes,
    update_wish,
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["wishes"])


@router.post("", status_code=status.HTTP_201_CREATED, response_model=WishResponse)
async def create_wish_endpoint(
    body: WishCreateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishResponse:
    """Create a new wish for the authenticated user."""
    try:
        wish = await create_wish(db, user.id, body)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="category_not_found")
    return WishResponse.model_validate(wish)


@router.get("/my", response_model=WishListResponse)
async def list_my_wishes_endpoint(
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishListResponse:
    """Return the authenticated user's wishes (all statuses)."""
    items, total = await list_my_wishes(db, user.id, limit, offset)
    return WishListResponse(
        items=[WishResponse.model_validate(w) for w in items],
        total=total,
    )


@router.get("/feed", response_model=WishListResponse)
async def get_feed_endpoint(
    lat: float = Query(ge=-90, le=90, description="Latitude"),
    lon: float = Query(ge=-180, le=180, description="Longitude"),
    radius_km: float = Query(50, ge=1, le=500, description="Search radius in km"),
    category_id: uuid.UUID | None = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishListResponse:
    """Return nearby wishes excluding own, expired, and blocked users."""
    items, total = await get_feed(db, user.id, lat, lon, radius_km, category_id, limit, offset)
    return WishListResponse(
        items=[WishResponse.model_validate(w) for w in items],
        total=total,
    )


@router.get("/{wish_id}", response_model=WishResponse)
async def get_wish_endpoint(
    wish_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishResponse:
    """Return a single wish by ID."""
    try:
        wish = await get_wish(db, wish_id)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="wish_not_found")
    return WishResponse.model_validate(wish)


@router.patch("/{wish_id}", response_model=WishResponse)
async def update_wish_endpoint(
    wish_id: uuid.UUID,
    body: WishUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishResponse:
    """Update an existing wish (only the owner can update)."""
    try:
        wish = await update_wish(db, wish_id, user.id, body)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="wish_not_found")
    except ForbiddenError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not_owner")
    return WishResponse.model_validate(wish)


@router.delete("/{wish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wish_endpoint(
    wish_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a wish (only the owner can delete)."""
    try:
        await delete_wish(db, wish_id, user.id)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="wish_not_found")
    except ForbiddenError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="not_owner")
