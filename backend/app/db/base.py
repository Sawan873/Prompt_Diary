"""
SQLModel base class for ORM models.
"""

from sqlmodel import SQLModel

# Base model — all ORM models inherit from SQLModel
# This file ensures a single metadata instance is shared across all models.
Base = SQLModel
