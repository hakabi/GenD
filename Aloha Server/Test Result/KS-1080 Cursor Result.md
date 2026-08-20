# KS-1080 Cursor Result — Verify authentication, TLS, transport and session behaviour

> **Story:** [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) · **Draft ID:** AM-11 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE + `curl.exe` (unauth probes)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~08:49–08:52 UTC  
> **Status:** **PASS WITH FINDINGS** (TLS 1.0/1.1 inconclusive; O8/O9 await owner disposition; O4 Fail as known)

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Unauth `POST /aloha/mcp` → 401 + `WWW-Authenticate` | **P** | Bearer + resource_metadata + scopes |
| ≥5 tools unauth across groups | **P** | 7 tools all **401** |
| TLS 1.2 / 1.3 | **P** | Both connect → 401 |
| TLS 1.0 / 1.1 rejected | **Inconclusive** | Schannel may ignore `--tls-max 1.0`; still got 401 |
| No plaintext HTTP | **P** | `http://` → **302** → `https://…/aloha/mcp` |
| Session / re-auth | **P*** | `mcp_auth` restored tools; `health_check` OK after Unauthorized |
| Expired/revoked token | **Not tested** | No revoke capability |
| O8 `/aloha/sse` | **Reproduced** — **401**, not 404 | Owner disposition pending (§9 Q7) |
| O9 PKCE `plain` + open register | **Reproduced** in metadata | Did **not** POST `/register` |
| O4 identity | **F** — no email after OAuth | 6th+ reproduction |
| Auth error bodies clean | **P** (401 JSON) | Tool-error stacks still Fail via KS-1078 cross-ref |
| 50-call burst | **Partial** | **50×401**, **0×429**, no crash |

---

## Tests

### T1 — Unauthenticated MCP
```
POST https://mcp.conceptia.com/aloha/mcp
→ 401
WWW-Authenticate: Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"
Body: {"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}
```
**Pass.**

### T2 — Tools without auth (spot-check)
| Tool | Group | HTTP |
|---|---|---|
| `health_check` | Introspection | 401 |
| `Search_Funds` | Search | 401 |
| `get_data` | Datalake | 401 |
| `fund_analyzer` | Analysis | 401 |
| `get_rating_details` | Ratings | 401 |
| `get_fund_returns` | Returns | 401 |
| `fee_model` | Fee | 401 |

**Pass** — auth before tool dispatch.

### T3 — TLS / HTTP
| Check | Result |
|---|---|
| `--tlsv1.2 --tls-max 1.2` | 401 — **P** |
| `--tlsv1.3` | 401 — **P** |
| `--tlsv1.0 --tls-max 1.0` | Still 401; **cannot confirm** negotiated version (Windows Schannel) |
| `http://mcp.conceptia.com/aloha/mcp` | **302** Location `https://…/aloha/mcp` — **P** (Claude saw 307; both redirect, no plaintext body) |

### T4 — OAuth metadata (O9)
`GET /.well-known/oauth-authorization-server`:
- `code_challenge_methods_supported`: **`["S256","plain"]`**
- `registration_endpoint`: `https://mcp.conceptia.com/register`
- `token_endpoint_auth_methods_supported`: **`["none"]`**

`GET /register` → **404** (metadata advertises POST registration; not exercised — state-changing).  
Protected resource metadata OK.

### T5 — O8 SSE
`GET /aloha/sse` → **401** + same `WWW-Authenticate` (not 404). Route still live; same auth strength.

### T6 — O4
After re-auth: `get_user_info` → `"No user email found in request headers."` while `health_check` succeeds (v0.9.5). **O4 confirmed.** Joint disposition with KS-1077 (fail-closed ratings, not proven shared-data S1).

### T7 — Burst
50 sequential unauth `health_check` calls → **50×401**, **0×429**, no timeouts/crashes. Soft finding: no throttling signal at this volume.

### T8 — Session
Mid-test Unauthorized → `mcp_auth` → tools usable again. Formal restart/revoke not measured this ticket (carry KS-1070).

### T9 — Error bodies (this ticket’s auth surface)
401 bodies: structured JSON, no stacks/secrets. **Tool** error stacks (NEW-16 etc.) remain Fail for the catalog-wide AC — cross-ref KS-1078/1079.

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| **O4** | Identity not forwarded | High (KS-1077 nuance) |
| **O8** | `/aloha/sse` still 401 | Low–Med pending owner |
| **O9** | PKCE `plain` + open register/`none` | Medium pending owner |
| — | No 429 at 50-call burst | Soft / Low |
| — | TLS 1.0/1.1 reject unverified on Schannel | Testing gap |
| cross-ref | Stack leaks on tool errors | S2 (KS-1078) |

---

## Recommendation

Close as **Pass with findings** for gateway auth/TLS basics. Keep O4/O8/O9 open for service-owner answers (§9 Q3/Q6/Q7). Optional: OpenSSL/`testssl.sh` for TLS 1.0/1.1; admin revoke-token test for expired session.
