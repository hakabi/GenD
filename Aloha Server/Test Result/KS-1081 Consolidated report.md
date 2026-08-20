# KS-1081 Consolidated Report — Verify response payload limits and client compatibility

> **Story:** [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) · **Draft ID:** AM-12 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1081 Cursor Result.md](KS-1081%20Cursor%20Result.md) (~09:05–09:15 UTC) · [KS-1081 Claude Result.md](KS-1081%20Claude%20Result.md) (~08:50–09:07 UTC)  
> **Clients:** Cursor + Claude Code  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1081 is **Pass with findings**. Both clients measured the same mega-payload family: **`get_data` `fund_manager` ~2.28 MB**, **`fund_analyzer` slices-off ~585–638 KB**, **omit-`get_fee_model_defaults` ~556 KB**, **omit-`get_fund_crbm` ~371 KB**. **No general server-side byte cap** exists; only **1000-row** caps on `get_data` / `query_fund_manager` (with broken `truncated` — NEW-17). Oversized responses generally **succeed in full** rather than erroring or truncating by bytes. **No indefinite hang** on dedicated 10-call bursts (Cursor: 10× `fund_analyzer`; Claude: 10× omit-`get_fund_crbm`). Cross-client **divergence:** omit-`get_liquidity_parameters` succeeds modestly on Claude but **times out** on Cursor (**NEW-19**).

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| `get_data` fund_manager ~2.28 MB | **2,277,298 B** | 2,277,298 chars | **Match** |
| `fund_analyzer` slices off | **595,199 B** | 585–638 KB band | **Match** |
| omit-`get_fee_model_defaults` | **555,852 B** | 555,852 | **Match** |
| omit-`get_fund_crbm` | **370,519 B** | 370,519 | **Match** |
| `equity_beta` ~72 KB | 72,146 B | ~72 KB | **Match** |
| omit-`get_liquidity_parameters` | **-32001 timeout** | Modest success | **Diverge** (NEW-19) |
| `ir_model` omit | Uncapped, inline modest | Same | **Match** |
| top/bottom by returns | Small with period params | Same; top_n=100 = full 39-fund pool | **Match** |
| Byte/payload cap | None | None | **None** |
| Row cap 1000 | Yes + NEW-17 | Yes + NEW-17 | **Partial** |
| 10-call hang test | 10/10 fund_analyzer OK | 10/10 CRBM omit OK (~87–90 s) | **Pass** |
| Failure mode | Full success + liquidity timeout | Full success; no hang | **Pass with findings** |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Response size measured; >100 KB risk set | **Pass** — risk set: `get_data` (wide), `fund_analyzer`, omit-fee defaults, omit-CRBM (+ `fund_ror` at row cap) |
| Omit-filter set measured; server cap stated | **Pass** — **no byte cap**; 1000-row only on datalake tools |
| Cross-client break comparison | **Pass with divergence** on liquidity omit |
| Failure mode: error / truncate / hang | **Pass** — full success dominant; no indefinite hang; Cursor timeout = hang-like on liquidity omit |
| ≥10 consecutive large calls | **Pass** (both clients, different largest tools) |
| Safe-usage guidance | **Pass** — both drafts align |

---

## Findings (merged)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| Cap gap | No size/byte cap on analyzer / omit-CRBM / omit-fee / wide get_data | **S2 High** | Product: add caps or require filters |
| O3 | fund_analyzer base still ~600 KB with slices off | High | KS-1073 |
| NEW-17 | `truncated` false at 1000-row cap | High | KS-1078 |
| **NEW-18** | omit-`get_fund_crbm` ~86–90 s latency | Medium | Doc timeouts; client budgets |
| **NEW-19** | Cursor timeout on omit-`get_liquidity_parameters` | Medium | Align timeout / investigate server latency |
| Soft | top_n=100 collapses to full 39-fund eligible pool | Low | Doc only |

---

## Safe-usage (team)

1. Always supply identifying filters unless a full dump is intended.  
2. Do not expect `fund_analyzer` slice flags to yield a small payload.  
3. Prefer column-scoped `query_fund_manager` over wide `get_data`.  
4. Distrust `truncated:false` until NEW-17 is fixed.  
5. Budget **≥90–120 s** client timeouts for all-funds CRBM-scale calls; always filter liquidity params on Cursor.  
6. Offload large results to disk; do not load multi-100 KB JSON into LLM context.

---

## Recommendation

- Close KS-1081 as **Pass with findings**.  
- Track **NEW-18 / NEW-19** with owners (latency + client timeout).  
- Cap / require-filter work should be planned under payload-hardening (ties O3 + this story).  
- Proceed to **KS-1082** (AM-13 agent usability).
