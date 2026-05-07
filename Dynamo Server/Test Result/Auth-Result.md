# Stage 4 — Auth / CORS / Parameter Abuse Testing Report
**Conceptia Dynamo MCP Server**
**Test Date:** 2026-05-06
**Tester:** Claude (Cowork Mode)
**Target:** `https://mcp.conceptia.com/dynamo/sse`
**Connector prefix:** `0c5a3b61-86e4-4c75-b19f-40c0141fb861`

---

## Scope

Stage 4 assessed the Dynamo MCP server's authentication posture, CORS configuration, and parameter boundary enforcement. Eight test cases were executed covering CORS header probing, unauthenticated and token-replay access attempts, negative/zero/overflow pagination values, inverted date ranges, and type confusion on numeric parameters.

Prior stages for reference:
- Stage 1 (SQL Injection Rounds 1–2): `SQLi-Result.md`, `SQLi-Round2-Result.md`
- Stage 2 (Advanced Prompt Injection PIJ-06–10): `PIJ-Advanced-Result.md`
- Stage 3 (Stress / DoS Testing): `Stress-Result.md`

---

## Summary Table

| ID | Test Case | Method | Payload | Result | Verdict |
|----|-----------|--------|---------|--------|---------|
| AUTH-01 | CORS preflight with hostile origin | curl OPTIONS + GET | `Origin: https://evil.com` | 403 Forbidden — proxy allowlist blocks all non-connector IPs | Pass |
| AUTH-02 | Unauthenticated request | curl GET | No Authorization header | 403 Forbidden — `X-Proxy-Error: blocked-by-allowlist` | Pass |
| AUTH-03 | Invalid / replayed token | curl GET | Garbage token + fake JWT (wrong signature) | 403 Forbidden — `X-Proxy-Error: blocked-by-allowlist` | Pass |
| AUTH-04 | Negative offset | `get_funds`, `get_notes` | offset=-1, offset=-999 | Application-layer validation error — sanitised message, no DB leakage | Pass |
| AUTH-05 | Over-limit parameter | `get_funds`, `get_notes` | limit=99999 | Application-layer validation error — enforces documented cap | Pass |
| AUTH-06 | Zero / negative limit | `get_funds`, `get_notes` | limit=0, limit=-1 | Application-layer validation error — enforces minimum of 1 | Pass |
| AUTH-07 | Inverted date range | `get_funds`, `get_notes` | createdAfter > createdBefore | Silently returns 0 results — no error, no validation | Low |
| AUTH-08 | Float / type confusion on integer params | `get_funds`, `get_notes` | limit=1.7, limit=50.9, offset=0.5 | Application-layer integer check — `"limit must be an integer"` | Pass |

**Overall:** 7 Pass, 1 Low-severity finding

---

## Detailed Results

### AUTH-01 — CORS Preflight with Hostile Origin

**Objective:** Determine the server's CORS policy by sending an OPTIONS preflight with `Origin: https://evil.com` and checking whether the server reflects a wildcard or arbitrary origin in `Access-Control-Allow-Origin`.

**Payloads:**
```
OPTIONS https://mcp.conceptia.com/dynamo/sse
Origin: https://evil.com
Access-Control-Request-Method: GET
Access-Control-Request-Headers: Authorization
```

**Response:**
```
HTTP/1.1 403 Forbidden
Content-Type: text/plain
X-Proxy-Error: blocked-by-allowlist
```

**Finding:** All direct HTTP requests to the SSE endpoint — regardless of origin, method, or auth header — are blocked at the proxy/gateway layer before reaching the MCP server. The response includes a custom `X-Proxy-Error: blocked-by-allowlist` header indicating an IP or client allowlist is enforced by the reverse proxy. The MCP server is not reachable from arbitrary internet hosts.

The actual CORS policy of the MCP server itself cannot be determined from this external vantage point because the proxy terminates all non-allowlisted connections. The proxy-layer defence provides strong perimeter protection regardless of what the MCP server's own CORS configuration might be.

**Verdict:** Pass — proxy allowlist effectively prevents CORS exploitation from external origins.

---

### AUTH-02 — Unauthenticated Request

**Objective:** Confirm that the SSE endpoint rejects requests with no `Authorization` header and does not leak data or internal details in the error response.

**Payload:** `GET https://mcp.conceptia.com/dynamo/sse` (no auth header)

**Response:**
```
HTTP/1.1 403 Forbidden
Content-Type: text/plain
X-Proxy-Error: blocked-by-allowlist
```

**Finding:** The proxy layer blocks the request before authentication is even evaluated. No data, stack trace, or internal server information is returned. The error body is empty (plain text `403`). This is the expected behaviour.

**Verdict:** Pass — unauthenticated access correctly denied at proxy layer.

---

### AUTH-03 — Invalid / Malformed Token Replay

**Objective:** Determine whether an expired, forged, or malformed bearer token can bypass authentication.

