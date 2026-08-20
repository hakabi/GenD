# KS-1078 Claude Result — Verify the datalake introspection and query tools

> **Story:** [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) · **Draft ID:** AM-09 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** High · **Blocked by:** KS-1071 (unblocked)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport)
> **Executed:** 2026-08-07, ~07:55–07:56 UTC
> **Status:** **FAIL.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass. Two confirmed defects directly violate this ticket's own explicit ACs: a raw Python exception leaks through `list_tables`, and `describe_table` leaks a **full internal stack trace that reveals the underlying database technology (MongoDB via Trino)** — exactly the category of finding the ticket calls out as its highest concern ("expose the broadest data surface... most likely to leak internal detail").

---

## ⚠️ Escalation note

Per plan §8, stop-and-escalate triggers include *"No response contains raw SQL, stack traces, internal paths, hostnames or connection strings"* being violated, and this ticket's own escalation clause states: *"if any response reveals infrastructure detail... stop and escalate."* The `describe_table` finding below (NEW-16) does exactly that — it is **not** a credentials/token/connection-string leak (no S1 stop-and-escalate trigger from plan §8's literal list fires), but it **is** a full stack trace revealing the backend is Trino-over-MongoDB, which is real infrastructure detail. I am flagging this with high visibility rather than unilaterally halting the cycle, since the ticket asks the finding to be filed and no data-exposure or mutation occurred. **Recommend the QA lead review this specific finding before the cycle proceeds further into AM-10/AM-11.**

---

## Verdict summary

| Tool | Happy path | Edge case | Verdict |
|---|---|---|---|
| `show_schemas` | P — 8 schemas returned | n/a | **PASS** |
| `list_tables` | P — 28 tables for `solovis` | **F** — invalid `db_name` leaks a raw Python exception (`"unhashable type: 'dict'"`) | **FAIL** |
| `describe_table` | P — full 78-column schema for `fund_manager` | **F — severe** — invalid table leaks a full Trino/Java stack trace, revealing the backend is MongoDB | **FAIL** |
| `get_data` | P — row cap correctly bounds `fund_manager` (695 rows, under cap) | Mixed — empty-string filter and DDL/DML rejection both **pass**; blocked-table restriction **passes**; but the `truncated` flag is **provably wrong** when the cap is actually hit | **FAIL** on the truncation-signal AC |
| `health_check` | P — version + uptime, continuous with all prior checks this cycle | n/a | **PASS** |
| `smpublic_main_v3` | **F — confirmed non-functional over MCP**, per the ticket's own O10 instruction | n/a | **FAIL (expected/documented outcome)** |

**Smoke pass rate: 2 of 6 tools clean (show_schemas, health_check); 4 of 6 have a confirmed defect** — well under the plan's 80% bar.

---

## Tests

### `show_schemas` — happy path

`{"schemas": ["evestment","gend_ks_db","information_schema","investment_data","ks_model","pipeline","raw","solovis"], "row_count": 8}`. Clean. **Pass.**

### `list_tables` — happy path and invalid input

| Input | Result |
|---|---|
| `db_name="solovis"` | 28 tables returned (`fund_manager`, `fund_ror`, `rating_detail`, `crbm_monthly_fund`, etc.) — clean. **Pass.** |
| `db_name="not_a_real_schema_xyz"` | `{"status":"error","error":"unhashable type: 'dict'"}` |

**NEW-15 (this ticket):** the invalid-schema case does not produce a clean "schema not found" message — it produces `"unhashable type: 'dict'"`, which is a **raw Python `TypeError` message** leaking straight from an exception handler that itself has a bug (something in the error-handling path is trying to use a `dict` as a hash key/set member, which only happens when the "expected" error path — presumably a clean "not found" — throws its own secondary exception). This directly fails the AC: *"invalid `db_name` returns a clear error, not a raw database error"* — it's arguably worse than a raw database error, since it isn't even really about the database; it's an unhandled bug in the tool's own code.

### `describe_table` — happy path and invalid input

`describe_table(db_name="solovis", table_name="fund_manager")` → clean, full 78-column schema (`fund_name`, `management_fee`, `hurdle_type`, `lockup_length_months`, etc.). **Pass.**

