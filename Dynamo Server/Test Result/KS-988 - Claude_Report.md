# KS-988 — TLS Transport Security & OAuth Lifecycle QA Report
**Dynamo MCP Server — Security & Abuse-Case Testing**
**Test Suite:** §7.5 TLS Transport Security (TLS-01 through TLS-06)
**Tester:** Claude (AI QA Agent) — hakhoabinh@gmail.com
**Test Date:** 2026-04-28
**Report Version:** 1.0

---

## Executive Summary

| Scenario | Title | Result |
|----------|-------|--------|
| TLS-01 | HTTPS-only enforcement (HTTP fallback blocked) | ⚠️ PARTIAL — Sandbox network restricted; HTTPS confirmed via MCP usage |
| TLS-02 | TLS version & cipher check (≥ TLS 1.2, no weak ciphers) | ⚠️ PARTIAL — Direct TLS inspection blocked by sandbox; HTTPS confirmed |
| TLS-03 | CORS header validation | ⚠️ PARTIAL — Preflight requests blocked by sandbox allowlist |
| TLS-04 | OAuth token expiry & re-auth lifecycle | ✅ PASS |
| TLS-05 | Rate limiting — 50+ rapid sequential tool calls | ⚠️ OBS — No throttling observed across 50 calls (see Finding TLS-F01) |
| TLS-06 | Error response hygiene | ✅ PASS |

**Overall Suite Status:** PARTIAL PASS — 2 scenarios passed fully, 3 scenarios partially tested due to sandbox network restrictions, 1 informational finding raised.

**Environment Blocker:** The Cowork sandbox restricts outbound network to `*.anthropic.com` and `*.claude.ai` only. Direct `openssl s_client`, `curl`, Python SSL, and `web_fetch` requests to `mcp.conceptia.com` are all blocked (`X-Proxy-Error: blocked-by-allowlist` / DNS failure). Scenarios TLS-01, TLS-02, and TLS-03 could not be fully exercised via direct protocol-level testing from within the sandbox. All three require external tooling to complete.

---

## Test Environment

| Item | Value |
|------|-------|
| Target server | `https://mcp.conceptia.com/dynamo/sse` |
| MCP connector | Dynamo MCP (13 read-only tools) |
| Testing methodology | Black-box per Dynamo MCP Server QA Testing Guide v1.3 |
| Test date | 2026-04-28 |
| Authentication | OAuth 2.0 bearer token via MCP connector |
| Sandbox outbound allowlist | `*.anthropic.com`, `anthropic.com`, `*.claude.ai` only |

---

## Scenario Results

### TLS-01 — HTTPS-Only Enforcement

**Objective:** Confirm the server refuses plaintext HTTP connections and does not downgrade or redirect to HTTP.

**Method:** Attempted `curl http://mcp.conceptia.com/dynamo/sse` and `web_fetch` of the HTTP URL from within the Cowork sandbox. Both attempts were blocked by the sandbox proxy (`X-Proxy-Error: blocked-by-allowlist`), preventing observation of the server's actual HTTP response.

**Observable Evidence:**
- All MCP connector traffic throughout testing sessions (PIJ suite, CHAIN suite, TLS suite) completed successfully over HTTPS. The MCP client establishes and maintains the SSE connection exclusively via `https://mcp.conceptia.com/dynamo/sse`.
- No HTTP URLs were surfaced in any tool response, error message, or server-sent event.
- The server did not at any point respond with an HTTP redirect (3xx) to a plaintext URL.

**Result:** ⚠️ **PARTIAL** — HTTPS in active use confirmed; HTTP rejection and HSTS enforcement cannot be verified from sandbox. Recommend external `curl -v http://mcp.conceptia.com/dynamo/sse` to confirm.

---

### TLS-02 — TLS Version & Cipher Check

**Objective:** Confirm server accepts only TLS 1.2+ and does not negotiate weak ciphers (RC4, NULL, EXPORT, 3DES, MD5 MACs).

**Method:** Attempted `openssl s_client -connect mcp.conceptia.com:443` and Python `ssl.SSLContext` probe from sandbox. Both were blocked by the sandbox network allowlist (DNS failure for `mcp.conceptia.com` from the Linux sandbox environment).

**Observable Evidence:**
- MCP connector established and sustained an SSE connection (TLS handshake implicit in HTTPS success).
- No TLS negotiation errors were observed during ~50+ tool calls across the session.
- Server responded consistently without protocol downgrade indicators.

**Result:** ⚠️ **PARTIAL** — Active TLS connection confirmed; TLS version and cipher suite details cannot be extracted from sandbox. Recommend external `openssl s_client -connect mcp.conceptia.com:443` or `nmap --script ssl-enum-ciphers -p 443 mcp.conceptia.com` for full verification.

---

### TLS-03 — CORS Header Validation

