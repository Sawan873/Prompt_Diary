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
Set the Build Command as:
npm install && npm run build
Set the Start Command as:
npm run start
Add the required environment variable in the Render dashboard:
NEXT_PUBLIC_API_URL=https://prompt-diary-backend.onrender.com/api/v1
Deploy the frontend service.

Frontend Live URL:

https://prompt-diary-frontend.onrender.

###Backend → Render

The backend is deployed on Render as a Web Service.

Connect the GitHub repository to Render.
Create a new Web Service for the backend.
Set the Root Directory as:
backend
Set the Build Command as:
pip install -r requirements.txt
Set the Start Command as:
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
Add all required environment variables in the Render dashboard.
Deploy the backend service.

Backend Live URL:

https://prompt-diary-backend.onrender.com

API Base URL:

https://prompt-diary-backend.onrender.com/api/v1

API Documentation / Swagger:

https://prompt-diary-backend.onrender.com/docs
Important Backend API Endpoints

After deployment, the backend APIs are available at the following endpoints:

GET https://prompt-diary-backend.onrender.com/
GET https://prompt-diary-backend.onrender.com/docs
GET https://prompt-diary-backend.onrender.com/api/v1/articles
GET https://prompt-diary-backend.onrender.com/api/v1/articles/system-design
GET https://prompt-diary-backend.onrender.com/api/v1/roadmaps
GET https://prompt-diary-backend.onrender.com/api/v1/search

###Database → Supabase

The database is hosted on Supabase.

Supabase is used as the hosted PostgreSQL database.
The backend connects to Supabase using environment variables.
Ensure that all backend environment variables point to the correct Supabase project.
No separate database deployment is required because Supabase is already hosted.
