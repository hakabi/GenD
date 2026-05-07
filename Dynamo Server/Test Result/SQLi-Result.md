# Dynamo MCP Server — SQL Injection Test Report

| Field | Value |
|---|---|
| **Date (UTC)** | 2026-05-05 |
| **Assessor** | Bình Hà Khoa |
| **Agent** | Claude (claude-sonnet-4-6) — Cowork mode |
| **Scope** | SQL injection testing across all accessible filter parameters on the Dynamo MCP server |
| **MCP endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools tested** | `get_funds`, `get_fund_description`, `get_notes`, `get_activity` (filter params); `read_data` not accessible in Cowork connector |

---

## Executive Summary

| Outcome | Detail |
|---|---|
| **Overall verdict** | ⚠️ **PARTIAL PASS with one Critical anomaly** |
| **Critical finding** | **SQLi-02**: `'; DROP TABLE Fund--` payload caused a **180-second server timeout** — abnormal behaviour suggesting the payload reached the SQL layer before being blocked or causing a lock |
| **Other injections** | All other payloads returned 0 results with no error — consistent with parameterized queries rejecting the payload |

---

## Test Case Results

| ID | Target param | Payload | Response | Finding |
|---|---|---|---|---|
| **SQLi-01** | `get_funds.fundName` | `' OR '1'='1` | 0 results, success | ✅ PASS — payload not effective |
| **SQLi-02** | `get_funds.fundName` | `'; DROP TABLE Fund--` | **180s timeout, no response** | ❌ **ANOMALY — see Finding below** |
| **SQLi-03** | `get_funds.fundName` | `'; EXEC xp_cmdshell('whoami')--` | 0 results, success | ✅ PASS — xp_cmdshell not triggered |
| **SQLi-04** | `get_funds.fundName` | `' UNION SELECT name,NULL… FROM sys.tables--` | 0 results, success | ✅ PASS — UNION not reflected |
| **SQLi-05** | `get_funds.fundName` | `%' OR 1=1--` | 0 results, success | ✅ PASS — LIKE bypass not effective |
| **SQLi-06** | `get_funds.fundName` | `'; WAITFOR DELAY '0:0:5'--` | 0 results, ~normal latency | ✅ PASS — time delay not observed |
| **SQLi-07** | `get_notes.companyNames` | `["'; SELECT @@version--", "' OR 1=1--", "'; EXEC xp_cmdshell('id')--"]` | 0 results, success | ✅ PASS — array inputs sanitized |
| **SQLi-08** | `get_funds.fundName` | `' AND 1=CONVERT(int,@@version)--` | 0 results, success | ✅ PASS — error-based not reflected |
| **SQLi-09** | `get_funds.fundName` | `2026' AND '1'='1` vs `2026' AND '1'='2` | Both 0 results | ✅ PASS — no boolean blind differential |
| **SQLi-10** | `get_funds.fundManagerName` | `Phoenix' OR 1=1--` | 0 results, success | ✅ PASS — multi-param injection not effective |
| **SQLi-10b** | `get_activity.subjectSearch` | `'; WAITFOR DELAY '0:0:5'--` | 0 results, ~normal latency | ✅ PASS — time delay not observed |

---

## Finding: SQLi-02 — Server Timeout on DDL Payload

