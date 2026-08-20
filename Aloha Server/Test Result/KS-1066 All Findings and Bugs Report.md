# Aloha MCP QA Verification Cycle — All Findings & Bugs Report

> **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066) — Aloha MCP QA verification cycle for the Streamable HTTP endpoint
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · **Build:** `0.9.5`
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP). Antigravity excluded from ACs — self-reported `mcp-remote` transport, non-compliant with AC1.
> **Cycle verdict:** **FAIL**
> **Compiled:** 2026-08-11, by reading all 27 live Jira issues under the epic (15 stories + 12 bugs) directly from `gendvn.atlassian.net`
> **Epic status:** Development Complete (QA closed; remediation owned by engineering)
> **Live re-verification:** 2026-08-11 18:38–18:40 and 2026-08-12 04:07–04:11 UTC — build **unchanged** across both (`0.9.5`, uptime 18.4 d → 18.8 d, no restart). **Five** candidate findings not in the 12 filed bugs, plus a confirmed re-reproduction of KS-1088. See **§6** and **§7**.

---

> **Tracking index:** this report is **cycle-scoped** — a point-in-time compilation of KS-1066. For the living, cross-cycle index of every finding ID (`O1`–`O10`, `NEW-1`–`NEW-25`, their severities, tickets and statuses), see **`Aloha Server/Findings Register.md`**. Add new findings there, not here.

---

## Severity rubric (reference)

Severity is **not a native Jira field** in this project — it's a judgment call applied consistently per the cycle's QA plan, tracked via labels (`S2` etc. on the bug tickets) and this report's own analysis. Source: `Aloha Server/Test Guide/aloha_mcp_uat_plan.md` §7.4.

