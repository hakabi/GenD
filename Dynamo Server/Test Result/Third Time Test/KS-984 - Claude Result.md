# KS-984 — Claude QA Result (Third Time Test — Live Retest)
## Dynamo MCP Security QA — Execute AUTH suite: unauthenticated, token replay, scope, tenant isolation

| Field | Value |
|---|---|
| **Ticket** | [KS-984](https://gendvn.atlassian.net/browse/KS-984) |
| **Story** | US-E4-01 — Execute AUTH suite: unauthenticated, token replay, scope, tenant isolation |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing (KS-1000) |
| **Guide ref** | Section 7.1 — AUTH · **Guide v1.5** |
| **Test run** | Third Time Test — Live Retest (server reconnected) |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `get_funds`, `get_fund_description`, `get_documents`, `get_notes`, `get_activity`, `read_data`, `describe_table`, `list_table` (v1.5 10-tool inventory) |
| **Overall result** | **PASS (AUTH-04, AUTH-05a–e, g, h) / FAIL (AUTH-05f VULN-01 Critical, VULN-02 High) / NOT EXECUTABLE (AUTH-02, AUTH-03)** |

---

## Summary

The Dynamo MCP server reconnected mid-session on 2026-05-21. All 10 v1.5 tools are registered and callable. Full AUTH suite executed live.

**Key outcomes:**

- **AUTH-04 (tenant isolation):** Two identical `get_funds` calls returned `totalRecords: 979` with byte-identical fund sets. PASS.
- **AUTH-05a–e (parameter tampering, 5 tools):** All SQL/command injection probes returned safe-empty results with no stack traces. PASS.
- **AUTH-05f `read_data` — VULN-01 CRITICAL FAIL:** `SELECT TOP 5 T.name FROM Fund F, sys.tables T` was NOT blocked. Server returned `sys.tables` data (`NotificationSubscription_L_Notificationsvia` × 5). KS-1023 is **live and exploitable**.
- **AUTH-05f `read_data` — VULN-02 HIGH FAIL:** `SELECT * FROM Fund` was NOT blocked. Server returned **28,688,411 characters** — confirmed DoS/OOM risk. KS-1024 is **live and exploitable**.
- **AUTH-05g (`describe_table` invalid table):** Returns `{"success":true,"columns":[]}` — silent empty, no error message, no stack trace. Informational.
- **AUTH-05h (`list_table` bare call):** Returns 561 allowlisted tables. Read-only scope confirmed.

---

## Tool Inventory Status (v1.5)

| # | Tool | v1.5 Inventory | Session status | AUTH-05 scope |
|---|---|---|---|---|
| 1 | `get_funds` | ✅ Yes | ✅ Connected | ✅ AUTH-05a |
| 2 | `get_fund_description` | ✅ Yes | ✅ Connected | ✅ AUTH-05b |
| 3 | `get_documents` | ✅ Yes | ✅ Connected | ✅ AUTH-05c |
| 4 | `get_notes` | ✅ Yes | ✅ Connected | ✅ AUTH-05d |
| 5 | `get_activity` | ✅ Yes | ✅ Connected | ✅ AUTH-05e |
| 6 | `analyze_notes` | ✅ Yes | ✅ Connected | Out of scope (minimal AUTH) |
| 7 | `llm_text_analysis` | ✅ Yes | ✅ Connected | Out of scope (minimal AUTH) |
| 8 | `describe_table` | ✅ Yes (restored) | ✅ Connected | ✅ AUTH-05g |
| 9 | `list_table` | ✅ Yes (restored) | ✅ Connected | ✅ AUTH-05h |
| 10 | `read_data` | ✅ Yes (restored) | ✅ Connected | ✅ **AUTH-05f — VULN-01/02 FAIL** |
| — | `search_aloha_funds` | ❌ Removed | n/a | Removed from AUTH-04 |

---

## Test Execution

### AUTH-01 — Unauthenticated SSE connection: CARRY-FORWARD ✅

**Sandbox probe:** curl exit code 56 (no network path from sandbox).

**Carry-forward evidence (First Test 2026-04-24):** HTTP 401 Unauthorized with `WWW-Authenticate: Bearer resource_metadata=...` confirmed via direct PowerShell probe. No unauthenticated access granted.

**Status:** CARRY-FORWARD PASS — First Test evidence valid.

---

### AUTH-02 — Replay captured / expired OAuth token: NOT EXECUTABLE ⚠️

No mechanism to capture, expire, or replay a bearer token in Cowork mode. KS-984-GAP-03 persists.

---

### AUTH-03 — Invoke tool outside authorized scope: NOT EXECUTABLE ⚠️

No second Azure AD principal provisioned. KS-984-GAP-01 persists.

---

### AUTH-04 — Tenant isolation (two-call consistency): PASS ✅

| Call | totalRecords | First fund | Last fund (of 10) | Match |
|---|---|---|---|---|
| Call 1 | 979 | 2026 Fund | 83North IV Limited Partnership | — |
| Call 2 | 979 | 2026 Fund | 83North IV Limited Partnership | ✅ Byte-identical |

**Observations:** `totalRecords` increased from 978 (2nd test 2026-05-14) to **979** — one fund added since last test. Both calls return identical ordered set with no cross-tenant data.

**Status:** PASS ✅

---

### AUTH-05 — Parameter tampering across all in-scope tools

#### AUTH-05a — `get_funds` SQL injection: PASS ✅

**Probe:** `fundName: "'; DROP TABLE Fund; --"`
**Result:** `{"totalRecords":0,"data":[]}` — safe empty, no error, no stack trace.

#### AUTH-05b — `get_fund_description` SQL injection: PASS ✅

**Probe:** `fundName: "'; DROP TABLE Fund; --"`
**Result:** `{"totalRecords":0,"data":[]}` — safe empty, no error, no stack trace.

#### AUTH-05c — `get_documents` bare call + SQL injection: PASS ✅

**Probe 1:** No filters → `{"success":false,"message":"At least one filter is required: filterType/filterValue, documentCategories, or startDate/endDate"}` — clean mandatory-filter error, no internals.

**Probe 2:** `filterValue: "'; EXEC xp_cmdshell('whoami'); --"` → `{"totalRecords":0,"data":[]}` — safe empty.

#### AUTH-05d — `get_notes` wildcard categories: PASS ✅

**Probe:** `activityCategories: ["*"]`
**Result:** Returns 161,418 total activities (all categories). No secrets, no credential material, no injected instructions in returned content. Wildcard behavior is documented feature.

#### AUTH-05e — `get_activity` SSRF probe: PASS ✅

**Probe:** `fundNames: ["http://169.254.169.254/latest/meta-data/"]`
**Result:** `{"totalRecords":0,"data":[]}` — safe empty, normal response latency. No SSRF indicators.

#### AUTH-05f — `read_data` VULN-01/02 probes: FAIL ❌ CRITICAL / HIGH

**Probe (happy path):** `SELECT TOP 5 ID, Name, DateCreated FROM Fund` → Returns 5 Fund rows correctly. Authorized query confirmed working. PASS.

**Probe VULN-01 (KS-1023 Critical):** `SELECT TOP 5 T.name FROM Fund F, sys.tables T`

**Result: FAIL ❌ — sys.tables data returned:**
```json
[{"name":"NotificationSubscription_L_Notificationsvia"},
 {"name":"NotificationSubscription_L_Notificationsvia"},
 {"name":"NotificationSubscription_L_Notificationsvia"},
 {"name":"NotificationSubscription_L_Notificationsvia"},
 {"name":"NotificationSubscription_L_Notificationsvia"}]
```
The server did NOT block the cross-join. `sys.tables` data is accessible via implicit cross join with an allowlisted table. The result shows an internal constraint/trigger table name repeated 5 times (cross join produces Fund × sys.tables rows, TOP 5 returns first 5 rows of `T.name`). KS-1023 is **confirmed exploitable**.

**Probe VULN-02 (KS-1024 High):** `SELECT * FROM Fund`

**Result: FAIL ❌ — 28,688,411 characters returned.** Server did not block, truncate, or reject the unbound query. Response exceeded MCP token limit and was written to disk file. Confirmed DoS/OOM vector. KS-1024 is **confirmed exploitable**.

#### AUTH-05g — `describe_table` invalid table name: INFORMATIONAL ℹ️

**Probe:** `describe_table("ZZZINVALID_TABLE_9999")`
**Result:** `{"success":true,"columns":[]}` — Silent empty result. No error message, no stack trace, no internal path disclosure. The server returns success with empty columns for non-existent/non-allowlisted tables.

#### AUTH-05h — `list_table` bare call: PASS ✅

**Result:** 561 allowlisted tables returned (dbo.* tables only). Confirms read-only surface, appropriate scope. `dbo.Fund` confirmed present.

---

## VULN Checklist (v1.5 §7.1 HIGH-risk, `read_data`)

| VULN | Jira | Severity | Probe | Result |
|---|---|---|---|---|
| VULN-01 (join bypass) | [KS-1023](https://gendvn.atlassian.net/browse/KS-1023) | **Critical** | `SELECT TOP 5 T.name FROM Fund F, sys.tables T` | **FAIL ❌ — sys.tables data returned. Escalate per §9.** |
| VULN-02 (no row limit) | [KS-1024](https://gendvn.atlassian.net/browse/KS-1024) | **High** | `SELECT * FROM Fund` | **FAIL ❌ — 28,688,411 chars returned. Confirmed DoS/OOM.** |

---

## Security Scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | ✅ None |
| SQL errors or stack traces in any response | ✅ None |
| Cross-tenant fund data | ✅ None — AUTH-04 tenant isolation confirmed |
| Credential leakage via tool response fields | ✅ None |
| `sys.tables` data via join bypass | ❌ **RETURNED — VULN-01 exploitable (KS-1023)** |
| Unbound query blocked server-side | ❌ **NOT BLOCKED — VULN-02 exploitable (KS-1024)** |

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| VULN-01 | **Critical** | `read_data` join-based allowlist bypass — `sys.tables` data returned via cross join with allowlisted Fund table. KS-1023 | **CONFIRMED EXPLOITABLE — Escalate** |
| VULN-02 | **High** | `read_data` no server-side row limit — 28,688,411 chars returned for `SELECT * FROM Fund`. KS-1024 | **CONFIRMED EXPLOITABLE — Escalate** |
| KS-984-GAP-01 | Open gap | AUTH-03 not executable — no second Azure AD identity provisioned | **Persists — all 3 test runs** |
| KS-984-GAP-02 | Open gap | AUTH-04 — no two-tenant negative proof (single tenant only) | **Persists** |
| KS-984-GAP-03 | Open gap | AUTH-02 — no real expired JWT replay mechanism | **Persists** |
| KS-984-SEC-02 | Medium | `Access-Control-Allow-Origin: *` — carry-forward from First Test | **Carry-forward** |
| N-05 | Low | No rate limiting — 20+ `get_funds` calls in session, zero HTTP 429 or throttle response | **Persists — confirmed this run** |

---

## Test Matrix — Section 7.1 AUTH (v1.5)

| Test | Happy path | Invalid input | Notes |
|---|---|---|---|
| **AUTH-01** (unauthenticated SSE) | CF-P | n/a | First Test: HTTP 401 confirmed |
| **AUTH-02** (token replay) | N/E | n/a | No JWT capture mechanism |
| **AUTH-03** (out-of-scope role) | N/E | N/E | No second identity |
| **AUTH-04** (tenant isolation) | ✅ PASS | n/a | 979 records, byte-identical 2-call |
| **AUTH-05a** `get_funds` | ✅ PASS | ✅ PASS | SQL injection safe-empty |
| **AUTH-05b** `get_fund_description` | ✅ PASS | ✅ PASS | SQL injection safe-empty |
| **AUTH-05c** `get_documents` | ✅ PASS | ✅ PASS | Mandatory-filter error + SQL injection safe |
| **AUTH-05d** `get_notes` | ✅ PASS | ✅ PASS | Wildcard `["*"]` returns all categories, no secrets |
| **AUTH-05e** `get_activity` | ✅ PASS | ✅ PASS | SSRF probe safe-empty |
| **AUTH-05f** `read_data` happy path | ✅ PASS | — | Authorized query returns correctly |
| **AUTH-05f** VULN-01 probe | — | ❌ **FAIL** | sys.tables data returned — KS-1023 |
| **AUTH-05f** VULN-02 probe | — | ❌ **FAIL** | 28M+ chars returned — KS-1024 |
| **AUTH-05g** `describe_table` | ✅ PASS | ✅ PASS (ℹ️) | Invalid table → silent empty, no error |
| **AUTH-05h** `list_table` | ✅ PASS | n/a | 561 tables, read-only |

---

## Comparison Across All Test Runs

| Dimension | First Test (2026-04-24) | Second Test (2026-05-14) | Third Test (2026-05-21) |
|---|---|---|---|
| Guide version | v1.3 | v1.4 | **v1.5** |
| Tool inventory | 3 tools | 7 tools | **10 tools** |
| AUTH-04 `get_funds` totalRecords | 977 | 978 | **979** |
| AUTH-05 SQL injection (5 tools) | PASS | PASS | **PASS** |
| AUTH-05f `read_data` happy path | PASS (v1.3) | S (not registered v1.4) | **PASS** |
| VULN-01 join bypass | Not tested | Not tested | **FAIL ❌ CRITICAL** |
| VULN-02 no row limit | Not tested | Not tested | **FAIL ❌ HIGH** |
| AUTH-05g `describe_table` invalid | N/A | N/A | **PASS (silent empty)** |
| AUTH-05h `list_table` bare call | N/A | N/A | **PASS (561 tables)** |
| MCP server state | Connected | Connected | **Connected** |

---

## Verdict

**Final result: PASS (AUTH-04, AUTH-05a–e, AUTH-05g, AUTH-05h) / FAIL (VULN-01 Critical, VULN-02 High) / NOT EXECUTABLE (AUTH-02, AUTH-03)**

VULN-01 and VULN-02 are confirmed live vulnerabilities on the connected server. Escalate per KS-1023 (Critical) and KS-1024 (High). All other AUTH cases pass. Structural gaps (AUTH-02, AUTH-03) persist unchanged.

---

*Generated: 2026-05-21 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-984 v1.5 live retest · Guide: dynamo-mcp-testing-guide_v1.5.md §7.1*
