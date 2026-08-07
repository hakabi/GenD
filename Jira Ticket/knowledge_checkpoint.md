# 📌 Knowledge Checkpoint — Cash Forecasting Model (KS-950)

> **Session / refresh date:** 2026-06-03
> **Prepared by:** AI BA Session (Cursor)
> **Status:** **Active — updated from Jira** [`KS-939`](https://gendvn.atlassian.net/browse/KS-939) **(42 comments; last chronological comment 2026-05-29 — Kathleen Bui, bold chart axis titles)** — reverified via Atlassian MCP on 2026-06-03; plus [`KS-961`](https://gendvn.atlassian.net/browse/KS-961), [`KS-962`](https://gendvn.atlassian.net/browse/KS-962), [`KS-963`](https://gendvn.atlassian.net/browse/KS-963) full comment threads fetched
> **Project:** Kamehameha Schools (`KS`) · Jira: [gendvn.atlassian.net](https://gendvn.atlassian.net)

---

## ✅ What Has Been Established & Agreed

### 1. MCP & Jira Connection

- Atlassian MCP (`plugin-atlassian-atlassian`) used successfully against `gendvn.atlassian.net` for issue read (including full `comment` thread when `fields` includes `comment`).
- Epic and child tickets remain under project **`KS`**.

---

### 2. Epic Overview — `KS-950` Cash Forecasting Model

| Field | Value |
|---|---|
| **Epic Key** | `KS-950` |
| **Status** | `To Do` ⚠️ *(still recommended: `In Progress` while children are active)* |
| **Assignee** | tuan tran |
| **Reporter** | quan |
| **Priority** | Medium |
| **Created** | 2026-03-02 |

---

### 3. Current Child Tickets — Status & Assessment

#### `KS-934` — Cash Forecast Data Loading

| Field | Value |
|---|---|
| **Status** | `Development Complete` |
| **Assignee** | tuan tran |
| **Reporter** | Kathleen Bui |

**Agreed gap:** Formal QA/UAT sign-off on datalake outputs remains important before treating the data layer as "done" for downstream UI.

---

#### `KS-949` — JSON Input and Output for Cash Forecast Model

| Field | Value |
|---|---|
| **Status** | `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Jerry Luo |

**Contract decisions confirmed:**
- `fad_beta` → live real-time beta from Aloha website homepage (not user input)
- `deriv_notional_value` → **from datalake** (updated per KS-960 clarification 2026-04-21; previously assumed compute server)
- `hypothetical_trades` for the scheduled batch run → **fund future transactions** table
- Pacing values → loaded from datalake after Solovis ingestion
- Oasis × 0.55 in derivative buffer path — confirmed by Jerry Luo

**Still open:** tuan's 2026-04-10 follow-up on table logic (`asset_name = 'All'`, `capital_calls - distributions`) and Thuyen code update — may now be partially resolved post-deployment (feature live on Conceptia as of 2026-05-26).

---

#### `KS-939` — Cash Forecast UI Specs

| Field | Value |
|---|---|
| **Status** | `Internal Testing In Progress` *(changed from `In Progress`)* |
| **Assignee** | **Ly Nguyen** *(changed from Bình Hà Khoa as of 2026-06-03)* |
| **Reporter** | Kathleen Bui |
| **Total comments** | **42** *(was 31 as of 2026-04-13)* |
| **Last comment** | **2026-05-29** — Kathleen Bui (bold chart axis titles) |
| **Figma** | [Cash Forecast Figma ↗](https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast?node-id=0-1&m=dev&t=qfA6kQm8fndkeZIs-1) |

**Major product decisions since prior checkpoint (2026-04-13):**

| Topic | Decision | Source |
|---|---|---|
| Scope boundary (BA sync) | Forecast Parameters (KS-961) and Summary Table (KS-960) are **DB/datalake-only**; hypothetical flows must NOT drive them | Bình, 2026-04-14 |
| Hypothetical UI naming | **"My Hypothetical Scenarios"** (not "My Flows"); **"Team Scenarios"** (not "Team Flows"); **"New Scenario Set"** (not "New Flow Set"); keep **"Add Flow"** button | Kathleen, 2026-04-20 |
| Feature deployment | Cash-forecast feature **deployed on Conceptia** (internal testing env) | tuan, 2026-05-26 |
| Sign convention bug 🚨 | Capital Calls must display as **negative** (outflows), Distributions as **positive** (inflows), Net = Distributions − Capital Calls. Affects: Net Cash Flow chart, Historical Cap Calls & Distributions chart, per-asset-class tables | Kathleen, 2026-05-26 |
| Font size | Increase font size **across the entire dashboard** — currently too small | Kathleen, 2026-05-26 |
| Chart axis bold | **Bold the title axis labels** on all charts | Kathleen, 2026-05-29 |
| Derivative Notional Value | Source changed to **datalake** (not compute server) — per KS-960 clarification 2026-04-21 | tuan (KS-960) |

**Still open / in flight on KS-939:**
- Sign convention bug fix (charts + tables)
- Font size increase
- Bold chart axis labels
- Projected Cash Flow Details chart edits (detail in KS-939 thread)
- FE vs API ownership for manual-pacing calculated dollar fields
- Confirm 10 rows per scenario cap (engineering proposal; PO alignment pending)

---

#### `KS-961` — Cash Forecast - Implement Forecast Parameters Configuration Panel

| Field | Value |
|---|---|
| **Status** | **`Ready for UAT`** |
| **Assignee** | Ly Nguyen |
| **Reporter** | Bình Hà Khoa |
| **Total comments** | 8 (last: 2026-06-02) |

**Key decisions and comments (chronological):**

| Date | Author | Decision |
|---|---|---|
| 2026-04-14 | Bình Hà Khoa | Locked: defaults grid must always reflect real as-of DB data; hypothetical flows (KS-963) must NOT merge into this table |
| 2026-05-25 | Bình Hà Khoa | Questions on % range, USD formatting rules, and billion-scale case |
| 2026-05-26 | Kathleen Bui | ✅ **1/** Range: cap both Distribution & Contribution at **100%** · **2/** Formatting: **1dp for $M, whole number for $K** · **3/** Billion-scale: **keep in $M** (e.g., `$1,200.0M`) |
| 2026-06-01 | Bình Hà Khoa | Questions: negative values allowed? Minimum Buffer decimal precision for small values? |
| 2026-06-01 | tuan tran | Proposed adding **"Illiquid NAV"** and **"Total Unfunded NAV"** display fields to the Forecast Parameters popup |
| 2026-06-01 | Kathleen Bui | ✅ Approved tuan's proposal for Illiquid NAV + Total Unfunded NAV fields ("yes that looks good!") |
| 2026-06-01 | Kathleen Bui | ✅ **1/** No negative values in any input field · **2/** Keep Minimum Buffer in $M; allow **3dp** if value goes below $1M |
| 2026-06-02 | Ha Khoa Dinh | ✅ **"Tested this on Sandbox & Conceptia site → PASS"** |

**Confirmed field specifications (KS-961):**

| Field | Range | Formatting |
|---|---|---|
| Annual Estimated Distribution (%) | 0.00 – 100.00 (2dp input) | $K: whole number · $M: 1dp · Billions: keep in $M (e.g. `$1,200.0M`) |
| Annual Estimated Contribution (%) | 0.00 – 100.00 (2dp input) | Same pattern as Distribution |
| Minimum Buffer ($) | Positive only, in $Millions | Primary: $M display; allow up to 3dp for sub-million values |
| Minimum Notional Buffer (%) | 0.00 – 100.00 (2dp) | No negatives |
| Illiquid NAV (display field) | Read-only from datalake | Display alongside calculation context |
| Total Unfunded NAV (display field) | Read-only from datalake | Display alongside calculation context |

**Manual pacing calculated dollar helpers (confirmed KS-939, Apr 2026):**
- Forecasted Distributions $ = (Distribution Rate %) × (Illiquid NAV from Historical Unfunded & NAV table as of as-of date)
- Forecasted Unfunded $ = (Contribution Rate %) × (Total Unfunded from same table as of as-of date)
- ⚠️ **Still open:** compute server vs FE calculation layer for these dollar amounts

---

#### `KS-962` — Cash Forecast - Implement Projected Cash Balance Chart

| Field | Value |
|---|---|
| **Status** | **`Internal Testing In Progress`** |
| **Assignee** | Ly Nguyen |
| **Reporter** | Bình Hà Khoa |
| **Total comments** | 1 (2026-04-14) |

**Key clarification (2026-04-14, Bình):** This chart correctly reflects **compute server** output (morning run / KS-964). Kathleen's DB-only clarification targets KS-960 and KS-961. Chart is NOT affected by hypothetical flows directly — only updated when KS-964 Calculate Impact is triggered.

**Updated per ticket description (2026-04-21):** `Derivative Notional Value` (`body['base']['deriv_notional_value']`) is now sourced from the **datalake** (not compute server) — confirmed by tuan tran's comment on KS-960. KS-961 forecast parameters do **not** impact this chart.

**Scheduled run inputs (from KS-939 thread):**
- Uses system default parameters: Manual pacing, 8% / 33%, $50M buffer, 20% notional buffer
- `hypothetical_trades` sourced from fund future transactions table (not user hypothetical snapshots)

---

#### `KS-963` — Cash Forecast - Implement Hypothetical Flows (Save, Share, Team Flows)

| Field | Value |
|---|---|
| **Status** | **`To Do`** |
| **Assignee** | Bình Hà Khoa |
| **Reporter** | Bình Hà Khoa |
| **Total comments** | 3 (last: 2026-06-01) |

**Key decisions and comments:**

| Date | Author | Decision |
|---|---|---|
| 2026-04-14 | Bình Hà Khoa | Scope boundary: hypothetical rows live only in this section and the KS-964 payload; they must NOT drive KS-961 Forecast Parameters table or KS-960 Fixed Income/Cash summary table |
| 2026-06-01 | Bình Hà Khoa | Proposed: rename Amount column to **"Amount ($ Millions)"** so users enter scaled values (e.g., `100` = $100M, `2.5` = $2.5M) instead of raw numbers |
| 2026-06-01 | Kathleen Bui | ✅ **Confirmed:** Change to **"Amount ($ Millions)"**; allow input up to **3 decimal places** (e.g., `2.5` = $2,500,000) |

**Additional naming confirmed (from KS-939, 2026-04-20):**
- UI section labels: **"My Hypothetical Scenarios"** + **"Team Scenarios"** + **"New Scenario Set"** button
- Transaction types dropdown: Trade Offer, Capital Call, Distribution, Trust Draw
- "Add Flow" button kept for adding new rows

---

### 4. Files Maintained for This Workstream

| File | Purpose |
|---|---|
| `summary_for_cf.md` | Epic + child ticket health summary |
| `CF_tickets_breakdown.md` | CF-1…CF-14 BA-style breakdown *(CF-13 liquidity marked cancelled)* — each **CF-*n*** cross-linked to Jira **`KS`-958…`KS`-971* |
| `knowledge_checkpoint.md` | This checkpoint |

*(Deep reference: `KS-939_cash_forecast_ui_specs.md` — comment index **refreshed 2026-06-03** to include all 42 comments through the latest 2026-05-29 note.)*

---

### 5. Proposed Ticket Breakdown (CF-*) — Status vs Jira

The **14-ticket** structure remains **13 implementable stories**; **Liquidity Dashboard (CF-13 ([`KS-971`](https://gendvn.atlassian.net/browse/KS-971)))** is **out of scope** per Kathleen on `KS-939`. Navigation (**CF-1 ([`KS-958`](https://gendvn.atlassian.net/browse/KS-958))**) must show **three** sub-tabs only (Dashboard, Historical, Details).

```
KS-950  Cash Forecasting Model (Epic)
  │
  ├── CF-1 (KS-958)   Navigation Shell (3 sub-tabs — no Liquidity)
  │
  ├── CF-2 (KS-961)   Dashboard — Forecast Parameters (+ daily defaults) → Ready for UAT ✅
  ├── CF-3 (KS-960)   Dashboard — Summary Table
  ├── CF-4 (KS-962)   Dashboard — Projected Balance Chart → Internal Testing In Progress 🟠
  ├── CF-5 (KS-963)   Dashboard — Hypothetical Flows (Save / Team / owner controls) → To Do ⬜
  ├── CF-6 (KS-964)   Dashboard — "Calculate Impact"
  ├── CF-7 (KS-965)   Dashboard — Projected Cash Flow Drill-Down
  ├── CF-8 (KS-966)   Dashboard — As-of lookup (30-day window, Dashboard only)
  │
  ├── CF-9 (KS-967)   Historical — Net Cash Flow Graph
  ├── CF-10 (KS-968)  Historical — Capital Calls & Distributions Chart
  ├── CF-11 (KS-969)  Historical — Asset Class Filter + % of NAV Table
  │
  ├── CF-12 (KS-970)  Details — Future Transactions Table + Export
  │
  ├── CF-13 (KS-971)  ~~Liquidity Dashboard~~ → CANCELLED / out of scope
  │
  └── CF-14 (KS-959)  fad_beta auto-fetch from Aloha Homepage
```

---

## ✅ Customer / PO Questions — Updated Status *(from KS-939 + KS-961 + KS-963 threads)*

| ID | Topic | Status |
|---|---|---|
| Q1 | CIO vs Ops vs personal workspaces | **Superseded** by "My Hypothetical Scenarios" / "Team Scenarios" model; CIO/Ops removed. |
| Q2 | Liquidity Dashboard tab | **ANSWERED — remove tab** for now. |
| Q3 | Currency & decimals | **ANSWERED:** USD; **whole numbers** for summary/NAV; $M 1dp + $K whole number for pacing % displays; 3dp for Minimum Buffer sub-million values. |
| Q4 | Historical / as-of date restriction | **ANSWERED:** 30 calendar days on Dashboard as-of view only. |
| Q5 | Initial dashboard load / morning run | **ANSWERED:** daily run with confirmed default parameters; charts from compute; left/fund table from datalake; tuan's batch `hypothetical_trades` = future transactions table. |
| Q6 | Hypothetical save/load scope | **ANSWERED** (save modal, share toggle, team list, 10 scenario cap, mockups approved, 3dp Amount input). **Minor:** confirm row cap per scenario (Bình proposal of 10 rows; PO alignment pending). |
| Q7 | Sign convention for Capital Calls / Distributions | **ANSWERED (bug fix required):** Capital Calls negative, Distributions positive, Net = Distributions − Capital Calls. Fix pending in internal testing. |
| Q8 | Amount input format in Hypothetical Flows | **ANSWERED (2026-06-01):** **"Amount ($ Millions)"**, up to **3dp**. |
| Q9 | Forecast Parameters input range and formatting | **ANSWERED (2026-05-26):** 0–100% range, 1dp for $M, whole number for $K, keep $M at billion-scale. No negatives. |
| Q10 | Illiquid NAV + Total Unfunded NAV display in Forecast Parameters | **ANSWERED (2026-06-01):** **Add both fields** as display-only context in the popup — Kathleen approved. |
| Q11 | Derivative Notional Value source | **ANSWERED (2026-04-21):** Source is **datalake** (not compute server). |

---

## 📋 Recommended Next Steps

| Step | Action | Owner |
|---|---|---|
| 1 | Fix **sign convention** bug — Capital Calls negative, Distributions positive — in all affected chart/table components | tuan tran / dev team |
| 2 | **Increase font size** across dashboard and **bold chart axis labels** | tuan tran / dev team |
| 3 | Build **KS-963** (Hypothetical Flows) with confirmed spec: "My Hypothetical Scenarios" / "Team Scenarios" / "New Scenario Set"; Amount in $M up to 3dp | Bình Hà Khoa |
| 4 | Confirm **10 rows per scenario cap** (if both caps apply, document in AC) | Kathleen Bui |
| 5 | Lock **compute server vs FE** for manual-pacing calculated dollar amounts | Kathleen + eng |
| 6 | Move Epic **`KS-950`** to `In Progress` when team agrees | tuan tran |
| 7 | Complete UAT for **KS-961** (already PASS on Sandbox & Conceptia) | Team / Kathleen |
| 8 | Promote **KS-939** to UAT once sign convention + font + axis fixes are applied | Ly Nguyen / Kathleen |

---

*Checkpoint saved: 2026-06-03 · Source: Jira MCP fetch of KS-939 (42 comments), KS-961 (8 comments), KS-962 (1 comment), KS-963 (3 comments) · Previous checkpoint: 2026-04-13*
