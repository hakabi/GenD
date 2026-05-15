# KS-978 — Claude Result: Validate Fund Description and Ratings for a Known Fund

| Field | Value |
|-------|-------|
| **Jira** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Ticket title** | Dynamo MCP QA — Validate fund description and ratings for a known FUND_ID |
| **MCP server** | `conceptia-dynamo` |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Report date** | 2026-04-24 |
| **Tester** | Bình Hà Khoa |
| **Client** | Claude Cowork (Desktop — Cowork mode) |
| **Guide reference** | section 5.2 |
| **Tools under test** | `get_fund_description`, `get_rating_summary`, `get_rating_details`, `search_aloha_funds`, `get_funds` |

---

## 1. Executive Summary

**Objective:** Validate that `get_fund_description`, `get_rating_summary`, and `get_rating_details` return internally consistent, non-contradictory data for the same fund identity, with explicit nulls for absent fields and coherent alignment with `get_funds` — all under black-box rules (no external UI comparison).

**Outcome: PASS** for Scenarios 1 and 3. Scenario 2 passes with a behavioural note on empty-vs-error response shape.

| Check | Result |
|-------|--------|
| Scenario 1 — Happy path: description + ratings non-contradictory | ✅ PASS |
| Scenario 1 — Fund names consistent across all tools | ✅ PASS |
| Scenario 1 — Manager name consistent across `get_fund_description` + `get_funds` | ✅ PASS |
| Scenario 1 — Rating summary fields non-null and plausible | ✅ PASS |
| Scenario 1 — Date timezone behaviour documented | ✅ PASS |
| Scenario 2 — Non-existent fund: controlled empty result, no tenant cross-leak | ✅ PASS (note: returns HTTP 200 + empty data, not an error code) |
| Scenario 3 — Null description explicitly returned as `null`, not fabricated | ✅ PASS |
| `get_rating_details` user-scoped access control | ✅ PASS (empty for non-KS UPN — by-design) |

---

## 2. Test Environment

| Item | Detail |
|------|--------|
| MCP client | Claude Cowork Desktop (Cowork mode) |
| SSE endpoint | `https://mcp.conceptia.com/dynamo/sse` |
| Baseline fund (Scenario 1) | 59 North Partners, LP |
| MSSQL Fund GUID | `D7879DB7-E230-4191-8849-DE4B7B64626C` |
| Solovis fund_id (ES) | `"28582"` (string) |
| Null-description fund (Scenario 3) | 2026 Fund |
| Non-existent fund name (Scenario 2) | `ZZZNONEXISTENTFUND99999` |
| Non-existent rating ID (Scenario 2) | `ZZZNONEXISTENT99999` |
| Test date | 2026-04-24 |
| Tester UPN | `hakhoabinh@gmail.com` (non-KS AAD account) |

---

## 3. Fund Identity Chaining (Black-Box)

KS-978 requires chaining three tools for the same fund. The fund identity is **not a single universal ID** — two separate systems are involved:

| System | ID Type | Value for "59 North Partners, LP" |
|--------|---------|----------------------------------|
| MSSQL Dynamo (Fund table) | GUID (`uniqueidentifier`) | `D7879DB7-E230-4191-8849-DE4B7B64626C` |
| Elasticsearch / fad_compute_server | String (`"28582"`) | `"28582"` (solovis source) |

**Chain used for Scenario 1:**
1. `get_fund_description` → filtered by `fundName="59 North Partners, LP"` → returns MSSQL GUID + description
2. `search_aloha_funds` → filtered by `search_text="59 North"`, `is_owned_by_ks=true` → returns ES `fund_id="28582"`, `source="solovis"`
3. `get_rating_summary(id="28582", source="solovis")` → returns rating dimensions
4. `get_rating_details(id="28582", source="solovis", user=...)` → returns user-scoped detail rows
5. `get_funds` → cross-reference manager name, asset class, pipeline status

---

## 4. Scenario 1 — Happy Path

### T1-A — get_fund_description

**Parameters:** `fundName="59 North Partners, LP"`, `limit=1`

**Response:**
```json
{
  "ID": "D7879DB7-E230-4191-8849-DE4B7B64626C",
  "Name": "59 North Partners, LP",
  "SimpleSearchField": "59 North Partners, LP",
  "FundManagerName": "59 North Capital Management",
  "Description": "Global equity l/s manager with value orientation. Focus is on cash generative and asset based businesses."
}
```

**Field check:**

| Field | Value | Null? |
|-------|-------|-------|
| ID (GUID) | `D7879DB7-E230-4191-8849-DE4B7B64626C` | No |
| Name | 59 North Partners, LP | No |
| SimpleSearchField | 59 North Partners, LP | No |
| FundManagerName | 59 North Capital Management | No |
| Description | "Global equity l/s manager..." | No |

**Result: ✅ PASS** — all fields populated; description is a coherent investment strategy narrative.

