# Codebase Concerns

**Analysis Date:** 2026-02-02

## Tech Debt

**Multiple Redundant InsForge Client Initialization:**
- Issue: `createClient` is instantiated repeatedly in client components (`src/app/login/page.tsx`, `src/app/onboarding/page.tsx`, `src/app/grants/page.tsx`, `src/components/editor/Editor.tsx`, `src/app/projects/[id]/page.tsx`) instead of using the centralized client from `src/lib/insforge.ts`
- Files: `src/app/login/page.tsx:7-10`, `src/app/onboarding/page.tsx:7-10`, `src/app/grants/page.tsx:7-10`, `src/components/editor/Editor.tsx:11-14`, `src/app/projects/[id]/page.tsx:10-13`
- Impact: Increases bundle size, makes configuration changes harder to propagate, and violates DRY principle. Configuration drift possible if baseUrl/anonKey change.
- Fix approach: Replace all inline client instantiations with imports from `src/lib/insforge.ts`. This requires exporting the singleton client and ensuring it's used across all pages/components.

**Weak TypeScript Typing in Multiple Locations:**
- Issue: Files use `any` type extensively or loose typing for database operations
- Files: `src/app/grants/page.tsx:15` (`useState<any>`), `src/app/grants/page.tsx:49` (`insforge.auth.getUser()` without type assertion), `src/lib/yjs-insforge-provider.ts:7`, `src/lib/yjs-insforge-provider.ts:12` (`client: any`), `src/app/api/seed/route.ts:93` (`embedding as any`)
- Impact: Loss of IDE autocompletion, potential runtime errors, harder debugging. RLS (Row Level Security) violations possible if user context is lost.
- Fix approach: Use the generated `Database` type from `src/lib/database.types.ts` consistently. Import and apply type generics to `createClient<Database>()` everywhere. Type the Y.js provider client parameter properly.

**Y.js Provider Without Error Handling:**
- Issue: `InsForgeProvider` (src/lib/yjs-insforge-provider.ts) has no error handling for connection failures, reconnection logic, or channel subscription errors
- Files: `src/lib/yjs-insforge-provider.ts:26-38`
- Impact: Silent failures in real-time collaboration. Users won't know if their edits are being synced. Data loss possible if connection drops mid-update.
- Fix approach: Add try-catch in `connect()`, implement reconnection exponential backoff, emit 'error' events on connection failure, add heartbeat/keepalive mechanism.

**Incomplete Stub Components:**
- Issue: `src/components/project/ArtifactsList.tsx`, `src/components/project/TeamList.tsx`, and `src/components/project/TaskList.tsx` are non-functional placeholders with unimplemented buttons
- Files: `src/components/project/ArtifactsList.tsx:10-12`, `src/components/project/TeamList.tsx:10-12`, `src/components/project/TaskList.tsx:10-12`
- Impact: UI promises functionality that doesn't exist. Users click buttons expecting results, nothing happens. Confusing UX.
- Fix approach: Either implement these features or remove the buttons entirely. Mark components as "Coming Soon" if intentional.

**No Error Boundary Implementation:**
- Issue: Client components throughout the app don't use React Error Boundaries
- Files: All `src/app/*.tsx` and `src/components/**/*.tsx`
- Impact: Single component error crashes entire page. No graceful degradation. Users see blank/broken screens.
- Fix approach: Create `ErrorBoundary` wrapper component and apply to page routes and critical sections.

**Client-Side Data Fetching Without Loading States:**
- Issue: Multiple pages use `useState(true)` for loading but inconsistent error handling patterns
- Files: `src/app/grants/page.tsx:22-44`, `src/app/projects/[id]/page.tsx:24-33`
- Impact: Network failures silently fail with only console logs. Users don't know if data load failed or is still loading. No retry mechanism.
- Fix approach: Implement standardized fetch wrapper with loading/error/success states. Add retry logic for failed requests.

