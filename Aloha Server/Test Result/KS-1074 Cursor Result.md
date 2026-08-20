# KS-1074 Cursor Result — Smoke-test the returns and performance tool group

> **Story:** [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) · **Draft ID:** AM-05 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~04:45–06:01 UTC  
> **Status:** **FAIL**

---

## Verdict summary

| Tool | Happy path | Invalid / edge | Verdict | Notes |
|---|---|---|---|---|
| `get_fund_returns` | **P** — fund 500, 2024-01–12, 12 monthly rows | **F** invalid id → silent empty success; **P** inverted dates → Pydantic reject | **FAIL** (silent empty) | Best inverted-date validation in group |
| `get_top_funds_by_returns` | **P** — top_n=5, period_months=12 | **P** neither param → clear error; **F** both period+dates → dates silently discarded | **PASS with finding** | NEW-6 |
| `get_bottom_funds_by_returns` | **P** — bottom_n=5 same window | Disjoint vs top confirmed | **PASS** | Top `{648,434,659,26828,745}` vs bottom `{724,36540,30186,513,614}` |
| `calculate_annualized_returns` | **P** — fund 500 → 18.595273 | **P** neither period; Partial inverted → generic “no data” | **PASS with finding** | NEW-9 |
| `intraday_fund_returns` | **F** — 695 funds, all `real_return=0.0` (direct + indirect) | n/a | **FAIL** | NEW-7; renamed tool present but not functional |
| `calculate_drawdown` | Partial — shape OK; **F** max DD dates outside window | **P** invalid id; Partial inverted generic error | **FAIL** | NEW-8 (O2-class) |
| `equity_beta` | **P** — 663 betas, range ≈ −0.11…1.64 | Schema pattern rejects bad dates (not re-hit this run; schema verified) | **PASS** | Contrast vs zero-flood intraday |

**Pass rate:** 4/7 tools clean enough for Pass; **3/7 with confirmed defects** → below 80% bar → **FAIL**. Antigravity’s Jira 100% PASS is overturned (ignored for consolidation).

---

## Matrix (Cursor)

| Tool | Happy path | Invalid id | Wrong type | Empty/null | Inverted dates | Large result | Notes |
|---|---|---|---|---|---|---|---|
| `get_fund_returns` | P | **F** (success, 0 rows) | n/a | n/a | **P** (Pydantic) | P (12 rows) | Silent empty success |
| `get_top_funds_by_returns` | P | n/a | n/a | **P** (neither → error) | n/a | P (bounded top_n) | Both params → NEW-6 |
| `get_bottom_funds_by_returns` | P | n/a | n/a | n/a | n/a | P | Disjoint + ordered |
| `calculate_annualized_returns` | P | n/a | n/a | **P** (neither → error) | Partial (generic error) | P | NEW-9 |
| `intraday_fund_returns` | **F** | n/a | n/a | n/a | n/a | P size / **F** values | NEW-7 |
| `calculate_drawdown` | **F** (scope) | **P** | n/a | n/a | Partial | P | NEW-8 |
| `equity_beta` | P | n/a | n/a | n/a | n/a | Large but plausible | Working |

---

## Tests

### `get_fund_returns`
| Input | Result |
|---|---|
| `fund_ids=["500"]`, 2024-01-01…2024-12-31 | success, `row_count: 12`, all dates in 2024 — **P** |
| `fund_ids=["99999999"]`, same range | `status:"success"`, `row_count:0`, `returns:[]` — **F** silent empty |
| start `2024-12-31` > end `2024-01-01` | Pydantic: `start_date must be on or before end_date` — **P** |

### Top / bottom + period params
| Input | Result |
|---|---|
| No params on top | `Either period_months or both start_date and end_date must be provided` — **P** (contradicts Antigravity “default 12m”) |
| `period_months=12, top_n=5` | Window `2025-07-31…2026-07-31`; top: 648 (+106.5%) … — **P** |
| Same + explicit `start_date=2025-01-01, end_date=2025-12-31` | Still `2025-07-31…2026-07-31` — dates **silently ignored** — **NEW-6** |
| Bottom `period_months=12, top_n=5` | Worst 724 (−38.2%); **disjoint** from top set, worst-first — **P** |

### `calculate_annualized_returns`
| Input | Result |
|---|---|
| `fund_ids=["500"], period_months=12` | annualized **18.595273**, 12 months — **P** |
| `fund_ids=["500"]` only | clear period-required error — **P** |
| inverted dates | `No funds with valid return data…` — error but misleading — **NEW-9** |

### `intraday_fund_returns` (NEW-7)
| Input | Result |
|---|---|
| `run_mode=direct` | `total_funds: 695`, **695/695 `real_return=0.0`** — **F** |
| `run_mode=indirect` | same 695, **all 0.0** — **F** |

Evidence: `logs/KS-1074_intraday_direct.txt`, `logs/KS-1074_intraday_indirect.txt`. Rename from `fund_returns` confirmed in schema description; tool is **not** “working” by value.

### `calculate_drawdown` (NEW-8)
| Input | Result |
|---|---|
| fund 500, 2024-01-01…2025-07-31 | `total_periods: 19` (matches window); `max_drawdown: -0.5495` (negative OK); `months_to_recover: 32` (≥0 OK); but `max_drawdown_date: 2008-12-31`, `peak_before_drawdown: 2007-12-31` — **outside** requested range — **F** |
| fund `99999999` | `Fund 99999999 not found` — **P** |
| inverted dates | `No returns data found for the specified date range` — NEW-9 pattern |

### `equity_beta`
| Input | Result |
|---|---|
| `as_of_date=2026-07-31` | 663 betas, min≈−0.11, max≈1.64, not all-zero — **P** |

Evidence: `logs/KS-1074_equity_beta.txt`.

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| Silent empty (`get_fund_returns` invalid id) | AC violation | **S2 High** |
| **NEW-7** | `intraday_fund_returns` always 0.0 | **S2 High** |
| **NEW-8** | Drawdown headline metrics ignore requested date window (O2-class) | **S2 High** |
| **NEW-6** | `period_months` silently overrides explicit dates | S3 Medium |
| **NEW-9** | Inverted-date errors inconsistent / misleading | S3 Medium |

---

## Recommendation

Mark KS-1074 **FAIL**. Do not accept Antigravity’s 100% PASS. Fix NEW-7, NEW-8, and silent-empty before retest; carry NEW-6/NEW-9 to AM-10 / AM-14.
