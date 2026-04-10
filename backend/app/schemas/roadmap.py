"""
Roadmap Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class RoadmapResponse(BaseModel):
    """Response schema for a roadmap."""
    id: UUID
    title: str
    level: Optional[str] = None
    description: Optional[str] = None
    topics: Any = None
    estimated_hours: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    """Response schema for roadmap listing."""
    roadmaps: List[RoadmapResponse]
    total: int
