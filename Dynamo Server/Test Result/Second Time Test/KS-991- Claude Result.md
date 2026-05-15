# KS-991 — Schema Enumeration: Second Time Test
**Ticket:** [KS-991](https://gendvn.atlassian.net/browse/KS-991) — Dynamo MCP QA: Enumerate server endpoints, OAuth, and per-tool schemas  
**Guide version:** v1.4 (8-tool inventory)  
**Tester:** Claude (Anthropic) — automated MCP black-box execution  
**Test date:** 2026-05-12  
**Client:** Cowork / Claude Desktop — connector prefix `0c5a3b61-86e4-4c75-b19f-40c0141fb861`  
**Prior baseline:** KS-991-Result.md (2026-05-07, 7-tool re-run against v1.4 scope)  
**Baseline diff:** Yes — see Section 5

---

## 1. Executive Summary

| Item | Value |
|---|---|
| Tools registered in client | **7** |
| Tools expected (guide v1.4 available) | **7** |
| Planned tool not yet registered | `read_data` — S (Skipped) |
| Out-of-scope tools appearing | None |
| Inventory drift vs prior baseline | **None** — tool count stable at 7 |
| Smoke tests passed | **5 / 7** |
| Smoke tests blocked | **1 / 7** (`llm_text_analysis` — both providers unavailable) |
| Schema vs runtime mismatch | **1** (`get_activity` — runtime requires filter; schema lists all optional) |
| New defects opened | **1** — DEF-001: `llm_text_analysis` both LLM providers non-functional |
| Record count drift vs prior run | Funds: 975 → **978** (+3); Notes: 5,457 (stable); Documents: 5,681 (YTD filter) |

---

## 2. Section 4.1 — MCP Server Enumeration

| Attribute | Value |
|---|---|
| Production host | `https://mcp.conceptia.com/dynamo/sse` |
| Transport | HTTP/SSE (Server-Sent Events) |
| Auth method | Microsoft OAuth (Azure AD) — browser-based flow via connector |
| TLS enforcement | HTTPS-only; plain HTTP not accessible through client path |
| Connector identifier | `0c5a3b61-86e4-4c75-b19f-40c0141fb861` |
| Server version | Not exposed via tool outputs or response headers (noted: _not available via MCP_) |
| Last deployment date | Not exposed via tool outputs |
| Client used | Claude Desktop / Cowork (single client — Antigravity repeat recommended per guide section 2.4) |
| Session re-auth event | OAuth token was expired at session open; reconnected before test run |

**Notes:**
- Microsoft OAuth (Azure AD) flow completed successfully via the connector settings UI prior to test execution.
- Server version and deployment date remain undisclosed by vendor via MCP interface — consistent with prior baseline.
- TLS suite details covered separately in KS-988.

---

## 3. Section 4.2 — Tool Capability Enumeration (8-Tool Inventory)

### 3.1 Tool Registry Confirmation

Tools confirmed present in client registry on 2026-05-12:

| # | Tool | Status |
|---|---|---|
| 1 | `analyze_notes` | ✅ Registered |
| 2 | `get_activity` | ✅ Registered |
| 3 | `get_documents` | ✅ Registered |
| 4 | `get_fund_description` | ✅ Registered |
| 5 | `get_funds` | ✅ Registered |
| 6 | `get_notes` | ✅ Registered |
| 7 | `llm_text_analysis` | ✅ Registered |
| 8 | `read_data` | ⬜ Not registered — **Planned** (S / Skipped until deployed) |

Out-of-scope tools checked — **none appeared**: `describe_table`, `get_rating_details`, `get_rating_summary`, `list_table`, `search_aloha_funds`.

---

### 3.2 Per-Tool Deliverables

---

#### Tool 1: `get_funds`

| Field | Detail |
|---|---|
| Category | Data fetch |
| Availability | Available |
| Read/Write | Read-only |
| Section 1.4 flag | None |
| Smoke outcome | ✅ PASS |
| Defects | None |

**Input schema:**

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `fundName` | string | Optional | — | Partial match, case-insensitive |
| `fundManagerName` | string | Optional | — | Partial match |
| `assetClass` | string | Optional | — | Partial match |
| `subAssetClass` | string | Optional | — | Partial match |
| `pipelineStatus` | string | Optional | — | Partial match (e.g. 'Active', 'Closed') |
| `responsibleName` | string | Optional | — | Partial match |
| `vintage` | string | Optional | — | Exact/partial year match |
| `createdAfter` | string | Optional | — | YYYY-MM-DD |
| `createdBefore` | string | Optional | — | YYYY-MM-DD |
| `modifiedAfter` | string | Optional | — | YYYY-MM-DD |
| `modifiedBefore` | string | Optional | — | YYYY-MM-DD |
| `limit` | number | Optional | 50 | Max 100 |
| `offset` | number | Optional | 0 | Pagination |

**Output shape summary:**  
Returns fund records with: `Name`, `Vintage/InceptionNew`, `DateCreated`, `LastModified`, `ResponsibleName`, `SecondaryResponsibleName`, `LastActivityDate`, `LastActivitySubject`, `FundManagerName`, `FundManagerPrimaryContactName`, `PipelineStatus`, `AssetClassName`, `SubAssetClassName`, `SubAssetClass2Name`, `SubAssetClass3Name`, `AuditorName`, `FundLiquidityTypeName`, `MostRecentFinancialStatementDate`. Pagination envelope includes `recordCount`, `totalRecords`, `offset`, `limit`, `hasMore`, `wasTruncated`, `approximateSizeMB`.

**Smoke result:** `limit=3` → 3 of **978** funds returned. `success: true`. Response capped at 2MB (noted in description).

---

#### Tool 2: `get_fund_description`

| Field | Detail |
|---|---|
| Category | Data fetch |
| Availability | Available |
| Read/Write | Read-only |
| Section 1.4 flag | None |
| Smoke outcome | ✅ PASS |
| Defects | None |

**Input schema:** Identical filter parameters to `get_funds` (fundName, fundManagerName, assetClass, subAssetClass, pipelineStatus, responsibleName, vintage, createdAfter, createdBefore, modifiedAfter, modifiedBefore, limit [default 50, max 100], offset [default 0]).

**Output shape summary:**  
Returns narrower fund subset: `ID`, `Name`, `SimpleSearchField`, `FundManagerName`, `Description` only. Same pagination envelope as `get_funds`. Description field may be null where no description is stored.

**Smoke result:** `limit=3` → 3 of **978** funds returned. `success: true`. Fund IDs confirmed (e.g., `3F554983-6C4B-470F-B7A0-AC823EA4AFD1`). Description field present but null on some records.

---

#### Tool 3: `get_notes`

| Field | Detail |
|---|---|
| Category | Data fetch |
| Availability | Available |
| Read/Write | Read-only |
| Section 1.4 flag | None |
| Smoke outcome | ✅ PASS |
| Defects | None |

**Input schema:**

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `startDate` | string | Optional | — | YYYY-MM-DD |
| `endDate` | string | Optional | — | YYYY-MM-DD |
| `companyNames` | array[string] | Optional | — | Case-insensitive match on Companies field |
| `activityCategories` | array[string] | Optional | `['Investment Due Diligence']` | Use `['*']` for all categories |
| `limit` | number | Optional | 20 | Max 200 |
| `offset` | number | Optional | 0 | Pagination |
| `includeBody` | boolean | Optional | true | Set false to reduce payload |
| `maxBodyLength` | number | Optional | 10000 | Truncates body at N chars |

**Output shape summary:**  
Returns: `ID`, `Subject`, `Body_Plaintext` (if includeBody=true), `Date`, `Activitycategories`, `Companies`, `Contacts`, `Funds`, `DateCreated`, `LastModified`, `AuthorName`, `AuthorEmail`. Pagination envelope same as other tools. Default category filter is `Investment Due Diligence`.

**Smoke result:** `limit=2, includeBody=false` → 2 of **5,457** Investment Due Diligence notes. `success: true`. Body field confirmed null when excluded. Most recent note date: 2026-05-06.

---

#### Tool 4: `get_activity`

| Field | Detail |
|---|---|
| Category | Data fetch |
| Availability | Available |
| Read/Write | Read-only |
| Section 1.4 flag | None |
| Smoke outcome | ⚠️ PARTIAL PASS — schema/runtime mismatch (see DEF note below) |
| Defects | DEF-SCHEMA-001: Runtime requires at least one filter; schema documents all params as Optional |

**Input schema:**

| Parameter | Type | Required (schema) | Runtime required | Default | Notes |
|---|---|---|---|---|---|
| `startDate` | string | Optional | At least one of these required at runtime | — | YYYY-MM-DD |
| `endDate` | string | Optional | At least one of these required at runtime | — | YYYY-MM-DD |
| `activityCategories` | array[string] | Optional | At least one of these required at runtime | — | Matches if contains any |
| `companyNames` | array[string] | Optional | At least one of these required at runtime | — | Partial match |
| `authorNames` | array[string] | Optional | At least one of these required at runtime | — | **New in v1.4** |
| `fundNames` | array[string] | Optional | At least one of these required at runtime | — | **New in v1.4** |
| `subjectSearch` | string | Optional | At least one of these required at runtime | — | Case-insensitive partial match — **New in v1.4** |
| `limit` | number | Optional | — | 100 | Max 500 |
| `offset` | number | Optional | — | 0 | Pagination |

**Schema/runtime mismatch:** Zero-param call returns `success: false` with message: _"At least one filter is required: startDate, endDate, activityCategories, companyNames, authorNames, subjectSearch, or fundNames"_. This contradicts the published schema which lists all params as Optional. Recommend vendor update schema to mark at least one filter as conditionally required.

**Output shape summary:**  
Returns: `ID`, `Subject`, `Date`, `Activitycategories`, `Companies`, `Contacts`, `Funds`, `DateCreated`, `LastModified`, `AuthorName`. No body field (unlike get_notes). Same pagination envelope. Note: `AuthorName` may be null on some records (observed: null for system-generated activities).

**Smoke result (corrected call):** `startDate=2026-05-01, limit=2` → 2 of **442** activities. `success: true`. Confirmed new params `authorNames`, `fundNames`, `subjectSearch` present in schema.

---

#### Tool 5: `get_documents`

| Field | Detail |
|---|---|
| Category | Data fetch |
| Availability | Available |
| Read/Write | Read-only |
| Section 1.4 flag | None |
| Smoke outcome | ✅ PASS |
| Defects | None |

**Input schema:**

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `filterType` | enum | Optional | — | `'fund'` or `'company'` — **New in v1.4**; required if filterValue provided |
| `filterValue` | string | Optional | — | Fund or company name — **New in v1.4**; required if filterType provided |
| `documentCategories` | array[string] | Optional | — | Exact match (e.g. `'22-Capital Call;'`) |
| `startDate` | string | Optional | — | YYYY-MM-DD or relative term |
| `endDate` | string | Optional | — | YYYY-MM-DD or relative term (supports 'last month', 'YTD', etc.) |
| `excludeContent` | boolean | Optional | false | Excludes Content field — **New in v1.4** |
| `limit` | number | Optional | 100 | Max 500 |
| `offset` | number | Optional | 0 | Pagination |

**Output shape summary:**  
Returns: `ID`, `Title`, `FileName`, `FullFileName`, `Size`, `IsLatest`, `Content` (excluded if excludeContent=true), `DateCreated`, `LastModified`, `Documentcategories`, `Documentdate`, `Funds`, `Contacts`, `FileSize`, `DocumentDateQuarter`, `DocumentDateYear`, `DocumentDateMonth`, `Companies`. Same pagination envelope.

**Smoke result:** `startDate=2026-01-01, endDate=2026-05-12, limit=2, excludeContent=true` → 2 of **5,681** documents. `success: true`. Content field confirmed null when excluded. Document types include PDF and PNG. Most recent document date: 2026-05-12.

---

#### Tool 6: `analyze_notes`

| Field | Detail |
|---|---|
| Category | Analysis |
| Availability | Available |
| Read/Write | Read-only |
| Section 1.4 flag | None |
| Smoke outcome | ✅ PASS |
| Defects | None |

**Input schema:**

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `startDate` | string | Optional | — | YYYY-MM-DD |
| `endDate` | string | Optional | — | YYYY-MM-DD |
| `companyNames` | array[string] | Optional | — | Partial match |
| `limit` | number | Optional | 100 | Max records |

**Output shape summary:**  
Returns a structured analysis object: `summary` (total count, date range, byYear breakdown), `highlights` (strategy/macro/risk/performance/ai note subjects), `comparison` (latest note snippet + prior 2-year examples), `data` (full note records including body). Processing is internal to the MCP server — does not route to external LLM providers.

**Smoke result:** `startDate=2026-04-01, endDate=2026-05-12, limit=2` → Analyzed 2 notes. `success: true`. Returned full structured analysis with comparison between latest note (Peak XV Meeting 2026-05-06) and prior example (DE Shaw 2026-05-04). Body content returned in data array (redacted from this report per evidence guidelines).

---

#### Tool 7: `llm_text_analysis`

| Field | Detail |
|---|---|
| Category | Analysis |
| Availability | Registered but **non-functional** (both providers unavailable) |
| Read/Write | Read-only (analysis only, no writes) |
| Section 1.4 flag | None (note: routes note content to external LLM — DMAP-F01 exfiltration path) |
| Smoke outcome | ❌ BLOCKED — server-side environment misconfiguration |
| Defects | **DEF-001 (High):** Both LLM providers unavailable — Anthropic credit balance exhausted; OpenAI API key missing |

**Input schema:**

| Parameter | Type | Required | Default | Notes |
|---|---|---|---|---|
| `texts` | string or array[string] | Optional | — | Text(s) to analyze |
| `analysisType` | string | Optional | — | `summary\|highlights\|compare\|topics\|sentiment\|custom` |
| `provider` | enum | Optional | openai (if key present) else anthropic | `'openai'` or `'anthropic'` |
| `model` | string | Optional | env default | Override model name |
| `companyNames` | array[string] | Optional | — | Auto-fetch notes for these companies |
| `startDate` | string | Optional | — | YYYY-MM-DD (for note fetch) |
| `endDate` | string | Optional | — | YYYY-MM-DD (for note fetch) |
| `limit` | number | Optional | 100 | Max records for note fetch |
| `instructions` | string | Optional | — | Additional instructions |
| `includeMeta` | boolean | Optional | false | Include Subject/Date/Companies in LLM input |
| `json` | boolean | Optional | — | Request JSON-structured output |
| `maxTokens` | number | Optional | — | Provider-specific token cap |
| `temperature` | number | Optional | 0.2 | Sampling temperature |

**Output shape summary:** When functional — returns LLM-generated text analysis result plus provider metadata. Tool internally fetches notes if companyNames/dates provided, then passes note body text to external LLM API.

**Smoke results:**
- `provider=anthropic` → `success: false` — _"Anthropic error 400: Your credit balance is too low to access the Anthropic API."_
- `provider=openai` → `success: false` — _"Error: Missing OPENAI_API_KEY"_

**Impact:** `llm_text_analysis` is fully non-functional in the current deployment. Any test cases depending on this tool (PIJ-06–10 chained analysis, CHAIN-01 exfiltration path) cannot be executed until at least one provider is restored. Recommend escalation to Conceptia/vendor.

---

#### Tool 8: `read_data` (Planned — Not Yet Registered)

| Field | Detail |
|---|---|
| Category | Data fetch |
| Availability | **Planned** — not yet registered in client |
| Read/Write | Read-only (tabular read) |
| Section 1.4 flag | **HIGH RISK** — tabular read/exfiltration surface |
| Smoke outcome | **S (Skipped)** — reason: not yet deployed |
| Defects | None opened; track separately once registered |

**Note:** When `read_data` appears in the client registry, immediately flag as section 1.4 HIGH risk, escalate per guide section 9, and trigger E2 re-run per guide section 10. Full enumeration and security suite (FINDING-04 regression) to be executed at that time.

---

## 4. BDD Scenario Outcomes

### Scenario 1 — Happy path
> **Given** OAuth succeeded and the client lists the currently deployed tools from guide v1.4 section 1.3  
> **When** the tester runs the section 4.2 schema enumeration prompt and smokes each available tool  
> **Then** each tool in the 8-tool inventory has parameters and return behavior documented (7 enumerated today; `read_data` documented as Planned/S until registered), with no unexplained extras, and a dated baseline is stored for drift detection

**Result: PARTIAL PASS**

- ✅ OAuth reconnected successfully
- ✅ 7 tools confirmed in registry — no unexpected extras
- ✅ `read_data` documented as Planned/Skipped
- ✅ All 7 tool schemas fully captured
- ✅ Smoke calls completed on 6 of 7 available tools (5 PASS, 1 schema mismatch with corrected call PASS)
- ❌ `llm_text_analysis` smoke BLOCKED — both LLM providers non-functional
- ✅ Dated baseline recorded (2026-05-12) and stored

**Scenario 1 verdict: PARTIAL PASS** (6/7 smokes functional; `llm_text_analysis` blocked by provider misconfiguration)

---

### Scenario 2 — Error path
> **Given** a tool returns schema validation errors or contradicts its published JSON schema on minimal valid input  
> **When** the tester invokes the tool and captures request/response  
> **Then** a defect is logged with redacted evidence and the enumeration record notes runtime vs schema mismatch

**Result: TRIGGERED — mismatch confirmed and documented**

- `get_activity` with zero params → `success: false`: _"At least one filter is required..."_ — contradicts schema listing all params as Optional.
- Documented as DEF-SCHEMA-001 in tool 4 entry above.
- Corrected call with `startDate` filter → PASS.

**Scenario 2 verdict: PASS** (mismatch detected, logged, corrected call confirmed behavior)

---

### Scenario 3 — Edge case (drift detection)
> **Given** the vendor deploys a version change or an out-of-scope tool reappears  
> **When** enumeration is re-run after deployment  
> **Then** a diff against the prior baseline is recorded and dependent stories notified

**Result: TRIGGERED — minor drift recorded (see Section 5)**

---

## 5. Baseline Diff vs Prior Run (2026-05-07)

| Metric | Prior baseline (2026-05-07) | This run (2026-05-12) | Delta |
|---|---|---|---|
| Tools registered | 7 | 7 | No change |
| Tools out-of-scope appearing | 0 | 0 | No change |
| `read_data` registered | No | No | No change |
| Total funds | 975 | **978** | **+3** |
| Total notes (Investment DD) | ~5,457 | 5,457 | Stable |
| Total documents (YTD 2026) | Not measured | 5,681 | New measurement |
| `get_activity` schema mismatch | Not tested zero-param | Detected | New finding |
| `llm_text_analysis` functional | Functional (Anthropic) | **Non-functional** (both providers) | **Regression** |

**Key drift items:**
1. **Fund count +3** (975 → 978): Minor data growth. No schema impact. No action required.
2. **`llm_text_analysis` regression**: Previously functional with Anthropic provider (confirmed in prior KS-1002 re-test). Now both Anthropic (credit balance) and OpenAI (missing key) unavailable. This is a **new production regression** — escalate to vendor.
3. **`get_activity` zero-param behavior**: Newly documented. Recommend vendor update schema to accurately reflect runtime filter requirement.

---

## 6. Defects Summary

| ID | Tool | Severity | Description | Status |
|---|---|---|---|---|
| DEF-001 | `llm_text_analysis` | High | Both LLM providers non-functional: Anthropic credit balance exhausted; OpenAI API key missing. Tool is fully blocked. | Open — escalate to Conceptia |
| DEF-SCHEMA-001 | `get_activity` | Low | Published schema documents all parameters as Optional, but runtime enforces at least one filter. Schema does not reflect actual contract. | Open — vendor doc update recommended |

---

## 7. Record Count Summary (2026-05-12 Snapshot)

| Entity | Count | Source tool |
|---|---|---|
| Funds | 978 | `get_funds` / `get_fund_description` |
| Investment DD Notes | 5,457 | `get_notes` (default category filter) |
| Activities (May 2026) | 442 | `get_activity` (startDate=2026-05-01) |
| Documents (YTD 2026) | 5,681 | `get_documents` (startDate=2026-01-01) |

---

## 8. Evidence Storage

- Report: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-991-Result.md`
- Baseline date: 2026-05-12
- Tester: Claude (Anthropic) — Cowork session
- Client: Claude Desktop, connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861`
- Tool count at baseline: 7 (registered) + 1 (read_data — Planned)

---

## 9. Recommended Actions

1. **[HIGH]** Escalate `llm_text_analysis` provider failure (DEF-001) to Conceptia — both Anthropic credit and OpenAI key need restoration before any LLM-dependent test cases can execute.
2. **[LOW]** Request vendor update `get_activity` schema to reflect runtime filter requirement (DEF-SCHEMA-001).
3. **[INFO]** Re-run `llm_text_analysis` smoke once provider is restored to confirm DEF-001 closure.
4. **[INFO]** When `read_data` appears in registry, immediately re-run enumeration and flag section 1.4 HIGH risk per guide section 9–10.
5. **[INFO]** Repeat enumeration on second client (Antigravity) per guide section 2.4 to catch client-specific schema drift.

---

*Report generated: 2026-05-12 | Guide: v1.4 | Run type: Second Time Test*
