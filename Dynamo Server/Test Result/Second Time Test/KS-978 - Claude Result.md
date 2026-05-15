# KS-978 — Claude QA Result (Second Time Test)
## Dynamo MCP QA — Validate fund description for a known FUND_ID (Section 5.2)

| Field | Value |
|---|---|
| **Ticket** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Story** | US-E3-02 — Validate fund description and ratings for a known FUND_ID |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.2 — Fund data fetch test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `get_fund_description`, `get_funds` |
| **Tools descoped** | `get_rating_summary`, `get_rating_details` — intentional production hardening (2026-05-07) |
| **Overall result** | **PASS (Scenarios 1–3) · Rating portions S (Skipped — production hardening)** |

---

## Summary

All three section 5.2 scenarios pass for the `get_fund_description` + `get_funds` scope. Description content, fund identity fields, and null handling are fully consistent and stable. The GUID for the baseline fund (59 North Partners, LP) is unchanged from the first test (2026-04-25), and the description text is identical, confirming backend stability. The null-description behavior on 2026 Fund is explicit and consistent with both the first test and the 2026-05-07 live verification.

`get_rating_summary` and `get_rating_details` were permanently removed from the MCP server on 2026-05-07 (intentional production hardening, confirmed by product owner). All rating-related sub-steps are marked **S (Skipped)** across all three scenarios as per the updated ticket requirements.

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
**Tools called:** `get_fund_description` (fundName="59 North Partners") + `get_funds` (fundName="59 North Partners") — parallel calls, 2026-05-13 UTC.

#### `get_fund_description` raw response

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 1 of 1 total fund(s).",
  "data": [{
    "ID": "D7879DB7-E230-4191-8849-DE4B7B64626C",
    "Name": "59 North Partners, LP",
    "SimpleSearchField": "59 North Partners, LP",
    "FundManagerName": "59 North Capital Management",
    "Description": "Global equity l/s manager with value orientation. Focus is on cash generative and asset based businesses."
  }],
  "recordCount": 1,
  "totalRecords": 1
}
```

#### `get_funds` cross-reference raw response

```json
{
  "success": true,
  "data": [{
    "Name": "59 North Partners, LP",
    "FundManagerName": "59 North Capital Management",
    "PipelineStatus": "P - Portfolio",
    "AssetClassName": "Absolute Return",
    "SubAssetClassName": "Equity Hedge",
    "Vintage/InceptionNew": "2019",
    "ResponsibleName": "Kapua Aiu-Yasuhara",
    "FundLiquidityTypeName": "General",
    "MostRecentFinancialStatementDate": "2025-12-31T00:00:00.000Z"
  }],
  "recordCount": 1,
  "totalRecords": 1
}
```

#### Cross-tool consistency check

| Field | `get_fund_description` | `get_funds` | Consistent? |
|---|---|---|---|
| Name | 59 North Partners, LP | 59 North Partners, LP | ✅ PASS |
| FundManagerName | 59 North Capital Management | 59 North Capital Management | ✅ PASS |
| Fund GUID (ID) | D7879DB7-E230-4191-8849-DE4B7B64626C | *(not exposed in get_funds)* | ✅ N/A — expected |
| Description non-null | ✅ Present | *(not in get_funds)* | ✅ PASS |
| No contradiction between tools | — | — | ✅ PASS |

#### GUID stability check (vs. first test 2026-04-25)

| Check | First Test | Second Test | Result |
|---|---|---|---|
| Fund GUID | D7879DB7-E230-4191-8849-DE4B7B64626C | D7879DB7-E230-4191-8849-DE4B7B64626C | ✅ Identical |
| Description text | "Global equity l/s manager with value orientation..." | "Global equity l/s manager with value orientation..." | ✅ Identical |
| FundManagerName | 59 North Capital Management | 59 North Capital Management | ✅ Identical |

#### Rating tools (descoped)

| Tool | Result |
|---|---|
| `get_rating_summary` | S — Skipped (intentional production hardening, removed 2026-05-07) |
| `get_rating_details` | S — Skipped (intentional production hardening, removed 2026-05-07) |

**Scenario 1 verdict: PASS** — description and fund identity fields are non-contradictory and internally consistent. Rating portion permanently S (Skipped).

---

### Scenario 2 — Error path: PASS ✅

**Prompt:** Fetch full details of a non-existent fund ID.  
**Tool called:** `get_fund_description` with `fundName="ZZZNONEXISTENTFUND99999"`

#### Raw response

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 0 of 0 total fund(s).",
  "data": [],
  "recordCount": 0,
  "totalRecords": 0,
  "hasMore": false
}
```

#### Error path checklist

| Check | Result |
|---|---|
| No cross-fund data returned | ✅ PASS — data: [] |
| No data from other tenants or funds | ✅ PASS — empty result |
| Controlled empty result (not crash/500) | ✅ PASS — success: true, recordCount: 0 |
| Agent did not fabricate fund description | ✅ PASS |
| Rating tools error-path | S — Skipped (tools removed) |

**Finding F-01 (persists):** Server returns `success: true` with empty `data` for not-found queries rather than a 404 or explicit not-found error. Integrators must check `recordCount` / `data.length` rather than `success` flag alone. Severity: Low — consistent with first test.

