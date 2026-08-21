# Go / No-Go Criteria — Postgres POC

**Status:** 🔴 **Blocked on Q5.** KS owns this decision and has not yet stated what would make them say no.

**Decision owner:** KS · **Epic:** [KS-1103](https://gendvn.atlassian.net/browse/KS-1103)

---

## Why this document exists before the benchmark

**Criteria written after seeing results are not criteria.** Once the numbers are on the table it is very
easy to find a reading that supports whichever answer the room already prefers. Writing the thresholds
first is what makes the POC a test rather than a justification.

So this file gets filled in — and agreed with KS — **before** `Benchmark_Design.md` is run.

## What "no-go" actually means

Stated plainly on the epic:

> **No-go = keep Mongo, no production DB change.**

This is a real, acceptable outcome, not a failure. The POC has done its job if it produces a confident
no. Nothing in the framing should push toward go.

## Criteria

| # | Criterion | Threshold | Source |
|---|---|---|---|
| **C1** | **Result correctness** — Postgres returns the same answers as Mongo across the query set | Exact match. **Any mismatch is an automatic no-go** until explained | Gate, not negotiable |
| **C2** | Query latency improvement across the representative set | **TBD — Q5** | KS |
| **C3** | Behaviour under concurrent load | **TBD — Q5** | KS |
| **C4** | Migration cost and risk — effort across the seven path components, and the zero-downtime requirement | **TBD — Q5** | KS / PO |
| **C5** | Operational burden — on-prem Postgres to run, monitor and back up, where Mongo is already established | **TBD — Q5** | PO / dev |

**C1 is a gate.** C2–C5 are the judgement. A faster store that returns different numbers is not a
candidate.

## Questions for KS

1. **What latency improvement would justify the migration?** A number, not "noticeably faster"
2. **Is there a floor** — an improvement below which the answer is no regardless of other factors?
3. **How is migration risk weighed against performance?** If Postgres is meaningfully faster but the
   cutover carries real risk across seven components, which wins?
4. **Who owns running Postgres afterwards**, and does that change the answer?

Tracked as **Q5** in [`../00_Program/Open_Questions.md`](../00_Program/Open_Questions.md).

## Recording the decision

When KS decides, add a row to [`../00_Program/Decision_Log.md`](../00_Program/Decision_Log.md) with the
date, the decision, and a link to the results report.

**KS-1104 depends on this** — the Airflow target database is Postgres if go, Mongo if no-go. Until this
closes, any KS-1104 ticket assuming Postgres must say that it is assuming it.
