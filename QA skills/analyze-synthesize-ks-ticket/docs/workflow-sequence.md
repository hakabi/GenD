# Workflow Execution Sequence — `analyze-synthesize-ks-ticket`

This document describes the complete step-by-step workflow from receiving a KS ticket ID
to producing a finalized requirements document and optional comparison report.

---

## Overview — Flow Diagram

```
[User provides KS ticket ID]
         │
         ▼
  🟢 Step 1: Trigger & Intent Recognition
         │
         ▼
  🟡 Step 2: Fetch KS Ticket Data          (Phase 1 — Ingest)
         │
         ▼
  🟠 Step 3: Analyze & Resolve Comments    (Phase 1 — Ingest)
         │
         ▼
  🔵 Step 4: Synthesize & Structure        (Phase 2 — Synthesize)
         │
         ▼
  🟣 Step 5: Auto-Save Requirements File   (Phase 2 — Synthesize)
         │
         ▼
  ✅ Step 6: Present Summary to User       (Phase 3 — Report)
         │
         ├─── [Previous run exists?] ──YES──▶ 🔄 Step 7: Generate Comparison Doc (Phase 4)
         │                                                  │
         │                                                  ▼
         │                                        💾 Save comparison to task-analysis-records/
         │                                                  │
         └─────────────────────────────────────────────────┘
         ▼
  [Skill Complete — No Jira tickets created]
```

---

## 🟢 Step 1: Trigger & Intent Recognition

- **Input:** A single KS ticket ID (e.g., `KS-939`) provided by the user, along with a
  request to analyze, extract, summarize, document requirements, or compare runs.
- **Action:**
  - Confirm the ticket ID.
  - Identify the purpose (synthesis, or compare, or both).
  - Announce that the skill will **not** create any Jira tasks.
- **No tool calls in this step.**

---

## 🟡 Step 2: Fetch KS Ticket Data (Phase 1 — Ingest)

- **Tool used:** `mcp_atlassian_jira_get_issue`
- **Fields retrieved:**
  - `summary`, `description`
  - `comment` (full thread: body, author, timestamp for every comment)
  - `reporter` (identifies Product Owner)
  - `assignee` (identifies main Developer)
  - `status`, `created`, `updated` (for traceability header)
- **Goal:** Capture the complete, raw picture of the ticket — including back-and-forth
  clarifications, decisions, and overrides buried in comments, which are frequently more
  accurate than the original description.

---

## 🟠 Step 3: Analyze & Resolve Comments (Phase 1 — Ingest)

