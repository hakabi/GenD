# KS-1079 Consolidated Report — Verify that errors are structured, actionable and agent-consumable

> **Story:** [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) · **Draft ID:** AM-10 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1079 Cursor Result.md](KS-1079%20Cursor%20Result.md) · [KS-1079 Claude Result.md](KS-1079%20Claude%20Result.md) (both 2026-08-07, consolidation-only)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223  
> **Consolidated:** 2026-08-07  
> **Final status:** **FAIL**

---

## Executive verdict

KS-1079 is **FAIL** on both clients. Error catalogues from AM-05–AM-09 agree on the same defect clusters: **misleading inverted-date messages** (NEW-9), **silent empty successes** (2 tools), **raw leaks** (list_tables / describe_table / smpublic), and **O7** still present on `fund_analyzer` only. Measured Actionable+Informative rates (**Cursor ~76%**, **Claude ~73%**) both miss the **80%** bar. Recovery-candidate AC fails except for two model examples (`query_fund_manager` allowlist, `get_data` blocked-table).

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| Catalogue produced | 21 rows | 22 rows | **Done** (same core set) |
| ≥80% Actionable/Informative | **76.2%** Fail | **72.7%** Fail | **Fail** |
| Raw stack / Python / Flask leaks | NEW-16, unhashable, O10 | Same | **Fail** |
| O7 still present / isolated | Confirmed / isolated | Confirmed / isolated | **Confirmed** |
| Silent empty successes | 2 (`get_fund_returns`, `get_benchmark_history`) | Same 2 | **Confirmed** |
| Recovery candidates | Fail; 2 model positives | Fail; same 2 models | **Fail** |
| describe_table outer status | **`success` + stack in body** | error-shaped payload | Both violate no-stack AC |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Every error catalogued | **Pass** |
| Rated Actionable / Informative / Terse | **Pass** |
| ≥80% Actionable or Informative | **Fail** (~73–76%) |
| No raw SQL / stacks / paths / hosts / secrets | **Fail** (stacks + Python TypeError + Flask; SQL echo on success paths) |
| O7 dispositioned | **Pass** (still present; isolated to `fund_analyzer`) |
| Recovery candidates where expected | **Fail** |
| Silent empty success full list | **Pass** (listed — 2 tools) |

---

## Shared root-cause clusters (for AM-14)

| Cluster | Examples | Fix direction |
|---|---|---|
| Inverted date → “no data” | annualized / drawdown / CRBM returns | Validate range before query; name the problem |
| Silent empty success | fund returns invalid id; benchmark name-as-id | Distinguish not-found vs empty series |
| Raw internal leak | list_tables TypeError; describe_table Trino stack; smpublic Flask | Catch + sanitize; never return stacks |
| O7 format | fund_analyzer Resolution dict | `json.dumps` nested structure |
| Model positives | QFM allowlist; get_data rating_detail block | Replicate template catalog-wide |

---

## Recommendation

- Keep KS-1079 as **FAIL**.  
- Feed this catalogue unchanged into **KS-1083 (AM-14)** triage.  
- Two focused fixes (misleading dates + sanitize introspection/Flask errors) would likely clear the 80% bar; silent-empty + O7 + recovery templates remain separate workstreams.  
- Cite QFM / blocked-`rating_detail` messages as the target error UX standard.
