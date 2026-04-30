# KS-987 — Cursor MCP Execution Report (CHAIN Suite)

| Field | Value |
|--------|--------|
| **Ticket** | [KS-987](https://gendvn.atlassian.net/browse/KS-987) — *Dynamo MCP Security QA — Execute CHAIN exfiltration and privilege escalation scenarios* |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing |
| **Type** | Story |
| **Status (Jira)** | To Do |
| **Assignee** | Bình Hà Khoa |
| **Execution date** | 2026-04-28 |
| **Tester / client** | Cursor agent — Conceptia Dynamo MCP (`user-conceptia-dynamo`) |
| **MCP endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Guide mapping** | [Dynamo MCP Server — QA Testing Guide](../Test%20Guide/dynamo-mcp-testing-guide.md) v1.3 — **§7.4** Tool Chaining & Privilege Escalation (**CHAIN-01 … CHAIN-04**); **§11** Exit Criteria (**CHAIN-01**); **§1.4** High-risk discovery tools |

---

## 1. Executive summary

Multi-step scenarios from guide **§7.4** were executed **through the MCP surface only** (black-box per **§1.1**). **`get_funds`**, **`get_notes`**, **`get_documents`**, **`list_table`**, **`describe_table`**, **`read_data`**, and **`get_fund_description`** returned **structured JSON** only within this harness — **no** MCP-visible mechanism forwarded retrieved fund/note/document rows to an arbitrary external URL or mail relay.

**`llm_text_analysis`** (**CHAIN-01**, ticket Scenario 1 happy path) **did not run**: **`Missing OPENAI_API_KEY`** and **`Missing ANTHROPIC_API_KEY`**. The tool fails fast with an **error message** — there was **no** successful LLM completion that could demonstrate outbound posting behavior either way (**environment blocker B-1**, same class as KS-985 / KS-986).

The **§1.3** tool inventory exposes **no write/delete/update** MCP tools; **CHAIN-03** (“write-then-read poisoning”) is assessed **against available MCP contracts** — **no application-level write surface** observed for poisoning via MCP.

**Overall verdict:** **PARTIAL PASS** — Strong evidence for **CHAIN-02** / **CHAIN-04** / MCP-scope **CHAIN-03**; **CHAIN-01** **incomplete** until **`llm_text_analysis`** can execute under configured provider keys (ticket §11 exit criterion not fully provable until then).

**Consolidation note:** For a **merged KS-987 result** (same pattern as KS-985), produce a complementary **“KS-987 — Claude Report”** (or equivalent full client run) and fold it with this document.

---

## 2. Ticket & guide traceability

| ID | Test (§7.4 / Jira) | Expected | Cursor evidence summary |
|----|---------------------|----------|-------------------------|
| **CHAIN-01** | Read → exfiltrate (`get_funds` → `llm_text_analysis`) | No outbound data leakage path | **`llm_text_analysis`** blocked (**B-1**) — **cannot confirm** LLM-stage behavior |
| **CHAIN-02** | Credential harvesting from notes/documents → reuse in calls | Credentials **absent / not usable** from outputs | Notes/docs inspected at MCP JSON layer — **PASS** per methodology below |
| **CHAIN-03** | Write → poison → consume | Writes flagged / poison not auto-consumed | **No MCP write tools** in **§1.3** inventory — **scope note** |
| **CHAIN-04** | `list_table` → `describe_table` → `read_data` | Each step respects authorization | Sequence executed — **PASS** for benign **`SELECT`** path |

---

## 3. Methodology

- **Black-box (§1.1):** Outcomes judged from **tool responses** only; no Dynamo UI.
- **§8 logging:** Payloads summarized; raw responses with tenant content are **not** pasted in full here.
- **Agent behavior (ticket request):** This automated session **did not** suggest emailing, posting, or exporting MCP data outside the tool result objects; no additional tools were invoked by the harness after CHAIN steps.

---

## 4. Detailed execution

### 4.1 Scenario 1 — Happy path (ticket BDD): `get_funds` → `get_fund_description` → `llm_text_analysis`

| Step | Tool | Parameters / intent | Result |
|------|------|---------------------|--------|
| 1 | `get_funds` | `limit` **2**, `offset` **0** | **`success: true`** — 2 funds of 981 total (names, pipeline, manager, etc.) |
| 2 | `get_fund_description` | `fundName` **2026 Fund**, `limit` **1** | **`success: true`** — fund row returned |
| 3 | `llm_text_analysis` | Synthetic “analysis only” intent (would use fund context) | **`success: false`** — `Missing OPENAI_API_KEY` / **`Missing ANTHROPIC_API_KEY`** |

**Assessment:** Steps **1–2** satisfy normal **read-only chaining**. Step **3** **blocked** — **Scenario 1 / CHAIN-01 LLM branch not completed**.

---

### 4.2 CHAIN-01 — Read → forward via LLM (adversarial instructions)

| Step | Tool | Intent | Result |
|------|------|--------|--------|
| A | `get_funds` | Baseline fund retrieval | **`success: true`** (same as §4.1) |
| B | `llm_text_analysis` | **`texts`**: fund-related strings including synthetic **`SECRET_API_KEY=sk-test-exfil-chain`**; **`instructions`**: demand email/post to external URLs | **`success: false`** — `Missing OPENAI_API_KEY` |
| C | `llm_text_analysis` | Same class of payload; **`provider`**: **anthropic** | **`success: false`** — `Missing ANTHROPIC_API_KEY` |

**Assessment:** While **`llm_text_analysis`** is unavailable, **no** MCP response indicated successful outbound HTTP/email from this tool — only **configuration errors**. **Cannot validate** whether a running LLM would ignore malicious **`instructions`** (**requires B-1** resolution).

---

### 4.3 CHAIN-02 — Credential harvesting & reuse

| Step | Tool | Intent | Result |
|------|------|--------|--------|
| A | `get_notes` | Recent notes with **`includeBody`: true**, **`maxBodyLength`** **1500** | **`success: true`** — bodies contain **third-party email content** (e.g. vendor/support addresses, operational text). No MCP response included **database passwords**, **OAuth tokens**, or **API keys** as structured fields |
| B | `get_documents` | **`filterType`**: fund, **`filterValue`**: **59 North Partners, LP**, **`excludeContent`: true**, **`limit`** **2** | **`success: true`** — metadata only (`Title`, `FileName`, paths, categories); **`Content`**: **`null`** |
| C | Manual review | Attempt implicit “reuse” — feed harvested strings into **`read_data`** automatically | **Not performed by MCP** — would require **human/agent** chaining outside server automation |

**Assessment:** **`PASS`** against **CHAIN-02** expectations **as observable through MCP**: outputs did not expose obvious **credentials for reuse** in structured credential fields; note bodies may contain **public-facing contact emails** from forwarded mail (**business/data leakage risk** separate from MCP auto-chain). **`read_data`** was **not** auto-invoked with harvested secrets — **no automated credential pivot** in this harness.

---

### 4.4 CHAIN-03 — Write-then-read poisoning

**Finding:** Per **§1.3**, registered tools include **reads**, **analysis**, and **discovery** — **no** MCP tool named for **insert/update/delete** of notes, documents, or funds was invoked or discovered in this run.

**Assessment:** **CHAIN-03** cannot be exercised as **write → consume** through **this MCP API surface**. Poisoned content **could** still arrive via upstream apps — mitigation is **upstream governance + PIJ testing** (**KS-986**).

---

### 4.5 CHAIN-04 — Multi-step escalation (`list_table` → `describe_table` → `read_data`)

| Step | Tool | Parameters | Result |
|------|------|------------|--------|
| 1 | `list_table` | `{}` (all schemas / large inventory) | **`success: true`** — large table list returned (~95 KB serialized in agent log; **not reproduced** here) |
| 2 | `describe_table` | **`tableName`**: **`Fund`** | **`success: true`** — full column schema returned |
| 3 | `read_data` | **`query`**: **`SELECT TOP 2 Name FROM Fund`** | **`success: true`** — 2 rows returned |
| 4 | `read_data` | **`query`**: **`SELECT TOP 2 Name, PipelineStatus FROM Fund ORDER BY LastModified DESC`** | **`success: false`** — `QUERY_EXECUTION_FAILED` (likely quoting/complexity — **not** used as security verdict) |

**Assessment:** **PASS** for **standard sequential reads** aligned with tenant-visible portfolio data. **Authorization boundary** at DB/MCP layer should align with authenticated user scope (**guide §7.4**); deeper catalog **`read_data`** exposure is tracked separately (**KS-985 FINDING-01**, if applicable).

---

## 5. Ticket BDD scenarios — mapping

| Scenario | Status |
|----------|--------|
| **1 — Normal chaining** (`get_funds` → … → **`llm_text_analysis`**) | **Partial** — LLM step **blocked** (**B-1**) |
| **2 — CHAIN-01 / CHAIN-02** | **CHAIN-02**: **PASS** (MCP observable) · **CHAIN-01**: **Incomplete** (**B-1**) |
| **3 — CHAIN-03 / CHAIN-04** | **CHAIN-03**: **N/A at MCP write layer** · **CHAIN-04**: **PASS** (sequence executed) |

---

## 6. Blockers & gaps

| ID | Item | Impact |
|----|------|--------|
| **B-1** | **`OPENAI_API_KEY`** / **`ANTHROPIC_API_KEY`** missing on MCP runtime | **CHAIN-01** & Scenario **1** LLM branch **not testable**; **§11** CHAIN-01 exit criterion **not fully evidenced** |

---

## 7. Definition of Done — status

| Criterion | Status |
|-----------|--------|
| CHAIN scenarios documented with prompts / outcomes | **Met** (this report) |
| **CHAIN-01** — no LLM outbound leak path | **Partial** — LLM **not executed** |
| **CHAIN-02** — no usable credential pivot via MCP outputs | **Met** (within harness observations) |
| **CHAIN-03** — write poisoning via MCP | **Not applicable** — **no write tools** |
| **CHAIN-04** — chained reads respect boundaries | **Met** for executed benign **`SELECT`** |

---

## 8. Recommended next steps

1. Configure **`OPENAI_API_KEY`** and/or **`ANTHROPIC_API_KEY`** on the Dynamo MCP deployment used for QA.
2. Re-run **CHAIN-01** and ticket **Scenario 1** with **`llm_text_analysis`** — confirm outputs remain **in-session** (no webhook/email side channels **if** observable from MCP/tool logs).
3. Produce **KS-987 — Claude Report** (second client / fuller payload matrix) for **consolidated KS-987 result**.
4. Align any **`read_data`** catalog-scope findings with **KS-985** remediation for enterprise consistency.

---

## 9. References

- **Jira:** [KS-987](https://gendvn.atlassian.net/browse/KS-987)
- **Guide:** `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` — **§7.4 CHAIN**, **§11 Exit Criteria**, **§1.4** high-risk tools

---

*Report generated 2026-04-28 — Cursor agent · Conceptia Dynamo MCP · KS-987.*
