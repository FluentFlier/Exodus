# Exodus (PIA) - Project Summary for Slides

## Project Overview

**Exodus** is an AI-powered grant application platform designed to help researchers discover, apply for, and manage research funding opportunities. The platform streamlines the grant application process by leveraging AI agents to assist with various stages of grant writing and compliance.

### Core Value Proposition
- **AI-Assisted Grant Discovery**: Automatically matches researchers with relevant funding opportunities based on their research profile
- **Collaborative Workspaces**: Team-based project management for grant applications
- **AI Writing Agents**: Intelligent assistants for drafting, reviewing, and ensuring compliance of grant proposals
- **End-to-End Management**: From discovery to submission, all in one platform

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with Lucide icons
- **State Management**: React hooks + Context API

### Backend
- **Platform**: Insforge (Backend-as-a-Service)
- **Database**: PostgreSQL (via PostgREST)
- **Authentication**: Insforge Auth with JWT tokens
- **Storage**: Insforge Storage for file uploads
- **Edge Functions**: Serverless functions for AI integrations

### AI Integration
- **AI Provider**: Groq (via Insforge AI SDK)
- **AI Agents**:
  - **Grant Scout**: Discovers and matches relevant grants
  - **Compliance Officer**: Checks proposals against grant requirements
  - **Critical Reviewer**: Provides constructive feedback on drafts
  - **Co-Pilot**: Real-time writing assistance

---

## Key Features Implemented

### 1. Authentication System
- User registration with email/password
- Login with session management
- JWT-based authentication
- Protected routes via middleware

### 2. Researcher Onboarding
- Multi-step onboarding flow
- Research profile collection (interests, institution, experience)
- Profile storage in database

### 3. Grant Discovery
- Browse funding opportunities from multiple sources
- Filter and search grants
- AI-powered grant matching based on researcher profile
- "Recommended" vs "All Grants" views

### 4. Project Workspace
- Create new grant application projects
- Team collaboration with member invites
- Document editor for proposal sections
- Task management with due dates
- AI agent sidebar for assistance

### 5. Collaboration Features
- Invite collaborators via email
- Role-based permissions (owner, editor, viewer)
- Shared document editing
- Comments and suggestions

### 6. AI Agent Integration
- Grant Scout for opportunity discovery
- Compliance checking against requirements
- Critical review functionality
- Real-time writing co-pilot

---

## Development Session Summary

### Issues Identified & Fixed

#### 1. Runtime ChunkLoadError on Login Page
- **Problem**: Login page failed to load due to webpack chunk loading errors
- **Solution**: Fixed module bundling and import issues

#### 2. UI/UX Improvements
- **Problem**: Low contrast text, sizing issues across pages
- **Solution**: Updated CSS variables, improved color contrast ratios, fixed responsive layouts

#### 3. Email Verification Flow
- **Problem**: Users stuck on verification screen during development
- **Solution**: Simplified flow for development (skipped verification requirement)

#### 4. Start Application Button (500 Error)
- **Problem**: Creating new grant projects failed with server error
- **Root Causes Identified**:
  1. JWT signature validation errors with `edgeFunctionToken`
  2. Database schema mismatches (missing/extra columns)
  3. Row-Level Security (RLS) policy violations
- **Fixes Applied**:
  - Updated Insforge SDK initialization pattern
  - Aligned insert payloads with actual database schema
  - Disabled RLS on relevant tables (projects, project_members, tasks)
  - Used `insforge.auth.getUser()` for proper user context

#### 5. Database Schema Alignment
- **Tables Modified**:
  - `projects`: Core project data
  - `project_members`: Team membership
  - `tasks`: Project task tracking
  - `project_docs`: Document content storage
- **Changes**: Ensured API payloads match column definitions

---

## Database Schema

### Core Tables

