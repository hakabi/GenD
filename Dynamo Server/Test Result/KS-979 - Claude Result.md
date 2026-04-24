# KS-979 — Claude Result: List Fund Documents via get_documents

| Field | Value |
|-------|-------|
| **Jira** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Ticket title** | Dynamo MCP QA — List fund documents via get_documents |
| **MCP server** | `conceptia-dynamo` |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Report date** | 2026-04-24 |
| **Tester** | Bình Hà Khoa |
| **Client** | Claude Cowork (Desktop — Cowork mode) |
| **Guide reference** | §5.3 |
| **Tool under test** | `get_documents` |

---

## 1. Executive Summary

**Objective:** Validate that `get_documents` returns a stable, coherent document list for a known fund — filenames, categories, and dates consistent across two calls — with correct empty-state handling for invalid funds and zero-document funds. All tests performed via MCP only (black-box, no external document portal comparison).

**Outcome: PASS** — all three scenarios completed successfully.

| Check | Result |
|-------|--------|
| Scenario 1 — Call 1: 5 docs returned with filename, category, date | ✅ PASS |
| Scenario 1 — Call 2: byte-for-byte identical to Call 1 | ✅ PASS |
| Scenario 1 — Sort order consistent between calls | ✅ PASS |
| Scenario 1 — totalRecords matches KS-991 baseline (148) | ✅ PASS |
| Scenario 2 — Non-existent fund: empty authorized result, no cross-tenant leak | ✅ PASS |
| Scenario 3 — Zero-document fund: empty list explicitly, no invented filenames | ✅ PASS |
| No credential material in transcript | ✅ PASS |

---

## 2. Test Environment

| Item | Detail |
|------|--------|
| MCP client | Claude Cowork Desktop (Cowork mode) |
| SSE endpoint | `https://mcp.conceptia.com/dynamo/sse` |
| Baseline fund (Scenario 1) | 59 North Partners, LP |
| Total documents for baseline fund | 148 |
| Invalid fund (Scenario 2) | `ZZZNONEXISTENTFUND99999` |
| Zero-document fund (Scenario 3) | 2026 Fund (Phoenix Equity) |
| Test date | 2026-04-24 |
| Content field | Excluded (`excludeContent=true`) for all calls to avoid 2MB response limit |

---

## 3. Scenario 1 — Happy Path (Two-Call Consistency)

### T1-A — get_documents Call 1

**Parameters:** `filterType="fund"`, `filterValue="59 North Partners, LP"`, `limit=5`, `offset=0`, `excludeContent=true`

**Response summary:**
```
success: true
message: "Query executed successfully. Retrieved 5 of 148 total document(s) (Content field excluded)."
recordCount: 5
totalRecords: 148
hasMore: true
totalPages: 30
```

**Documents returned (Call 1):**

| # | Document ID (GUID) | Title | Category | Documentdate | Size | IsLatest |
|---|-------------------|-------|----------|--------------|------|----------|
| 1 | `F3B57C4F-...D50` | 59 North Annual Notice (2026).pdf | 1-ODD Material; Other; | 2026-04-14 | 657 KB | true |
| 2 | `B0472C00-...C72` | 59North Subscription Confirmation 4.1.26 | 22-Capital Call; | 2026-04-01 | 686 KB | true |
| 3 | `1BACA3EF-...A3` | 59 North Addition 4.1.26 $20M - Exec TD 3.19.26 | 2-Executed Documents; 22-Capital Call; | 2026-04-01 | 840 KB | true |
| 4 | `F09A42B2-...F4` | 59 North Addition Confirmed admin | 22-Capital Call; | 2026-04-01 | 481 KB | true |
| 5 | `9856EE85-...D3` | PrintableVersionDocumentPDF.aspx (16) | 2-Executed Documents; | 2026-04-01 | 301 KB | true |

**Full detail — record 1 (sample):**
```json
{
  "ID": "F3B57C4F-151F-4616-AF7A-47193C5E6D50",
  "Title": "59 North Annual Notice (2026).pdf",
  "FileName": "F3B57C4F-151F-4616-AF7A-47193C5E6D50.pdf",
  "FullFileName": "\\59 North Capital Management\\F3B57C4F-151F-4616-AF7A-47193C5E6D50.pdf",
  "Size": "657 KB",
  "FileSize": "672440",
  "IsLatest": true,
  "Content": null,
  "DateCreated": "2026-04-14T16:38:27.117Z",
  "LastModified": "2026-04-14T17:48:11.567Z",
  "Documentcategories": "1-ODD Material; Other;",
  "Documentdate": "2026-04-14T12:38:27.117Z",
  "Funds": "59 North Partners, LP;",
  "Contacts": "Aloha API;",
  "Companies": "59 North Capital Management;",
  "DocumentDateQuarter": "Q2",
  "DocumentDateYear": "2026",
  "DocumentDateMonth": 4
}
```

