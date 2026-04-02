"""Shared Pydantic schemas reused across multiple modules."""

from pydantic import BaseModel, Field


class LocationPoint(BaseModel):
    """Geographic point with latitude and longitude."""

    lat: float = Field(ge=-90, le=90, description="Latitude")
    lon: float = Field(ge=-180, le=180, description="Longitude")
