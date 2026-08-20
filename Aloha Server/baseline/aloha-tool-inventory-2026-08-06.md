# Aloha MCP — Tool Inventory Baseline

> **Story:** KS-1071 · **Epic:** KS-1066
> **Captured:** 2026-08-06 (UTC)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)
> **Client:** Cursor IDE agent, server id `user-conceptia-aloha`, native HTTP
> **Auth:** Microsoft OAuth completed in Cursor (browser flow); tools callable
> **Method:** Live schema capture via MCP tools/list equivalent (`GetMcpTools`). No write tools invoked.
> **Server:** `health_check` → build `0.9.5`, status healthy

---

## 1. Headline result

| Metric | 2026-08-05 baseline | 2026-08-06 Cursor | Delta |
|---|---|---|---|
| Tool count (Aloha) | 34 | **34** | **+0** |
| Write-capable tools | 0 found | **0 found** | — |
| Cursor meta tools also listed | n/a | `mcp_auth` (not Aloha) | exclude from count |

## 2. Full inventory

R = read · C = compute/derive · W = write

### Fund search & resolution (5)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 1 | `Search_Funds` | R | `search_term` | `(none)` | Search Funds - Same Elasticsearch indexes as search_all_funds; returns only fund_id, fund_name, and … |
| 2 | `search_funds` | R | `search_term` | `(none)` | Alias for Search_Funds - returns only fund_id, fund_name, and source per match |
| 3 | `search_all_funds` | R | `search_term` | `(none)` | Search All Funds - Elasticsearch across Albourne, Solovis, Alt Evest, and Evest indexes |
| 4 | `search_albourne_funds` | R | `search_term` | `(none)` | Search Albourne Funds - Elasticsearch Albourne (ALB) index only |
| 5 | `search_crbm_index` | R | `names` | `limit,match_mode,split_commas` | Resolve a benchmark / index name to its identifier. Substring search over ks_model.benchmark_model a… |

