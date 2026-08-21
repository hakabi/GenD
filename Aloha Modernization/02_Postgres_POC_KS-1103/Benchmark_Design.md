# Benchmark Design — Postgres vs MongoDB

**Status:** 🟡 **Skeleton.** Cannot be finalised until **Q5** (go/no-go thresholds) is answered by KS —
see [`../00_Program/Open_Questions.md`](../00_Program/Open_Questions.md).

**Owner:** BA + dev · **Epic:** [KS-1103](https://gendvn.atlassian.net/browse/KS-1103)

> **Read [`Prior_Art.md`](./Prior_Art.md) §1 and §4 first.** The current schema is already documented in
> KAM, and there is prior benchmarking practice — [SQL benchmark history
> insert](https://gendvn.atlassian.net/wiki/spaces/KAM/pages/220856379). Reusing an established method
> makes these results comparable with earlier ones. Designing a fresh method throws that away.

---

## 1. What is being compared

**Not** "Postgres vs Mongo" in general. Specifically: **the same Trino queries, against the same data,
through two different connectors.**

```
Aloha  →  Trino  →  [ Mongo connector ]   ← current
                    [ Postgres connector ] ← candidate
```

Trino is constant. The adapter is the variable. Any measurement that does not hold Trino constant is
measuring the wrong thing.

## 2. Dataset

| | |
|---|---|
| **For measurement** | Full **5–10 GB backup**. The epic is explicit — a subset does not produce a fair comparison |
| **For demo** | A small subset is acceptable |
| **Never** | Real production. The POC does not touch it |

## 3. What to measure

*To be completed with dev. Candidates, pending Q5:*

| Metric | Why it might matter | Threshold |
|---|---|---|
| Query latency, p50 / p95 / p99 | The user-visible number | **TBD — Q5** |
| Throughput under concurrent load | Whether it holds up with real usage | **TBD — Q5** |
| Cold vs warm cache behaviour | Mongo and Postgres differ here; a warm-only test flatters one of them | **TBD — Q5** |
| Load/ingest time | Bears on the migration window, not on steady-state performance | **TBD — Q5** |
| Result correctness | **Not a performance metric — a gate.** Different results means the comparison is void | Exact match |

## 4. Query set

Draw from **real Aloha workloads**, not synthetic queries. Sources: the screens in KS-1102's navigation
(At a Glance KPIs, Risk, Allocation, Cash Forecast, Top/Bottom Funds, Public/Private Funds) and the
models. Each has a query profile behind it.

*To be enumerated with dev.*

## 5. Method

1. Restore the same backup into both stores
2. **Verify result equivalence first.** If the two return different answers, performance is irrelevant
3. Run the query set against each, alternating to spread environmental noise
4. Record raw numbers, not just summaries — a p99 without the distribution hides the interesting cases
5. Repeat enough times to distinguish a real difference from run-to-run variance

## 6. What would falsify the hypothesis

**This section is the point of the document, and it is blocked on Q5.**

The hypothesis is *"PostgreSQL outperforms MongoDB for Aloha query workloads."* Before running anything,
write down the result that would make KS say **no**. A benchmark whose outcome cannot be negative is not a
benchmark.

## 7. Output

A dated report in this folder — `YYYY-MM-DD_Benchmark_Results.md` — carrying the raw numbers, the method
actually run (not the one planned, where they differ), and a recommendation against
[`Go_NoGo_Criteria.md`](./Go_NoGo_Criteria.md).

The **decision** goes in [`../00_Program/Decision_Log.md`](../00_Program/Decision_Log.md). The report is
evidence; the log is the record.
