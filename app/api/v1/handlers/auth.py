"""Auth handlers: register, confirm-email, login."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.schemas.auth import (
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    TokenResponse,
)
from app.auth.jwt import create_access_token
from app.config import settings
from app.database import get_db
from app.services.auth import confirm_email, login_user, register_user
from app.services.email import send_confirmation_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)) -> MessageResponse:
    """Register new user and send confirmation email."""
    try:
        user, token = await register_user(db, body.email, body.password, body.name)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    confirmation_url = f"{settings.FRONTEND_URL}/confirm-email?token={token}"
    try:
        await send_confirmation_email(user.email, confirmation_url)
    except Exception as exc:
        logger.error("Failed to send confirmation email to %s: %s", user.email, exc)
        raise HTTPException(status_code=500, detail=str(exc))

    return MessageResponse(message="Registration successful. Check your email to confirm.")


@router.get("/confirm-email", response_model=MessageResponse)
async def confirm_email_endpoint(token: str, db: AsyncSession = Depends(get_db)) -> MessageResponse:
    """Confirm user email by token."""
    try:
        await confirm_email(db, token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return MessageResponse(message="Email confirmed. You can now log in.")


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Authenticate user and return JWT token."""
    try:
        user = await login_user(db, body.email, body.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)
