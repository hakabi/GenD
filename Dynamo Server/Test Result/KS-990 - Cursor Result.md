# KS-990 — Cursor Result: Configure MCP Client and Connect to SSE Endpoint

| Field | Value |
| --- | --- |
| **Jira** | [KS-990](https://gendvn.atlassian.net/browse/KS-990) |
| **Epic** | Dynamo MCP — Environment, Access & Connectivity |
| **Story** | Dynamo MCP QA — Configure MCP client and connect to SSE endpoint |
| **Guide mapping** | §2.2 (Node), §2.4 (clients), §3.1–§3.2 (install/connect), §3.3 (verify), §9 (troubleshooting) |
| **Initial run** | 2026-04-23 — **BLOCKED** (MCP not connected; see §8 history) |
| **Re-test run** | **Current session** — **PASS (Cursor leg)** after successful Dynamo MCP reconnect |
| **Client under test** | **Cursor** (Agent / Composer; workspace `GenD`) |
| **Tester (automated leg)** | Cursor Agent (Composer) |

---

## 0. Blocker status

| ID | Status | Notes |
| --- | --- | --- |
| **KS-990-CUR-B01** (prior) | **Resolved** | Earlier failure: `STATUS.md` error / `get_funds` → `Not connected` / OAuth port **EADDRINUSE:37189**. User reconnected MCP; this re-test **confirms live tool execution**. |

---

## 1. Ticket objective (KS-990)

**User story:** As an **Internal QA Tester**, I want to **configure MCP clients—including Antigravity and other in-house clients—to use `mcp-remote` or equivalent against the SSE URL** so that **the agent can reach the Conceptia Dynamo MCP server with full internal coverage (guide §2.4)**.

**Scope of this file:** **Cursor only.** Full ticket **Definition of Done** may still require a **second distinct client** (e.g. Antigravity) per §2.4 — see §4.

---

## 2. Test results (Cursor) — re-test

### 2.1 Prerequisites — §2.2 Software (Node.js / `npx`)

| ID | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| T1 | Node.js **≥ 18.x** for `mcp-remote` | **PASS** | `node -v` → **v22.22.0** |
| T2 | `npx` available | **PASS** | `npx --version` → **10.9.2** |

### 2.2 SSE endpoint reachability (black-box, unauthenticated)

| ID | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| T3 | HTTPS endpoint responds (transport alive) | **PASS** | `curl` → `https://mcp.conceptia.com/dynamo/sse` → **HTTP 401** (expected without OAuth token) |

### 2.3 Workspace MCP configuration snapshot

| ID | Requirement | Result | Evidence / notes |
| --- | --- | --- | --- |
| T4 | Document connector pattern (`mcp-remote` + SSE URL) | **PASS** | Pattern per guide: `npx -y mcp-remote https://mcp.conceptia.com/dynamo/sse` |
| T5 | Repo-level `mcp.json` | **Informational** | `D:\source\GenD\.cursor\mcp.json` → **`"mcpServers": {}`** — server config lives in **Cursor MCP UI** (user settings), not this repo file |
| T6 | No raw JWT in committed workspace config | **PASS** | No tokens in workspace `mcp.json` snapshot |

### 2.4 OAuth / connected state / tool execution

| ID | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| T7 | Connector **connected**; OAuth via browser (no manual JWT paste in artifacts) | **PASS** | Agent bridge returned successful MCP payload (implies OAuth/session valid for `user-conceptia-dynamo`) |
| T8 | Invoke at least one tool (connectivity proof) | **PASS** | `get_funds` with `limit: 1` → **`success: true`**, 1 fund row returned (977 funds total in pagination metadata) |
| T9 | Tool surface visible to client | **PASS** | **13** tool JSON descriptors under `mcps/user-conceptia-dynamo/tools/` (aligns with guide §1.3 / **KS-976**) |

**Smoke response (abbreviated):** first fund **`Name`:** `2026 Fund`; query **`success: true`**.

### 2.5 Security note (ticket)

| ID | Requirement | Result | Notes |
| --- | --- | --- | --- |
| T10 | Never paste raw JWT into chat, config, or shared docs | **PASS (process)** | Report contains **no** secrets; OAuth assumed via browser flow |

---

## 3. BDD acceptance criteria (KS-990) — Cursor

| Scenario | Ticket wording | Result | Notes |
| --- | --- | --- | --- |
| **1 — Happy path** | Given supported MCP client → When add URL + complete OAuth → Then connected **without** plaintext tokens in config | **PASS** | Live **`get_funds`** success; workspace config has **no** JWT |
| **2 — Error path** | Given firewall blocks SSE → When connect → Then document per §9 | **NOT EXECUTED** | No firewall failure simulated |
| **3 — Edge case** | CLI `claude mcp add` → `/mcp` → `conceptia-dynamo` listed | **N/A (Cursor)** | Claude Code–specific; use Claude matrix |

---

## 4. Guide §2.4 — two clients + Antigravity

| Item | Status |
| --- | --- |
| **Cursor** | **Complete for this report** — connect + smoke tool call **PASS** |
| **Second client** (Antigravity, Claude Desktop, Claude Code, etc.) | **Not evidenced in this file** — complete separately if DoD requires **≥2 clients** |
| **Antigravity** (explicit ticket mention) | **Pending** unless you attach another result doc |

---

## 5. Overall verdict

| Scope | Verdict |
| --- | --- |
| **KS-990 — Cursor client** | **PASS** — Node/`npx` OK, SSE reachable, MCP **connected**, **`get_funds`** smoke **PASS**, **13** tools cached, **no** JWT in workspace `mcp.json`, BDD **Scenario 1** **PASS** |
| **KS-990 — full story (all clients)** | **PARTIAL until** second client (and **Antigravity** if mandated) is documented |

---

## 6. Optional follow-up

1. Capture **Cursor → MCP** screenshot (“connected” / N tools) for audit.  
2. Close **E1-02-T6–style** gap: add **Antigravity** (or second client) evidence to Jira or a merged **KS-990 Result** doc.  
3. If **`EADDRINUSE:37189`** recurs: `netstat -ano | findstr :37189` → `taskkill /PID … /F` before reconnect.

---

## 7. References

| Document | Path |
| --- | --- |
| This report | `Dynamo Server/Test Result/KS-990 - Cursor Result.md` |
| Testing guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` §2–§3, §9 |
| Workspace MCP file (snapshot) | `D:\source\GenD\.cursor\mcp.json` |

---

## 8. History (initial blocked run — 2026-04-23)

Symptoms: `STATUS.md` *server errored*, `get_funds` → `Not connected`; separate incidents included **OAuth callback `EADDRINUSE` on `127.0.0.1:37189`** (stale `node.exe`). Resolved by user reconnect + port hygiene; superseded by **§2** re-test above.
