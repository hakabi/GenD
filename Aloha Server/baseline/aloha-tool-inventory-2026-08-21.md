# Aloha MCP — Tool Inventory Baseline

> **Story:** [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Captured:** 2026-08-21 (UTC) — 2nd test cycle
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)
> **Client:** Claude Code CLI 2.1.228 via the `claude.ai conceptia-aloha` connector
> **Server:** `health_check` → build **0.9.7**, status healthy
> **Method:** Live schema capture of every advertised tool + functional spot-checks. No write tools invoked.
> **Prior baselines:** `aloha-tool-inventory-2026-08-06.md` (34, canonical) · `aloha-tool-inventory-2026-08-11.md` (full descriptions, R1–R11)

R = read · C = compute/derive · W = write

---

## 1. Headline

| Metric | 2026-08-06 (0.9.5) | **2026-08-21 (0.9.7)** | Delta |
|---|---|---|---|
| Tool count | 34 | **35** | **+1** |
| Read | 25 | **26** | +1 |
| Compute | 9 | **9** | 0 |
| **Write-capable** | 0 found | **0 found** | 0 |
| Duplicate alias pairs | 3 | **3** | 0 |
| Tools with no required params | 13 | **13** | 0 |

**Delta, tool-by-tool:** `get_cambridge_benchmarks` **added**. Nothing removed. No rename, no signature change on any pre-existing tool.

---

## 2. Full inventory (35)

### Fund search & resolution (5)

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 1 | `Search_Funds` | R | `search_term` | — |
| 2 | `search_funds` | R | `search_term` | — · *alias of #1* |
| 3 | `search_all_funds` | R | `search_term` | — |
| 4 | `search_albourne_funds` | R | `search_term` | — |
| 5 | `search_crbm_index` | R | `names` | `limit`, `match_mode`, `split_commas` |

### Bundled analysis (2)

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 6 | `fund_analyzer` | C | `start_date` | 18 params — `fund_id`, `search_term`, `end_date`, `custom_start_date_1/2`, `custom_end_date_1/2`, `include_*` ×7, `fee_model_calculation_type`, `fee_model_periods`, `crbm_frequency`, `gate` |
| 7 | `smpublic_main_v3` | C | *(none)* | *(none)* — **zero-parameter (O10)** |

### Returns & performance (7)

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 8 | `get_fund_returns` | R | `fund_ids`, `start_date`, `end_date` | — |
| 9 | `calculate_annualized_returns` | C | `fund_ids` | `start_date`, `end_date`, `period_months`, `return_type` |
| 10 | `calculate_drawdown` | C | `fund_id` | `start_date`, `end_date`, `return_type`, `include_drawdown_graph`, `include_drawdown_table`, `include_performance_returns` |
| 11 | `get_top_funds_by_returns` | R | *(none)* | `start_date`, `end_date`, `period_months`, `return_type`, `top_n` |
| 12 | `get_bottom_funds_by_returns` | R | *(none)* | same as #11 |
| 13 | `intraday_fund_returns` | R | *(none)* | `run_mode` |
| 14 | `equity_beta` | C | *(none)* | `as_of_date` |

### Benchmarks & CRBM (4) — *was 3*

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 15 | `get_benchmark_history` | R | `benchmark_ids`, `start_date`, `end_date` | `frequency`, `long_format` |
| 16 | `get_fund_crbm` | R | *(none)* | `fund_id`, `include_benchmark_info`, `include_weights` |
| 17 | `calculate_crbm_returns` | C | `fund_id`, `start_date`, `end_date` | `frequency` |
| 18 | **`get_cambridge_benchmarks`** | R | `asset_class`, `geography` | `as_of_date`, `limit`, `use_nearest` — **NEW in 0.9.7; see §6** |

