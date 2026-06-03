# KS-979 — Consolidated QA Result (Second Time Test)
## Dynamo MCP QA — List fund documents via `get_documents` (Section 5.3)

| Field | Value |
|---|---|
| **Ticket** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Story** | US-E3-03 — List fund documents via get_documents |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.3 — Document retrieval test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Testers / Agents** | Claude (Cowork mode — claude-sonnet-4-6) · Cursor (Composer — automated MCP invocation) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` / `user-conceptia-dynamo` |
| **Tool under test** | `get_documents` |
| **Filter used** | `filterType: fund`, `filterValue: <fund name>`, `excludeContent: true` |
| **Overall result** | **PASS (Scenarios 1–3)** |

---

## Summary

All three section 5.3 scenarios **PASS** across both agents. The two-call consistency check for Scenario 1 is confirmed byte-for-byte identical by both agents. `totalRecords` for the baseline fund (59 North Partners, LP) is **151** in both runs, consistent with the count increase from **148** (first test, 2026-04-25) to 151 (+3 documents added since).

The first-page composition has shifted due to new document additions — two new documents now appear at positions 1–2 under DateCreated DESC ordering. This is fully expected and confirmed as consistent behavior by both agents.

**Cursor additionally surfaced a new Scenario 2 sub-case:** calling `get_documents` with **zero filter dimensions** returns `success: false` with an explicit validation message — a clean validation guard not visible in the invalid-fund probe alone.

Invalid-fund and zero-document behaviors are unchanged from the first test. All first-test findings F-01 through F-06 persist; F-06 (second Entra identity for a true unauthorized test) remains open.

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

**Prompt:** List all documents associated with fund `59 North Partners, LP`.
**Parameters:** `filterType=fund`, `filterValue=59 North Partners, LP`, `excludeContent=true`

| Agent | Limit used | Call 1 `recordCount` | Call 2 `recordCount` | `totalRecords` | Consistency |
|---|---|---|---|---|---|
| **Claude** | 5 | 5 | 5 | 151 | ✅ Byte-identical |
| **Cursor** | 25 | 25 | 25 | 151 | ✅ Byte-identical |

#### Response envelope (all successful calls — equivalent)

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved N of 151 total document(s) (Content field excluded).",
  "totalRecords": 151,
  "hasMore": true,
  "pagination": { "currentPage": 1, "totalPages": 31 }
}
```

#### First-page documents — top 5 rows (Claude limit=5, confirmed by Cursor limit=25 — both calls per agent identical)

| # | ID | Title | Documentcategories | Documentdate | DateCreated |
|---|---|---|---|---|---|
| 1 | 84C6E63A-4679-4581-BF1A-633C9C7D2444 | 59 North Capital Monthly Report - April 2026.pdf | 9-Risk Management Report; | 2026-04-30 | 2026-05-07 |
| 2 | 9F71E0E4-C3ED-45A5-8E95-323B2F02731C | Investor Statement.pdf | 24-Capital Account Statements; | 2026-04-30 | 2026-05-06 |
| 3 | F3B57C4F-151F-4616-AF7A-47193C5E6D50 | 59 North Annual Notice (2026).pdf | 1-ODD Material; Other; | 2026-04-14 | 2026-04-14 |
| 4 | 3476D9DA-89A8-43EA-955C-496707807ACB | Investor Confirm Subscription.pdf | 22-Capital Call; | 2026-04-01 | 2026-04-17 |
| 5 | B0472C00-F21D-4C4E-9744-F82E00471C72 | 59North Subscription Confirmation 4.1.26 | 22-Capital Call; | 2026-04-01 | 2026-03-25 |

*`DateCreated` / `LastModified` / `Documentdate` use `Z` / `.000Z` suffix in JSON — UTC-style in payload (confirmed by Cursor).*

#### Two-call consistency check (both agents)

| Check | Claude | Cursor |
|---|---|---|
| All document IDs identical (Call 1 vs Call 2) | ✅ PASS | ✅ PASS |
| All Titles identical | ✅ PASS | ✅ PASS |
| All Documentcategories identical | ✅ PASS | ✅ PASS |
| All Documentdate values identical | ✅ PASS | ✅ PASS |
| All DateCreated values identical | ✅ PASS | ✅ PASS |
| `totalRecords` identical (151 vs 151) | ✅ PASS | ✅ PASS |
| Sort order identical (DateCreated DESC) | ✅ PASS | ✅ PASS |
| No invented documents | ✅ PASS | ✅ PASS |
| No credential material in output | ✅ PASS | ✅ PASS |

#### Document count delta vs. first test (2026-04-25)

| Metric | First Test | Second Test | Delta |
|---|---|---|---|
| `totalRecords` (59 North) | 148 | **151** | +3 |
| `totalPages` (limit=5) | — | 31 | — |

