# Product Specification Document

## Exodus: AI Grant Intelligence, Collaboration Workspace, and Submission Readiness Platform (v3)

---

## 1. Document Overview

### 1.1 Purpose

This document specifies **Exodus**, a web application that supports the grant lifecycle end-to-end:

* Discover grants from live sources
* Personalize recommendations using AI
* Decide go/no-go with explainable viability scoring
* Create a grant-specific **Project Space** where teams collaborate on documents, tasks, and artifacts in real time
* Export validated **Submission Packages** for official portal submission
* Track outcomes and learn from results over time

Exodus does not replace funder portals. Instead, it makes teams faster, more compliant, and more coordinated.

---

### 1.2 Product Vision

Make every grant decision intentional, every application coordinated, every submission compliant, and every outcome learnable.

---

### 1.3 Target Audience

Primary:

* Faculty (PI, Co-PI)
* Postdocs, research staff
* Academic teams

Secondary:

* Research administrators
* Office of Sponsored Projects reviewers
* Funding coordinators

---

### 1.4 Objectives

* Reduce time from “interest” to “submission-ready” by 50 percent
* Increase match-to-submission conversion rate
* Provide an institutional memory loop (without storing proposal text for admins unless permitted)
* Make collaboration friction near zero

---

## 2. Core Concepts

### 2.1 Grant

A funding opportunity with normalized fields: title, description, funder, deadline, eligibility, budget, tags, source metadata.

### 2.2 User Profile

A structured research profile used to compute matching and collaborator suggestions:

* CV text and structured extraction
* Interests, methods, keywords, career stage
* Funding preferences
* Collaboration preferences (open to collaborate, roles, availability)

### 2.3 Grant Application Project (Central Object)

The single source of truth representing intent to apply for a specific grant.

States:

* Discovered
* Under Evaluation
* In Preparation
* Ready to Submit
* Submitted
* Awarded
* Declined
* Archived

Everything attaches to this: team, docs, tasks, artifacts, submission package, feedback, outcomes.

### 2.4 Project Space (Collaboration Workspace)

A grant application project creates a **Project Space**: a shared environment where collaborators can:

* Co-author documents in real time
* Comment, suggest edits, resolve threads
* Track tasks and milestones
* Store artifacts (biosketches, budgets, letters)
* Receive AI guidance and checks
* Produce a submission-ready export

---

## 3. Functional Requirements

### 3.1 Authentication and Organization Model

* Sign up / login via email and Google
* Optional institutional SSO in later phase
* Users may belong to:

  * An institution (optional for MVP)
  * Multiple teams or labs (optional)

Roles:

* Owner (project creator)
* PI (can export submission packages, manage team)
* Editor (edit docs, upload artifacts)
* Commenter (comment and suggest only)
* Viewer (read-only)
* Admin reviewer (optional, scoped access)

Permission model:

* Per-project access
* Per-document access (optional advanced)
* Audit logging for critical actions

---

### 3.2 User Profile Creation and Collaboration Directory

#### Profile capture

* Upload CV or resume (PDF)
* Extract: publications, keywords, fellowships, affiliations (best-effort)
* Manual add: research areas, methods, preferred funders, constraints

#### Collaboration preferences

* “Open to collaborate” toggle
* Collaboration roles offered:

  * Co-PI
  * Domain expert
  * Methods expert (ML, statistics)
  * Writing and editing support
  * Budget support
  * Industry partner (later)
* Availability: low, medium, high
* Collaboration scope: proposal-only, long-term, both
* Constraints: remote only, same institution preferred, etc.

#### Collaborator directory

* Search and filter potential collaborators:

  * by tags
  * by methods
  * by department or institution (if available)
  * by availability
* Each profile includes:

  * headline and tags
  * expertise summary
  * publications or experience highlights (optional)
  * collaboration preferences

---

### 3.3 Grant Database and Live Updates

#### Sources

* Maintain a normalized grants database aggregated from supported sources.
* For hackathon and MVP: support 1–2 sources plus a seeded dataset fallback.

#### Update strategy

* Scheduled ingestion job (hourly or daily)
* Manual refresh endpoint for demo or admin use
* Show “Last updated at” timestamp

#### Grant fields

* Title, description, funder, deadline
* Eligibility (structured as JSON plus raw text)
* Amount range
* Geographic constraints
* Tags and categories
* Source URL and identifiers

#### Search and filters

* Keyword search
* Filters:

  * deadline range
  * amount range
  * funder
  * topic tags
  * eligibility flags
  * newly added

---

### 3.4 AI-Driven Matching and Personalization

#### Baseline matching

* Compute embeddings for:

  * user profile text
  * grant description + eligibility text
