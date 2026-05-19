import sys
import os

# Adjust sys.path so we can import app modules directly
sys.path.insert(0, r"c:\Users\Aaryan\OneDrive\Desktop\Coding\Prompt_Diary\backend")

from app.services.roadmap_service import (
    get_all_roadmaps, 
    get_roadmap_by_id, 
    create_roadmap, 
    update_roadmap,
    delete_roadmap
)
from app.schemas.roadmap import RoadmapCreate, RoadmapUpdate, TopicItem

def test_guest_roadmap():
    # User is None (Guest)
    res = get_all_roadmaps(user_id=None)
    assert res["total"] > 0
    
    first_roadmap = res["roadmaps"][0]
    assert first_roadmap["progress_percentage"] == 0
    assert first_roadmap["completed_count"] == 0
    
    # Verify all topics have completed: False
    for topic in first_roadmap["topics"]:
        assert topic["completed"] is False
        
    print("SUCCESS: test_guest_roadmap passed!")

def test_authenticated_roadmap_progress():
    # mock-user-123 has completed 2 articles:
    # 1. intro-to-prompt-engineering (topic 1 in beginner path)
    # 2. zero-shot-vs-few-shot (topic 3 & 4 in beginner path since they map to the same slug)
    
    res = get_all_roadmaps(user_id="mock-user-123")
    print("\n--- DEBUG: ALL ROADMAPS RETRIEVED IN TEST ---")
    for r in res["roadmaps"]:
        print(f"Title: {r['title']}, Level: {r['level']}, Topics Count: {len(r['topics'])}")
        for idx, t in enumerate(r['topics']):
            print(f"  Topic {idx}: Title={t.get('title')}, Slug={t.get('article_slug')}, Completed={t.get('completed')}")
    print("--------------------------------------------\n")
    
    # We find the beginner roadmap
    beginner_rm = None
    for r in res["roadmaps"]:
        if r["level"] == "beginner":
            beginner_rm = r
            break
            
    assert beginner_rm is not None
    
    # 3 topics completed out of 6:
    # Topic 1 (intro-to-prompt-engineering) -> completed: True
    # Topic 2 (no slug) -> completed: False
    # Topic 3 (zero-shot-vs-few-shot) -> completed: True
    # Topic 4 (zero-shot-vs-few-shot) -> completed: True
    # Topic 5 & 6 (no slug) -> completed: False
    
    assert beginner_rm["topics"][0]["completed"] is True
    assert beginner_rm["topics"][1]["completed"] is False
    assert beginner_rm["topics"][2]["completed"] is True
    assert beginner_rm["topics"][3]["completed"] is True
    assert beginner_rm["topics"][4]["completed"] is False
    
    # Metrics
    assert beginner_rm["completed_count"] == 3
    assert beginner_rm["progress_percentage"] == 50  # 3/6 = 50%

    
    print("SUCCESS: test_authenticated_roadmap_progress passed!")

def test_roadmap_crud():
    # Create Roadmap
    new_roadmap_payload = RoadmapCreate(
        title="Super Advanced LLM Fine-Tuning",
        level="advanced",
        description="A specialized pathway to master LLM fine-tuning techniques.",
        topics=[
            TopicItem(order=1, title="Dataset Prep", description="Format JSONL datasets"),
            TopicItem(order=2, title="LoRA & QLoRA", description="Understand parameter efficient training", article_slug="lora-guide")
        ],
        estimated_hours=15
    )
    
    created = create_roadmap(new_roadmap_payload)
    assert created["title"] == "Super Advanced LLM Fine-Tuning"
    assert len(created["topics"]) == 2
    assert created["topics"][1]["article_slug"] == "lora-guide"
    
    # Update Roadmap
    update_payload = RoadmapUpdate(estimated_hours=25)
    updated = update_roadmap(created["id"], update_payload)
    assert updated["estimated_hours"] == 25
    
    # Delete Roadmap
    delete_success = delete_roadmap(created["id"])
    assert delete_success is True
    
    # Verify no longer exists
    assert get_roadmap_by_id(created["id"]) is None
    
    print("SUCCESS: test_roadmap_crud passed!")

if __name__ == "__main__":
    print("Starting Roadmap API Pipeline tests...")
    import traceback
    
    # Hermetic mocking: Override the database accessor to enforce offline mock mode
    # for predictable and deterministic unit validation.
    import app.services.roadmap_service as roadmap_service
    roadmap_service._get_supabase = lambda: None
    
    try:
        test_guest_roadmap()
        test_authenticated_roadmap_progress()
        test_roadmap_crud()
        print("\nALL ROADMAP PIPELINE SERVICE TESTS PASSED!")
    except Exception as e:
        print("\nTEST FAILURE:")
        traceback.print_exc()
        sys.exit(1)


