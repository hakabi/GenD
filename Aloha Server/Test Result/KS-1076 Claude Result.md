# KS-1076 Claude Result — Smoke-test the fee, IR and liquidity model tool group

> **Story:** [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) · **Draft ID:** AM-07 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** High · **Blocked by:** KS-1071 (unblocked)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport)
> **Executed:** 2026-08-07, ~07:43–07:46 UTC
> **Status:** **PASS with findings.** No prior client (Cursor or Antigravity) has tested this ticket — this is the first pass. `fee_model`/`get_fee_model_defaults` do **not** compose without manual field renaming (confirming the exact usability risk the ticket called out), and a genuine cross-tool data-labeling inconsistency was found for fund 500's asset classification. `query_fund_manager`'s error messages are the best-designed in the catalog so far this cycle.

---

## Verdict summary

| Tool | Happy path | Edge case | Verdict |
|---|---|---|---|
| `get_fee_model_defaults` | P — fund 500 defaults returned cleanly | n/a | **PASS** |
| `fee_model` | P — works with manually-renamed defaults, correctly date-scoped | P — missing `fund_id` → clean, parameter-naming error | **PASS**, but composability with `get_fee_model_defaults` **fails** — see NEW-13 |
| `ir_model` | P — explicit `fund_ids=["500"]` | Measured — omitted `fund_ids` returns "all public-sleeve funds," dozens of entries, stayed under the harness's auto-offload threshold | **PASS** |
| `calculate_liquidity_cost` | P | P — invalid `fund_id` → clean error | **PASS** |
| `get_liquidity_parameters` | P | Measured (see below) | **PASS** |
| `query_fund_manager` | P | P — non-allowlisted column → best error message found this cycle | **PASS** |

**New cross-cutting finding:** fund 500's asset classification is reported **inconsistently** across three tools in this group — see NEW-14.

---

## Tests

### `get_fee_model_defaults(fund_id="500")` — happy path

Returns a `fee_parameters` object: `management_fee: 0.01`, `management_fee_frequency: 1`, `performance_fee: 0.2`, `hurdle_status: 0`, `high_watermark: 1`, `crystallization: 1`, `catch_up: 0`, `catch_up_perc_soft: 0.3`, `perf_return: 0.08`, `benchmark: "SPTR Index.USD"`, `translation: 1.0`, plus fund identity and liquidity fields. **Pass.**

### Composability check — `get_fee_model_defaults` → `fee_model` (the ticket's key AC)

`fee_model` requires exactly 15 parameters. Mapping the defaults output field-by-field against `fee_model`'s parameter names:

| `fee_model` param | `get_fee_model_defaults` field | Same name? |
|---|---|---|
| `fund_id` | `fund_id` | ✅ |
| `benchmark` | `benchmark` | ✅ |
| `translation` | `translation` | ✅ |
| `hurdle_status` | `hurdle_status` | ✅ |
| `ramp_type` | `ramp_type` | ✅ |
| `hurdle_fixed` | `hurdle_fixed` | ✅ |
| `hurdle_type` | `hurdle_type` | ✅ |
| `perf_return` | `perf_return` | ✅ |
| `catch_up` | `catch_up` | ✅ |
| `catch_up_perc_soft` | `catch_up_perc_soft` | ✅ |
| `mgt_fee` | `management_fee` | ❌ renamed |
| `mgt_fee_freq` | `management_fee_frequency` | ❌ renamed |
| `perf_fee` | `performance_fee` | ❌ renamed |
| `hwm_status` | `high_watermark` | ❌ renamed |
| `crystialized_paid` | `crystallization` | ❌ renamed, **and** `fee_model`'s own parameter name is misspelled ("crystialized" for "crystallized") |

**10 of 15 (67%) map directly by name; 5 of 15 (33%) require manual renaming with no hint in either tool's description that this mapping exists.** This is exactly the usability failure mode the ticket's AC anticipated: *"If the two do not compose, file a usability defect: the tool is effectively unusable by an agent otherwise."* **NEW-13, confirmed.** An agent calling `get_fee_model_defaults` and forwarding the result verbatim into `fee_model` will fail on 5 required fields with no matching key.

To confirm the *values* still work once renamed correctly, I built the call manually:

```
fee_model(fund_id="500", benchmark="SPTR Index.USD", translation=1, mgt_fee=0.01,
          mgt_fee_freq=1, perf_fee=0.2, hwm_status=1, hurdle_status=0, ramp_type=1,
          hurdle_fixed=0, hurdle_type=0, perf_return=0.08, catch_up=0,
          catch_up_perc_soft=0.3, crystialized_paid=1,
          start_date="2025-01-01", end_date="2025-07-31")
```