---

### T1-B — search_aloha_funds (ID bridge)

**Parameters:** `search_text="59 North"`, `is_owned_by_ks=true`

**Response:**
```json
{
  "fund_id": "28582",
  "fund_name": "59 North Partners, LP",
  "manager_name": "59 North Capital Management",
  "source": "solovis",
  "fund_type": "public"
}
```

**Result: ✅ PASS** — fund_name matches `get_fund_description.Name` and `get_funds.Name`. Manager name consistent. `fund_id="28582"` retrieved for ratings chain.

---

### T1-C — get_rating_summary

**Parameters:** `id="28582"`, `source="solovis"`, `type="fund"`

**Response:**
```json
{
  "id": "28582",
  "rating_name": "59 North Partners, LP",
  "source": "solovis",
  "type": "fund",
  "edge": 6,
  "organization": 6,
  "track_record": 6,
  "total_rating": 6,
  "average_conviction": 5
}
```

**Field check:**

| Dimension | Value | Range check |
|-----------|-------|-------------|
| edge | 6 | Plausible integer |
| organization | 6 | Plausible integer |
| track_record | 6 | Plausible integer |
| total_rating | 6 | Consistent with dimensions |
| average_conviction | 5 | Plausible; slightly below total_rating |

**Result: ✅ PASS** — all five rating dimensions present, non-null, plausible integers. `rating_name` matches fund name from all other tools. `id` matches the solovis `fund_id` used in the request.

---

### T1-D — get_rating_details

**Parameters:** `id="28582"`, `source="solovis"`, `type="fund"`, `user="hakhoabinh@gmail.com"`

**Response:**
```json
{
  "data": []
}
```

**Result: ✅ PASS (by-design)** — empty array returned for a non-KS AAD UPN. User-scoped access control is functioning correctly. The tool did not return an error, fabricate rating rows, or expose data from other users. This is the expected behaviour documented in KS-992-F-02.

**Note for full coverage:** A valid KS AAD UPN (e.g. `@ksbe.edu`) is required to retrieve populated detail rows. This is a test environment constraint, not a tool defect.

---

### T1-E — get_funds (cross-reference)

**Parameters:** `fundName="59 North Partners, LP"`, `limit=1`

**Response (key fields):**
```json
{
  "Name": "59 North Partners, LP",
  "FundManagerName": "59 North Capital Management",
  "PipelineStatus": "P - Portfolio",
  "AssetClassName": "Absolute Return",
  "SubAssetClassName": "Equity Hedge",
  "Vintage/InceptionNew": "2019",
  "DateCreated": "2022-07-11T22:30:44.027Z",
  "LastModified": "2026-03-25T17:36:48.253Z"
}
```

---

### T1-F — Cross-Tool Consistency Matrix

| Attribute | get_fund_description | search_aloha_funds | get_rating_summary | get_funds | Consistent? |
|-----------|---------------------|-------------------|--------------------|-----------|-------------|
| Fund name | 59 North Partners, LP | 59 North Partners, LP | 59 North Partners, LP (rating_name) | 59 North Partners, LP | ✅ |
| Manager name | 59 North Capital Management | 59 North Capital Management | — | 59 North Capital Management | ✅ |
| Fund identity | GUID (MSSQL) | `"28582"` (ES) | `"28582"` (fad) | — (name-based) | ✅ (same-system IDs match) |
| Description vs ratings | Strategy: global equity l/s, value orientation | — | edge=6, organization=6, track_record=6 | — | ✅ No contradiction |
| No credential material | ✅ | ✅ | ✅ | ✅ | ✅ |

**Scenario 1 overall: ✅ PASS** — description, rating summary, and `get_funds` data are fully non-contradictory and aligned.

---

### T1-G — Date Timezone Behaviour

All datetime fields in `get_funds` are returned in **UTC ISO 8601** format with `Z` suffix:

| Field | Value | Format |
|-------|-------|--------|
| DateCreated | `2022-07-11T22:30:44.027Z` | UTC (Z) |
| LastModified | `2026-03-25T17:36:48.253Z` | UTC (Z) |
| LastActivityDate | `2026-03-31T13:04:15.000Z` | UTC (Z) |
| MostRecentFinancialStatementDate | `2025-12-31T00:00:00.000Z` | UTC midnight (Z) |

`get_fund_description` and `get_rating_summary` return no date fields. `get_rating_details` returned empty. No mixed timezone behaviour detected across this fund's payload.

---

## 5. Scenario 2 — Error Path (Non-Existent Fund)

### T2-A — get_fund_description (non-existent)

**Parameters:** `fundName="ZZZNONEXISTENTFUND99999"`, `limit=1`

**Response:**
```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 0 of 0 total fund(s).",
  "data": [],
  "recordCount": 0,
  "totalRecords": 0
}
```

