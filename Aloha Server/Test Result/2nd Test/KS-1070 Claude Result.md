# KS-1070 2nd Test — Claude Result — Connect two MCP clients and complete OAuth

> **Story:** [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) · **Draft ID:** AM-01 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Highest · **Gating story**
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)
> **Tester:** Bình Hà Khoa via Claude Code CLI **2.1.228** (Windows 11, Node v22.14.0)
> **Executed:** 2026-08-20 ~17:03–17:08 UTC (log forensics extended to 18:20 UTC)
> **Jira:** read-only this pass (no comments, no transitions)
> **Server build:** **0.9.7** (was 0.9.5 in the Aug cycle)
> **Status:** **FAIL** — AC5 disproven; AC2/AC3 not satisfied

Result codes: `P` Pass · `F` Fail · `B` Blocked · `S` Skipped

---

## 1. Scope and method

Three evidence channels were used, because no single one could cover the ACs:

| Channel | What it proved |
|---|---|
| **Live tool calls** via the claude.ai `conceptia-aloha` connector (Streamable HTTP to the same endpoint) | Server health, functional parity, catalog, O4 |
| **Direct HTTP probes** (`curl`) against the endpoint and its OAuth metadata | Unauthenticated behaviour, TLS, OAuth discovery, token handling |
| **Client-side forensics** — Cursor MCP logs, Claude Code credential store, MCP auth cache | **AC5 restart persistence**, the evidence the first cycle never captured |

The third channel is what changes the verdict. AC5 was never previously tested; it now has a ten-day log record.

**Redaction:** credential field *names* and JWT claim *names* were inspected. No token, secret, or claim value was printed, stored, or transmitted.

---

## 2. Environment

| Item | Value |
|---|---|
| Client under test (local) | Claude Code CLI **2.1.228** (first cycle: 2.1.223) |
| Local server id | `conceptia-aloha` (project `.mcp.json`) |
| Local transport | Native HTTP — `{"type":"http","url":"https://mcp.conceptia.com/aloha/mcp"}` |
| Local auth state | **! Needs authentication** |
| Secondary channel | `claude.ai conceptia-aloha` connector — **✔ Connected** |
| Server build | **0.9.7** |
| Uptime at check | **549,761 s** ≈ 6.36 d @ `2026-08-20T17:07:15Z` → deploy ≈ **2026-08-14T08:24:34Z** |
| Aloha tool count | **35** (was 34) |
| Second Azure AD account | **Still not available** |

### Redacted config

```json
"conceptia-aloha": {
  "type": "http",
  "url": "https://mcp.conceptia.com/aloha/mcp"
}
```

---

## 3. Acceptance criteria

| # | Criterion | 1st cycle | **2nd test** | Basis |
|---|---|---|---|---|
| AC1 | Native HTTP, not `mcp-remote` | P | **P** | `.mcp.json` and `.cursor/mcp.json` both `type: http` |
| AC2 | OAuth on **two** clients; no token paste | P | **F** | At test time **zero** local clients held a usable session |
| AC3 | Own Azure AD account each | P (trivially) | **F** | Still one QA identity — the ticket calls two a hard prerequisite |
| AC4 | Client name + version recorded | P | **P** | Claude Code CLI 2.1.228 · `conceptia-aloha` |
| AC5 | Survives restart without re-auth | Partial | **F** | Eight consecutive cold starts rejected — §5 |
| AC6 | Time to first tool list | P | **P** | Catalog present at session start; `health_check` returned on first call |

**Story verdict (Claude half): FAIL.**

---

## 4. Tests executed

### T1 — `health_check` (authenticated, connector path)

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T1 |
| UTC | 2026-08-20T17:07:15Z |
| Expected | healthy + version |
| Actual | `status: healthy`, **version 0.9.7**, application `FAD - Investment Front Office Application`, uptime `549761.11` s |
| Result | **P** |

### T2 — `Search_Funds` smoke (baseline parity)

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T2 |
| UTC | 2026-08-20T17:07:19Z |
| Input | `Search_Funds(search_term="Citadel Kensington Global Strategies")` |
| Expected | fund 500 / solovis |
| Actual | `count: 1`, `fund_id: "500"`, `Citadel Kensington Global Strategies Fund Ltd.`, `source: solovis`, envelope **0.9.7** |
| Result | **P** — identical to the 0.9.5 baseline |

### T3 — `get_user_info` (O4 identity probe)

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T3 |
| UTC | 2026-08-20T17:07Z |
| Expected (ideal) | Email of the authenticated user |
| Actual | `{"success": false, "error": "No user email found in request headers."}` |
| Result | **F (finding O4)** — unchanged on 0.9.7, third client surface |

Tool description now self-declares: *"Return user email from forwarded request headers (informational only; **no auth in this service**)."*

