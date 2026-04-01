---
name: step-1-ingest-ks-ticket
description: >
  Step 1 of the QA agentic workflow. Fetches the full content of one or more
  KS/BA Jira tickets (summary, description, and all comments), resolves any
  conflicts between the description and comment thread, and returns a clean
  structured data object for use in Step 2. Trigger this skill whenever you need 
  to audit, ingest, read, or review a KS/KS ticket's requirements thoroughly, 
  especially if the user asks you to read a ticket before doing QA work.
---

# Step 1 — Ingest Jira Ticket

## Purpose

Ticket descriptions are often written early in the feature lifecycle. As clarifications emerge, product owners or engineers refine, override, or remove requirements in the comment thread. This step ensures you read the **complete and authoritative** version of every requirement, preventing out-of-date assumptions before attempting any QA analysis.

---

## Input

- One or more Jira ticket IDs provided by the user (e.g., `KS-950`).

---

## Instructions

### 1a — Fetch Tickets in Parallel

Call `mcp_atlassian_jira_get_issue` for every ticket ID simultaneously to minimise latency for the user. Please request these fields for each ticket so you have enough context:

- `summary`: Feature headline
- `description`: Original feature specification
- `comment`: Full comment thread including author name, account ID, and timestamp
- `status`: Ticket status
- `priority`: Ticket priority
- `assignee`: The owner of the ticket

---

### 1b — Resolve Comment-vs-Description Conflicts

After fetching the ticket data, apply these analytical rules:

1. **Read all comments in chronological order** (oldest to newest) to understand the evolution of the feature.
2. Identify any comment that overrides, removes, or refines a requirement stated in the original description.
3. Because product owners and stakeholders iterate in the comments, the most recent authoritative comment takes precedence over the original description.
4. If multiple people comment and the final decision is ambiguous, flag the ambiguity in the output object so Step 2 can surface it to the user for manual review.

---

### 1c — Build the Ingested Ticket Object

For each ticket, please produce a structured data object using this Markdown format:

```markdown
**Ticket ID**: [Ticket Key]
**Summary**: [Ticket Summary]
**Status**: [Status]
**Priority**: [Priority]
**Assignee**: [Name]

**Resolved Description**:
[The authoritative requirement text — original description with any overrides from comments applied inline. Mark overridden text clearly.]

**Active Requirements**:
- [Requirement 1 — active]
- [Requirement 2 — active]

**Removed / Deferred Requirements**:
- [Requirement X — reason: "removed per comment by [author] on [date]"]

**Unresolved Ambiguities**:
- [Any conflicts that could not be automatically resolved]
```

If a ticket has no comments, simply place `None` or `-` in the Removed/Deferred and Ambiguities sections.

---

### 1d — Multi-ticket Consolidation

If the user provides more than one ticket:
- Produce one structured object per ticket.
- Add a **Cross-ticket Notes** section at the end that calls out any overlapping requirements or dependencies between the fetched tickets.

---

## Output

Pass the following forward to **Step 2 (Synthesize Requirements)**:
- One structured ticket object per input Jira ticket ID.
- The cross-ticket notes (if applicable).
- The **smallest ticket number** (for file naming in later steps).

---

## Error Handling

If errors occur, use these guidelines to recover gracefully:

| Scenario | Action |
|---|---|
| Ticket ID not found | Report which ID failed and ask the user to verify it. |
| Description field is empty | Continue analyzing using the comments only, and note the missing description in the output object. |
| No clear decision in comments | Flag as an unresolved ambiguity rather than guessing the outcome. |
| Tool error | Surface the exact error message so the user is aware of why the fetch failed. |