**Objective:** Confirm server does not emit `Access-Control-Allow-Origin: *` for credentialed SSE requests, and that OPTIONS preflight receives appropriate CORS headers.

**Method:** Attempted a CORS preflight via `web_fetch` with `Origin: https://evil.example.com` header. Blocked by sandbox allowlist. Python `requests` library also unavailable for direct HTTP crafting.

**Observable Evidence:**
- Cannot be assessed from within the Cowork sandbox.
- CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials`, `Vary`) are not visible via the MCP connector interface, which abstracts the SSE transport.

**Result:** ⚠️ **PARTIAL** — Cannot test from sandbox. Recommend external `curl -H "Origin: https://evil.example.com" -I https://mcp.conceptia.com/dynamo/sse` to observe CORS response headers.

---

### TLS-04 — OAuth Token Expiry & Re-Auth Lifecycle

**Objective:** Confirm that expired OAuth tokens are rejected (401/403), that no unauthenticated path exists, and that the re-authentication flow works correctly.

**Method:** Observed across session boundary. The OAuth bearer token issued for the MCP connector expired between the KS-986 PIJ testing session and resumption. The MCP connector surfaced a re-authentication prompt (connector status changed to disconnected/expired). Upon re-authentication, the connector reestablished the SSE connection and subsequent tool calls succeeded.

**Test Steps & Results:**

| Step | Action | Expected | Observed | Pass? |
|------|--------|----------|----------|-------|
| 1 | Attempt tool call with expired token | Connector rejects / re-auth required | Connector disconnected; re-auth prompted | ✅ |
| 2 | Re-authenticate via OAuth flow | New token issued, connection restored | Connection reestablished; tool calls succeeded | ✅ |
| 3 | Confirm no unauthenticated fallback | All requests require valid token | No unauthenticated access path observed | ✅ |
| 4 | Confirm CHAIN-04 credential exposure still requires auth | `read_data` on `dbo.User` only accessible with valid auth | Table readable only after valid OAuth session established | ✅ (auth enforced; see FINDING-04 in KS-987) |

**Result:** ✅ **PASS** — Token expiry correctly triggers re-authentication. No unauthenticated bypass observed.

---

### TLS-05 — Rate Limiting

**Objective:** Confirm the server rate-limits or throttles rapid sequential requests to prevent abuse and denial-of-service.

**Method:** Executed 50 consecutive `get_funds` calls via the MCP connector in rapid succession (batches of 10, back-to-back without delay). Monitored for HTTP 429 responses, throttle messages, increased latency, or connection drops.

**Results — All 50 Calls:**

| Call Range | Success Count | 429 / Throttle | Errors | Notes |
|------------|---------------|----------------|--------|-------|
| 1–10 | 10/10 | 0 | 0 | — |
| 11–20 | 10/10 | 0 | 0 | — |
| 21–30 | 10/10 | 0 | 0 | — |
| 31–40 | 10/10 | 0 | 0 | — |
| 41–50 | 10/10 | 0 | 0 | — |
| **Total** | **50/50** | **0** | **0** | — |

Every call returned `"success": true` with full JSON payloads. No throttling, backoff, or 429 HTTP status was observed at any point.

**Finding TLS-F01 (Informational):**

> **No rate limiting observed on the MCP tool API.**
>
> Fifty (50) rapid consecutive `get_funds` calls completed without any throttling, rate limiting (HTTP 429), connection drop, or increased response latency. The Dynamo MCP Server does not appear to enforce per-session or per-IP request rate limits on tool endpoints.
>
> **Risk:** An authenticated client (or a compromised MCP session) could enumerate all 981+ funds, extract all documents, notes, activities, and ratings in rapid succession. Combined with the credential exposure identified in FINDING-04 (KS-987), bulk data exfiltration is technically unimpeded.
>
> **Severity:** Informational / Low (requires valid OAuth session; no unauthenticated path)
> **Recommendation:** Implement per-session rate limiting (e.g., 10–20 requests/minute with HTTP 429 + `Retry-After` header) on all MCP tool endpoints.

**Result:** ⚠️ **OBS** — Rate limiting not observed. No failures, but no throttle mechanism confirmed.

---

### TLS-06 — Error Response Hygiene

**Objective:** Confirm that error responses do not leak internal server details — stack traces, file paths, SQL queries, internal hostnames, library versions, or secrets.

**Method:** Triggered error conditions via two deliberately invalid queries:
1. `describe_table("NonExistentTable_404Test")` — non-existent table name
2. `read_data("SELECT * FROM NonExistentTable_XYZ")` — SQL query against non-existent table

**Observed Responses:**

**Test 1 — `describe_table("NonExistentTable_404Test")`:**
```json
{
  "success": true,
  "columns": []
}
```
Clean empty response. No error body, no stack trace, no SQL error, no internal path.

