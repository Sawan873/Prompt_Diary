"""
Challenges API endpoints.

GET /challenges         — List all challenges
GET /challenges/{id}    — Get a single challenge by ID
"""

from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import Optional

from app.services.challenge_service import (
    get_all_challenges, 
    get_challenge_by_id,
    create_challenge,
    update_challenge,
    delete_challenge
)
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, ChallengeResponse
from app.core.security import get_current_admin

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


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_new_challenge(
    challenge_data: ChallengeCreate,
    current_admin: dict = Depends(get_current_admin),
):
    """Create a new prompt challenge (Admin only)."""
    try:
        return create_challenge(challenge_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{challenge_id}", response_model=ChallengeResponse)
async def update_existing_challenge(
    challenge_id: str,
    challenge_data: ChallengeUpdate,
    current_admin: dict = Depends(get_current_admin),
):
    """Update a prompt challenge (Admin only)."""
    challenge = update_challenge(challenge_id, challenge_data)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or update failed")
    return challenge


@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_challenge(
    challenge_id: str,
    current_admin: dict = Depends(get_current_admin),
):
    """Delete a prompt challenge (Admin only)."""
    success = delete_challenge(challenge_id)
    if not success:
        raise HTTPException(status_code=404, detail="Challenge not found or deletion failed")
    return None
