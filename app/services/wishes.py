"""Wish business logic: CRUD and feed."""

import logging
import uuid
from datetime import datetime, timezone

from geoalchemy2 import WKTElement
from geoalchemy2.functions import ST_DWithin, ST_Distance
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.wishes import WishCreateRequest, WishUpdateRequest
from app.exceptions import ForbiddenError, NotFoundError
from app.models.block import Block
from app.models.category import Category
from app.models.wish import Wish

logger = logging.getLogger(__name__)

_IMMUTABLE = {"id", "user_id", "category_id", "created_at"}


async def create_wish(
    db: AsyncSession,
    user_id: uuid.UUID,
    data: WishCreateRequest,
) -> Wish:
    """Create a new wish after validating category exists.

    Raises NotFoundError if category_id does not exist.
    """
    result = await db.execute(select(Category).where(Category.id == data.category_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("category_not_found")

    wish = Wish(user_id=user_id, **data.model_dump())
    db.add(wish)
    await db.commit()
    await db.refresh(wish)
    logger.info("Wish created: %s by user %s", wish.id, user_id)
    return wish


async def get_wish(db: AsyncSession, wish_id: uuid.UUID) -> Wish:
    """Return a wish by ID or raise NotFoundError."""
    result = await db.execute(select(Wish).where(Wish.id == wish_id))
    wish = result.scalar_one_or_none()
    if wish is None:
        raise NotFoundError("wish_not_found")
    return wish


async def list_my_wishes(
    db: AsyncSession,
    user_id: uuid.UUID,
    limit: int,
    offset: int,
) -> tuple[list[Wish], int]:
    """Return current user's wishes (all statuses) with total count."""
    base = select(Wish).where(Wish.user_id == user_id)
    count_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(
        base.order_by(Wish.created_at.desc()).limit(limit).offset(offset)
    )
    return list(result.scalars().all()), total


async def update_wish(
    db: AsyncSession,
    wish_id: uuid.UUID,
    user_id: uuid.UUID,
    data: WishUpdateRequest,
) -> Wish:
    """Update a wish. Only the owner can update.

    Raises NotFoundError if wish does not exist.
    Raises ForbiddenError if user is not the owner.
    """
    wish = await get_wish(db, wish_id)
    if wish.user_id != user_id:
        raise ForbiddenError("not_owner")

    for key, value in data.model_dump(exclude_unset=True).items():
        if key in _IMMUTABLE:
            continue
        setattr(wish, key, value)

    await db.commit()
    await db.refresh(wish)
    logger.info("Wish updated: %s", wish_id)
    return wish


async def delete_wish(
    db: AsyncSession,
    wish_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    """Delete a wish. Only the owner can delete.

    Raises NotFoundError if wish does not exist.
    Raises ForbiddenError if user is not the owner.
    """
    wish = await get_wish(db, wish_id)
    if wish.user_id != user_id:
        raise ForbiddenError("not_owner")

    await db.delete(wish)
    await db.commit()
    logger.info("Wish deleted: %s", wish_id)


async def get_feed(
    db: AsyncSession,
    user_id: uuid.UUID,
    lat: float,
    lon: float,
    radius_km: float,
    category_id: uuid.UUID | None,
    limit: int,
    offset: int,
) -> tuple[list[Wish], int]:
    """Return nearby wishes excluding own, expired, and blocked users.

    Uses ST_DWithin for geo-filtering and ST_Distance for sorting.
    Blocked users are excluded in both directions.
    """
    point = WKTElement(f"POINT({lon} {lat})", srid=4326)
    radius_m = radius_km * 1000

    blocked_ids = select(Block.blocked_id).where(Block.blocker_id == user_id)
    blocker_ids = select(Block.blocker_id).where(Block.blocked_id == user_id)

    filters = [
        Wish.status == "active",
        Wish.user_id != user_id,
        or_(Wish.expires_at.is_(None), Wish.expires_at > datetime.now(tz=timezone.utc)),
        ST_DWithin(Wish.location, point, radius_m, use_spheroid=True),
        Wish.user_id.not_in(blocked_ids),
        Wish.user_id.not_in(blocker_ids),
    ]

    if category_id is not None:
        filters.append(Wish.category_id == category_id)

    base = select(Wish).where(and_(*filters))

    count_result = await db.execute(select(func.count()).select_from(base.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(
        base.order_by(ST_Distance(Wish.location, point)).limit(limit).offset(offset)
    )
    return list(result.scalars().all()), total
