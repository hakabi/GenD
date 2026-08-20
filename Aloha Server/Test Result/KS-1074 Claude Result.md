# KS-1074 Claude Result — Smoke-test the returns and performance tool group

> **Story:** [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) · **Draft ID:** AM-05 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** High · **Blocked by:** KS-1071 (unblocked)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport)
> **Executed:** 2026-08-07, ~04:09–04:10 UTC
> **Status:** **FAIL — overturns Antigravity's 100% PASS.** Antigravity posted a Jira comment (2026-08-07T04:04Z) claiming all 7 tools pass with a 100% rate. Independent re-testing finds **one apparently non-functional tool** (`intraday_fund_returns`), **one confirmed silent-empty-success violation** Antigravity's own matrix hints at but still marks Pass, **one confirmed date-scoping defect** in a new tool, and **one silent parameter-precedence override**.

---

## Verdict summary

| Tool | Happy path | Invalid/edge input | Verdict | Notes |
|---|---|---|---|---|
| `get_fund_returns` | P | **F** — invalid `fund_id` returns `status:"success"` with an empty array, not an error | **FAIL** on the "no silent empty success" AC | Inverted dates correctly **rejected** by Pydantic — this tool has the best input validation in the group |
| `get_top_funds_by_returns` | P | P (neither param → clean error, contradicting Antigravity's claimed "default 12m window") | **PASS** with a finding | Silently ignores explicit dates when `period_months` is also supplied — see NEW-6 |
| `get_bottom_funds_by_returns` | P | P | **PASS** | Disjoint from top-funds set, correctly ordered — confirmed with real data |
| `calculate_annualized_returns` | P | Partial — inverted dates return a misleading generic error, not "dates inverted" | **PASS with finding** | Empty `fund_ids` array and missing both period params both handled cleanly |
| `intraday_fund_returns` | **F** | n/a | **FAIL — likely non-functional** | Both `run_mode` values return `real_return: 0.0` for all 695 funds, zero variance — see NEW-7 |
| `calculate_drawdown` | Partial — sane shape, but ignores requested date range for the headline metric | P (invalid id); Partial (inverted dates masked) | **FAIL** on date scoping | `max_drawdown_date` from 2008 returned for a 2024–2025 request — see NEW-8 |
| `equity_beta` | P | P — malformed date **cleanly rejected** by schema pattern validation | **PASS** | Best-validated date field in the tools tested this cycle |

**Pass rate against this run's own findings: 4/7 clean, 3/7 with a confirmed defect** — below the plan's 80% bar (§11.1), which would make this ticket a **Fail**, not the **Pass** currently on Jira.

---

## Tests

### `get_fund_returns`

| Input | Result |
|---|---|
| `fund_ids=["500"]`, 2025-07-01…07-31 | `status:"success"`, 1 row, `net: 0.0137450656` — **P** |
| `fund_ids=["99999999"]`, same range | `status:"success"`, `row_count: 0`, `returns: []` — **this is a silent empty success.** Antigravity's own matrix cell reads "P (returns empty)" for this exact case, which is a direct contradiction in their own report: the AC says "No tool returns a silent empty success for invalid input," and their own note describes exactly that, yet the cell is marked P. |
| `fund_ids=["500"]`, start `2025-08-01` > end `2025-01-01` | **Rejected**: `"1 validation error for GetFundReturnsRequest\n  Value error, start_date must be on or before end_date"` — clean Pydantic validation, explicit and correct. **P.** |

### `get_top_funds_by_returns` / `get_bottom_funds_by_returns`

| Input | Result |
|---|---|
| No params at all | `{"status":"error","error":"Either period_months or both start_date and end_date must be provided"}` — clean, explicit. **This contradicts Antigravity's matrix note "Default 12m window,"** which implies calling it with nothing succeeds using an implicit default. It does not — it errors. |
| `period_months=12, top_n=5` (top) | 39 funds analyzed, 70 with data, window `2025-07-31…2026-07-31`. Top fund: `648` (Trivest, +106.5%). |
| `period_months=12, top_n=5` (bottom) | Same window and pool (39/70) — worst fund `724` (Vor Opportunities, −38.2%). **Top and bottom sets are fully disjoint** (`648,434,659,26828,745` vs `724,36540,30186,513,614`), bottom set correctly ordered worst-first. **P.** |
| `period_months=12` **and** explicit `start_date=2025-01-01, end_date=2025-12-31` together | Response window is still `2025-07-31…2026-07-31` — **the explicit dates were silently discarded** in favor of `period_months`, with no field indicating the caller's dates were ignored. See NEW-6. |

### `calculate_annualized_returns`

| Input | Result |
|---|---|
| `fund_ids=["500"]`, no period params | `{"status":"error","error":"Either period_months or both start_date and end_date must be provided"}` — **P** |
| `fund_ids=["500"]`, inverted dates | `{"status":"error","error":"No funds with valid return data found for the specified period"}` — technically an error (not a silent success), but **misleading**: the real problem is the inverted range, not missing data. A caller would reasonably conclude fund 500 has no data, which is false. |
| `fund_ids=[]`, `period_months=12` | `{"status":"error","error":"fund_ids must be provided"}` — **P**, empty array correctly rejected |

### `intraday_fund_returns` — likely non-functional

| Input | Result |
|---|---|
| `run_mode` omitted (default `direct`) | `total_funds: 695`, **every single fund's `real_return` is exactly `0.0`** |
| `run_mode="indirect"` | Same 695 funds, **still every value exactly `0.0`** |

Zero variance across 695 funds and both documented run modes is not a plausible market outcome. For comparison, `equity_beta` — a closely related tool per its own description ("Real-time fund returns via equity beta / intraday methodology") — returned 663 funds with real, varying beta values (range roughly −0.11 to 1.12, no nulls, no default-zero pattern) in the same test session. **NEW-7: `intraday_fund_returns` appears to always return a hardcoded/placeholder `0.0` regardless of `run_mode`**, contradicting Antigravity's "Renamed tool confirmed working" PASS note. Antigravity's matrix only recorded that the tool *ran without erroring* — it did not sanity-check the returned values, which is exactly what this AC's "confirmed working" bar requires.

### `calculate_drawdown`

| Input | Result |
|---|---|
| `fund_id="500"`, `2024-01-01…2025-07-31` | `total_periods: 19` (matches the ~19-month requested window), `max_drawdown: -0.5495` (negative, sane), `months_to_recover: 32` (non-negative, sane) — shape checks pass. **But** `max_drawdown_date: "2008-12-31"` and `peak_before_drawdown: "2007-12-31"` — **both far outside the requested 2024–2025 window.** |
| `fund_id="99999999"` | `{"status":"error","error":"Fund 99999999 not found"}` — **P** |
| `fund_id="500"`, inverted dates | `{"status":"error","error":"No returns data found for the specified date range"}` — same misleading-generic-error pattern as `calculate_annualized_returns` |

**NEW-8:** the tool reports `total_periods: 19`, correctly reflecting the requested window's length, yet computes `max_drawdown` from the fund's full historical record (back to the 2008 financial crisis) rather than the requested window. This is the **same class of defect as O2** (`fund_analyzer`'s date parameters not scoping the underlying computation) reproducing in a second, independent tool — evidence this is a systemic pattern in the codebase, not a one-off bug in `fund_analyzer`.

### `equity_beta`

| Input | Result |
|---|---|
| No params (as-of latest) | 663 funds, realistic varied beta values (e.g. `21`→1.014, `24`→0.757, `28`→1.123), no nulls, no zero-flood. Large (72,114 chars) but plausible content, auto-offloaded to disk by the harness for analysis. **P.** |
| `as_of_date="not-a-date"` | **Rejected before reaching the server**: `"'not-a-date' does not match '^\\d{4}-\\d{2}-\\d{2}$'"` — the schema declares a regex `pattern` on `as_of_date`, so malformed input never gets processed. **P.** |

**Root-cause note:** comparing `equity_beta`'s schema (has `"pattern": "^\\d{4}-\\d{2}-\\d{2}$"` on its date field) against `fund_analyzer`'s schema (its `start_date` has **no** `pattern` constraint, just a free-text description) explains **why** KS-1073's malformed-date defect (NEW-4) exists: **date-field validation is inconsistent across the catalog** — some tools declare a regex pattern and get free rejection of garbage input, others don't and silently accept it. This is an actionable, catalog-wide fix: audit every date parameter and add the same pattern constraint `equity_beta` already has.

---

## Cross-cutting findings (apply across KS-1074 and KS-1075 — see also that report)

| ID | Finding | Evidence | Severity |
|---|---|---|---|
| **NEW-6** | `get_top_funds_by_returns`/`get_bottom_funds_by_returns` silently prefer `period_months` over explicit `start_date`/`end_date` when both are supplied, discarding the caller's dates with no indication | This ticket, "both params" test | S3 Medium |
| **NEW-7** | `intraday_fund_returns` returns `0.0` for 100% of funds in both run modes — likely non-functional, not "confirmed working" as Antigravity's PASS states | This ticket | **S2 High** |
| **NEW-8** | `calculate_drawdown`'s headline `max_drawdown`/`peak_before_drawdown` are computed from full fund history, ignoring the requested date range, while `total_periods` correctly reflects that range — an internally inconsistent second instance of the O2 date-scoping defect class | This ticket | **S2 High** |
| **NEW-9** | Inverted date ranges produce **inconsistent error quality** across the catalog: `get_fund_returns` gives an explicit "start_date must be on or before end_date" (correct); `calculate_annualized_returns` and `calculate_drawdown` both instead say "no data found for the period" (misleading — implies the fund lacks data, not that the range is backwards). See [KS-1075 Claude Result](KS-1075%20Claude%20Result.md) for a third occurrence in `calculate_crbm_returns`. | This ticket + KS-1075 | S3 Medium |
| **NEW-10** (root cause for KS-1073's NEW-4) | Date-field schema validation is inconsistent: `equity_beta.as_of_date` has a regex `pattern` and rejects garbage; `fund_analyzer.start_date` has none and accepts anything | This ticket vs. KS-1073 | S3 Medium (process fix: audit + standardize) |
| **F — silent empty success** | Confirmed in `get_fund_returns` (invalid `fund_id` → success + empty array). A second instance is in [KS-1075](KS-1075%20Claude%20Result.md) (`get_benchmark_history` with a name instead of a `bbg_id`). | This ticket + KS-1075 | **S2 High** — directly violates an explicit AC in both tickets |

---

## Comparison with Antigravity's Jira result (comment 2026-08-07T04:04Z)

| Check | Antigravity | Claude Code (this run) |
|---|---|---|
| `get_fund_returns` invalid id | "P (returns empty)" — flagged the behavior but still passed it | **Fail** — this is exactly the silent-empty-success the AC forbids |
| `get_top_funds_by_returns` no params | "P... Default 12m window" | **Contradicted** — actually returns a clean error, no default window exists |
| `intraday_fund_returns` | "PASS... renamed tool confirmed working" | **Contradicted** — output is uniformly `0.0`, not sanity-checked by value |
| `calculate_drawdown` | "PASS... max drawdown negative, recovery non-negative" | Shape checks pass, but **date scoping is broken** — a check not in Antigravity's matrix columns |
| Both params (`period_months` + dates) | Not tested | Tested — found silent override (NEW-6) |
| Inverted-date error quality across tools | Not compared across tools | Tested — found 3-tool inconsistency (NEW-9) |

**Recommendation:** KS-1074 should be reopened. The existing Jira PASS was produced by testing that each tool *runs without crashing*, not that each tool's *output is correct* — several of the columns in Antigravity's matrix (e.g. "Invalid ID: P (returns empty)") describe defects while still recording a Pass. Suggest re-scoring against the plan's actual AC text rather than "did it respond."
