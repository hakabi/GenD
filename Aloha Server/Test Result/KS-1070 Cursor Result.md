# KS-1070 Cursor Result — Connect two MCP clients and complete OAuth

> **Story:** [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) · **Draft ID:** AM-01 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Priority:** Highest · **Gating story**  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)  
> **Tester:** Bình Hà Khoa via Cursor agent session  
> **Executed:** 2026-08-06 (partial probe ~10:08 UTC; **retest after OAuth** ~11:02–11:06 UTC)  
> **Status:** **PARTIAL PASS (1 of 2 clients)** — Cursor Client 1 authenticated and usable; Client 2 (Claude Code / Antigravity) still outstanding

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Native HTTP config in `.mcp.json` | **P** | `type: http`, URL correct |
| Client 1 — Cursor OAuth + tool list | **P** | Server `user-conceptia-aloha` **ready**; 34 Aloha tools listed |
| Authenticated tool call works | **P** | `health_check`, `Search_Funds` succeeded |
| Unauthenticated rejection (earlier probe) | **P** | POST → 401 + `WWW-Authenticate` |
| Client 2 — Claude Code / Antigravity | **B** | Claude CLI still showed Needs authentication when last checked; Antigravity not run |
| Two distinct Azure AD identities | **B** | Only Cursor identity exercised |
| Session survives restart without re-auth | **P*** | Tools callable after user completed Cursor MCP auth + session refresh; formal double-restart not timed |
| Time to first successful tool list | **P** (Cursor) | Tools available immediately once serverStatus=`ready` (~11:02 UTC) |

\*Restart persistence accepted for Cursor after successful reconnect; recommend one explicit restart check still when convenient.

**Interim overall:** **Pass with findings / Partial** — enough to **continue KS-1071 on Cursor**, but KS-1070 ACs requiring **two clients** remain open.

Result codes: `P` Pass · `F` Fail · `B` Blocked · `S` Skipped · `n/a`

---

## Environment (retest)

| Item | Value |
|---|---|
| Client | Cursor IDE agent |
| MCP server id | `user-conceptia-aloha` |
| serverStatus | `ready` |
| Transport | Native HTTP (`https://mcp.conceptia.com/aloha/mcp`) |
| Server build | **0.9.5** (`health_check`) |
| Uptime at check | **1,132,901 s** ≈ **13.1 days** (timestamp `2026-08-06T11:02:49`) |
| Aloha tool count | **34** (+ Cursor meta `mcp_auth`, excluded) |
| Claude Code CLI | 2.1.222 (earlier); auth for Aloha still pending at last CLI check |

### Redacted config

```json
"conceptia-aloha": {
  "type": "http",
  "url": "https://mcp.conceptia.com/aloha/mcp"
}
```

---

## Acceptance criteria matrix

| # | Criterion | Cursor retest 2026-08-06 | Claude / Client 2 (pending) | Consolidated |
|---|---|---|---|---|
| AC1 | Native HTTP, not `mcp-remote` | **P** | | Partial |
| AC2 | OAuth on **two** clients; no token paste | **P** (Cursor only = 1/2) | | **B** |
| AC3 | Own Azure AD account | **P** (Cursor auth completed by tester) | | Partial |
| AC4 | Client name + version recorded | **P** Cursor IDE agent / `user-conceptia-aloha` | | Partial |
| AC5 | Survives restart without re-auth | **P*** | | Partial |
| AC6 | Time to first tool list recorded | **P** (~11:02 UTC tool catalog ready) | | Partial |

---

## Tests (retest)

### T10 — MCP server ready after user auth

| Field | Value |
|---|---|
| Test ID | KS-1070_T10 |
| UTC | 2026-08-06T11:02Z |
| Input | `GetMcpTools` server `user-conceptia-aloha` |
| Expected | serverStatus ready; tools listed |
| Actual | `ready`; 35 entries including `mcp_auth`; **34 Aloha tools** |
| Result | **P** |

### T11 — `health_check`

| Field | Value |
|---|---|
| Test ID | KS-1070_T11 |
| UTC | 2026-08-06T11:02:49Z |
| Actual | `version=0.9.5`, `status=healthy`, application `FAD - Investment Front Office Application`, uptime_seconds `1132901.495278` |
| Result | **P** |

### T12 — Authenticated search smoke

| Field | Value |
|---|---|
| Test ID | KS-1070_T12 |
| UTC | 2026-08-06T11:06:18Z |
| Input | `Search_Funds(search_term="Citadel Kensington Global Strategies")` |
| Expected | Resolves fund 500 / solovis |
| Actual | count=1; fund_id=`"500"`; source=`solovis` |
| Result | **P** |

### T13 — `get_user_info` (identity forwarding)

| Field | Value |
|---|---|
| Test ID | KS-1070_T13 |
| Actual | `{"success": false, "error": "No user email found in request headers."}` |
| Expected for clean identity | Email of authenticated user |
| Result | **F** for identity forwarding (observation **O4** still open) — **does not fail AC2 OAuth completion**, but is a high-priority finding for KS-1077 / KS-1080 |

---

## Earlier probe tests (still valid)

- T01 Config audit **P**
- T02/T03 Unauthenticated 401 **P**
- T04 OAuth metadata **P**
- T05 Claude CLI Needs authentication — superseded for Cursor; still relevant for Client 2

---

## Findings

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| O4 | `get_user_info` reports no email despite authenticated Cursor MCP session | High (verify) | KS-1077, KS-1080 |
| C2 | Second MCP client not yet authenticated | Blocks full AC2 | Claude Code or Antigravity |

---

## Evidence index

| Artifact | Path / note |
|---|---|
| Live inventory (also KS-1071) | `Aloha Server/baseline/aloha-tool-inventory-2026-08-06.md` |
| health_check / Search_Funds | Logged in this file (no tokens) |
| Screenshots | Optional — user completed Cursor MCP auth UI |

---

## Claude / Client 2 report (pending)

| Field | Value |
|---|---|
| Client name + version | |
| Auth completed (Y/N) | |
| Tool count | |
| Survives restart? | |
| Issues | |

---

## Consolidated verdict (current)

| Field | Value |
|---|---|
| Final KS-1070 | **Partial Pass** — Cursor OK; need Client 2 for full Pass |
| Unblock KS-1071 on Cursor? | **Yes** (live inventory done in parallel) |
| Full AM-01 close? | **No** until second client Pass |
