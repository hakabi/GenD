# KS-1071 2nd Test — Claude Result — Full tool inventory and catalog quality audit

> **Story:** [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) · **Draft ID:** AM-02 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Highest · Blocked by [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) · Blocks KS-1072, KS-1074–KS-1078, KS-1082
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP) · build **0.9.7** (was 0.9.5)
> **Tester:** Bình Hà Khoa via Claude Code CLI **2.1.228** (claude.ai `conceptia-aloha` connector)
> **Executed:** 2026-08-21 ~03:21–03:26 UTC
> **Jira:** read-only this pass (no comments, no transitions)
> **New baseline produced:** `Aloha Server/baseline/aloha-tool-inventory-2026-08-21.md`
> **Status:** **PASS WITH FINDINGS** — inventory clean; **the one new tool is not safely usable**; AC5 unverified

Result codes: `P` Pass · `F` Fail · `B` Blocked · `S` Skipped

---

## 1. Ticket and comments reviewed (Jira MCP)

| Field | Value |
|---|---|
| Summary | Aloha MCP QA - Capture the full tool inventory and audit catalog quality |
| Status | Development Complete |
| Priority | Highest |
| Parent epic | KS-1066 |
| Blocks | KS-1072, KS-1074, KS-1075, KS-1076, KS-1077, KS-1078, KS-1082 |

### Comments on ticket (all returned)

| ID | Author | Created (UTC) | Substance |
|---|---|---|---|
| `20722` | Ha Khoa Dinh | 2026-08-06 | Antigravity PASS — "33 files / 34 entries", 23-vs-24 classification label, 0 writes, 3 alias pairs. Contains a dead `AM-12` link |
| `20729` | Bình Hà Khoa | 2026-08-07 (edited 2026-08-11) | Consolidated **PASS WITH FINDINGS** — 34 tools, 0 delta, 25 R / 9 C / 0 W, 3 duplicates, 13 no-required-param tools |

### Recorded outcomes (2026-08-14 edit)

All seven ACs marked executed; verdict PASS WITH FINDINGS. Findings carried: O4, O5, O10, F11, NEW-2. Drift baseline corroborated by **Cursor ↔ Claude Code only** — Antigravity not counted as a third peer.

---

## 2. Environment

| Item | Value |
|---|---|
| Client | Claude Code CLI 2.1.228 via `claude.ai conceptia-aloha` connector |
| Transport | Streamable HTTP |
| Server build | **0.9.7** |
| Capture method | Live schema fetch for all 35 advertised tools + functional spot-checks |
| Baseline compared against | `aloha-tool-inventory-2026-08-06.md` (34, canonical) and `-2026-08-11.md` (full descriptions, R1–R11) |
| Write tools invoked | **None** |

---

## 3. Acceptance criteria — 2nd test

| # | Criterion | 1st cycle | **2nd test** | Basis |
|---|---|---|---|---|
| AC1 | Full list saved to `baseline/aloha-tool-inventory-{date}.md` | P | **P** | `aloha-tool-inventory-2026-08-21.md` created |
| AC2 | Count vs 34; delta named tool-by-tool | P | **P** | **35**, delta **+1** — `get_cambridge_benchmarks` added, nothing removed |
| AC3 | Per tool: name, description, req, opt, **return shape**, R/C/W | P | **Partial** | Name/description/params/classification complete for all 35. **Return shape only for tools actually invoked** — no tool declares an `outputSchema`, so shape is knowable only by calling |
| AC4 | Write-capable tools flagged and reported to owners | P* | **P\*** | **0 found**, unchanged. Same undischarged caveat: schema/description analysis only; Plan §9 Q2 still unanswered in writing |
| AC5 | Inventory verified identical across both clients | P | **F** | Only one client captured this pass, **and** an unresolved conflict is on record — see §5 |
| AC6 | Duplicates identified explicitly | P | **P** | 3 alias pairs, live re-confirmed |
| AC7 | No-required-param / all-funds tools listed separately | P | **P** | **13**, unchanged |

**Story verdict (Claude half): PASS WITH FINDINGS.** The inventory work is clean. The audit half is not — see §6.

---

## 4. Tests executed

