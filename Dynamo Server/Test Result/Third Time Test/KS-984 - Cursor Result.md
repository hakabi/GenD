# KS-984 — Cursor QA Result (Third Time Test)

## Dynamo MCP Security QA — Execute AUTH suite: unauthenticated, token replay, scope, tenant isolation (Section 7.1 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-984](https://gendvn.atlassian.net/browse/KS-984) |
| **Story** | US-E4-01 — Execute AUTH suite: unauthenticated, token replay, scope, tenant isolation |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing (KS-1000) |
| **Scope executed** | Guide v1.5 section **7.1** — AUTH-01, AUTH-02, AUTH-04, AUTH-05 (live); AUTH-03 not executable |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **7.1**; stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tools under test** | `get_funds`, `get_fund_description`, `read_data` (primary AUTH-05 legs); full 10-tool inventory verified |
| **Overall result** | **PASS (AUTH-01, AUTH-02, AUTH-04, AUTH-05 domain tools) / OPEN FINDING (VULN-01, VULN-02 on `read_data`) / NOT EXECUTABLE (AUTH-03)** |

---

## Summary

Section **7.1** AUTH scenarios **pass** for gateway authentication, tenant-consistency checks, and domain-tool parameter tampering while the Conceptia Dynamo MCP connector was **Connected**. Two consecutive `get_funds` calls with `limit: 5`, `offset: 0` returned **byte-identical** business payloads and `totalRecords` **979**.

**AUTH-01 / AUTH-02** pass via HTTP unauthorized probes at the MCP gateway (**401** + explicit JSON for missing auth and invalid Bearer) — same evidence pattern as KS-977 §2.A.

**AUTH-05** domain-tool probes (SQL injection in `fundName`, invalid fund identifiers) return **safe-empty** results with no stack traces. **`read_data` DROP** is **blocked** with `SECURITY_VALIDATION_FAILED`. **`read_data` is live** in v1.5 — the AUTH-05 `read_data` leg was executed this run.

**VULN-01 / VULN-02** on `read_data` are **confirmed open HIGH findings** — not counted as AUTH passes. Cross-join `sys.tables` bypass succeeds; unbounded `SELECT * FROM Fund` returns full table. Track per guide §1.5 until vendor fix.

**v1.5 inventory:** Cursor MCP registry exposes **10 tools**. `search_aloha_funds` remains **absent** (removed prior to v1.4) — **n/a** for AUTH-04 Aloha scope checks.

---

## v1.5 requirements executed (KS-984)

| v1.5 requirement | Status |
|---|---|
| **A.** Preconditions — MCP connected; 10-tool inventory | **PASS** |
| **AUTH-01** — Unauthenticated SSE connection | **PASS** (HTTP 401) |
| **AUTH-02** — Invalid / expired Bearer token | **PASS** (HTTP 401) |
| **AUTH-03** — Out-of-scope role / second identity | **NOT EXECUTABLE** — no second Azure AD principal |
| **AUTH-04** — Tenant isolation (two-call consistency) | **PASS** — 979 records, identical payloads |
| **AUTH-05** — Parameter tampering on domain tools | **PASS** — safe-empty / validation errors |
| **AUTH-05** — `read_data` destructive SQL blocked | **PASS** — DROP rejected |
| **AUTH-05** — VULN-01 / VULN-02 probes on `read_data` | **OPEN FINDING** — not auth pass |
| **search_aloha_funds** removed from scope | **n/a** — tool absent from registry |

---

## Test execution

### Preconditions — 10-tool inventory (v1.5 §A)

| # | Tool | In v1.5 inventory | Registered in Cursor session | AUTH scope |
|---:|---|:---:|:---:|---|
| 1 | `analyze_notes` | Yes | Yes | Out of scope (minimal AUTH) |
| 2 | `describe_table` | Yes (HIGH) | Yes | Not invoked this ticket |
| 3 | `get_activity` | Yes | Yes | Not invoked this ticket |
| 4 | `get_documents` | Yes | Yes | Not invoked this ticket |
| 5 | `get_fund_description` | Yes | Yes | AUTH-05 |
| 6 | `get_funds` | Yes | Yes | AUTH-04, AUTH-05 |
| 7 | `get_notes` | Yes | Yes | Not invoked this ticket |
| 8 | `list_table` | Yes (HIGH) | Yes | Not invoked this ticket |
| 9 | `llm_text_analysis` | Yes | Yes | Not invoked this ticket |
| 10 | `read_data` | Yes (HIGH — VULN-01/02) | Yes | AUTH-05 (live) |
| — | `search_aloha_funds` | Removed prior to v1.4 | Absent | **n/a** |

**Connector state:** Connected / Ready (OAuth session active).

---

### AUTH-01 — Unauthenticated SSE connection: **PASS**

**Method:** `curl.exe` to `https://mcp.conceptia.com/dynamo/sse` with `Accept: text/event-stream`. **No** production tokens logged.

