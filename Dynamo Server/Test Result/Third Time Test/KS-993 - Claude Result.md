# KS-993 — Claude QA Result (Third Time Test — Live Retest)
## Dynamo MCP QA — Section 6 matrix rollup (Sections 5.1–5.7) — Claude agent

| Field | Value |
|---|---|
| **Ticket** | [KS-993](https://gendvn.atlassian.net/browse/KS-993) |
| **Epic** | Dynamo MCP — Functional E2E Validation ([KS-999](https://gendvn.atlassian.net/browse/KS-999)) |
| **Guide ref** | Section **6** matrix · **Guide v1.5** |
| **Test run** | Third Time Test — Live Retest (server reconnected) |
| **Test date (UTC)** | 2026-05-22 |
| **Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP client** | Claude Cowork + `https://mcp.conceptia.com/dynamo/sse` |
| **Evidence sources** | Per-row Claude Third Time Test reports (this folder) |

---

## Summary

This artifact rolls up the guide **section 6 matrix** columns for rows **5.1–5.7** using the Claude Third Time Test Live Retest reports produced in this engagement (2026-05-22). All rows are based on the **v1.5 10-tool inventory** with the Dynamo MCP server **connected and live**.

**Overall Third Time Test (Live Retest) finding:** The Dynamo MCP server reconnected mid-session on 2026-05-22. All functional tools executed live. The results are a significant improvement over the BLOCKED-only Third Time Test initial run.

**Key outcomes:**

- **Rows 5.1–5.4 (get_funds, get_fund_description, get_documents, get_activity/get_notes/analyze_notes):** All happy-path scenarios **PASS**. Baselines confirmed stable. S3 unauthorized-user checks remain blocked (F-06 — no second Entra identity provisioned).
- **Row 5.5 (list_table, describe_table, read_data):** Happy path **PASS** — tools restored in v1.5 and functional. VULN probe **FAIL** — VULN-01 (KS-1023 Critical) and VULN-02 (KS-1024 High) both confirmed exploitable.
- **Row 5.6 (search_aloha_funds):** All cells **S** — tool permanently removed.
- **Row 5.7 (llm_text_analysis):** All cells **B** — KS-1002 persists. **New finding:** Anthropic model `claude-3-5-sonnet-20240620` deprecated since Second Test (404 error). OpenAI key still absent.

---

## Evidence sources (Third Time Test — Live Retest)

| Row | Story | Claude Third Time Test report |
|---|---|---|
| 5.1 | [KS-977](https://gendvn.atlassian.net/browse/KS-977) | `KS-977 - Claude Result.md` |
| 5.2 | [KS-978](https://gendvn.atlassian.net/browse/KS-978) | `KS-978 - Claude Result.md` |
| 5.3 | [KS-979](https://gendvn.atlassian.net/browse/KS-979) | `KS-979 - Claude Result.md` |
| 5.4 | [KS-980](https://gendvn.atlassian.net/browse/KS-980) | `KS-980 - Claude Result.md` |
| 5.5 | [KS-981](https://gendvn.atlassian.net/browse/KS-981) | `KS-981 - Claude Result.md` |
| 5.6 | [KS-982](https://gendvn.atlassian.net/browse/KS-982) | `KS-982 - Claude Result.md` |
| 5.7 | [KS-983](https://gendvn.atlassian.net/browse/KS-983) | `KS-983 - Claude Result.md` |

**Legend:** **P** = pass · **F** = fail · **S** = skipped (documented, not applicable) · **B** = blocked (documented, actionable) · **n/a** = guide not applicable for this row/column

---

## Matrix — Claude Third Time Test Live Retest (2026-05-22, guide v1.5)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.1 Auth** (`get_funds`) | **✅ P** | **✅ P** | ⚠️ B (F-06) | **✅ P** | n/a | n/a |
| **5.2 Fund fetch** (`get_fund_description`) | **✅ P** | **✅ P** | n/a | **✅ P** | n/a | n/a |
| **5.3 Documents** (`get_documents`) | **✅ P** | **✅ P** | ⚠️ B (F-06) | **✅ P** | n/a | n/a |
| **5.4 Activity/Notes** (`get_activity`, `get_notes`, `analyze_notes`) | **✅ P** | **✅ P** | ⚠️ B (F-06) | **✅ P** | **ℹ️ P** (F-03) | n/a |
| **5.5 Tabular read** (`list_table`, `describe_table`, `read_data`) | **✅ P** | **✅ P** (F-01) | ⚠️ B (F-06) | **✅ P** | **✅ P** (TOP N) | **❌ F** (VULN-01 Critical, VULN-02 High) |
| **5.6 Search** (`search_aloha_funds`) | **S** | **S** | **S** | **S** | **S** | **S** |
| **5.7 LLM analysis** (`llm_text_analysis`) | **B** (KS-1002) | **B** (KS-1002) | n/a | n/a | **B** (KS-1002) | n/a |

---

## Row-level rationale

**5.1 Auth — `get_funds`** (KS-977)
Happy path P: `totalRecords: 979` (stable, +1 from Second Test). Byte-identical on 2 sequential calls. Invalid input P: `limit=200` → clean validation error. Unauthorized user B (F-06): no low-scope test identity provisioned.

**5.2 Fund fetch — `get_fund_description`** (KS-978)
Happy path P: 59 North GUID `D7879DB7-E230-4191-8849-DE4B7B64626C` stable across all three runs. Invalid input P: not-found fund → `success: true, data: []` (F-02 soft-empty, by design). Null Description P: 2026 Fund `Description: null` handled cleanly. Rating tools S (permanently removed).

**5.3 Documents — `get_documents`** (KS-979)
Happy path P: 59 North `totalRecords: 151` stable (unchanged across 3 runs). 2-call consistency confirmed. Invalid input P: no-filter → mandatory-filter validation error, no internals. Null-doc fund P: 2026 Fund → `totalRecords: 0`, no cross-fund leakage.

**5.4 Activity/Notes — `get_activity`, `get_notes`, `analyze_notes`** (KS-980)
Happy path P: `get_activity` totalRecords 41 (stable), `get_notes` totalRecords 19 (stable — 3 runs), `analyze_notes` success=true 191,017-char structured response. **KS-1002 does NOT affect `analyze_notes`** — confirmed in this run. Unauthorized user B (F-06). Large dataset P with F-03 note (~191K payload — use `limit`).

**5.5 Tabular read — `list_table`, `describe_table`, `read_data`** (KS-981)
**First live test run under v1.5 (tools restored from removal).** Happy path P: 561 tables listed, Fund schema returned (380+ columns), authorized query returns 1 row with GUID matching KS-978 baseline. Error path P: invalid table → silent empty (F-01 carry-forward). VULN probe F: VULN-01 `sys.tables` data returned via implicit cross-join (KS-1023 Critical); VULN-02 full Fund table 28,688,411 chars returned unblocked (KS-1024 High). Both CONFIRMED EXPLOITABLE.

**5.6 Search — `search_aloha_funds`** (KS-982)
All cells S: tool permanently removed 2026-05-07. Server reconnection confirmed tool still absent. Cross-tenant risk eliminated.

**5.7 LLM analysis — `llm_text_analysis`** (KS-983)
All cells B: server IS connected — blocker is exclusively KS-1002. **New finding this run:** Anthropic model `claude-3-5-sonnet-20240620` has been deprecated (404 model-not-found), evolving from the credit-error (402) seen in Second Test. `OPENAI_API_KEY` still absent. Vendor must update model string to a current Anthropic model + ensure billing, or configure OpenAI.

---

## v1.5 Mandatory checks

| v1.5 Rule | Status |
|---|---|
| 5.6 — all scenario cells **S** (tool removed, not in v1.5 inventory) | ✅ Satisfied |
| 5.5 — tools restored to v1.5 inventory; VULN-01/02 probes required | ✅ Probes executed — both FAIL (KS-1023 Critical, KS-1024 High) |
| 5.1 Large dataset = n/a | ✅ n/a in row |
| 10-tool inventory acknowledged across all rows | ✅ All rows use v1.5 10-tool surface |
| `read_data` HIGH risk (VULN-01/02) documented | ✅ Row 5.5 VULN column populated |

---

## Open blockers — action required

| Priority | Blocker | Affects | Action |
|---|---|---|---|
| 1 | **VULN-01 (KS-1023 — Critical)** | Row 5.5 VULN probe | Vendor fix: block or sanitize implicit cross-join queries targeting non-allowlisted tables |
| 2 | **VULN-02 (KS-1024 — High)** | Row 5.5 VULN probe | Vendor fix: enforce server-side row limit (e.g., max 1,000 rows) on all `read_data` responses |
| 3 | KS-1002 — Anthropic model deprecated | Row 5.7 `llm_text_analysis` | Vendor: update model string from `claude-3-5-sonnet-20240620` to current model + ensure credits |
| 4 | KS-1002 — OpenAI key absent | Row 5.7 `llm_text_analysis` | Vendor: configure `OPENAI_API_KEY` as fallback provider |
| 5 | F-06 — no low-scope test identity | Rows 5.1, 5.3, 5.4, 5.5 Unauthorized column | Provision Entra test identity with 0 or <5 funds |

---

## Enumeration baseline

[KS-991](https://gendvn.atlassian.net/browse/KS-991) (Section 4.1–4.2) remains the authoritative tool-count baseline. The v1.5 inventory of 10 confirmed live tools:

| # | Tool | Row | v1.5 live status |
|---|---|---|---|
| 1 | `get_funds` | 5.1 | ✅ Available — PASS |
| 2 | `get_fund_description` | 5.2 | ✅ Available — PASS |
| 3 | `get_documents` | 5.3 | ✅ Available — PASS |
| 4 | `get_notes` | 5.4 | ✅ Available — PASS |
| 5 | `get_activity` | 5.4 | ✅ Available — PASS |
| 6 | `analyze_notes` | 5.4 | ✅ Available — PASS (KS-1002 does NOT block) |
| 7 | `llm_text_analysis` | 5.7 | ✅ Registered — BLOCKED (KS-1002: model 404) |
| 8 | `describe_table` | 5.5 | ✅ Available (restored in v1.5) — PASS |
| 9 | `list_table` | 5.5 | ✅ Available (restored in v1.5) — PASS |
| 10 | `read_data` | 5.5 | ✅ Available (restored in v1.5) — PASS (authorized) / FAIL (VULN-01/02) |
| — | `get_rating_details` | — | ❌ Removed 2026-05-07 |
| — | `get_rating_summary` | — | ❌ Removed 2026-05-07 |
| — | `search_aloha_funds` | 5.6 | ❌ Removed 2026-05-07 |

---

## Comparison — Section 6 Matrix Across Test Runs

| Row | First Test (v1.4, connected) | Second Test (v1.4, connected) | Third Test Initial (v1.5, disconnected) | Third Test Live Retest (v1.5, connected) |
|---|---|---|---|---|
| 5.1 Auth | P / P / B | P / P / B | **B / P** | **✅ P / P / B (F-06)** |
| 5.2 Fund fetch | P / P / P | P / P / P | **B / P / B** | **✅ P / P / P** |
| 5.3 Documents | P / P / P | P / P / P | **B / P / B** | **✅ P / P / B (F-06)** |
| 5.4 Activity/Notes | P / P / P | P / P / P | **B / P / B** | **✅ P / P / B (F-06)** |
| 5.5 Tabular read | P / P / P | **S / S / S** (removed) | **B** (restored, disconnected) | **✅ P / P / ❌ F (VULN-01/02)** |
| 5.6 Search | P / P / P | **S / S / S** (removed) | **S / S / S** | **S / S / S** |
| 5.7 LLM analysis | B (no key) | B (credits) / P (validation) | **B** (dual blocker) | **B** (KS-1002 — model 404) |

*Cell format: Happy path / key scenario / edge case where applicable.*

---

## Verdict

**Claude section 6 rollup: Complete for Third Time Test Live Retest (guide v1.5) — live server, all tools executed.**

The majority of the v1.5 functional surface PASSes. The two critical open items are the VULN-01 and VULN-02 findings in Row 5.5 (both confirmed exploitable), and the KS-1002 model-deprecation issue in Row 5.7. All other rows pass their happy-path and error-path scenarios. totalRecords baselines are stable across all three test runs.

---

*Generated: 2026-05-22 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-993 v1.5 live retest · Guide: dynamo-mcp-testing-guide_v1.5.md · Evidence: KS-977 through KS-983 Third Time Test Live Retest Claude reports (this folder)*