---

### T1-B — get_documents Call 2 (Consistency Verification)

**Parameters:** Identical to Call 1 — `filterType="fund"`, `filterValue="59 North Partners, LP"`, `limit=5`, `offset=0`, `excludeContent=true`

**Response summary:**
```
success: true
message: "Query executed successfully. Retrieved 5 of 148 total document(s) (Content field excluded)."
recordCount: 5
totalRecords: 148
hasMore: true
totalPages: 30
```

**Consistency comparison — Call 1 vs Call 2:**

| # | Field | Call 1 | Call 2 | Match |
|---|-------|--------|--------|-------|
| 1 | Document GUID | `F3B57C4F-151F-4616-AF7A-47193C5E6D50` | `F3B57C4F-151F-4616-AF7A-47193C5E6D50` | ✅ |
| 1 | Title | 59 North Annual Notice (2026).pdf | 59 North Annual Notice (2026).pdf | ✅ |
| 1 | Category | 1-ODD Material; Other; | 1-ODD Material; Other; | ✅ |
| 1 | Documentdate | 2026-04-14T12:38:27.117Z | 2026-04-14T12:38:27.117Z | ✅ |
| 2 | Document GUID | `B0472C00-F21D-4C4E-9744-F82E00471C72` | `B0472C00-F21D-4C4E-9744-F82E00471C72` | ✅ |
| 2 | Title | 59North Subscription Confirmation 4.1.26 | 59North Subscription Confirmation 4.1.26 | ✅ |
| 3 | Document GUID | `1BACA3EF-6718-49FD-9257-4FA1B4AA57A3` | `1BACA3EF-6718-49FD-9257-4FA1B4AA57A3` | ✅ |
| 4 | Document GUID | `F09A42B2-3639-421A-8D1B-8A44374EEDF4` | `F09A42B2-3639-421A-8D1B-8A44374EEDF4` | ✅ |
| 5 | Document GUID | `9856EE85-92F1-457D-BF3C-EDAFCFE352D3` | `9856EE85-92F1-457D-BF3C-EDAFCFE352D3` | ✅ |
| — | totalRecords | 148 | 148 | ✅ |
| — | Sort order | DateCreated DESC | DateCreated DESC | ✅ |

**Result: ✅ PASS — 100% byte-for-byte identical across both calls.** All GUIDs, titles, filenames, categories, dates, file sizes, IsLatest flags, Funds, Companies, and Contacts fields match exactly. Sort order is stable (DateCreated descending).

**totalRecords=148 matches KS-991 baseline** — no document count drift between test runs.

---

### T1-C — Document Field Observations

**Sort order (inferred, black-box):** Documents sorted by `DateCreated` descending — most recently created document first (2026-04-14 → 2026-03-25 → 2026-03-20).

**File storage pattern:** `FullFileName` follows `\{Manager Name}\{GUID}.pdf` — internal file system path, not a public URL. `FileName` uses the GUID as the base name, confirming documents are content-addressed at storage layer.

**Document categories observed:**

| Category | Meaning (inferred) |
|----------|--------------------|
| `1-ODD Material; Other;` | Operational Due Diligence material |
| `22-Capital Call;` | Capital call documents |
| `2-Executed Documents;` | Signed / executed agreement documents |
| `2-Executed Documents; 22-Capital Call;` | Multi-category document |

**Multi-category support confirmed:** Document 3 has two categories (`2-Executed Documents; 22-Capital Call;`) — `Documentcategories` is a semicolon-delimited string, not a single enum value.

**Contacts field:** Some documents have `"Aloha API;"` (automated system contact for ingested docs), others have `null` — explicit null, not omitted.

**Date timezone:** All datetime fields use UTC ISO 8601 with `Z` suffix (`DateCreated`, `LastModified`, `Documentdate`). `Documentdate` for non-notice docs is `2026-04-01T00:00:00.000Z` — midnight UTC, indicating date-only precision stored as UTC midnight.

---

## 4. Scenario 2 — Error Path (Invalid Fund)