| Case | Request | HTTP | Response body (verbatim) | Data leaked? |
|---|---|---:|---|---|
| **AUTH-01** | No `Authorization` header | **401** | `{"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}` | **No** |

**Verdict:** **PASS** — explicit auth error; no fund rows or tool data.

---

### AUTH-02 — Invalid Bearer token: **PASS**

| Case | Request | HTTP | Response body (verbatim) | Data leaked? |
|---|---|---:|---|---|
| **AUTH-02** | `Authorization: Bearer invalid_token_for_test` | **401** | `{"error":"invalid_token","error_description":"Bearer token validation failed."}` | **No** |

**Verdict:** **PASS** — token rejected with clean JSON error (same pattern as KS-977 §2.A).

**Note:** Full expired-token replay (captured JWT) remains **NOT EXECUTABLE** in Cursor automated mode — KS-984-GAP-03 persists.

---

### AUTH-04 — Tenant isolation (two-call consistency): **PASS**

**Tool parameters:** `get_funds` with `{ "limit": 5, "offset": 0 }` — invoked twice.

| Call | Result | Notes |
|---|---|---|
| Call 1 | **PASS** | `success: true`, 5 rows, `totalRecords: 979` |
| Call 2 | **PASS** | Same parameters; payload **matches** Call 1 for all compared fields |

#### Response envelope (both calls — equivalent)

- `success`: `true`
- `recordCount`: **5**
- `totalRecords`: **979**
- `offset`: **0**, `limit`: **5**
- `hasMore`: **true**

#### Fund rows (Call 1 and Call 2 — identical)

| # | Name | AssetClassName | PipelineStatus | FundManagerName |
|---:|---|---|---|---|
| 1 | 2026 Fund | Private Equity | 1 - Pre-One Pager | Phoenix Equity |
| 2 | 36 South | Absolute Return | X - Exited | 36 South Capital Advisors |
| 3 | 59 North Partners, LP | Absolute Return | P - Portfolio | 59 North Capital Management |
| 4 | 5AM Ventures IV, LP | Private Equity | X - Exited | 5AM Ventures |
| 5 | 5AM Ventures V, L.P. | Private Equity | X - Exited | *(null)* |

**Verdict:** **PASS** — consistent authorized tenant scope; no cross-tenant bleed observed.

---

### AUTH-05 — Parameter tampering: **PASS** (domain tools) / **OPEN FINDING** (`read_data` VULN probes)

#### AUTH-05a — `get_funds` SQL injection: **PASS**

| Probe | Parameter | Result |
|---|---|---|
| SQL injection | `fundName: "'; DROP TABLE Fund; --"` | `totalRecords: 0`, `data: []` — safe empty, no SQL error, no stack trace |

#### AUTH-05b — `get_fund_description` invalid fund: **PASS**

| Probe | Parameter | Result |
|---|---|---|
| Invalid fund | `fundName: "ZZZNONEXISTENTFUND99999"` | `totalRecords: 0`, `data: []` — safe empty, no error stack |

#### AUTH-05c — `read_data` destructive SQL: **PASS**

| Probe | Query | Result |
|---|---|---|
| DROP blocked | `DROP TABLE Fund` | `SECURITY_VALIDATION_FAILED` — destructive statement rejected |

#### AUTH-05d — `read_data` VULN-01 (join bypass): **OPEN FINDING — not auth pass**

| Probe | Query | Expected (secure) | Actual |
|---|---|---|---|
| VULN-01 | `SELECT TOP 5 T.name FROM Fund F, sys.tables T` | Blocked — `sys.tables` not on allowlist | **NOT blocked** — `sys.tables` row data returned (`NotificationSubscription_L_Notificationsvia` × 5) |

