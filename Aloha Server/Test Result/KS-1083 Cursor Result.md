# KS-1083 Cursor Result — Triage all findings and file severity-rated defects

> **Story:** [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) · **Draft ID:** AM-14 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Sources:** Consolidated reports KS-1070…KS-1082 (Cursor + Claude)  
> **Endpoint / build:** `https://mcp.conceptia.com/aloha/mcp` · **0.9.5**  
> **Tester:** Bình Hà Khoa (Cursor triage)  
> **Executed:** 2026-08-07  
> **Status:** **PASS** — triage sheet complete; all S2 filed under epic; **no S1 confirmed**; O1–O10 dispositioned

---

## S1 stop-and-escalate (§8)

| Trigger | Result |
|---|---|
| Wrong-user data / shared ratings dump | **Not observed** — NEW-15 fail-closed |
| Unauthenticated tool success | **Not observed** — 401 on unauth |
| Mutations | **Not observed** — read-only catalog |
| Credentials / tokens in responses | **Not observed** |
| Infra detail in responses | **Observed** (NEW-16 stacks) — reviewed under §8; **filed as S2** (no credentials); owners notified via bug KS-1095 |

**No S1 bug filed.** O4 is **not** auto-S1 on current evidence.

---

## Severity rubric note (§7.4)

Cycle ratings follow §7.4 definitions. Where the plan’s *example* severity for a pre-cycle observation differs from live evidence (e.g. plan example lists O1 as S3), **live wrong-data / unusable-primary-tool evidence wins** → O1/O2/O3 treated as **S2** (also how KS-1085 was filed).

---

## Triage sheet

