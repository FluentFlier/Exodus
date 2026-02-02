-- Enable Extensions
create extension if not exists vector;

-- Users (Profiles)
create table if not exists profiles (
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
  availability text check (availability in ('low', 'medium', 'high')),
  created_at timestamptz default now()
);

-- Grants
create table if not exists grants (
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
create table if not exists projects (
    id uuid primary key default gen_random_uuid (),
    grant_id uuid references grants,
    owner_id uuid references auth.users,
    status text check (
        status in (
            'discovered',
            'draft',
            'submitted',
            'awarded'
        )
    ),
    title text, -- customized name
    created_at timestamptz default now()
);

-- Team Members
create table if not exists project_members (
    project_id uuid references projects,
    user_id uuid references auth.users,
    role text, -- 'editor', 'viewer', 'co-pi'
    primary key (project_id, user_id)
);

-- Documents
create table if not exists project_docs (
    id uuid primary key default gen_random_uuid (),
    project_id uuid references projects,
    title text,
    content jsonb, -- Tiptap JSON or string content for search
    yjs_state bytea, -- Binary state for CRDT (optional)
    doc_type text, -- 'proposal', 'budget', etc.
    updated_at timestamptz default now()
);

-- Artifacts
create table if not exists artifacts (
    id uuid primary key default gen_random_uuid (),
    project_id uuid references projects,
    name text,
    storage_path text, -- InsForge Storage path
    file_type text,
    is_required boolean default false,
    created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
    id uuid primary key default gen_random_uuid (),
    project_id uuid references projects,
    title text,
    status text check (
        status in ('todo', 'in_progress', 'done')
    ),
    assignee_id uuid references auth.users,
    due_date timestamptz
);