# Aloha MCP — Tool Inventory Baseline (full descriptions)

> **Epic:** KS-1066 · **Supersedes:** `aloha-tool-inventory-2026-08-06.md` (names only, descriptions truncated at ~100 chars)
> **Captured:** 2026-08-11 18:38–18:47 UTC (2026-08-12 local)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)
> **Client:** Claude Code, native HTTP transport, Microsoft OAuth session
> **Server:** `health_check` → build `0.9.5`, healthy, uptime 1,592,230 s ≈ 18.4 days
> **Method:** Live JSON Schema capture via `tools/list`. **No tool descriptions or parameter descriptions truncated.** No write tools invoked; no tool called during capture.

---

## 1. Why this file exists

The 2026-08-05 and 2026-08-06 baselines record **tool names and parameter names only**. Parameter *descriptions* were never captured, and tool descriptions were truncated at ~100 characters with `…`.

That made those files usable as a drift baseline for the **shape** of the catalog, but not for its **documented semantics** — a server-side wording change (e.g. "all public-sleeve funds" → "all funds") would pass unnoticed, and several hard behavioural rules were invisible. §4 lists eleven such rules recovered by this capture; at least four are materially testable and have no test case in any KS-1070…KS-1084 ticket.

| Metric | 2026-08-05 | 2026-08-06 | 2026-08-11 | Delta |
|---|---|---|---|---|
| Tool count | 34 | 34 | **34** | **+0** |
| Write-capable tools | 0 | 0 | **0** | — |
| Tool descriptions captured in full | No | No | **Yes** | — |
| Parameter descriptions captured | No | No | **Yes (88 optional + 30 required)** | — |

Tool names are **byte-identical** to the 2026-08-06 capture. No additions, removals or renames.

---

## 2. Conventions

`R` = read · `C` = compute/derive · `W` = write · **req** = required · *(opt)* = optional

All description text below is **verbatim from the server**. Typos (e.g. `crystialized_paid`) are reproduced as-is.

---

## 3. Full inventory

### 3.1 Fund search & resolution (5)

#### 1. `Search_Funds` — R
> Search Funds - Same Elasticsearch indexes as search_all_funds; returns only fund_id, fund_name, and source per match

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `search_term` | **req** | string | — | Search term to match against fund names (required) |

#### 2. `search_funds` — R
> Alias for Search_Funds - returns only fund_id, fund_name, and source per match

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `search_term` | **req** | string | — | Search term to match against fund names (required) |

#### 3. `search_all_funds` — R
> Search All Funds - Elasticsearch across Albourne, Solovis, Alt Evest, and Evest indexes

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `search_term` | **req** | string | — | Search term to match against fund names (required) |

#### 4. `search_albourne_funds` — R
> Search Albourne Funds - Elasticsearch Albourne (ALB) index only

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `search_term` | **req** | string | — | Search term to match against fund names (required) |

#### 5. `search_crbm_index` — R
> Resolve a benchmark / index name to its identifier. Substring search over ks_model.benchmark_model across name, short_name, bbg_id, category, region (DatalakeApi.search_benchmark_model). Use this FIRST when the user references a benchmark by name (e.g. 'S&P 500', 'MSCI World') — the returned bbg_id is the value to pass as benchmark_ids to get_benchmark_history. names: string or list of strings; match_mode any|all; optional comma-split for strings.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `names` | **req** | string \| array | — | Single search string or array of phrases (OR with match_mode any, AND with all). |
| `limit` | *(opt)* | integer | 500 | Max rows (1–5000, default 500). |
| `match_mode` | *(opt)* | enum `any`\|`all` | `any` | any = OR across multiple names; all = AND. |
| `split_commas` | *(opt)* | boolean | true | When names is a string, split on commas into separate phrases. |

---

### 3.2 Bundled analysis (2)

