# Exodus

Exodus is an AI grant intelligence, collaboration workspace, and submission readiness platform. It combines grant discovery, AI matching, and real-time proposal collaboration into a single workflow.

## What’s included

- Grant discovery with live ingestion and explainable matching
- Project workspaces with collaborative docs, tasks, artifacts, and AI agents
- Team invites with tokenized acceptance and email notifications
- Submission package export (ZIP)
- Collaborator directory with filtering

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Create a `.env` file from `env.example` and fill values:

```env
NEXT_PUBLIC_INSFORGE_BASE_URL=...
NEXT_PUBLIC_INSFORGE_ANON_KEY=...
RESEND_API_KEY=...
INGEST_API_KEY=...
INSFORGE_LLM_MODEL=openai/gpt-4o-mini
INSFORGE_EMBEDDING_MODEL=openai/text-embedding-3-small
APP_BASE_URL=http://localhost:3000
```

## InsForge setup (MCP)

Use MCP tools for infrastructure:

1) Deploy schema
- Apply `src/lib/schema.sql` using `run-raw-sql`.

2) Create storage bucket
- Create a private `artifacts` bucket using `create-bucket`.

3) Create scheduled ingestion function
- Function file: `insforge/functions/scout-grants.js`
- Create function with `create-function` (slug `scout-grants`).
- Schedule it every 30 minutes in the InsForge dashboard.
  - Suggested cron: `*/30 * * * *`

## Grant ingestion

- Manual refresh: click “Run Grant Scout” on the Grants page.
- API: `POST /api/ai/scout` with `x-api-key: INGEST_API_KEY` for scheduled/automation calls.
- Sources list: `src/data/grant_sources.json` (100+ sources).

## Collaborator directory seeding

- Seed from OpenAlex via `POST /api/collaborators/seed` (login or `x-api-key`).
- Includes Arizona State University + additional top research universities.

## Common commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — linting

## Notes

- AI models are resolved through InsForge model gateway.
- RLS is not enabled by default; add policies as needed before production.
- For private storage buckets, artifact URLs are signed on request.
