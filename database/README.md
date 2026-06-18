# 🗄️ Prompt Diary — Database

## Overview

The database uses **PostgreSQL** hosted on **Supabase** (free tier).

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose your organization
4. Set a **strong database password** (save it!)
5. Select a region close to your users
6. Wait for provisioning (~2 minutes)

### 2. Run the Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click **Run**

### 3. Seed the Data

1. In SQL Editor, create another query
2. Copy and paste `seed/seed_data.sql`
3. Click **Run**

### 4. Get Connection Details

1. Go to **Settings** → **API**
2. Copy the **Project URL** and **anon/public key**
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Add these to your backend `.env` file

## Schema Overview

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (linked to Supabase Auth) |
| `articles` | Learning content and tutorials |
| `challenges` | Prompt engineering practice problems |
| `roadmaps` | Structured learning paths |
| `user_progress` | Tracks user article completion |

## Security

- **Row Level Security (RLS)** is enabled on all tables
- Public content (articles, challenges, roadmaps) is readable by everyone
- User data (profiles, progress) is restricted to the owning user
- Auto-trigger creates a profile when a new user signs up