### T4 — Unauthenticated POST

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T4 |
| UTC | 2026-08-20T17:03:38Z |
| Input | `POST /aloha/mcp` JSON-RPC `initialize`, no `Authorization` |
| Actual | **HTTP 401**; `{"error":"Unauthorized",...}`; `Www-Authenticate: Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"` |
| Result | **P** |

### T5 — Unauthenticated GET (SSE stream)

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T5 |
| Actual | **HTTP 401** |
| Result | **P** |

### T6 — Invalid bearer token

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T6 |
| Input | Synthetic (non-user) bearer string on `tools/list` |
| Actual | **HTTP 401** `{"error":"invalid_token","error_description":"Bearer token validation failed."}` |
| Result | **P** — clean rejection, no 5xx leak |

### T7 — OAuth protected-resource metadata

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T7 |
| `/.well-known/oauth-protected-resource/aloha/mcp` | **200** · `resource: https://mcp.conceptia.com/aloha/mcp` · scopes `openid profile user.read` — **correct** |
| `/.well-known/oauth-protected-resource` (the URL the 401 header advertises) | **200** · `resource: https://mcp.conceptia.com` — **wrong resource identifier** |
| Result | **F (finding S4)** — see §6 |

### T8 — Authorization server metadata

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T8 |
| Actual | issuer `https://mcp.conceptia.com`; `authorization_endpoint /authorize`; `token_endpoint /oauth/token`; `registration_endpoint /register`; `code_challenge_methods_supported: ["S256","plain"]`; `grant_types_supported: ["authorization_code","refresh_token"]`; `token_endpoint_auth_methods_supported: ["none"]`; `jwks_uri` → Entra tenant `0afd37d3-…` |
| Result | **P** with findings **S2** (PKCE `plain`) and the refresh-grant contradiction in §5 |

### T9 — TLS

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T9 |
| Actual | **TLSv1.3**, `TLS_AES_128_GCM_SHA256`; cert `CN=mcp.conceptia.com`, Let's Encrypt, valid `2026-07-05` → **`2026-10-03`**; `http://` → **302** to `https://`; **no `Strict-Transport-Security` header** |
| Result | **P** with finding **S3** |

### T10 — Tool catalog delta

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T10 |
| Baseline | 34 tools (`aloha-tool-inventory-2026-08-06.md`) |
| Actual | **35** — added **`get_cambridge_benchmarks`**, nothing removed |
| Verified | `get_cambridge_benchmarks` and lowercase alias `search_funds` both live-served with full schemas |
| Result | **P** (informational) — feeds [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) |

### T11 — Local client auth state

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T11 |
| UTC | 2026-08-20T17:05Z |
| Actual | `claude mcp list` → `conceptia-aloha … (HTTP) - ! Needs authentication`; `claude.ai conceptia-aloha - ✔ Connected` |
| Result | **F** — the native-HTTP path under test is unauthenticated |

### T12 — Stored credential inspection

| Field | Value |
|---|---|
| Test ID | KS-1070_2nd_C_T12 |
| Store | `~/.claude/.credentials.json` → `mcpOAuth["conceptia-aloha|…"]` |
| Fields present | `accessToken`, `expiresAt`, `scope`, `clientId`, `issuer`, `discoveryState` |
| Fields **absent** | **`refreshToken`** (control: the `claudeAiOauth` record in the same file *does* have one) |
| Token | RS256 JWT · `iat 2026-08-12T04:02:14Z` → `exp 2026-08-12T05:17:05Z` = **75 min TTL** · expired **8.5 days** before this test |
| `aud` | `00000003-0000-0000-c000-000000000000` — **Microsoft Graph** |
| `scp` | `email Files.Read.All openid profile User.Read` |
| Identity claims | `upn`, `unique_name` **present** |
| Result | **F** — root cause for AC5; source of findings **S1** and O4 attribution |

---

## 5. AC5 — the restart evidence the first cycle never had

Cursor's own MCP logs record every client start. Every cold start over ten days was rejected:

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
| **2026-08-21 01:19:35** | **2026-08-20 18:19:35Z** | **`MCP OAuth callback exchange completed`** → connected 01:19:36 |
| 2026-08-21 01:20:05 | 2026-08-20 18:20:05Z | **`Successfully connected`** — no re-auth, **30 s** after the one above |