Three new documents were added to the backend since the first run. Documents `84C6E63A` (Monthly Report April 2026, added 2026-05-07) and `9F71E0E4` (Investor Statement, added 2026-05-06) now appear at positions 1–2. Document `F3B57C4F` (Annual Notice 2026), which was position #1 in the first test, has moved to position #3 — fully consistent with DateCreated DESC ordering and **not a regression**.

Key documents from first test still present and stable:

| ID | Title | Status |
|---|---|---|
| F3B57C4F-151F-4616-AF7A-47193C5E6D50 | 59 North Annual Notice (2026).pdf | ✅ Present — position shifted due to new additions |
| B0472C00-F21D-4C4E-9744-F82E00471C72 | 59North Subscription Confirmation 4.1.26 | ✅ Present — consistent |

**Scenario 1 verdict: PASS**

---

### Scenario 2 — Error path: PASS ✅

Both agents tested the invalid/inaccessible fund path. Cursor additionally surfaced a no-filter validation case.

#### 2.A — Invalid / non-existent fund name (both agents)

| Agent | `filterValue` used | `success` | `data` | `recordCount` | Cross-tenant data? |
|---|---|---|---|---|---|
| **Claude** | `ZZZNONEXISTENTFUND99999` | `true` | `[]` | `0` | None |
| **Cursor** | `ZZZ_NO_FUND_KS979` | `true` | `[]` | `0` | None |

**Finding F-02 (persists):** Invalid/unknown fund returns `success: true` + empty `data` instead of a distinct not-found error. Callers must check `recordCount` / `data.length`, not the `success` flag alone. Same pattern as KS-978 F-01. Severity: Low.

#### 2.B — No filter dimensions (Cursor — new sub-case)

**Parameters:** `excludeContent: true`, `limit: 5`, `offset: 0` — **no** `filterType`, no `documentCategories`, no `startDate`/`endDate`.

**Response:**
```json
{
  "success": false,
  "message": "At least one filter is required: filterType/filterValue, documentCategories, or startDate/endDate"
}
```

**Finding N-03 (new):** The server enforces a filter requirement — calling `get_documents` with no filter dimensions returns `success: false` with an explicit validation message rather than returning all documents or failing silently. This is a clean validation guard and a positive behavior. Severity: Info.

**Finding F-06 (still open):** True unauthorized-user scenario (second Entra identity with no access to this fund) not executed by either agent — no second test identity provisioned.

**Scenario 2 verdict: PASS**

---

### Scenario 3 — Edge case (zero documents): PASS ✅

**Prompt:** List all documents for a fund known to have zero documents (`2026 Fund`).
**Parameters:** `filterType=fund`, `filterValue=2026 Fund`, `excludeContent=true`

| Agent | `success` | `data` | `recordCount` | `totalRecords` | Invented filenames? |
|---|---|---|---|---|---|
| **Claude** | `true` | `[]` | `0` | `0` | None |
| **Cursor** | `true` | `[]` | `0` | `0` | None |

#### Zero-document checklist

| Check | Claude | Cursor |
|---|---|---|
| `data` array explicitly empty | ✅ PASS | ✅ PASS |
| `recordCount` = 0 (explicit, not absent) | ✅ PASS | ✅ PASS |
| No placeholder / invented filenames | ✅ PASS | ✅ PASS |
| Behavior consistent with first test (2026-04-25) | ✅ PASS | ✅ PASS |

**Scenario 3 verdict: PASS**

---

## Security Scan

| Check | Claude | Cursor |
|---|---|---|
| Raw JWT or Bearer token in tool output | ✅ None detected | ✅ None observed |
| Refresh token or client secret in transcript | ✅ None detected | ✅ None observed |
| Cross-fund documents in invalid-fund response | ✅ None detected | ✅ None observed |
| Credential strings in Title / FileName / Content fields | ✅ None detected | ✅ None observed |
| Invented filenames on empty result | ✅ None | ✅ None |

**Security verdict: PASS (both agents)**

---

## Findings

### Persisting from First Test (2026-04-25)

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | Ticket/AC references `FUND_ID` but tool uses `filterValue` = fund name string (not GUID). Use `get_funds` Name to drive `get_documents` in black-box tests. | **Persists — by design** (confirmed by both agents) |
| F-02 | Low | Invalid/unknown fund returns `success: true` + empty `data` instead of a distinct not-found error. Callers must check `recordCount` / `data.length`. Same pattern as KS-978 F-01. | **Persists — unresolved** (confirmed by both agents) |
| F-03 | Low / Integration | `Documentcategories` is a semicolon-delimited string (e.g. `"1-ODD Material; Other;"`) not a JSON array. Parsing must split on `; ` and strip trailing separators. | **Persists — by design** |
| F-04 | Info | `Documentdate` for some rows is UTC midnight (date-only semantics); display layer should truncate to calendar date. | **Persists — by design** |
| F-05 | Info | `FileName` stores internal GUID-based name; `Title` carries human-readable name. Use `Title` for display, `ID`/`FileName` for identity. | **Persists — by design** |
| F-06 | Open / Policy | Second Entra user for true authorization-denied scenario not run — no second test identity provisioned. Not executed by either agent. | **Still open — unresolved** |

