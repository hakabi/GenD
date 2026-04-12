---
name: step-4-create-qg-tickets
description: >
  Step 4 of the QA agentic workflow. Takes the user-approved breakdown from
  Step 3 and creates the full Epic → Parent Task → Sub-task ticket hierarchy
  in the QG Jira project in strict dependency order. Outputs a structured
  summary table with Jira links for each created ticket. Trigger this skill 
  whenever the user approves a breakdown and asks you to generate the tickets, 
  or asks you to provision tasks into Jira based on an approved plan.
---

# Step 4 — Create QG Jira Tickets

## Purpose

The QA team requires the complete, approved test case hierarchy to be provisioned in the QG Jira project so they can begin picking up tasks. By strictly following the dependency order (Epic -> Parent -> Sub-task), you ensure that Jira's relational links are built correctly and parent keys exist before children try to attach to them. 

---

## Input

- Approved Epic / Parent Task / Sub-task breakdown from Step 3.
- `active_sprint_id` (resolved in Step 3).
- `reporter_account_id` (resolved in Step 3).

---

## Instructions

### 4a — Create the Epic

To establish the umbrella container for the testing phase, please create the Epic first:

```markdown
project_key = "QG"
issue_type  = "Epic"
summary     = [Epic Summary from breakdown]
description = [Full Epic body in Markdown — Epic Overview, Scope, Preconditions, Exit Criteria]
assignee    = "ly.nguyen@conceptia.com"
additional_fields = {
  "reporter": {"accountId": "[reporter_account_id]"}
}
```

- Call `mcp_atlassian_jira_create_issue` with the above fields.
- **Wait and capture the returned key** (e.g., `QG-100`). Do not attempt to create child tickets until you have this confirmed Epic key.

---

### 4b — Create Parent Tasks

For each Parent Task in the approved breakdown, run the following creation process:

```markdown
project_key  = "QG"
issue_type   = "Story"    # Use "Task" if it is purely configuration/operational rather than a test
summary      = [Parent Task summary]
description  = [Full body in Markdown — Test Objective, Preconditions, Test Steps, Expected Result]
assignee     = "ly.nguyen@conceptia.com"
additional_fields = {
  "reporter":           {"accountId": "[reporter_account_id]"},
  "customfield_10020":  [active_sprint_id]
}
```

- Call `mcp_atlassian_jira_create_issue` for each Parent Task.
- Capture each returned key (e.g., `QG-101`, `QG-102`).

> **Epic Linking context:** The `customfield_10014` and `epicLink` fields are restricted on this Jira project's screen and will throw errors if passed during creation. Instead, after each Story is successfully created, please use `mcp_atlassian_jira_link_to_epic` with the Story key and the Epic key to establish the link.

Please create Parent Tasks sequentially rather than in parallel so that if Jira throws an error, it is isolated and easy for the user to debug.

---

### 4c — Create Sub-tasks

Sub-tasks represent the granular work for the QA engineers. For each Sub-task under each Parent Task:

```markdown
project_key  = "QG"
issue_type   = "Subtask"
summary      = [Sub-task summary — actionable, specific]
description  = [Full body in Markdown — Test Objective, Preconditions, Test Steps, Expected Result]
assignee     = "ly.nguyen@conceptia.com"
additional_fields = {
  "parent":   "[PARENT_TASK_KEY]",
  "reporter": {"accountId": "[reporter_account_id]"}
}
```

- Call `mcp_atlassian_jira_create_issue` for each Sub-task.
- Creating all Sub-tasks for one Parent Task before moving to the next helps keep the output log organized.

---

### 4d — Output: Creation Summary Report

After all tickets are successfully created, please present a clean summary to the user:

```markdown
## ✅ Created QG Jira Tickets

| Ticket  | Type    | Summary                              | Linked To |
|---------|---------|--------------------------------------|-----------|
| QG-100  | Epic    | [Epic summary]                       | —         |
| QG-101  | Story   | [Parent Task 1 summary]              | QG-100    |
| QG-102  | Subtask | [Sub-task 1.1 summary]               | QG-101    |

🔗 Epic: https://conceptia.atlassian.net/browse/[EPIC-KEY]
```

Remind the user of any `[TBD]` items that they still need to manually fill in before testing begins.

---

## Creation Order Summary

For reference, the successful flow is:
1. Epic
2. Parent Task 1  →  Link to Epic  →  Sub-tasks 1.x
3. Parent Task 2  →  Link to Epic  →  Sub-tasks 2.x

---

## Error Handling

If the Jira API throws errors, follow these recovery strategies:

| Scenario | Action |
|---|---|
| Epic creation fails | Halt entirely and report the error. Child tickets cannot exist without the Epic. |
| Parent Task creation fails | Complete the current task's siblings if possible, then pause and ask the user how to proceed. |
| Sub-task creation fails | Report which sub-task failed and ask if the user wants to retry or skip it. |
| Jira field rejected | Show the user the exact API backtrace message so they know what to fix. |
