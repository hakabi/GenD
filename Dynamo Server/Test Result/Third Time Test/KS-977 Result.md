# KS-977 — Consolidated QA Result (Third Time Test)
## Dynamo MCP QA — Validate OAuth and fund list via `get_funds` (Section 5.1 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Story** | US-E3-01 — Validate OAuth and fund list via get_funds |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.1 — Authentication test · **Guide v1.5** |
| **Test run** | Third Time Test — Consolidated (Cursor + Claude) |
| **Test dates (UTC)** | 2026-05-21 (Cursor) · 2026-05-22 (Claude) |
| **Testers / Agents** | Cursor — Composer (automated MCP invocation) · Claude — Cowork mode (claude-sonnet-4-6) |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` — **Connected (both runs)** |
| **Tool under test** | `get_funds` (primary) · `get_fund_description` (optional ID path, v1.5 §B) |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3)** |

---

## Agent agreement summary

| Dimension | Cursor | Claude | Agreement |
|---|---|---|---|
| Scenario 1 — Happy path | **PASS** | **PASS** | ✅ Agree |
| Scenario 2 — Error path | **PASS** | **PASS** | ✅ Agree |
| Scenario 3 — Low-scope identity | **BLOCKED** | **BLOCKED** | ✅ Agree |
| `totalRecords` | **979** | **979** | ✅ Agree |
| First-page fund set | Identical (5-fund subset) | Identical (same top-5 within 10-fund page) | ✅ Agree |
| Credential leakage | None | None | ✅ Agree |
| Scenario 2 approach | HTTP probe at MCP gateway (401 responses) | Input-validation probe via tool call | Complementary — both valid |
| Unauthorized user matrix cell | P (HTTP probes pass) | B (low-scope identity) | ⚠️ Different dimension — see §S2 note |

**Both agents agree on all substantive outcomes. The only apparent matrix disagreement on "Unauthorized user" reflects two different test dimensions: Cursor tested unauthenticated HTTP access at the gateway (PASS), while Claude tested the absence of a low-scope Entra identity for tenant-isolation verification (BLOCKED — F-06). Both are correct; the consolidated matrix records both.**

---

## v1.5 requirements executed (KS-977 updated section)

| v1.5 requirement | Cursor | Claude | Consolidated |
|---|---|---|---|
| **A.** MCP connected; `get_funds` registered | PASS | PASS | **PASS** |
| **A.** 10-tool inventory aligned with KS-991 / guide 1.3 | PASS | PASS | **PASS** |
| **B.** Two-call `get_funds` consistency | PASS (`limit:5`) | PASS (`limit:10`) | **PASS** |
| **B.** Minimum fields: `Name`, `AssetClassName`, supporting attributes | PASS | PASS | **PASS** |
| **B.** Fund ID path via `get_fund_description` | PASS (GUID obtained) | PASS (GUID confirmed) | **PASS** |
| **B.** No credential material in output | PASS | PASS | **PASS** |
| **C.** Pagination metadata (`totalRecords`, `hasMore`, etc.) | PASS | PASS | **PASS** |
| **D.** Matrix row 5.1 — Happy path minimum | PASS | PASS | **PASS** |
| Security — VULN-01/02 on `read_data` | N/A (out of scope §5.1) | N/A | **N/A** |

---

## 10-tool inventory check (v1.5 §A — Cursor verified)

| # | Tool | v1.5 inventory | Registered |
|---:|---|:---:|:---:|
| 1 | `analyze_notes` | ✅ Yes | ✅ Yes |
| 2 | `describe_table` | ✅ Yes (HIGH) | ✅ Yes |
| 3 | `get_activity` | ✅ Yes | ✅ Yes |
| 4 | `get_documents` | ✅ Yes | ✅ Yes |
| 5 | `get_fund_description` | ✅ Yes | ✅ Yes |
| 6 | `get_funds` | ✅ Yes | ✅ Yes |
| 7 | `get_notes` | ✅ Yes | ✅ Yes |
| 8 | `list_table` | ✅ Yes (HIGH) | ✅ Yes |
| 9 | `llm_text_analysis` | ✅ Yes | ✅ Yes |
| 10 | `read_data` | ✅ Yes (HIGH — VULN-01/02) | ✅ Yes |
| — | `get_rating_details` | ❌ Removed 2026-05-07 | Absent |
| — | `get_rating_summary` | ❌ Removed 2026-05-07 | Absent |
| — | `search_aloha_funds` | ❌ Removed 2026-05-07 | Absent |

---

## Test execution

### Scenario 1 — Happy path: PASS ✅

#### Two-call consistency (Cursor: limit=5 · Claude: limit=10 · both offset=0)

Both agents performed two sequential calls and confirmed byte-identical results within each session.

| Metric | Cursor (2026-05-21) | Claude (2026-05-22) | Status |
|---|---|---|---|
| `totalRecords` | 979 | 979 | ✅ Stable |
| `recordCount` | 5 | 10 | ✅ (different limit) |
| `hasMore` | true | true | ✅ Agree |
| `wasTruncated` | false | false | ✅ Agree |
| `pagination.totalPages` | 196 (at limit=5) | 98 (at limit=10) | ✅ Consistent |
| Byte-identical call 2 vs call 1 | ✅ | ✅ | ✅ Confirmed |
| Credential leakage | None | None | ✅ Clean |

#### Fund rows — first page (Cursor limit=5 with full field set)

| # | Name | AssetClassName | SubAssetClassName | PipelineStatus | FundManagerName | ResponsibleName |
|---:|---|---|---|---|---|---|
| 1 | 2026 Fund | Private Equity | Buyout and Growth Equity | 1 - Pre-One Pager | Phoenix Equity | Andrew Stevenson |
| 2 | 36 South | Absolute Return | Relative Value | X - Exited | 36 South Capital Advisors | Burton Yuen |
| 3 | 59 North Partners, LP | Absolute Return | Equity Hedge | P - Portfolio | 59 North Capital Management | Kapua Aiu-Yasuhara |
| 4 | 5AM Ventures IV, LP | Private Equity | Venture Capital | X - Exited | 5AM Ventures | Jon Iwatani |
| 5 | 5AM Ventures V, L.P. | Private Equity | Venture Capital | X - Exited | *(null)* | Jon Iwatani |

#### Additional funds 6–10 (Claude limit=10)

| # | Name | PipelineStatus | FundManagerName |
|---:|---|---|---|
| 6 | 83North Fund VII-X | P - Portfolio | 83North |
| 7 | 83North FXV III | P - Portfolio | 83North |
| 8 | 83North FXV IV | P - Portfolio | 83North |
| 9 | 83North FXV | P - Portfolio | 83North |
| 10 | 83North IV | P - Portfolio | 83North |

#### Optional ID path — `get_fund_description` (v1.5 §B, both agents)

`get_fund_description(fundName="59 North Partners, LP")` — both agents obtained identical GUID:

| Field | Value |
|---|---|
| GUID / `ID` | `D7879DB7-E230-4191-8849-DE4B7B64626C` |
| FundManagerName | 59 North Capital Management |
| Stability | Unchanged across all three test runs |

**Note (F-01):** `get_funds` list projection does not include a Fund GUID / `ID` field directly. The `get_fund_description` follow-up is the documented path for GUID resolution per v1.5 §B.

**Status: PASS ✅**

---

### Scenario 2 — Error path: PASS ✅

Both agents tested Scenario 2 using complementary methods:

#### 2.A — Cursor: HTTP probes at MCP gateway (unauthenticated access)

| Case | Request | HTTP | Response body | Silent fund list? |
|---|---|:---:|---|:---:|
| **S2-A1** | No `Authorization` header | **401** | `{"error":"Unauthorized","error_description":"Authentication required. See WWW-Authenticate header for resource metadata."}` | No |
| **S2-A2** | `Authorization: Bearer invalid_token_for_test` | **401** | `{"error":"invalid_token","error_description":"Bearer token validation failed."}` | No |

No raw JWT or production token logged. The MCP gateway returns explicit auth errors — no silent empty fund list.

**2.B — Positive control (Cursor):** `get_funds` via authenticated session immediately after unauthenticated curl probes still returned `success: true`, 5-fund page. OAuth session unaffected by HTTP-layer probes.

#### 2.B — Claude: Input-validation probe via tool call

`get_funds(limit=200)` (exceeds max of 100) returned:

```json
{"success":false,"message":"Invalid limit parameter: limit must be between 1 and 100"}
```

No stack trace, no internal path, no framework version string.

**Consolidated S2 verdict: PASS ✅**

Both dimensions pass: (1) unauthenticated HTTP access is explicitly rejected at the gateway with clear 401 errors, and (2) over-limit input validation produces a clean bounded error response with no internal leakage.

---

### Scenario 3 — Edge case (low-scope identity): BLOCKED ⚠️

Both agents confirm the same blocker. The authenticated identity has 979 funds in scope. No low-scope Entra/Dynamo test account (0 or <5 funds) has been provisioned. Tenant-isolation verification is not executable.

**To unblock:** Provision a low-scope Entra identity with 0 or <5 accessible funds; OAuth in; run `get_funds limit=5 offset=0`; assert `recordCount` matches actual scope without padded or cross-tenant rows.

**Status: BLOCKED ⚠️ (F-06 — persists across all three test runs)**

---

### Operational note — Cursor bridge issue (2026-05-21)

Prior to Cursor's test run, the MCP bridge failed with `EADDRINUSE` on port 37189 and logged `Connection closed (-32000)` until stale `mcp-remote` processes were terminated. After cleanup, the connector reconnected and all Scenario 1 calls executed cleanly. This is consistent with the mid-session disconnect behavior documented in the Second Time Test (2026-05-13). Claude's run on 2026-05-22 did not encounter this issue.

---

## Security scan

| Check | Cursor | Claude | Consolidated |
|---|---|---|---|
| Raw JWT or Bearer token in tool output | None | None | ✅ None |
| Refresh token or client secret in output | None | None | ✅ None |
| Credential leakage via error paths | None | None | ✅ None |
| Fabricated / invented fund rows | None | None | ✅ None |

**Security verdict: PASS ✅**

---

## Findings

| ID | Severity | Description | Source | Status |
|---|---|---|---|---|
| F-01 | Low | `get_funds` list projection omits Fund GUID / `ID`. Use `get_fund_description` for GUID resolution (v1.5 §B documented path). | Cursor | **Persists — by design** |
| F-02 | Info | `5AM Ventures V, L.P.` — `FundManagerName` null. Source data gap, not MCP fabrication. | Both | **Persists — by design** |
| F-03 | Info | OAuth session requires periodic re-auth between sessions; by-design connector behavior. | Cursor | **By design** |
| F-06 | Medium | No low-scope Entra test identity — Scenario 3 not executable across all three test runs. | Both | **Persists — environment action required** |
| N-01 | Info | `totalRecords` 979 (Third Test) vs 978 (Second Test, 2026-05-13) — +1 fund added to tenant scope. | Cursor | **Informational** |
| N-02 | Info | Cursor bridge `EADDRINUSE` / `mcp-remote -32000` resolved by terminating stale processes before test run. | Cursor | **Informational** |

---

## Test matrix — Section 5.1 Auth (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.1 Auth** (`get_funds`) | **✅ P** | **✅ P** (Claude: limit=200 rejected) | **✅ P** (Cursor: 401 at gateway) · **⚠️ B** (F-06: low-scope identity) | **✅ P** (S2.C prior) | n/a | n/a |

*Unauthorized user cell: HTTP gateway correctly rejects unauthenticated requests (P), but low-scope tenant isolation test cannot be executed without a provisioned restricted identity (B — F-06). Both dimensions documented.*

---

## Comparison across test runs

| Dimension | First (2026-04-25) | Second (2026-05-13) | Third — Cursor (2026-05-21) | Third — Claude (2026-05-22) |
|---|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** | **v1.5** |
| Tool inventory | 8 tools | 8 tools | **10 tools** | **10 tools** |
| Scenario 1 | PASS | PASS | **PASS** | **PASS** |
| Scenario 2 | PASS | PASS | **PASS** (HTTP probes) | **PASS** (limit validation) |
| Scenario 3 | BLOCKED | BLOCKED | **BLOCKED** | **BLOCKED** |
| `totalRecords` | 977 | 978 | **979** | **979** |
| First-5 fund set | Same 5 | Identical | **Identical** | **Identical** |
| GUID (59 North) | D7879DB7... | D7879DB7... | D7879DB7... (stable) | **D7879DB7... (stable — 3 runs)** |
| Credential leakage | None | None | None | **None** |
| MCP connector state | Connected | Mid-session disconnect | Connected (after bridge fix) | **Connected** |

---

## Verdict

| Criteria | Cursor | Claude | Consolidated |
|---|---|---|---|
| Section 5.1 happy path | PASS | PASS | **PASS** |
| Two-call consistency check | PASS | PASS | **PASS** |
| 10-tool v1.5 inventory documented | PASS | PASS | **PASS** |
| No credential leakage | PASS | PASS | **PASS** |
| No invented / fabricated fund rows | PASS | PASS | **PASS** |
| Scenario 2 error path | PASS | PASS | **PASS** |
| Scenario 3 edge case | BLOCKED | BLOCKED | **BLOCKED** (F-06 — all three test runs) |

**Final consolidated result: PASS (Scenario 1) / PASS (Scenario 2) / BLOCKED (Scenario 3)**

Both agents independently confirm the happy path and error path. `totalRecords` 979 is stable across both runs on 2026-05-21/22. The 59 North GUID baseline is stable across all three test runs. Scenario 3 (low-scope identity) remains the single persistent gap — unresolvable without environment action (F-06).

---

*Consolidated: 2026-05-22 · Sources: KS-977 - Cursor Result.md (2026-05-21) · KS-977 - Claude Result.md (2026-05-22) · Guide: dynamo-mcp-testing-guide_v1.5.md §5.1*
