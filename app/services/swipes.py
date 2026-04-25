"""Swipe and match business logic."""

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.block import Block
from app.models.match import Match
from app.models.swipe import Swipe
from app.models.wish import Wish

logger = logging.getLogger(__name__)


async def create_swipe(
    db: AsyncSession,
    user_id: uuid.UUID,
    wish_id: uuid.UUID,
    is_like: bool,
) -> tuple[Swipe, Match | None]:
    """Create a swipe. If like, atomically create a match and auto-close wish if full.

    Raises NotFoundError if wish does not exist.
    Raises ValueError("wish_not_active") if wish is not active.
    Raises ValueError("cannot_swipe_own_wish") if user owns the wish.
    Raises ForbiddenError("user_blocked") if block exists between users.
    Raises ConflictError("already_swiped") if duplicate swipe.
    """
    wish = await _get_active_wish_or_fail(db, wish_id=wish_id)
    if user_id == wish.user_id:
        raise ValueError("cannot_swipe_own_wish")
    await _check_not_blocked(db, user_id=user_id, other_id=wish.user_id)
    await _check_not_duplicate(db, user_id=user_id, wish_id=wish_id)

    swipe = Swipe(user_id=user_id, wish_id=wish_id, is_like=is_like)
    db.add(swipe)

    match: Match | None = None
    if is_like:
        match = Match(wish_id=wish.id, user1_id=wish.user_id, user2_id=user_id)
        db.add(match)
        await db.flush()

        count_result = await db.execute(
            select(func.count()).select_from(Match).where(Match.wish_id == wish.id),
        )
        if count_result.scalar_one() >= wish.max_participants:
            wish.status = "closed"

    await db.commit()
    await db.refresh(swipe)
    if match is not None:
        await db.refresh(match)

    logger.info("Swipe created: %s (like=%s) on wish %s", swipe.id, is_like, wish_id)
    return swipe, match


async def list_matches(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int,
    offset: int,
    wish_id: uuid.UUID | None = None,
) -> tuple[list[Match], int]:
    """Return matches for user with pagination and optional wish filter."""
    base = select(Match).where(
        or_(Match.user1_id == user_id, Match.user2_id == user_id),
    )
    if wish_id is not None:
        base = base.where(Match.wish_id == wish_id)

    count_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total: int = count_result.scalar_one()

    result = await db.execute(
        base.order_by(Match.created_at.desc()).limit(limit).offset(offset),
    )
    return list(result.scalars().all()), total


async def get_match(
    db: AsyncSession,
    match_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Match:
    """Return a match by ID with wish eagerly loaded. Only participants can access.

    Raises NotFoundError if match does not exist.
    Raises ForbiddenError("not_participant") if user is not a participant.
    """
    result = await db.execute(
        select(Match).where(Match.id == match_id).options(selectinload(Match.wish)),
    )
    match = result.scalar_one_or_none()
    if match is None:
        raise NotFoundError("match_not_found")
    if match.user1_id != user_id and match.user2_id != user_id:
        raise ForbiddenError("not_participant")
    return match


async def mark_match_seen(
    db: AsyncSession,
    match_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Match:
    """Mark a match as seen for the requesting user.

    Raises NotFoundError if match does not exist.
    Raises ForbiddenError("not_participant") if user is not a participant.
    """
    match = await get_match(db, match_id=match_id, user_id=user_id)

    if match.user1_id == user_id:
        match.user1_seen = True
    else:
        match.user2_seen = True

    await db.commit()
    logger.info("Match %s marked seen by user %s", match_id, user_id)
    return match


async def get_unseen_count(db: AsyncSession, user_id: uuid.UUID) -> int:
    """Return the number of unseen matches for the user."""
    query = select(func.count()).select_from(Match).where(
        or_(
            and_(Match.user1_id == user_id, Match.user1_seen.is_(False)),
            and_(Match.user2_id == user_id, Match.user2_seen.is_(False)),
        ),
    )
    result = await db.execute(query)
    return result.scalar_one()


async def _get_active_wish_or_fail(db: AsyncSession, wish_id: uuid.UUID) -> Wish:
    """Load wish and validate it is active and not expired."""
    result = await db.execute(select(Wish).where(Wish.id == wish_id))
    wish = result.scalar_one_or_none()
    if wish is None:
        raise NotFoundError("wish_not_found")
    if wish.status != "active":
        raise ValueError("wish_not_active")
    if wish.expires_at is not None and wish.expires_at <= datetime.now(tz=timezone.utc):
        raise ValueError("wish_not_active")
    return wish


async def _check_not_blocked(
    db: AsyncSession, user_id: uuid.UUID, other_id: uuid.UUID,
) -> None:
    """Raise ForbiddenError if a block exists in either direction."""
    query = select(Block.id).where(
        or_(
            and_(Block.blocker_id == user_id, Block.blocked_id == other_id),
            and_(Block.blocker_id == other_id, Block.blocked_id == user_id),
        ),
    )
    result = await db.execute(query)
    if result.scalar_one_or_none() is not None:
        raise ForbiddenError("user_blocked")


async def _check_not_duplicate(
    db: AsyncSession, user_id: uuid.UUID, wish_id: uuid.UUID,
) -> None:
    """Raise ConflictError if user already swiped this wish."""
    result = await db.execute(
        select(Swipe.id).where(
            and_(Swipe.user_id == user_id, Swipe.wish_id == wish_id),
        ),
    )
    if result.scalar_one_or_none() is not None:
        raise ConflictError("already_swiped")
