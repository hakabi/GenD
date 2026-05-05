# KS-985 — Consolidated QA Result (Dynamo MCP INJ Suite)

| Field | Value |
|--------|--------|
| **Ticket** | [KS-985](https://gendvn.atlassian.net/browse/KS-985) — Dynamo MCP Security QA: INJ suite (SQL, command, path, SSRF, JSON, types) |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing |
| **Overall status** | **PARTIAL PASS — 2 security findings, 1 environment blocker** |
| **Execution date** | 2026-04-28 (Claude full re-run + Cursor MCP session) |
| **MCP surface** | `https://mcp.conceptia.com/dynamo/sse` (per `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` · v1.3) |
| **Methodology** | **Black-box** testing **only** through the MCP surface; behavior judged from **tool outputs** and OAuth success — **no Dynamo UI** cross-checks (guide section 1, section 1.1). |
| **Sources merged** | **Claude** — *KS-985 - Claude_Report.md* (full INJ suite, 12/13 tools, FINDING-01/02, coverage matrix). **Cursor** — *KS-985 - Cursor Result.md* (`user-conceptia-dynamo`, supplementary vectors, artifact references). |

---

## 1. Alignment with the testing guide

This consolidated result is structured against **Dynamo MCP Server — QA Testing Guide v1.3** (`Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md`).

| Guide reference | How this report applies it |
|-----------------|----------------------------|
| **section 1.1 Black-box rule** | All verdicts are from MCP tool responses; upstream Dynamo is treated as opaque. |
| **section 1.3 Tool inventory** | All **13** registered tools are named; execution covered **12** of 13 (`llm_text_analysis` blocked — see B-1). |
| **section 1.4 High-risk tools** | `list_table`, `describe_table`, and `read_data` are tracked separately; `read_data` ties to **FINDING-01**. |
| **section 2.4 Multi-client testing** | **Claude** and **Cursor** were used — meets the guide’s recommendation to test on more than one MCP client. |
| **section 7.2 INJ** | INJ-01 … INJ-06 map to the guide’s injection/validation categories; LLM-mediated paths remain partially untested while B-1 applies. |
| **section 8 What to log** | Detailed payloads and outcomes are retained in source reports; this file summarizes pass/fail and findings. |
| **section 11 Exit criteria** | Ticket **cannot** be signed off as fully passed until open security findings are remediated and documented (guide: failures need **documented ticket + severity**). |

---

## 2. Executive summary

**Claude** re-ran the full adversarial suite (**30+** distinct payloads, INJ-01 … INJ-06) against **12 of 13** tools. **Cursor** executed overlapping and additional spot checks via `user-conceptia-dynamo` (validation edge cases, Elasticsearch behavior, staged large payloads).

**Safe behavior (where exercised):** Parameterized-query tools handled SQL-looking, path-style, SSRF-style, oversized, and type-mismatch inputs without crashes (no observed 500s exposing internals), **no shell execution**, **no arbitrary filesystem reads** from traversal strings, and **no successful internal HTTP fetch** attributable to DB-layer payloads. `describe_table` rejects dangerous characters in `tableName`. `get_rating_details` with **`id`** injection **plus valid user email** returns **0 rows** — **not vulnerable** (user-scoped filter).

**Two security findings remain open:**

| ID | Severity | Tool | Summary |
|----|----------|------|---------|
| **FINDING-01** | Medium | `read_data` | Unrestricted reads of SQL Server **system catalog** (`sysobjects` → **2,171** rows; `information_schema.tables` → **2,265** rows) — full schema enumeration. |
| **FINDING-02** | High | `get_rating_summary` | **SQL injection** via **`id`**: payload `' OR '1'='1` returned **76** real manager rating records (names, scores) — proprietary research data exposure. |

**Environment blocker:** `llm_text_analysis` — **`Missing ANTHROPIC_API_KEY`** in both sessions — **INJ-02** (LLM path) and **LLM-channel INJ-04** not fully exercised (**B-1**).

**Cursor-specific gaps (non-blocking for core verdicts):** Staged **~25k** JSON not replayed end-to-end (**INJ-05** stress evidence incomplete); **`get_rating_details`** adversarial run **without** `user` / **`MCP_DEFAULT_USER_EMAIL`** was **not** completed in Cursor — **superseded for INJ-01 on that tool** by Claude’s passing result **with** user scope.

---

## 3. Test scope & environment (merged)

| Item | Detail |
|------|--------|
| Tools exercised | **12 / 13** (all except blocked LLM tool — full matrix in Claude report) |
| Blocked | `llm_text_analysis` — API key (**B-1**) |
| Claude testing method | Black-box, tool outputs only |
| Cursor client | Conceptia Dynamo MCP in Cursor; artifacts under `Test Result/` (`inj05_args.json`, `inj05_900.json`, `oversized_search.json`, etc.) — synthetic payloads; avoid pasting secrets into tickets |

---

## 4. Tool coverage matrix (consolidated)

The matrix below follows the **full** Claude re-run and adds **Cursor** notes where they add distinct evidence.

| # | Tool | Baseline | INJ-01 SQL | INJ-02 Cmd | INJ-03 Path | INJ-04 SSRF | INJ-05 Size | INJ-06 Types | Notes |
|---|------|----------|------------|------------|-------------|-------------|-------------|--------------|-------|
| 1 | `get_funds` | ✅ | ✅ | — | — | — | ✅ | ✅ (OBS-1) | Cursor: `limit` `"fifty"` validation |
| 2 | `get_documents` | ✅ | ✅ | — | ✅ | ✅ | ✅ | — | |
| 3 | `analyze_notes` | ✅ | ✅ | ✅ | — | — | ✅ | ✅ | |
| 4 | `get_notes` | ✅ | ✅ | — | — | ✅ | — | — | Cursor: URL-like `companyNames` |
| 5 | `get_activity` | ✅ | ✅ | — | ✅ | — | — | — | |
| 6 | `get_fund_description` | ✅ | ✅ | — | — | — | — | — | |
| 7 | `read_data` | ✅ | ⚠️ **FINDING-01** | — | — | — | ✅ | — | Cursor: UNION/non-SELECT blocked |
| 8 | `list_table` | ✅ | — | — | — | — | — | ✅ | Cursor: invalid schema |
| 9 | `describe_table` | ✅ | ✅ | — | ✅ | — | — | ✅ | Cursor + Claude validation |
| 10 | `get_rating_summary` | ✅ | 🔴 **FINDING-02** | — | — | — | — | — | |
| 11 | `get_rating_details` | ✅ | ✅ | — | — | — | — | — | Injection + **user** → 0 rows |
| 12 | `search_aloha_funds` | ✅ | ✅ NOTE* | — | — | — | ✅ | — | Cursor: ES **400** on URL-like text |
| 13 | `llm_text_analysis` | ❌ BLOCKED | ❌ BLOCKED | ❌ BLOCKED | — | ❌ BLOCKED | — | — | **B-1** |

\* **`search_aloha_funds`** with `' OR '1'='1` returning many hits is **not** SQL injection — Elasticsearch tokenizes/literals (**Claude**). Cursor observed **query parse failure (400)** on URL-like `search_text` — **PASS** as no SSRF completion in response.

---

## 5. Baseline — Scenario 1 (happy path)

| Session | Evidence | Verdict |
|---------|----------|---------|
| **Claude** | `get_funds` — **981** funds; `list_table`; `describe_table` (`Fund`); `read_data` `SELECT TOP 1 * FROM Fund`; `get_rating_summary` / `get_rating_details` baseline | Pass |
| **Cursor** | `get_funds` limit 2; `read_data` `SELECT 1`; `search_aloha_funds` (`ab`); `list_table` `{}`; `get_rating_summary` `id` `"999999999"` empty | Pass |

---

## 6. INJ suite — consolidated outcomes

### 6.1 INJ-01 — SQL injection

- **Parameterized tools:** Safe — literals / parameterized behavior (**Claude** comprehensive; **Cursor** confirmed `get_funds`, validation on `read_data`).
- **`read_data`:** Destructive patterns blocked (`@@version`, `DROP`, malformed **UNION**) — **FINDING-01** for **catalog** SELECTs (`sysobjects`, `information_schema.tables`).
- **`get_rating_summary`:** 🔴 **FINDING-02** — `' OR '1'='1` on **`id`** dumps **76** rows.
- **`get_rating_details`:** ✅ **PASS** — same injection with **user email** → **0 rows** (**Claude**).

### 6.2 INJ-02 — Command injection

| Tool | Outcome |
|------|---------|
| `analyze_notes` | ✅ PASS (**both**) |
| `llm_text_analysis` | ❌ **UNTESTED** — **B-1** |

### 6.3 INJ-03 — Path traversal

✅ **PASS** — Traversal strings treated as literals (**Claude** full set; **Cursor** Windows-style on `get_documents`).

### 6.4 INJ-04 — SSRF / URL-like input

✅ **PASS** on DB-backed filters (**Claude**). **`search_aloha_funds`**: Cursor saw ES parse/query error (**400**) — acceptable PASS (no SSRF signal). LLM channel: **partial** (**B-1**).

### 6.5 INJ-05 — Oversized / boundary

✅ **PASS** for executed cases (1k `fundName`, ~800-char LIKE, limits, 50-element arrays, ~900-char search — **Claude** + **Cursor**). **PARTIAL** — staged **~25k** JSON not invoked via Cursor agent (**Cursor** caveat).

### 6.6 INJ-06 — Wrong types / schema

✅ **PASS** — Negative limits, invalid dates, invalid `tableName` / schema, **`vintage` non-year** → **OBS-1** (silent 0 rows, informational).

---

## 7. High-risk tool checklist (guide section 1.4)

| Tool | Consolidated outcome |
|------|------------------------|
| `list_table` | Baseline enumerates tables (expected); invalid schema handled (**Cursor**) — ✅ |
| `describe_table` | Invalid / injection-like names rejected — ✅ |
| `read_data` | Malicious patterns blocked; **FINDING-01 OPEN** — catalog reads still execute — ⚠️ |

---

## 8. Security findings (full)

### FINDING-01 — Medium: System catalog readable via `read_data`

**Description:** Blocklist stops obvious destructive patterns but **not** SQL Server system catalog reads.

**Evidence:** `SELECT * FROM sysobjects WHERE xtype='U'` → **2,171** rows; `SELECT * FROM information_schema.tables` → **2,265** rows.

**Risk:** Full database structure enumeration for authenticated callers — aids targeted exfiltration.

**Recommendation:** Extend `read_data` denials for `sysobjects`, `sys.*`, `information_schema.*`, and/or restrict DB principal to application schema (defence in depth).

---

### FINDING-02 — High: SQL injection in `get_rating_summary` (`id`)

**Description:** **`id`** appears concatenated into SQL; boolean tautology returns **all** rating rows.

**Evidence:** `id = "' OR '1'='1"` → **76** manager rating records (names, edge / organization / track_record / total_rating / average_conviction).

**Risk:** Confidential investment research exposed to any authenticated MCP caller.

**Note:** `get_rating_details` with the **same** payload **and** valid **`user`** → **0 rows** — **not vulnerable** (user-scoped filter).

**Recommendation:** **Parameterize `id`** in `get_rating_summary` immediately; required before KS-985 can be marked Done from a security perspective.

---

### OBS-1 — Informational: `get_funds` `vintage` non-year

`vintage = "not-a-year"` → 0 results, no validation error — UX only (**Claude**).

---

## 9. Blockers and gaps

| ID | Item | Impact |
|----|------|--------|
| **B-1** | `llm_text_analysis` — no `ANTHROPIC_API_KEY` | INJ-02 (LLM) and LLM INJ-04 **untested** |
| **B-2** | **FINDING-01** — `read_data` catalog access | Remediation before security sign-off |
| **B-3** | **FINDING-02** — `get_rating_summary` SQLi | High; must fix before DoD |

**Evidence gaps (informational):** Very large (**~25k**) JSON replay (**Cursor**); optional Cursor re-test of `get_rating_details` with env `user` if extra client-specific evidence is desired (Claude already demonstrated pass with user).

---

## 10. Definition of Done (consolidated)

| Criterion | Status |
|-----------|--------|
| Adversarial SQL → safe on **parameterized** tools | ✅ Met |
| No command execution via SQL-backed tools | ✅ Met |
| Path inputs → no arbitrary file reads | ✅ Met |
| SSRF — DB / ES surfaces tested | ✅ Met · LLM ❌ Not tested (**B-1**) |
| Oversized input — graceful (tested ranges) | ✅ Met · **PARTIAL** at extreme JSON |
| Wrong types → validation where exercised | ✅ Met (OBS-1 noted) |
| No 500s exposing internals (documented runs) | ✅ Met |
| **FINDING-01** remediation | ❌ Not met |
| **FINDING-02** remediation | ❌ Not met |

---

## 11. Summary verdict matrix

| INJ ID | Category | Consolidated verdict |
|--------|-----------|---------------------|
| INJ-01 | SQL injection | ✅ Parameterized tools · ⚠️ **FINDING-01** (`read_data`) · 🔴 **FINDING-02** (`get_rating_summary`) · ✅ `get_rating_details` with user |
| INJ-02 | Command injection | ✅ SQL-backed · ❌ LLM **UNTESTED** (**B-1**) |
| INJ-03 | Path traversal | ✅ PASS |
| INJ-04 | SSRF | ✅ DB/ES · ❌ LLM **PARTIAL** (**B-1**) |
| INJ-05 | Oversized input | ✅ Tested range · ⚠️ **PARTIAL** (~25k staged) |
| INJ-06 | Wrong types | ✅ PASS (OBS-1) |

---

## 12. Recommended next steps

1. **Immediate:** Fix **FINDING-02** — parameterize **`id`** in `get_rating_summary`.
2. **Short-term:** Fix **FINDING-01** — block catalog reads or restrict DB role.
3. Configure **`ANTHROPIC_API_KEY`** and re-run **INJ-02** and LLM **INJ-04**.
4. Optionally replay **~25k** payload with a scripted MCP client for INJ-05 closure.
5. After **B-1**, **B-2**, **B-3** addressed, re-evaluate KS-985 for **Done**.

---

## 13. Reference documents

| Document | Role |
|----------|------|
| `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` | Official scope, section 1.3 inventory, section 1.4 high-risk tools, section 7.2 INJ, multi-client guidance |
| `Dynamo Server/Test Result/KS-985 - Claude_Report.md` | Full re-run matrices, payloads, FINDING-01/02 detail, reproduction steps |
| `Dynamo Server/Test Result/KS-985 - Cursor Result.md` | Cursor-only vectors, ES 400 behavior, validation edge cases, artifact paths |

---

*Consolidated report updated 2026-04-28 — merges Claude (full suite) + Cursor (supplementary) against KS-985 and testing guide v1.3.*