#### 6. `fund_analyzer` — C
> Bundled fund analysis: smpublic_dashboard (SmpublicBuilder) plus optional slices — ir_model, fund_returns, fee_model, crbm_details, crbm_returns, drawdown_analysis, liquidity_cost (include_* default true). load_data V3 and liquidity slice unless include_liquidity_cost is false.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `start_date` | **req** | string | — | Start date for analysis period (YYYY-MM-DD format, required) |
| `fund_id` | *(opt)* | string | — | Fund identifier when known (Solovis / internal id). Optional if search_term is provided. |
| `search_term` | *(opt)* | string | — | Search Aloha Elasticsearch first to resolve fund_id (preferred for fund names). At least one of fund_id or search_term is required. |
| `end_date` | *(opt)* | string | — | End date anchor (YYYY-MM-DD, EOM applied). If omitted, month-end of latest Solovis return for the fund. |
| `custom_start_date_1` | *(opt)* | string | trailing 60 m | Optional dashboard custom period 1 start (YYYY-MM-DD). Month-end = exclusive (next month first); non-month-end includes that month's EOM. Default: true trailing 60 months to end_date. |
| `custom_end_date_1` | *(opt)* | string | `end_date` | Optional dashboard custom period 1 end (YYYY-MM-DD, EOM inclusive). Default: end_date. |
| `custom_start_date_2` | *(opt)* | string | trailing 12 m | Optional dashboard custom period 2 start (YYYY-MM-DD). Same start rules as custom_start_date_1. Default: true trailing 12 months to end_date. |
| `custom_end_date_2` | *(opt)* | string | `end_date` | Optional dashboard custom period 2 end (YYYY-MM-DD, EOM inclusive). Default: end_date. |
| `include_ir_model` | *(opt)* | boolean | true | If true, also return components.ir_model from get_projected_ir (default: true) |
| `include_fund_returns` | *(opt)* | boolean | true | If true, include components.fund_returns (default: true) |
| `include_fee_model` | *(opt)* | boolean | true | If true, include components.fee_model (default: true) |
| `include_liquidity_cost` | *(opt)* | boolean | true | If true, load_data V3 and components.liquidity_cost (calculate_liquidity_cost). Default true; **set false for V2 and no liquidity slice.** |
| `include_crbm_details` | *(opt)* | boolean | true | If true, include components.crbm_details (default: true) |
| `include_crbm_returns` | *(opt)* | boolean | true | If true, also attach components.crbm_returns (default: true) |
| `include_drawdown_analysis` | *(opt)* | boolean | true | If true, include components.drawdown_analysis (calculate_drawdown) (default: true) |
| `fee_model_calculation_type` | *(opt)* | string | `net_to_gross` | Fee model slice calculation type (default: 'net_to_gross') |
| `fee_model_periods` | *(opt)* | integer | 60 | Max trailing periods for fee_model slice (default: 60) |
| `crbm_frequency` | *(opt)* | string | `W` | CRBM returns frequency (D=Daily, W=Weekly, M=Monthly, default: W) |
| `gate` | *(opt)* | number | Solovis | Optional investor gate fraction for liquidity (dashboard + liquidity_cost). If omitted, uses Solovis investor_gate_pct; if blank or non-numeric, 1.0. |

#### 7. `smpublic_main_v3` — C
> Single Manager Public Dashboard V3 — load_data(V3), projected IR, calculate_report (requires Flask JSON body via HTTP proxy)

*No parameters.* (See O10 — description requires a Flask JSON body the MCP surface cannot supply.)

---

### 3.3 Returns & performance (7)

