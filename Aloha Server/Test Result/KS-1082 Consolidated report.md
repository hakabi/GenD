# KS-1082 Consolidated Report — Assess whether an agent can select the right tool from the catalog

> **Story:** [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) · **Draft ID:** AM-13 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1082 Cursor Result.md](KS-1082%20Cursor%20Result.md) · [KS-1082 Claude Result.md](KS-1082%20Claude%20Result.md)  
> **Clients:** Cursor + Claude Code  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1082 is **Pass with findings**. When tool **name, defaults, and question** align (top-10 returns; liquidity cost of fund 500), both clients complete in **1 clean call**. Catalog friction shows up on (1) **`fund_analyzer` mandatory `start_date`** with no NL cue, (2) **four-way fund-search overlap** where naive `Search_Funds` omits `manager_name` while `search_all_funds` includes it, and (3) **`fee_model`’s 15 required params** with no description pointer to defaults (plus NEW-13 rename friction). **O5 pure aliases are low risk** (self-documenting). Findings are **catalog properties**, not client-specific — Prompt paths agree across Cursor and Claude.

---

## Cross-client agreement

| Prompt / check | Cursor | Claude Code | Final |
|---|---|---|---|
| P1 → `fund_analyzer` first; `start_date` fail | Same | Same | **Agree** |
| P2 → `get_top_funds_by_returns` · 1 call | Same | Same | **Agree** |
| P3 → `calculate_liquidity_cost` · 1 call · −0.009 | Same | Same | **Agree** |
| P4 naive `Search_Funds` → 9, no manager | Same | Side-by-side | **Agree** |
| P4 `search_all_funds` → 9 + manager_name | Same | Same | **Agree** |
| O5 alias confusion | None | None | **Low risk** |
| fee_model unaided | Fail (missing required) | Cannot cleanly | **Agree** |
| Descriptions document stripped Search_Funds? | **Yes** (current text) | Claude: “not documented” | **Partial** — text improved; still no positive cue that `search_all_funds` returns manager |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Cold-start prompts + tool calls / first choice / completion | **Pass** |
| Calls-to-answer recorded | **Pass** |
| Wrong-path selections recorded | **Pass** |
| O5 duplicate-alias impact | **Pass** — low in practice |
| Four search tools overlap assessed | **Pass** — not clear from descriptions alone for manager Q |
| fee_model 15 params unaided | **Pass assessed** — cannot without defaults + remapping |
| Consolidation recommendation | **Pass** (aligned drafts) |

---

## Findings (merged)

| ID | Finding | Severity | Notes |
|---|---|---|---|
| start_date friction | `fund_analyzer` requires `start_date` with no default / NL cue | S3 | Both clients |
| **NEW-20** | Search output-shape gap (`manager_name` only on fuller tools) | S3 | Claude called this NEW-19; remapped — **NEW-19** reserved for KS-1081 liquidity timeout |
| fee_model discoverability | No pointer to `get_fee_model_defaults`; 15 required | S3 | + NEW-13 renames |
| query_fund_manager trap | Manager LIKE filter → 1/9 funds vs ES | S3 | Cursor |
| O5 aliases | Self-documenting; low selection confusion | Positive | Both |

---

## Consolidation recommendation (merged)

1. Hide pure aliases (`search_funds`, `rating_detail`, `rating_summary`).  
2. One search tool + `source` filter; always include `manager_name`.  
3. `fee_model` → defaults cross-ref or `use_defaults` with correct mapping.  
4. Default `fund_analyzer.start_date` (e.g. trailing 12 months).  
5. Clarify ES search vs `query_fund_manager` for “funds by manager” questions.

---

## Recommendation

- Close KS-1082 as **Pass with findings**.  
- Carry NEW-20 + fee_model/start_date items into **KS-1083** triage.  
- Catalog problems confirmed on **two clients** — not agent-only quirks.
