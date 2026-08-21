# Workflow Inventory — Digdag → Airflow

**Status:** 🟡 **Empty skeleton.** The inventory starts from the servers and has not been taken.

**Owner:** dev (inventory) · BA (scope criteria) · **Epic:** [KS-1104](https://gendvn.atlassian.net/browse/KS-1104)

---

## Why this is the first deliverable

The epic says *"hundreds of workflows; engineer picks a subset to migrate."* That sentence hides two
separate pieces of work:

1. **Knowing what exists** — nobody has listed it
2. **Choosing what moves first** — and on what basis

Neither can be skipped, and the second is a judgement that needs stating, not an engineer's private
preference. **Scope selection is a deliverable.** Tracked as Q9.

## Taking the inventory

The source is **the servers**, not a repository — Digdag workflows are deployed, and the deployed set is
the truth. Existing KAM documentation covers some of them but is not a complete list:

- [Dynamo Data Loader](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/228163588)
- [Solovis API and workflows](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/282198017)
- [Force Sync Pipeline Fund Data — Technical Guide](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/449118209)
- ⚠️ [More Concerns for Dynamo Data](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/231505927) — **read
  before assuming any of this migrates cleanly**

## The inventory table

*To be filled from the servers.*

| # | Workflow | Schedule | Source → target | Downstream | Complexity | Migrate in wave |
|---|---|---|---|---|---|---|
| | | | | | | |

**Columns that matter and are easy to omit:**

- **Downstream** — what breaks if this workflow is wrong. Drives validation depth
- **Complexity** — not lines of code. Branching, retries, external calls, manual steps
- **Wave** — which migration batch. Blank until the criteria in the next section are agreed

## Selection criteria — proposed, needs agreement

The first workflows to migrate should be the ones that **prove the approach** while risking least:

| Priority | Characteristic | Reasoning |
|---|---|---|
| **First** | Simple, well-understood, low downstream impact | Proves the Airflow setup and the dual-run method with little at stake |
| **Then** | High operational pain — the ones people currently struggle to debug | This is the migration's actual purpose; deliver the benefit early |
| **Then** | High complexity, high impact | Once the method is trusted |
| **Last, or never** | Workflows already slated for removal | Migrating something about to be deleted is pure waste — **check for these before starting** |

> **The last row is worth a deliberate pass.** With hundreds of workflows, some are certainly obsolete.
> Finding them is cheaper than migrating them.

**Agree these criteria with dev and PO before the first wave** — Q9 in
[`../00_Program/Open_Questions.md`](../00_Program/Open_Questions.md). Then record the agreed version in
[`../00_Program/Decision_Log.md`](../00_Program/Decision_Log.md).

## Target database

Follows the **KS-1103 go/no-go** — Postgres if go, Mongo if no-go. Every row in the inventory inherits
that dependency; do not record a target store until the decision closes.