#### 8. `get_fund_returns` — R
> Fund Returns (bulk) — Retrieves Solovis monthly net/gross returns from the IMG Aloha Datalake API for a list of fund_ids within an inclusive date range (single bulk query).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_ids` | **req** | array[string], minItems 1 | — | List of Solovis fund identifiers (required, non-empty) |
| `start_date` | **req** | string `^\d{4}-\d{2}-\d{2}$` | — | Inclusive start date (YYYY-MM-DD) |
| `end_date` | **req** | string `^\d{4}-\d{2}-\d{2}$` | — | Inclusive end date (YYYY-MM-DD) |

#### 9. `get_top_funds_by_returns` — R
> Get Top N Funds by Returns - Retrieves the top N performing funds based on monthly returns (annualized) over a specified period (last N months or custom date range). **Funds are excluded unless they have a non-null return for every month-end in the requested window (no gaps).**

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `top_n` | *(opt)* | integer 1–100 | 10 | Number of top funds to return (default: 10) |
| `period_months` | *(opt)* | integer 1–120 | — | Number of months to look back from current date (e.g., 12 for last year). Either this or both start_date and end_date must be provided. |
| `start_date` | *(opt)* | string | — | Start date for analysis period (YYYY-MM-DD format). Required if period_months is not provided. |
| `end_date` | *(opt)* | string | — | End date for analysis period (YYYY-MM-DD format). Required if period_months is not provided. |
| `return_type` | *(opt)* | enum `net`\|`gross` | `net` | Type of returns to analyze: 'net' (default) or 'gross' |

#### 10. `get_bottom_funds_by_returns` — R
> Get Bottom N Funds by Returns - Retrieves the bottom N performing funds based on monthly returns (annualized) over a specified period (last N months or custom date range). **Funds are excluded unless they have a non-null return for every month-end in the requested window (no gaps).**

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `top_n` | *(opt)* | integer 1–100 | 10 | Number of bottom funds to return (default: 10) |
| `period_months` | *(opt)* | integer 1–120 | — | Number of months to look back from current date (e.g., 12 for last year). Either this or both start_date and end_date must be provided. |
| `start_date` | *(opt)* | string | — | Start date for analysis period (YYYY-MM-DD format). Required if period_months is not provided. |
| `end_date` | *(opt)* | string | — | End date for analysis period (YYYY-MM-DD format). Required if period_months is not provided. |
| `return_type` | *(opt)* | enum `net`\|`gross` | `net` | Type of returns to analyze: 'net' (default) or 'gross' |

#### 11. `calculate_annualized_returns` — C
> Calculate Annualized Returns - Calculates annualized returns for specified funds over a given period using SMPublicCalculation.annualize_return function

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_ids` | **req** | array[string] | — | List of fund identifiers (required) |
| `period_months` | *(opt)* | integer 1–120 | — | Number of months to look back from current date (e.g., 12 for last year). Either this or both start_date and end_date must be provided. |
| `start_date` | *(opt)* | string | — | Start date for analysis period (YYYY-MM-DD format). Required if period_months is not provided. |
| `end_date` | *(opt)* | string | — | End date for analysis period (YYYY-MM-DD format). Required if period_months is not provided. |
| `return_type` | *(opt)* | enum `net`\|`gross` | `net` | Type of returns to analyze: 'net' (default) or 'gross' |

#### 12. `intraday_fund_returns` — R
> Intraday Fund Returns - Real-time fund returns via equity beta / intraday methodology (formerly fund_returns)

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `run_mode` | *(opt)* | enum `direct`\|`indirect` | `direct` | Execution mode: 'direct' for real-time, 'indirect' for historical |

#### 13. `calculate_drawdown` — C
> Calculate drawdown analysis for a fund (max drawdown, recovery, down months). Omit start_date to use earliest available return; omit end_date to use latest.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | **req** | string | — | Fund identifier (required) |
| `start_date` | *(opt)* | string | earliest | Start date for analysis period (YYYY-MM-DD). If omitted, uses earliest return date available for the fund. |
| `end_date` | *(opt)* | string | latest | End date for analysis period (YYYY-MM-DD). If omitted, uses latest return date available for the fund. |
| `return_type` | *(opt)* | enum `net`\|`gross` | `net` | Type of returns to analyze: 'net' (default) or 'gross' |
| `include_drawdown_table` | *(opt)* | boolean | **true** | Whether to include detailed drawdown table data (default: true) |
| `include_drawdown_graph` | *(opt)* | boolean | false | Whether to include drawdown graph data for visualization (default: false) |
| `include_performance_returns` | *(opt)* | boolean | **true** | Whether to include performance returns data with metrics and period returns (default: true) |

#### 14. `equity_beta` — C
> Calculate Equity Beta - Calculates equity beta using CRBM and benchmark data

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `as_of_date` | *(opt)* | string `^\d{4}-\d{2}-\d{2}$` | — | Date in YYYY-MM-DD format |

---

### 3.4 Benchmarks & CRBM (3)

#### 15. `get_benchmark_history` — R
> Benchmark / index historical total returns from datalake ks_model.benchmark_history_return (DatalakeApi.get_benchmark_history). benchmark_ids must be Bloomberg-style ids as stored in that table (e.g. SP50, M1WO) — NOT free-form names like 'S&P 500'. If you only have a name, call search_crbm_index FIRST and pass its bbg_id field as benchmark_ids here. Frequency M/W/D.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `benchmark_ids` | **req** | array[string], minItems 1 | — | One or more Bloomberg-style benchmark ids (e.g. SP50). Resolve a name to an id via search_crbm_index (use its bbg_id field). |
| `start_date` | **req** | string | — | Inclusive start date (YYYY-MM-DD) |
| `end_date` | **req** | string | — | Inclusive end date (YYYY-MM-DD) |
| `frequency` | *(opt)* | enum `M`\|`W`\|`D` | `M` | Return frequency: M=monthly, W=weekly (Friday), D=business daily |
| `long_format` | *(opt)* | boolean | true | If true (default), rows are {date, benchmark_id, total_return}; if false, wide pivot dates × ids. |

