# KS-978 — Consolidated QA Result (Second Time Test)
## Dynamo MCP QA — Validate fund description for a known FUND_ID (Section 5.2)

| Field | Value |
|---|---|
| **Ticket** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Story** | US-E3-02 — Validate fund description and ratings for a known FUND_ID |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.2 — Fund data fetch test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Testers / Agents** | Claude (Cowork mode — claude-sonnet-4-6) · Cursor (Composer — automated MCP invocation) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` / `user-conceptia-dynamo` |
| **Tools under test** | `get_fund_description`, `get_funds` |
| **Tools descoped** | `get_rating_summary`, `get_rating_details` — intentional production hardening (2026-05-07) |
| **Overall result** | **PASS (Scenarios 1–3) · Rating portions S (Skipped — intentional production hardening)** |

---

## Summary

All three section 5.2 scenarios **PASS** across both agents (Claude and Cursor). Description content, fund identity fields, and null-handling are fully consistent and stable across all calls and both agents.

The GUID for the baseline fund (59 North Partners, LP) is unchanged from the first test (2026-04-25), and the description text is identical, confirming backend stability. The null-description behavior on 2026 Fund is explicit and consistent with both the first test and the 2026-05-07 live verification.

`get_rating_summary` and `get_rating_details` were permanently removed from the MCP server on 2026-05-07 (intentional production hardening, confirmed by product owner). All rating-related sub-steps are marked **S (Skipped)** across all scenarios per the updated ticket requirements. Both agents are aligned on this scope exclusion.

---

## Scope Change — Rating Tools Removed (2026-05-07)

| Tool | Status at First Test (2026-04-25) | Status Now (2026-05-13) | Decision |
|---|---|---|---|
| `get_fund_description` | Available | **Available** | No change — in scope |
| `get_funds` | Available | **Available** | No change — in scope (cross-reference) |
| `get_rating_summary` | Available | **Removed** | Intentional production hardening — S (Skipped) |
| `get_rating_details` | Available | **Removed** | Intentional production hardening — S (Skipped) |

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

**Prompt:** Fetch the full details of fund `59 North Partners, LP`, including its description.

| Step | Tool | Parameters |
|---|---|---|
| Baseline | `get_funds` | `limit: 5`, `offset: 0` |
| Happy path (×2) | `get_fund_description` | `fundName: "59 North Partners, LP"`, `limit: 5`, `offset: 0` |

#### `get_funds` — baseline row for 59 North Partners, LP

| Field | Value |
|---|---|
| **Name** | 59 North Partners, LP |
| **FundManagerName** | 59 North Capital Management |
| **PipelineStatus** | P - Portfolio |
| **AssetClassName** | Absolute Return |
| **SubAssetClassName** | Equity Hedge |
| **ResponsibleName** | Kapua Aiu-Yasuhara |
| **FundLiquidityTypeName** | General |
| **Vintage/InceptionNew** | 2019 |
| **MostRecentFinancialStatementDate** | 2025-12-31T00:00:00.000Z |
| **DateCreated** | 2022-07-11T22:30:44.027Z |
| **LastModified** | 2026-03-25T17:36:48.253Z |
| **Fund `ID` on list row** | **Absent** (narrow list projection — see F-01) |

#### `get_fund_description` — two calls per agent (all four calls identical)

| Agent | Call | `recordCount` | `ID` (GUID) | `Name` | `FundManagerName` | `Description` |
|---|---|---:|---|---|---|---|
| Claude | 1 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | Global equity l/s manager with value orientation. Focus is on cash generative and asset based businesses. |
| Claude | 2 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | *(identical to Call 1)* |
| Cursor | 1 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | Global equity l/s manager with value orientation… |
| Cursor | 2 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | *(identical to Call 1)* |

#### Cross-tool consistency check (both agents)

| Field | `get_fund_description` | `get_funds` | Consistent? |
|---|---|---|---|
| Name | 59 North Partners, LP | 59 North Partners, LP | ✅ PASS |
| FundManagerName | 59 North Capital Management | 59 North Capital Management | ✅ PASS |
| Fund GUID (ID) | D7879DB7-E230-4191-8849-DE4B7B64626C | *(not exposed in get_funds)* | ✅ N/A — expected |
| Description non-null | ✅ Present | *(not in get_funds)* | ✅ PASS |
| No contradiction between tools | — | — | ✅ PASS |

#### GUID stability check (vs. first test 2026-04-25)

| Check | First Test | Second Test (Claude) | Second Test (Cursor) | Result |
|---|---|---|---|---|
| Fund GUID | D7879DB7-E230-4191-8849-DE4B7B64626C | D7879DB7-E230-4191-8849-DE4B7B64626C | D7879DB7-E230-4191-8849-DE4B7B64626C | ✅ Identical across all runs |
| Description text | "Global equity l/s manager…" | "Global equity l/s manager…" | "Global equity l/s manager…" | ✅ Identical — no backend drift |
| FundManagerName | 59 North Capital Management | 59 North Capital Management | 59 North Capital Management | ✅ Identical |

#### v1.4 checklist

| Requirement | Claude | Cursor |
|---|---|---|
| Black-box baseline from `get_funds` (no UI-exported IDs) | ✅ PASS | ✅ PASS |
| Pair same fund by `Name`; document `ID` only from describe | ✅ PASS | ✅ PASS |
| Non-contradiction on overlapping attributes | ✅ PASS | ✅ PASS |
| Description non-null and non-fabricated | ✅ PASS | ✅ PASS |
| No credential leakage | ✅ PASS | ✅ PASS |
| `get_rating_summary` / `get_rating_details` | S — Skipped | S — Skipped |

**Scenario 1 verdict: PASS** — description and fund identity fields are non-contradictory and internally consistent across both agents. Rating portion permanently S (Skipped).

---

### Scenario 2 — Error path: PASS ✅

**Prompt:** Fetch full details of a non-existent fund.

| Agent | `fundName` used | `success` | `data` | `recordCount` | Cross-fund / stray data |
|---|---|---|---|---|---|
| **Claude** | `ZZZNONEXISTENTFUND99999` | `true` | `[]` | `0` | None |
| **Cursor** | `ZZZ_NONEXISTENT_FUND_KS978_QA` | `true` | `[]` | `0` | None |

#### Error path checklist

| Check | Claude | Cursor |
|---|---|---|
| No cross-fund data returned | ✅ PASS | ✅ PASS |
| No data from other tenants or funds | ✅ PASS | ✅ PASS |
| Controlled empty result (not crash/500) | ✅ PASS | ✅ PASS |
| Agent did not fabricate fund description | ✅ PASS | ✅ PASS |

**Finding F-01 (persists):** Server returns `success: true` with empty `data` for not-found queries rather than a 404 or explicit not-found error. Integrators must check `recordCount` / `data.length` rather than `success` flag alone. Both agents confirm this behavior. Severity: Low.

**Scenario 2 verdict: PASS** — MCP layer returns a controlled empty result with no data leak across both agents.

---

### Scenario 3 — Edge case (null Description): PASS ✅

**Prompt:** Fetch full details of a fund where description is null (`2026 Fund`).

| Agent | `ID` (GUID) | `Name` | `FundManagerName` | `Description` |
|---|---|---|---|---|
| **Claude** | `3F554983-6C4B-470F-B7A0-AC823EA4AFD1` | 2026 Fund | Phoenix Equity | `null` |
| **Cursor** | `3F554983-6C4B-470F-B7A0-AC823EA4AFD1` | 2026 Fund | Phoenix Equity | `null` |

#### Null field checklist

| Check | Claude | Cursor |
|---|---|---|
| `Description` returned as explicit `null` (not silently omitted) | ✅ PASS | ✅ PASS |
| `Description` not replaced by placeholder/fabricated text | ✅ PASS | ✅ PASS |
| Other fields (`Name`, `FundManagerName`, `ID`) populated | ✅ PASS | ✅ PASS |
| GUID stable vs. 2026-05-07 verification | ✅ PASS | ✅ PASS |

**Scenario 3 verdict: PASS** — null description is surfaced explicitly as JSON `null`, not silently dropped or padded, consistently across both agents.

---

## Security Scan

| Check | Claude | Cursor |
|---|---|---|
| Raw JWT or Bearer token in any tool output | ✅ None detected | ✅ None observed |
| Refresh token or client secret in transcript | ✅ None detected | ✅ None observed |
| Cross-fund / cross-tenant data in invalid query response | ✅ None detected | ✅ None observed |
| Credential leakage via description or SimpleSearchField | ✅ None detected | ✅ None observed |

**Security verdict: PASS (both agents)**

---

## Findings

### Persisting from First Test (2026-04-25)

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | `get_funds` list projection has no explicit `FundId` / GUID field. `get_fund_description` exposes the GUID (`ID`). Cross-tool pairing must use `Name` → describe to obtain the GUID. Same family as KS-977-F-01. | **Persists — unresolved** (confirmed by both agents) |
| F-02 | Low | Not-found queries return `success: true` + empty `data` (no 404 / explicit error). Integrators must check `recordCount` / `data.length`, not just the `success` flag. | **Persists — known API shape**; satisfies v1.4 "empty authorized result" |
| F-03 | Info / By-design | `get_rating_details` was empty for both tested UPNs in the first test (user-scoped access). Now moot — tool removed. | **Closed — tool removed** |
| F-04 | Info / By-design | Date fields (`DateCreated`, `LastModified`, `MostRecentFinancialStatementDate`) appear only on `get_funds`; `get_fund_description` carries no datetime fields. | **Persists — by design** |

### New Observations (Second Run)

| ID | Source | Severity | Description |
|---|---|---|---|
| N-01 | Both | Info | Rating tools (`get_rating_summary`, `get_rating_details`) confirmed removed as of 2026-05-07. All rating sub-steps marked S (Skipped — intentional production hardening) per updated ticket requirements. No functional regression on remaining tools. |
| N-02 | Claude | Info | Description text for 59 North Partners, LP is identical to first test — no backend content drift detected. GUID unchanged across all three test dates. |

---

## Test Matrix Row — Section 5.2 Fund fetch

| Agent | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | Ratings (`get_rating_*`) |
|---|---|---|---|---|---|---|
| **Claude** | **P** | **P** | n/a | n/a | n/a | **S** |
| **Cursor** | **P** | **P** | n/a | n/a | n/a | **S** |
| **Combined** | **P** | **P** | n/a | n/a | n/a | **S** |

*Unauthorized user / Network drop: n/a for section 5.2; covered by KS-977 evidence. Large dataset: n/a for focused description pairing run. Coordinate consolidated totals with [KS-993](https://gendvn.atlassian.net/browse/KS-993) per ticket matrix note.*

---

## Comparison with First Test (2026-04-25)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS (all 3 tools) | **PASS** — `get_fund_description` + `get_funds`; rating tools S (Skipped) |
| Scenario 2 Error path | PASS | **PASS** — consistent behavior (both agents) |
| Scenario 3 Null fields | PASS | **PASS** — `Description: null` confirmed (both agents) |
| 59 North GUID | D7879DB7-E230-4191-8849-DE4B7B64626C | **Identical** across both agents |
| 59 North Description | "Global equity l/s manager…" | **Identical** — no backend drift |
| 2026 Fund Description | `null` | **`null`** — consistent (both agents) |
| 2026 Fund GUID | 3F554983-6C4B-470F-B7A0-AC823EA4AFD1 | **Identical** across both agents |
| `get_rating_summary` | Available, tested | **Removed — S (Skipped)** |
| `get_rating_details` | Available, `data: []` | **Removed — S (Skipped)** |
| Credential leakage | None | **None** (both agents) |
| F-01 (GUID absent in get_funds) | Present | **Persists** |
| F-02 (soft-empty shape on not-found) | Present | **Persists** |

---

## Evidence

| Agent | Tools | Details |
|---|---|---|
| **Claude** | `get_fund_description`, `get_funds` via `https://mcp.conceptia.com/dynamo/sse` | 4 calls: Scenario 1 (get_fund_description ×2 + get_funds ×1 for 59 North); Scenario 2 (invalid name); Scenario 3 (2026 Fund) |
| **Cursor** | `get_fund_description`, `get_funds` via `user-conceptia-dynamo` | 5 calls: baseline get_funds; Scenario 1 get_fund_description ×2; Scenario 2 (invalid name); Scenario 3 (2026 Fund) |