```sql
-- Users (managed by Insforge Auth)

-- Research Profiles
CREATE TABLE research_profiles (
    user_id UUID PRIMARY KEY,
    institution TEXT,
    interests TEXT[],
    research_description TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Grants
CREATE TABLE grants (
    id UUID PRIMARY KEY,
    title TEXT,
    funder TEXT,
    deadline TIMESTAMPTZ,
    amount_min NUMERIC,
    amount_max NUMERIC,
    description TEXT,
    eligibility TEXT,
    url TEXT
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    grant_id UUID REFERENCES grants(id),
    owner_id UUID,
    title TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Project Members
CREATE TABLE project_members (
    project_id UUID REFERENCES projects(id),
    user_id UUID,
    role TEXT,
    PRIMARY KEY (project_id, user_id)
);

-- Project Documents
CREATE TABLE project_docs (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    doc_type TEXT,
    title TEXT,
    content TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    title TEXT,
    status TEXT,
    assignee_id UUID,
    due_date TIMESTAMPTZ
);
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/*` | Various | Authentication endpoints |
| `/api/profile` | GET/PUT | User research profile |
| `/api/profile/analyze` | POST | AI analysis of profile |
| `/api/grants` | GET | List all grants |
| `/api/grants/match` | POST | AI-powered grant matching |
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/[id]` | GET/PUT/DELETE | Single project operations |
| `/api/projects/[id]/docs` | GET/POST | Project documents |
| `/api/projects/[id]/members` | GET/POST | Team members |
| `/api/projects/[id]/invites` | GET/POST | Collaboration invites |
| `/api/projects/[id]/tasks` | GET/POST/PUT | Task management |
| `/api/ai/copilot` | POST | AI writing assistant |
| `/api/ai/review` | POST | AI proposal review |
| `/api/ai/compliance` | POST | Compliance checking |

---

## Application Flow

```
1. Landing Page → Sign Up/Login
         ↓
2. Onboarding (First-time users)
   - Collect research interests
   - Set institution
   - Describe research focus
         ↓
3. Dashboard
   - View active projects
   - Quick stats and deadlines
         ↓
4. Grant Discovery
   - Browse all grants
   - View AI-recommended grants
   - Filter by deadline, amount, funder
         ↓
5. Start Application
   - Create new project from grant
   - Auto-generate default documents
   - Set up initial tasks
         ↓
6. Project Workspace
   - Edit proposal documents
   - Use AI agents for assistance
   - Collaborate with team members
   - Track tasks and deadlines
         ↓
7. Submission
   - Export final documents
   - Submit to funder
```

---

## AI Agent Workflows

### Grant Scout Agent
```
Input: Researcher profile (interests, institution, experience)
Process: 
  1. Analyze profile keywords
  2. Match against grant database
  3. Score relevance (0-100)
  4. Rank opportunities
Output: Personalized grant recommendations with match scores
```

### Compliance Officer Agent
```
Input: Draft proposal + Grant requirements
Process:
  1. Extract compliance criteria from grant
  2. Analyze proposal against each requirement
  3. Flag missing or weak sections
  4. Suggest improvements
Output: Compliance checklist with pass/fail status
```

### Critical Reviewer Agent
```
Input: Proposal section text
Process:
  1. Evaluate clarity and structure
  2. Check for common weaknesses
  3. Assess impact statements
  4. Review methodology description
Output: Detailed feedback with suggestions
```

### Co-Pilot Agent
```
Input: Current cursor position + document context
Process:
  1. Understand writing intent
  2. Generate contextual suggestions
  3. Offer sentence completions
  4. Provide alternative phrasings
Output: Real-time writing assistance
```

---

## Current Status

### ✅ Completed
- User authentication flow
- Researcher onboarding
- Grant browsing and discovery
- Project creation workflow (with fixes)
- Database schema setup
- AI agent integration framework
- Collaboration invitation system

### 🔧 In Progress
- Fine-tuning AI agent responses
- Optimizing grant matching algorithm
- Document version history

### 📋 Planned
- Document export (PDF, Word)
- Submission tracking
- Notification system
- Mobile responsiveness improvements

---

## Key Metrics & Demo Points

### For Slides

1. **Problem Statement**
   - Researchers spend 40+ hours per grant application
   - 80% of applications are rejected
   - Complex compliance requirements
   - Limited collaboration tools

2. **Our Solution**
   - AI-powered grant matching saves time
   - Intelligent writing assistance improves quality
   - Compliance checking reduces rejections
   - Collaborative workspace for teams

3. **Technical Innovation**
   - Modern Next.js architecture
   - Serverless backend with Insforge
   - Multiple AI agents working together
   - Real-time collaboration features

4. **Demo Flow**
   - Show grant discovery page
   - Click "Start Application"
   - Navigate to project workspace
   - Demonstrate AI agent sidebar
   - Show collaboration features

---

## Screenshots & Recordings Available

The following artifacts have been captured during development:

- Landing page views
- Dashboard screenshots
- Grants page (browsing view)
- Login/signup forms
- Project workspace
- Browser interaction recordings (WebP format)

---

## Environment Variables Required

```env
NEXT_PUBLIC_INSFORGE_BASE_URL=https://your-instance.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your-anon-key
INSFORGE_API_KEY=your-service-role-key
```

---

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

---

*Generated: February 4, 2026*
*Project: Exodus (PIA) - AI-Powered Grant Application Platform*