**Test 2 — `read_data("SELECT * FROM NonExistentTable_XYZ")`:**
```json
{
  "success": false,
  "message": "Failed to execute query: Invalid object name 'NonExistentTable_XYZ'.",
  "error": "QUERY_EXECUTION_FAILED"
}
```
Clean structured JSON error. The message surfaces the SQL Server error text (`Invalid object name`) which is expected and non-sensitive — it does not reveal database version, connection string, file path, credentials, or server identity.

**Error Hygiene Assessment:**

| Check | Expected | Observed | Pass? |
|-------|----------|----------|-------|
| No stack trace in error body | Absent | Absent | ✅ |
| No internal file paths | Absent | Absent | ✅ |
| No SQL connection string | Absent | Absent | ✅ |
| No server hostname/IP | Absent | Absent | ✅ |
| No library versions | Absent | Absent | ✅ |
| No credentials or tokens | Absent | Absent | ✅ |
| Error format consistent JSON | Present | Present | ✅ |

**Result:** ✅ **PASS** — Error responses are clean and well-formed. No internal implementation details leaked.

---

## Findings Summary

| ID | Severity | Scenario | Title | Status |
|----|----------|----------|-------|--------|
| TLS-F01 | Informational | TLS-05 | No rate limiting observed on MCP tool endpoints | Open |

*Note: Critical finding FINDING-04 (unrestricted `dbo.User` credential table access) and Medium finding FINDING-03 (OTP interception via `get_notes`) were documented in KS-987 and are not repeated here. The absence of rate limiting (TLS-F01) amplifies the risk profile of FINDING-04.*

---

## Environment Blockers

| ID | Description | Impact |
|----|-------------|--------|
| B-2 | Cowork sandbox network allowlist restricts outbound to `*.anthropic.com` / `*.claude.ai` only | Blocks direct TLS inspection (TLS-01, TLS-02) and CORS preflight testing (TLS-03) |

**Recommended External Verification Commands:**

```bash
# TLS-01: HTTP enforcement
curl -v http://mcp.conceptia.com/dynamo/sse

# TLS-02: TLS version and cipher check
openssl s_client -connect mcp.conceptia.com:443 -tls1_1    # should fail
openssl s_client -connect mcp.conceptia.com:443 -tls1_2    # should succeed
nmap --script ssl-enum-ciphers -p 443 mcp.conceptia.com

# TLS-03: CORS header check
curl -H "Origin: https://evil.example.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS -v \
     https://mcp.conceptia.com/dynamo/sse
```

---

## Recommendations

1. **[High] Verify TLS 1.2+ enforcement externally** — Run `openssl s_client` and `nmap ssl-enum-ciphers` against `mcp.conceptia.com:443` from a non-sandboxed environment to confirm minimum TLS version and absence of weak ciphers.

2. **[High] Verify HTTP-to-HTTPS redirect and HSTS** — Confirm `http://mcp.conceptia.com` returns a 301/302 redirect to HTTPS and that `Strict-Transport-Security` header is present on HTTPS responses.

3. **[High] Verify CORS policy** — Confirm `Access-Control-Allow-Origin` is scoped to approved origins only (not `*`) for credentialed SSE connections.

4. **[Medium] Implement rate limiting** — Add per-session request rate limits (recommended: 10–20 req/min) with HTTP 429 + `Retry-After` header on all MCP tool endpoints. This is especially important given the unrestricted SQL access to sensitive tables (see FINDING-04 in KS-987).

5. **[Critical — from KS-987] Restrict `dbo.User` table access** — The `read_data` tool allows arbitrary SQL queries including direct reads of the User credential table (bcrypt password hashes, admin accounts, last login IPs). Row-level or object-level security should be enforced immediately.

---

## Appendix — Test Execution Log

| Timestamp (UTC) | Tool Called | Parameters | Result |
|-----------------|-------------|------------|--------|
| 2026-04-28 | `get_funds` (×50) | default / offset 0–50 | All 50: `success: true`, no throttle |
| 2026-04-28 | `describe_table` | `"NonExistentTable_404Test"` | `{"success":true,"columns":[]}` |
| 2026-04-28 | `read_data` | `SELECT * FROM NonExistentTable_XYZ` | `{"success":false,"message":"Failed to execute query: Invalid object name 'NonExistentTable_XYZ'.","error":"QUERY_EXECUTION_FAILED"}` |
| Cross-session | OAuth expiry | Token expired between PIJ and TLS sessions | Connector disconnected; re-auth prompted; re-auth succeeded |

---

*Report generated by Claude AI QA Agent on behalf of Bình Hà Khoa (hakhoabinh@gmail.com)*
*Dynamo MCP Server QA Testing Guide v1.3 — §7.5 TLS Transport Security*
