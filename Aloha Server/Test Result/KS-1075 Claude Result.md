# KS-1075 Claude Result — Smoke-test the benchmark and CRBM tool group

> **Story:** [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) · **Draft ID:** AM-06 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Medium · **Blocked by:** KS-1071 (unblocked)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport)
> **Executed:** 2026-08-07, ~04:11 UTC
> **Status:** **PASS with one confirmed S2 finding.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass. Three of four tools behave well, including correct date-range scoping (a contrast with KS-1073/KS-1074's date-scoping defects); one tool has a silent-empty-success violation matching the pattern found in KS-1074.

---

## Verdict summary

| Tool | Happy path | Edge case | Verdict |
|---|---|---|---|
| `search_crbm_index` | P (reused from KS-1072 testing — `"MSCI World"` → 14 resolvable `index_id`s) | n/a | **PASS** |
| `get_benchmark_history` | P — resolved `bbg_id`, bounded range, **correctly scoped** to the requested window | **F** — benchmark **name** instead of `bbg_id` → silent empty success, not the AC-required clear error | **PASS with finding** |
| `get_fund_crbm` | P — valid `fund_id`, clean weighted components | P (measured) — omitted `fund_id` returns **602 funds / 370,519 characters / 13,538 lines**, no server-side cap | **PASS, feeds AM-12** |
| `calculate_crbm_returns` | P — correctly scoped weekly series | Partial — inverted dates produce a misleading generic "no data" error rather than a clear rejection | **PASS with finding** |

**Smoke pass rate: 3/4 tools clean, 1 confirmed defect, 2 dates-handling notes** — comfortably above the plan's 80% bar. Recommend **Pass with findings**, not a plain Pass, given the silent-empty-success defect mirrors an S2 already found in KS-1074.

---

## Tests

### T1 — `search_crbm_index` resolves a benchmark name → `bbg_id`

Reused from KS-1072 testing (same session): `search_crbm_index(names="MSCI World")` → 14 rows from `ks_model.benchmark_model`, each with a real Bloomberg-style `index_id` (e.g. `NDDUWI Index.USD` = "MSCI World Net TR Index (USD)", `M1WO000G Index.USD` = "MSCI World Growth Net TR Index (USD)"). **Pass.**

### T2 — `get_benchmark_history` happy path, bounded range

`get_benchmark_history(benchmark_ids=["NDDUWI Index.USD"], start_date="2025-01-01", end_date="2025-07-31")`:

- 7 monthly rows returned, dated `2025-01-31` through `2025-07-31` — **every single date falls inside the requested window.** This is correctly-scoped behavior, in contrast to `fund_analyzer` (KS-1073) and `calculate_drawdown` (KS-1074), both of which ignore date bounds for their headline calculations. **Pass**, and useful evidence that date scoping is not universally broken — it depends on which underlying query path a tool uses.

### T3 — `get_benchmark_history` with a benchmark **name** instead of a `bbg_id` — new finding

`get_benchmark_history(benchmark_ids=["MSCI World"], start_date="2025-01-01", end_date="2025-07-31")`:

```json
{"status": "success", "row_count": 0, "returns": []}
```

The AC explicitly requires: *"Passing a benchmark name where a bbg_id is expected returns a clear error that names the fix."* Instead, this call returns `status: "success"` with an empty result set — **a silent empty success**, indistinguishable from "this benchmark legitimately has no data in the requested range." A caller (especially an LLM agent) has no signal to try `search_crbm_index` first. **NEW-11, Fail** against this specific AC.

This is the **second instance** of the same defect class found this session — [KS-1074](KS-1074%20Claude%20Result.md) found `get_fund_returns` doing the identical thing for an invalid `fund_id`. Two independent tools in two different tool groups share this exact anti-pattern, which suggests a shared underlying query helper (likely `DatalakeApi`) that returns an empty row set on a WHERE-clause miss without distinguishing "not found" from "nothing in range."

### T4 — `get_fund_crbm` happy path

`get_fund_crbm(fund_id="500")`:

```json
{
  "fund_id": "500", "fund_name": "Citadel Kensington Global Strategies Fund Ltd.",
  "crbm_summary": {"total_components": 4, "total_weight": 1.0, "total_weight_pct": 100.0, "is_balanced": true},
  "crbm_components": [
    {"index_id": "LEGATRUU INDEX.USD", "weight_pct": 10.0},
    {"index_id": "NDDUWI INDEX.USD", "weight_pct": 20.0},
    {"index_id": "SBMMTB3 INDEX.USD", "weight_pct": 60.0},
    {"index_id": "SPGSCI INDEX.USD", "weight_pct": 10.0}
  ],
  "fund_beta": {"beta": 0.2437626112, "last_crbm_date": "2026-07-31", "as_of_date": "2026-08-06"}
}
```

Clean, internally consistent (weights sum to exactly 100%), fund identity correct. **Pass.**

### T5 — `get_fund_crbm` with `fund_id` omitted (⚠️ AC-flagged "returns all funds")

`get_fund_crbm()` with no arguments → **602 distinct funds / 370,519 characters / 13,538 lines**, `funds_with_errors: 0` (every fund resolved cleanly). The call **succeeded outright** — no size limit, no pagination, no truncation. This is the exact "unbounded when optional filter omitted" pattern already flagged in the KS-1071 inventory baseline and required by this ticket's AC to be measured and fed to AM-12.

| Tool | Config | Size |
|---|---|---|
| `get_fund_crbm` | `fund_id` omitted, 602 funds | 370,519 chars / 13,538 lines |
| `fund_analyzer` (KS-1073, for scale comparison) | 1 fund, all slices off | 585K–638K chars |

`get_fund_crbm`'s all-funds payload is smaller than `fund_analyzer`'s single-fund payload, but it's still large, uncapped, and scales with fund-catalog growth — worth including in AM-12's "returns everything" risk set alongside `get_fee_model_defaults`, `get_liquidity_parameters`, and `ir_model` (all previously flagged with the same optional-`fund_id` pattern in the KS-1071 inventory).

### T6 — `calculate_crbm_returns` happy path, date scoping

`calculate_crbm_returns(fund_id="500", start_date="2025-01-01", end_date="2025-07-31")`:

29 weekly rows, dated `2025-01-03` through `2025-07-25` — **every date falls inside the requested window.** Benchmark component weights match `get_fund_crbm` exactly (10/20/60/10%), confirming internal consistency between the two tools. **Pass**, and a second confirmation (alongside `get_benchmark_history`) that date scoping works correctly for this tool family.

### T7 — `calculate_crbm_returns` with inverted dates

`calculate_crbm_returns(fund_id="500", start_date="2025-08-01", end_date="2025-01-01")` → `{"status":"error","error":"No benchmark returns found for the specified period"}`.

Not a silent success — it does error — but the message is **misleading** in the same way `calculate_annualized_returns` and `calculate_drawdown` were in KS-1074: it implies missing data rather than naming the actual problem (the range is backwards). **This is the third tool this session** showing the identical generic-"no data"-instead-of-"dates inverted" pattern. See NEW-9 in [KS-1074 Claude Result](KS-1074%20Claude%20Result.md) for the first two instances — this confirms it as a catalog-wide pattern, not a two-tool coincidence.

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| **NEW-11** | `get_benchmark_history` returns a silent empty success (`status: success`, 0 rows) when given a benchmark **name** instead of a `bbg_id`, instead of the AC-required clear, actionable error | **S2 High** — directly fails an explicit AC; second occurrence of the pattern found this session (see NEW in KS-1074) | AM-06 / AM-10 |
| — | `get_fund_crbm` with `fund_id` omitted returns all 602 funds, 370,519 chars, no cap | Medium | AM-06 / AM-12 |
| — (3rd occurrence of NEW-9) | `calculate_crbm_returns` inverted-date error is generic ("no data") rather than explicit ("dates inverted") | S3 Medium | AM-06 / AM-10, cross-ref KS-1074 NEW-9 |

---

## Positive findings worth preserving

Two things this ticket confirms are **working correctly**, which matters for scoping the date-scoping defect precisely rather than treating it as catalog-wide:

- `get_benchmark_history` and `calculate_crbm_returns` **both correctly scope their returned series** to the requested `start_date`/`end_date` — every single date token in both responses fell inside the requested window. This contrasts directly with `fund_analyzer` (KS-1073, O2) and `calculate_drawdown` (KS-1074, NEW-8), which both ignore the requested window for their core calculation. The O2-style defect is **tool-specific, not universal** — worth telling the dev team which code paths are affected vs. clean, so a fix doesn't get scoped wider (or narrower) than it needs to be.

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1075 — this is the first test pass on this ticket. Nothing to reconcile; findings above are net-new.
