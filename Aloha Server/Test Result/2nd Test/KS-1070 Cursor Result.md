# KS-1070 2nd Test — Connect two MCP clients and complete OAuth

> **Story:** [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) · **Draft ID:** AM-01 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)  
> **Tester:** Bình Hà Khoa via Cursor  
> **Executed:** 2026-08-20 ~18:21–18:23 UTC  
> **Jira:** read-only this pass (no comments / transitions)  
> **Status:** **PASS WITH FINDINGS (Cursor client)** — Client 2 not re-exercised in this session

---

## 1. Ticket / comments reviewed (Jira MCP)

| Field | Value |
|---|---|
| Summary | Aloha MCP QA - Connect two MCP clients to the Aloha endpoint and complete OAuth |
| Status | Development Complete |
| Priority | Highest |
| Parent epic | KS-1066 |
| Blocks | KS-1071, KS-1080 |

### Comments on ticket (all returned)

| ID | Author | Created (UTC) | Substance |
|---|---|---|---|
| `20721` | Ha Khoa Dinh | 2026-08-06 | Antigravity PASS — `mcp-remote`, 34 tools, `health_check` healthy (0.9.5 era), search Citadel |
| `20728` | Bình Hà Khoa | 2026-08-07 (edited 2026-08-11) | Consolidated **PASS WITH FINDINGS** — Cursor + Claude Code native HTTP; AC5 partial; O4 carried forward |

### Description outcomes already recorded (2026-08-14 edit)

Prior cycle closed AC1–AC4/AC6 as executed; AC5 Partial (no timed restart log); Antigravity excluded (NEW-1); hard note that **two QA Azure AD accounts** are required for a proper re-test / KS-1077.

---

## 2. Environment (this retest)

| Item | Value |
|---|---|
| Client 1 | Cursor IDE · MCP id `user-conceptia-aloha` |
| serverStatus | `ready` |
| Transport | Native HTTP (`type: http` implied by Cursor MCP HTTP server) |
| Server build | **0.9.7** ← was **0.9.5** in Aug cycle |
| Uptime | **554,243 s** ≈ **6.4 days** (`2026-08-20T18:21:58`) |
| Aloha tool count | **34** (+ Cursor meta `mcp_auth` = 35 entries) |
| Client 2 (Claude Code / Antigravity) | **Not retested this session** |
| Second Azure AD account | **Still not available** (same limitation as first cycle) |

### Redacted config (expected)

```json
"conceptia-aloha": {
  "type": "http",
  "url": "https://mcp.conceptia.com/aloha/mcp"
}
```

---

## 3. Acceptance criteria — 2nd test

| # | Criterion | This retest (Cursor) | Notes |
|---|---|---|---|
| AC1 | Native HTTP, not `mcp-remote` | **Pass** | Cursor HTTP MCP; Antigravity still not counted |
| AC2 | OAuth on **two** clients; no token paste | **Partial** | Cursor auth live (`ready`). Client 2 not run here |
| AC3 | Own Azure AD account | **Pass** (single account) | Still only one QA identity — prerequisite for KS-1077 unmet |
| AC4 | Client name + version recorded | **Pass** | Cursor IDE · `user-conceptia-aloha` · server **0.9.7** |
| AC5 | Session survives restart without re-auth | **Partial** | Session already authenticated and usable; **no timed stop→start log** this pass (AC5-gap remains) |
| AC6 | Time to first tool list | **Pass** | Catalog listed immediately once `ready` (~18:22 UTC) |

**Story-level (Cursor-only 2nd test):** **Pass with findings** — gating connectivity OK on Cursor against **0.9.7**; dual-client + dual-identity ACs still incomplete for a full AC closeout.

---

## 4. Tests executed

### T1 — Authenticated `health_check`

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_T1 |
| UTC | 2026-08-20T18:21:58Z |
| Input | `health_check` (no args) |
| Expected | healthy + version |
| Actual | `status: healthy`, **version 0.9.7**, uptime 554243.36 s |
| Result | **Pass** |

