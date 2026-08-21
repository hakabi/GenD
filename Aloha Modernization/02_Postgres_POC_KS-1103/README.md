# 2. Postgres POC — KS-1103

**MongoDB → PostgreSQL, via Trino.** Prove whether Postgres outperforms Mongo for Aloha query workloads.
**KS decides go/no-go.**

**Epic:** [KS-1103](https://gendvn.atlassian.net/browse/KS-1103) · **Status:** To Do · **Runs after** KS-1102

---

## The deliverable is a decision, not a migration

This is the thing to keep hold of. **No-go means Mongo stays and production changes nothing.** Every
story under this epic should contribute evidence toward the go/no-go. A story that does not is out of
scope.

Acceptance criteria here name a **dataset, a measurement and a threshold** — never "performs better".

## What is here

| File | What it is |
|---|---|
| [`Prior_Art.md`](./Prior_Art.md) | ⭐ **Read first.** Existing KAM pages on database structure, Trino deployment and prior benchmarking. Do not re-document them |
| [`Benchmark_Design.md`](./Benchmark_Design.md) | What is measured, on what data, against what threshold |
| [`Go_NoGo_Criteria.md`](./Go_NoGo_Criteria.md) | What result means go, and what result means no |

## Constraints that shape every ticket

- **Trino stays.** Only the adapter/connector changes. How Trino is deployed today is a constraint, not a
  variable — see [`Prior_Art.md`](./Prior_Art.md) §2
- **Mongo remains source of truth** unless and until KS says go
- **On-prem Postgres**, on the deployment server
- **Full 5–10 GB backup** for a fair comparison. A small subset is for demo only
- **No real production interaction during the POC**
- **Zero downtime** if migration proceeds
- **Frontend impact is API-contract only** — separate from the UI rewrite

## Components on the migration path (go only)

Data loader · Elasticsearch · backend · frontend (contract) · data uploader · compute-server · query
engine.

## Blocking question

**Q5 — what result would make KS say no?** Without a falsification condition the POC cannot conclude, and
a benchmark with no threshold produces a number nobody can act on. Tracked in
[`../00_Program/Open_Questions.md`](../00_Program/Open_Questions.md).

Get this answered **before** `Benchmark_Design.md` is finalised.