**Parameters:** `filterType="fund"`, `filterValue="ZZZNONEXISTENTFUND99999"`, `limit=5`, `excludeContent=true`

**Response:**
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

**Result: ✅ PASS** — empty authorized result returned. No documents from other funds or tenants leaked. No unhandled server error or stack trace.

**Behavioural note (consistent with KS-978-F-01):** Tool returns `success: true` with empty `data` for an invalid fund name rather than an explicit error/404 response. Callers must guard on `recordCount` or `data.length`. This pattern is consistent across `get_documents`, `get_fund_description`, and `get_rating_summary`.

---

## 5. Scenario 3 — Edge Case (Zero-Document Fund)

**Fund tested:** 2026 Fund (Phoenix Equity — pipeline status: 1 - Pre-One Pager)

**Parameters:** `filterType="fund"`, `filterValue="2026 Fund"`, `limit=5`, `excludeContent=true`

**Response:**
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

**Result: ✅ PASS** — explicit empty list returned. The tool did not:
- Invent placeholder filenames (e.g. "No documents found.pdf")
- Return documents from other funds
- Fabricate a document count

**Interpretation:** "2026 Fund" is a pre-pipeline fund (`1 - Pre-One Pager`) with no documents ingested yet — an expected empty state for an early-stage fund. The tool correctly reports `totalRecords=0`.

---

## 6. Findings

| ID | Topic | Severity | Status | Action |
|----|-------|----------|--------|--------|
| **KS-979-F-01** | Invalid fund name returns `success: true` + empty `data` (not an error response) — consistent with KS-978-F-01 pattern across tools | Low | Open | Callers must check `recordCount`/`data.length`; document in integration guide; raise with Conceptia |
| **KS-979-F-02** | `Documentcategories` is a semicolon-delimited string (e.g. `"2-Executed Documents; 22-Capital Call;"`) — not a JSON array — consumers must parse manually | Low | Open | Document in integration guide; raise with Conceptia for potential schema improvement |
| **KS-979-F-03** | `Documentdate` for capital call documents is `2026-04-01T00:00:00.000Z` (UTC midnight) — date-only values stored as UTC midnight; display layer should truncate to date | Info | Observe | No action required; document timezone behaviour in QA runbook |
| **KS-979-F-04** | `FileName` uses internal GUID (not human-readable); `Title` carries the human-readable name — consumers should use `Title` for display, `FileName`/`ID` for identity | Info | Observe | Document field usage guidance in integration guide |

---

## 7. BDD Acceptance Criteria — Results

| Scenario | Condition | Result | Evidence |
|----------|-----------|--------|----------|
| **1 — Happy path** | Fund with ≥1 doc → `get_documents` ×2 → filenames/types/dates consistent between calls | ✅ PASS | §3 — 148 total docs; 5-record sample identical across both calls; all GUIDs, titles, categories, dates byte-for-byte identical |
| **2 — Error path** | Invalid fund → error or empty authorized list; no cross-tenant docs | ✅ PASS | §4 — `ZZZNONEXISTENTFUND99999` returns empty `data`, `recordCount=0`, no foreign documents |
| **3 — Edge case** | Zero-document fund → empty list with no placeholder entries | ✅ PASS | §5 — "2026 Fund" returns `data=[]`, `totalRecords=0`; no invented filenames |

---

## 8. Definition of Done — Status

| Criterion | Status |
|-----------|:------:|
| `get_documents` called for fund with documents | ✅ |
| Repeat call returns identical filenames, categories, dates | ✅ |
| Sort order documented and confirmed stable | ✅ |
| Scenario 2 — invalid fund tested | ✅ |
| Scenario 3 — zero-document fund tested | ✅ |
| No invented filenames in any response | ✅ |
| No credential material in transcript | ✅ |
| Findings logged | ✅ (4 findings — 2 Low, 2 Info) |

---

## 9. References

| Document | Path |
|----------|------|
| This report | `Dynamo Server/Test Result/KS-979 - Claude Result.md` |
| KS-977 result (`get_funds` baseline) | `Dynamo Server/Test Result/KS-977 - Claude Result.md` |
| KS-978 result (`get_fund_description` / ratings) | `Dynamo Server/Test Result/KS-978 - Claude Result.md` |
| KS-991 result (schema / document count baseline) | `Dynamo Server/Test Result/KS-991 - Claude Result.md` |
| QA guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` (§5.3) |
