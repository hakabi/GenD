# Automation Testing Lifecycle (ATL) Workflow

> **Source:** [Confluence — QG Space, Page ID 463175682](https://gendvn.atlassian.net/wiki/spaces/QG/pages/463175682/Automation+Testing+Lifecycle+ATL+Workflow)
> **Saved on:** 2026-04-03

This workflow formalizes the process from requirement analysis to automated test execution and bug reporting for the KS-939 project.

---

## Phase 1: Requirement Analysis

**Goal:** Synthesize clear and testable technical requirements from Business/Dev tickets.

- **Action:** Run the `analyze-synthesize-ks-ticket` skill for KS-939.
- **Output:** A synthesized requirement document with a `YYYYMMDD_HHSS` timestamp.

---

## Phase 2: Test Design

**Goal:** Break down requirements into structured Test Scenarios and push them to Jira.

- **Action:** Run the `create-qg-jira-tasks-from-ks` skill using the output from Phase 1.
- **Structure:** Create an Epic, then Stories, then Sub-tasks in the QG project.
- **Naming:** Follow the naming convention `[PHASE 2] <Summary>`.

---

## Phase 3: Automation Architecture (Element Locators)

**Goal:** Establish the Page Object Model (POM) and validate UI compatibility.

### 3.1 UI Scanning

- **Action:** Use the `xpath-to-csharp-pom` skill to scan the target web page and extract unique XPaths.

### 3.2 Validation (Branching Point)

**Condition:** Compare the generated XPaths against the requirements/tasks from Phase 2.

- **Pass:** If XPaths match the UI elements required for testing, proceed to Step 3.3.
- **Fail:** If there is a mismatch (missing elements, incorrect XPaths), **HALT** the process.
  1. Log the discrepancies.
  2. Notify the user to update either the Jira tasks or the UI/XPath extraction before continuing.

### 3.3 POM Generation

- **Action:** Generate the C# Page Object Model class using the unique XPaths.

---

## Phase 4: Automation Scripting

**Goal:** Generate robust NUnit automation code.

- **Action:** Combine the Jira Stories (Phase 2) and the POM Class (Phase 3) to generate C# test scripts.
- **Standard:** Use NUnit framework with standard assertions.

---

## Phase 5: Test Execution & Branching

**Goal:** Execute tests, generate reports, and handle failures automatically.

### 5.1 Execution

- **Action:** Run the generated NUnit tests.
- **Reporting:** Generate a detailed HTML report in the `TestResults/` directory.

### 5.2 Branching Logic

- **Passed:** If all tests pass, generate a final summary and end the lifecycle.
- **Failed:** If any test fails, perform the following:
  1. **Create Jira Bug:** Generate a professional bug ticket in the QG project following the company standard format.
  2. **Link to Epic:** Link the bug to the original QG Epic key.
  3. **Generate Repro Script:** Automatically create an `Isolated_Bug_Repro_<ID>.cs` script that isolates the failure for quick developer verification.

---

## Comments

### Quan's Comment

> One common capability we are looking to have is the validation. After each stage, we should have a validation step immediately. Validation, feedback, and fix should be inside one stage, not waiting for the next step to do.

**Interpretation for diagram design:** Every phase must contain an internal validation loop — after its main action, a validation step checks correctness. If it fails, feedback and fix happen inside that same phase before emitting output to the next phase. This is not a gate between phases; it is a sub-step within each phase.
