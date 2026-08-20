# KS-1070 Consolidated Report — Connect two MCP clients and complete OAuth

> **Story:** [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) · **Draft ID:** AM-01 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Priority:** Highest · **Gating story**  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP) · build **0.9.5**  
> **Sources merged:**  
> - [KS-1070 Cursor Result.md](KS-1070%20Cursor%20Result.md) — 2026-08-06 ~10:08 / 11:02–11:06 UTC  
> - [KS-1070 Claude Result.md](KS-1070%20Claude%20Result.md) — 2026-08-07 ~02:48–02:57 UTC  
> - Antigravity — cited from Jira KS-1070 comment (2026-08-06 ~11:24 UTC) via Claude Result (not re-executed in this consolidation)  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1070 is **closed as Pass with findings**.

- **Two native-HTTP clients** (Cursor + Claude Code) completed browser OAuth with no token paste, listed **34** tools, and ran authenticated smoke calls successfully.
- A third client (**Antigravity**) also reported working OAuth and tools in Jira, but self-reported **`mcp-remote`** transport — that **does not satisfy AC1** for this cycle’s Streamable HTTP scope.
- **O4** (`get_user_info` → no email in headers) is **confirmed on Cursor and Claude Code** — does not fail OAuth ACs, but is a high-priority defect for later stories.
- **AC5** (literal restart persistence) remains **soft / partially evidenced** across all clients — recommend one timed restart before treating AM-01 as perfect, but it does not block dependent stories.

**Unblocks:** KS-1071 and downstream MCP stories may proceed.

---

## Clients exercised

| Client | Version / id | Transport | OAuth | Tool list | Smoke calls | Role in AC2 |
|---|---|---|---|---|---|---|
| **Cursor IDE** | agent / `user-conceptia-aloha` | Native `type: http` | **P** | 34 Aloha (+ meta `mcp_auth`) | `health_check`, `Search_Funds` **P** | Client 1 |
| **Claude Code** | CLI **2.1.223** / `conceptia-aloha` | Native `type: http` | **P** | 34 | `health_check`, searches **P** | Client 2 (closes AC2) |
| **Antigravity** | “Antigravity IDE” (version not stated) | Self-reported **`mcp-remote`** | **P** (Jira) | 34 (Jira) | health + search (Jira) | Extra client — **AC1 non-compliant** |

Config (both compliant clients):

```json
"conceptia-aloha": {
  "type": "http",
  "url": "https://mcp.conceptia.com/aloha/mcp"
}
```

---

## Acceptance criteria — consolidated

| # | Criterion | Cursor | Claude Code | Antigravity (Jira) | **Final** |
|---|---|---|---|---|---|
| AC1 | Native HTTP, not `mcp-remote` | **P** | **P** | **F** (`mcp-remote`) | **P** — met by ≥2 compliant clients |
| AC2 | OAuth on ≥2 clients; no token paste | **P** | **P** | **P** | **P** |
| AC3 | Own Azure AD account | **P** | **P** | **P** (asserted) | **P** |
| AC4 | Client name + version recorded | **P** | **P** (2.1.223) | Partial (no version string) | **P** |
| AC5 | Survives restart without re-auth | **P*** informal | **B** — cross-session pickup only, not literal restart | **P** asserted, no timed log | **Partial** — process gap, not a product Fail |
| AC6 | Time to first tool list recorded | **P** (~11:02 UTC) | Partial (~02:56:51 UTC first call) | Not stated | **P** (sufficient from Cursor + Claude first-call stamps) |

\*Cursor: tools usable after MCP auth/session refresh; formal double-restart not timed.

---

## Cross-client smoke consistency

| Check | Cursor (2026-08-06) | Claude Code (2026-08-07) | Match |
|---|---|---|---|
| `health_check` version | 0.9.5 healthy | 0.9.5 healthy | Yes |
| Uptime continuity | 1,132,901 s @ 11:02:49Z | 1,190,143 s @ 02:56:51Z | Yes — Δ uptime ≈ Δ wall clock (~57,242 s); **no server restart** between runs |
| `Search_Funds("Citadel Kensington Global Strategies")` | fund_id `"500"`, solovis | Same | Yes |
| `get_user_info` | No email in headers | No email in headers | Yes — **O4** |

Unauthenticated surface (Cursor early probe + Claude pre-auth curl): **401** + `WWW-Authenticate` with scopes `openid profile user.read` — **P**.

---

## Findings (merged)

| ID | Finding | Severity | Disposition |
|---|---|---|---|
| **O4** | `get_user_info` returns *"No user email found in request headers"* despite completed OAuth on Cursor **and** Claude Code | **High** | Carry to KS-1077 / KS-1080; treat as server/gateway identity-forwarding defect candidate |
| **NEW-1** | Antigravity KS-1070 Jira PASS used **`mcp-remote`**, which violates AC1’s native-HTTP requirement (risk of SSE fallback) | **Medium** (process/evidence) | Re-run Antigravity on native `type: http`, or document explicit exception — do not count Antigravity as AC1 evidence |
| **AC5-gap** | No client produced a timed stop → start → no-reauth log | **Low** (process) | Optional cleanup before calling AM-01 “perfect”; does not block later stories |
| Cross-session pickup (Claude) | Already-open Claude session picked up token after auth in another terminal without restart | Info | Stronger persistence than AC5 wording; still ≠ formal restart test |

---

## Evidence index

| Artifact | Location |
|---|---|
| Cursor half | `Aloha Server/Test Result/KS-1070 Cursor Result.md` |
| Claude half | `Aloha Server/Test Result/KS-1070 Claude Result.md` |
| Shared inventory | `Aloha Server/baseline/aloha-tool-inventory-2026-08-06.md` |
| Antigravity | Jira KS-1070 comment ~2026-08-06T11:24Z (as cited in Claude Result) |

**Redaction:** No tokens, JWTs, or raw credentials in any half or this consolidation.

---

## Recommendation

| Question | Answer |
|---|---|
| Close KS-1070 / AM-01? | **Yes — Pass with findings** |
| Block dependent stories? | **No** |
| Must-fix before broader adoption? | **O4** identity forwarding (track in AM-08 / AM-11) |
| Nice-to-fix process items | Antigravity native-HTTP re-run (NEW-1); one timed restart log (AC5-gap) |
