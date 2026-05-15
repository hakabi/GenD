# KS-977 — Cursor QA Result (Second Time Test)

## Dynamo MCP QA — Validate OAuth and fund list via `get_funds` (Section 5.1)

| Field | Value |
|---|---|
| **Ticket** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Story** | US-E3-01 — Validate OAuth and fund list via get_funds |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Guide ref** | Section 5.1 — Authentication test · Guide v1.4 (updated requirements in ticket body) |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Scenario 2 re-run (disconnected)** | 2026-05-13 — after user disabled **Conceptia Dynamo** MCP in Cursor |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` (Conceptia Dynamo MCP) — **connected** for Scenario 1; **unavailable** during §2.D re-run |
| **Tool under test** | `get_funds` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3)** |

---

## Summary

Section **5.1** happy path **passes** against the v1.4 updated requirements **while the Conceptia Dynamo MCP connector was enabled**: two consecutive `get_funds` invocations with `limit: 5`, `offset: 0` returned **byte-identical** business payloads for the first five funds, `totalRecords` **978**, and **no** raw JWT, refresh token, client secret, or password material in tool output.

The **first** `get_funds` attempt in that session failed with **`MCP error -32000: Connection closed`** (infrastructure / transport), then a **retry** succeeded — see **§2.B**.

**Scenario 2** (*invalid/expired OAuth or disconnected MCP session; must not return a silent empty “success” with fund data*) is exercised with **three** failure-path probes (plus §2.C positive control while connected):

1. **§2.A — OAuth rejection at the MCP HTTP boundary** (`curl.exe` → `https://mcp.conceptia.com/dynamo/sse`) — **401** + explicit JSON; **no** fund list (see table in §2.A).
2. **§2.B — Transient MCP transport** — **`-32000 Connection closed`** on first in-IDE `get_funds`, then recovery on retry; **no** silent `success: true` on the failed attempt.
3. **§2.D — Connector disabled in Cursor (requested re-run)** — With **Conceptia Dynamo disconnected** / server entry removed from the active MCP session, `get_funds` returns a **hard IDE error**: **`MCP server does not exist: user-conceptia-dynamo`** (enumerated available servers listed only Atlassian, Figma, GitLens, mcp-atlassian, Notion). **No** `data` array, **no** invented funds, **no** “empty success” masquerading as a valid fund query.

**Scenario 3** (identity with zero or fewer than five funds) remains **blocked** — same constraint as the Claude second-time report: the authenticated identity has hundreds of funds in scope; no restricted test account was used.

---

## Test execution

> **Precondition note:** §1 (Scenario 1) data below was collected **with** `user-conceptia-dynamo` **connected**. §2.D was executed **after** you disconnected the connector; at that moment Scenario 1 cannot be re-executed in Cursor until the server is re-added.

### Prompt and parameters (v1.4)

**Natural-language intent (equivalent to ticket):** List the first 5 funds I have access to (via MCP).

**Tool:** `get_funds`  
**Parameters:** `limit: 5`, `offset: 0` (pagination metadata recorded from response).

---

### Scenario 1 — Happy path: **PASS**

| Call | Result | Notes |
|---|---|---|
| Attempt A | **FAIL (transient)** | `{"error":"MCP error -32000: Connection closed"}` — no fund payload returned |
| Call 1 | **PASS** | `success: true`, 5 rows, `totalRecords: 978` |
| Call 2 | **PASS** | Same parameters; payload **matches** Call 1 for all compared fields |

#### Response envelope (both successful calls — equivalent)

- `success`: `true`  
- `message`: Query executed successfully; retrieved **5 of 978** total fund(s).  
- `recordCount`: **5**  
- `totalRecords`: **978**  
- `offset`: **0**, `limit`: **5**  
- `hasMore`: **true**  
- `wasTruncated`: **false**  
- `pagination`: `currentPage` 1, `totalPages` 196, `nextOffset` 5  

#### Fund rows (Call 1 and Call 2 — identical)

