"""Integration tests for /v1/auth endpoints — real DB, mock only SMTP transport."""

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, patch

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_confirmation import EmailConfirmation
from app.models.user import User


class TestRegister:
    """POST /v1/auth/register"""

    @patch("aiosmtplib.send", new_callable=AsyncMock)
    async def test_success(self, mock_send, async_client, db_session: AsyncSession) -> None:
        """Register creates inactive user and sends confirmation email."""
        resp = await async_client.post(
            "/v1/auth/register",
            json={"email": "alice@example.com", "password": "securepass1", "name": "Alice"},
        )

        assert resp.status_code == 201
        assert "message" in resp.json()

        result = await db_session.execute(select(User).where(User.email == "alice@example.com"))
        user = result.scalar_one()
        assert user.is_active is False
        assert user.name == "Alice"
        mock_send.assert_called_once()

    @patch("aiosmtplib.send", new_callable=AsyncMock)
    async def test_duplicate_email(self, mock_send, async_client) -> None:
        """Second registration with same email returns 409."""
        payload = {"email": "dup@example.com", "password": "securepass1", "name": "Bob"}
        await async_client.post("/v1/auth/register", json=payload)

        resp = await async_client.post(
            "/v1/auth/register",
            json={"email": "dup@example.com", "password": "securepass2", "name": "Bob2"},
        )

        assert resp.status_code == 409
        assert "already registered" in resp.json()["detail"].lower()

    async def test_short_password(self, async_client) -> None:
        """Password shorter than 8 chars returns 422."""
        resp = await async_client.post(
            "/v1/auth/register",
            json={"email": "short@example.com", "password": "short", "name": "Eve"},
        )
        assert resp.status_code == 422

    async def test_invalid_email(self, async_client) -> None:
        """Invalid email format returns 422."""
        resp = await async_client.post(
            "/v1/auth/register",
            json={"email": "not-an-email", "password": "securepass1", "name": "Eve"},
        )
        assert resp.status_code == 422

    @patch("aiosmtplib.send", new_callable=AsyncMock, side_effect=Exception("Connection refused"))
    async def test_smtp_failure(self, mock_send, async_client) -> None:
        """SMTP failure returns 500."""
        resp = await async_client.post(
            "/v1/auth/register",
            json={"email": "fail@example.com", "password": "securepass1", "name": "Fail"},
        )
        assert resp.status_code == 500


class TestConfirmEmail:
    """GET /v1/auth/confirm-email"""

    @patch("aiosmtplib.send", new_callable=AsyncMock)
    async def test_success(self, mock_send, async_client, db_session: AsyncSession) -> None:
        """Valid token activates user."""
        await async_client.post(
            "/v1/auth/register",
            json={"email": "confirm@example.com", "password": "securepass1", "name": "Charlie"},
        )

        result = await db_session.execute(
            select(EmailConfirmation).join(User).where(User.email == "confirm@example.com")
        )
        confirmation = result.scalar_one()

        resp = await async_client.get(
            "/v1/auth/confirm-email", params={"token": confirmation.token}
        )

        assert resp.status_code == 200
        assert "confirmed" in resp.json()["message"].lower()

        result = await db_session.execute(select(User).where(User.email == "confirm@example.com"))
        user = result.scalar_one()
        assert user.is_active is True

    async def test_invalid_token(self, async_client) -> None:
        """Non-existent token returns 400."""
        resp = await async_client.get(
            "/v1/auth/confirm-email", params={"token": "nonexistent-token"}
        )
        assert resp.status_code == 400
        assert "invalid" in resp.json()["detail"].lower()

    @patch("aiosmtplib.send", new_callable=AsyncMock)
    async def test_expired_token(self, mock_send, async_client, db_session: AsyncSession) -> None:
        """Expired token returns 400."""
        await async_client.post(
            "/v1/auth/register",
            json={"email": "expired@example.com", "password": "securepass1", "name": "Dave"},
        )

        result = await db_session.execute(
            select(EmailConfirmation).join(User).where(User.email == "expired@example.com")
        )
        confirmation = result.scalar_one()
        confirmation.expires_at = datetime.now(UTC) - timedelta(hours=1)
        await db_session.flush()

        resp = await async_client.get(
            "/v1/auth/confirm-email", params={"token": confirmation.token}
        )

        assert resp.status_code == 400
        assert "expired" in resp.json()["detail"].lower()


class TestLogin:
    """POST /v1/auth/login"""

    async def _register_and_confirm(
        self,
        async_client,
        db_session: AsyncSession,
        email: str,
        password: str,
        name: str,
    ) -> None:
        """Register and confirm a user."""
        with patch("aiosmtplib.send", new_callable=AsyncMock):
            await async_client.post(
                "/v1/auth/register",
                json={"email": email, "password": password, "name": name},
            )
        result = await db_session.execute(
            select(EmailConfirmation).join(User).where(User.email == email)
        )
        confirmation = result.scalar_one()
        await async_client.get("/v1/auth/confirm-email", params={"token": confirmation.token})

    async def test_success(self, async_client, db_session: AsyncSession) -> None:
        """Confirmed user can login and receive JWT."""
        await self._register_and_confirm(
            async_client, db_session, "login@example.com", "securepass1", "Frank"
        )

        resp = await async_client.post(
            "/v1/auth/login",
            json={"email": "login@example.com", "password": "securepass1"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_wrong_password(self, async_client, db_session: AsyncSession) -> None:
        """Wrong password returns 401."""
        await self._register_and_confirm(
            async_client, db_session, "wrong@example.com", "securepass1", "Grace"
        )

        resp = await async_client.post(
            "/v1/auth/login",
            json={"email": "wrong@example.com", "password": "wrongpassword1"},
        )

        assert resp.status_code == 401
        assert "invalid" in resp.json()["detail"].lower()

    @patch("aiosmtplib.send", new_callable=AsyncMock)
    async def test_unconfirmed_email(self, mock_send, async_client) -> None:
        """Login without email confirmation returns 401."""
        await async_client.post(
            "/v1/auth/register",
            json={"email": "unconfirmed@example.com", "password": "securepass1", "name": "Hank"},
        )

        resp = await async_client.post(
            "/v1/auth/login",
            json={"email": "unconfirmed@example.com", "password": "securepass1"},
        )

        assert resp.status_code == 401
        assert "not confirmed" in resp.json()["detail"].lower()
