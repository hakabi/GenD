# Aloha MCP — Findings Register

> **Purpose:** the single canonical index of every finding ID used across Aloha MCP testing. Living document — update it whenever a finding is raised, filed, deferred or closed.
> **Scope:** `https://mcp.conceptia.com/aloha/mcp` · all cycles, not just KS-1066
> **This file lives at:** `Aloha Server/Test Guide/Findings Register.md`
> **Last updated:** 2026-08-14 — reconciled line by line against `Test Result/KS-1066 All Findings and Bugs Report.md`. No new live probe; no finding added, removed or re-severitied.
> **Last live server check:** 2026-08-19 · build **`0.9.7`**, healthy, uptime 4.78 d (deployed ~2026-08-14). Remediation branch `fix/ks-1085-1090-aloha-mcp-qa` is **merged and live**.
> **Next free finding ID:** **NEW-27**

> ⚠️ **Path note.** Several documents cite this register as `Aloha Server/Findings Register.md` — including `aloha_mcp_uat_plan.md` §7.1/§7.1.1 (corrected 2026-08-14) and `Test Result/KS-1066 All Findings and Bugs Report.md` §intro/§4.1/§8 (**not** corrected — that report is cycle-scoped and frozen). There is no copy at the `Aloha Server/` root. This file, under `Test Guide/`, is the only one.

---

## 1. Read this first — the four ID namespaces

Four different ID families are in circulation and they are **not** interchangeable. Confusing them is what produced the dead `browse/NEW-18` and `browse/AM-12` links found in live Jira.

| Family | Meaning | Is it a Jira key? | Where defined |
|---|---|:--:|---|
| **`O1`–`O10`** | Pre-cycle observations from the 2026-08-05 probe | **No** | `Test Guide/aloha_mcp_uat_plan.md` §3.2 |
| **`AM-01`–`AM-15`** | Draft story IDs, mapped to real keys on creation | **No** | `Test Guide/aloha_mcp_uat_tickets.md` §mapping |
| **`NEW-nn`** | Findings discovered during execution | **No** | This file |
| **`KS-nnnn`** | Real Jira issues (stories, bugs, epic) | **Yes** | `gendvn.atlassian.net`, project `KS` |

> ⚠️ **Never write `https://gendvn.atlassian.net/browse/NEW-18` or `/browse/AM-12`.** There is no `NEW` or `AM` project in this Jira instance — those URLs 404. Write the ID as plain text and, if it has one, link its real `KS-nnnn` ticket instead.

**Note on the Test Guide files:** neither `aloha_mcp_uat_plan.md` nor `aloha_mcp_uat_tickets.md` contains any `NEW-nn` ID. Both were written 2026-08-05, before execution, and reference only `O1`–`O10` and `AM-01`–`AM-15`. This is correct — they are design documents and should **not** be retrofitted with execution findings. Use this register instead.

---

## 2. NEW-nn findings register

**Status values:** `Filed` = has a Jira bug · `Deferred` = triaged S3/S4, consciously not filed (P3) · `Draft` = found post-cycle, not yet triaged or filed