| # | Name | AssetClassName | SubAssetClassName | PipelineStatus | FundManagerName | ResponsibleName |
|---:|---|---|---|---|---|---|
| 1 | 2026 Fund | Private Equity | Buyout and Growth Equity | 1 - Pre-One Pager | Phoenix Equity | Andrew Stevenson |
| 2 | 36 South | Absolute Return | Relative Value | X - Exited | 36 South Capital Advisors | Burton Yuen |
| 3 | 59 North Partners, LP | Absolute Return | Equity Hedge | P - Portfolio | 59 North Capital Management | Kapua Aiu-Yasuhara |
| 4 | 5AM Ventures IV, LP | Private Equity | Venture Capital | X - Exited | 5AM Ventures | Jon Iwatani |
| 5 | 5AM Ventures V, L.P. | Private Equity | Venture Capital | X - Exited | *(null)* | Jon Iwatani |

#### v1.4 checklist

| Requirement | Result |
|---|---|
| `Name` present on each row | **PASS** |
| `AssetClassName` (or equivalent) present | **PASS** |
| Additional stable attributes (`FundManagerName`, `PipelineStatus`, `DateCreated`, etc.) | **PASS** (with F-02 note on row 5) |
| Two calls in same session — consistent keys (`Name` + supporting fields); no invented funds | **PASS** |
| No raw JWT / refresh token / password in tool JSON | **PASS** |
| Fund GUID on `get_funds` row | **Absent** — F-01 persists (align with KS-991 / ticket; optional `get_fund_description` chain not run in this minimal pass) |

---

### Scenario 2 — Error path (invalid / expired OAuth, disconnected session): **PASS**

KS-977 Scenario 2 acceptance intent: when the session is bad, the user sees a **clear failure** — **not** a silent empty list presented as success with invented funds.

#### 2.A — Invalid / missing OAuth at MCP gateway (HTTP, same URL as connector)

**Method:** `curl.exe` to `https://mcp.conceptia.com/dynamo/sse` with `Accept: text/event-stream`, **no Cursor MCP bridge**, **no real tokens** logged in this report.

| Case | Request | HTTP | Response body (verbatim) | Silent “success” fund list? |
|---|---|---:|---|---|
| **S2-A1** | No `Authorization` header | **401** | `{"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}` | **No** — explicit 401 JSON |
| **S2-A2** | `Authorization: Bearer invalid_token_for_test` (synthetic garbage value) | **401** | `{"error":"invalid_token","error_description":"Bearer token validation failed."}` | **No** — explicit 401 JSON |

**Verdict:** **PASS** — both cases return **machine-readable auth errors** at the MCP entrypoint. This matches the ticket’s “invalid/expired OAuth” branch at the **token-validation** layer exposed by the Conceptia MCP host (same URL cited in peer evidence). It does **not** replace Cursor’s internal OAuth storage (which remained valid for §1), and that is expected: Scenario 2’s **Given** is a *bad* session, not the happy-path identity.

#### 2.B — Disconnected / unavailable MCP (Cursor MCP tool transport)

| Case | Observation | Silent empty fund success? |
|---|---|---|
| **S2-B1** | First in-session `get_funds` via Cursor returned `MCP error -32000: Connection closed` | **No** — hard MCP tooling error, no `data` array |
| **S2-B2** | Immediate retry with same parameters returned normal `success: true` payload | n/a (recovery after reconnect) |

**Verdict:** **PASS** for “no silent success on failure” on the failed attempt; recovery on retry is acceptable connector behavior and does not contradict Scenario 2’s **Then** clause for the **failed** invocation.

#### 2.C — Control (when connector was still enabled)

After §2.A `curl` probes (only), **`get_funds`** with `{ "limit": 5, "offset": 0 }` via **`user-conceptia-dynamo`** still returned **`success: true`** and the same five-fund page as Scenario 1 — confirms the **authenticated** path was not broken by HTTP probes alone (`curl` does not alter Cursor’s stored tokens).

#### 2.D — Connector disconnected in Cursor (Scenario 2 re-run)

**Given:** User disabled / removed the **Conceptia Dynamo** MCP connector from Cursor (server `user-conceptia-dynamo` no longer available to the agent).

**When:** Agent invokes `get_funds` with `{ "limit": 5, "offset": 0 }` targeting **`user-conceptia-dynamo`**.

**Then (observed):**

