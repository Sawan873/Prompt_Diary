# 🧠 Prompt Dairy

> A learning + practice ecosystem for **Prompt Engineering, AI Systems, and LLM Workflows**.

Think GeeksforGeeks, but for AI — learn the theory, practice prompt writing, explore AI architectures, and experiment in a live playground.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js (App Router) + TypeScript + TailwindCSS v4 |
| **Backend** | Python + FastAPI + REST APIs |
| **Database** | PostgreSQL via Supabase (free tier) |
| **Auth** | Supabase Auth |
| **Search** | Meilisearch (Phase 2) |
| **Hosting** | Vercel (frontend) · Railway/Fly.io (backend) · Supabase (database) |

---

## 📁 Project Structure

```
prompt-dairy/
├── frontend/       # Next.js application
├── backend/        # FastAPI application
├── database/       # SQL migrations & seed data
├── docs/           # Architecture & design documents
└── assets/         # Static assets (logos, images)
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+ and npm
- **Python** 3.10+
- **Git**

### 1. Clone the repo
```bash
git clone https://github.com/your-org/prompt-dairy.git
cd prompt-dairy
```

### 2. Start the Backend
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```
Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 📌 Modules

| Module | Description | Status |
|--------|-------------|--------|
| Learning Platform | Articles, tutorials, prompt patterns | 🔄 Phase 2 |
| Prompt Challenges | Practice prompt writing | 🔄 Phase 2 |
| Learning Roadmaps | Structured learning paths | 🔄 Phase 2 |
| Prompt Playground | Interactive prompt testing | 🔄 Phase 4 |
| System Design | AI architecture guides | 🔄 Phase 2 |

---

## 🌿 Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Integration branch |
| `feature/*` | Feature branches (e.g., `feature/articles`) |

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

## 👥 Team

Built by the Prompt Dairy intern development team.
