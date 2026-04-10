"""
User / Profile ORM model.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field


class Profile(SQLModel, table=True):
    """
    User profile table — extends Supabase auth.users.
    
    In Supabase, user authentication is handled by auth.users.
    This table stores additional profile information.
    """

    __tablename__ = "profiles"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: Optional[str] = Field(default=None, unique=True, index=True)
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
