# KS-1078 Cursor Result — Verify the datalake introspection and query tools

> **Story:** [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) · **Draft ID:** AM-09 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~08:01–08:37 UTC  
> **Status:** **FAIL**

---

## Verdict summary

| Tool | Happy path | Edge / AC | Verdict |
|---|---|---|---|
| `show_schemas` | **P** — 8 schemas | Response embeds `"sql":"SHOW SCHEMAS"` | **PASS** with SQL-echo note |
| `list_tables` | **P** — 28 tables in `solovis` | Invalid schema → `"unhashable type: 'dict'"` | **FAIL** |
| `describe_table` | **P** — 78 cols for `fund_manager` | Invalid table → **success status** + full Trino/MongoDB stack | **FAIL** (NEW-16) |
| `get_data` | Cap bound; empty filter OK; DDL rejects; `rating_detail` blocked | `fund_ror` at cap: `truncated:false` | **FAIL** (NEW-17) |
| `health_check` | **P** — v0.9.5 + uptime | — | **PASS** |
| `get_user_info` | — | O4 — no email | Finding (carry) |
| `smpublic_main_v3` | — | Flask “Working outside of request context” | **FAIL** (O10) |

Pass rate well under 80% of tools clean → **FAIL**.

⚠️ Escalation note (ticket clause): NEW-16 reveals infrastructure (Trino + MongoDB catalog prefix + Java stack). No credentials/connection strings. Flagged for QA lead; cycle not unilaterally halted.

---

## Acceptance criteria matrix

| AC | Result | Notes |
|---|---|---|
| `show_schemas` returns list | **P** | 8 schemas |
| `list_tables` valid / invalid | **P** / **F** | Invalid → Python TypeError string |
| `describe_table` valid / invalid | **P** / **F** | Invalid leaks stack; **status success** |
| `get_data` 1000-row cap | Partial | Cap enforced; **truncated flag wrong** (NEW-17) |
| Omit `filter_cond` not unbounded | **P** | 695 rows, `row_limit:1000` |
| Empty-string `filter_cond` | **P** | Same row_count 695 as omit |
| Reject `;` / comments / UNION / DDL | **P** | Clean allowlist-style errors |
| Block `rating_detail` | **P** | Names alternative tools |
| No raw SQL / stacks / infra | **F** | SQL echoed; NEW-16 stack + `mongodb.` |
| `health_check` version + uptime | **P** | 0.9.5 / ~1.2M s |
| `smpublic_main_v3` (O10) | **F** | Non-functional over MCP |

---

## Tests

### `show_schemas`
8 schemas: evestment, gend_ks_db, information_schema, investment_data, ks_model, pipeline, raw, solovis. Response includes `"sql":"SHOW SCHEMAS"` — AC “no raw SQL” technically violated (echo of command, not a leak of secrets).

### `list_tables`
| Input | Result |
|---|---|
| `solovis` | 28 tables — **P** |
| `not_a_real_schema_xyz` | `status:error`, `error:"unhashable type: 'dict'"` — **F** (not a clear schema-not-found) |

### `describe_table`
| Input | Result |
|---|---|
| `solovis.fund_manager` | 78 columns — **P** |
| `solovis.not_a_real_table_xyz` | `status:"success"` with error object in `rows[0].message` including full `io.trino…` stack and message `Table 'mongodb.solovis.not_a_real_table_xyz' does not exist` — **NEW-16** |

### `get_data`
| Input | Result |
|---|---|
| `fund_manager`, no filter | row_count **695**, truncated **false**, row_limit 1000, ~2.2 MB — **P** (under cap) |
| `filter_cond=""` | row_count **695** identical — **P** |
| `fund_ror` + `fund_id IS NOT NULL` | row_count **1000**, truncated **false** — **NEW-17** |
| `rating_detail` | Blocked with alternative tool names — **P** |
| `filter_cond` with `;` / UNION / `--` | Rejected with clear messages — **P** |

### `health_check` / `get_user_info` / `smpublic_main_v3`
- health: application FAD, version **0.9.5**, healthy, uptime_seconds ~1,208,437 — **P**
- get_user_info: O4 no email — carry
- smpublic_main_v3: Flask request-context error — **O10 confirmed**

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| **NEW-16** | Invalid `describe_table` returns **success** + Trino/Java stack revealing MongoDB connector | **S2 High** |
| **NEW-17** | `truncated:false` when `row_count==row_limit==1000` on `fund_ror` | **S2 High** |
| list_tables invalid | Raw `"unhashable type: 'dict'"` | S3 Medium |
| **O10** | `smpublic_main_v3` non-functional over MCP | S3 Medium |
| SQL echo | Introspection tools return executed `sql` string in success payloads | S3 / AC strict |
| Wide-table payload | `fund_manager` ~2.2 MB under 1000-row cap | Medium → AM-12 |

---

## Recommendation

Mark KS-1078 **FAIL**. Sanitize `describe_table` / `list_tables` errors; fix `truncated`; remove or wrap `smpublic_main_v3`. Feed to AM-10 / AM-12 / AM-14. Confirm NEW-16 escalation with QA lead (infra disclosure, not credentials).
