"""
Articles API endpoints.

GET /articles             — List all articles (with optional filters)
GET /articles/system-design — List architecture articles
GET /articles/slug/{slug} — Get a single article by URL slug (MUST be before /{article_id})
GET /articles/{id}        — Get a single article by ID
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional

from app.services.article_service import (
    get_all_articles, 
    get_article_by_id, 
    get_article_by_slug, 
    create_article, 
    create_article_from_mdx,
    update_article,
    delete_article
)
from app.schemas.article import (
    ArticleCreate, 
    ArticleUpdate,
    ArticleCreateMDX, 
    MDXValidationResponse, 
    ArticleResponse
)
from app.services.mdx_service import parse_mdx_article
from app.core.security import get_current_admin
from app.core.rate_limit import admin_rate_limiter

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


@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_new_article(
    article_data: ArticleCreate,
    current_admin: dict = Depends(get_current_admin),
    _: str = Depends(admin_rate_limiter),
):
    """Create a new article draft using structured fields (Admin only)."""
    try:
        # Pass the admin user ID as author_id
        author_id = current_admin.get("sub")
        return create_article(article_data, author_id=author_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/validate-mdx", response_model=MDXValidationResponse)
async def validate_mdx_content_endpoint(
    payload: ArticleCreateMDX,
    current_admin: dict = Depends(get_current_admin),
    _: str = Depends(admin_rate_limiter),
):
    """
    Performs a dry-run parse on a raw MDX string with frontmatter (Admin only).
    Returns parsed metadata, body, and any syntax/structural warnings.
    """
    try:
        return parse_mdx_article(payload.raw_mdx)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Parsing failed: {str(e)}")


@router.post("/import-mdx", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def import_article_from_mdx(
    payload: ArticleCreateMDX,
    current_admin: dict = Depends(get_current_admin),
    _: str = Depends(admin_rate_limiter),
):
    """
    Imports and creates an article directly from a raw MDX string with frontmatter (Admin only).
    Validates syntax and metadata before saving.
    """
    try:
        author_id = current_admin.get("sub")
        return create_article_from_mdx(payload.raw_mdx, author_id=author_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{article_id}", response_model=ArticleResponse)
async def update_existing_article(
    article_id: str,
    article_data: ArticleUpdate,
    current_admin: dict = Depends(get_current_admin),
    _: str = Depends(admin_rate_limiter),
):
    """Update an article's metadata or content (Admin only)."""
    article = update_article(article_id, article_data)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found or update failed")
    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_article(
    article_id: str,
    current_admin: dict = Depends(get_current_admin),
    _: str = Depends(admin_rate_limiter),
):
    """Delete an article by ID (Admin only)."""
    success = delete_article(article_id)
    if not success:
        raise HTTPException(status_code=404, detail="Article not found or deletion failed")
    return None


from pydantic import BaseModel
from app.services.rag_service import query_rag_pipeline
from app.services.recommendation_service import get_related_articles, get_recommended_templates_for_article

class ArticleQARequest(BaseModel):
    query: str

@router.post("/qa")
async def ask_article_rag(payload: ArticleQARequest):
    """
    Query the RAG pipeline with user's question, retrieving context from articles.
    """
    try:
        return await query_rag_pipeline(payload.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/slug/{slug}/recommendations")
async def get_article_recommendations(slug: str):
    """
    Retrieve related articles and prompt templates for a given article slug.
    """
    try:
        related = get_related_articles(slug)
        templates = get_recommended_templates_for_article(slug)
        return {
            "related_articles": related,
            "recommended_templates": templates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