#### 16. `get_fund_crbm` — R
> Get CRBM (Custom Risk Benchmark) from Solovis — benchmark weights keyed by Bloomberg ``bbg_id`` (``index_id`` in components), plus optional fund beta metadata

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | *(opt)* | string | — | Optional fund identifier. If provided, returns CRBM for specific fund. **If not provided, returns CRBM for all available funds.** |
| `include_weights` | *(opt)* | boolean | true | Whether to include detailed CRBM component weights (default: true) |
| `include_benchmark_info` | *(opt)* | boolean | true | Whether to include fund beta information (default: true) |

#### 17. `calculate_crbm_returns` — C
> Calculate CRBM returns for a fund using Solovis data directly - computes custom risk benchmark performance over a specified time period

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | **req** | string | — | Fund identifier (required) |
| `start_date` | **req** | string | — | Start date for CRBM calculation (YYYY-MM-DD format, required) |
| `end_date` | **req** | string | — | End date for CRBM calculation (YYYY-MM-DD format, required) |
| `frequency` | *(opt)* | string | `W` | Data frequency for calculations (D=Daily, W=Weekly, M=Monthly, default: W) |

---

### 3.5 Fees, IR & liquidity (6)

#### 18. `fee_model` — C
> Fee Model - Convert between gross and net returns using complex fee structures including management fees, performance fees, hurdles, and HWM

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | **req** | string | — | Unique identifier for the fund |
| `benchmark` | **req** | string | — | Numeric string = constant per-period benchmark return (e.g. 0.008); OR benchmark id (e.g. SPTR Index.USD) to load monthly returns from datalake aligned to fund dates. |
| `translation` | **req** | number | — | Translation factor for returns |
| `mgt_fee` | **req** | number | — | Annual management fee rate (e.g., 0.02 for 2%) |
| `mgt_fee_freq` | **req** | integer | — | Management fee frequency (0: quarterly, 1: monthly) |
| `perf_fee` | **req** | number | — | Performance fee rate (e.g., 0.20 for 20%) |
| `hwm_status` | **req** | integer | — | High Water Mark status (1: active, 0: inactive) |
| `hurdle_status` | **req** | integer | — | Hurdle status (1: active, 0: inactive) |
| `ramp_type` | **req** | integer | — | Preferred return ramp type (0: NAV-based, 1: HWM-based) |
| `hurdle_fixed` | **req** | integer | — | Hurdle type (1: fixed rate, 0: relative to benchmark) |
| `hurdle_type` | **req** | integer | — | Hurdle type (0: hard hurdle, 1: soft hurdle) |
| `perf_return` | **req** | number | — | Performance return rate |
| `catch_up` | **req** | integer | — | Catch-up provision status (1: active, 0: inactive) |
| `catch_up_perc_soft` | **req** | number | — | Catch-up percentage for soft hurdles |
| `crystialized_paid` | **req** | integer | — | Crystallization frequency (annual) *(schema typo reproduced verbatim)* |
| `calculation_type` | *(opt)* | enum `gross_to_net`\|`net_to_gross` | `net_to_gross` | Type of calculation: 'gross_to_net' or 'net_to_gross' (default: net_to_gross) |
| `dates` | *(opt)* | array[string] | Solovis | List of dates for the calculation period (YYYY-MM-DD format). If not provided, will retrieve from Solovis fund_ror table. |
| `returns` | *(opt)* | array[number] | Solovis | List of returns for the calculation period (as decimals, e.g., 0.05 for 5%). If not provided, will retrieve from Solovis fund_ror table. |
| `periods` | *(opt)* | integer | 60 | Number of periods to analyze (default: 60). **Note: Currently retrieves all available periods from Solovis.** |
| `start_date` | *(opt)* | string (date) | earliest | Optional start date for filtering returns (YYYY-MM-DD format). If not provided, uses earliest available data. |
| `end_date` | *(opt)* | string (date) | latest | Optional end date for filtering returns (YYYY-MM-DD format). If not provided, uses latest available data. |

