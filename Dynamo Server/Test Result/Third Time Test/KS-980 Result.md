# KS-980 — Consolidated QA Result (Third Time Test)
## Dynamo MCP QA — Validate get_activity, get_notes, and analyze_notes (Section 5.4 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
| **Story** | US-E3-04 — Validate get_activity, get_notes, and analyze_notes |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.4 — Activity & notes test · **Guide v1.5** |
| **Test run** | Third Time Test — Consolidated (Cursor + Claude) |
| **Test dates (UTC)** | 2026-05-21 (Cursor) · 2026-05-22 (Claude) |
| **Testers / Agents** | Cursor — Composer · Claude — Cowork mode (claude-sonnet-4-6) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` — **Connected (both runs)** |
| **Tools under test** | `get_activity`, `get_notes`, `analyze_notes` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3 — F-06)** |

---

## Agent agreement summary

| Dimension | Cursor | Claude | Agreement |
|---|---|---|---|
| Scenario 1 — Happy path | **PASS** | **PASS** | ✅ Agree |
| Scenario 2 — Error path | **PASS** | **PASS** | ✅ Agree |
| Scenario 3 — Unauthorized user | **BLOCKED** (F-06) | **BLOCKED** (F-06) | ✅ Agree |
| `get_activity` totalRecords | **41** | **41** | ✅ Agree |
| `get_notes` totalRecords | **19** | **19** | ✅ Agree |
| `analyze_notes` success | **true** | **true** | ✅ Agree |
| KS-1002 impact on `analyze_notes` | Not affected | Not affected | ✅ Agree — confirmed both runs |
| `analyze_notes` limit behavior | Cursor used limit=5 | Claude used default (all 19) | Complementary |
| `analyze_notes` grounding | ✅ July 2025 subject referenced | ✅ Structured response (summary/highlights/comparison/data) | ✅ Agree |

**Both agents agree on all substantive outcomes. The key shared finding is that `analyze_notes` is unaffected by KS-1002 — it uses its own internal analysis engine, not the external Anthropic/OpenAI path of `llm_text_analysis`.**

---

## v1.5 requirements executed

| v1.5 requirement | Cursor | Claude | Consolidated |
|---|---|---|---|
| **A.** MCP connected; all three tools registered | PASS | PASS | **PASS** |
| **B.** `get_activity` — chronological log (Date DESC) | PASS | PASS | **PASS** |
| **B.** `get_notes` — metadata with null bodies (`includeBody: false`) | PASS | PASS | **PASS** |
| **B.** `analyze_notes` — grounded thematic summary | PASS | PASS | **PASS** |
| **B.** `analyze_notes` with `limit` parameter | PASS (limit=5) | PASS (default, all 19) | **PASS** |
| **C.** Invalid fund / company — controlled empty result | PASS | PASS | **PASS** |
| **D.** No credential material or cross-fund data | PASS | PASS | **PASS** |

---

## Tool availability — KS-1002 impact clarification

| Tool | KS-1002 impact | Both runs |
|---|---|---|
| `get_activity` | None | ✅ PASS |
| `get_notes` | None | ✅ PASS |
| `analyze_notes` | **None** — uses internal engine, not external LLM provider path | ✅ PASS |
| `llm_text_analysis` | **Blocked** — Anthropic model 404 (KS-1002) | ❌ BLOCKED (see KS-983) |

**Key finding confirmed by both agents:** `analyze_notes` and `llm_text_analysis` use different LLM execution paths. `analyze_notes` succeeded in both runs; `llm_text_analysis` fails with Anthropic 404.

---

## Test execution

### Scenario 1 — Happy path: PASS ✅

#### `get_activity` — 59 North Partners, LP

| Metric | Cursor | Claude | Status |
|---|---|---|---|
| `totalRecords` | 41 | 41 | ✅ Stable |
| Sort order | Date DESC (newest first) | Date DESC | ✅ Agree |
| Cross-fund leakage | None | None | ✅ Clean |

Top 5 activities (most recent first, all from Aloha API monthly estimates):

| Subject | Date | Category |
|---|---|---|
| [EXTERNAL] 59 North Capital - April 2026 Estimate | 2026-04-30 | 9-Risk Management Report |
| [EXTERNAL] 59 North Capital - March 2026 Estimate | 2026-03-31 | 9-Risk Management Report |
| [EXTERNAL] 59 North Capital - February 2026 Estimate | 2026-02-28 | 9-Risk Management Report |
| [EXTERNAL] 59 North Capital - January 2026 Estimate | 2026-01-31 | 9-Risk Management Report |
| [EXTERNAL] 59 North Capital - December 2025 Estimate | 2025-12-31 | 9-Risk Management Report |

**Filter dimension note (F-01):** `get_activity` filters on `fundNames`; `get_notes` and `analyze_notes` filter on `companyNames`. Different dimensions by design.

---

#### `get_notes` — 59 North Capital Management

| Metric | Cursor (limit=5) | Claude (limit=20, all) | Status |
|---|---|---|---|
| `totalRecords` | 19 | 19 | ✅ Stable |
| `includeBody: false` | `Body_Plaintext: null` | Same | ✅ Agree |
| Cross-tenant notes | None | None | ✅ Clean |

All 19 notes scoped to 59 North Capital Management, category `Investment Due Diligence`. Sample subjects: "July 2025 - Gregg Wolfson <> KAY Update", "2025-06-24 - 59 North Meeting (NYC) - Sutton", "59 North Update Call 1/10/2025". AuthorEmail fields null (server-side PII redaction — expected).

---

#### `analyze_notes` — 59 North Capital Management

| Metric | Cursor (limit=5) | Claude (default) | Status |
|---|---|---|---|
| `success` | `true` | `true` | ✅ Agree |
| Notes analyzed | 5 (per `limit`) | 19 (all) | Complementary |
| Response keys | Not enumerated | `summary`, `highlights`, `comparison`, `data` | ✅ Structured |
| Grounding | July 2025 subject in highlights | Structured by note subjects | ✅ Grounded, not fabricated |
| Response size | Manageable (limit=5) | 191,017 chars (F-03 observed) | See F-03 |
| Write fan-out | None | None | ✅ Clean |
| Credential material | None | None | ✅ Clean |

**F-03:** Claude's default (no `limit`) call returned 191,017 chars — large payload. Cursor's `limit: 5` mitigated this. Production use should specify `limit` to avoid token overflow.

**Status: PASS ✅**

---

### Scenario 2 — Error path: PASS ✅

Invalid fund/company filter returns `success: true, data: [], recordCount: 0` for `get_activity`. No cross-fund data, no fabrication. Error validation confirmed via KS-988 ERR-01 suite:

- `get_notes(limit: -1)` → `"Invalid limit parameter: limit must be between 1 and 200"` — clean error
- `get_activity(startDate: "NOT-A-DATE")` → `"Invalid startDate: Invalid date format..."` — clean error

No stack traces in any error response.

**Status: PASS ✅**

---

### Scenario 3 — Unauthorized user (F-06): BLOCKED ⚠️

No low-scope Entra test identity provisioned. Cross-tenant isolation not testable from a second identity. F-06 persists across all three test runs. Both agents confirm same blocker.

**Status: BLOCKED ⚠️**

---

## Security scan

| Check | Cursor | Claude | Consolidated |
|---|---|---|---|
| Write tool fan-out from `analyze_notes` | None | None | ✅ None |
| Cross-tenant note data visible | None | None | ✅ None |
| Credential material in `analyze_notes` response | None | None | ✅ None |
| Note body PII with `includeBody: false` | Bodies null | Bodies null | ✅ Server-side redaction |
| Prompt injection in note content executed | None observed | None observed | ✅ None |

**Security verdict: PASS ✅**

---

## Findings

| ID | Severity | Description | Source | Status |
|---|---|---|---|---|
| F-01 | Low | `get_activity` filters on `fundNames`; `get_notes`/`analyze_notes` filter on `companyNames` — different dimension per tool. | Cursor | **Persists — by design** |
| F-02 | Low | Invalid filter returns `success: true, data: []` — soft-empty, callers must check `recordCount`. | Cursor | **Persists — known API shape** |
| F-03 | Medium | `analyze_notes` full-corpus response ~191K chars — may overflow token limit without `limit` parameter. Use `limit: 5–20` for production. | Both | **Active (Claude full run) / Mitigated (Cursor `limit:5`)** |
| F-06 | Medium | No low-scope Entra test identity — unauthorized isolation test not executable. | Both | **Persists** |
| N-01 | Info | `get_activity` totalRecords: 40 (1st test) → 41 (2nd test) → 41 (3rd test, stable). | Both | **Informational** |

---

## Test matrix — Section 5.4 Activity/Notes (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.4 Activity/Notes** | **✅ P** | **✅ P** | **⚠️ B** (F-06) | **✅ P** (prior) | **ℹ️ P** (F-03 — use `limit`) | n/a |

---

## Comparison across test runs

| Dimension | First (2026-04-24) | Second (2026-05-13) | Third — Cursor (2026-05-21) | Third — Claude (2026-05-22) |
|---|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** | **v1.5** |
| `get_activity` totalRecords | 40 | 41 | **41 (stable)** | **41 (stable)** |
| `get_notes` totalRecords | 19 | 19 | **19 (stable)** | **19 (stable — 3 runs)** |
| `analyze_notes` success | PASS | PASS | **PASS (limit=5)** | **PASS (all 19)** |
| KS-1002 effect on `analyze_notes` | N/A | N/A | **No effect — confirmed** | **No effect — confirmed** |
| Server status | Connected | Connected | Connected | **Connected** |

---

## Verdict

**Final consolidated result: PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3 — F-06)**

Both agents independently confirm all three Section 5.4 tools execute correctly. The shared key finding is that `analyze_notes` is not blocked by KS-1002 — it uses a separate execution path from `llm_text_analysis`. F-03 (large payload) is best mitigated with `limit: 5–20` in production. F-06 (no low-scope identity) persists across all test runs.

---

*Consolidated: 2026-05-22 · Sources: KS-980 - Cursor Result.md (2026-05-21) · KS-980 - Claude Result.md (2026-05-22) · Guide: dynamo-mcp-testing-guide_v1.5.md §5.4*