| Field | Value |
|---|---|
| **Outcome** | **FAIL (expected)** — tool not callable |
| **Error (verbatim)** | `MCP server does not exist: user-conceptia-dynamo. Available servers: plugin-atlassian-atlassian, user-Figma, user-eamodio.gitlens-extension-GitKraken, user-mcp-atlassian, user-notion` |
| **Fund payload / `success: true`** | **Absent** |
| **Silent empty fund list as success** | **No** |

**Verdict:** **PASS** — disconnected MCP is surfaced as an **explicit configuration/runtime error**, not a fabricated fund list.

---

### Scenario 3 — Edge case (zero or fewer than five funds): **BLOCKED**

Same rationale as peer report: the session identity has **978** funds in scope; the “fewer than five rows without padding” edge cannot be exercised here without a restricted test account.

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| Refresh token or client secret in output | **None** observed |
| Password or API key string in output | **None** observed |

**Security verdict:** **PASS** for observed successful responses.

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | No explicit Fund **GUID** / `ID` field in `get_funds` list projection; stability used `Name` + attributes per ticket v1.4. | **Persists** (aligned with Claude second-time test) |
| F-02 | Info | `5AM Ventures V, L.P.` — `FundManagerName` / primary contact **null** in payload. | **Persists** — data gap, not MCP fabrication |
| N-01 | Info | `totalRecords` **978** — consistent with Claude second-time run (2026-05-13). | **Informational** |
| N-02 | Info | First MCP `get_funds` call returned **-32000 Connection closed**; immediate retry succeeded. | **Informational** — infrastructure / session stability |
| N-03 | Info | Scenario **2.A** exercised with `curl.exe` against `https://mcp.conceptia.com/dynamo/sse` — **401** + JSON for missing auth and for synthetic invalid Bearer. | **Scenario 2 evidence** |
| N-04 | Info | **Post-disconnect re-run:** `get_funds` with connector removed → **`MCP server does not exist: user-conceptia-dynamo`**. | **Scenario 2.D evidence** |

---

## Test matrix row — Section 5.1 Auth (this run)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.1 Auth (`get_funds`)** | **P** | n/a | **P** | **P** | n/a |

- **Unauthorized user:** **P** — HTTP **401** with explicit JSON for **no** `Authorization` header and for **invalid** `Bearer` against `https://mcp.conceptia.com/dynamo/sse` (§2.A).  
- **Network drop / disconnected MCP:** **P** — §2.B **`-32000 Connection closed`** (transient); §2.D **`MCP server does not exist`** with connector disabled (explicit, no fund data).

*Invalid input* and *Large dataset* remain **n/a** for row 5.1 per guide where applicable.

---

## Evidence

- **Tool:** `get_funds` via MCP server **`user-conceptia-dynamo`** (when connected — Scenario 1 + earlier controls).
- **Successful calls:** 2 × identical parameters `limit=5`, `offset=0`, same authenticated session after reconnect (connector **on**).
- **Scenario 2.A:** `curl.exe` probes to `https://mcp.conceptia.com/dynamo/sse` — synthetic `Bearer invalid_token_for_test` only; **no** production tokens recorded.
- **Scenario 2.D:** `get_funds` after user disconnected Conceptia Dynamo — IDE error string captured verbatim above (connector **off**).
- **Redaction:** No investor PII beyond business fund/manager names as in prior reports; no secrets logged.

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.1 happy path (v1.4) | **PASS** |
| Two-call consistency (same session, post-reconnect) | **PASS** |
| No credential leakage in successful payloads | **PASS** |
| No invented fund rows | **PASS** |
| Scenario 2 (OAuth / session / transport / disconnected connector) | **PASS** — §2.A (401 + JSON at MCP URL); §2.B (`Connection closed`); §2.D (**`MCP server does not exist`** with connector removed) |
| Scenario 3 (0 / &lt;5 funds) | **BLOCKED** — no restricted identity used |

**Final:** **PASS (Scenario 1)** / **PASS (Scenario 2)** / **BLOCKED (Scenario 3)**  

---

*Generated: 2026-05-13 · Updated: 2026-05-13 (Scenario 2 extended; §2.D connector-disconnect re-run) · Agent: Cursor (Composer) · Source: [KS-977](https://gendvn.atlassian.net/browse/KS-977) Jira description (v1.4 appendix) · Report path: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-977 - Cursor Result.md`*
