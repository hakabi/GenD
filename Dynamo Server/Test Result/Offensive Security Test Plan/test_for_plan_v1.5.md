# Dynamo MCP Server — Tool Classification & Security Risk Map (v1.5)

**Purpose:** This document provides a domain mapping and risk assessment of the **10 MCP tools** registered on the Conceptia Dynamo server as of guide v1.5 (2026-05-07). It is designed to guide security testing (CHAIN, PIJ) and high-risk tracking.

**v1.5 revision note:** Three tools (`get_rating_details`, `get_rating_summary`, `search_aloha_funds`) were permanently removed from the Dynamo MCP server on 2026-05-07. This reduces the total inventory from **13 → 10 tools**. The `fad API` external egress path and `Elasticsearch` injection surface are both eliminated as a result. All references below reflect the current live v1.5 10-tool surface.

---

## 1. Column Definitions & Legend

* **Tool:** The specific name of the **10 tools** registered on the MCP server (v1.5).
* **Class (R):** All 10 tools are labeled **R (read-only)**. By design, they only possess permissions to fetch/retrieve data and cannot Create, Update, or Delete (CUD) data in the upstream Dynamo system.
* **§1.4 (HIGH):** Marks tools identified as **High-Risk** according to Section 1.4 of the testing guide.
* **External:** Indicates if the tool calls a third-party system, service, or API (representing a data egress path).

---

## 2. Tool Classification by Risk Profile

For effective "attack-based" testing, the **10 active v1.5 tools** are categorized into three primary groups:

