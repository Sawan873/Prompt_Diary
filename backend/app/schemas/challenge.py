"""
Challenge Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChallengeCreate(BaseModel):
    """Request schema for creating a challenge."""
    title: str = Field(..., description="Challenge title")
    description: str = Field(..., description="Challenge description")
    difficulty: str = Field(..., description="easy, medium, hard")
    category: str = Field(..., description="summarization, extraction, reasoning, role-playing, chaining")
    starter_prompt: Optional[str] = Field(None, description="Starter prompt for the user")
    expected_output: Optional[str] = Field(None, description="Expected output reference")
    hints: Optional[List[str]] = Field(None, description="Hints list")
    points: int = Field(..., description="Points awarded for completion")


class ChallengeUpdate(BaseModel):
    """Request schema for updating a challenge."""
    title: Optional[str] = Field(None, description="Challenge title")
    description: Optional[str] = Field(None, description="Challenge description")
    difficulty: Optional[str] = Field(None, description="easy, medium, hard")
    category: Optional[str] = Field(None, description="summarization, extraction, reasoning, role-playing, chaining")
    starter_prompt: Optional[str] = Field(None, description="Starter prompt for the user")
    expected_output: Optional[str] = Field(None, description="Expected output reference")
    hints: Optional[List[str]] = Field(None, description="Hints list")
    points: Optional[int] = Field(None, description="Points awarded for completion")


class ChallengeResponse(BaseModel):
    """Response schema for a challenge."""
    id: UUID
    title: str
    description: str
    difficulty: Optional[str] = None
    category: Optional[str] = None
    starter_prompt: Optional[str] = None
    expected_output: Optional[str] = None
    hints: Optional[List[str]] = None
    points: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChallengeListResponse(BaseModel):
    """Response schema for challenge listing."""
    challenges: List[ChallengeResponse]
    total: int

class ChallengeEvaluateRequest(BaseModel):
    user_prompt: str = Field(..., description="The user's prompt submission")

class ChallengeEvaluateResponse(BaseModel):
    score: int = Field(..., description="Score out of 10")
    feedback: str = Field(..., description="Feedback text")
    improvements: List[str] = Field(default_factory=list, description="Suggested improvements")