**Scenario 2 verdict: PASS** — MCP layer returns controlled empty result with no data leak. Rating error-path is S (Skipped).

---

### Scenario 3 — Edge case (null fields): PASS ✅

**Prompt:** Fetch full details of a fund where description is null.  
**Tool called:** `get_fund_description` with `fundName="2026 Fund"`

#### Raw response

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 1 of 1 total fund(s).",
  "data": [{
    "ID": "3F554983-6C4B-470F-B7A0-AC823EA4AFD1",
    "Name": "2026 Fund",
    "SimpleSearchField": "2026 Fund",
    "FundManagerName": "Phoenix Equity",
    "Description": null
  }],
  "recordCount": 1,
  "totalRecords": 1
}
```

#### Null field checklist

| Check | Result |
|---|---|
| `Description` returned as explicit `null` | ✅ PASS — not silently omitted |
| `Description` not replaced by placeholder text | ✅ PASS — no fabrication |
| Other fields (`Name`, `FundManagerName`, `ID`) populated | ✅ PASS — all present |
| GUID stable vs. 2026-05-07 verification | ✅ PASS — 3F554983-6C4B-470F-B7A0-AC823EA4AFD1 matches |

**Scenario 3 verdict: PASS** — null description is surfaced explicitly as JSON `null`, not silently dropped or padded.

---

## Security Scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in any tool output | ✅ None detected |
| Refresh token or client secret in transcript | ✅ None detected |
| Cross-fund / cross-tenant data in invalid query response | ✅ None detected |
| Credential leakage via description or SimpleSearchField | ✅ None detected |

**Security verdict: PASS**

---

## Findings

### Persisting from First Test (2026-04-25)

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | Not-found queries return `success: true` + empty `data` (no 404/explicit error). Integrators must check `recordCount` not just `success` flag. | **Persists — unresolved** |
| F-02 | Low | ID multiplicity: MSSQL GUID exposed by `get_fund_description`, no single unified FUND_ID on `get_funds` payload. Cross-tool chain must use name → description to obtain GUID. | **Persists — unresolved** |
| F-03 | Info/By-design | `get_rating_details` was empty for both tested UPNs in first test (user-scoped access). Now moot — tool removed. | **Closed — tool removed** |
| F-04 | Info | Date fields only visible on `get_funds`; `get_fund_description` carries no datetime fields. | **Persists — by design** |

### New Observations (Second Run)

| ID | Severity | Description |
|---|---|---|
| N-01 | Info | Rating tools (`get_rating_summary`, `get_rating_details`) confirmed removed as of 2026-05-07. All rating sub-steps marked S (Skipped — intentional production hardening) per updated ticket requirements. No functional regression on remaining tools. |
| N-02 | Info | Description text for 59 North Partners, LP is identical to first test — no backend content drift detected. GUID unchanged. |

---

## Test Matrix Row — Section 5.2 Fund fetch

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.2 Fund description** | **P** | **P** | n/a (black-box, inferred) | n/a | n/a |

*Rating sub-steps: S (Skipped — intentional production hardening) across all columns.*

---

## Comparison with First Test (2026-04-25)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS (all 3 tools) | **PASS** — get_fund_description + get_funds; rating tools S (Skipped) |
| Scenario 2 Error path | PASS | **PASS** — consistent behavior |
| Scenario 3 Null fields | PASS | **PASS** — Description: null confirmed |
| 59 North GUID | D7879DB7-E230-4191-8849-DE4B7B64626C | **Identical** |
| 59 North Description | "Global equity l/s manager..." | **Identical** |
| 2026 Fund Description | null | **null — consistent** |
| get_rating_summary | Available, tested | **Removed — S (Skipped)** |
| get_rating_details | Available, data=[] | **Removed — S (Skipped)** |
| Credential leakage | None | **None** |
| F-01 (soft-empty shape) | Present | **Persists** |
| F-02 (ID multiplicity) | Present | **Persists** |

---

## Evidence

- **Tools:** `get_fund_description`, `get_funds` via MCP connector `https://mcp.conceptia.com/dynamo/sse`
- **Session:** Claude Cowork (claude-sonnet-4-6) — live authenticated MCP session
- **Calls logged:** 4 (Scenario 1: get_fund_description + get_funds for 59 North; Scenario 2: get_fund_description invalid name; Scenario 3: get_fund_description for 2026 Fund)
- **Credential scan:** Passed
- **Report file:** `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-978 - Claude Result.md`

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.2 happy-path: description fields non-contradictory with get_funds | ✅ PASS |
| Fund GUID stable vs. prior run | ✅ PASS |
| Description text stable vs. prior run | ✅ PASS |
| Error path: invalid FUND_ID returns controlled empty result | ✅ PASS |
| Null description returned explicitly (not fabricated) | ✅ PASS |
| No credential leakage | ✅ PASS |
| Rating tools (get_rating_summary, get_rating_details) | S — Skipped (intentional production hardening) |

**Final result: PASS (Scenarios 1–3) · Rating portions S (Skipped — intentional production hardening)**  
All executable section 5.2 acceptance criteria are met. Rating tool coverage is permanently descoped per the 2026-05-07 production hardening decision.

---

*Generated: 2026-05-13 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-978 v1.4 updated requirements (incl. 2026-05-07 rating tools removal) · Guide: dynamo-mcp-testing-guide_v1.4.md*
