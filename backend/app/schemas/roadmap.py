"""
Roadmap Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RoadmapBase(BaseModel):
    """Base schema for a roadmap."""
    title: str = Field(..., min_length=1)
    level: Optional[str] = None
    description: Optional[str] = None
    topics: Any = None
    estimated_hours: Optional[int] = None


class RoadmapCreate(RoadmapBase):
    """Request schema for creating a roadmap."""
    pass


class RoadmapUpdate(BaseModel):
    """Request schema for updating a roadmap."""
    title: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    topics: Any = None
    estimated_hours: Optional[int] = None


class RoadmapResponse(RoadmapBase):
    """Response schema for a roadmap."""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    """Response schema for roadmap listing."""
    roadmaps: List[RoadmapResponse]
    total: int
