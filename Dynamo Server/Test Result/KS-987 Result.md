# KS-987 — Consolidated QA Result (Dynamo MCP CHAIN Suite)

| Field | Value |
|--------|--------|
| **Ticket** | [KS-987](https://gendvn.atlassian.net/browse/KS-987) — Dynamo MCP Security QA: CHAIN exfiltration & privilege escalation |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing |
| **Overall status** | **FAIL / OPEN — 2 security findings + 1 environment blocker** (not ready for Done until remediated and re-tested) |
| **Execution date** | 2026-04-28 |
| **Methodology** | Per **Dynamo MCP Server — QA Testing Guide** v1.3 (**section 7.4 CHAIN**, **section 1.4** high-risk tools, **section 11** exit criteria): black-box testing **only** through MCP (`https://mcp.conceptia.com/dynamo/sse`); no Dynamo UI cross-checks (**section 1.1**). |
| **Sources merged** | **Claude** — *KS-987 - Claude_Report.md* (Cowork agent; deep CHAIN-02/04 probing including **`User`** table reads; OTP scan in notes). **Cursor** — *KS-987 - Cursor Report.md* (`user-conceptia-dynamo`; benign chains; dual missing LLM keys). |

---

## 1. Alignment with the testing guide

| Guide reference | How this consolidated result applies it |
|-----------------|----------------------------------------|
| **section 1.1 Black-box rule** | Verdicts use **MCP tool outputs** only; upstream Dynamo remains opaque. |
| **section 1.3 Tool inventory** | CHAIN exercises **`get_funds`**, **`llm_text_analysis`**, **`get_notes`**, **`get_documents`**, **`list_table`**, **`describe_table`**, **`read_data`**, **`get_fund_description`** (happy path). |
| **section 1.4 High-risk tools** | **`list_table`**, **`describe_table`**, **`read_data`** — central to CHAIN-04; Claude validated **`User`** exposure (**FINDING-04**). |
| **section 7.4 CHAIN** | CHAIN-01 … CHAIN-04 mapped in section 4; section 11 **CHAIN-01** (no exfiltration path) partially evidenced (**B-1** blocks LLM arm). |
| **section 8 What to log** | Detailed payloads and sensitive evidence remain in source reports; this file avoids reproducing secrets, hashes, or full PII (**redaction policy**). |

---

## 2. Executive summary

**Claude** executed the ticket **deeply**: **`read_data`** against **`dbo.User`** (**FINDING-04 — Critical** — bcrypt hashes, admin enumeration, internal support account visibility); **`get_notes`** scan surfaced **time-bound OTP / activation codes** ingested from external portals (**FINDING-03 — Medium**). **`list_table`** scale aligns with prior **KS-985 FINDING-01** (full schema enumeration).

**Cursor** executed **lighter CHAIN probes**: **`get_funds`** → **`get_fund_description`** → **`llm_text_analysis`** (blocked); **`get_notes`** / **`get_documents`** samples **without** targeting **`User`** or dedicated OTP hunts; **`list_table`** → **`describe_table(Fund)`** → **`read_data(SELECT TOP 2 Name FROM Fund)`** — **benign path only**. Cursor correctly noted **`OPENAI_API_KEY`** / **`ANTHROPIC_API_KEY`** missing (**B-1**) and **no MCP write tools** (**CHAIN-03** structural **PASS**).

**Reconciliation:** Cursor **did not contradict** Claude; it **did not replicate** the **`User`** queries or focused OTP evidence. **Authoritative security posture for KS-987** follows **Claude’s findings** plus **Cursor’s** LLM-key and harness observations.

**CHAIN-01 (`llm_text_analysis`):** Both agents — tool **blocked** (**B-1**); **no** outbound LLM processing observed; section 11 CHAIN-01 **not fully proven** for a **live** LLM until keys exist.

---

## 3. CHAIN coverage matrix (merged)

| ID | Expected (section 7.4 / ticket) | Claude — outcome | Cursor — outcome | Consolidated verdict |
|----|--------------------------|-------------------|------------------|----------------------|
| **CHAIN-01** | Read → forward via **`llm_text_analysis`** — **no** outbound leak | **`get_funds`** ✅; **`llm_text_analysis`** blocked (**B-1**); notes structural observation on LLM providers | Same — **`llm_text_analysis`** fails fast on missing keys | ✅ **PASS** for exercised failure mode · ⚠️ **Partial** — LLM behavior **unvalidated** (**B-1**) |
| **CHAIN-02** | Credentials **not** harvestable / reusable from outputs | **`FINDING-03`** — OTP/Matrix codes **in note bodies** (expired samples); **`get_documents`** metadata ✅ | Sampled notes/docs — **no** structured DB secrets; **PASS** at sampled depth | ⚠️ **FINDING-03** (Claude) · Cursor = **subset PASS** |
| **CHAIN-03** | Write → poison → consume | **No write MCP tools** — structural **PASS** | Same | ✅ **PASS** (MCP layer) |
| **CHAIN-04** | **`list_table`** → **`describe_table`** → **`read_data`** — **authorization respected** | **`FINDING-04`** — **`read_data`** can **`SELECT`** from **`User`** — hashes & admins exposed | Benign **`Fund`** **`SELECT`** only; cites KS-985 catalog risk | 🔴 **FINDING-04** (Claude) · Cursor benign chain ≠ boundary OK |

---

## 4. Security findings (consolidated)

Details and reproduction steps are in **`KS-987 - Claude_Report.md`**. Summary only:

### FINDING-03 — Medium (CHAIN-02): OTP / activation-style codes in **`get_notes`**

External portal emails (e.g. Allvue/Okta OTP, Morgan Stanley Matrix activation) appear in activity notes; **expired** samples documented — **risk** is **live interception** of **unexpired** codes via MCP polling.

### FINDING-04 — Critical (CHAIN-04): **`read_data`** readable **`dbo.User`** credential surface

**`SELECT`** on **`User`** returned bcrypt **`Password`** hashes, **`AdminAccess`**, **`LastLoginIP`**, API-key metadata, and enumeration of privileged accounts (including internal vendor identity noted in Claude report). **Escalation:** offline cracking → tenant admin paths — **must remediate before security sign-off**.

---

## 5. Blockers & remediation linkage

| ID | Item | Impact |
|----|------|--------|
| **B-1** | **`OPENAI_API_KEY`** / **`ANTHROPIC_API_KEY`** missing | **CHAIN-01** LLM arm **not fully tested** |
| **B-2** | **FINDING-03** | Note ingestion / MCP **`get_notes`** filtering |
| **B-3** | **FINDING-04** | **Block/deny** identity tables on **`read_data`** (and align with **KS-985** **`read_data`** hardening — FINDING-01 catalog; **KS-985** FINDING-02 SQLi remains separate ticket scope) |

---

## 6. Definition of Done (CHAIN) — consolidated

| Criterion | Status |
|-----------|--------|
| No **LLM-mediated** exfiltration demonstrated (**CHAIN-01**) | **Partial** — **B-1** |
| Credentials / OTP exposure (**CHAIN-02**) | ❌ **FINDING-03** |
| Write poisoning via MCP (**CHAIN-03**) | ✅ Met (no write tools) |
| Multi-step reads respect authorization (**CHAIN-04**) | ❌ **FINDING-04** |
| section 11-style “no exfiltration” / chain safety | ❌ **Open** until findings + **B-1** closed |

---

## 7. Recommended next steps

1. **FINDING-04:** Deny **`read_data`** on **`User`** / identity tables; rotate impacted credentials per incident process; review internal support admin account exposure (**per Claude report**).
2. **FINDING-03:** Review ingestion rules for OTP/activation emails; filter or exclude from MCP **`get_notes`** if policy requires.
3. **B-1:** Configure LLM keys; re-run **CHAIN-01** against **live** **`llm_text_analysis`**.
4. Track cross-suite items: **KS-985** FINDING-01 / FINDING-02 remediation registers (**Claude cumulative table**).
5. After fixes: **Claude + Cursor** (or equivalent two-client) **re-run** CHAIN-02 and CHAIN-04 for regression evidence.

---

## 8. Reference documents

| Document | Role |
|----------|------|
| `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` | section **1.4**, section **7.4**, section **11** |
| `Dynamo Server/Test Result/KS-987 - Claude_Report.md` | Deep CHAIN execution, **FINDING-03**, **FINDING-04**, cumulative KS register |
| `Dynamo Server/Test Result/KS-987 - Cursor Report.md` | Cursor MCP harness, **B-1**, benign **`Fund`** **`read_data`** chain |

---

*Consolidated report generated 2026-04-28 — merges Claude + Cursor KS-987 against testing guide v1.3.*
