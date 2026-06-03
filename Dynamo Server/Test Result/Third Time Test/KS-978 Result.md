# KS-978 — Consolidated QA Result (Third Time Test)
## Dynamo MCP QA — Validate fund description for a known fund (Section 5.2 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Story** | US-E3-02 — Validate fund description and ratings for a known FUND_ID |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.2 — Fund description test · **Guide v1.5** |
| **Test run** | Third Time Test — Consolidated (Cursor + Claude) |
| **Test dates (UTC)** | 2026-05-21 (Cursor) · 2026-05-22 (Claude) |
| **Testers / Agents** | Cursor — Composer · Claude — Cowork mode (claude-sonnet-4-6) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` — **Connected (both runs)** |
| **Tools under test** | `get_fund_description` (primary) · `get_funds` (Cursor cross-tool baseline) |
| **Tools descoped** | `get_rating_summary`, `get_rating_details` — permanently removed 2026-05-07 |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3) / S (rating tools)** |

---

## Agent agreement summary

| Dimension | Cursor | Claude | Agreement |
|---|---|---|---|
| Scenario 1 — Happy path | **PASS** | **PASS** | ✅ Agree |
| Scenario 2 — Error path (not-found) | **PASS** | **PASS** | ✅ Agree |
| Scenario 3 — Null Description (2026 Fund) | **PASS** | **PASS** | ✅ Agree |
| Rating tools | **S** | **S** | ✅ Agree |
| 59 North GUID | `D7879DB7-E230-4191-8849-DE4B7B64626C` | Same | ✅ Agree |
| 2026 Fund GUID | `3F554983-6C4B-470F-B7A0-AC823EA4AFD1` | Same | ✅ Agree |
| `Description` null handling | Explicit JSON null | Explicit JSON null | ✅ Agree |
| Cross-tool `get_funds` alignment | PASS (Cursor) | PASS (Claude via KS-977) | ✅ Agree |

**Both agents reach identical conclusions across all scenarios.**

---

## v1.5 requirements executed

| v1.5 requirement | Cursor | Claude | Consolidated |
|---|---|---|---|
| **A.** MCP connected; `get_fund_description` registered | PASS | PASS | **PASS** |
| **B.** Two-call `get_fund_description` consistency | PASS | PASS | **PASS** |
| **B.** Cross-tool alignment — `get_funds` ↔ `get_fund_description` | PASS | PASS (KS-977) | **PASS** |
| **B.** Fund GUID stable via `get_fund_description` | PASS | PASS | **PASS** |
| **B.** `Description` non-null for described fund | PASS | PASS | **PASS** |
| **B.** Explicit `null` for undescribed fund | PASS | PASS | **PASS** |
| **C.** Invalid fund — controlled empty result | PASS | PASS | **PASS** |
| **D.** Rating tools permanently removed, not invoked | S | S | **S** |
| **Security** — no credential material in output | PASS | PASS | **PASS** |

---

## Test execution

### Preconditions

Both agents confirmed `get_fund_description` registered and MCP Connected. Cursor additionally performed a `get_funds(fundName: "59 North")` cross-tool baseline to confirm field alignment.

---

### Scenario 1 — Happy path: PASS ✅

#### Two-call consistency — 59 North Partners, LP

Both agents called `get_fund_description(fundName="59 North Partners, LP")` twice and confirmed byte-identical results.

| Field | Value | Source |
|---|---|---|
| `ID` (GUID) | `D7879DB7-E230-4191-8849-DE4B7B64626C` | Both agents |
| `Name` | 59 North Partners, LP | Both agents |
| `FundManagerName` | 59 North Capital Management | Both agents |
| `Description` | "Global equity l/s manager with value orientation. Focus is on cash generative and asset based businesses." | Both agents |
| Two-call consistency | Byte-identical | Both agents |
| GUID vs. prior runs | Stable — all three test runs | Both agents |

#### Cross-tool alignment (Cursor `get_funds` baseline)

| Field | `get_funds` filter | `get_fund_description` | Alignment |
|---|---|---|---|
| `Name` | 59 North Partners, LP | 59 North Partners, LP | ✅ Match |
| `FundManagerName` | 59 North Capital Management | 59 North Capital Management | ✅ Match |
| `ID` (GUID) | *not in list projection* (F-01) | `D7879DB7-E230-4191-8849-DE4B7B64626C` | ✅ GUID via describe |

**F-01 note:** `get_funds` list projection does not include `ID` (GUID). GUID resolution requires `get_fund_description` — documented by both agents.

**Status: PASS ✅**

---

### Scenario 2 — Error path (non-existent fund): PASS ✅

Both agents tested a synthetic non-existent fund name. Result:

```json
{"success":true,"data":[],"recordCount":0}
```

No foreign rows, no invented fund object, no error stack trace. Cursor used `"ZZZ_NONEXISTENT_FUND_KS978_QA"`, Claude used `"XYZNONEXISTENT"`.

**F-02 note (both agents):** Not-found returns `success: true` + `data: []` — callers must check `recordCount`, not `success` alone.

**Status: PASS ✅**

---

### Scenario 3 — Null `Description` edge case: PASS ✅

Both agents called `get_fund_description(fundName="2026 Fund")`:

| Field | Value |
|---|---|
| `ID` (GUID) | `3F554983-6C4B-470F-B7A0-AC823EA4AFD1` |
| `Name` | 2026 Fund |
| `FundManagerName` | 2026 Fund |
| `Description` | **`null`** (explicit JSON null) |

No invented rating narrative, no fabricated description, no crash. `null` returned explicitly as documented in v1.5 §B.

**Status: PASS ✅**

---

### Rating tools: S (Skipped — permanently removed) ⏭️

`get_rating_summary` and `get_rating_details` are absent from both agents' MCP registries. Confirmed absent from v1.5 10-tool inventory. No change from Second Time Test.

---

## Security scan

| Check | Cursor | Claude | Consolidated |
|---|---|---|---|
| Raw JWT or Bearer token in output | None | None | ✅ None |
| Cross-fund data in not-found probe | None | None | ✅ None |
| Null Description crash or internals | None | None | ✅ None |
| GUID stable across runs | ✅ | ✅ | ✅ Stable (3 runs) |

**Security verdict: PASS ✅**

---

## Findings

| ID | Severity | Description | Source | Status |
|---|---|---|---|---|
| F-01 | Low | `get_funds` list projection omits `ID` (GUID). Use `get_fund_description` for GUID resolution. | Both | **Persists — by design** |
| F-02 | Low | Not-found returns `success: true, data: []` — callers must check `recordCount`, not `success` alone. | Both | **Persists — known API shape** |
| F-04 | Info | Date fields only visible on `get_funds`; `get_fund_description` carries no datetime fields in returned payload. | Cursor | **Persists — by design** |
| N-01 | Info | 59 North GUID `D7879DB7-…` and 2026 Fund GUID `3F554983-…` both stable across all three test runs. | Both | **Informational** |

---

## Test matrix — Section 5.2 Fund Fetch (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.2 Fund fetch** (`get_fund_description`) | **✅ P** | **✅ P** | n/a | n/a | n/a | n/a |

*Rating tools (get_rating_summary, get_rating_details) — all cells S.*

---

## Comparison across test runs

| Dimension | First (2026-04-24) | Second (2026-05-13) | Third — Cursor (2026-05-21) | Third — Claude (2026-05-22) |
|---|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** | **v1.5** |
| Scenario 1 | PASS | PASS | **PASS** | **PASS** |
| Scenario 2 | PASS | PASS | **PASS** | **PASS** |
| Scenario 3 | PASS | PASS | **PASS** | **PASS** |
| 59 North GUID | D7879DB7-… | D7879DB7-… | D7879DB7-… | **D7879DB7-… (stable — 3 runs)** |
| 2026 Fund Description | Not tested | `null` | `null` | **`null` confirmed** |
| Rating tools | Tested | S (removed) | S (removed) | **S (removed — v1.5)** |
| Server status | Connected | Connected | Connected | **Connected** |

---

## Verdict

**Final consolidated result: PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3) / S (rating tools)**

Both agents independently confirm all three scenarios pass. The 59 North GUID baseline is stable across all three test runs. Null-field edge case handled cleanly by both agents. Rating tools remain permanently absent.

---

*Consolidated: 2026-05-22 · Sources: KS-978 - Cursor Result.md (2026-05-21) · KS-978 - Claude Result.md (2026-05-22) · Guide: dynamo-mcp-testing-guide_v1.5.md §5.2*