### Bundled analysis (2)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 6 | `fund_analyzer` | C | `start_date` | `fund_id,search_term,end_date,custom_start_date_1,custom_end_date_1,custom_start_date_2,custom_end_date_2,include_ir_model,include_fund_returns,include_fee_model,include_liquidity_cost,include_crbm_details,include_crbm_returns,include_drawdown_analysis,fee_model_calculation_type,fee_model_periods,crbm_frequency,gate` | Bundled fund analysis: smpublic_dashboard (SmpublicBuilder) plus optional slices — ir_model, fund_re… |
| 7 | `smpublic_main_v3` | C | `(none)` | `(none)` | Single Manager Public Dashboard V3 — load_data(V3), projected IR, calculate_report (requires Flask J… |

### Returns & performance (7)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 8 | `get_fund_returns` | R | `fund_ids,start_date,end_date` | `(none)` | Fund Returns (bulk) — Retrieves Solovis monthly net/gross returns from the IMG Aloha Datalake API fo… |
| 9 | `get_top_funds_by_returns` | R | `(none)` | `top_n,period_months,start_date,end_date,return_type` | Get Top N Funds by Returns - Retrieves the top N performing funds based on monthly returns (annualiz… |
| 10 | `get_bottom_funds_by_returns` | R | `(none)` | `top_n,period_months,start_date,end_date,return_type` | Get Bottom N Funds by Returns - Retrieves the bottom N performing funds based on monthly returns (an… |
| 11 | `calculate_annualized_returns` | C | `fund_ids` | `period_months,start_date,end_date,return_type` | Calculate Annualized Returns - Calculates annualized returns for specified funds over a given period… |
| 12 | `intraday_fund_returns` | R | `(none)` | `run_mode` | Intraday Fund Returns - Real-time fund returns via equity beta / intraday methodology (formerly fund… |
| 13 | `calculate_drawdown` | C | `fund_id` | `start_date,end_date,return_type,include_drawdown_table,include_drawdown_graph,include_performance_returns` | Calculate drawdown analysis for a fund (max drawdown, recovery, down months). Omit start_date to use… |
| 14 | `equity_beta` | C | `(none)` | `as_of_date` | Calculate Equity Beta - Calculates equity beta using CRBM and benchmark data |

### Benchmarks & CRBM (3)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 15 | `get_benchmark_history` | R | `benchmark_ids,start_date,end_date` | `frequency,long_format` | Benchmark / index historical total returns from datalake ks_model.benchmark_history_return (Datalake… |
| 16 | `get_fund_crbm` | R | `(none)` | `fund_id,include_weights,include_benchmark_info` | Get CRBM (Custom Risk Benchmark) from Solovis — benchmark weights keyed by Bloomberg ``bbg_id`` (``i… |
| 17 | `calculate_crbm_returns` | C | `fund_id,start_date,end_date` | `frequency` | Calculate CRBM returns for a fund using Solovis data directly - computes custom risk benchmark perfo… |

### Fees, IR, liquidity (6)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 18 | `fee_model` | C | `fund_id,benchmark,translation,mgt_fee,mgt_fee_freq,perf_fee,hwm_status,hurdle_status,ramp_type,hurdle_fixed,hurdle_type,perf_return,catch_up,catch_up_perc_soft,crystialized_paid` | `calculation_type,dates,returns,periods,start_date,end_date` | Fee Model - Convert between gross and net returns using complex fee structures including management … |
| 19 | `get_fee_model_defaults` | R | `(none)` | `fund_id` | Get default fee model parameters from Solovis data - retrieves fund-specific fee structures includin… |
| 20 | `ir_model` | C | `(none)` | `fund_ids,force_implementation` | Information Ratio Model — ratings to net IR. Auto-routes Solovis Private Equity / Real Assets (asset… |
| 21 | `calculate_liquidity_cost` | C | `fund_id` | `asset_category,redemption_freq_months,gate,inception_date,lockup_months,side_pocket_prob,side_pocket_max_pct,fund_liquidity_type,source` | Calculate liquidity cost using the liquidity cost model - computes the cost of illiquidity based on … |
| 22 | `get_liquidity_parameters` | R | `(none)` | `fund_id` | Get default liquidity parameters from Solovis data — lockup, redemption frequency, gates (gate defau… |
| 23 | `query_fund_manager` | R | `fields` | `asset_class_0,asset_class_1,fund_ids,extra_where,limit` | Select allowlisted columns from solovis.fund_manager (fees, liquidity, asset_class_0/1, ids). Option… |

### Ratings (5)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 24 | `get_rating_details` | R | `id` | `source,type,user` | Fetch user-scoped rating details from datalake table gend_ks_db.rating_detail (IMG Aloha Datalake AP… |
| 25 | `rating_detail` | R | `id` | `source,type,user` | Same as get_rating_details — datalake gend_ks_db.rating_detail. |
| 26 | `get_rating_summary` | R | `id` | `source,type` | Fetch rating summary from datalake table gend_ks_db.rating_summary (IMG Aloha Datalake API). |
| 27 | `rating_summary` | R | `id` | `source,type` | Same as get_rating_summary — rating summary from datalake gend_ks_db.rating_summary. |
| 28 | `list_rating_details_by_user` | R | `(none)` | `source,user,limit` | List all rating detail rows for the resolved user from datalake gend_ks_db.rating_detail (email colu… |

### Datalake / schema introspection (6)

| # | Tool | R/C/W | Required | Optional | Notes |
|---|---|:--:|---|---|---|
| 29 | `show_schemas` | R | `(none)` | `catalog` | Run SQL SHOW SCHEMAS on the IMG Aloha Datalake (Trino-style). Connection schema is information_schem… |
| 30 | `list_tables` | R | `db_name` | `(none)` | Run SQL SHOW TABLES on the IMG Aloha Datalake for the given database/schema name (passed as connecti… |
| 31 | `describe_table` | R | `db_name,table_name` | `(none)` | Run SQL DESCRIBE on one table in the IMG Aloha Datalake (connection schema = db_name; db_name and ta… |
| 32 | `get_data` | R | `db_name,table_name` | `filter_cond` | Run capped SELECT * (max 1000 rows) via DatalakeApi.get_data_from_db_mcp_json; datalake response mus… |
| 33 | `health_check` | R | `(none)` | `(none)` | System Health Check - Returns system health status |
| 34 | `get_user_info` | R | `(none)` | `(none)` | Return user email from forwarded request headers (informational only; no auth in this service). |

**Counted tools in groups:** 34 · **Aloha tools captured:** 34

## 3. Write capability

**No write-capable tool found** in live schema (same as 2026-08-05). Classification is from names/descriptions/schemas only.

## 4. Duplicates (O5) — live confirmed present

| Pair | Both present |
|---|---|
| `search_funds` ≡ `Search_Funds` | Yes |
| `rating_detail` ≡ `get_rating_details` | Yes |
| `rating_summary` ≡ `get_rating_summary` | Yes |

## 5. Tools with no required parameters

- `equity_beta`
- `get_bottom_funds_by_returns`
- `get_fee_model_defaults`
- `get_fund_crbm`
- `get_liquidity_parameters`
- `get_top_funds_by_returns`
- `get_user_info`
- `health_check`
- `intraday_fund_returns`
- `ir_model`
- `list_rating_details_by_user`
- `show_schemas`
- `smpublic_main_v3`

## 6. Identity check (related KS-1070 / O4)

`get_user_info` returned: `No user email found in request headers.` despite authenticated MCP session.
