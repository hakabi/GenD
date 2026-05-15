# KS-979 — Cursor QA Result (Second Time Test)

## Dynamo MCP QA — Document list via `get_documents` (Section 5.3, guide v1.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Epic** | Dynamo MCP — Functional E2E Validation ([KS-999](https://gendvn.atlassian.net/browse/KS-999)) |
| **Guide ref** | Section **5.3** — Document retrieval · v1.4 appendix in ticket |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Cursor — Composer |
| **MCP server** | `user-conceptia-dynamo` |
| **Tool under test** | `get_documents` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)** |

---

## Summary

v1.4 scope: **`get_documents` only** for section **5.3**; filter tuple **`filterType: "fund"`**, **`filterValue: "59 North Partners, LP"`** (from `get_funds` baseline — no UI-exported IDs). **`excludeContent: true`** to respect **2MB** cap.

Two identical listing calls returned **byte-identical** first-page payloads (**25** rows, **`totalRecords`: 151**). Stable keys **`ID`**, **`Title`**, **`Documentdate`**, **`Documentcategories`** match call-to-call.

**Scenario 2:** (a) Non-existent fund name → **`success: true`**, **`data: []`**, **`recordCount: 0`** — empty authorized scope. (b) **Zero runtime filters** (only `limit`/`offset`) → **`success: false`** with message **`At least one filter is required: filterType/filterValue, documentCategories, or startDate/endDate`** — clear validation, not silent success.

**Scenario 3:** **`2026 Fund`** (from list baseline) → **`totalRecords: 0`** documents — explicit empty **`data`**, no placeholder filenames.

---

## Test execution

### Parameters (evidence tuple)

| Parameter | Value |
|---|---|
| **Happy path / stability** | `filterType: "fund"`, `filterValue: "59 North Partners, LP"`, `excludeContent: true`, `limit: 25`, `offset: 0` |
| **Invalid / inaccessible fund** | `filterValue: "ZZZ_NO_FUND_KS979"` (same other fields) |
| **Validation (no filters)** | `excludeContent: true`, `limit: 5`, `offset: 0` — **no** `filterType` / categories / dates |
| **Zero documents** | `filterType: "fund"`, `filterValue: "2026 Fund"`, `excludeContent: true`, `limit: 20`, `offset: 0` |

### Scenario 1 — Happy path: **PASS**

| Metric | Call 1 | Call 2 |
|---|---|---|
| **`success`** | `true` | `true` |
| **`recordCount`** (page) | 25 | 25 |
| **`totalRecords`** | 151 | 151 |
| **First row `ID`** | `84C6E63A-4679-4581-BF1A-633C9C7D2444` | *(match)* |
| **First row `Title`** | 59 North Capital Monthly Report - April 2026.pdf | *(match)* |

**Sort order:** Rows ordered with **newest `Documentdate` / ingestion-style metadata** at top of page (not strict alphanumeric by title). **Documented** as server ordering — both calls **identical**, so stability **PASS**.

**Timezone sample:** `DateCreated` / `LastModified` / `Documentdate` use **`Z`** or **`.000Z`** in JSON → **UTC-style** in payload.

### Scenario 2 — Error path: **PASS**

| Case | Outcome |
|---|---|
| Unknown fund string | Empty authorized list — **`data: []`** |
| No filter dimensions | **`success: false`** + explicit **`message`** requiring at least one filter |

No cross-tenant filenames observed in any call.

### Scenario 3 — Zero documents: **PASS**

**2026 Fund:** **`recordCount: 0`**, **`data: []`**, **`success: true`** — explicit empty state; agent must not invent files (**PASS**).

---

## Security scan

| Check | Result |
|---|---|
| Secrets in JSON | **None** |
| Invented filenames on empty | **None** |

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Info | Unknown fund → **`success: true`** + empty **`data`** (same “soft empty” family as KS-978). Validation path uses **`success: false`**. | **Documented** |
| N-01 | Info | `Funds` column on rows consistently **`59 North Partners, LP;`** for happy-path sample. | **Informational** |

---

## Test matrix — Section 5.3 Documents (this run)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.3 Documents** | **P** | **P** | **n/a*** | **n/a*** | **n/a*** |

\*Not executed in this Cursor pass; see **KS-977** for OAuth / transport probes if rollup requires them.

---

## Evidence

- **Tool:** `get_documents` on **`user-conceptia-dynamo`**.  
- **Redaction:** Document titles retained as business metadata; **no** `Content` field logged (`excludeContent: true`).

---

## Verdict

**PASS / PASS / PASS** for Scenarios 1–3 per v1.4 BDD.

---

*Generated: 2026-05-13 · Source: [KS-979](https://gendvn.atlassian.net/browse/KS-979) · Path: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-979 - Cursor Result.md`*
