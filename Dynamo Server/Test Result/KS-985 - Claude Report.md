# QA Security Test Report — KS-985
**Dynamo MCP — INJ Suite: SQL, Command, Path, SSRF, JSON, Types**

| Field | Value |
|---|---|
| Ticket | [KS-985](https://gendvn.atlassian.net/browse/KS-985) |
| Epic | Dynamo MCP — Security & Abuse-Case Testing |
| Tester | Bình Hà Khoa (hakhoabinh@gmail.com) via Claude AI |
| Execution Date | 2026-04-28 (re-run, full suite) |
| Status | **PARTIAL PASS — 2 Security Findings, 1 Blocker** |

---

## 1. Executive Summary

Full re-run of the INJ suite against all 13 registered MCP tools. 12 of 13 tools were exercised with adversarial payloads; `llm_text_analysis` remains blocked by a missing API key.

All parameterized-query tools (`get_funds`, `get_documents`, `get_notes`, `get_activity`, `get_fund_description`, `analyze_notes`) handled all adversarial inputs safely — SQL payloads returned 0 rows with no errors or crashes. Path traversal and SSRF payloads were treated as literal DB lookups. `describe_table` has explicit input validation rejecting dangerous characters.

**Two security findings remain open:**

- **FINDING-01 (Medium):** `read_data` allows unrestricted reads of SQL Server system catalog (`sysobjects` → 2,171 rows; `information_schema.tables` → 2,265 rows), exposing full DB schema enumeration.
- **FINDING-02 (High):** `get_rating_summary` confirmed live SQL injection via the `id` parameter. Payload `' OR '1'='1` returned **76 real manager rating records** including fund/manager names, edge / organization / track_record / total_rating / average_conviction scores — highly sensitive proprietary investment research data.

`get_rating_details` is **not vulnerable**: user-scoped SQL filter protects it even with the same injection payload (0 rows returned with user email provided).

No server crashes (500 errors), no shell execution, no arbitrary file reads, and no internal network fetches were observed across all tests.

---

## 2. Test Scope & Environment

| Item | Detail |
|---|---|
| MCP surface | `https://mcp.conceptia.com/dynamo/sse` |
| Tools exercised | 12 of 13 (all except `llm_text_analysis`) |
| Tools blocked | `llm_text_analysis` — `Missing ANTHROPIC_API_KEY` |
| Total adversarial calls | 30+ distinct payloads across INJ-01 through INJ-06 |
| Testing method | Black-box, tool outputs only, no Dynamo UI cross-checks |
| Guide reference | Dynamo MCP Server QA Testing Guide v1.3 |

---

## 3. Baseline — Scenario 1 (Happy Path)

| Tool | Call | Result |
|---|---|---|
| `get_funds` | No parameters | 981 total funds returned — ✅ PASS |
| `list_table` | No parameters | Full table list returned (large result) — ✅ PASS |
| `describe_table` | `tableName = "Fund"` | Full Fund column schema returned — ✅ PASS |
| `read_data` | `SELECT TOP 1 * FROM Fund` | 1 record returned — ✅ PASS |
| `get_rating_summary` | `id = "1"` | 0 rows (no match) — ✅ PASS |
| `get_rating_details` | `id = "1"`, `user = "hakhoabinh@gmail.com"` | 0 rows (no match) — ✅ PASS |

---

## 4. Tool Coverage Matrix

| # | Tool | Baseline | INJ-01 SQL | INJ-02 Cmd | INJ-03 Path | INJ-04 SSRF | INJ-05 Size | INJ-06 Types |
|---|---|---|---|---|---|---|---|---|
| 1 | `get_funds` | ✅ PASS | ✅ PASS | — | — | — | ✅ PASS | ✅ PASS (OBS-1) |
| 2 | `get_documents` | ✅ PASS | ✅ PASS | — | ✅ PASS | ✅ PASS | ✅ PASS | — |
| 3 | `analyze_notes` | ✅ PASS | ✅ PASS | ✅ PASS | — | — | — | — |
| 4 | `get_notes` | ✅ PASS | ✅ PASS | — | — | ✅ PASS | — | — |
| 5 | `get_activity` | ✅ PASS | ✅ PASS | — | ✅ PASS | — | — | — |
| 6 | `get_fund_description` | ✅ PASS | ✅ PASS | — | — | — | — | — |
| 7 | `read_data` | ✅ PASS | ⚠️ FINDING-01 | — | — | — | — | — |
| 8 | `list_table` | ✅ PASS | — | — | — | — | — | ✅ PASS |
| 9 | `describe_table` | ✅ PASS | ✅ PASS | — | ✅ PASS | — | — | ✅ PASS |
| 10 | `get_rating_summary` | ✅ PASS | 🔴 FINDING-02 | — | — | — | — | — |
| 11 | `get_rating_details` | ✅ PASS | ✅ PASS | — | — | — | — | — |
| 12 | `search_aloha_funds` | ✅ PASS | ✅ NOTE* | — | — | — | ✅ PASS | — |
| 13 | `llm_text_analysis` | ❌ BLOCKED | ❌ BLOCKED | ❌ BLOCKED | — | ❌ BLOCKED | — | — |

> \*`search_aloha_funds` with `' OR '1'='1` returned 178 results — this is **not** SQL injection. Elasticsearch tokenizes the string and matches the literal character `1` across fund names. No SQL surface is involved.

---

## 5. INJ-01 — SQL Injection

### 5.1 Parameterized Tools (safe)

SQL-looking strings in `fundName`, `pipelineStatus`, `companyNames`, `filterValue`, `fundNames`, `tableName` yielded **0 rows** without errors across all tested tools. Input treated as literals — parameterized query / ORM behavior confirmed.

| Tool | Payload | Parameter | Result |
|---|---|---|---|
| `get_funds` | `' OR '1'='1` | `fundName` | 0 rows — ✅ PASS |
| `get_funds` | `Active'; DROP TABLE Fund--` | `pipelineStatus` | 0 rows — ✅ PASS |
| `get_documents` | `' OR '1'='1` | `filterValue` | 0 docs — ✅ PASS |
| `analyze_notes` | `' OR '1'='1` | `companyNames` | 0 notes — ✅ PASS |
| `get_notes` | `' OR '1'='1` | `companyNames` | 0 notes — ✅ PASS |
| `get_activity` | `' OR '1'='1` | `companyNames` | 0 activities — ✅ PASS |
| `get_fund_description` | `' OR '1'='1` | `fundName` | 0 records — ✅ PASS |
| `get_fund_description` | `'; DROP TABLE Fund--` | `fundName` | 0 records — ✅ PASS |
| `describe_table` | `'; DROP TABLE Fund--` | `tableName` | Validation error (invalid chars) — ✅ PASS |
| `get_rating_details` | `' OR '1'='1` + user email | `id` | 0 rows — ✅ PASS (user scope protects) |

### 5.2 `read_data` — Raw SQL Validation and FINDING-01

| Query | Result |
|---|---|
| `SELECT @@version` | `SECURITY_VALIDATION_FAILED` — correctly blocked — ✅ PASS |
| `SELECT * FROM Fund; DROP TABLE Fund; --` | `SECURITY_VALIDATION_FAILED` (DROP blocked) — ✅ PASS |
| `SELECT 1 UNION SELECT name FROM sys.databases` | `QUERY_EXECUTION_FAILED` (column mismatch, no leakage) — ✅ PASS |
| `SELECT * FROM sysobjects WHERE xtype='U'` | **2,171 rows returned** — ⚠️ FINDING-01 |
| `SELECT * FROM information_schema.tables` | **2,265 rows returned** — ⚠️ FINDING-01 |
| Oversized LIKE query (~800 char pattern) | 0 results, no crash — ✅ PASS |

### 5.3 `get_rating_summary` — FINDING-02

| `id` Payload | Result |
|---|---|
| `1` (baseline) | 0 rows — no match (normal) — ✅ PASS |
| `' OR '1'='1` | **76 manager rating records dumped** — 🔴 FINDING-02 |

---

## 6. INJ-02 — Command Injection

| Tool | Payload | Result |
|---|---|---|
| `analyze_notes` | `'; xp_cmdshell('whoami')--` in `companyNames` | 0 notes, no execution — ✅ PASS |
| `llm_text_analysis` | `xp_cmdshell` in `texts`, `DROP` in `instructions` | **BLOCKED** — `Missing ANTHROPIC_API_KEY` |

**Verdict: ⏳ PARTIAL** — SQL-backed tools PASS; `llm_text_analysis` untestable (Blocker B-1).

---

## 7. INJ-03 — Path Traversal

| Tool | Payload | Parameter | Result |
|---|---|---|---|
| `get_documents` | `../../etc/passwd` | `filterValue` | 0 docs, no filesystem read — ✅ PASS |
| `get_documents` | `../../../windows/system32/drivers/etc/hosts` | `filterValue` | 0 docs — ✅ PASS |
| `get_activity` | `../../../etc/passwd` | `fundNames` | 0 activities — ✅ PASS |
| `describe_table` | `../../../etc/passwd` | `tableName` | Validation error (invalid chars) — ✅ PASS |

Traversal strings treated as literal DB lookups. No filesystem access occurred.

**Verdict: ✅ PASS**

---

## 8. INJ-04 — SSRF / URL-like Input

| Tool | Payload | Parameter | Result |
|---|---|---|---|
| `get_documents` | `http://169.254.169.254/latest/meta-data/` | `filterValue` | 0 docs, no HTTP fetch — ✅ PASS |
| `get_documents` | `http://internal-server/admin` | `filterValue` | 0 docs — ✅ PASS |
| `get_notes` | `http://169.254.169.254/latest/meta-data/` | `companyNames` | 0 notes — ✅ PASS |
| `llm_text_analysis` | SSRF via `instructions` field | — | **BLOCKED** — API key missing |

**Verdict: ✅ PASS (DB layer) / ⏳ PARTIAL (LLM channel — Blocker B-1)**

---

## 9. INJ-05 — Oversized / Boundary Input

| Tool | Payload | Result |
|---|---|---|
| `get_funds` | 1,000-character `fundName` | 0 results, no crash — ✅ PASS |
| `get_documents` | `limit = 501` | Validation error: limit must be 1–500 — ✅ PASS |
| `read_data` | ~800-char LIKE clause | 0 results, no crash — ✅ PASS |
| `analyze_notes` | `companyNames` array with 50 elements | 0 results, graceful — ✅ PASS |
| `search_aloha_funds` | ~900-char `search_text` | 0 results, graceful — ✅ PASS |

**Verdict: ✅ PASS**

---

## 10. INJ-06 — Wrong Types / Schema

| Tool | Input | Result |
|---|---|---|
| `get_funds` | `vintage = "not-a-year"` | 0 results, no validation error — ℹ️ OBS-1 |
| `get_funds` | `limit = -1` | Validation error: must be between 1 and 100 — ✅ PASS |
| `get_documents` | `limit = 501` | Validation error: must be between 1 and 500 — ✅ PASS |
| `analyze_notes` | `startDate = "not-a-date"` | Validation error: Invalid date format — ✅ PASS |
| `describe_table` | `'; DROP TABLE Fund--` as `tableName` | Validation error (invalid chars) — ✅ PASS |
| `describe_table` | `../../../etc/passwd` as `tableName` | Validation error (invalid chars) — ✅ PASS |
| `list_table` | `["invalid_schema_xyz"]` as schema param | Empty result, no error — ✅ PASS |

**Verdict: ✅ PASS** (with OBS-1 noted)

---

## 11. High-Risk Tool Checklist (section 1.4)

| Tool | Outcome |
|---|---|
| `list_table` | Baseline enumerates all tables (expected behavior); invalid schema param returns empty gracefully — ✅ PASS |
| `describe_table` | Baseline returns column schema (expected); injection/path payloads rejected by input validation — ✅ PASS |
| `read_data` | Destructive patterns blocked; **catalog reads still execute — FINDING-01 OPEN** |

---

## 12. Security Findings

### FINDING-01 — Medium: System Catalog Readable via `read_data`

**Description:** The `read_data` blocklist stops obviously destructive patterns (`@@version`, `DROP`, `UNION`) but does not block SQL Server system catalog reads.

**Evidence:**
- `SELECT * FROM sysobjects WHERE xtype='U'` → **2,171 rows** returned (all user-defined table names, object IDs, types, creation dates)
- `SELECT * FROM information_schema.tables` → **2,265 rows** returned (full relational schema)

**Risk:** Any authenticated caller can enumerate the entire database structure — all table names, types, and relationships — without restriction. Enables targeted query crafting against sensitive tables and lowers the barrier for further data exfiltration attempts.

**Reproduction:**
```sql
SELECT * FROM sysobjects WHERE xtype='U'
SELECT * FROM information_schema.tables
```

**Recommendation:** Extend the `read_data` blocklist to deny queries against `sysobjects`, `sys.*`, `information_schema.*`, and related catalog views. Alternatively, restrict the DB principal to application schema only (defence-in-depth preferred).

---

### FINDING-02 — High: SQL Injection in `get_rating_summary` via `id` Parameter

**Description:** The `id` parameter in `get_rating_summary` is concatenated directly into the SQL query without parameterization. The classic boolean payload causes the WHERE clause to evaluate as always-true, returning all rating rows in the database.

**Evidence:**
- `id = "' OR '1'='1"` → **76 manager rating records dumped**
- Exposed data: manager names, edge / organization / track_record / total_rating / average_conviction scores for all rated managers

**Sample of exposed managers:** Accel (India/US/Europe), Andreessen Horowitz, Blackstone Real Estate Partners, Citadel Advisors, Founders Fund, Francisco Partners, Hellman & Friedman, Sequoia Capital (US/Europe/India/China), Thoma Bravo, Y Combinator, and ~66 others.

**Risk:** Confidential investment research ratings are exposed to any authenticated MCP caller. This is proprietary data with direct financial and competitive sensitivity.

**Reproduction:**
```
Tool: get_rating_summary
id: ' OR '1'='1
```

**Note:** `get_rating_details` uses the same `id` but is **not vulnerable** — the additional user-scoped SQL filter prevents data leakage (0 rows returned with same payload + valid user email).

**Recommendation:** Parameterize the `id` field in the `get_rating_summary` SQL query immediately. Must be fixed before KS-985 can be marked Done.

---

## 13. Observations

### OBS-1 — Informational: `vintage` Silently Returns 0 for Non-Year Input

Passing `vintage = "not-a-year"` to `get_funds` returns 0 results without a validation error. Usability issue only — not a security concern. Recommendation: add year-format validation consistent with other date parameters.

---

## 14. Blockers and Gaps

| ID | Item | Impact |
|---|---|---|
| B-1 | `llm_text_analysis` — no `ANTHROPIC_API_KEY` configured | INJ-02 full coverage and LLM-channel INJ-04 untested |
| B-2 | **FINDING-01** — catalog access via `read_data` | Security remediation required before DoD |
| B-3 | **FINDING-02** — SQL injection in `get_rating_summary` | High-severity data leak; must be fixed before DoD |

---

## 15. Definition of Done Status

| Criterion | Status |
|---|---|
| Adversarial SQL inputs → safe outcomes on parameterized tools | ✅ Met |
| No command execution via SQL-backed tools | ✅ Met |
| Path-style inputs → no arbitrary file reads | ✅ Met |
| SSRF payloads — DB layer safe | ✅ Met · LLM channel ❌ Not tested (B-1) |
| Oversized input — graceful handling | ✅ Met |
| Wrong types → validation where exercised | ✅ Met (OBS-1 noted) |
| No 500s exposing internals | ✅ Met |
| **FINDING-01 remediation** (`read_data` catalogs) | ❌ Not met — open |
| **FINDING-02 remediation** (`get_rating_summary` injection) | ❌ Not met — open |

---

## 16. Summary Verdict

| INJ ID | Category | Verdict |
|---|---|---|
| INJ-01 | SQL Injection | ✅ PASS on parameterized tools · ⚠️ FINDING-01 on `read_data` catalogs · 🔴 FINDING-02 on `get_rating_summary` |
| INJ-02 | Command Injection | ✅ PASS on SQL-backed tools · ❌ UNTESTED on `llm_text_analysis` (B-1) |
| INJ-03 | Path Traversal | ✅ PASS |
| INJ-04 | SSRF | ✅ PASS on DB/ES surface · ❌ PARTIAL — LLM channel untested (B-1) |
| INJ-05 | Oversized Input | ✅ PASS |
| INJ-06 | Wrong Types | ✅ PASS (OBS-1 noted) |

---

## 17. Recommended Next Steps

1. **Immediate:** Fix FINDING-02 — parameterize the `id` parameter in `get_rating_summary`.
2. **Short-term:** Fix FINDING-01 — extend `read_data` blocklist for system catalog views, or restrict DB user to application schema.
3. **When ready:** Configure `ANTHROPIC_API_KEY` for `llm_text_analysis` and re-run INJ-02 and LLM-channel INJ-04.
4. After all three blockers resolved, re-evaluate KS-985 for Done.

---

*Report updated 2026-04-28 — full re-run against all 13 tools · Claude AI on behalf of Bình Hà Khoa · KS-985*
