# 3. Airflow Migration — KS-1104

**Digdag → self-hosted Airflow.** Run both on the same schedule, validate, then disable Digdag one
workflow at a time.

**Epic:** [KS-1104](https://gendvn.atlassian.net/browse/KS-1104) · **Status:** To Do ·
**Runs after** the KS-1103 go/no-go

---

## Why

Better debugging of data loading and mapping flows. Airflow's UI over the current Digdag setup is the
stated driver — this is an **operability** migration, not a performance one.

## What is here

| File | What it is |
|---|---|
| [`Workflow_Inventory.md`](./Workflow_Inventory.md) | What exists in Digdag, and which subset migrates first |
| [`Dual_Run_Validation.md`](./Dual_Run_Validation.md) | How a migrated workflow is proved equivalent before Digdag is switched off |

Read [`../02_Postgres_POC_KS-1103/Prior_Art.md`](../02_Postgres_POC_KS-1103/Prior_Art.md) §3 first — KAM
already documents the Dynamo data loader, Solovis workflows, and a force-sync procedure. *"More Concerns
for Dynamo Data"* is worth reading before assuming a clean migration.

## The blocking dependency

**The target database follows the KS-1103 decision** — Postgres if go, Mongo if no-go.

Until that closes, **any ticket here that assumes Postgres must say so explicitly.** Writing tickets
against an assumed go is how a no-go decision turns into a week of rework.

## Constraints

- **Self-hosted Airflow**, Docker Compose
- **Hundreds of workflows.** The engineer selects a subset — *scope selection is itself a deliverable*,
  not a preliminary
- **New repo** for Airflow DAGs; the inventory starts from the servers
- **Dual-run on the same schedule**, then disable Digdag **one workflow at a time** — never in a batch
- **Validation is two-stage:** engineer does row-count comparison on a **test DB clone**, then QA
  validates on the **Aloha + Workbench UI**

## Open questions

| # | Question |
|---|---|
| **Q9** | Which workflows migrate first, and on what criteria? The epic says "the engineer picks a subset" without naming a basis |
| **Q11** | QA validates on "Aloha + Workbench UI" — which screens, and what counts as a match? |

Both in [`../00_Program/Open_Questions.md`](../00_Program/Open_Questions.md).
