# Standard Command Templates

This reference guide provides standardized prompts for the `create-qg-jira-tasks-from-ks` skill according to common use cases.

---

## 1. Initial Creation from KS Tickets
Use this when you have a list of KS requirement tickets and need to generate a full Jira QG hierarchy (Parent + Sub-tasks) under Epic QG-83.

- **Full Command:**
  `@[/create-qg-jira-tasks-from-ks] Ingest requirements from tickets [KS-XXX, KS-YYY]. Synthesize the breakdown according to the standard QA format, generate a hierarchy under Epic QG-83, and automate the creation of all Parent Tasks and Sub-tasks directly on Jira. Ensure the active sprint and assignee 'Ly Nguyen' are populated.`
- **Short Command:**
  `@[/create-qg-jira-tasks-from-ks] Create full QG task hierarchy from KS-XXX, KS-YYY logic under Epic QG-83.`
- **Notes:**
  - Use the **Full Command** when you need guaranteed precision on metadata like assignee, sprint, or specific formatting rules.
  - Use the **Short Command** for habitual daily use when you trust the skill's default internal logic for metadata.

---

## 2. Reorganizing Orphan (Manually Created) Tasks
Use this if you have manually created tasks on the Jira UI that are linked to Epic QG-83 but not grouped into any Parent Task (orphans).

- **Full Command:**
  `@[/create-qg-jira-tasks-from-ks] Perform an ad-hoc reorganization scan of Epic QG-83 to identify all manually created orphan tasks. Categorize these orphans into their appropriate Parent Tasks (e.g., UI, Functional, Chart, Data) using Jira issue links and ensure they follow the strict QA formatting standards.`
- **Short Command:**
  `@[/create-qg-jira-tasks-from-ks] Group manually created orphan tasks in Epic QG-83 into appropriate Parent Task containers.`
- **Notes:**
  - This is essential for maintaining a clean hierarchy after human edits. 
  - It automatically fixes the links between manually added tasks and their logical "container" Parent Tasks.

---

## 3. Retroactive QA Formatting (Enforcement)
Use this to enforce the strict QA format (Objective, Preconditions, Steps, Expected Result) on existing Jira tickets that were created without the standard template.

- **Full Command:**
  `@[/create-qg-jira-tasks-from-ks] Audit Epic QG-83 and all its associated child issues. For any Parent Task or Sub-task missing the standardized QA format, perform a retrofit operation to update their descriptions with mandatory headers: *Test Objective:*, *Preconditions:*, *Test Steps:*, and *Expected Result:*.`
- **Short Command:**
  `@[/create-qg-jira-tasks-from-ks] Enforce strict QA standard formatting on all tickets under Epic QG-83.`
- **Notes:**
  - Standardizes the appearance of all issues even if they were migrated or manually created.
  - Ensures audit-readiness across the entire feature tree.

---

## 4. Requirements Preview (Analysis Only)
Use this if you want the AI to analyze the KS tickets and show you the proposed structure BEFORE any issues are actually created on Jira.

- **Full Command:**
  `@[/create-qg-jira-tasks-from-ks] Ingest requirements from KS-XXX and perform a synthesis analysis. Generate the requirements documentation in 'task-analysis-records/' and provide the breakdown preview file. DO NOT create any Jira issues at this stage; wait for user approval.`
- **Short Command:**
  `@[/create-qg-jira-tasks-from-ks] Preview QG-Jira task breakdown for KS-XXX only.`
- **Notes:**
  - Recommended for complex features where the test plan needs a "sanity check" by a human before bulk issue creation.
  - Generates the `_QG-Jira-Task-Structure-Preview.md` file in the `task-analysis-records/` folder.