### T1 — Catalog capture and count

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T1 |
| UTC | 2026-08-21T03:21Z |
| Expected | Complete tool list; count compared to 34 |
| Actual | **35 tools.** Group counts: fund search 5 · bundled 2 · returns 7 · **benchmarks/CRBM 4 (was 3)** · fees/IR/liquidity 6 · ratings 5 · datalake 6 |
| Result | **P** |

### T2 — Delta vs 2026-08-06 baseline

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T2 |
| Added | **`get_cambridge_benchmarks`** — Cambridge Associates private-market benchmarks from `ks_model.cambridge_benchmark` |
| Removed | **None** |
| Changed | No rename, no signature change on any of the 34 pre-existing tools |
| Result | **P** |

### T3 — Classification R/C/W

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T3 |
| Actual | **26 read · 9 compute · 0 write** (was 25 / 9 / 0; the new tool is read) |
| Compute set | `fund_analyzer`, `smpublic_main_v3`, `calculate_annualized_returns`, `calculate_drawdown`, `equity_beta`, `calculate_crbm_returns`, `fee_model`, `ir_model`, `calculate_liquidity_cost` |
| Result | **P** — with the standing schema-only caveat |

### T4 — Duplicate / alias audit (O5)

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T4 |
| UTC | 2026-08-21T03:21:19Z |
| Actual | All **three** pairs still present: `search_funds` ≡ `Search_Funds`, `rating_detail` ≡ `get_rating_details`, `rating_summary` ≡ `get_rating_summary`. Schemas identical; descriptions differ only by an "alias of" note |
| Live proof | `search_funds("Citadel Kensington Global Strategies")` and `Search_Funds(...)` both → `fund_id "500"`, source `solovis`, count 1 — identical payloads |
| Result | **P** — O5 unchanged |

### T5 — No-required-parameter tools (AC7)

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T5 |
| Actual | **13**, identical membership to the first cycle |
| All-funds subset | `get_top_funds_by_returns`, `get_bottom_funds_by_returns`, `get_fund_crbm`, `get_fee_model_defaults`, `ir_model`, `get_liquidity_parameters`, `list_rating_details_by_user` |
| Result | **P** |

### T6 — `get_cambridge_benchmarks`, documented (bounded) call

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T6 |
| UTC | 2026-08-21T03:22:37Z and 03:25:42Z |
| Input | `asset_class`, `geography`, `limit` — **no `as_of_date`**, which the schema documents as optional |
| Expected | Matching rows capped by `limit`, per the tool's own description |
| Actual | `{"status":"error","error":"'as_of_date'"}` — a bare Python `KeyError` repr |
| Repro | Fails with both an invalid and a **valid** `asset_class`/`geography` pair |
| Result | **F — finding CB-1** |

### T7 — `get_cambridge_benchmarks`, `as_of_date` path

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T7 |
| UTC | 2026-08-21T03:22:49Z, 03:25:44Z |
| Input A | `asset_class: "Private Equity"`, `geography: "United States"`, `as_of_date: "2026-03-31"` |
| Actual A | `status: success`, `row_count: 0`, `benchmarks: []` — **silent empty**; "Private Equity" is not a valid asset class |
| Input B | `asset_class: "Buyout"`, `geography: "United States"`, `as_of_date: "2022-09-30"`, **`limit: 2`** |
| Actual B | `status: success`, `lookup: "exact"`, **`row_count: 550`**, **1.1 MB** payload — `limit` ignored |
| Result | **F — findings CB-2, CB-3** |

### T8 — Vocabulary discovery for the new tool

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T8 |
| Method | `describe_table(ks_model, cambridge_benchmark)` → 48 columns incl. `asset_class`, `geography`; then `get_data` to recover actual values |
| Actual | Valid `asset_class`: `Buyout`, `Energy`, `Growth Equity`. Valid `geography` includes `United States`, `U.S.-North America-Developed`, `Global`, `U.S. Cross-Region`, `Europe`, `Asia/Pacific`, `Europe-Developed`, `Asia/Pacific-Emerging` |
| Observation | **No catalog tool enumerates these.** Contrast `search_crbm_index`, which exists precisely to resolve benchmark names to ids |
| Result | **F — finding CB-2** |