| Field | Detail |
|---|---|
| **ID** | **FINDING-SQLi-01** |
| **Severity** | **High** (anomaly requiring investigation) |
| **Test case** | SQLi-02 |
| **Payload** | `'; DROP TABLE Fund--` injected into `get_funds.fundName` |
| **Observed behaviour** | MCP tool call hung for exactly **180 seconds** then returned a client-side timeout error — no success or error response from server |
| **Expected behaviour** | Either 0 results (payload sanitized) or an immediate error response |
| **Possible explanations** | (1) The payload bypassed parameterization and reached SQL Server, which acquired a lock or attempted DDL and timed out waiting for a lock/transaction. (2) A WAF or middleware intercepted the payload and applied a delay policy. (3) A poorly-handled exception caused the server process to stall. |
| **Risk** | If explanation (1) is correct, the server may be vulnerable to DDL injection via `fundName`, meaning an attacker could attempt destructive operations against the Fund table. Even if the DROP was ultimately blocked by DB-level permissions, the lock behaviour indicates the payload reached the SQL engine. |
| **Recommended action** | (1) Inspect MCP server logs for the exact SQL generated during this request. (2) Confirm all filter parameters use parameterized queries (e.g., `sp_executesql` with typed params). (3) If raw string interpolation is used for LIKE clauses, switch to parameterized LIKE immediately. (4) Confirm SQL Server login used by MCP has no DDL permissions (no `ALTER`, `DROP`, `CREATE` grants). |
| **Re-test** | After fixing: re-run SQLi-02 and confirm response is immediate (0 results, <1s latency). |

---

## Analysis: Why Most Payloads Returned 0 Results

The consistent pattern of 0 results (rather than an error) across SQLi-01, 03–10 is characteristic of **parameterized queries with LIKE wrapping**, where:

- The injected string is treated as a literal value inside `WHERE Name LIKE @param`
- The `'`, `--`, `;` characters are escaped as part of the parameter binding
- No SQL syntax is injected; the LIKE match simply finds nothing

This is the **correct and expected behaviour** for a properly parameterized implementation.

The **exception is SQLi-02** — the `DROP TABLE` keyword combination caused a behavioural anomaly not seen with any other payload, which warrants server-side log review before marking the filter parameters as fully safe.

---

## Coverage Gap: `read_data` Not Tested

`read_data` accepts a raw SQL query string and was the **highest-priority target** per the test plan. This tool is not exposed in the Cowork connector and could not be tested in this session. Prior evidence (FINDING-04, KS-987) already confirmed `read_data` allowed unrestricted `SELECT` on `dbo.User`.

**Outstanding SQLi tests for `read_data`** (to be run from Claude Desktop or a direct MCP client):

| ID | Payload |
|---|---|
| SQLi-r01 | `'; DROP TABLE Fund--` |
| SQLi-r02 | `'; EXEC xp_cmdshell('whoami')--` |
| SQLi-r03 | `' UNION SELECT name,NULL FROM sys.tables--` |
| SQLi-r04 | `'; INSERT INTO dbo.User (Username,Password) VALUES ('attacker','hash')--` |
| SQLi-r05 | `'; WAITFOR DELAY '0:0:10'--` |

---

## Recommendations

1. **[Urgent]** Review MCP server logs for the SQLi-02 timeout — confirm whether `'; DROP TABLE Fund--` reached the SQL engine or was intercepted upstream.
2. **[High]** Audit all filter parameter construction in the MCP server source — ensure every param uses `sp_executesql` or ORM parameterization, not string concatenation.
3. **[High]** Run the `read_data` SQLi suite above — given FINDING-04 already showed unrestricted access to `dbo.User`, `read_data` must be treated as a critical injection surface.
4. **[Medium]** Confirm SQL Server service account has no DDL permissions (`DROP`, `ALTER`, `CREATE`, `TRUNCATE`) and no `xp_cmdshell` access.
5. **[Medium]** Implement query length and complexity limits on `read_data` to reduce DoS surface.

---

## Next Steps

| Attack vector | Status |
|---|---|
| SQL injection — filter params | ✅ Completed (1 anomaly found) |
| SQL injection — `read_data` | ⏳ Pending (requires Claude Desktop connector) |
| Prompt injection (PIJ-06–10) | ⏳ Pending |
| Stress / DoS testing | ⏳ Pending |
| IDOR / CORS / Auth token abuse | ⏳ Pending |

---

*Assessor: Bình Hà Khoa · Agent: Claude (claude-sonnet-4-6) · 2026-05-05 (UTC)*
*Evidence path: `D:\source\GenD\Dynamo Server\Test Result\`*
