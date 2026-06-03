# KS-982 — Cursor QA Result (Third Time Test)

## Dynamo MCP QA — Validate search_aloha_funds keyword search and tenant scope (Section 5.6 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-982](https://gendvn.atlassian.net/browse/KS-982) |
| **Story** | US-E3-06 — Validate search_aloha_funds keyword search and tenant scope |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Scope executed** | Jira description **Updated requirements — guide v1.5 (10-tool MCP inventory)** only |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **5.6** (permanently out of scope); stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tool under test** | `search_aloha_funds` |
| **Overall result** | **S (skipped) — all scenarios per ticket v1.5** |

---

## Summary

`search_aloha_funds` was **permanently removed** from the Conceptia Dynamo MCP server on **2026-05-07** (intentional production hardening). Guide **v1.5** explicitly lists this tool among the **three permanently out-of-scope tools** (alongside `get_rating_details` and `get_rating_summary`). It is **not part of the 10-tool v1.5 inventory**.

**Cursor MCP registry check (this session):** `user-conceptia-dynamo` exposes **10 tools** matching guide §1.3. **`search_aloha_funds` is absent** — confirmed not registered.

All three BDD scenarios remain **S (Skipped — tool permanently removed)**. No change in status or outcome from the Second Time Test. The cross-tenant tenant isolation risk associated with this tool is **eliminated by removal**.

---

## v1.5 requirements executed (KS-982 updated section)

| v1.5 requirement | Status |
|---|---|
| **A.** Confirm tool absent from v1.5 10-tool inventory | **PASS** — documented |
| **B.** Scenario 1 — happy path keyword search | **S** — tool removed |
| **B.** Scenario 2 — no-match empty result | **S** — tool removed |
| **B.** Scenario 3 — cross-tenant edge case | **S** — tool removed |
| **C.** Matrix row 5.6 — all cells **S** | **PASS** — satisfied |
| **Security** — cross-tenant Aloha exposure | **Eliminated** — tool removed |

---

## Test execution

### Preconditions — 10-tool inventory vs. removed tools

| # | Tool | In v1.5 inventory | Registered in Cursor session |
|---:|---|:---:|:---:|
| 1–10 | *(see KS-977 §A inventory table)* | Yes | Yes |
| — | `search_aloha_funds` | **Removed prior to v1.4** | **Absent** |
| — | `get_rating_details` | Removed 2026-05-07 | Absent |
| — | `get_rating_summary` | Removed 2026-05-07 | Absent |

**Connector state:** Connected / Ready — connectivity confirmed; tool simply not in registry.

**Registry enumeration:** Local MCP tool descriptors for `user-conceptia-dynamo` contain **no** `search_aloha_funds` schema file.

---

### Scenario 1 — Happy path: **S (Skipped)**

**Original scenario:** Given a search term that returns at least one fund via `search_aloha_funds`, when results are compared to `get_funds` for the same session, then returned fund IDs are within the accessible set.

**Outcome:** **S** — tool not in v1.5 inventory. Keyword search and cross-reference cannot be executed.

**First test reference (2026-04-24):** PASS — `search_aloha_funds("83North", is_owned_by_ks: true)` returned 8 solovis records; `get_funds("83North")` returned 8 rows; name alignment 8/8.

---

### Scenario 2 — Error path (no-match): **S (Skipped)**

**Original scenario:** Given a search term that matches nothing, the response is an empty result set, not unrelated funds.

**Outcome:** **S** — tool not registered. Empty-results validation not executable.

**First test reference (2026-04-24):** PASS — non-existent term returned `data: []`, `recordCount: 0`.

---

### Scenario 3 — Edge case (cross-tenant): **S (Skipped)**

**Original scenario:** Given suspicion of cross-tenant exposure, `search_aloha_funds` results compared to `get_funds` show no unauthorized fund data.

**Outcome:** **S** — tool not registered. **Cross-tenant leakage is not possible via this vector** — risk eliminated by removal.

**First test reference (2026-04-24):** PASS — ALB public listings distinguished by `source` field; no private cross-tenant data.

---

## Security scan

| Check | Result |
|---|---|
| Cross-tenant Aloha Fund exposure via `search_aloha_funds` | **Eliminated** — tool removed |
| `is_owned_by_ks` flag manipulation | **Eliminated** — tool removed |
| Section 9 cross-tenant critical stop condition | **Not applicable** — no tool, no leakage vector |

**Security verdict:** **PASS** — removal eliminates prior attack surface

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| N-01 | Info | `search_aloha_funds` permanently removed 2026-05-07 — v1.5 inventory confirms absence. | **Confirmed S** |
| N-02 | Info | Aloha Fund keyword search capability no longer available on MCP surface — domain coverage gap by design. | **By design** |
| N-03 | Info | No regression testing required unless vendor re-registers tool with documented security controls. | **Informational** |

---

## Test matrix row — Section 5.6 Search (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.6 Search** | **S** | **S** | **S** | **S** | **S** | **S** |

*All cells **S** — `search_aloha_funds` permanently removed. Per guide v1.5 section 6 mandatory check: row 5.6 all scenario cells must be **S**.*

---

## Comparison across test runs

| Dimension | First (2026-04-24) | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| `search_aloha_funds` | Available — tested | **S (removed 2026-05-07)** | **S (removed — v1.5 confirmed)** |
| Scenario 1 | PASS | S | **S** |
| Scenario 2 | PASS | S | **S** |
| Scenario 3 | PASS | S | **S** |
| Cross-tenant risk | Tested, no leakage | Eliminated | **Eliminated — confirmed** |
| MCP connector | Connected | Connected | **Connected** (tool still absent) |

---

## Evidence

| Item | Detail |
|---|---|
| **Registry check** | Cursor `user-conceptia-dynamo` — 10 tools, **no** `search_aloha_funds` |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-982 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| Tool absent from v1.5 10-tool inventory | **Confirmed** |
| Tool absent from Cursor MCP registry | **Confirmed** |
| All BDD scenarios | **S (skipped)** — documented |
| Cross-tenant risk | **Eliminated** by removal |
| v1.5 updated requirements section | **S** — satisfied per ticket |

**Final result: S (skipped) — all scenarios per ticket v1.5**

No change from Second Time Test. No regression testing required unless the vendor explicitly re-registers the tool.

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-982 Jira — **Updated requirements — guide v1.5 (10-tool MCP inventory)** · Guide: `dynamo-mcp-testing-guide_v1.5.md`*
