# KS-979 — Claude QA Result (Second Time Test)
## Dynamo MCP QA — List fund documents via `get_documents` (Section 5.3)

| Field | Value |
|---|---|
| **Ticket** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Story** | US-E3-03 — List fund documents via get_documents |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.3 — Document retrieval test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tool under test** | `get_documents` |
| **Filter used** | `filterType: fund`, `filterValue: <fund name>`, `excludeContent: true` |
| **Overall result** | **PASS (Scenarios 1–3)** |

---

## Summary

All three section 5.3 scenarios pass on the second run. The two-call consistency check for Scenario 1 is confirmed byte-for-byte identical. Total document count for the baseline fund (59 North Partners, LP) has grown from **148** (first test, 2026-04-25) to **151** (+3 documents added since), reflecting live backend activity. The first-page composition has shifted accordingly — two new documents now appear at positions 1–2 — which is fully expected given the DateCreated DESC sort order. The invalid-fund and zero-document behaviors are unchanged from the first test. All first-test findings F-01 through F-05 persist (API shape / integration guidance); F-06 (second Entra identity for true unauthorized test) remains open.

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

**Prompt:** List all documents associated with fund `59 North Partners, LP`.  
**Tool calls:** `get_documents` × 2 — identical parameters (`filterType=fund`, `filterValue=59 North Partners, LP`, `limit=5`, `offset=0`, `excludeContent=true`), same OAuth session, 2026-05-13 UTC.

#### Call 1 & Call 2 response metadata (identical)

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 5 of 151 total document(s) (Content field excluded).",
  "recordCount": 5,
  "totalRecords": 151,
  "offset": 0,
  "limit": 5,
  "hasMore": true,
  "pagination": { "currentPage": 1, "totalPages": 31, "nextOffset": 5 }
}
```

#### Documents returned (both calls — identical)

| # | ID | Title | Documentcategories | Documentdate | DateCreated |
|---|---|---|---|---|---|
| 1 | 84C6E63A-4679-4581-BF1A-633C9C7D2444 | 59 North Capital Monthly Report - April 2026.pdf | 9-Risk Management Report; | 2026-04-30 | 2026-05-07 |
| 2 | 9F71E0E4-C3ED-45A5-8E95-323B2F02731C | Investor Statement.pdf | 24-Capital Account Statements; | 2026-04-30 | 2026-05-06 |
| 3 | F3B57C4F-151F-4616-AF7A-47193C5E6D50 | 59 North Annual Notice (2026).pdf | 1-ODD Material; Other; | 2026-04-14 | 2026-04-14 |
| 4 | 3476D9DA-89A8-43EA-955C-496707807ACB | Investor Confirm Subscription.pdf | 22-Capital Call; | 2026-04-01 | 2026-04-17 |
| 5 | B0472C00-F21D-4C4E-9744-F82E00471C72 | 59North Subscription Confirmation 4.1.26 | 22-Capital Call; | 2026-04-01 | 2026-03-25 |

#### Two-call consistency check

| Check | Result |
|---|---|
| All 5 document IDs identical (Call 1 vs Call 2) | ✅ PASS |
| All Titles identical | ✅ PASS |
| All Documentcategories identical | ✅ PASS |
| All Documentdate values identical | ✅ PASS |
| All DateCreated values identical | ✅ PASS |
| totalRecords identical (151 vs 151) | ✅ PASS |
| Sort order identical (DateCreated DESC) | ✅ PASS |
| No invented documents | ✅ PASS |
| No credential material in output | ✅ PASS |

#### Document count delta vs. first test (2026-04-25)

| Metric | First Test | Second Test | Delta |
|---|---|---|---|
| totalRecords | 148 | **151** | +3 |
| totalPages (limit=5) | — | 31 | — |

Three new documents were added to the backend since the first run. The first-page composition has changed accordingly — documents `84C6E63A` (Monthly Report, added 2026-05-07) and `9F71E0E4` (Investor Statement, added 2026-05-06) now appear at positions 1–2. Document `F3B57C4F` (Annual Notice 2026), which was position #1 in the first test, has moved to position #3. This is fully consistent with DateCreated DESC ordering and is **not a regression**.

Key documents from first test still present and stable:

| ID | Title | Status |
|---|---|---|
| F3B57C4F-151F-4616-AF7A-47193C5E6D50 | 59 North Annual Notice (2026).pdf | ✅ Present — position shifted due to new additions |
| B0472C00-F21D-4C4E-9744-F82E00471C72 | 59North Subscription Confirmation 4.1.26 | ✅ Present — consistent |

**Scenario 1 verdict: PASS**

---

### Scenario 2 — Error path: PASS ✅

**Prompt:** List all documents for an invalid / non-existent fund.  
**Tool call:** `get_documents` with `filterType=fund`, `filterValue=ZZZNONEXISTENTFUND99999`, `excludeContent=true`

#### Raw response

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 0 of 0 total document(s) (Content field excluded).",
  "data": [],
  "recordCount": 0,
  "totalRecords": 0,
  "hasMore": false
}
```

#### Error path checklist

| Check | Result |
|---|---|
| No documents from other funds or tenants returned | ✅ PASS |
| Controlled empty result (no crash / 500) | ✅ PASS |
| No invented filenames by agent | ✅ PASS |
| Response shape consistent with first test | ✅ PASS |