→ **Success.** 7 monthly gross-return values, dated `2025-01-31`…`2025-07-31` — **every date inside the requested window.** This is a positive finding: unlike `fund_analyzer` (KS-1073) and `calculate_drawdown` (KS-1074), `fee_model` correctly honors `start_date`/`end_date`. The composability problem is a field-naming issue, not a computation issue.

### `fee_model` with a required parameter missing

Called without `fund_id` → `Input validation error: 'fund_id' is a required property`. Clean, names the exact missing parameter. **Pass** on this AC bullet.

### `ir_model` happy path and unscoped call

| Input | Result |
|---|---|
| `fund_ids=["500"]` | Single-fund result: `edge_rating: 8, total_rating: 7.7, net_ir: 0.405494`, etc. — plausible values. **Pass.** |
| `fund_ids` omitted | Returns "all public-sleeve funds" per the tool's documented default — dozens of entries returned, ranging from fully-populated (all rating fields) to sparse (`{"fund_id": "417"}` alone, no other fields). Response stayed **inline**, i.e. under the harness's auto-offload threshold that caught `equity_beta` (72KB) and `get_fund_crbm` (370KB) in earlier tickets — meaningfully smaller than those, but still uncapped with no `limit` parameter available. |

The wide variance in field completeness per fund (some funds have 15 populated rating fields, others have exactly 1) likely reflects genuinely missing upstream rating data for those funds rather than a bug, but it does mean an agent consuming this "bulk" response can't assume a consistent schema per row.

### `calculate_liquidity_cost` happy path and invalid input

| Input | Result |
|---|---|
| `fund_id="500"` | `liquidity_cost: -0.009` (−90 bps), full `input_parameters` and `strategy_context` echoed. **Pass.** |
| `fund_id="99999999"` | `{"status":"error","error":"Fund 99999999 not found in Solovis data"}` — clean. **Pass.** |
| `fund_id="500", gate=0.25` (override default) | `liquidity_cost: -0.0218` (−218 bps) — correctly recomputed with the overridden gate, confirming the optional override parameters actually take effect. **Pass.** |

### `get_liquidity_parameters(fund_id="500")` happy path

Returns `lockup_months: 24, gate: 1.0, side_pocket_probability: 0.5, fund_liquidity_type: "Tranche-Based"`, etc. **Pass.**

### `query_fund_manager` — allowlist enforcement (best error quality found this cycle)

