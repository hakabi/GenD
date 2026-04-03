---
name: qa-workflow-from-ks-ticket
description: >
  Master orchestrator for the QA agentic workflow. Accepts one or more KS Jira ticket IDs
  and runs four provisioning steps in sequence (Ingest → Synthesize → Preview & Approve → Create),
  producing a complete Epic → Parent Task → Sub-task hierarchy in the QG project.
  Trigger this skill very aggressively whenever the user provides a KS ticket context, mentions
  creating QG test tasks, setting up test cases from a KS ticket, or generating any QA hierarchy
  — even if they don't use the exact phrases. It handles the full end-to-end setup.
---

# QA Workflow — KS Ticket → QG Jira Test Hierarchy

## Purpose

This orchestrator chains the four step-skills together into a single end-to-end workflow. It serves as the primary entry point whenever a KS team creates a new feature ticket and the QA team needs to provision a matching QG test hierarchy.

---

## Trigger Conditions

Activate this skill when the user:
- Provides a KS Jira ticket ID (e.g., `KS-950`) and asks to create QG tasks.
- Says something like "set up test cases from KS-950" or "generate QA hierarchy for this KS ticket".
- Pastes a KS ticket description and asks to break it down.

---

## Execution Order

Run each step sequentially. Because Jira creation is a permanent change to the workspace, do not start the next step until the current one fully completes or receives explicit user approval. 

```markdown
Step 1 → Ingest KS Ticket          (skill: step-1-ingest-ks-ticket)
Step 2 → Synthesize Requirements   (skill: step-2-synthesize-requirements)
Step 3 → Preview & User Approval   (skill: step-3-preview-and-approve)   ← Wait for manual approval here
Step 4 → Create QG Jira Tickets    (skill: step-4-create-qg-tickets)
```

---

## Step-by-Step Instructions

### Step 1 — Ingest KS Ticket
Follow **`QA skills/step-1-ingest-ks-ticket/SKILL.md`** in full.
- Input: KS ticket ID(s) provided by the user.
- Output: Raw ticket data object (summary, description, resolved comments).
- Pass the output forward to Step 2.

### Step 2 — Synthesize Requirements
Follow **`QA skills/step-2-synthesize-requirements/SKILL.md`** in full.
- Input: Raw ticket data from Step 1.
- Output: Structured QA breakdown (Epic / Parent Tasks / Sub-tasks) and the auto-saved `_requirements.md` file.
- Pass the breakdown forward to Step 3.

### Step 3 — Preview & User Approval
Follow **`QA skills/step-3-preview-and-approve/SKILL.md`** in full.
- Input: Structured breakdown from Step 2.
- Output: User-confirmed breakdown + resolved Sprint ID + Reporter account ID.
- Pause here and ask the user to confirm. Proceeding without confirmation risks creating incorrect structures in Jira.
- Auto-save `_QG-Jira-Task-Structure-Preview.md` after they approve.

### Step 4 — Create QG Jira Tickets
Follow **`QA skills/step-4-create-qg-tickets/SKILL.md`** in full.
- Input: Confirmed breakdown, Sprint ID, Reporter account ID from Step 3.
- Output: Created Epic, Parent Tasks, and Sub-tasks in QG; final summary table.

---

## Document Auto-Save (Building the Audit Trail)

To maintain a clear and historical audit trail for QA reviews, save the two persistent output files under:
```markdown
QA skills/qa-workflow-from-ks-ticket/task-analysis-records/
```

Derive the file name prefix from the **smallest** (minimum numerical value) KS ticket ID provided:
```markdown
<SMALLEST-KS-ID>_requirements.md
<SMALLEST-KS-ID>_QG-Jira-Task-Structure-Preview.md
```

Append new files rather than overwriting existing records, ensuring past creations are securely preserved.

---

## Error Handling

When errors occur during the workflow, follow these recovery strategies:

| Scenario | Action |
|---|---|
| User provides an invalid KS ticket ID | Report the error and ask the user to verify the ID. |
| Step 1 returns empty data | Surface the issue to the user and halt (data is required for synthesis). |
| Step 3 approval is denied with changes requested | Re-run Step 2 incorporating the user's updated notes, then re-present Step 3. |
| Step 4 fails mid-creation | Report the last successfully created ticket key, then ask the user how they would like to proceed. |
| Tool failures | Display the exact error message so the user can debug (avoid guessing or proceeding silently). |
