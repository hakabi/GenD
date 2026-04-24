# KS-976 — Dynamo MCP QA: Verify All 13 MCP Tools Are Registered and Visible
**Jira:** [KS-976](https://gendvn.atlassian.net/browse/KS-976)  
**Epic:** Dynamo MCP — Environment, Access & Connectivity  
**Tester:** Bình Hà Khoa  
**Date:** 2026-04-23  
**Client:** Claude Cowork (Desktop App — Cowork Mode)  
**Status:** ✅ PASSED (Claude client) | ⏳ Pending (Antigravity second client)

---

## Test Objective

Validate that all 13 tools listed in §1.3 of the canonical inventory are registered and visible in the client, so that functional and security tests cover the real deployed surface.

**MCP Server:** `conceptia-dynamo`  
**Server URL:** `https://mcp.conceptia.com/dynamo/sse`

---

## Test Execution Summary

### Run 1 — Initial Attempt (BLOCKED)

| Field | Detail |
|-------|--------|
| Time | 2026-04-23 |
| Outcome | ❌ Blocked |
| Root Cause | `conceptia-dynamo` connector not authenticated (OAuth not completed) |
| Tools Visible | 0 / 13 |
| BDD Scenario | Scenario 2 — Error Path triggered |

The connector was found in the MCP registry but was not connected. OAuth authentication was required before tools could be enumerated.

---

### Run 2 — After OAuth Connection (PASSED)

| Field | Detail |
|-------|--------|
| Time | 2026-04-23 |
| Outcome | ✅ Passed |
| Connector Status | Connected |
| Tools Visible | 13 / 13 |
| BDD Scenario | Scenario 1 — Happy Path confirmed |

---

## Tool Enumeration Results — §1.3 Canonical Table

| # | Tool Name | Visible | Schema Validated | Description | Risk |
|---|-----------|:-------:|:----------------:|-------------|------|
| 1 | `analyze_notes` | ✅ | ✅ | Retrieves notes and returns comprehensive analysis with summary, highlights, and YoY comparison (strategy, macro, risk, performance) | — |
| 2 | `describe_table` | ✅ | ✅ | Describes the schema (columns and types) of a specified MSSQL Database table | ⚠️ HIGH |
| 3 | `get_activity` | ✅ | ✅ | Searches the Activity table with flexible filtering by dates, category, company, author, subject, and fund. 2MB response cap; supports pagination | — |
| 4 | `get_documents` | ✅ | ✅ | Retrieves document fields from the Document table. Supports filtering by fund, company, document category, and date range | — |
| 5 | `get_fund_description` | ✅ | ✅ | Retrieves fund descriptions from the Fund table with manager, asset class, pipeline status, and date filters | — |
| 6 | `get_funds` | ✅ | ✅ | Retrieves full fund details with resolved lookup data including manager info, asset class, pipeline status, and responsible contacts | — |
| 7 | `get_notes` | ✅ | ✅ | Retrieves Investment Due Diligence notes from Activity table. Defaults to `Investment Due Diligence` category; supports pagination and body truncation | — |
| 8 | `get_rating_details` | ✅ | ✅ | Fetches user-scoped rating detail rows from fad_compute_server. Requires user email/UPN | — |
| 9 | `get_rating_summary` | ✅ | ✅ | Fetches rating summary rows from fad_compute_server. Chains with `search_aloha_funds` for fund_id and source | — |
| 10 | `list_table` | ✅ | ✅ | Lists tables in an MSSQL Database, optionally filtered by schema | ⚠️ HIGH |
| 11 | `llm_text_analysis` | ✅ | ✅ | Runs AI text analysis via OpenAI or Anthropic (Claude). Supports summary, highlights, topics, sentiment, compare, and custom analysis types | — |
| 12 | `read_data` | ✅ | ✅ | Executes SELECT-only queries on MSSQL Database. Destructive SQL operations are blocked at schema level | ⚠️ HIGH |
| 13 | `search_aloha_funds` | ✅ | ✅ | Searches Elasticsearch for Aloha funds across indices: `alb_funds`, `solovis_funds`, `alt_evest_funds`, `evest_funds`. Returns `fund_id` and `source` for chaining | — |

**Total: 13 / 13 tools visible and schema-validated ✅**

---

## Extra Tools Check

No tools beyond the 13 canonical entries were detected. Inventory exactly matches §1.3.  
→ Scenario 3 (E2 discovery story) is **not triggered**.

---

## §1.4 High-Risk Tools — Flagged for KS-981

The following 3 tools are confirmed present and flagged for separate downstream security testing in **KS-981**:

| Tool | Risk Reason | Mitigation Noted |
|------|-------------|-----------------|
| `list_table` | Exposes full database schema surface | Schema-level filtering available |
| `describe_table` | Reveals column names and types for any table | Read-only; no data exposed |
| `read_data` | Direct SQL execution on production MSSQL | SELECT-only enforced at schema level; destructive ops blocked |

---

## BDD Acceptance Criteria — Results

| Scenario | Condition | Result |
|----------|-----------|--------|
| Scenario 1 — Happy Path | Given OAuth succeeded → When tester lists tools → Then all 13 appear | ✅ PASSED |
| Scenario 2 — Error Path | Given 0 tools listed → When tester checks §9 → Then issue escalated | N/A — Resolved via OAuth during test run |
| Scenario 3 — Edge Case | Given new tool appears → When inventory drifts from §1.3 → Then E2 discovery triggered | ✅ PASSED — No drift detected |

---

## Second Client Verification

| Client | Status |
|--------|--------|
| Claude Cowork (Desktop) | ✅ Complete — 13/13 tools verified |
| Antigravity (§2.4) | ⏳ Pending — requires separate testing by a human tester in the Antigravity environment |

> **Note:** The Antigravity second-client test cannot be performed by Claude. A tester must log into Antigravity and verify the same 13 tools appear there to fully satisfy the Definition of Done.

---

## Conclusion

The `conceptia-dynamo` MCP server has **all 13 tools correctly registered and visible** in the Claude Cowork client following successful OAuth authentication. The canonical §1.3 tool inventory is an exact match with no missing or extra tools. The 3 high-risk tools (`list_table`, `describe_table`, `read_data`) have been flagged for KS-981.

**Remaining action:** Complete second-client verification on **Antigravity** per §2.4.
