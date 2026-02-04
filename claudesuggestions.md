# Exodus V3 - Improvement Plan

This document outlines all improvements needed to make Exodus V3 award-winning. Items are prioritized by impact and organized into actionable phases.

---

## Current State Assessment

**Overall Score: 6.5/10 (MVP Quality)**

| Category | Status | Notes |
|----------|--------|-------|
| Core Architecture | ✅ Solid | Next.js 15, Y.js, InsForge integration working |
| AI Agents | ⚠️ Basic | All 4 functional but lack polish |
| Real-time Collab | ⚠️ Partial | Works but unsafe persistence |
| Error Handling | ❌ Poor | Uses alert(), silent failures |
| Security | ⚠️ Gaps | In-memory rate limits, missing validation |
| UX Polish | ⚠️ Partial | Missing loading states, accessibility |

---

## Phase 1: Critical Fixes (Production Blocking)

### 1.1 Fix Editor Persistence Race Conditions
**Priority:** CRITICAL
**Files:** `src/components/editor/Editor.tsx`, `src/lib/yjs-insforge-provider.ts`

**Current Problem:**
- Auto-save every 1.2s without conflict detection (Editor.tsx:209-222)
- Concurrent users can overwrite each other's changes
- No version tracking or rollback capability

**Required Changes:**
- [ ] Add `version` field to `project_docs` table
- [ ] Implement optimistic locking on save (check version before update)
- [ ] Add conflict resolution UI when versions mismatch
- [ ] Store Y.js update deltas, not full document state
- [ ] Add error handling for sync failures in provider

**Implementation:**
```typescript
// Before saving, check version matches
const { data: current } = await db.from('project_docs').select('version').eq('id', docId).single();
if (current.version !== localVersion) {
  // Show conflict resolution UI
  return;
}
await db.from('project_docs').update({ content, version: localVersion + 1 }).eq('id', docId);
```

---

### 1.2 Standardize Error Handling
**Priority:** CRITICAL
**Files:** All API routes, all client components

**Current Problems:**
- Using `alert()` for errors (AIActions.tsx:84, ArtifactsList.tsx, TeamList.tsx)
- Silent failures in grants/page.tsx:50-54
- Inconsistent error response formats across API routes
- No error boundaries except global

**Required Changes:**
- [ ] Create toast notification system (replace all alerts)
- [ ] Create standardized API error response format
- [ ] Add error boundaries per major component
- [ ] Add retry logic for failed network requests
- [ ] Log errors with request IDs for debugging

**Toast System Implementation:**
- [ ] Create `src/components/ui/Toast.tsx` component
- [ ] Create `src/lib/toast.ts` context/hook
- [ ] Replace all `alert()` calls with `toast.error()`
- [ ] Add success toasts for mutations

**API Error Format:**
```typescript
// All API routes should return this format on error
{
  error: {
    code: 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR',
    message: 'Human readable message',
    details?: object,
    requestId?: string
  }
}
```

---

### 1.3 Input Validation & Sanitization
**Priority:** CRITICAL
**Files:** All API routes

**Current Problems:**
- No validation on most inputs (copilot/route.ts:22-26)
- File uploads have no size/type limits
- Tags/methods arrays have no length limits
- Team invite emails not validated

**Required Changes:**
- [ ] Add Zod schemas to all API routes
- [ ] Validate file uploads (max 10MB, allowed types)
- [ ] Limit array lengths (tags: 20, methods: 10)
- [ ] Validate email format on invites
- [ ] Sanitize text before LLM calls (max length)

**Files to Update:**
| Route | Validation Needed |
|-------|-------------------|
| `/api/profile` | tags[], methods[], institution, interests |
| `/api/projects` | title length, grantId exists |
| `/api/projects/[id]/artifacts` | file size, file type |
| `/api/projects/[id]/members` | email format, role enum |
| `/api/ai/copilot` | prompt length (max 10000 chars) |
| `/api/ai/compliance` | proposal length, eligibility length |

---