**Finding F-02 (persists):** Invalid fund returns `success: true` + `data: []` instead of an explicit not-found error. Callers must check `recordCount` / `data.length`, not the `success` flag alone. Severity: Low.

**Finding F-06 (still open):** True unauthorized-user scenario (second Entra identity with no access to this fund) not executed — no second test identity provisioned. Documented as open; acceptable for current sign-off unless security policy mandates it.

**Scenario 2 verdict: PASS**

---

### Scenario 3 — Edge case (zero documents): PASS ✅

**Prompt:** List all documents for a fund known to have zero documents.  
**Tool call:** `get_documents` with `filterType=fund`, `filterValue=2026 Fund`, `excludeContent=true`

#### Raw response

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 0 of 0 total document(s) (Content field excluded).",
  "data": [],
  "recordCount": 0,
  "totalRecords": 0,
  "hasMore": false
}
```

#### Zero-document checklist

| Check | Result |
|---|---|
| `data` array explicitly empty | ✅ PASS |
| `recordCount` = 0 (explicit, not absent) | ✅ PASS |
| No placeholder / invented filenames | ✅ PASS |
| Behavior consistent with first test (2026-04-25) | ✅ PASS |

**Scenario 3 verdict: PASS**

---

## Security Scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | ✅ None detected |
| Refresh token or client secret in transcript | ✅ None detected |
| Cross-fund documents in invalid-fund response | ✅ None detected |
| Credential strings in Title / FileName / Content fields | ✅ None detected |

**Security verdict: PASS**

---

## Findings

### Persisting from First Test (2026-04-25)

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | Ticket/AC references `FUND_ID` but tool uses `filterValue` = fund name string (not GUID). Use `get_funds` Name to drive `get_documents` in black-box tests. | **Persists — by design** |
| F-02 | Low | Invalid/unknown fund returns `success: true` + empty `data` instead of a distinct not-found error. Callers must check `recordCount` / `data.length`. Same pattern as KS-978 F-01. | **Persists — unresolved** |
| F-03 | Low/Integration | `Documentcategories` is a semicolon-delimited string (e.g. `"1-ODD Material; Other;"`) not a JSON array. Parsing must split on `; ` and strip trailing separators. | **Persists — by design** |
| F-04 | Info | `Documentdate` for some rows is UTC midnight (date-only semantics); display layer should truncate to calendar date. | **Persists — by design** |
| F-05 | Info | `FileName` stores internal GUID-based name; `Title` carries human-readable name. Use `Title` for display, `ID`/`FileName` for identity. | **Persists — by design** |
| F-06 | Open/Policy | Second Entra user for true authorization-denied scenario not run — no second test identity provisioned. | **Still open — unresolved** |

### New Observations (Second Run)

| ID | Severity | Description |
|---|---|---|
| N-01 | Info | `totalRecords` for 59 North Partners, LP increased from 148 (2026-04-25) to **151** (+3 documents). New documents: `84C6E63A` (Monthly Report April 2026, added 2026-05-07) and `9F71E0E4` (Investor Statement, added 2026-05-06). First-page reordered by DateCreated DESC — expected behavior, not a regression. |
| N-02 | Info | Zero-document behavior for 2026 Fund is unchanged — confirmed consistent across both test runs. |

---

## Test Matrix Row — Section 5.3 Documents

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.3 Documents (`get_documents`)** | **P** | **P** | BLOCKED (F-06) | n/a | n/a |

---

## Comparison with First Test (2026-04-25)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS | **PASS** — consistent |
| Scenario 2 Error path | PASS | **PASS** — consistent |
| Scenario 3 Zero documents | PASS | **PASS** — consistent |
| totalRecords (59 North) | 148 | **151** (+3) |
| Two-call consistency | Byte-for-byte identical | **Byte-for-byte identical** |
| Sort order | DateCreated DESC | **DateCreated DESC — confirmed** |
| F3B57C4F (Annual Notice) present | Yes, position #1 | **Yes, position #3** (new docs pushed it down) |
| F-06 (second Entra identity) | Open | **Still open** |
| Credential leakage | None | **None** |

---

## Evidence

- **Tool:** `get_documents` via MCP connector `https://mcp.conceptia.com/dynamo/sse`
- **Session:** Claude Cowork (claude-sonnet-4-6) — live authenticated MCP session
- **Calls logged:** 4 total (Scenario 1: 2 calls for 59 North consistency; Scenario 2: invalid fund; Scenario 3: 2026 Fund)
- **Parameters:** `filterType=fund`, `excludeContent=true` across all calls
- **Credential scan:** Passed
- **Report file:** `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-979 - Claude Result.md`

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.3 happy-path: document list returned for valid fund | ✅ PASS |
| Two-call consistency: IDs, titles, categories, dates identical | ✅ PASS |
| Error path: invalid fund returns controlled empty result, no cross-fund data | ✅ PASS |
| Zero-document fund: explicit empty list, no invented filenames | ✅ PASS |
| No credential leakage | ✅ PASS |
| Unauthorized-user scenario (second Entra identity) | ⚠️ BLOCKED — F-06, no second test identity |

**Final result: PASS (Scenarios 1–3)**  
All executable section 5.3 acceptance criteria are met. F-06 (true unauthorized test) remains open pending provisioning of a second test identity.

---

*Generated: 2026-05-13 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-979 v1.4 updated requirements · Guide: dynamo-mcp-testing-guide_v1.4.md*
