# Decision Log — Aloha Modernization

**Every decision that shapes the work, with the date and who made it.** A decision that stays in a
Confluence comment thread is a decision nobody will find in six weeks.

**When a thread resolves:** add a row here, then link this page from the Jira epic. When a decision is
later reversed, **do not edit the row** — add a new one and mark the old superseded.

**Owner:** BA · **Last updated:** 21 August 2026

---

## How to add a row

| Field | Meaning |
|---|---|
| **#** | `D-nn`, never reused |
| **Decision** | What was decided, in one sentence. Not the discussion |
| **By** | Role — KS · PO · BA · dev · QA |
| **Date** | When it was decided, not when it was written down |
| **Affects** | Epic or milestone |
| **Source** | Where the reasoning lives — Confluence page, Jira comment, document section |

---

## 1. Programme-level

| # | Decision | By | Date | Affects | Source |
|---|---|---|---|---|---|
| **D-01** | Three programmes run in sequence: **UI Rewrite → Postgres POC → Airflow Migration** | PO | 20 Aug 2026 | All | KS-1102 description |
| **D-02** | The UI rewrite is a **new Angular 22 repo**, not an in-place upgrade. The AngularJS app is maintained in parallel until cutover | PO | 20 Aug 2026 | KS-1102 | KS-1102 |
| **D-03** | Deploy on the **same server, new domain**; switch to production only after **KS UAT** | PO | 20 Aug 2026 | KS-1102 | KS-1102 |
| **D-04** | **API changes are out of scope** for KS-1102 and tracked as separate, unlinked tickets | PO | 20 Aug 2026 | KS-1102 | KS-1102 |
| **D-05** | Test stack becomes **Playwright + TypeScript + QOps Harness**, replacing Selenium. Excel manual tests are rewritten | PO | 20 Aug 2026 | KS-1102 · QA | KS-1102 |
| **D-06** | Postgres POC keeps **Trino**; only the adapter/connector changes | PO | 20 Aug 2026 | KS-1103 | KS-1103 |
| **D-07** | **No-go on Postgres means no production database change.** Mongo remains source of truth unless KS says go | KS / PO | 20 Aug 2026 | KS-1103 · KS-1104 | KS-1103 |
| **D-08** | Airflow is **self-hosted** (Docker Compose), dual-run on the same schedule, Digdag disabled **one workflow at a time** | PO | 20 Aug 2026 | KS-1104 | KS-1104 |
| **D-09** | The Airflow **target database follows the KS-1103 decision** — Postgres if go, Mongo if no-go | PO | 20 Aug 2026 | KS-1104 | KS-1103 · KS-1104 |

## 2. Documentation and process

| # | Decision | By | Date | Affects | Source |
|---|---|---|---|---|---|
| **D-10** | This folder is the single home for the three programmes. The Aloha **MCP server** QA workstream (KS-1066) stays in `Aloha Server/` — different subject, different lifecycle | BA | 21 Aug 2026 | All | [`../README.md`](../README.md) |
| **D-11** | **Discussion in Confluence comments; conclusions in this log.** Anything blocked on a person goes in [`Open_Questions.md`](./Open_Questions.md) | BA | 21 Aug 2026 | All | [`../README.md`](../README.md) |
| **D-12** | Published to Confluence space **KAM** as its own subtree, not filed loose. KAM is a large legacy space dating to 2022 | BA | 21 Aug 2026 | All | [`../README.md`](../README.md) |
| **D-13** | Folders are numbered in **execution order**, so `01`→`02`→`03`. The epics' own "Program 1/2/3" labels run in a different order — always quote the **epic key** externally | BA | 21 Aug 2026 | All | [`Program_Charter.md`](./Program_Charter.md) §2 |
| **D-14** | Design **token values come from [`Design_Reference.md`](../01_UI_Rewrite_KS-1102/Design_Reference.md)**, extracted from the handoff, not read by eye from `source/index.html` — which is 1.88 MB and cannot be opened usefully | BA | 21 Aug 2026 | KS-1102 | [`Design_Reference.md`](../01_UI_Rewrite_KS-1102/Design_Reference.md) |

## 3. Superseded

*None yet. When a decision is reversed, move its row here and note which decision replaced it.*
