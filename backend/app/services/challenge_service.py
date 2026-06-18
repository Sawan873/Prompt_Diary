"""
Challenge service — business logic for challenge operations.

Queries Supabase PostgreSQL for challenges data.
Falls back to mock data if Supabase is not configured.
"""

from typing import Optional
import uuid
from datetime import datetime
from app.core.config import settings
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate


def _get_supabase():
    """Get the Supabase client, or None if not configured."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    try:
        from app.core.supabase_client import get_supabase_admin
        return get_supabase_admin()
    except Exception:
        return None


def get_all_challenges(difficulty: Optional[str] = None, category: Optional[str] = None) -> dict:
    """Get all challenges, optionally filtered."""
    supabase = _get_supabase()

    if supabase:
        try:
            query = supabase.table("challenges").select("*")
            if difficulty:
                query = query.eq("difficulty", difficulty)
            if category:
                query = query.eq("category", category)
            query = query.order("created_at", desc=True)
            result = query.execute()
            return {
                "challenges": result.data or [],
                "total": len(result.data or []),
            }
        except Exception as e:
            print(f"[ChallengeService] Supabase query failed, using mock: {e}")

    # Fallback to mock data
    challenges = MOCK_CHALLENGES.copy()
    if difficulty:
        challenges = [c for c in challenges if c["difficulty"] == difficulty]
    if category:
        challenges = [c for c in challenges if c["category"] == category]
    return {
        "challenges": challenges,
        "total": len(challenges),
    }


def get_challenge_by_id(challenge_id: str) -> Optional[dict]:
    """Get a single challenge by ID."""
    supabase = _get_supabase()

    if supabase:
        try:
            result = supabase.table("challenges").select("*").eq("id", challenge_id).single().execute()
            return result.data
        except Exception:
            pass

    for challenge in MOCK_CHALLENGES:
        if challenge["id"] == challenge_id:
            return challenge
    return None


def create_challenge(challenge_data: ChallengeCreate) -> dict:
    """Creates a new prompt challenge in the database."""
    supabase = _get_supabase()
    
    challenge_dict = challenge_data.model_dump()
    challenge_dict["id"] = str(uuid.uuid4())
    challenge_dict["created_at"] = datetime.utcnow().isoformat()
    
    if supabase:
        try:
            result = supabase.table("challenges").insert(challenge_dict).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            print(f"[ChallengeService] Supabase creation failed: {e}")
            
    MOCK_CHALLENGES.insert(0, challenge_dict)
    return challenge_dict


def update_challenge(challenge_id: str, challenge_data: ChallengeUpdate) -> Optional[dict]:
    """Partially updates an existing challenge."""
    supabase = _get_supabase()
    update_fields = {k: v for k, v in challenge_data.model_dump().items() if v is not None}
    
    if supabase:
        try:
            result = (
                supabase.table("challenges")
                .update(update_fields)
                .eq("id", challenge_id)
                .execute()
            )
            if result.data:
                return result.data[0]
        except Exception as e:
            print(f"[ChallengeService] Supabase update failed: {e}")
            
    # Mock update
    for idx, c in enumerate(MOCK_CHALLENGES):
        if c["id"] == challenge_id:
            updated_challenge = {**c, **update_fields}
            MOCK_CHALLENGES[idx] = updated_challenge
            return updated_challenge
            
    return None


def delete_challenge(challenge_id: str) -> bool:
    """Removes a prompt challenge."""
    supabase = _get_supabase()
    
    if supabase:
        try:
            supabase.table("challenges").delete().eq("id", challenge_id).execute()
            return True
        except Exception as e:
            print(f"[ChallengeService] Supabase deletion failed: {e}")
            
    # Mock deletion
    for idx, c in enumerate(MOCK_CHALLENGES):
        if c["id"] == challenge_id:
            MOCK_CHALLENGES.pop(idx)
            return True
            
    return False


# ---------------------------------------------------------------------------
# Mock data (fallback when Supabase tables don't exist yet)
# ---------------------------------------------------------------------------

MOCK_CHALLENGES = [
    {
        "id": "ch-001-0000-0000-000000000001",
        "title": "Summarize an Article",
        "description": "Write a prompt that instructs an AI to summarize a long technical article into 3 key bullet points. The summary should capture the main argument, supporting evidence, and conclusion.",
        "difficulty": "easy",
        "category": "summarization",
        "starter_prompt": "Summarize the following article...",
        "hints": [
            "Specify the number of bullet points",
            "Ask for key takeaways, not just a shorter version",
            "Consider asking the model to identify the main argument first",
        ],
        "points": 10,
        "created_at": "2025-01-01T00:00:00Z",
    },
    {
        "id": "ch-002-0000-0000-000000000002",
        "title": "Extract JSON from Text",
        "description": "Write a prompt that extracts structured JSON data from an unstructured product review. The JSON should include: product_name, rating (1-5), pros (list), cons (list), and recommendation (boolean).",
        "difficulty": "medium",
        "category": "extraction",
        "starter_prompt": "Extract the following information from this review...",
        "hints": [
            "Define the exact JSON schema you expect",
            "Provide an example of the output format",
            "Use system prompts to set the role as a data extractor",
        ],
        "points": 20,
        "created_at": "2025-01-15T00:00:00Z",
    },
    {
        "id": "ch-003-0000-0000-000000000003",
        "title": "Multi-Step Reasoning",
        "description": "Write a prompt that guides the AI through a multi-step math word problem. The prompt should make the AI show its work step-by-step and arrive at the correct answer.",
        "difficulty": "medium",
        "category": "reasoning",
        "starter_prompt": "Solve the following problem step by step...",
        "hints": [
            "Use Chain-of-Thought prompting",
            "Ask the model to 'think step by step'",
            "Request verification of the final answer",
        ],
        "points": 20,
        "created_at": "2025-02-01T00:00:00Z",
    },
    {
        "id": "ch-004-0000-0000-000000000004",
        "title": "Role-Based Prompt Design",
        "description": "Create a system prompt that makes the AI act as a senior code reviewer. It should analyze code for bugs, security issues, and performance problems, then provide actionable feedback.",
        "difficulty": "hard",
        "category": "role-playing",
        "starter_prompt": "You are a senior software engineer...",
        "hints": [
            "Define the persona clearly with expertise areas",
            "Set the tone and communication style",
            "Include specific criteria for the review",
        ],
        "points": 30,
        "created_at": "2025-02-15T00:00:00Z",
    },
    {
        "id": "ch-005-0000-0000-000000000005",
        "title": "Build a Prompt Chain",
        "description": "Design a series of 3 connected prompts that work together to: (1) analyze a business problem, (2) generate potential solutions, (3) evaluate and rank the solutions. Each prompt should use the output of the previous one.",
        "difficulty": "hard",
        "category": "chaining",
        "starter_prompt": "Step 1: Analyze the following business problem...",
        "hints": [
            "Each prompt should have a clear, focused objective",
            "Define the output format for each step",
            "Ensure step 2 references step 1's output explicitly",
        ],
        "points": 40,
        "created_at": "2025-03-01T00:00:00Z",
    },
]