### Group 1: Data Structure Exposure (High-Risk)
**Tools:** `describe_table` (#2), `list_table` (#8), and `read_data` (#10).

* **Characteristics:** Explicitly flagged as **HIGH** risk in the §1.4 guide.
* **QA Focus:** These tools are dangerous because they reveal the underlying database architecture (table names, columns) and allow direct reads of raw tabular data.
* **Testing Goal:** Focus heavily on **Authorization (AUTH)** to see if the system correctly restricts what an agent can "see" versus what it is allowed to "access".
* **v1.5 status:** All three tools restored in v1.5 (were removed in Second Time Test period). VULN-01 (KS-1023, Critical) and VULN-02 (KS-1024, High) confirmed exploitable by both Cursor and Claude in Third Time Test.

### Group 2: External Egress & LLM-Mediated Paths
**Tools:** Tools involving external system calls or third-party processing.

* **`analyze_notes` (#1) & `llm_text_analysis` (#9):** These send data to external Large Language Models (OpenAI/Anthropic). They are the **Primary Targets** for **Prompt Injection (PIJ)** and **Data Exfiltration** scenarios.
  * `analyze_notes` — uses an internal server-side execution path; **not** blocked by KS-1002. PIJ/exfiltration tests PASS (Third Time Test).
  * `llm_text_analysis` — blocked by KS-1002 (Anthropic model `claude-3-5-sonnet-20240620` deprecated — 404 error; OpenAI key absent). Remains **Primary Untested PIJ Target** until KS-1002 is resolved.

* ~~**`get_rating_details` (#8) & `get_rating_summary` (#9):** Reliant on the `fad API`.~~ — **PERMANENTLY REMOVED (2026-05-07).** The `fad API` external egress path is **eliminated**. These tools are no longer part of the v1.5 inventory and are not testable.

* ~~**`search_aloha_funds` (#13):** Utilizes `Elasticsearch`.~~ — **PERMANENTLY REMOVED (2026-05-07).** The Elasticsearch injection surface is **eliminated**. This tool is no longer part of the v1.5 inventory and is not testable.

> **v1.5 egress summary:** Group 2 now consists of only `analyze_notes` and `llm_text_analysis`. The `fad API` and `Elasticsearch` egress paths are **confirmed eliminated** by the 2026-05-07 removal. Cross-tenant risk from `search_aloha_funds` is also eliminated.

### Group 3: Standard Internal Data Fetching
**Tools:** `get_activity` (#3), `get_documents` (#4), `get_fund_description` (#5), `get_funds` (#6), and `get_notes` (#7).

* **Characteristics:** Purely data retrieval (R) with no high-risk flags or external egress paths.
* **QA Focus:** These are relatively "safe" but should be tested for **Input Validation (INJ)**—such as passing malformed Fund IDs—and **Cross-Tenant Leakage** (ensuring User A cannot see User B's notes).
* **v1.5 status:** All five tools PASS INJ and cross-tenant checks in Third Time Test (both Cursor and Claude). No new findings.

---

## 3. v1.5 10-Tool Inventory

| # | Tool | Group | §1.4 HIGH | External | v1.5 Status |
|---|---|---|---|---|---|
| 1 | `analyze_notes` | 2 — LLM-mediated | — | Anthropic/OpenAI (internal path) | ✅ Active — PASS |
| 2 | `describe_table` | 1 — Schema exposure | ✅ HIGH | None | ✅ Active — PASS (⚠️ chain risk) |
| 3 | `get_activity` | 3 — Standard fetch | — | None | ✅ Active — PASS |
| 4 | `get_documents` | 3 — Standard fetch | — | None | ✅ Active — PASS |
| 5 | `get_fund_description` | 3 — Standard fetch | — | None | ✅ Active — PASS |
| 6 | `get_funds` | 3 — Standard fetch | — | None | ✅ Active — PASS |
| 7 | `get_notes` | 3 — Standard fetch | — | None | ✅ Active — PASS |
| 8 | `list_table` | 1 — Schema exposure | ✅ HIGH | None | ✅ Active — PASS |
| 9 | `llm_text_analysis` | 2 — LLM-mediated | — | Anthropic/OpenAI | ⚠️ Active — BLOCKED (KS-1002) |
| 10 | `read_data` | 1 — Schema exposure | ✅ HIGH | None | ✅ Active — PASS (authorized) · ❌ FAIL (VULN-01/02) |
| — | ~~`get_rating_details`~~ | ~~2~~| — | ~~fad API~~ | ❌ **Permanently removed 2026-05-07** |
| — | ~~`get_rating_summary`~~ | ~~2~~ | — | ~~fad API~~ | ❌ **Permanently removed 2026-05-07** |
| — | ~~`search_aloha_funds`~~ | ~~2~~ | — | ~~Elasticsearch~~ | ❌ **Permanently removed 2026-05-07** |

---

## 4. Domain Object Mapping (v1.5)

The following mapping identifies which domain objects each tool touches. Removed tools are shown for historical reference only.

| Domain Object | Active v1.5 Tools | Removed Tools (historical) |
| :--- | :--- | :--- |
| **Funds** | `get_funds`, `get_fund_description` | ~~`search_aloha_funds`~~ (removed) |
| **Notes** | `get_notes`, `analyze_notes` | — |
| **Documents** | `get_documents` | — |
| **Ratings** | — | ~~`get_rating_summary`~~, ~~`get_rating_details`~~ (removed) |
| **Activity** | `get_activity` | — |
| **System/Schema** | `list_table`, `describe_table`, `read_data` | — |
| **LLM analysis** | `llm_text_analysis` (blocked — KS-1002) | — |

---

## 5. Eliminated Egress Paths (v1.5 Confirmation)

| Egress path | Tool(s) | Previous risk | v1.5 status |
|---|---|---|---|
| `fad API` external calls | `get_rating_details`, `get_rating_summary` | External data egress, potential SSRF | ✅ **Eliminated** — tools removed 2026-05-07 |
| `Elasticsearch` query injection | `search_aloha_funds` | ES syntax injection, cross-tenant `is_owned_by_ks` flag | ✅ **Eliminated** — tool removed 2026-05-07 |

No external egress paths remain in Group 2 other than the LLM provider calls made by `analyze_notes` and `llm_text_analysis`.

---

## 6. Open Security Items (v1.5)

| Priority | ID | Severity | Tool | Description |
|---|---|---|---|---|
| 1 | KS-1023 | **Critical** | `read_data` | VULN-01 — Join-based allowlist bypass. `SELECT TOP 5 T.name FROM Fund F, sys.tables T` returns `sys.tables` data. Vendor must validate all query join targets, not first table only. |
| 2 | KS-1024 | **High** | `read_data` | VULN-02 — No server-side row limit. `SELECT * FROM Fund` returns full table (~28 MB / 2,143 rows). Vendor must enforce a server-side row cap (e.g. 1,000 rows max). |
| 3 | KS-1002 | **Blocker** | `llm_text_analysis` | Anthropic model `claude-3-5-sonnet-20240620` deprecated (404). OpenAI key absent. Vendor must update model string to a current model (e.g. `claude-sonnet-4-5`). Primary PIJ target remains untested until resolved. |
| 4 | F-06 | **Medium** | All unauthorized columns | No low-scope Entra test identity provisioned — cross-tenant isolation tests (Scenario 3) not executable across rows 5.1, 5.3, 5.4, 5.5. |

---

> **Summary for Lead (v1.5):** Testing effort should continue to prioritize the **LLM-mediated tools (`analyze_notes` #1, `llm_text_analysis` #9)** for exfiltration and the **schema/tabular tools (`describe_table` #2, `list_table` #8, `read_data` #10)** for schema exposure and VULN-01/02 remediation verification. The `fad API` and Elasticsearch egress surfaces are fully eliminated from scope. Tool count is **10** (down from 13).

---

*v1.5 revision: 2026-05-22 · Source: plan.md (original 13-tool map) · Guide: dynamo-mcp-testing-guide_v1.5.md · Third Time Test consolidated results: KS-977–KS-993 Result.md*
