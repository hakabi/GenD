# 📊 Epic Summary Report — Cash Forecasting Model

> **Epic:** [`KS-950`](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model
> **Project:** Kamehameha Schools (`KS`) · **Priority:** 🟡 Medium
> **Epic Owner:** tuan tran · **Reporter:** quan
> **Created:** 2026-03-02 · **Last Updated:** 2026-04-02

---

## ⚠️ Epic Health At-a-Glance

| Item | Value |
|---|---|
| Epic Status | 🔵 `To Do` *(should be updated to `In Progress`)* |
| Total Child Tickets | 3 |
| Done | 0 |
| Near Done | 1 (`Development Complete`) |
| In Progress | 2 |
| Active Blockers | 1 (unanswered calculation question in `KS-939`) |

---

## 🗺 Scope Overview

This Epic delivers the full **Cash Forecasting Model** across three interconnected layers:

```
KS-950  Cash Forecasting Model (Epic)
  ├── KS-934  Cash Forecast Data Loading          → Data Layer
  ├── KS-949  JSON Input and Output for CF Model  → API Contract Layer
  └── KS-939  Cash Forecast UI Specs              → Presentation Layer
```

---

## 🎫 Child Ticket Details

---

### ✅ `KS-934` — Cash Forecast Data Loading

| | |
|---|---|
| **Type** | Task |
| **Status** | 🟡 `Development Complete` |
| **Assignee** | tuan tran |
| **Reporter** | Kathleen Bui |
| **Label** | `sandbox` |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-934) |

#### What it covers

Provisions new datalake tables for five cash flow data sets pulled from Solovis APIs on a daily **Mon–Fri, 12pm EST** schedule:

| Data Set | Pull Frequency | Retention Logic |
|---|---|---|
| Future Cash Flows (≤1 year ahead) | Daily | Full wipe + refresh daily |
| Daily Avg Net Cash Flow (30-day & 90-day trailing) | Daily | Append per day (time series) |
| Historical Cap Calls/Distributions — Asset Class | Daily | Retain month-end; overwrite MTD daily |
| Historical Cap Calls/Distributions — Fund (30-day) | Daily | Full replace; no history retained |
| Historical Unfunded & NAVs — Asset Class | Daily | Rolling 36-month window refreshed daily |

#### Clarifications Resolved

- [x] Drop rows where `net_cash_in` is `0` or `NaN`
- [x] Override window = **36 months** (not 24)
- [x] Pull schedule = **Mon–Fri, 12pm EST**
- [x] Asset Class tables can be combined into one table
- [x] MTD replacement and month-end finalization logic confirmed

#### Status Assessment

Development is complete. No open blockers remain in comments. Pending formal **QA/UAT sign-off** before transitioning to `Done`.

> 🔴 **Gap:** No QA/UAT status is visible on this ticket. Datalake table output must be validated before `KS-939` and `KS-949` can close.

---

### 🔄 `KS-949` — JSON Input and Output for Cash Forecast Model

| | |
|---|---|
| **Type** | Improvement |
| **Status** | 🟡 `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Jerry Luo |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-949) |

#### What it covers

Defines the API contract for the compute server endpoint:

```
POST http://0.0.0.0:5001/managers/cash_forecast_model
```

- **Input JSON:** user-facing parameters to run the model
- **Output JSON:** structured forecast data consumed by the UI

#### Key Contract Decisions Confirmed

| Field | Source | Notes |
|---|---|---|
| `fad_beta` | Live real-time beta from **Aloha website homepage** | NOT user-inputted |
| `deriv_notional_value` | `body['base']['deriv_notional_value']` | Today's value, always current |
| Cash flow chart data | `body['base']['cash_flow_table']` | `Cash Closing` / `Closing Risk` / `Buffer` columns |

#### Status Assessment

Core contract is defined (JSON files attached in Jira). Still `In Progress` — awaiting final alignment with `KS-939` UI completion before closing.

> 🟡 **Gap:** No JSON schema validation or acceptance test referenced. Contract should be formally frozen before UI work finalizes.

---

### 🔄 `KS-939` — Cash Forecast UI Specs

| | |
|---|---|
| **Type** | Task |
| **Status** | 🟡 `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Kathleen Bui |
| **Label** | `sandbox` |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-939) |

#### What it covers

Front-end dashboard based on Figma designs + Word specification doc. Consumes:
- JSON output from compute server → `KS-949`
- Historical cash flow data from datalake → `KS-934`

#### UI Components Confirmed

| Component | Data Source | Notes |
|---|---|---|
| Cash Flow Summary Table (incl. `deriv_notional_value`) | Compute server JSON | Always "today's" values |
| Cash Closing / Closing Risk / Buffer Chart | `cash_flow_table` JSON output | Blue bar / Purple line / Grey dashed |
| Capital Calls & Distributions Stacked Bar Chart | Datalake (`KS-934`) | Calls & distributions shown **separately**; date range restricted to month-end dates; monthly intervals < 1.5 yrs, quarterly > 1.5 yrs |
| `fad_beta` input field | Live Aloha website beta | Auto-populated, not user-editable |
| 4th chart (placeholder) | N/A | **Removed** — source data not yet available |

#### ⚠️ Open Items / Active Blockers

> 🔴 **BLOCKER — Unanswered:** tuan tran asked (2026-03-24) how to calculate **`beta_contribution`** and **`beta_impact`** fields in the Details tab. **No response from Kathleen Bui yet.** This is blocking the Details tab implementation.

> 🟡 **Verify:** Figma access for the cash forecast design — reporter noted uncertainty about whether the file was shared correctly. Confirm all developers can access it.

> 🟢 **Resolved:** Daily pricing data (30-day/90-day) — store raw API output; Jerry Luo handles downstream calculations on the compute server.

---

## 📋 Recommended Next Actions

| # | Action | Owner | Ticket |
|---|---|---|---|
| 1 | 🔴 Respond to open question on `beta_contribution` and `beta_impact` calculation logic | Kathleen Bui | `KS-939` |
| 2 | 🟡 Update Epic `KS-950` status from `To Do` → `In Progress` | tuan tran | `KS-950` |
| 3 | 🟡 Confirm JSON contract is frozen, then close ticket | tuan tran / Jerry Luo | `KS-949` |
| 4 | 🟡 Run QA/UAT on datalake tables; transition to `Done` if passed | Team | `KS-934` |
| 5 | 🟢 Verify Figma design access is shared with all developers | Kathleen Bui / tuan tran | `KS-939` |

---

## 👥 Stakeholders

| Name | Role |
|---|---|
| Kathleen Bui | Product Owner / Business Analyst |
| Jerry Luo | Compute Server / Backend Engineer |
| tuan tran | Developer (all 3 child tickets) |
| quan | Epic Reporter |

---

*Generated: 2026-04-02 · Source: Jira project `KS` via MCP*
