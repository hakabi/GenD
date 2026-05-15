# KS-991 — Cursor Result (Second Time Test): Enumerate Server Endpoints, OAuth, and Per-Tool Schemas

| Field | Value |
| --- | --- |
| **Jira** | [KS-991](https://gendvn.atlassian.net/browse/KS-991) |
| **Epic** | Dynamo MCP — Discovery & Scope Enumeration |
| **Guide / ticket** | `dynamo-mcp-testing-guide_v1.4.md` section 4.1–4.2; Jira description **Updated requirements — guide v1.4** |
| **Client** | Cursor Agent; MCP server `user-conceptia-dynamo` |
| **Test date (UTC)** | 2026-05-12 |
| **Tester** | Cursor Agent |
| **Prior baseline** | `Dynamo Server/Test Result/First Time Test/KS-991-Result.md` (2026-05-07, 7-tool surface) |
| **Consolidation** | Awaits parallel Claude run; merged report TBD |

---

## 0. Executive summary

| Dimension | Result |
| --- | --- |
| **Overall (v1.4 update section)** | **PASS with open items** — 7 deployed tools enumerated; **`read_data` Planned/S**; no out-of-scope tools in client registry |
| **section 4.1** | Host, SSE transport, OAuth session, HTTPS redirect confirmed; vendor version/deploy date **not** exposed via MCP |
| **section 4.2** | Schemas captured from MCP tool descriptors + live smokes for **6/7** tools; **`llm_text_analysis` BLOCKED** (provider credentials on MCP host) |
| **Inventory drift vs 2026-05-07** | Tool count **stable (7)**; **`get_funds` `totalRecords` 978** (was **975**); schemas unchanged at parameter level |
| **BDD (v1.4)** | Scenario 1 **PASS**; Scenario 2 **PASS** (runtime filter rules documented); Scenario 3 **N/A** (no vendor deploy during run) |

---

## 1. Preconditions (update section A)

| Check | Status | Notes |
| --- | --- | --- |
| E1 stories **[KS-989](https://gendvn.atlassian.net/browse/KS-989) / [KS-990](https://gendvn.atlassian.net/browse/KS-990) / [KS-976](https://gendvn.atlassian.net/browse/KS-976)** | **Assumed met** | Not re-executed in this session; successful OAuth-backed tool calls imply connected MCP client |
| Black-box (no Dynamo UI) | **PASS** | All conclusions from MCP outputs only |
| Authorized Microsoft identity | **Observed** | Session allowed fund/activity reads; identity not recorded in this artifact |
| Second client (e.g. Antigravity) | **Not run** | Single-client enumeration this cycle; recommend Claude Cowork leg for cross-client drift |

---

## 2. section 4.1 — MCP server enumeration

| Item | Value | Evidence |
| --- | --- | --- |
| **Host** | `https://mcp.conceptia.com/dynamo/sse` | Ticket + guide; Cursor MCP registration |
| **Transport** | HTTP **SSE** (streamable remote MCP) | Guide section 1.2 / 4.1; successful tool RPCs via SSE bridge |
| **Authentication** | **Microsoft OAuth (Azure AD)** — browser flow; tokens not stored in workspace config | Live tool calls succeeded without manual JWT |
| **TLS / HTTPS** | HTTPS endpoint; **HTTP → 307** redirect to HTTPS | Unauthenticated `curl -sI http://mcp.conceptia.com/dynamo/sse` → `Location: https://mcp.conceptia.com/dynamo/sse` |
| **Unauthenticated probe** | `GET https://mcp.conceptia.com/dynamo/sse` → **401** + `Www-Authenticate: Bearer …` | No data body leaked in headers sample |
| **Vendor version / deploy date** | **Not available via MCP** | No version field in tool responses; obtain from Conceptia (**KS-991-G02**) |
| **Connector / session ID** | **Not captured** | Cursor MCP runtime did not expose connector prefix in tool payloads |
| **Registered tool count (client)** | **7** | Matches v1.4 “available now” set |
| **`read_data`** | **Absent** (Planned per v1.4) | **S (skipped)** — not in `user-conceptia-dynamo` registry |
| **Out-of-scope tools** | **Absent** | No `list_table`, `describe_table`, `search_aloha_funds`, `get_rating_*` in registry |

---

## 3. Client registry (8-tool v1.4 view)

| # | Tool | Category | v1.4 availability | In Cursor registry | section 1.4 |
| --- | --- | --- | --- | --- | --- |
| 1 | `analyze_notes` | Analysis | Available | Yes | — |
| 2 | `get_activity` | Data fetch | Available | Yes | — |
| 3 | `get_documents` | Data fetch | Available | Yes | — |
| 4 | `get_fund_description` | Data fetch | Available | Yes | — |
| 5 | `get_funds` | Data fetch | Available | Yes | — |
| 6 | `get_notes` | Data fetch | Available | Yes | — |
| 7 | `llm_text_analysis` | Analysis | Available | Yes | — |
| 8 | `read_data` | Data fetch | **Planned** | **No** | **HIGH** when live |

---

## 4. section 4.2 — Per-tool enumeration and smokes

**Legend:** **RW** = read/write as exposed by MCP. **Smoke** = minimal valid call unless noted.

### 4.1 `get_funds`

| Property | Value |
| --- | --- |
| **Purpose** | Fund rows with resolved lookup fields |
| **RW** | Read-only |
| **Required params (schema)** | None |
| **Optional params** | `fundName`, `fundManagerName`, `assetClass`, `subAssetClass`, `pipelineStatus`, `responsibleName`, `createdAfter`, `createdBefore`, `modifiedAfter`, `modifiedBefore`, `vintage`, `limit` (default 50, max 100), `offset` (default 0) |
| **Output shape** | `success`, `message`, `data[]`, `recordCount`, `totalRecords`, pagination metadata |
| **Smoke** | `limit: 2` → **PASS** (`totalRecords`: **978**) |
| **section 1.4** | No |

### 4.2 `get_fund_description`

| Property | Value |
| --- | --- |
| **Purpose** | Lighter Fund projection: ID, Name, SimpleSearchField, FundManagerName, Description |
| **RW** | Read-only |
| **Required params (schema)** | None |
| **Optional params** | Same filter set as `get_funds` + `limit` / `offset` (2MB cap noted in schema) |
| **Smoke** | `fundName: "2026 Fund"`, `limit: 1` → **PASS** (`Description`: null for sample) |
| **section 1.4** | No |

### 4.3 `get_documents`

| Property | Value |
| --- | --- |
| **Purpose** | Document metadata/content from Document table |
| **RW** | Read-only |
| **Required params (schema)** | `required: []` |
| **Runtime rule** | **≥1 filter** among `filterType`+`filterValue`, `documentCategories`, or `startDate`/`endDate` |
| **Optional params** | `filterType` (`fund`\|`company`), `filterValue`, `documentCategories[]`, `startDate`, `endDate`, `limit` (default 100, max 500), `offset`, `excludeContent` |
| **Smoke (valid)** | `filterType: fund`, `filterValue: "2026 Fund"`, `excludeContent: true`, `limit: 2` → **PASS** (0 documents) |
| **Smoke (error)** | `limit: 1` only → **PASS (expected reject)** — `At least one filter is required…` |
| **section 1.4** | No |

### 4.4 `get_activity`

| Property | Value |
| --- | --- |
| **Purpose** | Activity search with flexible filters |
| **RW** | Read-only |
| **Required params (schema)** | `required: []` |
| **Runtime rule** | **≥1** of `startDate`, `endDate`, `activityCategories`, `companyNames`, `authorNames`, `subjectSearch`, `fundNames` (**KS-991-G03**) |
| **Optional params** | Above filters + `limit` (default 100, max 500), `offset` |
| **Smoke (valid)** | `fundNames: ["2026 Fund"]`, `limit: 2` → **PASS** (1 activity) |
| **Smoke (error)** | `limit: 1` only → **PASS (expected reject)** — filter required message |
| **section 1.4** | No |

### 4.5 `get_notes`

| Property | Value |
| --- | --- |
| **Purpose** | Activity notes (default category Investment Due Diligence) |
| **RW** | Read-only |
| **Required params (schema)** | None |
| **Optional params** | `startDate`, `endDate`, `companyNames[]`, `activityCategories[]`, `limit` (default 20, max 200), `offset`, `includeBody`, `maxBodyLength` |
| **Smoke** | `companyNames: ["Phoenix Equity"]`, `includeBody: false`, `limit: 1` → **PASS** |
| **section 1.4** | No |

### 4.6 `analyze_notes`

| Property | Value |
| --- | --- |
| **Purpose** | Note retrieval + structured analysis (summary, highlights, comparison) |
| **RW** | Read + **external LLM processing** (egress risk for security suites) |
| **Required params (schema)** | None |
| **Optional params** | `companyNames[]`, `startDate`, `endDate`, `limit` (default 100) |
| **Smoke** | `companyNames: ["Phoenix Equity"]`, `limit: 1` → **PASS** (analysis JSON; note body present in response — redact in shared logs) |
| **section 1.4** | No (LLM egress tracked under E4, not tabular HIGH) |

### 4.7 `llm_text_analysis`

| Property | Value |
| --- | --- |
| **Purpose** | OpenAI/Anthropic text analysis (`summary`, `highlights`, `topics`, `sentiment`, `compare`, `custom`) |
| **RW** | Read + **external LLM API** |
| **Required params (schema)** | None (`texts` documented but not in `required` array) |
| **Optional params** | `texts`, `instructions`, `analysisType`, `provider` (`openai`\|`anthropic`), `model`, `temperature`, `maxTokens`, `json`, note-fetch filters, `includeMeta` |
| **Smoke** | `texts` + `analysisType: summary` → **BLOCKED** — `anthropic`: credit balance error on provider; `openai`: `Missing OPENAI_API_KEY` on MCP host |
| **section 1.4** | No |

### 4.8 `read_data` (Planned — not registered)

| Property | Value |
| --- | --- |
| **v1.4 status** | **Planned**; enumeration **S (skipped)** — _not yet registered_ |
| **section 1.4** | **HIGH** when tool appears — separate checklist row required |
| **Smoke** | **Not executed** |

---

## 5. Drift vs First Time Test baseline (2026-05-07)

| Signal | Prior (`KS-991-Result.md`) | This run (2026-05-12) | Assessment |
| --- | --- | --- | --- |
| Deployed tool count | 7 | 7 | **No drift** |
| Out-of-scope tools | Absent | Absent | **No drift** |
| `get_funds` totalRecords | 975 | **978** | **Data growth** (+3); not a schema change |
| `get_activity` / `get_documents` filter params | Documented extensions | Unchanged in MCP descriptors | **No schema drift observed** |
| `get_activity` / `get_documents` runtime ≥1 filter | Documented | Reconfirmed | **Stable doc/runtime gap** |
| `read_data` | Removed from server | Still absent | Aligns with v1.4 **Planned** |
| Vendor version | Not exposed | Not exposed | **Unchanged gap** |

---

## 6. Findings and open items

| ID | Severity | Topic | Detail |
| --- | --- | --- | --- |
| **KS-991-G02** | Low | Vendor metadata | Server version / last deployment date not returned by MCP tools |
| **KS-991-G03** | Low | Schema vs runtime | `get_activity` and `get_documents` publish `required: []` but enforce ≥1 filter at runtime |
| **KS-991-G04** | Medium (environment) | `llm_text_analysis` | Provider keys/credits not available on MCP host for live smoke — **not** classified as MCP schema defect |
| **KS-991-G05** | Info | LLM egress | `analyze_notes` returned full note body in analysis payload — track under security/PII redaction ([KS-992](https://gendvn.atlassian.net/browse/KS-992) / E4) |

No new Jira defects filed from this enumeration pass.

---

## 7. Acceptance criteria (v1.4 update section)

| Scenario | Verdict | Notes |
| --- | --- | --- |
| **1 — Happy path** | **PASS** | 7 tools in registry documented; smokes executed per available tool except LLM provider block; **`read_data` Planned/S**; baseline row captured in this file |
| **2 — Error path** | **PASS** | Filter-less `get_activity` / `get_documents` return controlled errors; documented as runtime vs JSON schema |
| **3 — Edge case (post-deploy diff)** | **N/A** | No vendor version bump during this run; drift table compares to 2026-05-07 artifact |

---

## 8. Evidence index

| Artifact | Path |
| --- | --- |
| This report | `Dynamo Server/Test Result/Second Time Test/KS-991 - Cursor Result.md` |
| Prior 7-tool enumeration | `Dynamo Server/Test Result/First Time Test/KS-991-Result.md` |
| Guide v1.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide_v1.4.md` |
| Stories v1.2 | `Dynamo Server/Test Result/dynamo_mcp_testing_stories_v1.2.md` |

---

*KS-991 second-time Cursor enumeration per Jira v1.4 update section: **7/7** registry tools documented; **`read_data` Planned/S**; **PASS with open items** (vendor version, LLM provider env, runtime filter doc drift). Awaits Claude parallel run for consolidation.*
