# Dual-Run Validation — Digdag vs Airflow

**How a migrated workflow is proved equivalent before Digdag is switched off for it.**

**Status:** 🟡 Skeleton — stage 2 scope is blocked on **Q11**.
**Owner:** dev (stage 1) · QA (stage 2) · **Epic:** [KS-1104](https://gendvn.atlassian.net/browse/KS-1104)

---

## The rule

**Both systems run on the same schedule. Digdag is disabled one workflow at a time**, only after that
workflow has passed both validation stages. Never a batch cutover.

```
Digdag  ──┐
          ├─► same schedule ─► compare ─► pass ─► disable Digdag for THIS workflow only
Airflow ──┘                              fail ─► fix, keep both running
```

## Two stages, two owners

### Stage 1 — engineer, row-count comparison on a test DB clone

| | |
|---|---|
| **Who** | dev |
| **Where** | A **test DB clone** — not production |
| **What** | Row counts between the Digdag output and the Airflow output |
| **Passes when** | Counts match |

> **Row counts are a necessary check, not a sufficient one.** The same number of rows can carry different
> values — a mapping error that preserves cardinality passes this stage untouched. That is exactly what
> stage 2 exists to catch, which is why neither stage is optional.

### Stage 2 — QA, validation on the UI

| | |
|---|---|
| **Who** | QA |
| **Where** | **Aloha + Workbench UI** |
| **What** | That the data as *presented* is unchanged |
| **Passes when** | ⚠️ **Q11 — not yet defined.** Which screens, and what counts as a match? |

**Q11 must be answered before the first wave.** "Validate on the UI" is not a testable instruction: with
hundreds of workflows and a dozen screens, QA needs to know which screens map to which workflow, and
whether a match means identical figures or figures within a tolerance.

Tracked in [`../00_Program/Open_Questions.md`](../00_Program/Open_Questions.md).

## What to record per workflow

| Field | Note |
|---|---|
| Workflow | From [`Workflow_Inventory.md`](./Workflow_Inventory.md) |
| Dual-run start | The date both began running |
| Runs compared | One matching run is not evidence. Enough to cover the schedule's variation |
| Stage 1 result | Row counts, both sides |
| Stage 2 result | Screens checked, QA verdict |
| Discrepancies | What differed, and whether it was explained or fixed |
| Digdag disabled | Date — the point of no return for this workflow |

## Questions this design still has to answer

1. **How many runs** before a workflow is trusted? One clean run proves little for a workflow with
   monthly variation
2. **What tolerance**, if any? Is an exact match required, or are float/timing differences acceptable?
3. **What happens on a discrepancy** — pause the migration, or fix and re-run?
4. **Who authorises** disabling Digdag for a workflow — dev, PO, or QA sign-off?
5. **How is it reversed** if a problem appears after Digdag is off?

Question 5 matters most and is easiest to skip. **A dual-run migration with no rollback path is a
one-way door** — the whole point of running both systems is that the old one is still there. Write down
how to go back before the first workflow is switched off.
