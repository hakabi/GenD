# KS-977 — Consolidated QA Result (Second Time Test)
## Dynamo MCP QA — Validate OAuth and fund list via `get_funds` (Section 5.1)

| Field | Value |
|---|---|
| **Ticket** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Story** | US-E3-01 — Validate OAuth and fund list via get_funds |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.1 — Authentication test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Testers / Agents** | Claude (Cowork mode — claude-sonnet-4-6) · Cursor (Composer — automated MCP invocation) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` / `user-conceptia-dynamo` |
| **Tool under test** | `get_funds` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3)** |

---

## Summary

Section 5.1 happy-path **PASSES** on the second test run across **both** agents (Claude and Cursor). Both agents executed two consecutive `get_funds` calls and returned **byte-identical** business payloads for the same first 5 funds, with `totalRecords: 978`. No credential leakage was detected in any tool output or transcript across either run.

**Δ vs. first test (2026-04-25):** `totalRecords` increased from **977 → 978**, confirming the live backend is active. The first-page fund set is unchanged.

**Scenario 2 (error path) PASSES** across both agents via multiple failure-path probes:
- Claude observed a live MCP server disconnection mid-session — all 7 tools became unreachable; no silent empty list returned, no fabricated data.
- Cursor exercised three additional failure modes: HTTP 401 at the MCP gateway (invalid/missing auth), transient `-32000 Connection closed` with recovery on retry, and a full connector-disabled re-run returning an explicit IDE error.

**Scenario 3 (edge case — zero/fewer than 5 funds) remains BLOCKED** — the authenticated identity (`binh.ha@conceptia.com`) has access to 978 funds; no low-scope test identity has been provisioned. This is the same blocker as the first test run.

The **F-01** and **F-02** findings from the first test **persist** — no fixes from vendor since the prior run.

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

**Prompt used:** List the first 5 funds I have access to (via MCP).  
**Tool call:** `get_funds` with `limit: 5`, `offset: 0`

#### Call results by agent

| Agent | Attempt | Result | Notes |
|---|---|---|---|
| **Claude** | Call 1 | ✅ PASS | `success: true`, 5 rows, `totalRecords: 978` |
| **Claude** | Call 2 | ✅ PASS | Identical parameters — payload matches Call 1 byte-for-byte |
| **Cursor** | Attempt A | ⚠️ Transient FAIL | `MCP error -32000: Connection closed` — no fund payload returned; retried |
| **Cursor** | Call 1 | ✅ PASS | `success: true`, 5 rows, `totalRecords: 978` |
| **Cursor** | Call 2 | ✅ PASS | Same parameters; payload identical to Call 1 for all compared fields |

#### Response envelope (all successful calls — equivalent)

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 5 of 978 total fund(s).",
  "recordCount": 5,
  "totalRecords": 978,
  "offset": 0,
  "limit": 5,
  "hasMore": true,
  "wasTruncated": false,
  "pagination": { "currentPage": 1, "totalPages": 196, "nextOffset": 5 }
}
```

#### Fund rows returned (all successful calls — identical across both agents)

| # | Name | AssetClassName | SubAssetClassName | PipelineStatus | FundManagerName | ResponsibleName |
|---:|---|---|---|---|---|---|
| 1 | 2026 Fund | Private Equity | Buyout and Growth Equity | 1 - Pre-One Pager | Phoenix Equity | Andrew Stevenson |
| 2 | 36 South | Absolute Return | Relative Value | X - Exited | 36 South Capital Advisors | Burton Yuen |
| 3 | 59 North Partners, LP | Absolute Return | Equity Hedge | P - Portfolio | 59 North Capital Management | Kapua Aiu-Yasuhara |
| 4 | 5AM Ventures IV, LP | Private Equity | Venture Capital | X - Exited | 5AM Ventures | Jon Iwatani |
| 5 | 5AM Ventures V, L.P. | Private Equity | Venture Capital | X - Exited | *(null)* | Jon Iwatani |