### 1.4 Fix Data Integrity Issues
**Priority:** CRITICAL
**Files:** `src/app/api/projects/route.ts`, `src/app/api/projects/[projectId]/artifacts/route.ts`

**Current Problems:**
- Project + tasks creation not atomic (projects/route.ts:62-84)
- Artifact upload can orphan files if DB insert fails
- No grant ID validation on project creation

**Required Changes:**
- [ ] Wrap project + members + tasks creation in transaction
- [ ] Implement cleanup for orphaned storage files
- [ ] Validate grant exists before project creation
- [ ] Add duplicate project prevention (one per grant per user)

---

## Phase 2: Security Hardening

### 2.1 Fix Rate Limiting
**Priority:** HIGH
**Files:** `src/lib/rate-limit.ts`, all AI routes

**Current Problems:**
- In-memory store resets on server restart
- Uses spoofable x-forwarded-for header
- No distributed rate limiting for multi-instance

**Required Changes:**
- [ ] Move rate limit store to Redis/Upstash
- [ ] Use authenticated user ID instead of IP when available
- [ ] Add rate limit headers to responses (X-RateLimit-*)
- [ ] Implement sliding window algorithm

---

### 2.2 Fix Auth Middleware
**Priority:** HIGH
**Files:** `src/middleware.ts`

**Current Problems:**
- Route prefix matching too loose (line 8)
- `/onboarding-admin` would match `/onboarding`
- API routes skip auth entirely

**Required Changes:**
- [ ] Use exact path matching or proper glob patterns
- [ ] Protect sensitive API routes in middleware
- [ ] Add project ownership validation on mutations
- [ ] Validate invite tokens cryptographically

---

### 2.3 Add Audit Logging
**Priority:** MEDIUM
**Files:** New `src/lib/audit.ts`

**Required Changes:**
- [ ] Create audit_logs table
- [ ] Log all mutations (create, update, delete)
- [ ] Log AI agent invocations
- [ ] Log auth events (login, logout, invite accepted)

---

## Phase 3: Complete Stub Features

### 3.1 Comments & Suggestions System
**Priority:** HIGH
**Files:** `src/components/project/CommentsPanel.tsx`, `src/components/project/SuggestionsPanel.tsx`

**Current State:** UI exists but non-functional

**Required Changes:**
- [ ] Create `comments` table (project_id, doc_id, user_id, content, position, resolved)
- [ ] Create `/api/projects/[id]/comments` CRUD routes
- [ ] Wire up CommentsPanel to API
- [ ] Add real-time sync for comments via WebSocket
- [ ] Add resolve/unresolve functionality
- [ ] Add mention support (@username)