#### 19. `get_fee_model_defaults` — R
> Get default fee model parameters from Solovis data - retrieves fund-specific fee structures including management fees, performance fees, hurdles, and HWM settings

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | *(opt)* | string | — | Optional fund identifier. If provided, returns parameters for specific fund. **If not provided, returns parameters for all available funds.** |

#### 20. `ir_model` — C
> Information Ratio Model — ratings to net IR. Auto-routes Solovis Private Equity / Real Assets (asset_class_0) to IR_model_private (manager sleeve); Public Equities / Absolute Return uses public IR. **Mixed sleeves in one call is rejected unless force_implementation is set.**

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_ids` | *(opt)* | array[string] | — | List of fund identifiers (**if not provided, retrieves all public-sleeve funds**) |
| `force_implementation` | *(opt)* | enum `public`\|`private` | — | Override auto-routing. **'private' still requires fund_ids** to resolve manager keys from Solovis. |

*This is the source of the "documented as returning all public-sleeve funds" claim in KS-1076. It exists only here, in the parameter description.*

#### 21. `calculate_liquidity_cost` — C
> Calculate liquidity cost using the liquidity cost model - computes the cost of illiquidity based on fund parameters including lockup periods, redemption frequency, gates, and side pocket settings

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | **req** | string | — | Fund identifier (required) |
| `asset_category` | *(opt)* | string | Solovis | Asset category/strategy (e.g., 'Buyouts', 'Venture', 'Credit'). If not provided, will retrieve from Solovis. |
| `redemption_freq_months` | *(opt)* | number | Solovis | Redemption frequency in months (e.g., 3 for quarterly, 12 for annually). If not provided, will retrieve from Solovis. |
| `gate` | *(opt)* | number | **1.0** | Investor gate as a fraction (e.g., 0.25 for 25%). **If omitted, defaults to 1.0 (not read from Solovis).** |
| `inception_date` | *(opt)* | string | Solovis | Fund inception date (YYYY-MM-DD format). If not provided, will retrieve from Solovis. |
| `lockup_months` | *(opt)* | number | Solovis | Lockup period in months. If not provided, will retrieve from Solovis. |
| `side_pocket_prob` | *(opt)* | number 0–1 | Solovis | Side pocket probability (0-1). If not provided, will retrieve from Solovis. |
| `side_pocket_max_pct` | *(opt)* | number 0–1 | Solovis | Maximum side pocket percentage (0-1). If not provided, will retrieve from Solovis. |
| `fund_liquidity_type` | *(opt)* | string | Solovis | Fund liquidity type. If not provided, will retrieve from Solovis. |
| `source` | *(opt)* | string | `solovis` | Data source (default: 'solovis') |

#### 22. `get_liquidity_parameters` — R
> Get default liquidity parameters from Solovis data — lockup, redemption frequency, gates (gate defaults to 1.0 when missing from Solovis), side pockets, etc.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fund_id` | *(opt)* | string | — | Optional fund identifier. If provided, returns parameters for specific fund. **If not provided, returns parameters for all available funds.** |

#### 23. `query_fund_manager` — R
> Select allowlisted columns from solovis.fund_manager (fees, liquidity, asset_class_0/1, ids). Optional filters: asset_class_0, asset_class_1, fund_ids (each OR via SQL IN), plus extra_where (same rules as get_data). Max 64 columns, 1000 rows. Allowlist: FUND_MANAGER_MCP_ALLOWED_COLUMNS in datalake_api.py.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `fields` | **req** | array[string], minItems 1 | — | Column names to return (allowlisted). |
| `asset_class_0` | *(opt)* | array[string] | — | Optional: keep rows where asset_class_0 is one of these values. |
| `asset_class_1` | *(opt)* | array[string] | — | Optional: keep rows where asset_class_1 is one of these values. |
| `fund_ids` | *(opt)* | array[string] | — | Optional: keep rows where fund_id is in this list. |
| `extra_where` | *(opt)* | string | — | Optional extra WHERE fragment for fund_manager (validated like get_data filter_cond). |
| `limit` | *(opt)* | integer 1–1000 | 1000 | Max rows (1–1000, default 1000). |

---

### 3.6 Ratings (5)

