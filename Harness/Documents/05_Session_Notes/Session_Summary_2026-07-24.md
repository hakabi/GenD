# Harness QA — Session Summary

> **Session span:** 2026-07-02 → 2026-07-24
> **Topic:** Planning and running LLM + Playwright automated tests (QOps Harness) against the Aloha platform
> **Primary environment:** `workbench-app.lab.gend.vn` (lab) · `aloha.conceptia.com` flagged for later
> **Team:** 3 QA (QA Lead + QA-B + QA-C)
> **Related files:** [`QA_Test_Plan.md`](../04_QA_Reference/QA_Test_Plan.md) · [`test_case_inventory.md`](../04_QA_Reference/test_case_inventory.md)

---

## 1. What we decided

| Decision | Outcome |
|----------|---------|
| **Scope wave 1** | Test the stable pages first: Overview, Risk, Scenario Test, navigation, search, exports |
| **Cash Forecast** | Deferred — just implemented and unstable. Smoke-only (3 sub-tab load checks) until UAT stabilizes it |
| **Environment** | Lab (`workbench-app.lab.gend.vn`) is primary. Everything designed so cases re-point to `aloha.conceptia.com` with a one-line change |
| **Conceptia rule** | Production is read-only until approved — any case that writes data (Scenario inputs, Fund Setup, Upload) is `Never` for Conceptia |
| **Credentials** | Working lab login confirmed. First task was capturing `workbench-auth.json` session |
| **Team size** | 3 QA → ~3 weeks to steady state. QA Lead: setup/smoke/reporting; QA-B: Overview + search/export; QA-C: Risk + Scenario Test + navigation |
| **Assertions** | Structural checks (~80%) are env-agnostic. Data checks are **relative** (sums, ratios) — never hard-coded values, because lab data ≠ prod data |

---

## 2. Key operational rules

- **Naming:** `<expected-behavior>-when-<action>` (kebab-case).
- **Tags:** type (`smoke`/`regression`/`negative`/`boundary`/`security`) + priority (`P1`/`P2`) + fund context (`public-fund` etc.) + `env-lab` + Jira key when relevant.
- **Prompt convention:** environment appears only in the first line (`Go to workbench-app.lab.gend.vn`) for easy migration.
- **Cadence:** daily smoke + triage · 2–3×/week regression · Test Bug mode for every manual defect · weekly report from Dashboard CSV export.
- **#1 false-failure source:** expired auth session (Q4 login redirect loop / 401). Refresh `workbench-auth.json` before batch runs.

---

## 3. Tool-access limitation (noted twice)

I **cannot** access `https://qops-harness.lab.gend.vn/requests` or take live screenshots — that page is behind Google login held in your browser; my tools don't inherit that session, and direct fetches timed out. To share results: **paste a screenshot**, **export the Dashboard CSV**, or **paste the request rows as text**, and I'll read/triage them.

---

## 4. All test prompts created this session

Prompts are grouped by the day/batch they were created. All use the lab environment. Copy each block into Harness **Single Test Case** or **New Request**.

### 4.1 Day 1 — Foundation smoke (SMK-01 … SMK-06)

Basic "does it load" checks. 3–6 steps, element-presence assertions.

**SMK-01 — `aloha-loads-without-login-redirect`** · navigation, P1
```
Project: aloha
Go to workbench-app.lab.gend.vn
Validate that the Aloha application loads without a login redirect loop
Validate that the main fund navigation is visible (Total Endowment, Public Fund, Private Fund, Pipeline)
Validate that the Overview tab is visible
```

**SMK-02 — `public-fund-header-metrics-are-numeric`** · navigation, P1, public-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Validate that the Public Fund section is selected
Validate that header metrics are visible and numeric (not blank, not NaN): Equity Beta, Risk, % Illiquid Asset, NAV, and Total Unfunded Commitments
Validate that each metric shows a real number or percentage, not "—" or empty
```

**SMK-03 — `rating-dialog-appears-when-clicking-final-fund`** · overview, P1, public-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
On the Overview tab, expand the asset categories in the financial assets table until a final fund row is reached that cannot be expanded further
Click on that final fund
Validate that the Rating dialog for the fund appears
Validate that the dialog can be closed without breaking the page
```

**SMK-04 — `risk-model-dashboard-loads-on-public-fund`** · risk, P1, public-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Click on Risk tab
Validate that the Risk Model Dashboard loads
Validate that the Total Risk table is visible with rows such as Equity - Beta and a Total FAD summary row
Validate that the Risk Allocation chart or pie is visible
Validate that the Download Report button is visible
```

**SMK-05 — `scenario-test-tables-load-on-public-fund`** · scenario-test, P1, public-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Click on Scenario Test tab
Validate that the Test Scenario input table is visible with asset rows (e.g. Absolute Return, Private Equity, Total Cash)
Validate that the Prior Day Comparison table is visible below
Validate that the Total Endowment summary row is visible in both tables
Validate that no cell shows NaN or undefined text
```

**SMK-06 — `search-fund-returns-results`** · search-export, P1
```
Project: aloha
Go to workbench-app.lab.gend.vn
Use the search bar to search for "AQR"
Validate that search results or fund-related content appears
If a fund result is clickable, click it and validate that a fund detail view or fund tab appears
```

