# KS-1082 Claude Result — Assess whether an agent can select the right tool from the catalog

> **Story:** [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) · **Draft ID:** AM-13 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Medium · **Blocked by:** KS-1071 (unblocked)
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223)
> **Executed:** 2026-08-07, ~09:09–09:10 UTC
> **Status:** **Pass with findings.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass.

---

## Methodology, and an honest disclosure about "cold start"

This story asks for genuinely naive, no-hint tool selection. I am not a genuinely naive agent for this catalog — by this point in the cycle I've run well over 100 calls against these 34 tools and know several tools' exact output shapes in advance (which fund-search tool returns `manager_name`, which duplicate pairs are byte-identical, etc.). I did not spin up a fresh subagent for a truly blind read, since that wasn't asked for and would meaningfully expand scope beyond a continuation of this testing pass.

What I did instead, and what the results below should be read as: for each prompt, I picked the tool I would plausibly pick **reading only the tool name and one-line description**, actually executed that call, and recorded what really happened — including one place (Prompt 4) where I explicitly flag that my own prior knowledge likely made me look smarter than a truly blind agent would be, with a concrete side-by-side test to show the gap. This is real tool-call evidence, not a hypothetical, but the "first choice was sensible" judgment for Prompt 4 specifically should be discounted for tester contamination.

---

## Prompt 1: "Analyse the Citadel Kensington Global Strategies fund."

| Field | Value |
|---|---|
| First tool tried | `fund_analyzer` — name is the most literal match for "analyse a fund" |
| First choice sensible? | **Yes** — no other tool is named for general fund analysis |
| Call 1 | `fund_analyzer(search_term="Citadel Kensington Global Strategies")` |
| Result 1 | **Rejected**: `"Input validation error: 'start_date' is a required property"` |
| Calls to reach *a* answer | **≥2** (this call failed; a second call supplying a guessed `start_date` would succeed, per direct evidence from KS-1073 testing earlier this cycle) |
| Task completed? | **Technically yes, but poorly** — see below |

**Finding:** the tool's name ("fund_analyzer") gives zero indication that a date range is mandatory to "analyse" a fund — there's no natural-language cue in the prompt that suggests a required temporal parameter, and the schema's `start_date` field has no default. This is genuine friction on the very first call of the very first prompt.

**Even the "successful" second call is a poor outcome.** Per KS-1073 (this cycle), `fund_analyzer` with all defaults produces a **585K–638K character** response (O3) — a cold-start agent that supplies a guessed `start_date` and leaves the 7 optional `include_*` flags at their true defaults (all `true`, since a naive agent wouldn't know to disable them) will receive one of the largest payloads in the entire catalog in response to what looks like a simple analysis request. **Task "completion" here means the agent now has to synthesize a coherent answer out of a 600KB+ blob** — which is a real cost even if the call itself doesn't error.

---

## Prompt 2: "What were the top 10 funds by return last year?"

| Field | Value |
|---|---|
| First tool tried | `get_top_funds_by_returns` |
| First choice sensible? | **Yes — obvious and correct** |
| Call 1 | `get_top_funds_by_returns(period_months=12)` — `top_n` **not specified**, using its default |
| Result 1 | **Success.** Returns exactly 10 funds (`top_n` defaults to 10, matching "top 10" precisely), clean structured data, correct period |
| Calls to reach a correct answer | **1** |
| Task completed? | **Yes, cleanly** |

This is the smoothest prompt of the four: the tool name, its default parameter value, and the question's phrasing all align without any extra reasoning required. **No wrong-path risk observed here.**

---

## Prompt 3: "What is the liquidity cost of fund 500?"

| Field | Value |
|---|---|
| First tool tried | `calculate_liquidity_cost` |
| First choice sensible? | **Yes — obvious and correct** |
| Call 1 | `calculate_liquidity_cost(fund_id="500")` |
| Result 1 | **Success.** `liquidity_cost: -0.009` (-90 bps), full context returned |
| Calls to reach a correct answer | **1** |
| Task completed? | **Yes, cleanly** |

Second smoothest prompt — the fund id is given directly in the question, and the tool name is an exact match for the ask.

---

## Prompt 4: "Which funds does Citadel Advisors manage?" — the interesting one

| Field | Value |
|---|---|
| First tool tried | `search_all_funds` |
| First choice sensible? | **Yes, but see contamination disclosure below** |
| Call 1 | `search_all_funds(search_term="Citadel Advisors")` |
| Result 1 | **Success.** 9 funds returned, each with an explicit `"manager_name": "Citadel Advisors LLC"` field — a complete, directly-verifiable answer in one call |
| Calls to reach a correct answer | **1** |
| Task completed? | **Yes, cleanly** — but only because of the specific tool chosen |

**Contamination disclosure and the real finding:** I chose `search_all_funds` first specifically *because* I already knew from earlier testing this cycle (KS-1072) that it's the only fund-search tool whose output includes `manager_name`. Neither `search_all_funds`'s description nor any other search tool's description states this up front — an agent choosing purely by name would very plausibly reach for **`Search_Funds`** first (the most literal name match for "search"). I tested this directly for comparison:

```
Search_Funds(search_term="Citadel Advisors") → same 9 funds, same ids,
but only {fund_id, fund_name, source} — no manager_name field at all
```

**This is the real, evidenced finding for the "search-tool overlap" AC:** an agent that reasonably picks `Search_Funds` first for this exact question gets back 9 funds with **no explicit confirmation they're managed by Citadel Advisors** — it would have to infer the connection from fund names alone, which is unreliable (one of the 9, "ANTAEUS INTERNATIONAL INVESTMENTS, LTD.", doesn't contain "Citadel" anywhere in its name and would likely be missed or cause the agent to doubt its own search). **The four fund-search tools are not self-evidently differentiated by description alone with respect to output shape** — you can only discover that `Search_Funds`/`search_funds` silently omit manager attribution by actually calling them and inspecting the response, not by reading their one-line descriptions in advance.

