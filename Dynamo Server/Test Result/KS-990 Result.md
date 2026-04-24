# KS-990 — Final Result: Configure MCP Client and Connect to SSE Endpoint

| Field | Value |
| --- | --- |
| **Jira** | [KS-990](https://gendvn.atlassian.net/browse/KS-990) |
| **Epic** | Dynamo MCP — Environment, Access & Connectivity |
| **MCP server** | `conceptia-dynamo` |
| **SSE URL** | `https://mcp.conceptia.com/dynamo/sse` |
| **QA guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` §2.2, §2.4, §3.1–§3.3, §9 |
| **Sources merged** | `KS-990 - Cursor Result.md`, `KS-990 - Claude Result.md` |
| **Consolidation date** | 2026-04-24 |

---

## 1. Executive summary

**Ticket ask:** Configure MCP client(s) using `mcp-remote` or equivalent against the Conceptia Dynamo **SSE** URL; **Node 18+** when using `mcp-remote`; document chosen clients; run **at least two distinct clients** per §2.4; **include Antigravity** for internal cycles where required; **Microsoft OAuth** via browser (**no** raw JWT in config/docs); map to BDD scenarios.

**Merged outcome:**

| Area | Result |
| --- | --- |
| **Cursor** — connect + OAuth + smoke tool | **PASS** (re-test after prior `EADDRINUSE:37189` / disconnect issues) |
| **Claude Cowork (Desktop)** — connect + OAuth + 13 tools | **PASS** |
| **Two distinct MCP clients evidenced** | **PASS** — **Cursor** + **Claude Cowork** |
| **Network / TLS / 401 posture (Claude run)** | **PASS** (DNS, TLS, cert, HTTP→HTTPS, 401, clean body, `Server` hidden; see §5) |
| **Antigravity** (explicit ticket / §2.4 emphasis) | **Not completed** in either source report — **open** if your program mandates it verbatim |
| **BDD Scenario 1 (happy path)** | **PASS** (both clients) |
| **BDD Scenario 2 (firewall)** | **Partial** — no *simulated* corporate block; live path healthy (Claude network checks + Cursor 401) |
| **BDD Scenario 3 (CLI `/mcp`)** | **PASS (Claude Cowork equivalent)** per Claude report; **N/A** for Cursor UI |

**Overall:** **PASS** for core KS-990 connectivity and **two-client** coverage (**Cursor + Claude Cowork**), with **Antigravity** and **strict Scenario 2 firewall drill** called out as **residual** if your Definition of Done requires them explicitly.

---

## 2. Requirement traceability (KS-990 → evidence)

| Requirement | Cursor evidence | Claude evidence | Merged |
| --- | --- | --- | --- |
| Node **≥ 18** if using `mcp-remote` | `node` **v22.22.0**, `npx` **10.9.2** | Cowork native connector (pattern still valid for org) | **PASS** |
| `npx -y mcp-remote https://mcp.conceptia.com/dynamo/sse` (where applicable) | Documented; config in Cursor MCP UI | Cowork: SSE URL same endpoint | **PASS** |
| Microsoft OAuth; **no** JWT in plaintext config | No JWT in workspace `.cursor/mcp.json`; OAuth via session | OAuth popup; no JWT in config | **PASS** |
| Document **all** chosen clients | This file + both sub-reports | Same | **PASS** |
| **≥ 2** distinct clients (§2.4) | Cursor PASS | Claude Cowork PASS | **PASS** (2 clients) |
| **Antigravity** called out in ticket | Not run | Pending in Claude doc | **OPEN** |
| OAuth UX (success/failure) | Reconnect after port conflict documented | Microsoft popup documented | **PASS** (qualitative) |

---

## 3. Client matrix (merged)

| # | Client | Config / transport | OAuth | Connected / smoke | Tools (KS-976 cross-ref) |
| ---: | --- | --- | --- | --- | --- |
| 1 | **Cursor** | User MCP settings + `mcp-remote` pattern; repo `mcp.json` empty | Browser OAuth (session) | `get_funds` **success** | **13** descriptors in MCP cache |
| 2 | **Claude Cowork** | Connectors → `conceptia-dynamo` → SSE URL | Microsoft OAuth | Connected; network suite **PASS** | **13** enumerated (per KS-976 Claude) |
| — | **Antigravity** | Per Antigravity MCP docs | — | **Not evidenced** | — |

**Historical note (Cursor):** Initial 2026-04-23 run blocked on **not connected** / **`EADDRINUSE:37189`**; **resolved** on re-test — see `KS-990 - Cursor Result.md` §8.

---

## 4. BDD acceptance criteria — consolidated

| Scenario | KS-990 wording | Merged result | Evidence |
| --- | --- | --- | --- |
| **1** | Installed client → add URL → OAuth → **connected**; **no** plaintext tokens in config | **PASS** | Cursor: live MCP call; empty workspace JWT. Claude: Connected + OAuth. |
| **2** | Firewall blocks SSE → failure documented per §9 | **Not fully exercised** | Claude: general connectivity **PASS** from test network. **No** controlled “block SSE” test. |
| **3** | CLI `claude mcp add` → `/mcp` → `conceptia-dynamo` visible | **PASS / equivalent** | Claude report: Cowork Connectors + tool list **equivalent** to session visibility. Cursor: UI-based MCP, not Claude Code CLI. |

---

## 5. Network & TLS summary (from Claude result)

| Check | Result |
| --- | :---: |
| DNS `mcp.conceptia.com` | PASS → `20.99.244.16` |
| TLS handshake / encryption | PASS (Schannel; TLSv1.3 cited cross-run) |
| Certificate hostname / CA | PASS (Let's Encrypt; expiry **2026-06-05** — monitor) |
| HTTP cleartext | PASS → **302** to HTTPS |
| Unauthenticated GET SSE | PASS → **401** |
| 401 body free of secrets | PASS |
| `WWW-Authenticate` / OAuth challenge | PASS (**resolved** vs earlier Cursor-era gap per Claude F-02) |
| `Server` header disclosure | PASS (not exposed) |
| `X-Powered-By: Express` | **Finding** (F-03) |
| CORS `Access-Control-Allow-Origin: *` | **Finding** (F-01) — carry **KS-988** |

*Cursor re-test included lightweight `curl` **401** check; full suite is in the Claude report.*

---

## 6. Findings (merged)

| ID | Topic | Severity | Status | Action |
| --- | --- | --- | --- | --- |
| **KS-990-F-01** | CORS wildcard on MCP responses | Low | Open | Confirm with Conceptia; **KS-988** |
| **KS-990-F-02** | `WWW-Authenticate` on 401 | — | **Resolved** (per Claude) | Close in **KS-984** if tracked there |
| **KS-990-F-03** | `X-Powered-By: Express` | Low | Open | Vendor hardening; **KS-988** |
| **KS-990-F-04** | Cert expiry **2026-06-05** | Info | Monitor | Let's Encrypt renewal |
| **KS-990-CUR-B01** (historical) | Cursor disconnect / **37189** in use | — | **Resolved** on Cursor re-test | Documented in Cursor report |

---

## 7. Definition of Done (ticket) — checklist

| Criterion | Status |
| --- | :---: |
| Client(s) install/connect per §3.1–§3.2 | PASS |
| SSE URL + OAuth (no JWT in plaintext config) | PASS |
| **≥ 2** distinct clients documented & connected | PASS (**Cursor** + **Claude Cowork**) |
| **Antigravity** included (ticket wording) | OPEN — optional follow-up |
| BDD Scenario 1 | PASS |
| BDD Scenario 2 | Partial (no forced firewall failure) |
| BDD Scenario 3 | PASS / equivalent (Claude); Cursor N/A |

---

## 8. Residual actions (optional)

1. **Antigravity:** Configure and attach evidence if internal policy requires the **named** client from §2.4.  
2. **Scenario 2:** Run a controlled test from a **firewall-blocked** profile or document §9 steps from a failed corporate network if needed for audit.  
3. **Vendor:** Track F-01, F-03, F-04 with Conceptia / **KS-988**.  
4. **Jira:** Paste summary comment; transition **KS-990** when PO accepts **Cursor + Claude Cowork** as satisfying two-client §2.4.

---

## 9. Paste-ready Jira comment

*KS-990 — Final QA: **PASS** for MCP client configuration and SSE connectivity. **Clients verified:** Cursor (Node 22, `get_funds` smoke, 13 tools, OAuth; prior EADDRINUSE resolved) and **Claude Cowork** (connected, 13 tools, full network/TLS/401 checks). **§2.4 two-client requirement satisfied.** **Antigravity** not executed in this cycle — schedule if mandated. BDD1 **PASS**; BDD2 partial (no simulated firewall block); BDD3 **PASS** via Cowork equivalent. Findings: CORS `*` (KS-988), `X-Powered-By: Express` (KS-988), cert expiry monitoring; **WWW-Authenticate** resolved. Evidence: `Dynamo Server/Test Result/KS-990 Result.md` + sub-reports.*

---

## 10. References

| Document | Path |
| --- | --- |
| **This consolidated result** | `Dynamo Server/Test Result/KS-990 Result.md` |
| Cursor detail | `Dynamo Server/Test Result/KS-990 - Cursor Result.md` |
| Claude detail | `Dynamo Server/Test Result/KS-990 - Claude Result.md` |
| Tool inventory (related) | `Dynamo Server/Test Result/KS-976 Result.md` |
| QA guide | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
