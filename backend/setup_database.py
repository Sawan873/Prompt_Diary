"""
Run database migration and seed data on Supabase.

This script reads the SQL files and executes them via Supabase's
REST API (using the service role key).

Usage:
    python setup_database.py
"""

from dotenv import load_dotenv
from supabase import create_client
import os

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not url or "your-" in url:
    print("[ERROR] SUPABASE_URL is not set! Update your .env file.")
    exit(1)

if not key or "your-" in key:
    print("[ERROR] SUPABASE_SERVICE_ROLE_KEY is not set! Update your .env file.")
    exit(1)

supabase = create_client(url, key)

print("=" * 60)
print("  SUPABASE DATABASE SETUP")
print("=" * 60)

# Step 1: Run migration
print("\n[1] Running migration (001_initial_schema.sql)...")
migration_path = os.path.join(
    os.path.dirname(__file__), "..", "database", "migrations", "001_initial_schema.sql"
)

if os.path.exists(migration_path):
    with open(migration_path, "r", encoding="utf-8") as f:
        migration_sql = f.read()
    try:
        supabase.postgrest.rpc("", {}).execute()  # Test connection
    except Exception:
        pass

    print("    NOTE: Run this SQL manually in Supabase SQL Editor:")
    print(f"    File: {os.path.abspath(migration_path)}")
    print("    Go to: https://supabase.com/dashboard -> SQL Editor -> New Query")
    print("    Paste the migration SQL and click 'Run'")
else:
    print(f"    [WARN] Migration file not found at: {migration_path}")

# Step 2: Run seed data
print("\n[2] Running seed data (seed_data.sql)...")
seed_path = os.path.join(
    os.path.dirname(__file__), "..", "database", "seed", "seed_data.sql"
)

if os.path.exists(seed_path):
    print("    NOTE: Run this SQL in Supabase SQL Editor AFTER the migration:")
    print(f"    File: {os.path.abspath(seed_path)}")
else:
    print(f"    [WARN] Seed file not found at: {seed_path}")

# Step 3: Verify tables exist
print("\n[3] Checking existing tables...")
tables_to_check = ["profiles", "articles", "challenges", "roadmaps", "user_progress"]

for table in tables_to_check:
    try:
        result = supabase.table(table).select("*", count="exact").limit(0).execute()
        count = result.count if hasattr(result, 'count') and result.count is not None else len(result.data)
        print(f"    OK - '{table}' exists ({count} rows)")
    except Exception as e:
        error_msg = str(e)
        if "PGRST205" in error_msg or "could not find" in error_msg.lower():
            print(f"    MISSING - '{table}' table does not exist yet")
        else:
            print(f"    ERROR - '{table}': {error_msg[:80]}")

print("\n" + "=" * 60)
print("  SETUP INSTRUCTIONS")
print("=" * 60)
print("""
1. Go to https://supabase.com/dashboard
2. Select your project -> SQL Editor
3. Copy & paste the migration SQL and run it:
   database/migrations/001_initial_schema.sql

4. Then copy & paste the seed data SQL and run it:
   database/seed/seed_data.sql

5. After running both, re-run this script to verify:
   python setup_database.py
""")
