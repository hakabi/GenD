# 🎨 Jira Ticket Reference — `KS-939`

> **Ticket:** [`KS-939`](https://gendvn.atlassian.net/browse/KS-939) — Cash Forecast UI Specs
> **Epic:** [`KS-950`](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model
> **Type:** Task · **Priority:** 🟡 Medium · **Status:** 🟡 `In Progress`
> **Assignee:** tuan tran · **Reporter:** Kathleen Bui · **Label:** `sandbox`
> **Created:** 2026-01-07 · **Last Updated:** 2026-04-02

---

## 📋 Ticket Description

Implement the Cash Forecast front-end dashboard based on Figma designs and the attached Word UI specification document.

**Figma Design Link:**
[Cash Forecast Figma ↗](https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast?node-id=0-1&m=dev&t=qfA6kQm8fndkeZIs-1)

> ⚠️ *Reporter noted uncertainty about Figma access. Developers should confirm access before starting UI implementation. See also: request from Bình Hà Khoa (2026-04-02) for Figma access.*

**Reference Docs (attached in Jira):**
- `Cash Forecast UI Documentation.docx`
- `input.json` *(compute server input contract)*
- `cash_forecast_output.json` *(compute server output contract — original)*
- `cash_forecast_response.json` *(compute server output contract — updated with transactions table, added 2026-03-25)*

---

## 🏗 Data Architecture

The dashboard consumes data from **two sources**:

```
┌─────────────────────────────────────────────────────┐
│              Cash Forecast Dashboard                 │
│                                                     │
│  ┌───────────────────┐   ┌───────────────────────┐  │
│  │  Compute Server   │   │  Datalake (KS-934)    │  │
│  │  (Jerry Luo)      │   │  (tuan tran)          │  │
│  │                   │   │                       │  │
│  │  - Cash flow tbl  │   │  - Cap Calls/Distrib  │  │
│  │  - Deriv notional │   │    by Asset Class     │  │
│  │  - Transactions   │   │  - Fund NAV by date   │  │
│  │    (beta cols)    │   │                       │  │
│  └─────────┬─────────┘   └──────────┬────────────┘  │
│            │                        │               │
│            └────────────┬───────────┘               │
│                         ▼                           │
│              Dashboard renders on load               │
│              Refreshes every morning                 │
└─────────────────────────────────────────────────────┘
```

**Refresh cadence:** Compute server loads each morning and outputs results for display. Dashboard should reflect the latest morning run on initial load.

---

## 🧩 UI Components

### 1. Cash Flow Summary Table

| Property | Detail |
|---|---|
| **Data Source** | Compute server JSON output |
| **Refresh** | Daily — "today's" values always shown |
| **Key Field** | `deriv_notional_value` → from `body['base']['deriv_notional_value']` |
| **As-of-Date** | Always today; no date selector for this table |

**Fund NAV column (left panel, highlighted in UI):**
- Source: Datalake — Fund NAV by as-of-date
- Load from the datalake API for the current date

---

### 2. Cash Closing / Closing Risk / Buffer Chart

| Property | Detail |
|---|---|
| **Data Source** | `body['base']['cash_flow_table']` in compute server JSON output |
| **Chart Type** | Combined bar + line chart |

**Column-to-visual mapping:**

| JSON Column | Visual | Style |
|---|---|---|
| `Cash Closing` | Primary bar | 🔵 Blue bar |
| `Closing Risk` | Overlay line | 🟣 Purple line |
| `Buffer` | Reference line | ⬜ Grey dashed line |

---

### 3. Capital Calls & Distributions — Stacked Bar Chart

| Property | Detail |
|---|---|
| **Data Source** | Datalake — Historical Cap Calls/Distributions by Asset Class (`KS-934`) |
| **Chart Type** | Stacked bar chart |

**Display rules:**
- Capital calls and distributions are shown **separately** (not aggregated together)
- Each asset class has its own bars per period

**Date range selector:**
- Start Date: restricted to **month-end dates only**
- End Date: restricted to **month-end dates** or **"today's date"**
- Interval logic:
  - Period **< 1.5 years** → use **monthly intervals**
  - Period **≥ 1.5 years** → use **quarterly intervals** (sum monthly values into quarters)

---

### 4. Transactions Detail Table (Details Tab)

| Property | Detail |
|---|---|
| **Data Source** | Compute server JSON — transactions table (updated `cash_forecast_response.json`) |
| **Base data** | Same as daily-loaded future transactions from `KS-934` |
| **Additional columns** | Calculated by compute server: `beta`, `beta_contribution`, `beta_impact` |
| **Also includes** | Hypothetical trades |

**Column definitions (confirmed by Jerry Luo, 2026-03-30):**

| Column | Source | Calculation |
|---|---|---|
| `beta` | Compute server | From JSON output |
| `beta_contribution` | Compute server | From JSON output |
| `beta_impact` | Compute server | From JSON output |

> ✅ **Resolved (2026-03-25):** Jerry Luo updated `cash_forecast_response.json` to include the transactions table with `beta`, `beta_contribution`, and `beta_impact` columns.

---

### 5. Asset Class Breakdown (Fixed Income & Total Cash)

| Asset Class | Display Rule |
|---|---|
| **Fixed Income** | List dynamically — show whatever accounts are active at the time (currently: *Payden US Treasury* only) |
| **Total Cash** | Display all sub-classes (e.g., `Cash`, `Cash In Transit`, etc.) — mimic existing screen layout |

> ✅ **Resolved (2026-03-25):** Fixed Income historical sample had more accounts; only show current live accounts.

---

### 6. `fad_beta` Input Field

| Property | Detail |
|---|---|
| **Source** | Live real-time beta from **Aloha website homepage** |
| **User-editable** | ❌ No — auto-populated only |
| **Passed to** | Compute server JSON input as `fad_beta` |

> ✅ **Resolved (2026-03-09/10):** Confirmed by Jerry Luo & tuan tran — use live beta, not manual user input.

---

### 7. Removed Component

> ~~4th placeholder chart~~ — **Removed.** Source data is not yet available. May be re-added in a future iteration.

---

## 💬 Comment Thread — Full Log

| # | Date | Author | Summary |
|---|---|---|---|
| 1 | 2026-03-09 | Jerry Luo | Added `fad_beta` field requirement — pull from Aloha website live beta, not user input |
| 2 | 2026-03-10 | tuan tran | Confirmed: will use real-time beta |
| 3 | 2026-03-10 | tuan tran | Questions: what is `deriv_notional_value`? How to retrieve chart data? Aggregate or separate cap calls/distributions? |
| 4 | 2026-03-10 | Kathleen Bui | `deriv_notional_value` from compute server (today's value). Chart 1 from JSON output. Chart 2 from datalake — show separately. Chart 4 removed. |
| 5 | 2026-03-11 | tuan tran | Question: should 30-day/90-day daily pricing data be calculated and stored in DB? |
| 6 | 2026-03-11 | Kathleen Bui | Clarification requested — which values? |
| 7 | 2026-03-12 | tuan tran | Clarified: trailing 90-day and 30-day net cash flow totals & averages, loaded daily via scheduler |
| 8 | 2026-03-12 | Kathleen Bui | Store raw API output; Jerry handles downstream calculations on compute server |
| 9 | 2026-03-12 | Jerry Luo | Confirmed: `deriv_notional_value` → `body['base']['deriv_notional_value']`; chart data → `body['base']['cash_flow_table']` with `Cash Closing`, `Closing Risk`, `Buffer` columns |
| 10 | 2026-03-24 | tuan tran | ❓ **OPEN:** What are `beta_contribution` and `beta_impact`? How to calculate? |
| 11 | 2026-03-24 | Kathleen Bui | Forwarded question to Jerry Luo for confirmation |
| 12 | 2026-03-25 | tuan tran | Question: Fixed Income shows only 1 fund; Total Cash has many sub-classes — list all? |
| 13 | 2026-03-25 | Kathleen Bui | Show current live accounts for Fixed Income. Total Cash: mimic existing screen layout |
| 14 | 2026-03-25 | Jerry Luo | ✅ Updated `cash_forecast_response.json` with transactions table including `beta`, `beta_contribution`, `beta_impact` |
| 15 | 2026-03-26 | tuan tran | Question: What's different between future transactions in new JSON output vs daily-loaded data? |
| 16 | 2026-03-30 | Jerry Luo | ✅ Same base data from loader + additional columns (`beta`, `beta_contribution`, `beta_impact`) calculated by compute server. Also includes hypothetical trades |
| 17 | 2026-03-31 | tuan tran | ❓ What data is shown on initial dashboard load before "Calculating Impact" is triggered? When can he access compute server to build/verify? |
| 18 | 2026-04-01 | Kathleen Bui | Left panel fund NAV table → load from datalake by as-of-date. Remaining charts → compute server. Refresh each morning. Asked Jerry to give ETA for compute server access. |
| 19 | 2026-04-02 | **Bình Hà Khoa** | 🆕 Just rejoined team — requesting Figma mockup access to review feature details |

---

## ⚠️ Open Items

| # | Item | Raised By | Date | Status |
|---|---|---|---|---|
| 1 | **Compute server access ETA for tuan tran** — needed to build and verify locally | tuan tran | 2026-03-31 | 🔴 Awaiting response from Jerry Luo |
| 2 | **Initial dashboard load state** — what data shows before "Calculating Impact" triggers? | tuan tran | 2026-03-31 | 🟡 Partially answered (fund NAV from datalake; charts from compute server) — verify full initial state |
| 3 | **Figma access for Bình Hà Khoa** | Bình Hà Khoa | 2026-04-02 | 🔴 Awaiting access grant from Kathleen Bui / tuan tran |

---

## 🔗 Dependencies

| Dependency | Ticket | Status |
|---|---|---|
| Datalake data loading (Cap Calls, NAV, Future Transactions) | [`KS-934`](https://gendvn.atlassian.net/browse/KS-934) | 🟡 `Development Complete` |
| JSON Input/Output contract for compute server | [`KS-949`](https://gendvn.atlassian.net/browse/KS-949) | 🟡 `In Progress` |
| Compute server access (Jerry Luo) | External / `KS-949` | 🔴 ETA not yet confirmed |

---

## 👥 Stakeholders

| Name | Role |
|---|---|
| Kathleen Bui | Product Owner / Business Analyst — spec owner |
| Jerry Luo | Backend / Compute Server Engineer — JSON contract owner |
| tuan tran | Front-end / Full-stack Developer — implementer |
| Bình Hà Khoa | Developer — recently rejoined, requested Figma access |

---

*Source: [Jira KS-939](https://gendvn.atlassian.net/browse/KS-939) · Exported: 2026-04-02 · Project: Kamehameha Schools (`KS`)*
