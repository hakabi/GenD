# KS-1071 Cursor Result — Capture tool inventory and audit catalog quality (2nd test)

> **Story:** [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) · **Draft ID:** AM-02 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.7**  
> **Client:** Cursor IDE (`user-conceptia-aloha`) · native HTTP  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-21 ~03:37–03:39 UTC  
> **Folder:** `Aloha Server/Test Result/2nd Test/`  
> **Jira:** no updates this pass  
> **Status:** **PASS WITH FINDINGS** — inventory captured; **+1 tool** vs Aug baseline; new tool defective

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Live tools/list (Cursor) | **P** | **35** Aloha tools (+ `mcp_auth`) |
| Count vs prior 34 baseline | **P*** | **Delta +1** — `get_cambridge_benchmarks` **added**; nothing removed |
| Per-tool schema + R/C/W | **P** | Captured; aligns with `baseline/aloha-tool-inventory-2026-08-21.md` |
| Write-capable tools | **P*** | **0 found** (schema/description only) |
| Duplicates (O5) | **P** | All **3** alias pairs still present |
| Zero-required-param list | **P** | **13** tools (unchanged set) |
| Cross-client identical | **Partial** | Cursor dump agrees with Claude’s 2026-08-21 baseline on names/count; full field-by-field not re-diffed here |
| New tool usability | **F** | `get_cambridge_benchmarks` — CB-1/CB-3 reproduced on Cursor |

\*Write classification remains schema-only; owners Q2 still unanswered.

**Overall:** **Pass with findings** — catalog is inventoriable; **drift is real (+1)**; new Cambridge tool is not safely usable as documented.

---

## Environment

| Item | Value |
|---|---|
| `health_check` | healthy · **0.9.7** · uptime **587,551 s** ≈ 6.8 days |
| `get_user_info` | **O4 still Fail** — `"No user email found in request headers."` |
| Prior baselines | `aloha-tool-inventory-2026-08-05/06/11.md` (34 tools, 0.9.5 era) |
| Dated 2nd-cycle inventory | `baseline/aloha-tool-inventory-2026-08-21.md` (Claude; Cursor confirms headline) |

---

## Acceptance criteria — 2nd test

| # | Criterion | Result |
|---|---|---|
| AC1 | Full list captured / dated baseline | **Pass** — live Cursor list; dated file `aloha-tool-inventory-2026-08-21.md` already present |
| AC2 | Count vs 34; deltas named | **Pass** — **35**; **+`get_cambridge_benchmarks`** |
| AC3 | name / description / params / R·C·W | **Pass** (Cursor schemas + Claude dated inventory) |
| AC4 | Write tools flagged | **Pass*** — none found |
| AC5 | Identical across ≥2 clients | **Partial** — Cursor↔Claude both report 35 / same +1; Antigravity not used |
| AC6 | Duplicates identified | **Pass** — O5 all three pairs live |
| AC7 | No-required-param / all-funds list | **Pass** — 13 zero-required; all-funds subset unchanged |

---

## Drift vs 2026-08-06 canonical (34 → 35)

| Change | Tool | Detail |
|---|---|---|
| **Added** | `get_cambridge_benchmarks` | R · required `asset_class`, `geography` · optional `as_of_date`, `use_nearest`, `limit` |
| Removed | — | none |
| Renamed | — | none |

Group totals now: search 5 · bundled 2 · returns 7 · **benchmarks/CRBM 4** · fees/IR/liq 6 · ratings 5 · datalake 6 = **35**.

---

## Duplicates (O5) — still present

| Pair | Live on Cursor 0.9.7 |
|---|---|
| `search_funds` ≡ `Search_Funds` | Yes — alias description; `search_funds("Citadel Kensington Global Strategies")` → fund **500** / solovis |
| `rating_detail` ≡ `get_rating_details` | Yes — “Same as get_rating_details” |
| `rating_summary` ≡ `get_rating_summary` | Yes — “Same as get_rating_summary” |

---

## Tools with no required parameters (13)

`smpublic_main_v3` · `get_top_funds_by_returns` · `get_bottom_funds_by_returns` · `intraday_fund_returns` · `equity_beta` · `get_fund_crbm` · `get_fee_model_defaults` · `ir_model` · `get_liquidity_parameters` · `list_rating_details_by_user` · `show_schemas` · `get_user_info` · `health_check`

All-funds / bare-call risk set unchanged (feeds KS-1093 class).

---

## `fee_model` / O10 / O4 (carry-forward)

| ID | Status on 0.9.7 |
|---|---|
| **F11** | Still **15** required params (`crystialized_paid` typo remains) |
| **O10** | `smpublic_main_v3` still **zero properties**; Flask JSON body note in description |
| **O4** | `get_user_info` still no email |

---

## New tool defects — `get_cambridge_benchmarks` (Cursor reproduced)

| ID | Defect | Cursor evidence |
|---|---|---|
| **CB-1** | `as_of_date` documented optional but omitting it errors | `get_cambridge_benchmarks(asset_class="Buyout", geography="Global", limit=3)` → `status:error`, `error: "'as_of_date'"` (KeyError-style) |
| **CB-3** | `limit` ignored on working `as_of_date` path | `… as_of_date="2022-09-30", geography="United States", limit=2` → **`row_count: 550`**, payload **1,147,397 bytes (~1.12 MB)** — not 2 rows |

CB-2 (silent empty on wrong exact-match labels) documented in Claude’s 2026-08-21 baseline; not re-probed this Cursor pass beyond schema read.

---

## Classification headline (Cursor)

| Class | Count |
|---|---:|
| Read | **26** (was 25) |
| Compute | **9** |
| Write | **0** |
| **Total Aloha** | **35** |

---

## Findings (2nd test)

| ID | Finding | Severity |
|---|---|---|
| **DELTA-1** | Catalog **34 → 35**; `get_cambridge_benchmarks` added on 0.9.7 | Medium (inventory) |
| **CB-1** | Optional `as_of_date` actually required at runtime | **S2** usability |
| **CB-3** | `limit` inert; multi-MB response | **S2** (payload / AM-12 class) |
| O4 / O5 / O10 / F11 | Still present | Unchanged vs prior filings |
| NOTE | Prior Cursor dump on 2026-08-20 briefly appeared to miss `search_funds` (35 vs 34 confusion) — **resolved**: live catalog has both `search_funds` and `get_cambridge_benchmarks` → **35** |

---

## Recommendation

- Treat `baseline/aloha-tool-inventory-2026-08-21.md` as the **new drift baseline** for 0.9.7.  
- File / track **CB-1 / CB-3** (and CB-2 from Claude) before relying on Cambridge tools in agents.  
- Do **not** assume 34-tool docs still apply.  
- No Jira comment posted (per instruction).

---

## Evidence

| Artifact | Path |
|---|---|
| This report | `Aloha Server/Test Result/2nd Test/KS-1071 Cursor Result.md` |
| Dated inventory | `Aloha Server/baseline/aloha-tool-inventory-2026-08-21.md` |
| Large CB-3 payload | Cursor agent-tools offload ~1.12 MB (`limit:2` ignored) |
