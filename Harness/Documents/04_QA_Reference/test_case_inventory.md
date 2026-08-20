# Aloha Harness — Test Case Inventory

> **Living document** — update whenever you create, run, or triage a case in QOps Harness.  
> **Plan reference:** [`QA_Test_Plan.md`](./QA_Test_Plan.md)  
> **Environment:** `workbench-app.lab.gend.vn` (primary) · `aloha.conceptia.com` (later)

---

## Quick stats (update after each session)

| Metric | Value | Last updated |
|--------|-------|--------------|
| Cases in Harness | 5 planned today | 2026-07-02 |
| Smoke suite | 5 / ~20 created | 2026-07-02 |
| Last smoke pass rate | _fill after run_ | — |
| Failing / needs triage | _fill after run_ | — |
| Session file | `workbench-auth.json` | — |

**Team owners:** QA Lead · QA-B · QA-C _(replace with names when fixed)_

---

## How to update this file

1. **Create case in Harness** → add a row (or change `Planned` → `In Harness`).
2. **After a run** → set `Last run`, `Last result`, and `Status`.
3. **After triage** → set `Triage` and `Jira` if filed.
4. **Rename in Harness** → copy exact Harness case slug into `Harness case ID`.
5. **End of day** → update Quick stats and Changelog.

### Status values

| Status | Meaning |
|--------|---------|
| `Planned` | In plan only — not created in Harness yet |
| `Draft` | Created but prompt not finalized |
| `In Harness` | Saved in Harness, not run yet |
| `Passed` | Last run passed |
| `Failed` | Last run failed — needs triage |
| `Flaky` | Passes intermittently |
| `Blocked` | Cannot run (auth, env, feature not deployed) |
| `Deprecated` | No longer valid — do not run |

### Last result

`—` · `Pass` · `Fail` · `Not run`

### Triage

`—` · `Needs triage` · `App bug` · `Test script` · `New feature` · `Known / expected`

### Conceptia-ready?

`Yes` · `Needs review` · `Never` _(any case that writes data)_

---

## Smoke suite (daily) — `smoke` + `env-lab`

| ID | Harness case ID | Case name | Category | Owner | Tags | Status | Last run | Last result | Triage | Conceptia-ready? | Jira | Notes |
|----|-----------------|-----------|----------|-------|------|--------|----------|-------------|--------|------------------|------|-------|
| SMK-01 | _paste from Harness_ | `aloha-loads-without-login-redirect` | navigation | QA Lead | smoke, env-lab, P1 | Planned | — | Not run | — | Yes | — | Day 1 — session check |
| SMK-02 | _paste from Harness_ | `public-fund-header-metrics-are-numeric` | navigation | QA Lead | smoke, env-lab, P1, public-fund | Planned | — | Not run | — | Yes | — | Day 1 |
| SMK-03 | _paste from Harness_ | `rating-dialog-appears-when-clicking-final-fund` | overview | QA Lead | smoke, env-lab, P1, public-fund | Planned | — | Not run | — | Yes | — | Day 1 — boss sample; re-run old fails |
| SMK-04 | _paste from Harness_ | `risk-model-dashboard-loads-on-public-fund` | risk | QA Lead | smoke, env-lab, P1, public-fund | Planned | — | Not run | — | Yes | — | Day 1 |
| SMK-05 | _paste from Harness_ | `scenario-test-tables-load-on-public-fund` | scenario-test | QA Lead | smoke, env-lab, P1, public-fund | Planned | — | Not run | — | Yes | — | Day 1 — read-only |
| SMK-06 | | `search-fund-returns-results` | search-export | QA-B | smoke, env-lab, P1 | Planned | — | Not run | — | Yes | — | Bonus Day 1 |
| SMK-07 | | `total-endowment-header-metrics-are-numeric` | navigation | QA-C | smoke, env-lab, P1, total-endowment | Planned | — | Not run | — | Yes | — | |
| SMK-08 | | `private-fund-header-metrics-are-numeric` | navigation | QA-C | smoke, env-lab, P1, private-fund | Planned | — | Not run | — | Yes | — | |
| SMK-09 | | `pipeline-header-metrics-are-numeric` | navigation | QA-C | smoke, env-lab, P1, pipeline | Planned | — | Not run | — | Yes | — | |
| SMK-10 | | `total-endowment-nav-greater-than-component-funds` | navigation | QA Lead | smoke, env-lab, P1 | Planned | — | Not run | — | Needs review | — | Relative check only |
| SMK-11 | | `overview-charts-render-with-legends` | overview | QA-B | smoke, env-lab, P1 | Planned | — | Not run | — | Yes | — | Returns + pie |
| SMK-12 | | `overview-asset-table-top-level-rows-visible` | overview | QA-B | smoke, env-lab, P1 | Planned | — | Not run | — | Yes | — | |
| SMK-13 | | `export-excel-triggers-download-on-overview` | search-export | QA-B | smoke, env-lab, P1 | Planned | — | Not run | — | Needs review | — | Download assertion |
| SMK-14 | | `return-public-tab-loads` | return-public | QA-B | smoke, env-lab, P2 | Planned | — | Not run | — | Yes | — | |
| SMK-15 | | `return-private-tab-loads` | return-private | QA-B | smoke, env-lab, P2 | Planned | — | Not run | — | Yes | — | |
| SMK-16 | | `liquidity-tab-loads` | liquidity | QA-C | smoke, env-lab, P2 | Planned | — | Not run | — | Yes | — | |
| SMK-17 | | `cash-forecast-dashboard-subtab-loads` | cash-forecast | QA Lead | smoke, env-lab, P2 | Planned | — | Not run | — | Yes | — | Smoke only — no deep CF |
| SMK-18 | | `cash-forecast-historical-flows-subtab-loads` | cash-forecast | QA Lead | smoke, env-lab, P2 | Planned | — | Not run | — | Yes | — | Smoke only |
| SMK-19 | | `cash-forecast-details-subtab-loads` | cash-forecast | QA Lead | smoke, env-lab, P2 | Planned | — | Not run | — | Yes | — | Smoke only |