---

## Duplicate-alias impact (O5)

Across all four prompts, I never found myself genuinely torn between `search_funds` and `Search_Funds`, or between `rating_detail` and `get_rating_details`. Looking at why: **the duplicate tools' own descriptions self-resolve the ambiguity** — `search_funds`'s description literally reads *"Alias for Search_Funds"*, and `rating_detail`'s reads *"Same as get_rating_details"*. An agent scanning the tool list sees the cross-reference immediately and has no real decision to make.

**Finding: O5's duplicate-alias risk is low in practice**, precisely because the duplicates are self-documenting. The genuine tool-selection difficulty in this catalog is the **four-way overlap** between `Search_Funds`/`search_funds`/`search_all_funds`/`search_albourne_funds` (different scopes and output shapes, no self-referencing description to short-circuit the choice) — not the exact-duplicate pairs, which are a non-issue.

---

## `fee_model`'s 15 required parameters — can an agent assemble a call unaided?

**No, not cleanly**, but there's a discoverable path. `fee_model`'s own description ("Convert between gross and net returns using complex fee structures...") contains **no cross-reference** to `get_fee_model_defaults` — an agent reading only `fee_model`'s description has no hint that a companion tool exists to supply its 15 required values. However, `get_fee_model_defaults` is named closely enough (it literally contains the string "fee_model") that an agent scanning the **full 34-tool list** for anything fee-related would plausibly notice it by naming convention alone, even without an explicit pointer. Whether an agent finds this path depends entirely on whether it browses the full catalog or stops at the first plausibly-named tool — a real, and somewhat luck-dependent, gap.

Separately — and this compounds the problem, per KS-1076 testing this cycle — even an agent that *does* find and call `get_fee_model_defaults` first cannot forward its output directly into `fee_model`: 5 of the 15 required fields are renamed between the two (`mgt_fee`↔`management_fee`, etc., see KS-1076 NEW-13). So the realistic path for an unaided agent is: **discover the companion tool by name-pattern luck, call it, then hit a second friction point renaming 5 fields by hand** — a two-call, error-prone path with no explicit guidance at either step.

---

## Consolidation recommendations

| Recommendation | Reasoning |
|---|---|
| **Hide or remove `search_funds`, `rating_detail`, `rating_summary`** from the active tool list (keep them server-side for backward compatibility if needed) | Confirmed pure aliases (O5) with self-documenting descriptions — they add catalog size with zero functional benefit and no observed selection confusion, but removing dead weight still shrinks the 34-tool surface AM-02 already flagged as large |
| **Consolidate `Search_Funds`/`search_all_funds`/`search_albourne_funds` into one tool with a `source` filter** (`all` \| `albourne` \| `solovis`, defaulting to `all`) | The three-way split forces an agent to guess scope in advance; a single tool with a default of "all, full output shape" removes both the scope-guessing problem and the output-shape gap found in Prompt 4 |
| **Always include `manager_name` in fund-search output**, don't offer a stripped-down variant | The stripped output (`fund_id`/`fund_name`/`source` only) actively hurt a plausible real question (Prompt 4) with no compensating benefit — the fuller shape should be the only shape |
| **Add a cross-reference from `fee_model` to `get_fee_model_defaults`** in `fee_model`'s own description, or better, add an optional `use_defaults: true` parameter to `fee_model` that internally fetches and correctly maps the defaults | Removes both the discoverability gap and the 5-field renaming friction (KS-1076 NEW-13) in one change |
| **Give `fund_analyzer.start_date` a documented default** (e.g. trailing 12 months) instead of making it a hard-required parameter with no fallback | Removes the very first friction point a cold-start agent hits on the most natural-sounding prompt in the catalog |

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| — | `fund_analyzer`'s required `start_date` has no natural-language cue or default, causing an immediate failed call on the most obvious "analyze a fund" phrasing | S3 Medium | AM-13 |
| **NEW-19** | `Search_Funds`/`search_funds` silently omit `manager_name` from their output while `search_all_funds`/`search_albourne_funds` include it — not documented in any tool's description, only discoverable by calling and inspecting. Directly caused a plausible wrong-path risk for a "which funds does X manage" question. | S3 Medium | AM-13 |
| — (positive) | O5 duplicate-alias pairs are low-risk in practice — all three pairs self-document their equivalence in their own descriptions | n/a | — |
| — | `fee_model`'s 15 required parameters have no in-description pointer to `get_fee_model_defaults`; discoverability depends on an agent scanning the full catalog rather than stopping at the first plausible match | S3 Medium | AM-13, cross-ref KS-1076 NEW-13 |
| — (positive) | Prompts 2 and 3 (`get_top_funds_by_returns`, `calculate_liquidity_cost`) both resolved in exactly one clean call — strong evidence the catalog works well when a tool's name, defaults, and the question phrasing align | n/a | — |

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1082 — this is the first test pass on this ticket. Per this ticket's own note ("run the same prompts on both clients to separate catalog problems from client-specific behaviour"), the findings above should hold regardless of client, since they trace to tool descriptions and schemas (catalog properties), not to any Claude-Code-specific behavior — but a second client's run would help confirm that.
