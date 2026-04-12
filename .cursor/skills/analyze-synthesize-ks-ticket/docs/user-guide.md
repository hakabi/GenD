# Analyze & Synthesize KS Ticket — Full User Guide

## Overview

The `analyze-synthesize-ks-ticket` skill reads a single KS Jira ticket — including
its full description and all comment thread entries — resolves any conflicting requirements
between the original description and later comments, and produces a **clean, consolidated
requirements document** stored in `task-analysis-records/`.

When a previous run exists for the same ticket, the skill **automatically generates a
comparison document** showing what changed between the two runs.

> **Scope boundary:** This skill produces only the requirements file (and optional
> comparison file). It does **not** create any Jira tasks in the QG project.

---

## When to Use This Skill

| Situation | Use this skill? |
|---|---|
| You need to understand what a KS ticket actually requires (reading comment overrides) | ✅ Yes |
| You want a structured requirements doc to share with the team before planning | ✅ Yes |
| You want to capture all resolved clarifications and open questions from the thread | ✅ Yes |
| You want to prepare input for the `create-qg-jira-tasks-from-ks` skill | ✅ Yes |
| You want to compare two runs of this skill on the same ticket | ✅ Yes (Phase 4) |
| You want to create QG Jira tasks directly | ❌ Use `create-qg-jira-tasks-from-ks` instead |
| You have multiple KS tickets to synthesize at once | ❌ Use `create-qg-jira-tasks-from-ks` instead |

---

## How to Trigger the Skill

Provide any KS ticket ID and ask to analyze, extract, summarize, or document its
requirements. The skill triggers automatically — no exact phrase required.

### Trigger Commands

| Intent | Command |
|---|---|
| Full analysis | `Analyze KS ticket KS-939 and produce a synthesized requirements document.` |
| Short | `Synthesize requirements from KS-939.` |
| Extract to file | `Read KS-939 and extract all requirements into a requirements file.` |
| Summarize | `Summarize KS-939 requirements.` |
| Document spec | `Document the requirements in KS-939.` |
| Compare runs | `So sánh 2 lần chạy skill` / `Compare runs for KS-939` / `Diff between runs` |

---

## What the Skill Does — Step by Step

| Step | Phase | Description |
|---|---|---|
| **1. Trigger** | — | Recognize intent; confirm ticket ID; announce no Jira writes |
| **2. Fetch ticket** | Phase 1 | Retrieve summary, description, all comments, reporter, assignee via Jira API |
| **3. Resolve comments** | Phase 1 | Identify comment overrides; flag open questions; build participant list |
| **4. Synthesize** | Phase 2 | Structure requirements into Functional Areas with 4 standard headings |
| **5. Auto-save requirements** | Phase 2 | Save `task-analysis-records/<KS-ID>_requirements[_<date>].md` |
| **6. Report** | Phase 3 | Present summary: areas found, resolved items, open questions, next steps |
| **7. Compare (if applicable)** | Phase 4 | Auto-generate comparison doc if a previous run exists; save to `task-analysis-records/` |

---

## Output Document Structure

### Requirements File (`_requirements.md`)

```markdown
# Synthesized Requirements — <Feature Name>
**Source Ticket:** KS-939
**Date:** YYYY-MM-DD
**Run:** YYYY-MM-DDTHH:MM (first run / second run / ...)

**Participants:**
- **Kathleen Bui** (Product Owner — Reporter)
- **tuan tran** (Developer — Assignee)
- **Jerry Luo** (Compute Server Engineer)

> **Resolution rule applied:** Most recent product owner comment takes precedence.

---

## Epic Context
*Epic Overview:* ...
*Scope:* ...
*Preconditions:* ...
*Exit Criteria:* ...

---

## Functional Area 1: <Name>
*Test Objective:*   ...
*Preconditions:*    ...
*Test Steps:*       1. ... 2. ...
*Expected Result:*  - ...

### Sub-requirements / Details
- Detail 1 (source: Author, Date)

---

> [!NOTE]
> Resolved Clarifications (all comment-confirmed facts with attribution)

> [!WARNING]
> Open Questions (unresolved items needing follow-up)
```

**Key rules enforced:**
- Mandatory header: `Source Ticket`, `Date`, `Run`, `Participants`.
- All 4 headings (`Test Objective`, `Preconditions`, `Test Steps`, `Expected Result`) are
  always present — even if a section uses `[TBD]` placeholder text.
- Resolved clarifications are attributed to author and date.
- Excluded requirements (removed in comments) are noted with author and date.

---

### Comparison File (`_comparison_run<N-1>_vs_run<N>.md`)

Auto-generated when ≥ 2 requirements files exist for the same ticket.

```markdown
# KS-939 Requirements Comparison — Run N-1 vs Run N

| File | Run | Date |
|---|---|---|
| KS-939_requirements.md          | Run N-1 | ... |
| KS-939_requirements_20260331.md | Run N   | ... |

## 1. Top-level Metadata Differences
## 2. Functional Areas — Side-by-Side  (NEW | REMOVED | REORDERED | EXPANDED | UNCHANGED)
## 3. New / Removed Functional Areas
## 4. Scope / Epic Context Differences
## 5. Resolved Clarifications — Delta
## 6. Open Questions — Delta
## 7. Quality Assessment Summary + Recommendation
```

---

## Output File Location

```
.agent/skills/analyze-synthesize-ks-ticket/
  task-analysis-records/
    KS-939_requirements.md                          ← run 1
    KS-939_requirements_20260331.md                 ← run 2
    KS-939_requirements_comparison_run1_vs_run2.md  ← comparison (auto-generated)
```

> Existing files are **never overwritten**. Each run creates a new, dated file.
> First run uses plain name; subsequent runs append `_YYYYMMDD` or `_YYYYMMDD_HHMM` suffix.

---

## Chat Summary After Completion

```
## Requirements Synthesis Complete

Source: KS-939 — Cash Forecast UI Specs
File saved: task-analysis-records/KS-939_requirements_20260331.md
Participants: Kathleen Bui (PO), tuan tran (Dev), Jerry Luo (Compute)

### Functional Areas Identified
1. Net Cash Flow Combination Chart
2. Historical Capital Calls & Distributions Stacked Bar Chart
...

### Resolved Clarifications
- fad_beta pulled from live Aloha homepage (Jerry Luo, 2026-03-09)
- ...

### Open Questions
- Dashboard initial load data source (awaiting Jerry Luo & Kathleen Bui)

---
To create QG Jira tasks, use the create-qg-jira-tasks-from-ks skill.
To compare with the previous run, trigger Phase 4 — Compare Runs.

[Phase 4] Detected previous run — generating comparison document...
Comparison saved: task-analysis-records/KS-939_requirements_comparison_run1_vs_run2.md
```

---

## Continuing to QG Task Creation

Once the requirements file is ready, hand off to the next skill:

```
Use create-qg-jira-tasks-from-ks and create QG tasks from the requirements in
task-analysis-records/KS-939_requirements_20260331.md
```

---

## Important Notes

- **One ticket at a time** — for multi-ticket synthesis, use `create-qg-jira-tasks-from-ks`.
- **Comment precedence** — the most recent product owner comment always wins over the description.
- **Placeholders** — any section that lacks information from the ticket gets `[TBD]`
  and is listed in the Open Questions block.
- **No Jira writes** — this skill is completely read-only with respect to Jira.
- **Participant detection** — reporter = Product Owner by default; assignee = Developer.
- **Phase 4 is transparent** — comparison is generated automatically and reported in chat.