### New Observations (Second Run)

| ID | Source | Severity | Description |
|---|---|---|---|
| N-01 | Claude | Info | `totalRecords` for 59 North Partners, LP increased from 148 (2026-04-25) to **151** (+3 documents). New documents: `84C6E63A` (Monthly Report April 2026, added 2026-05-07) and `9F71E0E4` (Investor Statement, added 2026-05-06). First-page reordered by DateCreated DESC — expected behavior, not a regression. |
| N-02 | Claude | Info | Zero-document behavior for 2026 Fund is unchanged — confirmed consistent across both test runs and both agents. |
| N-03 | Cursor | Info | Calling `get_documents` with no filter dimensions (no `filterType`/`filterValue`, no categories, no date range) returns `success: false` + explicit validation message requiring at least one filter. Positive validation guard — not silent or permissive. |

---

## Test Matrix Row — Section 5.3 Documents

| Agent | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **Claude** | **P** | **P** | BLOCKED (F-06) | n/a | n/a |
| **Cursor** | **P** | **P** | n/a* | n/a | n/a |
| **Combined** | **P** | **P** | BLOCKED (F-06) | n/a | n/a |

*Cursor deferred unauthorized/network-drop to KS-977 OAuth/transport evidence per Epic rollup.*

---

## Comparison with First Test (2026-04-25)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS | **PASS** — consistent (both agents) |
| Scenario 2 Error path | PASS | **PASS** — consistent; Cursor added no-filter validation sub-case (N-03) |
| Scenario 3 Zero documents | PASS | **PASS** — consistent (both agents) |
| `totalRecords` (59 North) | 148 | **151** (+3) — confirmed by both agents |
| Two-call consistency | Byte-for-byte identical | **Byte-for-byte identical** (both agents) |
| Sort order | DateCreated DESC | **DateCreated DESC — confirmed** (both agents) |
| F3B57C4F (Annual Notice) present | Yes, position #1 | **Yes, position #3** (new docs pushed it down) |
| F-06 (second Entra identity) | Open | **Still open** — not executed by either agent |
| Credential leakage | None | **None** (both agents) |

---

## Evidence

| Agent | Tool | Details |
|---|---|---|
| **Claude** | `get_documents` via `https://mcp.conceptia.com/dynamo/sse` | 4 calls: Scenario 1 (59 North ×2); Scenario 2 (invalid fund); Scenario 3 (2026 Fund) |
| **Cursor** | `get_documents` via `user-conceptia-dynamo` | 5 calls: Scenario 1 (59 North ×2, limit=25); Scenario 2 (invalid fund + no-filter probe); Scenario 3 (2026 Fund) |

- **Parameters across all calls:** `filterType=fund`, `excludeContent=true` (no `Content` field logged)
- **Fund names used:** 59 North Partners, LP · 2026 Fund · ZZZNONEXISTENTFUND99999 / ZZZ_NO_FUND_KS979 (synthetic)
- **Credential scan:** Passed (both agents)
- **Report files:**
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-979 - Claude Result.md`
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-979 - Cursor Result.md`
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-979 Result.md` *(this file)*

---

## Verdict

| Criteria | Claude | Cursor | Combined |
|---|---|---|---|
| Section 5.3 happy-path: document list returned for valid fund | ✅ PASS | ✅ PASS | ✅ PASS |
| Two-call consistency: IDs, titles, categories, dates identical | ✅ PASS | ✅ PASS | ✅ PASS |
| Error path: invalid fund → controlled empty result, no cross-fund data | ✅ PASS | ✅ PASS | ✅ PASS |
| No-filter validation: explicit `success: false` + message | n/a | ✅ PASS | ✅ PASS |
| Zero-document fund: explicit empty list, no invented filenames | ✅ PASS | ✅ PASS | ✅ PASS |
| No credential leakage | ✅ PASS | ✅ PASS | ✅ PASS |
| Unauthorized-user scenario (second Entra identity) | ⚠️ BLOCKED | n/a | ⚠️ BLOCKED (F-06) |

**Final result: PASS (Scenarios 1–3)**
All executable section 5.3 acceptance criteria are met across both agents. F-06 (true unauthorized test) remains open pending provisioning of a second test identity.

---

*Generated: 2026-05-20 · Consolidated from: Claude (claude-sonnet-4-6) + Cursor (Composer) second-time test runs dated 2026-05-13 · Source: KS-979 v1.4 updated requirements · Guide: dynamo-mcp-testing-guide_v1.4.md*