**Base64 Encoding for Binary Y.js Updates:**
- Issue: Y.js updates are base64-encoded in `src/lib/yjs-insforge-provider.ts:47` for JSON transport, but no size limits or compression
- Files: `src/lib/yjs-insforge-provider.ts:47`, `src/lib/yjs-insforge-provider.ts:35`
- Impact: Large collaborative edits become very large in network payload (~33% size increase from base64). No handling of large binary diffs. Potential WebSocket message size limits exceeded.
- Fix approach: Implement compression (gzip) before base64 encoding. Add chunk size limits. Consider binary transport if InsForge supports it.

**Seed Route Exposed in Production:**
- Issue: `src/app/api/seed/route.ts` has dev-only seed endpoint accessible from UI button (`src/app/grants/page.tsx:78`)
- Files: `src/app/api/seed/route.ts`, `src/app/grants/page.tsx:78-82`
- Impact: Can be accidentally triggered in production, duplicating grant records. No authentication check on seed endpoint.
- Fix approach: Gate behind admin check or move to CI/CD only. Remove "Dev: Seed Grants" button from UI. Implement idempotency on grants upsert.

## Known Bugs

**insforge.auth.getUser() Type Mismatch:**
- Symptoms: TypeScript error when calling `insforge.auth.getUser()` in `src/app/onboarding/page.tsx:29` - type checker complains about await/async mismatch
- Files: `src/app/onboarding/page.tsx:29`, `src/app/grants/page.tsx:49`, `src/app/api/profile/route.ts:32`, `src/app/api/grants/match/route.ts:16`
- Trigger: Run `npm run lint` or build with strict TypeScript
- Workaround: Cast result with `as` operator, but this masks the real type issue

**Project Page Won't Render if Grant Relationship Fails:**
- Symptoms: Page loads "Project not found" even if project exists, because join query `'*, grants(*)'` (src/app/projects/[id]/page.tsx:27) returns null if grant was deleted
- Files: `src/app/projects/[id]/page.tsx:25-33`
- Trigger: Delete a grant, then visit a project that references it
- Workaround: None - requires grant to exist

**InsForgeProvider Doesn't Unsubscribe from Channel:**
- Symptoms: Memory leak - channel subscription persists after component unmount
- Files: `src/lib/yjs-insforge-provider.ts:55-56` - `disconnect()` doesn't actually unsubscribe
- Trigger: Navigate away from editor page or refresh
- Workaround: None - will accumulate listeners

**Profile Embedding Updates Without Schema Validation:**
- Symptoms: Embedding vectors stored as `any` type - no validation that InsForge AI returns valid embedding arrays
- Files: `src/app/api/profile/route.ts:28`, `src/app/api/profile/route.ts:45`
- Trigger: If InsForge AI API changes response format
- Workaround: None - runtime error would occur

## Security Considerations

**Credentials Hardcoded in Environment File:**
- Risk: Anonymous key and base URL are public, but they're committed to `.env` (not in .gitignore exceptions for this file). If repo becomes public, token is exposed.
- Files: `.env` (lines 5, 8), `src/lib/insforge.ts`, `src/app/api/auth/route.ts:4`
- Current mitigation: `.env` file exists and .gitignore includes `*.env` pattern (assumed), but no verification
- Recommendations: 1) Verify `.env` is in .gitignore. 2) Use `NEXT_PUBLIC_` prefix correctly (public values only). 3) Rotate the hardcoded anonymous key in `src/app/api/auth/route.ts:4`. 4) Add secret scanning to CI/CD.

**RLS Policies Not Fully Enforced in Client Code:**
- Risk: Client components create InsForge clients with anonymous key (`anonKey`), bypassing user authentication for some operations
- Files: `src/app/login/page.tsx:7-10`, `src/app/onboarding/page.tsx:7-10`, `src/app/grants/page.tsx:7-10`, `src/components/editor/Editor.tsx:11-14`
- Current mitigation: API routes use `edgeFunctionToken` for auth, but client-side reads use anonKey
- Recommendations: 1) Use server-side fetching for authenticated endpoints. 2) Verify InsForge RLS policies block unauthorized table access. 3) Audit what data is readable with anonymous key.

