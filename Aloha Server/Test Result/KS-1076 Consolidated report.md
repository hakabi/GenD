# KS-1076 Consolidated Report — Smoke-test the fee, IR and liquidity model tool group

> **Story:** [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) · **Draft ID:** AM-07 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1076 Cursor Result.md](KS-1076%20Cursor%20Result.md) (2026-08-07 ~07:39–07:45 UTC) · [KS-1076 Claude Result.md](KS-1076%20Claude%20Result.md) (2026-08-07 ~07:43–07:46 UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1076 is **Pass with findings**. Happy paths for all six tools work on both clients once parameters are correct. The ticket’s flagged usability risk is confirmed: **`get_fee_model_defaults` does not compose into `fee_model` without remapping 5 of 15 fields** (NEW-12 / NEW-13). Additional finding: inconsistent asset-class labeling across tools for fund 500 (NEW-14). Omit-filter paths feed AM-12; `query_fund_manager` allowlist errors are the cycle’s best error-quality example.

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| `get_fee_model_defaults` fund 500 | **P** | **P** | **P** |
| Defaults → `fee_model` compose | **F** (NEW-12) | **F** (NEW-13) | **F** confirmed |
| Remapped `fee_model` happy path | **P** | **P** | **P** |
| `fee_model` date scoping | **P** (12 months in 2024) | **P** (7 months in 2025 window) | **P** |
| Missing required param names field | **P** (`perf_return`) | **P** (`fund_id`) | **P** |
| Numeric string rejection | **P** — `mgt_fee:"0.01"` rejected | Not verified (client typed) | **P** (Cursor) |
| `ir_model` fund 500 | **P** net_ir 0.405494 | **P** same | **P** |
| `ir_model` omit `fund_ids` | ~150 funds, uncapped | Dozens+, uncapped, inline | AM-12 |
| Liquidity cost happy / invalid | **P** / **P** | **P** / **P** (+ gate override) | **P** |
| Liquidity params fund 500 | **P** | **P** | **P** |
| Liquidity params omit `fund_id` | **B** — timeout ×2 | Not fully measured in report | **B** / AM-12 |
| QFM allowlist | **P** clear error | **P** (best-in-cycle) | **P** |
| QFM 1000-row / table size | 695 rows, `truncated:false` | 695 rows; 64-col cap unreachable (31 allowlisted) | **P** (caps documented; scale-limited) |
| Asset class labels fund 500 | Implied in defaults vs QFM | **NEW-14** detailed | **F** finding |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| Defaults for fund 500 | **Pass** |
| Defaults compose into `fee_model` | **Fail** (NEW-12/13) — file usability defect |
| `fee_model` happy path (complete set) | **Pass** (after remap) |
| Missing required param named | **Pass** |
| `ir_model` explicit `fund_ids` | **Pass** |
| `ir_model` omit — measure / feed AM-12 | **Pass** (recorded; uncapped) |
| Liquidity cost happy + invalid | **Pass** |
| `get_liquidity_parameters` omit — measure | **Blocked** on Cursor (timeout); still feeds AM-12 as risk |
| QFM allowlist / clear error | **Pass** |
| QFM 64-col / 1000-row caps | **Pass** at schema; table has 695 rows / 31 allowlisted cols today |
| Numeric reject or documented coerce | **Pass** — reject (Cursor) |
| Pass rate ≥ 80% | **Pass with findings** |

---

## Findings (merged; ignore Antigravity)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **NEW-12 / NEW-13** | 5/15 fee fields renamed between defaults and `fee_model` (`mgt_fee`↔`management_fee`, etc.; `crystialized_paid` typo). Agent cannot forward defaults verbatim. | **S2** usability (AC-flagged); Claude notes S3 on correctness once remapped | AM-13 / AM-10 |
| **NEW-14** | Fund 500: defaults/liquidity params surface `asset_class_1` (“Relative Value”) as generic `asset_class`; `calculate_liquidity_cost` uses `asset_class_0` (“Absolute Return”) under similar key names | S3 Medium | AM-10 |
| Omit uncapped / slow | `ir_model` ~150 funds; liquidity-params omit timeouts | Medium | AM-12 / KS-1081 |
| `crystialized_paid` typo | Schema misspelling | Low | AM-13 |
| Full-history `fee_model` | ~373 periods when dates omitted | Medium | AM-12 |
| QFM error quality | Best-in-cycle allowlist message | Positive | Model for AM-10 |

---

## Recommendation

- Close KS-1076 as **Pass with findings**.
- Fix or document a defaults→`fee_model` mapping (or align field names) before treating fee tools as agent-safe.
- Align asset-class field names to `asset_class_0` / `asset_class_1` (NEW-14).
- Feed omit-timeout / omit-sizes and full-history fee payloads to **KS-1081 (AM-12)**; catalog/typo to **KS-1082 (AM-13)**; error-standard citation to **KS-1079 (AM-10)**.
