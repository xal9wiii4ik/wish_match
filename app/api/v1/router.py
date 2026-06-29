"""V1 API router — aggregates all v1 handlers under /v1 prefix."""

from fastapi import APIRouter

from app.api.v1.handlers.auth import router as auth_router
from app.api.v1.handlers.categories import router as categories_router
from app.api.v1.handlers.matches import router as matches_router
from app.api.v1.handlers.profile import router as profile_router
from app.api.v1.handlers.swipes import router as swipes_router
from app.api.v1.handlers.wishes import router as wishes_router

router = APIRouter(prefix="/v1")
router.include_router(auth_router)
router.include_router(categories_router)
router.include_router(profile_router)
router.include_router(wishes_router, prefix="/wishes")
router.include_router(swipes_router)
router.include_router(matches_router)