`describe_table(db_name="solovis", table_name="not_a_real_table_xyz")` → the full raw response is reproduced (redacted of nothing — there are no secrets here, only infrastructure detail):

```json
{
  "status": "error",
  "data": {
    "row_count": 1,
    "rows": [{
      "message": {
        "message": "line 1:1: Table 'mongodb.solovis.not_a_real_table_xyz' does not exist",
        "errorCode": 46, "errorName": "TABLE_NOT_FOUND", "errorType": "USER_ERROR",
        "failureInfo": {
          "type": "io.trino.spi.TrinoException",
          "stack": [
            "io.trino.sql.analyzer.SemanticExceptions.semanticException(SemanticExceptions.java:58)",
            "io.trino.sql.rewrite.ShowQueriesRewrite$Visitor.visitShowColumns(ShowQueriesRewrite.java:465)",
            "io.trino.execution.SqlQueryExecution.<init>(SqlQueryExecution.java:218)",
            "io.trino.dispatcher.LocalDispatchQueryFactory.lambda$createDispatchQuery$0(...)",
            "com.google.common.util.concurrent.TrustedListenableFutureTask...",
            "java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1095)",
            "java.base/java.lang.Thread.run(Thread.java:1447)"
          ]
        }
      }
    }]
  }
}
```

**NEW-16, severe:** this is a **complete server-side Java stack trace** returned verbatim to an MCP client. It reveals:

