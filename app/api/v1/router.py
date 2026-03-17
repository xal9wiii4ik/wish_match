"""V1 API router — aggregates all v1 handlers under /v1 prefix."""

from fastapi import APIRouter

from app.api.v1.handlers.auth import router as auth_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router)
