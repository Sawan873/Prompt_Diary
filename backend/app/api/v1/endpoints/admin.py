"""
Admin API endpoints.

Provides admin-only endpoints for platform management:
GET /admin/stats  — Platform-wide statistics (articles, challenges, roadmaps, users)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List

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


class AdminUserResponse(BaseModel):
    """Admin-facing user response schema."""
    id: str
    email: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[str] = None


class AdminUserListResponse(BaseModel):
    """Response wrapper for admin user list endpoint."""
    success: bool = True
    users: List[AdminUserResponse]


class UserProgressStats(BaseModel):
    """Aggregate progress metrics for a user."""
    articles_completed: int = Field(..., description="Number of articles read")
    challenges_completed: int = Field(..., description="Number of challenges solved")
    total_points: int = Field(..., description="Total points accumulated")
    level: str = Field(..., description="Calculated user level title")


class AdminUserDetailResponse(BaseModel):
    """Detailed user profile and learning progress response."""
    success: bool = True
    user: AdminUserResponse
    stats: UserProgressStats


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


@router.get("/users", response_model=AdminUserListResponse)
async def list_platform_users(search: Optional[str] = None):
    """
    List all user profiles (Admin only).

    Supports optional search filter matching username, display name, or email.
    """
    supabase = _get_supabase()

    if supabase:
        try:
            # 1. Fetch auth users via Supabase Auth Admin API (if possible)
            # This is necessary because emails are stored in auth.users, not profiles
            auth_users = []
            try:
                users_list = supabase.auth.admin.list_users()
                if hasattr(users_list, "users"):
                    auth_users = users_list.users
                elif isinstance(users_list, list):
                    auth_users = users_list
            except Exception as auth_err:
                print(f"[AdminService] Supabase auth list failed: {auth_err}")

            # Map user ID to email
            email_map = {}
            for u in auth_users:
                try:
                    uid = getattr(u, "id", None) or u.get("id")
                    email = getattr(u, "email", None) or u.get("email")
                    if uid and email:
                        email_map[str(uid)] = email
                except Exception:
                    pass

            # 2. Fetch all profiles from public.profiles
            profiles_query = supabase.table("profiles").select("*")
            profiles_result = profiles_query.execute()
            profiles_list = profiles_result.data or []

            # 3. Merge profiles and auth emails, then apply filter if requested
            users = []
            for p in profiles_list:
                user_id = p.get("id")
                email = email_map.get(str(user_id)) or ""

                if search:
                    search_lower = search.lower()
                    username = (p.get("username") or "").lower()
                    display_name = (p.get("display_name") or "").lower()
                    email_lower = email.lower()
                    if (
                        search_lower not in username
                        and search_lower not in display_name
                        and search_lower not in email_lower
                    ):
                        continue

                users.append(
                    AdminUserResponse(
                        id=str(user_id),
                        email=email,
                        username=p.get("username"),
                        display_name=p.get("display_name"),
                        is_admin=p.get("is_admin", False),
                        created_at=p.get("created_at"),
                    )
                )

            return AdminUserListResponse(users=users)

        except Exception as e:
            print(f"[AdminService] Supabase users query failed, using mock: {e}")

    # Fallback when Supabase is not configured or fails
    mock_users = [
        AdminUserResponse(
            id="mock-user-1111-1111-111111111111",
            email="user@example.com",
            username="regular_user",
            display_name="Regular User",
            is_admin=False,
            created_at="2025-01-15T00:00:00Z",
        ),
        AdminUserResponse(
            id="mock-admin-2222-2222-222222222222",
            email="admin@example.com",
            username="admin_user",
            display_name="Admin User",
            is_admin=True,
            created_at="2025-01-01T00:00:00Z",
        ),
    ]

    if search:
        search_lower = search.lower()
        mock_users = [
            u for u in mock_users
            if search_lower in (u.username or "").lower()
            or search_lower in (u.display_name or "").lower()
            or search_lower in (u.email or "").lower()
        ]

    return AdminUserListResponse(users=mock_users)


def _calculate_level(points: int) -> str:
    """Calculate user level based on total points."""
    if points >= 200:
        return "Expert"
    elif points >= 100:
        return "Advanced"
    elif points >= 50:
        return "Intermediate"
    elif points >= 10:
        return "Beginner"
    return "Newcomer"


@router.get("/users/{user_id}", response_model=AdminUserDetailResponse)
async def get_user_detail(user_id: str):
    """
    Get detailed user profile and their progress (Admin only).
    """
    supabase = _get_supabase()

    if supabase:
        try:
            # 1. Fetch user email via Auth Admin API
            email = ""
            try:
                auth_user = supabase.auth.admin.get_user_by_id(user_id)
                if auth_user and hasattr(auth_user, "user") and auth_user.user:
                    email = auth_user.user.email or ""
                elif isinstance(auth_user, dict) and "user" in auth_user:
                    email = auth_user.get("user", {}).get("email") or ""
            except Exception as auth_err:
                print(f"[AdminService] Supabase auth fetch user failed: {auth_err}")

            # 2. Fetch profile from database
            profile_result = (
                supabase.table("profiles")
                .select("*")
                .eq("id", user_id)
                .single()
                .execute()
            )
            profile = profile_result.data
            if not profile:
                raise HTTPException(status_code=404, detail="User profile not found")

            # 3. Fetch progress aggregates
            article_result = (
                supabase.table("user_progress")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .eq("completed", True)
                .execute()
            )

            challenge_result = (
                supabase.table("challenge_progress")
                .select("score", count="exact")
                .eq("user_id", user_id)
                .eq("completed", True)
                .execute()
            )

            articles_completed = article_result.count or 0
            challenges_count = challenge_result.count or 0
            challenges_data = challenge_result.data or []
            total_points = sum(c.get("score", 0) for c in challenges_data)

            return AdminUserDetailResponse(
                user=AdminUserResponse(
                    id=str(user_id),
                    email=email,
                    username=profile.get("username"),
                    display_name=profile.get("display_name"),
                    is_admin=profile.get("is_admin", False),
                    created_at=profile.get("created_at"),
                ),
                stats=UserProgressStats(
                    articles_completed=articles_completed,
                    challenges_completed=challenges_count,
                    total_points=total_points,
                    level=_calculate_level(total_points),
                )
            )

        except HTTPException as he:
            raise he
        except Exception as e:
            print(f"[AdminService] Supabase user detail failed, using mock: {e}")

    # Fallback when Supabase is not configured or fails
    mock_users = {
        "mock-user-1111-1111-111111111111": {
            "user": AdminUserResponse(
                id="mock-user-1111-1111-111111111111",
                email="user@example.com",
                username="regular_user",
                display_name="Regular User",
                is_admin=False,
                created_at="2025-01-15T00:00:00Z",
            ),
            "stats": UserProgressStats(
                articles_completed=3,
                challenges_completed=2,
                total_points=30,
                level="Beginner",
            ),
        },
        "mock-admin-2222-2222-222222222222": {
            "user": AdminUserResponse(
                id="mock-admin-2222-2222-222222222222",
                email="admin@example.com",
                username="admin_user",
                display_name="Admin User",
                is_admin=True,
                created_at="2025-01-01T00:00:00Z",
            ),
            "stats": UserProgressStats(
                articles_completed=5,
                challenges_completed=4,
                total_points=80,
                level="Intermediate",
            ),
        },
    }

    if user_id in mock_users:
        return AdminUserDetailResponse(
            user=mock_users[user_id]["user"],
            stats=mock_users[user_id]["stats"],
        )

    # Generic mock user fallback
    return AdminUserDetailResponse(
        user=AdminUserResponse(
            id=user_id,
            email="fallback@example.com",
            username="fallback_user",
            display_name="Fallback User",
            is_admin=False,
            created_at="2025-01-01T00:00:00Z",
        ),
        stats=UserProgressStats(
            articles_completed=0,
            challenges_completed=0,
            total_points=0,
            level="Newcomer",
        ),
    )


