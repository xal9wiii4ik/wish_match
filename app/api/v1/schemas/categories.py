"""Category response schemas."""

import uuid

from pydantic import BaseModel, ConfigDict, Field


class CategoryResponse(BaseModel):
    """Public category representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(description="Category UUID")
    name: str = Field(description="Display name")
    slug: str = Field(description="URL-friendly slug")
