# Testing Patterns

**Analysis Date:** 2026-02-02

## Test Framework

**Runner:**
- No test runner currently configured (Jest or Vitest not installed)
- `package.json` contains no test scripts
- No `jest.config.*` or `vitest.config.*` files present

**Assertion Library:**
- Not applicable (no testing framework configured)

**Run Commands:**
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm lint                 # Run Next.js linting
```

## Test File Organization

**Location:**
- No test files present in `/src` directory
- Zero test coverage across the codebase
- Pattern would be: co-located or separate `__tests__` directory (not yet established)

**Naming:**
- Convention not yet established; would follow: `*.test.ts`, `*.test.tsx`, `*.spec.ts`

**Structure:**
```
No tests found
```

## Test Structure

**Suite Organization:**
- No test suites currently present in codebase
- Would benefit from testing patterns for:
  - API routes (`src/app/api/*/route.ts`)
  - React components (`src/components/**/*.tsx`)
  - Utilities (`src/lib/*.ts`)

## Mocking

**Framework:**
- Not configured (would recommend Jest or Vitest with MSW for API mocking)

**Patterns:**
- No mocking patterns established yet
- Would need to mock:
  - `@insforge/sdk` client methods
  - `next/navigation` hooks (`useRouter`, `useParams`)
  - Next.js `NextResponse`
  - API calls via `fetch`

**What to Mock (Recommended):**
- InsForge SDK: `createClient`, `auth`, database queries (`.from().select()`)
- React hooks: `useState`, `useEffect`, `useRouter`
- API endpoints: All `/api/*` routes through MSW or fetch mocking
- Environment variables: Via test setup

**What NOT to Mock (Recommended):**
- React component render logic (test actual JSX output)
- Component tree interactions
- TypeScript type checking

## Fixtures and Factories

**Test Data:**
- No fixtures or factories present
- Sample data exists in seed file: `/src/app/api/seed/route.ts`

**Recommended Fixtures Location:**
- `src/__fixtures__/grants.ts` for grant data
- `src/__fixtures__/users.ts` for user/profile data
- `src/__fixtures__/projects.ts` for project data

**Example Factory Pattern (to establish):**
```typescript
// src/__fixtures__/grants.ts
export const createMockGrant = (overrides?: Partial<Grant>) => ({
  id: 'grant-1',
  title: 'Test Grant',
  description: 'Test description',
  funder: 'Test Foundation',
  amount_min: 100000,
  amount_max: 500000,
  deadline: '2026-12-31',
  tags: ['test'],
  ...overrides,
});
```

## Coverage

**Requirements:**
- No coverage requirements configured
- No coverage tools installed

**Recommended Coverage Goals:**
- API routes: 80%+ coverage (critical business logic)
- Components: 70%+ coverage (user-facing functionality)
- Utilities: 90%+ coverage

## Test Types

**Unit Tests (To be added):**
- Scope: Individual functions, components in isolation
- Approach: Test component props/outputs, utility function inputs/outputs
- Examples: `matchGrants()` logic, form validation, data transformation

**Integration Tests (To be added):**
- Scope: API routes with database-like interactions (mocked)
- Approach: Test API route handlers with mocked InsForge SDK
- Examples: `/api/profile` POST with mocked embedding, `/api/grants/match` with mocked RPC

**E2E Tests (Not configured):**
- Framework: Not configured (could use Playwright or Cypress)
- Scope: User workflows across multiple pages
- Examples: Login → Onboard → Browse Grants → Start Project

## Testable Areas (Current Code)

**API Routes (High Priority):**
- `src/app/api/auth/route.ts` - Auth handler delegation
- `src/app/api/profile/route.ts` - Profile update with embedding generation
- `src/app/api/grants/match/route.ts` - Grant matching algorithm
- `src/app/api/seed/route.ts` - Data seeding for development

**Components (Medium Priority):**
- `src/components/editor/Editor.tsx` - Collaborative editor initialization
- `src/components/project/TeamList.tsx` - Team management UI
- `src/components/project/TaskList.tsx` - Task display
- `src/app/grants/page.tsx` - Grant browsing and filtering
- `src/app/onboarding/page.tsx` - User onboarding form

**Utilities (Medium Priority):**
- `src/lib/insforge.ts` - Client initialization
- `src/lib/yjs-insforge-provider.ts` - Real-time sync provider

**Untestable/Difficult (Lower Priority):**
- `src/app/page.tsx` - Static landing page
- `src/app/layout.tsx` - Root layout structure
- `src/app/providers.tsx` - Provider setup (integration test)

## Common Patterns (To Establish)

**Async Testing (Pattern to use):**
```typescript
describe('API: POST /api/profile', () => {
  it('updates profile with embedding', async () => {
    const mockRequest = new Request('http://localhost/api/profile', {
      method: 'POST',
      body: JSON.stringify({
        institution: 'MIT',
        bio: 'AI researcher',
        tags: ['AI', 'ML'],
        methods: ['transformers'],
        collab_open: true,
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
  });
});
```

**Error Testing (Pattern to use):**
```typescript
describe('API Error Handling', () => {
  it('returns 401 when token is missing', async () => {
    const mockAuth = jest.fn().mockResolvedValue({ token: null });
    const mockRequest = new Request('http://localhost/api/profile');

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });
});
```

**Component Testing (Pattern to use):**
```typescript
import { render, screen } from '@testing-library/react';
import TeamList from '@/components/project/TeamList';

describe('TeamList Component', () => {
  it('renders invite button', () => {
    render(<TeamList projectId="123" />);
    expect(screen.getByText('+ Invite Collaborator')).toBeInTheDocument();
  });
});
```

## Setup Recommendations

**Install Testing Tools:**
```bash
npm install --save-dev vitest @vitest/ui
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event
npm install --save-dev msw msw-js
npm install --save-dev @jest/globals
```

**Config File (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Test Setup File (src/test/setup.ts):**
```typescript
import { expect, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

**Update package.json scripts:**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

---

*Testing analysis: 2026-02-02*
