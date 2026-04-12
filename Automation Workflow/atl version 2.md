---
description: Automation Testing Lifecycle (ATL) 6-Phase Workflow
---

# Automation Testing Lifecycle (ATL) Workflow

This workflow formalizes the process from requirement analysis to automated test execution and bug reporting for the **<TICKET_ID>** project.

## Phase 1: Requirement Analysis (analyze-synthesize-ks-ticket)
**Goal:** Synthesize clear and testable technical requirements from Business/Dev tickets.
- **Action:** Run the analyze-synthesize-ks-ticket skill for **<TICKET_ID>**.
- **Output:** A synthesized requirement document with a filename derived from the Ticket Summary of the selected ticket, combined with a `YYYYMMDD_HHMMSS` timestamp.

## Phase 2: Test Design (ks-requirements-to-qg-tasks)
**Goal:** Break down requirements into structured Test Scenarios and push them to Jira.
- **Action:** Run the ks-requirements-to-qg-tasks skill using the output from Phase 1.
- **Structure:** Create an Epic, then Stories, then Sub-tasks in the QG project.
- **Naming:** Follow the naming convention `[PHASE 2] <Summary>`.

## Phase 3: Automation Architecture (xpath-to-csharp-pom, pom-to-csharp-page)
**Goal:** Establish the Page Object Model (POM) and validate UI compatibility.

### 3.1 UI Scanning (xpath-to-csharp-pom)
- **Action:** Use the xpath-to-csharp-pom skill to scan the target web page and extract unique XPaths.

### 3.2 Validation (Branching Point) (pom-to-csharp-page)
- **Action:** Run the pom-to-csharp-page skill to validate the generated XPaths.
- **Condition:** Compare the generated XPaths against the requirements/tasks from Phase 2.
- **Pass:** If XPaths match the UI elements required for testing, proceed to the final generation step (3.3).
- **Fail:** If there is a mismatch (missing elements, incorrect XPaths), **HALT** the process. 
  - Log the discrepancies.
  - Notify the user to update either the Jira tasks or the UI/XPath extraction before continuing.

### 3.3 POM Generation (pom-to-csharp-page)
- **Action:** Execute the final step of the pom-to-csharp-page skill to output the complete 'pom.md' file.
- **Naming Rule:** The 'pom.md' file should be named according to the module in the ticket description (e.g., `cash-forecast-xpath.md`).
- **Target Path:** Save the file to `docs/aloha/user-steps/<module-name>/` (e.g., `docs/aloha/user-steps/cash-forecast/`).

## Phase 4: Automation Scripting
**Goal:** Generate robust NUnit automation code.
- **Action:** Fuse test scenarios with element interactions to generate executable automated test methods.
- **Inputs:** 
  - **[INPUT 1] Jira Stories (from Phase 2):** Provides test scenarios, step-by-step actions, input data, and expected results.
  - **[INPUT 2] POM Class (from Phase 3):** Provides web element locators (XPaths) and interaction methods (e.g., clicks, text inputs).
- **Auto-read by skill (no manual input required):**
  - **Project Constitution (`constitution.md`):** Automatically read to enforce code formatting, testing principles, and project conventions.
  - **Reference Templates:** Automatically read to adhere to the exact code structure, assertion styles, logging and wait handling from the standard template files (`SeleniumWorkbenchApp\Pages\RiskModelPage.cs` and `SeleniumWorkbenchApp\Tests\Features Testing\Regression Testing\RiskModelTest.cs`).
- **Output:** **C# Test Scripts** that combine the test logic from Input 1 with the interaction logic from Input 2.
- **Standard:** Use NUnit framework with standard assertions. Ensure code follows DRY principles, incorporates Data-Driven approaches where applicable, and includes detailed logging for test steps.

## Phase 5: Test Execution & Branching
**Goal:** Execute tests, generate reports, and handle failures automatically.

### 5.1 Execution (run-autotest)
- **Inputs:** The **C# Test Scripts** (test classes and methods) successfully generated and validated in Phase 4.
- **Action:** Execute the **run-autotest** skill to run the newly generated NUnit test classes or methods. This skill automatically composes the correct `dotnet test` CLI commands, applies filters (Single Class, Single Method, or Multi-Method), and enforces the required `-p:Platform=x64` configuration.
- **Reporting:** Analyze the detailed console logs output by the skill (`logger "console;verbosity=detailed"`) or parse `.trx` reports in the `TestResults/` directory to evaluate success or failure.

