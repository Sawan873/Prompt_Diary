"""
Article Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    """Request schema for creating an article."""
    title: str = Field(..., description="Article title")
    content: str = Field(..., description="Article content (Markdown)")
    excerpt: Optional[str] = Field(None, description="Short excerpt")
    category: str = Field(..., description="Article category")
    difficulty: Optional[str] = Field(None, description="beginner/intermediate/advanced")
    tags: Optional[List[str]] = Field(None, description="Tags list")


class ArticleUpdate(BaseModel):
    """Request schema for updating an article."""
    title: Optional[str] = Field(None, description="Article title")
    content: Optional[str] = Field(None, description="Article content (Markdown)")
    excerpt: Optional[str] = Field(None, description="Short excerpt")
    category: Optional[str] = Field(None, description="Article category")
    difficulty: Optional[str] = Field(None, description="beginner/intermediate/advanced")
    tags: Optional[List[str]] = Field(None, description="Tags list")
    published: Optional[bool] = Field(None, description="Whether the article is published")


class ArticleResponse(BaseModel):
    """Response schema for an article."""
    id: UUID
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    category: str
    difficulty: Optional[str] = None
    author_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArticleListItem(BaseModel):
    """Compact article schema for listing."""
    id: UUID
    title: str
    slug: str
    excerpt: Optional[str] = None
    category: str
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    """Response schema for article listing."""
    articles: List[ArticleListItem]
    total: int


class ArticleCreateMDX(BaseModel):
    """Request schema for creating an article using raw MDX text with frontmatter."""
    raw_mdx: str = Field(..., description="Complete MDX text with YAML frontmatter")


class MDXValidationResponse(BaseModel):
    """Response schema representing MDX parser dry-run/validation output."""
    title: str
    slug: str
    category: str
    difficulty: str
    tags: List[str]
    excerpt: str
    content: str
    published: bool
    is_valid: bool
    errors: List[str]

