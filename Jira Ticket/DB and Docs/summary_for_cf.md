# 📊 Epic Summary Report — Cash Forecasting Model

> **Epic:** [`KS-950`](https://gendvn.atlassian.net/browse/KS-950) — Cash Forecasting Model  
> **Location:** `Jira Ticket/DB and Docs/summary_for_cf.md`  
> **Handoff:** [`cash_forecast_session_handoff.md`](./cash_forecast_session_handoff.md)  
> **Report refreshed:** 2026-07-02

---

## ⚠️ Epic Health At-a-Glance

| Item | Value |
|------|-------|
| Epic Status | `To Do` *(most children Ready for UAT; new work KS-1049/1050)* |
| Feature stories | KS-958–970 (+ KS-1045, 1049, 1050) |
| Ready for UAT | KS-958–965, KS-967–970 (majority) |
| Development Complete | KS-934, KS-949, KS-964 |
| Internal Testing | KS-939, KS-962 |
| Cancelled | KS-971 (Liquidity) |
| New (Jun–Jul 2026) | **KS-1045** (BA tracking), **KS-1049** (Excel), **KS-1050** (remove as-of) |
| Superseded | **KS-966** → cancel after **KS-1050** |
| Deployed env | Conceptia (internal testing since 2026-05-26) |

---

## 🗺 Scope Overview

```
KS-950  Cash Forecasting Model (Epic)
  ├── KS-934  Data Loading              → Dev Complete
  ├── KS-949  JSON I/O Contract         → Dev Complete
  └── KS-939  UI Specs (parent)         → Internal Testing
       ├── Dashboard: KS-960–966, KS-1049, KS-1050
       ├── Historical: KS-967–969
       └── Details: KS-970 (CSV export)
```

**Scope changes:**
- **Apr 2026:** Liquidity Dashboard tab removed (KS-971 cancelled)
- **Jul 2026:** Remove standalone Dashboard as-of picker (KS-1050); add Dashboard Excel export (KS-1049); no full historical replay

---

## 🆕 Jul 2026 — Jerry / Kathleen decisions (KS-1045)

| Item | Decision | Ticket |
|------|----------|--------|
| Excel on Dashboard | `.xlsx` export of full Dashboard sections (960/962/963/965) | KS-1049 |
| No Historical Excel | Kathleen confirmed — archive via Dashboard only | KS-1049 |
| Remove as-of picker | Entire standalone "As of Date" section removed | KS-1050 |
| Keep KS-960 header date | Read-only as-of subtitle on Fixed Income card | KS-1050 |
| Full replay by date | Deferred — use Excel for current version | Kathleen 20590 |

---

## 🎫 Key child tickets (current)

### `KS-1045` — BA Consolidation & UAT Tracking

| | |
|---|---|
| **Status** | To Do |
| **Purpose** | Traceability for Kathleen UAT (items 1–8) + Jerry items (9–10 → KS-1049/1050) |
| **Link** | [KS-1045 ↗](https://gendvn.atlassian.net/browse/KS-1045) |

### `KS-1049` — Dashboard Export to Excel

| | |
|---|---|
| **Status** | To Do |
| **Assignee** | Bình Hà Khoa |
| **Scope** | Dashboard sub-tab only; `.xlsx`; includes post–Calculate Impact state |
| **Link** | [KS-1049 ↗](https://gendvn.atlassian.net/browse/KS-1049) |

### `KS-1050` — Remove Dashboard As-Of Date Picker

| | |
|---|---|
| **Status** | To Do |
| **Assignee** | Bình Hà Khoa |
| **Scope** | Remove standalone section; dashboard fixed to current run day; KS-966 cancel after ship |
| **PO** | Kathleen confirmed removal (comment 20592) |
| **Link** | [KS-1050 ↗](https://gendvn.atlassian.net/browse/KS-1050) |

### `KS-966` — Historical As-Of-Date View *(superseded)*

| | |
|---|---|
| **Status** | Ready for UAT → **cancel after KS-1050** |
| **Reason** | Partial as-of only; chart not stored; PO chose remove picker + Excel archive |
| **Link** | [KS-966 ↗](https://gendvn.atlassian.net/browse/KS-966) |

### `KS-970` — Future Transactions (Details)

| | |
|---|---|
| **Status** | Ready for UAT |
| **Export** | **CSV** (not Excel) — numbered pagination, Settlement Date filter |
| **Link** | [KS-970 ↗](https://gendvn.atlassian.net/browse/KS-970) |

### `KS-961` — Forecast Parameters

| | |
|---|---|
| **Status** | Ready for UAT — **PASS** Sandbox & Conceptia (2026-06-02) |
| **Link** | [KS-961 ↗](https://gendvn.atlassian.net/browse/KS-961) |

### `KS-939` — UI Specs (parent)

| | |
|---|---|
| **Status** | Internal Testing In Progress |
| **Assignee** | Ly Nguyen |
| **Thread** | 42+ comments through May 2026; Jun–Jul decisions on KS-1045 |
| **Link** | [KS-939 ↗](https://gendvn.atlassian.net/browse/KS-939) |

---

## 📋 Recommended Next Actions

| # | Action | Owner | Ticket |
|---|--------|-------|--------|
| 1 | Implement Dashboard Excel export | Bình Hà Khoa | KS-1049 |
| 2 | Remove standalone As of Date section | Bình Hà Khoa | KS-1050 |
| 3 | Kathleen UAT on drill-down / historical charts | Kathleen | KS-965, 967, 968 |
| 4 | Cancel KS-966 after KS-1050 ships | BA | KS-966 |
| 5 | Close KS-1045 items as UAT completes | BA | KS-1045 |

---

## 👥 Stakeholders

| Name | Role |
|------|------|
| Kathleen Bui | Product Owner |
| Jerry Luo | Backend / compute server |
| tuan tran | Data + integration |
| Bình Hà Khoa | Dev (KS-963, KS-1049, KS-1050) |
| Ly Nguyen | Dev (KS-939, KS-961, KS-962) |
| Thuyen | Datalake / storage constraints |

---

*Refreshed: 2026-07-02 · Prior: `Jira Ticket/summary_for_cf.md` (2026-06-03)*