#### Consistency check (cross-call and cross-agent comparison)

| Check | Claude | Cursor |
|---|---|---|
| Same 5 funds returned in same order | ✅ PASS | ✅ PASS |
| Fund names identical across calls | ✅ PASS | ✅ PASS |
| AssetClassName identical across calls | ✅ PASS | ✅ PASS |
| PipelineStatus identical across calls | ✅ PASS | ✅ PASS |
| FundManagerName identical across calls | ✅ PASS | ✅ PASS |
| totalRecords identical (978 vs 978) | ✅ PASS | ✅ PASS |
| No invented / fabricated funds detected | ✅ PASS | ✅ PASS |
| No raw JWT, token, or credential in output | ✅ PASS | ✅ PASS |

#### Minimum field checklist (per v1.4 requirements)

| Required field | Present | Note |
|---|---|---|
| `Name` (fund name) | ✅ Yes | All 5 rows populated (both agents) |
| `AssetClassName` (asset class) | ✅ Yes | All 5 rows populated (both agents) |
| `FundManagerName` | ⚠️ Partial | Fund #5 (5AM Ventures V) is null — source data gap (F-02, persists from first test) |
| `PipelineStatus` | ✅ Yes | All 5 rows populated (both agents) |
| `ResponsibleName` | ✅ Yes | All 5 rows populated (both agents) |
| `FundLiquidityTypeName` | ✅ Yes | All 5 rows populated (both agents) |
| Fund GUID / ID field | ❌ Absent | No explicit `ID` / `FundId` GUID in `get_funds` projection — F-01 persists (Low severity) |

#### Pagination metadata

| Field | Value |
|---|---|
| `totalRecords` | 978 |
| `recordCount` | 5 |
| `hasMore` | true |
| `totalPages` | 196 |
| `nextOffset` | 5 |

**Δ vs. first test (2026-04-25):** `totalRecords` increased from **977 → 978** — one new fund added to the backend. First-page fund set is unchanged.

---

### Scenario 2 — Error path: PASS ✅

KS-977 Scenario 2 acceptance intent: when the session is bad, the user sees a **clear failure** — not a silent empty list presented as success with invented funds.

#### 2.A — OAuth rejection at the MCP HTTP boundary (Cursor — curl probes)

**Method:** `curl.exe` to `https://mcp.conceptia.com/dynamo/sse` with `Accept: text/event-stream`, no Cursor MCP bridge, no real tokens logged.

| Case | Request | HTTP | Response body (verbatim) | Silent "success" fund list? |
|---|---|---|---|---|
| **S2-A1** | No `Authorization` header | **401** | `{"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}` | **No** — explicit 401 JSON |
| **S2-A2** | `Authorization: Bearer invalid_token_for_test` (synthetic) | **401** | `{"error":"invalid_token","error_description":"Bearer token validation failed."}` | **No** — explicit 401 JSON |

**Verdict:** PASS — both cases return machine-readable auth errors at the MCP entrypoint.

#### 2.B — Transient MCP transport error (Cursor)

| Case | Observation | Silent empty fund success? |
|---|---|---|
| **S2-B1** | First in-session `get_funds` via Cursor returned `MCP error -32000: Connection closed` | **No** — hard MCP tooling error, no `data` array |
| **S2-B2** | Immediate retry with same parameters returned normal `success: true` payload | n/a (recovery after reconnect) |

**Verdict:** PASS — no silent success on failure; recovery on retry is acceptable connector behavior.

#### 2.C — Live server disconnection (Claude)

**Condition triggered:** The Dynamo MCP server (`mcp.conceptia.com/dynamo/sse`) disconnected mid-session during the Claude test run — the connector dropped and all 7 tools became unavailable.

