"""
Roadmaps API endpoints.

GET    /roadmaps               — List all roadmaps (optionally personalized)
GET    /roadmaps/{id}          — Get a single roadmap by ID (optionally personalized)
POST   /roadmaps               — Create a new learning roadmap (admin)
PUT    /roadmaps/{roadmap_id}  — Update a learning roadmap (admin)
DELETE /roadmaps/{roadmap_id}  — Delete a learning roadmap (admin)
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional

from app.services.roadmap_service import (
    get_all_roadmaps, 
    get_roadmap_by_id, 
    create_roadmap, 
    update_roadmap, 
    delete_roadmap
)
from app.schemas.roadmap import (
    RoadmapResponse, 
    RoadmapListResponse, 
    RoadmapCreate, 
    RoadmapUpdate
)
from app.core.security import get_optional_user

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])


@router.get("", response_model=RoadmapListResponse)
async def list_roadmaps(
    level: Optional[str] = Query(None, description="Filter by level (beginner, intermediate, advanced)"),
    user: Optional[dict] = Depends(get_optional_user),
):
    """
    List all learning roadmaps. If authenticated, injects user completion status.

    Optional filters:
    - **level**: beginner, intermediate, advanced
    """
    user_id = user.get("sub") if user else None
    result = get_all_roadmaps(level=level, user_id=user_id)
    return result


@router.get("/{roadmap_id}", response_model=RoadmapResponse)
async def get_roadmap(
    roadmap_id: str,
    user: Optional[dict] = Depends(get_optional_user),
):
    """Get a single roadmap by its ID. If authenticated, injects user completion status."""
    user_id = user.get("sub") if user else None
    roadmap = get_roadmap_by_id(roadmap_id, user_id=user_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.post("", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
async def create_new_roadmap(roadmap_data: RoadmapCreate):
    """Create a new learning roadmap (Admin CMS utility)."""
    try:
        return create_roadmap(roadmap_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{roadmap_id}", response_model=RoadmapResponse)
async def update_existing_roadmap(roadmap_id: str, roadmap_data: RoadmapUpdate):
    """Update a learning roadmap's metadata or topics list."""
    roadmap = update_roadmap(roadmap_id, roadmap_data)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found or update failed")
    return roadmap


@router.delete("/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_roadmap(roadmap_id: str):
    """Delete a learning roadmap path by ID."""
    success = delete_roadmap(roadmap_id)
    if not success:
        raise HTTPException(status_code=404, detail="Roadmap not found or deletion failed")
    return None