**Database Schema:**
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  doc_id UUID REFERENCES project_docs(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  position JSONB, -- { from: number, to: number } for text selection
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

### 3.2 Document Version History
**Priority:** HIGH
**Files:** `src/app/api/projects/[projectId]/docs/versions/route.ts`

**Current State:** Endpoint exists but not implemented

**Required Changes:**
- [ ] Create `doc_versions` table (doc_id, version, content, user_id, created_at)
- [ ] Save version on significant changes (not every auto-save)
- [ ] Add version list UI in editor sidebar
- [ ] Add diff view between versions
- [ ] Add restore/rollback functionality
- [ ] Limit versions per doc (keep last 50)

---

### 3.3 Notification System
**Priority:** HIGH
**Files:** `src/app/api/notifications/route.ts`, `src/app/notifications/page.tsx`

**Current State:** Endpoints exist but no triggering logic

**Required Changes:**
- [ ] Create notification triggers for:
  - Team invite received
  - Invite accepted/declined
  - Comment added to your doc
  - Mention in comment
  - Task assigned
  - Deadline approaching (3 days, 1 day)
- [ ] Add email notifications (via InsForge or SendGrid)
- [ ] Add in-app notification dropdown in header
- [ ] Add notification preferences (email on/off per type)
- [ ] Mark as read functionality

---

### 3.4 Export to ZIP
**Priority:** MEDIUM
**Files:** `src/app/api/projects/[projectId]/export/zip/route.ts`

**Current State:** JSZip setup exists but incomplete

**Required Changes:**
- [ ] Export all project documents as .docx or .md
- [ ] Include all artifacts
- [ ] Include project metadata as JSON
- [ ] Add progress indicator for large exports
- [ ] Stream response for large files

---

### 3.5 Grant Bookmarking
**Priority:** MEDIUM
**Files:** `src/app/api/grants/feedback/route.ts`, `src/app/grants/page.tsx`

**Current State:** Endpoint exists but no implementation

**Required Changes:**
- [ ] Create `grant_bookmarks` table (user_id, grant_id)
- [ ] Add bookmark/unbookmark API
- [ ] Add bookmark button on grant cards
- [ ] Add "Saved Grants" filter/tab on grants page
- [ ] Track grant views for analytics

---

## Phase 4: AI Agent Improvements

### 4.1 Streaming Responses
**Priority:** HIGH
**Files:** `src/app/api/ai/copilot/route.ts`, `src/components/editor/Editor.tsx`

**Current Problem:** Users wait with no feedback while AI generates

**Required Changes:**
- [ ] Use streaming API from InsForge/OpenAI
- [ ] Return Server-Sent Events or ReadableStream
- [ ] Update editor to handle streaming insertion
- [ ] Show "typing" indicator while generating

---

### 4.2 Agent Memory & State
**Priority:** MEDIUM
**Files:** All AI routes

**Current Problem:** Agents have no memory between calls

**Required Changes:**
- [ ] Create `agent_sessions` table (user_id, agent_type, context)
- [ ] Store conversation history per project
- [ ] Allow agents to reference previous interactions
- [ ] Add "regenerate" with feedback option

---

### 4.3 Standardize Scoring
**Priority:** MEDIUM
**Files:** `src/app/api/ai/compliance/route.ts`, `src/app/api/ai/review/route.ts`

**Current Problem:** Compliance uses 0-100, Review uses 1-9 NIH scale

**Required Changes:**
- [ ] Normalize all scores to 0-100
- [ ] Add clear thresholds (< 40 fail, 40-70 needs work, > 70 good)
- [ ] Add score explanations in UI
- [ ] Color-code scores consistently

---

### 4.4 Cost Tracking
**Priority:** LOW
**Files:** New `src/lib/ai-usage.ts`

**Required Changes:**
- [ ] Track tokens used per request
- [ ] Store usage per user/project
- [ ] Add usage dashboard for admins
- [ ] Set usage limits per user tier (if applicable)

---

## Phase 5: UX Polish

### 5.1 Loading States
**Priority:** HIGH
**Files:** All list components

**Current Problem:** Just shows "Loading..." text

**Required Changes:**
- [ ] Create skeleton loader components
- [ ] Add shimmer animation
- [ ] Use skeletons in:
  - TaskList
  - ArtifactsList
  - TeamList
  - Grants page (cards)
  - Project page

---

### 5.2 Empty States with CTAs
**Priority:** MEDIUM
**Files:** All list components

**Current Problem:** "No tasks yet" but no action button

**Required Changes:**
- [ ] Add action buttons to empty states:
  - TaskList: "Create first task" button
  - ArtifactsList: "Upload file" button
  - TeamList: "Invite teammate" button
  - Grants: "Update profile for recommendations" link
- [ ] Add helpful illustrations or icons

---

### 5.3 Accessibility
**Priority:** MEDIUM
**Files:** All components

**Current Problems:**
- Missing ARIA labels
- No keyboard navigation for modals
- Focus not managed on modal open/close

**Required Changes:**
- [ ] Add aria-label to all interactive elements
- [ ] Add ESC key handler to all modals
- [ ] Add focus trap in modals
- [ ] Add skip links for keyboard users
- [ ] Ensure 4.5:1 contrast ratio on all text
- [ ] Add role attributes where needed

---

### 5.4 Mobile Responsiveness
**Priority:** MEDIUM
**Files:** `src/components/editor/Editor.tsx`, `src/app/projects/[id]/page.tsx`

**Current Problems:**
- Editor has fixed min-h-[500px]
- Project page grid may overflow on small screens
- Some buttons too small for touch

**Required Changes:**
- [ ] Make editor height responsive (min-h-[300px] on mobile)
- [ ] Stack project layout vertically on mobile
- [ ] Ensure 44px minimum touch target size
- [ ] Test and fix all breakpoints

---

### 5.5 Animations & Transitions
**Priority:** LOW
**Files:** Global styles, components

**Current Problem:** UI feels instant/jarring

**Required Changes:**
- [ ] Add page transitions
- [ ] Add list item enter/exit animations
- [ ] Add button hover/press feedback
- [ ] Add modal open/close animations
- [ ] Keep animations subtle (< 300ms)

---

## Phase 6: Real-time Collaboration Enhancements

### 6.1 Better Cursor Presence
**Priority:** MEDIUM
**Files:** `src/components/editor/Editor.tsx`

**Current State:** Shows colored cursors but minimal info

**Required Changes:**
- [ ] Show user name next to cursor
- [ ] Show user avatar in presence list
- [ ] Add "following" mode (follow another user's view)
- [ ] Show who's currently editing each section

---

### 6.2 Conflict Resolution UI
**Priority:** MEDIUM
**Files:** `src/components/editor/Editor.tsx`, `src/lib/yjs-insforge-provider.ts`

**Required Changes:**
- [ ] Detect when remote changes merge with local
- [ ] Show subtle indicator "Changes merged from [User]"
- [ ] Highlight recently changed sections briefly
- [ ] Add undo for merged changes

---

### 6.3 Offline Support
**Priority:** LOW
**Files:** `src/lib/yjs-insforge-provider.ts`

**Required Changes:**
- [ ] Queue changes when offline
- [ ] Show offline indicator
- [ ] Sync queued changes on reconnect
- [ ] Handle conflicts from offline period

---

## Implementation Order Recommendation

### Week 1: Critical Fixes
1. Toast notification system (replace alerts)
2. API error standardization
3. Input validation with Zod
4. Editor conflict detection

### Week 2: Security + Core Features
1. Fix rate limiting (Redis)
2. Auth middleware hardening
3. Comments system
4. Version history

### Week 3: AI + UX
1. Streaming AI responses
2. Skeleton loaders
3. Empty states with CTAs
4. Notification system

### Week 4: Polish
1. Accessibility fixes
2. Mobile responsiveness
3. Grant bookmarking
4. Animations

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/ui/Toast.tsx` | Toast notification component |
| `src/components/ui/Skeleton.tsx` | Skeleton loader component |
| `src/lib/toast.ts` | Toast context and hook |
| `src/lib/validation.ts` | Zod schemas for API routes |
| `src/lib/audit.ts` | Audit logging utility |
| `src/lib/ai-usage.ts` | AI cost tracking |

---

## Database Migrations Needed

```sql
-- 1. Document versioning
ALTER TABLE project_docs ADD COLUMN version INTEGER DEFAULT 1;

CREATE TABLE doc_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES project_docs(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content JSONB NOT NULL,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  doc_id UUID REFERENCES project_docs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  position JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Grant bookmarks
CREATE TABLE grant_bookmarks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  grant_id UUID REFERENCES grants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, grant_id)
);

-- 4. Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AI usage tracking
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES projects(id),
  agent_type VARCHAR(20) NOT NULL,
  tokens_used INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Success Metrics

After implementing these improvements, measure:

| Metric | Target |
|--------|--------|
| Error rate | < 0.1% of requests |
| Page load time | < 2s on 3G |
| Time to first paint | < 1s |
| Accessibility score | 100 (Lighthouse) |
| Editor sync latency | < 100ms |
| AI response start | < 500ms (streaming) |
| User task completion | > 90% |

---

## Notes

- All changes should maintain backward compatibility
- Run existing tests after each phase
- Add new tests for critical paths
- Document API changes in OpenAPI/Swagger
- Update CLAUDE.md with new patterns as implemented
