"""
Database session management.

Provides async database engine and session for PostgreSQL via asyncpg.
In development mode (no DATABASE_URL), the app runs without a database
using mock data from the API endpoints.
"""

from typing import Optional
from app.core.config import settings

# Database engine and session will be initialized when Supabase is configured
engine = None
async_session = None


async def get_db():
    """
    Dependency that provides a database session.

    In Phase 1, this returns None since we use mock data.
    In Phase 2+, this will provide an async SQLModel session.
    """
    if not settings.DATABASE_URL:
        yield None
        return

    # When database is configured, uncomment and use:
    # from sqlmodel.ext.asyncio.session import AsyncSession
    # from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
    #
    # engine = create_async_engine(settings.DATABASE_URL, echo=True)
    # async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    # async with async_session() as session:
    #     yield session
    yield None
