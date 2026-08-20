# KS-1084 Cursor Result — Evidence pack and QA verdict

> **Story:** [KS-1084](https://gendvn.atlassian.net/browse/KS-1084) · **Draft ID:** AM-15 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Clients:** Cursor IDE + Claude Code (native HTTP); Antigravity **excluded** from verdict  
> **Tester / QA Lead:** Bình Hà Khoa  
> **Cycle window:** 2026-08-05 … 2026-08-07  
> **Pack assembled:** 2026-08-07  
> **Verdict:** **FAIL**

---

## 1. Explicit verdict

| Field | Value |
|---|---|
| **Verdict** | **FAIL** |
| Primary drivers | (1) Smoke pass rate AM-05…AM-09 **below 80%**; (2) Multiple open **S2** defects on primary tools; (3) Story-level FAILs on KS-1073/1074/1077/1078/1079 |
| Not automatic S1-Fail | **O4 was not confirmed as S1 data exposure** — fail-closed NEW-15 (KS-1077). Automatic Fail clause for “S1 on O4” does **not** fire. |
| Usability note | Server is **partially usable** for filtered, well-parameterized calls — but plan §11.1 still classifies this cycle as **Fail** |

---

## 2. Evidence pack index

### 2.1 One result document per story

| Story | AM | Cursor | Claude | Consolidated | Story verdict |
|---|---|---|---|---|---|
| KS-1070 | AM-01 | Y | Y | Y | Pass with findings |
| KS-1071 | AM-02 | Y | Y | Y | Pass with findings |
| KS-1072 | AM-03 | Y | Y | Y | Pass with findings |
| KS-1073 | AM-04 | Y | Y | Y | **FAIL** |
| KS-1074 | AM-05 | Y | Y | Y | **FAIL** |
| KS-1075 | AM-06 | Y | Y | Y | Pass with findings |
| KS-1076 | AM-07 | Y | Y | Y | Pass with findings |
| KS-1077 | AM-08 | Y | Y | Y | **FAIL** (O4 functional; not S1 leak) |
| KS-1078 | AM-09 | Y | Y | Y | **FAIL** |
| KS-1079 | AM-10 | Y | Y | Y | **FAIL** |
| KS-1080 | AM-11 | Y | Y | Y | Pass with findings |
| KS-1081 | AM-12 | Y | Y | Y | Pass with findings |
| KS-1082 | AM-13 | Y | Y | Y | Pass with findings |
| KS-1083 | AM-14 | Y | — | Y | **PASS** (triage) |
| KS-1084 | AM-15 | Y (this) | — | Y | **FAIL** (cycle verdict) |

Path root: `Aloha Server/Test Result/`

### 2.2 Supporting logs (redacted)

Under `Aloha Server/Test Result/logs/` — large payloads and probe outputs (fund names/IDs retained per §7.3; **no JWTs, bearer tokens, account numbers, or foreign emails** attached to Jira).

### 2.3 Log metadata compliance

Story Result documents carry test ID, UTC timestamps, tester, client+version, inputs, expected vs actual, Pass/Fail. Full raw MCP transcripts for every micro-step are not always inlined (large payloads offloaded to disk) — structural evidence + consolidated reports are the system of record.

### 2.4 Redaction (§7.3)

| Class | Status |
|---|---|
| JWTs / bearer tokens | Not published in Result docs or Jira bugs |
| Account numbers / investor names | Not used |
| Individual emails | Avoided in Jira; ratings evidence used fail-closed empties |
| Fund names / fund IDs | Retained (allowed) |

---

## 3. Exit criteria (§11) — line by line

| # | Criterion | Met? | Evidence |
|---|---|---|---|
| 1 | ≥2 MCP clients OAuth, no token paste (AM-01) | **Yes** | KS-1070 Cursor + Claude Consolidated |
| 2 | All 34 tools inventoried as drift baseline (AM-02) | **Yes** | KS-1071 + `baseline/aloha-tool-inventory-2026-08-05.md` |
| 3 | Every tool smoke-tested or deferred (AM-05…AM-09) | **Yes** | Groups covered; `smpublic_main_v3` exercised → O10 fail (not deferred silently) |
| 4 | O1–O10 dispositioned | **Yes** | KS-1083 triage — all **confirmed** |
| 5 | Smoke pass rate ≥ 80% non-n/a cells (AM-05…AM-09) | **No** | See §4 — **~73%** cell-level; story-level 2/5 Pass-with-findings |
| 6 | Auth / transport / session verified (AM-11) | **Yes** | KS-1080 Pass with findings (O8/O9 owner disposition open) |
| 7 | Every failure has filed linked defect + severity (AM-14) | **Yes** | KS-1083 · bugs KS-1085…KS-1096 |
| 8 | Evidence pack assembled + redacted (AM-15) | **Yes** | This document |
| 9 | Verdict issued Pass / Pass with findings / Fail | **Yes** | **FAIL** |

**Cycle may close with a Fail verdict** — criteria 1–4, 6–9 met; criterion 5 not met (which itself forces Fail under §11.1).

---

## 4. Smoke pass rate (AM-05…AM-09)

Counted from consolidated **Final** cells in cross-client agreement tables (Pass vs Fail; Partials/NEW-9 messaging counted Fail when wrong; Blocked excluded from denominator where noted).

| Story | Approx P / (P+F) | Story status |
|---|---|---|
| KS-1074 returns | ~7 / 11 (~64%) | FAIL |
| KS-1075 CRBM | ~5 / 6 (~83%) | Pass w/ findings |
| KS-1076 fee/IR/liq | ~10 / 12 (~83%) | Pass w/ findings |
| KS-1077 ratings | Identity fail; detail blocked; several Pass | FAIL |
| KS-1078 datalake | ~8 / 12 (~67%) | FAIL |
| **Aggregate (approx)** | **~35 / 48 (~73%)** | **&lt; 80%** |

Story-level smoke “clean pass”: **0/5**; Pass-with-findings **2/5**; Fail **3/5**.

---

## 5. Verdict rationale (evidence-based)

1. **§11.1 Fail if smoke &lt; 80%** — aggregate ~73% (§4).  
2. **Primary tools wrong or unusable:** O1/O2/O3 (`fund_analyzer`), NEW-7 (intraday zeros), NEW-8 (drawdown scope), silent empties (fund returns / benchmarks), fee compose NEW-12/13 — all **S2**, filed.  
3. **Auth surface clean for unauth access** (KS-1080) — does **not** rescue smoke Fail.  
4. **O4 automatic Fail clause does not apply** — S1 cross-user leak **not** evidenced (KS-1077 NEW-15). O4 remains **S2** functional (KS-1094).  
5. **Stop-and-escalate §8:** no unauth success, no mutation, no credential leak. Infra stacks (NEW-16) reviewed → S2 KS-1095, not S1.

---

## 6. Prioritised remediation list (owners)

### P0 — Identity & trust
1. **[KS-1094](https://gendvn.atlassian.net/browse/KS-1094)** — Forward OAuth identity (O4); make ratings work; confirm `MCP_DEFAULT_USER_EMAIL` in all envs  
2. **[KS-1095](https://gendvn.atlassian.net/browse/KS-1095)** — Sanitize `describe_table` / `list_tables` errors (NEW-16)

### P1 — Wrong data / broken primary tools
3. **[KS-1085](https://gendvn.atlassian.net/browse/KS-1085)** — O1 disambiguation + O2 date scope + O3 analyzer payload  
4. **[KS-1086](https://gendvn.atlassian.net/browse/KS-1086)** — `search_term` must not override `fund_id`  
5. **[KS-1096](https://gendvn.atlassian.net/browse/KS-1096)** — Drawdown window (NEW-8)  
6. **[KS-1089](https://gendvn.atlassian.net/browse/KS-1089)** — Intraday non-zero / available (NEW-7)  
7. **[KS-1087](https://gendvn.atlassian.net/browse/KS-1087)** / **[KS-1090](https://gendvn.atlassian.net/browse/KS-1090)** — Silent empty → explicit not-found  

### P2 — Usability & caps
8. **[KS-1091](https://gendvn.atlassian.net/browse/KS-1091)** — Fee defaults compose (NEW-12/13)  
9. **[KS-1088](https://gendvn.atlassian.net/browse/KS-1088)** — Date validation (NEW-4)  
10. **[KS-1092](https://gendvn.atlassian.net/browse/KS-1092)** — Honest `truncated` (NEW-17)  
11. **[KS-1093](https://gendvn.atlassian.net/browse/KS-1093)** — Payload byte caps / require filters  

### P3 — Deferred S3/S4 (from KS-1083)
O5 aliases, O6 types, O7 dict-repr, O8/O9 owner Qs, O10 smpublic, NEW-6/9/10/14/18/19/20, catalog consolidation (KS-1082).

**No S1 items** in the list.

---

## 7. Safe-usage guidance (from AM-12 / KS-1081) — publish for the team

Until fixes land:

1. **Always pass `fund_id` / `fund_ids`** on CRBM, fee defaults, liquidity params, IR — omit = full dump (100KB–MB) or timeout.  
2. **Do not expect `fund_analyzer` slice flags to shrink payload** — base dashboard alone ~600 KB (O3). Prefer single-purpose tools.  
3. Prefer **`query_fund_manager` + columns** over wide `get_data`.  
4. Distrust **`truncated:false`** on datalake tools (NEW-17).  
5. Budget **≥90–120 s** client timeouts for all-funds CRBM-scale calls.  
6. Offload large results to disk; do not load multi-100 KB JSON into LLM context.  
7. For “funds managed by X”, prefer **`search_all_funds`** (has `manager_name`) over `Search_Funds`.  
8. Do not call **`fee_model`** without remapping defaults (NEW-12/13) or until KS-1091 fixed.  
9. Do not rely on **`intraday_fund_returns`** (all zeros).  
10. Ratings detail/list without identity will **fail closed** — not a data dump, but also not useful until O4 fixed.

---

## 8. Follow-up security cycle?

| Recommendation | **Yes — targeted security/authz cycle warranted** |
|---|---|
| Why | O4 identity forwarding broken; O9 advertises PKCE `plain` + registration/`none`; NEW-16 infra leakage; ratings `user` override param still needs two-account proof when identity works |
| Scope | Identity path end-to-end; ratings cross-user after O4 fix; O8/O9 owner disposition; stack sanitization verify; optional OpenSSL TLS 1.0/1.1 reject |
| Not required to re-run | Full 34-tool functional smoke (defer to remediation retest) |

---

## 9. Wider team adoption?

| Recommendation | **Not ready for wider team adoption** |
|---|---|
| Why | Cycle verdict **Fail**; smoke &lt; 80%; multiple S2 on analyzer/returns/drawdown/intraday/identity |
| Limited pilot? | **Yes, with guardrails** — experienced users only; enforce §7 safe-usage; no reliance on ratings scoping, intraday, or uncapped omit-filters |
| Re-entry | After P0+P1 bugs closed and AM-05…AM-09 smoke ≥ 80% on retest |

---

## 10. AC checklist (AM-15)

| AC | Result |
|---|---|
| One result doc per story | **Pass** (1083 Claude optional gap noted) |
| Log metadata / redaction | **Pass** (pack-level; §7.3) |
| Exit criteria §11 line by line | **Pass** (documented; #5 Fail) |
| Verdict explicit | **Pass** — **FAIL** |
| Rationale evidence-based | **Pass** |
| Prioritised remediation S1-first | **Pass** (no S1; P0–P3) |
| AM-12 safe-usage published | **Pass** (§7) |
| Security cycle recommendation | **Pass** (§8) |
| Adoption recommendation | **Pass** (§9) |
| Epic summary comment + transition | **Pass** (executed with this pack) |

**Story KS-1084: PASS (deliverable complete) · Cycle verdict: FAIL**
