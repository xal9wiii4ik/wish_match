"""Match handlers: list, detail, mark seen, unseen count."""

import logging
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.matches import MatchListResponse, MatchResponse, UnseenCountResponse
from app.api.v1.schemas.wishes import WishResponse
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.wish import Wish
from app.services.swipes import get_match, get_unseen_count, list_matches, mark_match_seen

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("", response_model=MatchListResponse)
async def list_matches_endpoint(
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Items to skip"),
    wish_id: uuid.UUID | None = Query(None, description="Filter by wish UUID"),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchListResponse:
    """Return the authenticated user's matches with pagination."""
    items, total = await list_matches(
        db, user_id=user.id, limit=limit, offset=offset, wish_id=wish_id,
    )

    wish_ids = {m.wish_id for m in items}
    if wish_ids:
        result = await db.execute(select(Wish).where(Wish.id.in_(wish_ids)))
        wishes_by_id = {w.id: w for w in result.scalars().all()}
    else:
        wishes_by_id = {}

    responses = [
        MatchResponse.from_match(
            match=match,
            user_id=user.id,
            wish=WishResponse.model_validate(wishes_by_id[match.wish_id]),
        )
        for match in items
    ]
    return MatchListResponse(items=responses, total=total)


@router.get("/unseen-count", response_model=UnseenCountResponse)
async def unseen_count_endpoint(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UnseenCountResponse:
    """Return the count of unseen matches for the authenticated user."""
    count = await get_unseen_count(db, user_id=user.id)
    return UnseenCountResponse(count=count)


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match_endpoint(
    match_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchResponse:
    """Return match details. Only participants can access."""
    match = await get_match(db, match_id=match_id, user_id=user.id)
    return MatchResponse.from_match(
        match=match, user_id=user.id, wish=WishResponse.model_validate(match.wish),
    )


@router.patch("/{match_id}/seen", response_model=MatchResponse)
async def mark_match_seen_endpoint(
    match_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchResponse:
    """Mark a match as seen by the authenticated user."""
    match = await mark_match_seen(db, match_id=match_id, user_id=user.id)
    return MatchResponse.from_match(
        match=match, user_id=user.id, wish=WishResponse.model_validate(match.wish),
    )
