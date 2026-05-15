# KS-992 — Final Result (Second Time Test): Map Domain Objects per Tool and Outbound Data Paths

| Field | Value |
| --- | --- |
| **Jira** | [KS-992](https://gendvn.atlassian.net/browse/KS-992) |
| **Epic** | Dynamo MCP — Discovery & Scope Enumeration |
| **Guide / ticket** | `dynamo-mcp-testing-guide_v1.4.md` section 4.3; Jira **Updated requirements — guide v1.4** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-992 - Claude Result.md` (2026-05-12, **Claude Cowork / Claude Desktop**) · `KS-992 - Cursor Result.md` (2026-05-12, **Cursor Agent**) |
| **Consolidation date** | 2026-05-12 |
| **Enumeration baseline** | `KS-991 Result.md` (same folder, 2026-05-12) |
| **Prior mapping baseline** | `Dynamo Server/Test Result/First Time Test/KS-992 Result.md` (13-tool surface, 2026-04-24) |

---

## 1. Executive summary

**Ticket (v1.4 update section):** Black-box **section 4.3** map of domain objects per MCP tool, **outbound / LLM-mediated** paths, and **behavioral cross-tool fund scope** on the customer-confirmed **8-tool** surface (**7** registered today; **`read_data` Planned/S**). **No** Dynamo UI, upstream schema docs, or **`search_aloha_funds`** in v1.4 scope.

| Source | Client | Role | Outcome |
| --- | --- | --- | --- |
| **Claude Cowork** | Claude Desktop; connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861` | Deep mapping: full entity table, outbound register, **59 North** cross-tool identity proof, v1.4 Mermaid ERD, E4 suite targeting | **PASS with open items** — **7/7** tools mapped; **`read_data` S**; **`llm_text_analysis` BLOCKED**; **`analyze_notes`** egress **reclassified internal** vs prior external-LLM label |
| **Cursor Agent** | `user-conceptia-dynamo` | Independent map + smokes; **2026 Fund** and **59 North** cross-tool checks; compact outbound table | **PASS with open items** — same **7**-tool surface; **`llm_text_analysis` BLOCKED**; **`analyze_notes`** returns full note body in payload; **2026 Fund** `get_documents` **soft-empty** |

**Merged verdict:** **PASS with open items** for **KS-992** v1.4 mapping. **Four active entity families** (Fund, Activity/Note, Document, Contact-as-linked-field) plus **analysis artifacts** are documented for all **7** deployed tools; **`read_data` Planned/S** with **section 1.4 HIGH** when live; **all tools read-only** at MCP boundary. **Residual:** restore **`llm_text_analysis`** providers; **vendor clarification** on **`analyze_notes`** processing path; optional **second MCP client** repeat per guide section 2.4.

---

## 2. Preconditions and method (merged)

| Check | Claude Cowork | Cursor Agent | Merged |
| --- | --- | --- | --- |
| **KS-991** (2026-05-12) enumeration used | Yes — 7-tool baseline | Yes — same-day Cursor KS-991 leg | **Met** |
| Black-box (no Dynamo UI) | Yes | Yes | **PASS** |
| **2–3 fund identifiers** | **59 North Partners, LP** (primary cross-tool proof) | **2026 Fund** (primary), **59 North**, **36 South** sampled | **PASS** — complementary baselines |
| Second client (Antigravity, etc.) | Not run | Not run | **Open** |
| Local redacted JSON log tree | Not written | Not written | Evidence in repo reports only |

---

## 3. section 4.3 — Domain object map (8-tool v1.4 view)

**Legend:** **R** = read-only at MCP boundary · **A** = analysis artifact (ephemeral output)

| # | Tool | v1.4 | Registered | Inferred domain object(s) | Primary link keys (observed) | RW | Merged notes |
| ---: | --- | --- | :---: | --- | --- | --- | --- |
| 1 | `get_funds` | Available | Yes | **Fund** (full projection + lookups) | `Name`, `FundManagerName`, `PipelineStatus`, `AssetClassName` | R | **`totalRecords` 978** (both); **no Fund GUID** in list projection |
| 2 | `get_fund_description` | Available | Yes | **Fund** (narrow projection) | `ID` (GUID), `Name`, `FundManagerName`, `Description` | R | GUID pivot only on this tool |
| 3 | `get_notes` | Available | Yes | **Activity / note** | `ID`, `Subject`, `Funds`, `Companies`, `Body_Plaintext` (optional) | R | Default **Investment Due Diligence** category; **company** filters common |
| 4 | `get_activity` | Available | Yes | **Activity** (timeline) | `ID`, `Subject`, `Date`, `Funds`, `Companies`, `Activitycategories` | R | **`fundNames[]`** filter; overlaps `get_notes` on same rows |
| 5 | `get_documents` | Available | Yes | **Document** | `ID`, `Title`, `Funds`, `Companies`, `Documentcategories` | R | **≥1 filter** at runtime; content optional |
| 6 | `analyze_notes` | Available | Yes | **Activity → analysis artifact** | Filters: `companyNames[]`; output: summary / highlights / comparison | R (+ processing) | **Category hardcoding** (DD only) — **DMAP-F04**; egress path **disputed** — **F-02** |
| 7 | `llm_text_analysis` | Available | Yes | **Text / notes → LLM result** | `texts`, `provider`, optional note-fetch filters | R (+ external API when live) | **BLOCKED** both providers — **F-01** |
| 8 | `read_data` | **Planned** | No | **Tabular / warehouse** | SQL-level (when live) | R | **S (skipped)**; **section 1.4 HIGH** — **F-05** |

**Out of scope (v1.4):** `describe_table`, `get_rating_details`, `get_rating_summary`, `list_table`, `search_aloha_funds` — **not invoked** by either leg. Legacy ticket erDiagram (ratings / Aloha) is **historical only**.

**Entity scope (active vs removed):**

| Entity | Status | Tools |
| --- | --- | --- |
| **Fund** | Active | `get_funds`, `get_fund_description` |
| **Activity / note** | Active | `get_notes`, `get_activity`, `analyze_notes`, `llm_text_analysis` (when callable) |
| **Document** | Active | `get_documents` |
| **Contact** | Active (linked field) | `Contacts` string on Activity/Document rows — no dedicated tool |
| **Analysis artifact** | Active | `analyze_notes`, `llm_text_analysis` |
| **Aloha / ES, Rating, INFORMATION_SCHEMA** | **Out of scope** | Removed from v1.4 inventory |

**Detail depth:** Full Claude tool-to-entity table, entity scope, and v1.4 Mermaid ERD → **`KS-992 - Claude Result.md` sections 3 and 6.** Cursor compact map and fund-centric diagram → **`KS-992 - Cursor Result.md` sections 3–4.**

---

## 4. Cross-tool fund scope — behavioral (section D)

**Hypothesis (both legs):** Session-visible fund scope is **consistent** across overlapping **`get_*`** tools when linked by fund name / manager company strings.

### 4.1 Baseline A — **59 North Partners, LP** (Claude primary; Cursor partial)

| Tool | Claude Cowork | Cursor Agent |
| --- | --- | --- |
| `get_funds` | Fund in **978**-fund universe | Listed in `limit: 5` sample |
| `get_fund_description` | **PASS** — ID `D7879DB7-E230-4191-8849-DE4B7B64626C` | **PASS** — same ID; non-null `Description` |
| `get_activity` | **PASS** — **41** activities; `Funds`: `59 North Partners, LP;` | **PASS** — sample rows match fund name |
| `get_notes` | **PASS** — **76** notes via manager company filter | Not re-run on this fund |
| `get_documents` | **PASS** — **151** documents; consistent `Funds` / `Companies` on samples | Not re-run on this fund |
| `analyze_notes` | **0 notes** — category mismatch (Risk Management vs internal DD default) | Not re-run on this fund |

**Cross-tool identity (Claude):** Activity **`65ECCEA2-E55A-424B-AA52-9C30B522F211`** appears in both **`get_notes`** (company filter) and **`get_activity`** (fund filter) — same underlying row, dual filter paths.

### 4.2 Baseline B — **2026 Fund** (Cursor primary)

| Tool | Cursor Agent | Claude Cowork |
| --- | --- | --- |
| `get_fund_description` | **PASS** — ID `3F554983-6C4B-470F-B7A0-AC823EA4AFD1` | Not primary baseline |
| `get_activity` | **PASS** — 1 activity; `Funds`: `2026 Fund;` | Not primary baseline |
| `get_notes` | **PASS** — same activity **`7272B173-5B0B-44E8-AB55-A198ACF8AAC6`** via Phoenix Equity company filter | Not primary baseline |
| `get_documents` | **Soft-empty** — `success: true`, **0** rows | Not primary baseline |
| `analyze_notes` | **PASS** — structured analysis; **full note body** in response (redact in shared logs) | Not primary baseline |

**Merged cross-tool verdict:** **PASS with limitations.** **59 North** proves fund + activity + document linkage with **live ID match** across company vs fund filters; **2026 Fund** proves fund + activity + notes consistency but **does not** populate documents in Cursor’s fund filter. Linking uses **name strings**, not GUIDs, except when pivoting through **`get_fund_description`**.

**Limitations (unified):** No GUID filter on Activity/Document; **`get_funds`** omits Fund GUID; **`get_notes`** vs **`get_activity`** favor different filter dimensions; **`analyze_notes`** may return **0** for non–Investment Due Diligence categories; **`search_aloha_funds`** **not used** (v1.4).

---

## 5. Outbound, LLM-mediated, and high-risk paths (section C)

| Path | Tool | Data classes | Destination / status | E4 suites (merged) |
| --- | --- | --- | --- | --- |
| **External LLM** | `llm_text_analysis` | Note bodies, arbitrary `texts`, optional fetched notes | **OpenAI** / **Anthropic** — **path confirmed; smoke BLOCKED** (**F-01**) | PIJ-06–10, CHAIN-01/02, INJ |
| **Analysis processing** | `analyze_notes` | Activity note bodies (DD category default) | **Internal engine** (Claude inference) vs **vendor LLM in response** (Cursor observation) — **F-02** pending vendor | PIJ-01–05, CHAIN-03/04 |
| **Tabular read (planned)** | `read_data` | Arbitrary row sets | **Not registered** — **section 1.4 HIGH** when live | CHAIN, AUTH, SQLi regression |

**`llm_text_analysis` smoke (both):** Anthropic credit exhausted; OpenAI `Missing OPENAI_API_KEY` — aligned with **KS-991** **F-01** / **DEF-001**.

**Write tools:** **None** observed in the **7-tool** registry.

---

## 6. Baseline diff vs prior mapping

| Dimension | First Time Test (2026-04-24, 13-tool) | Second time (2026-05-12) | Assessment |
| --- | --- | --- | --- |
| Inventory under test | 13 tools incl. ES, ratings, schema | **8-tool v1.4** (**7** live) | **Scope change** per guide — not deployment drift |
| Tools registered | 7 (by KS-991 era) | **7** | **Stable** |
| `read_data` | Absent | **Absent** | **Planned/S** |
| `get_funds` totalRecords | 975 (2026-05-07 KS-991) | **978** | **+3** data growth |
| **`analyze_notes` egress** | External LLM (same as `llm_text_analysis`) | **Reclassified / disputed** — succeeds while `llm_text_analysis` blocked | **Updated** — **F-02** |
| Cross-tool proof | ES vs MSSQL (legacy) | **Behavioral `get_*` only** | v1.4 **excludes** `search_aloha_funds` |
| Live identity proof | Documented by category | **59 North** activity ID across **get_notes** + **get_activity** | **Enhanced** (Claude) |

---

## 7. Findings (unified)

| ID | Severity | Topic | Detail | Sources |
| --- | --- | --- | --- | --- |
| **KS-992-F-01** | Medium | **`llm_text_analysis` providers** | External LLM egress path documented; live smoke **BLOCKED** (Anthropic credits + missing OpenAI key) — architectural risk persists | Claude **DMAP-F01**; Cursor **G01**; KS-991 **F-01** |
| **KS-992-F-02** | Low | **`analyze_notes` processing** | Prior map treated as external LLM; **`analyze_notes` PASS** while **`llm_text_analysis` BLOCKED** suggests **internal or separately keyed** processing — vendor clarification recommended; Cursor still flags **full note body** in MCP response | Claude **DMAP-F02**; Cursor **G03** |
| **KS-992-F-03** | Info | **Dual filter paths** | Same Activity row reachable via **company** (`get_notes`) vs **fund** (`get_activity`) filters — **65ECCEA2** at 59 North | Claude **DMAP-F03**; Cursor **G02** |
| **KS-992-F-04** | Info | **`analyze_notes` categories** | No `activityCategories` param; internal DD default → **0** results for Risk Management–style funds | Claude **DMAP-F04** |
| **KS-992-F-05** | Info | **Name-string linking** | Cross-tool joins use fund/company **names**; Fund GUID only on **`get_fund_description`** | Claude **DMAP-F05** |
| **KS-992-F-06** | Info | **Soft-empty documents** | **`get_documents`** may return **`success: true`** with **0** rows (e.g. **2026 Fund** on Cursor) — not a hard error | Cursor **G04** |
| **KS-992-F-07** | Info | **`read_data` / second client** | **`read_data` S** until registered; Antigravity (or other) client not used | Both reports |

No additional Jira defects were filed from the Cursor leg; Claude findings remain in the test artifact IDs above.

---

## 8. BDD — v1.4 update section (merged)

| Scenario | Result | Notes |
| --- | --- | --- |
| **1 — Happy path** | **PASS** | **7** tools mapped; **`read_data` Planned/S**; outbound register; cross-tool evidence on **`get_*`** without Dynamo UI; E4 targeting documented (Claude section 10) |
| **2 — Error path** | **PASS** | Upstream physical schema **assumption pending**; **`analyze_notes`** egress ambiguity and **`llm_text_analysis`** env block recorded without halting map publication |
| **3 — Edge case (drift)** | **PASS / N/A** | No inventory drift vs **KS-991** (2026-05-12); **`read_data`** still absent; no restored out-of-scope tools |

---

## 9. Recommended E4 suite targets (from Claude leg)

| Suite | Primary tool(s) | Prerequisite |
| --- | --- | --- |
| PIJ-01–05 | `analyze_notes` | Available now |
| PIJ-06–10, CHAIN-01/02 | `llm_text_analysis` | **F-01** fix |
| CHAIN-03/04 | `analyze_notes`, `get_activity`, `get_notes` | Available now |
| INJ | All `get_*` filter params | Available now |
| AUTH | `get_funds`, `get_activity`, `get_documents` | Available now |
| FINDING-04 / tabular regression | `read_data` | **Not deployed** |

---

## 10. Definition of Done (v1.4 QA interpretation)

| Criterion | Status |
| --- | :---: |
| section 4.3 map (entities per tool) | Yes |
| Outbound / LLM path register | Yes |
| Cross-tool fund-scope evidence on **`get_*`** tools | Yes (with documented limitations) |
| **`read_data` Planned/S** + **section 1.4** tracking row | Yes |
| Evidence in repo QA space | Yes |
| **`llm_text_analysis` live** in all environments | **No** — **F-01** |
| Vendor confirmation of **`analyze_notes`** backend | **No** — **F-02** |
| Second MCP client repeat | **No** — **F-07** |

---

## 11. Paste-ready Jira comment

*KS-992 **second-time** merged QA (**Claude Cowork** + **Cursor**): v1.4 update section **section 4.3**. **7/7** tools mapped; **`read_data` Planned/S**; Aloha/ratings/schema tools **out of scope**. **Cross-tool:** **59 North** — same Activity ID across **get_notes** + **get_activity**; **2026 Fund** — fund/activity/notes align; **get_documents** may soft-empty. **`llm_text_analysis`** egress path documented but **BLOCKED** (providers — **F-01**). **`analyze_notes`** egress **reclassified / vendor TBD** (**F-02**). Fund count **978** (+3 vs 2026-05-07). Evidence: `Second Time Test/KS-992 Result.md` + agent result files.*

---

## 12. References

| Document | Path |
| --- | --- |
| **This merged result** | `Dynamo Server/Test Result/Second Time Test/KS-992 Result.md` |
| Claude detail | `Dynamo Server/Test Result/Second Time Test/KS-992 - Claude Result.md` |
| Cursor detail | `Dynamo Server/Test Result/Second Time Test/KS-992 - Cursor Result.md` |
| Enumeration baseline | `Dynamo Server/Test Result/Second Time Test/KS-991 Result.md` |
| Prior consolidated map (13-tool era) | `Dynamo Server/Test Result/First Time Test/KS-992 Result.md` |
| Guide v1.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide_v1.4.md` |
| Stories v1.2 | `Dynamo Server/Test Guide/dynamo_mcp_testing_stories_v1.2.md` |

---

*Merged **2026-05-12** from Claude Cowork and Cursor second-time KS-992 runs. **Verdict: PASS with open items** — v1.4 domain map and outbound register complete for deployed surface; **`llm_text_analysis`** provider restoration and **`analyze_notes`** backend clarification remain open.*
