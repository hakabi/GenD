# KS-1079 Claude Result — Verify that errors are structured, actionable and agent-consumable

> **Story:** [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) · **Draft ID:** AM-10 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** High · **Blocked by:** KS-1074, KS-1075, KS-1076, KS-1077, KS-1078 (all unblocked — Claude Code results exist for all five)
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223)
> **Executed:** 2026-08-07 — **consolidation only, no new tool calls**, per this ticket's own description: *"This story consolidates the error observations from AM-05 through AM-09 rather than generating new traffic."*
> **Status:** **FAIL.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass. The catalogue below comes entirely from my own KS-1074–KS-1078 testing this cycle, plus the O7 callback to `fund_analyzer` (KS-1073). Two ACs fail outright: the 80% actionable/informative bar (72.7% measured) and the no-raw-errors bar (two confirmed violations).

---

## Scope note

This ticket's AC list explicitly asks for AM-05 through AM-09 (KS-1074–1078), plus a named callback to O7 (`fund_analyzer`, tested under AM-04/KS-1073). I did not re-test AM-01–AM-04 error quality here — those tools' errors are triaged in their own result docs and will feed AM-14 directly. One AM-03 finding (KS-1072's raw Elasticsearch leak on special characters) is the same *class* of defect found here and is footnoted for context, but excluded from the percentage below to keep this catalogue's scope matching the ticket's stated boundary.

---

## Error catalogue

| # | Tool | Input class | Error text (abbreviated) | Rating | Machine-readable? | Source |
|---|---|---|---|---|---|---|
| 1 | `get_fund_returns` | inverted dates | *"start_date must be on or before end_date"* (Pydantic) | **Actionable** | Yes (structured Pydantic error) | KS-1074 |
| 2 | `get_top_funds_by_returns` | neither period param | *"Either period_months or both start_date and end_date must be provided"* | **Actionable** | Yes | KS-1074 |
| 3 | `calculate_annualized_returns` | neither period param | Same as #2 | **Actionable** | Yes | KS-1074 |
| 4 | `calculate_annualized_returns` | inverted dates | *"No funds with valid return data found for the specified period"* | **Terse** — misleading, implies missing data rather than a backwards range | Yes (parseable) but semantically wrong | KS-1074 |
| 5 | `calculate_annualized_returns` | empty `fund_ids` array | *"fund_ids must be provided"* | **Actionable** | Yes | KS-1074 |
| 6 | `calculate_drawdown` | invalid `fund_id` | *"Fund 99999999 not found"* | **Informative** — no next step suggested | Yes | KS-1074 |
| 7 | `calculate_drawdown` | inverted dates | *"No returns data found for the specified date range"* | **Terse** — same masking pattern as #4 | Yes but semantically wrong | KS-1074 |
| 8 | `equity_beta` | malformed date | *"'not-a-date' does not match '^\\d{4}-\\d{2}-\\d{2}$'"* | **Actionable** — shows exact expected format | Yes | KS-1074 |
| 9 | `calculate_crbm_returns` | inverted dates | *"No benchmark returns found for the specified period"* | **Terse** — 3rd occurrence of the same masking pattern | Yes but semantically wrong | KS-1075 |
| 10 | `fee_model` | missing required param | *"Input validation error: 'fund_id' is a required property"* | **Actionable** | Yes | KS-1076 |
| 11 | `calculate_liquidity_cost` | invalid `fund_id` | *"Fund 99999999 not found in Solovis data"* | **Informative** | Yes | KS-1076 |
| 12 | `query_fund_manager` | non-allowlisted column | *"Column 'password' is not allowlisted... See FUND_MANAGER_MCP_ALLOWED_COLUMNS / tool docs (31 allowed names)."* | **Actionable — best in catalogue** | Yes | KS-1076 |
| 13 | `get_user_info` | no identity forwarded | *"No user email found in request headers."* | **Informative** | Yes | KS-1077 |
| 14 | `list_rating_details_by_user` | no identity | *"No user identity; returning empty rating list."* | **Informative** | Yes | KS-1077 |
| 15 | `list_rating_details_by_user` | own email, no data | *"No rating detail rows found for this user (gend_ks_db.rating_detail)."* | **Informative** | Yes | KS-1077 |
| 16 | `get_rating_details` | not found | *"No rating detail found for id='500' type='fund' user='None' source='solovis'"* | **Informative** — echoes params, no next step | Yes | KS-1077 |
| 17 | `list_tables` | invalid schema | *"unhashable type: 'dict'"* | **Terse — and non-compliant** (see below) | Technically parseable, semantically meaningless | KS-1078 |
| 18 | `describe_table` | invalid table | Full Trino/Java **stack trace**, reveals MongoDB backend | **Terse — and non-compliant** (worst violation) | No | KS-1078 |
| 19 | `get_data` | DDL/DML in `filter_cond` | *"filter_cond is not allowed to contain semicolon... single-table boolean predicate only (no comments, semicolons, or UNION/DDL/DML)"* | **Actionable** | Yes | KS-1078 |
| 20 | `get_data` | blocked table (`rating_detail`) | *"get_data cannot query rating_detail; use get_rating_details (per id) or list_rating_details_by_user"* | **Actionable — names the fix** | Yes | KS-1078 |
| 21 | `smpublic_main_v3` | called over MCP | Raw Flask *"Working outside of request context..."* | **Terse — raw framework leak** | No (not JSON-structured) | KS-1078 |
| 22 | `fund_analyzer` (O7 callback) | ambiguous resolution | *`"No Solovis fund details for resolved fund_id='986'. Resolution: {'search_matches': [...], 'method': 'elasticsearch', ...}"`* | **Informative** — content is genuinely useful (candidate list included) | **No — Python `dict`/list repr, single-quoted, not JSON** | KS-1073 (O7) |

---

## Rating tally vs. the 80% bar

| Rating | Count | # |
|---|---|---|
| Actionable | 9 | 1, 2, 3, 5, 8, 10, 12, 19, 20 |
| Informative | 7 | 6, 11, 13, 14, 15, 16, 22 |
| Terse | 6 | 4, 7, 9, 17, 18, 21 |
| **Total** | **22** | |

**Actionable + Informative = 16/22 = 72.7%** — **below the plan's 80% bar.** This is a measured, quantified **Fail** on this specific AC, not a judgment call. The "Terse" bucket is dominated by two distinct sub-patterns worth separating for triage:

- **Misleading-generic-error pattern** (#4, #7, #9 — 3 of 6 Terse entries): inverted date ranges reported as "no data found" across three unrelated tools (`calculate_annualized_returns`, `calculate_drawdown`, `calculate_crbm_returns`). This is a **systemic** pattern, not three unrelated bugs — likely a shared underlying query helper that doesn't distinguish "empty result" from "invalid range" before raising.
- **Raw internal leak pattern** (#17, #18, #21 — the other 3 of 6): a Python exception, a full Java stack trace, and a raw Flask framework error, all reaching the client unfiltered.

Fixing either sub-pattern alone would lift the pass rate to **86.4%** (19/22), clearing the bar — this is useful triage information: two focused fixes address the entire gap.

---

## No-raw-errors AC: **Fail**

*"No error contains raw SQL, stack traces, internal paths, hostnames or connection strings"* — two confirmed violations, both in KS-1078:

- **#18** (`describe_table`): a complete Java stack trace, including internal class names (`io.trino.sql.analyzer.SemanticExceptions`, `io.trino.execution.SqlQueryExecution`), line numbers, and — critically — the underlying database technology (`mongodb.solovis.*`). This is the single worst finding across everything catalogued in this cycle for this AC.
- **#17** (`list_tables`): not a stack trace or SQL, but a raw, unhandled Python `TypeError` — arguably a distinct violation category ("internal application errors") the AC's literal wording doesn't name but clearly intends to prevent.

No hostnames, credentials, or connection strings were found anywhere in this cycle's testing — that specific worst-case did not materialize.

---

## O7 disposition: **Confirmed, still present, isolated to `fund_analyzer`**

On 2026-08-05, `fund_analyzer`'s resolution-failure detail was observed as a Python `dict`/list repr embedded in a string (single-quoted, not JSON). Re-tested live on 2026-08-07 (KS-1073, tests T2 and T6): **still present, byte-for-byte the same format** (`"Resolution: {'search_matches': [{'fund_id': '986', ...}], 'method': 'elasticsearch', ...}"`).

I checked every other error message catalogued above (22 entries across 6 tools/tickets) for the same signature (Python-repr-style single quotes embedded in a JSON string value) — **it does not appear anywhere else.** O7 is confirmed but remains isolated to `fund_analyzer` as of this cycle's testing, not spreading to other tools.

The content itself is a genuine positive: the resolution error *does* include a candidate list (the four ambiguous fund matches), which is exactly the kind of recovery information the next AC bullet asks for — it's just not machine-parseable in its current format. A straightforward fix (swap `str(dict)` for `json.dumps(dict)` in that one code path) would resolve O7 without losing any information.

---

## Recovery-candidates AC: **Fail, with two good examples to hold up as the standard**

*"Errors that should offer recovery candidates (failed fund resolution, unknown benchmark, invalid table) actually do"*:

| Scenario | Offers recovery candidates? |
|---|---|
| Failed fund resolution (`fund_analyzer`, O1/O7) | **Partial** — candidate list included, but format isn't machine-readable (see O7 above) |
| Unknown benchmark (`get_benchmark_history` with a name instead of a `bbg_id`, KS-1075) | **No** — silently returns an empty success, zero guidance to try `search_crbm_index` first |
| Invalid table (`describe_table`, KS-1078) | **No** — the underlying Trino error names the missing table but never suggests calling `list_tables` to see valid options |
| Invalid schema (`list_tables`, KS-1078) | **No** — offers nothing (see #17) |
| Invalid `fund_id` (`calculate_drawdown`, `calculate_liquidity_cost`) | **No** — states not-found but never suggests `Search_Funds` |
| Non-allowlisted column (`query_fund_manager`, KS-1076) | **Yes — model example.** Names the bad column, the allowlist source constant, and the total count of valid options |
| Blocked table (`get_data`, KS-1078) | **Yes — model example.** Names the two correct alternative tools by name |

Two clear positive patterns exist in the codebase already (#12, #20) — the fix for every "No" row above is to apply that same template (name the problem, point to the mechanism for discovering valid values) rather than inventing something new.

---

## Silent empty success — full list (separate from the error catalogue, since `status: success` was returned in both cases)

Per the explicit AC bullet, these are **not** errors — they are successful-looking responses to invalid input, which is arguably worse than a bad error message because nothing signals a problem occurred at all:

| # | Tool | Input | Response |
|---|---|---|---|
| 1 | `get_fund_returns` | Invalid `fund_id` (`"99999999"`) | `{"status":"success","row_count":0,"returns":[]}` |
| 2 | `get_benchmark_history` | Benchmark **name** instead of `bbg_id` (`"MSCI World"`) | `{"status":"success","row_count":0,"returns":[]}` |

**Exactly two confirmed instances**, both in the AM-05/AM-06 tool groups, both structurally identical: a `WHERE`-clause miss returning an empty row set with `status: success` rather than distinguishing "not found" from "legitimately no rows." This strongly suggests both trace back to the same underlying `DatalakeApi` query helper not raising on zero-row results. **Not found elsewhere** in the KS-1076–1078 catalogue (query_fund_manager, get_data, calculate_liquidity_cost, ratings tools, and the introspection tools all correctly distinguish "not found" from a real error or return an honest empty result with an explanatory message rather than silent `success`).

*(Footnote, out of this ticket's counted scope but the same defect class: KS-1072/AM-03 found `Search_Funds` and related tools correctly avoid this pattern — empty string and whitespace-only queries both produce explicit "search_text is required" errors, not silent full-table returns. That's a positive contrast worth keeping in mind during AM-14 triage: the search tools got this right; the returns/benchmark tools didn't.)*

---

## Overall verdict

| AC bullet | Result |
|---|---|
| Every error catalogued by tool/input class | **Done** — 22 entries above |
| Each rated Actionable/Informative/Terse | **Done** |
| ≥80% Actionable or Informative | **Fail — 72.7% measured** |
| No raw SQL/stack traces/internal paths/hostnames/connection strings | **Fail — 2 confirmed violations** (#17, #18) |
| O7 dispositioned | **Done — confirmed, isolated to `fund_analyzer`** |
| Recovery candidates where expected | **Fail — 5 of 7 scenarios offer none**, 2 model examples identified |
| Silent-empty-success full list | **Done — exactly 2 instances found** |

**KS-1079 / AM-10 verdict: FAIL.** Three of seven AC bullets fail outright, with quantified evidence for each. The good news for remediation: the failures cluster into a small number of shared root causes (one query-helper pattern behind both silent-empty-successes, one masking pattern behind three "inverted dates → no data" messages, and two isolated raw-leak bugs in `list_tables`/`describe_table`) — fixing 3–4 code paths would resolve the large majority of what's catalogued here.

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1079 — this is the first test pass on this ticket, and the first time these 22 errors have been assembled into a single catalogue with quantified ratings. Recommend this catalogue feed directly into AM-14 (triage) rather than being re-derived there.