#### 24. `get_rating_details` — R
> Fetch user-scoped rating details from datalake table gend_ks_db.rating_detail (IMG Aloha Datalake API).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `id` | **req** | string | — | Fund or manager id for ratings. |
| `source` | *(opt)* | string | — | Rating source (e.g. solovis, ALB). |
| `type` | *(opt)* | string | — | fund or manager. |
| `user` | *(opt)* | string | header | Optional user email/UPN; **if omitted, X-User-Email from the HTTP request or MCP_DEFAULT_USER_EMAIL is used.** |

#### 25. `rating_detail` — R
> Same as get_rating_details — datalake gend_ks_db.rating_detail.

Parameters **identical** to `get_rating_details` (`id` req; `source`, `type`, `user` opt), including the `MCP_DEFAULT_USER_EMAIL` fallback wording.

#### 26. `get_rating_summary` — R
> Fetch rating summary from datalake table gend_ks_db.rating_summary (IMG Aloha Datalake API).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `id` | **req** | string | — | Fund or manager id for ratings. |
| `source` | *(opt)* | string | — | Rating source (e.g. solovis, ALB). |
| `type` | *(opt)* | string | — | fund or manager. |

*Note: no `user` parameter — unlike the detail tools.*

#### 27. `rating_summary` — R
> Same as get_rating_summary — rating summary from datalake gend_ks_db.rating_summary.

Parameters **identical** to `get_rating_summary` (`id` req; `source`, `type` opt).

#### 28. `list_rating_details_by_user` — R
> List all rating detail rows for the resolved user from datalake gend_ks_db.rating_detail (email column), optional source filter, capped at limit (default 1000).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `source` | *(opt)* | string | — | Optional rating source filter (e.g. solovis, ALB). |
| `user` | *(opt)* | string | header | Optional user email/UPN; **if omitted, X-User-Email from the HTTP request or MCP_DEFAULT_USER_EMAIL is used.** |
| `limit` | *(opt)* | integer 1–1000 | 1000 | Maximum rows (default 1000; max 1000). |

---

### 3.7 Datalake / schema introspection (6)

#### 29. `show_schemas` — R
> Run SQL SHOW SCHEMAS on the IMG Aloha Datalake (Trino-style). Connection schema is information_schema. Optional catalog runs SHOW SCHEMAS FROM <catalog> (sanitized identifier).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `catalog` | *(opt)* | string | — | Optional Trino catalog name. Omit for SHOW SCHEMAS only. |

#### 30. `list_tables` — R
> Run SQL SHOW TABLES on the IMG Aloha Datalake for the given database/schema name (passed as connection schema and sanitized: letters, digits, underscore).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `db_name` | **req** | string | — | Database or schema name (e.g. solovis, ks_model, pipeline). |

#### 31. `describe_table` — R
> Run SQL DESCRIBE on one table in the IMG Aloha Datalake (connection schema = db_name; db_name and table_name sanitized identifiers only).

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `db_name` | **req** | string | — | Database or schema name (e.g. solovis, ks_model). |
| `table_name` | **req** | string | — | Table name within that schema. |

#### 32. `get_data` — R
> Run capped SELECT * (max 1000 rows) via DatalakeApi.get_data_from_db_mcp_json; datalake response must be a JSON result set. db_name/table_name are strict identifiers; filter_cond is validated (no ; comments UNION DDL/DML etc.) then wrapped. **Table rating_detail is blocked** (use get_rating_details or list_rating_details_by_user). Use least-privilege DB roles.

| Param | Req | Type | Default | Description |
|---|:--:|---|---|---|
| `db_name` | **req** | string | — | Database or schema name for the datalake connection (e.g. solovis, ks_model). |
| `table_name` | **req** | string | — | Table name within that schema. |
| `filter_cond` | *(opt)* | string | — | Optional WHERE predicate only (leading WHERE optional). **Max 2048 chars**; semicolons, SQL comments, UNION, and DDL/DML keywords are rejected. The datalake response must be JSON (rows), not plain text. |

#### 33. `health_check` — R
> System Health Check - Returns system health status

*No parameters.*

#### 34. `get_user_info` — R
> Return user email from forwarded request headers (informational only; **no auth in this service**).

*No parameters.*

---

## 4. Behavioural rules recoverable only from full descriptions

