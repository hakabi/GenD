# KS-1084 Consolidated Report — Evidence pack and QA verdict

> **Story:** [KS-1084](https://gendvn.atlassian.net/browse/KS-1084) · **Draft ID:** AM-15 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Sources:** [KS-1084 Cursor Result.md](KS-1084%20Cursor%20Result.md) (evidence pack) · Claude Result: not present (cycle already dual-client through KS-1082; triage KS-1083 Cursor)  
> **Consolidated:** 2026-08-07  
> **Cycle verdict:** **FAIL**  
> **AM-15 story status:** **PASS** (pack + verdict issued)

---

## Executive verdict

The Aloha MCP Streamable HTTP endpoint (build **0.9.5**) receives a cycle verdict of **FAIL**.

Drivers: smoke pass rate for AM-05…AM-09 **≈73% (&lt;80%)**; multiple open **S2** defects on primary tools (`fund_analyzer`, returns, drawdown, intraday, silent empties, fee compose, identity, stack leaks, payload caps). **No S1** confirmed — O4 is fail-closed functional (NEW-15), so the automatic “S1 on O4 → Fail” clause does **not** independently apply; Fail stands on smoke rate + defect severity profile.

The server remains **partially usable** under AM-12 safe-usage guardrails for a **limited pilot**, but is **not ready for wider team adoption**. A **targeted security/authz follow-up cycle** is warranted after identity (KS-1094) is fixed.

---

## Exit criteria snapshot

| # | Met? |
|---|---|
| 1 Dual-client OAuth | Yes |
| 2 Inventory 34 tools | Yes |
| 3 Smoke/defer all tools | Yes |
| 4 O1–O10 dispositioned | Yes |
| 5 Smoke ≥80% | **No (~73%)** |
| 6 Auth AM-11 | Yes (w/ findings) |
| 7 Defects filed AM-14 | Yes (KS-1085…1096) |
| 8 Evidence pack | Yes |
| 9 Verdict issued | Yes — **FAIL** |

---

## Remediation (owners) — top of queue

1. KS-1094 identity/O4  
2. KS-1095 stack sanitize  
3. KS-1085 O1/O2/O3  
4. KS-1086 fund_id precedence  
5. KS-1096 / KS-1089 drawdown + intraday  
6. KS-1087 / KS-1090 silent empty  
7. KS-1091 / KS-1092 / KS-1093 compose + truncated + caps  

Full list + safe-usage: Cursor Result §§6–7.

---

## Recommendations

| Topic | Decision |
|---|---|
| Wider adoption | **No** |
| Limited pilot | **Yes**, with §7 safe-usage only |
| Security follow-up cycle | **Yes** (identity, ratings cross-user after O4, O8/O9, stack verify) |
| Epic | Transitioned to **Development Complete** (QA cycle closed; remediation with engineering) |
