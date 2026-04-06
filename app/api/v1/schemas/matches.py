"""Match request/response schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from app.api.v1.schemas.wishes import WishResponse

if TYPE_CHECKING:
    from app.models.match import Match


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

    @classmethod
    def from_match(cls, match: Match, user_id: uuid.UUID, wish: WishResponse) -> MatchResponse:
        """Build MatchResponse with computed fields for the requesting user."""
        return cls(
            id=match.id,
            wish_id=match.wish_id,
            wish=wish,
            user1_id=match.user1_id,
            user2_id=match.user2_id,
            partner_id=match.user2_id if match.user1_id == user_id else match.user1_id,
            is_seen=match.user1_seen if match.user1_id == user_id else match.user2_seen,
            created_at=match.created_at,
        )


class MatchListResponse(BaseModel):
    """Paginated list of matches."""

    items: list[MatchResponse] = Field(description="List of matches")
    total: int = Field(description="Total number of matches")


class UnseenCountResponse(BaseModel):
    """Count of unseen matches."""

    count: int = Field(description="Number of unseen matches")
