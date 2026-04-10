# Prompt Dairy — Backend API

FastAPI backend for the Prompt Dairy platform.

## Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

## Project Structure

```
app/
├── main.py          # App entry point
├── api/v1/          # API endpoints
├── core/            # Config & security
├── db/              # Database session
├── models/          # ORM models
├── schemas/         # Request/response schemas
└── services/        # Business logic
```
