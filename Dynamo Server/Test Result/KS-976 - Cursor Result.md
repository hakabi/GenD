# Test Report: KS-976 — Dynamo MCP QA (Tool registration & visibility)

| Field | Value |
| --- | --- |
| **Jira** | [KS-976](https://gendvn.atlassian.net/browse/KS-976) |
| **Ticket summary** | Dynamo MCP QA — Verify all 13 MCP tools are registered and visible |
| **Initial test date** | 2026-04-23 (first run — blocked) |
| **Re-test / update date** | 2026-04-23 (post OAuth / port fix — **PASS**) |
| **Client under test** | **Cursor** (Agent / Composer session; workspace `GenD`) |
| **Out of scope (this report)** | Claude Code, Claude Desktop, Antigravity — second client per ticket remains with you |
| **Canonical inventory** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` §1.3 (13 tools, April 2026) |

---

## 1. Objective (from ticket)

Confirm that **every tool listed in guide §1.3** is **registered and visible** to the MCP client so that functional and security tests cover the deployed surface.

**Expected tool names (13):**

| # | Tool | §1.4 high-risk | Descriptor in `mcps/.../tools/` | Agent invoke smoke |
| ---: | --- | --- | :---: | :---: |
| 1 | `analyze_notes` | — | Yes | Not invoked (not required for KS-976) |
| 2 | `describe_table` | **HIGH** | Yes | Not invoked |
| 3 | `get_activity` | — | Yes | Not invoked |
| 4 | `get_documents` | — | Yes | Not invoked |
| 5 | `get_fund_description` | — | Yes | Not invoked |
| 6 | `get_funds` | — | Yes | **Yes** — success |
| 7 | `get_notes` | — | Yes | Not invoked |
| 8 | `get_rating_details` | — | Yes | Not invoked |
| 9 | `get_rating_summary` | — | Yes | Not invoked |
| 10 | `list_table` | **HIGH** | Yes | **Yes** — success |
| 11 | `llm_text_analysis` | — | Yes | Not invoked |
| 12 | `read_data` | **HIGH** | Yes | Not invoked |
| 13 | `search_aloha_funds` | — | Yes | Not invoked |

**Comparison to §1.3:** **13/13** tool names present in the Cursor MCP cache; **no extra** tool files; **no missing** tools.

---

## 2. Environment (re-test)

| Item | Observation |
| --- | --- |
| **Workspace MCP config** | `.cursor/mcp.json` currently has `"mcpServers": {}` — **Conceptia Dynamo is configured in Cursor UI (user MCP settings)**, not in the repo file for this snapshot. SSE URL per prior setup: `https://mcp.conceptia.com/dynamo/sse` via `mcp-remote` (guide §2.4). |
| **Cursor MCP filesystem cache** | `…/mcps/user-conceptia-dynamo/tools/` contains **13** JSON tool descriptors (`*.json`), one per tool — matches successful MCP registration and sync. |
| **Server identifier** | `SERVER_METADATA.json`: `serverIdentifier` `user-conceptia-dynamo`, `serverName` `conceptia-dynamo`. |
| **Agent runtime MCP** | `call_mcp_tool` to `user-conceptia-dynamo` **succeeds** (OAuth/session operational). |

---

## 3. Test method (Cursor agent)

1. **Filesystem enumeration** — Listed `mcps/user-conceptia-dynamo/tools/*.json` and compared names to §1.3.
2. **Drift check** — Confirmed count = **13**, no unexpected tool names.
3. **Runtime smoke (representative)** — Invoked `get_funds` (`limit: 1`) and `list_table` (`parameters: []`) to confirm tools are not only listed but executable from the agent bridge.
4. **§1.4 tracking** — Confirmed high-risk tools **`list_table`**, **`describe_table`**, **`read_data`** are present in inventory; one high-risk tool (`list_table`) smoke-called successfully.

*Per ticket:* Claude Desktop tool count and Claude Code `/mcp` were **not** re-executed in this session; add those logs when you complete the second client.

---

## 4. Results

### 4.1 Tool list visibility

| Criterion | Result | Evidence |
| --- | --- | --- |
| All 13 §1.3 names visible in Cursor MCP cache | **Pass** | 13 matching `*.json` files under `mcps/user-conceptia-dynamo/tools/`. |
| Enumeration matches canonical table (no missing/extra) | **Pass** | Set equality with §1.3 list. |
| Agent can invoke MCP tools | **Pass** | `get_funds` and `list_table` returned successful responses. |
| §1.4 high-risk tools listed and trackable | **Pass** | `list_table`, `describe_table`, `read_data` present; `list_table` smoke **Pass**. |

**Overall result for KS-976 on Cursor (this agent):** **PASS** for tool registration and visibility, with representative runtime confirmation.

### 4.2 BDD scenarios (ticket / guide §3.3, Cursor only)

| Scenario | Result | Notes |
| --- | --- | --- |
| **1 — Happy path** (OAuth OK → list tools → all 13 appear) | **Met** | 13 tools in MCP cache; agent successfully called tools after OAuth fix. |
| **2 — Error path** (0 tools → escalate per §9) | **N/A** | Tools enumerated; not triggered. |
| **3 — Edge case** (new tool / drift vs §1.3) | **Pass (no drift)** | No unexpected tools; if the vendor adds a 14th tool later, re-run discovery per guide. |

---

## 5. Follow-up (outside this run)

1. **Second client:** Run the same enumeration on **Claude Code** (`/mcp`) and attach output to KS-976 for the multi-client matrix (guide §2.4).
2. **Optional:** Capture Cursor **Settings → MCP** screenshot or “N tools enabled” string for audit trail.
3. **Downstream:** §1.4 tools (`list_table`, `describe_table`, `read_data`) remain in scope for **KS-981** and security stories — this ticket only confirms they are **registered and visible**.

---

## 6. Artifacts

| Artifact | Location |
| --- | --- |
| This report | `Dynamo Server/Test Result/KS-976-cursor-agent-tool-enumeration-2026-04-23.md` |
| Tool descriptors (13) | Cursor project cache: `mcps/user-conceptia-dynamo/tools/*.json` |
| QA guide reference | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` §1.3, §1.4, §3.3 |

---

## 7. Sign-off

- **Executed by:** Cursor Agent (Composer), workspace `GenD`, **2026-04-23 (re-test)**  
- **KS-976 (Cursor):** **PASS** — all 13 tools registered and visible; representative invocations successful.  
- **Ticket closure:** Cursor leg satisfied; complete **Claude Code** leg per your test plan if the ticket’s Definition of Done requires two clients.
