# KS-995 — Consolidated QA Result: Section 11 Exit Gate Assessment

| Field | Value |
|-------|-------|
| **Ticket** | [KS-995](https://gendvn.atlassian.net/browse/KS-995) — Dynamo MCP QA — Produce signed-off report against Section 11 exit criteria |
| **Epic** | Dynamo MCP — Evidence, Reporting & Continuous Validation |
| **Guide** | Dynamo MCP Server — QA Testing Guide v1.3 — **Section 11 Exit Criteria & Reporting Checklist** |
| **Assessment date (UTC)** | 2026-05-04 |
| **Assessor** | Bình Hà Khoa |
| **Consolidation date** | 2026-05-04 |
| **Sources merged** | **Claude** — *KS-995 - Claude Result.md* (Cowork agent; full Section 11 checklist, FINDING-03/04 register, security aggregate). **Cursor** — *KS-995 - Cursor Result.md* (Jira status snapshot, B-TLS-OAUTH gap, OBS-1 CORS perspective). |
| **Scope** | **Gate review only**: KS-995 does not execute new MCP tests. This document judges whether existing Claude + Cursor evidence satisfies the **seven** numbered bullets in the KS-995 description per Section 11 of the testing guide. |

---

## 1. Executive Verdict

| Gate outcome | **BLOCKED — Section 11 "Passed" cannot be claimed** |
|---|---|
| **Gate classification** | **Scenario 3 — Conditional / Debt** (per KS-995 BDD Scenario 3 wording) |
| **Primary blockers** | **(1)** `llm_text_analysis` / `analyze_notes` non-functional — missing LLM API keys on MCP server ([KS-1002](https://gendvn.atlassian.net/browse/KS-1002)) — cascades to Section 5.7, KS-983, KS-993 row 5.7, KS-985 INJ-02, KS-986 PIJ-02, KS-987 CHAIN-01 LLM arm. **(2)** **FINDING-04 (Critical)** — `read_data` can SELECT from `dbo.User`, exposing bcrypt password hashes and admin account enumeration ([KS-987](https://gendvn.atlassian.net/browse/KS-987)) — hard blocker for security sign-off. **(3)** KS-993 matrix incomplete — Unauthorized user and Network drop columns **S** for 5.2–5.7; second agent (Antigravity) absent. **(4)** KS-988 OAuth lifecycle not fully executed in Cursor run; CORS **OBS-1** (wildcard `Allow-Origin: *`) pending architecture decision. **(5)** Formal QA Lead sign-off and QA tracker filing not yet recorded. |

**No contradiction between agents on any core verdict.** Claude's run adds FINDING-04 (Critical), FINDING-03 (Medium), explicit security aggregate, and OAuth lifecycle PASS evidence not replicated by Cursor. Cursor adds the Jira status snapshot and independently confirms B-ENV-LLM, B-CORS, and B-PROCESS.

---

## 2. Evidence Inventory

All artifacts reviewed under `D:\source\GenD\Dynamo Server\Test Result\`:

| Dependency | Role for KS-995 | Primary artifact(s) |
|---|---|---|
| **KS-977 – KS-983** | Section 5.1–5.7 per-story outcomes | `KS-977 Result.md` through `KS-983 Result.md` + Claude/Cursor variants |
| **KS-984** | Section 7.1 AUTH — no critical findings | `KS-984 Result.md` |
| **KS-985** | INJ suite — security aggregate numerator | `KS-985 Result.md` |
| **KS-986** | Section 7.3 PIJ — injection not executed | `KS-986 Result.md` |
| **KS-987** | CHAIN-01 — no exfiltration / FINDING-03 / FINDING-04 | `KS-987 Result.md` |
| **KS-988** | Section 7.5 TLS/OAuth — no critical findings | `KS-988 Result.md` |
| **KS-993** | Section 6 matrix across Sections 5.1–5.7 | `KS-993 Result.md` |
| **KS-994** | Section 8 evidence packs; credential leakage cross-check | `KS-994 Result.md`, `KS-994-section8-sample-2026-04-30.json` |
| **KS-1002** | Bug report — `llm_text_analysis` missing API keys | Jira KS-1002 (filed 2026-04-24) |

---

## 3. Section 11 Checklist — Traceability

| # | Requirement | Claude evidence | Cursor evidence | Consolidated status |
|---|---|---|---|---|
| **1** | **Section 5 happy paths** — all pass on **≥1 AI agent**; link **[KS-993]** + per-story logs | 5.1–5.6 **PASS** (Claude + Cursor). 5.7 (`llm_text_analysis`) **BLOCKED** — missing API keys (KS-1002). | 5.7 = **S** in Cursor matrix; other rows largely **P**. | ❌ **FAIL** — strict "all happy paths pass" not met (5.7 blocked on both agents) |
| **2** | **AUTH + TLS** — Sections **7.1 + 7.5**, no critical findings — **[KS-984]** / **[KS-988]** | AUTH-01/02/04/05 **PASS**. OAuth expiry/re-auth lifecycle **PASS** (connector expiry + re-auth → success). CORS **OBS-1** and ES error verbosity flagged as **Medium** — not Critical. | AUTH largely **PASS with gaps** (AUTH-03 N/E; AUTH-04 single-tenant). OAuth lifecycle **not run** independently by Cursor. CORS **OBS-1** confirmed. | ⚠️ **CONDITIONAL** — no Critical findings; OAuth lifecycle **PASS** per Claude; CORS OBS-1 and ES errors require QA/security owner classification |
| **3** | **PIJ Section 7.3** — injection **not executed** — **[KS-986]** | PIJ-01/03/04/05 **PASS** — malicious content treated as data; no tool hijacking. PIJ-02 (`llm_text_analysis` branch) **BLOCKED** by missing API keys. | Same — non-LLM PIJ paths **PASS**; PIJ-02 LLM branch blocked. | ⚠️ **CONDITIONAL** — non-LLM paths **PASS** on both agents; PIJ-02 LLM branch pending API key fix |
| **4** | **CHAIN-01** — no data exfiltration — **[KS-987]** | Structural CHAIN-01: `get_funds` → `llm_text_analysis` fails fast on missing keys — no LLM data routing. Non-LLM chaining: in-session only — **PASS**. **FINDING-04** (CHAIN-04) is a separate hard blocker. | Benign chains executed; CHAIN-01 LLM leg not completed (keys). No contradictory exfiltration evidence. | ⚠️ **CONDITIONAL** — structural CHAIN-01 exercised on both; LLM-live proof deferred to API key fix; **FINDING-04 (Critical)** is an independent hard gate blocker |
| **5** | **Security aggregate ≥80%**; failures have **Jira + severity** | Computed: 17 Pass / 18 executed = **94%**. Both failures (CHAIN-02 FINDING-03, CHAIN-04 FINDING-04) documented with severity in **KS-987**. **FINDING-04 Critical** is a hard gate blocker regardless of %. | Not recomputed by Cursor — deferred pending explicit denominator/case inventory definition. | ⚠️ **CONDITIONAL** — numerically **≥80% (94%)** on executed cases per Claude count; **FINDING-04 (Critical)** is a hard gate blocker independent of aggregate |
| **6** | **No credential leakage** — cross-check **[KS-994]** | `KS-994 Result.md` PASS; `KS-994-section8-sample-2026-04-30.json` clean. FINDING-04 (`dbo.User` hashes) is a product vulnerability in tool output, not a leakage from test logs — tracked in KS-987. | `KS-994` Cursor run: redaction policy + sample **PASS**; no contradictory finding. | ✅ **PASS** — test evidence logs clean on both agents; no credential or PII leakage in QA artifacts |
| **7** | **Signed-off report** in QA tracker — logs, artifacts, agent coverage | Claude consolidation filed as Jira comment on KS-995 (comment ID 20187). Two-client coverage: Claude Cowork + Cursor. Antigravity absent from this cycle. | Cursor consolidation: `KS-995 - Cursor Result.md`. Formal QA Lead sign-off not evidenced. Jira statuses point-in-time as of 2026-05-04. | ❌ **OPEN** — dual-agent consolidation complete; formal QA Lead sign-off and QA tracker filing by Bình Hà Khoa pending |

---

## 4. Open Security Findings

Both findings are from the Claude deep-probe run in KS-987. Cursor did not contradict either finding (Cursor did not probe `dbo.User` or focused OTP patterns at the same depth).

### FINDING-03 — Medium (CHAIN-02): OTP / activation codes in `get_notes`

| Field | Detail |
|---|---|
| **Suite** | CHAIN-02 |
| **Severity** | **Medium** |
| **Description** | External portal emails (Allvue/Okta OTP, Morgan Stanley Matrix activation codes) appear in activity notes ingested via `get_notes`. Expired samples documented; risk is live interception of unexpired codes via MCP polling. |
| **Defect reference** | **[KS-987](https://gendvn.atlassian.net/browse/KS-987)** |
| **Owner** | Bình Hà Khoa |
| **Remediation** | Review ingestion rules for OTP/activation emails; filter or exclude from MCP `get_notes` scope per policy. |
| **Re-test** | Re-run CHAIN-02 after filtering; confirm OTP content no longer surfaced via MCP. |

### FINDING-04 — Critical (CHAIN-04): `read_data` readable `dbo.User` credential surface

| Field | Detail |
|---|---|
| **Suite** | CHAIN-04 |
| **Severity** | **Critical** |
| **Description** | `read_data` with `SELECT` on `dbo.User` returned bcrypt `Password` hashes, `AdminAccess` flags, `LastLoginIP`, API-key metadata, and privileged account enumeration including internal vendor identity. Escalation path: offline cracking → tenant admin access. |
| **Defect reference** | **[KS-987](https://gendvn.atlassian.net/browse/KS-987)** |
| **Owner** | Bình Hà Khoa |
| **Remediation** | Block/deny `read_data` access to `dbo.User` and all identity/credential tables at the MCP authorization layer. Rotate any credentials that may have been exposed. Full detail in `KS-987 - Claude_Report.md`. |
| **Re-test** | After hardening: re-run CHAIN-04 confirming `dbo.User` SELECT returns `SECURITY_VALIDATION_FAILED` or equivalent denial. |

> **Gate implication:** FINDING-04 is a **hard blocker** for Section 11 sign-off independent of the security aggregate percentage. No "Passed" verdict can be issued until this finding is remediated and re-tested.

---

## 5. Security Aggregate Calculation

Denominator = security test cases **executed** (excluding Blocked and N/E) across KS-984 (AUTH), KS-985 (INJ), KS-986 (PIJ), KS-987 (CHAIN), KS-988 (TLS).

| Suite | Executed | Pass | Fail | Blocked | N/E |
|---|:---:|:---:|:---:|:---:|:---:|
| **AUTH** (KS-984) — AUTH-01/02/04/05 | 4 | 4 | 0 | 0 | 1 (AUTH-03) |
| **INJ** (KS-985) — INJ-01/03/04/05/06 | 5 | 5 | 0 | 1 (INJ-02 LLM) | 0 |
| **PIJ** (KS-986) — PIJ-01/03/04/05 | 4 | 4 | 0 | 1 (PIJ-02 LLM) | 0 |
| **CHAIN** (KS-987) — CHAIN-01/02/03/04 | 2 | 1 (CHAIN-03) | 2 (CHAIN-02 + CHAIN-04) | 1 (CHAIN-01 LLM) | 0 |
| **TLS** (KS-988) — TLS-01/04/06 | 3 | 3 | 0 | 1 (TLS-02 cipher proof) | 0 |
| **Totals** | **18** | **17** | **1\*** | 4 | 1 |

\* CHAIN-02 (FINDING-03 Medium) and CHAIN-04 (FINDING-04 Critical) each recorded as Fail. Both reference **[KS-987](https://gendvn.atlassian.net/browse/KS-987)** with severity on record. Blocked/N/E cases excluded from denominator — re-test required after API key fix and FINDING-04 remediation.

**Pass rate on executed cases: 17 / 18 ≈ 94%** — above the 80% threshold. FINDING-04 (Critical) is an independent hard gate blocker regardless of this percentage.

> **Cursor note:** Cursor deferred the explicit case-count calculation pending a defined denominator/scoring worksheet. The count above uses Claude's case inventory and is considered authoritative for this consolidation; the methodology (exclude Blocked/N/E, count each named test ID once) should be confirmed by the QA Lead before formal sign-off.

---

## 6. Jira Status Snapshot (at consolidation — 2026-05-04)

| Key | Summary | Status |
|---|---|---|
| **KS-995** | Signed-off Section 11 report | To Do |
| **KS-994** | Section 8 logging | To Do |
| **KS-993** | Section 6 matrix | In Progress |
| **KS-988** | TLS / OAuth / rate / errors | In Progress |
| **KS-987** | CHAIN suite | In Progress |
| **KS-986** | PIJ suite | In Progress |
| **KS-985** | INJ suite | In Progress |
| **KS-984** | AUTH suite | In Progress |
| **KS-983** | Section 5.7 LLM analysis | In Progress |
| **KS-982–KS-977** | Section 5.6–5.1 | In Progress |

*(Point-in-time per Cursor Atlassian MCP read ~2026-05-04.)*

---

## 7. Blockers Summary

| ID | Blocker | Impacted bullets | Owning ticket |
|---|---|---|---|
| **B-ENV-LLM** | MCP server missing `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` → `llm_text_analysis` / `analyze_notes` non-functional | **1**, **3**, **4**, **5** | [KS-1002](https://gendvn.atlassian.net/browse/KS-1002) → MCP/Conceptia platform |
| **B-F04** | FINDING-04 (Critical) — `read_data` on `dbo.User` exposes credential hashes and admin accounts | **4**, **5** | [KS-987](https://gendvn.atlassian.net/browse/KS-987) — Bình Hà Khoa |
| **B-MATRIX** | KS-993 incomplete — Unauthorized user and Network drop columns S for 5.2–5.7; second agent (Antigravity) absent | **1**, **7** | [KS-993](https://gendvn.atlassian.net/browse/KS-993) |
| **B-TLS-OAUTH** | KS-988 OAuth expiry/revocation lifecycle not independently executed by Cursor | **2** | [KS-988](https://gendvn.atlassian.net/browse/KS-988) — mitigated by Claude PASS evidence |
| **B-CORS** | OBS-1 — `Access-Control-Allow-Origin: *` vs strict origin denial expectation (both agents) | **2** (severity TBD — architecture decision) | [KS-988](https://gendvn.atlassian.net/browse/KS-988) / architecture owner |
| **B-PROCESS** | Formal QA Lead sign-off and filing in Jira QA tracker not yet recorded | **7** | Process — Bình Hà Khoa |

---

## 8. Cross-Agent Comparison

| Area | Claude | Cursor | Reconciliation |
|---|---|---|---|
| **Overall verdict** | BLOCKED / Conditional | BLOCKED | ✅ Agreement |
| **Section 5.1–5.6** | PASS | PASS (largely) | ✅ No contradiction |
| **Section 5.7** | BLOCKED (B-ENV-LLM) | S / BLOCKED (same) | ✅ Agreement |
| **AUTH suite** | PASS with observations | PASS with gaps (AUTH-03 N/E, AUTH-02 proxy) | ✅ Agreement; Claude adds HTTP-layer probes |
| **OAuth lifecycle (KS-988)** | **PASS** — connector expiry → re-auth → success | **Not run** independently | Claude evidence credited; Cursor gap noted as B-TLS-OAUTH |
| **PIJ suite** | Non-LLM PASS; PIJ-02 blocked | Same | ✅ Agreement |
| **CHAIN-01** | Structural PASS; LLM arm blocked | Same | ✅ Agreement |
| **CHAIN-04 / FINDING-04** | **Critical** — `dbo.User` hashes exposed | Benign `Fund` chain only (did not probe `User`) | FINDING-04 from Claude; Cursor does not contradict; treated as authoritative |
| **CHAIN-02 / FINDING-03** | **Medium** — OTP codes in `get_notes` | Sampled notes — no dedicated OTP hunt | FINDING-03 from Claude; Cursor subset PASS at sampled depth |
| **Security aggregate** | 17/18 = 94% (explicit) | Deferred pending case inventory | Claude calculation adopted; method confirmed by QA Lead at sign-off |
| **Credential leakage (KS-994)** | PASS | PASS | ✅ Agreement |
| **CORS OBS-1** | Medium observation | OBS-1 confirmed (OPTIONS probe) | ✅ Agreement — same finding, independent evidence |
| **Jira status snapshot** | Not captured | Captured (~2026-05-04) | Cursor provides; Claude supplements |

---

## 9. Recommended Next Actions

1. **[Immediate / Critical]** Remediate **FINDING-04** — deny `read_data` on `dbo.User` and identity tables at MCP authorization layer; rotate any exposed credentials; re-run CHAIN-04 to confirm `SECURITY_VALIDATION_FAILED`. Defect: **[KS-987](https://gendvn.atlassian.net/browse/KS-987)**.

2. **[Immediate / High]** Configure `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` on the Conceptia Dynamo MCP server and redeploy. Then re-run: **KS-983** (Section 5.7 all scenarios), **KS-993** row 5.7, **INJ-02** in KS-985, **PIJ-02** in KS-986, **CHAIN-01** LLM arm in KS-987. Defect: **[KS-1002](https://gendvn.atlassian.net/browse/KS-1002)**.

3. **[Medium]** Remediate **FINDING-03** — implement OTP/activation email filtering in `get_notes` ingestion; re-run CHAIN-02. Defect: **[KS-987](https://gendvn.atlassian.net/browse/KS-987)**.

4. **[Medium]** Resolve **OBS-1 (CORS)** — either restrict `Access-Control-Allow-Origin` to approved MCP client origins or obtain architecture sign-off that wildcard is acceptable and update **[KS-988](https://gendvn.atlassian.net/browse/KS-988)** accordingly.

5. **[Medium]** Complete **KS-993** gaps — provision a restricted-scope Entra test identity for Unauthorized user column; execute Network drop tests via controlled fault injection for sections 5.2–5.7; add Antigravity client run if required for internal coverage.

6. **[Medium]** Run OAuth expiry/revocation lifecycle independently in Cursor environment to close **B-TLS-OAUTH** gap (Claude PASS evidence provides interim coverage).

7. **[Process]** QA Lead (**Bình Hà Khoa**): once the Critical and High blockers above are resolved, confirm the security aggregate denominator/methodology, publish the formal signed-off Section 11 report in the Jira QA tracker with consolidated evidence and agent coverage, and mark KS-995 as Done.

---

## 10. Statement for Auditors

This file is the **consolidated Section 11 gate assessment** merging Claude (Cowork agent) and Cursor QA runs against the Dynamo MCP Server QA Testing Guide v1.3.

**Section 11 "Passed" is NOT asserted.** Gate classification: **Conditional / Debt** pending resolution of:

- **B-F04** — FINDING-04 (Critical) — mandatory remediation and re-test
- **B-ENV-LLM** — LLM API key missing — mandatory re-test of Section 5.7 and LLM-branch security cases after fix
- **B-PROCESS** — formal QA Lead sign-off by Bình Hà Khoa

Section 11 "Passed" may be asserted only after all hard blockers are closed, re-tests confirm resolution, and a QA Lead signed-off report is filed in the Jira QA tracker.

---

## 11. Reference Documents

| Document | Role |
|---|---|
| `KS-995 - Claude Result.md` | Claude full gate assessment; FINDING-03/04 register; security aggregate; OAuth lifecycle PASS |
| `KS-995 - Cursor Result.md` | Cursor gate assessment; Jira status snapshot; B-TLS-OAUTH and B-CORS independent confirmation |
| `KS-987 Result.md` | CHAIN suite consolidated — FINDING-03, FINDING-04 full detail and remediation |
| `KS-993 Result.md` | Section 6 matrix — Section 5.1–5.7 merged; G-01/02/03 gaps |
| `KS-994 Result.md` | Section 8 evidence packs; redaction policy PASS |
| `KS-984 Result.md` | AUTH suite — PASS with observations |
| `KS-988 Result.md` | TLS/CORS/OAuth/rate — PARTIAL PASS; OBS-1; TLS-F01 |
| `KS-985 Result.md`, `KS-986 Result.md` | INJ and PIJ suites — security aggregate numerator |
| `dynamo-mcp-testing-guide.md` | Section 11 exit criteria; Section 5 functional; Section 7 security; Section 8 evidence |

---

*Consolidated report generated 2026-05-04*
*Sources: Claude (claude-sonnet-4-6, Cowork mode) · Cursor (`user-conceptia-dynamo`)*
*Assessor: Bình Hà Khoa · Guide v1.3 · MCP endpoint: `https://mcp.conceptia.com/dynamo/sse`*
*Evidence path: `D:\source\GenD\Dynamo Server\Test Result\`*