| Finding | Source story | Severity | Type | Reproducible | Bug key | Disposition |
|---|---|---|---|---|---|---|
| **O1** ambiguous silent resolve / no disambiguation | KS-1073 AM-04 | **S2** | Defect | Y (Cursor+Claude) | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) | **Confirmed defect** |
| **O2** start_date does not scope series | KS-1073 AM-04 | **S2** | Defect | Y | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) | **Confirmed defect** |
| **O3** ~600KB with slices off; no byte cap | KS-1073 / KS-1081 | **S2** | Defect | Y | [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) (+ [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) catalog-wide) | **Confirmed defect** |
| **O4** identity not in headers | KS-1070/71/77/80 | **S2** | Defect | Y (5+) | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | **Confirmed defect** (not S1 exposure) |
| **O5** duplicate aliases | KS-1071/72/82 | **S3** | Catalog | Y | — | **Confirmed defect** — **deferred** (self-doc; low agent confusion; backlog after S2) |
| **O6** fund_id string vs number | KS-1072 AM-03 | **S4** | Consistency | Y | — | **Confirmed defect** — **deferred** (cosmetic typing) |
| **O7** dict-repr in fund_analyzer errors | KS-1073/79 | **S3** | Defect | Y | — | **Confirmed defect** — **deferred** (isolated; sanitize with error work) |
| **O8** `/aloha/sse` still 401 | KS-1080 AM-11 | **S3** | Transport | Y | — | **Confirmed** — **deferred** pending owners Q7 (not 404) |
| **O9** PKCE `plain` + open register/`none` | KS-1080 AM-11 | **S3** | Auth config | Y (metadata) | — | **Confirmed** — **deferred** pending owners Q6 |
| **O10** smpublic_main_v3 non-functional MCP | KS-1078 AM-09 | **S3** | Defect | Y | — | **Confirmed defect** — **deferred** (remove/fix wrapper) |
| **NEW-5** search_term overrides fund_id | KS-1073 | **S2** | Defect | Y | [KS-1086](https://gendvn.atlassian.net/browse/KS-1086) | Confirmed |
| **NEW-4** malformed dates accepted | KS-1073 | **S2** | Defect | Y | [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | Confirmed |
| Silent empty `get_fund_returns` | KS-1074 | **S2** | Defect | Y | [KS-1087](https://gendvn.atlassian.net/browse/KS-1087) | Confirmed |
| **NEW-7** intraday all 0.0 | KS-1074 | **S2** | Defect | Y | [KS-1089](https://gendvn.atlassian.net/browse/KS-1089) | Confirmed |
| **NEW-8** drawdown outside window | KS-1074 | **S2** | Defect | Y | [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | Confirmed |
| **NEW-11** name-as-bbg silent empty | KS-1075 | **S2** | Defect | Y | [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) | Confirmed |
| **NEW-12/13** fee defaults ≠ fee_model fields | KS-1076 | **S2** | Defect | Y | [KS-1091](https://gendvn.atlassian.net/browse/KS-1091) | Confirmed |
| **NEW-15** ratings fail-closed (no identity) | KS-1077 | **S2** | Defect | Y | [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | Confirmed (merged w/ O4) |
| **NEW-16** Trino/Mongo stack leak | KS-1078 | **S2** | Defect | Y | [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) | Confirmed |
| **NEW-17** truncated:false at cap | KS-1078/81 | **S2** | Defect | Y | [KS-1092](https://gendvn.atlassian.net/browse/KS-1092) | Confirmed |
| Uncapped omit / wide get_data | KS-1081 | **S2** | Defect | Y | [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) | Confirmed |
| **NEW-6** period_months overrides dates | KS-1074 | **S3** | Defect | Y | — | Deferred — misleading precedence |
| **NEW-9** inverted-date → “no data” | KS-1074/75/79 | **S3** | Defect | Y | — | Deferred — error-quality cluster |
| **NEW-10** date pattern inconsistency | KS-1074 | **S3** | Schema | Y | — | Deferred |
| **NEW-14** asset_class_0 vs _1 labeling | KS-1076 | **S3** | Defect | Y | — | Deferred |
| ES special-char raw body | KS-1072 | **S3** | Defect | Y | — | Deferred |
| `list_tables` unhashable dict | KS-1078 | **S3** | Defect | Y | — | Deferred (pair with NEW-16 sanitize) |
| Error catalogue &lt;80% A+I | KS-1079 | **S3** | Meta | Y | — | Deferred — fixed by NEW-9/16/silent-empty work |
| **NEW-18** omit-CRBM ~90s latency | KS-1081 | **S3** | Perf | Y | — | Deferred — document timeouts |
| **NEW-19** Cursor timeout omit-liquidity | KS-1081 | **S3** | Client/server | Y (Cursor) | — | Deferred — align timeouts |
| **NEW-20** search output-shape / manager_name | KS-1082 | **S3** | Catalog | Y | — | Deferred — consolidation rec |
| fee_model 15-param discoverability | KS-1082 | **S3** | Catalog | Y | — | Deferred (overlap KS-1091) |
| fund_analyzer start_date no default | KS-1082 | **S3** | Usability | Y | — | Deferred |
| query_fund_manager incomplete manager search | KS-1082 | **S3** | Usability | Y | — | Deferred |
| Process: Antigravity mcp-remote / inventory wording | KS-1070/71 | **S4** | Process | n/a | — | Deferred / ignore Antigravity for verdict |

---

## O1–O10 disposition summary

| ID | Disposition |
|---|---|
| O1 | **Confirmed defect** → KS-1085 |
| O2 | **Confirmed defect** → KS-1085 |
| O3 | **Confirmed defect** → KS-1085 / KS-1093 |
| O4 | **Confirmed defect** (functional; not proven S1 leak) → KS-1094 |
| O5 | **Confirmed defect** (catalog) — deferred S3 |
| O6 | **Confirmed defect** — deferred S4 |
| O7 | **Confirmed defect** — deferred S3 |
| O8 | **Confirmed** (still present) — deferred pending owner disposition |
| O9 | **Confirmed** (metadata) — deferred pending owner disposition |
| O10 | **Confirmed defect** — deferred S3 |

None: **by design** or **not reproducible**.

---

## Filed S2 bugs (linked to epic KS-1066)

| Key | Title |
|---|---|
| KS-1085 | fund_analyzer ambiguous resolve + O2 + O3 (pre-existing; epic-linked this pass) |
| KS-1086 | search_term overrides fund_id |
| KS-1087 | get_fund_returns silent empty |
| KS-1088 | malformed dates |
| KS-1089 | intraday all zeros |
| KS-1090 | benchmark name-as-id silent empty |
| KS-1091 | fee defaults ↔ fee_model compose |
| KS-1092 | truncated flag false at 1000 |
| KS-1093 | no payload byte cap (omit / wide get_data) |
| KS-1094 | O4 / NEW-15 identity + ratings fail-closed |
| KS-1095 | describe_table stack leak |
| KS-1096 | drawdown date window ignore |

---

## AC — Cursor

| AC | Result |
|---|---|
| All findings AM-03…AM-13 in one sheet | **Pass** |
| Duplicates merged; source traced | **Pass** |
| Severity §7.4 + rationale | **Pass** |
| Every S1/S2 filed + epic-linked | **Pass** (0 S1; 12 S2 keys) |
| S3/S4 filed or deferred with reason | **Pass** (explicit deferrals) |
| O1–O10 dispositioned | **Pass** |
| Bugs carry repro / actual / expected / client / evidence | **Pass** |
| S1 escalated immediately | **n/a** — none confirmed |

**Overall: PASS.**
