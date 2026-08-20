# KS-1075 Consolidated Report — Smoke-test the benchmark and CRBM tool group

> **Story:** [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) · **Draft ID:** AM-06 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1075 Cursor Result.md](KS-1075%20Cursor%20Result.md) (2026-08-07 ~05:59–06:01 UTC) · [KS-1075 Claude Result.md](KS-1075%20Claude%20Result.md) (2026-08-07 ~04:11 UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1075 is **Pass with findings**. Happy paths and date scoping for benchmark/CRBM series work on both clients. One explicit AC fails: name-as-`bbg_id` returns silent empty success (**NEW-11**). Omit-`fund_id` on `get_fund_crbm` is uncapped (AM-12). Inverted-date messaging matches NEW-9.

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| `search_crbm_index` → usable id | **P** MSCI World → `NDDUWI Index.USD` | **P** (14 rows) | **P** |
| `get_benchmark_history` scoped | **P** 7 monthly rows in window | **P** 7 rows in window | **P** |
| Name instead of `bbg_id` | **F** success + 0 rows | **F** success + 0 rows | **F** NEW-11 |
| `get_fund_crbm` fund 500 | **P** 4 components / 100% | **P** same weights | **P** |
| Omit `fund_id` size | **602 funds / ~196 KB** (weights off) | **602 / ~370K chars** (full weights) | Uncapped → AM-12 |
| `calculate_crbm_returns` scoped | **P** weekly dates in window | **P** | **P** |
| Inverted CRBM dates | Generic “no data” error | Same | NEW-9 |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Resolve name → `bbg_id` | **Pass** |
| History for `bbg_id` bounded range | **Pass** |
| Name where id expected → clear error | **Fail** (NEW-11) |
| `get_fund_crbm` valid fund | **Pass** |
| Omit `fund_id` measured / feed AM-12 | **Pass** (recorded; uncapped) |
| `calculate_crbm_returns` happy + inverted | Happy **Pass**; inverted Partial (NEW-9) |
| Date ranges honoured in series | **Pass** (this tool family) |
| Pass rate ≥ 80% | **Pass with findings** |

---

## Findings (merged)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **NEW-11** | Name-as-id → silent empty success on `get_benchmark_history` | **S2 High** | AM-10 |
| Unbounded omit-`fund_id` | 602 funds, no cap | Medium | AM-12 / KS-1081 |
| NEW-9 (3rd occurrence) | Inverted dates → generic “no data” | S3 Medium | AM-10 |

---

## Positive contrast (scope of date bugs)

`get_benchmark_history` and `calculate_crbm_returns` correctly scope returned series. O2-class date bugs in `fund_analyzer` / `calculate_drawdown` are **tool-specific**, not catalog-wide.

---

## Recommendation

- Close KS-1075 as **Pass with findings**.
- File NEW-11; record omit-`fund_id` for AM-12.
- Keep NEW-9 with KS-1074 for error-quality cleanup.
