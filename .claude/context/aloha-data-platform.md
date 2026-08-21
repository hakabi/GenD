# Context Pack — Aloha Data Platform (KS-1103, KS-1104)

Two sequenced infrastructure programmes. Neither is UI work, and neither is served by mockups.

| Epic | Programme |
|---|---|
| **[KS-1103](https://gendvn.atlassian.net/browse/KS-1103)** | MongoDB → PostgreSQL — POC, then gradual migration |
| **[KS-1104](https://gendvn.atlassian.net/browse/KS-1104)** | Digdag → Airflow — self-hosted dual-run migration |

**Sequence:** after Program 1 (UI, KS-1102) → KS-1103 → KS-1104.

> ⚠️ **No repository footprint yet.** As of 20 Aug 2026 nothing in the repo mentions these epics. Read
> them and their children from Jira. Add repo documents to this pack when they exist.
>
> ```
> project = KS AND parent in (KS-1103, KS-1104) ORDER BY key ASC
> ```

---

## 1. KS-1103 — Postgres POC

**Goal:** prove whether PostgreSQL outperforms MongoDB for Aloha query workloads **via Trino** — Trino
stays; only the adapter/connector changes. **KS decides go/no-go. No-go means keep Mongo and change
nothing in production.**

**Constraints that shape every ticket:**

- Mongo remains the source of truth unless and until KS says go
- On-prem Postgres, on the deployment server
- **Full 5–10 GB backup** for a fair comparison; a small subset is for demo only
- **No real production interaction during the POC**
- Zero downtime if migration proceeds
- Frontend impact is **API-contract only** — separate from the UI revamp

**Components on the migration path (go only):** data loader · Elasticsearch · backend · frontend
(contract) · data uploader · compute-server · query engine.

**The deliverable is a decision, not a build.** A story that does not contribute evidence to the go/no-go
is out of scope. Acceptance criteria should name the measurement, the dataset and the threshold — not
"performs better".

## 2. KS-1104 — Digdag → Airflow

**Goal:** migrate Digdag workflows to **self-hosted Airflow** (Docker Compose) for a better debugging UI
over data loading and mapping flows. Run both systems **on the same schedule**, validate, then disable
Digdag **one workflow at a time**.

**Constraints:**

- **Hundreds of workflows** — the engineer picks a subset to migrate. Scope selection is itself a
  deliverable
- New repo for Airflow DAGs; the inventory starts from the servers
- **Dual-run validation has two stages:** engineer does **row-count** comparison on a test DB clone, then
  **QA validates on the Aloha + Workbench UI**
- Target DB follows the KS-1103 decision — Postgres if go, Mongo if no-go

**This epic is blocked on KS-1103's outcome** for its target database. A ticket that assumes Postgres is
assuming the go decision; say so explicitly.

## 3. What good looks like here

Neither programme produces screens, so the designer role has little to do. The useful outputs are:

- **Benchmark design** — what is measured, on what data, against what threshold, and what result would
  falsify the hypothesis
- **Validation design** — how a dual-run is proved equivalent, and what discrepancy is tolerable
- **Cutover and rollback** — the order of operations, and how to reverse each step
- **Decision records** — what was measured, what it showed, what was decided

## 4. Ticket conventions

Project **KS**, parent KS-1103 or KS-1104. Follow the structure the sibling epics use — read a KS-1102
child such as [KS-1105](https://gendvn.atlassian.net/browse/KS-1105) for the shape: `### Deliverables`,
`### Acceptance` as a checkbox list, `### Parent`.

These epics are assigned to the BA. The Harness rule D9 does not govern them — but agents still hold no
Jira write tools, because a subagent cannot pause for confirmation.
