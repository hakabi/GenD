# KS-1082 Cursor Result — Assess whether an agent can select the right tool from the catalog

> **Story:** [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) · **Draft ID:** AM-13 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE (`user-conceptia-aloha`)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~09:19 UTC  
> **Status:** **PASS WITH FINDINGS**

---

## Methodology / contamination note

Same honesty bar as Claude: this Cursor agent has cycle knowledge of the catalog. For each prompt, **first tool** was chosen from **name + one-line description only** (as if cold), then executed. Prompt 4 deliberately used the *naive* first pick (`Search_Funds`) even though prior knowledge favours `search_all_funds` for manager attribution. Tester contamination is highest on Prompt 4; lowest on Prompts 2–3.

---

## Prompt 1 — "Analyse the Citadel Kensington Global Strategies fund."

| Field | Value |
|---|---|
| First tool | `fund_analyzer` |
| First choice sensible? | **Yes** — only general “analyse fund” tool |
| Call 1 | `fund_analyzer(search_term="Citadel Kensington Global Strategies")` |
| Result 1 | **Fail** — `'start_date' is a required property` |
| Call 2 | Same + `start_date`/`end_date` (+ slices off for payload control) |
| Result 2 | **Success** — ~581 KB (O3); defaults-all-slices-true would be worse |
| Calls to usable payload | **≥2** |
| Task completed? | **Partial** — call succeeds; synthesizing an answer from ~600 KB is poor UX |

**Wrong-path:** none (right tool). Friction is **schema**, not selection.

---

## Prompt 2 — "What were the top 10 funds by return last year?"

| Field | Value |
|---|---|
| First tool | `get_top_funds_by_returns` |
| First choice sensible? | **Yes** |
| Call 1 | `get_top_funds_by_returns(period_months=12)` — omit `top_n` (defaults to 10) |
| Result | **Success** — 10 funds, window Jul-2025→Jul-2026, clean structure |
| Calls | **1** |
| Task completed? | **Yes** |

---

## Prompt 3 — "What is the liquidity cost of fund 500?"

| Field | Value |
|---|---|
| First tool | `calculate_liquidity_cost` |
| First choice sensible? | **Yes** |
| Call 1 | `calculate_liquidity_cost(fund_id="500")` |
| Result | **Success** — `liquidity_cost: -0.009` (−90 bps) |
| Calls | **1** |
| Task completed? | **Yes** |

---

## Prompt 4 — "Which funds does Citadel Advisors manage?"

| Field | Value |
|---|---|
| First tool (naive) | `Search_Funds` — literal “search” + description covers ES indexes |
| First choice sensible? | **Plausible yes** — but incomplete for “managed by” |
| Call 1 | `Search_Funds(search_term="Citadel Advisors")` |
| Result 1 | **9 funds**, fields only `{fund_id, fund_name, source}` — **no `manager_name`**. Includes ANTAEUS (no “Citadel” in name) — cannot verify manager from payload |
| Compare | `search_all_funds` same term → **9 funds + `manager_name: "Citadel Advisors LLC"`** on each |
| Alias | `search_funds` → **identical** stripped shape to `Search_Funds` |
| Alt path | `query_fund_manager` + `fund_manager LIKE '%Citadel%'` → **1 row only** (fund 500) — **wrong/incomplete** vs ES 9 |
| Calls to *verified* answer | **≥2** if agent starts on `Search_Funds` then upgrades; **1** if starts on `search_all_funds` |
| Task completed on first pick? | **No** (unverified / name-inference only) |

**Description nuance (vs Claude):** current `Search_Funds` / `search_funds` descriptions *do* say they return only `fund_id`, `fund_name`, `source`. `search_all_funds` still does **not** advertise `manager_name`. An agent that reads carefully might avoid the stripped tool for a manager question — but nothing says which tool returns manager attribution.

---

## Duplicate-alias impact (O5)

