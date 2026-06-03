# KS-977 — Cursor QA Result (Third Time Test)

## Dynamo MCP QA — Validate OAuth and fund list via `get_funds` (Section 5.1 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Story** | US-E3-01 — Validate OAuth and fund list via get_funds |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Scope executed** | Jira description **Updated requirements — guide v1.5 (10-tool MCP inventory)** only |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **5.1**; stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tool under test** | `get_funds` (primary); `get_fund_description` (optional ID path per v1.5 §B) |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3)** |

---

## Summary

Section **5.1** happy path **passes** under **guide v1.5** while the Conceptia Dynamo MCP connector was **Connected** after recovery from the prior `EADDRINUSE` / `-32000 Connection closed` bridge issue. Two consecutive `get_funds` calls with `limit: 5`, `offset: 0` returned **byte-identical** business payloads, `totalRecords` **979**, and **no** raw JWT, refresh token, client secret, or password material in tool output.

**v1.5 inventory:** Cursor MCP registry exposes **10 tools**, matching guide section **1.3**. Removed tools (`get_rating_details`, `get_rating_summary`, `search_aloha_funds`) are **absent**. `read_data`, `describe_table`, and `list_table` are registered but **not invoked** on this ticket (section 5.5 / VULN-01/02 out of scope).

**Scenario 2** passes via HTTP unauthorized probes at the MCP gateway (**401** + explicit JSON for missing auth and invalid Bearer). Authenticated `get_funds` remained healthy after probes (positive control).

**Scenario 3** remains **blocked** — authenticated identity has **979** funds in scope; no low-scope test account (0 or &lt;5 funds) was provisioned.

---

## v1.5 requirements executed (KS-977 updated section)

| v1.5 requirement | Status |
|---|---|
| **A.** Preconditions — MCP connected; `get_funds` registered | **PASS** |
| **A.** 10-tool inventory aligned with KS-991 / guide 1.3 | **PASS** — documented below |
| **B.** Two-call `get_funds` consistency (`limit: 5`, `offset: 0`) | **PASS** |
| **B.** Minimum fields: `Name`, `AssetClassName`, supporting attributes | **PASS** |
| **B.** Fund ID path — `ID` absent on `get_funds`; optional `get_fund_description` | **PASS** — follow-up captured GUID for sample fund |
| **B.** No credential material in output | **PASS** |
| **C.** Pagination metadata (`totalRecords`, `hasMore`, etc.) | **PASS** — recorded (stretch) |
| **D.** Matrix row **5.1 Auth** — Happy path minimum | **PASS** |
| **D.** Exclusions — `read_data`, `list_table`, `describe_table`, analysis tools | **S** — not invoked |
| **Security** VULN-01 / VULN-02 on `read_data` | **N/A** — out of scope for 5.1 |

---

## Test execution

### Preconditions — 10-tool inventory (v1.5 §A)

| # | Tool | In v1.5 inventory | Registered in Cursor session |
|---:|---|:---:|:---:|
| 1 | `analyze_notes` | Yes | Yes |
| 2 | `describe_table` | Yes (HIGH) | Yes |
| 3 | `get_activity` | Yes | Yes |
| 4 | `get_documents` | Yes | Yes |
| 5 | `get_fund_description` | Yes | Yes |
| 6 | `get_funds` | Yes | Yes |
| 7 | `get_notes` | Yes | Yes |
| 8 | `list_table` | Yes (HIGH) | Yes |
| 9 | `llm_text_analysis` | Yes | Yes |
| 10 | `read_data` | Yes (HIGH — VULN-01/02) | Yes |
| — | `get_rating_details` | Removed 2026-05-07 | Absent |
| — | `get_rating_summary` | Removed 2026-05-07 | Absent |
| — | `search_aloha_funds` | Removed prior to v1.4 | Absent |

**Connector state:** Connected / Ready (OAuth completed earlier in session after stale `mcp-remote` process cleanup).

**Prompt (natural language):** *List the first 5 funds I have access to (via MCP).*

**Tool parameters:** `get_funds` with `{ "limit": 5, "offset": 0 }`.

---

### Scenario 1 — Happy path: **PASS**

| Call | Result | Notes |
|---|---|---|
| Call 1 | **PASS** | `success: true`, 5 rows, `totalRecords: 979` |
| Call 2 | **PASS** | Same parameters; payload **matches** Call 1 for all compared fields |

#### Response envelope (both successful calls — equivalent)

- `success`: `true`
- `message`: Query executed successfully; retrieved **5 of 979** total fund(s).
- `recordCount`: **5**
- `totalRecords`: **979**
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

#### v1.5 field checklist (§B)

| Requirement | Result |
|---|---|
| `Name` on each row | **PASS** |
| `AssetClassName` (or equivalent) | **PASS** |
| Supporting attributes (`FundManagerName`, `PipelineStatus`, `DateCreated`, etc.) | **PASS** (F-02 on row 5) |
| Two calls — consistent stability keys; no invented funds | **PASS** |
| No JWT / refresh token / password in JSON | **PASS** |
| Fund GUID on `get_funds` row | **Absent** — F-01 persists |

#### Optional ID path — `get_fund_description` (v1.5 §B)

Follow-up for row 3 (`59 North Partners, LP`):

| Field | `get_funds` | `get_fund_description` |
|---|---|---|
| `Name` | 59 North Partners, LP | 59 North Partners, LP |
| `FundManagerName` | 59 North Capital Management | 59 North Capital Management |
| `ID` (GUID) | *not in list projection* | `D7879DB7-E230-4191-8849-DE4B7B64626C` |

**Stability path used:** **Name** + `AssetClassName` + `FundManagerName` for two-call check; **GUID** obtained via optional `get_fund_description` per v1.5 detailed requirements **B**.

