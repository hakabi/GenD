# KS-981 — Claude QA Result (Second Time Test)
## Dynamo MCP QA — Validate list_table, describe_table, read_data (Section 5.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-981](https://gendvn.atlassian.net/browse/KS-981) |
| **Story** | US-E3-05 — Validate read_data tabular read (guide section 1.4 HIGH risk) |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.5 — Tabular read test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `list_table`, `describe_table`, `read_data` |
| **Overall result** | **S — Skipped (all scenarios) — tools permanently removed from server** |

---

## Summary

All three section 5.5 HIGH-risk tools (`list_table`, `describe_table`, `read_data`) were confirmed removed from the Conceptia Dynamo MCP server as of **2026-05-07** (intentional production hardening, confirmed by product owner). This was first detected during tool inventory re-verification (KS-976 comment ID 20208) and corroborated by a ToolSearch check against connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861` returning zero matches for all three tools.

No live test execution is possible. All three BDD scenarios are recorded as **S (Skipped — tools removed from server)**. The HIGH security risk associated with `read_data` (direct tabular reads, exfiltration and schema-mapping risk) is **eliminated by removal**. The original first test results (2026-04-24) are preserved below for historical reference.

---

## Tool Availability Status

| Tool | Guide v1.4 Status | First Test (2026-04-24) | Current Status (2026-05-13) | Decision |
|---|---|---|---|---|
| `list_table` | Section 1.4 HIGH risk | Available — tested, 2,171 tables returned | **Removed — not registered** | Intentional production hardening (2026-05-07) |
| `describe_table` | Section 1.4 HIGH risk | Available — tested, 338 columns on Fund table | **Removed — not registered** | Intentional production hardening (2026-05-07) |
| `read_data` | Section 1.4 HIGH risk / Planned | Available — tested, SELECT TOP 10 returned 10 rows | **Removed — not registered** | Intentional production hardening (2026-05-07) |

---

## BDD Scenario Outcomes

### Scenario 1 — Happy path: S (Skipped) ⏭️

**Original scenario:** Given `list_table` returns a set including a funds-related table, when the tester describes that table and reads the first 10 rows via `read_data`, then row data conforms to described columns and types.

**Outcome:** S — Skipped. `list_table`, `describe_table`, and `read_data` are not registered on the MCP server. No tool invocation is possible. Per section 1.4 guidance and the 2026-05-07 update: recorded as S (removed from production server — intentional hardening).

**First test reference (2026-04-24):** PASS — 2,171 tables listed; `describe("Fund")` returned 338 columns; `SELECT TOP 10 *` returned 10 rows with ~385 keys/row; 59 North GUID matched KS-978 baseline.

---

### Scenario 2 — Error path: S (Skipped) ⏭️

**Original scenario:** Given an invalid table name passed to `describe_table` or `read_data`, when the tester invokes the tool, then a clear API error is returned with no partial dump of unrelated tables.

**Outcome:** S — Skipped. Tools are not registered. Error-path validation cannot be executed. The tool registry itself acts as the rejection boundary.

**First test reference (2026-04-24):** PASS — `read_data` with invalid table returned a clear error; `describe_table` with invalid table returned `success: true` + `[]` (F-01 soft-empty shape).

---

### Scenario 3 — Edge case (large dataset): S (Skipped) ⏭️

**Original scenario:** Given a table with more than 10 rows, when the tester reads the first 10 rows, then only 10 rows return and performance is acceptable.

**Outcome:** S — Skipped. Tools are not registered. Row-limit and truncation behavior cannot be validated.

**First test reference (2026-04-24):** PASS with open finding — `read_data` returned 10 rows as requested; however F-04 (no server-enforced row cap) was raised as a HIGH-risk finding at the time. F-04 is now **closed as remediated** by tool removal (2026-05-07 update).

---

## Security Risk Assessment

| Risk | Assessment |
|---|---|
| `read_data` direct tabular read / exfiltration risk | ✅ **Eliminated** — tool removed from server |
| `list_table` schema-mapping / discovery risk | ✅ **Eliminated** — tool removed from server |
| `describe_table` schema exposure risk | ✅ **Eliminated** — tool removed from server |
| Section 1.4 HIGH-risk checklist | ✅ All HIGH-risk tools absent from live server |

---

## Findings Status

| ID | Severity | Description from First Test | Current Status |
|---|---|---|---|
| F-01 | Low | `describe_table` invalid table returned `success: true` + `[]` (soft-empty shape) | **Moot — tool removed** |
| F-02 | HIGH | `list_table` returned all 2,171 tables with no tenant/scope filter — unscoped discovery exposure | **Closed — tool removed (risk eliminated)** |
| F-03 | Low | `describe_table` with `dbo.Fund` (schema-qualified) returned `success: true` + `[]` — schema prefix not supported | **Moot — tool removed** |
| F-04 | HIGH | No server-enforced row cap on `read_data` — client-specified limit only; exfiltration risk | **Closed as remediated** — tool removed (2026-05-07 update) |
| F-05 | Info | Column count mismatch: `describe_table` reported 338 columns; `read_data` returned 385 keys/row — extra metadata keys added by MCP wrapper | **Moot — tool removed** |
| F-06 | Info | JSON key volume / Buffer concerns on large `read_data` responses (Cursor finding) | **Moot — tool removed** |

---

## Test Matrix Row — Section 5.5 Tabular read

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.5 Tabular read (`read_data`)** | **S** | **S** | **S** | **S** | **S** |

*All cells S — tools permanently removed from server (intentional production hardening, 2026-05-07).*

---

## Comparison with First Test (2026-04-24)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS | **S (Skipped — tools removed)** |
| Scenario 2 Error path | PASS | **S (Skipped — tools removed)** |
| Scenario 3 Large dataset | PASS (F-04 open) | **S (Skipped — tools removed; F-04 closed as remediated)** |
| list_table | Available (2,171 tables) | **Removed** |
| describe_table | Available (338 cols) | **Removed** |
| read_data | Available (10 rows returned) | **Removed** |
| Section 1.4 HIGH risk exposure | Active | **Eliminated by removal** |

---

## Evidence

- **Tool registry check:** ToolSearch against connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861` — zero matches for `list_table`, `describe_table`, `read_data` (2026-05-07, corroborated 2026-05-13)
- **Confirmation source:** KS-976 comment ID 20208 — intentional production hardening confirmed by product owner
- **No live tool calls executed** — tools not registered on server
- **Report file:** `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-981 - Claude Result.md`

---

## Verdict

**Final result: S — Skipped (Scenarios 1–3)**  
All section 5.5 tools permanently removed from the MCP server as intentional production hardening. The associated HIGH security risks (unscoped table discovery, direct tabular reads, schema exposure) are eliminated. No regression testing is possible until the vendor re-registers these tools with appropriate security controls, at which point a full re-run against section 5.5 is required.

---

*Generated: 2026-05-13 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-981 v1.4 updated requirements (incl. 2026-05-07 tool removal update) · Guide: dynamo-mcp-testing-guide_v1.4.md*
