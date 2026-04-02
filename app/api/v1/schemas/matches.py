"""Match request/response schemas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.schemas.wishes import WishResponse


class MatchResponse(BaseModel):
    """Single match representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(description="Match UUID")
    wish_id: uuid.UUID = Field(description="Wish this match belongs to")
    wish: WishResponse = Field(description="Wish details")
    user1_id: uuid.UUID = Field(description="Wish owner")
    user2_id: uuid.UUID = Field(description="User who liked the wish")
    partner_id: uuid.UUID = Field(description="The other participant (not current user)")
    is_seen: bool = Field(description="Whether current user has seen this match")
    created_at: datetime = Field(description="When the match was created")


class MatchListResponse(BaseModel):
    """Paginated list of matches."""

    items: list[MatchResponse] = Field(description="List of matches")
    total: int = Field(description="Total number of matches")


class UnseenCountResponse(BaseModel):
    """Count of unseen matches."""

    count: int = Field(description="Number of unseen matches")
