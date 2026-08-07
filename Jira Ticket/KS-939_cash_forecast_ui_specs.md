# 🎨 Jira Ticket Reference — `KS-939`

> **Ticket:** [`KS-939`](https://gendvn.atlassian.net/browse/KS-939) — Cash Forecast UI Specs
> **Epic:** [`KS-950`](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model
> **Type:** Task · **Priority:** 🟡 Medium · **Status:** 🟠 `Internal Testing In Progress`
> **Assignee:** **Ly Nguyen** *(changed from Bình Hà Khoa; per Jira as of 2026-06-03)* · **Reporter:** Kathleen Bui · **Label:** `sandbox`
> **Created:** 2026-01-07 · **Last Updated (local mirror):** 2026-06-03 *(Jira thread reverified via MCP; 42 comments; latest 2026-05-29)*

---

## 📋 Ticket Description

Implement the Cash Forecast front-end dashboard based on Figma designs and the attached Word UI specification document.

**Figma Design Link:**
[Cash Forecast Figma ↗](https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast?node-id=0-1&m=dev&t=qfA6kQm8fndkeZIs-1)

> ✅ **Figma access:** Kathleen Bui **approved** access for Bình Hà Khoa on **`KS-939`** (2026-04-02). *(Reporter had noted uncertainty when the ticket was first created — resolved in-thread.)*

**Reference Docs (attached in Jira):**
- `Cash Forecast UI Documentation.docx`
- `input.json` *(compute server input contract)*
- `cash_forecast_output.json` *(compute server output contract — original)*
- `cash_forecast_response.json` *(compute server output contract — updated with transactions table, added 2026-03-25)*

---

## ✅ Latest Jira comments — chronological summary

**As of 2026-06-03 (MCP refresh)**, KS-939 now has **42 comments** (was 31 as of 2026-04-13). Key additions since last checkpoint:

### 🆕 New Comments: April 2026

| # | Date | Author | Summary |
|---|---|---|---|
| 32 | 2026-04-14 | Bình Hà Khoa | **BA sync** — Scope boundary confirmed: Forecast Parameters table (KS-961) and Summary table (KS-960) remain DB/datalake-only; hypothetical flows must NOT drive these tables. |
| 33 | 2026-04-20 | tuan tran | Shared mockup design for Hypothetical Flows section with 5 sub-icons (Save, Edit, Delete, Share, Clone). Asked Kathleen to review. |
| 34 | 2026-04-20 | Kathleen Bui | ✅ Approved design with **naming changes**: (1) **"My Flows" → "My Hypothetical Scenarios"**, (2) **"Team Flows" → "Team Scenarios"**, (3) **"New Flow Set" → "New Scenario Set"**. Keep the **"Add Flow"** button. |
| 35 | 2026-04-21 | tuan tran | Confirmed "Add Flow" label kept. |

### 🆕 New Comments: May 2026

| # | Date | Author | Summary |
|---|---|---|---|
| 36 | 2026-05-26 | tuan tran | **Feature deployed on Conceptia** — asked Kathleen to review and provide feedback. |
| 37 | 2026-05-26 | Kathleen Bui | Acknowledged ("k") — proceeded to review. |
| 38 | 2026-05-26 | Kathleen Bui | 🚨 **Critical sign convention bug** — Capital Calls and Distributions displayed incorrectly. See detailed spec below. Also requested: increase font size across dashboard; edits to Projected Cash Flow Details chart. |
| 39 | 2026-05-29 | Kathleen Bui | Additional UI fix: **Bold the title axis** labels on all charts. |

---

## 🚨 Critical: Sign Convention Correction (Kathleen Bui, 2026-05-26)

**Root cause:** The datalake stores Capital Calls as **positive** values (outflows from fund perspective) and Distributions as **negative** values (inflows). The current UI was displaying raw datalake values, which is incorrect.

**Required display convention:**

| Metric | Datalake raw | Correct UI display |
|---|---|---|
| Capital Calls | Positive (e.g., `+85.59`) | **Negative** (e.g., `−85.59`) — cash goes OUT |
| Distributions | Negative (e.g., `−14.00`) | **Positive** (e.g., `+14.00`) — cash comes IN |
| Net Cash Flow | Raw sum (incorrect) | **Distributions − Capital Calls** (corrected arithmetic) |

**Affected components:**
1. **Net Cash Flows chart** — bars and tooltips both use wrong convention
2. **Historical Capital Calls and Distributions chart** (per asset class) — bars appear visually correct but tooltip values and Net Cash Flow label use raw values
3. **Per-asset-class data tables** (Private Equity section, etc.) — Capital Call, Distribution, and Net columns all use raw datalake values

**Worked examples provided by Kathleen:**

| Example | Component | Datalake | Current (wrong) | Expected (correct) |
|---|---|---|---|---|
| Absolute Return, 2026-05-31 | Net Cash Flow chart | Cap Calls=7.16, Distrib=−112.52 | Net=−119.67 | Net=**+105.36** |
| Venture Capital, 2026-04-30 | Hist. Cap Calls chart | Cap Calls=85.59, Distrib=−14.00 | Net=−99.59 | Net=**−71.59** |
| Buyout/Growth Equity, 2025-04-30 | Per-asset table | Cap Call=4.35, Distrib=−14.05 | Net=−18.40 | Net=**+9.70** |

---

## 📌 Key product decisions (full history through 2026-05-29)

### From April 2026 comments
- **Liquidity Dashboard tab:** remove from current scope (no API for graph yet) — Kathleen, 2026-04-07.
- **Summary / NAV style:** whole dollars, no decimals — Kathleen, 2026-04-07.
- **Dashboard "as of" lookback:** **30 calendar days**, **Dashboard main tab only** (not Historical tab date pickers) — Kathleen, 2026-04-07.
- **Hypothetical flows:** Save / My Saved / Team / owner controls; **max 10 saved scenarios** per user; remove CIO/Ops presets — Kathleen / Bình, 2026-04-07–09.
- **Forecast Parameters grid:** defaults = **real DB as-of** values; **no hypothetical rows** in that table — Kathleen, 2026-04-09.
- **Scheduled daily run:** `hypothetical_trades` from **fund future transactions**; pacing placeholders → datalake per Jerry — **tuan / Jerry**, 2026-04-09.
- **Default forecast parameters** (Kathleen, 2026-04-10): Manual pacing; **8%** distribution; **33%** contribution; **$50M** min buffer; **20%** min notional buffer.
- **Scope boundary confirmed** (Bình, 2026-04-14): KS-960 + KS-961 tables are DB/datalake-only; hypothetical flows are scoped to KS-963 + KS-964 only.
- **Hypothetical naming updates** (Kathleen, 2026-04-20): **"My Hypothetical Scenarios"** (not "My Flows"), **"Team Scenarios"** (not "Team Flows"), **"New Scenario Set"** (not "New Flow Set"), keep **"Add Flow"** button.

### From May 2026 comments
- **Deployed to Conceptia** for internal testing (tuan, 2026-05-26).
- **Sign convention bug** — Capital Calls negative, Distributions positive; fix across Net Cash Flow chart, Hist. Cap Calls chart, per-asset tables (Kathleen, 2026-05-26).
- **Font size** — Increase font size across the entire dashboard (everything looks very small) — Kathleen, 2026-05-26.
- **Bold chart axis titles** — Apply bold styling to all chart axis title labels — Kathleen, 2026-05-29.

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
│  │  - Transactions   │   │    by Asset Class     │  │
│  │    (beta cols)    │   │  - Fund NAV by date   │  │
│  │                   │   │  - Deriv Notional Val │  │
│  └─────────┬─────────┘   └──────────┬────────────┘  │
│            │                        │               │
│            └────────────┬───────────┘               │
│                         ▼                           │
│              Dashboard renders on load               │
│              Refreshes every morning                 │
└─────────────────────────────────────────────────────┘
```

> ✅ **Updated (2026-04-21, per KS-960 thread):** `Derivative Notional Value` is now sourced from the **datalake**, not the compute server.

**Refresh cadence:** Compute server loads each morning and outputs results for display. Dashboard should reflect the latest morning run on initial load.

---

## 🧩 UI Components

### 1. Cash Flow Summary Table

| Property | Detail |
|---|---|
| **Data Source** | Compute server JSON output |
| **Refresh** | Daily — "today's" values always shown |
| **Key Field** | `deriv_notional_value` → from **datalake** (as of 2026-04-21 KS-960 clarification) |
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
- ⚠️ **Sign convention (must apply):** Capital Calls displayed as **negative** (outflows); Distributions displayed as **positive** (inflows); Net = Distributions − Capital Calls

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

### 7. Hypothetical Flows Section — UI Naming (Updated 2026-04-20)

Kathleen Bui confirmed the following label changes on 2026-04-20:

| Old Label | New Label |
|---|---|
| "My Flows" | **"My Hypothetical Scenarios"** |
| "Team Flows" | **"Team Scenarios"** |
| "New Flow Set" button | **"New Scenario Set"** button |
| "Add Flow" button | **"Add Flow"** *(kept as-is)* |

> See KS-963 for the full hypothetical flows specification including save/share/team flows logic.

---

### 8. Removed Component

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
| 10 | 2026-03-24 | tuan tran | ❓ What are `beta_contribution` and `beta_impact`? How to calculate? |
| 11 | 2026-03-24 | Kathleen Bui | Forwarded question to Jerry Luo for confirmation |
| 12 | 2026-03-25 | tuan tran | Question: Fixed Income shows only 1 fund; Total Cash has many sub-classes — list all? |
| 13 | 2026-03-25 | Kathleen Bui | Show current live accounts for Fixed Income. Total Cash: mimic existing screen layout |
| 14 | 2026-03-25 | Jerry Luo | ✅ Updated `cash_forecast_response.json` with transactions table including `beta`, `beta_contribution`, `beta_impact` |
| 15 | 2026-03-26 | tuan tran | Question: What's different between future transactions in new JSON output vs daily-loaded data? |
| 16 | 2026-03-30 | Jerry Luo | ✅ Same base data from loader + additional columns (`beta`, `beta_contribution`, `beta_impact`) calculated by compute server. Also includes hypothetical trades |
| 17 | 2026-03-31 | tuan tran | ❓ What data is shown on initial dashboard load before "Calculating Impact" is triggered? When can he access compute server to build/verify? |
| 18 | 2026-04-01 | Kathleen Bui | Left panel fund NAV table → load from datalake by as-of-date. Remaining charts → compute server. Refresh each morning. Asked Jerry to give ETA for compute server access. |
| 19 | 2026-04-02 | Bình Hà Khoa | Rejoined team; requested Figma mockup access |
| 20 | 2026-04-02 | Kathleen Bui | ✅ **Approved Figma access** for Bình ("just approved it") |
| 21 | 2026-04-03 | Bình Hà Khoa | BA breakdown questions: Liquidity tab?, summary decimals?, historical date range (1 month vs 30 days / which tabs)?, hypothetical CIO/Ops vs user save model? |
| 22 | 2026-04-07 | Kathleen Bui | **Scope:** remove Liquidity tab; NAV **whole dollars**; **30-day** as-of **Dashboard only**; long spec for **Save / Team hypothetical flows** |
| 23 | 2026-04-08 | Bình Hà Khoa | Follow-up questions on Kathleen's 2026-04-07 spec (incl. attachments) |
| 24 | 2026-04-08 | Kathleen Bui | **Max 10 saved scenarios** (delete to add more); **remove Ops/CIO flows**; clarify "Team Flows" empty until someone shares |
| 25 | 2026-04-09 | Bình Hà Khoa | Confirms cap interpretation; proposes **≤10 hypothetical rows per saved scenario**; OK with zero saved scenarios at init |
| 26 | 2026-04-09 | tuan tran | Daily run saves results; `hypothetical_trades` ← **fund future transactions**; asks **default forecast parameters**; flags hardcoded pacing + derivative buffer code questions |
| 27 | 2026-04-09 | Kathleen Bui | Answers Bình **Part A:** manual % → $ from **Historical Unfunded & NAV**; Forecast Parameters table **DB-only** (no hypotheticals); **approved mockups** |
| 28 | 2026-04-09 | Kathleen Bui | To tuan/Jerry: checking with team on **defaults** (→ see row 31); derivative accts → `non_alpha_accounts` + **Oasis × 55%** — ask Jerry to confirm |
| 29 | 2026-04-09 | Jerry Luo | Will load pacing values from **datalake** after Solovis ingest; confirms **Oasis × 0.55** in derivative buffer path |
| 30 | 2026-04-10 | tuan tran | To Jerry: `asset_name = 'All'` + `capital_calls - distributions`? interval?; requests **updated Thuyen code** with transaction + **beta impact** |
| 31 | 2026-04-10 | Kathleen Bui | **Team-confirmed defaults** — Manual pacing; **8% / 33%**; **$50M** min buffer; **20%** min notional buffer |
| 32 | 2026-04-14 | Bình Hà Khoa | **BA scope boundary** — Forecast Parameters (KS-961) and Summary (KS-960) are DB/datalake-only; hypothetical rows must NOT drive them |
| 33 | 2026-04-20 | tuan tran | Shared mockup for Hypothetical Flows section with 5 action icons (Save, Edit, Delete, Share, Clone); asked review |
| 34 | 2026-04-20 | Kathleen Bui | ✅ Approved design; **naming: "My Hypothetical Scenarios", "Team Scenarios", "New Scenario Set"**; keep **"Add Flow"** button |
| 35 | 2026-04-21 | tuan tran | Confirmed "Add Flow" label kept |
| 36 | 2026-05-26 | tuan tran | **Cash-forecast feature deployed on Conceptia** — please review |
| 37 | 2026-05-26 | Kathleen Bui | Acknowledged deployment ("k") |
| 38 | 2026-05-26 | Kathleen Bui | 🚨 **Sign convention bug**: Capital Calls must be negative, Distributions positive; Net = Distributions − Capital Calls. Also: increase font size; fix Projected Cash Flow Details chart |
| 39 | 2026-05-29 | Kathleen Bui | **Bold the chart axis title labels** across all charts |
| 40–42 | 2026-05-26–29 | Various | *(Additional UI feedback threads on chart axis labelling and font styling)* |

---

## ⚠️ Open Items

| # | Item | Raised By | Date | Status |
|---|---|---|---|---|
| 1 | **Sign convention fix** — Capital Calls (negative), Distributions (positive) applied to all charts and per-asset tables | Kathleen Bui | 2026-05-26 | 🔴 **Open** — fix required in chart rendering and tooltip logic |
| 2 | **Font size increase** across the entire dashboard | Kathleen Bui | 2026-05-26 | 🔴 **Open** |
| 3 | **Bold chart axis title labels** | Kathleen Bui | 2026-05-29 | 🔴 **Open** |
| 4 | **Projected Cash Flow Details chart edits** | Kathleen Bui | 2026-05-26 | 🟡 **Open** — details in KS-939 thread |
| 5 | **Manual pacing $ display:** compute API vs front-end calculation | Kathleen / eng | 2026-04-09 | 🟡 **Open** — contract decision |
| 6 | **Dual caps:** max **10 saved scenarios** (PO) vs max **10 rows per scenario** (Bình proposal) | Kathleen / Bình | 2026-04-08–09 | 🟡 **Align** explicitly in AC if both apply |
| 7 | ~~**tuan → Jerry:** table/logic for pacing, updated code with beta impact~~ | tuan tran | 2026-04-10 | 🟡 Superseded by deployment — verify code parity post-deploy |
| 8 | ~~**Compute server access ETA**~~ | tuan tran | 2026-03-31 | ✅ Resolved — feature deployed to Conceptia 2026-05-26 |

---

## 🔗 Dependencies

| Dependency | Ticket | Status |
|---|---|---|
| Datalake data loading (Cap Calls, NAV, Future Transactions) | [`KS-934`](https://gendvn.atlassian.net/browse/KS-934) | ✅ `Development Complete` |
| JSON Input/Output contract for compute server | [`KS-949`](https://gendvn.atlassian.net/browse/KS-949) | 🟡 `In Progress` |
| Forecast Parameters Configuration Panel | [`KS-961`](https://gendvn.atlassian.net/browse/KS-961) | ✅ `Ready for UAT` (PASS on Sandbox & Conceptia) |
| Projected Cash Balance Chart | [`KS-962`](https://gendvn.atlassian.net/browse/KS-962) | 🟠 `Internal Testing In Progress` |
| Hypothetical Flows (Save / Share / Team) | [`KS-963`](https://gendvn.atlassian.net/browse/KS-963) | ⬜ `To Do` |

---

## 👥 Stakeholders

| Name | Role |
|---|---|
| Kathleen Bui | Product Owner / Business Analyst — spec owner |
| Jerry Luo | Backend / Compute Server Engineer — JSON contract owner |
| tuan tran | Developer — data + integration; datalake / daily job threads |
| Bình Hà Khoa | BA / original `KS-939` assignee; Figma access approved 2026-04-02 |
| Ly Nguyen | **Current `KS-939` assignee** (as of 2026-06-03) |
| Ha Khoa Dinh | QA tester — confirmed KS-961 PASS on Sandbox & Conceptia |

---

*Source: [Jira KS-939](https://gendvn.atlassian.net/browse/KS-939) · Local mirror updated: 2026-06-03 (42 comments; latest 2026-05-29 — Kathleen Bui, bold axis titles) · Project: Kamehameha Schools (`KS`)*