* Rank by similarity plus additional scoring terms:

  * keyword overlap
  * deadline urgency
  * funder preference boost
  * eligibility confidence penalty

#### Explainability

For every recommended grant:

* Top reasons for match (keywords or concepts)
* Eligibility signals (pass, fail, unknown)
* Effort estimate band (low, medium, high)

#### Feedback

* Thumbs up/down or 1–5 rating
* Reason category:

  * not eligible
  * irrelevant topic
  * too small or too large
  * deadline too soon
  * already applied
* Optional free text explanation

#### Learning loop

* First version: re-ranking adjustments per user via feedback and behavior:

  * clicked
  * saved
  * project created
  * package exported
* Later: aggregate learning at institution level (opt in)

---

### 3.5 Go / No-Go Decision Engine

When a user opens a grant and clicks “Evaluate,” Exodus produces a viability assessment:

Inputs:

* match score
* eligibility confidence
* time to deadline
* user availability and team readiness
* expected effort band

Outputs:

* Pursue
* High risk
* Do not pursue

Each decision includes reasons and recommended actions:

* “Need a collaborator with X expertise”
* “Deadline too soon for first submission, consider next cycle”
* “Eligibility unclear, verify citizenship requirements”

---

## 4. Project Space: Real-Time Collaboration Workspace

This is the big addition and it is first-class.

### 4.1 Creating a Project Space

Trigger:

* User chooses a grant and clicks “Start Application Project”

System action:

* Create Grant Application Project record
* Create Project Space with default structure:

  * Overview
  * Docs
  * Artifacts
  * Tasks
  * Team
  * Submission Package

Default timeline:

* auto-generate internal milestones from deadline:

  * first outline
  * internal review
  * final packaging

---

### 4.2 Docs System

#### Document types

* Rich text proposal doc (main narrative)
* Project summary
* Specific aims or equivalent sections
* Broader impacts or equivalent
* Data management plan
* Budget justification (text)
* Internal notes doc

Docs can be:

* created from templates
* duplicated
* exported as PDF

#### Real-time collaboration

* Multi-user editing with:

  * live cursors and presence indicators
  * real-time syncing
  * conflict-free merges

#### Suggestions mode

* Users can propose edits as suggestions:

  * insertions and deletions tracked
  * suggestions can be accepted or rejected
  * suggestion author recorded

#### Comments and threads

* Inline comments on selected text
* Threads with replies
* Resolve and reopen threads
* Mention collaborators with notifications

#### Version history

* Auto-save snapshots
* Named versions (milestones)
* Diff view between versions
* Ability to restore prior versions

#### Permissions

Per doc:

* Editor, commenter, viewer
  Project-wide permissions inherited by default.

#### Attachments and linking

Docs can link to:

* grants
* artifacts
* tasks
* collaborator profiles

---

### 4.3 Artifacts Repository

Artifacts are structured files needed for submission:

Artifact types:

* biosketch or CV
* budget spreadsheet
* letters of support
* facilities resources
* references
* prior work
* compliance forms

Features:

* upload and tag files
* enforce file naming conventions (optional)
* versioning for artifacts
* “required” vs “optional” labels
* preview for PDFs
* link artifacts into docs and tasks

---

### 4.4 Team and Invites

#### Inviting collaborators

* Invite by email
* Invite from collaborator directory suggestions
* Assign role and permission on invite

Invite states:

* pending
* accepted
* declined

#### Team page

* list members and roles
* workload indicator (optional)
* availability status

#### Collaboration suggestions

Exodus suggests collaborators using:

* grant relevance score: collaborator profile to grant embedding
* complementarity score: what skills are missing in current team
* constraints: open to collaborate, availability, institution preference

Each suggestion must show:

* “Why them” explanation
* “Invite” action

---

### 4.5 Tasks and Milestones

Minimum:

* task list with assignee, due date, status

Recommended hackathon-level defaults on project creation:

* Draft outline
* Draft budget
* Draft summary
* Collect biosketches
* Internal review
* Finalize submission package

Task features:

* comments per task
* attachments per task
* linked doc or artifact
* reminders

---

### 4.6 Notifications

* email and in-app notifications for:

  * invites
  * mentions
  * comment replies
  * approaching deadlines
  * tasks due

---

### 4.7 AI in the Project Space (Assistive, Not Autowriting)

#### Suggestions and checks

* “Missing sections” detection based on grant requirements
* “Compliance reminders” based on grant text
* “Outline template” suggestions
* “Consistency checks”:

  * names, acronyms, budgets referenced
  * deadlines and dates

#### Doc guidance panel

A side panel that shows:

* requirement checklist
* warnings and blockers
* suggested improvements