**Classification:** **Open HIGH finding** per guide §1.5 / [KS-1023](https://gendvn.atlassian.net/browse/KS-1023). Documented for vendor tracker — **does not pass AUTH-05 escalation rejection intent**.

#### AUTH-05e — `read_data` VULN-02 (unbounded query): **OPEN FINDING — not auth pass**

| Probe | Query | Expected (secure) | Actual |
|---|---|---|---|
| VULN-02 | `SELECT * FROM Fund` | Blocked or row-capped | **NOT blocked** — full table returned (2143 records in truncated capture) |

**Classification:** **Open MEDIUM/HIGH finding** per guide §1.5 / [KS-1024](https://gendvn.atlassian.net/browse/KS-1024). Documented for vendor tracker — **does not pass AUTH-05 scope validation intent**.

---

### AUTH-03 — Out-of-scope role: **NOT EXECUTABLE**

**Reason:** No second Azure AD principal with restricted Dynamo scope provisioned. KS-984-GAP-01 persists across all test runs.

---

### Positive control — authenticated session after HTTP probes

`get_funds` with `{ "limit": 5, "offset": 0 }` via **`user-conceptia-dynamo`** after AUTH-01/02 curls still returned **`success: true`** with the same five-fund page — HTTP probes do not invalidate Cursor's stored OAuth session.

**Verdict:** **PASS**

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| Unauthenticated data leakage (AUTH-01/02) | **None** — 401 JSON only |
| SQL errors or stack traces in AUTH-05 probes | **None** |
| Cross-tenant fund data (AUTH-04) | **None** |
| `read_data` DROP / destructive SQL | **Blocked** — `SECURITY_VALIDATION_FAILED` |
| VULN-01 — `sys.tables` via join bypass | **OPEN** — data returned (not auth pass) |
| VULN-02 — unbounded `SELECT * FROM Fund` | **OPEN** — full table returned (not auth pass) |

**Security verdict:** **PASS** on AUTH scenarios; **OPEN FINDINGS** tracked separately for VULN-01/02

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| VULN-01 | **High** | `read_data` join-based allowlist bypass — `sys.tables` accessible via cross-join with allowlisted `Fund`. KS-1023 | **OPEN — confirmed this run; not auth pass** |
| VULN-02 | **High** | `read_data` no server-side row limit — `SELECT * FROM Fund` returns full table (2143 records). KS-1024 | **OPEN — confirmed this run; not auth pass** |
| KS-984-GAP-01 | Open gap | AUTH-03 not executable — no second Azure AD identity | **Persists** |
| KS-984-GAP-03 | Open gap | AUTH-02 — no real expired JWT replay mechanism in Cursor | **Persists** |
| F-01 | Low | `get_funds` list projection omits Fund GUID; use Name or `get_fund_description` | **Persists** |
| N-01 | Info | `totalRecords` **979** (+1 vs 2026-05-13 second run); first-five row set unchanged | **Informational** |
| N-02 | Info | `search_aloha_funds` removed — AUTH Aloha scope checks **n/a** | **By design** |

---

## Test matrix row — Section 7.1 AUTH (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Scope / tenant | VULN probe |
|---|---|---|---|---|---|
| **AUTH-01** (no auth) | n/a | n/a | **P** | n/a | n/a |
| **AUTH-02** (invalid Bearer) | n/a | n/a | **P** | n/a | n/a |
| **AUTH-03** (out-of-scope role) | **S** | **S** | n/a | n/a | n/a |
| **AUTH-04** (`get_funds` consistency) | **P** | n/a | n/a | **P** | n/a |
| **AUTH-05** (`get_funds` / `get_fund_description`) | **P** | **P** | n/a | n/a | n/a |
| **AUTH-05** (`read_data` DROP) | n/a | **P** | n/a | n/a | n/a |
| **AUTH-05** VULN-01 / VULN-02 | n/a | n/a | n/a | n/a | **F (open)** |

*Per guide v1.5: VULN-01/02 expected **F (open vulnerability)** until vendor fix — tracked separately from AUTH pass criteria.*

---

## Comparison across test runs

| Dimension | First (2026-04-24) | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|---|
| Guide version | v1.3 | v1.4 | **v1.5** |
| Tool inventory | 3 tools | 7 tools | **10 tools** |
| AUTH-01/02 HTTP 401 | PASS | PASS | **PASS** |
| AUTH-04 `totalRecords` | 977 | 978 | **979** |
| AUTH-05 SQL injection (domain) | PASS | PASS | **PASS** |
| AUTH-05 `read_data` | PASS (v1.3) | S (not registered) | **PASS (DROP) / OPEN (VULN-01/02)** |
| `search_aloha_funds` | Available | Removed | **n/a — absent** |
| MCP connector | Connected | Connected | **Connected** |

---

## Evidence

| Item | Detail |
|---|---|
| **Primary tools** | `get_funds` × 2 — `{ "limit": 5, "offset": 0 }`; AUTH-05 probes on `get_fund_description`, `read_data` |
| **Unauthorized probes** | `curl.exe` AUTH-01/02 (synthetic Bearer only) |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **VULN probes** | `SELECT TOP 5 T.name FROM Fund F, sys.tables T`; `SELECT * FROM Fund`; `DROP TABLE Fund` |
| **Tools not invoked** | `list_table`, `describe_table`, `get_activity`, `get_notes`, `get_documents`, `analyze_notes`, `llm_text_analysis` |
| **Black-box rule** | No Dynamo UI accessed |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-984 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| AUTH-01 unauthenticated rejection | **PASS** |
| AUTH-02 invalid Bearer rejection | **PASS** |
| AUTH-04 two-call tenant consistency | **PASS** |
| AUTH-05 domain-tool parameter tampering | **PASS** |
| AUTH-05 `read_data` DROP blocked | **PASS** |
| 10-tool v1.5 inventory documented | **PASS** |
| VULN-01 / VULN-02 documented as open findings | **RECORDED — F (open)** |
| AUTH-03 out-of-scope role | **NOT EXECUTABLE** |
| No credential leakage | **PASS** |

**Final result: PASS (AUTH scenarios) with VULN-01/02 documented as open HIGH findings / NOT EXECUTABLE (AUTH-03)**

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-984 · Guide: `dynamo-mcp-testing-guide_v1.5.md` §7.1*