**Payloads tested:**
- `Authorization: Bearer INVALIDTOKEN123XYZABC` (garbage string)
- `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkV2aWxVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c` (structurally valid JWT, wrong HMAC signature)

**Response (both):**
```
HTTP/1.1 403 Forbidden
Content-Type: text/plain
X-Proxy-Error: blocked-by-allowlist
```

**Finding:** Both token variants are rejected at the proxy layer. The proxy does not appear to perform JWT inspection — it blocks based on allowlist membership (IP/client identity) rather than token validity. This means token forgery is moot as an attack vector against the external surface; a valid token alone is insufficient without being on the proxy allowlist.

**Note:** Token replay attacks against the internal Cowork connector channel (where the allowlist is already satisfied) cannot be tested from this context. That vector would require a separate insider-threat assessment.

**Verdict:** Pass — both garbage and structurally valid forged tokens rejected.

---

### AUTH-04 — Negative Offset (Pagination Boundary Abuse)

**Objective:** Send negative offset values to test whether they are validated before SQL query construction or whether they produce unexpected behaviour (e.g., negative OFFSET in SQL, full-table scan, or error leakage).

**Payloads:**
- `get_funds(offset=-1, limit=50)`
- `get_notes(offset=-999, limit=20)`

**Responses:**
```json
{"success":false,"message":"Invalid offset parameter: offset must be between 0 and 1000000"}
```

**Finding:** Both tools validate the offset parameter at the application layer with a clean, sanitised error message. The bounds check (`0 ≤ offset ≤ 1,000,000`) is consistent across tools. No SQL error is triggered and no internal information is leaked. The error message correctly describes the valid range without exposing schema details.

**Verdict:** Pass — application-layer validation prevents negative offset from reaching SQL.

---

### AUTH-05 — Over-Limit Parameter Enforcement

**Objective:** Confirm that the documented maximum limits (`get_funds`: max 100, `get_notes`: max 200) are enforced server-side and cannot be bypassed by sending a very large integer.

**Payloads:**
- `get_funds(limit=99999)`
- `get_notes(limit=99999)`

**Responses:**
```json
{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 100"}
{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 200"}
```

**Finding:** The documented maximum limits are enforced server-side with precise, tool-specific bounds. The sanitised error message confirms the enforced range without leaking schema details. This validation is consistent with AUTH-04 and confirms that range enforcement is applied uniformly across numeric parameters.

**Verdict:** Pass — documented limits enforced; over-limit values correctly rejected.

---

### AUTH-06 — Zero and Negative Limit

**Objective:** Test whether `limit=0` or `limit=-1` are accepted, and if so, whether they produce unexpected behaviour (e.g., unbounded SELECT, SQL error, or empty result treated as valid).

**Payloads:**
- `get_funds(limit=0)`
- `get_notes(limit=-1)`

**Responses:**
```json
{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 100"}
{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 200"}
```

**Finding:** Both zero and negative limit values are rejected with the same sanitised range validation error as AUTH-05. The minimum of `1` is enforced, preventing `FETCH NEXT 0 ROWS ONLY`-style queries or negative FETCH values that might cause SQL exceptions. The validation is consistent and clean.

**Verdict:** Pass — non-positive limits correctly rejected at application layer.

---

### AUTH-07 — Inverted Date Range Parameter Conflict

**Objective:** Test whether the server validates that `createdAfter` is before `createdBefore` (and similarly `startDate` before `endDate`). An inverted range where the start is after the end should logically return no results but could also indicate bypassed validation or unexpected SQL behaviour.

**Payloads:**
- `get_funds(createdAfter=2030-01-01, createdBefore=2000-01-01, limit=50)`
- `get_notes(startDate=2030-01-01, endDate=2000-01-01, limit=20)`

**Responses:**
```json
{"success":true,"message":"Query executed successfully. Retrieved 0 of 0 total fund(s)...","data":[],"recordCount":0,"totalRecords":0}
{"success":true,"message":"Query executed successfully. Retrieved 0 of 0 total activity note(s)...","data":[],"recordCount":0,"totalRecords":0}
```

**Finding:** Both tools silently accept inverted date ranges and return an empty result set with `success: true`. No validation error is raised. The SQL query likely produces a `WHERE date > '2030-01-01' AND date < '2000-01-01'` clause, which returns zero rows — the correct logical outcome — but the server provides no feedback to the caller that the date range is logically impossible.

This is not a security vulnerability: no data is leaked, no SQL error is triggered, and the result is logically correct (zero records match an impossible range). However, it represents a robustness gap: a misconfigured client or a date picker bug could silently produce empty results without any indication that the query parameters were inverted, making the issue hard to diagnose.

**Severity:** Low — no security impact; minor input validation robustness gap.

