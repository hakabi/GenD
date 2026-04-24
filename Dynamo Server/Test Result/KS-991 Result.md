# KS-991 — Final Result: Enumerate Server Endpoints, OAuth, and Per-Tool Schemas

| Field | Value |
| --- | --- |
| **Jira** | [KS-991](https://gendvn.atlassian.net/browse/KS-991) |
| **Epic** | Dynamo MCP — Discovery & Scope Enumeration |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` §4.1–§4.2 (§4.3 labels where noted) |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-991 - Claude Result.md` (2026-04-24, tester Bình Hà Khoa, **Claude Cowork**) · `KS-991 - Cursor Result.md` (**Cursor Agent**) |
| **Consolidation date** | 2026-04-24 |

---

## 1. Executive summary

**Ticket:** Document server URL, transport, auth, and **all 13** tools’ inputs/outputs, inferred purpose, read/write behavior **as exposed by MCP**; flag **§1.4** tools.

| Source | Role | Outcome |
| --- | --- | --- |
| **Claude Cowork** | Primary deep enumeration: live samples, ratings chain, documents, `list_table` size, `read_data` + `INFORMATION_SCHEMA`, narrative per tool | **PASS** — 13/13 schemas + **12/13** live smokes; **`llm_text_analysis`** documented from schema + egress notes (not full LLM call required for closure per Claude DoD) |
| **Cursor** | Cross-check via MCP tool JSON + independent smokes; env note on **`ANTHROPIC_API_KEY`** | **PASS with caveat** — same schema set; **`llm_text_analysis`** smoke **failed** in agent session (**missing API key**); **`get_rating_details`** not invoked in Cursor leg |

**Merged verdict:** **PASS** for **KS-991** enumeration and classification. **Residual:** run **`llm_text_analysis`** with valid provider keys when proving end-to-end LLM egress controls; obtain **vendor version/deploy date** outside MCP (**§4.1**).

**All 13 tools are read-only** at the MCP boundary (no write/update/delete exposed).

---

## 2. §4.1 Server & transport (merged)

| Property | Value | Source |
| --- | --- | --- |
| **Host** | `https://mcp.conceptia.com/dynamo/sse` | Both |
| **Transport** | HTTP **SSE**; MCP over SSE | Both |
| **Auth** | Microsoft **OAuth (Azure AD)**; Bearer after login | Both |
| **OAuth challenge** | `Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"` | Claude (KS-990 alignment) |
| **TLS** | TLSv1.3; Let's Encrypt; cert exp **2026-06-05** | Claude |
| **IP (DNS)** | `20.99.244.16` | Claude |
| **Stack signal** | `X-Powered-By: Express` (see KS-990 F-03) | Claude / KS-990 |
| **Token storage** | Client OAuth layer; **no** raw JWT in repo config (Cursor: empty workspace `mcp.json`) | Both |
| **Unauthenticated** | **401**; body clean per prior connectivity tests | Claude |
| **Vendor version / deploy** | **Not from MCP** | Both (**gap**) |

---

## 3. §4.2 Tool catalogue — classification & §1.4

**Legend:** **R** = read-only · **⚠️** = guide §1.4 high-risk · **🤖** = external LLM / egress path

| # | Tool | Class | §1.4 | External |
| ---: | --- | --- | :---: | :---: |
| 1 | `analyze_notes` | R 🤖 | — | LLM |
| 2 | `describe_table` | R | ⚠️ | — |
| 3 | `get_activity` | R | — | — |
| 4 | `get_documents` | R | — | — |
| 5 | `get_fund_description` | R | — | — |
| 6 | `get_funds` | R | — | — |
| 7 | `get_notes` | R | — | — |
| 8 | `get_rating_details` | R | — | fad API |
| 9 | `get_rating_summary` | R | — | fad API |
| 10 | `list_table` | R | ⚠️ | — |
| 11 | `llm_text_analysis` | R 🤖 | — | OpenAI / Anthropic |
| 12 | `read_data` | R | ⚠️ | — |
| 13 | `search_aloha_funds` | R | — | Elasticsearch |

**Detailed narrative, full input field tables, and rich sample payloads** (e.g. 59 North documents, rating summary JSON, `search_aloha_funds` hits, `describe_table(Fund)` column count): see **`KS-991 - Claude Result.md` §3.**

**Compact parameter summary + Cursor-only smoke matrix:** see **`KS-991 - Cursor Result.md` §2–§3.**

---

## 4. Cross-client smoke & validation (high level)

| Topic | Claude Cowork | Cursor |
| --- | --- | --- |
| `get_funds` / `get_fund_description` / `get_notes` / `get_documents` | Live samples with real fund/note/doc data | **PASS** (incl. `get_documents` 0-row case) |
| `get_activity` | Live with company filter; **zero-param error** documented | **FAIL** then **PASS** with date filter (confirms mandatory filter) |
| `list_table` | Large response (~**106K** chars) | **PASS** (large output) |
| `describe_table` | Fund ~**300** columns | **PASS** |
| `read_data` | SELECT + `INFORMATION_SCHEMA` sample | **PASS** (simple SELECT) |
| `search_aloha_funds` | `"59 North"` chain to ratings | **PASS** (`search_text: "pe"`, 262 hits) |
| `get_rating_summary` | Non-empty sample **`id: 28582`**, solovis | Empty `data` for some ids (valid **success** shape) |
| `get_rating_details` | **PASS** with user; empty `data` = scoping | **Deferred** in Cursor leg |
| `analyze_notes` | Covered in Claude narrative | **PASS** (Phoenix filter, `limit: 1`) |
| `llm_text_analysis` | Schema + egress documented; not all runs invoke LLM | **BLOCKED** in Cursor: **`Missing ANTHROPIC_API_KEY`** |

---

## 5. Findings (unified)

| ID | Severity | Topic | Detail |
| --- | --- | --- | --- |
| **KS-991-F-01** | Medium | **LLM data egress** | `analyze_notes` and `llm_text_analysis` send internal text to **external LLM** providers. Policy / DLP / KS-981 review. *(Claude §5 F-01)* |
| **KS-991-F-02** | Low | **`get_activity` schema vs runtime** | MCP JSON lists filters as optional; server requires **≥1** of: `startDate`, `endDate`, `activityCategories`, `companyNames`, `authorNames`, `subjectSearch`, `fundNames`. *(Claude F-02 = Cursor G03)* |
| **KS-991-F-03** | Low | **`read_data` + `INFORMATION_SCHEMA`** | Third path for schema discovery besides `list_table` / `describe_table`. *(Claude F-03)* |
| **KS-991-F-04** | Low | **`list_table` size** | Full DB table list very large; use schema filters / expect file offload. *(Claude F-04)* |
| **KS-991-F-05** | Medium (env) | **`llm_text_analysis` in Cursor** | **ANTHROPIC_API_KEY** (and/or OpenAI) required in MCP runtime for live smoke. *(Cursor G01)* |
| **KS-991-F-06** | Low | **Vendor metadata** | Version / deployment date **not** returned by tools — ask Conceptia. *(Cursor G02)* |

---

## 6. §1.4 — Security tracking (KS-981)

| Tool | Risk | Evidence snapshot |
| --- | --- | --- |
| `describe_table` | Full column/type surface for any table | Fund table **~300** columns (Claude) |
| `list_table` | Full table inventory | **~106K** char response (Claude) |
| `read_data` | Arbitrary **SELECT**; **`INFORMATION_SCHEMA`** reachable | Claude + Cursor |

---

## 7. BDD — merged

| Scenario | Result | Notes |
| --- | --- | --- |
| **1 — Happy path** | **PASS** | All **13** tools described; **≥12** heavy live smokes across two clients; **`llm_text_analysis`** fully described; Cursor env may block **one** live LLM call (**F-05**). |
| **2 — Error path** | **PASS** | `get_activity` zero-param → structured validation (documented **F-02**). `llm_text_analysis` key failure logged (**F-05**). |
| **3 — Edge case** | **N/A** | No vendor version bump in cycle; **§9 baseline** supports future diff. |

---

## 8. Data baseline for future diff (Scenario 3)

*(From Claude run, 2026-04-24 — reconcile on next enumeration.)*

| Metric | Value |
| --- | ---: |
| Tools | 13 |
| Funds accessible (`get_funds`) | 977 |
| Diligence notes universe (`get_notes` context) | 5,439 |
| ES indices | `alb_funds`, `solovis_funds`, `alt_evest_funds`, `evest_funds` |
| `list_table` response scale | ~106K characters (Claude) |
| `Fund` columns (`describe_table`) | ~300 |

---

## 9. Definition of Done (ticket) — merged checklist

| Criterion | Status |
| --- | :---: |
| Host + HTTP/SSE transport | Yes |
| OAuth method documented | Yes |
| 13 tool schemas (required/optional/types) | Yes |
| Read/write per tool (**all read-only**) | Yes |
| Sample / inferred return behavior | Yes |
| §1.4 tools flagged | Yes |
| Findings logged | Yes |
| `llm_text_analysis` **live** with keys in **all** environments | Partial — confirm Cursor/MCP env keys (**F-05**) |

---

## 10. Paste-ready Jira comment

*KS-991 closed from **merged** QA: **Claude Cowork** + **Cursor** enumerated `conceptia-dynamo` per §4.1–§4.2. **13/13** tools documented; **all read-only** at MCP. **§1.4** flagged: `list_table`, `describe_table`, `read_data`. **Findings:** LLM egress on `analyze_notes` / `llm_text_analysis` (KS-981); `get_activity` mandatory filter not in JSON schema (vendor doc fix); `INFORMATION_SCHEMA` via `read_data`; huge `list_table` payload; vendor version TBD. **Cursor:** `llm_text_analysis` smoke blocked without **ANTHROPIC_API_KEY**. **Baseline metrics** captured for future schema drift. Evidence: `KS-991 Result.md` + `KS-991 - Claude Result.md` + `KS-991 - Cursor Result.md`.*

---

## 11. References

| Document | Path |
| --- | --- |
| **This merged result** | `Dynamo Server/Test Result/KS-991 Result.md` |
| Claude detail (full tool narratives & samples) | `Dynamo Server/Test Result/KS-991 - Claude Result.md` |
| Cursor detail (compact schema + smoke log) | `Dynamo Server/Test Result/KS-991 - Cursor Result.md` |
| Related | `KS-976 Result.md`, `KS-990 Result.md`, `dynamo-mcp-testing-guide.md` §4 |