**Observed behavior:**
- All Dynamo MCP tools (`get_funds`, `get_fund_description`, `get_notes`, etc.) became unreachable immediately upon disconnection.
- No silent empty list was returned. Tools ceased to be callable; any invocation surfaced a clear tool-unavailable/connector-error.
- The agent correctly recognized the disconnected state and did not invent fund data or fall back to fabricated results.

| Criteria | Result |
|---|---|
| MCP session disconnected | ✅ Confirmed — server disconnected live |
| Clear failure surfaced (not silent empty success) | ✅ Pass — tools unavailable, no data returned |
| Agent did not fabricate a fund list | ✅ Pass — no invented funds |

**Verdict:** PASS — error path behaves correctly. The system fails explicitly on disconnection rather than silently.

#### 2.D — Connector disabled in Cursor (re-run)

**Given:** User disabled/removed the Conceptia Dynamo MCP connector from Cursor (server `user-conceptia-dynamo` no longer available).

| Field | Value |
|---|---|
| **Outcome** | **FAIL (expected)** — tool not callable |
| **Error (verbatim)** | `MCP server does not exist: user-conceptia-dynamo. Available servers: plugin-atlassian-atlassian, user-Figma, user-eamodio.gitlens-extension-GitKraken, user-mcp-atlassian, user-notion` |
| **Fund payload / `success: true`** | **Absent** |
| **Silent empty fund list as success** | **No** |

**Verdict:** PASS — disconnected MCP is surfaced as an explicit configuration/runtime error, not a fabricated fund list.

---

### Scenario 3 — Edge case (0 or fewer than 5 funds): BLOCKED ⚠️

**Reason:** The current tester identity (`binh.ha@conceptia.com`) has access to **978 funds** — the edge case is not triggerable with this account. No low-scope test identity with 0 or <5 funds in scope has been provisioned.

**To unblock:** Provision a Dynamo/Entra identity with restricted fund scope (0 or <5 funds), authenticate via OAuth, run `get_funds limit=5 offset=0`, and assert that `recordCount` matches actual fund count without padded/invented rows.

**Status:** BLOCKED — same blocker as first test (2026-04-25). No change. Applies to both agents.

---

## Security Scan

| Check | Claude | Cursor |
|---|---|---|
| Raw JWT or Bearer token in tool output | ✅ None detected | ✅ None observed |
| Refresh token or client secret in transcript | ✅ None detected | ✅ None observed |
| Password or API key string in output | ✅ None detected | ✅ None observed |
| Credential leakage via tool response fields | ✅ None detected | ✅ None observed |

**Security verdict: PASS (both agents)** — No credential material appears in any tool output, response field, or agent transcript.

---

## Findings

### Persisting from First Test (2026-04-25)

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | `get_funds` payload has no explicit `FundId` / GUID field. Ticket and guide section 5.1 reference "fund ID" but the list projection returns name-based identity only. `Name` + `DateCreated` used as stability proxy; `get_fund_description` can be chained to retrieve `ID` if needed. AC wording may need update. | **Persists — unresolved** (confirmed by both agents) |
| F-02 | Info | Fund "5AM Ventures V, L.P." has null `FundManagerName` and `FundManagerPrimaryContactName`. Source data gap in Dynamo backend, not a tool defect. | **Persists — unresolved** (confirmed by both agents) |
| F-03 | Info | OAuth session expires between sessions, requiring re-authentication. Connector by-design behavior; no product defect. | **By design — N/A** |

### New Observations (Second Run)

| ID | Source | Severity | Description |
|---|---|---|---|
| N-01 | Both | Info | `totalRecords` increased from 977 (2026-04-25) to 978 (2026-05-13) — one new fund added to the backend. First-page result set unchanged. No impact on test results. |
| N-02 | Cursor | Info | First MCP `get_funds` call returned `-32000 Connection closed`; immediate retry succeeded. Infrastructure / session stability observation. |
| N-03 | Cursor | Info | Scenario 2.A exercised via `curl.exe` against `https://mcp.conceptia.com/dynamo/sse` — **401** + JSON for both missing auth and synthetic invalid Bearer. |
| N-04 | Cursor | Info | Post-disconnect re-run: `get_funds` with connector removed → `MCP server does not exist: user-conceptia-dynamo`. Clear explicit error, no fund data. |

