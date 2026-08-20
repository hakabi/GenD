# KS-1075 Cursor Result — Smoke-test the benchmark and CRBM tool group

> **Story:** [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) · **Draft ID:** AM-06 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~05:59–06:01 UTC  
> **Status:** **PASS WITH FINDINGS**

---

## Verdict summary

| Tool | Happy path | Edge case | Verdict |
|---|---|---|---|
| `search_crbm_index` | **P** — `"MSCI World"` → includes `NDDUWI Index.USD` | n/a | **PASS** |
| `get_benchmark_history` | **P** — 7 monthly rows, all inside window | **F** name-as-id → silent empty success | **PASS with finding** (NEW-11) |
| `get_fund_crbm` | **P** — fund 500, 4 components, weights 100% | Omit `fund_id` → **602 funds / ~196 KB** (weights off) uncapped | **PASS**, feeds AM-12 |
| `calculate_crbm_returns` | **P** — 30 weekly rows scoped to window | Inverted → generic “no data” (NEW-9) | **PASS with finding** |

Smoke pass rate above 80%. Confirmed **NEW-11** (silent empty on name-as-id) fails one explicit AC cell but overall story remains Pass with findings.

---

## Tests

### T1 — `search_crbm_index`
`names="MSCI World", limit=10` → 10 indices including **`NDDUWI Index.USD`** (“MSCI World Net TR Index (USD)”). **Pass.**

### T2 — `get_benchmark_history` happy path
`benchmark_ids=["NDDUWI Index.USD"]`, 2025-01-01…2025-07-31, `frequency=M` → **7 rows**, dates 2025-01-31 … 2025-07-31 — **all inside window**. **Pass** (date scoping works here, unlike NEW-8 / O2).

### T3 — name instead of `bbg_id` (NEW-11)
`benchmark_ids=["MSCI World"]`, same range → `status:"success"`, `row_count:0`, `returns:[]`. AC requires clear error naming the fix (`search_crbm_index` first). **Fail** against that AC — silent empty success.

### T4 — `get_fund_crbm` happy path
`fund_id="500"` → Citadel Kensington…; components LEGATRUU 10% / NDDUWI 20% / SBMMTB3 60% / SPGSCI 10%; beta ≈ 0.244. **Pass.**

### T5 — omit `fund_id` (AM-12 feed)
`get_fund_crbm(include_weights=false, include_benchmark_info=false)` → `total_funds: 602`, `funds_with_crbm: 602`, `funds_with_errors: 0`, **~196,091 bytes / 7,238 lines**, no pagination/cap. (Claude’s full-weights run was ~370K chars — same uncapped pattern.) Evidence: `logs/KS-1075_get_fund_crbm_omit.txt`.

### T6 — `calculate_crbm_returns` happy path
fund 500, 2025-01-01…2025-07-31, `frequency=W` → weekly series **2025-01-03 … 2025-07-25**, all inside window; component weights match `get_fund_crbm`. **Pass.**

### T7 — inverted dates
start `2025-07-31` > end `2025-01-01` → `No benchmark returns found for the specified period` — errors (not silent success) but **misleading** (NEW-9, 3rd tool).

---

## Findings

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **NEW-11** | Name-as-`bbg_id` → silent empty success | **S2 High** | AM-10 |
| Unbounded omit-`fund_id` | 602 funds, no cap | Medium | AM-12 |
| NEW-9 (3rd) | Inverted dates → generic “no data” | S3 Medium | AM-10 |

---

## Recommendation

Close KS-1075 as **Pass with findings**. File NEW-11; record omit-`fund_id` size for AM-12; keep inverted-date message quality with KS-1074 NEW-9.