| Input | Result |
|---|---|
| `fields=["fund_id","fund_name","password"]` | `{"status":"error","error":"Column 'password' is not allowlisted for query_fund_manager. See FUND_MANAGER_MCP_ALLOWED_COLUMNS / tool docs (31 allowed names)."}` |
| `fields=["not_a_real_column"]` | Same pattern, correct column name substituted |
| `fields=["fund_id","mgt_fee",...]` | Rejected `mgt_fee` — the actual column name in `fund_manager` is `management_fee`, not `mgt_fee` (matching `fee_model`'s parameter name is a red herring) |

This error format — names the exact bad column, points to the allowlist source (`FUND_MANAGER_MCP_ALLOWED_COLUMNS`), and states the total count (31) — is the clearest, most actionable error message found in this entire testing session across KS-1072–1076. Worth citing as the standard the rest of the catalog should be brought up to (see AM-10).

### `query_fund_manager` happy path and caps

| Input | Result |
|---|---|
| `fields=["fund_id","management_fee","performance_fee","asset_class_0","asset_class_1"], limit=5` | 5 rows returned; `management_fee`/`performance_fee` are `null` for the sampled Private Equity / Real Assets funds (plausibly legitimate — those asset classes may not carry hedge-fund-style fee terms in this table) |
| `fields=["fund_id"]`, no limit (default 1000) | `row_count: 695`, `truncated: false` — **the entire `fund_manager` table has only 695 rows**, so the documented 1000-row cap can't be exercised or verified with current data volume |
| Column cap (64) | The allowlist itself only contains **31 names** (per the error message above) — fewer than the documented 64-column cap, so that cap is also currently unreachable. Not a defect, but worth recording: both documented caps are dead code at today's scale and would only matter if the allowlist or table grew significantly |

### Numeric-type coercion (AC: "Numeric parameters reject string input, or coerce it in a documented way")

Not independently verified this cycle: my tool-calling interface serializes parameters using their declared JSON Schema types, so I could not construct a "valid JSON, wrong type" request (e.g. a quoted string in a `number` slot) through the normal invocation path — attempts either produced syntactically invalid JSON (a different, uninteresting error) or were auto-coerced to the correct type before leaving my session. This AC bullet needs a client that can send raw, deliberately-malformed JSON-RPC payloads (e.g. `curl` against the endpoint directly) rather than an MCP tool-calling interface that already enforces types on the way out.

---

## New finding: fund 500's asset classification is reported inconsistently across tools

While investigating why filtering `query_fund_manager` by `asset_class_0=["Relative Value"]` returned zero rows, I checked fund 500's actual stored classification directly:

```
query_fund_manager(fields=["fund_id","asset_class_0","asset_class_1"], fund_ids=["500"])
→ {"fund_id": "500", "asset_class_0": "Absolute Return", "asset_class_1": "Relative Value"}
```

Compare this to what two other tools in this same group report for the identical fund:

| Tool | Field | Value reported |
|---|---|---|
| `get_fee_model_defaults(fund_id="500")` | `asset_class` | `"Relative Value"` |
| `get_liquidity_parameters(fund_id="500")` | `asset_class` / `asset_category` | `"Relative Value"` |
| `calculate_liquidity_cost(fund_id="500")` | `asset_category` (used as a live **input** to the cost formula, not just a label — drives `strategy_context.strategy_risk`, `redeeming_probability`, etc.) | `"Absolute Return"` |
| `query_fund_manager` (ground truth, `solovis.fund_manager`) | `asset_class_0` (broad) / `asset_class_1` (sub-strategy) | `"Absolute Return"` / `"Relative Value"` |

**NEW-14:** `get_fee_model_defaults` and `get_liquidity_parameters` both surface the fund's **`asset_class_1`** (sub-strategy) value under a generic `asset_class`/`asset_category` key, while `calculate_liquidity_cost` uses the **`asset_class_0`** (broad category) value under the same-looking key name — and actually feeds it into the cost calculation. The underlying data isn't wrong (both values genuinely exist for fund 500), but the field naming gives no indication that three tools are reporting two different levels of the same two-level taxonomy under indistinguishable field names. An agent comparing "asset category" across these three tools' outputs for the same fund would see a contradiction that isn't actually a data error — it's a naming collision. **Severity: S3 Medium** (misleading, not incorrect) — recommend renaming to `asset_class_0`/`asset_class_1` consistently across all tools that surface this data, matching `query_fund_manager`'s already-correct naming.

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| **NEW-13** | `fee_model`'s 15 required parameters do not compose directly with `get_fee_model_defaults`'s output — 5 of 15 fields are renamed (`mgt_fee`↔`management_fee`, `mgt_fee_freq`↔`management_fee_frequency`, `perf_fee`↔`performance_fee`, `hwm_status`↔`high_watermark`, `crystialized_paid`↔`crystallization`), with no documented mapping. Confirmed usability defect per the ticket's own AC. | **S3 Medium** (usability, not correctness — the tool works once renamed) | AM-07 / AM-13 |
| **NEW-14** | Fund 500's asset classification is reported under inconsistent taxonomy levels across `get_fee_model_defaults`/`get_liquidity_parameters` (`asset_class_1`, mislabeled generically) vs. `calculate_liquidity_cost` (`asset_class_0`, used as a live calculation input) | S3 Medium | AM-07 / AM-10 |
| — (typo) | `fee_model`'s parameter `crystialized_paid` is misspelled (should be "crystallized") | S4 Low | AM-13 (cosmetic) |
| — (positive) | `query_fund_manager`'s allowlist-violation error is the clearest, most actionable error message found in this entire cycle (names column, source constant, and allowed-count) | n/a — model example | Cite in AM-10 as the standard |
| — (scope note) | Both documented caps (64 columns, 1000 rows) are currently unreachable: only 31 columns are allowlisted, and the `fund_manager` table has only 695 rows | Low — not a defect today | Revisit if the allowlist or table grows |
| — (untested) | "Numeric parameters reject string input" AC not verified — requires a raw-JSON-RPC client, not an MCP tool-calling interface | n/a | Recommend `curl`-based follow-up if this specific bullet needs closing |

---

## Comparison with prior client results

No prior Cursor or Antigravity result exists for KS-1076 — this is the first test pass on this ticket. Nothing to reconcile; findings above are net-new.
