# KS-1080 Consolidated Report — Verify authentication, TLS, transport and session behaviour

> **Story:** [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) · **Draft ID:** AM-11 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1080 Cursor Result.md](KS-1080%20Cursor%20Result.md) (~08:49–08:52 UTC) · [KS-1080 Claude Result.md](KS-1080%20Claude%20Result.md) (~08:38 UTC)  
> **Clients:** Cursor + Claude Code + curl (unauth)  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1080 is **Pass with findings**. Unauthenticated access is correctly rejected (**401** + spec-style `WWW-Authenticate`); tools are not reachable without auth; HTTPS is enforced (HTTP redirects); TLS 1.2/1.3 work. **O8/O9 reproduce** and need **service-owner disposition** (not unilaterally closed). **O4 remains Fail** (joint with KS-1077). Burst of 50 calls: **no crash**, **no 429**. TLS 1.0/1.1 rejection **inconclusive** on Windows Schannel (both clients). Catalog error-body AC still fails via KS-1078 stack leaks (cross-ref).

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| Unauth 401 + WWW-Authenticate | **P** | **P** | **P** |
| ≥5 tools unauth → 401 | **P** (7 tools) | **P** (5 tools) | **P** |
| TLS 1.2 / 1.3 | **P** | **P** | **P** |
| TLS 1.0 / 1.1 reject | Inconclusive (Schannel) | Inconclusive (Schannel) | **Gap** |
| Plaintext HTTP | **302**→HTTPS | **307**→HTTPS | **P** (redirect) |
| Burst 50 | 50×401, 0×429, no crash | Same | **Partial** |
| O8 `/aloha/sse` | 401 not 404 | 401 not 404 | **Reproduced** |
| O9 plain + register/`none` | Metadata confirmed | Same | **Reproduced** |
| O4 | No email + health OK | Same (5th+) | **Fail** (known) |
| Auth 401 body clean | **P** | **P** | **P** |
| Tool error no stacks | Fail via KS-1078 | Fail via KS-1078 | **Fail** (cross-ref) |
| Session restart / revoke | Re-auth works; revoke n/t | Carry KS-1070; revoke n/t | Partial |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Unauth 401 + WWW-Authenticate | **Pass** |
| No tool without auth (spot-check) | **Pass** |
| TLS 1.2+ / reject 1.0–1.1 | **Pass** (1.2+) / **Inconclusive** (legacy reject) |
| No plaintext HTTP | **Pass** |
| Session restart / expired | Restart-ish **Pass**; expired/revoked **Not tested** |
| O8 dispositioned | **Reproduced**; owner Q7 open |
| O9 dispositioned | **Reproduced**; owner Q6 open |
| O4 dispositioned w/ AM-08 | **Confirmed Fail** forwarding; KS-1077 fail-closed nuance |
| Error bodies no stacks/secrets | Auth surface **Pass**; tool surface **Fail** (NEW-16) |
| ~50 burst 429/backoff, no crash | No crash **Pass**; 429 **not observed** |

---

## Findings (merged)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **O4** | Identity not in headers | High | AM-08 / owners Q3 |
| **O8** | SSE route still 401 | Low–Med | Owners Q7 |
| **O9** | PKCE `plain` + open register/`none` | Medium | Owners Q6 |
| Soft | No 429 at 50 unauth calls | Low | Ask rate-limit config |
| Gap | TLS 1.0/1.1 need OpenSSL/testssl | n/a | Follow-up |
| cross-ref | Stack leaks | S2 | KS-1078/1079/1083 |

---

## Recommendation

- Close KS-1080 as **Pass with findings**.  
- Escalate O4/O8/O9 questions to service owners (plan §9).  
- Optional follow-ups: OpenSSL TLS legacy check; admin token-revoke test; rate-limit confirmation.  
- Do **not** treat O4 as automatic S1 data-exposure without KS-1077 NEW-15 nuance.