---

### 4.2 Day 2 — Coverage expansion (SMK-07, 08, 09, 11 + Risk History)

Extends smoke to other fund tabs, Overview charts, and Risk History subtab.

**SMK-07 — `total-endowment-header-metrics-are-numeric`** · navigation, P1, total-endowment
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
Validate that Total Endowment is selected
Validate that header metrics are visible and numeric (not blank, not NaN): Equity Beta, Risk, % Illiquid Asset, NAV, and Total Unfunded Commitments
Validate that the Overview tab is visible and selected by default
```

**SMK-08 — `private-fund-header-metrics-are-numeric`** · navigation, P1, private-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Private Fund tab
Validate that Private Fund is selected
Validate that header metrics are visible and numeric: Equity Beta, Risk, % Illiquid Asset, NAV, and Total Unfunded Commitments
Validate that the financial assets table loads with at least one expandable row (e.g. Private Equity or Venture Capital)
```

**SMK-09 — `pipeline-header-metrics-are-numeric`** · navigation, P1, pipeline
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Pipeline tab
Validate that Pipeline is selected
Validate that header metrics are visible and numeric: Equity Beta, Risk, % Illiquid Asset, NAV, and Total Unfunded Commitments
Validate that the Overview content area loads without error (charts or table visible)
```

**SMK-11 — `overview-charts-render-with-legends`** · overview, P1, total-endowment
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
On the Overview tab, validate that the Endowment Historical Returns chart is visible with a legend (Return and Benchmark)
Validate that the Asset Class Breakdown chart (pie or donut) is visible with a legend listing asset classes
Validate that neither chart area is blank or shows only a loading spinner indefinitely
```

**Bonus — `risk-history-subtab-filter-and-open`** · risk, P1, total-endowment (Inventory RSK-02)
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
Click on Risk tab
Click on the History sub-tab (not Output)
Validate that From and To date pickers are visible
Validate that Run mode dropdown and Only Owner checkbox are visible
Validate that the History Risk Report table is visible with columns including As of Date, User, Run Mode, Run Time, and Link
Validate that at least one row has an Open link
Click Open on the first available row and validate that a risk report view opens without error
```

---

### 4.3 Batch CX — Complex multi-step (CX-01 … CX-05)

8–11 steps. Interactions, relative sums, cross-fund state, boundary input, sandbox reset.

**CX-01 — Overview drill-down + data integrity** · regression, P1, overview, total-endowment
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
On the Overview tab, in the financial assets table, read the "% of FAD" value on the top "Financial Assets" row and validate it equals 100% (allow rounding to 1 decimal)
Expand the "Public Equities" category
Validate that the sum of the "Est Daily NAV" values of its visible child rows is approximately equal to the "Est Daily NAV" shown on the "Public Equities" parent row (allow small rounding difference)
Validate that any negative percentage value in the table is rendered with a minus sign or parentheses, not as a blank cell
Collapse "Public Equities" again and validate the child rows are hidden
```

**CX-02 — Sort + filter interaction on asset table** · regression, P2, overview, public-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
On the Overview tab, click the "Asset" column header to sort
Validate that the row order changes after sorting
Click the "Asset" column header again and validate the order reverses
Click "+ Add Filter", apply any available filter option, and validate the table updates to a filtered subset
Clear or remove the filter and validate the full table is restored
Toggle the "Owned by KS" checkbox and validate the list of rows changes accordingly
```

**CX-03 — Cross-fund state isolation on Risk** · regression, P1, risk, negative
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Click on Risk tab
Wait for the Risk Model Dashboard to load and note the Total PAD (or Total FAD) risk value shown
Click on Private Fund tab while staying on the Risk tab
Validate that the Risk dashboard reloads and the Total risk value updates to reflect Private Fund (it should differ from the Public Fund value, not show stale data)
Switch to Total Endowment tab and validate the Risk dashboard updates again
Validate that no chart or table shows a loading spinner that never resolves, and no cell shows NaN
```

**CX-04 — Scenario Test recalculation + sandbox reset** · regression, P1, scenario-test, boundary, security · Conceptia: Never
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Click on Scenario Test tab
In the "Scenario Flows in millions" column, enter -50 for the "Total Cash" row (or the first editable asset row)
Validate that the "Scenario NAV" for that row recalculates and the "Total Endowment" summary row updates accordingly
Validate that no cell displays NaN, undefined, or blank after recalculation
Reload the page (navigate to workbench-app.lab.gend.vn again and return to the Scenario Test tab)
Validate that the scenario input has reset to empty (the -50 is not persisted)
```

**CX-05 — Risk History filter → open report round trip** · regression, P1, risk, total-endowment
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
Click on Risk tab
Click on the History sub-tab
Set the "From" date to about 2 weeks before today and the "To" date to today
Validate that the History Risk Report table shows one or more rows with columns As of Date, User, Run Mode, Run Time, and an Open link
Validate that all visible rows have an "As of Date" within the selected From–To range
Click the "Open" link on the first row
Validate that a risk report / Output view opens without error and shows risk data (a table or chart), not a blank page
```

