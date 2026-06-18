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
from app.schemas.challenge import (
    ChallengeCreate, 
    ChallengeUpdate, 
    ChallengeResponse,
    ChallengeEvaluateRequest,
    ChallengeEvaluateResponse
)
from app.core.security import get_current_admin, get_optional_user
from app.core.rate_limit import admin_rate_limiter
from app.core.config import settings
import httpx
import json

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

@router.post("/{challenge_id}/evaluate", response_model=ChallengeEvaluateResponse)
async def evaluate_challenge(
    challenge_id: str,
    data: ChallengeEvaluateRequest,
    user: Optional[dict] = Depends(get_optional_user),
):
    """Evaluate a user's prompt submission for a challenge using Ollama."""
    challenge = get_challenge_by_id(challenge_id)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    if not getattr(settings, "OLLAMA_BASE_URL", None):
        # Mock evaluation for fallback
        return ChallengeEvaluateResponse(
            score=8,
            feedback="This is a mock evaluation because Ollama is not configured. Your prompt looks generally good.",
            improvements=["Consider adding more specific output constraints.", "Define the persona more clearly."]
        )
        
    system_prompt = (
        "You are an expert Prompt Engineering evaluator. "
        "The user is trying to solve the following challenge:\n"
        f"Title: {challenge.title}\n"
        f"Description: {challenge.description}\n"
        f"Category: {challenge.category}\n\n"
        "The user submitted the following prompt:\n"
        f"{data.user_prompt}\n\n"
        "Evaluate the prompt on a scale of 1-10. Provide feedback and a list of improvements.\n"
        "You MUST return ONLY valid JSON in the exact following format:\n"
        '{"score": <int>, "feedback": "<string>", "improvements": ["<string>", ...]}'
    )
    
    url = f"{settings.OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": "llama3:latest",
        "prompt": system_prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            result_text = response.json().get("response", "")
            
            result_data = json.loads(result_text)
            return ChallengeEvaluateResponse(
                score=result_data.get("score", 0),
                feedback=result_data.get("feedback", "No feedback provided."),
                improvements=result_data.get("improvements", [])
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate using Ollama: {str(e)}")


@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_new_challenge(
    challenge_data: ChallengeCreate,
    current_admin: dict = Depends(get_current_admin),
    _: str = Depends(admin_rate_limiter),
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
    _: str = Depends(admin_rate_limiter),
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
    _: str = Depends(admin_rate_limiter),
):
    """Delete a prompt challenge (Admin only)."""
    success = delete_challenge(challenge_id)
    if not success:
        raise HTTPException(status_code=404, detail="Challenge not found or deletion failed")
    return None
