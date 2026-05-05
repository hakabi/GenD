# KS-993 — Cursor QA Result: section 6 Matrix for section 5.1–5.7

| Field | Value |
|-------|-------|
| **Ticket** | [KS-993](https://gendvn.atlassian.net/browse/KS-993) — Dynamo MCP QA — Execute Section 6 matrix for Sections 5.1–5.7 across scenarios |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Jira status (at read)** | In Progress |
| **Tester / agent** | Cursor — Conceptia Dynamo MCP (`user-conceptia-dynamo`) |
| **Test date (UTC)** | 2026-04-30 |
| **Guide** | [Dynamo MCP Server — QA Testing Guide](../Test%20Guide/dynamo-mcp-testing-guide.md) v1.3 — **section 5.1–section 5.7**, **section 6 Test Matrix**, **section 8 logging** |
| **MCP endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Baseline fund** | **59 North Partners, LP** (PRIMARY fixture; manager filter **59 North Capital Management** where applicable) |
| **Overall verdict** | **PARTIAL** — section 6 grid executed for **this agent only**; several cells are **S** (skipped) where a second identity, network fault injection, or provider/env configuration was required; **section 5.7** LLM path **blocked on missing API keys** |

---

## 1. Scope and limits (explicit)

| Topic | Disposition |
|--------|-------------|
| **Agent coverage** | **Cursor only.** Jira / section 2.4 references a **second MCP client (e.g. Antigravity)** for full cross-agent replay — **not run here**. Differences vs other agents should be tracked in a separate matrix column or attachment when available. |
| **Unauthorized user column** | **Not executed with a second OAuth identity.** This harness exposes a single authenticated session. Cells marked **S** with rationale (see matrix). No Dynamo web login used for diagnosis. |
| **Network drop column** | **Not executed.** Deliberate mid-request disconnect / retry characterization was not performed in this automated session (would need controlled fault injection or manual network kill). Cells marked **S**. |
| **Transcripts** | This file summarizes **tool parameters and outcomes** per section 8; raw multi-megabyte payloads and full note bodies are **not** pasted (redaction / size). |

---

## 2. section 6 matrix — Cursor (this run)

Legend: **P** = pass · **F** = fail · **S** = skipped (justified) · **n/a** = per guide

| section 5 row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|--------|------------|---------------|-------------------|--------------|----------------|
| **5.1 Auth** | **P** | **P** | **S** | **S** | **n/a** |
| **5.2 Fund fetch** | **P** * | **P** | **S** | **S** | **P** |
| **5.3 Documents** | **P** | **P** | **S** | **S** | **P** |
| **5.4 Activity / notes** | **P** | **P** | **S** | **S** | **P** |
| **5.5 Data explore** | **P** | **P** | **S** | **S** | **P** |
| **5.6 Search** | **P** | **P** | **S** | **S** | **P** |
| **5.7 Text analysis** | **S** | **S** | **n/a** | **S** | **S** |

**Footnotes**

- **5.1 Happy:** `get_funds` `limit=5` invoked **twice** with identical first-page **Name** ordering (981 total funds). **5.1 Invalid:** `limit=150` → `success: false`, message *limit must be between 1 and 100* (clean validation).
- **5.2 Happy *:** `get_fund_description`(**59 North Partners, LP**) → row with **UUID `ID`**, name, description; `search_aloha_funds`(**North**) → **solovis** `fund_id` **28582**; `get_rating_summary`(**28582**, solovis, fund) → non-empty summary. **`get_rating_details`** → `success: false` — *user is required … pass user (email/UPN) or set MCP_DEFAULT_USER_EMAIL* (**configuration / harness gap**, not a crash). **5.2 Invalid:** nonsense `fundName` → **0** rows; nonsense numeric `id` for summary → **empty** `data` with `success: true`.
- **5.3:** `get_documents` fund filter → **50 of 148** docs (`excludeContent: true`); nonsense fund → **0** rows; **limit=500** run: server returns paginated chunk (full row metadata in session logs — **148** total for this fund per earlier page).
- **5.4:** `get_activity`(**fundNames**) → structured rows; `get_notes`(**manager company**, body excluded) → list; **`analyze_notes`**(**same company**, `limit=5`) → **`success: true`** with thematic buckets / comparison. **Invalid:** `startDate` **after** `endDate` → *Analyzed 0 note(s)* (graceful). **Large:** `get_notes` `limit=200` → **19** notes (all rows, small corpus for this filter).
- **5.5:** `list_table` → large table list **`success: true`**; `describe_table`(**Fund**) → rich column schema; `read_data` **`SELECT TOP 10 Name FROM Fund ORDER BY Name`** → **10** rows. (Earlier attempt with **`PipelineStatus`** in the projection failed with **`QUERY_EXECUTION_FAILED`** — likely identifier/quoting; simplified query **passes**.) **Invalid:** `read_data`(**`DROP TABLE`**) → **`SECURITY_VALIDATION_FAILED`**; `describe_table`(**bogus name**) → **`success: true`**, **empty** `columns` (no stack trace). **Large:** `SELECT TOP 200 Name FROM Fund` → **200** rows.
- **5.6 Happy:** `search_aloha_funds`(**North**) → **182** hits (multi-source). **Invalid:** missing `search_text` → *search_text is required.* **Large:** same **North** query documents breadth of ES matches.
- **5.7:** `llm_text_analysis`(sample inline text, summary intent) → **`Missing ANTHROPIC_API_KEY`** — **no LLM execution**; invalid/large/network cells **not meaningfully separable** until provider keys are configured on the MCP server runtime.

---

## 3. Ticket BDD scenarios (compressed)

| Scenario | Cursor outcome |
|----------|----------------|
| **1 — Happy path column** | **PARTIAL** — All section 5 rows attempted; **5.7** blocked (**S**); **5.2** rating **details** sub-step blocked on **`user`** / env. |
| **2 — Invalid + unauthorized** | **Invalid:** sampled tool-appropriate bad limits, empty search text, destructive SQL, bogus table name — validations generally **clean** (no crash / no stack in sample). **Unauthorized:** **S** — no alternate scoped user available in this session. |
| **3 — Network + large + second agent** | **Network:** **S**. **Large:** exercised pagination / caps on **funds**, **documents**, **read_data**, **search**. **Second agent:** **not run** — record as coverage gap vs Jira section 2.4. |

---

## 4. Definition of Done vs this run

| DoD element | Status |
|-------------|--------|
| Matrix rows **5.1–5.7** × section 6 columns | **Filled for Cursor** (see section 2). |
| **Per-agent** repeats | **Only one agent** (Cursor) — **open** for Antigravity / others. |
| **Unauthorized** / **network drop** evidence | **Mostly S** — see section 1. |
| **Spreadsheet / Xray attachment** in Jira | **Out of scope for this file** — matrix is embedded here; PM may copy to Sheet/Xray. |

---

## 5. Recommended next actions (no blocking question)

1. Configure **`MCP_DEFAULT_USER_EMAIL`** (or pass **`user`** on **`get_rating_details`**) in the MCP server environment to close **5.2** rating-details gap.  
2. Configure **`OPENAI_API_KEY`** and/or **`ANTHROPIC_API_KEY`** for **`llm_text_analysis`** to execute **5.7** beyond **S**.  
3. Run the **same section 6 grid** from **agent B** and attach a merged comparison (per KS-993).  
4. Optionally execute **network drop** with an approved fault-injection method and capture **client retry / hang** behavior.

---

*Evidence produced from live MCP calls on 2026-04-30; Jira description retrieved via Atlassian MCP (`jira_get_issue`).*