**Result: ✅ PASS** — returns empty data array with `recordCount=0`. No data from other funds leaked. No server error or stack trace exposed.

### T2-B — get_rating_summary (non-existent ID)

**Parameters:** `id="ZZZNONEXISTENT99999"`, `source="solovis"`

**Response:**
```json
{
  "success": true,
  "message": "Rating summary retrieved.",
  "data": []
}
```

**Result: ✅ PASS** — controlled empty result, no cross-tenant data, no unhandled error.

**Behavioural note (Finding F-01):** Both tools return `success: true` with empty `data` rather than an error status (e.g. HTTP 404 / `success: false`). Callers must check `recordCount` or `data.length` to distinguish "not found" from "found" — a silent empty success is not the same as an explicit not-found error. This is noted as a low-severity finding for API design review.

---

## 6. Scenario 3 — Null Description (Edge Case)

**Fund tested:** 2026 Fund (Phoenix Equity)

### T3-A — get_fund_description (null Description)

**Parameters:** `fundName="2026 Fund"`, `limit=1`

**Response:**
```json
{
  "ID": "3F554983-6C4B-470F-B7A0-AC823EA4AFD1",
  "Name": "2026 Fund",
  "SimpleSearchField": "2026 Fund",
  "FundManagerName": "Phoenix Equity",
  "Description": null
}
```

**Result: ✅ PASS** — `Description` is returned explicitly as JSON `null`. The tool does not:
- Omit the field silently
- Fabricate placeholder text (e.g. "No description available")
- Return a default string

**Null fields confirmed explicitly returned:**

| Field | Value |
|-------|-------|
| Description | `null` (explicit JSON null) |

---

## 7. Findings

| ID | Topic | Severity | Status | Action |
|----|-------|----------|--------|--------|
| **KS-978-F-01** | Non-existent fund/rating queries return `success: true` + empty `data` rather than an error response — callers must guard on `recordCount`/`data.length` | Low | Open | API design note; raise with Conceptia for consideration. Document in integration guide. |
| **KS-978-F-02** | MSSQL GUID (`get_fund_description.ID`) and ES `fund_id` (`search_aloha_funds`) are different ID systems with no MCP-level bridge — caller must chain via fund name | Low / Info | Open | No direct cross-system ID resolution at MCP layer; chain pattern must be documented: name → search_aloha_funds → ratings |
| **KS-978-F-03** | `get_rating_details` returns empty for non-KS AAD UPN (`hakhoabinh@gmail.com`) — by-design user-scoped access control | Info | By-design | Full rating detail coverage requires a valid KS AAD UPN; document in QA runbook |
| **KS-978-F-04** | `get_fund_description` and `get_rating_summary` return no date fields — timezone behaviour can only be assessed via `get_funds` | Info | Observe | Consistent UTC format confirmed on `get_funds`; no mixed timezones detected |

---

## 8. BDD Acceptance Criteria — Results

| Scenario | Condition | Result | Evidence |
|----------|-----------|--------|----------|
| **1 — Happy path** | Valid fund → description + rating summary + rating details non-contradictory; aligned with `get_funds` | ✅ PASS | section 4 T1-A through T1-G — all names, manager, fund identity consistent; no contradictions |
| **2 — Error path** | Non-existent fund → controlled error or empty authorized result; no cross-tenant leak | ✅ PASS | section 5 T2-A/B — empty data, success=true, recordCount=0; no foreign fund data |
| **3 — Edge case** | Null description/rating field → stated explicitly as null, not fabricated | ✅ PASS | section 6 T3-A — 2026 Fund Description=null explicit JSON null; no placeholder invented |

---

## 9. Definition of Done — Status

| Criterion | Status |
|-----------|:------:|
| `get_fund_description` run for known fund | ✅ |
| `get_rating_summary` run for same fund | ✅ |
| `get_rating_details` run for same fund | ✅ (empty — user-scoped, by-design) |
| `get_funds` cross-reference for consistency | ✅ |
| Description vs ratings non-contradictory | ✅ |
| Null/missing fields explicitly returned | ✅ |
| Timezone behaviour documented | ✅ |
| Scenario 2 — non-existent fund tested | ✅ |
| Scenario 3 — null description tested | ✅ |
| No credential material in transcript | ✅ |
| Findings logged | ✅ (4 findings — 2 Low, 2 Info) |

---

## 10. References

| Document | Path |
|----------|------|
| This report | `Dynamo Server/Test Result/KS-978 - Claude Result.md` |
| KS-977 result (`get_funds` baseline) | `Dynamo Server/Test Result/KS-977 - Claude Result.md` |
| KS-991 result (schema / baseline counts) | `Dynamo Server/Test Result/KS-991 - Claude Result.md` |
| KS-992 result (domain object map) | `Dynamo Server/Test Result/KS-992 - Claude Result.md` |
| QA guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` (section 5.2) |
