# KS-1081 Cursor Result — Verify response payload limits and client compatibility

> **Story:** [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) · **Draft ID:** AM-12 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE (native HTTP MCP · `user-conceptia-aloha`)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~09:05–09:15 UTC (plus sizes carried from KS-1073/1075/1076/1078 this cycle)  
> **Status:** **PASS WITH FINDINGS** (no general byte cap; Cursor timeout on omit-`get_liquidity_parameters`; O3 uncapped `fund_analyzer` confirmed)

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Size table (risk tools + omit-filter set) | **P** | Exact bytes for largest payloads |
| >100 KB risk set | **P** | 4 tools clearly over; `equity_beta` ~70 KB near-miss |
| Server-side cap stated | **P** | Row caps only on `get_data` / `query_fund_manager` (1000); **no byte cap** elsewhere |
| Failure mode (error / truncate / hang) | **Partial** | Large calls mostly **succeed full**; omit-`get_liquidity_parameters` → **client timeout** (`MCP error -32001`) |
| 10 consecutive large calls | **P** | 10× `fund_analyzer` slices-off → **10/10 success**, ~595,199 bytes each |
| Cross-client comparison | **P*** | Aligns with Claude on mega-payloads; **diverges** on liquidity omit (Claude modest success vs Cursor timeout) |
| Safe-usage guidance | **P** | Drafted below |

---

## Response size table (Cursor)

Sizes are on-disk UTF-8 length of the MCP tool result as written by Cursor’s large-output offload (or inline estimate when no offload).

| Tool | Config | Bytes | Outcome |
|---|---|---:|---|
| `get_data` | `table=fund_manager`, no filter (695 rows × wide cols, `row_limit` 1000) | **2,277,298** | Success — largest this cycle |
| `fund_analyzer` | fund **500**, `start_date`/`end_date` Jul 2025, **all 7 `include_*` false** | **595,199** | Success (×10 hang-test) |
| `get_fee_model_defaults` | `fund_id` **omitted** (~602 funds) | **555,852** | Success |
| `get_fund_crbm` | `fund_id` **omitted** (~602 funds) | **370,519** | Success |
| `get_data` | `table=fund_ror`, hit 1000-row cap | **357,154** | Success; `truncated:false` (NEW-17 / KS-1078) |
| `equity_beta` | `as_of_date=2026-07-31` (broad catalog) | **72,146** | Success — under 100 KB bar |
| `query_fund_manager` | limit 1000 / prior cycle | ~**68,000** | Success |
| `intraday_fund_returns` | prior cycle | ~**49,000** | Success (all zeros — NEW-7) |
| `ir_model` | `fund_ids` **omitted** | inline (~tens of KB; **no** disk offload) | Success — uncapped count, modest bytes |
| `get_top_funds_by_returns` | `period_months=12`, `top_n=10` | ~few KB | Success |
| `get_bottom_funds_by_returns` | same pattern (prior) | ~few KB | Success |
| `get_fund_crbm` | `fund_id=500` | ~1–2 KB | Success |
| `get_fee_model_defaults` | `fund_id=500` | ~1–2 KB | Success |
| `get_liquidity_parameters` | `fund_id=500` | ~1 KB | Success |
| `get_liquidity_parameters` | `fund_id` **omitted** | — | **`MCP error -32001: Request timed out`** (this session + KS-1076) |
| `Search_Funds` | exact name → fund 500 | ~0.5 KB | Success |
| Typical search / ratings / single-fund returns / fee_model / schemas | filtered / single-id | sub-10 KB | Success (cycle carry) |

### >100 KB risk set (typical / omit configurations)

1. **`get_data`** (wide tables, esp. `fund_manager`) — **~2.28 MB**  
2. **`fund_analyzer`** (even with all slices off) — **~595 KB** (O3)  
3. **`get_fee_model_defaults`** (omit `fund_id`) — **~556 KB**  
4. **`get_fund_crbm`** (omit `fund_id`) — **~371 KB**  
5. **`get_data`** (`fund_ror` at 1000-row cap) — **~357 KB**  

Near-miss: `equity_beta` **~72 KB**.

---

## Omit-filter set (with vs without)

| Tool | Filtered (`fund_id` / params) | Omit filter |
|---|---|---|
| `get_fund_crbm` | ~1–2 KB · success | **370,519 B** · success |
| `get_fee_model_defaults` | ~1–2 KB · success | **555,852 B** · success |
| `get_liquidity_parameters` | ~1 KB · success | **Timeout (-32001)** on Cursor |
| `ir_model` | (single id smaller) | All public-sleeve · uncapped · inline modest |
| `get_top` / `get_bottom` | Needs period params; `top_n=10` small | Not “all funds dump”; pool capped by complete history (~39 eligible) |

---

## Is there a server-side cap? — definitive

