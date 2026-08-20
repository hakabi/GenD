# KS-1077 Consolidated Report — Verify the ratings tools and confirm user-scoping behaviour

> **Story:** [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) · **Draft ID:** AM-08 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1077 Cursor Result.md](KS-1077%20Cursor%20Result.md) (2026-08-07 ~07:51–07:55 UTC) · [KS-1077 Claude Result.md](KS-1077%20Claude%20Result.md) (2026-08-07 ~09:xx UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **FAIL (O4)** — user-scoped ratings non-functional; **S1 cross-user leak not observed** (fail-closed / NEW-15)

---

## Executive verdict

KS-1077 is **FAIL** on the core identity/scoping ACs: **O4 confirmed on both clients** — OAuth completes but **no user email reaches the service**.

The plan’s feared S1 outcome (everyone silently seeing a **shared default user’s ratings**) was **not observed**. With no identity, `list_rating_details_by_user` **fails closed**: empty list + `"No user identity; returning empty rating list."` (**NEW-15**). That makes the two-account “identical populated data → S1” trigger **not fireable on this build via the OAuth path** — both callers get empty, which proves a **broken feature**, not proven shared-data exposure.

**Boundary respected on both clients:** no third-party `user=` override to read another person’s data. Claude additionally confirmed own-email override is read (different empty message). Recommend QA lead confirm `MCP_DEFAULT_USER_EMAIL` config with service owners before treating S2 framing as final for cycle §11.1.

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| `get_user_info` | **F** — no email in headers | **F** — same | **F** O4 confirmed |
| Identity reaches service? | **No** | **No** | **No** (definitive) |
| `list_…` no `user` | Empty + “No user identity…” | Same | Fail-closed **NEW-15** |
| Own `user=` override | Not run (boundary) | Empty + “No rating detail rows found for this user…” | Override path works; no rows for tester email |
| Two distinct QA accounts | **B** | **B** (one identity) | Incomplete; moot for shared-leak if both empty under O4 |
| `get_rating_summary` fund 500 | **P** 8/6/9/7.7/10 | **P** identical values | **P** |
| `rating_summary` ≡ `get_rating_summary` | Identical | Byte-identical incl. `_time_` | **O5 confirmed** |
| `get_rating_details` / `rating_detail` | Fail `user='None'` | Fail same; O5 identical errors | O5 confirmed; **no happy-path fixture** |
| Invalid `id` | Structured “No … found” | Same | **P** |
| Foreign PII in evidence | None | None (own email only, in-scope) | **P** |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| `get_user_info` both accounts / both clients | Recorded on **both clients**, **same identity** — identity **Fail** (O4). True second QA account still missing |
| Identity reaches service stated | **No** |
| `list_rating_details_by_user` no `user` compared | Both clients: empty fail-closed — **not** identical *populated* scoped data |
| Identical scoped data → S1 stop/escalate | **Not triggered** (no data returned). Escalate **O4/NEW-15** as functional/identity defect; confirm env fallback with owners |
| Summary happy path | **Pass** |
| Detail happy path | **Fail / Blocked** — no successful fixture under O4 + available ids |
| O5 detail aliases | **Pass** (identical behaviour) |
| O5 summary aliases | **Pass** |
| Invalid `id` structured error | **Pass** |
| No foreign personal data in evidence | **Pass** |

---

## Findings (merged; ignore Antigravity)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **O4** | No email in headers despite OAuth — 4th+ reproduction across Cursor + Claude | **High** | KS-1080 (AM-11) |
| **NEW-15** | No-identity list path **fails closed** (empty + explicit message), **not** shared `MCP_DEFAULT_USER_EMAIL` dump — update risk model; confirm config with owners | **S2 High** functional (S1 exposure **not** evidenced) | AM-08 / AM-11 — QA lead classification check |
| Detail happy-path gap | No successful `get_rating_details` fixture this cycle | Testing gap | Need known-good `{id,type,source,user}` from owners |
| **O5** | Duplicate rating detail/summary aliases | Medium (catalog) | AM-13 |
| Cross-tool consistency | Summary 8/6/9/7.7/10 matches `ir_model` ratings for fund 500 (KS-1076) | Positive | — |

---

## Recommendation

- Keep KS-1077 as **FAIL** until O4 is fixed (user-scoped detail/list tools unusable via OAuth).  
- **Do not** auto-classify as S1 data-exposure on current evidence; document **NEW-15** fail-closed and ask service owners to confirm `MCP_DEFAULT_USER_EMAIL` behaviour in all environments.  
- Optional: still run a true second QA account later for completeness; under current fail-closed behaviour both should get empty lists if O4 persists.  
- Feed O4/NEW-15 to **KS-1080 (AM-11)**; O5 aliases to **KS-1082 (AM-13)**; error indistinguishability (bad id vs no rows) to **KS-1079 (AM-10)**.
