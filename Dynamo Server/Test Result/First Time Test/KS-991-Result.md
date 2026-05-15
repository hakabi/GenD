# KS-991 — Dynamo MCP QA: Server Endpoints, OAuth, and Per-Tool Schema Enumeration
**Re-run Report (7-Tool Baseline)**
**Jira:** [KS-991](https://gendvn.atlassian.net/browse/KS-991) | **Epic:** Dynamo MCP — Discovery & Scope Enumeration
**Test Date:** 2026-05-07
**Tester:** Claude (Cowork Mode)
**Target:** `https://mcp.conceptia.com/dynamo/sse`
**Connector prefix:** `0c5a3b61-86e4-4c75-b19f-40c0141fb861`

---

## Re-Run Context

This report is a **re-run** against the current deployed baseline. The original enumeration (section 4.1–4.2) documented 13 tools. A tool-inventory re-verification performed on 2026-05-07 (ref: KS-976 comment ID 20208) found that 6 tools have been removed from the server and 2 remaining tools gained new parameters. This report documents the current state.

**Version diff summary:**

| Tool | Original Status | Current Status |
|------|----------------|----------------|
| `get_funds` | Available | Available |
| `get_fund_description` | Available | Available |
| `get_notes` | Available | Available |
| `get_activity` | Available | **Available — 3 new params added** |
| `get_documents` | Available | **Available — 3 new params added** |
| `analyze_notes` | Available | Available |
| `llm_text_analysis` | Available | Available |
| `list_table` | Available (section 1.4 HIGH) | **Removed** |
| `describe_table` | Available (section 1.4 HIGH) | **Removed** |
| `read_data` | Available (section 1.4 HIGH) | **Removed** |
| `search_aloha_funds` | Available | **Removed** |
| `get_rating_details` | Available | **Removed** |
| `get_rating_summary` | Available | **Removed** |

---

## Section 4.1 — Server Endpoint & Transport

| Property | Value |
|----------|-------|
| **Host URL** | `https://mcp.conceptia.com/dynamo/sse` |
| **Transport** | HTTP + Server-Sent Events (SSE) |
| **Auth method** | OAuth 2.0 bearer token via Cowork connector |
| **Proxy layer** | Reverse proxy with IP allowlist — all external direct HTTP requests return `403 Forbidden` with `X-Proxy-Error: blocked-by-allowlist` |
| **TLS** | TLS enforced; HTTP redirects to HTTPS (confirmed in KS-988) |
| **Total tools registered** | 7 (down from 13 at original enumeration) |

---

## Section 4.2 — Per-Tool Schema Enumeration

### Tool 1: `get_funds`

| Property | Value |
|----------|-------|
| **Purpose** | Retrieve fund records from the Fund table with resolved lookup data |
| **Classification** | Read-only |
| **Requires at least one filter** | No — all params optional |
| **Default limit / max** | 50 / 100 |
| **Total records in DB** | 975 |

**Input parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fundName` | string | No | Partial match, case-insensitive |
| `fundManagerName` | string | No | Partial match |
| `assetClass` | string | No | Partial match |
| `subAssetClass` | string | No | Partial match |
| `pipelineStatus` | string | No | Partial match (e.g., `Active`, `Closed`) |
| `responsibleName` | string | No | Partial match |
| `vintage` | string | No | Exact or partial year (e.g., `2024`) |
| `createdAfter` | string | No | YYYY-MM-DD |
| `createdBefore` | string | No | YYYY-MM-DD |
| `modifiedAfter` | string | No | YYYY-MM-DD |
| `modifiedBefore` | string | No | YYYY-MM-DD |
| `limit` | number | No | Default 50, max 100 |
| `offset` | number | No | Default 0, max 1,000,000 |

**Output fields (confirmed from live sample):**
`Name`, `Vintage/InceptionNew`, `DateCreated`, `LastModified`, `ResponsibleName`, `SecondaryResponsibleName`, `LastActivityDate`, `LastActivitySubject`, `FundManagerName`, `FundManagerPrimaryContactName`, `PipelineStatus`, `AssetClassName`, `SubAssetClassName`, `SubAssetClass2Name`, `SubAssetClass3Name`, `AuditorName`, `FundLiquidityTypeName`, `MostRecentFinancialStatementDate`

**Response envelope fields:** `success`, `message`, `data[]`, `recordCount`, `totalRecords`, `offset`, `limit`, `hasMore`, `wasTruncated`, `approximateSizeMB`, `pagination` (`currentPage`, `totalPages`, `nextOffset`)

---

### Tool 2: `get_fund_description`

| Property | Value |
|----------|-------|
| **Purpose** | Retrieve fund descriptions — lighter projection of Fund table (ID, Name, SimpleSearchField, FundManagerName, Description only) |
| **Classification** | Read-only |
| **Requires at least one filter** | No |
| **Default limit / max** | 50 / 100 |
| **Total records in DB** | 975 |

**Input parameters:** Identical filter set to `get_funds` (fundName, fundManagerName, assetClass, subAssetClass, pipelineStatus, responsibleName, vintage, createdAfter, createdBefore, modifiedAfter, modifiedBefore, limit, offset).

**Output fields (confirmed from live sample):**
`ID`, `Name`, `SimpleSearchField`, `FundManagerName`, `Description`

**Note:** `Description` field returned `null` for the test record, indicating this field is sparsely populated.

---

### Tool 3: `get_notes`

| Property | Value |
|----------|-------|
| **Purpose** | Retrieve activity notes from the Activity table; defaults to `Investment Due Diligence` category |
| **Classification** | Read-only |
| **Requires at least one filter** | No |
| **Default limit / max** | 20 / 200 |
| **Total records in DB** | 5,454 |

**Input parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyNames` | string[] | No | Partial match against Companies field |
| `activityCategories` | string[] | No | Defaults to `['Investment Due Diligence']`; use `['*']` for all |
| `startDate` | string | No | YYYY-MM-DD |
| `endDate` | string | No | YYYY-MM-DD |
| `includeBody` | boolean | No | Default true; set false to suppress Body_Plaintext |
| `maxBodyLength` | number | No | Default 10,000 chars; truncates Body to this length |
| `limit` | number | No | Default 20, max 200 |
| `offset` | number | No | Default 0 |

**Output fields (confirmed from live sample):**
`ID`, `Subject`, `Body_Plaintext`, `Date`, `Activitycategories`, `Companies`, `Contacts`, `Funds`, `DateCreated`, `LastModified`, `AuthorName`, `AuthorEmail`

---

### Tool 4: `get_activity`

| Property | Value |
|----------|-------|
| **Purpose** | Search Activity table with broader filter set including author and fund name filters (superset of `get_notes`) |
| **Classification** | Read-only |
| **Requires at least one filter** | **Yes** — at least one of: startDate, endDate, activityCategories, companyNames, authorNames, subjectSearch, fundNames |
| **Default limit / max** | 100 / 500 |
| **Total records in DB** | 6,961 (all categories; larger than get_notes 5,454 because not category-filtered) |

**Input parameters:**

| Parameter | Type | Required | New? | Description |
|-----------|------|----------|------|-------------|
| `startDate` | string | Conditional | No | YYYY-MM-DD |
| `endDate` | string | Conditional | No | YYYY-MM-DD |
| `activityCategories` | string[] | Conditional | No | Array of category names |
| `companyNames` | string[] | Conditional | No | Partial match against Companies field |
| `authorNames` | string[] | Conditional | **NEW** | Filter by activity author name(s) |
| `subjectSearch` | string | Conditional | **NEW** | Case-insensitive partial match on Subject field |
| `fundNames` | string[] | Conditional | **NEW** | Filter by fund name(s) associated with activity |
| `limit` | number | No | No | Default 100, max 500 |
| `offset` | number | No | No | Default 0 |

**Output fields (confirmed from live sample):**
`ID`, `Subject`, `Date`, `Activitycategories`, `Companies`, `Contacts`, `Funds`, `DateCreated`, `LastModified`, `AuthorName`

**Note:** Unlike `get_notes`, `get_activity` does not return `Body_Plaintext`, `AuthorEmail`, or support `includeBody`/`maxBodyLength` controls.

---

### Tool 5: `get_documents`

| Property | Value |
|----------|-------|
| **Purpose** | Retrieve document records from the Document table |
| **Classification** | Read-only |
| **Requires at least one filter** | Yes — filterType+filterValue, documentCategories, or date range |
| **Default limit / max** | 100 / 500 |
| **Total records in DB** | 0 returned for test filter (fund "2026 Fund") — indicates sparse association |

**Input parameters:**

| Parameter | Type | Required | New? | Description |
|-----------|------|----------|------|-------------|
| `filterType` | enum (fund\|company) | Conditional | **NEW** | Scope filter to a fund or company |
| `filterValue` | string | Conditional | **NEW** | The fund or company name value |
| `documentCategories` | string[] | Conditional | No | Exact match on category (e.g., `22-Capital Call;`) |
| `startDate` | string | Conditional | No | YYYY-MM-DD or relative term (e.g., `last month`) |
| `endDate` | string | Conditional | No | YYYY-MM-DD or relative term |
| `excludeContent` | boolean | No | **NEW** | Default false; set true to suppress Content field |
| `limit` | number | No | No | Default 100, max 500 |
| `offset` | number | No | No | Default 0 |

**Output fields (schema-inferred; 0 records returned from test query):**
`Title`, `FileName`, `Documentcategories`, `Documentdate`, `Funds`, `Companies`, `Content` (excluded if `excludeContent=true`)

---

### Tool 6: `analyze_notes`

| Property | Value |
|----------|-------|
| **Purpose** | Retrieve activity notes and produce server-side LLM analysis: summary, highlights, and temporal comparison (latest vs prior 2 years) |
| **Classification** | Read-only — LLM-mediated (internal server LLM; no external provider selection exposed) |
| **Requires at least one filter** | No |
| **Default limit / max** | 100 / (undocumented) |
| **Section 1.4 flag** | Not flagged (no schema/table exposure) |

**Input parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyNames` | string[] | No | Partial match filter on Companies field |
| `startDate` | string | No | YYYY-MM-DD |
| `endDate` | string | No | YYYY-MM-DD |
| `limit` | number | No | Default 100 |

**Output:** Structured analysis including: summary, highlights, comparison of latest note vs notes from previous 2 years (strategy, macro view, risk view, performance). Exact structure is LLM-generated prose.

**Security note:** This tool generates large responses (598,857 chars observed in Stage 3 at limit=100, ref: STRESS-F04). It also acts as a prompt-injection surface — covered in PIJ-REC suite (Addendum B).

---

### Tool 7: `llm_text_analysis`

| Property | Value |
|----------|-------|
| **Purpose** | Run configurable LLM analysis on provided text(s) or fetched notes; supports summary, highlights, compare, topics, sentiment, custom analysis types |
| **Classification** | Read-only — LLM-mediated (externalizes to **OpenAI** or **Anthropic**; configurable via `provider` param) |
| **Requires at least one filter** | No (but texts or note filters needed for meaningful output) |
| **Default limit / max** | 100 / (undocumented) |
| **Section 1.4 flag** | Not flagged (no schema/table exposure) |

**Input parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `analysisType` | string | No | `summary`, `highlights`, `compare`, `topics`, `sentiment`, `custom` |
| `texts` | string or string[] | No | Direct text(s) to analyze |
| `companyNames` | string[] | No | Fetch notes for these companies before analysis |
| `startDate` | string | No | YYYY-MM-DD |
| `endDate` | string | No | YYYY-MM-DD |
| `limit` | number | No | Default 100 |
| `provider` | enum (openai\|anthropic) | No | Default: openai if OPENAI_API_KEY present, else anthropic |
| `model` | string | No | Override model name |
| `temperature` | number | No | Default 0.2 |
| `maxTokens` | number | No | Provider-specific |
| `includeMeta` | boolean | No | Include Subject/Date/Companies headers in LLM input; default false |
| `json` | boolean | No | Request JSON-structured output from LLM |
| `instructions` | string | No | Additional instructions to LLM |

**Output:** LLM-generated analysis text (or JSON if `json=true`) based on `analysisType`.

**Security notes:**
- `provider=anthropic` routes analysis traffic to Anthropic's API; `provider=openai` routes to OpenAI.
- The `instructions` parameter allows arbitrary instructions to the upstream LLM — primary prompt injection surface (covered in PIJ-REC suite).
- Hard timeout at 180 seconds at limit=100 without filtering (ref: STRESS-F05).

---

## BDD Scenario Outcomes

### Scenario 1 — Happy path
**Given** connection works, **When** the tester runs the schema enumeration prompt, **Then** each of 13 tools has parameters and return behavior described.

**Outcome: PARTIAL PASS**
7 of the original 13 tools have been enumerated with full parameter tables and confirmed live responses. 6 tools are no longer registered on the server and cannot be enumerated (they are documented as Removed). The 7 remaining tools all returned valid responses on live calls.

### Scenario 2 — Error path
**Given** a tool returns schema errors, **When** invoked with minimal valid input, **Then** defect is logged with request/response redacted.

**Outcome: TRIGGERED (1 tool)**
`get_activity` returned `{"success":false,"message":"At least one filter is required: startDate, endDate, activityCategories, companyNames, authorNames, subjectSearch, or fundNames"}` when invoked with no parameters. This is correct enforced validation behavior, not a defect. The error is sanitised (no internal details). On retry with `startDate=2026-01-01`, the tool returned 6,961 records correctly.

### Scenario 3 — Edge case (version bump / schema drift)
**Given** vendor provides version bump, **When** deployment completes, **Then** enumeration is re-run and diff is recorded.

**Outcome: TRIGGERED**
This entire report is the re-run triggered by the observed schema drift:

- **6 tools removed:** `list_table`, `describe_table`, `read_data`, `search_aloha_funds`, `get_rating_details`, `get_rating_summary`
- **2 tools gained new parameters:**
  - `get_activity` added: `authorNames[]`, `fundNames[]`, `subjectSearch`
  - `get_documents` added: `filterType`, `filterValue`, `excludeContent`
- **All 6 new parameters on the 2 modified tools have been security-tested** via the RECALL suite (Addendum B, ref: Final-Security-Report.md v1.2) — all passed SQL injection and parameter boundary tests.

---

## Consolidated Findings

| Finding | Tool | Description | Status |
|---------|------|-------------|--------|
| ENUM-F01 | `get_activity` | Requires at least one filter; unfiltered call returns validation error — correct behaviour, documented here | Informational |
| ENUM-F02 | 6 removed tools | `list_table`, `describe_table`, `read_data`, `search_aloha_funds`, `get_rating_details`, `get_rating_summary` no longer registered — positive security posture change; section 1.3 inventory needs update | Informational |
| ENUM-F03 | `get_activity`, `get_documents` | 6 new parameters added since original enumeration; security tests confirm all pass injection and boundary checks | Informational |
| ENUM-F04 | `get_fund_description` | `Description` field sparsely populated (null for test record) — may affect downstream analysis tools | Low |

---

## Recommendations

**Update section 1.3 canonical tool inventory** from 13 tools to 7, with the 6 removed tools noted as `Removed — server not registering` with a status date of 2026-05-07.

**Confirm removal intent with Conceptia** — determine whether the 6 removals are permanent production hardening or a deployment gap. If permanent, close FINDING-04 (read_data schema exposure) as remediated.

**Re-test `get_documents`** with a broader fund/company filter to confirm the Content field structure — the test query returned 0 records and the Content output format has not been observed in this re-run.

**Flag `get_activity` mandatory-filter requirement** in the testing guide — callers must provide at least one filter or the tool returns an error. This differs from all other read tools.

---

*End of KS-991 re-run report. Original enumeration: 13 tools. Current baseline: 7 tools.*
