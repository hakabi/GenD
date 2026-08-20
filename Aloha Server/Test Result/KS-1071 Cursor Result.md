# KS-1071 Cursor Result — Capture tool inventory and audit catalog quality

> **Story:** [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) · **Draft ID:** AM-02 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Priority:** Highest · **Blocked by:** KS-1070 (partially unblocked on Cursor)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Tester:** Bình Hà Khoa via Cursor agent (`user-conceptia-aloha`)  
> **Executed:** 2026-08-06 ~11:02–11:06 UTC (live retest after MCP connect)  
> **Status:** **PARTIAL PASS (1 of 2 clients)** — live inventory captured on Cursor; second-client identical inventory still open

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Live tool list export (Cursor) | **P** | 34 Aloha tools; see baseline file |
| Compare vs 2026-08-05 (34 tools) | **P** | **Delta +0** — same tool names/groups |
| Per-tool schema + R/C/W | **P** (Cursor) | Captured required/optional params |
| Write-capable tools | **P*** | **0 found** from schemas; not behaviour-proved |
| Duplicates (O5) | **P** | All 3 alias pairs still present |
| Zero-required-param / all-funds candidates | **P** | Listed for AM-12 |
| Identical across 2 clients | **B** | Cursor only |

\*Write classification from schema/description only — same caveat as prior baseline.

**Interim overall:** **Pass with findings / Partial** — Cursor inventory is sufficient to **design and start** dependent stories on Cursor; full KS-1071 Pass still needs Client 2 diff.

---

## Acceptance criteria matrix

| # | Criterion | Cursor live 2026-08-06 | Client 2 (pending) | Consolidated |
|---|---|---|---|---|
| AC1 | Full list → `baseline/aloha-tool-inventory-{date}.md` | **P** → `aloha-tool-inventory-2026-08-06.md` | | Partial |
| AC2 | Count vs 34; deltas named | **P** — 34, delta 0 | | Partial |
| AC3 | name, description, params, R/C/W | **P** | | Partial |
| AC4 | Write tools flagged before further testing | **P*** — none found | | Partial |
| AC5 | Identical across both clients | **B** | | **B** |
| AC6 | Duplicates identified | **P** | | Partial |
| AC7 | No-required-param / all-funds list | **P** | | Partial |

---

## Tests executed

### T10 — Live tools/list via Cursor

| Field | Value |
|---|---|
| Test ID | KS-1071_T10 |
| UTC | 2026-08-06T11:02Z |
| Client | Cursor / `user-conceptia-aloha` |
| Actual | 34 Aloha tools + `mcp_auth` (Cursor meta, excluded from Aloha count) |
| Result | **P** |

### T11 — Drift vs 2026-08-05 baseline

| Field | Value |
|---|---|
| Test ID | KS-1071_T11 |
| Expected groups | 5+2+7+3+6+5+6 = 34 |
| Actual | Same 34 names; **no additions/removals** |
| Result | **P** |

### T12 — Duplicate aliases (O5)

| Pair | Live both present |
|---|---|
| `search_funds` / `Search_Funds` | Yes |
| `rating_detail` / `get_rating_details` | Yes |
| `rating_summary` / `get_rating_summary` | Yes |

Result: **P** (duplicates confirmed still in catalog)

### T13 — Write capability gate

| Field | Value |
|---|---|
| Test ID | KS-1071_T13 |
| Actual | No create/update/delete/save/submit tools in catalog |
| Action | Proceed with read-only testing; escalate if any write appears later |
| Result | **P*** |

### T14 — Cross-check with authenticated calls

| Field | Value |
|---|---|
| Test ID | KS-1071_T14 |
| `health_check` | healthy / 0.9.5 |
| `Search_Funds` exact name | fund **500**, source solovis |
| `get_user_info` | **No user email in headers** (O4) |
| Result | Inventory usable; identity finding noted |

---

## Tools with no required parameters (live)

- `equity_beta`
- `get_bottom_funds_by_returns`
- `get_fee_model_defaults` — omit `fund_id` → all funds (per description)
- `get_fund_crbm` — omit `fund_id` → all funds
- `get_liquidity_parameters` — omit `fund_id` → all funds
- `get_top_funds_by_returns`
- `get_user_info`
- `health_check`
- `intraday_fund_returns`
- `ir_model` — omit `fund_ids` → all public-sleeve funds
- `list_rating_details_by_user`
- `show_schemas`
- `smpublic_main_v3` — zero params; description still mentions Flask JSON body (O10)

---

## Headline inventory (Cursor)

| Group | Count |
|---|---|
| Fund search & resolution | 5 |
| Bundled analysis | 2 |
| Returns & performance | 7 |
| Benchmarks & CRBM | 3 |
| Fees, IR & liquidity | 6 |
| Ratings | 5 |
| Datalake introspection | 6 |
| **Total** | **34** |

Full detail: [Aloha Server/baseline/aloha-tool-inventory-2026-08-06.md](../baseline/aloha-tool-inventory-2026-08-06.md)

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| O5 | Three duplicate alias pairs still exposed | Medium | AM-13 / triage |
| O4 | Identity not in headers (`get_user_info`) | High | AM-08 / AM-11 |
| O10 | `smpublic_main_v3` still zero-param / Flask note | Medium | AM-09 |
| F11 | `fee_model` still **15** required params | Medium | AM-07 / AM-13 |
| AC5 | Second-client inventory not run | Blocks full Pass | Antigravity / Claude |

---

## Client 2 capture (pending)

| Field | Value |
|---|---|
| Client | |
| Tool count | |
| Diff vs Cursor | |
| Notes | |

---

## Consolidated verdict (current)

| Field | Value |
|---|---|
| Final KS-1071 | **Partial Pass** — Cursor inventory complete and matches prior 34 |
| Unblock dependent stories on Cursor? | **Yes** (KS-1072… with single-client caveat) |
| Full AM-02 close? | **No** until Client 2 inventory identical |
