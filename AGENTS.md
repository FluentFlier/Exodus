# AGENTS
## Build/Lint/Test
- Dev: `npm run dev`; build: `npm run build`; start: `npm run start`; lint: `npm run lint`.
- Tests: not configured (no test script); single-test run not available.
## Code Style
- Language: TypeScript + Next.js App Router; use `'use client'` only for client components.
- Indentation: 4 spaces; semicolons required; keep lines reasonable.
- Imports: external packages → @insforge/* → @/* aliases → relative.
- Path alias: `@/*` maps to `src/*`; prefer aliases over relative.
- Components/Types: PascalCase; pages use Next.js file conventions.
- Functions/variables: camelCase; handlers prefixed with handle*.
- Types: prefer explicit types for props/params; use `type` imports when possible.
- Error handling: wrap async logic in try/catch; log with `console.error`.
- API routes: return `NextResponse.json` with status codes (401/404/500).
- Auth: check tokens early and return 401 when missing.
- Avoid broad `any`; only use when required by SDK typings.
- No barrel files; import directly from module files.
- Tailwind CSS: stay on v3.4.x; do not upgrade to v4.
## Agent Rules
- Cursor/Copilot rules: none found in `.cursor/` or `.github/copilot-instructions.md`.