| ID | Finding | Tool(s) | Source | Sev | Ticket | Status |
|---|---|---|---|:--:|---|---|
| **NEW-1** | Antigravity self-reported `mcp-remote` transport, violating the native-HTTP requirement of AC1 | *(process)* | KS-1070 | S4 | — | Deferred |
| **NEW-2** | Antigravity's Jira inventory used "33 files / 34 entries" wording and an off-by-one "23 vs 24" classification label. Headline 34 / 0 writes / 3 duplicates still agrees, but the report is **not** treated as a third schema-diff peer | *(process / reporting)* | KS-1071 | Low | — | Deferred — *"optional clarifying Jira comment; not required to close the tool-surface question"* |
| **NEW-3** | **Never written — slot skipped.** The KS-1072 Elasticsearch special-character finding should have taken it; see §6.2 | `Search_Funds` | KS-1072 | S3 | — | Deferred (tracked unnumbered) |
| **NEW-4** | Malformed `start_date` / `end_date` accepted without validation | `fund_analyzer` | KS-1073 | S2 | [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | **Filed** — re-confirmed 2026-08-12 |
| **NEW-5** | `search_term` silently overrides an explicit valid `fund_id` | `fund_analyzer` | KS-1073 | S2 | [KS-1086](https://gendvn.atlassian.net/browse/KS-1086) | **Filed** |
| **NEW-6** | Supplying both `period_months` and explicit dates silently discards the dates | `get_top_funds_by_returns`, `get_bottom_funds_by_returns` | KS-1074 | S3 | — | Deferred |
| **NEW-7** | Returns all zeros — non-functional in both run modes (~695 funds) | `intraday_fund_returns` | KS-1074 | S2 | [KS-1089](https://gendvn.atlassian.net/browse/KS-1089) | **Filed** |
| **NEW-8** | Statistics computed over full fund history, not the requested window | `calculate_drawdown` | KS-1074 | S2 | [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | **Filed** — widened 2026-08-11, see §4 |
| **NEW-9** | Inverted-date error quality inconsistent and misleading across 3+ tools | multiple | KS-1074/75/79 | S3 | — | Deferred |
| **NEW-10** | Date `pattern` constraint applied inconsistently across schema | multiple | KS-1074 | S3 | — | Deferred — **root cause of KS-1088**, see §4 |
| **NEW-11** | Silent empty success when a name is passed where a `bbg_id` is expected | `get_benchmark_history` | KS-1075 | S2 | [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) | **Filed** |
| **NEW-12 / NEW-13** | 5 of 15 fields renamed between the two tools — defaults do not compose | `get_fee_model_defaults` → `fee_model` | KS-1076 | S2 | [KS-1091](https://gendvn.atlassian.net/browse/KS-1091) | **Filed** |
| **NEW-14** | `asset_class_0` vs `asset_class_1` surfaced under generic key names | multiple | KS-1076 | S3 | — | Deferred |
| **NEW-15** | User-scoped ratings fail closed — no identity reaches the service | `list_rating_details_by_user` | KS-1077 | S2 | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | **Filed** (merged with O4) |
| **NEW-16** | Invalid input leaks full Trino/Java stack trace + MongoDB catalog prefixes | `describe_table` | KS-1078 | S2 | [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) | **Filed** |
| **NEW-17** | `truncated: false` returned even when the 1000-row cap is hit | `get_data` | KS-1078/81 | S2 | [KS-1092](https://gendvn.atlassian.net/browse/KS-1092) | **Filed** |
| **NEW-18** | Omit-filter calls take a consistent ~86–90 s (latency, not correctness) | `get_fund_crbm` | KS-1081 | S3 | — | Deferred — *"document timeouts"* |
| **NEW-19** | Cursor returns `MCP error -32001` timeout where Claude Code succeeds | `get_liquidity_parameters` | KS-1081 | S3 | — | Deferred — *"align timeouts"* |
| **NEW-20** | Stripped search tools omit `manager_name`; undocumented output-shape gap | `Search_Funds`, `search_funds` | KS-1082 | S3 | — | Deferred |
| **NEW-21** | Windows < 12 months return the *cumulative* return in the `annualized_return` field; ≥ 12 months annualize correctly. Label does not distinguish | `calculate_annualized_returns` | post-cycle 2026-08-11 | S3 | [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | **Draft** — confirming |
| **NEW-22** | Multi-name query with a `limit` silently starves one search phrase to zero results; no truncation flag | `search_crbm_index` | post-cycle 2026-08-11 | S2 | [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | **Draft** — confirming |
| **NEW-23** | Raw generated SQL echoed in the **success** payload — contradicts the "no raw SQL" AC | `query_fund_manager` | post-cycle 2026-08-11 | S3 | [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | **Draft** — confirming |
| **NEW-24** | `truncated` completeness signal has three different behaviours across three tools | catalog-wide | post-cycle 2026-08-11 | S3 | [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | **Draft** — confirming |
| **NEW-25** | Matches against `fund_id` as well as fund name, contradicting its parameter description; no `matched_on`, no `limit`, no truncation flag | `Search_Funds` | post-cycle 2026-08-12 | S3 | [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | **Draft** — confirming |
| **NEW-26** | **Tool surface drifted 34 → 35 on build 0.9.7.** New tool `get_cambridge_benchmarks` (Cambridge Associates private-market benchmarks, `ks_model.cambridge_benchmark`) is absent from the drift baseline and has had **no QA coverage of any kind** — never inventoried, classified, smoke-tested or size-measured. Defaults to `limit: 1000` on a catalog with no byte cap (KS-1093) and an unreliable `truncated` flag (KS-1092). The 0.9.7 fixes also added new response fields catalog-wide | `get_cambridge_benchmarks` + catalog-wide | re-test 2026-08-19 | S3 | — | **Draft** — raise on [KS-1098](https://gendvn.atlassian.net/browse/KS-1098) |

**Totals:** 26 slots, **25 issued** (only NEW-3 unused) · **10 Filed** · **9 Deferred** · **6 Draft**

---

## 3. Findings that were triaged but never given a NEW-nn

These appear in the KS-1083 triage sheet with no finding ID. **They are not tracked by the NEW-nn series** — assign IDs from NEW-26 onward if they need to be referenced.

| Finding | Tool | Source | Sev | Ticket | Status |
|---|---|---|:--:|---|---|
| Silent empty success on invalid `fund_id` | `get_fund_returns` | KS-1074 | S2 | [KS-1087](https://gendvn.atlassian.net/browse/KS-1087) | Filed |
| No byte cap on omit-filter and wide responses | catalog-wide | KS-1081 | S2 | [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) | Filed |
| Elasticsearch special-character raw body | search tools | KS-1072 | S3 | — | Deferred |
| Raw Python `unhashable type: 'dict'` error | `list_tables` | KS-1078 | S3 | — | Deferred (pair with NEW-16) |
| Error catalogue below the 80% Actionable+Informative bar | catalog-wide | KS-1079 | S3 | — | Deferred |
| 15-param discoverability | `fee_model` | KS-1082 | S3 | — | Deferred (overlaps KS-1091) |
| `start_date` has no default | `fund_analyzer` | KS-1082 | S3 | — | Deferred |
| Incomplete manager search | `query_fund_manager` | KS-1082 | S3 | — | Deferred |
| No timed stop→start→no-reauth restart log *(recorded as "AC5-gap")* | *(process)* | KS-1070 | Low | — | Deferred |

---

## 4. Amendments to filed bugs

Findings that **widen or re-scope an already-filed ticket** rather than standing alone. Track these — a fix scoped to the original wording would leave the defect partly live.

| Ref | Ticket | Amendment | Raised |
|---|---|---|---|
| **NEW-8 / KS-1096-A** | [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | Filed as *"headline metrics reference dates outside the window"*. Live re-test shows **every statistic except `total_periods` is computed over the fund's full 348-month history**. A fix correcting only the date fields would leave `number_down_months`, `top_3_losses` and the drawdown magnitudes wrong | 2026-08-11 |
| **NEW-4 / KS-1088-A** | [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | Root cause identified: `start_date` / `end_date` carry **no `pattern`** in the schema while `custom_start_date_1/2` and `custom_end_date_1/2` all do. Merges with **NEW-10** as one fix. Regex alone is insufficient — `2026-13-45` matches it and needs a server-side calendar check | 2026-08-12 |

**Open on KS-1088.** One case is still unmeasured: a malformed date against a **valid** fund — does `fund_analyzer` succeed over an undefined window, or crash? The 2026-08-12 probe used an ambiguous `search_term` deliberately to keep the response small; the valid-fund path returns ~600 KB (O3 / KS-1093). Run it with response-to-file capture before closing KS-1088.

### 4.0 Scope decision and tickets created, 2026-08-14

**Option 2 was chosen: the 12 bugs stay under [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)**, which now stays open through remediation rather than closing as a verification-only epic. Its description carries two AC sets — Part A (verification, substantially done) and Part B (remediation and re-test, the actual close trigger).

| Key | Type | Parent | Purpose |
|---|---|---|---|
| [KS-1098](https://gendvn.atlassian.net/browse/KS-1098) | Epic | — | Re-test cycle against a remediated build; carries report §7's five revisions. **`blocks` KS-1066** |
| [KS-1099](https://gendvn.atlassian.net/browse/KS-1099) | Story | KS-1098 | Script the 34-tool smoke pass — do it before the re-test runs |
| [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | Story | KS-1066 | Two-client confirmation of NEW-21…NEW-25, then file or dismiss |

**Remediation is under way.** Six of the 12 bugs moved to *In Progress* assigned to `quan`: KS-1091, KS-1092, KS-1093, KS-1094, KS-1095, KS-1096 — both P0s included. No new build had shipped at the last `health_check` (2026-08-12, still `0.9.5`), so nothing is re-verified.

**Two confirmed defects remain unfiled**, consciously, as of 2026-08-14: `smpublic_main_v3` / O10 non-functional over MCP (KS-1078's own AC requires a defect for it), and `list_tables` raw Python `unhashable type: 'dict'` on an invalid `db_name`. Both are recorded on the KS-1066 description under *Known gaps carried openly*.

### 4.1 Ticket-hygiene items — open, not findings

Housekeeping on the tickets themselves. Tracked here so they are not lost between cycles; none is a product defect.

| Item | Detail | Source |
|---|---|---|
| **KS-1085 is owned by another QA — do not align it** | It carries **no `S2` label** (labels are empty) and Jira priority **Medium**, where its eleven siblings carry `S2`/`MCP-Aloha`/`AM-14` and priority High. Its reporter and assignee are **Ha Khoa Dinh**; all eleven others are Bình Hà Khoa. **Decision 2026-08-14: leave it as filed and treat it as an independent ticket.** The metadata gap is recorded, not a defect to fix. When counting "12 S2 bugs", remember KS-1085 will not match an `S2` label filter — [KS-1083](https://gendvn.atlassian.net/browse/KS-1083)'s triage comment is the authority on the set, not Jira labels | Verified live 2026-08-14 |
| **~7 dead links deliberately left** | In comments authored by Ha Khoa Dinh: KS-1071 `20722`, KS-1075 `20747`, KS-1076 `20748`, KS-1078 `20750`, KS-1081 `20753`. **Spot-verified live 2026-08-14:** KS-1078 comment `20750` still contains working `browse/NEW-16` and `browse/NEW-17` markdown links. Editing another person's comment was judged out of scope — raise with them or authorise a second pass | Report §4.3 + live check |

> ✅ **Resolved 2026-08-14 — the `AM-12` question is closed.** An earlier revision of this section flagged a contradiction: report §4.3 lists KS-1084 as clean while report §7 says literal `[AM-12](…/browse/AM-12)` links are *"still present in live ticket descriptions"*. **KS-1084's live description was read directly and is clean** — the safe-usage bullet correctly links [KS-1081](https://gendvn.atlassian.net/browse/KS-1081). §4.3 is right; **report §7's closing recommendation is stale**. No action needed; do not re-raise.

---

## 5. Pre-cycle observations O1–O10 — final disposition

All ten **confirmed**; none by-design or not-reproducible. Defined in `Test Guide/aloha_mcp_uat_plan.md` §3.2.

> **The severities below are canonical — two other documents disagree with them, and neither supersedes this table.**
> - `aloha_mcp_uat_plan.md` §7.4 cites O1/O5/O7 as S3 and O6/O10 as S4. Those are **pre-cycle illustrations** of the rubric, written 2026-08-05 before any of the ten was executed. Execution moved **O1 to S2** (the ambiguous-resolution crash makes a primary tool unusable) and **O10 to S3**.
> - `Test Result/KS-1066 …Report.md` §3 rates O5/O9 "Medium", O6 "Low/Medium", O8 "Low" and O10 "Confirmed Fail". That report says so itself: those items never went through formal S1–S4 triage in KS-1083, so the words are descriptive, not rubric values. This table assigns the S-numbers.
> - **O4 is the one to read carefully.** Plan §7.4 lists it as "S1 *if confirmed*" and plan §11.1 makes a confirmed S1 on user scoping an automatic Fail. It was confirmed — but it **fails closed** (empty result + explicit "no identity" message) rather than serving one user another's data, so the automatic-S1 clause never fired. It is **S2**. The cycle's Fail verdict rests on the smoke pass rate (≈73% vs the 80% bar), not on O4.

| ID | Observation | Sev | Ticket / tracking |
|---|---|:--:|---|
| **O1** | `fund_analyzer` silently resolves ambiguous `search_term` to top ES hit | S2 | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) — re-reproduced 2026-08-12 (resolved to `986`; top hit unstable day to day) |
| **O2** | `start_date` does not scope the returned series | S2 | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) |
| **O3** | ~600 KB payload with all slices off; no server cap | S2 | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) + [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) |
| **O4** | No identity forwarded despite completed OAuth | S2 | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) — still reproduces 2026-08-12 |
| **O5** | Three duplicate tool alias pairs | S3 | — deferred (catalog debt) |
| **O6** | `fund_id` type inconsistent: string vs number across search tools | S4 | — tracked in KS-1072 |
| **O7** | Failure detail as Python `dict` repr, not JSON | S3 | — tracked in KS-1079 |
| **O8** | Legacy `/aloha/sse` answers 401, not 404 | S3 | — owner disposition open (plan §9 Q7) |
| **O9** | PKCE `plain` advertised; `/register` open with auth method `none` | S3 | — owner disposition open (plan §9 Q6) |
| **O10** | `smpublic_main_v3` non-functional over MCP | S3 | — tracked in KS-1078 |

---

## 6. Known numbering defects in this series

Recorded so nobody re-derives them.

1. **Only NEW-3 was never issued — NEW-2 exists.** See §6.2 for the full trace. NEW-2 is a real KS-1071 finding that never reached the KS-1083 triage sheet because it is a reporting-quality note about another client's Jira comment, not a product defect. Do not reuse NEW-3.
2. **NEW-1 was double-assigned.** `KS-1070 Consolidated report.md` uses NEW-1 for the Antigravity `mcp-remote` transport issue; `KS-1072 Consolidated report.md` and `KS-1072 Claude Result.md` independently use **NEW-1** for the Elasticsearch special-character raw-body leak. Two different findings, same ID. This register's NEW-1 is the KS-1070 one (the reading the KS-1083 triage sheet takes).
3. **NEW-19 was briefly double-assigned.** `KS-1082 Claude Result.md` used NEW-19 for the `manager_name` output-shape finding; the consolidated report remapped that to **NEW-20** and reserved NEW-19 for the Cursor liquidity timeout. Searching the repo for NEW-19 returns both.
4. **NEW-12 and NEW-13 are one finding** raised independently by two clients, never merged into a single ID.
5. **Nine triaged findings carry no ID at all** (§3). NEW-nn is therefore *not* a complete index of the cycle's findings — the KS-1083 triage sheet is.
6. **Dead `browse/NEW-nn` links in live Jira — swept 2026-08-12.** 52 removed from 20 locations. Remaining: ~7 in comments authored by another QA (Ha Khoa Dinh), deliberately left. Detail in `Test Result/KS-1066 All Findings and Bugs Report.md` §4.3.

### 6.1 Why the numbering broke — the ID scheme changed mid-cycle

The gaps and collisions all trace to one cause: **`NEW-nn` was not a single global counter.** Three schemes ran in sequence, and nobody reconciled them.

| Stories | Scheme in use | Evidence |
|---|---|---|
| KS-1070, KS-1071 | **Running global counter**, one finding per story | KS-1070 → `NEW-1`; KS-1071 → `NEW-2` |
| KS-1072 | **Counter reset per story**, plus a Cursor-only prefixed scheme | Claude called its finding `NEW-1` *again*; Cursor called the same class of finding `NEW-S1` |
| KS-1073 onward | **Prefixed per-story IDs (Cursor) mapped to a resumed global series** | Cursor `NEW-P1`, `NEW-D1`, `NEW-D2` → consolidated as `NEW-5`, *(unmapped)*, `NEW-4` |

The KS-1073 consolidator resumed the global series at **NEW-4**, i.e. it assumed NEW-1, NEW-2 and NEW-3 were already consumed. NEW-1 and NEW-2 genuinely were. **NEW-3 was not** — it was the slot the KS-1072 finding would have taken had that story continued the counter instead of resetting it.

### 6.2 NEW-2 and NEW-3 — full trace

**NEW-2 exists.** It is a real finding, and it *is* Antigravity-related:

> *"Antigravity Jira inventory used '33 files / 34 entries' wording and an off-by-one '23 vs 24' label — headline 34 still agrees, but not a peer schema-diff"* — Low (reporting) — `KS-1071 Consolidated report.md`

Its consequence was that Antigravity's KS-1071 inventory was **not counted as a third schema-diff peer**; the 34-tool / 0-write / 3-duplicate conclusion rests on Cursor ↔ Claude Code only. It never appears in the KS-1083 triage sheet because triage covered **product defects**, and NEW-2 is a reporting-quality note about another client's Jira comment. That absence is what made it look unissued.

**NEW-3 was never written.** The finding that belongs in the slot is the KS-1072 Elasticsearch special-character behaviour, which exists under two other labels instead:

| Client | Label used | Finding |
|---|---|---|
| Claude Code | `NEW-1` *(collision — see §6 item 2)* | Stronger special-char set returns a **raw Elasticsearch body** — index UUID, node id, dated index name |
| Cursor | `NEW-S1` | `Search_Funds("!@#$%")` returns **320 funds** instead of empty or an error |

Both were carried into KS-1083 triage as the single unnumbered row **"ES special-char raw body · KS-1072 · S3 · Deferred"** — with an empty Bug-key column and no `NEW-nn`. So the finding survived; only its ID did not.

**Answer to "did NEW-2/NEW-3 come from the Antigravity tester?"** — Half. **NEW-2 yes**, it is entirely about Antigravity's reporting, as is NEW-1. **NEW-3 no** — it is a numbering artefact of the KS-1072 counter reset, and the underlying finding came from Cursor and Claude Code, not Antigravity.

**If you want the series made whole:** assign `NEW-3` retrospectively to the ES special-character finding and add the Bug-key column entry in the KS-1083 triage sheet. It is still S3 deferred, so nothing else changes. Alternatively leave NEW-3 permanently unused and let §3 carry the finding — but then the "ES special-char" row should say so explicitly.

---

## 7. Related: documented behaviour rules (not findings)

`baseline/aloha-tool-inventory-2026-08-11.md` §4 lists **R1–R11** — behaviours the server documents in its own schema that have **no test case** in any story. They are not defects; they are untested documented behaviour. Highest-value: **R1** (top/bottom funds silently exclude any fund with a data gap), **R2** (`include_liquidity_cost: false` switches the dashboard from V3 to V2), **R7** (contradictory `gate` defaults between `calculate_liquidity_cost` and `fund_analyzer`).

**Two of them touch open findings directly, so read them before writing a fix or a re-test:**

- **R2 ↔ O3 / KS-1085.** O3's headline measurement ("all slices off → ~613 KB") was taken with `include_liquidity_cost: false`, which R2 says silently switches the dashboard from load_data **V3 to V2**. The 613 KB figure is therefore from a *different code path* than the default all-slices-on call. Any payload-cap fix must be validated on both paths.
- **R11 ↔ NEW-22.** `search_crbm_index.split_commas` defaults **true**, so a single string containing commas is silently split into separate OR phrases. That is the same OR-semantics machinery that lets `limit` starve one phrase to zero rows in NEW-22. Likely one fix, not two.

### 7.1 Verified-correct behaviour — do not re-derive

Recorded because the natural assumption is the opposite, and re-testing costs time.

| Behaviour | Evidence |
|---|---|
| **Date-window scoping is per-tool, not globally broken.** `get_fund_returns` and `calculate_crbm_returns` both scoped correctly (all returned rows inside the requested window); `calculate_drawdown` did not. Which tools honour the window **cannot be predicted from the catalog** — it has to be asserted per tool | Report §6.3, probe 2026-08-11 |
| **`calculate_annualized_returns` arithmetic is correct.** NEW-21 is a *disclosure* defect, not a maths error: sub-annual windows returning the cumulative figure is likely intentional and GIPS-conformant (annualizing under one year is prohibited). The ≥ 12-month path annualizes correctly — verified against a manual compounding | Report §6.2, NEW-21 evidence |
| **The 34-tool surface has not drifted.** Exact name-for-name match against `baseline/aloha-tool-inventory-2026-08-06.md`, delta 0, re-checked 2026-08-11 | Report §6.1 |
| **Fixture fund 500 still resolves cleanly**, exactly 1 result, source `solovis` | Report §6.1 |

---

## 8. How to maintain this file

1. **New finding?** Take the next free ID from the header, add a row to §2, bump *Next free finding ID*.
2. **Filed a bug?** Set Status to `Filed` and add the `KS-nnnn` link. Never link the NEW-nn itself.
3. **Deferred at triage?** Set Status to `Deferred` and record the disposition wording verbatim from the triage sheet.
4. **Widened an existing bug?** Add to §4 rather than minting a new ID — and say what a too-narrow fix would miss.
5. **Writing in Jira?** NEW-nn goes in as plain text. Link only the real `KS-nnnn`.

### Source documents

| Document | Role |
|---|---|
| `Test Result/KS-1083 Cursor Result.md` | Master triage table — every finding with severity, reproducibility, disposition |
| `Test Result/KS-1083 Consolidated report.md` | NEW-nn → ticket mapping (12-row bug inventory) |
| `Test Result/KS-1066 All Findings and Bugs Report.md` | Cycle-scoped compilation, §4 deferred set, §6 post-cycle re-verification, §7 revised recommendation |
| `Test Result/KS-10xx {Claude,Cursor,Consolidated}.md` | Per-story raw evidence — where each NEW-nn originates. KS-1083 and KS-1084 have Cursor + Consolidated only, no Claude file |
| `Test Result/logs/` | 10 raw capture files (`KS-1072_special_chars.txt`, `KS-1073_baseline_slices_off.txt`, …). Confirmed present 2026-08-14 |
| `baseline/aloha-tool-inventory-2026-08-11.md` | Full tool + parameter schema capture; §4 documented-behaviour rules R1–R11 |
| `Test Guide/aloha_mcp_uat_plan.md` | Pre-cycle design — O1–O10, fixtures, severity rubric. **Contains no NEW-nn** |
| `Test Guide/aloha_mcp_uat_tickets.md` | Pre-cycle ticket drafts — AM-01…AM-15. **Contains no NEW-nn** |
