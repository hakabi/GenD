# FinPilot Pipeline API — Gap Analysis vs. Current Dynamo MCP

Jira project: **KS** (Kamehameha Schools) — https://gendvn.atlassian.net/browse/KS-1052

## Epic — [KS-1052](https://gendvn.atlassian.net/browse/KS-1052): FinPilot Pipeline API — Gap Analysis vs. Current Dynamo MCP

**Context**
Aloha (the fund-management front end) currently pushes funds to Dynamo via Dynamo's REST API. FinPilot has been asked to build an equivalent "Pipeline API" (see `Dynamo_Pipeline_API_Specification.docx`, draft v1.0, July 8, 2026) so Aloha can be re-pointed to FinPilot, replacing Dynamo.

This ticket compares that spec against the 10 tools currently available in the Dynamo MCP (`get_funds`, `list_table`, `describe_table`, `get_fund_description`, `get_notes`, `get_documents`, `get_activity`, `analyze_notes`, `llm_text_analysis`, `read_data`) to determine what can be reused and what must be built from scratch.

**Key finding**
The current MCP was designed for read/analysis purposes (reporting, RAG) — it is entirely read-only (`read_data` only allows SELECT and blocks destructive SQL). The FinPilot spec requires 13 endpoints, 8 of which are write/delete operations (PUT Company, PUT Fund, PUT Contact upsert, DELETE) that the current MCP cannot support at all. The read side is also missing fields, missing dedicated Company/Contact entities, missing lookup lists, and missing ETL utility endpoints.

Verified directly against the database (describe_table on `dbo.Fund`, `dbo.Contact`, `dbo.Investor`; queries against `sys.tables`) rather than relying on tool descriptions alone.

---

## [KS-1053](https://gendvn.atlassian.net/browse/KS-1053): Build write API layer: PUT Company/Fund, PUT Contact (upsert), DELETE — no write tool currently exists

**Gap:** The current MCP is 100% read-only (`read_data` only allows SELECT, blocks destructive SQL). The FinPilot spec requires 8 of 13 endpoints to be write/delete operations:

- PUT /Entity/Company/{id} — create/update fund manager, with a "locked fields" business rule once a fund reaches Memo/RFA/Portfolio status (omitted fields must be left unchanged, not cleared).
- PUT /Entity/Fund/{id} — same idea, with its own locked-field subset.
- PUT /Entity/Contact/{id} — upsert keyed by `FullName` (not `_id`), returning the new/matched `_id` for the front end to use next.
- DELETE /Entity/{entityName}/{id} — delete a single record (Fund/Company/Contact/etc).

**Action needed:** Build an entirely new tool/API (not a modification of existing tools) to perform create/update/delete on `dbo.Fund`, `dbo.Investor` (= Company), and `dbo.Contact`, following the same upsert semantics and the "don't clear omitted fields" business rule described in spec sections 4.1/4.4/4.7.

---

## [KS-1054](https://gendvn.atlassian.net/browse/KS-1054): Add read entities for Company (dbo.Investor table) and Contact (dbo.Contact table) — no dedicated tool currently

**Gap:** `get_funds`/`get_fund_description` only return Fund data with a few nested manager fields (FundManagerName, FundManagerPrimaryContactName...). There is no tool that reads Company or Contact directly with the field set the spec requires (Sections 6.1, 6.3).

