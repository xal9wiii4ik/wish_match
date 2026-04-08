"""Wish handlers: CRUD and feed endpoints."""

import logging

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_wish_or_404
from app.api.v1.schemas.wishes import (
    FeedQuery,
    WishCreateRequest,
    WishListResponse,
    WishResponse,
    WishUpdateRequest,
)
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.wish import Wish
from app.services.wishes import (
    create_wish,
    delete_wish,
    get_feed,
    get_spots_left,
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
    wish = await create_wish(db, user.id, body)
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
    q: FeedQuery = Depends(),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishListResponse:
    """Return nearby wishes excluding own, expired, and blocked users."""
    items, total = await get_feed(db, user.id, q)
    return WishListResponse(
        items=[WishResponse.model_validate(w) for w in items],
        total=total,
    )


@router.get("/{wish_id}", response_model=WishResponse)
async def get_wish_endpoint(
    wish: Wish = Depends(get_wish_or_404),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishResponse:
    """Return a single wish by ID with remaining spots."""
    spots_left = await get_spots_left(db, wish=wish)
    data = WishResponse.model_validate(wish).model_dump()
    data["spots_left"] = spots_left
    return WishResponse(**data)


@router.patch("/{wish_id}", response_model=WishResponse)
async def update_wish_endpoint(
    body: WishUpdateRequest,
    wish: Wish = Depends(get_wish_or_404),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WishResponse:
    """Update an existing wish (only the owner can update)."""
    wish = await update_wish(db, wish, user.id, body)
    return WishResponse.model_validate(wish)


@router.delete("/{wish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wish_endpoint(
    wish: Wish = Depends(get_wish_or_404),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a wish (only the owner can delete)."""
    await delete_wish(db, wish, user.id)
