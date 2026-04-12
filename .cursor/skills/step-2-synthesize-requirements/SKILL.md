---
name: step-2-synthesize-requirements
description: >
  Step 2 of the QA agentic workflow. Takes the structured ticket data produced
  by Step 1 and synthesizes it into a complete, QA-ready test breakdown using
  the standard Epic → Parent Task → Sub-task hierarchy. Trigger this skill 
  whenever the user asks you to write QA requirements, synthesize test plans, 
  break down an epic, or create test cases from raw ticket data. It auto-saves 
  the output as a _requirements.md file before passing the data to Step 3.
---

# Step 2 — Synthesize Requirements

## Purpose

Transform the raw, resolved Jira ticket data into a structured QA test plan that maps cleanly to Jira ticket types: Epic, Parent Task (Story/Task), and Sub-task. Following a standardized layout ensures that the generated Jira tickets are immediately actionable by the QA team without requiring heavy manual formatting later.

---

## Input

- Structured ticket object(s) and cross-ticket notes from Step 1.

---

## Instructions

### 2a — Determine the Hierarchy

Analyze the ingested data and design the following ticket structure:

```markdown
Epic
└── Parent Task 1 (Story or Task)
    ├── Sub-task 1.1
    ├── Sub-task 1.2
    └── Sub-task 1.3
└── Parent Task 2
    ├── Sub-task 2.1
    └── ...
```

#### Level Guidelines

| Level | Scope | Typical QA Examples |
|---|---|---|
| **Epic** | The entire feature or initiative being tested | "Cash Forecast Dashboard — QA", "Peer Analysis Module — Verification" |
| **Parent Task** | A major, independently testable area | "Functional Testing", "UI/UX Verification", "API Contract Testing", "Regression Testing" |
| **Sub-task** | A single, specific test case one QA engineer can execute | "Verify correct data loads on dashboard open", "Test date picker rejects invalid ranges" |

#### Decomposition Hints

- Please keep sub-tasks specific and self-contained — e.g. one person, one action, one expected result. This makes testing cleaner.
- If a comment explicitly removed a requirement, exclude it from the breakdown and add a note explaining why.
- Capture resolved clarifications (e.g., specific date ranges, field names, API endpoints) directly in the relevant ticket description so QA engineers do not need to hunt through old comment threads.
- For each unresolved ambiguity flagged by Step 1, add a `[TBD]` placeholder and surface it prominently.

---

### 2b — Apply Formatting to Each Level

To ensure the final Jira tickets render nicely for the QA team, please use the exact structures below. Try not to omit headings even if information is scarce; instead, use a `[TBD]` placeholder so the team knows context is missing.

#### Epic Format

```markdown
# [Epic Summary]
## Epic Overview
[Summary of what the entire feature covers from a QA perspective]
## Scope
[Bullet list of associated Parent Tasks]
## Preconditions
[Global preconditions for the entire Epic — e.g., test environment available]
## Exit Criteria
[Conditions to close the Epic e.g., All child tasks are marked Done]
```

#### Parent Task and Sub-task Format

```markdown
# [Task Summary]
## Test Objective
[Clear, concise summary of what this task verifies]
## Preconditions
[Required setup, access rights, or prerequisite state]
## Test Steps
1. [Step 1]
2. [Step 2]
## Expected Result
- [Specific, verifiable outcome 1]
- [Specific, verifiable outcome 2]
```

---

### 2c — Handle Missing Information

If the original ticket does not provide enough detail for any heading:
- Still include the heading to preserve the template structure.
- Fill it with a `[TBD]` note that explains what is missing and who should provide it.

Example:
```markdown
## Test Steps
[TBD — Jira ticket does not specify the exact user flow. QA lead should define the interaction steps before execution.]
```

---

### 2d — Auto-Save Requirements Document

Immediately after completing the analysis and before showing any preview to the user, please save the requirements to a file to preserve an audit trail:

```markdown
../create-qg-jira-tasks-from-ks/task-analysis-records/[SMALLEST-TICKET-ID]_requirements.md
```

The file should contain:
1. A header block with the source ticket IDs, date, and author (agent).
2. The full structured breakdown in the format defined in §2b above.
3. Any "Removed / Deferred Requirements" and reasons from Step 1.
4. Any `[TBD]` items listed together at the bottom for easy review.

---

## Output

Pass the following to **Step 3 (Preview & User Approval)**:

- The complete Epic / Parent Task / Sub-task structured breakdown.
- The list of `[TBD]` items.
- The smallest ticket ID (for file naming).
- Confirmation that `_requirements.md` has been saved successfully.

---

## Error Handling

| Scenario | Action |
|---|---|
| No requirements can be extracted | Halt; ask the user to clarify the ticket content before proceeding. |
| All sub-tasks would be `[TBD]` | Warn the user; ask if they want to proceed anyway or provide more context. |
| File save fails | Report the error; still proceed to Step 3 but flag the save failure. |
