"""Wish request/response schemas."""

import uuid
from datetime import datetime, timezone

from geoalchemy2 import WKTElement
from geoalchemy2.shape import to_shape
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.api.v1.schemas.common import LocationPoint


class WishCreateRequest(BaseModel):
    """Create a new wish."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    title: str = Field(min_length=1, max_length=200, description="Wish title")
    description: str | None = Field(None, max_length=2000, description="Detailed description")
    category_id: uuid.UUID = Field(description="Category UUID")
    location: WKTElement = Field(description="Location as {lat, lon}")
    location_name: str | None = Field(None, max_length=200, description="Human-readable location name")
    city: str | None = Field(None, max_length=100, description="City name")
    expires_at: datetime | None = Field(None, description="Expiration timestamp (must be in the future)")
    max_participants: int = Field(1, ge=1, le=100, description="Maximum number of participants")

    @field_validator("location", mode="before")
    @classmethod
    def convert_location(cls, v: object) -> WKTElement | None:
        """Convert LocationPoint dict to WKTElement for PostGIS."""
        if isinstance(v, dict):
            return WKTElement(f"POINT({v['lon']} {v['lat']})", srid=4326)
        return v

    @field_validator("expires_at")
    @classmethod
    def expires_must_be_future(cls, v: datetime | None) -> datetime | None:
        """Validate that expires_at is in the future."""
        if v is not None and v <= datetime.now(tz=timezone.utc):
            raise ValueError("expires_in_past")
        return v


class WishUpdateRequest(BaseModel):
    """Partial wish update — all fields optional (PATCH semantics)."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    title: str | None = Field(None, min_length=1, max_length=200, description="Wish title")
    description: str | None = Field(None, max_length=2000, description="Detailed description")
    location: WKTElement | None = Field(None, description="Location as {lat, lon}")
    location_name: str | None = Field(None, max_length=200, description="Human-readable location name")
    city: str | None = Field(None, max_length=100, description="City name")
    status: str | None = Field(None, pattern=r"^(active|closed)$", description="Wish status")
    expires_at: datetime | None = Field(None, description="Expiration timestamp")
    max_participants: int | None = Field(None, ge=1, le=100, description="Maximum number of participants")

    @field_validator("location", mode="before")
    @classmethod
    def convert_location(cls, v: object) -> WKTElement | None:
        """Convert LocationPoint dict to WKTElement for PostGIS."""
        if v is None:
            return None
        if isinstance(v, dict):
            return WKTElement(f"POINT({v['lon']} {v['lat']})", srid=4326)
        return v

    @field_validator("expires_at")
    @classmethod
    def expires_must_be_future(cls, v: datetime | None) -> datetime | None:
        """Validate that expires_at is in the future."""
        if v is not None and v <= datetime.now(tz=timezone.utc):
            raise ValueError("expires_in_past")
        return v


class WishResponse(BaseModel):
    """Public wish representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    category_id: uuid.UUID
    title: str
    description: str | None
    location: LocationPoint
    location_name: str | None
    city: str | None
    status: str
    expires_at: datetime | None
    max_participants: int
    spots_left: int | None = Field(None, description="Remaining spots (detail view only)")
    created_at: datetime

    @field_validator("location", mode="before")
    @classmethod
    def parse_geoalchemy_location(cls, v: object) -> LocationPoint | dict | None:
        """Convert GeoAlchemy2 WKBElement to LocationPoint dict."""
        if v is None or isinstance(v, (dict, LocationPoint)):
            return v
        point = to_shape(v)
        return {"lat": point.y, "lon": point.x}


class FeedQuery(BaseModel):
    """Query parameters for the wish feed endpoint."""

    lat: float = Field(ge=-90, le=90, description="Latitude")
    lon: float = Field(ge=-180, le=180, description="Longitude")
    radius_km: float = Field(50, ge=1, le=500, description="Search radius in km")
    category_id: uuid.UUID | None = Field(None, description="Filter by category")
    limit: int = Field(20, ge=1, le=100, description="Items per page")
    offset: int = Field(0, ge=0, description="Items to skip")


class WishListResponse(BaseModel):
    """Paginated list of wishes."""

    items: list[WishResponse]
    total: int
