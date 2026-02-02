# External Integrations

**Analysis Date:** 2026-02-02

## APIs & External Services

**InsForge (Primary Backend):**
- InsForge Backend - Complete backend-as-a-service for database, authentication, AI, realtime, and storage
  - SDK: `@insforge/sdk` (v1.1.5)
  - Next.js Integration: `@insforge/nextjs` (v1.1.7)
  - Base URL env: `NEXT_PUBLIC_INSFORGE_BASE_URL` (example: `https://h2iv6ua5.us-west.insforge.app`)
  - Auth key env: `NEXT_PUBLIC_INSFORGE_ANON_KEY` (JWT token for anonymous access)

**AI Integration (via InsForge):**
- OpenAI-compatible embeddings API (InsForge provides)
  - Model: `text-embedding-3-small`
  - Used for: Profile embeddings, grant embeddings, semantic matching
  - Files: `src/app/api/seed/route.ts`, `src/app/api/profile/route.ts`
  - Method: `insforge.ai.embeddings.create()` with text input

## Data Storage

**Databases:**
- InsForge PostgreSQL Database (managed)
  - Connection: Via `@insforge/sdk` client with JWT token authentication
  - Client: `@insforge/sdk` with `.from('table_name')` query interface
  - Tables:
    - `profiles` - User profiles with embeddings for matching
    - `grants` - Grant opportunities with embeddings for matching
    - `projects` - Grant application projects
    - `project_members` - Project team members
    - `project_docs` - Collaborative documents with Yjs state
    - `artifacts` - Project deliverables/files
    - `tasks` - Project tasks and tracking
  - Schema: Defined in `src/lib/database.types.ts`
  - RLS (Row Level Security): Enforced via InsForge auth tokens

**File Storage:**
- InsForge Storage (managed file storage)
  - Used for: Project artifacts, deliverables
  - Access: Via InsForge SDK with token-based auth
  - Field in DB: `artifacts.storage_path` stores references

**Caching:**
- Not explicitly configured
- Yjs local state caching for collaborative documents

## Authentication & Identity

**Auth Provider:**
- InsForge OAuth/JWT-based authentication
  - Implementation: Server-side auth via `@insforge/nextjs/server`
  - Middleware: `InsforgeMiddleware` in `src/middleware.ts`
  - Public routes: `/`, `/login`, `/signup`, `/onboarding`
  - Protected routes: All others require valid InsForge auth token
  - Client provider: `InsforgeBrowserProvider` in `src/app/providers.tsx`
  - Token retrieval: `auth()` function from `@insforge/nextjs/server` in API routes
  - User retrieval: `insforge.auth.getUser(token)` for getting current user

**Auth Flow:**
1. User lands on public route (login)
2. InsForge auth handlers at `src/app/api/auth/route.ts` handle OAuth flow
3. Token stored in browser/session by InsForge
4. API routes use token for server-side access via `auth()` or client creation
5. Middleware enforces auth on protected routes

## Monitoring & Observability

**Error Tracking:**
- Not detected. Console logging used with `console.error()` in API routes
  - Files: `src/app/api/grants/match/route.ts`, `src/app/api/profile/route.ts`, `src/app/api/seed/route.ts`

**Logs:**
- Server-side: `console.error()` and `console.log()` in Next.js API routes
- Browser: Standard console logging (not configured)
- No centralized logging service detected

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `.vercel/` in .gitignore and Next.js optimizations)
- Alternative: Any Node.js hosting supporting Next.js

**CI Pipeline:**
- Not detected. No GitHub Actions, GitLab CI, or other CI config files found

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_INSFORGE_BASE_URL` - InsForge backend URL (must be public for browser)
- `NEXT_PUBLIC_INSFORGE_ANON_KEY` - InsForge anonymous JWT token (must be public for browser)

**Optional env vars:**
- None detected beyond the two required variables

**Secrets location:**
- `.env` file (git-ignored per `.gitignore`)
- `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local` also git-ignored
- Template: `env.example` with placeholder values

## Webhooks & Callbacks

**Incoming:**
- Not detected. No webhook endpoints implemented.

**Outgoing:**
- Realtime pubsub via InsForge (file `src/lib/yjs-insforge-provider.ts`)
  - Channel-based messaging for collaborative document sync
  - Method: `client.realtime.publish(channelId, 'y-update', {...})`
  - Subscription: `client.realtime.subscribe(channelId)`
  - Event: `'y-update'` carries Yjs document updates (base64 encoded)

## Data Flow Summary

**User Onboarding → Embedding Generation:**
1. User posts to `src/app/api/profile/route.ts` with bio, tags, methods
2. API creates InsForge client with user's auth token
3. Calls `insforge.ai.embeddings.create()` for semantic embedding
4. Upserts profile in `profiles` table with embedding
5. Returns success response

**Grant Matching:**
1. User requests POST to `src/app/api/grants/match/route.ts`
2. API retrieves user's profile embedding from database
3. Calls `insforge.rpc('match_grants', {...})` with embedding
4. RPC uses PostgreSQL vector similarity (pgvector) to find matches
5. Returns top 5 matching grants with threshold 0.3

**Seed Grants:**
1. GET `src/app/api/seed/route.ts` initializes sample grants
2. For each grant, generates embedding via `insforge.ai.embeddings.create()`
3. Upserts all grants into `grants` table with embeddings
4. Used for initial data population

**Real-time Collaboration:**
1. Editor opens document via `src/components/editor/Editor.tsx`
2. Yjs doc created and connected via `InsForgeProvider` (custom implementation)
3. Local edits trigger `doc.on('update', ...)` which publishes via `insforge.realtime.publish()`
4. Remote updates received via `insforge.realtime.on('y-update', ...)` and applied to Yjs doc
5. Tiptap editor binds to Yjs and renders real-time changes

---

*Integration audit: 2026-02-02*
