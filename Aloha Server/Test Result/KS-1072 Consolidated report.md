# KS-1072 Consolidated Report — Verify fund search and resolution

> **Story:** [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) · **Draft ID:** AM-03 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1072 Cursor Result.md](KS-1072%20Cursor%20Result.md) (2026-08-07 ~03:39–03:44 UTC) · [KS-1072 Claude Result.md](KS-1072%20Claude%20Result.md) (2026-08-07 ~03:18 UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1072 is **closed as Pass with findings**.

Core fixtures agree on both clients: exact-name → fund **500** / solovis; ambiguous `"Citadel Investment"` → **4 ALB** candidates (`986`, `4874`, `104766`, `200055`); empty/whitespace/missing term reject cleanly; CRBM name resolution works; O5 aliases are behaviourally identical.

Open defects to triage (not ticket-blocking for search basics):

1. **O6** — `fund_id` JSON type differs by tool (string vs number).
2. **Special-character handling** — two related behaviours observed (see findings).

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| Exact name → 500 / solovis | **P** | **P** | **P** |
| Ambiguous 4-candidate set | **P** (order 986…) | **P** (same set) | **P** |
| `search_albourne` on Solovis-only name | Clear error | Clear error | **P** (expected) |
| O5 `search_funds` ≡ `Search_Funds` | Identical | Byte-identical (ignore timestamps) | **P** |
| O6 fund_id type | **F** string vs number | **F** confirmed structural | **F** (finding) |
| `99999999` / `""` / whitespace | Explicit errors | Explicit errors | **P** |
| Long input (500×A) | Not run | Clean “no funds found” | **P** (Claude) |
| Special chars | `!@#$%` → **success, 320 funds** | `!@#$%^&*()` → **raw ES error leak** | **F** (findings) |
| `search_crbm_index` | S&P 500 → 16 rows | MSCI World → 14 rows | **P** |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Exact-name → 500 / solovis | **Pass** |
| Ambiguous set recorded | **Pass** |
| Cross-tool consistency | **Pass** (set); type divergence = O6 finding |
| O5 aliases | **Pass** |
| O6 type consistency | **Fail** (documented finding) |
| Non-existent / empty / whitespace | **Pass** |
| Special characters without raw/bad behaviour | **Fail** (see NEW findings) |
| Solovis reachable via search | **Pass** |
| CRBM resolves to ids | **Pass** |

---

## Findings (merged, ignore Antigravity)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **O6** | `Search_Funds`/`search_funds` return string `fund_id`; `search_all_funds`/`search_albourne_funds` return number | Medium | AM-13 / AM-14 |
| **NEW-S1** (Cursor) | `Search_Funds("!@#$%")` returns **320** funds (success) | Medium | AM-10 / AM-14 |
| **NEW-1** (Claude) | Stronger special-char set returns **raw Elasticsearch** body (index UUID, node id, dated index name) | Medium (S3) | AM-10 |
| O5 | Duplicate aliases still exposed | Medium (catalog) | AM-13 |

---

## Recommendation

- Close KS-1072 as **Pass with findings**.
- Unblocks KS-1073 and other search-dependent work.
- File/triage O6 + special-char defects in AM-10 / AM-14 (do not treat as S1).
