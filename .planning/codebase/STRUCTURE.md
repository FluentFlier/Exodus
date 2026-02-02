# Codebase Structure

**Analysis Date:** 2026-02-02

## Directory Layout

```
/Users/anirudhmanjesh/Hackathons/pia/
├── src/
│   ├── app/                      # Next.js App Router (file-based routing)
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Authentication handlers
│   │   │   │   └── route.ts
│   │   │   ├── grants/           # Grant operations
│   │   │   │   └── match/
│   │   │   │       └── route.ts
│   │   │   ├── profile/          # User profile management
│   │   │   │   └── route.ts
│   │   │   └── seed/             # Development data seeding
│   │   │       └── route.ts
│   │   ├── grants/               # Grants discovery page
│   │   │   └── page.tsx
│   │   ├── login/                # Authentication page
│   │   │   └── page.tsx
│   │   ├── onboarding/           # User profile setup
│   │   │   └── page.tsx
│   │   ├── projects/             # Project workspace
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Home page
│   │   ├── providers.tsx         # InsForge context provider
│   │   ├── globals.css           # Global styles
│   │   └── (optional)            # Route groups (unused)
│   ├── components/               # Reusable React components
│   │   ├── editor/
│   │   │   └── Editor.tsx        # Collaborative editor with TipTap
│   │   └── project/
│   │       ├── ArtifactsList.tsx # File uploads (stub)
│   │       ├── TaskList.tsx      # Task management (stub)
│   │       └── TeamList.tsx      # Collaborators (stub)
│   ├── lib/                      # Utilities and configurations
│   │   ├── database.types.ts     # TypeScript database schema
│   │   ├── insforge.ts           # InsForge client singleton
│   │   └── yjs-insforge-provider.ts  # Custom Yjs provider
│   └── middleware.ts             # Auth middleware for all routes
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # (implicit) Next.js configuration
├── tailwind.config.js            # TailwindCSS configuration (implicit)
├── .env                          # Environment variables (not committed)
├── .planning/
│   └── codebase/                 # GSD documentation (this file)
├── node_modules/                 # Dependencies
├── .git/                         # Version control
└── .next/                        # Build output
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router - contains all routes and pages
- Contains: Page components (.tsx), API route handlers (.ts), layouts, middleware
- Key files: `layout.tsx`, `providers.tsx`, `middleware.ts`, `page.tsx`

**src/app/api/:**
- Purpose: Server-side API endpoints
- Contains: Route handlers using Next.js request/response API
- Pattern: Each folder becomes a route; `route.ts` exports methods (GET, POST, etc.)

**src/app/api/auth/:**
- Purpose: Authentication operations (sign-up, sign-in, sign-out)
- Contains: Delegated handlers from @insforge/nextjs
- Key file: `src/app/api/auth/route.ts`

**src/app/api/grants/match/:**
- Purpose: Vector similarity matching between user profile and available grants
- Contains: RPC call to backend match_grants function
- Key file: `src/app/api/grants/match/route.ts`

**src/app/api/profile/:**
- Purpose: Update user profile and generate embedding
- Contains: Profile upsert with AI-generated text embedding
- Key file: `src/app/api/profile/route.ts`

**src/app/api/seed/:**
- Purpose: Development utility for populating sample grants
- Contains: Sample grant data and embedding generation
- Key file: `src/app/api/seed/route.ts`
- Usage: Triggered manually via `/api/seed` during development

**src/app/login/:**
- Purpose: Authentication entry point
- Contains: Sign-in and sign-up form
- Key file: `src/app/login/page.tsx`

**src/app/grants/:**
- Purpose: Grant discovery and browsing dashboard
- Contains: Recommended grants list + all grants list
- Key file: `src/app/grants/page.tsx`

**src/app/onboarding/:**
- Purpose: Post-signup user profile completion
- Contains: Profile form (institution, bio, tags, methods, collaboration status)
- Key file: `src/app/onboarding/page.tsx`

**src/app/projects/[id]/:**
- Purpose: Individual grant application workspace
- Contains: Collaborative editor, team panel, tasks panel, artifacts panel
- Key file: `src/app/projects/[id]/page.tsx`
- Pattern: Dynamic route using [id] for project ID parameter

**src/components/:**
- Purpose: Reusable UI components (not tied to routes)
- Contains: 'use client' components for client-side interactivity
- Pattern: Components receive data via props, no direct data fetching

**src/components/editor/:**
- Purpose: Collaborative document editor
- Key file: `src/components/editor/Editor.tsx`
- Integrates: TipTap editor + Yjs + InsForge realtime

**src/components/project/:**
- Purpose: Project workspace panels
- Key files:
  - `TeamList.tsx` - Collaborator list (stub, not implemented)
  - `TaskList.tsx` - Task management (stub, not implemented)
  - `ArtifactsList.tsx` - File uploads (stub, not implemented)

**src/lib/:**
- Purpose: Shared utilities and client initialization
- Key files:
  - `database.types.ts` - TypeScript schema definitions
  - `insforge.ts` - Global InsForge client factory
  - `yjs-insforge-provider.ts` - Custom Yjs provider

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapping entire app with InsforgeProvider
- `src/app/page.tsx`: Home page (splash screen)
- `src/middleware.ts`: Auth middleware protecting routes
- `src/app/providers.tsx`: Client context provider for InsForge

**Configuration:**
- `tsconfig.json`: TypeScript compiler options (strict mode, path aliases @/*)
- `package.json`: Dependencies and scripts
- `.env`: Environment variables (NEXT_PUBLIC_INSFORGE_BASE_URL, NEXT_PUBLIC_INSFORGE_ANON_KEY)

**Core Logic:**
- `src/app/api/profile/route.ts`: Embedding generation + profile upsert
- `src/app/api/grants/match/route.ts`: Vector similarity RPC
- `src/lib/yjs-insforge-provider.ts`: Real-time sync implementation
- `src/components/editor/Editor.tsx`: Collaborative editor setup

**Testing:**
- No test files present (Not implemented)

## Naming Conventions

**Files:**
- Pages: `[name]/page.tsx` (e.g., `login/page.tsx`)
- API routes: `route.ts` with exported methods (e.g., `export const POST = ...`)
- Components: PascalCase, e.g., `Editor.tsx`, `TeamList.tsx`
- Utilities: camelCase, e.g., `insforge.ts`, `database.types.ts`

**Directories:**
- Routes: lowercase with hyphens (e.g., `/projects`, `/grants`, `/login`)
- Dynamic segments: square brackets (e.g., `[id]` for project ID)
- Feature grouping: lowercase plural (e.g., `components/`, `lib/`)

**TypeScript Types:**
- Database types: Interface names match table names (e.g., `profiles`, `grants`)
- Component props: `{PropsType}Props` (e.g., `TeamListProps`)
- Generic utility types: UPPER_CASE (e.g., `Json`, `Database`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/app/[feature-name]/page.tsx` for pages, `src/app/api/[feature]/route.ts` for API
- Tests: (Not applicable - no test infrastructure)
- Example: To add a collaborator invite feature:
  - Create `/api/projects/[id]/invite` with POST handler
  - Add invite button to `src/components/project/TeamList.tsx`
  - Update TeamList to fetch collaborators on mount

