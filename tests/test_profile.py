"""Integration tests for /v1/users/me profile endpoints."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token
from app.models.user import User


async def _create_user_and_token(db_session: AsyncSession, email: str, name: str = "Test") -> str:
    """Create an active user directly in DB and return a JWT token."""
    user = User(email=email, password_hash="unused", name=name, is_active=True)
    db_session.add(user)
    await db_session.flush()
    return create_access_token(str(user.id))


class TestGetProfile:
    """GET /v1/users/me"""

    async def test_get_profile(self, async_client, db_session: AsyncSession) -> None:
        """Authenticated user gets own profile with correct fields."""
        token = await _create_user_and_token(db_session, "profile@example.com", "Alice")

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
        """Partial update changes sent fields including location, preserves the rest."""
        token = await _create_user_and_token(db_session, "patch@example.com", "Bob")

        resp = await async_client.patch(
            "/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Bobby",
                "bio": "Hello!",
                "telegram": "@bob_tg",
                "location": {"lat": 55.7558, "lon": 37.6173},
            },
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "Bobby"
        assert data["bio"] == "Hello!"
        assert data["telegram"] == "bob_tg"
        assert data["email"] == "patch@example.com"
        loc = data["location"]
        assert abs(loc["lat"] - 55.7558) < 0.0001
        assert abs(loc["lon"] - 37.6173) < 0.0001

    async def test_patch_contact_required(
        self, async_client, db_session: AsyncSession
    ) -> None:
        """Clearing both telegram and instagram returns 400."""
        token = await _create_user_and_token(db_session, "contact@example.com", "Eve")

        resp = await async_client.patch(
            "/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
            json={"telegram": None, "instagram": None},
        )

        assert resp.status_code == 400
        assert "contact_required" in resp.json()["detail"]