| Pair | Observed confusion? |
|---|---|
| `search_funds` ↔ `Search_Funds` | **No** — description says “Alias for Search_Funds”; both same stripped output |
| `rating_detail` ↔ `get_rating_details` | **No** — “Same as get_rating_details” (not exercised on these prompts) |
| `rating_summary` ↔ `get_rating_summary` | Same pattern (description-level) |

**O5 practical risk: low.** Harder problem is **4-way search overlap** (scope + output shape), not pure aliases.

---

## Fund-search overlap (descriptions alone)

| Tool | Description cue | Output (Citadel Advisors) |
|---|---|---|
| `Search_Funds` | Same indexes as `search_all_funds`; **stripped fields** | 9 · no manager |
| `search_funds` | Alias · stripped | Same |
| `search_all_funds` | Multi-index ES | 9 · **with `manager_name`** |
| `search_albourne_funds` | ALB only | (not required for pass) |

**Not clear from descriptions alone** which tool answers “who manages what” with attributable manager fields. `query_fund_manager` looks relevant by name but is Solovis-table scoped → incomplete answer.

---

## `fee_model` — 15 required params, unaided?

| Check | Result |
|---|---|
| Required count | **15** (`fund_id` … `crystialized_paid`) |
| Description points to `get_fee_model_defaults`? | **No** |
| Unaided call `fee_model(fund_id="500")` | **Fail** — `'benchmark' is a required property` (first missing after fund_id) |
| Discover defaults by name scan? | Plausible (`get_fee_model_defaults`) |
| Map defaults → `fee_model`? | **Friction** — field renames (KS-1076 NEW-13) |

**Verdict:** agent **cannot** assemble a valid `fee_model` call unaided; needs discovery + remapping.

---

## Consolidation recommendations (Cursor)

| Action | Why |
|---|---|
| Hide `search_funds`, `rating_detail`, `rating_summary` | Pure aliases; shrink 34-tool surface |
| Merge search into one tool + `source` filter; **always** return `manager_name` | Fixes Prompt 4 gap; removes scope/output guessing |
| `fee_model` description → link `get_fee_model_defaults`, or `use_defaults:true` with correct field map | Removes 15-param + NEW-13 friction |
| Default `fund_analyzer.start_date` (e.g. trailing 12m) | Removes Prompt 1 first-call fail |
| Document or deprecate `query_fund_manager` for “manager search” vs ES search | Prevents incomplete Solovis-only answers |

---

## Prompt scorecard

| Prompt | First tool | Sensible? | Calls | Completed? |
|---|---|---|---:|---|
| Analyse Citadel Kensington… | `fund_analyzer` | Y | ≥2 | Partial (size) |
| Top 10 last year | `get_top_funds_by_returns` | Y | 1 | Y |
| Liquidity cost fund 500 | `calculate_liquidity_cost` | Y | 1 | Y |
| Citadel Advisors manage? | `Search_Funds` | Plausible | ≥2 for verified | First pick incomplete |

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| Schema friction | `fund_analyzer` requires `start_date` with no NL cue / default | S3 Medium |
| **NEW-20** | Search-tool output-shape gap: stripped tools vs `search_all_funds` `manager_name` (Claude labeled NEW-19 — remapped; NEW-19 = KS-1081 liquidity timeout) | S3 Medium |
| O5 | Duplicate aliases low practical risk (self-documenting) | Positive |
| fee_model | 15 required; no defaults pointer; unaided fail | S3 Medium |
| Wrong-path | `query_fund_manager` for “manager’s funds” → 1 of 9 | S3 Medium |

---

## AC — Cursor

| AC | Result |
|---|---|
| 4 cold-start prompts recorded | **Pass** |
| Calls / first-choice / completion | **Pass** |
| Wrong paths recorded | **Pass** (Search_Funds incomplete; query_fund_manager incomplete) |
| O5 alias impact | **Pass** — low confusion |
| Search-tool overlap assessed | **Pass** — unclear for manager Q |
| fee_model unaided | **Pass** — cannot |
| Consolidation draft | **Pass** |

**Overall: PASS WITH FINDINGS.**