| Severity | Definition | Example from this cycle |
|---|---|---|
| **S1 Critical** | Data exposed to the wrong user, auth bypassable, or data mutated unexpectedly | O4 — *if* it had leaked cross-user data (it didn't; fails closed instead) |
| **S2 High** | A primary tool returns wrong data, or is unusable in normal conditions | O2, O3, and all 12 filed bugs |
| **S3 Medium** | Tool works but behaviour is wrong, misleading, or forces workarounds | O1, O5, O7 |
| **S4 Low** | Cosmetic, documentation, or naming inconsistency | O6, O10 |

An **S1 confirmed** is an automatic cycle Fail regardless of every other result (plan §11.1) — that clause is why O4's fail-closed behavior mattered so much during triage: had ratings returned a *different* real user's data instead of an empty result, this would have been S1 and the cycle verdict would carry that label explicitly rather than "FAIL on smoke-rate alone."

**Where "Medium"/"Low" appear elsewhere in this report** (§3, §4) without an S-number, that's this report's own descriptive judgment for items that were never run through formal S1–S4 triage in [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) — they're lower-severity findings that got folded into recommendations rather than filed as rated bugs.

---

## 1. Executive summary

| # | Exit criterion (plan §11) | Result |
|---|---|---|
| 1 | ≥2 MCP clients connected via OAuth, no token paste | **Met** |
| 2 | All 34 tools inventoried, classified, drift baseline stored | **Met** |
| 3 | Every tool smoke-tested or explicitly deferred | **Met** |
| 4 | O1–O10 all dispositioned | **Met** — all ten **confirmed** (none by-design / not-reproducible) |
| 5 | Smoke pass rate ≥ 80% | **Not met — ≈73%** ← forces the Fail verdict |
| 6 | Auth, transport, session verified | **Met** |
| 7 | Every failure has a filed, severity-rated defect | **Met** |
| 8 | Evidence pack assembled and redacted | **Met** |
| 9 | Verdict issued | **Met — FAIL** |

**No S1 confirmed.** O4 (identity forwarding) is the closest candidate but fails **closed** (empty result + explicit "no identity" message) rather than leaking one user's data to another — the automatic S1 clause in plan §11.1 does not fire.

**Adoption recommendation** (from the epic-level verdict, [KS-1066](https://gendvn.atlassian.net/browse/KS-1066) comment):
- Wider team adoption: **No**
- Limited pilot: **Yes**, only with the [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) safe-usage guardrails (always pass `fund_id`/`fund_ids`, don't expect slice flags to shrink `fund_analyzer`, budget 90–120s timeouts on all-funds CRBM calls)
- Follow-up security cycle: **Yes** — identity forwarding ([KS-1094](https://gendvn.atlassian.net/browse/KS-1094)), ratings re-test after O4 fix, O8/O9 auth hardening, stack-trace sanitization re-verify

**Remediation priority** (as filed under the epic):

| Priority | Bugs |
|---|---|
| **P0** | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) (O4 identity), [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) (stack-trace leak) |
| **P1** | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) (O1/O2/O3 fund_analyzer), [KS-1086](https://gendvn.atlassian.net/browse/KS-1086), [KS-1096](https://gendvn.atlassian.net/browse/KS-1096), [KS-1089](https://gendvn.atlassian.net/browse/KS-1089), [KS-1087](https://gendvn.atlassian.net/browse/KS-1087), [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) |
| **P2** | [KS-1091](https://gendvn.atlassian.net/browse/KS-1091), [KS-1088](https://gendvn.atlassian.net/browse/KS-1088), [KS-1092](https://gendvn.atlassian.net/browse/KS-1092), [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) |
| **P3** | Deferred S3/S4 items per [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) triage sheet (§4 below) |

---

## 2. Bugs filed — 12 total, all S2 High (1 pre-existing at Medium priority)

| Key | Summary | Priority | Source story |
|---|---|---|---|
| [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) | `fund_analyzer` silently picks top hit on ambiguous `search_term` and crashes instead of returning disambiguation (O1+O2+O3) | Medium* | [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) / [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) |
| [KS-1086](https://gendvn.atlassian.net/browse/KS-1086) | `fund_analyzer` `search_term` overrides an explicit valid `fund_id` | High | [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) |
| [KS-1087](https://gendvn.atlassian.net/browse/KS-1087) | `get_fund_returns` returns silent empty success for invalid `fund_id` | High | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) |
| [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | `fund_analyzer` accepts malformed dates without validation | High | [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) |
| [KS-1089](https://gendvn.atlassian.net/browse/KS-1089) | `intraday_fund_returns` returns all zeros (non-functional) | High | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) |
| [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) | `get_benchmark_history` silent empty when a name is used instead of `bbg_id` | High | [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) |
| [KS-1091](https://gendvn.atlassian.net/browse/KS-1091) | `get_fee_model_defaults` fields do not compose into `fee_model` | High | [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) |
| [KS-1092](https://gendvn.atlassian.net/browse/KS-1092) | `get_data` `truncated` flag false when the 1000-row cap is hit | High | [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) / [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) |
| [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) | No payload byte cap on omit-filter and wide `get_data` responses | High | [KS-1081](https://gendvn.atlassian.net/browse/KS-1081), extends O3 |
| [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | OAuth identity not forwarded — ratings fail-closed (O4/NEW-15) | High | [KS-1070](https://gendvn.atlassian.net/browse/KS-1070)/[KS-1071](https://gendvn.atlassian.net/browse/KS-1071)/[KS-1077](https://gendvn.atlassian.net/browse/KS-1077)/[KS-1080](https://gendvn.atlassian.net/browse/KS-1080) |
| [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) | `describe_table` invalid input leaks Trino/MongoDB stack traces | High | [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) |
| [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | `calculate_drawdown` headline metrics ignore the requested date window | High | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) |

\*KS-1085 was filed as the pre-existing/original bug before the S2 labeling convention was applied to the rest — it carries no `S2` label and shows Jira priority "Medium" rather than "High" like its 11 siblings. Worth a quick priority/label align pass, flagged but not changed here.

> **Which `NEW-nn` does each bug correspond to?** See **§4.1** for the complete finding-ID → ticket mapping, and **§4.2** for the three bugs filed without a finding ID.

### 2.1 Detail — KS-1085 (O1 + O2 + O3, pre-existing)

**Finding:** `fund_analyzer` silently picks the top Elasticsearch hit on an ambiguous `search_term` (e.g. `"Citadel Investment"` → 4 candidates) instead of disambiguating, then crashes if that candidate lacks Solovis data. Bundled with two related defects in the same tool.

**Reproduction:**
```json
{"search_term": "Citadel Investment", "start_date": "2025-01-01"}
```

**Actual:** Silently resolves to `fund_id='986'` (or `'4874'` — the top ES hit is **not stable across days**) from candidates `['986','4874','104766','200055']`, then crashes: `"No Solovis fund details for resolved fund_id='986'"`.

**Also bundled:**
- **O2 — date scoping:** `start_date` does not scope the returned series (`2025-08-01` request still returns data from 1995); inverted date ranges (`start > end`) are silently accepted.
- **O3 — oversized payload:** all 7 optional `include_*` slices disabled still returns **~585–638 KB / ~19–20K lines**, no server-side cap.

**Expected:** A disambiguation list when multiple candidates match; strict date-window enforcement with validation; a server-side response cap.

**Evidence:** `Aloha Server/Test Result/KS-1073 Consolidated report.md`, `KS-1081 Consolidated report.md`. Confirmed independently on Cursor and Claude Code against build 0.9.5.

### 2.2 Detail — KS-1086

**Finding:** `search_term` silently overrides a valid, explicitly-supplied `fund_id`.
**Repro:** `{"fund_id":"500","search_term":"Citadel Investment","start_date":"2025-01-01"}` → `search_term` wins; the correct `fund_id=500` is discarded, may resolve to ALB 986 or error.
**Expected:** Explicit `fund_id` should take precedence, or dual params should be rejected with a conflict error.

### 2.3 Detail — KS-1087

**Finding:** `get_fund_returns` returns a silent empty success on an invalid `fund_id`.
**Repro:** `{"fund_ids":["99999999"],"start_date":"2024-01-01","end_date":"2024-12-31"}` → `status:success`, `row_count:0`, empty `returns` — no not-found signal at all.
**Expected:** Explicit not-found/invalid-id error or a structured warning.

### 2.4 Detail — KS-1088

**Finding:** `fund_analyzer` accepts malformed `start_date`/`end_date` (non-ISO, impossible calendar days) without rejecting them — the tool proceeds with an undefined/wrong window instead of erroring.
**Expected:** A clear validation error naming the invalid date field.

### 2.5 Detail — KS-1089

**Finding:** `intraday_fund_returns` (the renamed `fund_returns`) is non-functional — ~695 funds return `real_return=0.0` in both direct and indirect modes tested.
**Expected:** Real values, or a clear "unavailable" error instead of fabricated zeros.

### 2.6 Detail — KS-1090

**Finding:** `get_benchmark_history` returns a silent empty success when a human-readable name (e.g. "MSCI World") is passed where a `bbg_id` is expected.
**Actual:** `status:success`, 0 rows, empty returns.
**Expected:** A clear error stating a Bloomberg id is required / the name wasn't resolved.

### 2.7 Detail — KS-1091

**Finding:** `get_fee_model_defaults` output cannot be forwarded directly into `fee_model` — 5 of 15 fields are renamed (`mgt_fee`↔`management_fee`, `hwm_status`↔`high_watermark`, `crystialized_paid`↔`crystallization` — note the typo — etc.), so composing the two tools fails without manual remapping. This makes `fee_model`'s 15 required parameters effectively un-assemblable by an agent working unaided.
**Expected:** Identical field names between the two tools, or `fee_model` should accept the defaults payload directly / offer a `use_defaults` flag.

### 2.8 Detail — KS-1092

**Finding:** `get_data` has a real 1000-row cap, but `truncated:false` is returned even when `row_count == 1000` — an agent has no signal the result was cut off.
**Expected:** `truncated:true` whenever the cap is hit, or an explicit continuation token.

### 2.9 Detail — KS-1093

**Finding:** No byte-level cap exists on payload size when optional identifying filters are omitted, or on inherently wide tables. Extends O3 (fund_analyzer, filed as KS-1085) to the rest of the catalog.
**Examples observed:** `get_data` table `fund_manager` → ~2.28 MB; `get_fee_model_defaults` omit `fund_id` → ~556 KB; `get_fund_crbm` omit `fund_id` → ~371 KB.
**Expected:** Require identifying filters by default, and/or enforce byte/row caps with honest truncation signals.

### 2.10 Detail — KS-1094 (O4 + NEW-15)

**Finding:** OAuth identity never reaches the service. `get_user_info` reports `"No user email found in request headers"` despite a fully completed OAuth session, on both Cursor and Claude Code, reproduced 5+ times across a continuous server uptime. User-scoped ratings (`list_rating_details_by_user`) **fail closed** — empty result + explicit "No user identity" message — rather than leaking another account's data, which is why this is S2 and not the automatic-Fail S1 the plan's severity rubric describes for a confirmed shared-identity leak.
**Expected:** Authenticated user email should reach the service; scoped ratings should return that user's own data.
**Owners:** plan §9 Q3.

### 2.11 Detail — KS-1095 (NEW-16)

**Finding:** `describe_table` with an invalid `db_name`/`table_name` leaks a full Trino/Java stack trace plus MongoDB catalog-engine prefixes (`mongodb.<schema>.<table>`). Cursor additionally observed an outer `status:success` wrapping the error. Related: `list_tables` raw `unhashable type: 'dict'` Python error.
**Escalation note:** reviewed against plan §8's infra-detail trigger — no credentials observed, so filed as S2 with an owner-escalation note rather than an automatic S1 stop.
**Expected:** Sanitized, agent-consumable error with no stack traces or catalog-engine internals.

### 2.12 Detail — KS-1096 (NEW-8)

**Finding:** `calculate_drawdown` headline metrics (max drawdown, related dates) reference dates **outside** the caller's requested window — e.g. a 2007–2008 drawdown returned for a 2024–2025 request.
**Expected:** All headline metrics scoped to the requested period, or explicitly labelled lifetime vs. windowed.

---

## 3. Pre-cycle observations (O1–O10) — final disposition

All ten are **confirmed** defects; none dispositioned as by-design or not-reproducible.

| Obs | Description | Severity | Disposition | Bug / tracking |
|---|---|---|---|---|
| **O1** | `fund_analyzer` silently resolves ambiguous `search_term` to top ES hit, no disambiguation | S2 | Confirmed | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) |
| **O2** | `fund_analyzer` ignores `start_date` for series scoping; inverted ranges accepted silently | S2 | Confirmed | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) |
| **O3** | `fund_analyzer` all-slices-off payload ~600KB+, no server cap | S2 | Confirmed | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) (single-tool) + [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) (catalog-wide) |
| **O4** | `get_user_info` no email despite OAuth; ratings non-functional | S2 (fail-closed, not S1) | Confirmed | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) |
| **O5** | Three duplicate tool alias pairs (`search_funds`≡`Search_Funds`, `rating_detail`≡`get_rating_details`, `rating_summary`≡`get_rating_summary`) | Medium (catalog debt) | Confirmed, **not separately filed** | Recommendation in [KS-1082](https://gendvn.atlassian.net/browse/KS-1082)/[KS-1083](https://gendvn.atlassian.net/browse/KS-1083): hide aliases from the tool list |
| **O6** | `fund_id` type inconsistent — string in `Search_Funds`/`search_funds`, number in `search_all_funds`/`search_albourne_funds` | Low/Medium | Confirmed, **not separately filed** | Tracked in [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) findings |
| **O7** | Failure detail returned as Python `dict` repr (single-quoted), not JSON | S3 | Confirmed — still present, `fund_analyzer` only | Tracked in [KS-1079](https://gendvn.atlassian.net/browse/KS-1079); recommendation: convert to JSON |
| **O8** | Legacy `/aloha/sse` still answers 401 (not 404) — route still live | Low | Reproduced | Owner disposition open — plan §9 Q7, tracked via [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) |
| **O9** | PKCE `plain` advertised alongside `S256`; `/register` open with `token_endpoint_auth_methods_supported: ["none"]` | Medium (security hardening) | Reproduced (did not POST register) | Owner disposition open — plan §9 Q6, tracked via [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) |
| **O10** | `smpublic_main_v3` exposes zero parameters but requires a Flask body via HTTP proxy — non-functional over MCP | Confirmed Fail | Confirmed | Tracked in [KS-1078](https://gendvn.atlassian.net/browse/KS-1078); recommendation: remove or repair |

---

## 4. Other tracked findings (not filed as standalone bugs)

Process, usability, and lower-severity items surfaced during the cycle and rolled into triage rather than filed individually — this is the deferred S3/S4 set referenced as **P3** in §1.

| ID | Finding | Story | Severity |
|---|---|---|---|
| **NEW-1** | Antigravity's KS-1070 Jira PASS self-reported `mcp-remote` transport, violating AC1's native-HTTP requirement (risk of silent SSE fallback) | [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) | Medium (process/evidence) |
| **AC5-gap** | No client has produced a timed stop→start→no-reauth restart log; all evidence is informal/cross-session pickup | [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) | Low (process, not product) |
| **NEW-6** | `get_top_funds_by_returns`/bottom: supplying both `period_months` and explicit dates silently discards the dates | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) | Medium |
| **NEW-9** | Inverted-date error quality is inconsistent/misleading, recurs across 3+ tools | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074)/[KS-1075](https://gendvn.atlassian.net/browse/KS-1075)/[KS-1079](https://gendvn.atlassian.net/browse/KS-1079) | Medium |
| **NEW-14** | Asset-class labeling mixes `asset_class_0` vs `asset_class_1` under generic keys | [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) | Low |
| **NEW-18** | Omit-`get_fund_crbm` calls take ~86–90s each (latency, not correctness) | [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) | Low (performance) |
| **NEW-19** | Client divergence: Cursor times out (`MCP error -32001`) on omit-`get_liquidity_parameters` where Claude Code succeeds | [KS-1081](https://gendvn.atlassian.net/browse/KS-1081)/[KS-1082](https://gendvn.atlassian.net/browse/KS-1082) | Medium |
| **NEW-20** | 4-way fund-search tool overlap; default search output omits `manager_name` | [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) | Low (usability) |

### 4.1 Complete finding-ID → ticket mapping

§2 lists the filed bugs and §4 the deferred set; neither shows the whole `NEW-nn` series in one place. This is the complete index, mirrored from **`Aloha Server/Findings Register.md`** — that file is canonical and cross-cycle, this table is the KS-1066 snapshot.

> ⚠️ **`NEW-nn` are internal QA-cycle finding IDs, not Jira keys.** There is no `NEW` project (nor an `AM` project) in this Jira instance, so `https://gendvn.atlassian.net/browse/NEW-18` and `/browse/AM-12` return 404. Always write the finding ID as plain text and link only the real `KS-nnnn`. See §4.3.

**Status:** `Filed` = has a Jira bug · `Deferred` = triaged S3/S4, consciously not filed (P3) · `Draft` = found post-cycle, not yet triaged

| ID | Finding | Tool(s) | Source | Sev | Ticket | Status |
|---|---|---|---|:--:|---|---|
| **NEW-1** | Antigravity self-reported `mcp-remote`, violating AC1 native-HTTP | *(process)* | KS-1070 | S4 | — | Deferred |
| **NEW-2** | Antigravity's Jira inventory used "33 files / 34 entries" wording and an off-by-one "23 vs 24" label — headline 34 agrees, but not a peer schema-diff | *(process)* | KS-1071 | Low | — | Deferred |
| **NEW-3** | **Never written — slot skipped.** Belongs to the KS-1072 ES special-character finding; see §4.3 | `Search_Funds` | KS-1072 | S3 | — | Deferred (tracked unnumbered) |
| **NEW-4** | Malformed dates accepted without validation | `fund_analyzer` | KS-1073 | S2 | [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | **Filed** |
| **NEW-5** | `search_term` overrides explicit valid `fund_id` | `fund_analyzer` | KS-1073 | S2 | [KS-1086](https://gendvn.atlassian.net/browse/KS-1086) | **Filed** |
| **NEW-6** | Both `period_months` and dates → dates silently discarded | `get_top`/`get_bottom_funds_by_returns` | KS-1074 | S3 | — | Deferred |
| **NEW-7** | Returns all zeros — non-functional | `intraday_fund_returns` | KS-1074 | S2 | [KS-1089](https://gendvn.atlassian.net/browse/KS-1089) | **Filed** |
| **NEW-8** | Statistics computed over full history, not requested window | `calculate_drawdown` | KS-1074 | S2 | [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | **Filed** — widened, §6.2 |
| **NEW-9** | Inverted-date error quality inconsistent across 3+ tools | multiple | KS-1074/75/79 | S3 | — | Deferred |
| **NEW-10** | Date `pattern` constraint applied inconsistently in schema | multiple | KS-1074 | S3 | — | Deferred — **root cause of KS-1088**, §6.2 |
| **NEW-11** | Name-as-`bbg_id` → silent empty success | `get_benchmark_history` | KS-1075 | S2 | [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) | **Filed** |
| **NEW-12 / NEW-13** | 5 of 15 fields renamed — defaults do not compose | `get_fee_model_defaults` → `fee_model` | KS-1076 | S2 | [KS-1091](https://gendvn.atlassian.net/browse/KS-1091) | **Filed** |
| **NEW-14** | `asset_class_0` vs `_1` under generic key names | multiple | KS-1076 | S3 | — | Deferred |
| **NEW-15** | User-scoped ratings fail closed — no identity reaches service | `list_rating_details_by_user` | KS-1077 | S2 | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | **Filed** (merged with O4) |
| **NEW-16** | Trino/Java stack + MongoDB catalog prefixes leaked | `describe_table` | KS-1078 | S2 | [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) | **Filed** |
| **NEW-17** | `truncated: false` when the 1000-row cap is hit | `get_data` | KS-1078/81 | S2 | [KS-1092](https://gendvn.atlassian.net/browse/KS-1092) | **Filed** |
| **NEW-18** | Omit-filter calls take ~86–90 s | `get_fund_crbm` | KS-1081 | S3 | — | Deferred — *"document timeouts"* |
| **NEW-19** | Cursor `MCP error -32001` where Claude Code succeeds | `get_liquidity_parameters` | KS-1081 | S3 | — | Deferred — *"align timeouts"* |
| **NEW-20** | Stripped search tools omit `manager_name` | `Search_Funds`, `search_funds` | KS-1082 | S3 | — | Deferred |
| **NEW-21** | Cumulative return returned in `annualized_return` for windows < 12 months | `calculate_annualized_returns` | post-cycle | S3 | — | **Draft** (§6.2) |
| **NEW-22** | Multi-name + `limit` silently starves one search phrase | `search_crbm_index` | post-cycle | S2 | — | **Draft** (§6.2) |
| **NEW-23** | Raw generated SQL echoed in the success payload | `query_fund_manager` | post-cycle | S3 | — | **Draft** (§6.2) |
| **NEW-24** | `truncated` signal has three behaviours across three tools | catalog-wide | post-cycle | S3 | — | **Draft** (§6.2) |
| **NEW-25** | Matches `fund_id` as well as fund name, undocumented | `Search_Funds` | post-cycle | S3 | — | **Draft** (§6.2) |

**Totals:** 25 slots, **24 issued** (only NEW-3 unused) · **10 Filed** · **9 Deferred** · **5 Draft**

### 4.2 Filed bugs with no finding ID

Three of the 12 bugs in §2 were filed straight from triage without a `NEW-nn`. Listed so the mapping in §4.1 is not mistaken for a complete index of the cycle's defects — the [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) triage sheet is.

| Ticket | Finding |
|---|---|
| [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) | O1 + O2 + O3 `fund_analyzer` bundle (pre-existing bug, predates the NEW-nn series) |
| [KS-1087](https://gendvn.atlassian.net/browse/KS-1087) | Silent empty success on invalid `fund_id` — `get_fund_returns` |
| [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) | No payload byte cap on omit-filter and wide responses |

Six further triaged findings carry no ID and were deferred: Elasticsearch special-character raw body (KS-1072), `list_tables` unhashable-dict error (KS-1078), error catalogue below the 80% bar (KS-1079), `fee_model` 15-param discoverability, `fund_analyzer.start_date` has no default, and `query_fund_manager` incomplete manager search (all KS-1082). Plus the `AC5-gap` process item on KS-1070.

### 4.3 Numbering defects and the dead-link sweep

Known problems in this ID series, recorded so they are not re-derived:

1. **Only NEW-3 was never issued — NEW-2 exists.** Traced 2026-08-12; see the box below.
2. **NEW-1 was double-assigned** — `KS-1070 Consolidated report.md` uses it for the Antigravity `mcp-remote` transport issue; `KS-1072` independently uses **NEW-1** for the Elasticsearch special-character raw-body leak. Two findings, one ID. §4.1 takes the KS-1070 reading, matching the KS-1083 triage sheet.
3. **NEW-19 was briefly double-assigned** — `KS-1082 Claude Result.md` used it for the `manager_name` finding; the consolidated report remapped that to NEW-20 and reserved NEW-19 for the Cursor liquidity timeout. Repo searches for NEW-19 return both.
4. **NEW-12 and NEW-13 are one finding** raised independently by two clients, never merged.

> **Why the numbering broke.** `NEW-nn` was never a single global counter. KS-1070 and KS-1071 used a **running counter** (NEW-1, NEW-2). KS-1072 **reset it** — Claude labelled its finding `NEW-1` again, Cursor used a separate prefixed scheme (`NEW-S1`). From KS-1073 the consolidators used Cursor-prefixed IDs mapped onto a **resumed global series** (`NEW-P1`→NEW-5, `NEW-D2`→NEW-4), starting at NEW-4 on the assumption that 1–3 were consumed. NEW-1 and NEW-2 were; **NEW-3 was not** — it is the slot the KS-1072 finding would have taken had that story not reset the counter.
>
> **NEW-2 is real and is Antigravity-related:** *"Antigravity Jira inventory used '33 files / 34 entries' wording and an off-by-one '23 vs 24' label — headline 34 still agrees, but not a peer schema-diff"* (KS-1071, Low/reporting). Its consequence: Antigravity was **not counted as a third schema-diff peer**, so the 34-tool / 0-write / 3-duplicate conclusion rests on Cursor ↔ Claude Code alone. It is absent from the KS-1083 triage sheet because triage covered product defects, not reporting-quality notes about another client's Jira comment — which is why it looked unissued.
>
> **NEW-3's finding survived; only its ID did not.** The KS-1072 Elasticsearch special-character behaviour was labelled `NEW-1` by Claude (raw ES body — index UUID, node id, dated index name) and `NEW-S1` by Cursor (`Search_Funds("!@#$%")` → 320 funds). Both landed in triage as the single unnumbered row **"ES special-char raw body · KS-1072 · S3 · Deferred"**. To make the series whole, assign NEW-3 to it retrospectively; otherwise leave NEW-3 permanently unused and note it on that row.

**Dead-link sweep, 2026-08-12 — complete.** A link-ify pass had turned finding IDs into Jira URLs across live tickets, producing URLs that 404. All 28 issues under the epic were scanned (descriptions + comments). **52 dead `browse/NEW-nn` and `browse/AM-nn` links removed from 20 locations:**

| Issue | Location | Removed | Which |
|---|---|:--:|---|
| [KS-1066](https://gendvn.atlassian.net/browse/KS-1066) | verdict comment | 6 | AM-05, AM-09, AM-12, AM-15, NEW-15, NEW-16 |
| [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) | consolidated comment | 6 | NEW-6, NEW-7 ×2, NEW-8 ×2, NEW-9 |
| [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) | consolidated comment | 5 | NEW-8, NEW-9 ×2, NEW-11 ×2 |
| [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) | consolidated comment | 2 | NEW-14 ×2 |
| [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) | consolidated comment | 3 | NEW-15 ×3 |
| [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) | consolidated comment | 3 | NEW-16 ×2, NEW-17 |
| [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) | consolidated comment | 2 | NEW-9, NEW-16 |
| [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) | consolidated comment | 1 | NEW-16 |
| [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) | consolidated comment | 3 | NEW-17, NEW-18, NEW-19 |
| [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) | consolidated comment | 4 | NEW-13, NEW-19 ×2, NEW-20 |
| [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) | triage comment | 7 | NEW-4, 5, 7, 8, 11, 16, 17 |
| [KS-1086](https://gendvn.atlassian.net/browse/KS-1086) | description | 1 | NEW-5 |
| [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | description | 1 | NEW-4 |
| [KS-1089](https://gendvn.atlassian.net/browse/KS-1089) | description | 1 | NEW-7 |
| [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) | description | 1 | NEW-11 |
| [KS-1091](https://gendvn.atlassian.net/browse/KS-1091) | description | 2 | NEW-12, NEW-13 |
| [KS-1092](https://gendvn.atlassian.net/browse/KS-1092) | description | 1 | NEW-17 |
| [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | description | 1 | NEW-15 |
| [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) | description | 1 | NEW-16 |
| [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | description | 1 | NEW-8 |

Where a finding has a real ticket the reference now points at it: NEW-7→[KS-1089](https://gendvn.atlassian.net/browse/KS-1089), NEW-8→[KS-1096](https://gendvn.atlassian.net/browse/KS-1096), NEW-11→[KS-1090](https://gendvn.atlassian.net/browse/KS-1090), NEW-12/13→[KS-1091](https://gendvn.atlassian.net/browse/KS-1091), NEW-15→[KS-1094](https://gendvn.atlassian.net/browse/KS-1094), NEW-16→[KS-1095](https://gendvn.atlassian.net/browse/KS-1095), NEW-17→[KS-1092](https://gendvn.atlassian.net/browse/KS-1092), AM-12→[KS-1081](https://gendvn.atlassian.net/browse/KS-1081), AM-05…AM-09→[KS-1074](https://gendvn.atlassian.net/browse/KS-1074)…[KS-1078](https://gendvn.atlassian.net/browse/KS-1078). Deferred findings with no ticket (NEW-6, NEW-9, NEW-14, NEW-18, NEW-19, NEW-20) are now plain text marked *deferred*.

**Clean, no change needed:** KS-1070, KS-1071, KS-1072, KS-1073, KS-1084, KS-1085, KS-1087, KS-1093.

**Deliberately left untouched — comments authored by another QA (Ha Khoa Dinh), ~7 dead links:** KS-1071 `20722` (AM-12), KS-1075 `20747` (AM-12 ×2), KS-1076 `20748` (AM-12), KS-1078 `20750` (NEW-16, NEW-17), KS-1081 `20753` (NEW-19). Editing another person's comment was judged out of scope; raise with them or authorise a second pass.

---

## 5. Story-by-story verdict summary

| Story | Title | Verdict |
|---|---|---|
| [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) | Connect two MCP clients and complete OAuth | Pass with findings |
| [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) | Capture tool inventory and audit catalog quality | Pass with findings |
| [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) | Verify fund search and resolution correctness | Pass with findings |
| [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) | Verify `fund_analyzer` parameter handling and payload scoping | **FAIL** |
| [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) | Smoke-test returns and performance tools | **FAIL** |
| [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) | Smoke-test benchmark and CRBM tools | Pass with findings |
| [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) | Smoke-test fee, IR and liquidity model tools | Pass with findings |
| [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) | Verify ratings tools and user-scoping behaviour | **FAIL (O4)** |
| [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) | Verify datalake introspection tools | **FAIL** |
| [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) | Verify error quality and LLM-oriented failure handling | **FAIL** |
| [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) | Verify authentication, TLS, transport and session behaviour | Pass with findings |
| [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) | Verify payload limits and client compatibility | Pass with findings |
| [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) | Assess agent usability and tool selection | Pass with findings |
| [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) | Triage findings and file defects | Pass |
| [KS-1084](https://gendvn.atlassian.net/browse/KS-1084) | Assemble evidence pack and issue QA verdict | Pass (deliverable) — **Cycle: FAIL** |

---

## 6. Post-cycle live re-verification — 2026-08-11 18:38–18:40 UTC

A short targeted probe was run against the live endpoint after the cycle closed, to (a) confirm whether remediation had shipped and (b) test the specific coverage gaps identified in the plan review. **Read-only calls only**, small date windows and tight row limits; the known payload bombs (`fund_analyzer` defaults, omit-filter `get_data` / `get_fund_crbm`) were deliberately not called.

**Client:** Claude Code (native HTTP, OAuth) · **Single client, single observation** — everything in §6.2 needs the standard two-client confirmation before filing.

### 6.1 State of the server

| Check | Result | Implication |
|---|---|---|
| `health_check` | `0.9.5`, healthy, uptime 1,592,230 s ≈ **18.4 days** | Same deployment the cycle tested (~2026-07-24 start). **No remediation shipped.** All 12 bugs presumed live |
| Tool surface | **34/34 names, exact match** to `baseline/aloha-tool-inventory-2026-08-06.md` — delta 0 | Baseline and plan §2.3 remain valid |
| `get_user_info` | `"No user email found in request headers"` | **KS-1094 (P0) still reproduces** |
| Fixture fund 500 | `Search_Funds` → exactly 1 result, source `solovis` | Plan §4 fixtures still valid |

### 6.2 Findings

| ID | Tool | Finding | Severity | Status |
|---|---|---|---|---|
| **KS-1096-A** | `calculate_drawdown` | **Amends existing bug.** Not only the headline dates — *every* statistic except `total_periods` is computed over the fund's full 348-month history while `total_periods` reports the in-window count | S2 | Rescope of [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) |
| **NEW-21** | `calculate_annualized_returns` | Windows **< 12 months** return the *cumulative* return in the `annualized_return` field; ≥ 12 months annualize correctly. Label and `calculation_method` do not distinguish the two | S3 | New — draft |
| **NEW-22** | `search_crbm_index` | Multi-name query with a `limit` silently starves one search phrase to zero results; no truncation flag in the response | S2 | New — draft |
| **NEW-23** | `query_fund_manager` | Raw generated SQL echoed in the **success** payload — contradicts the "no response contains raw SQL" AC in KS-1078 / KS-1079 | S3 | New — draft |
| **NEW-24** | catalog-wide | `truncated` completeness signal has three different behaviours across three tools | S3 | New — draft |
| **NEW-25** | `Search_Funds` (and the search family) | Matches against **`fund_id` as well as fund name**, contradicting its own parameter description; no `matched_on` field, no `limit`, no truncation flag | S3 | New — draft |
| **KS-1088-A** | `fund_analyzer` | **Confirms existing bug.** No date validation whatsoever on `start_date` / `end_date`; schema omits the `pattern` its `custom_*` siblings all carry | S2 | Re-verification of [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) |

**KS-1096-A evidence.** `calculate_drawdown(fund_id=500, start_date=2024-01-01, end_date=2024-06-30)` echoes the correct `analysis_period` and `total_periods: 6`, then reports `max_drawdown: -0.5495` dated `2008-12-31`, `number_down_months: 51` and `percentage_down_months: 0.14655…` — the denominator is 348 months, i.e. the fund's whole history. The window's actual worst month was −0.75%. The response is internally contradictory. **This matters for the fix:** KS-1096 as written ("headline metrics reference dates outside the window") could be closed by correcting only the date fields, leaving every statistic wrong.

**NEW-21 evidence.** Six monthly net returns for H1 2024, compounded independently: **+7.85993%**. `calculate_annualized_returns` for the identical window returned `annualized_return: 7.859931` — the cumulative figure to six significant figures. The same tool over 2023-01-01→2024-12-31 returned `14.96071`, which is a correct `√(1.32160) − 1` against the two-year cumulative. Sub-annual behaviour is likely *intentional and GIPS-conformant* (annualizing periods under one year is prohibited under GIPS); the defect is **disclosure**, not arithmetic. An agent consuming the field reports "7.86% annualized" where the annualized figure would be 16.34%.

**NEW-22 evidence.** `search_crbm_index(names=["S&P 500","MSCI World"], match_mode="any", limit=4)` returned four MSCI World rows and **zero S&P 500 rows**. Under OR semantics the limit is consumed by whichever phrase matches first; the other term is silently dropped. No truncation flag is present. This is the resolution entry point for every benchmark workflow.

**NEW-23 evidence.** `query_fund_manager(fields=["fund_id","fund_name"], extra_where="1=1", limit=2)` succeeded and returned `"sql": "SELECT fund_id, fund_name FROM fund_manager WHERE (1=1) LIMIT 2"`. The arbitrary predicate was accepted. Note the cycle recorded this tool as the **best-in-cycle** error-quality example (KS-1076) without flagging the SQL echo. May be deliberate transparency — needs an owner ruling against the stated AC.

**NEW-24 evidence.** `get_data` returns `truncated: false` when the hard 1000-row cap is hit ([KS-1092](https://gendvn.atlassian.net/browse/KS-1092)); `query_fund_manager` returns `truncated: true` under a user-supplied `limit: 2`; `search_crbm_index` emits no flag at all. An agent has no consistent way to know whether it received a complete result.

**NEW-25 evidence** *(2026-08-12 04:07 UTC)*. `Search_Funds("500")` returned **161 matches**, three of which contain no "500" anywhere in their name — `fund_id 500` (*Citadel Kensington Global Strategies Fund Ltd.*), `5007` (*Valar Fund VIII L.P.*) and `5009` (*DE Short Account*). They matched on **fund_id**, not fund name. The parameter is documented as *"Search term to match against fund names (required)"*, which is incomplete: numeric search terms produce a blended name-match + id-match result set with no `matched_on` field to distinguish them. `Search_Funds` also exposes **no `limit` parameter** (its schema has exactly one property) and emits **no truncation flag**, so a 161-row result arrives inline with no way to bound or paginate it. Compounds NEW-22 and NEW-24. Recommended fix: correct the description, and add a `matched_on` field per result.

**KS-1088-A evidence** *(2026-08-12 04:10 UTC)*. Re-verification of [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) — **confirmed, still reproduces**. `fund_analyzer` was called with `start_date: "not-a-date"` and then `start_date: "2026-13-45"`. Neither produced a date validation error; both passed the date layer untouched and the tool proceeded to fund resolution, failing there with the unrelated `"No Solovis fund details for resolved fund_id='986'"`. **Root cause candidate found in the schema:** `start_date` and `end_date` carry **no `pattern` constraint**, while `custom_start_date_1/2` and `custom_end_date_1/2` all carry `pattern: ^\d{4}-\d{2}-\d{2}$`. The only unvalidated date parameters are the two that matter most — one of them the tool's sole required parameter. This links KS-1088 to **NEW-10** (date pattern inconsistency, deferred S3) as one fix rather than two. Also re-reproduced O1/[KS-1085](https://gendvn.atlassian.net/browse/KS-1085) in passing: the ambiguous term resolved silently to `986` today, confirming the report's note that the top ES hit is not stable across days.

*Not measured:* the downstream behaviour of a malformed date against a **valid** fund — whether `fund_analyzer` succeeds against an undefined window or crashes. The probe deliberately used an ambiguous `search_term` so the response stayed small; the valid-fund path returns ~600 KB (O3 / [KS-1093](https://gendvn.atlassian.net/browse/KS-1093)). This is the one open question on KS-1088 and should be run with response-to-file capture.

### 6.3 What this says about coverage

Date-window scoping is **per-tool, not globally broken**. Of three date-taking tools probed: `get_fund_returns` scoped correctly (6 rows, all in window), `calculate_crbm_returns` scoped correctly (3 rows, all in window), `calculate_drawdown` did not. Which tools honour the window is not predictable from the catalog — it has to be asserted per tool.

Roughly 20 minutes of probing, aimed only at the gaps identified in the plan review, produced four candidate findings absent from both the 12 filed bugs and the 8 tracked findings in §4.

---

## 7. Revised recommendation for the re-test cycle

Supersedes the closing recommendations in §1 for the **next** cycle. The §1 adoption verdict (no wider adoption; limited pilot with KS-1081 guardrails) is unchanged and, given §6.1, still current.

**1. Date-window scoping becomes a mandatory matrix column — top priority.**
Applies to all ~12 date-taking tools, not just `fund_analyzer` (KS-1073) and the CRBM pair (KS-1075). Two separate assertions, because KS-1096-A fails a subtler test than "dates in range":
- (a) every returned date falls inside the requested window;
- (b) every **derived statistic** is computed only from in-window data.
Assertion (b) is what catches "51 down months in a 6-month window". Re-scope KS-1096 before it is picked up for fix.

**2. Add one story: cross-tool numeric consistency (≈1 day).**
Compare `fund_analyzer` slices against the equivalent standalone tools; compare `calculate_annualized_returns` against a manual compounding of `get_fund_returns`; compare `calculate_crbm_returns` against weights × `get_benchmark_history`. Add a **labelling clause**: any value whose convention changes with input (annualized vs cumulative, net vs gross, windowed vs lifetime) must say so in the response. NEW-21 passes a pure numeric check and still misleads — only the oracle comparison surfaces it.

**3. "Every optional parameter exercised at least once, or explicitly deferred with a reason."**
Roughly 50 of ~88 optional parameters are named nowhere in the plan or tickets. Seed the story with the **multi-value cases**, since both new parameter findings came from them: `names`, `fund_ids`, `benchmark_ids`, `asset_class_0/1`, and `extra_where` as a free fragment. Explicitly require multi-value input with a `limit` low enough to force truncation, plus confirmation that the response signals it.

**4. New — catalog-wide completeness-signal audit.**
Three tools, three behaviours (NEW-24). Cheap to check; currently covered only by KS-1092 in isolation. Require one documented semantic for `truncated` and a flag on every tool that can silently return a partial result.

**5. Script the 34-tool smoke pass.**
No automated or repeatable test asset exists — the cycle was entirely manual transcript capture, at ~14.5 person-days. The server is unchanged five days after cycle close, so the re-test is still ahead. A script carrying the window-scoping assertions from (1) and the oracle comparisons from (2) would have caught all four of §6.2 automatically.

**Also worth a cheap pass:** align KS-1085's priority/label with its 11 siblings (§2 footnote), and fix the literal `[AM-12](…/browse/AM-12)` draft links still present in live ticket descriptions (`aloha_mcp_uat_tickets.md` §mapping note).

---

## 8. Sources

All content in this report was compiled by reading the live Jira issues directly (cloud id `a5cab9f1-9fa7-40f1-9025-cd77c2fdcfb4`, project `KS`) — the 15 story consolidated-summary comments, the 12 bug ticket descriptions, and the epic's own final verdict comment. Underlying raw evidence (transcripts, JSON logs) lives in `Aloha Server/Test Result/*.md` per story, referenced from each Jira issue.

**§6 and §7 are the exception.** They come from a live read-only probe of `https://mcp.conceptia.com/aloha/mcp` on 2026-08-11 18:38–18:40 UTC (Claude Code, native HTTP, OAuth session) — not from Jira. The four §6.2 findings are **not yet filed as issues** and are single-client, single-observation pending two-client confirmation.