- **Action:** The AI reads the full comment thread and applies resolution rules:
  1. **Conflict rule:** When the description and a comment conflict → the most **recent
     product owner comment takes precedence** over an older description.
  2. **Removal rule:** Comments that explicitly **remove** a requirement (e.g., "remove
     that chart for now") are noted as exclusions with author and date recorded.
  3. **Merge rule:** Comments that **add** new details (API field names, data sources,
     calculation methods) are merged into the relevant functional area.
  4. **Flag rule:** Comments containing **unresolved questions** (open dialogue without a
     confirmed answer) are flagged as Open Questions.
  5. **Participant rule:** Build a participant list — reporter = Product Owner,
     assignee = Developer; other commenters identified by context.
- **No file writes or tool calls in this step** — pure analysis.

---

## 🔵 Step 4: Synthesize & Structure Requirements (Phase 2 — Synthesize)

- **Action:** Based on the analyzed data, the AI produces a structured requirements
  document organized into:

  | Document Section | Content |
  |---|---|
  | **Mandatory Header** | Source ticket, Date, Run number, Participants, Resolution rule |
  | **Epic Context** | Feature overview, scope, preconditions, exit criteria |
  | **Functional Areas** | One section per major feature area (chart, filter, tab, etc.) |
  | **Sub-requirements** | Implementation/test details within each functional area |
  | **Resolved Clarifications** | All comment-confirmed facts attributed to author & date |
  | **Open Questions** | All unresolved items flagged for follow-up |

- **Formatting enforced for each Functional Area:**

  ```
  *Test Objective:*   — What is being verified/implemented
  *Preconditions:*    — Setup, access, state required
  *Test Steps:*       — Numbered step-by-step actions
  *Expected Result:*  — Bulleted verifiable outcomes
  ```

- Any heading that cannot be filled from ticket data receives a `[TBD]` placeholder.
  **Headings are never omitted.**

---

## 🟣 Step 5: Auto-Save Requirements File (Phase 2 — Synthesize)

- **Action:** The requirements document is saved to disk **before** being presented to the user.
- **File path:**
  ```
  # First run:
  task-analysis-records/<KS-ID>_requirements.md

  # Subsequent runs (append date, or date+time if same day):
  task-analysis-records/<KS-ID>_requirements_<YYYYMMDD>.md
  task-analysis-records/<KS-ID>_requirements_<YYYYMMDD>_<HHMM>.md
  ```
- **Rule:** Existing files are **never overwritten** — each skill run produces a new file.

---

## ✅ Step 6: Present Summary to User (Phase 3 — Report)

- **Action:** The AI presents a concise hand-off summary in chat:
  - Source ticket ID and title
  - Location of the saved file
  - Participants identified (name + role)
  - List of functional areas identified
  - List of resolved clarifications (with attribution)
  - List of open questions requiring follow-up
  - Suggestion to use `create-qg-jira-tasks-from-ks` for the next step
  - Prompt for Phase 4 if applicable

---

## 🔄 Step 7: Generate Comparison Document (Phase 4 — Compare Runs)

**Activated when:** ≥ 2 requirements files exist for the same KS-ID in `task-analysis-records/`.

- **Trigger announcement:** *"Detected previous run — generating comparison document..."*
- **Action:** The AI compares the two most recent runs side-by-side and produces a
  structured comparison document covering:

  | Section | Content |
  |---|---|
  | 1. Top-level Metadata | Comments analyzed, FA count, participants, timestamps |
  | 2. Functional Areas Side-by-Side | FA name, FA# in each run, change type (NEW / REMOVED / REORDERED / EXPANDED / UNCHANGED) |
  | 3. New / Removed FAs | Full content of added or removed Functional Areas |
  | 4. Scope / Epic Context | Item-by-item scope comparison |
  | 5. Resolved Clarifications | Delta table showing added/unchanged items |
  | 6. Open Questions | Delta table showing new/resolved questions |
  | 7. Quality Assessment | Scoring table + recommendation on which run to use next |

- **File path:**
  ```
  task-analysis-records/<KS-ID>_requirements_comparison_run<N-1>_vs_run<N>.md
  ```
- **Rule:** Never overwrite an existing comparison file.

---

## Skill Boundary

| Step | In Scope | Out of Scope |
|---|---|---|
| Fetching ticket data | ✅ | |
| Reading all comments | ✅ | |
| Detecting participant roles | ✅ | |
| Resolving conflicts/overrides | ✅ | |
| Saving `_requirements[_<date>].md` | ✅ | |
| Presenting summary in chat | ✅ | |
| Auto-generating comparison doc (Phase 4) | ✅ | |
| Creating QG Jira tasks | | ❌ (use `create-qg-jira-tasks-from-ks`) |
| Previewing task breakdown | | ❌ |
| Linking to existing Epics | | ❌ |
| Processing multiple KS tickets in one run | | ❌ |

---

## Continuation Path

After this skill completes, the QA team or analyst may proceed with:

```
Use create-qg-jira-tasks-from-ks and create QG tasks from the requirements in
task-analysis-records/<KS-ID>_requirements[_<date>].md
```

Use the **latest / highest quality** requirements file as input
(see Section 7 of the comparison doc for recommendation).
