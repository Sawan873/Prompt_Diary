"""
Marketplace API endpoints.

Public (no auth required):
  GET  /marketplace                   — List published prompts (filterable)
  GET  /marketplace/{id}              — Get a single prompt
  POST /marketplace/{id}/use          — Increment usage count (fire-and-forget)

Authenticated (any logged-in user):
  POST   /marketplace                 — Publish a new prompt
  PUT    /marketplace/{id}            — Update own prompt
  DELETE /marketplace/{id}            — Delete own prompt
  GET    /marketplace/favorites       — Get current user's favorites
  POST   /marketplace/favorites       — Add a prompt to favorites
  DELETE /marketplace/favorites/{id}  — Remove a prompt from favorites
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional

from app.services.marketplace_service import (
    get_all_marketplace_prompts,
    get_marketplace_prompt_by_id,
    create_marketplace_prompt,
    update_marketplace_prompt,
    delete_marketplace_prompt,
    increment_usage_count,
    get_user_favorites,
    add_favorite,
    remove_favorite,
)
from app.schemas.marketplace import (
    MarketplacePromptCreate,
    MarketplacePromptUpdate,
    MarketplacePromptResponse,
    MarketplacePromptListResponse,
    FavoriteCreate,
    FavoriteResponse,
    FavoritesListResponse,
)
from app.core.security import get_current_user

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=MarketplacePromptListResponse)
async def list_marketplace_prompts(
    category: Optional[str] = Query(None, description="Filter by category (business, code, marketing, data, creative, education, text-generation)"),
    model: Optional[str] = Query(None, description="Filter by AI model (ChatGPT, GPT-4, Universal, ...)"),
    is_free: Optional[bool] = Query(None, description="Filter by price (true = free only)"),
    search: Optional[str] = Query(None, description="Full-text search on title and excerpt"),
    sort_by: str = Query("usage_count", description="Sort field: usage_count | created_at | title"),
    limit: int = Query(50, ge=1, le=100, description="Page size"),
    offset: int = Query(0, ge=0, description="Page offset"),
):
    """
    List published marketplace prompts.

    Optional filters:
    - **category**: business, code, marketing, data, creative, education, text-generation
    - **model**: ChatGPT, GPT-4, Universal, Claude, Gemini, …
    - **is_free**: true / false
    - **search**: keyword search on title + excerpt
    - **sort_by**: usage_count (default), created_at, title
    """
    return get_all_marketplace_prompts(
        category=category,
        model=model,
        is_free=is_free,
        search=search,
        sort_by=sort_by,
        limit=limit,
        offset=offset,
    )


@router.get("/favorites", response_model=FavoritesListResponse)
async def list_my_favorites(
    current_user: dict = Depends(get_current_user),
):
    """
    Get the current user's saved favorite prompts.
    Returns each favorite with the full prompt data embedded.
    """
    user_id = current_user["sub"]
    return get_user_favorites(user_id)


@router.get("/{prompt_id}", response_model=MarketplacePromptResponse)
async def get_marketplace_prompt(prompt_id: str):
    """Get a single published marketplace prompt by its UUID."""
    prompt = get_marketplace_prompt_by_id(prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


# ---------------------------------------------------------------------------
# Usage tracking
# ---------------------------------------------------------------------------

@router.post("/{prompt_id}/use", status_code=status.HTTP_204_NO_CONTENT)
async def use_prompt(prompt_id: str):
    """
    Record that a user copied / used a prompt.
    Increments the usage_count counter. No auth required — fire-and-forget.
    """
    increment_usage_count(prompt_id)
    return None


# ---------------------------------------------------------------------------
# Authenticated — prompt CRUD
# ---------------------------------------------------------------------------

@router.post("", response_model=MarketplacePromptResponse, status_code=status.HTTP_201_CREATED)
async def publish_prompt(
    data: MarketplacePromptCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Publish a new prompt to the marketplace.
    The author_id is taken from the authenticated user's JWT (not the request body).
    """
    author_id = current_user["sub"]
    try:
        result = create_marketplace_prompt(data, author_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{prompt_id}", response_model=MarketplacePromptResponse)
async def edit_prompt(
    prompt_id: str,
    data: MarketplacePromptUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update an existing marketplace prompt.
    Only the original author can update their own prompt.
    """
    author_id = current_user["sub"]
    updated = update_marketplace_prompt(prompt_id, data, author_id)
    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found or you do not have permission to edit it",
        )
    return updated


@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_prompt(
    prompt_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a marketplace prompt.
    Only the original author can delete their own prompt.
    """
    author_id = current_user["sub"]
    success = delete_marketplace_prompt(prompt_id, author_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Prompt not found or you do not have permission to delete it",
        )
    return None


# ---------------------------------------------------------------------------
# Authenticated — favorites
# ---------------------------------------------------------------------------

@router.post("/favorites", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def save_favorite(
    data: FavoriteCreate,
    current_user: dict = Depends(get_current_user),
):
    """Add a marketplace prompt to the current user's favorites."""
    user_id = current_user["sub"]
    try:
        result = add_favorite(user_id, str(data.prompt_id))
        if not result:
            raise HTTPException(status_code=400, detail="Could not save favorite")
        return result
    except ValueError as e:
        # Already favorited
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/favorites/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_favorite(
    prompt_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Remove a marketplace prompt from the current user's favorites."""
    user_id = current_user["sub"]
    success = remove_favorite(user_id, prompt_id)
    if not success:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return None
