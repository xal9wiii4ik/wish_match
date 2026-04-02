"""Profile request/response schemas."""

import uuid
from datetime import datetime

from geoalchemy2 import WKTElement
from geoalchemy2.shape import to_shape
from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, field_validator

from app.api.v1.schemas.common import LocationPoint
from app.models.user import Gender


class ProfileUpdateRequest(BaseModel):
    """Partial profile update — all fields optional (PATCH semantics)."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    name: str | None = Field(None, min_length=1, max_length=100, description="Display name")
    bio: str | None = Field(None, max_length=500, description="Short bio")
    city: str | None = Field(None, max_length=100, description="City of residence")
    telegram: str | None = Field(
        None, pattern=r"^@?[a-zA-Z0-9_]{4,32}$", description="Telegram handle (with or without @)",
    )
    instagram: str | None = Field(
        None,
        pattern=r"^@?[a-zA-Z][a-zA-Z0-9._]{0,29}$",
        description="Instagram handle (with or without @)",
    )
    avatar_url: AnyHttpUrl | None = Field(None, description="Public URL of profile avatar")
    gender: Gender | None = Field(None, description="User gender")
    location: WKTElement | None = Field(None, description="User's current location as {lat, lon}")

    @field_validator("telegram", "instagram", mode="before")
    @classmethod
    def strip_at(cls, v: str | None) -> str | None:
        """Strip leading @ from social handles."""
        return v.lstrip("@") if v else v

    @field_validator("location", mode="before")
    @classmethod
    def convert_location(cls, v: object) -> WKTElement | None:
        """Convert LocationPoint dict to WKTElement for PostGIS."""
        if v is None:
            return None
        if isinstance(v, dict):
            return WKTElement(f"POINT({v['lon']} {v['lat']})", srid=4326)
        return v


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
    gender: Gender | None
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
