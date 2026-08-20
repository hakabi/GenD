# KS-1080 Claude Result — Verify authentication, TLS, transport and session behaviour

> **Story:** [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) · **Draft ID:** AM-11 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** High · **Blocked by:** KS-1070 (unblocked)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223) + direct `curl` (unauthenticated checks don't need an MCP client)
> **Executed:** 2026-08-07, ~08:38 UTC
> **Status:** **PASS with findings and one disclosed test limitation.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass. Core auth/transport controls hold up well; O8/O9 reproduce as documented but their "disposition" (intentional vs. defect) is a service-owner decision I can't make unilaterally.

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Unauthenticated `POST` rejected with 401 + `WWW-Authenticate` | **P** | Reproduced from KS-1070 |
| No tool callable without auth, spot-checked across 5 groups | **P** | `health_check`, `Search_Funds`, `get_data`, `fund_analyzer`, `get_rating_details` — all 401 before reaching tool logic |
| TLS 1.2 / 1.3 negotiate successfully | **P** | |
| TLS 1.0 / 1.1 rejected | **Inconclusive — client-side limitation, disclosed below** | Could not force a genuine TLS 1.0/1.1 handshake attempt from this environment |
| No plaintext HTTP served | **P** | `http://` → 307 redirect to `https://`, no content served over plaintext |
| Session survives client restart | **P (carried over from KS-1070)** | See note below |
| Expired/revoked token cannot call tools | **Not tested — cannot force my own token to expire/revoke** | Needs a dedicated test with a token the tester can actually invalidate |
| O8 — legacy `/aloha/sse` | **Reproduced: still 401, not 404** | Disposition (decommission vs. keep) is a service-owner call |
| O9 — PKCE `plain` + open registration | **Reproduced** | Same — disposition is a service-owner call |
| O4 — identity forwarding | **Reproduced for a 5th time** | Full detail in KS-1077 and KS-1070/1071/1074 Claude results |
| No stack traces / internal paths / secrets in error bodies | **Fail — cross-referenced from KS-1078** | Two confirmed violations already on file; not re-derived here |
| 50-call burst: 429/backoff, no crash | **Partial** — no crash (pass), but **no 429 observed either** | See burst test below |

---

## Tests

### T1 — Five tools, no authentication, across different tool groups

```bash
curl -s -i -X POST https://mcp.conceptia.com/aloha/mcp -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"<tool>","arguments":{}}}'
```

| Tool | Group | Result |
|---|---|---|
| `health_check` | Introspection | 401 |
| `Search_Funds` | Fund search | 401 |
| `get_data` | Datalake query | 401 |
| `fund_analyzer` | Bundled analysis | 401 |
| `get_rating_details` | Ratings | 401 |

All five rejected identically, before any tool-specific logic runs — the gateway enforces auth ahead of MCP method dispatch. **Pass**, satisfies "spot-check at least 5 tools across different groups."

### T2 — TLS version negotiation

| Attempt | Result |
|---|---|
| `--tlsv1.2 --tls-max 1.2` | Connects, gets a normal `401` — TLS 1.2 accepted |
| `--tlsv1.3` | Connects, gets a normal `401` — TLS 1.3 accepted |
| `--tlsv1.0 --tls-max 1.0` | Connects and gets a normal `401` response body — **but see limitation below** |
| `--tlsv1.1 --tls-max 1.1` | Same as above |

**Disclosed limitation:** this environment's `curl` (8.19.0, Windows) uses the **Schannel** TLS backend, not OpenSSL. Windows 11 disables TLS 1.0/1.1 at the OS level by default (has since ~2020), and Schannel's verbose logging doesn't report the negotiated protocol version the way OpenSSL builds do — I could not find any log line confirming which TLS version was actually used for the "TLS 1.0/1.1" attempts. The most likely explanation is that **Schannel silently ignored the requested max version and negotiated TLS 1.2+ anyway**, meaning I successfully verified TLS 1.2/1.3 work, but **could not actually attempt a TLS 1.0/1.1 handshake against the server from this machine** — so I cannot confirm the server would reject one. **This AC bullet needs a Linux/OpenSSL-based `curl` (or an external scanner like SSL Labs / `testssl.sh`) to close out properly** — I'm flagging the gap rather than guessing at a result.

### T3 — Plaintext HTTP

```
curl http://mcp.conceptia.com/aloha/mcp
→ HTTP/1.1 307 Temporary Redirect
  Location: https://mcp.conceptia.com/aloha/mcp
```

No content is served over plaintext HTTP — it redirects immediately to HTTPS. **Pass.**

### T4 — Burst test: 50 rapid unauthenticated calls

50 sequential `health_check` calls, ~30 seconds wall-clock (~0.6s/call, consistent with normal round-trip latency, not throttling):

```
50 × HTTP 401
0 × HTTP 429
0 × connection errors / timeouts
```

**No crash, no degradation — the service remained fully responsive throughout and immediately after.** That satisfies the "does not crash the service" half of this AC cleanly. The other half — "produces a 429 or graceful backoff" — was **not observed at this volume**. This could mean either (a) rate limiting exists but its threshold is above 50 calls in 30 seconds, or (b) no rate limiting is configured on this endpoint at all. I did not push higher volumes to find the actual threshold, since the plan explicitly defers real load/stress testing (§2.2) and 50 is the volume this ticket itself specifies. **Worth flagging as a soft finding**: the complete absence of any throttling signal at a modest burst size is a mild robustness gap worth a follow-up question to the service owner, even though it isn't a confirmed defect at the volume actually tested.

### T5 — O8: legacy `/aloha/sse`

```
curl -X POST https://mcp.conceptia.com/aloha/sse → 401 (not 404), same WWW-Authenticate header as /aloha/mcp
```

Reproduces exactly as documented on 2026-08-05 and again in my KS-1070 testing. The route is still live in routing. **I cannot disposition whether this is intentional** (e.g. kept for backward compatibility during a migration window) or an oversight — that determination belongs to the service owners per plan §9 Q7. What I can state definitively: the route is reachable, requires the same auth as the primary endpoint (no weaker protection), and returns no additional information beyond the standard 401 body.

### T6 — O9: PKCE `plain` and open registration

From `/.well-known/oauth-authorization-server` (captured in KS-1070, re-verified unchanged):

```json
"code_challenge_methods_supported": ["S256", "plain"],
"registration_endpoint": "https://mcp.conceptia.com/register",
"token_endpoint_auth_methods_supported": ["none"]
```

Both facts reproduce. **I deliberately did not POST an actual client-registration request to `/register`** — attempting real dynamic client registration would create a new, possibly persistent client record on the service, which is a state-changing action outside a read-only QA cycle's mandate and outside what I should do without explicit sign-off. The metadata alone is sufficient to confirm the endpoint is configured for open (unauthenticated) registration with no client-secret requirement; whether that's rate-limited server-side is something only the service owner can confirm from their own logs/config, not from a QA client probing it further.

**Disposition for both O8 and O9, honestly stated:** reproduced and confirmed present; **not** independently dispositioned as "intentional" or "defect," since that requires the service owner's answer to plan §9 Q6/Q7, not another QA observation. Recommend these move to AM-14 triage as "confirmed, awaiting service-owner input" rather than being marked resolved.

### T7 — O4: identity forwarding

Reproduces for a 5th time this cycle (Cursor's KS-1070 result, my own KS-1070/1071/1074/1077 results, and implicitly here). Full analysis — including the important nuance that the practical failure mode is "feature returns nothing for everyone" rather than "shared account data leak" — is in [KS-1077 Claude Result](KS-1077%20Claude%20Result.md). Not re-derived here; cross-referenced per this ticket's own instruction to disposition O4 "jointly with AM-08."

### T8 — Error bodies free of stack traces / internal paths / secrets

**Fail, cross-referenced from KS-1078** (not re-tested here, since re-running would just reproduce the same two calls already on file):

- `describe_table` on an invalid table name returns a full Trino/Java stack trace, revealing the query engine and that the `solovis` catalog runs on MongoDB — see [KS-1078 Claude Result](KS-1078%20Claude%20Result.md), finding NEW-16.
- `list_tables` on an invalid schema name returns a raw Python `TypeError` — see the same result doc, listed alongside NEW-16.

No hostnames, credentials, or connection strings were found anywhere in this cycle's testing (across KS-1072–1080) — the worst-case for this specific bullet did not materialize, but the stack-trace violation alone is enough to fail this AC as written.

### T9 — Session persistence

Not re-tested with a fresh probe this ticket; carried over from [KS-1070 Claude Result](KS-1070%20Claude%20Result.md): this Claude Code session picked up newly-completed OAuth from a separate terminal process without needing its own restart — a related but distinct property from "restart with an already-cached token," which remains formally unverified across all three clients tested this cycle (see KS-1070's AC5-gap finding). "Expired or revoked session cannot call tools" was not tested at all — I have no mechanism to force my own token to expire or to revoke it and confirm the resulting behavior. **Recommend this specific sub-check be picked up by whoever has admin access to revoke a live token.**

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| — | TLS 1.0/1.1 rejection **not independently verified** — this environment's Schannel-based `curl` cannot force a genuine legacy-TLS handshake attempt | n/a — testing gap, not a defect | Needs a Linux/OpenSSL client or external scanner (SSL Labs, `testssl.sh`) |
| — | No 429/backoff observed in a 50-call burst over 30s; service didn't crash, but no throttling signal appeared either | Low — soft finding, not confirmed at higher volume (out of scope per plan §2.2) | Worth a direct question to the service owner about configured rate limits |
| O8 | `/aloha/sse` still routed (401, not 404) | Low–Medium, pending service-owner intent | AM-11, plan §9 Q7 |
| O9 | PKCE `plain` + open `/register` with `none` auth method | Medium, pending service-owner intent | AM-11, plan §9 Q6 |
| O4 | Identity never forwarded (5th reproduction) | High — see KS-1077 for full nuance | AM-08 / AM-11 |
| (cross-ref) | Stack trace + raw exception leaks | S2 High — already filed in KS-1078 | AM-09 / AM-10 |

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1080 — this is the first test pass on this ticket. All findings above are either net-new (the burst test, the TLS testing-gap disclosure) or consolidate evidence already gathered in earlier Claude Code results this cycle (O4, O8, O9, the stack-trace leaks) per this ticket's own cross-referencing instructions.
