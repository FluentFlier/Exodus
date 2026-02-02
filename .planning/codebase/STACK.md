# Technology Stack

**Analysis Date:** 2026-02-02

## Languages

**Primary:**
- TypeScript 5.9.3 - Used for all application code and configuration
- JSX/TSX - Used for React components in `.tsx` files

**Secondary:**
- JavaScript - PostCSS configuration (`.mjs`)

## Runtime

**Environment:**
- Node.js (inferred from package.json, version not pinned)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present and up-to-date

## Frameworks

**Core:**
- Next.js 15.5.7 - Full-stack React framework for web application
- React 19.2.3 - UI library and component framework
- React-DOM 19.2.3 - React DOM rendering library

**Styling:**
- Tailwind CSS 3.4.17 - Utility-first CSS framework for styling
- PostCSS 8.4.49 - CSS transformation tool
- Autoprefixer 10.4.20 - Automatically adds vendor prefixes to CSS

**Collaborative Editing:**
- Yjs 13.6.29 - CRDT library for real-time collaboration
- @tiptap/react 3.18.0 - Headless editor framework
- @tiptap/starter-kit 3.18.0 - Standard editor features
- @tiptap/extension-collaboration 3.18.0 - Real-time collaboration extension
- @tiptap/extension-collaboration-cursor 2.26.2 - Cursor awareness for collaboration

**Development & Linting:**
- ESLint 9.21.0 - JavaScript/TypeScript linter
- eslint-config-next 15.2.2 - Next.js specific ESLint configuration

## Key Dependencies

**Critical:**
- @insforge/sdk 1.1.5 - InsForge backend SDK for database, auth, AI, and realtime
- @insforge/nextjs 1.1.7 - Next.js integration for InsForge (middleware, providers, API handlers)

**Infrastructure:**
- yjs 13.6.29 - CRDT implementation for real-time document collaboration
- @tiptap/* - Rich text editor with collaboration support

## Configuration

**Environment:**
- `NEXT_PUBLIC_INSFORGE_BASE_URL` - InsForge backend URL (required, public)
- `NEXT_PUBLIC_INSFORGE_ANON_KEY` - InsForge anonymous JWT key (required, public)
- Config file: `.env` (git-ignored)
- Template: `env.example`

**TypeScript:**
- Config: `tsconfig.json`
- Target: ES2017
- Module: esnext
- JSX: preserve (Next.js handles JSX)
- Path aliases: `@/*` maps to `./src/*`
- Strict mode: enabled

**Styling:**
- Config: `tailwind.config.ts`
- PostCSS: `postcss.config.mjs`
- CSS entrypoint: `src/app/globals.css`

**Build:**
- Config: `next.config.ts` (minimal, ready for customization)

## Platform Requirements

**Development:**
- Node.js (version not specified, recommend v18+)
- npm or yarn
- InsForge account with app instance deployed
- Environment variables configured (see `.env` format)

**Production:**
- Node.js runtime (typical Next.js deployment)
- Vercel (integrated in `.gitignore` for `.vercel` directory)
- InsForge backend instance running
- Environment variables: `NEXT_PUBLIC_INSFORGE_BASE_URL`, `NEXT_PUBLIC_INSFORGE_ANON_KEY`

**Browser Support:**
- Modern browsers with ES2017 support
- WebSocket support for real-time collaboration

---

*Stack analysis: 2026-02-02*
