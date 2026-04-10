"""
Roadmaps API endpoints.

GET /roadmaps          — List all roadmaps
GET /roadmaps/{id}     — Get a single roadmap by ID
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.roadmap_service import get_all_roadmaps, get_roadmap_by_id

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])


@router.get("")
async def list_roadmaps(
    level: Optional[str] = Query(None, description="Filter by level (beginner, intermediate, advanced)"),
):
    """
    List all learning roadmaps.

    Optional filters:
    - **level**: beginner, intermediate, advanced
    """
    result = get_all_roadmaps(level=level)
    return result


@router.get("/{roadmap_id}")
async def get_roadmap(roadmap_id: str):
    """Get a single roadmap by its ID."""
    roadmap = get_roadmap_by_id(roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap
