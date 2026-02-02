# Architecture

**Analysis Date:** 2026-02-02

## Pattern Overview

**Overall:** Client-Server Next.js with InsForge Backend-as-a-Service (BaaS) + Real-time Collaborative Editor

**Key Characteristics:**
- Server-Side Rendering (SSR) and Client-Side Pages via Next.js App Router
- InsForge SDK for authentication, database, AI embeddings, and real-time communication
- Yjs for Operational Transformation (OT) in collaborative document editing
- TipTap for WYSIWYG editor integration with real-time collaboration
- Middleware-based authentication via InsForge
- Vector similarity for grant recommendation via embeddings

## Layers

**Presentation Layer:**
- Purpose: User interface components and page rendering
- Location: `src/app/` (pages), `src/components/` (reusable UI)
- Contains: React functional components using TailwindCSS for styling
- Depends on: Client SDK (InsForge), React hooks, Next.js routing
- Used by: Browser client

**API Layer:**
- Purpose: Server-side request handlers for authenticated operations
- Location: `src/app/api/`
- Contains: Route handlers for auth, profiles, grants matching, data seeding
- Depends on: InsForge SDK with user tokens, AI embeddings service
- Used by: Client-side fetch() calls

**Data Access Layer:**
- Purpose: Database abstraction and type-safe queries
- Location: `src/lib/database.types.ts`, InsForge SDK client
- Contains: TypeScript types for all tables (profiles, grants, projects, project_docs, artifacts, tasks, project_members)
- Depends on: InsForge backend services
- Used by: API routes and client pages via SDK

**Real-time Collaboration Layer:**
- Purpose: Synchronize document changes across users
- Location: `src/lib/yjs-insforge-provider.ts`, `src/components/editor/Editor.tsx`
- Contains: Custom Yjs provider bridging InsForge realtime service with TipTap editor
- Depends on: Yjs library, InsForge realtime subscription, TipTap
- Used by: Project page editor

**Authentication & Authorization:**
- Purpose: User identity verification and token management
- Location: `src/middleware.ts`, `src/app/providers.tsx`
- Contains: InsForge middleware for route protection, browser provider for context
- Depends on: InsForge authentication service
- Used by: All protected routes

## Data Flow

**User Registration & Profile Setup:**

1. User lands on `/login` → enters credentials
2. `login/page.tsx` calls `insforge.auth.signUp()` with email/password/name
3. Redirects to `/onboarding` after signup
4. Onboarding form (`onboarding/page.tsx`) collects: institution, bio, tags, methods, collab_open
5. Submits to `/api/profile` (POST)
6. API route generates embedding via OpenAI's text-embedding-3-small using bio + tags + methods
7. Upserts profile record in `profiles` table
8. Redirects to `/grants` page

**Grant Recommendation Flow:**

1. Authenticated user visits `/grants` (`grants/page.tsx`)
2. Page calls `/api/grants/match` (POST)
3. API route:
   - Retrieves user token via `auth()` from InsForge middleware
   - Fetches user profile from `profiles` table (with embedding)
   - Calls InsForge RPC `match_grants` with user embedding
   - RPC performs vector similarity search (threshold: 0.3, limit: 5)
   - Returns matched grants to client
4. Page also queries `grants` table for browse-all list (ordered by deadline)
5. Displays both recommended and all grants

**Project Creation & Collaboration:**

1. User clicks "Start Application" on a grant card
2. `grants/page.tsx` calls InsForge to create project record:
   - Inserts: grant_id, owner_id, status='draft', title='New Application'
3. Redirects to `/projects/[id]`
4. Project page (`projects/[id]/page.tsx`):
   - Fetches project with joined grant data
   - Renders three-pane layout: sidebar nav, editor, right panel
5. Editor (`components/editor/Editor.tsx`):
   - Initializes Yjs Doc
   - Creates custom InsForgeProvider for this project's channel
   - Connects TipTap editor with Yjs collaboration
   - Local edits → handleLocalUpdate → InsForge realtime publish
   - Remote updates → y-update event → apply to Yjs Doc → TipTap syncs
6. Right panels (TeamList, TaskList, ArtifactsList) fetch/display project metadata (currently stubs)

**State Management:**

- **Authentication State:** Managed by InsForge provider (`InsforgeProvider` in `providers.tsx`)
  - User token stored in browser (InsForge SDK handles)
  - Middleware protects routes
- **UI State:** Local React state (useState) in components
- **Document State:** Yjs Doc maintains shared document state with InsForge as transport
- **Database State:** InsForge as source of truth (no client-side caching strategy)

## Key Abstractions

**InsForge Client:**
- Purpose: Unified interface for auth, database, AI, and realtime
- Examples: `src/lib/insforge.ts`, instantiated in multiple pages/routes
- Pattern: Singleton-like pattern, created once per request/component with env vars

**InsForgeProvider (Custom Yjs Provider):**
- Purpose: Bridge between Yjs and InsForge realtime service
- Examples: `src/lib/yjs-insforge-provider.ts`
- Pattern: Observable-based event emitter
- Key methods: connect(), handleLocalUpdate(), disconnect()

**Database Types:**
- Purpose: Type-safe database schema with Insert/Update variants
- Examples: `src/lib/database.types.ts` defining Database interface
- Pattern: TypeScript interface with nested table definitions
- Tables: profiles, grants, projects, project_members, project_docs, artifacts, tasks

**Page Components:**
- Purpose: Route handlers combining data fetch + UI rendering
- Examples: `src/app/login/page.tsx`, `src/app/grants/page.tsx`, `src/app/projects/[id]/page.tsx`
- Pattern: Mixed server (metadata) + client rendering ('use client' for interactivity)

**UI Components:**
- Purpose: Reusable presentation without data fetching
- Examples: `src/components/editor/Editor.tsx`, `src/components/project/TeamList.tsx`
- Pattern: Pure client components receiving projectId as prop

## Entry Points

**Browser Entry:**
- Location: `src/app/layout.tsx`
- Triggers: User navigates to app domain
- Responsibilities: Wraps all routes with `InsforgeProvider` context

**Authentication Entry:**
- Location: `src/middleware.ts`
- Triggers: Every request except public routes
- Responsibilities: Verifies auth token, redirects unauthenticated users to /login

**Public Routes:**
- `/` (home)
- `/login`
- `/onboarding` (post-signup)
- `/signup` (handled by login page toggle)

**Protected Routes:**
- `/grants` (dashboard)
- `/projects/[id]` (workspace)
- `/api/*` (authenticated API)

**API Endpoints:**
- `POST /api/auth/*` - Auth handlers (sign-up, sign-in, sign-out, delete) - delegated to InsForge
- `POST /api/profile` - Update user profile + generate embedding
- `POST /api/grants/match` - RPC call to match_grants with vector similarity
- `GET /api/seed` - Development utility to populate sample grants with embeddings

## Error Handling

**Strategy:** Try-catch at API routes, error states in UI components

**Patterns:**
- API routes catch errors, log to console, return JSON with error message and 500 status
- Client components display errors via alert() or error state UI
- Unauthorized responses (401) trigger redirect to /login via middleware

## Cross-Cutting Concerns

**Logging:** console.log() in API routes (no centralized logging framework)
**Validation:** Input validation in forms (HTML5 required, minimal client-side checks)
**Authentication:** InsForge middleware handles token validation and route protection
**AI Integration:** Text embeddings via InsForge.ai.embeddings.create() using OpenAI API
**Real-time Sync:** InsForge realtime subscription for both document updates and awareness
**Type Safety:** Full TypeScript with strict mode enabled

---

*Architecture analysis: 2026-02-02*