### T2 — Tool catalog

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_T2 |
| UTC | 2026-08-20T18:22Z |
| Input | `GetMcpTools` server `user-conceptia-aloha` |
| Expected | server ready; Aloha tools listed |
| Actual | `ready`; **34** Aloha tools (+ `mcp_auth`). Catalog includes **`get_cambridge_benchmarks`**; lowercase alias **`search_funds` not present** in this dump (drift vs Aug inventory — track under KS-1071) |
| Result | **Pass** (count stable at 34; membership drifted) |

### T3 — `Search_Funds` smoke

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_T3 |
| UTC | 2026-08-20T18:22:48Z |
| Input | `Search_Funds(search_term="Citadel Kensington Global Strategies")` |
| Expected | fund 500 / solovis |
| Actual | `count: 1`, `fund_id: "500"`, `fund_name: Citadel Kensington Global Strategies Fund Ltd.`, `source: solovis`, envelope version **0.9.7** |
| Result | **Pass** |

### T4 — Unauthenticated POST

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_T4 |
| UTC | 2026-08-20T18:21:59Z / body confirm follow-up |
| Input | `POST /aloha/mcp` JSON-RPC `tools/list` with **no** `Authorization` |
| Expected | 401 + `WWW-Authenticate` |
| Actual | **HTTP 401**; body `{"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}`; header `Www-Authenticate: Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"` |
| Result | **Pass** |

### T5 — O4 identity probe (`get_user_info`)

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_T5 |
| UTC | 2026-08-20T18:22Z |
| Input | `get_user_info` (no args) |
| Expected (ideal) | Authenticated user email after OAuth |
| Actual | `success: false`, `"No user email found in request headers."` |
| Result | **Fail (finding O4)** — does **not** fail OAuth ACs; still open (filed historically as KS-1094) |

---

## 5. Findings (2nd test)

| ID | Finding | Severity | vs 1st cycle |
|---|---|---|---|
| **O4** | `get_user_info` still no email after OAuth on Cursor | High (functional) | **Still present** on **0.9.7** |
| **BUILD** | Deployed build is **0.9.7** (was 0.9.5) | Info | New for this retest |
| **CATALOG-DRIFT** | Tool set still 34 but membership changed (`get_cambridge_benchmarks` present; `search_funds` alias absent in dump) | Medium (inventory) | Feed **KS-1071** retest |
| **AC5-gap** | No timed restart evidence this pass | Low (process) | Unchanged |
| **2-ACCOUNT** | Still one QA Azure AD account | High for KS-1077 | Unchanged — hard prerequisite called out on ticket |
| NEW-1 | Antigravity `mcp-remote` | Process | Not re-run; still excluded |

---

## 6. Comparison to prior consolidated verdict (comment `20728`)

| Check | Aug 2026 (0.9.5) | 2nd test 2026-08-20 (0.9.7) |
|---|---|---|
| Cursor native HTTP + OAuth | Pass | **Pass** |
| Claude Code dual-client | Pass | **Not retested** |
| Tool count 34 | Pass | **Pass** (count); membership drifted |
| `health_check` healthy | 0.9.5 | **0.9.7** healthy |
| `Search_Funds` → 500 | Pass | **Pass** |
| Unauth 401 + WWW-Authenticate | Pass | **Pass** |
| O4 no email | Fail (finding) | **Still Fail** |
| AC5 timed restart | Partial | **Still Partial** |

---

## 7. Verdict

**PASS WITH FINDINGS** for Cursor connectivity / OAuth / smoke against build **0.9.7**.

Not a full dual-client AC closeout: Client 2 and a second Azure AD account were not available in this session. O4 remains open. No Jira updates made.

### Recommended next steps (for humans / later)

1. Retest Client 2 (Claude Code native HTTP) on 0.9.7.  
2. Provision **two** QA Azure AD accounts before KS-1077 retest.  
3. Capture one timed stop→start→no-reauth log (AC5).  
4. Run KS-1071 retest for catalog drift (`get_cambridge_benchmarks` / missing `search_funds`).  
5. Leave Jira untouched until you ask to post.

---

## 8. Evidence locations

| Artifact | Path |
|---|---|
| This report | `Aloha Server/Test Result/2nd Test/KS-1070 Cursor Result.md` |
| Prior cycle | `Aloha Server/Test Result/KS-1070 *.md` |
| Jira | https://gendvn.atlassian.net/browse/KS-1070 (comments `20721`, `20728` — read only) |
