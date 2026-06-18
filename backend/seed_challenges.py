import os
import sys
import uuid
import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.services.challenge_service import _get_supabase

challenges_data = [
    {
        "id": "e2f1b0a8-b5b4-4b4d-9a91-4c1c7a8b3d81", # Use a stable UUID
        "title": "Summarize an Article",
        "description": "Write a prompt that instructs an AI to summarize a long technical article into exactly 3 key bullet points. Each bullet point should be concise, informative, and capture a distinct idea.",
        "difficulty": "easy",
        "category": "summarization",
        "points": 10,
        "starter_prompt": "Large language models are AI systems trained on vast amounts of text data. They can generate coherent text, answer questions, translate languages, and perform many other tasks, but they can also hallucinate incorrect facts.",
        "expected_output": "- [Key point 1: main concept]\n- [Key point 2: important detail]\n- [Key point 3: takeaway or implication]",
        "hints": [
            "Tell the AI exactly how many bullet points you want.",
            "Specify what each bullet should focus on.",
            "Add a word limit to keep the summary concise."
        ]
    },
    {
        "id": "e2f1b0a8-b5b4-4b4d-9a91-4c1c7a8b3d82",
        "title": "Extract JSON from Text",
        "description": "Write a prompt that extracts structured JSON data from an unstructured product review.",
        "difficulty": "medium",
        "category": "extraction",
        "points": 20,
        "starter_prompt": "I bought the Sony WH-1000XM5 headphones last week. Noise cancellation is excellent, sound quality is rich, and battery life is strong. The ear cushions get warm and the price is high. Rating: 5 out of 5.",
        "expected_output": "{\n  \"product\": \"Sony WH-1000XM5\",\n  \"rating\": 5,\n  \"pros\": [\"noise cancellation\", \"sound quality\", \"battery life\"],\n  \"cons\": [\"ear cushions get warm\", \"expensive\"]\n}",
        "hints": [
            "Specify the exact JSON schema you want.",
            "Tell the model to output only valid JSON.",
            "Mention that rating should be a number, not a string."
        ]
    },
    {
        "id": "e2f1b0a8-b5b4-4b4d-9a91-4c1c7a8b3d83",
        "title": "Multi-Step Reasoning",
        "description": "Write a prompt that guides the AI through a multi-step math word problem showing all intermediate work.",
        "difficulty": "medium",
        "category": "reasoning",
        "points": 20,
        "starter_prompt": "A bakery makes 240 cookies per batch. They make 3 chocolate chip batches, 2 oatmeal batches, and 1 peanut butter batch. They sell 80% of all cookies at different prices. What is total revenue?",
        "expected_output": "Step 1: Calculate total cookies per type\nStep 2: Calculate cookies sold\nStep 3: Calculate revenue per type\nStep 4: Sum all revenues",
        "hints": [
            "Ask the model to think step by step.",
            "Ask it to label each step clearly.",
            "Request a final verification pass."
        ]
    },
    {
        "id": "e2f1b0a8-b5b4-4b4d-9a91-4c1c7a8b3d84",
        "title": "Role-Based Prompt Design",
        "description": "Create a system prompt that makes the AI behave as a senior code reviewer.",
        "difficulty": "hard",
        "category": "role-playing",
        "points": 30,
        "starter_prompt": "function calculateTotal(items) {\n  let t = 0;\n  for (let i = 0; i < items.length; i++) {\n    t = t + items[i].p * items[i].q;\n  }\n  return t;\n}",
        "expected_output": "A senior code review covering naming, readability, edge cases, performance, and a suggested refactor.",
        "hints": [
            "Define the reviewer persona clearly.",
            "Tell the model what categories to inspect.",
            "Ask for actionable feedback, not vague comments."
        ]
    },
    {
        "id": "e2f1b0a8-b5b4-4b4d-9a91-4c1c7a8b3d85",
        "title": "Build a Prompt Chain",
        "description": "Design 3 connected prompts that analyze a problem, generate solutions, then evaluate and rank those solutions.",
        "difficulty": "hard",
        "category": "chaining",
        "points": 40,
        "starter_prompt": "A SaaS startup is losing 15% of customers every month. Most users sign up but never use core features. Support is overwhelmed.",
        "expected_output": "Prompt 1: Problem analysis\nPrompt 2: Solution generation using Prompt 1 output\nPrompt 3: Ranking using Prompt 2 output",
        "hints": [
            "Each prompt should explicitly reference the previous output.",
            "Use placeholders to show where previous output goes.",
            "Keep one job per prompt."
        ]
    }
]

def run_seed():
    supabase = _get_supabase()
    if not supabase:
        print("Supabase not configured.")
        return

    print("Checking if table exists...")
    try:
        supabase.table("challenges").select("id").limit(1).execute()
        print("Table 'challenges' exists.")
    except Exception as e:
        print(f"Error checking table: {e}")
        # Table might not exist! We'll need to create it via SQLModel if so.
        import asyncio
        from app.db.session import _init_engine, _engine
        from sqlmodel import SQLModel
        from app.models.challenge import Challenge
        async def create_table():
            _init_engine()
            async with _engine.begin() as conn:
                await conn.run_sync(SQLModel.metadata.create_all)
        asyncio.run(create_table())
        print("Created table 'challenges' via SQLModel.")
        
    print("Seeding challenges...")
    for challenge in challenges_data:
        try:
            # Check if exists
            res = supabase.table("challenges").select("id").eq("id", challenge["id"]).execute()
            if not res.data:
                challenge["created_at"] = datetime.datetime.utcnow().isoformat()
                supabase.table("challenges").insert(challenge).execute()
                print(f"Inserted challenge: {challenge['title']}")
            else:
                supabase.table("challenges").update(challenge).eq("id", challenge["id"]).execute()
                print(f"Updated challenge: {challenge['title']}")
        except Exception as e:
            print(f"Failed to seed {challenge['title']}: {e}")

if __name__ == '__main__':
    run_seed()
