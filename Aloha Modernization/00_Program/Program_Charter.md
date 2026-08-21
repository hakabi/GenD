# Programme Charter — Aloha Modernization

**Owner:** BA · **Created:** 21 August 2026 · **Source:** epics KS-1102, KS-1103, KS-1104

This document says what the three programmes are, how they depend on one another, and what is
deliberately excluded. Where it and a Jira epic disagree, **the epic wins** — update this file.

---

## 1. Why

Aloha runs on AngularJS, MongoDB and Digdag. All three are being replaced, in order, with a customer-led
UI redesign first and the data platform following behind it.

## 2. The three programmes

### Programme 1 — UI Rewrite · [KS-1102](https://gendvn.atlassian.net/browse/KS-1102)

Rebuild the Aloha web UI to match the KS customer design, in a **new Angular 22 + TypeScript repo**,
deployed on the **same server under a new domain**, cut over to production after KS UAT.

- Full UI revamp matching the customer design — functional **and** brand guidelines
- AngularJS app maintained **in parallel** until cutover
- Milestone-based KS reviews on **staging**
- Excel manual tests rewritten; **Playwright + TypeScript + QOps Harness** replaces Selenium

**Milestones** — query Jira for the current set; this is not a complete list:

| Story | Milestone |
|---|---|
| [KS-1105](https://gendvn.atlassian.net/browse/KS-1105) | **M0** — Angular 22 foundation, shell, MSAL auth, staging deploy, design tokens + light/dark, route skeleton, chart wrapper spike, Playwright + Harness bootstrap. *No KS demo* |
| [KS-1106](https://gendvn.atlassian.net/browse/KS-1106) | **M1** — At a Glance KPIs (NAV, Risk %, Equity Beta, Illiquid, Unfunded). **First KS review** |

```
project = KS AND parent = KS-1102 ORDER BY key ASC
```

### Programme 2 — Postgres POC · [KS-1103](https://gendvn.atlassian.net/browse/KS-1103)

Prove whether PostgreSQL outperforms MongoDB for Aloha query workloads **via Trino**. Trino stays; only
the adapter/connector changes. **KS decides go/no-go.**

**No-go means keep Mongo and change nothing in production.** The deliverable is a *decision backed by
evidence*, not a migration.

- Mongo remains source of truth unless and until KS says go
- On-prem Postgres on the deployment server
- **Full 5–10 GB backup** for a fair comparison; a small subset is for demo only
- **No real production interaction during the POC**
- Zero downtime if migration proceeds
- Frontend impact is **API-contract only**

Migration path components, if go: data loader · Elasticsearch · backend · frontend (contract) · data
uploader · compute-server · query engine.

### Programme 3 — Airflow Migration · [KS-1104](https://gendvn.atlassian.net/browse/KS-1104)

Migrate Digdag workflows to **self-hosted Airflow** (Docker Compose) for better debugging of data loading
and mapping flows. Run both on the **same schedule**, validate, then disable Digdag **one workflow at a
time**.

- **Hundreds of workflows.** The engineer selects a subset — scope selection is itself a deliverable
- New repo for Airflow DAGs; inventory starts from the servers
- **Dual-run validation is two-stage:** engineer does row-count comparison on a test DB clone, then QA
  validates on the **Aloha + Workbench UI**
- Target database follows the KS-1103 decision

## 3. Dependencies

```
KS-1102  UI Rewrite
    │
    ▼
KS-1103  Postgres POC ──► go/no-go decision by KS
    │                          │
    ▼                          ▼
KS-1104  Airflow          target DB = Postgres (go) or Mongo (no-go)
```

**KS-1104 cannot finalise its target database until KS-1103 closes.** Any KS-1104 ticket that assumes
Postgres is assuming the go decision and must say so.

## 4. Out of scope

- **API changes.** KS-1102 is UI only; API work is separate tickets and deliberately unlinked
- **The Aloha MCP server.** Epic KS-1066, a different workstream — see [`../../Aloha Server/`](../../Aloha%20Server/)
- **Production data during the POC.** KS-1103 works on a backup and a test clone
- **Migrating all Digdag workflows.** KS-1104 migrates a selected subset

## 5. Roles

| Role | In this programme |
|---|---|
| **BA** | Owns these documents, refines the backlog, routes decisions |
| **PO** | Reviews and prioritises |
| **dev** | Implements; owns the Angular repo, the Postgres benchmark and the Airflow DAGs |
| **QA** | Rewrites the Excel manual tests, builds Playwright coverage, validates dual-run on the UI |
| **KS** | The customer. Reviews milestones on staging, owns the Postgres go/no-go |

Real names and email addresses stay in Jira. These documents use roles.

## 6. Known unknowns

Everything blocked on a person is in [`Open_Questions.md`](./Open_Questions.md). The four that shape the
most work today:

1. Is the **Scenario Testing** tab moving from Risk Model to Equity Beta Model, or is it a genuine gap?
2. Are **Pipeline**, **Liquidity sidebar home** and **Owned by KS filter** intentionally out of scope?
3. The customer handoff defines **no radius scale**. What becomes the system value in M0?
4. What are the **Postgres go/no-go thresholds** — what result would make KS say no?
