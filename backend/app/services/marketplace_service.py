"""
Marketplace service — business logic for marketplace operations.

Queries Supabase for marketplace_prompts and marketplace_favorites tables.
All writes go through the admin client (service_role) so RLS doesn't block
server-side mutations; reads use the admin client too for simplicity.
"""

from typing import Optional
from app.core.config import settings
from app.schemas.marketplace import MarketplacePromptCreate, MarketplacePromptUpdate


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_supabase():
    """Return the Supabase admin client, or None if not configured."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    try:
        from app.core.supabase_client import get_supabase_admin
        return get_supabase_admin()
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Marketplace Prompts
# ---------------------------------------------------------------------------

def get_all_marketplace_prompts(
    category: Optional[str] = None,
    model: Optional[str] = None,
    is_free: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = "usage_count",
    limit: int = 50,
    offset: int = 0,
) -> dict:
    """
    Return published marketplace prompts with optional filters/search.

    sort_by accepted values: usage_count (default), created_at, title
    """
    supabase = _get_supabase()
    if not supabase:
        return {"prompts": [], "total": 0}

    try:
        query = supabase.table("marketplace_prompts").select("*").eq("published", True)

        if category:
            query = query.eq("category", category)
        if model:
            query = query.eq("model", model)
        if is_free is not None:
            query = query.eq("is_free", is_free)

        # Full-text search on title + excerpt (simple ilike fallback)
        if search:
            query = query.or_(f"title.ilike.%{search}%,excerpt.ilike.%{search}%")

        # Sorting
        valid_sort = {"usage_count", "created_at", "title"}
        if sort_by not in valid_sort:
            sort_by = "usage_count"
        desc = sort_by in {"usage_count", "created_at"}
        query = query.order(sort_by, desc=desc)

        # Pagination
        query = query.range(offset, offset + limit - 1)

        result = query.execute()
        data = result.data or []
        return {"prompts": data, "total": len(data)}

    except Exception as e:
        print(f"[MarketplaceService] get_all_marketplace_prompts failed: {e}")
        return {"prompts": [], "total": 0}


def get_marketplace_prompt_by_id(prompt_id: str) -> Optional[dict]:
    """Return a single marketplace prompt by its UUID."""
    supabase = _get_supabase()
    if not supabase:
        return None
    try:
        result = (
            supabase.table("marketplace_prompts")
            .select("*")
            .eq("id", prompt_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"[MarketplaceService] get_marketplace_prompt_by_id failed: {e}")
        return None


def create_marketplace_prompt(data: MarketplacePromptCreate, author_id: str) -> Optional[dict]:
    """
    Insert a new marketplace prompt.
    author_id is taken from the verified JWT — not from the request body.
    """
    supabase = _get_supabase()
    if not supabase:
        raise RuntimeError("Supabase is not configured")

    payload = data.model_dump()
    payload["author_id"] = author_id

    result = supabase.table("marketplace_prompts").insert(payload).execute()
    if result.data:
        return result.data[0]
    raise RuntimeError("Insert returned no data")


def update_marketplace_prompt(
    prompt_id: str, data: MarketplacePromptUpdate, author_id: str
) -> Optional[dict]:
    """
    Update a marketplace prompt.
    Only the owning author (or admin) should call this endpoint;
    the RLS policy enforces ownership at the DB level as well.
    """
    supabase = _get_supabase()
    if not supabase:
        return None

    # Drop None values — only send changed fields
    payload = {k: v for k, v in data.model_dump().items() if v is not None}
    if not payload:
        # Nothing to update — just return the existing record
        return get_marketplace_prompt_by_id(prompt_id)

    try:
        result = (
            supabase.table("marketplace_prompts")
            .update(payload)
            .eq("id", prompt_id)
            .eq("author_id", author_id)   # ownership guard
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"[MarketplaceService] update_marketplace_prompt failed: {e}")
        return None


def delete_marketplace_prompt(prompt_id: str, author_id: str) -> bool:
    """Delete a marketplace prompt. Only the owner can delete."""
    supabase = _get_supabase()
    if not supabase:
        return False

    try:
        result = (
            supabase.table("marketplace_prompts")
            .delete()
            .eq("id", prompt_id)
            .eq("author_id", author_id)
            .execute()
        )
        return bool(result.data)
    except Exception as e:
        print(f"[MarketplaceService] delete_marketplace_prompt failed: {e}")
        return False


def increment_usage_count(prompt_id: str) -> None:
    """
    Bump usage_count by 1. Fire-and-forget; failure is logged, not raised.
    Call this whenever a user copies / uses a prompt.
    """
    supabase = _get_supabase()
    if not supabase:
        return
    try:
        supabase.rpc("increment_marketplace_usage", {"prompt_id": prompt_id}).execute()
    except Exception:
        # Fallback: fetch + update if RPC not available
        try:
            existing = get_marketplace_prompt_by_id(prompt_id)
            if existing:
                new_count = (existing.get("usage_count") or 0) + 1
                supabase.table("marketplace_prompts").update(
                    {"usage_count": new_count}
                ).eq("id", prompt_id).execute()
        except Exception as inner_e:
            print(f"[MarketplaceService] increment_usage_count failed: {inner_e}")


# ---------------------------------------------------------------------------
# Marketplace Favorites
# ---------------------------------------------------------------------------

def get_user_favorites(user_id: str) -> dict:
    """Return all favorites for a user, with prompt data embedded."""
    supabase = _get_supabase()
    if not supabase:
        return {"favorites": [], "total": 0}

    try:
        result = (
            supabase.table("marketplace_favorites")
            .select("*, prompt:marketplace_prompts(*)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        data = result.data or []
        return {"favorites": data, "total": len(data)}
    except Exception as e:
        print(f"[MarketplaceService] get_user_favorites failed: {e}")
        return {"favorites": [], "total": 0}


def add_favorite(user_id: str, prompt_id: str) -> Optional[dict]:
    """Add a prompt to the user's favorites. Silently handles duplicates."""
    supabase = _get_supabase()
    if not supabase:
        raise RuntimeError("Supabase is not configured")

    try:
        result = (
            supabase.table("marketplace_favorites")
            .insert({"user_id": user_id, "prompt_id": prompt_id})
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        # Unique constraint violation → already favorited
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            raise ValueError("Prompt is already in favorites")
        print(f"[MarketplaceService] add_favorite failed: {e}")
        raise


def remove_favorite(user_id: str, prompt_id: str) -> bool:
    """Remove a prompt from the user's favorites."""
    supabase = _get_supabase()
    if not supabase:
        return False

    try:
        result = (
            supabase.table("marketplace_favorites")
            .delete()
            .eq("user_id", user_id)
            .eq("prompt_id", prompt_id)
            .execute()
        )
        return bool(result.data)
    except Exception as e:
        print(f"[MarketplaceService] remove_favorite failed: {e}")
        return False


def is_favorited(user_id: str, prompt_id: str) -> bool:
    """Check whether a user has already favorited a specific prompt."""
    supabase = _get_supabase()
    if not supabase:
        return False

    try:
        result = (
            supabase.table("marketplace_favorites")
            .select("id")
            .eq("user_id", user_id)
            .eq("prompt_id", prompt_id)
            .execute()
        )
        return bool(result.data)
    except Exception:
        return False
