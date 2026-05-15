# KS-984 — Consolidated Test Result: AUTH suite (Section 7.1, Guide v1.4)

**Sources:** [KS-984 — Claude Result](./KS-984%20-%20Claude%20Result.md) · [KS-984 — Cursor Result](./KS-984%20-%20Cursor%20Result.md)  
**Project KS** · **Jira:** [KS-984](https://gendvn.atlassian.net/browse/KS-984)

| Field | Value |
|---|---|
| **Summary** | Dynamo MCP Security QA — **AUTH-01–AUTH-05** (unauthenticated access, token rejection, role scope, tenant isolation, parameter tampering) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — Security & Abuse-Case Testing |
| **Guide** | `dynamo-mcp-testing-guide_v1.4.md` **§7.1** · Stories `dynamo_mcp_testing_stories_v1.2.md` US-E4-01 |
| **MCP** | `conceptia-dynamo` / `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Agents** | **Claude** (Sonnet 4.6, Cowork mode, 2026-05-14) · **Cursor** (Composer, 2026-05-13) |
| **Tool inventory** | v1.4 — **7 tools** registered; `read_data` not registered (**S**); `search_aloha_funds` out of v1.4 scope |
| **Consolidated report date** | 2026-05-14 |

---

## 1. Executive Summary

| ID | Test | Claude | Cursor | **Consolidated** | Notes |
|---|---|:---:|:---:|:---:|---|
| **AUTH-01** | Unauthenticated SSE | BLOCKED* | P (by ref) | **P (by ref)** | Claude sandbox proxy blocked direct retry; Cursor cross-references KS-977 `curl` → **401** + `WWW-Authenticate`. First Test evidence (2026-04-24) stands. |
| **AUTH-02** | Replay expired token | N/E | P (by ref) | **P (by ref)** | No real JWT replay in either run; synthetic invalid bearer from KS-977 evidence carries forward. Open gap remains (KS-984-GAP-03). |
| **AUTH-03** | Out-of-scope role → 403 | N/E | N/A | **N/E** | No second identity / admin-only MCP surface available in either run. Open gap (KS-984-GAP-01). |
| **AUTH-04** | Tenant isolation (`get_funds`) | ✅ PASS | ✅ PASS (smoke) | **PASS (behavioral)** | Claude: two-call consistency — 978 funds, identical first page. Cursor: consistent authorized pages in-session. Single-tenant U; no two-tenant negative proof (KS-984-GAP-02). |
| **AUTH-05** `get_funds` | ✅ PASS | ✅ PASS | **PASS** | SQL injection → safe empty (both). Cursor additionally surfaced numeric type coercion (see §4.5, N-01). |
| **AUTH-05** `get_fund_description` | ✅ PASS | — | **PASS** | SQL injection → safe empty (Claude). Cursor did not probe separately. |
| **AUTH-05** `get_documents` | ✅ PASS | — | **PASS** | Mandatory filter enforced + SQL injection → safe empty (Claude). |
| **AUTH-05** `get_notes` | ✅ PASS ℹ️ | — | **PASS ℹ️** | `["*"]` wildcard returns all 160,818 records — by-design per schema (Claude). See N-02. |
| **AUTH-05** `get_activity` | ✅ PASS | — | **PASS** | SQL injection → safe empty (Claude). |
| **AUTH-05** `read_data` | **S** | **S** | **S** | Not registered in v1.4 inventory; sub-cases deferred until KS-991 registration. |

\* Claude sandbox proxy blocks outbound HTTPS to `mcp.conceptia.com` — environment constraint only, not a product regression.

**Overall consolidated verdict: PASS with documented gaps.** Core AUTH behaviors align across agents for the testable cases. AUTH-03 remains unrun; AUTH-01/02 full direct-HTTP proofs rely on First Test evidence; AUTH-04 is behavioral single-tenant only. Three open gaps persist from the First Test — all require provisioning of additional test identities or a token interception environment to close.

---

## 2. BDD Traceability (v1.4 ticket)

| Scenario | Consolidated Outcome |
|---|---|
| **S1 — Authorized session (happy path)** | **PASS** — `get_funds` returns in-scope authorized tenant data for U; two-call consistency confirmed (Claude); in-session consistency confirmed (Cursor). |
| **S2 — Error path (AUTH-01, AUTH-02, AUTH-03)** | **AUTH-01 P (by ref)** · **AUTH-02 P (by ref)** · **AUTH-03 N/E** |
| **S3 — Edge case (AUTH-05 + empty scope)** | **PASS** — SQL injection → `success: true, recordCount: 0` across all tested string-filter tools; `get_documents` mandatory filter rejected bare calls; `read_data` sub-cases **S** |

---

## 3. Test Environment

| Item | Claude | Cursor |
|---|---|---|
| **Client** | Claude Cowork mode (Sonnet 4.6), `conceptia-dynamo` MCP connector | Cursor Composer, `user-conceptia-dynamo` MCP server |
| **Test date** | 2026-05-14 | 2026-05-13 |
| **HTTP probes** | `curl` via bash sandbox (blocked by proxy) | Cross-reference to KS-977 PowerShell `Invoke-WebRequest` |
| **Tools invoked** | `get_funds` (×2), `get_fund_description`, `get_documents`, `get_notes`, `get_activity` | `get_funds` (adversarial probes) |
| **Baseline fund count** | **978** (`get_funds`, `limit: 5`) | **978** (consistent pages) |
| **`read_data`** | S — not registered | S — not registered |

---

## 4. Execution Detail

### 4.1 AUTH-01 — Unauthenticated GET `/dynamo/sse`

**Claude (2026-05-14):** `curl` from bash sandbox returned `HTTP/1.1 403 Forbidden` with `X-Proxy-Error: blocked-by-allowlist` — sandbox proxy prevents outbound HTTPS to `mcp.conceptia.com`. The 403 originates from the local proxy, not the MCP server. Direct re-test not possible from this environment.

**Cursor (2026-05-13):** Cross-references KS-977 Cursor result — `curl` to `https://mcp.conceptia.com/dynamo/sse` (no `Authorization` header) → **401**, JSON body, `WWW-Authenticate: Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource"`.

**Carry-forward (First Test, 2026-04-24):** Both Claude and Cursor confirmed **401**, empty body, `WWW-Authenticate` present. No fund rows or tokens in body.

**Consolidated verdict: PASS (by reference)** — direct HTTP 401 confirmed in First Test and KS-977 cross-reference; sandbox proxy blocks Claude retry in this run only.

---

### 4.2 AUTH-02 — Rejected / replayed bearer

**Both agents:** No real expired JWT captured or replayed. Synthetic invalid bearer from KS-977 (`Authorization: Bearer invalid.test.token…`) confirmed → **401**, empty body, no silent fund success.

**Consolidated verdict: PASS (proxy / synthetic)** — real expired-token replay remains an open gap (KS-984-GAP-03).

---

### 4.3 AUTH-03 — Out-of-scope role (403)

**Both agents:** Not executed. No second Azure AD principal with a lower permission boundary provisioned. No admin-only MCP surface identified to trigger a 403 condition.

**Consolidated verdict: NOT EXECUTED** — open gap (KS-984-GAP-01).

---

### 4.4 AUTH-04 — Tenant isolation (behavioral)

**Claude:** Two `get_funds` calls (`limit: 5`, `offset: 0`) in the same OAuth session — identical results both times.

| Field | Value |
|---|---|
| `totalRecords` | **978** |
| `recordCount` | 5 |
| First-page funds | 2026 Fund · 36 South · 59 North Partners LP · 5AM Ventures IV LP · 5AM Ventures V LP |
| Call 1 vs Call 2 | Byte-for-byte identical |
| Invented rows | None |
| Credentials in output | None |

**Cursor:** Consistent authorized `get_funds` pages observed in-session. No cross-tenant data, no fabricated rows.

**Δ vs. First Test:** `totalRecords` 977 → **978** (+1 fund since 2026-04-24). First-page fund set unchanged.

**Consolidated verdict: PASS (behavioral)** — single-tenant U; no two-tenant negative proof (KS-984-GAP-02).

---

### 4.5 AUTH-05 — Parameter tampering

#### `get_funds` — tested by both agents

| Probe | Claude | Cursor | Consolidated |
|---|---|---|---|
| `fundName: "'; DROP TABLE Fund; --"` | `success: true`, `data: []`, `recordCount: 0` | `success: true`, `data: []`, `recordCount: 0` | ✅ **PASS** — safe empty; no SQL execution evidence |
| `fundName: "%25%25…"` (URL-encoded wildcard flood) | `success: true`, `data: []`, `recordCount: 0` | Not probed | ✅ **PASS** — safe empty |
| `fundName: <numeric value>` | Not probed | Server returned **3 rows** (type coercion) | ℹ️ **N-01** — see findings |

**N-01 (Cursor — new):** When `fundName` is supplied as a numeric type (wrong parameter type), the server coerced the value and returned 3 fund rows rather than returning a schema validation error. This is a **validation hygiene / type-coercion** observation (INJ-06 pattern) — it does not represent an AUTH bypass or cross-tenant escalation. Logged for **KS-985** (INJ suite) as a hygiene item.

#### `get_fund_description` — Claude only

| Probe | Result | Verdict |
|---|---|---|
| `fundName: "'; SELECT * FROM Fund --"` | `success: true`, `data: []`, `recordCount: 0` | ✅ PASS — safe empty |

#### `get_documents` — Claude only

| Probe | Result | Verdict |
|---|---|---|
| Bare call (no filters) | `success: false` — "At least one filter is required: filterType/filterValue, documentCategories, or startDate/endDate" | ✅ PASS — mandatory filter enforced |
| `filterType: "fund"`, `filterValue: "'; SELECT * FROM Document --"` | `success: true`, `data: []`, `recordCount: 0` | ✅ PASS — safe empty |

#### `get_notes` — Claude only

| Probe | Result | Verdict |
|---|---|---|
| `activityCategories: ["*"]`, `includeBody: false`, `limit: 5` | `success: true`, `recordCount: 5`, `totalRecords: 160,818` | ℹ️ **N-02** — by-design (see findings) |

#### `get_activity` — Claude only

| Probe | Result | Verdict |
|---|---|---|
| `fundNames: ["'; SELECT * FROM Activity --"]` | `success: true`, `data: []`, `recordCount: 0` | ✅ PASS — safe empty |

#### `read_data` — both agents

Not registered in v1.4 inventory. AUTH-05 `read_data` sub-cases marked **S** pending KS-991 registration. Per guide §1.4, `read_data` is HIGH risk — do not claim P without enumeration proof.

---

## 5. Tool Inventory Verification (v1.4 precondition)

| # | Tool | Claude session | Cursor session | v1.4 scope |
|---|---|:---:|:---:|---|
| 1 | `analyze_notes` | ✅ | ✅ | Out of scope (minimal AUTH pass) |
| 2 | `get_activity` | ✅ | ✅ | In scope — AUTH-05 |
| 3 | `get_documents` | ✅ | ✅ | In scope — AUTH-05 |
| 4 | `get_fund_description` | ✅ | ✅ | In scope — AUTH-05 |
| 5 | `get_funds` | ✅ | ✅ | In scope — primary (AUTH-04, AUTH-05) |
| 6 | `get_notes` | ✅ | ✅ | In scope — AUTH-05 |
| 7 | `llm_text_analysis` | ✅ | ✅ | Out of scope (minimal AUTH pass) |
| 8 | `read_data` | ❌ not registered | ❌ not registered | S — when live |

**Verdict:** 7 tools registered in both sessions — matches v1.4 expected count. No inventory drift detected. `search_aloha_funds` absent — correct (out of v1.4 scope). `read_data` absent — correct (S, pending KS-991).

---

## 6. Security Scan

| Check | Claude | Cursor | Consolidated |
|---|---|---|---|
| Raw JWT / Bearer token in tool output | ✅ None | ✅ None | ✅ Clear |
| Refresh token / client secret in transcript | ✅ None | ✅ None | ✅ Clear |
| SQL errors or stack traces in any response | ✅ None | ✅ None | ✅ Clear |
| Cross-tenant fund data | ✅ None | ✅ None | ✅ Clear |
| Invented / fabricated fund rows | ✅ None | ✅ None | ✅ Clear |
| Credential leakage via response fields | ✅ None | ✅ None | ✅ Clear |

**Security verdict: PASS** — No credential material, SQL errors, or cross-tenant data in any tool output or transcript across either agent.

---

## 7. Test Matrix — Section 7.1 AUTH (v1.4)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|:---:|:---:|:---:|:---:|:---:|
| **AUTH-01** (unauthenticated SSE) | **P*** | n/a | n/a | n/a | n/a |
| **AUTH-02** (token replay) | **P*** | n/a | n/a | n/a | n/a |
| **AUTH-03** (out-of-scope role) | **N/E** | n/a | **N/E** | n/a | n/a |
| **AUTH-04** (tenant isolation) | **P†** | n/a | **N/E** | n/a | n/a |
| **AUTH-05** `get_funds` | **P** | **P** ℹ️ | n/a | n/a | n/a |
| **AUTH-05** `get_fund_description` | **P** | **P** | n/a | n/a | n/a |
| **AUTH-05** `get_documents` | **P** | **P** | n/a | n/a | n/a |
| **AUTH-05** `get_notes` | **P** | **P** ℹ️ | n/a | n/a | n/a |
| **AUTH-05** `get_activity` | **P** | **P** | n/a | n/a | n/a |
| **AUTH-05** `read_data` | **S** | **S** | n/a | n/a | n/a |

\* First Test / KS-977 evidence carries forward — direct retry blocked by sandbox proxy (Claude) and not re-run (Cursor)  
† Single-tenant U only — no two-tenant negative proof  
ℹ️ `get_funds` numeric coercion (Cursor, N-01); `get_notes` `["*"]` wildcard broad result (Claude, N-02)

---

## 8. Findings and Gaps

### Persisting from First Test (2026-04-24)

| ID | Severity | Description | Status |
|---|---|---|---|
| KS-984-GAP-01 | Open gap | AUTH-03 not executed — no second Azure AD identity or admin-only MCP surface available | **Persists — unresolved** |
| KS-984-GAP-02 | Open gap | AUTH-04 — no two-tenant negative proof; single tenant U only | **Persists — unresolved** |
| KS-984-GAP-03 | Open gap | AUTH-02 — no real expired JWT replay; synthetic invalid bearer only | **Persists — unresolved** |
| KS-984-SEC-01 | Medium | `search_aloha_funds` forwarded raw Elasticsearch errors (index, UUID, node) | **Out of v1.4 scope** — tool retired from inventory |
| KS-984-SEC-02 | Medium | `Access-Control-Allow-Origin: *` on authenticated SSE | **Carry-forward** — not retestable from sandbox this run |
| KS-984-OBS-01 | Low | `read_data` principal could read `sys.tables` catalog (First Test) | **Deferred** — tool not in v1.4 registry |
| KS-984-OBS-02 | Low–Medium | No rate limiting observed on unauthenticated probes (First Test) | **Carry-forward** — AUTH-01 not directly retestable |

### New Observations (Second Run — both agents)

| ID | Severity | Source | Description |
|---|---|---|---|
| N-01 | Info | Cursor | `get_funds` with `fundName` passed as a **numeric type** — server coerced the value and returned 3 fund rows instead of rejecting with a schema validation error. No AUTH impact; logged as **INJ-06 / validation hygiene** finding for **KS-985**. |
| N-02 | Info | Claude | `get_notes` with `activityCategories: ["*"]` returns all **160,818** activity records across all categories — explicitly documented behavior per schema ("Use `['*']` to include all categories"). All records within authorized tenant scope; no cross-tenant escalation. |
| N-03 | Info | Claude | `totalRecords` increased from **977** (First Test, 2026-04-24) to **978** (this run) — one new fund added to the backend. No impact on test results. |
| N-04 | Info | Claude | AUTH-01 direct HTTP retry blocked by sandbox proxy allowlist — environment constraint only; `mcp.conceptia.com` not on the proxy allowlist. Not a product regression. |

### Suggested Next Steps (carry-forward from First Test)

1. Provision a second Azure AD / Entra identity with restricted fund scope to close **AUTH-03** (GAP-01) and **AUTH-04** two-tenant negative proof (GAP-02).
2. Run **AUTH-02** with a real captured expired token in a controlled token-interception environment (e.g., Postman OAuth flow + manual expiry/revocation).
3. Address **KS-984-SEC-02** (CORS `*`) — vendor recommendation to restrict to known MCP client origins.
4. Investigate `get_funds` **numeric type coercion** (N-01) with vendor — schema should return a validation error rather than coercing and returning data.
5. Re-run **AUTH-01** from a non-sandbox environment (local terminal `curl`) to close the carry-forward gap cleanly.

---

## 9. Dual-Agent Consistency

| Area | Claude | Cursor | Agreement |
|---|---|---|---|
| `get_funds` SQL injection | `success: true`, `data: []` | `success: true`, `data: []` | ✅ Identical |
| AUTH-04 baseline fund count | 978, consistent two-call | 978, consistent in-session | ✅ Aligned |
| `read_data` inventory status | S — not registered | S — not registered | ✅ Aligned |
| AUTH-01/02 HTTP layer | BLOCKED (sandbox) → carry-forward | P by reference (KS-977) | ✅ Consistent conclusion |
| AUTH-03 | N/E | N/A | ✅ Consistent — not exercised |
| `get_funds` numeric coercion | Not probed | 3 rows returned (coercion) | ⚠️ Cursor-only finding — N-01 |
| AUTH-05 depth (`get_fund_description`, `get_documents`, `get_notes`, `get_activity`) | Fully probed | Not probed separately | Claude-only coverage — no contradiction |

---

## 10. Comparison with First Test (2026-04-24)

| Dimension | First Test (v1.3) | Second Test (v1.4) |
|---|---|---|
| Guide version | v1.3 | **v1.4** |
| Tool inventory | `get_funds`, `search_aloha_funds`, `read_data` | **7 tools** (v1.4); `search_aloha_funds` retired; `read_data` S |
| AUTH-01 | PASS (PowerShell direct HTTP, 401) | **BLOCKED (sandbox) → carry-forward** |
| AUTH-02 | PASS (proxy, synthetic bearer) | **P by reference** — same gap |
| AUTH-03 | N/E | **N/E** — same gap |
| AUTH-04 | PASS — 977 funds, consistent | **PASS** — 978 funds (+1), consistent |
| AUTH-05 `get_funds` | PASS (limit:9999999 rejected) + DROP blocked | **PASS** (SQL injection → safe empty; numeric coercion N-01) |
| AUTH-05 `get_fund_description` | Not tested | **PASS** — SQL injection → safe empty |
| AUTH-05 `get_documents` | Not tested | **PASS** — mandatory filter enforced + SQL injection → safe empty |
| AUTH-05 `get_notes` | Not tested | **PASS** — `["*"]` wildcard by-design (N-02) |
| AUTH-05 `get_activity` | Not tested | **PASS** — SQL injection → safe empty |
| AUTH-05 `read_data` | PASS (DROP blocked, `sys.tables` visible) | **S** — not registered in v1.4 |
| `search_aloha_funds` ES error (SEC-01) | Medium finding | **Out of v1.4 scope** |
| CORS `*` (SEC-02) | Medium finding | **Carry-forward** — not retestable from sandbox |
| Numeric type coercion | Not observed | **N-01** — Cursor (hygiene, KS-985) |
| Total fund count | 977 | **978** (+1) |
| Credential leakage | None | **None** |

---

## 11. Conclusion

**KS-984** §7.1 is **PASS with documented gaps** across Claude and Cursor on the **v1.4 tool inventory**. Core AUTH behaviors are consistent between agents: SQL injection on all tested string-filter tools returns safe empty results, `get_funds` two-call consistency is confirmed at 978 funds, `get_documents` enforces mandatory filter validation, and no credential material appears in any tool output.

**AUTH-03** remains unrun in both this test and the First Test. **AUTH-01/02** full direct-HTTP proofs rely on KS-977 and First Test carry-forward evidence. **AUTH-04** two-tenant negative proof remains an open gap. The `read_data` HIGH-risk tool is not yet registered in the v1.4 inventory — its AUTH-05 sub-cases are **S** and must not be claimed P until KS-991 registration is confirmed.

New observations in this run: Cursor surfaced a **numeric type coercion** behavior on `get_funds` (N-01, hygiene / KS-985); Claude confirmed `get_notes` `["*"]` wildcard broad-result is by-design (N-02).

---

*Consolidated from Claude (Sonnet 4.6, Cowork mode, 2026-05-14) and Cursor (Composer, 2026-05-13) · Guide v1.4 · `dynamo-mcp-testing-guide_v1.4.md` §7.1*
