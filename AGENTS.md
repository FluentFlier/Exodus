# Exodus AI Agents Specification

This document defines the autonomous and assistive AI agents to be integrated into Exodus.

## 1. The Grant Scout (Discovery Agent)
**Role**: Autonomous Crawler & Ingestor
**Goal**: Populate the database with fresh opportunities without manual entry.
**Trigger**: Hourly Cron Job (InsForge Edge Function).
**Workflow**:
1.  **Search**: Query external sources (e.g., simulated Grants.gov API or web search) for "new research grants".
2.  **Filter**: Apply rough heuristics (exclude student loans, personal aid).
3.  **Extract**: Use LLM to parse unstructured text into `Grant` schema (Title, Funder, Deadline, Eligibility, Amount).
4.  **Embed**: Generate embeddings for the description.
5.  **Upsert**: Save to `grants` table.

## 2. The Compliance Officer (Verification Agent)
**Role**: Rigid Rule Checker
**Goal**: Ensure submission readiness by validating against specific grant rules.
**Trigger**: User click "Check Compliance" or "Export Package".
**Workflow**:
1.  **Context**: Fetch Grant `eligibility_text` and `requirements`.
2.  **Input**: Fetch current Project `docs` (Proposal) and `artifacts` list.
3.  **Analyze**: Use LLM with strict system prompt: "You are a compliance officer. Check for: Page limits, Required Sections (Abstract, Aims), Missing Artifacts (Biosketch)."
4.  **Output**: JSON list of `Blockers` (Critical) and `Warnings`.
5.  **Action**: Create `tasks` in the project for eack blocker.

## 3. The Critical Reviewer (Feedback Agent)
**Role**:  Simulation of a Grant Reviewer (Verify/Critique)
**Goal**: Improve proposal quality before submission.
**Trigger**: User click "Simulate Review".
**Workflow**:
1.  **Persona**: Dynamically set based on Funder (e.g., "NIH Scorer" vs "NSF Panelist").
2.  **Input**: Project Proposal Doc.
3.  **Evaluation**: Score based on standard criteria (Significance, Innovation, Approach).
4.  **Output**: Detailed Markdown report with specific comments and a "Fundable Score".

## 4. The Co-Pilot (Drafting Agent)
**Role**:  Writing Assistant
**Goal**: Speed up initial drafting.
**Trigger**: User type "/" in Tiptap Editor -> "Draft Section".
**Workflow**:
1.  **Context**: User Profile (Bio, Methods), Grant Description.
2.  **Prompt**: "Write a [Specific Aims] section connecting [User Methods] to [Grant Goals]."
3.  **Output**: Streamed text into the editor.

---

## Technical Implementation Strategy
- **Infrastructure**: InsForge Edge Functions (Deno).
- **Model**: GPT-4o (via InsForge AI SDK).
- **State**: Agents read/write to `projects`, `tasks`, and `project_docs` tables.
- **UI**:
    - **Scout**: Background process (visible via "New Grants" badge).
    - **Compliance/Reviewer**: "Agent Actions" panel in the Project Workspace.