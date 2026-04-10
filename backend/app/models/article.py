"""
Article ORM model.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Column, ARRAY, String


class Article(SQLModel, table=True):
    """
    Articles table — stores learning content, tutorials, and guides.
    """

    __tablename__ = "articles"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    content: str
    excerpt: Optional[str] = None
    category: str = Field(index=True)
    difficulty: Optional[str] = Field(default=None)  # beginner, intermediate, advanced
    author_id: Optional[UUID] = Field(default=None, foreign_key="profiles.id")
    tags: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    published: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
