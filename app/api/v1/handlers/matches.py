"""Match handlers: list, detail, mark seen, unseen count."""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.matches import MatchListResponse, MatchResponse, UnseenCountResponse
from app.api.v1.schemas.wishes import WishResponse
from app.auth.dependencies import get_current_user
from app.database import get_db
from app.exceptions import ForbiddenError, NotFoundError
from app.models.match import Match
from app.models.user import User
from app.services.swipes import get_match, get_unseen_count, list_matches, mark_match_seen
from app.services.wishes import get_wish

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/matches", tags=["matches"])


def _build_match_response(match: Match, user_id: uuid.UUID, wish_response: WishResponse) -> MatchResponse:
    """Build MatchResponse with computed fields for the requesting user."""
    partner_id = match.user2_id if match.user1_id == user_id else match.user1_id
    is_seen = match.user1_seen if match.user1_id == user_id else match.user2_seen
    return MatchResponse(
        id=match.id,
        wish_id=match.wish_id,
        wish=wish_response,
        user1_id=match.user1_id,
        user2_id=match.user2_id,
        partner_id=partner_id,
        is_seen=is_seen,
        created_at=match.created_at,
    )


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
    responses = []
    for match in items:
        wish = await get_wish(db, wish_id=match.wish_id)
        wish_resp = WishResponse.model_validate(wish)
        responses.append(_build_match_response(match=match, user_id=user.id, wish_response=wish_resp))
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
    try:
        match = await get_match(db, match_id=match_id, user_id=user.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))

    wish = await get_wish(db, wish_id=match.wish_id)
    wish_resp = WishResponse.model_validate(wish)
    return _build_match_response(match=match, user_id=user.id, wish_response=wish_resp)


@router.patch("/{match_id}/seen", response_model=MatchResponse)
async def mark_match_seen_endpoint(
    match_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MatchResponse:
    """Mark a match as seen by the authenticated user."""
    try:
        match = await mark_match_seen(db, match_id=match_id, user_id=user.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))

    wish = await get_wish(db, wish_id=match.wish_id)
    wish_resp = WishResponse.model_validate(wish)
    return _build_match_response(match=match, user_id=user.id, wish_response=wish_resp)
