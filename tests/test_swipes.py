"""Integration tests for /v1/swipes and /v1/matches endpoints."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_access_token
from app.models.block import Block, BlockReason
from app.models.category import Category
from app.models.user import User


async def _create_user_and_token(
    db_session: AsyncSession, email: str, name: str = "Test",
) -> tuple[str, uuid.UUID]:
    """Create an active user directly in DB and return (JWT token, user_id)."""
    user = User(email=email, password_hash="unused", name=name, is_active=True)
    db_session.add(user)
    await db_session.flush()
    return create_access_token(str(user.id)), user.id


async def _create_category(
    db_session: AsyncSession, name: str, slug: str,
) -> uuid.UUID:
    """Create a category in DB and return its id."""
    cat = Category(name=name, slug=slug)
    db_session.add(cat)
    await db_session.flush()
    return cat.id


async def _create_wish_via_api(
    async_client, token: str, payload: dict,
) -> dict:
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


async def _swipe_via_api(
    async_client, token: str, wish_id: str, is_like: bool = True,
) -> dict:
    """POST /v1/swipes and return (status_code, response JSON)."""
    resp = await async_client.post(
        "/v1/swipes",
        headers={"Authorization": f"Bearer {token}"},
        json={"wish_id": wish_id, "is_like": is_like},
    )
    return resp


class TestCreateSwipe:
    """POST /v1/swipes"""

    async def test_swipe_like_creates_match(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Like on someone else's wish creates a match immediately."""
        token_owner, _ = await _create_user_and_token(db_session, email="owner@test.com")
        token_liker, liker_id = await _create_user_and_token(db_session, email="liker@test.com")
        cat_id = await _create_category(db_session, name="Food", slug="food")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))

        resp = await _swipe_via_api(async_client, token=token_liker, wish_id=wish["id"])

        assert resp.status_code == 201
        data = resp.json()
        assert data["is_like"] is True
        assert data["match_id"] is not None
        assert data["wish_id"] == wish["id"]
        assert data["user_id"] == str(liker_id)

    async def test_swipe_pass_no_match(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Pass does not create a match."""
        token_owner, _ = await _create_user_and_token(db_session, email="pass_owner@test.com")
        token_passer, _ = await _create_user_and_token(db_session, email="passer@test.com")
        cat_id = await _create_category(db_session, name="Travel", slug="travel")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))

        resp = await _swipe_via_api(async_client, token=token_passer, wish_id=wish["id"], is_like=False)

        assert resp.status_code == 201
        data = resp.json()
        assert data["is_like"] is False
        assert data["match_id"] is None

    async def test_swipe_own_wish_rejected(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Cannot swipe on own wish."""
        token, _ = await _create_user_and_token(db_session, email="self_swipe@test.com")
        cat_id = await _create_category(db_session, name="Sport", slug="sport")

        wish = await _create_wish_via_api(async_client, token, _wish_payload(cat_id))

        resp = await _swipe_via_api(async_client, token=token, wish_id=wish["id"])

        assert resp.status_code == 400
        assert resp.json()["detail"] == "cannot_swipe_own_wish"

    async def test_swipe_duplicate_rejected(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Second swipe on the same wish returns 409."""
        token_owner, _ = await _create_user_and_token(db_session, email="dup_owner@test.com")
        token_swiper, _ = await _create_user_and_token(db_session, email="dup_swiper@test.com")
        cat_id = await _create_category(db_session, name="Music", slug="music")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))

        resp1 = await _swipe_via_api(async_client, token=token_swiper, wish_id=wish["id"])
        assert resp1.status_code == 201

        resp2 = await _swipe_via_api(async_client, token=token_swiper, wish_id=wish["id"])
        assert resp2.status_code == 409
        assert resp2.json()["detail"] == "already_swiped"

    async def test_swipe_nonexistent_wish(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Swipe on a non-existent wish returns 404."""
        token, _ = await _create_user_and_token(db_session, email="noexist@test.com")

        resp = await _swipe_via_api(async_client, token=token, wish_id=str(uuid.uuid4()))

        assert resp.status_code == 404
        assert resp.json()["detail"] == "wish_not_found"

    async def test_swipe_blocked_user_rejected(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Cannot swipe on wish of a user who blocked you."""
        token_owner, owner_id = await _create_user_and_token(db_session, email="blocker@test.com")
        token_blocked, blocked_id = await _create_user_and_token(db_session, email="blocked@test.com")
        cat_id = await _create_category(db_session, name="Art", slug="art")

        block = Block(blocker_id=owner_id, blocked_id=blocked_id, reason=BlockReason.spam)
        db_session.add(block)
        await db_session.flush()

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))

        resp = await _swipe_via_api(async_client, token=token_blocked, wish_id=wish["id"])

        assert resp.status_code == 403
        assert resp.json()["detail"] == "user_blocked"

    async def test_swipe_unauthorized(self, async_client) -> None:
        """Request without token returns 401."""
        resp = await async_client.post(
            "/v1/swipes",
            json={"wish_id": str(uuid.uuid4()), "is_like": True},
        )
        assert resp.status_code == 401

    async def test_wish_closes_at_max_participants(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Wish with max_participants=2 closes after two likes."""
        token_owner, _ = await _create_user_and_token(db_session, email="max_owner@test.com")
        token_a, _ = await _create_user_and_token(db_session, email="max_a@test.com")
        token_b, _ = await _create_user_and_token(db_session, email="max_b@test.com")
        cat_id = await _create_category(db_session, name="Games", slug="games")

        wish = await _create_wish_via_api(
            async_client, token_owner,
            _wish_payload(cat_id, max_participants=2),
        )

        await _swipe_via_api(async_client, token=token_a, wish_id=wish["id"])
        await _swipe_via_api(async_client, token=token_b, wish_id=wish["id"])

        resp = await async_client.get(
            f"/v1/wishes/{wish['id']}",
            headers={"Authorization": f"Bearer {token_owner}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "closed"

    async def test_swipe_closed_wish_rejected(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Cannot like a closed wish."""
        token_owner, _ = await _create_user_and_token(db_session, email="closed_owner@test.com")
        token_a, _ = await _create_user_and_token(db_session, email="closed_a@test.com")
        token_b, _ = await _create_user_and_token(db_session, email="closed_b@test.com")
        token_c, _ = await _create_user_and_token(db_session, email="closed_c@test.com")
        cat_id = await _create_category(db_session, name="Dance", slug="dance")

        wish = await _create_wish_via_api(
            async_client, token_owner,
            _wish_payload(cat_id, max_participants=2),
        )

        await _swipe_via_api(async_client, token=token_a, wish_id=wish["id"])
        await _swipe_via_api(async_client, token=token_b, wish_id=wish["id"])

        resp = await _swipe_via_api(async_client, token=token_c, wish_id=wish["id"])
        assert resp.status_code == 400
        assert resp.json()["detail"] == "wish_not_active"


class TestGetMatches:
    """GET /v1/matches and GET /v1/matches/unseen-count"""

    async def test_list_my_matches(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """User sees matches where they are participant, with correct partner_id."""
        token_owner, owner_id = await _create_user_and_token(db_session, email="match_owner@test.com")
        token_liker, liker_id = await _create_user_and_token(db_session, email="match_liker@test.com")
        cat_id = await _create_category(db_session, name="Cafe", slug="cafe")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))
        await _swipe_via_api(async_client, token=token_liker, wish_id=wish["id"])

        resp_liker = await async_client.get(
            "/v1/matches",
            headers={"Authorization": f"Bearer {token_liker}"},
        )
        assert resp_liker.status_code == 200
        data_liker = resp_liker.json()
        assert data_liker["total"] == 1
        assert data_liker["items"][0]["partner_id"] == str(owner_id)

        resp_owner = await async_client.get(
            "/v1/matches",
            headers={"Authorization": f"Bearer {token_owner}"},
        )
        assert resp_owner.status_code == 200
        data_owner = resp_owner.json()
        assert data_owner["total"] == 1
        assert data_owner["items"][0]["partner_id"] == str(liker_id)

    async def test_matches_empty(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """User with no matches gets empty list."""
        token, _ = await _create_user_and_token(db_session, email="no_matches@test.com")

        resp = await async_client.get(
            "/v1/matches",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0

    async def test_match_filter_by_wish(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Filter matches by wish_id returns only matches for that wish."""
        token_owner, _ = await _create_user_and_token(db_session, email="filter_owner@test.com")
        token_liker, _ = await _create_user_and_token(db_session, email="filter_liker@test.com")
        cat_id = await _create_category(db_session, name="Outdoor", slug="outdoor")

        wish_a = await _create_wish_via_api(
            async_client, token_owner,
            _wish_payload(cat_id, title="Wish A"),
        )
        wish_b = await _create_wish_via_api(
            async_client, token_owner,
            _wish_payload(cat_id, title="Wish B"),
        )

        await _swipe_via_api(async_client, token=token_liker, wish_id=wish_a["id"])
        await _swipe_via_api(async_client, token=token_liker, wish_id=wish_b["id"])

        resp = await async_client.get(
            "/v1/matches",
            headers={"Authorization": f"Bearer {token_liker}"},
            params={"wish_id": wish_a["id"]},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["items"][0]["wish_id"] == wish_a["id"]

    async def test_match_unseen_count(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Unseen count reflects new matches and decreases after mark seen."""
        token_owner, _ = await _create_user_and_token(db_session, email="unseen_owner@test.com")
        token_liker, _ = await _create_user_and_token(db_session, email="unseen_liker@test.com")
        cat_id = await _create_category(db_session, name="Night", slug="night")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))
        swipe_resp = await _swipe_via_api(async_client, token=token_liker, wish_id=wish["id"])
        match_id = swipe_resp.json()["match_id"]

        resp = await async_client.get(
            "/v1/matches/unseen-count",
            headers={"Authorization": f"Bearer {token_owner}"},
        )
        assert resp.status_code == 200
        assert resp.json()["count"] == 1

        await async_client.patch(
            f"/v1/matches/{match_id}/seen",
            headers={"Authorization": f"Bearer {token_owner}"},
        )

        resp = await async_client.get(
            "/v1/matches/unseen-count",
            headers={"Authorization": f"Bearer {token_owner}"},
        )
        assert resp.status_code == 200
        assert resp.json()["count"] == 0


class TestMatchSeen:
    """PATCH /v1/matches/{id}/seen and GET /v1/matches/{id}"""

    async def test_mark_match_seen(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Participant marks match as seen, is_seen becomes True."""
        token_owner, _ = await _create_user_and_token(db_session, email="seen_owner@test.com")
        token_liker, _ = await _create_user_and_token(db_session, email="seen_liker@test.com")
        cat_id = await _create_category(db_session, name="Culture", slug="culture")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))
        swipe_resp = await _swipe_via_api(async_client, token=token_liker, wish_id=wish["id"])
        match_id = swipe_resp.json()["match_id"]

        resp = await async_client.patch(
            f"/v1/matches/{match_id}/seen",
            headers={"Authorization": f"Bearer {token_owner}"},
        )
        assert resp.status_code == 200
        assert resp.json()["is_seen"] is True

    async def test_mark_match_seen_non_participant(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Non-participant cannot mark match as seen."""
        token_owner, _ = await _create_user_and_token(db_session, email="np_owner@test.com")
        token_liker, _ = await _create_user_and_token(db_session, email="np_liker@test.com")
        token_stranger, _ = await _create_user_and_token(db_session, email="np_stranger@test.com")
        cat_id = await _create_category(db_session, name="Edu", slug="edu")

        wish = await _create_wish_via_api(async_client, token_owner, _wish_payload(cat_id))
        swipe_resp = await _swipe_via_api(async_client, token=token_liker, wish_id=wish["id"])
        match_id = swipe_resp.json()["match_id"]

        resp = await async_client.patch(
            f"/v1/matches/{match_id}/seen",
            headers={"Authorization": f"Bearer {token_stranger}"},
        )
        assert resp.status_code == 403
        assert resp.json()["detail"] == "not_participant"

    async def test_get_match_detail(
        self, async_client, db_session: AsyncSession,
    ) -> None:
        """Match detail contains nested wish and correct partner_id."""
        token_owner, owner_id = await _create_user_and_token(db_session, email="detail_owner@test.com")
        token_liker, liker_id = await _create_user_and_token(db_session, email="detail_liker@test.com")
        cat_id = await _create_category(db_session, name="Nightlife", slug="nightlife")

        wish = await _create_wish_via_api(
            async_client, token_owner,
            _wish_payload(cat_id, title="Detail wish"),
        )
        swipe_resp = await _swipe_via_api(async_client, token=token_liker, wish_id=wish["id"])
        match_id = swipe_resp.json()["match_id"]

        resp = await async_client.get(
            f"/v1/matches/{match_id}",
            headers={"Authorization": f"Bearer {token_liker}"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["partner_id"] == str(owner_id)
        assert data["wish"]["id"] == wish["id"]
        assert data["wish"]["title"] == "Detail wish"
        assert data["is_seen"] is False
