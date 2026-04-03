# 📌 Knowledge Checkpoint — Cash Forecasting Model (KS-950)

> **Session Date:** 2026-04-02
> **Prepared by:** AI BA Session (Cursor)
> **Status:** Paused — awaiting customer confirmation on 7 open items before ticket writing begins
> **Project:** Kamehameha Schools (`KS`) · Jira: [gendvn.atlassian.net](https://gendvn.atlassian.net)

---

## ✅ What Has Been Established & Agreed

### 1. MCP & Jira Connection
- Atlassian MCP server (`mcp-atlassian`) is fully configured at `~/.cursor/mcp.json`
- Connected to `gendvn.atlassian.net` using API token for `hakhoabinh@gmail.com`
- Jira project `KS` (Kamehameha Schools) is accessible
- All 3 child tickets under Epic `KS-950` have been fully read and documented

---

### 2. Epic Overview — `KS-950` Cash Forecasting Model

| Field | Value |
|---|---|
| **Epic Key** | `KS-950` |
| **Status** | `To Do` ⚠️ *(should be updated to `In Progress`)* |
| **Assignee** | tuan tran |
| **Reporter** | quan |
| **Priority** | Medium |
| **Created** | 2026-03-02 |

**Agreed action:** Epic status should be updated to `In Progress` — child work is already active.

---

### 3. Current Child Tickets — Status & Assessment

#### `KS-934` — Cash Forecast Data Loading
| Field | Value |
|---|---|
| **Status** | `Development Complete` |
| **Assignee** | tuan tran |
| **Reporter** | Kathleen Bui |

**What it does:** Provisions datalake tables for 5 cash flow data sets via Solovis APIs.

**All clarifications resolved:**
- [x] Drop rows where `net_cash_in` = 0 or NaN
- [x] Override window = 36 months (not 24)
- [x] Pull schedule = Mon–Fri, 12pm EST
- [x] Asset Class tables combined into one table
- [x] MTD replacement and month-end finalization logic confirmed

**Agreed gap:** No QA/UAT sign-off visible. Must be validated before `KS-939` and `KS-949` can close.

---

#### `KS-949` — JSON Input and Output for Cash Forecast Model
| Field | Value |
|---|---|
| **Status** | `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Jerry Luo |
| **Endpoint** | `POST http://0.0.0.0:5001/managers/cash_forecast_model` |

**Confirmed contract decisions:**
- `fad_beta` → auto-populated from live Aloha website homepage (NOT user input)
- `deriv_notional_value` → `body['base']['deriv_notional_value']`
- Chart data → `body['base']['cash_flow_table']` columns: `Cash Closing`, `Closing Risk`, `Buffer`
- Transactions table updated (2026-03-25) to include `beta`, `beta_contribution`, `beta_impact`

**Agreed gap:** JSON contract should be formally frozen + schema validation added before UI finalizes.

---

#### `KS-939` — Cash Forecast UI Specs
| Field | Value |
|---|---|
| **Status** | `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Kathleen Bui |
| **Figma** | [Cash Forecast Figma ↗](https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast?node-id=0-1&m=dev&t=qfA6kQm8fndkeZIs-1) |

**Confirmed UI components:**
| Component | Data Source | Key Rule |
|---|---|---|
| Cash Flow Summary Table | Compute server JSON | Always "today's" values |
| Cash Closing / Closing Risk / Buffer Chart | `cash_flow_table` | Blue bar / Purple line / Grey dashed |
| Capital Calls & Distributions Stacked Bar | Datalake (`KS-934`) | Shown separately; month-end date range; monthly < 1.5yr, quarterly ≥ 1.5yr |
| `fad_beta` field | Aloha website | Auto-populated only |
| 4th placeholder chart | N/A | **Removed** |
| Transactions table (Details tab) | Compute server | Includes `beta`, `beta_contribution`, `beta_impact` |
| Fixed Income breakdown | Datalake | Show live accounts only (currently: Payden US Treasury) |
| Total Cash breakdown | Datalake | Show all sub-classes (Cash, Cash In Transit, etc.) |

**Open items still on this ticket:**
- 🔴 Compute server access ETA for tuan tran (Jerry Luo has not responded)
- 🟡 Initial dashboard load state — only partially clarified
- 🔴 Figma access needed for Bình Hà Khoa (rejoined 2026-04-02)

---

### 4. Files Produced This Session

| File | Location | Purpose |
|---|---|---|
| `summary_for_cf.md` | `d:\source\GenD\Jira Ticket\` | BA summary of Epic KS-950 + all child tickets |
| `KS-939_cash_forecast_ui_specs.md` | `d:\source\GenD\Jira Ticket\` | Full reference doc for KS-939 incl. all 19 comments |
| `knowledge_checkpoint.md` | `d:\source\GenD\Jira Ticket\` | This file — session state snapshot |

---

### 5. Proposed Ticket Breakdown (Agreed in Principle — Pending Customer Confirmation)

The team agreed that `KS-939` is too coarse-grained to track or parallelize. The proposed breakdown is:

```
KS-950  Cash Forecasting Model (Epic)
  │
  ├── CF-1   Navigation Shell — Add "Cash Forecast" Tab to Aloha
  │
  ├── CF-2   Dashboard Tab — Forecast Parameters Panel
  ├── CF-3   Dashboard Tab — Summary Table (Fixed Income & Cash)
  ├── CF-4   Dashboard Tab — Projected Balance Chart (Compute Server)
  ├── CF-5   Dashboard Tab — Hypothetical Flows Management
  ├── CF-6   Dashboard Tab — "Calculate Impact" Integration with Compute Server
  ├── CF-7   Dashboard Tab — Projected Cash Flow Drill-Down (Month → Day → Tx)
  ├── CF-8   Dashboard Tab — Historical As-Of-Date Lookup
  │
  ├── CF-9   Historical Tab — Net Cash Flow Graph
  ├── CF-10  Historical Tab — Capital Calls & Distributions Stacked Bar Chart
  ├── CF-11  Historical Tab — Asset Class Filter + % of NAV Table
  │
  ├── CF-12  Details Tab — Future Transactions Table with Filters & Export
  │
  ├── CF-13  Liquidity Dashboard Tab  ← BLOCKED — needs full spec
  │
  └── CF-14  Frontend Integration — Auto-fetch fad_beta from Aloha Homepage
```

**Total: 14 tickets** (13 ready to write once questions answered, 1 blocked on spec)

**Suggested first sprint (lowest dependency, can be parallelized):**
- CF-1 (navigation shell)
- CF-14 (fad_beta integration)
- CF-2 (forecast parameters panel)
- CF-3 (summary table)

---

## ⏸ PAUSED — Awaiting Customer Confirmation

The following questions must be answered before ticket writing begins. Each answer directly affects Acceptance Criteria and Detailed Requirements.

---

### ❓ Q1 — User Roles & Permissions
*(Affects: CF-2, CF-5, CF-6, CF-8)*

The docx mentions "CIO Flows" (Tim's workspace) and "Operations Flows" (Euan's workspace) as pre-saved Hypothetical Flow scenarios.

- Are these **role-based** workspaces? (i.e., only CIO role can save to "CIO Flows")
- Or are they named sets that **any user** can load but not overwrite?
- Is there a concept of **read-only vs edit** access on any part of the Cash Forecast tab?

**Why it matters:** Determines whether we need a permissions/role model in CF-5, and whether CF-6 has role-gated actions.

---

### ❓ Q2 — Liquidity Dashboard Tab
*(Affects: CF-13)*

The docx lists it as the 4th sub-tab, but contains **zero specification**.

- Does a Figma screen or separate spec document exist for it?
- Should CF-13 be created as a **placeholder/spike** ticket now, or **deferred entirely** to a future epic?

**Why it matters:** If deferred, we scope out CF-13 completely. If it's a spike, we write it differently.

---

### ❓ Q3 — Currency & Decimal Precision
*(Affects: CF-3, CF-4, CF-9, CF-10, CF-11, CF-12)*

- Are all monetary values displayed in **USD only**, or is multi-currency support required?
- What **decimal precision** is required per value type?
  - Cash amounts: 2dp or 4dp?
  - NAV values: 4dp?
  - Percentages: 2dp?
- What **rounding mode** applies: HALF_UP or HALF_EVEN (Banker's Rounding)?

**Why it matters:** Financial display precision is a hard requirement in BDD acceptance criteria — cannot be assumed.

---

### ❓ Q4 — Historical Lookup Date Range Restriction
*(Affects: CF-8)*

The docx states: *"Need the ability to show the Cash balance and Beta Projection as it was as of any previous day — restrict to only one month in the past."*

- Is **1 calendar month back** a hard business rule, or a configurable default?
- Does this restriction apply to the Dashboard's as-of-date view only, or also to the Historical Tab date selector?

**Why it matters:** CF-8 date picker validation logic depends entirely on this answer.

---

### ❓ Q5 — "Calculate Impact" Initial Dashboard Load State
*(Affects: CF-4, CF-6)*

tuan tran raised this on 2026-03-31. Kathleen Bui partially answered (fund NAV from datalake on left; charts from compute server). Still ambiguous.

- Before the user clicks "Calculate Impact", what **exactly** renders on the Dashboard?
  - Option A: Fund NAV table only (datalake). All other charts are **empty / greyed out**.
  - Option B: Charts **pre-populated** with the morning compute server run automatically (no user action needed for initial view).
  - Option C: Something else?
- Is the morning compute server run **triggered automatically** (scheduled job), or does someone manually trigger it?

**Why it matters:** This determines the entire initial state and loading flow for CF-4 and CF-6. Wrong assumption here causes a rework.

---

### ❓ Q6 — Hypothetical Flows Save/Load Scope
*(Affects: CF-5)*

- Can users **create and name their own** saved flow sets beyond "CIO Flows" and "Operations Flows"?
- Do user-defined flows persist **per user account** (server-side), or **per browser session** only?
- Are **delete** and **rename** operations required on saved flows?
- The docx says user-defined saved flows "auto-load on page refresh" — does this mean the user's **last active flow set** is restored, or a specific "default" set they designate?

**Why it matters:** Determines storage architecture implications and the full CRUD scope of CF-5.

---

### ❓ Q7 — Sprint Capacity & Team Structure
*(Affects: ticket sizing and sub-task splitting)*

- How many **developers** will work on Cash Forecast in parallel?
- Should each story (CF-1 through CF-14) be further split into **sub-tasks** (e.g., FE component + API integration + unit tests as separate sub-tasks)?
- Is there a **target sprint** for the first set of tickets to be published?

**Why it matters:** Determines whether we write 14 stories or 14 stories × 3 sub-tasks = ~42 tickets total.

---

## 📋 Recommended Next Steps (After Confirmation)

| Step | Action | Owner |
|---|---|---|
| 1 | Answer Q1–Q7 above | Kathleen Bui / Product Owner |
| 2 | Grant Figma access to Bình Hà Khoa | Kathleen Bui / tuan tran |
| 3 | Jerry Luo confirms compute server access ETA | Jerry Luo |
| 4 | Run QA/UAT on `KS-934` datalake tables | Team |
| 5 | Freeze `KS-949` JSON contract | tuan tran + Jerry Luo |
| 6 | Write all 13 child tickets in 7-section BA format | AI BA (this session) |
| 7 | Publish tickets to Jira under Epic `KS-950` | tuan tran / BA |

---

*Checkpoint saved: 2026-04-02 · Session: Cursor AI BA · Next action: resume after Q1–Q7 answered*