Keep this lightweight for hackathon: it can be rules plus simple NLP.

---

## 5. Submission Package System

### 5.1 Definition

A Submission Package is a validated, funder-specific bundle for handoff to official portals.

### 5.2 Inputs

Submission package pulls from the Project Space:

* documents (proposal, summary, plans)
* artifacts (biosketches, budgets, letters)
* metadata (PI, institution, grant identifiers)

### 5.3 Validation

Validation layers:

Layer 1: Structural

* required files present

Layer 2: Formatting

* page counts
* file types
* size limits

Layer 3: Semantic checks

* required sections detected where possible
* flags missing expected components

### 5.4 Output

* ZIP bundle
* Submission manifest PDF:

  * checklist
  * upload instructions mapping
  * timestamps and checksums
* metadata JSON for future automation

### 5.5 Post-export tracking

User can:

* mark submitted
* store confirmation number
* upload receipt

---

## 6. Analytics and Dashboards

### 6.1 User dashboard

* recommended grants
* saved grants
* active projects
* upcoming deadlines
* collaborator suggestions

### 6.2 Project dashboard

* readiness score and blockers
* task completion status
* docs status and open comment threads
* artifacts completeness bar
* export status

### 6.3 Institutional dashboard (later phase)

* pipeline overview by department
* submission rates
* outcome rates
* bottleneck trends

---

## 7. Non-Functional Requirements

### Performance

* Search results under 1 second
* Recommended grants under 5 seconds
* Real-time doc edits should feel instant
* Support at least 50 concurrent editors across many docs (hackathon can be smaller)

### Security

* encryption at rest for uploaded documents
* role-based access control
* audit logs for:

  * exports
  * permissions changes
  * collaborator invites
  * deletes and restores

### Privacy

* personal profiles stored securely
* opt-in for institution-level learning
* restrict admin access to content by policy

### Reliability

* autosave and recovery for docs
* safe conflict resolution in edits

---

## 8. System Architecture

### 8.1 High-level services

* API service:

  * auth, users, grants, projects, tasks, invites
* Ingestion service:

  * pulls and normalizes grants
* Recommendation service:

  * embeddings and ranking
* Collaboration service:

  * real-time doc sync
  * presence
  * comments and suggestions
* File storage service:

  * artifacts and doc exports
* Validation and packaging service:

  * submission package checks and ZIP generation

### 8.2 Real-time collaboration technical approach

Recommended approach:

* Websocket-based real-time sync
* Conflict-free editing using CRDT (preferred) or operational transform

Storage:

* Persist doc state snapshots
* Keep an event log for suggestions and comments

### 8.3 Data layer

* Postgres for relational objects (users, projects, invites, tasks)
* Object storage for files and exports
* Vector storage for embeddings:

  * can be in Postgres with vector extension or a dedicated vector DB

---

## 9. Data Models

### User

* id, name, email
* institution_id
* profile_text
* tags[]
* methods[]
* career_stage
* open_to_collab
* collab_roles[]
* availability
* created_at

### Grant

* id, source_id, source_name
* title, description, funder
* deadline, amount_min, amount_max
* eligibility_json, eligibility_text
* tags[]
* embedding_vector
* updated_at

### GrantApplicationProject

* id, grant_id
* owner_user_id
* status
* team_member_ids[]
* created_at, updated_at

### ProjectDoc

* id, project_id
* doc_type
* doc_state (CRDT snapshot or OT state)
* created_by, updated_by
* version_history pointers

### DocComment

* id, doc_id
* anchor range reference
* thread state (open, resolved)

### DocSuggestion

* id, doc_id
* suggestion diff payload
* status (pending, accepted, rejected)

### Artifact

* id, project_id
* type
* file_url
* version
* required_flag

### Task

* id, project_id
* title, status
* assignee_id
* due_date
* links to doc or artifact

### Invite

* id, project_id
* from_user_id, to_email or to_user_id
* role, permission
* status

### Feedback

* id, user_id, grant_id
* rating
* reason
* text
* timestamp

### SubmissionPackage

* id, project_id
* status
* validation_report
* export_url
* checksum
* exported_at

---

## 10. MVP Scope for Hackathon

### Must-have for a convincing demo

* Grant list with filters and “last updated”
* Profile onboarding with “open to collaborate”
* Recommended grants ranking with explanations
* Start Application Project creates a Project Space
* Invite collaborators
* Real-time doc editing with comments
* Artifacts upload
* Basic readiness checklist
* Export a submission package ZIP with manifest

### Strong optional adds if time allows

* Suggest collaborators with “why”
* Suggestions mode for edits
* Version history snapshots
* Task auto-generation from grant deadline
