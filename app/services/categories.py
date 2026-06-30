"""Category business logic: list categories."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category


async def list_categories(db: AsyncSession) -> list[Category]:
    """Return all categories ordered by name."""
    result = await db.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())
