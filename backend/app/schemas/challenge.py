"""
Challenge Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChallengeResponse(BaseModel):
    """Response schema for a challenge."""
    id: UUID
    title: str
    description: str
    difficulty: Optional[str] = None
    category: Optional[str] = None
    starter_prompt: Optional[str] = None
    hints: Optional[List[str]] = None
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChallengeListResponse(BaseModel):
    """Response schema for challenge listing."""
    challenges: List[ChallengeResponse]
    total: int
