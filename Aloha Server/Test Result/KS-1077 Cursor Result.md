# KS-1077 Cursor Result — Verify the ratings tools and confirm user-scoping behaviour

> **Story:** [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) · **Draft ID:** AM-08 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa (Account A — this Cursor OAuth session only)  
> **Executed:** 2026-08-07 ~07:51–07:55 UTC  
> **Status:** **PARTIAL / FAIL on O4** — single-account pass on tool smoke; **two-account scoping compare Blocked** (needs Account B); **do not supply another person’s email** (out of scope)

---

## Verdict summary

| Check | Result | Notes |
|---|---|---|
| `get_user_info` | **F** (O4) | `"No user email found in request headers."` — OAuth completed; identity **does not** reach the service |
| OAuth identity reaches service? | **No** (definitive for this client) | Same finding as KS-1070 on Cursor + Claude Code |
| `list_rating_details_by_user` (no `user`) | Empty + explicit message | `"No user identity; returning empty rating list."` — **not** a silent dump of a default shared mailbox’s ratings |
| Two-account identical-data → S1? | **B** | Account B not available in this Cursor session |
| `get_rating_summary` / `rating_summary` happy path | **P** | fund 500 solovis; aliases **identical** |
| `get_rating_details` / `rating_detail` | **F** under O4 | Both: no detail for 500 with `user='None'` |
| Invalid `id` | **P** (structured message) | Details + summary “No … found for id=…” |
| Cross-account personal data in evidence | n/a | No other user’s PII retrieved; emails not present |

**Provisional Cursor status:** Treat **O4 as confirmed Fail** for identity forwarding. User-scoped **detail** tools are unusable without identity. **Summary** tools work without user context (table appears non-user-scoped). Full AM-08 Pass requires Account B comparison once available.

---

## Acceptance criteria matrix (Cursor Account A)

| AC | Result |
|---|---|
| `get_user_info` recorded (Account A) | **P** recorded / **F** identity |
| Identity reaches service stated definitively | **No** |
| `list_rating_details_by_user` no `user` (Account A) | **P** (empty + clear message) |
| Two QA accounts compared | **B** — need Account B |
| Identical scoped data → S1 escalate | **n/a** until Account B |
| `get_rating_details` / `get_rating_summary` happy path | Summary **P**; Details **F** (blocked by O4 / no user) |
| `rating_detail` vs `get_rating_details` (O5) | Same failure message / shape — **behaviourally identical** under O4 |
| `rating_summary` vs `get_rating_summary` (O5) | **Identical** success payload |
| Invalid `id` structured error | **P** |
| No foreign personal data in evidence | **P** |

---

## Tests

### T1 — `get_user_info` (O4)

```json
{"success": false, "error": "No user email found in request headers."}
```

**Definitive:** despite authenticated MCP OAuth in Cursor, **no email/UPN is forwarded**. Confirms KS-1070 O4 on this client again.

### T2 — `list_rating_details_by_user` with **no** `user` parameter

`limit=50` (default path; no `user`):

```json
{
  "success": true,
  "message": "No user identity; returning empty rating list.",
  "data": [],
  "meta": {"row_count": 0, "limit": 50, "truncated": false}
}
```

**Interpretation:** With O4, this path does **not** appear to fall through to a populated `MCP_DEFAULT_USER_EMAIL` dataset (at least not one that returns rows here). That is safer than “everyone sees the same default user’s ratings,” but it also means **user-scoped listing is non-functional** until identity forwarding is fixed.

🚫 Not tested: calling with another person’s `user=` email (out of scope per plan §2.2).

### T3 — Rating summary happy path + O5 alias

| Tool | Input | Result |
|---|---|---|
| `get_rating_summary` | id=500, source=solovis, type=fund | **P** — edge 8, org 6, track 9, total 7.7, conviction 10 |
| `rating_summary` | same | **Byte-identical data** (ignore timestamps if any) |
| `get_rating_summary` | id=500, source=ALB | No summary found — expected if no ALB summary row |
| `get_rating_summary` | id=99999999 | `"No rating summary found for id='99999999'…"` — **P** |

Summary tools do **not** require a resolved user — consistent with description (no `user` param on schema).

### T4 — Rating details + O5 alias (user-scoped)

| Tool | Input | Result |
|---|---|---|
| `get_rating_details` | id=500, solovis, fund | **F** — `No rating detail found … user='None' source='solovis'` |
| `rating_detail` | same | **Identical failure** — O5 duplicates |
| `get_rating_details` | id=500, no source | `user='None' source='None'` — same class |
| `get_rating_details` | id=99999999 | Same structured “No rating detail found…” (cannot distinguish “bad id” vs “no identity/no rows” cleanly) |

Happy-path **detail** for fund 500 is **blocked by missing user identity**, not necessarily by missing ratings in the warehouse.

### T5 — Two-account S1 gate

| Account | Client | `get_user_info` | `list_rating_details_by_user` (no user) |
|---|---|---|---|
| **A** (this run) | Cursor | No email (O4) | Empty + “No user identity…” |
| **B** | — | **Not run** | **Not run** |

Cannot evaluate “identical user-scoped data across two QA accounts → S1” until Account B runs the same two calls **without** passing `user=`.

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| **O4** | Identity not forwarded; `get_user_info` fails; detail tools see `user='None'` | **S1/S2 High** for ratings scoping story |
| User-scoped details unusable | `get_rating_details` / `rating_detail` / list-by-user yield no data without identity | High (blocked capability) |
| Empty-list fallback | List-by-user returns empty with clear message under O4 — **not** observed shared-default dump | Positive partial mitigation |
| **O5** | `rating_detail`≡`get_rating_details`; `rating_summary`≡`get_rating_summary` | Medium (catalog debt) |
| Invalid-id vs no-data | Detail errors do not clearly separate “unknown id” from “no user / no rows” | S3 Medium → AM-10 |

---

## Redaction note

No third-party emails or personal rating narratives appeared in responses. Fund 500 public fund name retained as fixture. Do not attach raw dumps that later include emails without redaction.

---

## Recommendation

1. Fix **O4** (gateway/header forwarding) before treating ratings detail tools as agent-safe.  
2. Complete **Account B** pass on Claude (or second QA) for `get_user_info` + `list_rating_details_by_user` (no `user`) and consolidate.  
3. If Account B also gets empty lists solely due to O4, document as **identity failure**, not proven shared-default S1 data leak — still escalate O4.  
4. If Account B returns **non-empty identical rows** to a populated Account A, escalate **S1** per plan §8.
