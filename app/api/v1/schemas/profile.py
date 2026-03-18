"""Profile request/response schemas."""

import uuid
from datetime import datetime

from geoalchemy2.shape import to_shape
from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, field_validator


class LocationPoint(BaseModel):
    """Geographic point with latitude and longitude."""

    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class ProfileUpdateRequest(BaseModel):
    """Partial profile update — all fields optional (PATCH semantics)."""

    name: str | None = Field(None, min_length=1, max_length=100)
    bio: str | None = Field(None, max_length=500)
    city: str | None = Field(None, max_length=100)
    telegram: str | None = Field(None, pattern=r"^@?[a-zA-Z0-9_]{4,32}$")
    instagram: str | None = Field(None, pattern=r"^@?[a-zA-Z][a-zA-Z0-9._]{0,29}$")
    avatar_url: AnyHttpUrl | None = None
    location: LocationPoint | None = None


class ProfileResponse(BaseModel):
    """Public profile representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str
    bio: str | None
    city: str | None
    telegram: str | None
    instagram: str | None
    avatar_url: str | None
    location: LocationPoint | None
    created_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def parse_geoalchemy_location(cls, v: object) -> "LocationPoint | dict | None":
        """Convert GeoAlchemy2 WKBElement to LocationPoint dict."""
        if v is None or isinstance(v, (dict, LocationPoint)):
            return v
        point = to_shape(v)
        return {"lat": point.y, "lon": point.x}
