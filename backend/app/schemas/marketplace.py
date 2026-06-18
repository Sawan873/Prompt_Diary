"""
Marketplace Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Marketplace Prompt schemas
# ---------------------------------------------------------------------------

class MarketplacePromptCreate(BaseModel):
    """Request schema for creating a marketplace prompt."""
    title: str = Field(..., description="Prompt title")
    excerpt: str = Field(..., description="Short description / teaser")
    description: str = Field(..., description="Full description of what the prompt does")
    category: str = Field(..., description="business, code, marketing, data, creative, education, text-generation")
    model: str = Field(..., description="Target AI model (ChatGPT, GPT-4, Universal, etc.)")
    prompt_text: str = Field(..., description="The actual prompt content")
    example_output: Optional[str] = Field(None, description="Sample output for the prompt")
    is_free: bool = Field(True, description="Whether the prompt is free")
    tags: Optional[List[str]] = Field(None, description="Searchable tags")
    published: bool = Field(True, description="Publish immediately")


class MarketplacePromptUpdate(BaseModel):
    """Request schema for updating a marketplace prompt (all fields optional)."""
    title: Optional[str] = None
    excerpt: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    model: Optional[str] = None
    prompt_text: Optional[str] = None
    example_output: Optional[str] = None
    is_free: Optional[bool] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None


class MarketplacePromptResponse(BaseModel):
    """Response schema for a single marketplace prompt."""
    id: UUID
    title: str
    excerpt: str
    description: str
    category: str
    model: str
    author_id: Optional[UUID] = None
    author_name: str
    prompt_text: str
    example_output: Optional[str] = None
    usage_count: int
    is_free: bool
    tags: Optional[List[str]] = None
    published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MarketplacePromptListResponse(BaseModel):
    """Response schema for marketplace prompt listing."""
    prompts: List[MarketplacePromptResponse]
    total: int


# ---------------------------------------------------------------------------
# Marketplace Favorites schemas
# ---------------------------------------------------------------------------

class FavoriteCreate(BaseModel):
    """Request schema for adding a favorite."""
    prompt_id: UUID = Field(..., description="ID of the prompt to favorite")


class FavoriteResponse(BaseModel):
    """Response schema for a favorite entry."""
    id: UUID
    user_id: UUID
    prompt_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class FavoriteWithPromptResponse(BaseModel):
    """Favorite entry with the embedded prompt data."""
    id: UUID
    user_id: UUID
    prompt_id: UUID
    created_at: datetime
    prompt: Optional[MarketplacePromptResponse] = None

    class Config:
        from_attributes = True


class FavoritesListResponse(BaseModel):
    """Response schema for listing a user's favorites."""
    favorites: List[FavoriteWithPromptResponse]
    total: int
