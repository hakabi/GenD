# Aloha Modernization

**Three sequenced programmes to modernise the Aloha platform.** Jira project **KS**
(`gendvn.atlassian.net`). Confluence space **KAM** — *Kamehameha Schools*.

**Audience:** PO · dev · QA · KS (the customer).
**Owner:** BA · **Started:** 20 August 2026

> **New here? Read [`00_Program/Program_Charter.md`](./00_Program/Program_Charter.md) first.** It explains
> what the three programmes are, how they depend on each other, and what is deliberately out of scope.

---

## The three programmes

| # | Programme | Epic | Status |
|---|---|---|---|
| **1** | [UI Rewrite](./01_UI_Rewrite_KS-1102/) — AngularJS → Angular 22, new repo and domain | [KS-1102](https://gendvn.atlassian.net/browse/KS-1102) | To Do |
| **2** | [Postgres POC](./02_Postgres_POC_KS-1103/) — MongoDB → PostgreSQL via Trino, go/no-go | [KS-1103](https://gendvn.atlassian.net/browse/KS-1103) | To Do |
| **3** | [Airflow Migration](./03_Airflow_Migration_KS-1104/) — Digdag → Airflow, dual-run | [KS-1104](https://gendvn.atlassian.net/browse/KS-1104) | To Do |

**Execution order is 1 → 2 → 3.**

> ⚠️ **The epics use different numbers from the folders.** KS-1102 calls the Airflow work "Program 2" and
> the Postgres work "Program 3", while stating the sequence as *Program 1 → Program 3 → Program 2*. The
> folders here are numbered in **execution order** so `01` → `02` → `03` reads correctly. When talking to
> KS or quoting an epic, use the **epic key**, never a programme number.

## Where things live

| Folder | Contains |
|---|---|
| [`00_Program/`](./00_Program/) | Charter · **Decision Log** · **Open Questions** · Glossary. Cross-programme, read on a cadence |
| [`01_UI_Rewrite_KS-1102/`](./01_UI_Rewrite_KS-1102/) | Design reference, gap analysis, milestones, the customer handoff, mockups, screenshots |
| [`02_Postgres_POC_KS-1103/`](./02_Postgres_POC_KS-1103/) | Benchmark design, go/no-go criteria, prior art already in KAM |
| [`03_Airflow_Migration_KS-1104/`](./03_Airflow_Migration_KS-1104/) | Workflow inventory, dual-run validation design |
| `90_Archive/` | Superseded documents. Never delete — move here with a note saying what replaced it |

**Not here:** the Aloha **MCP server** QA workstream (Epic KS-1066) lives in
[`../Aloha Server/`](../Aloha%20Server/). Different subject, different lifecycle. Do not mix them.

## How discussion works

**One rule, and it is the thing that keeps this manageable:**

> Discussion happens in **Confluence comments**. Conclusions land in
> [`00_Program/Decision_Log.md`](./00_Program/Decision_Log.md).

A decision that stays in a comment thread is a decision nobody will find in six weeks. When a thread
resolves, add a dated row to the log and link it from the Jira epic.

Anything **blocked on a person** goes in [`00_Program/Open_Questions.md`](./00_Program/Open_Questions.md)
— one list, with an owner and a date. If a row has been sitting more than a week, chase it.

## Publishing to Confluence

Target space **KAM**. Page tree:

```
Aloha Modernization                    ← this README
├── 0. Program                         ← Charter · Decision Log · Open Questions · Glossary
├── 1. UI Rewrite — KS-1102
├── 2. Postgres POC — KS-1103
└── 3. Airflow Migration — KS-1104
```

**The filename is the page title.** Keep `Title_Case_With_Underscores.md`; underscores become spaces.

> ⚠️ **Attachments cannot be uploaded through the Atlassian tooling.** Markdown publishes as pages
> normally, but **HTML mockups must be dragged into Confluence by hand.** Practical approach: put a
> *screenshot* inline on the page so it can be read without clicking, and attach the HTML for anyone who
> wants to interact with it.

KAM is a large legacy space with content going back to 2022. Keep this programme in its own subtree
rather than filing pages loose at the top level.

## Conventions

- **Folders:** `NN_Title_Case_KS-####` — numbers sort on disk and carry the Confluence page order
- **Files:** `Title_Case_With_Underscores.md`
- **Dated documents:** prefix with the date — `2026-08-21_M0_Design_Review.md`. Use it for anything
  point-in-time: reviews, measurements, meeting outcomes
- **Names:** refer to people by role — **BA · PO · dev · QA · KS**. Real names and emails stay in Jira
- **Branches:** `docs/ks-####-<slug>` for documents in this repo · `feat/ks-####-<slug>` in the Angular
  repo · `fix/ks-####-<slug>` for fixes. Matches the existing `fix/ks-1085-1090-aloha-mcp-qa`
