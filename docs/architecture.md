# 🏗️ Prompt Dairy — Architecture Document

## System Overview

Prompt Dairy is a full-stack learning platform for Prompt Engineering and AI System Design. The platform follows a **decoupled architecture** with separate frontend and backend services communicating via REST APIs.

---

## High-Level Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        A["🌐 Browser"]
    end

    subgraph "Frontend - Vercel"
        B["Next.js App Router"]
        C["TailwindCSS UI"]
        D["API Client"]
    end

    subgraph "Backend - Railway/Fly.io"
        E["FastAPI Application"]
        F["Auth Middleware"]
        G["REST API v1"]
        H["Services Layer"]
    end

    subgraph "Data Layer - Supabase"
        I[("PostgreSQL Database")]
        J["Supabase Auth"]
        K["Row Level Security"]
    end

    subgraph "Future Integrations"
        L["OpenAI API"]
        M["Gemini API"]
        N["HuggingFace Models"]
        O["Meilisearch"]
    end

    A --> B
    B --> C
    B --> D
    D -->|REST API| G
    G --> F
    F -->|Validate JWT| J
    G --> H
    H --> I
    I --> K
    H -.->|Phase 4| L
    H -.->|Phase 4| M
    H -.->|Phase 4| N
    H -.->|Phase 2| O
```

---

## Module Architecture

```mermaid
graph LR
    subgraph "Platform Modules"
        M1["📚 Learning Platform"]
        M2["🎯 Prompt Challenges"]
        M3["🗺️ Learning Roadmaps"]
        M4["🧪 Prompt Playground"]
        M5["🏛️ System Design"]
    end

    subgraph "Core Services"
        S1["Article Service"]
        S2["Challenge Service"]
        S3["Roadmap Service"]
        S4["Prompt Engine"]
        S5["User Progress"]
    end

    M1 --> S1
    M2 --> S2
    M3 --> S3
    M4 --> S4
    M5 --> S1
    M1 --> S5
    M2 --> S5
    M3 --> S5
```

---

## Database Schema (ERD)

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text username UK
        text display_name
        text avatar_url
        text bio
        timestamptz created_at
        timestamptz updated_at
    }

    ARTICLES {
        uuid id PK
        text title
        text slug UK
        text content
        text excerpt
        text category
        text difficulty
        uuid author_id FK
        text[] tags
        boolean published
        timestamptz created_at
        timestamptz updated_at
    }

    CHALLENGES {
        uuid id PK
        text title
        text description
        text difficulty
        text category
        text starter_prompt
        text expected_output
        text[] hints
        int points
        timestamptz created_at
    }

    ROADMAPS {
        uuid id PK
        text title
        text level
        text description
        jsonb topics
        int estimated_hours
        timestamptz created_at
    }

    USER_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid article_id FK
        boolean completed
        timestamptz completed_at
    }

    PROFILES ||--o{ ARTICLES : "authors"
    PROFILES ||--o{ USER_PROGRESS : "tracks"
    ARTICLES ||--o{ USER_PROGRESS : "tracked in"
```

---

## API Architecture

### Base URL: `/api/v1`

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/articles` | GET | No | List published articles |
| `/articles/{id}` | GET | No | Get article detail |
| `/challenges` | GET | No | List challenges |
| `/roadmaps` | GET | No | List roadmaps |
| `/auth/signup` | POST | No | Register new user |
| `/auth/login` | POST | No | Login user |
| `/user/progress` | GET | Yes | Get user progress |
| `/user/progress` | POST | Yes | Update progress |

### Future Endpoints (Phase 4+)
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/playground/run` | POST | Yes | Execute prompt |
| `/playground/models` | GET | No | List available models |

---

## Security Architecture

1. **Authentication**: Supabase Auth handles user registration & login
2. **Authorization**: JWT tokens validated on every protected request
3. **Database Security**: Row-Level Security (RLS) policies on all tables
4. **API Security**: CORS configured, rate limiting (future)
5. **Secrets Management**: Environment variables, never committed to Git

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production"
        V["Vercel CDN"]
        R["Railway / Fly.io"]
        S["Supabase Cloud"]
    end

    subgraph "Development"
        L1["localhost:3000"]
        L2["localhost:8000"]
        L3["Supabase Cloud / Local"]
    end

    V -->|API Calls| R
    R -->|SQL| S
    L1 -->|API Calls| L2
    L2 -->|SQL| L3
```

---

## Development Phases

| Phase | Scope | Timeline |
|-------|-------|----------|
| **Phase 1** | Platform Setup (repo, backend, frontend, DB) | Week 1 |
| **Phase 2** | Core Learning Platform (articles, search) | Week 2 |
| **Phase 3** | Practice System (challenges, progress) | Week 3 |
| **Phase 4** | Prompt Playground | Week 4 |
| **Phase 5** | Beta Launch & Deployment | Week 4+ |
