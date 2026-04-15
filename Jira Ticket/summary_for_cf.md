# 📊 Epic Summary Report — Cash Forecasting Model

> **Epic:** [`KS-950`](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model  
> **Project:** Kamehameha Schools (`KS`) · **Priority:** Medium  
> **Epic Owner:** tuan tran · **Reporter:** quan  
> **Created:** 2026-03-02 · **Report refreshed:** 2026-04-13 *(Jira MCP: child tickets + [`KS-939`](https://gendvn.atlassian.net/browse/KS-939) comment thread)*

---

## ⚠️ Epic Health At-a-Glance

| Item | Value |
|---|---|
| Epic Status | `To Do` *(still worth moving to `In Progress` while children are active)* |
| Total Child Tickets | 3 |
| Done | 0 |
| Near Done | 1 (`Development Complete` on `KS-934`) |
| In Progress | 2 |
| Active product/engineering threads | **Focused on `KS-949` implementation details and a few `KS-939` follow-ups** — see below |

---

## 🗺 Scope Overview

This Epic delivers the full **Cash Forecasting Model** across three interconnected layers:

```
KS-950  Cash Forecasting Model (Epic)
  ├── KS-934  Cash Forecast Data Loading          → Data Layer
  ├── KS-949  JSON Input and Output for CF Model  → API Contract Layer
  └── KS-939  Cash Forecast UI Specs              → Presentation Layer
```

**Scope change (UI, Apr 2026):** The **Liquidity Dashboard** sub-tab is **removed** for this release — Kathleen Bui on [`KS-939`](https://gendvn.atlassian.net/browse/KS-939) (2026-04-07): insufficient API data for the graph; a future workaround may be considered separately.

---

## 🎫 Child Ticket Details

---

### ✅ `KS-934` — Cash Forecast Data Loading

| | |
|---|---|
| **Type** | Task |
| **Status** | `Development Complete` |
| **Assignee** | tuan tran |
| **Reporter** | Kathleen Bui |
| **Label** | `sandbox` |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-934) |

#### What it covers

Provisions new datalake tables for five cash flow data sets pulled from Solovis APIs on a daily **Mon–Fri, 12pm EST** schedule (see prior detailed table in this doc — unchanged).

#### Clarifications Resolved

- [x] Drop rows where `net_cash_in` is `0` or `NaN`
- [x] Override window = **36 months** (not 24)
- [x] Pull schedule = **Mon–Fri, 12pm EST**
- [x] Asset Class tables can be combined into one table
- [x] MTD replacement and month-end finalization logic confirmed

#### Status Assessment

Development is complete. **QA/UAT** on table outputs remains the gate before calling this layer “production-ready” for all downstream consumers.

---

### 🔄 `KS-949` — JSON Input and Output for Cash Forecast Model

| | |
|---|---|
| **Type** | Improvement |
| **Status** | `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Jerry Luo |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-949) |

#### What it covers

Defines the API contract for the compute server endpoint:

```
POST http://0.0.0.0:5001/managers/cash_forecast_model
```

#### Key Contract Decisions Confirmed

| Field | Source | Notes |
|---|---|---|
| `fad_beta` | Live real-time beta from **Aloha website homepage** | NOT user-inputted |
| `deriv_notional_value` | `body['base']['deriv_notional_value']` | Today's value, always current |
| Cash flow chart data | `body['base']['cash_flow_table']` | `Cash Closing` / `Closing Risk` / `Buffer` columns |

#### New thread (cross-posted on `KS-939`, Apr 2026)

- **tuan tran:** Daily run should use **fund future transactions** for `hypothetical_trades`; asked for **default forecast parameters** (now answered on `KS-939` by Kathleen — Manual, 8% / 33%, $50M, 20%). Raised **hardcoded pacing placeholders** and questions on **derivative accounts**, **Oasis fund id**, and **×0.55** meaning.  
- **Kathleen Bui:** Asked Jerry to respond; confirmed derivative side may use **`non_alpha_accounts`** and still needs **Oasis fund × 55%** — **Jerry to confirm** (done in Jerry’s reply).  
- **Jerry Luo:** Will **load pacing values from the datalake** after Solovis ingestion; confirmed **Oasis × 0.55** in derivative buffer path.  
- **Still open on `KS-939`:** tuan’s **2026-04-10** follow-up to Jerry on specific table usage (`asset_name = 'All'`, `capital_calls - distributions`) and updated **Thuyen** code including **transaction / beta impact** fields *(posted after Kathleen’s same-day team default-parameter confirmation)*.

#### Status Assessment

Contract direction is stable, but **implementation and dynamic sourcing** are still moving. Keep **`KS-939` UI** and **`KS-949` JSON** in lockstep until the open code/table questions close.

---

### 🔄 `KS-939` — Cash Forecast UI Specs

| | |
|---|---|
| **Type** | Task |
| **Status** | `In Progress` |
| **Assignee** | **Bình Hà Khoa** |
| **Reporter** | Kathleen Bui |
| **Label** | `sandbox` |
| **Last updated (Jira)** | **2026-04-10** |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-939) |

#### What it covers

Front-end dashboard based on Figma + Word spec. Consumes compute server JSON (`KS-949`) and historical data (`KS-934`).

#### UI / product decisions updated from comments (Apr 2026)

| Area | Decision |
|---|---|
| Figma | Access **approved** for Bình Hà Khoa (Kathleen, 2026-04-02). |
| Liquidity tab | **Removed** from current scope (Kathleen, 2026-04-07). |
| Summary numbers | **Whole dollars, no decimals** (Kathleen, 2026-04-07). |
| Dashboard as-of | **30 calendar days** lookback; **Dashboard only** (Kathleen, 2026-04-07). |
| Hypothetical flows | **Save Flows** modal (name max 60 chars, optional description, **Share with Team** default off); **My Saved Flows** + **Team Flows**; owner-only Share/Unshare/Rename/Delete; **CIO/Ops presets removed**; **max 10 saved scenarios** per user; mockups **approved** (2026-04-08–09). Clarify **max rows per scenario** if engineering proposed a separate cap. |
| Daily defaults | **Manual** pacing; **8%** distribution / **33%** contribution; **$50M** min buffer; **20%** notional buffer — Kathleen **confirmed with the team** on `KS-939` (**2026-04-10**; latest chronological comment in the thread as of MCP check 2026-04-13). |
| Manual % → $ preview | Kathleen specified formulas using **Historical Unfunded and NAV**; **whether FE or compute returns $** is still an explicit question in the thread. |
| Forecast Parameters grid | **DB-only** defaults — **no hypothetical rows** in that table (Kathleen, 2026-04-09). |

#### Resolved earlier concerns

- **Details tab `beta` / `beta_contribution` / `beta_impact`:** Jerry delivered updated sample JSON and explanation (Mar 2026); treat as **provided by compute output**, not UI-calculated.

#### ⚠️ Remaining gaps

| Severity | Item |
|---|---|
| 🟡 | **FE vs API** for manual pacing calculated dollar amounts (Kathleen asked both ways). |
| 🟡 | **Scenario limits:** 10 **saved scenarios** confirmed; confirm **max hypothetical rows per scenario** if capped at 10. |
| 🟡 | **tuan ↔ Jerry:** Datalake table selection / formula parity and **updated code** with transaction + **beta impact** (comment 2026-04-10). |

---

## 📋 Recommended Next Actions

| # | Action | Owner | Ticket |
|---|---|---|---|
| 1 | Answer tuan’s open **table / code** questions; provide updated reference implementation if Thuyen’s branch is stale | Jerry Luo / team | `KS-939` / `KS-949` |
| 2 | Lock **manual pacing $** display as **FE-calculated vs API-returned** | Kathleen + eng | `KS-939` |
| 3 | Confirm **row limit per saved scenario** (if any) alongside **10 saved scenarios** | Kathleen Bui | `KS-939` |
| 4 | Move Epic **`KS-950`** to `In Progress` when team agrees | tuan tran | `KS-950` |
| 5 | Run **QA/UAT** on datalake tables | Team | `KS-934` |

---

## 👥 Stakeholders

| Name | Role |
|---|---|
| Kathleen Bui | Product Owner / Business Analyst |
| Jerry Luo | Compute Server / Backend Engineer |
| tuan tran | Developer (data + integration) |
| Bình Hà Khoa | Developer (`KS-939` assignee as of 2026-04-10) |
| quan | Epic Reporter |

---

*Generated: 2026-04-02 · Refreshed: 2026-04-13 · Source: Jira `KS` via MCP (`getJiraIssue` with `comment` field on `KS-939`)*
