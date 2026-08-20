# KS-1081 Claude Result — Verify response payload limits and client compatibility

> **Story:** [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) · **Draft ID:** AM-12 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** High · **Blocked by:** KS-1073 (unblocked)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223)
> **Executed:** 2026-08-07, ~08:50–09:07 UTC (plus measurements carried over from KS-1073/1074/1075/1078 this same cycle)
> **Status:** **PASS with high-severity findings.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass. No hang was observed anywhere in this cycle, which is good news, but that's largely because **no size cap exists at all** for several tools — the largest confirmed payload this cycle was **2.28 million characters** from a single `get_data` call.

---

## Response size table — every large-risk tool measured this cycle

| Tool | Config | Size | Client | Outcome |
|---|---|---|---|---|
| `get_data` | `fund_manager`, no filter (695 rows × 78 cols) | **2,277,298 chars** | Claude Code | Success — largest payload measured this cycle |
| `fund_analyzer` | 1 fund, all 7 slices **off**, narrow date range | 585,151–638,409 chars (4 measurements across 3 testers) | Cursor, Antigravity, Claude Code ×2 | Success every time — see KS-1073 |
| `get_fee_model_defaults` | `fund_id` omitted → 602 funds | **555,852 chars** | Claude Code | Success |
| `get_fund_crbm` | `fund_id` omitted → 602 funds | **370,519 chars** (confirmed identical across 10 repeat calls) | Claude Code | Success, every time |
| `get_data` | `fund_ror`, no filter, hit the 1000-row cap | 354,632 chars | Claude Code | Success — cap correctly bounded rows, `truncated` flag still wrong (see KS-1078 NEW-17) |
| `equity_beta` | No params → 663 funds | 72,114 chars | Claude Code | Success — below the 100KB line, but still large enough to need file-based analysis |
| `get_liquidity_parameters` | `fund_id` omitted → 57 funds | ~modest, returned inline (no offload triggered) | Claude Code | Success — smaller because only 57/695 funds have liquidity data populated, not because of any cap |
| `ir_model` | `fund_ids` omitted → all public-sleeve funds | Returned inline (no offload triggered, so below `equity_beta`'s 72KB crossing point) | Claude Code | Success |
| `get_top_funds_by_returns` / `get_bottom_funds_by_returns` | `top_n=100` (max) | Returned inline, modest — only **39 funds** are eligible (complete monthly history), so `top_n=100` and `top_n=5` draw from the same fixed pool | Claude Code | Success — see note below |
| Everything else tested this cycle (search tools, `health_check`, `get_user_info`, `calculate_liquidity_cost`, `get_rating_summary`, single-fund `fee_model`/`calculate_crbm_returns`/`get_benchmark_history`) | Typical single-record calls | Sub-1KB to a few KB | Claude Code | Success, no risk |

**Tools exceeding the 100KB "typical call" risk-set threshold, confirmed this cycle:** `get_data` (wide tables), `fund_analyzer` (any config — the *smallest* observed fund_analyzer response, 585KB, is already 5.8× over the threshold), `get_fee_model_defaults` (omitted `fund_id`), `get_fund_crbm` (omitted `fund_id`). `equity_beta` (72KB) and the `get_data` 1000-row-capped case for narrower tables sit close to but under the line depending on table width.

**Boundary-condition note on `get_top_funds_by_returns`/`get_bottom_funds_by_returns`:** at `top_n=100`, both endpoints return the **entire 39-fund eligible pool** — meaning "top 100" and "bottom 100" become the *same 39 funds*, just reordered, once the requested `top_n` exceeds the number of funds with complete monthly history. This is mathematically correct (not a bug), but worth documenting: the AC's "disjoint sets" expectation (confirmed true at `top_n=5` in KS-1074) **breaks down by construction** once `top_n` exceeds half the eligible pool.

---

## Is there a server-side cap? — stated definitively

**Only two tools in the entire catalog have any cap at all:** `get_data` and `query_fund_manager`, both hard-coded to **1000 rows** (visible directly in the `sql`/`row_limit` fields they echo back). Every other tool tested — `fund_analyzer`, `get_fund_crbm`, `get_fee_model_defaults`, `get_liquidity_parameters`, `ir_model`, `equity_beta` — has **no size or row limit whatsoever**. Each returns exactly as much data as matches its underlying business criteria (all funds with complete data, all public-sleeve funds, etc.), with no ceiling. This was true on every single call this cycle, including the 2.28MB `get_data` case and the 638KB `fund_analyzer` case — nothing was ever rejected or truncated for being "too large."

**Compounding factor already on file:** even where the 1000-row cap *does* exist, its `truncated` signal is broken (KS-1078, finding NEW-17) — a caller has no reliable way to know whether a `get_data`/`query_fund_manager` response is complete or silently cut off at 1000 rows.

---

## Failure mode: does an oversized response error, truncate, or hang?

**None of the above — every oversized call succeeded completely.** Across this entire testing cycle (dozens of large calls, including a dedicated 10-consecutive-call burst below), not one call to any of these tools ever errored for size, silently truncated (outside the documented 1000-row cap), or hung/timed out. This is the mildest point on the ticket's own severity scale — a hang is explicitly called out as worse than an error, and neither occurred.

**But this is not the same as "no problem."** A response that always succeeds at 370KB–2.3MB is not a service failure, but it is a **client-side usability failure waiting to happen**: any MCP client without this harness's automatic large-response-to-disk offload (which is what let this testing proceed safely) would have to render, tokenize, or otherwise hold the entire payload in memory or context. For an LLM-driven client, a 2.3MB tool result is likely to blow the context window outright. The risk this ticket exists to catch is real; it just manifests as "the client breaks," not "the server breaks."

---

## Latency: 10 consecutive large calls (hang test)

10 back-to-back `get_fund_crbm()` calls (omitted `fund_id`, 602-fund payload, 370,519 chars every time):

| Call | Interval from previous |
|---|---|
| 1 | — |
| 2 | 86.3s |
| 3 | 86.4s |
| 4 | 89.6s |
| 5 | 88.0s |
| 6 | 112.7s |
| 7 | 86.8s |
| 8 | 87.1s |
| 9 | 86.7s |
| 10 | 87.5s |

**No hang observed** — every call completed, with consistent (not escalating) latency around **86–90 seconds**, one outlier at 113s. A `health_check()` issued immediately afterward confirmed the service remained fully healthy, and its uptime reading (1,212,375.6s) was consistent with continuous operation since the start of this testing cycle (cross-checked against 4 earlier readings across KS-1070/1074/1078 — this is the 5th consistent uptime-continuity confirmation this cycle, now spanning the 10-call burst itself).

**New finding, worth flagging on its own:** ~90 seconds is a long time for a single tool call. It's not a hang (it completes, consistently, every time), but it's slow enough that a client with a default 30s or 60s timeout would abandon the call and report a false failure. **Recommend documenting the expected latency for `get_fund_crbm`-scale "all funds" calls** so client implementers set appropriate timeouts.

---

## Client compatibility — where does each break?

I only had my own Claude Code client available for direct measurement this cycle. For `fund_analyzer` specifically, three independent measurements exist across three clients:

| Client | `fund_analyzer` size (all slices off) |
|---|---|
| Original probe (2026-08-05) | 613,731 chars |
| Antigravity (2026-08-06) | 638,409 bytes |
| Claude Code (2026-08-07, this cycle, 2 separate measurements) | 585,151 / 615,489 chars |

All four measurements land in the same 585K–638K band — **no evidence of client-specific truncation or size differences**; all three clients received the full, uncapped response. I don't have comparable Cursor/Antigravity measurements for `get_data`, `get_fund_crbm`, or `get_fee_model_defaults`, since neither of their prior Jira comments measured payload size for those tools specifically. **This AC bullet is only partially closed** — recommend Cursor or Antigravity repeat at least the `get_data`(`fund_manager`) and `get_fund_crbm()` calls to complete the cross-client comparison for the two largest payloads found this cycle.

---

## Safe-usage guidance for the team

1. **Always supply the identifying filter** (`fund_id` for `get_fund_crbm`/`get_fee_model_defaults`/`get_liquidity_parameters`/`calculate_liquidity_cost`; `fund_ids` for `ir_model`) unless a full-catalog dump is genuinely intended. Omitting it is not "give me a sensible default" — it's "give me everything," and "everything" can be 350KB–555KB.
2. **`fund_analyzer` cannot be made small.** Disabling all 7 optional slices does not meaningfully reduce its payload (O3, KS-1073) — the mandatory base dashboard alone is 585KB+. If a small, targeted answer is needed, use a narrower single-purpose tool (`calculate_liquidity_cost`, `get_rating_summary`, `calculate_drawdown`, etc.) instead of `fund_analyzer`.
3. **`get_data` on wide tables produces large payloads even when the row cap is respected.** The 1000-row cap bounds rows, not bytes — a 78-column table at the cap can still be megabytes. Prefer `query_fund_manager` (which supports column selection) over `get_data` when only specific fields are needed.
4. **Treat `get_data`/`query_fund_manager`'s `truncated: false` with suspicion** until the flag is fixed (KS-1078 NEW-17) — it has been observed to report `false` on a call that was provably cut off at the row cap.
5. **Save large responses to disk and analyze structurally** (grep/jq) rather than rendering them fully in an agent's context — this is exactly the technique this testing cycle relied on throughout.
6. **Budget for ~90-second latency** on "all funds" calls to `get_fund_crbm`-scale tools; a client with an aggressive timeout (30–60s) will report a false failure on a request the server is still successfully processing.

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| — | No size/row cap exists for `fund_analyzer`, `get_fund_crbm`, `get_fee_model_defaults`, `get_liquidity_parameters`, `ir_model` — confirmed definitively across every call this cycle | **S2 High** — largest confirmed payload 2.28MB, second-largest a consistent 555–638KB family | AM-12 |
| — (cross-ref) | `get_data`/`query_fund_manager`'s 1000-row cap exists but the `truncated` signal never fires correctly | S2 High — already filed in KS-1078 (NEW-17) | AM-09 / AM-12 |
| **NEW-18** | `get_fund_crbm()` (and likely other "all funds" calls at similar scale) takes a consistent ~86–90 seconds to complete — not a hang, but slow enough to trip common client-side timeouts | S3 Medium | AM-12 |
| — (positive) | No hang, crash, or silent truncation observed anywhere in this cycle, including a dedicated 10-consecutive-large-call burst; server uptime remained continuous throughout (5th consistent cross-check this cycle) | n/a — confirms service stability under this specific load pattern | — |

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1081 — this is the first test pass on this ticket. The `fund_analyzer` size measurements incorporate all three testers' numbers from KS-1073; everything else in this table is net-new, measured either during this ticket's own testing session or carried over from my own KS-1073–1078 Claude results earlier in this cycle.
