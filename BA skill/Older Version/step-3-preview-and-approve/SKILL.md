---
name: step-3-preview-and-approve
description: >
  Step 3 of the QA agentic workflow. Resolves the active QG sprint and reporter
  account ID, presents a full human-readable breakdown preview to the user, and
  safely gates execution until the user confirms or requests changes. Auto-saves the approved
  preview as a _QG-Jira-Task-Structure-Preview.md file. Trigger this skill whenever 
  you need to ask the user to preview a Jira test task hierarchy before creating 
  any tickets, or when a user wants to review the breakdown structure.
---

# Step 3 — Preview & User Approval

## Purpose

Creating bulk tickets in Jira alters the company workspace permanently. The purpose of this step is to serve as a safety gate. By giving the QA team a chance to review and agree on the ticket structure before anything is written to Jira, you prevent massive data cleanup efforts later. Once the user confirms, the breakdown becomes the reliable source of truth for Step 4.

Please treat this step as a blocking gate. Wait until the user explicitly approves before proceeding to Step 4.

---

## Input

- Structured breakdown from Step 2 (Epic / Parent Tasks / Sub-tasks).
- List of `[TBD]` items from Step 2.
- Smallest Ticket ID (used for file naming).

---

## Instructions

### 3a — Resolve Sprint and Reporter (Pre-flight)

Before presenting the preview, please run these two lookups in parallel to populate the final ticket data:

#### Active Sprint
1. Call `mcp_atlassian_jira_get_agile_boards` with `project_key = "QG"` to get the board ID.
2. Call `mcp_atlassian_jira_get_sprints_from_board` with `state = "active"` to list active sprints.
3. Capture the sprint `id` and `name`.
4. If no active sprint is found, ask the user which sprint to use before continuing.

#### Reporter Account ID
1. Call `mcp_atlassian_jira_get_user_profile` using the reporter's email (e.g., `ly.nguyen@conceptia.com`).
2. Capture the returned `accountId`.
3. If the call fails, ask the user to supply the correct email or account ID manually.

---

### 3b — Present the Breakdown Preview

Display the full breakdown to the user in a clean, readable Markdown format, such as:

```markdown
## QG Jira Ticket Breakdown Preview
**Source KS Ticket(s)**: [KS-ID list]
**Active Sprint**: [Sprint Name] (ID: [sprint_id])
**Assignee**: [Name]
**Reporter**: [Email]

---

### Epic: [Epic Summary]
[Epic description — one clear paragraph from the Epic Overview]

**Preconditions**:
- [...]

**Exit Criteria**:
- [...]

---

### Parent Task 1: [Title]
**Type**: Story / Task
**Sprint**: [Sprint Name]
**Assignee**: [Name]

**Test Objective**: [...]
**Preconditions**: [...]
**Test Steps**: (see full breakdown in _requirements.md)
**Expected Result**: [...]

**Sub-tasks:**
- Sub-task 1.1 — [summary]
- Sub-task 1.2 — [summary]

---
### Parent Task 2: [Title]
...

---

> [!WARNING] 
> **TBD Items Requiring Attention**
> - [TBD item 1]
> - [TBD item 2]
```

---

### 3c — Request User Confirmation

After presenting the preview, explicitly ask the user for permission to create the tickets:

> **"Does this breakdown look correct? Should anything be changed before I create the Jira tickets?"**

#### If the user approves:
- Proceed to §3d (auto-save) and then pass control to Step 4.

#### If the user requests changes:
- Collect all requested changes precisely.
- Apply them to the breakdown.
- Re-present the updated preview.
- Request confirmation again. Repeat until the user is satisfied.

#### If the user wants to abort:
- Acknowledge the cancellation and do not create any Jira tickets. (The `_requirements.md` saved in Step 2 is safely retained as a record).

---

### 3d — Auto-Save Approved Preview

Immediately after the user confirms, preserve the approved preview to:

```markdown
QA skills/create-qg-jira-tasks-from-ks/task-analysis-records/[SMALLEST-TICKET-ID]_QG-Jira-Task-Structure-Preview.md
```

File content should include:
- A Header containing source ticket IDs, approval timestamp, sprint name, and assignee.
- The full breakdown exactly as presented and approved.
- The `[TBD]` items list at the bottom.

If a file with the same name already exists, append a timestamp suffix (e.g., `_Preview_20260328.md`) rather than overwriting it, so historical approvals aren't lost.

---

## Output

Pass the following forward to **Step 4 (Create QG Jira Tickets)**:
- The user-approved Epic / Parent Task / Sub-task breakdown.
- `active_sprint_id`
- `reporter_account_id`
- Confirmation that the preview file was saved.

---

## Error Handling

| Scenario | Action |
|---|---|
| Board lookup returns no results | Report the error and ask the user for the board ID directly. |
| No active sprint found | Ask the user which sprint to assign tickets to. |
| Reporter profile fails | Ask the user to provide the Jira account ID. |
| User doesn't respond to approval request | Patiently hold and do not proceed. |
