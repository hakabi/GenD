# KS-985 — Cursor Execution Report

**Ticket:** Dynamo MCP Security QA — Execute INJ suite for SQL, command, path, SSRF, JSON, types  
**Jira:** [KS-985](https://gendvn.atlassian.net/browse/KS-985)  
**Overall status:** **Partially done** — core INJ scenarios were executed where the MCP surface was available; outstanding items are flagged below and in Jira.

**Executed:** 2026-04-28  
**MCP tested:** Conceptia Dynamo (`user-conceptia-dynamo` in Cursor)  
**Artifacts:** Local test payloads under `Test Result/` (`inj05_args.json`, `inj05_900.json`, `oversized_search.json`, `s2000.txt`, `gen_inj05.py`) — payloads are synthetic; do not paste into production tickets.

---

## Outstanding testing (blocks / gaps)

These items prevent treating KS-985 as **fully closed** until rerun:

| Gap | Impact | Mitigation |
|-----|--------|------------|
| **`llm_text_analysis`** (INJ-02) | LLM-mediated command/abuse path not exercised — failed with **`Missing ANTHROPIC_API_KEY`**. | Configure Anthropic/OpenAI keys on the MCP runtime as deployed; rerun adversarial payloads. |
| **`get_rating_details`** (INJ-01 style `id`) | Adversarial `id` not meaningfully validated with user-scoped filtering. | Set **`user`** (email/UPN) or **`MCP_DEFAULT_USER_EMAIL`** on MCP; rerun. |
| **INJ-05 (very large payloads)** | Only **~900-char** oversized `search_text` executed via MCP invoke; staged **~25k** payload file not replayed (agent/message size limits). | Rerun with scripted MCP client or split invoke if suite requires explicit very-large JSON handling evidence. |

---

## Scope and constraints
- **Black-box MCP surface only** — aligned with the Dynamo MCP QA guide [section 1–7]: behavior judged from tool responses and errors, not Dynamo UI.
- **High-risk tools** (`list_table`, `describe_table`, `read_data`) were exercised where relevant and listed separately below.

---

## Scenario 1 — Happy path (baseline)

| Tool | Inputs | Result |
|------|--------|--------|
| `get_funds` | `limit`: 2, `offset`: 0 | **Pass** — `success: true`, returned fund rows, pagination metadata, no leakage of tokens in message. |
| `read_data` | `SELECT 1` | **Pass** — `success: true`, trivial row returned. |
| `search_aloha_funds` | Minimal valid prior run (`search_text`: `"ab"`) | **Pass** — large result set retrieved (Elasticsearch paths exercised). |
| `list_table` | `{}` | **Pass** — large table inventory returned (response written to agent log; no crash). |
| `get_rating_summary` | `id`: `"999999999"` | **Pass** — `success: true`, empty `data` (no error / no stack leak). |

---

## INJ-01 — SQL-style injection (`get_funds`, `read_data`)

| Test | Observation | Assessment |
|------|--------------|-------------|
| `get_funds` — `fundName`: classic SQL tautology fragment (`' OR …`) | Returned **empty set**, `success: true`, benign message — **no SQL error text**. | **Pass** (no indication of backend SQL echoed to client). |
| `read_data` — query with UNION / injection pattern | **`success: false`**, message: `Security validation failed: Potentially malicious SQL pattern detected. Only simple SELECT queries are allowed.`, code `SECURITY_VALIDATION_FAILED`. | **Pass** |
| `read_data` — non-SELECT / exec-style fragment | **`success: false`**, `Query must start with SELECT for security reasons` / validation failure. | **Pass** |

---

## INJ-02 — Command-style text (`llm_text_analysis`, `analyze_notes`)

| Test | Observation | Assessment |
|------|--------------|-------------|
| `analyze_notes` — `companyNames` with shell metacharacters | **Pass** — `success: true`, analyzed **0** notes; no shell/command indicators in structured response. |
| `llm_text_analysis` — adversarial plain text in payload | **Blocked / incomplete** — call failed with: `Missing ANTHROPIC_API_KEY` (LLM backend not usable in this MCP environment). Injection **cannot** be exercised on the LLM execution path until provider keys/runtime are configured. | **Incomplete for INJ-02 on this tool only** |

---

## INJ-03 — Path-style (`get_documents`)

| Test | Observation | Assessment |
|------|--------------|-------------|
| `filterType`: `fund`, `filterValue`: Windows-style traversal pattern | Empty result, **`success: true`**, generic success message — no path disclosure. | **Pass** (behavioral — no arbitrary file/path content returned). |

---

## INJ-04 — SSRF / URL-like strings

| Tool | Observation | Assessment |
|------|---------------|-------------|
| `search_aloha_funds` — URL-like `search_text` | **Fail at ES layer** — `success: false`, Elasticsearch `query_shard_exception` / failed to parse query (HTTP 400 echo in message). **No evidence** of successful internal HTTP fetch via MCP payload. | **Pass** — parser/network behavior does not expose an SSRF completion surface in the reply. |
| `get_notes` — company name resembling metadata URL string | Empty result set, **`success: true`** — no SSRF symptom in response body. | **Pass** |

---

## INJ-05 — Oversized payload

| Test | Observation | Assessment |
|------|--------------|-------------|
| `search_aloha_funds` — `search_text` ≈ **900** repeated characters (deterministic oversized string) | **`success: true`**, `"Found 0 fund record(s) from Elasticsearch."` — graceful handling. | **Pass** |

A **~25k** character JSON file was generated (`oversized_search.json`) for staging larger tests; the full line was **not replayed via this agent** due to output-size limits — the **900-char** Elasticsearch call is retained as executable evidence.

---

## INJ-06 — Wrong / invalid parameter types and schema

| Test | Observation | Assessment |
|------|--------------|-------------|
| `get_funds` — `limit`: string `"fifty"` | **`success: false`**, `Invalid limit parameter: limit must be a valid number`. | **Pass** — clean validation. |
| `list_table` — schema array with SQL-like string | **`success: false`**, explicit invalid schema name rule. | **Pass** |
| `describe_table` — `tableName` with invalid characters / SQL fragment | **`success: false`**, invalid table name message. | **Pass** |
| `get_rating_details` | No `user` email in environment | **Not executed** for adversarial `id` — prerequisite error: user required. |

---

## High-risk tool checklist (Conceptia section 1.4)

| Tool | INJ-related check this run | Outcome |
|------|----------------------------|---------|
| `read_data` | Malicious / non-SELECT queries | Rejected with **SECURITY_VALIDATION_FAILED** or equivalent. |
| `list_table` | Malicious schema parameter | Rejected with schema validation message. |
| `describe_table` | Malicious `tableName` | Rejected with invalid name message. |

---

## Summary

| Area | Verdict |
|------|---------|
| **Story completion** | **Partial** — gaps above remain |
| INJ-01 (SQL via MCP) | **Pass** for samples run |
| INJ-02 | **Pass** for `analyze_notes`; **`llm_text_analysis` not completed** (API key block) |
| INJ-03 | **Pass** (behavioral) |
| INJ-04 | **Pass** (no SSRF success signal; ES parse failure on URL-like query) |
| INJ-05 | **Partial** — 900-char evidence; staged ~25k not invoked end-to-end |
| INJ-06 | **Pass** for invalid limit / list_table / describe_table |
| Baseline + high-risk tools | **Consistent with acceptance** for **executed** tools only |

---

**Prepared by:** Cursor agent (automated MCP calls + this report).

