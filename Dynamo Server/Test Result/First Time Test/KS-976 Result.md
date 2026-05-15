# KS-976 — Final Test Result: Dynamo MCP QA (Tool Registration & Visibility)

| Field | Value |
| --- | --- |
| **Jira** | [KS-976](https://gendvn.atlassian.net/browse/KS-976) |
| **Epic** | Dynamo MCP — Environment, Access & Connectivity |
| **Ticket title** | Dynamo MCP QA — Verify all 13 MCP tools are registered and visible |
| **MCP server** | `conceptia-dynamo` |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` (HTTP/SSE via `mcp-remote` per testing guide) |
| **Canonical inventory** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` section 1.3 (April 2026) |
| **Report date** | 2026-04-23 |
| **Sources merged** | `KS-976-cursor-agent-tool-enumeration-2026-04-23.md`, `KS-976 - Claude Result.md` |

---

## 1. Executive summary

**Requirement (KS-976):** As an internal QA tester, ensure every tool in guide **section 1.3** appears in the MCP client so functional and security work targets the real deployed surface.

**Outcome:** **PASS** for **two independent MCP clients** tested in this cycle:

| Client | Role in this result | Tools visible | Enumeration vs section 1.3 | Runtime confirmation |
| --- | --- | --- | --- | --- |
| **Cursor** (Agent / Composer, workspace `GenD`) | Primary agent-side verification | **13 / 13** | Exact match; no extras | `get_funds`, `list_table` invoked successfully |
| **Claude Cowork** (Desktop — Cowork mode) | Full tool/schema review | **13 / 13** | Exact match; no extras | All 13 tools visible; per-tool **schema validated** in client |

**Inventory drift:** None. **Scenario 3** (new tool → refresh section 1.3 / discovery) **not** triggered.

**section 1.4 high-risk tools:** `list_table`, `describe_table`, `read_data` are **present** and flagged for downstream work (**KS-981** and security suites), not blocked by KS-976.

**Guide section 2.4 note:** Internal QA may still require **Antigravity** (or other in-house standard clients) in a broader matrix. That leg was **not** executed in the two source reports; status is **pending** if your program mandates it explicitly.

---

## 2. Ticket traceability

| KS-976 theme | How this result addresses it |
| --- | --- |
| Compare visible tool list to section 1.3 | Both clients show **exactly 13** tools matching the table; **no missing, no extra**. |
| Verify all 13 named tools | Confirmed in Cursor (filesystem cache + smoke calls) and Claude (visibility + schema). |
| Optional prompt: list every tool | Satisfied by explicit enumeration in both runs. |
| Flag section 1.4 tools for separate tracking | All three high-risk tools **listed**; Claude run documented risk rationale; Cursor smoke-used `list_table`. |
| Repeat on a second client | **Cursor** + **Claude Cowork** satisfy a **two-client** check. **Antigravity** remains open if required by internal policy (see section 7). |
| Claude Desktop / Connectors; Claude Code `/mcp` | **Claude Cowork (Desktop)** used instead of classic Connectors wording; behavior aligns with “list tools + OAuth” intent. **Claude Code `/mcp`** was not a separate artifact in source reports. |

---

## 3. Consolidated tool inventory (section 1.3)

Legend: **Cursor** = descriptor in MCP cache + smoke where noted; **Claude** = visible + schema validated per Claude report.

| # | Tool | section 1.4 | Cursor | Claude (schema) | Purpose (from Claude validation summary) |
| ---: | --- | --- | :---: | :---: | --- |
| 1 | `analyze_notes` | — | Descriptor + cache | Yes | Notes retrieval and structured analysis (summary, highlights, YoY-style themes). |
| 2 | `describe_table` | **HIGH** | Descriptor | Yes | MSSQL table schema (columns/types). |
| 3 | `get_activity` | — | Descriptor | Yes | Activity search with filters; response size cap; pagination. |
| 4 | `get_documents` | — | Descriptor | Yes | Document records with fund/category/date filters. |
| 5 | `get_fund_description` | — | Descriptor | Yes | Fund descriptions with manager, asset class, pipeline filters. |
| 6 | `get_funds` | — | Descriptor; **invoked** | Yes | Fund list with resolved lookups (manager, asset class, pipeline, contacts). |
| 7 | `get_notes` | — | Descriptor | Yes | Due diligence notes; category default; pagination/truncation. |
| 8 | `get_rating_details` | — | Descriptor | Yes | User-scoped rating details (email/UPN). |
| 9 | `get_rating_summary` | — | Descriptor | Yes | Rating summary; chains with `search_aloha_funds`. |
| 10 | `list_table` | **HIGH** | Descriptor; **invoked** | Yes | MSSQL table listing (optional schema filter). |
| 11 | `llm_text_analysis` | — | Descriptor | Yes | LLM text analysis (multiple analysis modes/vendors). |
| 12 | `read_data` | **HIGH** | Descriptor | Yes | **SELECT-only** MSSQL queries; destructive ops blocked at schema. |
| 13 | `search_aloha_funds` | — | Descriptor | Yes | Elasticsearch fund search; returns `fund_id` / `source` for chaining. |

**Totals:** **13 / 13** tools in both clients; **combined evidence** = Cursor execution smoke + Claude full schema pass.

---

## 4. section 1.4 High-risk tool checklist (for KS-981)

| Tool | Present | Notes |
| --- | :---: | --- |
| `list_table` | Yes | Schema surface exposure; Cursor smoke call succeeded. |
| `describe_table` | Yes | Column/type metadata exposure. |
| `read_data` | Yes | Direct tabular read path; SELECT-only enforcement noted in Claude schema review. |

---

## 5. BDD acceptance criteria — consolidated

| Scenario | Given / When / Then (ticket) | Result | Evidence |
| --- | --- | --- | --- |
| **1 — Happy path** | OAuth OK → list tools → all 13 appear | **PASS** | Claude: Run 2 after OAuth, 13/13. Cursor: OAuth stable post-fix; 13 descriptors + successful tool calls. |
| **2 — Error path** | 0 tools → follow guide section 9 / escalate | **Observed then resolved** | Claude Run 1: 0/13 until OAuth. Cursor: earlier blocked session (server error / port **EADDRINUSE**); remediated; re-test PASS. |
| **3 — Edge case** | New tool → inventory drifts from section 1.3 → trigger discovery | **PASS (no drift)** | No 14th tool; inventory matches section 1.3 exactly. |

---

## 6. Environment & incidents (for audit)

### 6.1 Cursor

- **Config snapshot:** `.cursor/mcp.json` may be empty in repo; **Conceptia Dynamo** configured via **Cursor MCP UI** (user settings).
- **Evidence types:** `mcps/user-conceptia-dynamo/tools/` — **13** JSON tool definitions; agent `call_mcp_tool` to `user-conceptia-dynamo`.
- **Incident (earlier cycle):** OAuth callback port **37189** **EADDRINUSE** (stale `node.exe` / duplicate connector). Resolved by freeing port, single connector instance, reconnect.

### 6.2 Claude Cowork (Desktop)

- **Incident:** Run 1 blocked until **OAuth** completed for `conceptia-dynamo`.
- **Evidence:** Run 2 — connector **Connected**, **13/13** tools; per-tool schema validation recorded in Claude result.

---

## 7. Multi-client matrix vs guide section 2.4

| Client | KS-976 coverage in this package | Status |
| --- | --- | --- |
| **Cursor** | Full enumeration + representative invocation | **Complete — PASS** |
| **Claude Cowork (Desktop)** | Full enumeration + schema validation | **Complete — PASS** |
| **Claude Code** (`/mcp`) | Not supplied as a standalone log in source reports | **Not evidenced here** |
| **Antigravity** | Called out in Claude result as internal follow-up | **Pending** (if required by your QA program) |

**Practical sign-off:** For **KS-976** as written (13 tools registered and visible, **two clients**), this package supports **PASS** with the caveat that **Antigravity** (or **Claude Code** if substituted in your test plan) should be run if your **Definition of Done** mandates a specific second product.

---

## 8. Definition of Done (ticket-level)

| Criterion | Status |
| --- | :---: |
| All section 1.3 tools visible in tested clients | **Yes** (13/13 × 2 clients) |
| No unexplained missing/extra tools | **Yes** |
| section 1.4 tools identified for downstream security stories | **Yes** |
| Second client / matrix | **Partially complete** — **Cursor + Claude Cowork** done; **Antigravity** (and optionally **Claude Code** log) **open** if mandatory |

---

## 9. Conclusion

The **Conceptia Dynamo** MCP server exposes **exactly the 13 tools** defined in testing guide **section 1.3**, with **no inventory drift**, in both **Cursor** and **Claude Cowork** after successful authentication. Representative **runtime** use in Cursor and **schema-level** confirmation in Claude support that the **deployed MCP surface** matches documentation. High-risk discovery/read tools are **present** and **tracked** for **KS-981**.

**Recommended Jira comment (paste-ready):**  
*KS-976 closed for tool registration/visibility: 13/13 tools confirmed in Cursor (cache + smoke: `get_funds`, `list_table`) and Claude Cowork (13/13 + schema validation). No extra/missing tools. section 1.4 tools flagged for KS-981. Antigravity (section 2.4) still pending if required by internal client matrix.*

---

## 10. References

| Document | Path / link |
| --- | --- |
| This consolidated result | `Dynamo Server/Test Result/KS-976 Result.md` |
| Cursor detail | `Dynamo Server/Test Result/KS-976-cursor-agent-tool-enumeration-2026-04-23.md` |
| Claude Cowork detail | `Dynamo Server/Test Result/KS-976 - Claude Result.md` |
| QA guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` (section 1.3, section 1.4, section 2.4, section 3.3, section 9) |

---

## 11. Updated requirements — May 2026 (7-tool production baseline)

**Effective for KS-976 reassessment only.** This section adds the **current deployed** expectation for `conceptia-dynamo`. It does **not** replace sections 1–10, which document the April 2026 **13-tool** baseline and historical results.

**Overview (updated):** Validates section 3.3 against the **current 7-tool** MCP registry. Enumeration must match this baseline with **no unexplained extras**. Six tools from the original 13-tool inventory are **removed** (intentional production hardening, confirmed 2026-05-07).

**Detailed requirements (updated):**

- Compare the visible tool list to the **7-tool baseline** below; flag any **missing active** tool or **unexpected extra** tool to the vendor.
- Verify these **7 active tools** appear in the client and are callable after OAuth: `analyze_notes`, `get_activity`, `get_documents`, `get_fund_description`, `get_funds`, `get_notes`, `llm_text_analysis`.
- Confirm these **6 removed tools** do **not** appear in the client registry: `describe_table`, `get_rating_details`, `get_rating_summary`, `list_table`, `read_data`, `search_aloha_funds`. If any removed tool reappears, trigger E2 discovery re-run (KS-991 / KS-992) immediately.
- Optional prompt: *"List every tool available from the conceptia-dynamo MCP server."*
- **section 1.4 high-risk tools** (`list_table`, `describe_table`, `read_data`) are **out of scope for visibility on the current server** because they are **removed**; track as removed/hardened under KS-981, not as KS-976 missing tools.
- Repeat on a **second client**, including **Antigravity** where used internally (guide section 2.4), where required by the QA matrix.

**Active tool inventory (current baseline):**

| # | Tool | Category (guide section 1.3) | Expected status |
| ---: | --- | --- | --- |
| 1 | `analyze_notes` | Analysis | Active |
| 2 | `get_activity` | Data fetch | Active |
| 3 | `get_documents` | Data fetch | Active |
| 4 | `get_fund_description` | Data fetch | Active |
| 5 | `get_funds` | Data fetch | Active |
| 6 | `get_notes` | Data fetch | Active |
| 7 | `llm_text_analysis` | Analysis | Active |

**Acceptance criteria (BDD) — updated:**

| Scenario | Given / When / Then | Expected outcome |
| --- | --- | --- |
| **1 — Happy path** | OAuth succeeded → list tools | Exactly the **7 active** tool names above appear; representative runtime invocation succeeds (minimum smoke: `get_funds`) |
| **2 — Error path** | 0 tools listed → check section 9 | Issue escalated (tool registration / protocol version) with logs |
| **3 — Edge case** | Inventory **drifts** from the **7-tool baseline** (removed tool reappears, new tool added, or active tool missing without documented removal) | E2 discovery (KS-991 / KS-992) is triggered and KS-976 expectations are re-reviewed |

**Definition of Done (updated interpretation for KS-976):**

- All **7 active** tools visible in tested clients; **0 unexplained extras**.
- **6 removed** tools absent unless the vendor documents restoration.
- Second-client coverage per guide section 2.4 where mandated by the QA matrix.

**Latest Cursor retest (2026-05-11):** Connected; **7/7** active tools cached; **6/6** removed tools not found; `get_funds` smoke **PASS** (`totalRecords: 978`).
