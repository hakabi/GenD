# KS-1076 Cursor Result — Smoke-test the fee, IR and liquidity model tool group

> **Story:** [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) · **Draft ID:** AM-07 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~07:39–07:45 UTC  
> **Status:** **PASS WITH FINDINGS** (Cursor-only; Claude Result not yet present)

---

## Verdict summary

| Tool | Happy path | Edge / AC check | Verdict |
|---|---|---|---|
| `get_fee_model_defaults` | **P** — fund 500 defaults returned | Field names ≠ `fee_model` schema | **PASS** (composition issue below) |
| `fee_model` | **P** after remapping defaults | Missing param named; string number rejected; dates **do** scope | **PASS with finding** (NEW-12 composition) |
| `ir_model` | **P** — fund 500 net_ir ≈ 0.405 | Omit `fund_ids` → **~150 public-sleeve funds**, uncapped | **PASS**, feeds AM-12 |
| `calculate_liquidity_cost` | **P** — fund 500 cost −0.009 (−90 bps) | Invalid id → clear not-found | **PASS** |
| `get_liquidity_parameters` | **P** — fund 500 params | Omit `fund_id` → **MCP timeout ×2** (unbounded risk) | **PASS** / omit **Blocked** → AM-12 |
| `query_fund_manager` | **P** — allowlisted cols | Non-allowlist clear error; `limit` max 1000 enforced; 695 rows at cap | **PASS** |

**Pass rate:** ≥80% of exercised ACs. Main usability defect: **defaults cannot be fed straight into `fee_model`** (NEW-12). Omit-filter sizes feed AM-12.

---

## Acceptance criteria matrix

| AC | Result | Notes |
|---|---|---|
| `get_fee_model_defaults` for fund 500 | **P** | management_fee 0.01, perf 0.2, HWM 1, benchmark `SPTR Index.USD`, etc. |
| Defaults compose into `fee_model` | **F** | **NEW-12** — name mismatch; agent must remap |
| `fee_model` happy path (complete params) | **P** | Remapped call succeeds; 373 periods if no dates |
| Missing required param → names param | **P** | Schema: `'perf_return' is a required property` |
| `ir_model` with explicit `fund_ids` | **P** | fund 500 full IR breakdown |
| `ir_model` omit `fund_ids` — measure size | **P*** | ~**150** funds returned; no pagination; feed AM-12 |
| `calculate_liquidity_cost` happy + invalid | **P** / **P** | Invalid: `Fund 99999999 not found in Solovis data` |
| `get_liquidity_parameters` omit — measure size | **B** | Timed out twice (`MCP error -32001`); treat as unbounded/slow → AM-12 |
| `query_fund_manager` allowlist | **P** | Clear error naming column + “31 allowed names” |
| 64-col / 1000-row caps | **P** (row) | `limit=1001` rejected by schema max 1000; at 1000 → 695 rows, `truncated:false` |
| Numeric params reject string | **P** | `mgt_fee:"0.01"` → `'0.01' is not of type 'number'` (no silent coerce) |

---

## Tests

### Fee defaults → `fee_model` composition (NEW-12)

`get_fee_model_defaults(fund_id="500")` returns nested `fee_parameters` with keys such as:

| Defaults key | `fee_model` required key |
|---|---|
| `management_fee` | `mgt_fee` |
| `management_fee_frequency` | `mgt_fee_freq` |
| `performance_fee` | `perf_fee` |
| `high_watermark` | `hwm_status` |
| `crystallization` | `crystialized_paid` (schema typo) |
| `benchmark`, `translation`, `ramp_type`, `catch_up`, … | same names where present |

**Cannot pass the defaults object through unchanged.** After manual remap of all 15 required fields, `fee_model` succeeds (`fee_parameters_source: "solovis_defaults"`, `periods_analyzed: 373` without date filter).

Missing `perf_return` → client/schema validation names the property — **P**.

### Date scoping on `fee_model` (positive contrast)

With remapped params + `start_date=2024-01-01`, `end_date=2024-12-31` → **12** monthly dates all in 2024. Dates **are** honoured when supplied (unlike NEW-8 / O2 on other tools). Without dates, full history (~373 periods from 1995) is returned — large for agents; note for AM-12.

### `ir_model`
- `fund_ids=["500"]` → net_ir **0.405494**, fees −0.0371407, liquidity_cost −0.009 (matches liquidity tool).
- Omit `fund_ids` → array of ~**150** public-sleeve funds; sparse rows for some ids; **no server-side cap**.

### Liquidity
- `calculate_liquidity_cost(fund_id="500")` → −0.009 / −90 bps; gate defaulted to 1.0 in inputs.
- Invalid fund → clear Solovis not-found.
- `get_liquidity_parameters(fund_id="500")` → lockup 24m, redemption 24m, side pocket max 5%, etc.
- Omit `fund_id` → **request timed out** (twice). Cannot measure byte size; still evidence of all-funds path being unsafe/slow.

### `query_fund_manager`
| Input | Result |
|---|---|
| `fields=["fund_id","fund_name","asset_class_0"], fund_ids=["500"]` | 1 row Absolute Return — **P** |
| `fields` includes `mgt_fee` or `not_a_real_column` | Clear allowlist error (31 names) — **P**, not raw DB |
| `limit=1000`, two cols | **695** rows, `truncated:false`, ~66 KB — **P** |
| `limit=1001` | Schema reject: greater than maximum 1000 — **P** |

Evidence: `logs/KS-1076_query_fund_manager_limit1000.txt`.

### Numeric type strictness
`mgt_fee` as string `"0.01"` with otherwise-complete params → **rejected** (type number). Documented as reject (not coerce).

---

## Findings

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **NEW-12** | `get_fee_model_defaults` output does **not** compose into `fee_model` without remapping (incl. `crystallization`→`crystialized_paid` typo) | **S2 High** (usability AC) | AM-10 / AM-14 |
| Unbounded omit filters | `ir_model` ~150 funds; `get_liquidity_parameters` omit **times out** | Medium | AM-12 / KS-1081 |
| Full-history `fee_model` | 373 periods when dates omitted | Medium | AM-12 |
| Schema typo | `crystialized_paid` | Low | AM-13 catalog |

---

## Recommendation

- Cursor provisional verdict: **Pass with findings**.
- File **NEW-12** as the AC-flagged usability defect (defaults → fee_model mapping layer or align field names).
- Feed omit-timeout / omit-sizes to **KS-1081 (AM-12)**.
- Await Claude Result for consolidation + Jira comment (same pattern as KS-1074/1075).
