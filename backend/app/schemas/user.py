"""
User / Auth Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    """Request Schema for user registration."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    username: Optional[str] = Field(None, description="Optional username")
    display_name: Optional[str] = Field(None, description="Display name")


class UserLogin(BaseModel):
    """Request schema for user login."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """Response schema for user profile."""
    id: UUID
    email: str
    username: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response schema for authentication token."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True