### Fees, IR, liquidity (6)

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 19 | `fee_model` | C | **15 required** — `fund_id`, `benchmark`, `translation`, `mgt_fee`, `mgt_fee_freq`, `perf_fee`, `hwm_status`, `hurdle_status`, `ramp_type`, `hurdle_fixed`, `hurdle_type`, `perf_return`, `catch_up`, `catch_up_perc_soft`, `crystialized_paid` | `calculation_type`, `dates`, `returns`, `periods`, `start_date`, `end_date` |
| 20 | `get_fee_model_defaults` | R | *(none)* | `fund_id` |
| 21 | `ir_model` | C | *(none)* | `fund_ids`, `force_implementation` |
| 22 | `calculate_liquidity_cost` | C | `fund_id` | `gate`, `lockup_months`, `redemption_freq_months`, `side_pocket_max_pct`, `side_pocket_prob`, `inception_date`, `asset_category`, `fund_liquidity_type`, `source` |
| 23 | `get_liquidity_parameters` | R | *(none)* | `fund_id` |
| 24 | `query_fund_manager` | R | `fields` | `asset_class_0`, `asset_class_1`, `fund_ids`, `extra_where`, `limit` |

### Ratings (5)

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 25 | `get_rating_details` | R | `id` | `source`, `type`, **`user`** |
| 26 | `rating_detail` | R | `id` | `source`, `type`, **`user`** · *alias of #25* |
| 27 | `get_rating_summary` | R | `id` | `source`, `type` — *no `user`* |
| 28 | `rating_summary` | R | `id` | `source`, `type` · *alias of #27* |
| 29 | `list_rating_details_by_user` | R | *(none)* | `limit`, `source`, **`user`** |

### Datalake / schema introspection (6)

| # | Tool | R/C/W | Required | Optional |
|---|---|:--:|---|---|
| 30 | `show_schemas` | R | *(none)* | `catalog` |
| 31 | `list_tables` | R | `db_name` | — |
| 32 | `describe_table` | R | `db_name`, `table_name` | — |
| 33 | `get_data` | R | `db_name`, `table_name` | `filter_cond` |
| 34 | `get_user_info` | R | *(none)* | — |
| 35 | `health_check` | R | *(none)* | — |

---

## 3. Write capability

**0 write-capable tools found** — unchanged.

Same caveat as the first cycle, and it still has not been discharged: this rests on **schema and description analysis**, not behavioural proof. Nothing mutating was attempted, correctly, since the cycle authorises read-only use. Plan §9 Q2 asked the service owners to confirm independently and **remains unanswered in writing**.

`get_data` rejects `;`, SQL comments, `UNION` and DDL/DML keywords; `query_fund_manager.extra_where` is "validated like `get_data` `filter_cond`". Both are read-path SQL surfaces whose validators are asserted but untested.

---

## 4. Duplicates (O5) — all three pairs still present

| Pair | Schema | Description |
|---|---|---|
| `search_funds` ≡ `Search_Funds` | Identical | Differs — #2 reads "Alias for Search_Funds" |
| `rating_detail` ≡ `get_rating_details` | Identical | Differs — "Same as get_rating_details" |
| `rating_summary` ≡ `get_rating_summary` | Identical | Differs — "Same as get_rating_summary" |

Live re-confirmed 2026-08-21: `search_funds("Citadel Kensington Global Strategies")` and `Search_Funds(...)` both return `fund_id: "500"`, source `solovis`, count 1 — byte-identical payloads.

---

## 5. Tools with no required parameters (13) — unchanged

`smpublic_main_v3` · `get_top_funds_by_returns` · `get_bottom_funds_by_returns` · `intraday_fund_returns` · `equity_beta` · `get_fund_crbm` · `get_fee_model_defaults` · `ir_model` · `get_liquidity_parameters` · `list_rating_details_by_user` · `show_schemas` · `get_user_info` · `health_check`

Of these, the ones that return an **all-funds** result when called bare: `get_top_funds_by_returns`, `get_bottom_funds_by_returns`, `get_fund_crbm`, `get_fee_model_defaults`, `ir_model`, `get_liquidity_parameters`, `list_rating_details_by_user`.

