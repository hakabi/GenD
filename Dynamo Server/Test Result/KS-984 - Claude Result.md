# KS-984 — Test Result: AUTH Suite (§7.1) — **Claude**

| Field | Value |
|---|---|
| **Jira** | [KS-984](https://gendvn.atlassian.net/browse/KS-984) |
| **Summary** | Dynamo MCP Security QA — **AUTH-01–AUTH-05** (unauthenticated access, token rejection, role scope, tenant isolation, parameter tampering) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — Security & Abuse-Case Testing |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§7.1** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Tester / agent** | **Claude** (Sonnet 4.6) — Claude Code VSCode extension |
| **Report date** | 2026-04-24 |

---

## 1. Executive Summary

| ID | Test | Method | Result | Notes |
|---|---|:---|:---:|---|
| **AUTH-01** | Unauthenticated SSE access | Direct HTTP probe | **PASS** | `401`, empty body, no data leaked |
| **AUTH-02** | Invalid/expired bearer token | Direct HTTP probe | **PASS (proxy)** | `401`, empty body; synthetic token rejected cleanly |
| **AUTH-03** | Tool invocation outside authorized scope | — | **N/E** | No second identity or documented admin-only action available |
| **AUTH-04** | Tenant isolation — `get_funds`, `search_aloha_funds` | MCP tool calls (live) | **PASS (behavioral)** | 977 records consistent across two calls; all search results `source: solovis` for this tenant |
| **AUTH-05** | Parameter tampering / scope escalation | MCP tool calls (live) | **PASS** ⚠️ | Destructive SQL and invalid sources blocked; `sys.tables` catalog readable; Elasticsearch error leaks internal infrastructure details |

**Additional HTTP-layer findings (not covered in Cursor run):**

| Finding | Severity | Detail |
|---|:---:|---|
| `Access-Control-Allow-Origin: *` | **Medium** | Wildcard CORS on the SSE endpoint |
| No rate limiting on unauthenticated requests | **Low–Medium** | 20 rapid requests → all `401`, no `429` |
| `X-Powered-By: Express` | **Info** | Server framework disclosed in response headers |
| PKCE `plain` method supported | **Low** | OAuth auth server advertises both `S256` and `plain`; S256-only is best practice |
| Elasticsearch error leaks internal index/node metadata | **Medium** | See §4.5 |

**Overall verdict: PASS with observations.** All executable AUTH tests passed. AUTH-03 not exercised. Two medium-severity findings raised (wildcard CORS, Elasticsearch info disclosure). No critical or blocker issues found.

---

## 2. Ticket Traceability (BDD)

| Scenario | Intent | Claude outcome |
|---|---|---|
| **S1 — Authorized session** | Normal tool calls succeed for authenticated user | **PASS** — `get_funds` returned 977 records; `search_aloha_funds` returned 30 hits, all in-tenant |
| **S2 — AUTH-01/02/03** | Unauthenticated and bad-token requests rejected; out-of-scope roles blocked | **AUTH-01 PASS · AUTH-02 PASS (proxy) · AUTH-03 N/E** |
| **S3 — AUTH-04/05** | Cross-tenant data not accessible; parameter manipulation rejected | **AUTH-04 behavioral PASS · AUTH-05 PASS with observations** |

---

## 3. Test Environment

| Item | Value |
|---|---|
| **Client** | Claude Code (Sonnet 4.6) — VSCode extension, MCP via `mcp-remote` stdio bridge |
| **MCP connection** | `npx mcp-remote https://mcp.conceptia.com/dynamo/sse` · OAuth session via cached `mcp-remote-0.1.37` token |
| **HTTP probe tool** | PowerShell `Invoke-WebRequest` (TLS 1.2/1.3) |
| **Tools used** | `get_funds`, `search_aloha_funds`, `read_data` (live MCP calls) |
| **Baseline fund count** | 977 total records (`get_funds`, two independent calls) |

---

## 4. Execution Detail

### 4.1 AUTH-01 — Unauthenticated SSE GET

**Request:** `GET https://mcp.conceptia.com/dynamo/sse` — no `Authorization` header

**Result:**
```
HTTP 401 Unauthorized
Body length: 0
WWW-Authenticate: Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"
```

**Verdict: PASS** — server correctly rejects unauthenticated access with `401`; response body is empty (no fund data, no token material leaked). `WWW-Authenticate` header correctly advertises the OAuth resource metadata endpoint.

---

### 4.2 AUTH-02 — Rejected Bearer Token (Proxy Test)

**Request:** `GET https://mcp.conceptia.com/dynamo/sse` with `Authorization: Bearer invalid.test.token.replay.ks984`

**Result:**
```
HTTP 401 Unauthorized
Body length: 0
```

**Verdict: PASS (proxy)** — synthetic invalid bearer token rejected cleanly; empty body confirms no partial data leakage on rejection. Note: a literal replay of a real captured expired JWT was not performed to avoid handling live credential material; this constitutes a proxy test only. Full AUTH-02 (expired real token replay) is deferred to a controlled security QA environment.

---

### 4.3 AUTH-03 — Out-of-Scope Role (403)

**Status: Not executed.** Testing this scenario requires either:
- A second Azure AD principal with a documented lower-privilege role, or
- A known admin-only MCP tool or parameter not accessible to the standard tester account

Neither was available in this session. No `403` was triggered on any tool call with the current identity. Follow-up required — see §7.

---

### 4.4 AUTH-04 — Tenant Isolation (Behavioral)

**Call 1 — `get_funds` (limit: 1):**
```json
{
  "success": true,
  "totalRecords": 977,
  "data": [{ "Name": "2026 Fund", "FundManagerName": "Phoenix Equity", "PipelineStatus": "1 - Pre-One Pager", ... }]
}
```

**Call 2 — `get_funds` (limit: 1, repeated for consistency):**
```json
{ "totalRecords": 977 }
```
Total record count is **stable at 977** across two independent calls — no record count inflation or cross-tenant bleeding observable.

**Call 3 — `search_aloha_funds` (search_text: "pe", is_owned_by_ks: true, limit: 5):**
```json
{
  "success": true,
  "message": "Found 30 fund record(s) from Elasticsearch.",
  "data": [ { "source": "solovis", ... }, ... ]
}
```
All 30 results carry `"source": "solovis"` — consistent single-tenant scoping. No cross-tenant `source` values observed.

**Verdict: PASS (behavioral, single-tenant U)** — data is internally consistent and scoped to this tenant's records. A definitive cross-tenant negative proof requires a second test account; that gap is documented in §7.

---

### 4.5 AUTH-05 — Parameter Tampering / Scope Escalation

#### 4.5.1 `read_data` — Destructive SQL blocked

| Query | Result | Verdict |
|---|---|:---:|
| `DROP TABLE Fund` | `"Security validation failed: Query must start with SELECT for security reasons"` · error: `SECURITY_VALIDATION_FAILED` | **PASS** |
| `SELECT TOP 1 FundName, ID FROM dbo.Fund` | `QUERY_EXECUTION_FAILED` (column `FundName` does not exist — expected) | **PASS** |
| `SELECT name FROM sys.tables WHERE name = 'Fund'` | `success: true` · returned `[{"name":"Fund"}]` | **⚠️ Observation** |
| `SELECT 1 UNION SELECT password FROM sys.sql_logins` | `QUERY_EXECUTION_FAILED` | **PASS** |
| `SELECT * FROM ../../etc/passwd` (path traversal style) | `QUERY_EXECUTION_FAILED` | **PASS** |

**sys.tables observation:** The DB principal used by the MCP server has catalog-read access to `sys.tables`. This is not a cross-tenant row leak, but it confirms the MCP service account can enumerate database object names. Flag for review against the §1.4 high-risk tool policy.

#### 4.5.2 `get_funds` — Oversized limit

| Input | Result |
|---|---|
| `limit: 9999999` | `success: false` — limit rejected |

**Verdict: PASS** — boundary input handled gracefully.

#### 4.5.3 `search_aloha_funds` — Invalid `fund_source`

| Input | Result |
|---|---|
| `fund_source: "__INVALID_ESCALATION_KS984__"` | `"Unknown fund_source for Elasticsearch: \"__INVALID_ESCALATION_KS984__\". Use solovis, ALB, aevest, or evest."` |

**Verdict: PASS** — invalid enum value rejected with an explicit allowed-values list (no data returned).

#### 4.5.4 `search_aloha_funds` — SQL-injection-style search_text ⚠️

**Input:** `search_text: "'; DROP TABLE funds; --"`

**Result (truncated):**
```json
{
  "success": false,
  "message": "Elasticsearch search failed on index alb_funds: HTTP 400 {\"error\":{\"root_cause\":[{\"type\":\"query_shard_exception\",\"reason\":\"Failed to parse query ['; DROP TABLE funds; --*]\",\"index_uuid\":\"_p_Tf6K_TnKry_MXeDMWRQ\",\"index\":\"alb_funds_20260424-081526\"}],\"failed_shards\":[{\"node\":\"vK6DemWzS3q51Fa-9oUwPg\",...}]}}"
}
```

**Analysis:** No SQL injection is possible here (this is Elasticsearch, not a SQL backend). However, the raw Elasticsearch error is forwarded verbatim to the MCP client, leaking:
- **Index name:** `alb_funds_20260424-081526`
- **Index UUID:** `_p_Tf6K_TnKry_MXeDMWRQ`
- **Node ID:** `vK6DemWzS3q51Fa-9oUwPg`

This is an **information disclosure** issue. An attacker who can induce query parse errors can map internal Elasticsearch infrastructure (index naming conventions, node identifiers). The error should be caught and returned as a generic message.

**Verdict: PASS on injection resistance · ⚠️ NEW FINDING on error verbosity** (not observed in Cursor run).

---

## 5. HTTP-Layer Security Findings (Beyond §7.1 Scope)

These were collected during AUTH-01/AUTH-02 probes and are reported here for completeness.

### 5.1 Wildcard CORS (`Access-Control-Allow-Origin: *`)

| Header | Value |
|---|---|
| `Access-Control-Allow-Origin` | `*` |
| `Access-Control-Allow-Methods` | `GET, POST, OPTIONS, PUT, DELETE` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization, mcp-protocol-version, Accept` |

A `*` ACAO on an authenticated endpoint means any web origin can attempt cross-origin requests. While Bearer token auth mitigates direct data access (browsers will not send stored tokens cross-origin on a wildcard CORS endpoint), it is contrary to best practice for a service that uses OAuth. Recommend restricting ACAO to the specific allowed origins (e.g. Claude Desktop, Cursor, known MCP client origins).

### 5.2 No Rate Limiting on Unauthenticated Requests

20 rapid `GET /dynamo/sse` requests with no auth → all returned `401` in ~245 ms average with no `429` observed. An attacker could enumerate endpoint behaviour, probe for auth bypasses, or enumerate valid session IDs at high speed without throttling.

### 5.3 `X-Powered-By: Express`

Minor information disclosure. The response header `X-Powered-By: Express` identifies the backend framework. Recommend suppressing with `app.disable('x-powered-by')` in Express configuration.

### 5.4 PKCE `plain` Method Supported

The OAuth authorization server metadata (`/.well-known/oauth-authorization-server`) advertises:
```json
"code_challenge_methods_supported": ["S256", "plain"]
```
Per OAuth 2.1 and current best practice, `plain` PKCE should be removed in favour of `S256`-only. `plain` offers no security benefit over no PKCE, as the verifier is transmitted in the clear in the token request.

### 5.5 TLS — Both 1.2 and 1.3 Work (Positive)

Direct probes confirm TLS 1.2 and TLS 1.3 both accepted; HTTPS enforced (plain HTTP request returned a transport-level error, not an HTTP redirect to plaintext).

---

## 6. Test Matrix (§7.1)

| ID | Test | Happy Path | Invalid Input | Unauthorized User | Network Drop | Large Dataset |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **AUTH-01** | Unauthenticated SSE | **P** | n/a | n/a | n/a | n/a |
| **AUTH-02** | Rejected bearer | **P*** | n/a | n/a | n/a | n/a |
| **AUTH-03** | Out-of-scope role (403) | **N/E** | n/a | **N/E** | n/a | n/a |
| **AUTH-04** | Tenant isolation | **P**† | n/a | **N/E** | n/a | **P** |
| **AUTH-05** | Parameter tampering | **P** ⚠️ | **P** ⚠️ | n/a | n/a | **P** |

\* Proxy test only (synthetic token); real expired token replay deferred  
† Single-tenant behavioral; two-tenant negative proof not available  
⚠️ Passed with observations — see §4.5

---

## 7. Defects / Findings

| ID | Finding | Severity | Suggested Owner |
|---|---|:---:|---|
| **KS-984-CLA-SEC-01** | `search_aloha_funds` forwards raw Elasticsearch error to client, leaking internal index name, UUID, and node ID | **Medium** | MCP backend — wrap ES errors before returning to client |
| **KS-984-CLA-SEC-02** | `Access-Control-Allow-Origin: *` on authenticated SSE endpoint | **Medium** | MCP / infra — restrict ACAO to known client origins |
| **KS-984-CLA-OBS-01** | `read_data` DB principal can read `sys.tables` catalog | **Low / Policy** | Review against §1.4 high-risk tool hardening posture |
| **KS-984-CLA-OBS-02** | No rate limiting on unauthenticated endpoint probes | **Low–Medium** | MCP / infra — add rate limiting / IP-based throttle |
| **KS-984-CLA-OBS-03** | PKCE `plain` method advertised in OAuth server metadata | **Low** | MCP OAuth config — remove `plain`, keep `S256` only |
| **KS-984-CLA-OBS-04** | `X-Powered-By: Express` disclosed in all responses | **Informational** | MCP backend — `app.disable('x-powered-by')` |
| **KS-984-GAP-01** | AUTH-03 not executed — no second identity with documented role boundary | **Open gap** | QA + IdP config owner — define and provision test account |
| **KS-984-GAP-02** | AUTH-04 cross-tenant negative proof not available | **Open gap** | Second test tenant account required |
| **KS-984-GAP-02** | AUTH-02 full expired-token replay not performed | **Open gap** | Controlled security QA with captured JWT in redacted log |

---

## 8. Comparison with Cursor Run

| Area | Cursor | Claude | Delta |
|---|---|---|---|
| AUTH-01 | PASS (401, empty body) | PASS (401, empty body) | Consistent |
| AUTH-02 | PASS proxy | PASS proxy | Consistent |
| AUTH-03 | N/E | N/E | Consistent |
| AUTH-04 | PASS behavioral (977 records, 30 "pe" hits) | PASS behavioral (977 records, 30 "pe" hits, consistency check ×2) | Claude added second consistency call |
| AUTH-05 DROP TABLE | PASS | PASS | Consistent |
| AUTH-05 `sys.tables` | Observed (accessible) | Confirmed | Consistent |
| AUTH-05 `fund_source` | PASS | PASS | Consistent |
| **CORS wildcard** | Not tested | ⚠️ **NEW — Medium** | Claude added HTTP-layer probes |
| **ES error info disclosure** | Not tested | ⚠️ **NEW — Medium** | Claude SQL-injection probe on search_text |
| **Rate limiting** | Not tested | ⚠️ No 429 observed | Claude added 20-request flood probe |
| **PKCE `plain`** | Not tested | ⚠️ New low finding | Claude read OAuth server metadata |
| **X-Powered-By** | Not tested | ⚠️ Informational | Claude read response headers |

---

## 9. Conclusion

**KS-984** §7.1 is **PASS with observations** from this Claude run. All directly executable AUTH tests (AUTH-01, AUTH-02, AUTH-04, AUTH-05) passed their acceptance criteria. AUTH-03 remains not executed pending a second test identity. Two **medium-severity** findings were raised that were not identified in the Cursor run: **wildcard CORS** on the SSE endpoint and **raw Elasticsearch error forwarding** in `search_aloha_funds` that leaks internal index and node metadata. These are recommended for remediation before production deployment.

**Next steps:**
1. Fix **KS-984-CLA-SEC-01** (ES error wrapping) and **KS-984-CLA-SEC-02** (CORS restriction)
2. Provision a second test account to execute AUTH-03 and complete AUTH-04 negative proof
3. Re-run after fixes to confirm resolution

---

*Report: Claude (Sonnet 4.6) · Claude Code VSCode extension · Guide v1.3 · 2026-04-24*
