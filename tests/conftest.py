"""Shared test fixtures — real async PostgreSQL, mock only external services."""

import asyncio
import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

# Ensure all models are registered in Base.metadata
import app.models  # noqa: F401
from app.database import Base, get_db

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/wishmatch_test",
)

# URL to connect to the default 'postgres' DB for admin operations
_ADMIN_DATABASE_URL = TEST_DATABASE_URL.rsplit("/", 1)[0] + "/postgres"


@pytest.fixture(scope="session", autouse=True)
def _create_test_db():
    """Create test database, PostGIS extension, and all tables once per session."""

    async def _setup() -> None:
        """Create wishmatch_test DB if it does not exist, then create tables."""
        admin_engine = create_async_engine(_ADMIN_DATABASE_URL, isolation_level="AUTOCOMMIT")
        async with admin_engine.connect() as conn:
            row = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'wishmatch_test'")
            )
            if row.scalar() is None:
                await conn.execute(text("CREATE DATABASE wishmatch_test"))
        await admin_engine.dispose()

        engine = create_async_engine(TEST_DATABASE_URL, echo=False)
        async with engine.begin() as conn:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
        await engine.dispose()

    async def _teardown() -> None:
        """Drop all tables after the test session."""
        engine = create_async_engine(TEST_DATABASE_URL, echo=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)
        await engine.dispose()

    asyncio.run(_setup())
    yield
    asyncio.run(_teardown())


@pytest_asyncio.fixture()
async def db_session():
    """Yield a session inside a transaction that is rolled back after the test."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.connect() as conn:
        trans = await conn.begin()
        session = AsyncSession(
            bind=conn,
            join_transaction_mode="create_savepoint",
            expire_on_commit=False,
        )
        yield session
        await session.close()
        await trans.rollback()
    await engine.dispose()


@pytest_asyncio.fixture()
async def async_client(db_session):
    """Yield async HTTP client with real DB session and mocked email."""
    from app.main import app as fastapi_app

    async def _override_get_db():
        """Return the test db_session instead of creating a new one."""
        yield db_session

    fastapi_app.dependency_overrides[get_db] = _override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=fastapi_app),
        base_url="http://test",
    ) as client:
        yield client

    fastapi_app.dependency_overrides.clear()
