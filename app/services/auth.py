"""Auth business logic: registration, confirmation, login."""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_confirmation import EmailConfirmation
from app.models.user import User

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return bcrypt hash of the password."""
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify plain password against bcrypt hash."""
    return pwd_context.verify(plain, hashed)


async def register_user(
    db: AsyncSession, email: str, password: str, name: str
) -> tuple[User, str]:
    """Create inactive user and return (user, confirmation_token).

    Raises ValueError if email is already taken.
    """
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none() is not None:
        raise ValueError("Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        name=name,
        is_active=False,
    )
    db.add(user)
    await db.flush()

    token = secrets.token_urlsafe(32)
    confirmation = EmailConfirmation(
        user_id=user.id,
        token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(confirmation)
    await db.commit()
    await db.refresh(user)
    logger.info("User registered: %s", user.id)
    return user, token


async def confirm_email(db: AsyncSession, token: str) -> User:
    """Activate user by confirmation token.

    Raises ValueError if token is invalid or expired.
    """
    result = await db.execute(
        select(EmailConfirmation).where(EmailConfirmation.token == token)
    )
    confirmation = result.scalar_one_or_none()
    if confirmation is None:
        raise ValueError("Invalid confirmation token")
    if confirmation.expires_at < datetime.now(timezone.utc):
        raise ValueError("Confirmation token expired")

    result = await db.execute(select(User).where(User.id == confirmation.user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise ValueError("User not found")

    user.is_active = True
    await db.delete(confirmation)
    await db.commit()
    await db.refresh(user)
    logger.info("Email confirmed for user: %s", user.id)
    return user


async def login_user(db: AsyncSession, email: str, password: str) -> User:
    """Validate credentials and return user.

    Raises ValueError if credentials are invalid or email is not confirmed.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    if not user.is_active:
        raise ValueError("Email not confirmed")
    return user
