# KS-982 — Claude QA Result (Second Time Test)
## Dynamo MCP QA — Validate search_aloha_funds keyword search and tenant scope (Section 5.6)

| Field | Value |
|---|---|
| **Ticket** | [KS-982](https://gendvn.atlassian.net/browse/KS-982) |
| **Story** | US-E3-06 — Validate search_aloha_funds keyword search and tenant scope |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.6 — Search test · Guide v1.4 (out of scope in v1.4) |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tool under test** | `search_aloha_funds` |
| **Overall result** | **S — Skipped (all scenarios) — tool permanently removed from server** |

---

## Summary

`search_aloha_funds` was confirmed removed from the Conceptia Dynamo MCP server as of **2026-05-07** (intentional production hardening, confirmed by product owner). This was detected via ToolSearch against connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861` returning zero matches, and corroborated by KS-976 inventory re-verification (comment ID 20208).

Note: `search_aloha_funds` was already listed as **out of scope in guide v1.4** prior to the removal. The 2026-05-07 hardening makes this permanent — the tool is no longer part of the production MCP surface.

All three BDD scenarios are recorded as **S (Skipped — tool removed from server)**. The tenant isolation risk associated with `search_aloha_funds` (cross-tenant Aloha Fund exposure) is **eliminated by removal**. The Aloha Fund entity is no longer accessible via any MCP tool on the current 7-tool surface.

---

## Tool Availability Status

| Tool | Guide v1.4 Status | First Test (2026-04-24) | Current Status (2026-05-13) | Decision |
|---|---|---|---|---|
| `search_aloha_funds` | Out of scope in v1.4 | Available — tested (PASS across S1–S3) | **Removed — not registered** | Intentional production hardening (2026-05-07) |

---

## BDD Scenario Outcomes

### Scenario 1 — Happy path: S (Skipped) ⏭️

**Original scenario:** Given a `<SEARCH_TERM>` that returns at least one fund via `search_aloha_funds`, when results are compared to `get_funds` for the same session, then returned fund IDs are within the accessible set implied by `get_funds`.

**Outcome:** S — Skipped. `search_aloha_funds` is not registered on the MCP server. Keyword search and cross-reference against `get_funds` cannot be executed.

**First test reference (2026-04-24):** PASS — `search_aloha_funds("83North", is_owned_by_ks: true)` returned 8 solovis records; `get_funds("83North")` returned 8 rows; name alignment 8/8. Section 9 cross-tenant stop not triggered.

---

### Scenario 2 — Error path (no-match): S (Skipped) ⏭️

**Original scenario:** Given a search term that matches nothing, when search runs, then the response is an empty result set, not unrelated funds.

**Outcome:** S — Skipped. Tool not registered. Empty-results validation cannot be executed.

**First test reference (2026-04-24):** PASS — `search_aloha_funds("XYZNONEXISTENTFUND9999")` returned `success: true`, `recordCount: 0`, `data: []`. No unrelated funds returned.

---

### Scenario 3 — Edge case (cross-tenant): S (Skipped) ⏭️

**Original scenario:** Given suspicion of cross-tenant exposure, when the tester compares `search_aloha_funds` results to `get_funds` and other MCP reads, then if any unauthorized fund appears testing stops and a critical ticket is filed per section 9.

**Outcome:** S — Skipped. Tool not registered. Cross-tenant isolation validation cannot be executed. Since the tool is removed from the server, **no cross-tenant leakage is possible via this vector**. The tenant isolation risk is eliminated by removal.

**First test reference (2026-04-24):** PASS — `search_aloha_funds("83North", is_owned_by_ks: false)` returned 19 records (11 ALB public + 8 solovis); solovis set identical to Scenario 1; ALB public listings clearly distinguished by `source` and `fund_type` fields. No private cross-tenant data detected. Section 9 stop not triggered.

---

## Aloha Fund Domain Coverage Impact

The Aloha Fund entity (originally a distinct data source from the primary CRM Fund table, per KS-992 domain map) is no longer accessible via any MCP tool on the current 7-tool surface:

| Capability | Status |
|---|---|
| Keyword search across Aloha Fund records | **Eliminated — tool removed** |
| Aloha Fund ID cross-reference against `get_funds` (tenant isolation check) | **Eliminated — tool removed** |
| Aloha Fund entity in domain map | **Removed from active surface** |

---

## Security Risk Assessment

| Risk | Assessment |
|---|---|
| Cross-tenant Aloha Fund exposure via keyword search | ✅ **Eliminated** — tool removed from server |
| Aloha Fund data leakage via `is_owned_by_ks` flag manipulation | ✅ **Eliminated** — tool removed from server |
| Section 9 cross-tenant critical stop condition | ✅ **Not applicable** — tool absent, no leakage vector exists |

---

## Test Matrix Row — Section 5.6 Search

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.6 Search (`search_aloha_funds`)** | **S** | **S** | **S** | **S** | **S** |

*All cells S — tool permanently removed from server (intentional production hardening, 2026-05-07). Was already out of scope in guide v1.4.*

---

## Comparison with First Test (2026-04-24)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS (8/8 name alignment) | **S (Skipped — tool removed)** |
| Scenario 2 No-match / Error path | PASS | **S (Skipped — tool removed)** |
| Scenario 3 Cross-tenant / Edge case | PASS (no leakage detected) | **S (Skipped — tool removed; risk eliminated)** |
| search_aloha_funds availability | Available | **Removed** |
| Guide v1.4 scope status | Out of scope | **Out of scope + permanently removed** |
| Cross-tenant risk | Tested, no leakage found | **Eliminated by removal** |

---

## Evidence

- **Tool registry check:** ToolSearch against connector `0c5a3b61-86e4-4c75-b19f-40c0141fb861` — zero matches for `search_aloha_funds` (2026-05-07, corroborated 2026-05-13)
- **Confirmation source:** KS-976 comment ID 20208 — intentional production hardening confirmed by product owner
- **No live tool calls executed** — tool not registered on server
- **Report file:** `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-982 - Claude Result.md`

---

## Verdict

**Final result: S — Skipped (Scenarios 1–3)**  
`search_aloha_funds` permanently removed from the MCP server as intentional production hardening. The tool was already out of scope in guide v1.4 prior to removal. The associated cross-tenant tenant isolation risk (Aloha Fund exposure) is eliminated. No regression testing is needed unless the vendor re-registers the tool with documented security controls.

---

*Generated: 2026-05-13 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-982 v1.4 updated requirements (incl. 2026-05-07 tool removal update) · Guide: dynamo-mcp-testing-guide_v1.4.md*
