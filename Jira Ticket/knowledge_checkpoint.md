# 📌 Knowledge Checkpoint — Cash Forecasting Model (KS-950)

> **Session / refresh date:** 2026-04-13  
> **Prepared by:** AI BA Session (Cursor)  
> **Status:** **Active — updated from Jira** [`KS-939`](https://gendvn.atlassian.net/browse/KS-939) **(31 comments; last chronological comment 2026-04-10 — Kathleen Bui, team-confirmed default parameters)** — reverified via Atlassian MCP on 2026-04-13; **CF-1…CF-14 ↔ `KS`-958…`KS`-971** reverified on **2026-04-15**  
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

**Agreed gap:** Formal QA/UAT sign-off on datalake outputs remains important before treating the data layer as “done” for downstream UI.

---

#### `KS-949` — JSON Input and Output for Cash Forecast Model

| Field | Value |
|---|---|
| **Status** | `In Progress` |
| **Assignee** | tuan tran |
| **Reporter** | Jerry Luo |

**New engineering thread (from `KS-939` comments, Apr 2026):** tuan tran raised dynamic sourcing vs hardcoded pacing placeholders, derivative account logic, Oasis fund id and `0.55` factor; Kathleen directed Jerry to respond; **Jerry Luo** confirmed he will pull pacing values from the datalake once Solovis-loaded data is available, and confirmed **Oasis fund × 0.55** belongs in the derivative buffer calculation. **Open:** tuan’s follow-up (2026-04-10) on specific table/logic (`asset_name = 'All'`, `capital_calls - distributions`) and request for updated code from Thuyen including transaction/`beta impact` — **awaiting Jerry / code handoff**.

---

#### `KS-939` — Cash Forecast UI Specs

| Field | Value |
|---|---|
| **Status** | `In Progress` |
| **Assignee** | **Bình Hà Khoa** *(changed from tuan tran per Jira 2026-04-10)* |
| **Reporter** | Kathleen Bui |
| **Last updated (Jira)** | **2026-04-10** |
| **Figma** | [Cash Forecast Figma ↗](https://www.figma.com/design/snoshiSrFZ7c0i08Mvmcrm/Cash-Forecast?node-id=0-1&m=dev&t=qfA6kQm8fndkeZIs-1) |

**Major product decisions since prior checkpoint (2026-04-02):**

| Topic | Decision | Source |
|---|---|---|
| Figma access | Kathleen **approved** Bình Hà Khoa’s access (2026-04-02). | `KS-939` |
| Liquidity Dashboard tab | **Remove from scope** for now (no API to populate graph; possible future workaround). | Kathleen, 2026-04-07 |
| Summary / NAV display | **Whole dollars, no decimals** (example style: 425,101). | Kathleen, 2026-04-07 |
| Dashboard “as of” lookback | **Any date within the last 30 calendar days**; applies to **Dashboard main tab only** (not Historical tab selectors). | Kathleen, 2026-04-07 |
| Hypothetical flows | Replace CIO/Ops presets with **Save Flows** modal, **My Saved Flows** + **Team Flows**, private-by-default + optional **Share with Team**, owner-only Share/Unshare/Rename/Delete; **max 10 saved scenarios** per user (delete to add more). Kathleen approved Bình’s mockups (2026-04-09). **Engineering proposal:** Bình (2026-04-09) suggested also capping each saved scenario at **10 hypothetical flow rows** — align explicitly with PO if both caps apply. | Kathleen / Bình, 2026-04-07–09 |
| Daily automated run defaults | **Manual** pacing; **8%** annual distribution; **33%** annual contribution; **$50M** min buffer; **20%** min notional buffer. **Latest `KS-939` comment:** Kathleen wrote she **confirmed with the team** before posting these numbers (2026-04-10). | Kathleen Bui, **2026-04-10** (`KS-939`) |
| Manual pacing $ display | Formulas for distribution/unfunded $ amounts tied to **Historical Unfunded and NAV** table; **open:** compute server vs front-end calculation. | Kathleen, 2026-04-09 |
| Forecast Parameters table in UI | Defaults to **real DB as-of** values; **no hypothetical flows** mixed into that table. | Kathleen, 2026-04-09 |
| Scheduled run behaviour | tuan: daily job with defaults saves results; dashboard shows daily results; **`hypothetical_trades`** for batch uses **fund future transactions** table. | tuan tran, 2026-04-09 |

**Still open / in flight**

- Technical follow-ups on datalake table usage and code parity (`KS-949` / Jerry / tuan thread on `KS-939`, 2026-04-10).  
- **FE vs API** ownership for manual-pacing calculated dollar fields.  
- Optional: reconcile **10 saved scenarios** vs **10 rows per scenario** caps.

---

### 4. Files Maintained for This Workstream

| File | Purpose |
|---|---|
| `summary_for_cf.md` | Epic + child ticket health summary |
| `CF_tickets_breakdown.md` | CF-1…CF-14 BA-style breakdown *(CF-13 liquidity marked cancelled)* — each **CF-*n*** cross-linked to Jira **`KS`-958…`KS`-971** *(semantic map; not sequential by key)* |
| `knowledge_checkpoint.md` | This checkpoint |

*(Deep reference: `KS-939_cash_forecast_ui_specs.md` — comment index **refreshed 2026-04-13** to include Apr 2026 thread through the latest 2026-04-10 note.)*

---

### 5. Proposed Ticket Breakdown (CF-*) — Status vs Jira

The **14-ticket** structure is now **13 implementable stories**; **Liquidity Dashboard (CF-13 ([`KS-971`](https://gendvn.atlassian.net/browse/KS-971)))** is **out of scope** per Kathleen on `KS-939`. Navigation (**CF-1 ([`KS-958`](https://gendvn.atlassian.net/browse/KS-958))**) must show **three** sub-tabs only (Dashboard, Historical, Details).

**Jira keys for CF-1…CF-14** (`KS`-958–`KS`-971, verified MCP **2026-04-15**): Jira **numeric order** does not match CF order — e.g. **CF-14** = [`KS-959`](https://gendvn.atlassian.net/browse/KS-959) (fad_beta), **CF-2** = [`KS-961`](https://gendvn.atlassian.net/browse/KS-961) (Forecast Parameters), **CF-3** = [`KS-960`](https://gendvn.atlassian.net/browse/KS-960) (summary card). Full matrix: [`CF_tickets_breakdown.md`](./CF_tickets_breakdown.md) (table under epic metadata).

```
KS-950  Cash Forecasting Model (Epic)
  │
  ├── CF-1 ([`KS-958`](https://gendvn.atlassian.net/browse/KS-958))   Navigation Shell (3 sub-tabs — no Liquidity)
  │
  ├── CF-2 ([`KS-961`](https://gendvn.atlassian.net/browse/KS-961))   Dashboard — Forecast Parameters (+ daily defaults)
  ├── CF-3 ([`KS-960`](https://gendvn.atlassian.net/browse/KS-960))   Dashboard — Summary Table
  ├── CF-4 ([`KS-962`](https://gendvn.atlassian.net/browse/KS-962))   Dashboard — Projected Balance Chart
  ├── CF-5 ([`KS-963`](https://gendvn.atlassian.net/browse/KS-963))   Dashboard — Hypothetical Flows (Save / Team / owner controls)
  ├── CF-6 ([`KS-964`](https://gendvn.atlassian.net/browse/KS-964))   Dashboard — "Calculate Impact"
  ├── CF-7 ([`KS-965`](https://gendvn.atlassian.net/browse/KS-965))   Dashboard — Projected Cash Flow Drill-Down
  ├── CF-8 ([`KS-966`](https://gendvn.atlassian.net/browse/KS-966))   Dashboard — As-of lookup (30-day window, Dashboard only)
  │
  ├── CF-9 ([`KS-967`](https://gendvn.atlassian.net/browse/KS-967))   Historical — Net Cash Flow Graph
  ├── CF-10 ([`KS-968`](https://gendvn.atlassian.net/browse/KS-968))  Historical — Capital Calls & Distributions Chart
  ├── CF-11 ([`KS-969`](https://gendvn.atlassian.net/browse/KS-969))  Historical — Asset Class Filter + % of NAV Table
  │
  ├── CF-12 ([`KS-970`](https://gendvn.atlassian.net/browse/KS-970))  Details — Future Transactions Table + Export
  │
  ├── CF-13 ([`KS-971`](https://gendvn.atlassian.net/browse/KS-971))  ~~Liquidity Dashboard~~ → **CANCELLED / out of scope**
  │
  └── CF-14 ([`KS-959`](https://gendvn.atlassian.net/browse/KS-959))  fad_beta auto-fetch from Aloha Homepage
```

---

## ✅ Customer / PO Questions — Updated Status *(from `KS-939` thread)*

| ID | Topic | Status |
|---|---|---|
| Q1 | CIO vs Ops vs personal workspaces | **Superseded** by Save / Team flows model; CIO/Ops **removed**. Owner-only controls for own saves. |
| Q2 | Liquidity Dashboard tab | **ANSWERED — remove tab** for now. |
| Q3 | Currency & decimals | **Partially answered:** **USD; whole numbers** for summary/NAV style displays. HALF_UP still engineering default unless PO says otherwise. |
| Q4 | Historical / as-of date restriction | **ANSWERED:** **30 calendar days** on **Dashboard** as-of view only. |
| Q5 | Initial dashboard load / morning run | **Largely clarified:** daily run with **confirmed default parameters**; charts from compute; left/fund table from datalake; tuan’s batch `hypothetical_trades` = future transactions table. |
| Q6 | Hypothetical save/load scope | **ANSWERED** (save modal, share toggle, team list, 10 scenario cap, mockups approved). **Minor:** confirm row cap per scenario. |
| Q7 | Sprint capacity & sub-tasks | **Still open** if team wants a different granularity. |

---

## 📋 Recommended Next Steps

| Step | Action | Owner |
|---|---|---|
| 1 | Close the loop on tuan’s **datalake table / code** questions and **beta impact** in shared code | Jerry Luo / Thuyen / tuan |
| 2 | Confirm **10 scenarios vs 10 rows per scenario** (if both, document explicitly) | Kathleen Bui |
| 3 | Decide **compute vs FE** for manual-pacing calculated $ amounts | Kathleen + eng |
| 4 | Keep `CF_tickets_breakdown.md` / `summary_for_cf.md` aligned as `KS-939` evolves | BA / Bình Hà Khoa |
| 5 | QA/UAT sign-off on `KS-934` when ready | Team |

---

*Checkpoint saved: 2026-04-13 · CF ↔ `KS`-958…`KS`-971 map added 2026-04-15 (Atlassian MCP) · Next action: resolve remaining `KS-939` / `KS-949` engineering threads and PO clarifications above*
