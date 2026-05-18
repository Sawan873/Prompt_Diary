"""
Articles API endpoints.

GET /articles             — List all articles (with optional filters)
GET /articles/system-design — List architecture articles
GET /articles/slug/{slug} — Get a single article by URL slug (MUST be before /{article_id})
GET /articles/{id}        — Get a single article by ID
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.article_service import (
    get_all_articles, 
    get_article_by_id, 
    get_article_by_slug, 
    create_article, 
    create_article_from_mdx
)
from app.schemas.article import (
    ArticleCreate, 
    ArticleCreateMDX, 
    MDXValidationResponse, 
    ArticleResponse
)
from app.services.mdx_service import parse_mdx_article

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("")
async def list_articles(
    category: Optional[str] = Query(None, description="Filter by category (fundamentals, techniques, architecture)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (beginner, intermediate, advanced)"),
):
    """
    List all published articles.

    Optional filters:
    - **category**: fundamentals, techniques, architecture
    - **difficulty**: beginner, intermediate, advanced
    """
    result = get_all_articles(category=category, difficulty=difficulty)
    return result


@router.get("/system-design")
async def list_system_design_articles():
    """List architecture-focused articles for the System Design module."""
    return get_all_articles(category="architecture")


# IMPORTANT: This route MUST be registered before /{article_id} so FastAPI
# doesn't interpret "slug" as an article ID.
@router.get("/slug/{slug}")
async def get_article_by_slug_endpoint(slug: str):
    """Get a single article by its URL slug."""
    article = get_article_by_slug(slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.get("/{article_id}")
async def get_article(article_id: str):
    """Get a single article by its ID."""
    article = get_article_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("", response_model=ArticleResponse, status_code=201)
async def create_new_article(article_data: ArticleCreate):
    """Create a new article draft using structured fields."""
    try:
        return create_article(article_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate-mdx", response_model=MDXValidationResponse)
async def validate_mdx_content_endpoint(payload: ArticleCreateMDX):
    """
    Performs a dry-run parse on a raw MDX string with frontmatter.
    Returns parsed metadata, body, and any syntax/structural warnings.
    """
    try:
        return parse_mdx_article(payload.raw_mdx)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parsing failed: {str(e)}")


@router.post("/import-mdx", response_model=ArticleResponse, status_code=201)
async def import_article_from_mdx(payload: ArticleCreateMDX):
    """
    Imports and creates an article directly from a raw MDX string with frontmatter.
    Validates syntax and metadata before saving.
    """
    try:
        return create_article_from_mdx(payload.raw_mdx)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

