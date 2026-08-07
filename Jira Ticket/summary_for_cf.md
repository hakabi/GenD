# 📊 Epic Summary Report — Cash Forecasting Model

> **Epic:** [`KS-950`](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model
> **Project:** Kamehameha Schools (`KS`) · **Priority:** Medium
> **Epic Owner:** tuan tran · **Reporter:** quan
> **Created:** 2026-03-02 · **Report refreshed:** 2026-06-03 *(Jira MCP: KS-939 (42 comments), KS-961 (8 comments), KS-962 (1 comment), KS-963 (3 comments))*

---

## ⚠️ Epic Health At-a-Glance

| Item | Value |
|---|---|
| Epic Status | `To Do` *(move to `In Progress` — children are active and partially deployed)* |
| Total Child Tickets (feature stories) | 3 core + 11 implementation stories under KS-950 |
| Done / PASS | **KS-961** (`Ready for UAT` — PASS on Sandbox & Conceptia) |
| Internal Testing | **KS-939** + **KS-962** (`Internal Testing In Progress`) |
| To Do | **KS-963** |
| Development Complete | **KS-934** |
| Feature deployed | ✅ **Conceptia** (tuan tran, 2026-05-26) — currently in internal testing phase |
| Active defects / feedback items | **3 open UI fixes** on KS-939 (sign convention, font size, axis bold) |

---

## 🗺 Scope Overview

This Epic delivers the full **Cash Forecasting Model** across three interconnected layers:

```
KS-950  Cash Forecasting Model (Epic)
  ├── KS-934  Cash Forecast Data Loading          → Data Layer
  ├── KS-949  JSON Input and Output for CF Model  → API Contract Layer
  └── KS-939  Cash Forecast UI Specs              → Presentation Layer
       ├── KS-961  Forecast Parameters Panel       → Ready for UAT ✅
       ├── KS-962  Projected Cash Balance Chart    → Internal Testing 🟠
       ├── KS-963  Hypothetical Flows              → To Do ⬜
       └── ... (KS-958 to KS-971, CF-1 to CF-14)
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

Provisions new datalake tables for five cash flow data sets pulled from Solovis APIs on a daily **Mon–Fri, 12pm EST** schedule.

#### Clarifications Resolved

- [x] Drop rows where `net_cash_in` is `0` or `NaN`
- [x] Override window = **36 months** (not 24)
- [x] Pull schedule = **Mon–Fri, 12pm EST**
- [x] Asset Class tables can be combined into one table
- [x] MTD replacement and month-end finalization logic confirmed

#### Status Assessment

Development is complete. **QA/UAT** on table outputs remains the gate before calling this layer "production-ready" for all downstream consumers.

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
| `deriv_notional_value` | **Datalake** *(updated 2026-04-21)* | Previously assumed compute server; now sourced from datalake per KS-960 clarification |
| Cash flow chart data | `body['base']['cash_flow_table']` | `Cash Closing` / `Closing Risk` / `Buffer` columns |
| `hypothetical_trades` (batch) | **Fund future transactions** table | NOT user hypothetical snapshots for daily scheduled run |

#### Status Assessment

Contract direction is stable. Feature has been deployed on Conceptia (2026-05-26). Post-deployment verification of Thuyen code parity (tuan's 2026-04-10 open items) should be confirmed as part of the internal testing cycle.

---

### 🟠 `KS-939` — Cash Forecast UI Specs

| | |
|---|---|
| **Type** | Task |
| **Status** | `Internal Testing In Progress` |
| **Assignee** | **Ly Nguyen** *(changed from Bình Hà Khoa)* |
| **Reporter** | Kathleen Bui |
| **Label** | `sandbox` |
| **Last comment (Jira)** | **2026-05-29** — Kathleen Bui |
| **Total comments** | **42** *(was 31 as of prior checkpoint)* |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-939) |

#### What it covers

Front-end dashboard based on Figma + Word spec. Consumes compute server JSON (`KS-949`) and historical data (`KS-934`).

#### UI / product decisions (comprehensive, through 2026-05-29)

| Area | Decision | Source & Date |
|---|---|---|
| Figma access | Approved for Bình Hà Khoa | Kathleen, 2026-04-02 |
| Liquidity tab | **Removed** from current scope | Kathleen, 2026-04-07 |
| Summary numbers | **Whole dollars, no decimals** | Kathleen, 2026-04-07 |
| Dashboard as-of | **30 calendar days** lookback; **Dashboard tab only** | Kathleen, 2026-04-07 |
| Hypothetical flows model | **Save Flows** modal; private by default; owner-only Share/Unshare/Rename/Delete; **max 10 saved scenarios** per user | Kathleen, 2026-04-07–09 |
| Daily defaults | **Manual** pacing; **8%** distribution / **33%** contribution; **$50M** min buffer; **20%** notional buffer | Kathleen, 2026-04-10 |
| Scope boundary | KS-960 + KS-961 are DB/datalake-only; hypothetical rows only go to KS-964 payload | Bình, 2026-04-14 |
| Hypothetical UI naming | **"My Hypothetical Scenarios"**, **"Team Scenarios"**, **"New Scenario Set"** button; keep **"Add Flow"** button | Kathleen, 2026-04-20 |
| Forecast Parameters grid | DB-only defaults — no hypothetical rows | Kathleen, 2026-04-09 |
| Derivative Notional Value source | **Datalake** (not compute server) | tuan (KS-960), 2026-04-21 |
| Sign convention 🚨 | Capital Calls = **negative** (outflows); Distributions = **positive** (inflows); Net = Distributions − Capital Calls. Fix required in Net Cash Flow chart, Hist. Cap Calls chart, and per-asset tables | Kathleen, 2026-05-26 |
| Font size | **Increase font size** across entire dashboard — too small | Kathleen, 2026-05-26 |
| Chart axis labels | **Bold** all chart axis title labels | Kathleen, 2026-05-29 |

#### ⚠️ Remaining gaps / open items

| Severity | Item |
|---|---|
| 🔴 | **Sign convention bug** — Capital Calls / Distributions display correction in charts and tables |
| 🔴 | **Font size** increase across dashboard |
| 🔴 | **Bold chart axis labels** |
| 🟡 | **FE vs API** ownership for manual-pacing calculated dollar amounts |
| 🟡 | **Scenario limits:** 10 saved scenarios confirmed; confirm max rows per scenario if capped at 10 |
| 🟡 | **Projected Cash Flow Details chart edits** (additional details in KS-939 May 2026 thread) |

---

### ✅ `KS-961` — Cash Forecast - Implement Forecast Parameters Configuration Panel

| | |
|---|---|
| **Type** | Story |
| **Status** | `Ready for UAT` |
| **Assignee** | Ly Nguyen |
| **Reporter** | Bình Hà Khoa |
| **Last comment** | 2026-06-02 — Ha Khoa Dinh (PASS) |
| **Total comments** | 8 |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-961) |

#### What it covers

"Forecast Parameters" button + modal/sidebar panel on the Dashboard tab. Configures Illiquid Pacing Method and Buffer Parameters passed to the compute server when KS-964 (Calculate Impact) is triggered.

#### Fully Confirmed Specifications

**Pacing method options:** Last 3 months historical · Last 12 months historical · **Manual Pacing** (reveals additional percentage fields)

**Annual Estimated Distribution (%) & Annual Estimated Contribution (%):**
- Input range: **0.00 – 100.00** (strictly 2dp)
- USD display: HALF_UP rounding, scaled as follows:
  - Value < $1,000 → exact integer (e.g., `$500`)
  - $1K ≤ value < $1M → `$K` whole number (e.g., `$850K`)
  - Value ≥ $1M → `$M` 1dp (e.g., `$584.7M`)
  - Billion-scale: **keep in $M** (e.g., `$1,200.0M`)
- **No negative values** in any input field

**Buffer Parameters:**
- Minimum Buffer ($): in $Millions, primary display; allow **3dp** if value goes below $1M; **no negatives**
- Minimum Notional Buffer (%): 0.00–100.00, 2dp; no negatives

**New display fields (tuan proposed, Kathleen approved 2026-06-01):**
- **Illiquid NAV** — read-only display field in popup (from datalake)
- **Total Unfunded NAV** — read-only display field in popup (from datalake)

**System defaults for daily automated run:**
- Manual pacing; 8% / 33%; $50M buffer; 20% notional buffer

**QA result:** ✅ Ha Khoa Dinh — **"Tested this on Sandbox & Conceptia site → PASS"** (2026-06-02)

---

### 🟠 `KS-962` — Cash Forecast - Implement Projected Cash Balance Chart

| | |
|---|---|
| **Type** | Story |
| **Status** | `Internal Testing In Progress` |
| **Assignee** | Ly Nguyen |
| **Reporter** | Bình Hà Khoa |
| **Last comment** | 2026-04-14 — Bình Hà Khoa |
| **Total comments** | 1 |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-962) |

#### What it covers

Combined bar + line chart on the Dashboard tab visualising projected cash balance (from compute server morning run).

#### Chart data mapping

| JSON Column | Visual | Style |
|---|---|---|
| `Cash Closing` | Primary bar | Blue |
| `Closing Risk` | Overlay line | Purple |
| `Buffer` | Reference line | Grey dashed |

#### Key clarification (Bình, 2026-04-14)

This chart correctly reflects **compute server output** (morning run / KS-964). The DB-only scope applies to KS-960 and KS-961 only. KS-961 forecast parameters do **not** impact this chart.

**Note from ticket description (2026-04-21):** `Derivative Notional Value` is sourced from the **datalake** (not this chart's compute output) — surfaced via KS-960 summary card.

---

### ⬜ `KS-963` — Cash Forecast - Implement Hypothetical Flows (Save, Share, Team Flows)

| | |
|---|---|
| **Type** | Story |
| **Status** | `To Do` |
| **Assignee** | Bình Hà Khoa |
| **Reporter** | Bình Hà Khoa |
| **Last comment** | 2026-06-01 — Kathleen Bui |
| **Total comments** | 3 |
| **Link** | [Open in Jira ↗](https://gendvn.atlassian.net/browse/KS-963) |

#### What it covers

Hypothetical Flows section on the Dashboard tab. Users add simulated cash flow entries, toggle them on/off, and save/load named scenario sets.

#### Latest confirmed specifications

| Topic | Decision | Source |
|---|---|---|
| Scope boundary | Hypothetical rows live only in this section + KS-964 payload — must NOT drive KS-961 or KS-960 tables | Bình, 2026-04-14 |
| Amount column | **"Amount ($ Millions)"** — users input scaled values (e.g., `100` = $100M) | Kathleen, 2026-06-01 |
| Decimal precision | **Up to 3dp** for Amount input (e.g., `2.5` = $2,500,000) | Kathleen, 2026-06-01 |
| UI naming | "My Hypothetical Scenarios" / "Team Scenarios" / "New Scenario Set" button / "Add Flow" button | Kathleen, 2026-04-20 |
| Saved scenario cap | **Max 10** per user | Kathleen, 2026-04-08 |
| Transaction types | Trade Offer, Capital Call, Distribution, Trust Draw | KS-963 description |
| Fund dropdown | Auto-populates Beta for existing Solovis funds; "New Fund" option reveals Beta input field | KS-963 description |

#### Open items

- Confirm **max rows per saved scenario** (Bình proposed 10; PO alignment pending)
- Build and test full save/share/team flows workflow

---

## 📋 Recommended Next Actions

| # | Action | Owner | Ticket |
|---|---|---|---|
| 1 | **Fix sign convention bug** — Capital Calls negative, Distributions positive; apply across all charts and tables | tuan tran / dev | `KS-939` |
| 2 | **Increase font size** across dashboard + **bold chart axis labels** | tuan tran / dev | `KS-939` |
| 3 | **Build KS-963** (Hypothetical Flows) with confirmed $M input, 3dp, naming, and scope boundary | Bình Hà Khoa | `KS-963` |
| 4 | Lock **manual pacing $** display as FE-calculated vs API-returned | Kathleen + eng | `KS-939` / `KS-961` |
| 5 | Confirm **row limit per saved scenario** (if any) alongside 10-scenario cap | Kathleen Bui | `KS-963` |
| 6 | Move Epic **`KS-950`** to `In Progress` | tuan tran | `KS-950` |
| 7 | Complete **UAT** for KS-961 (already PASS; move to Done) | Kathleen / team | `KS-961` |
| 8 | Run **QA/UAT** on datalake tables | Team | `KS-934` |
| 9 | Post-deployment code parity check — Thuyen's code vs actual deploy (beta impact, table logic) | Jerry / tuan | `KS-949` |

---

## 👥 Stakeholders

| Name | Role |
|---|---|
| Kathleen Bui | Product Owner / Business Analyst |
| Jerry Luo | Compute Server / Backend Engineer |
| tuan tran | Developer (data + integration) |
| Bình Hà Khoa | Developer (KS-939 original assignee; KS-963 current assignee) |
| Ly Nguyen | Developer (current assignee for KS-939, KS-961, KS-962) |
| Ha Khoa Dinh | QA — confirmed KS-961 PASS |
| quan | Epic Reporter |

---

*Generated: 2026-04-02 · Refreshed: 2026-06-03 · Source: Jira `KS` via MCP (KS-939: 42 comments; KS-961: 8 comments; KS-962: 1 comment; KS-963: 3 comments)*
