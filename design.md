# System Design & Architecture - Exodus

## 1. High-Level Architecture

Exodus follows a **Serverless / BaaS Architecture** leveraging InsForge (Supabase-based) for the backend and Next.js for the frontend.

### 1.1 Tech Stack Components
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend (BaaS)**: InsForge (PostgreSQL).
- **Authentication**: InsForge Auth (Email, OAuth).
- **Database**: PostgreSQL with PostgREST for APIs and `pgvector` for embeddings.
- **Storage**: InsForge Storage (S3-compatible) for artifacts (PDFs, images).
- **Real-time Collaboration**: 
    - **Signaling/Presence**: InsForge Realtime (WebSockets).
    - **State Management**: Y.js (CRDTs) over WebSockets provider (using standard or custom provider adapted for InsForge).
    - **Editor**: Tiptap (Prosemirror-based) integration for rich text and collaboration.
- **AI/ML**: 
    - **Embeddings**: OpenAI `text-embedding-3-small` (via InsForge AI or direct).
    - **Completions**: OpenAI `gpt-4o` (via InsForge AI) for suggestions, matching explanations.
- **DevOps/CI**: GitHub (Version Control), CodeRabbit (Code Review).

### 1.2 Data Flow
1. **User Interaction**: User interacts with Next.js frontend.
2. **Data Fetching**: Frontend calls InsForge SDK (PostgREST) to fetch Grants, Projects, Profiles.
3. **Collaboration**: Tiptap editor connects via WebSocket (InsForge Realtime or dedicated Yjs provider) to sync document state.
4. **AI Processing**: Edge Functions (Deno via InsForge) or Next.js API Routes handle AI logic (generating embeddings, ranking, suggestions).

## 2. Real-Time Collaboration Implementation

### 2.1 Editor
- Use **Tiptap** for the document editor.
- Use **Y.js** for shared state (CRDT).
- **Provider**: Connect Y.js to InsForge Realtime (broadcast channel) for propagating updates.
  - *Fallback*: If InsForge Realtime payload limits are restrictive for full doc sync, use a lightweight independent `y-websocket` server for the hackathon, or `y-webrtc`.
  - *Preferred*: `y-supabase` or similar adapter using the Realtime channels.

### 2.2 Document Data Model
- Documents are stored in `project_docs` table.
- **Snapshot Saving**: Periodically save the Y.js binary state (or JSON export) to `doc_state` column in Postgres.
- **Real-time**: Updates are ephemeral in the WS channel, persisted to DB on save/debounce.

## 3. Database Schema (InsForge/Postgres)

```sql
-- Enable Extensions
create extension vector;

-- Users (Profiles)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  institution text,
  bio text,
  embedding vector(1536), -- for profile matching
  tags text[],
  methods text[],
  collab_open boolean default false,
  collab_roles text[],
  availability text, -- 'low', 'medium', 'high'
  created_at timestamptz default now()
);

-- Grants
create table grants (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  funder text,
  deadline timestamptz,
  amount_min numeric,
  amount_max numeric,
  eligibility_text text,
  embedding vector(1536), -- for grant matching
  tags text[],
  source_url text,
  updated_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid references grants,
  owner_id uuid references auth.users,
  status text check (status in ('discovered', 'draft', 'submitted', 'awarded')),
  title text, -- customized name
  created_at timestamptz default now()
);

-- Team Members
create table project_members (
  project_id uuid references projects,
  user_id uuid references auth.users,
  role text, -- 'editor', 'viewer', 'co-pi'
  primary key (project_id, user_id)
);

-- Documents
create table project_docs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects,
  title text,
  content jsonb, -- Tiptap JSON or string content for search
  yjs_state bytea, -- Binary state for CRDT (optional)
  doc_type text, -- 'proposal', 'budget', etc.
  updated_at timestamptz default now()
);

-- Artifacts
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects,
  name text,
  storage_path text, -- InsForge Storage path
  file_type text,
  is_required boolean default false,
  created_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects,
  title text,
  status text check (status in ('todo', 'in_progress', 'done')),
  assignee_id uuid references auth.users,
  due_date timestamptz
);
```

## 4. AI & Matching Logic

### 4.1 Matching Engine
1. **Grant Ingestion**: When a grant is added, compute its embedding (Title + Description + Eligibility).
2. **User Profile**: Compute user embedding (Bio + Keywords + Methods).
3. **Similarity**: Use `pgvector` cosine distance `<->` to find best matches.
4. **Viability Score**: Combined heuristic:
   - `Match Score` (Vector similarity)
   - `Deadline Penalty` (Exponential decay as deadline approaches)
   - `Eligibility` (Boolean check via LLM if text is complex)

### 4.2 Collaborator Suggestions
- Query `profiles` using grant embedding to find relevant experts.
- Filter by `collab_open = true`.
- Rank by `availability`.

## 5. Security & Privacy
- **RLS (Row Level Security)**:
  - Grants: Publicly readable.
  - Projects: Readable by Owner + Team Members.
  - Profiles: Publicly readable (collaborator directory) or restricted based on settings.
- **Documents**: Strict RLS enforcement linked to `project_members`.

## 6. Implementation Scope (Hackathon MVP)

### Phase 1: Foundation
- [ ] Setup Next.js + InsForge.
- [ ] Database Schema Migration.
- [ ] User Auth (Sign up/Profile).

### Phase 2: Discovery & Matching
- [ ] Grant Ingestion Script (Seed data).
- [ ] Grant Discovery UI (Search/Filter).
- [ ] "Start Project" Workflow.

### Phase 3: Project Space & Collab
- [ ] Project Dashboard.
- [ ] Real-time Document Editor (Tiptap + Yjs + InsForge/WebSocket).
- [ ] Team Invites.

### Phase 4: Artifacts & Export
- [ ] File Upload (InsForge Storage).
- [ ] Submission Package Generation (ZIP export).
