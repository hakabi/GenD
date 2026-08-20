# 📌 Knowledge Checkpoint — Cash Forecasting Model (KS-950)

> **Session / refresh date:** 2026-07-02  
> **Location:** `Jira Ticket/DB and Docs/knowledge_checkpoint.md`  
> **Start here for new sessions:** [`cash_forecast_session_handoff.md`](./cash_forecast_session_handoff.md)  
> **Project:** Kamehameha Schools (`KS`) · Jira: [gendvn.atlassian.net](https://gendvn.atlassian.net)

---

## ✅ What Has Been Established & Agreed

### 1. Documentation layout (Jul 2026)

| File | Purpose |
|------|---------|
| `cash_forecast_session_handoff.md` | **Primary `@` file** — ticket map, latest PO decisions, open items |
| `knowledge_checkpoint.md` | This file — agreed rules, architecture, Q&A status |
| `summary_for_cf.md` | Epic health summary |
| `KS-939_cash_forecast_ui_specs.md` | KS-939 comment index + UI component map |
| `CF_tickets_breakdown.md` | CF-1…16 full BA specs |
| `Cash Forecast UI Documentation.docx` | Original Word spec |

---

### 2. Epic Overview — `KS-950` Cash Forecasting Model

| Field | Value |
|-------|-------|
| **Epic Key** | `KS-950` |
| **Status** | `To Do` *(children largely Ready for UAT; recommend `In Progress`)* |
| **Assignee** | tuan tran |
| **Reporter** | quan |
| **Priority** | Medium |

---

### 3. Jul 2026 scope changes (Jerry + Kathleen — KS-1045)

| Topic | Decision | Implementation |
|-------|----------|----------------|
| Dashboard Excel export | **`.xlsx`**, Dashboard sub-tab only; archive current snapshot | **[KS-1049](https://gendvn.atlassian.net/browse/KS-1049)** |
| Standalone As of Date section | **Remove entire section** (picker, Return to Today, banner) | **[KS-1050](https://gendvn.atlassian.net/browse/KS-1050)** |
| KS-960 card header as-of | **Retain** read-only subtitle on Fixed Income card | KS-1050 AC |
| Full historical replay | **Deferred** (datalake storage) | Kathleen **20590** |
| KS-966 as-of picker | **Superseded** — cancel after KS-1050 ships | KS-1050 |
| Details tab export | **CSV** (not Excel) | **KS-970** |
| BA traceability | Items 1–10 on **[KS-1045](https://gendvn.atlassian.net/browse/KS-1045)** | Monitoring ticket |

---

### 4. Architecture reminders (unchanged)

- **KS-960 + KS-961:** datalake / DB defaults only — **no hypothetical rows**
- **KS-963 → KS-964:** hypothetical flows → compute → **KS-962, KS-965, KS-970**
- **`deriv_notional_value`:** datalake (not compute server)
- **Sign convention (UI):** Capital Calls **negative**, Distributions **positive**, Net = Dist − \|Calls\|
- **Scheduled batch:** Manual 8% / 33%, $50M buffer, 20% notional; `hypothetical_trades` = future transactions table

---

### 5. Tuan — partial as-of behaviour (when picker existed)

| Input / section | On past date select |
|-----------------|---------------------|
| `beta` | **Latest** |
| `illiquid_nav`, `unfunded`, `rate` | **By as-of date** (datalake) |
| Transactions | **Current only** |
| Projected Balance Chart | **Not stored** — no replay |
| Fixed Income `total_val`, `beta` | **Latest** |
| Fixed Income other rows | **By as-of date** |

---

### 6. Child ticket status snapshot (Jul 2026)

| Key | Status | Notes |
|-----|--------|-------|
| KS-934 | Development Complete | Datalake |
| KS-949 | Development Complete | Compute contract |
| KS-939 | Internal Testing | Parent UI spec |
| KS-958–965, 967–970 | Ready for UAT (most) | Kathleen UAT batch on 965/967/968 |
| KS-966 | Ready for UAT | **→ Cancel after KS-1050** |
| KS-971 | Cancelled | Liquidity tab |
| KS-1045 | To Do | BA consolidation |
| KS-1049 | To Do | Dashboard Excel |
| KS-1050 | To Do | Remove standalone as-of |

---

### 7. Proposed ticket breakdown (CF-*)

```
KS-950  Cash Forecasting Model (Epic)
  ├── CF-1 (KS-958)   Navigation (3 sub-tabs)
  ├── CF-2 (KS-961)   Forecast Parameters → Ready for UAT ✅
  ├── CF-3 (KS-960)   Fixed Income / Cash summary card
  ├── CF-4 (KS-962)   Projected Balance Chart
  ├── CF-5 (KS-963)   Hypothetical Flows
  ├── CF-6 (KS-964)   Calculate Impact
  ├── CF-7 (KS-965)   Projected Cash Flow drill-down
  ├── CF-8 (KS-966)   ~~Dashboard as-of picker~~ → SUPERSEDED by CF-16
  ├── CF-9–11 (967–969)  Historical tab
  ├── CF-12 (KS-970)  Details — **CSV** export
  ├── CF-13 (KS-971)  ~~Liquidity~~ → CANCELLED
  ├── CF-14 (KS-959)  fad_beta auto-fetch
  ├── CF-15 (KS-1049) Dashboard Export to Excel
  └── CF-16 (KS-1050) Remove standalone As of Date; fix to today
```

---

## ✅ Customer / PO Questions — Updated Status

| ID | Topic | Status |
|----|-------|--------|
| Q1 | CIO vs Ops workspaces | **Superseded** — My / Team Scenarios model |
| Q2 | Liquidity Dashboard | **ANSWERED — removed** |
| Q3 | Currency & decimals | **ANSWERED** — USD; whole $ summary; $M 1dp pacing |
| Q4 | Dashboard as-of 30-day window | **SUPERSEDED (Jul 2026)** — standalone picker removed (KS-1050) |
| Q5 | Morning run defaults | **ANSWERED** |
| Q6 | Hypothetical save/load | **ANSWERED** — Amount $M, 3dp, 10 scenarios |
| Q7 | Sign convention | **ANSWERED** — fix in UAT (KS-967/968) |
| Q8 | Amount format | **ANSWERED** — "Amount ($ Millions)" |
| Q9 | Forecast Parameters range | **ANSWERED** — KS-961 PASS |
| Q10 | Illiquid NAV + Unfunded in popup | **ANSWERED** |
| Q11 | deriv_notional_value source | **ANSWERED** — datalake |
| Q12 | Dashboard Excel vs Historical | **ANSWERED (20590)** — Dashboard `.xlsx` only; no Historical export |
| Q13 | Full forecast replay by date | **ANSWERED (20590)** — deferred; Excel archives current |

---

## 📋 Recommended Next Steps

| Step | Action | Owner |
|------|--------|-------|
| 1 | Implement **KS-1049** (Dashboard Excel) and **KS-1050** (remove as-of section) | Bình Hà Khoa |
| 2 | Complete Kathleen UAT items 1–8 on **KS-965/967/968** | Kathleen / team |
| 3 | Cancel **KS-966** after KS-1050 deployed | BA / PO |
| 4 | Move Epic **KS-950** to `In Progress` if not already | tuan tran |

---

## Jira write rules

- Tickets **with inline images:** ADF (`editJiraIssue`, `contentFormat: adf`)
- Tickets **without images:** markdown via `user-mcp-atlassian` OK

---

*Checkpoint saved: 2026-07-02 · Prior version: `Jira Ticket/knowledge_checkpoint.md` (2026-06-03)*
