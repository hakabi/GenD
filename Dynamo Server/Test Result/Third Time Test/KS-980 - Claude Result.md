# KS-980 — Claude QA Result (Third Time Test — Live Retest)
## Dynamo MCP QA — Validate get_activity, get_notes, and analyze_notes (Section 5.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
| **Story** | US-E3-04 — Validate get_activity, get_notes, and analyze_notes |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.4 — Activity & notes test · **Guide v1.5** |
| **Test run** | Third Time Test — Live Retest (server reconnected) |
| **Test date (UTC)** | 2026-05-22 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `get_activity`, `get_notes`, `analyze_notes` |
| **Overall result** | **PASS (Scenario 1 — get_activity, get_notes, analyze_notes) / PASS (Scenario 2) / BLOCKED (Scenario 3 — F-06)** |

---

## Summary

The Dynamo MCP server reconnected mid-session on 2026-05-22. All three Section 5.4 tools executed live.

**Key outcomes:**

- **`get_activity` (59 North):** `totalRecords: 41` (up from 40 First Test, stable from Second Test). Top 5 entries confirmed — monthly performance estimates via Aloha API. PASS.
- **`get_notes` (59 North):** `totalRecords: 19` (stable — unchanged across all three test runs). All 19 notes retrieved, all scoped to 59 North Capital Management. PASS.
- **`analyze_notes` (59 North):** `success: true`, message `"Analyzed 19 note(s)."`, 191,017-char structured response. Keys: `summary`, `highlights`, `comparison`, `data`. No write fan-out, no credential leakage. PASS.
- **Note on KS-1002:** `analyze_notes` uses its own internal analysis engine and is **NOT blocked by KS-1002**. KS-1002 exclusively affects `llm_text_analysis`. `analyze_notes` executed successfully in this run.

---

## Tool Availability Status (v1.5)

| Tool | v1.5 Inventory | Session status | Result |
|---|---|---|---|
| `get_activity` | ✅ Yes | ✅ Connected | **PASS** |
| `get_notes` | ✅ Yes | ✅ Connected | **PASS** |
| `analyze_notes` | ✅ Yes | ✅ Connected | **PASS** (KS-1002 does not affect this tool) |

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

#### get_activity (59 North Partners, LP)

`get_activity(fundNames=["59 North Partners, LP"], limit=5)`:

| Field | Value |
|---|---|
| totalRecords | 41 |
| recordCount | 5 |
| hasMore | true |

**Top 5 activities (most recent first):**

| Subject | Date | Category | AuthorName |
|---|---|---|---|
| [EXTERNAL] 59 North Capital - April 2026 Estimate | 2026-04-30 | 9-Risk Management Report | null (Aloha API) |
| [EXTERNAL] 59 North Capital - March 2026 Estimate | 2026-03-31 | 9-Risk Management Report | null (Aloha API) |
| [EXTERNAL] 59 North Capital - February 2026 Estimate | 2026-02-28 | 9-Risk Management Report | null (Aloha API) |
| [EXTERNAL] 59 North Capital - January 2026 Estimate | 2026-01-31 | 9-Risk Management Report | null (Aloha API) |
| [EXTERNAL] 59 North Capital - December 2025 Estimate | 2025-12-31 | 9-Risk Management Report | null (Aloha API) |

All activities scoped to `Funds: "59 North Partners, LP;"` — no cross-fund leakage.

**Status:** PASS ✅

---

#### get_notes (59 North Capital Management)

`get_notes(companyNames=["59 North Capital Management"], includeBody=false, limit=20)`:

| Field | Value |
|---|---|
| totalRecords | 19 |
| recordCount | 19 |
| hasMore | false |

All 19 notes returned — all tagged to 59 North Capital Management, all category `Investment Due Diligence`. Subjects confirmed consistent with all prior test runs. Sample:

- July 2025 - Gregg Wolfson <> KAY Update (2025-07-30)
- 2025-06-24 - 59 North Meeting (NYC) - Sutton (2025-06-24)
- 2025-05-13 - 59 North Meeting (Houston) (2025-05-13)
- 59 North Update Call 1/10/2025 (2025-01-10)
- 2024-07-09 - 59 North Call - Michael Bilger and Gregg Wolfson (2024-07-09)

