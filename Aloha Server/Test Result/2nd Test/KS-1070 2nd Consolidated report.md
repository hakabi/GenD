# KS-1070 2nd Test — Consolidated Report — Connect two MCP clients and complete OAuth

> **Story:** [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) · **Draft ID:** AM-01 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Highest · **Gating story** · Blocks [KS-1071](https://gendvn.atlassian.net/browse/KS-1071), [KS-1080](https://gendvn.atlassian.net/browse/KS-1080)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP) · build **0.9.7**
> **Sources merged:**
> - `KS-1070 Cursor Result.md` — Cursor IDE, 2026-08-20 ~18:21–18:23 UTC
> - `KS-1070 Claude Result.md` — Claude Code CLI 2.1.228, 2026-08-20 ~17:03–17:08 UTC (+ log forensics to 18:20 UTC)
> **Consolidated:** 2026-08-20 · **Jira:** read-only, nothing posted
> **Final status:** **FAIL** — the gating story does not currently hold

---

## Executive verdict

**KS-1070 should not remain closed as "Pass with findings."**

The first cycle recorded AC5 as *"Partial — never properly evidenced"* and judged it a process gap. This retest captured the missing evidence. It does not support the assumption — it contradicts it. Restart persistence is a **reproduced product defect**, not a documentation shortfall.

Three of six acceptance criteria now fail, and one new **High** security finding sits entirely outside the original scope.

The endpoint itself is healthy. Build 0.9.7 is up, functional parity with the 0.9.5 baseline is exact, TLS is clean and unauthenticated rejection is spec-shaped. What fails is **session durability** and **identity propagation** — precisely the two things a gating connectivity story exists to guarantee.

---

## Clients exercised

| Client | Version / id | Transport | OAuth | Tool list | Smoke | Auth state at close of window |
|---|---|---|---|---|---|---|
| **Cursor IDE** | `user-conceptia-aloha` | Native `type: http` | **P** (re-authed 18:19:35Z) | 34 in dump — see D1 | `health_check`, `Search_Funds` **P** | **Authenticated** |
| **Claude Code CLI** | **2.1.228** / `conceptia-aloha` | Native `type: http` | **F** | n/a — no session | n/a via native path | **Needs authentication** |
| *claude.ai connector* | `claude.ai conceptia-aloha` | Streamable HTTP | Connected | **35** | `health_check`, `Search_Funds`, `get_user_info` **executed** | Connected (token held server-side) |

The claude.ai connector is a **third, differently-managed surface** — its token lives on claude.ai's side, not in a local client. It is sound evidence for server behaviour and catalog, and **not** evidence for AC2 or AC5, which concern local client OAuth.

---

## Acceptance criteria — consolidated

| # | Criterion | Cursor | Claude | **Final** | Basis |
|---|---|---|---|---|---|
| AC1 | Native HTTP, not `mcp-remote` | P | P | **P** | Both configs `type: http`; Antigravity still excluded (NEW-1) |
| AC2 | OAuth on **two** clients; no token paste | Partial | F | **F** | Only **1 of 2** local clients ended the window authenticated; the two were never simultaneously live |
| AC3 | Own Azure AD account each | P (single) | F | **F** | Still one QA identity — the ticket itself calls two a hard prerequisite for retest |
| AC4 | Client name + version recorded | P | P | **P** | Cursor IDE · `user-conceptia-aloha`; Claude Code CLI **2.1.228** |
| AC5 | Survives restart without re-auth | Partial | F | **F** | **8 of 8** cold starts rejected over ten days — see below |
| AC6 | Time to first tool list | P | P | **P** | Catalog immediate once connected on both |

**Consolidated story verdict: FAIL (3 of 6 ACs unmet).**

---

## AC5 — the decisive evidence

Neither half of the first cycle produced a timed restart log. Cursor's own MCP logs contained one all along. Merged timeline:

| Local (UTC+7) | UTC | Outcome |
|---|---|---|
| 2026-08-10 14:03:25 | 2026-08-10 07:03:25Z | `Connect failed after auth_required; returning needsAuth` |
| 2026-08-11 11:01:20 | 2026-08-11 04:01:20Z | needsAuth |
| 2026-08-11 15:19:18 | 2026-08-11 08:19:18Z | needsAuth |
| 2026-08-12 02:04:27 | 2026-08-11 19:04:27Z | needsAuth |
| 2026-08-12 17:58:07 | 2026-08-12 10:58:07Z | needsAuth |
| 2026-08-20 14:59:57 | 2026-08-20 07:59:57Z | needsAuth |
| 2026-08-20 15:03:23 | 2026-08-20 08:03:23Z | needsAuth |
| 2026-08-21 00:06:11 | 2026-08-20 17:06:11Z | needsAuth |
| **2026-08-21 01:19:35** | **2026-08-20 18:19:35Z** | **OAuth callback exchange completed** → connected |
| 2026-08-21 01:20:05 | 2026-08-20 18:20:05Z | **Connected, no re-auth** — 30 s later |

**Reading.** The connection survives a restart **only inside the 75-minute access-token window** — the trivial case, shown by the 30-second gap. Outside it, **eight failures out of eight** across ten days.

**Root cause.** The persisted OAuth record carries `accessToken`, `expiresAt`, `scope`, `clientId`, `issuer` — and **no `refreshToken`**. The granted scope is `openid profile user.read` with **no `offline_access`**, which Entra ID requires before it will mint a refresh token. Meanwhile `/.well-known/oauth-authorization-server` advertises `grant_types_supported: ["authorization_code","refresh_token"]`, and Cursor's dynamic registration explicitly requests that grant. **The server advertises and accepts a refresh grant it never provisions.** Which side drops it — client scope request or server token response — is a dev-side question.

**Effect on the Cursor half.** The Cursor test ran **two minutes after** the 18:19:35Z re-authentication. Its "session already authenticated and usable" note is accurate but describes a freshly minted session, so it does not evidence persistence. Both halves are consistent once the timestamps are aligned.

---

## Discrepancies between the two halves — resolved

| ID | Cursor said | Claude said | Resolution |
|---|---|---|---|
| **D1** | 34 tools; `get_cambridge_benchmarks` present, lowercase alias **`search_funds` absent** | **35** tools; both present | **35 is correct.** Both `search_funds` ("Alias for Search_Funds") and `get_cambridge_benchmarks` were live-served with full schemas. Positive evidence beats an absence in a dump; the Cursor listing was incomplete. **No tool was removed.** One clean re-dump should settle it for KS-1071 |
| **D2** | AC5 **Partial** — session authenticated and usable | AC5 **Fail** — 8/8 cold starts rejected | **Fail.** Not a contradiction once timezones align: Cursor was re-authenticated at 18:19:35Z, two minutes before its run |
| **D3** | Uptime 554,243 s @ 18:21:58Z | Uptime 549,761 s @ 17:07:15Z | **Consistent.** Δuptime 4,482 s = Δwall 4,482 s → **same server instance, no restart between the halves.** Both sets of results describe one deployment |

---

## Cross-client smoke consistency

| Check | Cursor (18:2xZ) | Claude (17:07Z) | Match |
|---|---|---|---|
| `health_check` | healthy, **0.9.7** | healthy, **0.9.7** | Yes |
| Uptime continuity | 554,243 s | 549,761 s | Yes — same instance, deploy ≈ 2026-08-14T08:24Z |
| `Search_Funds("Citadel Kensington Global Strategies")` | fund **500**, solovis | fund **500**, solovis | Yes — parity with 0.9.5 baseline |
| Unauthenticated POST | 401 + `WWW-Authenticate` | 401 + `WWW-Authenticate` | Yes |
| `get_user_info` | No email in headers | No email in headers | Yes — **O4 still open** |

---

## Findings register

| ID | Finding | Severity | vs 1st cycle | Disposition |
|---|---|---|---|---|
| **AC5-FAIL** | No refresh token persisted; session dies with the 75-min access token; AS advertises a refresh grant it never provisions | **High (product)** | **Escalated** from "Low / process gap" | **File a new bug** against the Aloha MCP gateway |
| **S1** | **Audience confusion / token pass-through** — token presented to the Aloha endpoint has `aud` = **Microsoft Graph** (`00000003-0000-0000-c000-000000000000`) and `scp` including **`Files.Read.All`**. MCP forbids accepting tokens not issued for the server; scope far exceeds the advertised `openid profile user.read`, so a leaked token grants tenant-wide Graph file read | **High (security)** | **New** | **File as its own security ticket** — should not ride on a connectivity story |
| **O4** | `get_user_info` → "No user email found in request headers" despite completed OAuth, on **all three** surfaces. The token **does** carry `upn`/`unique_name`, so identity is dropped between gateway and service | **High (functional)** | **Still present** on 0.9.7 | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) — update with 0.9.7 reproduction |
| **2-ACCOUNT** | Still one QA Azure AD account | **High for KS-1077** | Unchanged | Provision **two** before any [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) retest |
| **S2** | PKCE `plain` offered alongside `S256`; OAuth 2.1 / MCP require S256 | Medium (security) | **New** | Fold into the S1 security ticket |
| **DUP-REG** | Two registrations for one URL — `claude.ai conceptia-aloha` (Connected) vs `conceptia-aloha` (Needs authentication). Tools respond via the connector while the native path under test is dead | Medium (test validity) | **New** | Verify which path the 2026-08-07 Claude Code evidence used |
| **CATALOG** | **35** tools (was 34): `get_cambridge_benchmarks` added, nothing removed | Medium (inventory) | **New** | Feed [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) retest; one clean re-dump to close D1 |
| **S3** | No `Strict-Transport-Security` header (HTTP 302s to HTTPS) | Low–Medium (security) | **New** | Fold into the S1 security ticket |
| **S4** | `WWW-Authenticate` advertises `resource_metadata` whose `resource` is `https://mcp.conceptia.com`, not the endpoint; the correct path-suffixed document exists and is right | Low (spec) | **New** | Same class of mismatch that enables S1 |
| **BUILD** | 0.9.5 → **0.9.7**, deployed ≈ 2026-08-14T08:24Z | Info | New | Note on epic |
| **NEW-1** | Antigravity ran `mcp-remote` | Process | Unchanged | Not re-run; still excluded from AC1 |

