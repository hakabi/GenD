# KS-991 — Final Result (Second Time Test): Enumerate Server Endpoints, OAuth, and Per-Tool Schemas

| Field | Value |
| --- | --- |
| **Jira** | [KS-991](https://gendvn.atlassian.net/browse/KS-991) |
| **Epic** | Dynamo MCP — Discovery & Scope Enumeration |
| **Guide / ticket** | `dynamo-mcp-testing-guide_v1.4.md` section 4.1–4.2; Jira **Updated requirements — guide v1.4** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-991- Claude Result.md` (2026-05-12, **Claude Cowork / Claude Desktop**) · `KS-991 - Cursor Result.md` (2026-05-12, **Cursor Agent**) |
| **Consolidation date** | 2026-05-12 |
| **Prior baseline** | `Dynamo Server/Test Result/First Time Test/KS-991-Result.md` (2026-05-07, 7-tool re-run) |

---

## 1. Executive summary

**Ticket (v1.4 update section):** Black-box inventory of SSE endpoint, Microsoft OAuth, vendor metadata where exposed, and per-tool MCP contracts for the customer-confirmed **8-tool** surface (**7** registered today; **`read_data` Planned/S**).

| Source | Client | Role | Outcome |
| --- | --- | --- | --- |
| **Claude Cowork** | Claude Desktop; connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861` | Deep enumeration: full parameter tables, record-count snapshot, OAuth re-auth note, defect IDs | **PARTIAL PASS** — **7/7** tools in registry documented; **5/7** smokes **PASS**; **`get_activity`** zero-param mismatch logged; **`llm_text_analysis` BLOCKED** (both providers) |
| **Cursor Agent** | `user-conceptia-dynamo` | Cross-check via MCP descriptors + independent smokes; HTTP/TLS probe | **PASS with open items** — same **7**-tool registry; **6/7** smokes executed (**`llm_text_analysis` BLOCKED**); filter-less errors on **`get_activity`** / **`get_documents`** |

**Merged verdict:** **PASS with open items** for **KS-991** v1.4 enumeration. **7** deployed tools documented with **no unexplained extras**; **`read_data` Planned/S**; **all tools read-only** at MCP boundary. **Residual:** restore **`llm_text_analysis`** provider configuration; obtain **vendor version / deploy date** outside MCP; optional **second client** (Antigravity) repeat per guide section 2.4.

---

## 2. section 4.1 — Server and transport (merged)

| Property | Value | Claude | Cursor |
| --- | --- | --- | --- |
| **Host** | `https://mcp.conceptia.com/dynamo/sse` | Yes | Yes |
| **Transport** | HTTP **SSE** | Yes | Yes |
| **Auth** | Microsoft **OAuth (Azure AD)** — browser flow | Yes; token expired at session open, reconnected | Yes; live RPCs without manual JWT |
| **Connector ID** | `0c5a3b61-86e4-4c75-b19f-40c0141fb861` | Captured | Not captured |
| **TLS / HTTPS** | HTTPS-only on client path | Yes | **HTTP → 307** to HTTPS; unauth **401** + `Www-Authenticate: Bearer …` |
| **Vendor version / deploy** | **Not exposed via MCP** | Yes | Yes |
| **Tools registered** | **7** | Yes | Yes |
| **`read_data`** | **Absent** — Planned/S | Yes | Yes |
| **Out-of-scope tools** | None in registry | Confirmed | Confirmed |

---

## 3. section 4.2 — 8-tool inventory and classification (v1.4)

**Legend:** **R** = read-only · **🤖** = analysis / possible external LLM path · **⚠️** = section 1.4 **HIGH** when live

| # | Tool | v1.4 | Registered | Class | section 1.4 | Merged smoke |
| ---: | --- | --- | :---: | --- | :---: | --- |
| 1 | `analyze_notes` | Available | Yes | R / analysis | — | **PASS** (both) |
| 2 | `get_activity` | Available | Yes | R | — | **PASS** with filter; zero-param **reject** (both) |
| 3 | `get_documents` | Available | Yes | R | — | **PASS** (Claude: date range; Cursor: fund filter + zero-param reject) |
| 4 | `get_fund_description` | Available | Yes | R | — | **PASS** (both) |
| 5 | `get_funds` | Available | Yes | R | — | **PASS** (both; **`totalRecords` 978**) |
| 6 | `get_notes` | Available | Yes | R | — | **PASS** (both) |
| 7 | `llm_text_analysis` | Available | Yes | R 🤖 | — | **BLOCKED** (both providers) |
| 8 | `read_data` | **Planned** | No | R | ⚠️ when live | **S (skipped)** |

**Out of scope (v1.4):** `describe_table`, `get_rating_details`, `get_rating_summary`, `list_table`, `search_aloha_funds` — **not observed** in either client registry.

**Detail depth:** Full per-tool parameter tables and Claude record-count snapshot → **`KS-991- Claude Result.md` section 3.** Compact schema + smoke matrix → **`KS-991 - Cursor Result.md` section 4.**

---

## 4. Cross-client smoke summary

| Tool | Claude Cowork | Cursor Agent |
| --- | --- | --- |
| `get_funds` | `limit=3` → **978** total | `limit=2` → **978** total |
| `get_fund_description` | `limit=3`; IDs + null `Description` | `fundName: "2026 Fund"`, `limit=1` |
| `get_notes` | `limit=2`, `includeBody=false` → **5,457** DD notes | `companyNames: ["Phoenix Equity"]`, `includeBody=false` |
| `get_activity` | Zero-param **fail**; `startDate=2026-05-01` → **442** (May 2026) | Zero-param **fail**; `fundNames: ["2026 Fund"]` → 1 row |
| `get_documents` | `startDate`/`endDate` 2026 YTD, `excludeContent=true` → **5,681** | `filterType`/`filterValue` fund **2026 Fund** → 0 rows; zero-param **fail** |
| `analyze_notes` | Date range → structured analysis (2 notes) | `companyNames: ["Phoenix Equity"]` → analysis JSON |
| `llm_text_analysis` | Anthropic credit error; OpenAI missing key | Same provider failures |
| `read_data` | Not registered | Not registered |

---

## 5. Baseline diff vs First Time Test (2026-05-07)

| Metric | Prior (2026-05-07) | Second time (2026-05-12) | Assessment |
| --- | --- | --- | --- |
| Tools registered | 7 | 7 | **No inventory drift** |
| Out-of-scope tools | 0 | 0 | **Stable** |
| `read_data` | Absent | Absent | **Planned/S** per v1.4 |
| `get_funds` `totalRecords` | 975 | **978** | **+3** data growth (both agents) |
| `get_notes` universe (DD) | ~5,457 | **5,457** | **Stable** (Claude) |
| `get_documents` (YTD 2026) | Not in prior snapshot | **5,681** | New metric (Claude) |
| `get_activity` zero-param rule | Known from earlier cycles | Reconfirmed | **Schema/runtime gap** |
| `llm_text_analysis` | Functional in some prior legs | **Both providers blocked** | **Regression / env** (Claude **DEF-001**) |
| Vendor version | Not via MCP | Not via MCP | **Open** |

---

## 6. Findings (unified)

| ID | Severity | Topic | Detail | Sources |
| --- | --- | --- | --- | --- |
| **KS-991-F-01** | High | **`llm_text_analysis` providers** | Anthropic: credit balance too low; OpenAI: missing API key — tool non-functional for live smoke | Claude **DEF-001**; Cursor **G04** |
| **KS-991-F-02** | Low | **`get_activity` schema vs runtime** | JSON lists filters optional; runtime requires **≥1** of `startDate`, `endDate`, `activityCategories`, `companyNames`, `authorNames`, `subjectSearch`, `fundNames` | Claude **DEF-SCHEMA-001**; Cursor **G03** |
| **KS-991-F-03** | Low | **`get_documents` schema vs runtime** | Zero-param call rejected; at least one filter dimension required at runtime | Cursor (Claude used valid date filters only) |
| **KS-991-F-04** | Low | **Vendor metadata** | Server version / last deployment date not returned by MCP | Both **G02** |
| **KS-991-F-05** | Info | **LLM / note payload handling** | `analyze_notes` returns full note bodies in analysis payload — redact in shared evidence; track egress in E4 / **KS-992** | Cursor **G05**; Claude notes internal processing label vs security review |
| **KS-991-F-06** | Info | **Second client coverage** | Antigravity (or other in-house client) not used in either leg | Both reports |

No additional Jira defects were filed from the Cursor leg; Claude logged **DEF-001** and **DEF-SCHEMA-001** in the test artifact.

---

## 7. section 1.4 — Security tracking (v1.4)

| Tool | Status | Note |
| --- | --- | --- |
| `read_data` | **Planned / not registered** | Flag **HIGH** when tool appears; run full enumeration + security regression |
| Other 7 tools | Business-domain reads / analysis | Normal AUTH / INJ / PIJ / CHAIN per guide; **`llm_text_analysis`** blocked prevents live LLM egress proof this cycle |

---

## 8. BDD — v1.4 update section (merged)

| Scenario | Result | Notes |
| --- | --- | --- |
| **1 — Happy path** | **PARTIAL PASS** | **7** tools documented; **`read_data` Planned/S**; no extras; baseline dated **2026-05-12**; **`llm_text_analysis`** smoke blocked (**F-01**) |
| **2 — Error path** | **PASS** | Runtime filter enforcement on **`get_activity`** (and **`get_documents`** on Cursor) documented (**F-02**, **F-03**) |
| **3 — Edge case (drift)** | **PASS** | Diff vs **2026-05-07** recorded: stable tool surface; fund **+3**; **`llm_text_analysis`** provider regression noted |

---

## 9. Data baseline for ASV / next enumeration

| Metric | Value (2026-05-12) | Source |
| --- | ---: | --- |
| Tools registered | 7 (+ `read_data` Planned) | Both |
| Funds (`get_funds`) | **978** | Both |
| Investment DD notes (`get_notes`, default category) | **5,457** | Claude |
| Activities (May 2026, `startDate=2026-05-01`) | **442** | Claude |
| Documents (YTD 2026, date filter) | **5,681** | Claude |
| Connector prefix (Claude) | `0c5a3b61-86e4-4c75-b19f-40c0141fb861` | Claude |

---

## 10. Definition of Done (v1.4 QA interpretation)

| Criterion | Status |
| --- | :---: |
| Host + HTTP/SSE documented | Yes |
| OAuth method documented | Yes |
| 8-tool inventory captured (**7** enumerated + **`read_data` Planned/S**) | Yes |
| Per-tool input schema and read/write class | Yes |
| Sample / inferred return behavior | Yes |
| section 1.4 **`read_data`** tracked | Yes (Planned) |
| Evidence stored in repo QA space | Yes |
| **`llm_text_analysis` live** in all environments | **No** — **F-01** |
| Vendor version / deploy via MCP | **No** — **F-04** |
| Second MCP client repeat | **No** — **F-06** |

---

## 11. Paste-ready Jira comment

*KS-991 **second-time** merged QA (**Claude Cowork** + **Cursor**): v1.4 update section section 4.1–4.2. **7/7** registered tools documented; **`read_data` Planned/S**; no out-of-scope tools. **Smokes:** all except **`llm_text_analysis`** (Anthropic credits + missing OpenAI key — **F-01**). **`get_activity`** (and **`get_documents`** on Cursor) runtime requires ≥1 filter vs optional JSON schema (**F-02**/**F-03**). Fund count **978** (+3 vs 2026-05-07). Vendor version still not via MCP (**F-04**). Evidence: `Second Time Test/KS-991 - Result.md` + agent result files.*

---

## 12. References

| Document | Path |
| --- | --- |
| **This merged result** | `Dynamo Server/Test Result/Second Time Test/KS-991 - Result.md` |
| Claude detail | `Dynamo Server/Test Result/Second Time Test/KS-991- Claude Result.md` |
| Cursor detail | `Dynamo Server/Test Result/Second Time Test/KS-991 - Cursor Result.md` |
| Prior 7-tool baseline | `Dynamo Server/Test Result/First Time Test/KS-991-Result.md` |
| Guide v1.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide_v1.4.md` |

---

*Merged **2026-05-12** from Claude Cowork and Cursor second-time KS-991 runs. **Verdict: PASS with open items** — enumeration complete for deployed surface; **`llm_text_analysis`** provider restoration and vendor metadata remain open.*
