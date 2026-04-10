"""
Challenges API endpoints.

GET /challenges         — List all challenges
GET /challenges/{id}    — Get a single challenge by ID
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.challenge_service import get_all_challenges, get_challenge_by_id

router = APIRouter(prefix="/challenges", tags=["Challenges"])


@router.get("")
async def list_challenges(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (easy, medium, hard)"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """
    List all prompt challenges.

    Optional filters:
    - **difficulty**: easy, medium, hard
    - **category**: summarization, extraction, reasoning, role-playing, chaining
    """
    result = get_all_challenges(difficulty=difficulty, category=category)
    return result


@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    """Get a single challenge by its ID."""
    challenge = get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge
