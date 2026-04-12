---
name: analyze-synthesize-ks-ticket
description: >
  Analyzes a single KS Jira ticket (summary, description, and all comments)
  and synthesizes a consolidated requirements document. Stops at the requirements
  file — no Jira task creation. Trigger this skill whenever the user provides a
  single KS ticket ID and asks to analyze it, extract requirements, summarize it,
  produce a requirements file, or document the spec — even without the exact phrase
  "analyze KS ticket". Also triggers on "compare runs", "so sánh 2 lần chạy", or
  "diff between runs" for Phase 4 comparison generation.
---

# Analyze & Synthesize KS Ticket

## Purpose

KS tickets often contain fragmented, evolving requirements spread across a description
written early in a feature's life and a long comment thread that overrides or refines it.
This skill consolidates all of that into a single, accurate, human-readable requirements
document — ready for QA planning, implementation referencing, or further task creation.

The skill **stops after producing the requirements file and optional comparison document**.
It does not create any Jira tasks.

---

## Document Auto-Save (Mandatory — every run)

Every skill run **must** produce one persistent Markdown file saved to
`task-analysis-records/` inside this skill folder. Never overwrite existing files
— each run adds a new file, building a historical record.

**File naming convention:**
```
# First run for a ticket:
task-analysis-records/<KS-ID>_requirements.md

# Subsequent runs for the same ticket (append date suffix):
task-analysis-records/<KS-ID>_requirements_<YYYYMMDD>.md

# If multiple runs on the same day, append time:
task-analysis-records/<KS-ID>_requirements_<YYYYMMDD>_<HHMM>.md
```

**Examples:**
```
task-analysis-records/KS-939_requirements.md          ← run 1
task-analysis-records/KS-939_requirements_20260331.md ← run 2 (same day)
task-analysis-records/KS-939_requirements_20260401.md ← run 3 (next day)
```

**File contents:**
- The fully synthesized requirements document produced in Phase 2, including all
  resolved clarifications and exclusions derived from comment analysis.

Save the file immediately after Phase 2 is complete.

---

## Phase 1 — Ingest KS Ticket Data

Fetch the KS ticket provided by the user using `mcp_atlassian_jira_get_issue` with
**at minimum** these fields:
- `summary`
- `description`
- `comment` (full comment body including author and timestamp)
- `reporter` (identifies the product owner)
- `assignee` (identifies the main developer)
- `status`, `created`, `updated` (for context and traceability)

**Comment resolution rules:**
- Read **all** comments carefully. Product owners frequently override or refine
  requirements in comment threads after the description was written.
- When the description and comments conflict, the most **recent comment from a
  product owner** takes precedence over an older description.
- Note any open/unresolved questions found in comments and flag them clearly in
  the output document.
- Identify and list all participants (name + role) who contributed to the thread.

---

## Phase 2 — Synthesize Requirements

Analyze all collected data and produce a structured requirements document.

### Document Header (Mandatory fields)

Every requirements document **must** include this header:

```
# Synthesized Requirements — <Feature Name>
**Source Ticket:** <KS-ID>
**Date:** <YYYY-MM-DD>
**Run:** <YYYY-MM-DDTHH:MM> (first run / second run / ...)

**Participants:**
- **<Name>** (<Role — e.g., Product Owner, Developer, Compute Server Engineer>)
- ...

> **Resolution rule applied:** Most recent product owner comment takes precedence
> over earlier description or earlier comments when conflicts exist.
```

### Document Body Structure

```
---

## Epic Context

*Epic Overview:* <One-paragraph description of the entire feature/module>
*Scope:* <Bullet list of major functional areas covered>
*Preconditions:* <Global preconditions, access, environment needs>
*Exit Criteria:* <Conditions to consider requirements fully captured/resolved>

---

## Functional Area 1: <Name>

*Test Objective:* <Clear statement of the verification/implementation goal>
*Preconditions:* <Required setup, data, or state>
*Test Steps:*
1. ...
2. ...
*Expected Result:*
- ...

### Sub-requirements / Details
- Detail 1 (source: Author, Date)
- Detail 2

---

## Functional Area N: <Name>
...

---

> [!NOTE]
> Resolved Clarifications (from comment thread)
> - [Clarification 1 — source: <Author>, <Date>]
> - [Clarification 2 — ...]

> [!WARNING]
> Open Questions (unresolved as of <Date>)
> - [Question 1 — raised by <Author>, <Date>]
```

### Decomposition Guidelines

| Level | Scope | Typical examples |
|---|---|---|
| **Epic Context** | The entire feature or initiative | "Cash Forecast Dashboard", "Peer Analysis Module" |
| **Functional Area** | A major, independently-deliverable component | "Net Cash Flow Chart", "Date Filter Logic", "Details Tab" |
| **Sub-requirement** | Implementation or test detail for one specific behavior | "fad_beta pulled from live Aloha homepage, not user input" |

- Keep sub-requirements focused and actionable.
- If a comment explicitly **removes** a requirement (e.g., "remove that chart for now"),
  exclude it from the breakdown and add a clearly labeled note explaining what was removed
  and why (author, date).
- Capture all resolved clarifications (data ranges, column names, replacement logic, etc.)
  in a **Resolved Clarifications** block at the end of the document.
- Flag all **unresolved** open questions in an **Open Questions** block.

### Formatting Requirements (Strict QA Standard)

Every functional area must follow this format:

**Functional Area (maps to future Parent Task or Sub-task)**
Must contain exactly these four headings:
- `*Test Objective:*` — A clear, concise statement of the verification/implementation goal.
- `*Preconditions:*` — Required setup, access rights, or prerequisite state.
- `*Test Steps:*` — Step-by-step actions (numbered list).
- `*Expected Result:*` — Specific, verifiable outcomes (bulleted list).

**Important Rule for Missing Information:**
If the KS ticket does not provide enough information to reasonably deduce any of these
sections, you **must** still include the heading but fill it with a placeholder:

Example: `[TBD — User needs to define specific test steps]`

**Never** omit a heading entirely.

---

> **Auto-save checkpoint:** Save the synthesized requirements to
> `task-analysis-records/<KS-ID>_requirements[_<date>].md` now.

---

## Phase 3 — Present Summary to User

After saving the file, present a concise summary to the user:

```
## Requirements Synthesis Complete

**Source:** <KS-ID> — <Summary>
**File saved:** task-analysis-records/<KS-ID>_requirements[_<date>].md
**Participants:** <Name (Role)>, <Name (Role)>, ...

### Functional Areas Identified
1. <Area 1>
2. <Area 2>
...

### Resolved Clarifications
- <Clarification 1>
- <Clarification 2>

### Open Questions (require follow-up)
- <Question 1>

---
*To create QG Jira tasks from this file, use the `create-qg-jira-tasks-from-ks` skill.*
*To compare this run with the previous run, trigger Phase 4 — Compare Runs.*
```

---

## Phase 4 — Compare Runs (Auto-triggered or On-demand)

**When to run:**
- **Auto-triggered:** automatically after Phase 3 whenever two or more requirements files
  already exist for the **same KS ticket** in `task-analysis-records/`. The skill will
  notify the user: *"Detected previous run — generating comparison document..."*
- **On-demand:** user explicitly asks to compare two runs (e.g., "so sánh 2 lần chạy",
  "compare runs", "diff between runs", "khác nhau giữa 2 lần chạy").

**Trigger detection (auto):**
```
task-analysis-records/
├── <KS-ID>_requirements.md           ← run 1 (exists)
└── <KS-ID>_requirements_<date>.md    ← run 2 (just written)
```
If **both** files exist after Phase 2, proceed to Phase 4 automatically.

**Note:** If only one file exists (first-ever run), skip Phase 4 silently.

---

### Comparison Document Structure

```
# <KS-ID> Requirements Comparison — Run <N-1> vs Run <N>

**Skill:** analyze-synthesize-ks-ticket
**Source Ticket:** <KS-ID>
**Comparison Date:** <YYYY-MM-DD>

| File | Run | Date |
|---|---|---|
| <file1> | Run N-1 | <date1> |
| <file2> | Run N   | <date2> |

> [!NOTE]
> This document is auto-generated for audit and traceability purposes.

---

## 1. Top-level Metadata Differences
[Table comparing: comments analyzed, FA count, participants, timestamps]

## 2. Functional Areas — Side-by-Side
[Table: FA name | FA# Run N-1 | FA# Run N | Change type]
Change types: NEW | REMOVED | REORDERED | EXPANDED | UNCHANGED

## 3. New / Removed Functional Areas
[Full content of added or removed FAs, with explanation]

## 4. Scope / Epic Context Differences
[Table: Scope item | Run N-1 | Run N]

## 5. Resolved Clarifications — Delta
[Table: # | Clarification | Run N-1 | Run N]

## 6. Open Questions — Delta
[Table: Question | Run N-1 | Run N | Change]

## 7. Quality Assessment Summary
[Scoring table with: criterion | Run N-1 | Run N]
> Conclusion: which run is recommended as input for create-qg-jira-tasks-from-ks
```

### Compare File Naming Convention

```
# Preferred (run number known):
task-analysis-records/<KS-ID>_requirements_comparison_run<N-1>_vs_run<N>.md

# Alternative (use datestamps when run numbers are unclear):
task-analysis-records/<KS-ID>_requirements_comparison_<date1>_vs_<date2>.md
```

**Example:**
```
task-analysis-records/KS-939_requirements_comparison_run1_vs_run2.md
```

> **Auto-save checkpoint:** Save the comparison document to `task-analysis-records/`
> immediately after generating it. Never overwrite an existing comparison file.

---

## Error Handling

| Scenario | Action |
|---|---|
| Ticket not found or inaccessible | Report the exact error; confirm the ticket ID with the user |
| Description is empty | Rely entirely on comment thread; flag this explicitly in the output document |
| Comment thread contradicts description | Follow the latest product owner comment; note the conflict clearly with source attribution |
| Insufficient data to fill a section | Use `[TBD]` placeholder with a note; list item in Open Questions block |
| User provides more than one KS ticket | Process only the first/specified ticket; inform user this skill handles one ticket at a time |
| Only one requirements file exists (first run) | Skip Phase 4 silently — no comparison to generate |
| Compare file already exists for this run pair | Skip auto-generation; notify user; re-generate only if explicitly requested |
| Participant roles cannot be determined from ticket | Default reporter = Product Owner; assignee = Developer; note assumption in document |