| Mechanism | Exists? | Where |
|---|---|---|
| **Byte / payload size cap** | **No** | Mega-responses delivered complete (2.28 MB, 595 KB, 556 KB, 371 KB) |
| **Row cap** | **Yes — 1000 rows** | `get_data`, `query_fund_manager` only |
| **Reliable `truncated` flag** | **No** | NEW-17 (KS-1078): `truncated:false` observed at row cap |
| Soft client timeout | **Yes (client)** | Cursor abandons omit-`get_liquidity_parameters` |

---

## Failure mode characterisation

| Mode | Observed on Cursor? |
|---|---|
| Clean size-based **error** | **No** — server does not reject “too large” |
| Server **truncate** (bytes) | **No** (row truncate only on datalake tools) |
| Indefinite **hang** | **No** on 10× `fund_analyzer` |
| Client **timeout** (looks like hang/fail) | **Yes** — omit-`get_liquidity_parameters` → `-32001` |
| Full success of oversized payload | **Yes** — default for uncapped tools; Cursor offloads to disk |

Severity note (ticket AC): a hang is worse than an error. Cursor’s liquidity-omit timeout is the closest hang-like client break; Claude reported modest success for the same omit — **client timeout budget / transport difference**, not a clean server reject.

---

## Latency — 10 consecutive large calls

**Burst:** 10× `fund_analyzer` (fund 500, Jul 2025 window, all `include_*` false).

| Metric | Result |
|---|---|
| Completions | **10 / 10** |
| Size each | **595,199 bytes** (identical across burst) |
| Hang | **None** |
| Post-burst `health_check` | **healthy** · v0.9.5 · uptime continuous |

Claude’s 10× omit-`get_fund_crbm` (~87–90 s each) was not re-timed here; Cursor completed those single omit calls earlier in-session without hang, with disk offload.

---

## Client compatibility — Cursor vs Claude Code

| Payload | Cursor | Claude Code | Agreement |
|---|---|---|---|
| `get_data` fund_manager ~2.28 MB | **2,277,298 B** success | 2,277,298 chars success | **Match** |
| `fund_analyzer` slices off | **595,199 B** | 585–638 KB band | **Match** (band) |
| `get_fee_model_defaults` omit | **555,852 B** | 555,852 chars | **Match** |
| `get_fund_crbm` omit | **370,519 B** | 370,519 chars | **Match** |
| omit-`get_liquidity_parameters` | **Timeout** | Modest success (inline) | **Diverge** |

Where Cursor “breaks”: not by truncating mega-JSON; by **timeout** on slow omit-liquidity, and by **context/UX pressure** if large results were not offloaded to disk (LLM clients still cannot usefully consume 2 MB in-context).

---

## Safe-usage guidance (draft)

1. **Always pass `fund_id` / `fund_ids`** for `get_fund_crbm`, `get_fee_model_defaults`, `get_liquidity_parameters`, `ir_model` unless a full dump is intentional.  
2. **Do not rely on disabling `fund_analyzer` slices** to shrink payload — base dashboard alone is ~595 KB (O3). Prefer single-purpose tools.  
3. Prefer **`query_fund_manager` + column allowlist** over wide `get_data` tables.  
4. Treat **`truncated:false`** on datalake tools as untrusted until NEW-17 is fixed.  
5. Set client timeouts **≥90–120 s** for all-funds CRBM-scale calls; expect Cursor timeouts on omit-liquidity without a filter.  
6. Persist large tool results to disk and analyze with structure tools — do not paste multi-100 KB JSON into agent context.

---

## Findings

| ID | Finding | Severity |
|---|---|---|
| Cap gap | No byte/payload cap on `fund_analyzer`, omit-CRBM/fee defaults, wide `get_data` | **S2 High** |
| O3 (cross-ref) | `fund_analyzer` slices-off still ~595 KB | High · KS-1073 |
| NEW-17 (cross-ref) | Broken `truncated` at 1000-row cap | High · KS-1078 |
| NEW-18 (Claude) | ~86–90 s omit-`get_fund_crbm` latency | Medium |
| **NEW-19** | Cursor: omit-`get_liquidity_parameters` → **MCP -32001 timeout** (repeatable; filtered call OK) | **S3 Medium** — hang-like client failure |

---

## Acceptance criteria — Cursor

| AC | Result |
|---|---|
| Size measured; >100 KB risk set | **Pass** |
| Omit-filter set measured; cap stated | **Pass** (liquidity omit = timeout, not size) |
| Cross-client break modes | **Pass with divergence** on liquidity omit |
| Failure mode characterised | **Pass** — full success dominant; timeout on liquidity omit; no indefinite hang on 10-burst |
| 10 consecutive large calls | **Pass** |
| Safe-usage guidance | **Pass** |

**Overall: PASS WITH FINDINGS.**