---

## Regression backlog (not smoke — add rows as you create cases)

_Use same columns. Copy this header row when adding new sections._

### Overview — owner: QA-B

| ID | Harness case ID | Case name | Category | Owner | Tags | Status | Last run | Last result | Triage | Conceptia-ready? | Jira | Notes |
|----|-----------------|-----------|----------|-------|------|--------|----------|-------------|--------|------------------|------|-------|
| OVR-01 | | `fad-percent-totals-one-hundred-on-total-endowment` | overview | QA-B | regression, env-lab, P1, total-endowment | Planned | — | Not run | — | Needs review | — | Relative % check |
| OVR-02 | | `child-nav-sums-to-parent-row` | overview | QA-B | regression, env-lab, P1 | Planned | — | Not run | — | Needs review | — | |
| OVR-03 | | `asset-table-sort-by-asset-column` | overview | QA-B | regression, env-lab, P2 | Planned | — | Not run | — | Yes | — | |
| OVR-04 | | `add-filter-applies-and-clears` | overview | QA-B | regression, env-lab, P2 | Planned | — | Not run | — | Yes | — | |
| OVR-05 | | `owned-by-ks-checkbox-filters-list` | overview | QA-B | regression, env-lab, P2 | Planned | — | Not run | — | Yes | — | |

### Risk — owner: QA-C

| ID | Harness case ID | Case name | Category | Owner | Tags | Status | Last run | Last result | Triage | Conceptia-ready? | Jira | Notes |
|----|-----------------|-----------|----------|-------|------|--------|----------|-------------|--------|------------------|------|-------|
| RSK-01 | | `risk-weight-column-sums-to-hundred` | risk | QA-C | regression, env-lab, P1 | Planned | — | Not run | — | Needs review | — | |
| RSK-02 | | `risk-subtabs-switch-correctly` | risk | QA-C | regression, env-lab, P2 | Planned | — | Not run | — | Yes | — | Output/Parameters/History |
| RSK-03 | | `risk-download-report-produces-file` | risk | QA-C | regression, env-lab, P2 | Planned | — | Not run | — | Needs review | — | |
| RSK-04 | | `risk-no-stale-data-when-switching-fund-tabs` | risk | QA-C | regression, env-lab, P1, negative | Planned | — | Not run | — | Yes | — | |

