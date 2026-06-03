# KS-993 — Cursor QA Result (Third Time Test)

## Dynamo MCP QA — Section 6 matrix rollup (Sections 5.1–5.7) — Cursor agent

| Field | Value |
|---|---|
| **Ticket** | [KS-993](https://gendvn.atlassian.net/browse/KS-993) |
| **Epic** | Dynamo MCP — Functional E2E Validation ([KS-999](https://gendvn.atlassian.net/browse/KS-999)) |
| **Scope executed** | Jira description **Updated requirements — guide v1.5 (10-tool MCP inventory)** only |
| **Guide ref** | Section **6** matrix · `dynamo-mcp-testing-guide_v1.5.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP client** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Evidence sources** | Per-row Cursor Third Time Test reports (this folder) |

---

## Summary

This artifact rolls up the guide **section 6 matrix** columns for rows **5.1–5.7** using the **Cursor Third Time Test** reports produced on **2026-05-21** under **guide v1.5**. All evidence rows reference sibling Cursor reports **KS-977 through KS-983** in this folder.

**Overall Third Time Test finding (Cursor):** With MCP **Connected**, functional rows **5.1–5.4** and **5.5a–5.5c happy path** are **PASS**. **VULN probes on `read_data` are F** (expected open findings VULN-01/VULN-02). Row **5.6 Search** (`search_aloha_funds`) is **S** (tool permanently removed). Row **5.6/5.7 Text analysis** (`llm_text_analysis`) is **BLOCKED** on happy path due to **[KS-1002](https://gendvn.atlassian.net/browse/KS-1002)** LLM provider failure (Anthropic model 404).

**Cross-agent contrast:** The parallel **Claude Third Time Test** (same date) was predominantly **BLOCKED** because the Dynamo MCP server was **not connected** in the Claude Cowork session (curl exit code 56). Cursor achieved full 5.1–5.5 execution with MCP connected — demonstrating agent/client connectivity as a test variable independent of server availability.

---

## Evidence sources (Third Time Test — Cursor)

| Row | Story | Cursor Third Time Test report |
|---|---|---|
| 5.1 | [KS-977](https://gendvn.atlassian.net/browse/KS-977) | `KS-977 - Cursor Result.md` |
| 5.2 | [KS-978](https://gendvn.atlassian.net/browse/KS-978) | `KS-978 - Cursor Result.md` |
| 5.3 | [KS-979](https://gendvn.atlassian.net/browse/KS-979) | `KS-979 - Cursor Result.md` |
| 5.4 | [KS-980](https://gendvn.atlassian.net/browse/KS-980) | `KS-980 - Cursor Result.md` |
| 5.5 | [KS-981](https://gendvn.atlassian.net/browse/KS-981) | `KS-981 - Cursor Result.md` |
| 5.6 Search | [KS-982](https://gendvn.atlassian.net/browse/KS-982) | `KS-982 - Cursor Result.md` |
| 5.6/5.7 LLM | [KS-983](https://gendvn.atlassian.net/browse/KS-983) | `KS-983 - Cursor Result.md` |

**Legend:** **P** = pass · **F** = fail · **S** = skipped (documented, not applicable) · **B** = blocked (documented, actionable) · **n/a** = guide not applicable for this row/column

---

## Matrix — Cursor Third Time Test (2026-05-21, guide v1.5)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.1 Auth** (`get_funds`) | **P** | n/a | **P*** | n/a | n/a | n/a |
| **5.2 Fund fetch** (`get_fund_description`) | **P** | **P** | n/a | n/a | n/a | n/a |
| **5.3 Documents** (`get_documents`) | **P** | **P** | n/a** | n/a | n/a | n/a |
| **5.4 Activity/Notes** (`get_activity`, `get_notes`, `analyze_notes`) | **P** | **P** | n/a** | n/a | n/a | n/a |
| **5.5a `list_table`** | **P** | n/a | n/a | n/a | n/a | n/a |
| **5.5b `describe_table`** | **P** | n/a | n/a | n/a | n/a | n/a |
| **5.5c `read_data`** | **P** | **P** | n/a | n/a | n/a | **F** |
| **5.6 Search** (`search_aloha_funds`) | **S** | **S** | **S** | **S** | **S** | **S** |
| **5.6 Text analysis** (`llm_text_analysis`) | **B** | **P** | n/a | n/a | n/a | n/a |

\*Unauthorized user assessed via HTTP 401 probes at MCP gateway (KS-977 §2.A). Scenario 3 edge case (0 / &lt;5 funds) remains **BLOCKED** on KS-977 — environment provisioning gap, not matrix Happy path.

\*\*Dedicated second Entra identity not provisioned (F-06) — Unauthorized column **n/a** for these rows.

---

## Row-level rationale

**5.1 Auth — `get_funds`** (KS-977)
Happy path **P**: two-call consistency, `totalRecords: 979`, 10-tool inventory documented. Invalid input **n/a**. Unauthorized **P** via §2.A HTTP 401 probes. Scenario 3 (low-scope identity) **BLOCKED** on ticket — does not affect Happy path cell.

**5.2 Fund fetch — `get_fund_description`** (KS-978)
Happy path **P**: two identical describe calls for 59 North; GUID `D7879DB7-…`; Description present. Invalid input **P**: synthetic unknown fund → empty `data`. Null description **P**: 2026 Fund explicit `null`. Rating tools **S** (removed 2026-05-07).

**5.3 Documents — `get_documents`** (KS-979)
Happy path **P**: two identical calls, 5 of 151 docs, first ID `84C6E63A-…`. Invalid input **P**: empty invalid fund + no-filter validation error (`At least one filter is required`). Zero-document fund **P**: 2026 Fund → 0 records.

**5.4 Activity/Notes — `get_activity`, `get_notes`, `analyze_notes`** (KS-980)
Happy path **P**: activity 5 of 41 (Date DESC); notes 5 of 19; `analyze_notes` with `limit: 5` grounded (July 2025 in highlights). Invalid input **P**: invalid fund → empty activity. F-01 documented: `fundNames` vs `companyNames` filter dimensions.

**5.5a `list_table`** (KS-981)
Happy path **P**: 561 allowlisted tables; `dbo.Fund` present; no `sys.*` in list. First v1.5 Cursor execution (Second Time Test was **S**).

**5.5b `describe_table`** (KS-981)
Happy path **P**: Fund table 300+ columns; `ID`, `Name`, `Description`, `Ref_Fundmanager` confirmed.

**5.5c `read_data`** (KS-981)
Happy path **P**: `SELECT TOP 5 …` → 5 rows. Invalid input **P**: DROP → `SECURITY_VALIDATION_FAILED`. VULN probe **F**: VULN-01 (sys.tables join bypass) and VULN-02 (2143 rows / ~28 MB unbounded SELECT) — **expected open** per guide v1.5 §1.5 ([KS-1023](https://gendvn.atlassian.net/browse/KS-1023), [KS-1024](https://gendvn.atlassian.net/browse/KS-1024)).

**5.6 Search — `search_aloha_funds`** (KS-982)
All cells **S**: tool permanently removed 2026-05-07; absent from v1.5 10-tool inventory and Cursor registry.

**5.6 Text analysis — `llm_text_analysis`** (KS-983)
Happy path **B**: Anthropic 404 — model `claude-3-5-sonnet-20240620` not_found ([KS-1002](https://gendvn.atlassian.net/browse/KS-1002)). Invalid input **P**: explicit structured error, not silent success. Scenario 3 short text **n/a**.

---

## v1.5 mandatory checks

| v1.5 Rule | Status |
|---|---|
| 5.6 Search — all scenario cells **S** (tool removed) | ✅ Satisfied (KS-982) |
| 5.5 — tools restored; VULN-01/02 probed | ✅ Probed — **F** (open, expected) |
| 5.1 Large dataset = n/a | ✅ n/a in row |
| 10-tool inventory acknowledged | ✅ KS-977 §A + per-row reports |
| `read_data` HIGH risk documented separately | ✅ 5.5a/b/c split + VULN column |

---

## Cross-agent comparison — Cursor vs Claude (Third Time Test, 2026-05-21)

| Row | Cursor (this rollup) | Claude Third Time Test |
|---|---|---|
| 5.1 Auth | **P** / P* / n/a | **B** (server disconnected) |
| 5.2 Fund fetch | **P** / **P** | **B** / P (disconnect only) |
| 5.3 Documents | **P** / **P** | **B** / P |
| 5.4 Activity/Notes | **P** / **P** | **B** / P |
| 5.5 Tabular read | **P** / **P** / **F** VULN | **B** (all cells — disconnected) |
| 5.6 Search | **S** (all) | **S** (all) |
| 5.6/5.7 LLM analysis | **B** / **P** error | **B** (dual blocker: disconnect + KS-1002) |

**Key insight:** Claude Third Time Test could not execute live tool calls (MCP not connected in Cowork session). Cursor with **`user-conceptia-dynamo` Connected** completed the full v1.5 functional surface except LLM happy path (KS-1002) and permanently removed search tool (KS-982).

---

## Enumeration baseline (v1.5 — 10 tools)

| # | Tool | Matrix row | Cursor 3rd run status |
|---|---|---|---|
| 1 | `get_funds` | 5.1 | ✅ **P** |
| 2 | `get_fund_description` | 5.2 | ✅ **P** |
| 3 | `get_documents` | 5.3 | ✅ **P** |
| 4 | `get_activity` | 5.4 | ✅ **P** |
| 5 | `get_notes` | 5.4 | ✅ **P** |
| 6 | `analyze_notes` | 5.4 | ✅ **P** (`limit: 5`) |
| 7 | `llm_text_analysis` | 5.6 Text | ⚠️ **B** (KS-1002) |
| 8 | `list_table` | 5.5a | ✅ **P** |
| 9 | `describe_table` | 5.5b | ✅ **P** |
| 10 | `read_data` | 5.5c | ✅ **P** happy / **F** VULN |
| — | `get_rating_details` | — | ❌ Removed 2026-05-07 |
| — | `get_rating_summary` | — | ❌ Removed 2026-05-07 |
| — | `search_aloha_funds` | 5.6 Search | ❌ Removed — **S** |

---

## Open blockers — action required

| Priority | Blocker | Affects | Action |
|---|---|---|---|
| 1 | KS-1002 — LLM provider (model 404 / credits) | Row 5.6 Text analysis | Rotate Anthropic model slug, top up credits, or configure OpenAI key on MCP host |
| 2 | VULN-01 (KS-1023 — Critical) | Row 5.5c VULN probe | Vendor fix: validate ALL tables in `read_data` query, not first only |
| 3 | VULN-02 (KS-1024 — High) | Row 5.5c VULN probe | Vendor fix: enforce server-side row cap on `read_data` |
| 4 | F-06 (second Entra identity) | Unauthorized columns 5.1, 5.3, 5.4 | Provision low-scope test identity |
| 5 | KS-977 Scenario 3 | Edge case 0 / &lt;5 funds | Same as F-06 — restricted test account |

---

## Comparison — Section 6 Matrix across test runs (Cursor)

| Row | First (v1.4) | Second (v1.4) | Third — Cursor (v1.5) |
|---|---|---|---|
| 5.1 Auth | P | P | **P** |
| 5.2 Fund fetch | P | P | **P** |
| 5.3 Documents | P | P | **P** |
| 5.4 Activity/Notes | P | P | **P** |
| 5.5 Tabular read | P | **S** (tools absent) | **P** + **F** VULN |
| 5.6 Search | P | **S** (removed) | **S** |
| 5.6/5.7 LLM | B (no key) | B (credits) | **B** (model 404) |

---

## Verdict

**Cursor section 6 rollup: Complete for Third Time Test (guide v1.5).**

Functional coverage **PASS** on rows 5.1–5.4 and 5.5a–5.5c happy path. **F** on VULN probes is expected open-finding tracking, not a regression. **S** on search tool is by design. **B** on LLM analysis requires [KS-1002](https://gendvn.atlassian.net/browse/KS-1002) vendor resolution before happy-path re-run.

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-993 Jira — **Updated requirements — guide v1.5 (10-tool MCP inventory)** · Guide: `dynamo-mcp-testing-guide_v1.5.md` · Evidence: KS-977 through KS-983 Cursor Third Time Test reports (this folder)*