---

## Comparison to the 1st cycle verdict (Jira comment `20728`)

| Check | Aug 2026 (0.9.5) | 2nd test (0.9.7) |
|---|---|---|
| Native HTTP config | Pass | **Pass** |
| Two clients authenticated | Pass | **Fail** — 1 of 2 |
| Two distinct identities | Pass (trivially) | **Fail** — still one account |
| Tool count | 34 | **35** (+`get_cambridge_benchmarks`) |
| `health_check` | 0.9.5 healthy | **0.9.7 healthy** |
| `Search_Funds` → 500 | Pass | **Pass** |
| Unauth 401 + `WWW-Authenticate` | Pass | **Pass** |
| O4 no email | Fail (finding) | **Still Fail** |
| AC5 restart | Partial, unevidenced | **Fail — 8/8, now evidenced** |
| Security posture | Not assessed | **S1 High, S2/S3/S4** |

---

## What could not be tested

| Item | Blocker | Who unblocks |
|---|---|---|
| AC2 — live browser OAuth on two clients simultaneously | Non-interactive session; OAuth needs an interactive terminal | Tester, via `/mcp` in an interactive `claude` session |
| AC3 — two distinct Azure AD identities | Second QA account still not provisioned | Platform / IT |
| KS-1077 user-scoping comparison | Blocked by AC3 **and** O4 | Both of the above |
| Antigravity native-HTTP re-run (NEW-1) | Not exercised this cycle | Optional |