**No CSRF Protection on POST Endpoints:**
- Risk: API routes (`src/app/api/*/route.ts`) don't validate origin or implement CSRF tokens
- Files: `src/app/api/profile/route.ts:5`, `src/app/api/grants/match/route.ts:5`, `src/app/api/seed/route.ts:59`
- Current mitigation: NextAuth middleware exists but no explicit CSRF checks
- Recommendations: Verify NextAuth middleware includes CSRF protection. Consider adding explicit CSRF token validation.

**Password Storage Delegated to InsForge:**
- Risk: Passwords are sent to InsForge auth system - no control over hashing/storage
- Files: `src/app/login/page.tsx:37-39`, `src/app/api/auth/route.ts`
- Current mitigation: Delegated to InsForge (assumed secure)
- Recommendations: 1) Document that InsForge handles password security. 2) Add password strength validation client-side. 3) Implement rate limiting on auth endpoints.

**Vector Embeddings Stored Unencrypted:**
- Risk: User profile embeddings are stored as plaintext, potentially revealing research interests
- Files: `src/app/api/profile/route.ts:45` (upsert call), `src/app/api/seed/route.ts:94` (grants embeddings)
- Current mitigation: InsForge RLS policies (assumed to protect)
- Recommendations: Verify InsForge encrypts vector columns at rest. Consider field-level encryption if sensitive.

## Performance Bottlenecks

**N+1 Query Pattern in Project Page:**
- Problem: Fetching project with `.select('*, grants(*)')` loads the entire grant object, but page only displays 2 fields (`title`, `funder`)
- Files: `src/app/projects/[id]/page.tsx:25-29`
- Cause: Tiptap/Y.js project queries full grants relation unnecessarily
- Improvement path: Use `.select('id, title, status, grant_id, grants(id, title, funder)')` to limit columns. Cache grant lookups. Pagination if projects scale.

**Embedding Generation on Every Profile Update:**
- Problem: Every profile save calls `insforge.ai.embeddings.create()` which is a remote API call
- Files: `src/app/api/profile/route.ts:23-26`
- Cause: No caching or batch processing
- Improvement path: Only regenerate embedding if bio/tags/methods changed. Cache embeddings server-side. Consider batch embedding API.

**Real-Time Sync Without Throttling:**
- Problem: Y.js updates broadcast on every keystroke via `handleLocalUpdate` without debouncing
- Files: `src/lib/yjs-insforge-provider.ts:43-52`
- Cause: Every character typed = one network message (base64-encoded)
- Improvement path: Implement debounced batching (e.g., flush every 500ms or 50 updates). Compress updates before sending.

**Missing Database Indexes:**
- Problem: Grants matching uses similarity search via RPC but no indication of index on embedding column
- Files: `src/app/api/grants/match/route.ts:28-32` (relies on `match_grants` RPC)
- Cause: Unknown if InsForge schema has `gin` or `ivfflat` index on embedding columns
- Improvement path: Verify InsForge schema has vector index. Add query monitoring. Consider caching top N matches.

**No Pagination on Grant Lists:**
- Problem: Grants page loads `.limit(20)` hardcoded, but if database grows no pagination UI exists
- Files: `src/app/grants/page.tsx:34-36`
- Cause: MVP approach with fixed limit
- Improvement path: Implement cursor-based or offset pagination. Add "Load More" button or infinite scroll.

**Client Component Recreation on Navigation:**
- Problem: Each page recreates InsForge client instance, losing any cached data/state
- Files: All client pages with `createClient` instantiation
- Cause: No context provider wrapping app with shared client
- Improvement path: Move InsForge client to React Context. Implement service layer for data fetching.