### T9 — `get_data` cap behaviour

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T9 |
| UTC | 2026-08-21T03:23:35Z |
| Input | `get_data(ks_model, cambridge_benchmark, filter_cond="vintage_year = 2020 AND irr_median_lp_pct IS NOT NULL")` |
| Actual | `row_limit: 1000`, `row_count: 1000`, **`truncated: false`**, **2.0 MB**. Emitted SQL wraps `LIMIT 1000` correctly |
| Analysis | `row_count == row_limit` exactly, and the returned page spans only 3 asset classes / 10 geographies of a visibly wider set. Either the flag is wrong or the match set is exactly 1000 — the former is overwhelmingly likely |
| Result | **F — finding GD-1** (row cap enforced; completeness flag misreports) |

### T10 — Behavioural rules R1–R11 re-verification

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T10 |
| Actual | **All eleven still present verbatim in 0.9.7 descriptions, all still with no test case.** Includes R7, the contradictory `gate` default between `calculate_liquidity_cost` (1.0, not read from Solovis) and `fund_analyzer` (uses Solovis `investor_gate_pct`) |
| New | **R12** — `get_cambridge_benchmarks.use_nearest` defaults **true**, silently substituting the nearest prior as-of date. Same silent-substitution class as R1/R11. No test case |
| Result | **P** (captured) / findings unchanged |

### T11 — Identity and ratings scoping (O4 interaction)

| Field | Value |
|---|---|
| Test ID | KS-1071_2nd_C_T11 |
| Actual | `get_user_info` → `{"success": false, "error": "No user email found in request headers."}` on 0.9.7 |
| Catalog reading | `get_rating_details`, `rating_detail`, `list_rating_details_by_user` resolve user as: explicit **`user` param** → `X-User-Email` header → **`MCP_DEFAULT_USER_EMAIL`**. `get_rating_summary` / `rating_summary` have **no** `user` param — asymmetric |
| Implication | With the header absent, every caller falls back to one server-configured identity, and any caller can override scope by passing `user`. Documented since 2026-08-11; **never tested** |
| Result | **F (O4 unchanged)** — feeds [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) / [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) |

---

## 5. AC5 — the unresolved per-client conflict

The AC states plainly: *"Inventory verified identical across both clients; a per-client difference is a defect."*

| Source | Date | Count | `search_funds` | `get_cambridge_benchmarks` |
|---|---|---|---|---|
| Cursor dump (KS-1070 2nd test, T2) | 2026-08-20 18:22Z | **34** | **reported absent** | present |
| This capture | 2026-08-21 03:21Z | **35** | **present** | present |

I fetched the live schema for `search_funds` and it is served, with description *"Alias for Search_Funds"*, and it returns fund 500 correctly. Positive evidence of presence beats an absence in a dump, so the likely explanation is an **incomplete Cursor listing**, not a server-side per-client difference.

But "likely" is not "verified". AC5 requires a confirmed match across two clients and we do not have one. **One clean re-dump from Cursor settles it** — that is the single action standing between this story and a clean AC5.

---

## 6. Findings

| ID | Finding | Severity | vs 1st cycle |
|---|---|---|---|
| **CB-1** | `get_cambridge_benchmarks`: `as_of_date` documented optional but functionally required; omitting it returns a bare `KeyError` repr as the error message | **High (functional)** | **New** |
| **CB-3** | `get_cambridge_benchmarks`: `limit` silently ignored on the `as_of_date` path — the only working path. 550 rows / 1.1 MB returned for `limit: 2`. No way to bound the response | **High (functional)** | **New** |
| **CB-2** | `get_cambridge_benchmarks`: `asset_class`/`geography` are required exact-match strings with no discovery path; wrong values return `success` + `row_count: 0`, indistinguishable from "no data" | **Medium (usability)** | **New** |
| **GD-1** | `get_data` reports `truncated: false` on a page where `row_count == row_limit == 1000`. Cap is enforced; the completeness flag misreports. Also: cap is on rows, not bytes — 2.0 MB in one response | **Medium (correctness)** | **New** |
| **AC5-CONFLICT** | Cursor 34 / `search_funds` absent vs this capture 35 / present. Unresolved | **Medium (evidence)** | **New** |
| **O4** | `get_user_info` returns no email on 0.9.7; ratings tools fall back to `MCP_DEFAULT_USER_EMAIL` and accept a caller-supplied `user` | **High** | **Still present** |
| **O5** | Three duplicate alias pairs | Medium | **Unchanged** |
| **O10** | `smpublic_main_v3` still zero-parameter / Flask-body dependent | Medium | **Unchanged** — still never filed as a defect |
| **F11** | `fee_model` still requires **15** parameters | Medium | **Unchanged** |
| **R1–R11** | Eleven documented behaviour rules, none with a test case | Medium | **Unchanged** |
| **R12** | `use_nearest` silent nearest-prior date substitution | Low–Medium | **New** |
| **CATALOG** | 35 tools (was 34); 26 R / 9 C / 0 W | Info | **New** |

