"""
Roadmap ORM model.
"""

from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class Roadmap(SQLModel, table=True):
    """
    Roadmaps table — structured learning paths.
    """

    __tablename__ = "roadmaps"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    level: Optional[str] = Field(default=None)  # beginner, intermediate, advanced
    description: Optional[str] = None
    topics: Any = Field(default=None, sa_column=Column(JSON))  # Ordered list of topics
    estimated_hours: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
