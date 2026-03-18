"""Profile business logic: update user profile."""

import logging

from geoalchemy2 import WKTElement
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

logger = logging.getLogger(__name__)


async def update_profile(db: AsyncSession, user: User, data: dict) -> User:
    """Apply partial update to user profile.

    Raises ValueError("contact_required") if both telegram and instagram
    would become empty after the update.
    """
    if data.get("telegram"):
        data["telegram"] = data["telegram"].lstrip("@") or None
    if data.get("instagram"):
        data["instagram"] = data["instagram"].lstrip("@") or None

    if "location" in data:
        loc = data.pop("location")
        data["location"] = (
            WKTElement(f"POINT({loc['lon']} {loc['lat']})", srid=4326) if loc else None
        )

    for key, value in data.items():
        setattr(user, key, value)

    if not (user.telegram or user.instagram):
        raise ValueError("contact_required")

    await db.commit()
    await db.refresh(user)
    logger.info("Profile updated for user: %s", user.id)
    return user
