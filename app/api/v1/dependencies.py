"""Shared FastAPI dependencies for v1 endpoints."""

import uuid

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.wish import Wish
from app.services.wishes import get_wish


async def get_wish_or_404(
    wish_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Wish:
    """Return the wish by id or let NotFoundError propagate to the global handler."""
    return await get_wish(db, wish_id)
