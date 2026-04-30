# KS-986 — Consolidated QA Result (Dynamo MCP PIJ Suite)

| Field | Value |
|--------|--------|
| **Ticket** | [KS-986](https://gendvn.atlassian.net/browse/KS-986) — Dynamo MCP Security QA: PIJ suite (notes, descriptions, documents, search) |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing |
| **Overall status** | **PARTIAL PASS — environment blocker B-1** (LLM path untested) |
| **Execution date** | 2026-04-28 |
| **Methodology** | Per **Dynamo MCP Server — QA Testing Guide** v1.3: black-box testing **only** through MCP (`https://mcp.conceptia.com/dynamo/sse`); no Dynamo UI cross-checks (**§1.1**). |
| **Sources merged** | **Claude** — *KS-986 - Claude_Report.md* (Cowork agent, broad sampling, injection scans). **Cursor** — *KS-986 - Cursor Report.md* (`user-conceptia-dynamo`, adversarial filters + ES smoke). |

---

## 1. Alignment with the testing guide

The official guide (`Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md`) frames this work as follows:

| Guide reference | How this consolidated result applies it |
|-----------------|----------------------------------------|
| **§1.1 Black-box rule** | Verdicts use **MCP tool outputs** only; upstream Dynamo remains opaque. |
| **§1.3 Tool inventory** | PIJ exercises **six** PIJ-relevant tools among **13** registered tools; **`llm_text_analysis`** blocked (**B-1**). |
| **§2.4 Multi-client testing** | **Claude (Cowork)** and **Cursor** both ran against the same MCP surface — satisfies multi-client recommendation. |
| **§7.3 PIJ** | PIJ-01 … PIJ-05 mapped explicitly in §4 below. |
| **§8 What to log** | Detailed payloads live in source reports; this file summarizes outcomes and avoids reproducing sensitive note/document bodies verbatim. |
| **§11 Exit criteria** | Guide expects PIJ tests to confirm injection is **not** executed (**data treated as data**). That holds for **all exercised non-LLM paths**; **full** exit narrative requires **`llm_text_analysis`** under configured keys (**B-1**). |

---

## 2. Executive summary

**Both sessions** validated that **`get_notes`**, **`analyze_notes`**, **`get_fund_description`**, **`get_documents`**, and **`search_aloha_funds`** return **structured JSON** where note bodies, descriptions, document metadata, and Elasticsearch hits behave as **data** — **no** MCP-observable execution of embedded “instructions,” **no** autonomous secondary tool calls from server responses, and **no write/delete/update tools** in the **§1.3** inventory (strong structural limit for PIJ-04).

**Claude** additionally performed broader sampling (e.g. **10** recent notes with injection-pattern scan, **10** fund descriptions for encoding artifacts, **`get_documents`** against multiple fund filters noting **`Content`** as **`null`**, MIME/binary placeholder, or non-extracted text).

**Cursor** emphasized **explicit adversarial inputs**: literal PIJ phrase in **`companyNames`** filters, **`Phoenix Equity`** **`analyze_notes`** chain, **`llm_text_analysis`** probes with **both** **`OPENAI_API_KEY`** and **`ANTHROPIC_API_KEY`** missing, adversarial **`get_documents`** company filter, and **`search_aloha_funds`** (**“Ignore previous instructions”** vs **`Sequoia`** baseline with **111** hits).

**`llm_text_analysis` remains blocked** — **`Missing ANTHROPIC_API_KEY`** (Claude; Cursor confirms **both** providers missing). **PIJ-02 LLM branch** and any **LLM-heavy PIJ-04** interpretation **cannot be fully validated** until keys exist on the MCP runtime (**B-1**).

**No critical PIJ “execution” finding** was identified across either session for paths that ran successfully.

---

## 3. PIJ coverage matrix (merged)

| ID | Tool(s) | Claude — key evidence | Cursor — key evidence | Consolidated verdict |
|----|---------|------------------------|------------------------|----------------------|
| **PIJ-01** | `get_notes`, `analyze_notes` | **10** recent notes scanned — **no** canonical override patterns in subjects/bodies; **`analyze_notes`** returns summary/highlights/comparison only | Literal adversarial **`companyNames`** → **0** rows; **`Phoenix Equity`** **`analyze_notes`** → benign analysis JSON | ✅ **PASS** |
| **PIJ-02** | `get_fund_description`, `llm_text_analysis` | **10** descriptions scanned — plain English; **no** base64/Unicode trick patterns; **`llm_text_analysis`** → **Missing ANTHROPIC_API_KEY** | **`get_fund_description`** (**59 North**) ✅; **`llm_text_analysis`** blocked **both** providers | ✅ **PASS** (description path) · ❌ **BLOCKED** LLM (**B-1**) |
| **PIJ-03** | `get_documents` | **`36 South`** / **`Quantum`** runs — **`Content`** **`null`** or **`application/octet-stream`** / MIME; metadata only | **59 North** fund docs + adversarial **company** filter → structured metadata; **no** tool orchestration in JSON | ✅ **PASS** |
| **PIJ-04** | `analyze_notes` → writes | **`analyze_notes`** returns structured objects only; **no** write tools registered | Same structural observation; harness issued **no** follow-on MCP writes | ✅ **PASS** (MCP layer*) |
| **PIJ-05** | `search_aloha_funds` | **`global`** → **262** legit rows; **`ignore previous instructions`** → **0** ES hits | **`Ignore previous instructions`** → **0**; **`Sequoia`** → **111** structured rows | ✅ **PASS** |

\* **Residual:** Downstream **LLM agents** consuming MCP output could still mis-handle text (**agent-level** risk); out of strict MCP contract scope.

---

## 4. Blockers & gaps

| ID | Item | Impact |
|----|------|--------|
| **B-1** | **`llm_text_analysis`** — **`OPENAI_API_KEY`** / **`ANTHROPIC_API_KEY`** not configured on MCP runtime | **PIJ-02** LLM half **not executed**; **full DoD** for KS-986 requires re-run after configuration |

**Post-B-1 retest suggestions** (from Claude report): adversarial **`texts`** with encoded payloads to **`llm_text_analysis`**; optional **`analyze_notes`** → **`llm_text_analysis`** chain observation once LLM is live.

---

## 5. Definition of Done (ticket) — consolidated

| Criterion | Status |
|-----------|--------|
| PIJ-01 … PIJ-05 — malicious content handled as **data** where tools ran | ✅ **Met** (non-LLM paths + ES/search) |
| **`llm_text_analysis`** PIJ validation | ❌ **Not met** — **B-1** |
| §11-style PIJ outcome (“not executed”) for exercised surfaces | ✅ **Met** |
| Critical PIJ defect filed per §9 | **None observed** on exercised paths |

---

## 6. Summary verdict matrix

| PIJ ID | Category | Consolidated verdict |
|--------|-----------|---------------------|
| PIJ-01 | Notes | ✅ **PASS** |
| PIJ-02 | Descriptions / LLM | ✅ Descriptions · ❌ LLM **BLOCKED** (**B-1**) |
| PIJ-03 | Documents | ✅ **PASS** |
| PIJ-04 | Chained injection | ✅ **PASS** (no MCP writes; MCP-layer scope) |
| PIJ-05 | Search results | ✅ **PASS** |

---

## 7. Recommended next steps

1. Configure **`OPENAI_API_KEY`** and **`ANTHROPIC_API_KEY`** on the QA MCP deployment; re-run **`llm_text_analysis`** PIJ payloads (**B-1** closure).
2. If **`get_documents`** ever returns **full extracted text** in **`Content`**, re-run **PIJ-03** on real bodies.
3. If **write tools** are added to the MCP server later, re-run **PIJ-04** end-to-end before production (Claude observation).
4. Optional: fold PIJ checks into **§10 ASV** continuous validation.

---

## 8. Reference documents

| Document | Role |
|----------|------|
| `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` | §**1.1**, §**1.3**, §**2.4**, §**7.3** PIJ, §**8**, §**11** |
| `Dynamo Server/Test Result/KS-986 - Claude_Report.md` | Deep sampling, injection scans, structural write-tool observation |
| `Dynamo Server/Test Result/KS-986 - Cursor Report.md` | Adversarial filters, dual-provider LLM block, ES **Sequoia** baseline |

---

*Consolidated report generated 2026-04-28 — merges Claude + Cursor KS-986 executions against the testing guide v1.3.*