---

### 4.4 Batch DX — Cross-component reconciliation (DX-01 … DX-05)

Hardest batch. Chart vs table vs header vs exported file agreement, and full user journeys.

**DX-01 — Chart vs table consistency on Overview** · regression, P1, overview, public-fund
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
On the Overview tab, read the percentage values shown in the "Asset Class Breakdown" chart legend (e.g. Private Equity, Absolute Return, Fixed Income, Total Cash)
In the financial assets table below, expand the top level so the matching asset-class rows are visible
For at least 3 asset classes, validate that the "% of FAD" value in the table is approximately equal to the percentage shown for that same asset class in the chart legend (allow rounding to 1 decimal)
Validate that the chart legend percentages add up to approximately 100%
Report any asset class where the chart and table percentages differ by more than 1 percentage point
```

**DX-02 — Header ↔ Overview table reconciliation across funds** · regression, P1, navigation, overview
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Read the "NAV" value shown in the Public Fund summary header
On the Overview tab, read the "Est Daily NAV" on the top "Financial Assets" row of the table
Validate that these two NAV values are approximately equal (allow rounding / billions-vs-full-number formatting differences)
Now click on Private Fund tab
Read the Private Fund header NAV and the Financial Assets row Est Daily NAV
Validate they are approximately equal for Private Fund too
Validate that the Public Fund NAV and Private Fund NAV are different values (confirming fund context actually changed)
```

**DX-03 — Export Excel content validation** · regression, P2, search-export, total-endowment
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
On the Overview tab, note the top-level asset rows visible in the financial assets table (e.g. Private Equity, Absolute Return, Public Equities, Real Assets, Fixed Income, Total Cash)
Click "Export Excel File"
Validate that a file download is triggered and the file has an .xlsx (or .xls) extension
Validate that the downloaded file is not empty (has a non-zero size)
If the file contents can be read, validate that it contains column headers similar to the on-screen table (Asset, Est Daily NAV, % of FAD) and at least one of the asset class row names seen on screen
```

**DX-04 — Full search journey: search → detail → rating → back** · regression, P1, search-export, overview, negative
```
Project: aloha
Go to workbench-app.lab.gend.vn
Use the search bar to search for "AQR Absolute Return Fund"
Validate that a matching fund result appears in the search results
Click the matching fund result
Validate that a fund detail view or fund-specific page opens showing the fund name
If a Rating dialog or Rating section is available for the fund, open it and validate rating information is displayed
Close the dialog / detail view
Validate that you are returned to a usable Aloha page (navigation tabs still visible, no blank screen or error)
Search again for a term that should have no match, such as "zzzznotarealfund"
Validate that a "no results" / empty state is shown rather than an error or a stale previous result
```

**DX-05 — Risk Top-Ten tables integrity** · regression, P1, risk, total-endowment
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
Click on Risk tab
On the Output sub-tab, locate the "Top Ten Contributors to Equity Beta Risk (by Index)" table
Validate that it shows no more than 10 rows
Validate that the "% Weight" (or Risk Allocation) column is sorted in descending order from top to bottom
Locate the "Risk Allocation by Asset Class" chart and validate its legend percentages add up to approximately 100%
Locate the "Top Ten Manager Contributors to Risk" table and validate it also shows no more than 10 rows sorted descending
Validate that no numeric cell in these tables shows NaN, blank, or a negative weight where a positive is expected
```

---

## 5. Prompt complexity progression

| Batch | Steps | Assertion focus | Hardest cases |
|-------|-------|-----------------|---------------|
| Day 1 (SMK-01…06) | 3–6 | Element appears / loads | — |
| Day 2 (SMK-07…11 + History) | 4–9 | Coverage across funds + subtabs | Risk History open |
| CX (CX-01…05) | 8–11 | Interactions, relative sums, state isolation, boundary, reset | CX-03 (stale data), CX-04 (persistence) |
| DX (DX-01…05) | 8–11 | Cross-component reconciliation (chart↔table↔header↔file), full journeys | DX-01 (chart vs table), DX-03 (file content) |

---

## 6. Pending / next actions

| Item | Owner | Status |
|------|-------|--------|
| Run DX-01 … DX-05 and report results | QA team | Pending — results to be shared for triage |
| Share results with me (screenshot / CSV / text — not a live link) | QA Lead | Pending |
| Triage failures (App bug / Test script / New feature) | Me + QA | Blocked on results |
| Add CX-01…05 and DX-01…05 rows to `test_case_inventory.md` | Me | Pending results |
| Watch DX-01, DX-02 for real data-consistency bugs → Jira | QA Lead | Pending |
| DX-03 may exceed runner's file-reading ability → log against Harness backlog P2-8 (data-value/file assertions) | QA Lead | Note |

---

## 7. Report-back format for results

```
DX-01: Pass/Fail | harness-slug | AI-fallback? yes/no | error or mismatch detail (include actual numbers compared)
DX-02: ...
```

---

*Summary generated 2026-07-24. Source of truth for the plan: `QA_Test_Plan.md`. Live case status: `test_case_inventory.md`.*