**New Component/Module:**
- Implementation: `src/components/[category]/ComponentName.tsx`
- Pattern: Always use 'use client' directive if component uses hooks
- Example: Create `src/components/grant/GrantDetails.tsx` for grant detail view

**Utilities & Helpers:**
- Shared helpers: `src/lib/[category].ts`
- Example: `src/lib/embeddings.ts` for embedding utilities
- Pattern: Export pure functions or singleton instances

**Database Schema Changes:**
- Type definitions: Update `src/lib/database.types.ts` with new Table interface
- Pattern: Add Row, Insert, and Update variants for each table
- Keep in sync with backend InsForge schema

**API Endpoints:**
- Location: `src/app/api/[resource]/[action]/route.ts`
- Pattern: One route file per endpoint, export GET/POST/PUT/DELETE handlers
- Security: Always check auth via `auth()` from @insforge/nextjs/server
- Example: `src/app/api/artifacts/upload/route.ts` for file handling

## Special Directories

**src/app/api/auth/:**
- Purpose: Authentication flow
- Generated: Route handlers auto-generated by @insforge/nextjs
- Committed: Yes (generated at build-time from insforge config)

**node_modules/:**
- Purpose: Dependencies
- Generated: Yes (from package.json via npm install)
- Committed: No

**.next/:**
- Purpose: Build output and Next.js cache
- Generated: Yes (via next build/next dev)
- Committed: No

**.planning/codebase/:**
- Purpose: GSD documentation (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: No (manually maintained)
- Committed: Yes

---

*Structure analysis: 2026-02-02*
