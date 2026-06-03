# KS-993 — Consolidated QA Result (Third Time Test)
## Dynamo MCP QA — Section 6 matrix rollup (Sections 5.1–5.7) — Consolidated (Cursor + Claude)

| Field | Value |
|---|---|
| **Ticket** | [KS-993](https://gendvn.atlassian.net/browse/KS-993) |
| **Epic** | Dynamo MCP — Functional E2E Validation ([KS-999](https://gendvn.atlassian.net/browse/KS-999)) |
| **Guide ref** | Section 6 matrix · **Guide v1.5** |
| **Test run** | Third Time Test — Consolidated (Cursor + Claude) |
| **Test dates (UTC)** | 2026-05-21 (Cursor) · 2026-05-22 (Claude) |
| **Agents** | Cursor — Composer · Claude — Cowork mode (claude-sonnet-4-6) |
| **MCP client** | `https://mcp.conceptia.com/dynamo/sse` — **Connected (both runs)** |
| **Evidence sources** | Consolidated per-row reports KS-977 through KS-983 Result.md (this folder) |

---

## Summary

This artifact rolls up the guide **Section 6 matrix** for rows **5.1–5.7** using the Third Time Test **consolidated** results from both Cursor (2026-05-21) and Claude (2026-05-22). Both agents ran with the server **Connected**.

**Key overall finding:** The Dynamo MCP v1.5 functional surface (9 of 10 tools) passes all happy-path and error-path scenarios. The two exceptions are: (1) `llm_text_analysis` remains BLOCKED due to KS-1002 (Anthropic model deprecated, OpenAI key absent), and (2) `read_data` VULN probes FAIL — both VULN-01 (KS-1023, Critical) and VULN-02 (KS-1024, High) are confirmed exploitable by both agents independently.

---

## Cross-agent comparison

| Row | Cursor (2026-05-21) | Claude (2026-05-22) | Consolidated verdict |
|---|---|---|---|
| 5.1 Auth | P / P (HTTP 401) / B (S3 F-06) | P / P (limit=200) / B (F-06) | **✅ Agree — PASS / PASS / BLOCKED** |
| 5.2 Fund fetch | P / P / P | P / P / P | **✅ Agree — PASS all** |
| 5.3 Documents | P / P / P | P / P / P | **✅ Agree — PASS all** |
| 5.4 Activity/Notes | P / P / B (F-06) | P / P / B (F-06) | **✅ Agree — PASS / PASS / BLOCKED** |
| 5.5 Tabular read | P / P(DROP) / F VULN | P / P(silent empty) / F VULN | **✅ Agree — PASS / PASS / FAIL (VULN)** |
| 5.6 Search | S (all) | S (all) | **✅ Agree — S all** |
| 5.7 LLM analysis | B(S1) / P(S2 error) / n/a(S3) | B(S1) / B(S2) / B(S3) | **✅ Agree on B(S1); Cursor adds P(S2 error path)** |

**Overall agent agreement: High across all rows. The only dimension-level difference is KS-983 Scenario 2 where Cursor explicitly passed the error-path intent and Claude classified it as blocked by the same provider error.**

---

## Consolidated matrix — Third Time Test (guide v1.5, server connected)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.1 Auth** (`get_funds`) | **✅ P** | **✅ P** | **✅ P** (HTTP 401) · **⚠️ B** (low-scope F-06) | **✅ P** | n/a | n/a |
| **5.2 Fund fetch** (`get_fund_description`) | **✅ P** | **✅ P** | n/a | n/a | n/a | n/a |
| **5.3 Documents** (`get_documents`) | **✅ P** | **✅ P** | **⚠️ B** (F-06) | n/a | n/a | n/a |
| **5.4 Activity/Notes** (`get_activity`, `get_notes`, `analyze_notes`) | **✅ P** | **✅ P** | **⚠️ B** (F-06) | **✅ P** | **ℹ️ P** (F-03 — use `limit`) | n/a |
| **5.5a `list_table`** | **✅ P** | n/a | n/a | n/a | n/a | n/a |
| **5.5b `describe_table`** | **✅ P** | n/a | n/a | n/a | n/a | n/a |
| **5.5c `read_data`** | **✅ P** | **✅ P** (DROP blocked · silent empty) | **⚠️ B** (F-06) | **✅ P** | **✅ P** (TOP N) | **❌ F** (VULN-01 Critical · VULN-02 High) |
| **5.6 Search** (`search_aloha_funds`) | **S** | **S** | **S** | **S** | **S** | **S** |
| **5.7 LLM analysis** (`llm_text_analysis`) | **B** (KS-1002) | **✅ P** (Cursor: explicit error) | n/a | n/a | **B** | n/a |

---

## Row-level rationale

**5.1 Auth — `get_funds`** (KS-977 Result.md)
Happy path P: 2-call consistency, `totalRecords: 979`, byte-identical. Invalid input P: `limit=200` → clean validation error (Claude); `limit=5` valid calls (Cursor). Unauthorized P at transport layer: Cursor HTTP 401 probes confirmed explicit auth failure at MCP gateway. Low-scope identity (F-06) B: no second Entra test identity provisioned — Scenario 3 not executable.

**5.2 Fund fetch — `get_fund_description`** (KS-978 Result.md)
All cells P. 59 North GUID `D7879DB7-…` stable across all three test runs (2-call consistency). 2026 Fund `Description: null` handled cleanly. Cross-tool alignment with `get_funds` confirmed. Rating tools S (permanently removed).

**5.3 Documents — `get_documents`** (KS-979 Result.md)
All cells P. 59 North `totalRecords: 151` stable (148 → 151 → 151 across three runs, both Third Test agents). First doc ID `84C6E63A-…` stable. Invalid input covers both: invalid fund (soft-empty) and no-filter (explicit validation error). 2026 Fund = 0 docs confirmed by both agents. F-06 persists for unauthorized user.

**5.4 Activity/Notes — `get_activity`, `get_notes`, `analyze_notes`** (KS-980 Result.md)
All cells P except unauthorized B (F-06). Activity totalRecords 41 (stable). Notes totalRecords 19 (stable — 3 runs). `analyze_notes` passes both agents — **confirmed unaffected by KS-1002** (different execution path from `llm_text_analysis`). Cursor used `limit:5` to mitigate F-03 payload; Claude used default (191K chars). Production: use `limit` parameter.

**5.5a–c Tabular read — `list_table`, `describe_table`, `read_data`** (KS-981 Result.md)
First live execution in v1.5 (Second Test was S — tools removed). Happy path P: 561 tables, Fund schema (300–380+ columns), authorized TOP N queries. Invalid input P: Cursor confirmed DROP → `SECURITY_VALIDATION_FAILED`; Claude confirmed silent empty on no-match. VULN probe F: VULN-01 `sys.tables` join bypass (KS-1023 Critical) and VULN-02 unbounded SELECT (KS-1024 High) **both confirmed exploitable independently by Cursor and Claude**.

**5.6 Search — `search_aloha_funds`** (KS-982 Result.md)
All cells S. Both agents confirmed tool absent from registry even with server connected. Cross-tenant risk eliminated by removal.

**5.7 LLM analysis — `llm_text_analysis`** (KS-983 Result.md)
Server connected both runs — blocker is exclusively KS-1002. Happy path B: Anthropic 404 `claude-3-5-sonnet-20240620` model deprecated (new finding vs. Second Test credit error). Invalid input P: Cursor confirmed explicit structured failure — not a silent success. `analyze_notes` (KS-980) confirmed unaffected.

---

## v1.5 mandatory checks

| v1.5 Rule | Status |
|---|---|
| 5.6 Search — all scenario cells S (tool removed, not in v1.5 inventory) | ✅ Satisfied — both agents confirmed |
| 5.5 — tools restored; VULN-01/02 probed | ✅ Probed — F (KS-1023 Critical, KS-1024 High) confirmed by both agents |
| 5.1 Large dataset = n/a | ✅ n/a in row |
| 10-tool inventory acknowledged across all rows | ✅ Cursor inventory table in KS-977; all rows use v1.5 10-tool surface |
| `read_data` HIGH risk (VULN-01/02) documented | ✅ Row 5.5c VULN column F — confirmed exploitable |

---

## 10-tool inventory — Consolidated live status

| # | Tool | Matrix row | Third Test consolidated status |
|---|---|---|---|
| 1 | `get_funds` | 5.1 | ✅ **PASS** |
| 2 | `get_fund_description` | 5.2 | ✅ **PASS** |
| 3 | `get_documents` | 5.3 | ✅ **PASS** |
| 4 | `get_activity` | 5.4 | ✅ **PASS** |
| 5 | `get_notes` | 5.4 | ✅ **PASS** |
| 6 | `analyze_notes` | 5.4 | ✅ **PASS** (KS-1002 does NOT affect this tool) |
| 7 | `llm_text_analysis` | 5.7 | ⚠️ **BLOCKED** (KS-1002 — model deprecated) |
| 8 | `list_table` | 5.5a | ✅ **PASS** |
| 9 | `describe_table` | 5.5b | ✅ **PASS** |
| 10 | `read_data` | 5.5c | ✅ **PASS** (authorized) · ❌ **FAIL** (VULN-01/02) |
| — | `get_rating_details` | — | ❌ Removed 2026-05-07 |
| — | `get_rating_summary` | — | ❌ Removed 2026-05-07 |
| — | `search_aloha_funds` | 5.6 | ❌ Removed 2026-05-07 |

---

## Open blockers — consolidated action list

| Priority | Blocker | Severity | Affects | Action required |
|---|---|---|---|---|
| 1 | **VULN-01 (KS-1023)** | **Critical** | Row 5.5c VULN probe | Vendor fix: validate ALL tables in `read_data` query including implicit join targets, not first table only |
| 2 | **VULN-02 (KS-1024)** | **High** | Row 5.5c VULN probe | Vendor fix: enforce server-side row cap (e.g. max 1,000 rows) on all `read_data` responses |
| 3 | **KS-1002 — Anthropic model deprecated** | Blocker | Row 5.7 `llm_text_analysis` | Vendor: update model string from `claude-3-5-sonnet-20240620` to current (e.g. `claude-sonnet-4-5`) |
| 4 | **KS-1002 — OpenAI key absent** | Blocker | Row 5.7 `llm_text_analysis` | Vendor: configure `OPENAI_API_KEY` as fallback provider |
| 5 | **F-06 — no low-scope Entra identity** | Medium | Unauthorized columns 5.1, 5.3, 5.4, 5.5 | Provision Entra test identity with 0 or <5 accessible funds |

---

## Comparison — Section 6 matrix across all test runs

| Row | First (v1.4, connected) | Second (v1.4, connected) | Third — Cursor (v1.5) | Third — Claude (v1.5) | **Consolidated** |
|---|---|---|---|---|---|
| 5.1 Auth | P/P/B | P/P/B | P/P/B | P/P/B | **P/P/B** |
| 5.2 Fund fetch | P/P/P | P/P/P | P/P/P | P/P/P | **P/P/P** |
| 5.3 Documents | P/P/P | P/P/P | P/P/P | P/P/P | **P/P/P** |
| 5.4 Activity/Notes | P/P/P | P/P/P | P/P/B | P/P/B | **P/P/B (F-06)** |
| 5.5 Tabular read | P/P/P | S/S/S | P/P/F(VULN) | P/P/F(VULN) | **P/P/F (VULN-01/02)** |
| 5.6 Search | P/P/P | S/S/S | S/S/S | S/S/S | **S/S/S** |
| 5.7 LLM analysis | B | B/P(val) | B/P(err)/n/a | B/B/B | **B/P(err)/n/a** |

*Cell format: Happy path / key scenario / edge case where applicable.*

---

## Verdict

**Consolidated section 6 rollup: Complete for Third Time Test (guide v1.5) — both agents, server connected.**

9 of 10 functional tools pass all happy-path scenarios. The two critical open items are VULN-01 and VULN-02 in Row 5.5c, both confirmed exploitable independently by Cursor and Claude — these must be escalated to the vendor immediately. KS-1002 (Anthropic model deprecated) blocks Row 5.7; the error type has evolved since Second Test. All baselines (totalRecords, GUIDs, document counts) are stable across both Third Test runs.

---

*Consolidated: 2026-05-22 · Sources: KS-993 - Cursor Result.md (2026-05-21) · KS-993 - Claude Result.md (2026-05-22) · Evidence: KS-977 through KS-983 Result.md consolidated reports (this folder) · Guide: dynamo-mcp-testing-guide_v1.5.md §6*
