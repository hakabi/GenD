# KS-979 — Consolidated QA Result (Third Time Test)
## Dynamo MCP QA — List fund documents via `get_documents` (Section 5.3 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Story** | US-E3-03 — List fund documents via get_documents |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.3 — Documents test · **Guide v1.5** |
| **Test run** | Third Time Test — Consolidated (Cursor + Claude) |
| **Test dates (UTC)** | 2026-05-21 (Cursor) · 2026-05-22 (Claude) |
| **Testers / Agents** | Cursor — Composer · Claude — Cowork mode (claude-sonnet-4-6) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` — **Connected (both runs)** |
| **Tool under test** | `get_documents` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)** |

---

## Agent agreement summary

| Dimension | Cursor | Claude | Agreement |
|---|---|---|---|
| Scenario 1 — Happy path | **PASS** | **PASS** | ✅ Agree |
| Scenario 2 — Error path | **PASS** | **PASS** | ✅ Agree |
| Scenario 3 — Zero-doc fund | **PASS** | **PASS** | ✅ Agree |
| 59 North `totalRecords` | **151** | **151** | ✅ Agree |
| 2026 Fund `totalRecords` | **0** | **0** | ✅ Agree |
| First doc ID | `84C6E63A-4679-4581-BF1A-633C9C7D2444` | Same | ✅ Agree |
| No-filter validation error | PASS | PASS | ✅ Agree |

**Both agents agree on all outcomes. Cursor and Claude add complementary detail on error path sub-tests.**

---

## v1.5 requirements executed

| v1.5 requirement | Cursor | Claude | Consolidated |
|---|---|---|---|
| **A.** MCP connected; `get_documents` registered | PASS | PASS | **PASS** |
| **B.** Two-call consistency with `excludeContent: true` | PASS | PASS | **PASS** |
| **B.** Document IDs, titles, categories, dates returned | PASS | PASS | **PASS** |
| **B.** `totalRecords` metadata present | PASS (151) | PASS (151) | **PASS** |
| **C.** Invalid fund — controlled empty result | PASS | PASS | **PASS** |
| **C.** No filter — explicit validation failure | PASS | PASS | **PASS** |
| **D.** Zero-document fund — explicit empty state | PASS | PASS | **PASS** |
| **Security** — no credential material in output | PASS | PASS | **PASS** |

---

## Test execution

### Scenario 1 — Happy path: PASS ✅

#### Two-call consistency — 59 North Partners, LP

Both agents used `filterType: "fund"`, `filterValue: "59 North Partners, LP"`, `excludeContent: true`.

| Metric | Cursor (limit=5) | Claude (limit=5) | Status |
|---|---|---|---|
| `totalRecords` | **151** | **151** | ✅ Stable |
| `recordCount` (page) | 5 | 5 | ✅ Agree |
| First doc `ID` | `84C6E63A-4679-4581-BF1A-633C9C7D2444` | `84C6E63A-4679-4581-BF1A-633C9C7D2444` | ✅ Stable |
| Sort order | DateCreated DESC | DateCreated DESC | ✅ Agree |
| Byte-identical call 2 vs call 1 | ✅ | ✅ | ✅ Confirmed |
| `Content` field with `excludeContent: true` | Absent | Absent | ✅ Correct |

#### Top 5 documents — 59 North Partners, LP

| Title | Category | DateCreated | DocumentDate |
|---|---|---|---|
| 59 North Capital Monthly Report - April 2026.pdf | 9-Risk Management Report | 2026-05-07 | 2026-04-30 |
| Investor Statement.pdf | 24-Capital Account Statements | 2026-05-06 | 2026-04-30 |
| 59 North Annual Notice (2026).pdf | 1-ODD Material; Other | 2026-04-14 | 2026-04-14 |
| Investor Confirm Subscription.pdf | 22-Capital Call | 2026-04-17 | 2026-04-01 |
| 59North Subscription Confirmation 4.1.26 | 22-Capital Call | 2026-03-25 | 2026-04-01 |

**F-03 note (Cursor):** `Documentcategories` is a semicolon-delimited string (e.g. `"22-Capital Call;"`), not a JSON array. Callers must split on `";"` if category-level filtering is needed downstream.

All documents scoped to `Companies: "59 North Capital Management;"` — no cross-company data.

**Status: PASS ✅**

---

### Scenario 2 — Error path: PASS ✅

Both agents tested two sub-dimensions:

#### S2-A — Invalid / non-existent fund

| Field | Value |
|---|---|
| `success` | `true` |
| `data` | `[]` |
| `recordCount` | `0` |
| Cross-fund filenames | None |

Controlled empty authorized result. F-02: `success: true` on not-found — callers must check `recordCount`.

#### S2-B — No filter dimensions

Both agents confirmed:

```json
{"success":false,"message":"At least one filter is required: filterType/filterValue, documentCategories, or startDate/endDate"}
```

Explicit validation failure — not a silent empty success. No stack trace, no internal path.

**Status: PASS ✅**

---

### Scenario 3 — Zero-document fund: PASS ✅

Both agents called `get_documents(filterType="fund", filterValue="2026 Fund", excludeContent=true)`:

```json
{"success":true,"data":[],"recordCount":0,"totalRecords":0,"hasMore":false}
```

No invented filenames, no cross-fund leakage (59 North documents not visible). Clean empty state.

**Status: PASS ✅**

---

## Security scan

| Check | Cursor | Claude | Consolidated |
|---|---|---|---|
| Cross-company documents in 59 North response | None | None | ✅ None |
| 59 North documents visible in 2026 Fund call | None | None | ✅ None |
| Stack trace in mandatory-filter error | None | None | ✅ None |
| `Content` field with `excludeContent: true` | Absent | Absent | ✅ Correct |
| `totalRecords` consistency across 2 calls | 151 | 151 | ✅ Stable |

**Security verdict: PASS ✅**

---

## Findings

| ID | Severity | Description | Source | Status |
|---|---|---|---|---|
| F-01 | Low | Acceptance criteria reference `FUND_ID`; tool uses `filterValue` = fund name string. Use `get_funds` Name to drive `get_documents`. | Cursor | **Persists — by design** |
| F-02 | Low | Invalid fund returns `success: true, data: []` — callers must check `recordCount`. | Both | **Persists — known API shape** |
| F-03 | Low | `Documentcategories` is semicolon-delimited string, not JSON array. Callers must split on `";"`. | Cursor | **Persists — by design** |
| F-06 | Medium | No low-scope Entra test identity — unauthorized user isolation not testable. | Both | **Persists** |
| N-01 | Info | `totalRecords` 151 for 59 North — stable across Second Test and both Third Test runs. (First Test: 148 → growth of +3.) | Both | **Informational** |

---

## Test matrix — Section 5.3 Documents (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.3 Documents** (`get_documents`) | **✅ P** | **✅ P** | **⚠️ B** (F-06) | n/a | n/a | n/a |

---

## Comparison across test runs

| Dimension | First (2026-04-25) | Second (2026-05-13) | Third — Cursor (2026-05-21) | Third — Claude (2026-05-22) |
|---|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** | **v1.5** |
| 59 North `totalRecords` | 148 | 151 | **151 (stable)** | **151 (stable)** |
| 2026 Fund `totalRecords` | Not tested | 0 | **0** | **0 (confirmed)** |
| First doc ID | 84C6E63A-… | 84C6E63A-… | **84C6E63A-… (stable)** | **84C6E63A-… (stable)** |
| No-filter error | PASS | PASS | **PASS** | **PASS** |
| Consistency (2 calls) | PASS | PASS | **PASS** | **PASS** |
| Server status | Connected | Connected | Connected | **Connected** |

---

## Verdict

**Final consolidated result: PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)**

Both agents independently confirm all three scenarios. `totalRecords` for 59 North is stable at 151 across both Third Test runs. First document ID `84C6E63A-…` is stable across all three test runs. No-filter validation and zero-document fund both behave correctly.

---

*Consolidated: 2026-05-22 · Sources: KS-979 - Cursor Result.md (2026-05-21) · KS-979 - Claude Result.md (2026-05-22) · Guide: dynamo-mcp-testing-guide_v1.5.md §5.3*
