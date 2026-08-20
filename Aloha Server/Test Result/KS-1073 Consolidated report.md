# KS-1073 Consolidated Report — Verify fund_analyzer parameter handling and payload scoping

> **Story:** [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) · **Draft ID:** AM-04 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1073 Cursor Result.md](KS-1073%20Cursor%20Result.md) (2026-08-07 ~03:44–04:06 UTC) · [KS-1073 Claude Result.md](KS-1073%20Claude%20Result.md) (2026-08-07 ~03:19 UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **FAIL**

---

## Executive verdict

KS-1073 is **FAIL** on both Cursor and Claude Code.

Pre-cycle **O1, O2, O3** independently confirmed on both clients. Additional **S2** defects agreed:

- Malformed dates accepted (not rejected).
- `search_term` overrides a valid `fund_id` when both are supplied.
- Inverted date ranges accepted.
- O7 Python-dict error format reproduced on resolution failures.

**Do not treat `fund_analyzer` as agent-safe** until resolution, date validation/scoping, and payload caps are fixed.

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| O1 silent ambiguous resolve | **F** → 986 | **F** → 986 | **F** confirmed |
| Top-hit stability | Notes 986 vs historic 4874 | Same + daily index rebuild note | Finding (worsens O1) |
| Exact / fund_id=500 resolution | **P** (oversized) | **P** (oversized) | **P** resolve / **F** payload |
| Neither param | Clean error | Clean error | **P** |
| Invalid fund id | Clear error | Clear error (no “next step”) | **P** / Partial on next-step AC |
| Precedence fund_id + search_term | **F** search wins | **F** search wins | **F** (NEW-P1 / NEW-5) |
| O2 start_date scoping | **F** dates from 1995 | **F** 99.5% outside window | **F** confirmed |
| Inverted dates | **F** accepted | **F** accepted | **F** |
| Malformed dates | **F** `not-a-date` accepted | **F** `not-a-date` + `2026-13-45` | **F** |
| Omit end_date default | Not fully retested | **P** → month-end latest return | **P** (Claude) |
| O3 all slices off size | **~597 KB / 19.1k lines** | **585K–615K chars** band | **F** no cap |
| O7 dict-repr errors | Present | Present | **F** (S3) |

---

## Acceptance criteria — consolidated

| Area | Final |
|---|---|
| Resolution happy paths | **Pass** (identity) / **Fail** (payload usability) |
| Ambiguous search_term | **Fail** (O1) |
| Dual-param precedence | **Fail** |
| Neither param | **Pass** |
| start_date scopes series | **Fail** (O2) |
| Inverted / malformed dates | **Fail** |
| Payload bound / default usable | **Fail** (O3) |
| Invalid fund_id error | **Pass** (message clear; next-step optional gap) |

---

## Payload evidence (all optional slices false)

| Client | Approx size | Notes |
|---|---|---|
| Cursor | 596,839 bytes / 19,164 lines | `logs/KS-1073_baseline_slices_off.txt` |
| Claude | 585K–615K characters across multiple calls | Same order of magnitude |

No server-side reject/truncate observed.

---

## Findings (merged)

| ID | Finding | Severity |
|---|---|---|
| **O1** | Silent top-ES-hit resolve; no disambiguation; top hit can change (986 vs 4874) | **S2 High** |
| **O2** | `start_date` does not scope returned series; inverted range accepted | **S2 High** |
| **O3** | ~600KB baseline with all slices off; no cap | **S2 High** |
| **NEW-P1 / NEW-5** | `search_term` overrides valid `fund_id` | **S2 High** |
| **NEW-D2 / NEW-4** | Malformed dates not validated | **S2 High** |
| **O7** | Python `dict` repr in error string | **S3 Medium** |

---

## Recommendation

- Keep KS-1073 as **FAIL**.
- Remediation required before Pass: disambiguation or refuse multi-match; honour/validate dates; enforce payload cap; document or fix param precedence.
- Feed sizes to KS-1081 (AM-12); feed error shapes to KS-1079 (AM-10); triage in KS-1083 (AM-14).
