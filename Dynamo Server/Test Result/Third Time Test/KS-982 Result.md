# KS-982 — Consolidated QA Result (Third Time Test)
## Dynamo MCP QA — Validate search_aloha_funds keyword search and tenant scope (Section 5.6 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-982](https://gendvn.atlassian.net/browse/KS-982) |
| **Story** | US-E3-06 — Validate search_aloha_funds keyword search and tenant scope |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.6 Search — permanently out of scope · **Guide v1.5** |
| **Test run** | Third Time Test — Consolidated (Cursor + Claude) |
| **Test dates (UTC)** | 2026-05-21 (Cursor) · 2026-05-22 (Claude) |
| **Testers / Agents** | Cursor — Composer · Claude — Cowork mode (claude-sonnet-4-6) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` — **Connected (both runs)** |
| **Tool under test** | `search_aloha_funds` |
| **Overall result** | **S — Skipped (all scenarios) — tool permanently removed** |

---

## Agent agreement summary

| Dimension | Cursor | Claude | Agreement |
|---|---|---|---|
| Tool in v1.5 inventory | ❌ Absent | ❌ Absent | ✅ Agree |
| Tool in MCP registry | ❌ Absent (Cursor confirmed) | ❌ Absent (Claude confirmed) | ✅ Agree |
| All scenarios | S | S | ✅ Agree |
| Cross-tenant risk | Eliminated | Eliminated | ✅ Agree |

**Complete agreement. Both agents independently verified the tool is absent from the registry even with the server connected.**

---

## Summary

`search_aloha_funds` was permanently removed from the Conceptia Dynamo MCP server on **2026-05-07** (intentional production hardening, confirmed by product owner). Guide v1.5 explicitly lists this tool among the three permanently removed tools (alongside `get_rating_details` and `get_rating_summary`). It is not part of the 10-tool v1.5 inventory.

Both Cursor and Claude confirmed the tool is absent from the registered tool list even with the server connected in both sessions. No change from Second Time Test.

---

## Registry verification

| Agent | Method | Result |
|---|---|---|
| Cursor | Enumerated `user-conceptia-dynamo` tool descriptors — 10 tools present, no `search_aloha_funds` schema file | ❌ Absent — confirmed |
| Claude | MCP tool list — 10 tools registered, `search_aloha_funds` not present | ❌ Absent — confirmed |

---

## BDD Scenario Outcomes

| Scenario | Description | Cursor | Claude | Consolidated |
|---|---|---|---|---|
| **S1 Happy path** | Keyword search returns funds within accessible set | **S** | **S** | **S** |
| **S2 No-match** | Non-existent search term returns empty result | **S** | **S** | **S** |
| **S3 Cross-tenant** | No unauthorized fund data in results | **S** | **S** | **S** |

**First test reference (2026-04-24 — for historical context):**
- S1: PASS — `search_aloha_funds("83North", is_owned_by_ks: true)` returned 8 records; `get_funds("83North")` returned 8 rows; name alignment 8/8.
- S2: PASS — non-existent term returned `data: []`, `recordCount: 0`.
- S3: PASS — ALB public listings distinguished by `source` field; no private cross-tenant data.

---

## Security scan

| Risk | Assessment |
|---|---|
| Cross-tenant Aloha Fund exposure | ✅ **Eliminated** — tool removed |
| `is_owned_by_ks` flag manipulation | ✅ **Eliminated** — tool removed |
| Section 9 cross-tenant critical stop condition | ✅ Not applicable — no tool, no leakage vector |

**Security verdict: PASS ✅** — removal eliminates prior attack surface.

---

## Test matrix — Section 5.6 Search (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.6 Search** (`search_aloha_funds`) | **S** | **S** | **S** | **S** | **S** | **S** |

*Per guide v1.5 section 6 mandatory check: all row 5.6 Search cells must be S.*

---

## Comparison across test runs

| Dimension | First (2026-04-24) | Second (2026-05-13) | Third — Cursor (2026-05-21) | Third — Claude (2026-05-22) |
|---|---|---|---|---|
| `search_aloha_funds` | Available — tested | **S (removed)** | **S (removed — confirmed absent)** | **S (removed — confirmed absent)** |
| Scenario 1 | PASS | S | S | S |
| Scenario 2 | PASS | S | S | S |
| Scenario 3 | PASS | S | S | S |
| Cross-tenant risk | Tested — no leakage | Eliminated | **Eliminated** | **Eliminated** |
| Server connected | Connected | Connected | Connected | Connected |

---

## Verdict

**Final consolidated result: S — Skipped (all scenarios)**

Both agents confirm `search_aloha_funds` is absent from the MCP registry. No regression testing is required unless the vendor explicitly re-registers the tool with documented security controls and requests re-evaluation.

---

*Consolidated: 2026-05-22 · Sources: KS-982 - Cursor Result.md (2026-05-21) · KS-982 - Claude Result.md (2026-05-22) · Guide: dynamo-mcp-testing-guide_v1.5.md §5.6*
