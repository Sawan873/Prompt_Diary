"""
Admin API endpoints.

Provides admin-only endpoints for platform management:
GET /admin/stats  — Platform-wide statistics (articles, challenges, roadmaps, users)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.core.security import get_current_admin
from app.core.config import settings
from app.core.rate_limit import admin_rate_limiter

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin), Depends(admin_rate_limiter)],
)


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------


class PlatformStats(BaseModel):
    """Breakdown of platform-wide content and user counts."""
    total_articles: int = Field(..., description="Total articles (published + drafts)")
    published_articles: int = Field(..., description="Published articles only")
    draft_articles: int = Field(..., description="Unpublished draft articles")
    total_challenges: int = Field(..., description="Total prompt challenges")
    total_roadmaps: int = Field(..., description="Total learning roadmaps")
    total_users: int = Field(..., description="Total registered users")


class PlatformStatsResponse(BaseModel):
    """Response wrapper for the platform stats endpoint."""
    success: bool = True
    stats: PlatformStats


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_supabase():
    """Get the Supabase client, or None if not configured."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    try:
        from app.core.supabase_client import get_supabase_admin
        return get_supabase_admin()
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/stats", response_model=PlatformStatsResponse)
async def get_platform_stats():
    """
    Get platform-wide statistics (Admin only).

    Returns total counts for articles, challenges, roadmaps, and users.
    Includes both published and unpublished articles, with a separate
    breakdown of published vs. draft counts.
    """
    supabase = _get_supabase()

    if supabase:
        try:
            # Count all articles (published + drafts)
            articles_result = (
                supabase.table("articles")
                .select("id", count="exact")
                .execute()
            )
            # Count published articles separately
            published_result = (
                supabase.table("articles")
                .select("id", count="exact")
                .eq("published", True)
                .execute()
            )
            # Count challenges
            challenges_result = (
                supabase.table("challenges")
                .select("id", count="exact")
                .execute()
            )
            # Count roadmaps
            roadmaps_result = (
                supabase.table("roadmaps")
                .select("id", count="exact")
                .execute()
            )
            # Count users
            users_result = (
                supabase.table("profiles")
                .select("id", count="exact")
                .execute()
            )

            total_articles = articles_result.count or 0
            published_articles = published_result.count or 0

            return PlatformStatsResponse(
                stats=PlatformStats(
                    total_articles=total_articles,
                    published_articles=published_articles,
                    draft_articles=total_articles - published_articles,
                    total_challenges=challenges_result.count or 0,
                    total_roadmaps=roadmaps_result.count or 0,
                    total_users=users_result.count or 0,
                ),
            )
        except Exception as e:
            print(f"[AdminService] Supabase stats query failed, using mock: {e}")

    # Fallback: count mock data from existing services
    from app.services.article_service import get_all_articles
    from app.services.challenge_service import get_all_challenges
    from app.services.roadmap_service import get_all_roadmaps

    articles = get_all_articles()
    challenges = get_all_challenges()
    roadmaps = get_all_roadmaps()

    total_articles = articles.get("total", 0)

    return PlatformStatsResponse(
        stats=PlatformStats(
            total_articles=total_articles,
            published_articles=total_articles,  # Mock articles are all published
            draft_articles=0,
            total_challenges=challenges.get("total", 0),
            total_roadmaps=roadmaps.get("total", 0),
            total_users=0,
        ),
    )