---

### Scenario 2 — Error path: **PASS**

KS-977 v1.5 acceptance intent: when the session is disconnected or OAuth is invalid/expired, the user sees a **clear failure** — **not** a silent empty success with invented funds.

#### 2.A — Invalid / missing OAuth at MCP gateway (HTTP)

**Method:** `curl.exe` to `https://mcp.conceptia.com/dynamo/sse` with `Accept: text/event-stream`. **No** production tokens logged.

| Case | Request | HTTP | Response body (verbatim) | Silent fund list? |
|---|---|---:|---|---|
| **S2-A1** | No `Authorization` header | **401** | `{"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}` | **No** |
| **S2-A2** | `Authorization: Bearer invalid_token_for_test` | **401** | `{"error":"invalid_token","error_description":"Bearer token validation failed."}` | **No** |

**Verdict:** **PASS** — explicit auth errors at the Conceptia MCP host; no fund rows.

#### 2.B — Positive control (authenticated session after probes)

`get_funds` with `{ "limit": 5, "offset": 0 }` via **`user-conceptia-dynamo`** after §2.A curls still returned **`success: true`** with the same five-fund page as Scenario 1 — HTTP probes do not invalidate Cursor’s stored OAuth session.

**Verdict:** **PASS** — authorized path unaffected by unauthenticated curl alone.

#### 2.C — Prior-session transport note (informational)

Earlier on 2026-05-21, the MCP bridge failed with **`EADDRINUSE` on port 37189** and Cursor logged **`Connection closed` (-32000)** until stale `mcp-remote` processes were terminated. That failure class matches Second Time Test §2.B (hard error, no `data` array). **Not re-triggered** in this run after cleanup.

**Verdict (this run):** Connector **Connected** for all Scenario 1 calls; no `-32000` on the two recorded `get_funds` invocations.

---

### Scenario 3 — Edge case (zero or fewer than five funds): **BLOCKED**

**Reason:** Authenticated identity has **979** funds (`totalRecords`). No restricted test identity (0 or &lt;5 funds in scope) has been provisioned — same blocker across all three test runs.

**To unblock:** Provision a low-scope Entra/Dynamo identity, OAuth in, run `get_funds limit=5 offset=0`, assert `recordCount` matches actual scope without padded rows.

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| Refresh token or client secret in output | **None** observed |
| Password or API key string in output | **None** observed |
| Credential leakage via error paths (§2.A) | **None** — JSON errors only |

**Security verdict:** **PASS**

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | `get_funds` list projection omits Fund **GUID** / `ID`; use **Name**-based stability or `get_fund_description` for `ID` (documented this run). | **Persists** |
| F-02 | Info | `5AM Ventures V, L.P.` — `FundManagerName` / primary contact **null** in payload. Source data gap, not MCP fabrication. | **Persists** |
| F-03 | Info | OAuth session requires periodic re-auth between sessions; by-design connector behavior. | **By design — N/A** |
| Scenario 3 blocker | Medium | No low-scope test identity for 0 / &lt;5 funds edge case. | **Persists** — environment action |
| N-01 | Info | `totalRecords` **979** vs **978** on 2026-05-13 second run (+1 fund in tenant scope). First-five row set unchanged. | **Informational** |
| N-02 | Info | Prior bridge `EADDRINUSE` / `-32000` resolved by killing stale `mcp-remote` PIDs before this test run. | **Informational** |

---

## Test matrix row — Section 5.1 Auth (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.1 Auth (`get_funds`)** | **P** | n/a | **P** | n/a* | n/a | n/a |

\* *Network drop / `-32000` not observed on the two successful Scenario 1 calls this run; prior-session transport failure documented under §2.C.*

*Per guide v1.5 section 6: Invalid input, Large dataset, and VULN probe are **n/a** for row 5.1. Unauthorized user assessed via §2.A HTTP probes.*

---

## Comparison across test runs

| Dimension | First (2026-04-25) | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| Tool inventory | 8 tools | 8 tools | **10 tools** |
| Scenario 1 | PASS | PASS | **PASS** |
| Scenario 2 | PASS | PASS | **PASS** |
| Scenario 3 | BLOCKED | BLOCKED | **BLOCKED** |
| `totalRecords` | 977 | 978 | **979** |
| First-5 fund set | Same 5 | Identical | **Identical** |
| MCP connector | Connected | Mid-session disconnect | **Connected** (after bridge fix) |
| Credential leakage | None | None | **None** |

---

## Evidence

| Item | Detail |
|---|---|
| **Primary tool** | `get_funds` × 2 — `{ "limit": 5, "offset": 0 }` |
| **Optional tool** | `get_fund_description` — `fundName: "59 North Partners, LP"` |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **Unauthorized probes** | `curl.exe` §2.A (synthetic Bearer only) |
| **Tools not invoked** | `read_data`, `list_table`, `describe_table`, `get_activity`, `get_notes`, `get_documents`, `analyze_notes`, `llm_text_analysis` |
| **Black-box rule** | No Dynamo UI accessed |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-977 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.1 happy path executable | **PASS** |
| Two-call consistency check | **PASS** |
| 10-tool v1.5 inventory documented | **PASS** |
| No credential leakage | **PASS** |
| No invented / fabricated fund rows | **PASS** |
| Scenario 2 error path | **PASS** |
| Scenario 3 edge case | **BLOCKED** — no low-scope test identity |
| v1.5 updated requirements section | **PASS** (Scenario 1 & 2); Scenario 3 blocked as documented |

**Final result: PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3)**

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-977 Jira — **Updated requirements — guide v1.5 (10-tool MCP inventory)** · Guide: `dynamo-mcp-testing-guide_v1.5.md`*
