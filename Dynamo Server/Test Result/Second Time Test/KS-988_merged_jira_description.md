### [KS-988] US-E4-05 — Validate TLS, CORS, OAuth lifecycle, rate limiting, error hygiene

**Ticket Title:** `Dynamo MCP Security QA - Validate TLS, CORS, OAuth lifecycle, rate limiting, error hygiene`  
**Jira:** [KS-988](https://gendvn.atlassian.net/browse/KS-988) | **Epic:** [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — Security & Abuse-Case Testing

**User Story:**
> As an **Internal QA Tester**, I want **HTTPS-only transport, sane OAuth behavior, throttling under load, and non-leaky errors** so that **the MCP endpoint meets baseline security expectations**.

**Overview:**
Section 7.5: TLS enforcement, CORS, OAuth expiry/revocation, rate limiting (50+ rapid calls), and error responses without stack traces or internal paths.

**Detailed Requirements:**
- **TLS:** `https://mcp.conceptia.com/dynamo/sse` only; no cleartext HTTP fallback; TLS 1.2 minimum (1.3 preferred).
- **CORS:** Unauthorized origins rejected for browser-originated checks.
- **OAuth:** Token expiry and revocation behave predictably (re-auth works; revoked session cannot call tools).
- **Rate limiting:** 50+ rapid tool invocations yield throttling (429 or similar) or graceful backoff — **not** crash.
- **Error hygiene:** No stack traces, internal file paths, or secrets in JSON error bodies.

**UI/UX & Front-End Considerations:**
- Browser padlock, certificate chain valid; capture screenshot of cert details if required by audit.
- Under burst, user may see slow responses or "rate limited" — document copy shown by client.

**Acceptance Criteria (BDD):**

*Scenario 1 — Happy path*
- **Given** a standard HTTPS connection to the MCP SSE endpoint
- **When** the tester validates TLS version and certificate trust
- **Then** TLS **1.2+** is negotiated, certificate is valid for the hostname, and traffic is not downgradeable to HTTP

*Scenario 2 — Error path*
- **Given** cross-origin or invalid browser requests
- **When** CORS preflight or disallowed origin access is attempted
- **Then** unauthorized origins are **rejected**, and error responses contain **no** stack traces, internal paths, or secrets

*Scenario 3 — Edge case (rate limit & OAuth lifecycle)*
- **Given** 50+ rapid sequential tool calls and an OAuth token near expiry or after revocation
- **When** the tester runs the burst and token lifecycle tests
- **Then** the service **throttles gracefully** (no crash), and expired/revoked tokens **cannot** invoke tools until re-authentication

**Definition of Done:** *(verbatim block above)*

---

## Updated requirements — guide v1.4

*May 2026 customer confirmation · Maps to `dynamo-mcp-testing-guide_v1.4.md` §7.5, §3, §9 · Epic [KS-1000](https://gendvn.atlassian.net/browse/KS-1000)*

### User Story (v1.4)

> As an **Internal QA Tester**, I want **TLS-only transport to the MCP SSE endpoint**, **sane CORS behavior for browser checks**, **predictable OAuth token expiry/revocation**, **rate limiting under burst tool traffic**, and **non-leaky error bodies** so that **the MCP edge meets baseline production security expectations** independent of which **v1.4** tool is invoked.

### Overview (v1.4)

**§7.5** complements **AUTH**: even perfect OAuth fails if TLS is weak, CORS is wild, errors leak stack traces, or bursts kill the worker. Tests should combine **openssl/s_client** or corporate TLS scanners (attach reports) with **application-level** bursts using a **cheap** tool call pattern (**`get_funds`**, `limit` small) to minimize data transfer while still stressing auth + rate code paths.

OAuth lifecycle probes should align with **KS-977** / **KS-990** evidence (disconnect, reconnect, invalid bearer).

### Detailed requirements (v1.4)

#### A. TLS and transport

- Verify **HTTPS** `https://mcp.conceptia.com/dynamo/sse` only; attempt **HTTP** downgrade if still routed — expect failure.
- Record negotiated TLS version (**1.2+**, prefer **1.3**) and cert hostname match; attach auditor screenshot if required.

#### B. CORS and browser attack surface

- From a controlled browser origin, run **disallowed** CORS scenarios documented by security; expect **reject** without reflective data leak.

#### C. OAuth lifecycle

- Document **token refresh** / **re-auth** UX after forced logout from IdP.
- Validate **revoked** or **expired** session cannot call tools until new OAuth — mirror **KS-977** scenarios.

#### D. Rate limiting

- **≥50** rapid sequential tool calls (same tool or mix) within a **short window**; capture **HTTP status**, **retry-after** headers if any, and **client backoff** behavior — **not** acceptable: unbounded 500 storm or silent hang.

#### E. Error hygiene

- Provoke known validation failures (`get_documents` without mandatory filters, malformed JSON) and capture bodies — must **not** include stack traces, internal Windows/Linux paths, connection strings, or JWTs.

### UI/UX & front-end considerations (v1.4)

- Rate-limit UX copy differs by client (Cursor vs Claude) — screenshot **user-visible** text only.

### Acceptance criteria (BDD, v1.4)

*Scenario 1 — TLS happy path*  
**Given** standard corporate network  
**When** client connects  
**Then** TLS **1.2+**, valid cert chain, **HTTPS only**.

*Scenario 2 — CORS / bad browser origin*  
**Given** disallowed origin matrix  
**When** tested  
**Then** **reject**; errors clean.

*Scenario 3 — Burst + OAuth edge*  
**Given** 50+ calls + near-expiry token  
**When** executed  
**Then** **throttle or stable degradation**; post-expiry calls **fail closed** until re-auth.

### Definition of Done (v1.4)

- §7.5 checklist **P** with attachments OR **F** with defects; **no critical** TLS/OAuth/error-leak items for **§11** exit.
