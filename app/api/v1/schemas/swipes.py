"""Swipe request/response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SwipeCreateRequest(BaseModel):
    """Create a new swipe on a wish."""

    wish_id: uuid.UUID = Field(description="UUID of the wish to swipe on")
    is_like: bool = Field(description="True = like, False = pass")


class SwipeResponse(BaseModel):
    """Swipe result returned after creation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(description="Swipe UUID")
    user_id: uuid.UUID = Field(description="User who swiped")
    wish_id: uuid.UUID = Field(description="Wish that was swiped")
    is_like: bool = Field(description="True = like, False = pass")
    match_id: uuid.UUID | None = Field(description="Match UUID if like created a match, None otherwise")
    created_at: datetime = Field(description="When the swipe was created")