- **Funds used:** 59 North Partners, LP · 2026 Fund · ZZZNONEXISTENTFUND99999 / ZZZ_NONEXISTENT_FUND_KS978_QA (synthetic)
- **Credential scan:** Passed (both agents)
- **Report files:**
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-978 - Claude Result.md`
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-978 - Cursor Result.md`
  - `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-978 Result.md` *(this file)*

---

## Verdict

| Criteria | Claude | Cursor | Combined |
|---|---|---|---|
| Section 5.2 happy-path: description fields non-contradictory with `get_funds` | ✅ PASS | ✅ PASS | ✅ PASS |
| Fund GUID stable vs. prior run | ✅ PASS | ✅ PASS | ✅ PASS |
| Description text stable vs. prior run | ✅ PASS | ✅ PASS | ✅ PASS |
| Error path: invalid fund name returns controlled empty result | ✅ PASS | ✅ PASS | ✅ PASS |
| Null description returned explicitly (not fabricated or omitted) | ✅ PASS | ✅ PASS | ✅ PASS |
| No credential leakage | ✅ PASS | ✅ PASS | ✅ PASS |
| Rating tools (`get_rating_summary`, `get_rating_details`) | S — Skipped | S — Skipped | S — Skipped |

**Final result: PASS (Scenarios 1–3) · Rating portions S (Skipped — intentional production hardening)**

All executable section 5.2 acceptance criteria are met across both agents. Rating tool coverage is permanently descoped per the 2026-05-07 production hardening decision.

---

*Generated: 2026-05-20 · Consolidated from: Claude (claude-sonnet-4-6) + Cursor (Composer) second-time test runs dated 2026-05-13 · Source: KS-978 v1.4 updated requirements (incl. 2026-05-07 rating tools removal) · Guide: dynamo-mcp-testing-guide_v1.4.md*