`get_cambridge_benchmarks` does not join this list — it requires two params — but see §6: its `limit` is inert, so it belongs to the same **unbounded-response** risk class as [KS-1093](https://gendvn.atlassian.net/browse/KS-1093).

---

## 6. `get_cambridge_benchmarks` — the one new tool, and it is not safely usable

Three defects, all reproduced live on 2026-08-21.

| ID | Defect | Evidence |
|---|---|---|
| **CB-1** | `as_of_date` is documented optional — *"Without as_of_date, returns matching rows capped by limit"* — but omitting it raises. Response: `{"status":"error","error":"'as_of_date'"}` — a bare Python `KeyError` repr, not a usable message | Reproduced with both an invalid and a valid `asset_class`/`geography` pair |
| **CB-2** | `asset_class` and `geography` are required **exact-match** strings with **no discovery path** anywhere in the catalog. Wrong values return `status: success`, `row_count: 0` — a silent empty result indistinguishable from "no data for that period" | `asset_class: "Private Equity"` → 0 rows, success. Real values are `Buyout`, `Energy`, `Growth Equity`; geographies include `United States`, `U.S.-North America-Developed`, `Global`, `U.S. Cross-Region`, `Europe`, `Asia/Pacific` — recoverable only by querying `ks_model.cambridge_benchmark` directly |
| **CB-3** | `limit` is **silently ignored** on the `as_of_date` path — the only path that works. There is therefore no way to bound the response | `limit: 2` with `asset_class: "Buyout"`, `geography: "United States"`, `as_of_date: "2022-09-30"` returned **`row_count: 550`, 1.1 MB** |

Net effect: the documented bounded call fails, and the working call is unbounded.

---

## 7. `get_data` — response cap flag misreports

`get_data(ks_model, cambridge_benchmark, filter_cond="vintage_year = 2020 AND irr_median_lp_pct IS NOT NULL")` returned:

```
"row_limit": 1000, "row_count": 1000, "truncated": false
```

with a **2.0 MB** payload. The row cap is enforced (SQL wraps `LIMIT 1000`), but `truncated: false` is reported on a page where `row_count == row_limit` exactly, and where the returned page spans only 3 asset classes and 10 geographies of a visibly wider set. Either the flag is wrong or the match set is exactly 1000 — the vocabulary spread makes the former overwhelmingly likely. An agent reading `truncated: false` concludes it holds the complete result.

Separately: the cap is on **rows, not payload size**. 1000 rows × 48 columns = 2 MB in one MCP response.

---

## 8. Behavioural rules R1–R11 — all still present, all still untested

Re-verified against 0.9.7 descriptions on 2026-08-21. Every rule captured on 2026-08-11 is still in force and still has **no test case** in KS-1070…KS-1084.

R1 top/bottom silent no-gap exclusion · R2 `include_liquidity_cost: false` switches V3→V2 · R3 mixed sleeves rejected · R4 `force_implementation: private` still needs `fund_ids` · R5 `fee_model.periods` documented non-functional · R6 `benchmark` dual-mode · R7 **contradictory `gate` defaults** between `calculate_liquidity_cost` (1.0) and `fund_analyzer` (Solovis `investor_gate_pct`) · R8 `custom_start_date` month-end exclusivity · R9 `end_date` default · R10 `filter_cond` 2048-char limit + `rating_detail` blocked · R11 `split_commas` default true

**New in 0.9.7 — R12:** `get_cambridge_benchmarks.use_nearest` defaults **true**, silently substituting the nearest prior as-of date. Same silent-substitution class as R1 and R11. No test case.

---

## 9. Identity (O4) — unchanged

`get_user_info` → `{"success": false, "error": "No user email found in request headers."}` on 0.9.7.

This matters more here than it looks. `get_rating_details`, `rating_detail` and `list_rating_details_by_user` resolve their user as: explicit **`user` parameter** → `X-User-Email` header → `MCP_DEFAULT_USER_EMAIL`. With the header absent (O4), every caller falls back to a **single server-configured identity**, and any caller may override scope by passing `user` outright. Documented since 2026-08-11; **never tested** — [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) was blocked on the second QA account.

---

## 10. Capture method and limits

Captured from **one** client (Claude Code CLI 2.1.228 via the claude.ai connector). The per-client cross-check that [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) AC5 requires is **not satisfied by this file alone** — a second client dump is needed. See the accompanying result report for the open discrepancy with the 2026-08-20 Cursor dump.