These are documented server-side but appear **nowhere** in `aloha_mcp_uat_plan.md`, `aloha_mcp_uat_tickets.md`, or the earlier baselines — they were hidden behind description truncation or in uncaptured parameter text. Each is testable; none has a test case in KS-1070…KS-1084.

| # | Tool | Documented rule | Test status |
|---|---|---|---|
| **R1** | `get_top_funds_by_returns`, `get_bottom_funds_by_returns` | *"Funds are excluded unless they have a non-null return for every month-end in the requested window (no gaps)."* Top/bottom lists silently omit any fund with a single missing month | **No test case.** Directly affects KS-1082's cold-start prompt *"What were the top 10 funds by return last year?"* — the answer is silently filtered |
| **R2** | `fund_analyzer` | `include_liquidity_cost: false` does not merely drop a slice — it switches the dashboard from **load_data V3 to V2** | **No test case.** O3's "all slices off → 613 KB" measurement was therefore taken on a *different code path* than the default |
| **R3** | `ir_model` | *"Mixed sleeves in one call is rejected unless force_implementation is set."* | **No test case** |
| **R4** | `ir_model` | `force_implementation: 'private'` still requires `fund_ids` | **No test case** |
| **R5** | `fee_model` | `periods` — *"Note: Currently retrieves all available periods from Solovis."* The parameter is documented as non-functional | **No test case.** Explains KS-1076's "~373 periods when dates omitted" |
| **R6** | `fee_model` | `benchmark` is dual-mode: a numeric string = constant per-period return; otherwise a benchmark id resolved against the datalake | **No test case** |
| **R7** | `calculate_liquidity_cost` vs `fund_analyzer` | **Contradictory gate defaults.** `calculate_liquidity_cost.gate` omitted → *"defaults to 1.0 (not read from Solovis)"*; `fund_analyzer.gate` omitted → *"uses Solovis investor_gate_pct"*. Same concept, opposite behaviour | **No test case.** The two tools will disagree on the same fund |
| **R8** | `fund_analyzer` | `custom_start_date_1/2` — *"Month-end = exclusive (next month first); non-month-end includes that month's EOM"* | **No test case.** Subtle inclusivity rule on an untested parameter |
| **R9** | `fund_analyzer` | `end_date` omitted → month-end of latest Solovis return for the fund | Partially — KS-1073 AC asks for "a documented default"; this is it |
| **R10** | `get_data` | `filter_cond` max **2048 chars**; `rating_detail` table blocked | Block tested in KS-1078; **2048-char limit not tested** |
| **R11** | `search_crbm_index` | `split_commas` default **true** — a string containing commas is silently split into separate OR phrases | **No test case.** Interacts with NEW-22 (limit starves one phrase) |

---

## 5. Duplicates (O5) — live confirmed present

| Pair | Both present | Descriptions |
|---|---|---|
| `search_funds` ≡ `Search_Funds` | Yes | `search_funds` self-declares: *"Alias for Search_Funds"* |
| `rating_detail` ≡ `get_rating_details` | Yes | `rating_detail` self-declares: *"Same as get_rating_details"* |
| `rating_summary` ≡ `get_rating_summary` | Yes | `rating_summary` self-declares: *"Same as get_rating_summary"* |

Parameter sets are byte-identical within each pair.

---

## 6. Tools with no required parameters (13)

`equity_beta` · `get_bottom_funds_by_returns` · `get_fee_model_defaults` · `get_fund_crbm` · `get_liquidity_parameters` · `get_top_funds_by_returns` · `get_user_info` · `health_check` · `intraday_fund_returns` · `ir_model` · `list_rating_details_by_user` · `show_schemas` · `smpublic_main_v3`

Of these, **four explicitly document returning every fund** when their optional filter is omitted: `get_fund_crbm`, `get_fee_model_defaults`, `get_liquidity_parameters`, `ir_model` (public sleeve only). See KS-1093.

---

## 7. Write capability

**No write-capable tool found.** All 34 are read or compute. Classification is from names, descriptions and schemas only — not from source inspection.

---

## 8. Identity check (O4 / KS-1094)

`get_user_info` → `{"success": false, "error": "No user email found in request headers."}` despite a completed OAuth session. **Still reproduces** on build `0.9.5` at 18.4 days uptime — unchanged since 2026-08-05. The tool's own description concedes the design: *"informational only; no auth in this service"*.
