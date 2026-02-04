-- Enable Extensions
create extension if not exists vector;

-- Users (Profiles)
create table if not exists profiles (
  id uuid references auth.users primary key,
  full_name text,
  email text,
  institution text,
  headline text,
  bio text,
  cv_text text,
  preferences jsonb,
  embedding vector(1536), -- for profile matching
  tags text[],
  methods text[],
  collab_open boolean default false,
  collab_roles text[],
  availability text check (availability in ('low', 'medium', 'high')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Collaborator directory (public profiles)
create table if not exists collaborator_directory (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  institution text,
  headline text,
  bio text,
  tags text[],
  methods text[],
  collab_roles text[],
  availability text,
  source text,
  source_url text,
  external_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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
  eligibility_json jsonb,
  geography text[],
  categories text[],
  tags text[],
  source_url text,
  source_name text,
  source_identifier text,
  embedding vector(1536), -- for grant matching
  created_at timestamptz default now(),
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
            'under_evaluation',
            'in_preparation',
            'ready_to_submit',
            'submitted',
            'awarded',
            'declined',
            'archived'
        )
    ),
    title text,
    summary text,
    readiness_score numeric,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Team Members
create table if not exists project_members (
    project_id uuid references projects,
    user_id uuid references auth.users,
    role text,
    status text default 'accepted',
    invited_email text,
    invited_by uuid references auth.users,
    created_at timestamptz default now(),
    primary key (project_id, user_id)
);

create table if not exists project_invites (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects,
    invited_email text,
    invited_by uuid references auth.users,
    role text,
    status text default 'pending',
    token text unique,
    expires_at timestamptz,
    accepted_at timestamptz,
    created_at timestamptz default now()
);

-- Documents
create table if not exists project_docs (
    id uuid primary key default gen_random_uuid (),
    project_id uuid references projects,
    title text,
    content jsonb,
    yjs_state bytea,
    doc_type text,
    updated_at timestamptz default now(),
    created_at timestamptz default now()
);

create table if not exists doc_comments (
    id uuid primary key default gen_random_uuid(),
    doc_id uuid references project_docs,
    author_id uuid references auth.users,
    thread jsonb,
    status text default 'open',
    anchor jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists doc_suggestions (
    id uuid primary key default gen_random_uuid(),
    doc_id uuid references project_docs,
    author_id uuid references auth.users,
    payload jsonb,
    status text default 'pending',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists doc_versions (
    id uuid primary key default gen_random_uuid(),
    doc_id uuid references project_docs,
    name text,
    snapshot jsonb,
    created_by uuid references auth.users,
    created_at timestamptz default now()
);

-- Artifacts
create table if not exists artifacts (
    id uuid primary key default gen_random_uuid (),
    project_id uuid references projects,
    name text,
    storage_path text,
    file_type text,
    size_bytes bigint,
    is_required boolean default false,
    artifact_type text,
    version integer default 1,
    tags text[],
    created_at timestamptz default now()
);

-- Tasks
create table if not exists tasks (
    id uuid primary key default gen_random_uuid (),
    project_id uuid references projects,
    title text,
    status text check (
        status in ('todo', 'in_progress', 'done')
    ) default 'todo',
    assignee_id uuid references auth.users,
    due_date timestamptz,
    linked_doc_id uuid references project_docs,
    linked_artifact_id uuid references artifacts,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users,
    type text,
    message text,
    payload jsonb,
    read_at timestamptz,
    created_at timestamptz default now()
);

create table if not exists grant_feedback (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users,
    grant_id uuid references grants,
    rating integer,
    reason text,
    notes text,
    created_at timestamptz default now()
);

create table if not exists submission_packages (
    id uuid primary key default gen_random_uuid(),
    project_id uuid references projects,
    status text,
    validation_report jsonb,
    export_url text,
    checksum text,
    exported_at timestamptz,
    created_at timestamptz default now()
);

create table if not exists grant_sources (
    id uuid primary key default gen_random_uuid(),
    name text,
    url text,
    last_ingested_at timestamptz,
    created_at timestamptz default now()
);

create table if not exists ingestion_runs (
    id uuid primary key default gen_random_uuid(),
    source_id uuid references grant_sources,
    status text,
    summary jsonb,
    started_at timestamptz default now(),
    finished_at timestamptz
);

-- Vector search RPC for grant matching
create or replace function match_grants(
    query_embedding vector(1536),
    match_threshold float,
    match_count int
)
returns table (
    id uuid,
    title text,
    description text,
    funder text,
    deadline timestamptz,
    amount_min numeric,
    amount_max numeric,
    eligibility_text text,
    tags text[],
    source_url text,
    source_name text,
    source_identifier text,
    similarity float
)
language plpgsql
as $$
begin
    return query
    select
        grants.id,
        grants.title,
        grants.description,
        grants.funder,
        grants.deadline,
        grants.amount_min,
        grants.amount_max,
        grants.eligibility_text,
        grants.tags,
        grants.source_url,
        grants.source_name,
        grants.source_identifier,
        1 - (grants.embedding <=> query_embedding) as similarity
    from grants
    where grants.embedding is not null
      and 1 - (grants.embedding <=> query_embedding) > match_threshold
    order by grants.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- Performance indexes
create index if not exists grants_deadline_idx on grants (deadline);
create index if not exists grants_funder_idx on grants (funder);
create index if not exists grants_tags_idx on grants using gin (tags);
create index if not exists grants_embedding_idx on grants using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists profiles_embedding_idx on profiles using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists collaborator_institution_idx on collaborator_directory (institution);
create index if not exists collaborator_tags_idx on collaborator_directory using gin (tags);
create unique index if not exists collaborator_external_id_idx on collaborator_directory (external_id);

-- Row level security (permissive MVP policies)
alter table profiles enable row level security;
drop policy if exists profiles_all on profiles;
create policy profiles_all on profiles for all to authenticated using (true) with check (true);

alter table collaborator_directory enable row level security;
drop policy if exists collaborator_directory_read on collaborator_directory;
create policy collaborator_directory_read on collaborator_directory for select to anon, authenticated using (true);
drop policy if exists collaborator_directory_write on collaborator_directory;
create policy collaborator_directory_write on collaborator_directory for all to anon, authenticated using (true) with check (true);

alter table projects enable row level security;
drop policy if exists projects_all on projects;
create policy projects_all on projects for all to authenticated using (true) with check (true);

alter table project_members enable row level security;
drop policy if exists project_members_all on project_members;
create policy project_members_all on project_members for all to authenticated using (true) with check (true);

alter table project_invites enable row level security;
drop policy if exists project_invites_all on project_invites;
create policy project_invites_all on project_invites for all to authenticated using (true) with check (true);

alter table project_docs enable row level security;
drop policy if exists project_docs_all on project_docs;
create policy project_docs_all on project_docs for all to authenticated using (true) with check (true);

alter table doc_comments enable row level security;
drop policy if exists doc_comments_all on doc_comments;
create policy doc_comments_all on doc_comments for all to authenticated using (true) with check (true);

alter table doc_suggestions enable row level security;
drop policy if exists doc_suggestions_all on doc_suggestions;
create policy doc_suggestions_all on doc_suggestions for all to authenticated using (true) with check (true);

alter table doc_versions enable row level security;
drop policy if exists doc_versions_all on doc_versions;
create policy doc_versions_all on doc_versions for all to authenticated using (true) with check (true);

alter table artifacts enable row level security;
drop policy if exists artifacts_all on artifacts;
create policy artifacts_all on artifacts for all to authenticated using (true) with check (true);

alter table tasks enable row level security;
drop policy if exists tasks_all on tasks;
create policy tasks_all on tasks for all to authenticated using (true) with check (true);

alter table notifications enable row level security;
drop policy if exists notifications_all on notifications;
create policy notifications_all on notifications for all to authenticated using (true) with check (true);

alter table grant_feedback enable row level security;
drop policy if exists grant_feedback_all on grant_feedback;
create policy grant_feedback_all on grant_feedback for all to authenticated using (true) with check (true);

alter table submission_packages enable row level security;
drop policy if exists submission_packages_all on submission_packages;
create policy submission_packages_all on submission_packages for all to authenticated using (true) with check (true);

alter table grants enable row level security;
drop policy if exists grants_read on grants;
create policy grants_read on grants for select to anon, authenticated using (true);
drop policy if exists grants_write on grants;
create policy grants_write on grants for all to anon, authenticated using (true) with check (true);

alter table grant_sources enable row level security;
drop policy if exists grant_sources_read on grant_sources;
create policy grant_sources_read on grant_sources for select to anon, authenticated using (true);
drop policy if exists grant_sources_write on grant_sources;
create policy grant_sources_write on grant_sources for all to anon, authenticated using (true) with check (true);

alter table ingestion_runs enable row level security;
drop policy if exists ingestion_runs_read on ingestion_runs;
create policy ingestion_runs_read on ingestion_runs for select to anon, authenticated using (true);
drop policy if exists ingestion_runs_write on ingestion_runs;
create policy ingestion_runs_write on ingestion_runs for all to anon, authenticated using (true) with check (true);
