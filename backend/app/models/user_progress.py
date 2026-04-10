"""
User Progress ORM model.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field


class UserProgress(SQLModel, table=True):
    """
    User Progress table — tracks which articles a user has completed.
    """

    __tablename__ = "user_progress"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="profiles.id", index=True)
    article_id: UUID = Field(foreign_key="articles.id")
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = None
