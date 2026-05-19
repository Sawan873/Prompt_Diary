"""
Roadmap service — business logic for learning roadmaps.

Queries Supabase PostgreSQL for roadmaps and tracks user completion progression.
Falls back to mock data if Supabase is not configured.
"""

from typing import Optional, List, Set, Dict, Any
from app.core.config import settings
from app.schemas.roadmap import RoadmapCreate, RoadmapUpdate
import uuid
from datetime import datetime


def _get_supabase():
    """Get the Supabase client, or None if not configured."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    try:
        from app.core.supabase_client import get_supabase_admin
        return get_supabase_admin()
    except Exception:
        return None


def _get_completed_slugs(user_id: str) -> Set[str]:
    """Helper to fetch the set of article slugs completed by a user."""
    # Validate UUID format before querying Supabase
    try:
        uuid.UUID(str(user_id))
    except ValueError:
        # Not a valid UUID, fall back to mock data
        return {item["article_slug"] for item in MOCK_USER_PROGRESS if item["user_id"] == user_id}

    supabase = _get_supabase()
    if not supabase:
        # Mock offline progression fallback
        return {item["article_slug"] for item in MOCK_USER_PROGRESS if item["user_id"] == user_id}
        
    try:
        progress_res = (
            supabase.table("user_progress")
            .select("article_id")
            .eq("user_id", user_id)
            .eq("completed", True)
            .execute()
        )
        if not progress_res.data:
            return set()
        
        article_ids = [item["article_id"] for item in progress_res.data]
        if not article_ids:
            return set()
            
        articles_res = (
            supabase.table("articles")
            .select("slug")
            .in_("id", article_ids)
            .execute()
        )
        return {item["slug"] for item in articles_res.data if item.get("slug")}
    except Exception as e:
        print(f"[RoadmapService] Failed to fetch user progress slugs: {e}")
        return set()



def _hydrate_roadmap_progress(roadmap: Dict[str, Any], completed_slugs: Set[str]) -> Dict[str, Any]:
    """Injects completion states into topics and aggregates progress metrics."""
    # Ensure deep copy properties are treated as dictionaries
    topics = roadmap.get("topics", [])
    if not topics:
        roadmap["topics"] = []
        roadmap["completed_count"] = 0
        roadmap["progress_percentage"] = 0
        return roadmap
        
    completed_count = 0
    hydrated_topics = []
    
    for t in topics:
        topic_dict = dict(t)
        slug = topic_dict.get("article_slug")
        if slug and slug in completed_slugs:
            topic_dict["completed"] = True
            completed_count += 1
        else:
            topic_dict["completed"] = False
        hydrated_topics.append(topic_dict)
        
    roadmap["topics"] = hydrated_topics
    roadmap["completed_count"] = completed_count
    roadmap["progress_percentage"] = int((completed_count / len(topics)) * 100) if topics else 0
    return roadmap


def _hydrate_guest_roadmap(roadmap: Dict[str, Any]) -> Dict[str, Any]:
    """Injects default guest progression attributes (completed: False)."""
    topics = roadmap.get("topics", [])
    hydrated_topics = []
    for t in topics:
        topic_dict = dict(t)
        topic_dict["completed"] = False
        hydrated_topics.append(topic_dict)
    
    roadmap["topics"] = hydrated_topics
    roadmap["completed_count"] = 0
    roadmap["progress_percentage"] = 0
    return roadmap


def get_all_roadmaps(level: Optional[str] = None, user_id: Optional[str] = None) -> dict:
    """Get all roadmaps, optionally filtered by level and personalized by user_id."""
    supabase = _get_supabase()
    roadmaps_data = []

    if supabase:
        try:
            query = supabase.table("roadmaps").select("*")
            if level:
                query = query.eq("level", level)
            query = query.order("created_at", desc=True)
            result = query.execute()
            roadmaps_data = result.data or []
        except Exception as e:
            print(f"[RoadmapService] Supabase query failed, using mock: {e}")
            roadmaps_data = []

    if not roadmaps_data:
        # Fallback to mock data
        roadmaps_data = [dict(r) for r in MOCK_ROADMAPS]
        if level:
            roadmaps_data = [r for r in roadmaps_data if r["level"] == level]

    # Hydrate progress
    if user_id:
        completed_slugs = _get_completed_slugs(user_id)
        hydrated_roadmaps = [_hydrate_roadmap_progress(dict(r), completed_slugs) for r in roadmaps_data]
    else:
        hydrated_roadmaps = [_hydrate_guest_roadmap(dict(r)) for r in roadmaps_data]

    return {
        "roadmaps": hydrated_roadmaps,
        "total": len(hydrated_roadmaps),
    }


def get_roadmap_by_id(roadmap_id: str, user_id: Optional[str] = None) -> Optional[dict]:
    """Get a single roadmap by ID, dynamically personalizing completion metrics."""
    supabase = _get_supabase()
    roadmap = None

    if supabase:
        try:
            result = supabase.table("roadmaps").select("*").eq("id", roadmap_id).single().execute()
            roadmap = result.data
        except Exception:
            pass

    if not roadmap:
        for r in MOCK_ROADMAPS:
            if r["id"] == roadmap_id:
                roadmap = dict(r)
                break

    if not roadmap:
        return None

    # Hydrate progress
    if user_id:
        completed_slugs = _get_completed_slugs(user_id)
        return _hydrate_roadmap_progress(roadmap, completed_slugs)
    
    return _hydrate_guest_roadmap(roadmap)


def create_roadmap(roadmap_data: RoadmapCreate) -> dict:
    """Creates a new learning roadmap path in the database."""
    supabase = _get_supabase()
    
    roadmap_dict = roadmap_data.model_dump()
    # Serialize Topic Pydantic objects to plain dictionaries
    roadmap_dict["topics"] = [t.model_dump() for t in roadmap_data.topics]
    roadmap_dict["id"] = str(uuid.uuid4())
    roadmap_dict["created_at"] = datetime.utcnow().isoformat()
    
    if supabase:
        try:
            result = supabase.table("roadmaps").insert(roadmap_dict).execute()
            if result.data:
                return result.data[0]
        except Exception as e:
            print(f"[RoadmapService] Supabase creation failed: {e}")
            
    MOCK_ROADMAPS.insert(0, roadmap_dict)
    return roadmap_dict


def update_roadmap(roadmap_id: str, roadmap_data: RoadmapUpdate) -> Optional[dict]:
    """Partially updates an existing learning roadmap path."""
    supabase = _get_supabase()
    update_fields = {k: v for k, v in roadmap_data.model_dump().items() if v is not None}
    
    if "topics" in update_fields and update_fields["topics"]:
        update_fields["topics"] = [t.model_dump() for t in roadmap_data.topics]
        
    if supabase:
        try:
            result = (
                supabase.table("roadmaps")
                .update(update_fields)
                .eq("id", roadmap_id)
                .execute()
            )
            if result.data:
                return result.data[0]
        except Exception as e:
            print(f"[RoadmapService] Supabase update failed: {e}")
            
    # Mock update
    for idx, r in enumerate(MOCK_ROADMAPS):
        if r["id"] == roadmap_id:
            updated_roadmap = {**r, **update_fields}
            MOCK_ROADMAPS[idx] = updated_roadmap
            return updated_roadmap
            
    return None


def delete_roadmap(roadmap_id: str) -> bool:
    """Removes a learning roadmap path."""
    supabase = _get_supabase()
    
    if supabase:
        try:
            supabase.table("roadmaps").delete().eq("id", roadmap_id).execute()
            return True
        except Exception as e:
            print(f"[RoadmapService] Supabase deletion failed: {e}")
            
    # Mock deletion
    for idx, r in enumerate(MOCK_ROADMAPS):
        if r["id"] == roadmap_id:
            MOCK_ROADMAPS.pop(idx)
            return True
            
    return False


# ---------------------------------------------------------------------------
# Mock data (fallback when Supabase tables don't exist yet)
# ---------------------------------------------------------------------------

MOCK_USER_PROGRESS = [
    {"user_id": "mock-user-123", "article_slug": "intro-to-prompt-engineering"},
    {"user_id": "mock-user-123", "article_slug": "zero-shot-vs-few-shot"}
]

MOCK_ROADMAPS = [
    {
        "id": "rm-001-0000-0000-000000000001",
        "title": "Prompt Engineering Beginner Path",
        "level": "beginner",
        "description": "Start your journey into prompt engineering. Learn the fundamentals of how LLMs work and how to craft effective prompts.",
        "topics": [
            {"order": 1, "title": "What are LLMs?", "description": "Understanding Large Language Models", "article_slug": "intro-to-prompt-engineering"},
            {"order": 2, "title": "Prompt Basics", "description": "Structure and components of a prompt"},
            {"order": 3, "title": "Zero-Shot Prompting", "description": "Prompting without examples", "article_slug": "zero-shot-vs-few-shot"},
            {"order": 4, "title": "Few-Shot Prompting", "description": "Using examples to guide the model", "article_slug": "zero-shot-vs-few-shot"},
            {"order": 5, "title": "Prompt Formatting", "description": "Best practices for formatting prompts"},
            {"order": 6, "title": "Common Mistakes", "description": "Avoiding common prompting pitfalls"},
        ],
        "estimated_hours": 8,
        "created_at": "2025-01-01T00:00:00Z",
    },
    {
        "id": "rm-002-0000-0000-000000000002",
        "title": "Intermediate Prompt Techniques",
        "level": "intermediate",
        "description": "Level up your prompting skills with advanced techniques like Chain-of-Thought, role prompting, and output formatting.",
        "topics": [
            {"order": 1, "title": "Chain-of-Thought", "description": "Step-by-step reasoning prompts", "article_slug": "chain-of-thought-prompting"},
            {"order": 2, "title": "Role Prompting", "description": "Assigning personas to the AI"},
            {"order": 3, "title": "Output Formatting", "description": "Getting structured outputs (JSON, tables, lists)"},
            {"order": 4, "title": "Prompt Chaining", "description": "Connecting multiple prompts together"},
            {"order": 5, "title": "Temperature & Parameters", "description": "Controlling model behavior"},
            {"order": 6, "title": "Evaluation", "description": "How to evaluate prompt quality"},
        ],
        "estimated_hours": 12,
        "created_at": "2025-01-15T00:00:00Z",
    },
    {
        "id": "rm-003-0000-0000-000000000003",
        "title": "Advanced AI Architecture",
        "level": "advanced",
        "description": "Master production AI systems — RAG pipelines, agent architectures, and enterprise AI workflows.",
        "topics": [
            {"order": 1, "title": "RAG Architecture", "description": "Retrieval-Augmented Generation systems", "article_slug": "rag-architecture-deep-dive"},
            {"order": 2, "title": "Vector Databases", "description": "Storing and searching embeddings"},
            {"order": 3, "title": "AI Agents", "description": "Building autonomous AI systems", "article_slug": "building-ai-agent-systems"},
            {"order": 4, "title": "Multi-Agent Systems", "description": "Coordinating multiple AI agents"},
            {"order": 5, "title": "Enterprise AI", "description": "Production deployment patterns"},
            {"order": 6, "title": "AI Safety", "description": "Guardrails and responsible AI"},
        ],
        "estimated_hours": 20,
        "created_at": "2025-02-01T00:00:00Z",
    },
]