---

## Recommendation

| Question | Answer |
|---|---|
| Does KS-1070 pass? | **No — Fail.** Reopen; do not leave closed as "Pass with findings" |
| Block dependent stories? | **KS-1071 may proceed** (catalog work is unaffected). **KS-1077 stays blocked** — it needs two identities and O4 fixed |
| New tickets needed | (1) AC5 refresh-token bug · (2) **S1 security** ticket, folding in S2/S3/S4 |
| Must-fix before broader adoption | **S1**, then **AC5-FAIL**, then **O4** |
| Prerequisite for the next retest | **Two QA Azure AD accounts** — hard gate, as the ticket already states |

---

## Evidence index

| Artifact | Location |
|---|---|
| Cursor half | `Aloha Server/Test Result/2nd Test/KS-1070 Cursor Result.md` |
| Claude half | `Aloha Server/Test Result/2nd Test/KS-1070 Claude Result.md` |
| This consolidation | `Aloha Server/Test Result/2nd Test/KS-1070 Consolidated report.md` |
| 1st cycle | `Aloha Server/Test Result/KS-1070 *.md` |
| Baseline inventory | `Aloha Server/baseline/aloha-tool-inventory-2026-08-06.md` |
| Cursor MCP logs (AC5) | `%APPDATA%/Cursor/logs/*/mcp-server-user-conceptia-aloha.log` |
| Jira | https://gendvn.atlassian.net/browse/KS-1070 — comments `20721`, `20728`, read-only |

**Redaction:** no tokens, JWTs, secrets or claim values appear in either half or this consolidation. Credential inspection was limited to field names and claim names.
