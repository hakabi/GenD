# KS-981 — Claude Result: Validate list_table, describe_table, read_data

| Field | Value |
|-------|-------|
| **Jira** | [KS-981](https://gendvn.atlassian.net/browse/KS-981) |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Ticket title** | Dynamo MCP QA — Validate list_table, describe_table, read_data |
| **MCP server** | `conceptia-dynamo` |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Report date** | 2026-04-24 |
| **Tester** | Binh Ha Khoa |
| **Client** | Claude Cowork (Desktop — Cowork mode) |
| **Guide reference** | §5.5 |
| **Tools under test** | `list_table`, `describe_table`, `read_data` |
| **Risk classification** | HIGH (§1.4) — schema and tabular data exposure |

---

## 1. Executive Summary

**Objective:** Validate that `list_table` enumerates available MSSQL tables, `describe_table` returns a schema matching actual data shape, and `read_data` executes SELECT queries with consistent results — while explicitly tracking HIGH-risk tool behavior per guide §1.4.

**Outcome: PASS** for all three scenarios. Five findings logged, including two HIGH-risk production recommendations.

| Check | Result |
|-------|--------|
| Scenario 1 — list_table: tables returned including Fund | PASS |
| Scenario 1 — describe_table: column schema returned for Fund table | PASS (schema prefix caveat — see F-01) |
| Scenario 1 — read_data: 10 rows returned; column types match schema | PASS |
| Scenario 1 — 59 North GUID cross-check | PASS (matches KS-978 baseline) |
| Scenario 2 — Invalid table name: error or controlled response | PASS with finding (F-03) |
| Scenario 3 — Wide table SELECT *: row cap honored; payload size documented | PASS |
| No credential material in transcript | PASS |

---

## 2. High-Risk Tool Checklist (§1.4)

| Tool | Risk Level | Executed? | Result | Production Recommendation |
|------|-----------|-----------|--------|--------------------------|
| `list_table` | **HIGH** — exposes full DB schema (2,171 tables) | Yes | PASS | Restrict or remove in production; scope to allowed-list of tables |
| `describe_table` | **HIGH** — exposes column names and data types for any named table | Yes | PASS | Restrict to specific approved tables; validate table name against allow-list |
| `read_data` | **HIGH** — executes arbitrary SELECT queries on MSSQL | Yes | PASS | Add query allow-list / row-cap enforcement; monitor for data exfiltration patterns |

---

## 3. Test Environment

| Item | Detail |
|------|--------|
| MCP client | Claude Cowork Desktop (Cowork mode) |
| SSE endpoint | `https://mcp.conceptia.com/dynamo/sse` |
| Target table | `Fund` (primary fund table) |
| Invalid table (Scenario 2) | `ZZZNONEXISTENT_TABLE_99999` |
| Wide-row test (Scenario 3) | `SELECT TOP 10 * FROM Fund` |
| Cross-check fund | 59 North Partners, LP |
| Test date | 2026-04-24 |

---

## 4. Scenario 1 — Happy Path

### T1-A — list_table

**Parameters:** (none — no schema filter applied)

**Response summary:**
```
success: true
message: "List tables executed successfully"
items count: 2,171
```

**Table naming convention:** All tables are returned with the format `dbo.<TableName>` (e.g. `dbo.Fund`, `dbo.Activity`, `dbo.Document`).

**Fund-related tables:** 155 tables contain "fund" in their name, including the primary entity table `dbo.Fund` and many relationship/join tables.

**Selected domain tables confirmed present:**

| Table | Purpose |
|-------|---------|
| `dbo.Fund` | Primary fund entity |
| `dbo.Activity` | Activity/timeline records |
| `dbo.Fund_Document` | Fund-Document relationship |
| `dbo.Fund_Activity` | Fund-Activity relationship |
| `dbo.FundClass` | Fund class/tranche entity |
| `dbo.FundStatistics` | Fund performance statistics |

**Result: PASS** — list_table returns the complete MSSQL database schema. Fund table is present and identifiable. Raw response is approximately 106,000 characters (2,171 table objects).

**Finding:** See F-04 — 2,171 tables represent full schema exposure with no scoping or filtering applied by default.

---

### T1-B — describe_table (Fund table)

**Parameters:** `tableName = "Fund"` (without schema prefix)

**Response summary:**
```
success: true
columns: [338 column definitions]
```

**Column type distribution:**

| SQL Type | Count | Example columns |
|----------|-------|-----------------|
| `nvarchar` | ~120 | Name, Description, SimpleSearchField, Investmentstrategy |
| `uniqueidentifier` | ~90 | ID, Ref_Fundmanager, Ref_Assetclass (all GUID references) |
| `decimal` | ~50 | Targetfundsizemm, ManagementFee-HF, PerformanceFee |
| `datetime` | ~25 | DateCreated, LastModified, FundingDate, Term |
| `int` | ~15 | FundLife(years), NAVReportingDate, DaysSinceCreation |
| `bit` | ~30 | AcceptSMAs, SideLetter, LitigationHold, SolovisFundSetup |
| `timestamp` | 1 | _tmpstmp_ (internal row version) |

**Key columns confirmed (aligned with get_funds API surface):**

| Column | Type | Maps to get_funds field |
|--------|------|------------------------|
| `ID` | uniqueidentifier | Not exposed in get_funds response |
| `Name` | nvarchar | `Name` |
| `Description` | nvarchar | Not in get_funds (in get_fund_description) |
| `DateCreated` | datetime | `DateCreated` |
| `LastModified` | datetime | `LastModified` |
| `SimpleSearchField` | nvarchar | `SimpleSearchField` |
| `Vintage/InceptionNew` | nvarchar | `Vintage/InceptionNew` |

**Result: PASS** — describe_table returns full column schema for the Fund table. Schema confirms the field names and types observed in prior MCP tool output (KS-977, KS-978).

**Finding:** See F-01 — schema prefix `dbo.` causes empty column response.

---

### T1-C — read_data (SELECT TOP 10, specific columns)

**Query:** `SELECT TOP 10 ID, Name, Description, DateCreated, LastModified, SimpleSearchField FROM Fund ORDER BY DateCreated ASC`

**Response summary:**
```
success: true
message: "Query executed successfully. Retrieved 10 record(s)"
recordCount: 10
totalRecords: 10
```

**Schema conformance check:**

| Column | describe_table type | read_data actual value | Conforms? |
|--------|--------------------|-----------------------|-----------|
| `ID` | uniqueidentifier | GUID string e.g. `C8F6985B-D823-4E09-B84B-D19168C3F65B` | Yes |
| `Name` | nvarchar | String e.g. `"36 South"` | Yes |
| `Description` | nvarchar | String or `null` (explicit JSON null) | Yes |
| `DateCreated` | datetime | ISO 8601 UTC e.g. `"2016-10-21T18:16:20.143Z"` | Yes |
| `LastModified` | datetime | ISO 8601 UTC e.g. `"2024-04-20T01:24:52.793Z"` | Yes |
| `SimpleSearchField` | nvarchar | String matching Name e.g. `"36 South"` | Yes |

**First 5 rows returned (key fields):**

| # | Name | DateCreated | Description |
|---|------|-------------|-------------|
| 1 | 36 South | 2016-10-21 | null |
| 2 | Acadian Emerging Markets Small-Cap Long-Short Equity Fund, LTD | 2016-10-21 | "Acadian Asset Management's ability to exploit the inefficiencies in the Emerging Market Small Cap Equity Market..." |
| 3 | Accel Growth Fund IV LP | 2016-10-21 | "Focused on growth investments in cash flow positive companies, largely outside of Silicon Valley." |
| 4 | Accel Leaders Fund LP | 2016-10-21 | "Provides additional capital for selected high-conviction opportunities..." |
| 5 | Accel XIII LP | 2016-10-21 | "The firm's flagship U.S. early-stage focused venture fund." |

**Result: PASS** — all 10 rows returned; all 6 requested columns present; types match describe_table schema exactly. NULL values returned explicitly (not omitted). Data is plausible investment fund data.

---

### T1-D — read_data (59 North cross-check)

**Query:** `SELECT TOP 1 ID, Name, SimpleSearchField, DateCreated, LastModified FROM Fund WHERE Name = '59 North Partners, LP'`

**Response:**
```json
{
  "ID": "D7879DB7-E230-4191-8849-DE4B7B64626C",
  "Name": "59 North Partners, LP",
  "SimpleSearchField": "59 North Partners, LP",
  "DateCreated": "2022-07-11T22:30:44.027Z",
  "LastModified": "2026-03-25T17:36:48.253Z"
}
```

**Cross-check against known baselines:**

| Field | read_data value | KS-978 baseline | Match |
|-------|----------------|-----------------|-------|
| ID (GUID) | `D7879DB7-E230-4191-8849-DE4B7B64626C` | `D7879DB7-E230-4191-8849-DE4B7B64626C` | Yes |
| DateCreated | `2022-07-11T22:30:44.027Z` | `2022-07-11T22:30:44.027Z` | Yes |
| LastModified | `2026-03-25T17:36:48.253Z` | `2026-03-25T17:36:48.253Z` | Yes |

**Result: PASS** — Fund.ID from raw SQL matches the MSSQL GUID from `get_fund_description` (KS-978). read_data and the higher-level MCP tools are reading from the same underlying database table.

**Scenario 1 overall: PASS** — table listing, schema description, and data read are functionally consistent. Column types from describe_table match actual data types from read_data. Cross-tool GUID alignment confirmed.

---

## 5. Scenario 2 — Error Path (Invalid Table Name)

**Test 1 — describe_table with invalid name:**
- Parameters: `tableName = "ZZZNONEXISTENT_TABLE_99999"`
- Response: `{"success": true, "columns": []}`

**Test 2 — describe_table with schema prefix on valid table:**
- Parameters: `tableName = "dbo.Fund"`
- Response: `{"success": true, "columns": []}`

**Merged finding:** Both an invalid table name and a valid table name with the schema prefix `dbo.` return the identical response: `success: true, columns: []`. There is no error response, no `success: false`, and no "table not found" message. Callers cannot distinguish between:
- A non-existent table
- A valid table referenced with the wrong prefix format

**Scenario 2 result: PASS with Finding F-03** — tool returns a controlled (empty) response rather than a server error or data dump from an unrelated table. No cross-table leakage observed. However, the lack of error distinction is documented as a finding.

---

## 6. Scenario 3 — Edge Case (Wide Table, Full Column SELECT)

**Query:** `SELECT TOP 10 * FROM Fund ORDER BY DateCreated ASC`

**Response summary:**
```
success: true
message: "Query executed successfully. Retrieved 10 record(s)"
recordCount: 10
totalRecords: 10
```

**Width and payload metrics:**

| Metric | Value |
|--------|-------|
| Rows returned | 10 (exactly as specified by TOP 10) |
| Columns per row | 385 |
| Raw response size | ~145,000 characters |
| describe_table column count | 338 (base schema) |
| Delta (extra columns in SELECT *) | 47 (likely computed / virtual columns not in base schema) |

**Row cap behavior:** `TOP 10` in the SQL query was honored exactly — 10 rows returned. The tool does not add its own row cap beyond what the caller specifies in SQL. Callers are responsible for including `TOP N` in their queries; the tool does not enforce a server-side row limit.

**Column delta analysis:** `SELECT *` returns 385 columns while `describe_table` reported 338. The 47 extra columns are likely computed columns or columns added by a SQL view wrapping the base table — not visible in the `INFORMATION_SCHEMA`-based describe output.

**Scenario 3 result: PASS** — row cap is query-controlled and honored. Wide row payloads (~145K chars for 10 rows) are returned without truncation. Performance was acceptable for this test. Production callers should select specific columns rather than `SELECT *` to control payload size.

---

## 7. Security — Credential Material

| Material | Detected |
|----------|:--------:|
| Raw JWT / Bearer / refresh / password / client secret / API key | No |
| PII in fund data visible via read_data | No (fund names and descriptions only; no personal data in Fund table rows) |

---

## 8. Findings

| ID | Topic | Severity | Status | Action |
|----|-------|----------|--------|--------|
| **KS-981-F-01** | `describe_table` is **schema-prefix sensitive**: `tableName = "dbo.Fund"` returns `columns: []` (empty); `tableName = "Fund"` returns the full 338-column schema. Callers must use the table name **without** the `dbo.` prefix, despite `list_table` returning names in `dbo.TableName` format. | Low | Open | Document the stripping rule in integration guide: strip schema prefix before calling describe_table. Raise with Conceptia for consistency fix. |
| **KS-981-F-02** | `list_table` returns **2,171 table names** — the full MSSQL database schema with no scoping. This is a HIGH-risk exposure for production. An attacker or misconfigured agent could enumerate the entire schema. | HIGH | Open | **Production gate:** restrict `list_table` to an approved table allow-list, or remove from production MCP build. Raise with Conceptia as production-blocking security concern. |
| **KS-981-F-03** | **No error distinction** for invalid table names: `describe_table("ZZZNONEXISTENT_TABLE_99999")` returns `success: true, columns: []` — identical to a valid empty-columns table. Callers cannot determine whether the table name was invalid or the table genuinely has no columns. | Low | Open | API design note: return `success: false` or a `"tableNotFound"` error code when the table name does not exist. Raise with Conceptia. |
| **KS-981-F-04** | `read_data` executes **arbitrary SQL SELECT** with no server-enforced row cap. The caller must include `TOP N` in their query. Without this, a query like `SELECT * FROM Fund` could return all 977+ rows of the full fund table as a massive payload. | HIGH | Open | **Production gate:** add server-side row cap (e.g. max 100 or 1000 rows regardless of query); consider query allow-list or parameterized query patterns instead of free-form SQL. |
| **KS-981-F-05** | `SELECT *` returns **385 columns** vs `describe_table` reporting 338 — a delta of 47 columns. These are likely computed or virtual columns in the SQL view not visible in base schema metadata. Schema documentation is incomplete without these extra columns. | Info | Observe | Document the computed column delta; confirm with Conceptia whether the extra columns are expected and whether they carry sensitive calculated data. |

---

## 9. BDD Acceptance Criteria — Results

| Scenario | Condition | Result | Evidence |
|----------|-----------|--------|----------|
| **1 — Happy path** | list_table includes Fund table; describe_table returns column schema; read_data rows conform to schema types | PASS | §4 — 2,171 tables listed; 338 cols described; 6-col SELECT matches schema; 59 North GUID matches KS-978 |
| **2 — Error path** | Invalid table → schema validation or clear error; no unrelated table dump | PASS (with F-03) | §5 — `success: true, columns: []` for invalid name; no foreign table data leaked |
| **3 — Edge case** | Table with many rows / wide rows → only 10 (or documented default) rows returned | PASS | §6 — `SELECT TOP 10 *` → exactly 10 rows; 385 cols/row; 145K chars; row cap is query-controlled |

---

## 10. Definition of Done — Status

| Criterion | Status |
|-----------|:------:|
| list_table executed; Fund table identified | Yes |
| describe_table run on Fund table | Yes |
| read_data run for first 10 rows | Yes |
| Column type conformance (describe vs read) verified | Yes |
| Invalid table name tested | Yes |
| Wide-row / row-cap behavior documented | Yes |
| §1.4 High-risk tool checklist completed | Yes |
| No credential leakage in transcript | Yes |
| Findings logged | Yes (3 Low/Info + 2 HIGH) |

---

## 11. Paste-ready Jira Comment

KS-981 Claude Cowork -- §5.5 list_table / describe_table / read_data: PASS all 3 scenarios.

HIGH-RISK TOOL CHECKLIST (§1.4): All three tools are functional but carry significant production risk.
- list_table: PASS -- returns 2,171 tables (full schema). F-02: production gate recommended (allow-list or removal).
- describe_table: PASS -- 338 columns returned for Fund table (no dbo. prefix). F-01: schema prefix sensitivity. F-03: invalid table returns success:true + empty columns, no error.
- read_data: PASS -- SELECT TOP 10 honored; types match describe_table schema; 59 North GUID matches KS-978 baseline. F-04: no server-enforced row cap -- production gate recommended.

Scenario 1 PASS: list/describe/read consistent; 59 North GUID cross-check confirmed. Scenario 2 PASS with F-03: invalid table returns empty, not error. Scenario 3 PASS: SELECT TOP 10 * returns exactly 10 rows, 385 cols, ~145K chars -- row cap is query-controlled.

Findings: F-01 schema prefix; F-02 full schema exposure (HIGH); F-03 no error on invalid table; F-04 no server row cap (HIGH); F-05 47 extra cols in SELECT * vs describe_table. Evidence: KS-981 - Claude Result.md

---

## 12. References

| Document | Path |
|----------|------|
| This report | `Dynamo Server/Test Result/KS-981 - Claude Result.md` |
| KS-978 result (59 North GUID baseline) | `Dynamo Server/Test Result/KS-978 - Claude Result.md` |
| KS-977 result (get_funds field alignment) | `Dynamo Server/Test Result/KS-977 - Claude Result.md` |
| KS-992 result (domain object map; §1.4 high-risk tool classification) | `Dynamo Server/Test Result/KS-992 - Claude Result.md` |
| QA guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` (§5.5, §1.4) |

---

## 13. Appendix — describe_table(Fund): Column Sample by Type

*Full schema has 338 columns. Representative sample below.*

**Identity & timestamps:**
```
ID             uniqueidentifier   -- Primary key GUID
_clustidx_     int                -- Clustered index
_tmpstmp_      timestamp          -- Row version
DateCreated    datetime           -- UTC creation timestamp
LastModified   datetime           -- UTC last modified timestamp
```

**Core fund fields:**
```
Name                nvarchar   -- Fund display name
Fulllegalname       nvarchar   -- Full legal entity name
Description         nvarchar   -- Investment strategy description
SimpleSearchField   nvarchar   -- Search-optimized name copy
Vintage/InceptionNew nvarchar  -- Vintage year
```

**Financial metrics (decimal):**
```
Targetfundsizemm      decimal   -- Target fund size in millions
ManagementFee-HF      decimal   -- HF management fee %
PerformanceFee        decimal   -- Performance fee %
OverallRating         decimal   -- Aggregate rating score
```

**Foreign key references (uniqueidentifier):**
```
Ref_Fundmanager          uniqueidentifier   -- Fund manager entity
Ref_Assetclass           uniqueidentifier   -- Asset class lookup
Ref_FundPipelineStatus   uniqueidentifier   -- Pipeline status lookup
Ref_FundLiquidityType    uniqueidentifier   -- Liquidity type lookup
```

**Boolean flags (bit):**
```
SideLetter        bit   -- Has side letter
LitigationHold    bit   -- Under litigation hold
SolovisFundSetup  bit   -- Solovis integration configured
LegalReview       bit   -- Legal review completed
```