**Verified:** the "Company" entity in the spec maps to the `dbo.Investor` table in the real database (matches `"_es": "Investor"` in the doc's sample response), NOT a table literally named "Company". This naming needs to be aligned with FinPilot to avoid confusion.

**Action needed:** Add two new read tools (single + bulk, with pagination):
- Company: name, Businessaddress, Businessphone, Companytype, DateCreated, PrimaryAddress_Street/FullAddress, Primarycontact, PrimarycontactEmail, Responsible, lat/long, Businessaddress city/country/state/street/street2/street3/ZIP.
- Contact: fullname, DateCreated, Company, Companyname, Contacttype, email, ContactInfo_Email.

---

## [KS-1055](https://gendvn.atlassian.net/browse/KS-1055): Expand get_funds field set to match the Fund read projection (Section 6.2)

**Gap:** Checked the real `dbo.Fund` schema — the following fields exist in the table but are NOT returned by `get_funds`/`get_fund_description`: Description, FundingAmount, Targetclosedate, Sector, FundSize, Geography, Investmentstrategy, Strategydescription, DocsDueDate, LPACSeat, Fulllegalname, EntityKey.

**Action needed:** Expand the `get_funds` response (or add a new variant) to cover the full field list in spec Section 6.2, avoiding manual `read_data` calls for each missing field.

**Side note:** The `Reportingcurrency` field in the spec (both read and write) has NO corresponding column in `dbo.Fund` (grepped for `%urrency%`, no match). Suspect this field comes from a join with another table (e.g. FundClass/Financials). Need FinPilot/Dynamo POC to confirm the source before committing to this field in the contract.

---

## [KS-1056](https://gendvn.atlassian.net/browse/KS-1056): Support x-columns (field projection) and x-keycolumns (upsert key) semantics

**Gap:** The spec (Sections 2.5, 2.6) requires:
- GET to honor the `x-columns` header and return only the requested fields (acceptable fallback: return the full record if not yet implemented).
- PUT to honor the `x-keycolumns` header to determine which field(s) identify an existing record for update-vs-create matching (e.g. `_id` for Company/Fund, `FullName` for Contact).

The current tools only support fixed filters via parameters (fundName, manager, assetClass...), with no flexible mechanism for choosing returned fields or choosing the match key per request.

**Action needed:** Design a projection parameter (e.g. a `columns` array) for the read tools, and a flexible key mechanism for the write tools (after the "Build write API layer" task is complete).

---

## [KS-1057](https://gendvn.atlassian.net/browse/KS-1057): Add Lookup list endpoint (L_AssetClass, L_Sector, L_FundPipelineStatus, L_CompanyType, L_FundLiquidityType, L_Sub-assetClass x3)

**Gap:** The spec (Section 4.10) requires reading 8 controlled-vocabulary lists to populate front-end dropdowns. The current MCP has no tool for this.

**Verified:** `list_table` shows that `dbo.L_AssetClass`, `dbo.L_Sector`, `dbo.L_FundPipelineStatus`, `dbo.L_CompanyType`, and `dbo.L_FundLiquidityType` all exist and are allowlisted. However, `L_Sub-assetClass`, `L_Sub-assetClass2`, and `L_Sub-assetClass3` — queried `sys.tables` for the pattern `L_Sub%` and found NO matches (only `dbo.L_Old_Sub_Asset_Class`, a different name entirely). Sub-asset-class on `dbo.Fund` is stored via FKs `Ref_Sub-assetclass`, `Ref_Sub-AssetClass2`, `Ref_Sub-AssetClass3` — need to identify the actual lookup table(s) behind these FKs (this could be an allowlist restriction rather than the table genuinely not existing — confirm with the infra/DBA team rather than assuming).

**Action needed:** Add a generic `get_lookup_list(entityName)` tool for the confirmed tables, and clarify the Sub-asset-class data source before building that part.

---

## [KS-1058](https://gendvn.atlassian.net/browse/KS-1058): Add ETL utility endpoints: /total (row count), /schema (display key), /properties (field catalog)

**Gap:** The spec (Section 4.12) requires 3 endpoints to support pagination/ETL for bulk-sync jobs:
- `/total` — count records before paginating (sync jobs page in batches of 1,000).
- `/schema` — identify which field is the display/identity key for a lookup entity.
- `/properties` — return full field metadata (type + label) for an entity.

`describe_table` is conceptually close to `/properties` (returns column names + types), but is missing a clear row count and display-key in the format the spec expects.

**Action needed:** Add two small tools, `get_total_count(entityName)` and `get_schema(entityName)`, which can build on the existing `describe_table`/`list_table` tools.

---

## [KS-1059](https://gendvn.atlassian.net/browse/KS-1059): Confirm data source for the Fund pipeline status audit trail (Section 4.13) — no backing table found

**Gap:** The spec (Section 4.13, POST /Search) requires the change history of a fund's pipeline status: who changed it, when, and from what value to what (entity `Fund_AuditTrail` in the doc's sample response).

**Verified:** Queried `sys.tables` for the patterns `%Audit%` and `%History%` within the current allowlist and got zero matches — no table matches. Unclear whether this is because (a) the real table hasn't been allowlisted for the MCP yet, or (b) this data has never been exposed/stored in a queryable form in the current system.

**Action needed:** Ask the Dynamo infra/DBA team to confirm where the real audit-trail table lives (it may need to be allowlisted) before committing to FinPilot that this endpoint can be built from existing data. `get_activity`/`get_notes` are Activity (notes) data, NOT a field-change audit trail — they cannot be used as a substitute.

---

## [KS-1060](https://gendvn.atlassian.net/browse/KS-1060): Send FinPilot the list of open questions from the spec (auth, pagination, rate limits, error format, environments)

The spec (Section 5) already lists open questions for FinPilot — track these separately to make sure they're answered before FinPilot starts building:
- Authentication: is a long-lived bearer token acceptable, or should we plan for OAuth2 client-credentials with token refresh?
- Pagination: what page size/cursor convention should our bulk-sync jobs use against /Entity/Fund, /Company, and /Contact?
- Field projection: can x-columns be honored server-side, or does the front end need to filter client-side?
- Rate limits: are there per-minute/per-day call limits to design the nightly sync and UI polling around?
- Error format: what status codes/error body schema should we expect?
- Audit trail: can it be scoped to a single fund and/or date range (to avoid a full-history scan on every sync)?
- Environments: will FinPilot provide separate sandbox and production hosts/tokens for QA?

**Action needed:** Compile FinPilot's answers and attach them to this ticket (or as comments) as the basis for finalizing spec v1.1.
