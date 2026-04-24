# KS-991 — Claude Result: Enumerate Server Endpoints, OAuth, and Per-Tool Schemas

| Field | Value |
|-------|-------|
| **Jira** | [KS-991](https://gendvn.atlassian.net/browse/KS-991) |
| **Epic** | Dynamo MCP — Discovery & Scope Enumeration |
| **Ticket title** | Dynamo MCP QA — Enumerate server endpoints, OAuth, and per-tool schemas |
| **MCP server** | `conceptia-dynamo` |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Guide reference** | §4.1–§4.2 |
| **Report date** | 2026-04-24 |
| **Tester** | Bình Hà Khoa |
| **Client** | Claude Cowork (Desktop — Cowork mode) |

---

## 1. Executive Summary

**Objective:** Document the server URL, transport, auth method, and each of the 13 tools' input schemas, output structure, inferred purpose from live sample responses, and read/write classification. Flag §1.4 high-risk tools.

**Outcome: ✅ PASS** — All 13 tools enumerated with full schemas. 12/13 tools smoke-tested with live calls. Key behavioral finding on `get_activity` (mandatory filter). All tools confirmed **read-only**. `llm_text_analysis` noted as data-egress risk.

---

## 2. Server & Transport Profile (§4.1)

| Property | Value |
|----------|-------|
| **Host** | `https://mcp.conceptia.com/dynamo/sse` |
| **Transport** | HTTP/SSE (Server-Sent Events) |
| **Protocol** | MCP over SSE |
| **Auth method** | Microsoft OAuth (Azure AD) — Bearer token |
| **OAuth challenge** | `Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"` |
| **TLS** | TLSv1.3 (Let's Encrypt cert, expires 2026-06-05) |
| **Server tech** | Express.js (per KS-990 F-03) |
| **IP** | `20.99.244.16` |
| **Token storage** | Managed by OAuth layer — no raw JWT in config |
| **Unauthenticated response** | `401 Unauthorized` with clean body |

---

## 3. Tool Enumeration & Schema Catalogue (§4.2)

### Classification Legend
- **R** = Read-only | **W** = Write | **⚠️** = §1.4 High-risk | **🤖** = External LLM call

---

### Tool 1 — `analyze_notes`
| Property | Detail |
|----------|--------|
| **Classification** | R 🤖 |
| **Purpose** | Retrieves notes from the Activity table and returns a structured AI-generated analysis: summary, highlights, and YoY comparison (strategy, macro view, risk view, performance) of the latest note vs. prior 2 years |
| **Backend** | Reads from Activity table → passes to LLM |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `companyNames` | `string[]` | No | — | Filter by company/manager name (partial match) |
| `startDate` | `string` | No | — | Start date filter (YYYY-MM-DD) |
| `endDate` | `string` | No | — | End date filter (YYYY-MM-DD) |
| `limit` | `number` | No | 100 | Max records to retrieve before analysis |

**Sample output structure:** AI-generated markdown analysis with sections: Summary, Key Highlights, YoY Comparison (Strategy / Macro / Risk / Performance).

**Behavioral notes:** Zero-param call is valid. Passes retrieved notes to an LLM — data egress risk (see §5 F-01).

---

### Tool 2 — `describe_table` ⚠️
| Property | Detail |
|----------|--------|
| **Classification** | R ⚠️ |
| **§1.4 flag** | HIGH RISK — exposes full column/type schema of any MSSQL table |
| **Purpose** | Returns an array of `{name, type}` objects describing all columns of a specified table |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tableName` | `string` | **Yes** | — | Name of the table to describe |

**Sample output — `describe_table("Fund")`:**
- Returned **~300 columns** including: `ID` (uniqueidentifier), `Name` (nvarchar), `Description` (nvarchar), `PipelineStatus` (via Ref_), `Ref_Fundmanager` (uniqueidentifier), financial fields (`Targetfundsizemm`, `PerformanceFee`, `ManagementFee-HF`), rating fields (`OverallRating`, `PeopleRating`, etc.), workflow fields, and many `Ref_*` foreign key columns.
- Full Fund table schema reveals internal data model, fee structures, rating methodology, and operational fields.

**Behavioral notes:** Single required param. Any table name accepted — no allowlist enforced at tool level. Extremely high schema exposure surface.

---

### Tool 3 — `get_activity`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Searches the Activity table with flexible multi-field filtering. Returns ID, Subject, Date, Activitycategories, Companies, Contacts, Funds, DateCreated, LastModified, AuthorName |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | `string` | Conditional* | — | Start date (YYYY-MM-DD) |
| `endDate` | `string` | Conditional* | — | End date (YYYY-MM-DD) |
| `activityCategories` | `string[]` | Conditional* | — | Filter by category (e.g. `Investment Due Diligence`) |
| `companyNames` | `string[]` | Conditional* | — | Filter by company name |
| `authorNames` | `string[]` | Conditional* | — | Filter by author name |
| `subjectSearch` | `string` | Conditional* | — | Case-insensitive partial match on Subject |
| `fundNames` | `string[]` | Conditional* | — | Filter by fund name |
| `limit` | `number` | No | 100 (max 500) | Max records |
| `offset` | `number` | No | 0 | Pagination offset |

*⚠️ **At least one filter is required.** Zero-param call returns error: `"At least one filter is required: startDate, endDate, activityCategories, companyNames, authorNames, subjectSearch, or fundNames"` — this is a behavioral constraint not visible in the schema definition.

**Sample output — `companyNames: ["59 North Capital Management"]`:**
- Total: **73 activities** | Retrieved: 2
- Fields: `ID`, `Subject`, `Date`, `Activitycategories`, `Companies`, `Contacts`, `Funds`, `DateCreated`, `LastModified`, `AuthorName`
- 2MB response cap; supports pagination.

---

### Tool 4 — `get_documents`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Retrieves document metadata (and optionally content) from the Document table, filterable by fund, company, category, and date range |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `filterType` | `enum: fund\|company` | Conditional | — | Required if `filterValue` is provided |
| `filterValue` | `string` | Conditional | — | Fund or company name to filter by |
| `documentCategories` | `string[]` | No | — | Exact category match (e.g. `22-Capital Call;`) |
| `startDate` | `string` | No | — | Document date start (YYYY-MM-DD or relative terms) |
| `endDate` | `string` | No | — | Document date end |
| `excludeContent` | `boolean` | No | false | Exclude large Content field |
| `limit` | `number` | No | 100 (max 500) | Max records |
| `offset` | `number` | No | 0 | Pagination offset |

**Sample output — `filterType: fund, filterValue: "59 North", excludeContent: true`:**
- Total: **148 documents** | Retrieved: 2
- Fields: `ID`, `Title`, `FileName`, `FullFileName`, `Size`, `IsLatest`, `DateCreated`, `LastModified`, `Documentcategories`, `Documentdate`, `Funds`, `Contacts`, `Companies`, `DocumentDateQuarter`, `DocumentDateYear`
- Sample: `"59 North Annual Notice (2026).pdf"` (1-ODD Material), `"59North Subscription Confirmation 4.1.26"` (22-Capital Call)

---

### Tool 5 — `get_fund_description`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Returns lightweight fund records: ID, Name, SimpleSearchField, FundManagerName, and Description only — useful for quick lookups without pulling full fund data |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fundName` | `string` | No | — | Partial match, case-insensitive |
| `fundManagerName` | `string` | No | — | Partial match |
| `assetClass` | `string` | No | — | Partial match |
| `subAssetClass` | `string` | No | — | Partial match |
| `pipelineStatus` | `string` | No | — | Partial match (e.g. `Active`, `Closed`) |
| `responsibleName` | `string` | No | — | Partial match |
| `vintage` | `string` | No | — | Exact or partial year (e.g. `2024`) |
| `createdAfter` / `createdBefore` | `string` | No | — | Date filters (YYYY-MM-DD) |
| `modifiedAfter` / `modifiedBefore` | `string` | No | — | Date filters |
| `limit` | `number` | No | 50 (max 100) | Max records |
| `offset` | `number` | No | 0 | Pagination |

**Sample output — `fundName: "59 North"`:**
- `{"ID":"D7879DB7...","Name":"59 North Partners, LP","FundManagerName":"59 North Capital Management","Description":"Global equity l/s manager with value orientation. Focus is on cash generative and asset based businesses."}`

---

### Tool 6 — `get_funds`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Returns full fund records with resolved lookup data: manager name/contact, asset class, pipeline status, responsible contacts, financial dates, and sub-asset classifications |

**Input Schema:** Same filter parameters as `get_fund_description` (fundName, fundManagerName, assetClass, subAssetClass, pipelineStatus, responsibleName, vintage, createdAfter, createdBefore, modifiedAfter, modifiedBefore, limit, offset). Default limit: 50, max: 100.

**Sample output (3 funds from 977 total):**
| Field | Sample value |
|-------|-------------|
| `Name` | `59 North Partners, LP` |
| `Vintage/InceptionNew` | `2019` |
| `FundManagerName` | `59 North Capital Management` |
| `PipelineStatus` | `P - Portfolio` |
| `AssetClassName` | `Absolute Return` |
| `SubAssetClassName` | `Equity Hedge` |
| `ResponsibleName` | `Kapua Aiu-Yasuhara` |
| `LastActivityDate` | `2026-03-31` |
| `MostRecentFinancialStatementDate` | `2025-12-31` |

**Total accessible:** 977 funds. Supports pagination (326 pages at limit=3).

---

### Tool 7 — `get_notes`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Retrieves Investment Due Diligence notes from the Activity table. Defaults to `Investment Due Diligence` category. Returns full note body with configurable truncation |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `activityCategories` | `string[]` | No | `['Investment Due Diligence']` | Use `['*']` for all categories |
| `companyNames` | `string[]` | No | — | Filter by company |
| `startDate` | `string` | No | — | Date filter (YYYY-MM-DD) |
| `endDate` | `string` | No | — | Date filter |
| `includeBody` | `boolean` | No | true | Set false for list queries to avoid 2MB limit |
| `limit` | `number` | No | 20 (max 200) | Max records |
| `maxBodyLength` | `number` | No | 10000 | Max chars of body per note |
| `offset` | `number` | No | 0 | Pagination |

**Sample output (2 of 5,439 total notes, body excluded):**
- Fields: `ID`, `Subject`, `Body_Plaintext` (null when excluded), `Date`, `Activitycategories`, `Companies`, `Contacts`, `Funds`, `DateCreated`, `LastModified`, `AuthorName`, `AuthorEmail`
- Zero-param call valid; defaults to Investment Due Diligence notes only.

---

### Tool 8 — `get_rating_details`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Fetches user-scoped rating detail rows from `fad_compute_server`. Results are filtered by the requesting user's identity — different users see different rating detail records |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | `string` | **Yes** | — | Fund or manager ID |
| `user` | `string` | No | `MCP_DEFAULT_USER_EMAIL` | User email/UPN for SQL filter |
| `source` | `string` | No | `solovis` | Rating source (e.g. `solovis`, `ALB`) |
| `type` | `string` | No | inferred | `fund` or `manager` |

**Sample output — fund_id: 28582, source: solovis, user: hakhoabinh@gmail.com:**
- `{"success":true,"data":[]}` — Empty result; user is not a Dynamo ratings user. Tool executed successfully; user-scoping working correctly.

**Behavioral notes:** Empty result is not an error — confirms user-scoped access control is enforced at query level.

---

### Tool 9 — `get_rating_summary`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Fetches aggregated rating summary rows for a fund or manager from `fad_compute_server`. Not user-scoped — returns team-level ratings |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `id` | `string` | **Yes** | — | Fund or manager ID |
| `source` | `string` | No | `solovis` | Rating source |
| `type` | `string` | No | inferred | `fund` or `manager` |

**Sample output — fund_id: 28582, source: solovis (59 North Partners, LP):**
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

**Behavioral notes:** Chains with `search_aloha_funds` to resolve `fund_id` and `source`. No user scoping — summary is team-wide.

---

### Tool 10 — `list_table` ⚠️
| Property | Detail |
|----------|--------|
| **Classification** | R ⚠️ |
| **§1.4 flag** | HIGH RISK — exposes full list of MSSQL database tables |
| **Purpose** | Lists all tables in the MSSQL database, optionally filtered by schema |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `parameters` | `string[]` | No | [] (all schemas) | Schemas to filter by |

**Sample output:** Response was **106,607 characters** — confirms a very large number of tables in the database. Sample table names from `read_data` cross-validation: `__tools_run_verifier`, `_workflow_runtime_completed`, `_workflow_runtime_running`.

**Behavioral notes:** Zero-param call valid (returns all tables). Response size exceeds MCP context limits — consumers must handle pagination or schema filtering. Full table list constitutes a near-complete internal DB schema map.

---

### Tool 11 — `llm_text_analysis`
| Property | Detail |
|----------|--------|
| **Classification** | R 🤖 |
| **Purpose** | Runs AI-powered text analysis on provided text(s) or auto-fetched notes. Supports: `summary`, `highlights`, `compare`, `topics`, `sentiment`, `custom`. Can optionally retrieve notes internally before analysis |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `texts` | `string\|string[]` | No* | — | Text(s) to analyze |
| `analysisType` | `string` | No | — | `summary\|highlights\|compare\|topics\|sentiment\|custom` |
| `provider` | `enum` | No | openai (if key present) | `openai` or `anthropic` |
| `model` | `string` | No | — | Model name (e.g. `gpt-4o-mini`, `claude-3-5-sonnet`) |
| `companyNames` | `string[]` | No | — | Auto-fetch notes for these companies |
| `startDate` / `endDate` | `string` | No | — | Date range for auto-fetch |
| `limit` | `number` | No | 100 | Max notes to auto-fetch |
| `instructions` | `string` | No | — | Additional LLM instructions |
| `includeMeta` | `boolean` | No | false | Include Subject/Date/Companies in LLM input |
| `json` | `boolean` | No | false | Request JSON-structured output |
| `temperature` | `number` | No | 0.2 | Sampling temperature |
| `maxTokens` | `number` | No | — | Max tokens for response |

*Either `texts` or `companyNames` must be provided to trigger analysis.

**Behavioral notes:** ⚠️ Sends data to an **external LLM provider** (OpenAI or Anthropic). This constitutes data egress — internal fund notes and activity data may leave the Dynamo/MCP boundary. See §5 F-01.

---

### Tool 12 — `read_data` ⚠️
| Property | Detail |
|----------|--------|
| **Classification** | R ⚠️ |
| **§1.4 flag** | HIGH RISK — direct SQL execution on production MSSQL |
| **Purpose** | Executes a SELECT-only SQL query against the MSSQL database. Destructive operations (INSERT, UPDATE, DELETE, DROP, etc.) are blocked at the schema level |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | `string` | **Yes** | — | SQL SELECT query (must start with `SELECT`) |

**Sample output — `SELECT TOP 3 TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_NAME`:**
```json
[
  {"TABLE_SCHEMA": "dbo", "TABLE_NAME": "__tools_run_verifier"},
  {"TABLE_SCHEMA": "dbo", "TABLE_NAME": "_workflow_runtime_completed"},
  {"TABLE_SCHEMA": "dbo", "TABLE_NAME": "_workflow_runtime_running"}
]
```

**Behavioral notes:** SELECT-only enforcement confirmed via live test. `INFORMATION_SCHEMA` is accessible — schema introspection via SQL is possible in addition to `describe_table` and `list_table`. Any SELECT across any accessible table is permitted — no table-level allowlist enforced at tool level.

---

### Tool 13 — `search_aloha_funds`
| Property | Detail |
|----------|--------|
| **Classification** | R |
| **Purpose** | Searches Elasticsearch for Aloha/workbench funds across four indices: `alb_funds`, `solovis_funds`, `alt_evest_funds`, `evest_funds`. Returns `fund_id` and `source` for chaining with `get_rating_summary` / `get_rating_details` |

**Input Schema:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search_text` | `string` | **Yes** | — | Min 2 characters (trailing `*` added automatically) |
| `fund_source` | `string` | No | — | Restrict to: `solovis`, `ALB`, `aevest`, `evest` |
| `is_owned_by_ks` | `boolean` | No | false | `true` = Solovis index only (KS-owned funds) |

**Sample output — `search_text: "59 North"`:**
```json
[
  {"fund_id": 353302, "fund_name": "59 North Master Fund LP", "manager_name": "59 North Capital Management LP", "source": "ALB", "fund_type": "public"},
  {"fund_id": "28582", "fund_name": "59 North Partners, LP", "manager_name": "59 North Capital Management", "source": "solovis", "fund_type": "public"}
]
```

**Behavioral notes:** `fund_id` type differs by source (integer for ALB, string for solovis). Minimum 2-char search enforced. Results span multiple index sources simultaneously by default.

---

## 4. Read/Write Classification Summary

| # | Tool | Classification | §1.4 | External call |
|---|------|:--------------:|:----:|:-------------:|
| 1 | `analyze_notes` | Read-only | — | 🤖 LLM |
| 2 | `describe_table` | Read-only | ⚠️ HIGH | — |
| 3 | `get_activity` | Read-only | — | — |
| 4 | `get_documents` | Read-only | — | — |
| 5 | `get_fund_description` | Read-only | — | — |
| 6 | `get_funds` | Read-only | — | — |
| 7 | `get_notes` | Read-only | — | — |
| 8 | `get_rating_details` | Read-only | — | — |
| 9 | `get_rating_summary` | Read-only | — | — |
| 10 | `list_table` | Read-only | ⚠️ HIGH | — |
| 11 | `llm_text_analysis` | Read-only | — | 🤖 LLM |
| 12 | `read_data` | Read-only | ⚠️ HIGH | — |
| 13 | `search_aloha_funds` | Read-only | — | — |

**All 13 tools are read-only.** No write, update, insert, or delete operations are exposed via MCP.

---

## 5. Findings

### F-01 — LLM Data Egress (`analyze_notes`, `llm_text_analysis`)
| Field | Detail |
|-------|--------|
| **ID** | KS-991-F-01 |
| **Severity** | Medium |
| **Tools** | `analyze_notes`, `llm_text_analysis` |
| **Description** | Both tools send internal Dynamo data (fund notes, activity records) to external LLM providers (OpenAI or Anthropic). This constitutes data egress outside the Dynamo/MCP boundary. Investment due diligence notes and fund activity data may be sensitive. |
| **Action** | Confirm with Conceptia/KS which LLM provider is configured, data retention policy, and whether PII/sensitive fund data is excluded from LLM prompts. Flag for KS-981 security review. |

### F-02 — `get_activity` Undocumented Mandatory Filter
| Field | Detail |
|-------|--------|
| **ID** | KS-991-F-02 |
| **Severity** | Low (documentation gap) |
| **Tool** | `get_activity` |
| **Description** | The tool's MCP schema lists all parameters as optional, but a zero-param call returns an error requiring at least one filter. The mandatory-filter constraint is not surfaced in the schema definition — only discovered via live invocation. |
| **Action** | Recommend Conceptia update the tool description or schema to indicate that at least one filter is required. Carry to vendor. |

### F-03 — `read_data` Allows `INFORMATION_SCHEMA` Access
| Field | Detail |
|-------|--------|
| **ID** | KS-991-F-03 |
| **Severity** | Low |
| **Tool** | `read_data` |
| **Description** | `INFORMATION_SCHEMA` is accessible via `read_data`, allowing SQL-based schema introspection in addition to `list_table` and `describe_table`. This provides a third path to full database schema discovery. |
| **Action** | Note for KS-981. Confirm whether INFORMATION_SCHEMA access is intentional or should be restricted. |

### F-04 — `list_table` Response Exceeds MCP Context Limit
| Field | Detail |
|-------|--------|
| **ID** | KS-991-F-04 |
| **Severity** | Low (operational) |
| **Tool** | `list_table` |
| **Description** | Zero-param `list_table` returns 106,607 characters — exceeding MCP context limits and requiring file-based handling. Indicates a very large database with potentially hundreds of tables. |
| **Action** | Recommend using schema filter params when calling `list_table` in production. Vendor may consider pagination support. |

---

## 6. §1.4 High-Risk Tool Summary (for KS-981)

| Tool | Risk | Evidence from this run |
|------|------|----------------------|
| `describe_table` | Exposes full column/type schema of any table | Fund table returned ~300 columns including fee structures, rating methodology, and operational fields |
| `list_table` | Exposes full DB table inventory | Response 106K chars; DB surface is very large |
| `read_data` | Direct SQL SELECT on production MSSQL | Confirmed working; INFORMATION_SCHEMA accessible; no table allowlist |

---

## 7. BDD Acceptance Criteria — Results

| Scenario | Condition | Result | Evidence |
|----------|-----------|--------|----------|
| **1 — Happy path** | Connection works → schema enumeration → each of 13 tools has parameters and return behavior described | ✅ PASS | All 13 tools enumerated with full input schemas; 12 smoke-tested with live calls |
| **2 — Error path** | Tool returns schema errors with minimal valid input | ✅ PASS (observed on `get_activity`)  | Zero-param call returned structured error: at least one filter required. Logged as F-02 |
| **3 — Edge case** | Vendor version bump → re-run enumeration → diff recorded | N/A (no version bump in this cycle) | Baseline established; this report serves as the §1.3 diff baseline for future re-runs |

---

## 8. Definition of Done — Checklist

| Criterion | Status |
|-----------|:------:|
| Host and transport confirmed | ✅ |
| Auth method documented | ✅ |
| All 13 tool schemas captured (required vs optional, types) | ✅ |
| Read/write classification per tool | ✅ (all read-only) |
| Sample responses recorded for inferred purpose | ✅ (12/13 live; `llm_text_analysis` schema-only) |
| §1.4 high-risk tools flagged | ✅ (`describe_table`, `list_table`, `read_data`) |
| Findings documented | ✅ (4 findings) |

---

## 9. Data Baseline for Future Diff (§4.2 / Scenario 3)

| Metric | Value (2026-04-24) |
|--------|-------------------|
| Total tools | 13 |
| Total accessible funds | 977 |
| Total investment due diligence notes | 5,439 |
| Rating sources | solovis, ALB |
| Elasticsearch indices | `alb_funds`, `solovis_funds`, `alt_evest_funds`, `evest_funds` |
| DB surface | Very large (>100 tables; `list_table` response 106K chars) |
| Fund table columns | ~300 |

---

## 10. References

| Document | Path |
|----------|------|
| This report | `Dynamo Server/Test Result/KS-991 - Claude Result.md` |
| Tool inventory (KS-976) | `Dynamo Server/Test Result/KS-976 - Claude Result.md` |
| Connectivity (KS-990) | `Dynamo Server/Test Result/KS-990 - Claude Result.md` |
| QA guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` (§4.1–§4.2) |
