"""Shared FastAPI dependencies for v1 endpoints."""

import uuid

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions import NotFoundError
from app.models.wish import Wish
from app.services.wishes import get_wish


async def get_wish_or_404(
    wish_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> Wish:
    try:
        return await get_wish(db, wish_id)
    except NotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="wish_not_found")
