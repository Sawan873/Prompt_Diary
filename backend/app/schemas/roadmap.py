"""
Roadmap Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TopicItem(BaseModel):
    """Detailed topic structure in a learning roadmap path."""
    order: int = Field(..., description="The sequential order number of this topic")
    title: str = Field(..., description="Title of the learning topic")
    description: Optional[str] = Field(None, description="Brief learning objectives or context")
    article_slug: Optional[str] = Field(None, description="Optional link to learning article slug")
    completed: Optional[bool] = Field(False, description="Whether the current user completed this step")


class RoadmapCreate(BaseModel):
    """Request body to create a new learning roadmap path."""
    title: str = Field(..., description="Roadmap title")
    level: str = Field(..., description="Difficulty level (beginner, intermediate, advanced)")
    description: Optional[str] = Field(None, description="Detailed explanation of the pathway")
    topics: List[TopicItem] = Field(..., description="List of ordered modules")
    estimated_hours: Optional[int] = Field(None, description="Total expected hours to complete")


class RoadmapUpdate(BaseModel):
    """Request body to partially update a learning roadmap path."""
    title: Optional[str] = None
    level: Optional[str] = None
    description: Optional[str] = None
    topics: Optional[List[TopicItem]] = None
    estimated_hours: Optional[int] = None


class RoadmapResponse(BaseModel):
    """Response schema for a single learning roadmap."""
    id: UUID
    title: str
    level: Optional[str] = None
    description: Optional[str] = None
    topics: List[TopicItem] = []
    estimated_hours: Optional[int] = None
    created_at: datetime
    
    # Dynamic fields populated for authenticated requests
    progress_percentage: Optional[int] = Field(0, description="User progress percentage (0-100)")
    completed_count: Optional[int] = Field(0, description="Total completed steps in this roadmap")

    class Config:
        from_attributes = True


class RoadmapListResponse(BaseModel):
    """Response schema for listing learning roadmaps."""
    roadmaps: List[RoadmapResponse]
    total: int

