"""Integration tests for /v1/wishes endpoints."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token
from app.models.block import Block, BlockReason
from app.models.category import Category
from app.models.user import User


async def _create_user_and_token(
    db_session: AsyncSession, email: str, name: str = "Test"
) -> tuple[str, uuid.UUID]:
    """Create an active user directly in DB and return (JWT token, user_id)."""
    user = User(email=email, password_hash="unused", name=name, is_active=True)
    db_session.add(user)
    await db_session.flush()
    return create_access_token(str(user.id)), user.id


async def _create_category(
    db_session: AsyncSession, name: str, slug: str
) -> uuid.UUID:
    """Create a category in DB and return its id."""
    cat = Category(name=name, slug=slug)
    db_session.add(cat)
    await db_session.flush()
    return cat.id


async def _create_wish_via_api(async_client, token: str, payload: dict) -> dict:
    """POST /v1/wishes and return response JSON."""
    resp = await async_client.post(
        "/v1/wishes",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert resp.status_code == 201
    return resp.json()


def _wish_payload(category_id: uuid.UUID, **overrides) -> dict:
    """Build a default wish creation payload."""
    data = {
        "title": "Dinner together",
        "description": "Looking for company",
        "category_id": str(category_id),
        "location": {"lat": 55.7558, "lon": 37.6173},
        "location_name": "Moscow",
        "city": "Moscow",
        "max_participants": 2,
    }
    data.update(overrides)
    return data


class TestCreateWish:
    """POST /v1/wishes"""

    async def test_create_wish(self, async_client, db_session: AsyncSession) -> None:
        """Happy path: creates wish with correct fields and status=active."""
        token, user_id = await _create_user_and_token(db_session, "create@example.com")
        cat_id = await _create_category(db_session, "Food", "food")

        data = await _create_wish_via_api(async_client, token, _wish_payload(cat_id))

        assert data["title"] == "Dinner together"
        assert data["description"] == "Looking for company"
        assert data["category_id"] == str(cat_id)
        assert data["user_id"] == str(user_id)
        assert data["status"] == "active"
        assert data["max_participants"] == 2
        assert abs(data["location"]["lat"] - 55.7558) < 0.0001
        assert abs(data["location"]["lon"] - 37.6173) < 0.0001
        assert "id" in data
        assert "created_at" in data

    async def test_create_wish_unauthorized(self, async_client) -> None:
        """Request without token returns 401."""
        resp = await async_client.post("/v1/wishes", json={"title": "test"})
        assert resp.status_code == 401


class TestUpdateWish:
    """PATCH /v1/wishes/{id}"""

    async def test_update_own_wish(self, async_client, db_session: AsyncSession) -> None:
        """Owner can update title and description."""
        token, _ = await _create_user_and_token(db_session, "update@example.com")
        cat_id = await _create_category(db_session, "Travel", "travel")
        wish = await _create_wish_via_api(async_client, token, _wish_payload(cat_id))

        resp = await async_client.patch(
            f"/v1/wishes/{wish['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"title": "Updated title", "description": "New desc"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Updated title"
        assert data["description"] == "New desc"

    async def test_update_wish_not_owner(self, async_client, db_session: AsyncSession) -> None:
        """Non-owner gets 403."""
        token_owner, _ = await _create_user_and_token(db_session, "owner@example.com")
        token_other, _ = await _create_user_and_token(db_session, "other@example.com")
        cat_id = await _create_category(db_session, "Sport", "sport")
        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))

        resp = await async_client.patch(
            f"/v1/wishes/{wish['id']}",
            headers={"Authorization": f"Bearer {token_other}"},
            json={"title": "Hijacked"},
        )

        assert resp.status_code == 403


class TestDeleteWish:
    """DELETE /v1/wishes/{id}"""

    async def test_delete_own_wish(self, async_client, db_session: AsyncSession) -> None:
        """Owner deletes wish; subsequent GET returns 404."""
        token, _ = await _create_user_and_token(db_session, "delete@example.com")
        cat_id = await _create_category(db_session, "Music", "music")
        wish = await _create_wish_via_api(async_client, token, _wish_payload(cat_id))

        resp = await async_client.delete(
            f"/v1/wishes/{wish['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 204

        resp = await async_client.get(
            f"/v1/wishes/{wish['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404

    async def test_delete_wish_not_owner(self, async_client, db_session: AsyncSession) -> None:
        """Non-owner gets 403."""
        token_owner, _ = await _create_user_and_token(db_session, "del_owner@example.com")
        token_other, _ = await _create_user_and_token(db_session, "del_other@example.com")
        cat_id = await _create_category(db_session, "Art", "art")
        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))

        resp = await async_client.delete(
            f"/v1/wishes/{wish['id']}",
            headers={"Authorization": f"Bearer {token_other}"},
        )

        assert resp.status_code == 403


class TestWishFeed:
    """GET /v1/wishes/feed"""

    async def test_feed_returns_nearby_wishes(
        self, async_client, db_session: AsyncSession
    ) -> None:
        """Nearby wish appears in feed; own wish does not."""
        token_me, me_id = await _create_user_and_token(db_session, "feed_me@example.com")
        token_nearby, _ = await _create_user_and_token(db_session, "feed_near@example.com")
        token_far, _ = await _create_user_and_token(db_session, "feed_far@example.com")
        cat_id = await _create_category(db_session, "Cafe", "cafe")

        # My wish — should NOT appear in my feed
        await _create_wish_via_api(async_client, token_me, _wish_payload(cat_id))
        # Nearby wish (~1 km away)
        nearby = await _create_wish_via_api(
            async_client, token_nearby,
            _wish_payload(cat_id, location={"lat": 55.7600, "lon": 37.6200}, title="Nearby"),
        )
        # Far wish (~900 km away)
        await _create_wish_via_api(
            async_client, token_far,
            _wish_payload(cat_id, location={"lat": 48.8566, "lon": 2.3522}, title="Paris"),
        )

        resp = await async_client.get(
            "/v1/wishes/feed",
            headers={"Authorization": f"Bearer {token_me}"},
            params={"lat": 55.7558, "lon": 37.6173, "radius_km": 50},
        )

        assert resp.status_code == 200
        items = resp.json()["items"]
        titles = [item["title"] for item in items]
        assert "Nearby" in titles
        assert "Paris" not in titles
        # Own wishes excluded from feed
        user_ids = {item["user_id"] for item in items}
        assert str(me_id) not in user_ids

    async def test_feed_filter_by_category(
        self, async_client, db_session: AsyncSession
    ) -> None:
        """Category filter returns only matching wishes."""
        token_me, _ = await _create_user_and_token(db_session, "cat_me@example.com")
        token_other, _ = await _create_user_and_token(db_session, "cat_other@example.com")
        cat_a = await _create_category(db_session, "Drinks", "drinks")
        cat_b = await _create_category(db_session, "Cinema", "cinema")

        await _create_wish_via_api(
            async_client, token_other,
            _wish_payload(cat_a, title="Beer evening"),
        )
        await _create_wish_via_api(
            async_client, token_other,
            _wish_payload(cat_b, title="Movie night"),
        )

        resp = await async_client.get(
            "/v1/wishes/feed",
            headers={"Authorization": f"Bearer {token_me}"},
            params={"lat": 55.7558, "lon": 37.6173, "radius_km": 50, "category_id": str(cat_a)},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert all(item["category_id"] == str(cat_a) for item in data["items"])
        assert any(item["title"] == "Beer evening" for item in data["items"])

    async def test_feed_excludes_blocked_users(
        self, async_client, db_session: AsyncSession
    ) -> None:
        """Wishes from blocked users do not appear in feed."""
        token_me, me_id = await _create_user_and_token(db_session, "block_me@example.com")
        token_blocked, blocked_id = await _create_user_and_token(db_session, "blocked@example.com")
        token_ok, _ = await _create_user_and_token(db_session, "ok@example.com")
        cat_id = await _create_category(db_session, "Hiking", "hiking")

        block = Block(blocker_id=me_id, blocked_id=blocked_id, reason=BlockReason.spam)
        db_session.add(block)
        await db_session.flush()

        await _create_wish_via_api(
            async_client, token_blocked,
            _wish_payload(cat_id, title="Blocked wish"),
        )
        await _create_wish_via_api(
            async_client, token_ok,
            _wish_payload(cat_id, title="Visible wish"),
        )

        resp = await async_client.get(
            "/v1/wishes/feed",
            headers={"Authorization": f"Bearer {token_me}"},
            params={"lat": 55.7558, "lon": 37.6173, "radius_km": 50},
        )

        assert resp.status_code == 200
        titles = [item["title"] for item in resp.json()["items"]]
        assert "Blocked wish" not in titles
        assert "Visible wish" in titles


class TestMyWishes:
    """GET /v1/wishes/my"""

    async def test_my_wishes_returns_own(
        self, async_client, db_session: AsyncSession
    ) -> None:
        """Returns only the authenticated user's wishes."""
        token_me, me_id = await _create_user_and_token(db_session, "my_me@example.com")
        token_other, _ = await _create_user_and_token(db_session, "my_other@example.com")
        cat_id = await _create_category(db_session, "Games", "games")

        await _create_wish_via_api(async_client, token_me, _wish_payload(cat_id, title="My wish"))
        await _create_wish_via_api(async_client, token_other, _wish_payload(cat_id, title="Other wish"))

        resp = await async_client.get(
            "/v1/wishes/my",
            headers={"Authorization": f"Bearer {token_me}"},
        )

        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["title"] == "My wish"
        assert all(item["user_id"] == str(me_id) for item in data["items"])