### Scenario Test — owner: QA-C

| ID | Harness case ID | Case name | Category | Owner | Tags | Status | Last run | Last result | Triage | Conceptia-ready? | Jira | Notes |
|----|-----------------|-----------|----------|-------|------|--------|----------|-------------|--------|------------------|------|-------|
| SCN-01 | | `scenario-flow-recalculates-total-endowment` | scenario-test | QA-C | regression, env-lab, P1 | Planned | — | Not run | — | Never | — | Writes input — lab only |
| SCN-02 | | `scenario-negative-input-no-nan` | scenario-test | QA-C | regression, env-lab, P1, boundary | Planned | — | Not run | — | Never | — | |
| SCN-03 | | `scenario-inputs-reset-after-page-refresh` | scenario-test | QA-C | regression, env-lab, P1, security | Planned | — | Not run | — | Never | — | |

### Search & cross-cutting — owner: QA-B

| ID | Harness case ID | Case name | Category | Owner | Tags | Status | Last run | Last result | Triage | Conceptia-ready? | Jira | Notes |
|----|-----------------|-----------|----------|-------|------|--------|----------|-------------|--------|------------------|------|-------|
| SRC-01 | | `search-no-match-shows-empty-state` | search-export | QA-B | regression, env-lab, P2, negative | Planned | — | Not run | — | Yes | — | |
| SRC-02 | | `deep-link-restores-correct-tab` | navigation | QA-B | regression, env-lab, P2 | Planned | — | Not run | — | Needs review | — | |

### Cash Forecast (deferred — promote when stable)

| ID | Harness case ID | Case name | Category | Owner | Tags | Status | Last run | Last result | Triage | Conceptia-ready? | Jira | Notes |
|----|-----------------|-----------|----------|-------|------|--------|----------|-------------|--------|------------------|------|-------|
| CF-01 | | _see CF_tickets_breakdown.md KS-963+_ | cash-forecast | QA Lead | regression, env-lab | Planned | — | Not run | — | Never | KS-963 | Full suite later |

---

## Day 1 prompts (SMK-01 … SMK-05)

Copy into Harness **Single Test Case** or **New Request**. After save, paste the Harness slug into the `Harness case ID` column.

### SMK-01 — `aloha-loads-without-login-redirect`

```
Project: aloha
Go to workbench-app.lab.gend.vn
Validate that the Aloha application loads without a login redirect loop
Validate that the main fund navigation is visible (Total Endowment, Public Fund, Private Fund, Pipeline)
Validate that the Overview tab is visible
```

### SMK-02 — `public-fund-header-metrics-are-numeric`

```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Validate that the Public Fund section is selected
Validate that header metrics are visible and numeric (not blank, not NaN): Equity Beta, Risk, % Illiquid Asset, NAV, and Total Unfunded Commitments
Validate that each metric shows a real number or percentage, not "—" or empty
```

### SMK-03 — `rating-dialog-appears-when-clicking-final-fund`

```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
On the Overview tab, expand the asset categories in the financial assets table until a final fund row is reached that cannot be expanded further
Click on that final fund
Validate that the Rating dialog for the fund appears
Validate that the dialog can be closed without breaking the page
```

### SMK-04 — `risk-model-dashboard-loads-on-public-fund`

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

### SMK-05 — `scenario-test-tables-load-on-public-fund`

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

### SMK-06 — `search-fund-returns-results` (bonus)

```
Project: aloha
Go to workbench-app.lab.gend.vn
Use the search bar to search for "AQR"
Validate that search results or fund-related content appears
If a fund result is clickable, click it and validate that a fund detail view or fund tab appears
```

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-07-02 | QA Lead | Initial inventory: smoke SMK-01…19, regression placeholders, Day 1 prompts |

---

## Row template (copy when adding a new case)

```markdown
| NEW-XX | _harness-slug_ | `case-name-kebab-case` | category | Owner | tags | In Harness | YYYY-MM-DD | Pass/Fail | — | Yes | — | notes |
```
