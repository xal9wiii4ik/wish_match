"""V1 API router — aggregates all v1 handlers under /v1 prefix."""

from fastapi import APIRouter

from app.api.v1.handlers.auth import router as auth_router
from app.api.v1.handlers.profile import router as profile_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router)
router.include_router(profile_router)