### Cross-story consequence

`get_cambridge_benchmarks` sits in the **benchmarks & CRBM** group, which is the scope of [KS-1075](https://gendvn.atlassian.net/browse/KS-1075). That story was executed when the group had three tools. It now has four, and the fourth is defective — **KS-1075's coverage is incomplete as recorded** and should be re-run.

---

## 7. Comparison to the 1st cycle verdict (comment `20729`)

| Check | Aug 2026 (0.9.5) | 2nd test (0.9.7) |
|---|---|---|
| Tool count | 34 | **35** (+`get_cambridge_benchmarks`) |
| Classification | 25 R / 9 C / 0 W | **26 R / 9 C / 0 W** |
| Write tools | 0 (schema-only) | **0** (schema-only, caveat undischarged) |
| Duplicates | 3 pairs | **3 pairs** — unchanged |
| No-required-param tools | 13 | **13** — unchanged |
| Cross-client identical | Pass (Cursor ↔ Claude) | **Fail** — unresolved conflict, one client this pass |
| O4 / O5 / O10 / F11 | Open | **All still open** |
| Catalog quality of new surface | n/a | **3 defects on the one new tool** |

---

## 8. What could not be tested

| Item | Blocker |
|---|---|
| AC5 cross-client verification | Only the claude.ai connector was available; Cursor dump needed |
| Return shape for all 35 tools (AC3) | No tool declares an `outputSchema`; shape requires invoking, and several tools are unbounded |
| Write-capability behavioural proof (AC4) | Cycle authorises read-only use; owner confirmation still unanswered |
| Ratings user-scoping | Second QA Azure AD account still not provisioned |

---

## 9. Verdict

**PASS WITH FINDINGS.**

The inventory half is clean and the drift picture is reassuring: 34 → 35, exactly one addition, nothing removed, no signature churn, duplicates and no-required-param counts both unchanged. As a drift baseline this is a good result.

The audit half is not. Every catalog-quality finding from the first cycle is still open, and the single tool added since then fails three ways — its documented bounded call errors out, its working call is unbounded, and its two required parameters have no discovery path. It shipped without a test case because it did not exist when [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) ran.

AC5 is the one criterion I cannot close, and it is cheap to close.

### Recommended next steps

1. **File CB-1 / CB-2 / CB-3 as a bug** against `get_cambridge_benchmarks`. CB-1 and CB-3 are High.
2. **File GD-1** — `truncated` flag correctness on `get_data`.
3. **Re-dump the catalog from Cursor** to settle AC5-CONFLICT.
4. **Re-run [KS-1075](https://gendvn.atlassian.net/browse/KS-1075)** — its tool group grew by one and the new member is broken.
5. Promote `aloha-tool-inventory-2026-08-21.md` to canonical drift baseline once AC5 is closed.
6. Still outstanding from cycle 1: R1–R12 have no test cases; O10 and F11 were never filed as defects.

---

## 10. Evidence index

| Artifact | Location |
|---|---|
| This report | `Aloha Server/Test Result/2nd Test/KS-1071 Claude Result.md` |
| **New dated baseline** | `Aloha Server/baseline/aloha-tool-inventory-2026-08-21.md` |
| Prior baselines | `aloha-tool-inventory-2026-08-06.md` (canonical), `-2026-08-11.md` (R1–R11) |
| 1st cycle reports | `Aloha Server/Test Result/KS-1071 *.md` |
| KS-1070 2nd test | `Aloha Server/Test Result/2nd Test/KS-1070 *.md` |
| Jira | https://gendvn.atlassian.net/browse/KS-1071 — comments `20722`, `20729`, read-only |

**Redaction:** no tokens, credentials or personal data in this report. No write tools invoked; all datalake reads were `SELECT`-path only.
