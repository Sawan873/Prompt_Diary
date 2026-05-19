# Prompt Diary — Setup Guide

## Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **Git** (for version control)
- **Supabase account** (free tier) — [supabase.com](https://supabase.com)

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/prompt-diary.git
cd prompt-diary
```

---

## 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure Environment Variables

Copy the template and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
APP_NAME=Prompt Diary
APP_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

JWT_SECRET=your-jwt-secret-from-supabase
JWT_ALGORITHM=HS256
```

### Run the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` to see the API docs.

---

## 3. Database Setup

1. Go to your Supabase dashboard → SQL Editor
2. Run `database/migrations/001_initial_schema.sql`
3. Run `database/migrations/002_challenge_progress.sql`
4. Run `database/seed/seed_data.sql` (optional — adds sample data)

---

## 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Run the Frontend

```bash
npm run dev
```

Visit `http://localhost:3000` to see the platform.

---

## 5. Development Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Active development |
| `feature/*` | Feature branches (e.g., `feature/articles`) |

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make changes, commit, push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

# Create a PR to dev → main
```

---

## 6. Deployment

The project is deployed using **Render** for both frontend and backend, and **Supabase** for the database.

---

### Frontend → Render

- Connect the GitHub repository to Render.
- Create a new **Web Service** for the frontend.
- Set the **Root Directory** as:

```bash
frontend
