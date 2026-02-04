# Deployment Guide (Antigravity)

## 1) Environment variables

Set these in Antigravity and InsForge function environments:

- `NEXT_PUBLIC_INSFORGE_BASE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `RESEND_API_KEY`
- `INGEST_API_KEY`
- `INSFORGE_LLM_MODEL` (recommended `openai/gpt-4o-mini`)
- `INSFORGE_EMBEDDING_MODEL` (recommended `openai/text-embedding-3-small`)
- `APP_BASE_URL` (your deployed URL)

## 2) Database schema

Run the full schema in `src/lib/schema.sql` via InsForge `run-raw-sql`.
This includes:
- Tables
- Vector indices
- RLS policies
- RPC `match_grants`
- `collaborator_directory` table

## 3) Storage

Create a private bucket named `artifacts` in InsForge.

## 4) Edge function for scheduled ingestion

- Function source: `insforge/functions/scout-grants.js`
- Create/update function with InsForge MCP
- Schedule cron: `*/30 * * * *`

## 5) First-time data seeding

- Grants: `POST /api/ai/scout` or click **Run Grant Scout**
- Collaborators: `POST /api/collaborators/seed` or click **Seed directory**
- Optional CLI seed: `node scripts/seed-insforge.mjs`

## 6) Verify

- Visit `/grants` → confirms data + matching
- Visit `/projects` → create a project
- Visit `/profile` → run profile analysis
- Visit `/collaborators` → confirm seeded directory
