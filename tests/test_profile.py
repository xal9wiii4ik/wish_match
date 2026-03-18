"""Integration tests for /v1/users/me profile endpoints."""

from unittest.mock import AsyncMock, patch

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_confirmation import EmailConfirmation
from app.models.user import User


async def _register_confirm_login(
    async_client, db_session: AsyncSession, email: str, name: str = "Test"
) -> str:
    """Register, confirm and login a user. Return access token."""
    with patch("aiosmtplib.send", new_callable=AsyncMock):
        await async_client.post(
            "/v1/auth/register",
            json={"email": email, "password": "securepass1", "name": name},
        )
    result = await db_session.execute(
        select(EmailConfirmation).join(User).where(User.email == email)
    )
    confirmation = result.scalar_one()
    await async_client.get("/v1/auth/confirm-email", params={"token": confirmation.token})

    resp = await async_client.post(
        "/v1/auth/login", json={"email": email, "password": "securepass1"}
    )
    return resp.json()["access_token"]


class TestGetProfile:
    """GET /v1/users/me"""

    async def test_get_profile(self, async_client, db_session: AsyncSession) -> None:
        """Authenticated user gets own profile with correct fields."""
        token = await _register_confirm_login(
            async_client, db_session, "profile@example.com", "Alice"
        )

        resp = await async_client.get(
            "/v1/users/me", headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "profile@example.com"
        assert data["name"] == "Alice"
        assert "id" in data
        assert "created_at" in data

    async def test_get_profile_unauthorized(self, async_client) -> None:
        """Request without token returns 401."""
        resp = await async_client.get("/v1/users/me")
        assert resp.status_code == 401


class TestPatchProfile:
    """PATCH /v1/users/me"""

    async def test_patch_profile(self, async_client, db_session: AsyncSession) -> None:
        """Partial update changes only sent fields, preserves the rest."""
        token = await _register_confirm_login(
            async_client, db_session, "patch@example.com", "Bob"
        )

        resp = await async_client.patch(
            "/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "Bobby", "bio": "Hello!", "telegram": "@bob_tg"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Bobby"
        assert data["bio"] == "Hello!"
        assert data["telegram"] == "bob_tg"
        assert data["email"] == "patch@example.com"

    async def test_patch_contact_required(
        self, async_client, db_session: AsyncSession
    ) -> None:
        """Clearing both telegram and instagram returns 400."""
        token = await _register_confirm_login(
            async_client, db_session, "contact@example.com", "Eve"
        )

        resp = await async_client.patch(
            "/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"telegram": None, "instagram": None},
        )

        assert resp.status_code == 400
        assert "contact_required" in resp.json()["detail"]

    async def test_patch_location(self, async_client, db_session: AsyncSession) -> None:
        """Setting location returns correct lat/lon."""
        token = await _register_confirm_login(
            async_client, db_session, "location@example.com", "Geo"
        )
        # Set telegram first so contact_required doesn't fire
        await async_client.patch(
            "/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"telegram": "@geo_tg"},
        )

        resp = await async_client.patch(
            "/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"location": {"lat": 55.7558, "lon": 37.6173}},
        )

        assert resp.status_code == 200
        loc = resp.json()["location"]
        assert abs(loc["lat"] - 55.7558) < 0.0001
        assert abs(loc["lon"] - 37.6173) < 0.0001
