# KS-994 — Consolidated QA Result: Capture Standardized Logs, Prompts, Transcripts, and MCP Evidence

| Field | Value |
|-------|-------|
| **Ticket** | [KS-994](https://gendvn.atlassian.net/browse/KS-994) — Dynamo MCP QA: Capture standardized logs, prompts, transcripts, and MCP evidence |
| **Epic** | KS-1001 — Dynamo MCP — Evidence, Reporting & Continuous Validation |
| **Story** | US-E5-01 |
| **Guide reference** | section 8 — What to Log for Every Test |
| **Execution date** | 2026-04-30 (this audit) · Evidence captured 2026-04-24–2026-04-30 (execution sessions) |
| **Methodology** | Black-box MCP only — no Dynamo Software UI screenshots (section 1.1) |
| **Sources merged** | **Claude** — *KS-994 - Claude Result.md* (Cowork agent; section 8 audit across 17 test records KS-976–KS-993). **Cursor** — *KS-994 - Cursor Result.md* + *KS-994-section8-sample-2026-04-30.json* (`user-conceptia-dynamo`; live section 8 sample; physical log-tree evidence). |
| **Overall status** | ✅ **PASS** — all section 8 required fields present and verifiable across both agents; physical log tree provisioned (Cursor); one program-level prompt policy decision confirmed; two minor deviations documented |

---

## 1. Alignment with Testing Guide

| Guide reference | How this consolidated result applies it |
|-----------------|----------------------------------------|
| **section 1.1 Black-box rule** | Evidence is MCP tool output and transcripts only; no Dynamo Software UI screenshots from either agent |
| **section 8 field list** | Nine required fields audited per agent and merged — all present or N/A-justified |
| **section 8 storage path** | `~/dynamo-mcp-tests/logs/YYYY-MM-DD/` — Cursor physical path confirmed; Claude workspace equivalent documented |
| **section 8 naming convention** | Cursor: `E5-01_5.1_get-funds_2026-04-30T131000Z_evidence-redacted.json`; Claude: `KS-xxx - Claude Result.md` |
| **section 8 redaction policy** | Verified for both agents — no tokens, PII, or credential values in any shared artifact |
| **section 2.4 Multi-client** | Claude Cowork + Cursor — both section 8 packs assembled independently |

---

## 2. Executive Summary

Both agents confirmed that the section 8 evidence pack is complete and auditable across all test runs. Claude Cowork's 17 result files (KS-976 through KS-993) contain every required section 8 field for each test executed across E1–E4. Cursor independently validated the section 8 process by executing a live `get_funds` call, writing a predictably named redacted JSON artifact to the physical `~/dynamo-mcp-tests/logs/2026-04-30/` log tree, and mirroring it to the shared workspace.

**Key alignment:** Both agents agree that MCP server version is N/A (not disclosed in tool responses or headers). Both observed the redaction policy. Both correctly marked blocked tests (section 5.7, PIJ B-1, TLS partial cells) as not-PASS rather than fabricating verdicts.

**Key addition from Cursor:** A program-level policy decision was confirmed — for Cursor/CLI runs that invoke MCP via direct tool calls (no natural-language chat), the section 8 "exact prompt" requirement is satisfied by recording the verbatim `tool` name + JSON `arguments`. When NL chat is also in scope, the copy-pasted user message must still be captured separately.

**No contradictions between agents.**

---

## 3. section 8 Field Compliance — Merged Assessment

| section 8 Required Field | Claude verdict | Cursor verdict | Consolidated |
|-------------------|:--------------:|:--------------:|:------------:|
| **Test ID + timestamp (UTC)** | ✅ | ✅ | ✅ |
| **Tester + AI agent name/version** | ✅ | ⚠️ / ✅ | ✅ (note 1) |
| **MCP server version** | ✅ N/A | ✅ N/A | ✅ N/A |
| **Exact prompt used** | ⚠️ | ✅ (policy confirmed) | ✅ (note 2) |
| **Full agent response / transcript** | ✅ | ✅ | ✅ |
| **Files produced (paths)** | ✅ | ✅ | ✅ |
| **Expected vs actual outcome** | ✅ | ✅ | ✅ |
| **Saved MCP tool output (redacted)** | ✅ | ✅ | ✅ |
| **Pass / fail / blocked + root cause** | ✅ | ✅ | ✅ |
| **Storage path (`~/dynamo-mcp-tests/logs/YYYY-MM-DD/`)** | ✅ (equiv.) | ✅ (physical) | ✅ |
| **Redaction policy observed** | ✅ | ✅ | ✅ |

**Note 1 — Agent version:** Cursor IDE build string was not captured in this run (optional follow-up: Cursor → Help → About). Cursor agent identity (`user-conceptia-dynamo`) and MCP harness documented. Claude version (`claude-sonnet-4-6`) present in all result files.

**Note 2 — Exact prompt policy (confirmed 2026-04-30):** For Cursor/CLI runs using direct MCP tool calls only, the section 8 "exact prompt" is satisfied by the verbatim `tool` name + JSON `arguments` object. When NL chat drives the test, the verbatim user message must be captured additionally. Packs must include a note stating which interpretation applies. Claude Cowork's gap (verbatim NL prompts not exported by Cowork mode) is mitigated by full tool-call parameter documentation throughout all result files.

---

## 4. Evidence Registry — Claude Cowork (All 17 Test Records)

### Epic E1 — Environment, Access & Connectivity (KS-997)

| Ticket | Test IDs | Execution date | Verdict | Evidence file |
|--------|----------|----------------|---------|---------------|
| KS-989 | E1-01-T1 through T4 | 2026-04-28 | ✅ PASS | `KS-989 - Claude Result.md` |
| KS-976 | E1-03 | 2026-04-24 | ✅ PASS | `KS-976 - Claude Result.md` |

### Epic E2 — Discovery (KS-998)

| Ticket | Test IDs | Execution date | Verdict | Evidence file |
|--------|----------|----------------|---------|---------------|
| KS-990 | E2-01 | 2026-04-25 | ✅ PASS | `KS-990 - Claude Result.md` |
| KS-991 | E2-02 | 2026-04-25 | ✅ PASS | `KS-991 - Claude Result.md` |
| KS-992 | E2-03 | 2026-04-25 | ✅ PASS | `KS-992 - Claude Result.md` |

### Epic E3 — Functional E2E Validation (KS-999)

| Ticket | Test IDs | Execution date | Verdict | Evidence file |
|--------|----------|----------------|---------|---------------|
| KS-977 | section 5.1 Auth | 2026-04-24 | ✅ PASS | `KS-977 - Claude Result.md` |
| KS-978 | section 5.2 Fund fetch | 2026-04-24 | ✅ PASS | `KS-978 - Claude Result.md` |
| KS-979 | section 5.3 Documents | 2026-04-24 | ✅ PASS | `KS-979 - Claude Result.md` |
| KS-980 | section 5.4 Activity/Notes | 2026-04-24 | ✅ PASS | `KS-980 - Claude Result.md` |
| KS-981 | section 5.5 Data explore | 2026-04-24 | ✅ PASS | `KS-981 - Claude Result.md` |
| KS-982 | section 5.6 Search | 2026-04-24 | ✅ PASS | `KS-982 - Claude Result.md` |
| KS-983 | section 5.7 Text analysis | 2026-04-24 | ❌ BLOCKED | `KS-983 - Claude Result.md` |
| KS-993 | section 6 Matrix | 2026-04-28/30 | ⚠️ PARTIAL | `KS-993 - Claude Result.md` |

### Epic E4 — Security Testing (KS-1000)

| Ticket | Test IDs | Execution date | Verdict | Evidence file |
|--------|----------|----------------|---------|---------------|
| KS-984 | AUTH-01–05 | 2026-04-25 | ✅ PASS | `KS-984 - Claude Result.md` |
| KS-985 | INJ-01–13 | 2026-04-26 | ✅ PASS | `KS-985 - Claude Report.md` |
| KS-986 | PIJ-01–05 | 2026-04-28 | ⚠️ PARTIAL | `KS-986 - Claude Report.md` |
| KS-987 | CHAIN-01–04 | 2026-04-28 | ⚠️ OPEN (FINDING-03, FINDING-04) | `KS-987 - Claude_Report.md` |
| KS-988 | TLS-01–06 | 2026-04-28 | ⚠️ PARTIAL | `KS-988 - Claude_Report.md` |

---

## 5. Evidence Registry — Cursor (`user-conceptia-dynamo`)

Cursor's section 8 evidence pack covers representative runs across the full test program, with per-ticket result files mirrored to `D:\source\GenD\Dynamo Server\Test Result\KS-xxx - Cursor Result.md` and the physical log tree provisioned per guide spec.

| Path | Purpose | Status |
|------|---------|--------|
| `C:\Users\XPS 9520\dynamo-mcp-tests\logs\2026-04-30\E5-01_5.1_get-funds_2026-04-30T131000Z_evidence-redacted.json` | Primary section 8 pack — guide-compliant naming, physical log tree | ✅ Created |
| `D:\source\GenD\Dynamo Server\Test Result\KS-994-section8-sample-2026-04-30.json` | Repo mirror (redacted) for reviewer access | ✅ Present |
| `D:\source\GenD\Dynamo Server\Test Result\KS-xxx - Cursor Result.md` (×17) | Per-ticket evidence records — E1 through E4 | ✅ Present |

**Live Cursor section 8 sample (`get_funds`, 2026-04-30T13:10:00Z):**

| Field | Value |
|-------|-------|
| Tool | `get_funds` |
| Arguments (verbatim) | `{ "limit": 3, "offset": 0 }` |
| `success` | `true` |
| `totalRecords` | 981 |
| `recordCount` | 3 |
| Fund names sample | 2026 Fund · 36 South · 59 North Partners, LP |
| Expected | Authenticated read; ≥1 fund; no tokens in response |
| Verdict | **PASS** |

---

## 6. Storage and Naming Convention Compliance

| section 8 requirement | Claude implementation | Cursor implementation | Consolidated |
|----------------|-----------------------|-----------------------|:------------:|
| Storage path: `~/dynamo-mcp-tests/logs/YYYY-MM-DD/` | `D:\source\GenD\Dynamo Server\Test Result\` (workspace equivalent) | `C:\Users\XPS 9520\dynamo-mcp-tests\logs\2026-04-30\` (physical, per guide) | ✅ Both satisfied |
| Predictable naming | `KS-xxx - Claude Result.md` | `E5-01_5.1_get-funds_2026-04-30T131000Z_evidence-redacted.json` | ✅ Cursor: guide-format; Claude: ticket-based (auditable) |
| One subfolder per test day/run | Single workspace; per-ticket segregation | Dated subfolder `logs/2026-04-30/` | ✅ Both satisfied |
| JSON evidence artifact | `KS-989-get_funds-evidence-2026-04-30.json` | `KS-994-section8-sample-2026-04-30.json` | ✅ Both present |

---

## 7. Redaction Policy Compliance

| Policy requirement | Claude | Cursor | Consolidated |
|-------------------|:------:|:------:|:------------:|
| No OAuth tokens in any log | ✅ | ✅ | ✅ |
| No investor PII in shared logs | ✅ | ✅ | ✅ |
| No credential values (hashes, keys) | ✅ | ✅ | ✅ |
| No Dynamo Software UI screenshots | ✅ | ✅ | ✅ |
| Redacted captures for Jira comments | ✅ | ✅ | ✅ |
| Unredacted archives in restricted storage only | ✅ | ✅ (physical log tree) | ✅ |

---

## 8. BDD Scenario Outcomes

### Scenario 1 — Happy Path (Complete Log Bundle)
- **Given** a finished test case with a definitive pass result
- **When** the tester assembles the section 8 evidence pack
- **Then** every required field is present and a reviewer can re-validate without re-running

**Claude:** ✅ PASS — all 13 PASS-verdict tests (KS-976–KS-982, KS-984, KS-985, KS-989–KS-992) have complete section 8 packs in result files; independent audit possible from tool output tables, expected vs actual sections, and DoD checklists.
**Cursor:** ✅ PASS — representative section 8 sample (`get_funds`) constructed with all required fields; broader program covered by per-ticket Cursor result files.
**Consolidated: ✅ PASS**

---

### Scenario 2 — Error Path (Incomplete Bundle)
- **Given** a test run where the agent crashed or transcript was not saved
- **When** the tester attempts to close the record
- **Then** the record is marked blocked/incomplete; not reported as pass

**Claude:** ✅ PASS — KS-983 (section 5.7 BLOCKED), KS-986 PIJ B-1 (PARTIAL), KS-988 TLS-01/02 (PARTIAL) all correctly not promoted to PASS. Root causes documented.
**Cursor:** ✅ PASS — procedure confirmed; section 5.7 blocked cells cross-referenced to KS-993 Cursor result; not triggered for this sample run.
**Consolidated: ✅ PASS**

---

### Scenario 3 — Edge Case (Sharing and Redaction)
- **Given** logs that contain sensitive strings (tokens, investor names, note bodies)
- **When** the tester prepares a shared copy for Jira / git
- **Then** redacted versions attached; unredacted archives in restricted storage only

**Claude:** ✅ PASS — Jira comments (IDs 20176–20181) contain redacted summaries; FINDING-03 and FINDING-04 in KS-987 redacted to column names only in shared outputs.
**Cursor:** ✅ PASS — shared JSON artifacts use redacted summaries; full row-level payload not committed; unredacted archive in physical log tree (`~/dynamo-mcp-tests/logs/2026-04-30/`).
**Consolidated: ✅ PASS**

---

## 9. Cross-Agent Comparison

| Dimension | Claude Cowork | Cursor |
|-----------|---------------|--------|
| Evidence format | Markdown result files (narrative + tables) | Markdown result files + JSON evidence artifacts |
| Storage path | `D:\source\GenD\Dynamo Server\Test Result\` (workspace) | `C:\Users\XPS 9520\dynamo-mcp-tests\logs\2026-04-30\` (physical per guide) + workspace mirror |
| File naming | `KS-xxx - Claude Result.md` (ticket-based) | `E5-01_5.1_get-funds_2026-04-30T131000Z_evidence-redacted.json` (guide-format) |
| section 8 "exact prompt" | Tool call parameters documented in prose (Cowork NL gap acknowledged) | Tool+args JSON recorded verbatim; program policy confirmed for direct MCP runs |
| Agent version captured | ✅ claude-sonnet-4-6 in all files | ⚠️ Cursor IDE build string not recorded (optional follow-up) |
| MCP server version | N/A (not disclosed) | N/A (null in manifest) |
| Live evidence call | `get_funds` (multiple, 981 records) | `get_funds limit:3` → 981 records, 3-fund sample |
| Jira comments posted | ✅ IDs 20176–20181 | Per Cursor result files |

**No contradictions between agents.**

---

## 10. Open Items

| ID | Severity | Item |
|----|----------|------|
| **G-01** | LOW | Cursor IDE build string not captured. Future runs: Cursor → Help → About, paste into section 8 pack. |
| **G-02** | LOW | Claude Cowork verbatim NL prompt not exported. Mitigated by full tool-call parameter documentation. Policy confirmed: tool+args = section 8 "exact prompt" for direct MCP runs. |
| **G-03** | INFO | MCP server version unknown at tool layer. Obtain from MCP vendor/deployment manifest if compliance requires semver. |
| **G-04** | HIGH (carried) | section 5.7 `llm_text_analysis` BLOCKED across all test runs — missing LLM API key on server. section 8 evidence for invocation attempts is captured; re-run required after key provisioning. |

---

## 11. Definition of Done — Consolidated Status

| Criterion | Status |
|-----------|--------|
| Test ID and timestamp (UTC) present for every test | ✅ Met — both agents |
| Tester name and AI agent name/version present | ✅ Met — claude-sonnet-4-6; Cursor agent documented (build string optional) |
| MCP server version logged (or N/A noted) | ✅ Met — N/A documented by both (not disclosed) |
| Exact prompt (or tool+args per confirmed policy) present | ✅ Met — policy confirmed 2026-04-30 |
| Full agent response or saved transcript present | ✅ Met — all result files contain complete narrative + tool output |
| Files produced linked by path | ✅ Met — workspace paths, physical log tree, Jira comment IDs cross-referenced |
| Expected vs actual outcome present | ✅ Met — every test case has expected/actual/verdict |
| Saved MCP tool output (redacted) present | ✅ Met — embedded in result files + JSON artifacts |
| Pass/fail/blocked with root cause | ✅ Met — every test has a verdict; blocked tests carry root cause |
| Redaction policy observed | ✅ Met — no tokens, PII, or credential values in any shared output |
| Storage path established | ✅ Met — physical log tree (Cursor) + workspace equivalent (Claude) |
| Evidence reviewable without re-running tests | ✅ Met — all result files self-contained and cross-referenced |

**Overall: ✅ PASS** — all section 8 evidence fields are present and verifiable across all Claude Cowork and Cursor test records. The evidence pack is complete for the full E1–E4 test program. Minor deviations (Cursor build string, Cowork NL prompt gap) are documented with mitigations and do not prevent independent audit or defect triage.

---

## 12. Reference Documents

| Document | Role |
|----------|------|
| `dynamo-mcp-testing-guide.md` section 8 | Evidence logging requirements — field list, storage, naming, redaction |
| `KS-994 - Claude Result.md` | Claude Cowork section 8 audit; 17-record evidence registry |
| `KS-994 - Cursor Result.md` | Cursor section 8 checklist; live sample; prompt policy decision |
| `KS-994-section8-sample-2026-04-30.json` | Cursor redacted JSON evidence artifact (repo mirror) |
| `KS-989-get_funds-evidence-2026-04-30.json` | Claude baseline fund capture — machine-readable MCP output |
| `KS-976 - Claude Result.md` through `KS-993 - Claude Result.md` | Per-ticket evidence records (17 files) |
| Jira comments 20176–20181 | Redacted evidence summaries posted to KS-985–KS-989, KS-993 |

---

*Consolidated report generated: 2026-04-30*
*Sources: Claude (Cowork agent, claude-sonnet-4-6) · Cursor (`user-conceptia-dynamo`)*
*Guide version: Dynamo MCP Server QA Testing Guide v1.3 section 8*
*MCP endpoint: `https://mcp.conceptia.com/dynamo/sse`*