### 5.2 Branching Logic
- **Passed:** If all tests pass, generate a final Test Execution Summary and end the lifecycle.
- **Failed:** If any test fails, perform the following:
  1. **Record Failures:** Collect and display the full list of failed test names, error messages, and stack traces from the console log or `.trx` report in `TestResults/`.
  2. **Generate Repro Script:** Automatically create an `Isolated_Bug_Repro_<ID>.cs` script that isolates each failure for quick verification.
  3. **Trigger Phase 6:** Do NOT create any Jira bug tickets yet. Immediately hand off the failure list to **Phase 6** for root cause investigation — a bug ticket is only appropriate once the cause is confirmed to be an App Bug.


## Phase 6: Failure Investigation (investigate-failed-tests)
**Skill:** `investigate-failed-tests`
**Goal:** Diagnose **why** each failed test failed — determining whether the root cause is an App Bug, a broken XPath/POM, or a Script error — and route each failure to the correct remediation path.
- **Trigger:** Automatically invoked after Phase 5.2 when one or more tests are **Failed**. Manual trigger: _"investigate failures"_, _"why did tests fail?"_, _"diagnose failed tests"_, _"check what caused failures"_, or similar.

### 6.1 Parse Failure List
- **Inputs (in priority order):**
  1. Failed test summary from **Phase 5 Step 4** console log
  2. `.trx` report files in the `TestResults/` directory
- **Extract for each failed test:**
  - `TC name` (test method name)
  - `Error message` (the assert/exception message)
  - `Stack trace` (which line/step failed)
  - `XPath or element` involved (cross-reference with the Page Object from Phase 3)

### 6.2 Classify Each Failure
- **Action:** Open a browser session, navigate to the relevant page URL for each failed TC, and apply the following decision tree:
```
For each FAILED test:
  │
  ├─ Can the target element be found on the live page?
  │    ├─ NO  → 🟡 BROKEN XPATH  (UI changed, POM is stale)
  │    └─ YES → Does the element have the correct value/state?
  │                ├─ NO  → 🔴 APP BUG     (data/logic issue on the app side)
  │                └─ YES → 🟠 SCRIPT BUG  (assert logic or timing issue in the test)
```
- **Classification Tags:**

| Tag | Meaning | Next Action |
|---|---|---|
| 🔴 **App Bug** | App is returning wrong data/state | **Create Jira Bug ticket now** with full evidence (Steps, Stack Trace, Expected vs Actual, screenshots) |
| 🟡 **Broken XPath** | Element locator is stale; DOM changed | Re-trigger **Phase 3** to regenerate Page Object — no Jira bug ticket needed |
| 🟠 **Script Bug** | Test logic/assert/wait is incorrect | Re-trigger **Phase 4** to fix the specific test method — no Jira bug ticket needed |

### 6.3 Output: Failure Investigation Report
- **Action:** Generate a markdown report saved to `TestResults/FailureReport_<YYYYMMDD_HHMMSS>.md`.
- **Report format:**
```markdown
# Failure Investigation Report
Generated: <timestamp>

## Summary
| Status | Count |
|--------|-------|
| 🔴 App Bug        | N |
| 🟡 Broken XPath   | N |
| 🟠 Script Bug     | N |
| ✅ Total Failed    | N |

## Detail
### ❌ <TCMethodName>
- **Error:** <error message>
- **Classification:** 🔴 App Bug / 🟡 Broken XPath / 🟠 Script Bug
- **Evidence:** <what was observed on the live page>
- **Recommended Action:** <re-run Phase X / update XPath / fix assert>
```

### 6.4 Branching: Remediation Routing
- **Action:** Present the Failure Investigation Report to the user, then route each failure accordingly:

| Classification | Route |
|---|---|
| All pass investigation | ✅ **Lifecycle Complete** — generate final Test Execution Summary |
| 🟡 Broken XPath found | ↪️ **Return to Phase 3** — re-run `xpath-doc-generator` for affected elements; no Jira bug ticket |
| 🟠 Script Bug found | ↪️ **Return to Phase 4** — re-generate or patch affected test methods; no Jira bug ticket |
| 🔴 App Bug confirmed | 📋 **Create Jira Bug Ticket NOW** in the QG project with full evidence: Steps to Reproduce, Stack Trace, Expected vs Actual result, and screenshots/logs. Then **Link it to the original QG Epic**. |