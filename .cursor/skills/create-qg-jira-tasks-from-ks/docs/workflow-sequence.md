# Workflow Execution Sequence for `create-qg-jira-tasks-from-ks`

This document describes the sequential processing workflow from ingesting KS ticket requirements to generating the finalized QA task structure on Jira.

---

## 🟢 Step 1: Ingestion & Intent Recognition (Phase 1)
- **Input:** A list of KS ticket numbers (e.g., `KS-934`, `KS-939`) and a specific user goal (Create a new Epic / Link to an existing Epic / Update requirements / Ad-hoc reorganization).
- **Action:** The AI identifies the optimal processing path among the 4 main Use-cases (determining whether to provision a new Epic or reuse an existing ID).

## 🟡 Step 2: Ingestion - KS Data Extraction (Phase 2)
- **Tool used:** `mcp_atlassian_jira_get_issue`
- **Action:** The AI sequentially queries the API to fetch the full context of the KS tickets (including `Summary`, `Description`, and all conversational `Comments`).
- **Goal:** Ensure no hidden updates, UI constraints, or embedded logic mentioned in thread comments are missed.

## 🟠 Step 3: Synthesis - Requirement Transformation (Phase 3)
- **Action:** Large Language Model (LLM) evaluates raw KS data, distills actual testable cases, and drafts a decomposed hierarchical matrix:
  - **Epic**: Represents the overarching feature pillar.
  - **Parent Task (Story)**: Decomposed into sub-features or UI/Logic clusters.
  - **Sub-task**: Detailed specific test scenarios.
- **Output:** Automatically generates the `task-analysis-records/[Smallest-KS-ID]_requirements.md` log file.

## 🔵 Step 4: Formatting & Preview Drafting (Phase 4)
- **Action:** AI enforces the "Strict QA Template" across the drafted structure:
  - **Epic level**: Enforces `Epic Overview` ➔ `Scope` ➔ `Preconditions` ➔ `Exit Criteria`.
  - **Parent/Sub-Task level**: Enforces `Test Objective` ➔ `Preconditions` ➔ `Test Steps` ➔ `Expected Result`.
  - Missing specifics not defined in the KS tickets automatically receive `[TBD - User needs to define...]` placeholders.
- **Output:** Automatically generates the `task-analysis-records/[Smallest-KS-ID]_QG-Jira-Task-Structure-Preview.md` file.
- **User Gate:** AI calls the `notify_user` command to halt the process, displays the preview to the chat, and waits for User Approval (`Continue`).

## 🟣 Step 5: Jira Injection - System Provisioning (Phase 5)
- **Tool used:** `mcp_atlassian_jira_create_issue`
- **Action:** Executes an automated provisioning loop on Jira:
  - Creates the Epic (if requested by user).
  - Creates Parent Tasks (IssueType: `Story`).
  - Uses the newly generated `IssueID` of the Parent Task to sequentially provision corresponding Sub-tasks.
- **Metadata constraints:** Force-injects `Assignee = Ly Nguyen`, `Reporter = Ly Nguyen`, automatically locates the ID of the `Active Sprint` on the QG board, and prefixes task Summaries with the feature name.

## 🟤 Step 6: Epic Linking & Finalization (Phase 6)
- **Tool used:** `mcp_atlassian_jira_link_to_epic`
- **Action:** Because Atlassian's MCP currently natively restricts passing `Epic Link` data tightly during issue-create, the AI executes a secondary loop: Linking all freshly generated Parent Tasks to the target Epic (`QG-...`).
- **Output:** Returns a success log with clickable Jira URLs to the user.

---

## 🧰 Auxiliary Step: Ad-hoc Task Reorganization (Phase 7)
**(This is a standalone sub-workflow, triggered only loosely via specific cleanup requests)**
1. **Scan Epic:** AI triggers a JQL scan across all issues under the target Epic (`parent = QG-XX`).
2. **Identify Orphan Tasks:** Filters out Sub-tasks or Bugs manually drafted by the User on UI testing that lack assignment to any particular Story/Parent Task.
3. **Semantic Match:** Reads the Summary/Description of orphan tasks and maps them contextually against the list of existing structured Parent Tasks.
4. **Link Issues:** Relies on the Jira Link API to adopt orphan tasks under their appropriate Parent Tasks, guaranteeing the 3-tier hierarchy remains unbroken permanently.
