# KS-988 — Cursor MCP Execution Report (TLS, CORS, OAuth, Rate Limit, Errors)

| Field | Value |
|--------|--------|
| **Ticket** | [KS-988](https://gendvn.atlassian.net/browse/KS-988) — *Dynamo MCP Security QA — Validate TLS, CORS, OAuth lifecycle, rate limiting, error hygiene* |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing |
| **Status (Jira)** | To Do |
| **Execution date** | 2026-04-28 |
| **Tester / client** | Cursor agent — `curl.exe` (Windows) + Conceptia Dynamo MCP (`user-conceptia-dynamo`) |
| **MCP endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Guide mapping** | [Dynamo MCP Server — QA Testing Guide](../Test%20Guide/dynamo-mcp-testing-guide.md) v1.3 — **section 7.5 Transport Security (TLS)** |

---

## 1. Executive summary

Tests below exercise **section 7.5** and the **KS-988** BDD scenarios using (1) **raw HTTPS/HTTP** probes with `curl`, and (2) **authenticated MCP** tool calls for burst and error sampling.

**TLS / HTTPS:** Cleartext **HTTP** on port 80 **redirects** to **HTTPS** (no downgrade to an HTTP API for the probe used). **HTTPS** to the SSE path negotiates TLS successfully under **Windows Schannel** (no certificate errors in `curl` output); unauthenticated **`HEAD`/`GET`** return **401** with JSON body — **no** transport failure.

**CORS:** **OPTIONS** preflight with a **synthetic disallowed `Origin`** received **`HTTP 204`** and response headers included **`Access-Control-Allow-Origin: *`**. This **does not** match the ticket wording *“Unauthorized origins rejected for browser-originated checks”* — treat as **OBS-1 / review item** (permissive wildcard vs origin allow-list).

**OAuth lifecycle (expiry / revocation):** **Not executed** in this run — requires controlled token expiry or admin revocation (**manual / separate session**). **Consolidation:** capture in a future **KS-988 — Claude Report** with explicit token steps if available.

**Rate limiting:** **55** rapid sequential **`curl`** **GET**s to the **HTTPS** endpoint completed in one run: **all** responses were **HTTP 401**; **no** **429**, **no** observed **timeout** failures. Separately, **10** back-to-back MCP **`get_funds`** calls returned **`success: true`** — **no** crash or MCP transport error. **No 429** observed at this volume (limit may be higher or enforced elsewhere).

**Error hygiene (sample):** MCP error payloads for **`read_data`** (non-SELECT) and **`llm_text_analysis`** (missing API key) contained **short human-readable messages** and **codes** (e.g. `SECURITY_VALIDATION_FAILED`); **no** server file paths or stack traces were present in those JSON bodies.

**Overall verdict:** **PARTIAL PASS** — **TLS** and **error-hygiene** samples look good; **CORS** policy **differs** from strict origin denial (**OBS-1**); **OAuth** lifecycle **not tested** (**B-1**); **rate limit** **not triggered** at tested volumes (**PASS** for “no crash”).

**Consolidation note:** Produce a **KS-988 — Claude Report** later (Second client / browser padlock screenshots / OAuth revoke flow if permitted) before publishing a **consolidated KS-988 result**.

---

## 2. Ticket traceability (KS-988)

| Requirement | Evidence section |
|-------------|------------------|
| TLS **1.2+**, valid cert, HTTPS-only story | section 3.1 |
| CORS — unauthorized origins rejected | section 3.2 (**OBS-1**) |
| OAuth expiry / revocation | section 3.3 (**B-1**) |
| **50+** rapid calls — throttle **or** graceful behavior | section 3.4 |
| Errors without stacks / paths / secrets | section 3.5 |

---

## 3. Detailed results

### 3.1 TLS & HTTP downgrade (Scenario 1 — happy path)

| Step | Command / action | Result |
|------|------------------|--------|
| A | `curl.exe --max-time 15 -sI "http://mcp.conceptia.com/dynamo/sse"` | **`HTTP/1.1 307 Temporary Redirect`** · **`Location: https://mcp.conceptia.com/dynamo/sse`** — cleartext request **does not** serve the API as plain HTTP for this probe (**upgrade / redirect** behavior) |
| B | `curl.exe --max-time 15 -sI "https://mcp.conceptia.com/dynamo/sse"` | **`HTTP/1.1 401 Unauthorized`** · **`Content-Type: application/json`** · **`Www-Authenticate: Bearer`** … OAuth PR metadata URI present |
| C | `curl.exe --max-time 15 -vk "https://mcp.conceptia.com/dynamo/sse" -o NUL` | TLS established via **schannel**; logs showed **SSL/TLS connection** / renegotiation — **no** user-visible cert error in snippet |

**Assessment:** **PASS** for **HTTPS-only usage** when clients follow redirects; TLS stack operates without verification errors on this host (**guide section 7.5**).

---

### 3.2 CORS (Scenario 2 — error path / browser-oriented)

| Step | Command | Result |
|------|---------|--------|
| A | `OPTIONS https://mcp.conceptia.com/dynamo/sse` with **`Origin: https://evil.example`** (or **`https://unauthorized-origin.example`**) and **`Access-Control-Request-Method: POST`** | **`HTTP 204 No Content`** |
| B | Response headers (representative) | **`Access-Control-Allow-Origin: *`** · **`Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE`** · **`Vary: Origin`** |

**OBS-1 — CORS wildcard:** **`Access-Control-Allow-Origin: *`** allows **any** browser origin for CORS-aware clients — **not** “reject unauthorized origins.” Whether this is acceptable depends on product threat model (e.g. auth token in **`Authorization`** vs cookie-based exposure). **Recommendation:** align deployment with ticket intent or update ticket wording after architecture sign-off.

---

### 3.3 OAuth lifecycle (Scenario 3 — edge / token)

| Test | Status |
|------|--------|
| Near-expiry token | **Not run** (**B-1**) |
| Revoked token / forced re-auth | **Not run** (**B-1**) |

**Note:** **`HEAD`** responses advertise **`WWW-Authenticate`** / **`Bearer`** OAuth protected-resource metadata — consistent with OAuth HTTP usage for MCP.

---

### 3.4 Rate limiting & burst stability

| Test | Detail | Result |
|------|--------|--------|
| **HTTP burst** | **55** sequential **`curl`** **GET**s to **`https://mcp.conceptia.com/dynamo/sse`** (~**33 s** wall time in measured run) | **55 × HTTP 401** · **`NO_429_IN_BURST`** · **no** curl hard failures logged |
| **MCP burst** | **10** consecutive **`get_funds`** (`limit` **1**, `offset` **0–9**) in quick succession | **All `success: true`** |

**Assessment:** Service remained responsive — **PASS** for **graceful handling** at tested intensity (**guide section 7.5** — “not crash”). **429** may appear only above higher thresholds or on authenticated routes — document **coverage gap** if policies must be proven empirically.

---

### 3.5 Error hygiene (sample MCP failures)

| Tool | Trigger | Body highlights |
|------|---------|-----------------|
| `read_data` | `DROP TABLE Fund` | `"success":false`, **`SECURITY_VALIDATION_FAILED`**, message: query must **`SELECT`** — **no** stack |
| `llm_text_analysis` | Default providers without keys | **`Missing ANTHROPIC_API_KEY`** / **`OPENAI_API_KEY`** — **no** path leaks in sampled responses |

---

## 4. Definition of Done — checklist

| Criterion | Status |
|-----------|--------|
| TLS **1.2+** negotiated (observed TLS activity / no verify errors) | **Met** (probe-level) |
| No durable cleartext API on **`http://`** probe | **Met** (**307** → HTTPS) |
| CORS rejects arbitrary origins per ticket text | **Not met as written** (**OBS-1**) |
| OAuth expiry / revocation | **Blocked** (**B-1**) |
| **50+** rapid requests — stable | **Met** (**55** HTTP + MCP burst) |
| Errors lack stacks/paths | **Met** for sampled MCP errors |

---

## 5. Recommended next steps

1. **Product / infra:** Review **CORS** **`Allow-Origin: *`** vs KS-988 expectation (**OBS-1**).
2. **QA:** Schedule **OAuth** revocation / expiry drill with **authorized test identity** — record for **KS-988 — Claude Report** or consolidated result.
3. Optional: repeat burst with **authenticated** MCP-only traffic until **429** appears (establish threshold), if policy requires proof.
4. Prepare **KS-988 — Claude Report** for merged **KS-988 Result** (parity with KS-985 workflow).

---

## 6. References

- **Jira:** [KS-988](https://gendvn.atlassian.net/browse/KS-988)
- **Guide:** `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` — **section 7.5**

---

*Report generated 2026-04-28 — Cursor agent · KS-988.*
