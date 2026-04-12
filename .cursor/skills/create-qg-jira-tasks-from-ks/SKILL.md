---
name: create-qg-jira-tasks-from-ks
description: >
  Synthesizes requirements from one or more KS Jira tickets (summary, description, and comments)
  and automatically creates a structured Epic → Parent Task (Story/Task) → Sub-task hierarchy in
  the QG Jira project. Trigger this skill whenever the user provides KS ticket IDs and asks to
  generate QG tasks, create Jira work items, break down KS requirements, or set up test tasks
  from KS tickets — even if they don't explicitly use the exact phrase "create QG tasks".
---

# Create QG Jira Tasks from KS Tickets

## Purpose

Requirements coming from the KS project are often spread across multiple tickets, buried in comments, or contain back-and-forth clarifications. This skill consolidates that scattered information into a single, accurate requirement set and provisions a complete, linked Jira ticket hierarchy in the QG project. This saves the user significant time and prevents context from falling through the cracks.

---

## Document Auto-Save (Building the Audit Trail)

To maintain a clear, reliable history of all generated requirements, please proactively save two persistent Markdown files to `task-analysis-records/` inside this skill folder when running the flow. Appending or creating new files (rather than overwriting) ensures the user maintains an audit trail.

**File naming convention** — derive names using the **smallest** (minimum numerical value) KS ticket ID from the input:

**Example 1:**
Input: `KS-949`, `KS-939`, `KS-934`
Output files: 
- `task-analysis-records/KS-934_requirements.md`
- `task-analysis-records/KS-934_QG-Jira-Task-Structure-Preview.md`

Save `_requirements.md` immediately after Phase 2 is complete (before showing the preview).  
Save `_QG-Jira-Task-Structure-Preview.md` immediately after the user approves the breakdown in Phase 3.

---

## Phase 1 — Ingest KS Ticket Data

Fetch all KS tickets provided by the user in parallel to minimize latency.
Use `mcp_atlassian_jira_get_issue` to retrieve the `summary`, `description`, and full `comment` thread.

Read comments carefully. Product owners frequently override or refine requirements in comment threads after the description was originally written. To ensure the final requirements are accurate, prioritize the most **recent comment from a product owner** when the description and comments conflict.

---

## Phase 2 — Synthesize Requirements

Analyze the collected data and produce a consolidated requirement breakdown structured as an Epic spanning one or more Parent Tasks, which each hold actionable Sub-tasks.

### Decomposition Guidelines

- **Epic**: The entire feature initiative (e.g., "Cash Forecast Dashboard").
- **Parent Task**: A major, independently-deliverable component (e.g., "Data Loading Pipeline").
- **Sub-task**: A single, actionable unit of work for one person (e.g., "Implement daily Capital Calls ingestion job").

Keep sub-tasks focused enough that a single engineer can pick them up. If a comment explicitly removes a requirement, exclude it from the breakdown and add a brief note about why. Capture resolved clarifications (dates, rules, etc.) directly in the ticket design so the implementation team does not have to hunt for context.

### Output Formats

Please structure the hierarchy levels using the exact markdown templates below, ensuring all headings are present so the resulting tickets maintain QA standardization. If a section lacks details in the source tickets, simply insert a placeholder note (e.g., `[TBD - user needs to define]`) rather than dropping the heading.

**Epic Template:**
```markdown
# [Epic Summary]
## Epic Overview
[Summary of the module]
## Scope
[Bullet list of associated tasks]
## Preconditions
[Global preconditions]
## Exit Criteria
[Conditions to close the Epic]
```

**Parent/Sub-Task Template:**
```markdown
# [Task Summary]
## Test Objective
[Clear verification goal]
## Preconditions
[Required setup or access]
## Test Steps
[Numbered action steps]
## Expected Result
[Bulleted list of outcomes]
```

> **Reminder:** Auto-save this synthesized output to `_requirements.md` before proceeding.

---

## Phase 3 — Preview and User Approval

Before creating tickets, establish the user's intended environment. Call `mcp_atlassian_jira_get_agile_boards` (project "QG") and `mcp_atlassian_jira_get_sprints_from_board` (state "active") to find the active sprint. Resolve the reporter's account ID (e.g., "ly.nguyen@conceptia.com"). 

Present the full generated breakdown to the user, including the resolved Sprint info.

### Asking for Approval
Since Jira ticket creation permanently alters the company workspace, please pause and explicitly ask the user: **"Does this breakdown look correct? Should anything be changed before I create the Jira tickets?"** 

Wait for the user's confirmation before moving to Phase 4.

---

## Phase 4 — Create Jira Tickets (QG Project)

Create tickets in strict dependency order: Epic first, then Parent Tasks, then Sub-tasks, because child keys require the parent key to exist in Jira.

### Ticket Linking (Important Note)
Because `customfield_10014` and `epicLink` fields are restricted on the QG project screen, attempting to set them during creation will fail. Instead, after a Story is created, simply use `mcp_atlassian_jira_link_to_epic` to form the link.

Capture each ticket's generated key (e.g. `QG-100`) sequentially as you progress down the hierarchy to feed into the parent fields of subsequent Sub-tasks.

---

## Phase 5 — Creation Summary Report

After all tickets are provisioned, format a clean summary table showing the `Ticket`, `Type`, `Summary`, and what it is `Linked To`. Provide a direct, clickable markdown link to the Epic so the user can immediately view their tickets in Jira.

> **Reminder:** Append this summary to the `_QG-Jira-Task-Structure-Preview.md` file.

---

## Phase 6 — Ad-hoc Tasks Reorganization (Optional)

If the user asks to organize manually created tasks:
1. Fetch all issues tied to the Epic using `mcp_atlassian_jira_search`.
2. Identify standalone manual tasks (Story/Bug) missing standard test prefixes.
3. Analyze their descriptions and map them to the most logical Parent Task story.
4. Link them to the parent task via `mcp_atlassian_jira_create_issue_link` (link_type="Relates") so they sit under the correct umbrella.
5. Report the successfully linked issues back to the user.
