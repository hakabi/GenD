# KS-979 — Cursor QA Result (Third Time Test)

## Dynamo MCP QA — List fund documents via `get_documents` (Section 5.3 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Story** | US-E3-03 — List fund documents via get_documents |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Scope executed** | Jira description **Updated requirements — guide v1.5 (10-tool MCP inventory)** only |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **5.3**; stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tool under test** | `get_documents` |
| **Filter used** | `filterType: fund`, `filterValue: <fund name>`, `excludeContent: true` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)** |

---

## Summary

Section **5.3** passes all three scenarios under **guide v1.5** with MCP **Connected**. Two consecutive `get_documents` calls for **59 North Partners, LP** (`filterType: fund`, `excludeContent: true`, `limit: 5`) returned **byte-identical** first-page payloads: **5** rows of **151** total, first document ID **`84C6E63A-4679-4581-BF1A-633C9C7D2444`**.

**Scenario 2A** (invalid fund): empty authorized result — **`success: true`**, **`data: []`**, **`recordCount: 0`**. **Scenario 2B** (no filter dimensions): **`success: false`** with explicit message **`At least one filter is required`** — not a silent empty success.

**Scenario 3:** **`2026 Fund`** returns **0 documents** — explicit empty `data`, no invented filenames.

No credential material observed in document metadata fields.

---

## v1.5 requirements executed (KS-979 updated section)

| v1.5 requirement | Status |
|---|---|
| **A.** Preconditions — MCP connected; `get_documents` registered | **PASS** |
| **B.** Two-call consistency with `excludeContent: true` | **PASS** |
| **B.** Document IDs, titles, categories, dates returned | **PASS** |
| **B.** `totalRecords` metadata present | **PASS** — **151** for 59 North |
| **C.** Invalid fund — controlled empty result | **PASS** |
| **C.** No filter — explicit validation failure | **PASS** |
| **D.** Zero-document fund — explicit empty state | **PASS** |
| **Security** — no credential material in output | **PASS** |

---

## Test execution

### Preconditions

**Connector state:** Connected / Ready (`user-conceptia-dynamo`).

**Prompt (natural language):** *List documents associated with fund 59 North Partners, LP (metadata only, no file content).*

| Step | Tool | Parameters (material) |
|---|---|---|
| Happy path A / B | `get_documents` | `filterType: "fund"`, `filterValue: "59 North Partners, LP"`, `excludeContent: true`, `limit: 5`, `offset: 0` (×2) |
| Invalid fund | `get_documents` | `filterType: "fund"`, `filterValue: "<synthetic invalid>"`, `excludeContent: true`, `limit: 5` |
| No filter validation | `get_documents` | `excludeContent: true`, `limit: 5`, `offset: 0` — **no** `filterType` / categories / dates |
| Zero documents | `get_documents` | `filterType: "fund"`, `filterValue: "2026 Fund"`, `excludeContent: true`, `limit: 5` |

---

### Scenario 1 — Happy path: **PASS**

| Metric | Call 1 | Call 2 |
|---|---|---|
| **`success`** | `true` | `true` |
| **`recordCount`** (page) | **5** | **5** |
| **`totalRecords`** | **151** | **151** |
| **First row `ID`** | `84C6E63A-4679-4581-BF1A-633C9C7D2444` | *(match)* |
| **Payload equivalence** | — | **Byte-identical** to Call 1 |

**Sort order:** Rows ordered **DateCreated DESC** (newest document first). Both calls **identical** — stability **PASS**.

**Content cap:** `excludeContent: true` — no `Content` field in payload; respects 2MB guidance.

#### v1.5 field checklist (§B)

| Requirement | Result |
|---|---|
| Document IDs returned | **PASS** |
| Two calls — same ID set in same order | **PASS** |
| `totalRecords` metadata | **PASS** — **151** |
| No credential strings in Title / FileName | **PASS** |

---

### Scenario 2 — Error path: **PASS**

#### 2.A — Invalid / non-existent fund

| Field | Value |
|---|---|
| **`success`** | `true` |
| **`data`** | `[]` |
| **`recordCount`** | `0` |
| **Cross-fund filenames** | **None** |

**Verdict:** **PASS** — controlled empty authorized result.

#### 2.B — No filter dimensions

| Field | Value |
|---|---|
| **`success`** | `false` |
| **`message`** | **At least one filter is required** (validation message naming `filterType/filterValue`, document categories, or date range) |
| **Silent empty success** | **No** |

**Verdict:** **PASS** — explicit validation failure per v1.5 §5.3 Scenario 2B.

---

### Scenario 3 — Edge case (zero-document fund): **PASS**

| Field | Value |
|---|---|
| **Request** | `filterType: "fund"`, `filterValue: "2026 Fund"`, `excludeContent: true` |
| **`success`** | `true` |
| **`data`** | `[]` |
| **`recordCount`** | **0** |
| **Invented filenames** | **None** |

**Verdict:** **PASS** — explicit empty state; agent must not fabricate document entries.

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| Refresh token or client secret in output | **None** observed |
| Cross-fund documents in invalid-fund probe | **None** |
| Invented filenames on empty results | **None** |
| Document `Content` with `excludeContent: true` | **Absent** — as expected |

**Security verdict:** **PASS**

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | AC references `FUND_ID` but tool uses `filterValue` = fund name string. Use `get_funds` **Name** to drive `get_documents`. | **Persists — by design** |
| F-02 | Low | Invalid fund returns `success: true` + `data: []` — not a distinct not-found error. Callers must check `recordCount`. | **Persists — known API shape** |
| F-03 | Low | `Documentcategories` is semicolon-delimited string, not a JSON array. | **Persists — by design** |
| F-06 | Open | Second Entra identity for true unauthorized-user scenario not provisioned. | **Still open** |
| N-01 | Info | `totalRecords` **151** for 59 North — stable vs. Second Time Test (2026-05-13). | **Informational** |

---

## Test matrix row — Section 5.3 Documents (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.3 Documents** | **P** | **P** | n/a* | n/a | n/a | n/a |

\*Unauthorized user not executed this run; F-06 provisioning blocker persists. See **KS-977** §2.A for OAuth gateway probes if rollup requires transport-level auth evidence.

---

## Comparison across test runs

| Dimension | First (2026-04-25) | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| Scenario 1 | PASS | PASS | **PASS** |
| Scenario 2 | PASS | PASS | **PASS** |
| Scenario 3 | PASS | PASS | **PASS** |
| `totalRecords` (59 North) | 148 | 151 | **151 (stable)** |
| First doc ID | 84C6E63A-… | 84C6E63A-… | **84C6E63A-… (stable)** |
| MCP connector | Connected | Connected | **Connected** |

---

## Evidence

| Item | Detail |
|---|---|
| **Primary tool** | `get_documents` × 2 — `filterType: fund`, `filterValue: "59 North Partners, LP"`, `excludeContent: true`, `limit: 5` |
| **Validation probe** | `get_documents` — no filter dimensions |
| **Edge / error** | `"2026 Fund"`, synthetic invalid fund name |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **Black-box rule** | No Dynamo UI accessed |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-979 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.3 happy path executable | **PASS** |
| Two-call document list consistency | **PASS** |
| Invalid fund — controlled empty | **PASS** |
| No filter — explicit validation error | **PASS** |
| Zero-document fund — explicit empty | **PASS** |
| No credential leakage | **PASS** |
| v1.5 updated requirements section | **PASS** |

**Final result: PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)**

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-979 Jira — **Updated requirements — guide v1.5 (10-tool MCP inventory)** · Guide: `dynamo-mcp-testing-guide_v1.5.md`*
