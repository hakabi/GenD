# KS-1079 Cursor Result — Verify that errors are structured, actionable and agent-consumable

> **Story:** [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) · **Draft ID:** AM-10 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE (consolidation from Cursor Results KS-1073–1078; **no new tool traffic**)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07  
> **Status:** **FAIL**

---

## Scope

Per ticket: catalogue errors from **AM-05–AM-09** (KS-1074–1078), disposition **O7** from `fund_analyzer` (KS-1073), list all **silent empty successes**. Ratings: **Actionable** / **Informative** / **Terse**.

---

## Error catalogue (Cursor evidence)

| # | Tool | Input class | Error / failure text (abbrev.) | Rating | Machine-readable? | Source |
|---|---|---|---|---|---|---|
| 1 | `get_fund_returns` | inverted dates | Pydantic: `start_date must be on or before end_date` | **Actionable** | Y | KS-1074 |
| 2 | `get_top_funds_by_returns` | neither period | `Either period_months or both start_date and end_date must be provided` | **Actionable** | Y | KS-1074 |
| 3 | `calculate_annualized_returns` | neither period | Same as #2 | **Actionable** | Y | KS-1074 |
| 4 | `calculate_annualized_returns` | inverted dates | `No funds with valid return data found for the specified period` | **Terse** (misleading) | Y | KS-1074 |
| 5 | `calculate_drawdown` | invalid fund | `Fund 99999999 not found` | **Informative** | Y | KS-1074 |
| 6 | `calculate_drawdown` | inverted dates | `No returns data found for the specified date range` | **Terse** (misleading) | Y | KS-1074 |
| 7 | `calculate_crbm_returns` | inverted dates | `No benchmark returns found for the specified period` | **Terse** (misleading) | Y | KS-1075 |
| 8 | `fee_model` | missing `perf_return` | `'perf_return' is a required property` | **Actionable** | Y | KS-1076 |
| 9 | `fee_model` | `mgt_fee` as string | `'0.01' is not of type 'number'` | **Actionable** | Y | KS-1076 |
| 10 | `calculate_liquidity_cost` | invalid fund | `Fund 99999999 not found in Solovis data` | **Informative** | Y | KS-1076 |
| 11 | `query_fund_manager` | bad column | `Column '…' is not allowlisted… (31 allowed names)` | **Actionable** (best) | Y | KS-1076 |
| 12 | `get_user_info` | no header email | `No user email found in request headers.` | **Informative** | Y | KS-1077 |
| 13 | `list_rating_details_by_user` | no identity | `No user identity; returning empty rating list.` | **Informative** | Y | KS-1077 |
| 14 | `get_rating_details` | not found / no user | `No rating detail found for id='…' user='None'…` | **Informative** | Y | KS-1077 |
| 15 | `get_rating_summary` | invalid id | `No rating summary found for id='99999999'…` | **Informative** | Y | KS-1077 |
| 16 | `list_tables` | invalid schema | `unhashable type: 'dict'` | **Terse** + non-compliant | Y (meaningless) | KS-1078 |
| 17 | `describe_table` | invalid table | Trino/Java **stack** + `mongodb.solovis.…`; outer **`status:success`** | **Terse** + non-compliant | N | KS-1078 |
| 18 | `get_data` | `;` / UNION / `--` / INSERT | Named disallow messages | **Actionable** | Y | KS-1078 |
| 19 | `get_data` | blocked `rating_detail` | Names `get_rating_details` / `list_rating_details_by_user` | **Actionable** | Y | KS-1078 |
| 20 | `smpublic_main_v3` | MCP call | Flask `Working outside of request context` | **Terse** + framework leak | N | KS-1078 |
| 21 | `fund_analyzer` (O7) | ambiguous resolve | `Resolution: {'search_matches': [...], …}` Python dict repr | **Informative** content / **N** format | N | KS-1073 |

**Tally:** Actionable **9** · Informative **7** · Terse **5** → **16/21 = 76.2%** Actionable+Informative — **below 80%**.

*(Claude’s catalogue has 22 rows with slightly different membership; same FAIL on the bar.)*

---

## AC: no raw SQL / stacks / infra — **FAIL**

| Violation | Evidence |
|---|---|
| Stack + MongoDB/Trino | `describe_table` invalid (#17) — NEW-16 |
| Raw Python exception | `list_tables` invalid (#16) |
| Flask framework dump | `smpublic_main_v3` (#20) — O10 |
| SQL echo (success paths) | `show_schemas` / `list_tables` / `describe_table` / `get_data` include `"sql":"…"` | Strict AC note |

No hostnames/credentials/connection strings in Cursor evidence.

---

## O7 disposition — **Confirmed, isolated to `fund_analyzer`**

KS-1073 Cursor: resolution failures still embed **Python `dict`/`list` repr** (single quotes) inside the error string. Not observed in KS-1074–1078 Cursor error set. Content useful (candidates listed); format not agent-JSON-parseable. Fix: `json.dumps` on that path.

---

## Recovery candidates — **FAIL** (with two model positives)

| Scenario | Recovery guidance? |
|---|---|
| Fund resolution (`fund_analyzer`) | Partial — candidates in O7 string, not JSON |
| Unknown benchmark name | **No** — silent empty success (NEW-11) |
| Invalid table / schema | **No** |
| Invalid fund id (drawdown / liquidity) | **No** next step |
| QFM bad column | **Yes** — model |
| `get_data` blocked `rating_detail` | **Yes** — model |

---

## Silent empty success — full list (Cursor)

| Tool | Invalid input | Response |
|---|---|---|
| `get_fund_returns` | `fund_ids=["99999999"]` | `status:success`, `row_count:0`, `returns:[]` |
| `get_benchmark_history` | `benchmark_ids=["MSCI World"]` | `status:success`, `row_count:0`, `returns:[]` |

Exactly **two** confirmed in AM-05/06 Cursor testing. Not seen in fee/IR/liquidity, ratings (explicit messages), or `get_data` reject paths.

---

## Verdict

| AC | Result |
|---|---|
| Catalogue complete | **Done** |
| Rated A/I/T | **Done** |
| ≥80% A or I | **Fail — 76.2%** (Cursor set) |
| No stacks/SQL/infra leaks | **Fail** |
| O7 dispositioned | **Done — confirmed, isolated** |
| Recovery candidates | **Fail** |
| Silent empty list | **Done — 2 instances** |

**Overall: FAIL.** Remediation clusters: (1) inverted-date → “no data” NEW-9, (2) silent empty DatalakeApi pattern, (3) sanitize list_tables/describe_table/smpublic errors, (4) O7 → JSON.