## Fragile Areas

**Collaborative Editor Y.js Implementation:**
- Files: `src/lib/yjs-insforge-provider.ts`, `src/components/editor/Editor.tsx`
- Why fragile: Custom provider implementation with loose typing (`any`), no error recovery, manual origin filtering (`if (origin === this)`) without test coverage. Changes to InsForge realtime API will break this.
- Safe modification: 1) Add comprehensive error boundary around editor. 2) Test conflict resolution scenarios (simultaneous edits, network splits). 3) Add logging to understand sync state. 4) Version the provider implementation and document API assumptions.
- Test coverage: No tests detected for Y.js sync logic

**Grant Matching Algorithm:**
- Files: `src/app/api/grants/match/route.ts:28-32` (calls `match_grants` RPC)
- Why fragile: Depends on external RPC implementation (in InsForge backend). Client code has no fallback if RPC fails. Threshold values hardcoded (`0.3`, `5`).
- Safe modification: 1) Wrap RPC call in fallback (return all grants if matching fails). 2) Make threshold/count configurable. 3) Add logging of match scores. 4) Cache results to reduce RPC calls.
- Test coverage: No tests detected for matching logic

**Project-Grant Relationship:**
- Files: `src/app/projects/[id]/page.tsx:27`, `src/app/grants/page.tsx:54`
- Why fragile: No foreign key validation. Creating project without checking if grant exists. Deleting grant orphans projects. Join query assumes grant exists.
- Safe modification: 1) Add server-side validation before project insert. 2) Update schema with `ON DELETE CASCADE` or `RESTRICT`. 3) Add pre-flight checks. 4) Show warning if grant deleted.
- Test coverage: No tests for project creation

**Auth Middleware Configuration:**
- Files: `src/middleware.ts`, `src/app/providers.tsx`
- Why fragile: Public routes hardcoded in middleware. Any auth route change requires middleware update. No logging of blocked requests.
- Safe modification: 1) Extract public routes to config file. 2) Log middleware decisions for debugging. 3) Add tests for auth flow. 4) Test signup redirects correctly to onboarding.
- Test coverage: No tests detected for authentication flow

## Scaling Limits

**Embedding Vector Dimension Assumption:**
- Current capacity: Hardcoded to OpenAI `text-embedding-3-small` (1536 dimensions)
- Limit: If upgraded to larger model (3072 dims), storage cost increases ~2x, query performance degrades
- Scaling path: Make model configurable. Implement vector quantization if storage becomes issue. Monitor vector search latency.

**Real-Time Collaboration Per-Project:**
- Current capacity: One Y.js document per project in memory
- Limit: No limits on number of concurrent editors detected. If project scales to 100+ simultaneous editors, memory/network could saturate.
- Scaling path: Implement document sharding (split proposal into sections). Add connection pooling. Monitor WebSocket connection count.

**Grant Database Records:**
- Current capacity: Sample data shows ~5 grants. Seed endpoint inserts 5 at a time.
- Limit: Grants table unbounded. Matching query does similarity search - latency increases with table size if no index.
- Scaling path: Implement vector index on InsForge schema. Archive old/expired grants. Pagination on browse view.

**User Profile Embeddings:**
- Current capacity: One 1536-dim vector per user profile
- Limit: Millions of users would require millions of vector embeddings. Search complexity is O(n) without index.
- Scaling path: Verify InsForge uses vector index (pgvector with HNSW). Implement caching layer.

## Dependencies at Risk

**InsForge SDK Version Pinning:**
- Risk: Project depends on `@insforge/sdk@^1.1.5` and `@insforge/nextjs@^1.1.7`. If InsForge makes breaking changes, app breaks.
- Impact: `createClient` signature changes would require code refactoring across 5+ files. RPC interface changes would break matching.
- Migration plan: 1) Lock to exact version in production. 2) Monitor InsForge changelog. 3) Test upgrades in staging. 4) Document API assumptions (e.g., `auth.getUser()` signature).

