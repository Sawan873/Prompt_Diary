"""
Challenge ORM model.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Column, ARRAY, String


class Challenge(SQLModel, table=True):
    """
    Challenges table — prompt engineering practice problems.
    """

    __tablename__ = "challenges"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str
    difficulty: Optional[str] = Field(default=None)  # easy, medium, hard
    category: Optional[str] = None
    starter_prompt: Optional[str] = None
    expected_output: Optional[str] = None
    hints: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    points: int = Field(default=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)
