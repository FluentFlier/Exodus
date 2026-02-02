# Coding Conventions

**Analysis Date:** 2026-02-02

## Naming Patterns

**Files:**
- React components: PascalCase (`Editor.tsx`, `TeamList.tsx`, `ArtifactsList.tsx`)
- Pages: kebab-case with brackets for dynamic routes (`[id]/page.tsx`, `login/page.tsx`)
- API routes: kebab-case in directory structure (`api/grants/match/route.ts`)
- Utilities and helpers: camelCase (`insforge.ts`, `yjs-insforge-provider.ts`)
- Types: PascalCase with `.types` suffix (`database.types.ts`)

**Functions:**
- camelCase for all function names
- Async functions: same camelCase convention (`fetchGrants`, `handleSubmit`, `startProject`)
- React component functions: exported as `default` or named exports in PascalCase
- Internal helper functions: camelCase within components

**Variables:**
- camelCase for all variable declarations
- State variables: descriptive names (`isSignUp`, `formData`, `loading`, `recommended`)
- Hook names follow React conventions (`useEffect`, `useState`, `useRouter`, `useParams`)
- Event handlers: `handle` prefix (`handleSubmit`, `handleChange`)

**Types:**
- Interface/Type names: PascalCase (`InitialAuthState`, `Database`)
- Generic type parameters: single letter or PascalCase (`T`, `Database`)
- Props type objects: `PropsType` or component name + `Props`

## Code Style

**Formatting:**
- No explicit formatter configured in project
- Indentation: 4 spaces observed in code files
- Line length: no strict limit enforced, but generally reasonable
- Semicolons: consistently used at end of statements

**Linting:**
- ESLint configured via `eslint: ^9.21.0` and `eslint-config-next: ^15.2.2`
- Next.js ESLint rules applied through `eslint-config-next`
- No custom `.eslintrc` file present; uses Next.js defaults
- No strict type checking configuration visible beyond TypeScript strict mode

## Import Organization

**Order:**
1. External packages (`react`, `next/*`, `@tiptap/*`, `yjs`)
2. Internal imports from `@insforge/*`
3. Local imports using path aliases (`@/lib`, `@/components`)
4. Relative imports (less common)

**Path Aliases:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)
- Consistently used throughout: `@/lib/yjs-insforge-provider`, `@/components/editor/Editor`, `@/lib/database.types`

**Import Statements:**
```typescript
// External packages first
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Third-party libraries
import { createClient } from '@insforge/sdk';
import { useEditor, EditorContent } from '@tiptap/react';

// Internal aliases
import { InsForgeProvider } from '@/lib/yjs-insforge-provider';
import CollaborativeEditor from '@/components/editor/Editor';
```

## Error Handling

**Patterns:**
- Try-catch blocks used in async API routes and event handlers
- Error objects logged to console: `console.error('Error message:', error)`
- Generic error catch: `catch (error: any)` used throughout
- Error responses returned as JSON with status codes
- Client-side: alert() used for user feedback in some cases (basic approach)

**API Route Pattern:**
```typescript
export async function POST(request: Request) {
    try {
        // Main logic
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error message:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
```

**Authorization Pattern:**
- Token-based auth checked early in request
- Returns 401 if token missing: `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
- Returns 404 for missing resources
- Type coercion: `as any` used for vector/complex types

## Logging

**Framework:** Console API (`console.error`, `console.log`)

**Patterns:**
- Error logging: `console.error('Context:', error)` in catch blocks
- Info logging: `console.log('Processing:', value)` for seed operations
- No structured logging framework present
- Logs appear in server console and browser console depending on context

**Examples:**
```typescript
// Server-side
console.error('Profile update error:', error);

// Seed operation
console.log(`Embedding: ${grant.title}`);

// No logging visible in client components for normal operations
```

## Comments

**When to Comment:**
- Sparse commenting observed; code is generally self-documenting
- Complex logic steps numbered in comments: `// 1. Get current user`, `// 2. Generate Embedding`
- Business logic intentions documented: `// Use user token for RLS`
- Type casting explained: `// Vector type casting`

**JSDoc/TSDoc:**
- Minimal use of JSDoc throughout codebase
- Some type imports use `type` keyword: `import type { Metadata } from 'next'`
- No consistent JSDoc blocks for function documentation

**Example Comment Pattern:**
```typescript
// Generate Embedding (Bio + Tags)
const textToEmbed = `${bio} Tags: ${tags.join(', ')}`;

// Using InsForge AI (OpenAI compatible)
const embeddingResponse = await insforge.ai.embeddings.create({...});

// 2. Update Profile
// We need the user ID from the token, the client handles it if we use the token
```

## Function Design

**Size:**
- Most functions range 10-50 lines
- Page components tend toward 100-140 lines with JSX
- Handler functions keep logic concise, delegate to API endpoints

**Parameters:**
- Destructuring used for props: `({ projectId, docId }: { projectId: string; docId: string })`
- Inline type annotations for function parameters
- Optional parameters used sparingly; defaults set in initialization

**Return Values:**
- Components return JSX elements or null
- API handlers return `NextResponse.json(...)`
- Async functions return promises or undefined
- Early returns used for validation checks

**Example:**
```typescript
export default function GrantCard({
  grant,
  isRecommended,
  onStart
}: {
  grant: any,
  isRecommended?: boolean,
  onStart: () => void
}) {
  return (...);
}
```

## Module Design

**Exports:**
- Named exports used for utility functions and types
- Default exports used for React components and page routes
- Client components marked with `'use client'` directive

**Barrel Files:**
- Not used in current structure
- Each component/utility imported directly from its file

**Client vs Server:**
- `'use client'` marks interactive components requiring React hooks
- Server components (API routes) use async functions with `Request` parameter
- Server utilities can be imported without client marker

**Example Module Pattern:**
```typescript
// lib/insforge.ts - Server utility
export const insforge = createClient({...});

// components/editor/Editor.tsx - Client component
'use client';
export default function CollaborativeEditor(...) {...}

// app/providers.tsx - Client provider
'use client';
export function InsforgeProvider({children, initialAuthState}: {...}) {...}
```

---

*Convention analysis: 2026-02-02*
