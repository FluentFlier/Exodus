# Exodus Handoff Plan & Todo

## Project Status
**Completed Phases 1-4 (Foundations)**
- **Auth**: Login (Custom UI), Sign Up, Onboarding (Profile Creation + Embeddings).
- **Discovery**: Grant Seeding (API), Vector Matching, Discovery UI.
- **Projects**: Project Creation, Real-time Collaborative Editor (Tiptap + Y.js).
- **Core Setup**: Database Schema, Git, Next.js, InsForge Client.

## Pending Implementation (The "Build" List)

### 1. Artifacts & Storage (Phase 5)
- [ ] **Implement File Upload Logic** (`src/components/project/ArtifactsList.tsx`)
  - Use `insforge.storage.from('artifacts').upload(...)`.
  - Store metadata in `artifacts` database table after upload.
- [ ] **Implement File List & Download**
  - Fetch from `artifacts` table.
  - Generate signed URLs for download.

### 2. Team Management (Phase 4 Completion)
- [ ] **Implement Invite UI** (`src/components/project/TeamList.tsx`)
  - Create a modal to input email.
  - API Route to lookup user by email.
  - Insert into `project_members`.
- [ ] **Implement Role Based Access**
  - Update RLS policies in `schema.sql` to strictly enforce `project_members` check.

### 3. Submission Package (Phase 5)
- [ ] **Package Export**
  - Create Button "Export Submission".
  - Backend/Edge Function to:
    - Default Doc (HTML/PDF conversion).
    - Zip Artifacts.
    - Generate Manifest.
    - Return Download Link.

### 4. AI Agent Integrations (New Phase)
- [ ] **Agent 1: Grant Scout**
  - Create Edge Function `scout-grants` scheduled hourly.
  - Implement Search API scraper to seed `grants` table.
- [ ] **Agent 2: Compliance Officer**
  - Create Edge Function `check-compliance`.
  - Prompt: "Check [Proposal Text] against [Eligibility Text]".
- [ ] **Agent 3: Critical Reviewer**
  - Create Edge Function `simulate-review`.
  - Prompt: "Score this proposal (1-9) based on NIH criteria."
- [ ] **Agent 4: Co-Pilot**
  - Enhance Tiptap with AI floating menu (triggered by `/`).
  - Connect to `ai.chat.completions` API.

### 5. Code Quality & Linting
- [ ] **Fix Lint Errors**
  - `src/app/onboarding/page.tsx`: TS Error on `insforge.auth.getUser()`.
  - `src/app/projects/[id]/page.tsx`: TS Error on `insforge.from` (Ensure generic typings in `createClient`).
- [ ] **Strict Typing**
  - Use generated `Database` types in `createClient<Database>`.

### 5. UI Polish
- [ ] **Landing Page**: Update `src/app/page.tsx` (currently default Next.js).
- [ ] **Navigation**: Add proper Sidebar/TopNav persistence across pages.

## Development Commands
- `npm run dev`: Start dev server.
- `npm run lint`: Check linting.
- `git commit`: Version control.

## Handoff: Immediate Next Steps
- [ ] **GitHub**: Create a new repository on GitHub and push this code:
  ```bash
  git remote add origin <https://github.com/FluentFlier/pia.git>
  git branch -M main
  git push -u origin main
  ```
- [ ] **CodeRabbit**: Install CodeRabbit app on the new GitHub repository (Marketplace).
  - *Note*: `coderabbit.yaml` has been created with default settings.