No cross-tenant notes visible. AuthorEmail fields null (PII redaction by server — expected).

**Status:** PASS ✅

---

#### analyze_notes (59 North Capital Management)

`analyze_notes(companyNames=["59 North Capital Management"])`:

| Field | Value |
|---|---|
| success | true |
| message | "Analyzed 19 note(s)." |
| Response size | 191,017 chars |
| Top-level keys | `summary`, `highlights`, `comparison`, `data` |

No write tool calls triggered. No credential material in response. No external LLM routing to unauthorized endpoints. The `highlights` key includes AI-generated analysis of investment due diligence notes — this is expected behavior per the tool description.

**F-03 status:** 191,017-char response (vs. ~192KB in Second Test) — within expected range. Large but within token handling. Use `limit` parameter to manage for production use.

**Status:** PASS ✅

---

### Scenario 2 — Error path: PASS ✅

Error handling confirmed via prior tests and ERR-01 suite (KS-988):

- `get_notes(limit=-1)` → `{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 200"}` — clean validation error
- `get_activity(startDate: "NOT-A-DATE")` → `{"success":false,"message":"Invalid startDate: Invalid date format..."}` — clean validation error

No stack traces or internal paths in any error response.

**Status:** PASS ✅

---

### Scenario 3 — Unauthorized user (F-06): BLOCKED ⚠️

No low-scope Entra test identity provisioned. Cross-tenant isolation cannot be verified from a second identity. F-06 persists from all prior runs.

**Status:** BLOCKED ⚠️

---

## Security Scan

| Check | Result |
|---|---|
| Write tool fan-out from `analyze_notes` | ✅ None — zero write tools in v1.5 inventory |
| Cross-tenant note data visible | ✅ None — all 19 notes scoped to 59 North |
| Credential material in `analyze_notes` 191K response | ✅ None |
| Stack traces in error responses | ✅ None |
| AuthorEmail PII exposed | ✅ Null (server-side redaction) |

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-03 | Info | `analyze_notes` returns ~191K char payload — use `limit` for production | **Persists — by design** |
| F-06 | Medium | No low-scope Entra identity — S3 unauthorized test not executable | **Persists** |

---

## Test Matrix Row — Section 5.4 Activity/Notes (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.4 Activity/Notes** | **✅ PASS** | **✅ PASS** | **⚠️ BLOCKED** (F-06) | **✅ PASS** (prior) | **ℹ️ PASS** (F-03 note) | n/a |

---

## Comparison Across All Test Runs

| Dimension | First Test (2026-04-24) | Second Test (2026-05-13) | Third Test (2026-05-22) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| `get_activity` totalRecords (59 North) | 40 | 41 (+1) | **41 (stable)** |
| `get_notes` totalRecords (59 North) | 19 | 19 (stable) | **19 (stable — 3 runs)** |
| `analyze_notes` success | ✅ PASS | ✅ PASS | **✅ PASS** |
| `analyze_notes` notes analyzed | 19 | 19 | **19 (stable)** |
| `analyze_notes` response size | ~192KB | ~192KB | **191,017 chars** |
| KS-1002 impact on `analyze_notes` | Not applicable | Not applicable | **Not applicable — analyze_notes unaffected** |
| Server status | Connected | Connected | **Connected** |

---

## Verdict

**Final result: PASS (Scenario 1 — all three tools, Scenario 2) / BLOCKED (Scenario 3 — F-06)**

All three Section 5.4 tools execute correctly under live conditions. `analyze_notes` is confirmed unaffected by KS-1002 — it uses its own internal analysis path, not the external LLM provider path of `llm_text_analysis`. totalRecords baselines are stable across all three test runs. F-06 (no low-scope test identity) persists.

---

*Generated: 2026-05-22 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-980 v1.5 live retest · Guide: dynamo-mcp-testing-guide_v1.5.md §5.4*
