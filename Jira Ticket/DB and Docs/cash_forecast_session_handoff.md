# Cash Forecast — Session Handoff (KS-950)

> **Refresh date:** 2026-07-02  
> **Purpose:** Primary `@` file for new Cursor sessions. Read this first; fetch Jira only when stale or explicitly requested.  
> **Location:** `Jira Ticket/DB and Docs/cash_forecast_session_handoff.md`  
> **Epic:** [KS-950](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model  
> **BA consolidation ticket:** [KS-1045](https://gendvn.atlassian.net/browse/KS-1045)

---

## How to use in a new chat

```text
Continue Cash Forecast (KS-950). Read @Jira Ticket/DB and Docs/cash_forecast_session_handoff.md first.
Do not re-fetch all Jira tickets unless I ask or this handoff is stale.
```

| Need | Also read |
|------|-----------|
| Epic health / agreed rules | `knowledge_checkpoint.md` (same folder) |
| Executive summary | `summary_for_cf.md` |
| KS-939 comment history & UI map | `KS-939_cash_forecast_ui_specs.md` |
| Full per-ticket requirements (CF-1…14) | `CF_tickets_breakdown.md` |
| Original Word spec | `Cash Forecast UI Documentation.docx` |

---

## Current decisions (authoritative — Jul 2026)

### As-of date / historical replay

| Topic | Decision | Source |
|-------|----------|--------|
| Full historical replay | **Deferred** — too much datalake storage (Thuyen) | Kathleen, KS-1045 **20590** (2026-06-30) |
| Dashboard as-of picker | **Remove entire standalone "As of Date" section** (picker, Return to Today, banner) | Jerry + Kathleen **20592** (2026-07-01) |
| KS-960 card header date | **Keep** read-only as-of subtitle on Fixed Income card (e.g. `Apr 13, 2026`) | BA clarification 2026-07-02 |
| KS-966 | **Superseded** → cancel after **KS-1050** ships | KS-1050, Kathleen **20590/20592** |
| Why not partial picker | Tuan: chart **not stored**; beta=latest; illiquid NAV/unfunded/rate=by date; transactions=**current** only | KS-1045 comment **20574** |

### Excel export

| Topic | Decision | Source |
|-------|----------|--------|
| Format | **`.xlsx`** on **Dashboard sub-tab only** | Jerry **20567**; Kathleen **20590** |
| Purpose | Archive **current** Dashboard snapshot when historical replay unavailable | Kathleen **20590** |
| Not in scope | Historical tab export; Details uses **CSV** (**KS-970**) | Kathleen **20573** |
| Implementation | **[KS-1049](https://gendvn.atlassian.net/browse/KS-1049)** | Issued 2026-06-29 |

### Kathleen UAT batch (Items 1–8)

Tracked on **[KS-1045](https://gendvn.atlassian.net/browse/KS-1045)** → primarily **KS-965**, **KS-967**, **KS-968** (font, weekly drill-down, sign convention, etc.).

---

## Ticket map (KS-950 children)

| Key | Summary (short) | Status | Notes |
|-----|-----------------|--------|-------|
| KS-934 | Datalake data loading | Dev Complete | |
| KS-939 | UI specs / stakeholder thread | Internal Testing | Parent spec ticket |
| KS-949 | Compute JSON contract | Dev Complete | `POST …/cash_forecast_model` port **5001** |
| KS-958 | Navigation shell | Ready for UAT | |
| KS-959 | Live `fad_beta` | Ready for UAT | |
| KS-960 | Fixed Income / Cash summary card | Ready for UAT | Card header as-of **retained** |
| KS-961 | Forecast Parameters | Ready for UAT | PASS Sandbox/Conceptia |
| KS-962 | Projected Balance Chart | Ready for UAT | Not stored by as-of date |
| KS-963 | Hypothetical Flows | Ready for UAT | |
| KS-964 | Calculate Impact | Dev Complete | |
| KS-965 | Projected Cash Flow drill-down | Ready for UAT | Weekly tier per Kathleen |
| KS-966 | Historical as-of picker | Ready for UAT | **→ Cancel after KS-1050** |
| KS-967 | Historical Net Cash Flow | Ready for UAT | |
| KS-968 | Historical Cap Calls chart | Ready for UAT | Sign flip required |
| KS-969 | Historical NAV table | Ready for UAT | |
| KS-970 | Details — Future Transactions | Ready for UAT | **Export CSV** (not Excel) |
| KS-971 | Liquidity Dashboard | Cancelled | |
| **KS-1045** | BA consolidation & UAT tracking | To Do | Items 1–10 traceability |
| **KS-1049** | Dashboard Export to Excel | To Do | Jerry item 1 |
| **KS-1050** | Remove standalone As of Date | To Do | Jerry item 2; PO confirmed |

---

## Tuan — as-of behaviour (when picker existed)

| Input / section | Behaviour on date select |
|-----------------|--------------------------|
| `beta` (compute) | **Latest** |
| `illiquid_nav`, `unfunded`, `rate` | **By selected as-of date** (datalake) |
| Transactions | **Current only** — not snapshotted |
| Projected Balance Chart | **Not stored** — no historical replay |
| Fixed Income `total_val`, `beta` | **Latest** |
| Fixed Income other rows | **By as-of date** (datalake) |

---

## Architecture reminders

- **KS-960 + KS-961:** datalake / DB defaults only — **no hypothetical rows**
- **KS-963 → KS-964:** hypothetical flows into compute output → **KS-962, KS-965, KS-970**
- **`deriv_notional_value`:** datalake (not compute server)
- **Sign convention (UI):** Capital Calls **negative**, Distributions **positive**, Net = Dist − \|Calls\|

---

## Jira write rules (learned)

- Tickets **with inline images:** update via **ADF** (`editJiraIssue`, `contentFormat: adf`) — markdown `jira_update_issue` strips/corrupts images
- Tickets **without images:** markdown update via `user-mcp-atlassian` is OK

---

## Open / follow-up

| Item | Owner |
|------|-------|
| Cancel **KS-966** after **KS-1050** deployed | BA / PO |
| Implement **KS-1049**, **KS-1050** | Dev (Bình Hà Khoa) |
| **KS-1045** Item 1–8 UAT on KS-965/967/968 | Kathleen / team |
| Sync **KS-1045** description (Item 10 still says "pending PO" in body) | BA — optional |

---

## KS-1045 comment index (recent)

| ID | Date | Author | Topic |
|----|------|--------|-------|
| 20567 | 2026-06-26 | Jerry Luo | Excel + remove as-of picker |
| 20573 | 2026-06-30 | Kathleen | No Historical tab Excel; questions as-of |
| 20574 | 2026-06-30 | Bình | Tuan table — partial as-of reality |
| 20590 | 2026-06-30 | Kathleen | No full replay; Excel for current version |
| 20591 | 2026-07-01 | Bình | Remove standalone As of Date section? |
| 20592 | 2026-07-01 | Kathleen | Agrees — remove entire section |

---

*Handoff maintained in `DB and Docs/`. Refresh after major Jira decisions or sprint close.*