**Y.js Collaboration Extension:**
- Risk: `@tiptap/extension-collaboration@^3.18.0` is tied to specific Y.js protocol. If Tiptap upgrades incompatibly, editor breaks.
- Impact: Custom Y.js provider (`InsForgeProvider`) assumes specific Tiptap events and message format.
- Migration plan: 1) Add integration tests for editor sync before upgrading. 2) Review Tiptap changelog for breaking changes. 3) Have fallback to non-collaborative editor.

**InsForge Realtime API:**
- Risk: Custom `InsForgeProvider` assumes specific realtime channel/publish/subscribe API that may not be documented
- Impact: If InsForge refactors realtime layer, provider breaks silently
- Migration plan: 1) Document InsForge realtime API assumptions in code comments. 2) Add error logging. 3) Negotiate API stability guarantees with InsForge.

**Next.js 15 Compatibility:**
- Risk: Using `next@^15.5.7` with React 19. Rapid iteration could introduce breaking changes.
- Impact: Build failures, runtime errors in App Router or server components
- Migration plan: Pin Next.js to exact version. Test major upgrades in staging before production.

## Missing Critical Features

**No Error Boundary for Collaborative Editor:**
- Problem: If Y.js provider crashes, entire project page becomes unusable
- Blocks: Users can't recover from sync errors without page reload

**No Authentication Logging:**
- Problem: No audit trail of who logged in/signed up and when
- Blocks: Security incident investigation, compliance reporting

**No Rate Limiting on API Routes:**
- Problem: Grant matching, profile updates, and seed endpoint can be hammered without limits
- Blocks: DDoS protection, fair resource sharing

**No Data Validation on Embeddings:**
- Problem: No check that embedding API returns valid vector before storage
- Blocks: Matching queries could fail if invalid embeddings stored

**No Conflict Resolution UI for Collaborative Edits:**
- Problem: Y.js has merge algorithm but user sees no indicator of which edits won
- Blocks: Users confused about final document state in conflict scenarios

## Test Coverage Gaps

**No Tests for Collaborative Editing:**
- What's not tested: Y.js provider sync, conflict resolution, network failure recovery, concurrent edits
- Files: `src/lib/yjs-insforge-provider.ts`, `src/components/editor/Editor.tsx`
- Risk: Silent data loss or merge conflicts in production
- Priority: High

**No Tests for Grant Matching Algorithm:**
- What's not tested: Vector similarity search RPC, threshold filtering, empty result handling, malformed embeddings
- Files: `src/app/api/grants/match/route.ts`
- Risk: Incorrect grant recommendations, 500 errors, or no results returned
- Priority: High

**No Tests for Authentication Flow:**
- What's not tested: Sign up, sign in, onboarding redirection, protected route access
- Files: `src/app/login/page.tsx`, `src/middleware.ts`, `src/app/onboarding/page.tsx`
- Risk: Users locked out, auth bypass, incorrect redirects
- Priority: High

**No Tests for Project CRUD:**
- What's not tested: Create project from grant, fetch project, ensure RLS prevents unauthorized access
- Files: `src/app/grants/page.tsx` (startProject), `src/app/projects/[id]/page.tsx`
- Risk: Data leakage between users, orphaned projects
- Priority: Medium

**No Tests for API Routes:**
- What's not tested: Profile update, embedding generation, seed endpoint, grant matching endpoint
- Files: `src/app/api/**`
- Risk: Unexpected errors, missing validation, data corruption
- Priority: High

**No Tests for Type Safety:**
- What's not tested: Database type usage, InsForge client typing, React component prop types
- Files: All files using `any` type
- Risk: Runtime TypeErrors, undefined behavior
- Priority: Medium

---

*Concerns audit: 2026-02-02*
