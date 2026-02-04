# Dev Server Instructions

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment

Create `.env` from `env.example` and set:

- `NEXT_PUBLIC_INSFORGE_BASE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `RESEND_API_KEY`
- `INGEST_API_KEY`
- `INSFORGE_LLM_MODEL`
- `INSFORGE_EMBEDDING_MODEL`
- `APP_BASE_URL` (e.g., `http://localhost:3000`)

## 3) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## 4) First-time data

- Click **Run Grant Scout** on the Grants page, or
- Call `POST /api/ai/scout` with header `x-api-key: <INGEST_API_KEY>`, or
- Click **Seed sample data** for a quick demo.

## 4a) Seed collaborator directory (OpenAlex)

- Visit `/collaborators` and click **Seed directory**, or
- Call `POST /api/collaborators/seed` (requires login or `x-api-key: <INGEST_API_KEY>`).

## 4b) One-shot seed script (grants + collaborators)

```bash
node scripts/seed-insforge.mjs
```

## 5) Scheduled ingestion (InsForge)

- Ensure the edge function `scout-grants` exists.
- Set function env vars: `APP_BASE_URL`, `INGEST_API_KEY`.
- Schedule with cron: `*/30 * * * *`.
