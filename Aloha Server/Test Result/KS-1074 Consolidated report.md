# KS-1074 Consolidated Report — Smoke-test the returns and performance tool group

> **Story:** [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) · **Draft ID:** AM-05 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1074 Cursor Result.md](KS-1074%20Cursor%20Result.md) (2026-08-07 ~04:45–06:01 UTC) · [KS-1074 Claude Result.md](KS-1074%20Claude%20Result.md) (2026-08-07 ~04:09–04:10 UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **FAIL**

---

## Executive verdict

KS-1074 is **FAIL** on both Cursor and Claude Code. Antigravity’s Jira 100% PASS is **ignored** (and contradicted by independent testing).

Confirmed defects: silent empty success on invalid fund id; **NEW-7** (`intraday_fund_returns` always 0.0); **NEW-8** (drawdown max DD outside requested window); plus **NEW-6** / **NEW-9** quality issues.

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| `get_fund_returns` happy path | **P** (12 rows 2024) | **P** | **P** |
| Invalid fund id → silent empty | **F** success + 0 rows | **F** | **F** confirmed |
| Inverted dates (`get_fund_returns`) | **P** Pydantic | **P** Pydantic | **P** |
| Top/bottom neither period param | Clear error | Clear error | **P** (no default 12m) |
| Top vs bottom disjoint / ordered | **P** | **P** | **P** |
| Both `period_months` + dates | Dates discarded | Dates discarded | **F** NEW-6 |
| Annualized happy / neither param | **P** / **P** | **P** / **P** | **P** |
| Annualized inverted message | Generic “no data” | Generic “no data” | NEW-9 |
| `intraday_fund_returns` values | **F** 695×0.0 both modes | **F** 695×0.0 both modes | **F** NEW-7 |
| `calculate_drawdown` shape | DD negative, recovery ≥0 | Same | Shape **P** |
| Drawdown date scoping | **F** max DD in 2008 for 2024–25 request | **F** same | **F** NEW-8 |
| Invalid drawdown fund | Clear not-found | Clear not-found | **P** |
| `equity_beta` | **P** varied betas | **P** varied betas | **P** |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Happy path each tool | **Fail** overall — intraday non-functional; drawdown scope broken |
| Invalid input not silent empty | **Fail** — `get_fund_returns` |
| Unbounded overflow | **Pass** for this group (bounded / large-but-plausible) |
| Conditional period_months / dates | **Pass** when neither; **Fail** silent precedence when both (NEW-6) |
| Top/bottom disjoint + ordered | **Pass** |
| `intraday_fund_returns` working (rename noted) | **Fail** NEW-7 (rename present; values unusable) |
| Drawdown sanity (sign / recovery) | Shape **Pass**; date scope **Fail** NEW-8 |
| Pass rate ≥ 80% | **Fail** |

---

## Findings (merged; ignore Antigravity)

| ID | Finding | Severity |
|---|---|---|
| Silent empty success | Invalid `fund_id` on `get_fund_returns` | **S2 High** |
| **NEW-7** | `intraday_fund_returns` always `0.0` | **S2 High** |
| **NEW-8** | Drawdown headline metrics ignore requested date window | **S2 High** |
| **NEW-6** | `period_months` silently overrides explicit dates | S3 Medium |
| **NEW-9** | Inverted-date error quality inconsistent | S3 Medium |
| **NEW-10** | Date schema `pattern` inconsistent across catalog | S3 Medium |

---

## Recommendation

- Keep KS-1074 as **FAIL**.
- Retest after NEW-7, NEW-8, and silent-empty fixes.
- Feed NEW-6/9/10 to KS-1079 (AM-10) / KS-1083 (AM-14).
- Do not rely on Antigravity’s PASS comment.