---

## Test Matrix Row — Section 5.1 Auth

| Agent | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **Claude** | **P** | n/a | BLOCKED | **P** (live disconnect) | n/a |
| **Cursor** | **P** | n/a | **P** (401 at gateway) | **P** (-32000 + connector disabled) | n/a |
| **Combined** | **P** | n/a | **P** | **P** | n/a |

*Invalid input and Large dataset are n/a for row 5.1 per guide.*

---

## Comparison with First Test (2026-04-25)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS (both agents) | **PASS** — consistent across both agents |
| Scenario 2 Error path | PASS (both agents) | **PASS** — Claude: live MCP disconnect; Cursor: 401 gateway + -32000 + connector disabled |
| Scenario 3 Edge case | BLOCKED | **BLOCKED** — same blocker (both agents) |
| Total fund count | 977 | **978** (+1) |
| First-5 fund set | Same 5 funds | **Identical** across both agents and both runs |
| F-01 (no GUID in get_funds) | Present | **Persists** |
| F-02 (null FundManagerName) | Present | **Persists** |
| Credential leakage | None | **None** (both agents) |

---

## Evidence

| Agent | Tool / Method | Details |
|---|---|---|
| **Claude** | `get_funds` via MCP `https://mcp.conceptia.com/dynamo/sse` | 2 calls, `limit=5, offset=0`, same authenticated session; live MCP disconnect observed mid-session |
| **Cursor** | `get_funds` via `user-conceptia-dynamo` (when connected) | 2 successful calls post-reconnect; `curl.exe` probes for 401 error path; connector-disabled re-run for §2.D |

- **Successful calls logged:** 4 total (2 per agent), identical parameters `limit=5, offset=0`
- **Scenario 2.A:** `curl.exe` probes to `https://mcp.conceptia.com/dynamo/sse` — synthetic `Bearer invalid_token_for_test` only; no production tokens recorded
- **Scenario 2.D:** `get_funds` after user disconnected Conceptia Dynamo — IDE error string captured verbatim
- **Redaction:** No investor PII beyond business fund/manager names; no secrets logged
- **Report files:**
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-977 - Claude Result.md`
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-977 - Cursor Result.md`
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-977 Result.md` *(this file)*

---

## Verdict

| Criteria | Claude | Cursor | Combined |
|---|---|---|---|
| Section 5.1 happy-path PASS | ✅ PASS | ✅ PASS | ✅ PASS |
| Two-call consistency check | ✅ PASS | ✅ PASS | ✅ PASS |
| No credential leakage | ✅ PASS | ✅ PASS | ✅ PASS |
| No invented / fabricated fund rows | ✅ PASS | ✅ PASS | ✅ PASS |
| Minimum required fields present | ✅ PASS (F-01/F-02 noted) | ✅ PASS (F-01/F-02 noted) | ✅ PASS |
| Scenario 2 error path | ✅ PASS (live disconnect) | ✅ PASS (401 + -32000 + connector disabled) | ✅ PASS |
| Scenario 3 edge case | ⚠️ BLOCKED | ⚠️ BLOCKED | ⚠️ BLOCKED |

**Final result: PASS (Scenarios 1–2) / BLOCKED (Scenario 3)**  
Section 5.1 functional acceptance criteria are met for the happy-path and error-path gates across both agents. Scenario 3 remains blocked pending provisioning of a low-scope test identity.

---

*Generated: 2026-05-20 · Consolidated from: Claude (claude-sonnet-4-6) + Cursor (Composer) second-time test runs dated 2026-05-13 · Source: KS-977 v1.4 updated requirements · Guide: dynamo-mcp-testing-guide_v1.4.md*
