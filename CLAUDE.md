# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Start production server
```

## Project Overview

Exodus V3 is an AI-powered grant intelligence and collaboration platform for academic researchers. It handles grant discovery, matching, collaborative proposal writing, and submission readiness.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, InsForge (Supabase-like BaaS), Y.js + Tiptap for real-time collaborative editing.

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components (editor/, project/)
- `src/lib/` - Utilities (InsForge client, Y.js provider, database types)
- `src/middleware.ts` - Auth middleware for protected routes
- `src/providers.tsx` - React context providers

### Key Routes

**Pages:**
- `/` - Landing page (public)
- `/login` - Auth page (public)
- `/onboarding` - Profile setup post-signup (public)
- `/grants` - Grant discovery and matching (protected)
- `/projects/[id]` - Project workspace with collaborative editor (protected)

**API Routes:**
- `/api/auth/*` - InsForge auth handlers
- `/api/grants/match` - AI grant matching via pgvector embeddings
- `/api/profile` - Profile update with embedding generation
- `/api/seed` - Dev helper to populate sample grants

### InsForge Integration

InsForge provides auth, database, AI (OpenAI), storage, and realtime capabilities.

```typescript
import { createClient } from '@insforge/sdk';

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});
```

Key methods: `.auth.*`, `.from('table').*`, `.ai.embeddings.create()`, `.rpc()`, `.realtime.*`

### Real-time Collaboration

The collaborative editor uses:
1. **Y.js** - CRDT for conflict-free document sync
2. **Tiptap** - Rich text editor with Collaboration extension
3. **Custom InsForgeProvider** (`src/lib/yjs-insforge-provider.ts`) - Bridges Y.js to InsForge Realtime WebSocket

### Database Schema

Key tables in PostgreSQL:
- `profiles` - User profiles with 1536-dim embedding vectors for matching
- `grants` - Grant opportunities with embeddings
- `projects` - User projects linked to grants
- `project_members` - Team membership (editor/viewer/co-pi roles)
- `project_docs` - Documents with Tiptap JSON content and Y.js state
- `artifacts` - File attachments
- `tasks` - Project tasks (placeholder)

### AI Agents (Planned)

Four autonomous agents specified in `AGENTS.md`:
1. **Grant Scout** - Ingests and embeds new grants
2. **Compliance Officer** - Validates submission readiness
3. **Critical Reviewer** - Simulates grant review scoring
4. **Co-Pilot** - Assists with proposal drafting

## Path Alias

`@/*` maps to `./src/*` in imports.

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_INSFORGE_BASE_URL=<insforge_url>
NEXT_PUBLIC_INSFORGE_ANON_KEY=<anon_jwt>
```

## Implementation Notes

- Client components must have `'use client'` directive
- Vector embeddings use OpenAI `text-embedding-3-small` (1536 dimensions)
- Grant matching uses pgvector cosine distance via `match_grants()` RPC
- Y.js state persistence to database not yet implemented
- Row-level security policies not yet enforced