*(The 2026-08-10 log was read during this pass and has since been rotated out by Cursor's log cleanup.)*

**What this means.** The connection survives a restart **only while the 75-minute access token is still valid** — the trivial case, demonstrated by the 30-second gap. Past that window it has failed **eight times out of eight**. AC5 as written is **not met**.

**Root cause.** No refresh token is ever persisted (T12). The granted scope is `openid profile user.read` with **no `offline_access`**, and Entra ID will not mint a refresh token without it. Yet `/.well-known/oauth-authorization-server` advertises `grant_types_supported: ["authorization_code","refresh_token"]`, and Cursor's dynamic client registration explicitly requests `grant_types: ["authorization_code","refresh_token"]`. **The server advertises and accepts a refresh grant it never actually provisions.** Which half drops it — the client's scope request or the server's token response — needs a dev-side confirmation.

**Consequence for the Cursor half of this retest.** The Cursor 2nd test ran at 18:21–18:23 UTC, **two minutes after** the 18:19:35 UTC re-authentication. Its "session already authenticated and usable" observation is accurate but describes a freshly minted session; it is not restart-persistence evidence.

---

## 6. Findings

| ID | Finding | Severity | Status vs 1st cycle |
|---|---|---|---|
| **AC5-FAIL** | Session does not survive restart past the 75-min token TTL; no refresh token persisted; AS advertises a refresh grant it does not provision | **High** | **Escalated** from "Partial / process gap" to a reproduced product defect |
| **S1** | **Audience confusion / token pass-through.** Token presented to the Aloha endpoint has `aud` = Microsoft Graph and `scp` including `Files.Read.All`. MCP spec forbids a server accepting tokens not issued for itself; the scope is far broader than the advertised `openid profile user.read`, so a leaked token grants tenant-wide Graph file read | **High (security)** | **New** |
| **S2** | `code_challenge_methods_supported` includes **`plain`**; OAuth 2.1 / MCP require S256. Permits a PKCE downgrade | **Medium (security)** | **New** |
| **S3** | No `Strict-Transport-Security` header (HTTP does 302 to HTTPS) | **Low–Medium (security)** | **New** |
| **S4** | `WWW-Authenticate` advertises `resource_metadata` whose `resource` is `https://mcp.conceptia.com`, not the endpoint. The correct path-suffixed document exists and is right | **Low (spec)** | **New** — same class of mismatch that enables S1 |
| **O4** | `get_user_info` → "No user email found in request headers" despite OAuth. Token **does** carry `upn`/`unique_name`, so identity is dropped between gateway and service | **High (functional)** | **Still present** on 0.9.7 — [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) |
| **DUP-REG** | Two registrations for the same URL: `claude.ai conceptia-aloha` (Connected) and `conceptia-aloha` (Needs authentication). Tools respond through the connector while the native path under test is dead — a tester can mistake one for the other | **Medium (test validity)** | **New** — may affect the 2026-08-07 Claude Code evidence |
| **CATALOG** | 35 tools (was 34): `get_cambridge_benchmarks` added, nothing removed | Info | **New** — feeds KS-1071 |
| **BUILD** | 0.9.5 → **0.9.7**, deployed ≈ 2026-08-14T08:24Z | Info | New |
| **2-ACCOUNT** | Still one QA Azure AD account | **High for KS-1077** | Unchanged |

---

## 7. What could not be tested, and why

| Item | Blocker |
|---|---|
| AC2 — live browser OAuth on two clients | This session is non-interactive; the OAuth flow needs an interactive terminal |
| AC3 — two distinct Azure AD identities | Second QA account still not provisioned |
| KS-1077 user-scoping comparison | Blocked by both of the above, and by O4 |

---

## 8. Verdict

**FAIL.** The gating story does not currently hold. AC5 is a reproduced product defect rather than the documented process gap; AC2 and AC3 are unmet; and one new **High** security finding (S1) sits outside the original scope entirely.

Server health, functional parity, TLS and unauthenticated rejection all remain solid — the endpoint works. What does not work is session durability and identity propagation.

### Recommended next steps

1. Raise the refresh-token gap (**AC5-FAIL**) as a product bug against the Aloha MCP gateway.
2. Raise **S1** as its own security ticket — it should not ride along on a connectivity story.
3. Provision **two** QA Azure AD accounts before any KS-1077 retest.
4. Re-run KS-1071 for the catalog delta.
5. Confirm which path the 2026-08-07 Claude Code evidence used (native vs claude.ai connector) — see **DUP-REG**.

---

## 9. Evidence index

| Artifact | Location |
|---|---|
| This report | `Aloha Server/Test Result/2nd Test/KS-1070 Claude Result.md` |
| Cursor half | `Aloha Server/Test Result/2nd Test/KS-1070 Cursor Result.md` |
| Consolidated | `Aloha Server/Test Result/2nd Test/KS-1070 Consolidated report.md` |
| 1st cycle | `Aloha Server/Test Result/KS-1070 *.md` |
| Baseline inventory | `Aloha Server/baseline/aloha-tool-inventory-2026-08-06.md` |
| Cursor MCP logs | `%APPDATA%/Cursor/logs/*/mcp-server-user-conceptia-aloha.log` |
| Claude credential store | `~/.claude/.credentials.json` (names only — no values read out) |
| Jira | https://gendvn.atlassian.net/browse/KS-1070 (read-only) |