**Recommendation:** Add a server-side check that returns a `400`-style validation error when `startDate > endDate` (or `createdAfter > createdBefore`), with a message such as `"Date range is invalid: startDate must be before endDate"`.

---

### AUTH-08 — Type Confusion on Numeric Parameters

**Objective:** Test whether float values (which are valid JSON `number` type but invalid for SQL integer parameters) are caught by the application layer or passed through to produce SQL type errors that may leak schema information.

**Payloads:**
- `get_funds(limit=1.7)` — float below the documented minimum if truncated to 1
- `get_notes(limit=50.9, offset=0.5)` — floats on both integer params
- `get_funds(limit=100, offset=1000000)` — maximum allowed offset (boundary test)

**Responses:**
```json
{"success":false,"message":"Invalid limit parameter: limit must be an integer"}
{"success":false,"message":"Invalid limit parameter: limit must be an integer"}
{"success":true,"message":"Query executed successfully. Retrieved 0 of 975 total fund(s)...","data":[],"recordCount":0,"totalRecords":975,"offset":1000000}
```

**Findings:**

1. **Float rejection:** Both float limit values are explicitly rejected with `"limit must be an integer"`. This validation goes beyond JSON schema type checking (which only requires `number`): the server actively verifies that the numeric value is an integer before constructing the SQL query. No SQL type error is leaked.

2. **Max offset boundary (offset=1,000,000):** Accepted as valid (within the `0–1,000,000` bound confirmed in AUTH-04). The response returns `totalRecords: 975` and `data: []`, correctly indicating that the offset is beyond the last record. The `currentPage: 10001` / `totalPages: 10` pagination metadata is mathematically inconsistent (currentPage exceeds totalPages), but this is a display calculation bug rather than a security issue.

3. **totalRecords disclosure:** The server returns `totalRecords: 975` even when the offset points beyond all records. This means a caller can enumerate the exact database row count without reading any data by issuing a single `offset=1000000` query. This is a minor information disclosure (reveals database scale) but is unlikely to constitute a meaningful attack vector given that table counts are not sensitive by themselves.

**Verdict:** Pass on type validation. Low-severity note on totalRecords disclosure at max offset.

---

## Consolidated Findings

| Finding ID | Tool(s) | Category | Description | Severity |
|------------|---------|----------|-------------|----------|
| AUTH-F01 | `get_funds`, `get_notes` | Input Validation Gap | Inverted date ranges accepted silently — `success: true`, 0 results, no diagnostic error | Low |
| AUTH-F02 | `get_funds` | Info Disclosure | `totalRecords` count exposed in response even when offset exceeds last record | Informational |

---

## Key Positive Findings (Controls Working Correctly)

The following security controls were confirmed operational during Stage 4:

**Proxy-layer allowlist:** All direct external HTTP requests to the SSE endpoint — regardless of auth header, CORS origin, or token format — are blocked at the reverse proxy with `403 + X-Proxy-Error: blocked-by-allowlist`. This provides strong perimeter defence and renders token-replay and CORS exploitation non-viable from external networks.

**Application-layer integer validation:** All numeric parameters (`limit`, `offset`) are validated for type (integer, not float), sign (non-negative for offset), and range (within documented bounds) with consistent, sanitised error messages that do not leak SQL or schema details.

**Documented limit enforcement:** The documented maximum values for `limit` (`get_funds`: 100, `get_notes`: 200) are enforced server-side and cannot be bypassed.

---

## Recommendations

**AUTH-F01 — Inverted date range:**
Add cross-field validation: if `startDate > endDate` (or `createdAfter > createdBefore`), return a `400`-style error: `"Invalid date range: startDate must be on or before endDate."` This prevents silent misconfiguration and aids debugging.

**AUTH-F02 — totalRecords at max offset:**
Consider omitting or capping `totalRecords` when the query returns zero records due to offset overflow. Alternatively, this is low-impact enough to document as accepted behaviour.

**Insider threat / token replay (out-of-scope note):**
Token replay attacks against the internal Cowork connector channel (bypassing the proxy allowlist) could not be tested in this session. A follow-up assessment from within an authorised connector context is recommended to verify token expiry enforcement and replay prevention at the MCP server layer.

---

## Stage Coverage vs. Full Test Plan

| Stage | Status |
|-------|--------|
| Stage 1 — SQL Injection Rounds 1 & 2 | Complete (`SQLi-Result.md`, `SQLi-Round2-Result.md`) |
| Stage 2 — Advanced Prompt Injection (PIJ-06–10) | Complete (`PIJ-Advanced-Result.md`) |
| Stage 3 — Stress / DoS Testing (STRESS-01–06) | Complete (`Stress-Result.md`) |
| Stage 4 — Auth / CORS / Parameter Abuse (AUTH-01–08) | **Complete (this report)** |
| Stage 5 — FINDING-04 Regression (`read_data` tool) | Pending (requires Claude Desktop connector) |

---

*End of Stage 4 report.*
