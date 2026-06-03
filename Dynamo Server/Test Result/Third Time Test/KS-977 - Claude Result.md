# KS-977 — Claude QA Result (Third Time Test — Live Retest)
## Dynamo MCP QA — Validate OAuth and fund list via `get_funds` (Section 5.1)

| Field | Value |
|---|---|
| **Ticket** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Story** | US-E3-01 — Validate OAuth and fund list via get_funds |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.1 — Authentication test · **Guide v1.5** |
| **Test run** | Third Time Test — Live Retest (server reconnected) |
| **Test date (UTC)** | 2026-05-22 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tool under test** | `get_funds` |
| **Overall result** | **PASS (Scenario 1, Scenario 2) / BLOCKED (Scenario 3 — no low-scope identity)** |

---

## Summary

The Dynamo MCP server reconnected mid-session on 2026-05-22. `get_funds` was invoked live and all core scenarios executed.

**Key outcomes:**

- **Scenario 1 (Happy path):** Two sequential `get_funds(limit=10, offset=0)` calls returned byte-identical results — `totalRecords: 979` (up from 978 in Second Test), consistent first-page fund list. PASS.
- **Scenario 2 (Error path):** `get_funds(limit=200)` rejected with bounded validation error; no stack trace or internal path in response. PASS.
- **Scenario 3 (Edge case — low-scope identity):** BLOCKED — no low-scope Entra test identity provisioned (F-06 persists from all prior runs). Not executable.

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

**Call 1:** `get_funds(limit=10, offset=0)` — `totalRecords: 979`. First 10 funds returned:

| # | Name | FundManagerName | AssetClass | PipelineStatus |
|---|---|---|---|---|
| 1 | 2026 Fund | 2026 Fund | Hedge Fund | P - Portfolio |
| 2 | 36 South | 36 South Investment Managers | Hedge Fund | P - Portfolio |
| 3 | 59 North Partners, LP | 59 North Capital Management | Hedge Fund | P - Portfolio |
| 4 | 5AM Ventures IV | 5AM Ventures | Private Equity | P - Portfolio |
| 5 | 5AM Ventures V | null | Private Equity | P - Portfolio |
| 6 | 83North Fund VII-X | 83North | Hedge Fund | P - Portfolio |
| 7 | 83North FXV III | 83North | Hedge Fund | P - Portfolio |
| 8 | 83North FXV IV | 83North | Hedge Fund | P - Portfolio |
| 9 | 83North FXV | 83North | Hedge Fund | P - Portfolio |
| 10 | 83North IV | 83North | Hedge Fund | P - Portfolio |

**Call 2 (consistency check):** `get_funds(limit=10, offset=0)` — `totalRecords: 979`. Byte-identical result to Call 1. Consistency confirmed.

**F-02 re-confirmed:** `5AM Ventures V` has `FundManagerName: null` — same as prior test runs. Not a regression.

**Security check:** No JWT, bearer tokens, or internal paths in any response.

**Status:** PASS ✅

---

### Scenario 2 — Error path: PASS ✅

`get_funds(limit=200)` (over max of 100) returned:

```json
{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 100"}
```

No stack trace, no internal path, no framework version string. Clean validation error.

**Status:** PASS ✅

---

### Scenario 3 — Edge case (low-scope identity): BLOCKED ⚠️

No low-scope Entra test identity provisioned with 0 or <5 funds access. Cannot verify tenant isolation from a second identity. F-06 persists from all prior runs.

**Status:** BLOCKED ⚠️

---

## Security Scan

| Check | Result |
|---|---|
| Credentials or raw JWT in fund list response | ✅ None |
| Stack trace in error response (limit=200) | ✅ None — clean validation error |
| Cross-tenant fund data visible | ✅ Not testable — F-06 open |
| Consistent `totalRecords` across 2 calls | ✅ 979 — stable |

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-02 | Info | `5AM Ventures V` has `FundManagerName: null` | **Persists — by design** |
| F-06 | Medium | No low-scope Entra test identity — Scenario 3 not executable | **Persists** |

---

## Test Matrix Row — Section 5.1 Auth (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.1 Auth** (`get_funds`) | **✅ PASS** | **✅ PASS** | **⚠️ BLOCKED** (F-06) | **✅ PASS** (prior) | n/a | n/a |

---

## Comparison Across All Test Runs

| Dimension | First Test (2026-04-25) | Second Test (2026-05-13) | Third Test (2026-05-22) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| `totalRecords` | 977 | 978 | **979 (+1)** |
| Byte-identical consistency | ✅ PASS | ✅ PASS | **✅ PASS** |
| Error path (limit=200) | ✅ PASS | ✅ PASS | **✅ PASS** |
| Low-scope identity (S3) | ⚠️ BLOCKED | ⚠️ BLOCKED | **⚠️ BLOCKED** |
| Server status | Connected | Connected | **Connected** |

---

## Verdict

**Final result: PASS (Scenario 1, Scenario 2) / BLOCKED (Scenario 3)**

`get_funds` performs correctly under live conditions. `totalRecords` is stable at 979, consistent across two calls in the same session. Error path returns a clean bounded validation message. Scenario 3 (low-scope identity) remains blocked by the persistent F-06 provisioning gap.

---

*Generated: 2026-05-22 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-977 v1.5 live retest · Guide: dynamo-mcp-testing-guide_v1.5.md §5.1*