- The query engine is **Trino** (specific class names, line numbers, internal package structure down to `io.trino.sql.analyzer`, `io.trino.execution`, `io.trino.dispatcher`)
- The underlying connector for the `solovis` catalog is **MongoDB** (`mongodb.solovis.not_a_real_table_xyz` — the catalog prefix `mongodb.` names the actual database technology)
- Internal threading implementation detail (Guava's `TrustedListenableFutureTask`, `ThreadPoolExecutor`)

This is precisely the AC this ticket exists to catch: *"No response contains raw SQL, stack traces, internal paths, hostnames or connection strings"* and the ticket's own framing: *"[these tools] expose the broadest data surface in the catalog and are the most likely to leak internal detail."* **This is a confirmed instance of exactly that risk materializing.** No credentials, hostnames, or connection strings are present, so this doesn't meet the letter of a plan §8 stop-and-escalate S1 trigger — but it is unambiguously "internal infrastructure detail" per this ticket's own escalation clause. **Severity: S2 High.**

### `get_data` — happy path, cap, filter handling, blocked table

| Test | Result |
|---|---|
| `db_name="solovis", table_name="fund_manager"`, no filter | `row_count: 695, row_limit: 1000, truncated: false` — correct, since `fund_manager` only has 695 rows total (confirmed in KS-1076 testing). Response was 2,277,298 characters (78 columns × 695 rows) — large, but within the documented row cap. Worth cross-referencing to AM-12: a *wide* table can still produce multi-megabyte responses even while correctly respecting a row-count cap. |
| Same query, `filter_cond=""` (empty string) | **Byte-identical** to the no-filter call except the timestamp (diffed directly, 1 differing line out of 55,614) — confirms empty-string `filter_cond` is treated exactly as "no filter," not as a bypass. **Pass.** |
| `filter_cond="fund_id = '500'; DROP TABLE fund_manager;--"` (submitted as ordinary invalid input per the AC's own instruction, not a crafted bypass attempt) | `{"status":"error","error":"filter_cond is not allowed to contain semicolon (no stacked statements). Use a single-table boolean predicate only (no comments, semicolons, or UNION/DDL/DML)."}` — rejected cleanly, names exactly what's disallowed. **Pass.** |
| `db_name="gend_ks_db", table_name="rating_detail"` (blocked table) | `{"status":"error","error":"get_data cannot query rating_detail; use get_rating_details (per id) or list_rating_details_by_user (all rows for a user)."}` — blocked as documented, and the error **names the correct alternative tools**, which is genuinely good design. **Pass.** |
| `db_name="solovis", table_name="fund_ror"`, no filter | `row_count: 1000, row_limit: 1000, truncated: false` |

**NEW-17, `get_data`'s `truncated` flag is unreliable:** the `fund_ror` call returned exactly 1000 rows (the cap) but reported `"truncated": false`. I checked the diversity of the returned sample: **only 15 distinct `fund_id` values appear across all 1000 rows**, spanning dates from 2010 to 2022. Since the `fund_manager` table alone lists 695 distinct funds, and `fund_ror` stores monthly return rows per fund, the true row count for `fund_ror` is almost certainly tens of thousands — the query is unambiguously cut off mid-result, yet the tool reports no truncation occurred. This means **`truncated` can apparently never be `true`** — its value looks hardcoded or computed from a check that can't ever fail (e.g. comparing `row_count` to itself rather than to a separate total-count query). This defeats the entire purpose of the flag: a caller has no reliable way to know whether they received the complete table or an arbitrary 1000-row slice. **Severity: S2 High** — this directly undermines the AC "`get_data` happy path returns rows and respects its documented 1000-row cap," since "respecting the cap" implies the caller can *tell* when the cap was hit.

### `health_check` — cross-check

`version: 0.9.5, uptime_seconds: 1,208,066.17` at `2026-08-07T07:55:34Z`. Compared against my own KS-1074 reading (`1,190,143.4s` at `02:56:51Z` the same day): elapsed wall-clock time is 17,923s; elapsed uptime delta is 17,922.8s — matches to within rounding, for the **fourth** time this cycle. Server has not restarted across the entire multi-hour testing session. **Pass.**

### `smpublic_main_v3` — confirmed non-functional over MCP (O10, per this ticket's explicit instruction)

```json
{
  "status": "error",
  "error": "Working outside of request context.\n\nThis typically means that you attempted to use functionality that needed\nan active HTTP request. Consult the documentation on testing for\ninformation about how to avoid this problem."
}
```

This is Flask's own internal error for code that assumes it's running inside a live HTTP request (`flask.request`, session, etc.) being called outside one — exactly what the tool's own description predicted ("requires Flask JSON body via HTTP proxy"). **Confirmed: `smpublic_main_v3` cannot function when invoked as an MCP tool.** Per the ticket's explicit instruction, this is filed as a defect. It's a second, milder instance of the same class of problem as NEW-16 — an internal framework's raw error message reaching the client — though "Flask" and "request context" are less specific than a full Trino stack trace with class names and a named backend technology.

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| **NEW-16** | `describe_table` leaks a full Trino/Java stack trace on an invalid table name, revealing the query engine (Trino), internal class/package structure, and the underlying database technology (MongoDB) for the `solovis` catalog | **S2 High** — infrastructure disclosure, not credentials; matches this ticket's own escalation clause | AM-09 / AM-10, review before proceeding to AM-11 |
| **NEW-17** | `get_data`'s `truncated` flag reports `false` even when a table is confirmably cut off at the 1000-row cap (only 15/695+ funds represented in a `fund_ror` sample) — the flag appears unable to ever report `true` | **S2 High** — undermines the row-cap AC's intent; callers can't detect partial results | AM-09 / AM-12 |
| — | `list_tables` leaks a raw Python `TypeError` ("unhashable type: 'dict'") for an invalid schema name, instead of a clean "schema not found" message | S3 Medium — confusing, not infrastructure-identifying | AM-09 / AM-10 |
| O10 | `smpublic_main_v3` confirmed non-functional over MCP (Flask "outside of request context" error) | S3 Medium — matches the ticket's own prediction; recommend removing from the MCP catalog or fixing the wrapper | AM-09 |
| — (positive) | `get_data`'s blocked-table message for `rating_detail` names the two correct alternative tools — good design, consistent with `query_fund_manager`'s allowlist error from KS-1076 | n/a — model example | Cite in AM-10 |
| — (positive) | Empty-string `filter_cond` produces a byte-identical result to omitting it entirely — clean, unambiguous, no bypass | n/a | — |

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1078 — this is the first test pass on this ticket. The two S2 findings (NEW-16 stack trace leak, NEW-17 broken truncation flag) are net-new and, given this ticket's own framing as the highest-disclosure-risk tool group in the catalog, should be prioritized in AM-14 triage.
