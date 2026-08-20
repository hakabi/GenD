# KS-1071 Consolidated Report — Capture tool inventory and audit catalog quality

> **Story:** [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) · **Draft ID:** AM-02 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Priority:** Highest  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources merged:**  
> - [KS-1071 Cursor Result.md](KS-1071%20Cursor%20Result.md) — 2026-08-06 ~11:02–11:06 UTC  
> - [KS-1071 Claude Result.md](KS-1071%20Claude%20Result.md) — 2026-08-07 ~02:56 UTC  
> - Antigravity inventory notes — cited from Jira via Claude Result (not schema-diffed against Cursor baseline in-repo)  
> **Canonical baseline file:** [aloha-tool-inventory-2026-08-06.md](../baseline/aloha-tool-inventory-2026-08-06.md)  
> **Consolidated:** 2026-08-07  
> **Final status:** **PASS WITH FINDINGS**

---

## Executive verdict

KS-1071 is **closed as Pass with findings**.

- Live catalog on **Cursor** and **Claude Code**: **34 tools**, **delta 0** vs each other and vs the dated baseline.
- Claude Code performed a **field-by-field schema diff** against `aloha-tool-inventory-2026-08-06.md` → **0 differences** (AC5 satisfied with evidence for Cursor ↔ Claude Code).
- **0 write-capable tools** found (schema/description judgement only — proceed read-only).
- **O5** duplicate aliases still all present; `search_funds` ≡ `Search_Funds` also confirmed **output-identical** on the fund-500 fixture (Claude).
- Antigravity’s Jira inventory agrees on **34 / 0 writes / 3 duplicates** at headline level, but methodology notes (**NEW-2**) mean it is **not** treated as a third schema-diff peer.

**Unblocks:** KS-1072–KS-1078, KS-1082 and other stories that depend on a stable tool inventory.

---

## Clients exercised

| Client | Capture method | Tool count | Schema vs 2026-08-06 baseline | Writes found |
|---|---|---|---|---|
| **Cursor** | Live `GetMcpTools` / tools list | **34** (+ ignore `mcp_auth`) | Source of dated baseline | **0** |
| **Claude Code** CLI 2.1.223 | Live schema fetch + diff | **34** | **Identical (0 diffs)** | **0** |
| **Antigravity** (Jira) | Self-reported (“33 files… 34 entries”) | **34** (stated) | Not cross-diffed in-repo | **0** (stated) |

---

## Acceptance criteria — consolidated

| # | Criterion | Cursor | Claude Code | Antigravity (Jira) | **Final** |
|---|---|---|---|---|---|
| AC1 | Full list saved as dated baseline | **P** → `aloha-tool-inventory-2026-08-06.md` | **P** — identical; no duplicate baseline file needed | Not filed in repo | **P** |
| AC2 | Count vs 34; deltas named | **P** — 34, Δ0 vs 2026-08-05 | **P** — 34, Δ0 vs Cursor file | States 34 (with “33 files” wording) | **P** |
| AC3 | name, description, params, R/C/W | **P** | **P** | **P** (minor count-label typo) | **P** |
| AC4 | Write tools flagged before further testing | **P*** — none | **P*** — none | **P** — none | **P*** |
| AC5 | Identical across ≥2 clients | Was **B** alone | **P** — direct diff vs Cursor | Not schema-diffed | **P** (Cursor ↔ Claude Code) |
| AC6 | Duplicates identified | **P** | **P** (+ output check on search pair) | **P** (same 3 pairs) | **P** |
| AC7 | No-required-param / all-funds list | **P** (13 tools) | **P** (same 13) | Partial (named “all funds” subset) | **P** |

\*Write judgement from schema/description only — mutation testing out of scope.

---

## Inventory headline (agreed)

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

Drift: **2026-08-05 → 2026-08-06 → 2026-08-07 Claude** = **34 / 34 / 34** (no tool add/remove).

---

## Duplicates (O5) — consolidated

| Pair | Schema both present | Live output check |
|---|---|---|
| `search_funds` ≡ `Search_Funds` | Yes (Cursor + Claude) | **Identical** on fixture `"Citadel Kensington Global Strategies"` → fund `"500"` / solovis (Claude) |
| `rating_detail` ≡ `get_rating_details` | Yes | Schema only (no rating `id` fixture this cycle) |
| `rating_summary` ≡ `get_rating_summary` | Yes | Schema only |

---

## No-required-parameter tools (13) — Cursor ≡ Claude

- `equity_beta`
- `get_bottom_funds_by_returns`
- `get_fee_model_defaults` — omit `fund_id` → all funds (description)
- `get_fund_crbm` — omit `fund_id` → all funds
- `get_liquidity_parameters` — omit `fund_id` → all funds
- `get_top_funds_by_returns`
- `get_user_info`
- `health_check`
- `intraday_fund_returns`
- `ir_model` — omit `fund_ids` → all public-sleeve funds
- `list_rating_details_by_user`
- `show_schemas`
- `smpublic_main_v3` — zero params; Flask JSON note remains (**O10**)

These feed **KS-1081 (AM-12)** payload-limit work.

---

## Smoke cross-check (inventory usability)

| Call | Cursor | Claude Code |
|---|---|---|
| `health_check` | healthy / 0.9.5 | healthy / 0.9.5 (uptime continuous with Cursor) |
| `Search_Funds` exact name | fund 500 / solovis | Same |
| `get_user_info` | No email (**O4**) | No email (**O4**) |

---

## Findings (merged)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **O5** | Three duplicate alias pairs still in catalog | Medium | AM-13 / triage |
| **O4** | Identity not forwarded (`get_user_info`) — Cursor + Claude | High | KS-1077 / KS-1080 |
| **O10** | `smpublic_main_v3` zero-param / Flask body note | Medium | KS-1078 |
| **F11** | `fee_model` still **15** required parameters | Medium | KS-1076 / KS-1082 |
| **NEW-2** | Antigravity Jira inventory used “33 files / 34 entries” wording and an off-by-one “23 vs 24” label — headline 34 still agrees, but not a peer schema-diff | Low (reporting) | Optional clarifying Jira comment; not required to close AM-02 tool-surface question |

---

## Evidence index

| Artifact | Location |
|---|---|
| Cursor half | `Aloha Server/Test Result/KS-1071 Cursor Result.md` |
| Claude half | `Aloha Server/Test Result/KS-1071 Claude Result.md` |
| Canonical inventory | `Aloha Server/baseline/aloha-tool-inventory-2026-08-06.md` |
| Prior rumour baseline | `Aloha Server/baseline/aloha-tool-inventory-2026-08-05.md` (superseded for drift reference only) |

**Redaction:** No tokens in sources or this consolidation.

---

## Recommendation

| Question | Answer |
|---|---|
| Close KS-1071 / AM-02? | **Yes — Pass with findings** |
| Stable inventory for later stories? | **Yes** — use `aloha-tool-inventory-2026-08-06.md` |
| Block dependent stories? | **No** |
| Carry-forward defects / observations | O4, O5, O10, F11 → triage in AM-08 / AM-09 / AM-11 / AM-13 / AM-14 |
| Optional cleanup | Reconcile Antigravity NEW-2 wording in Jira for three-client narrative completeness |
