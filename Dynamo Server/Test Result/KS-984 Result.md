# KS-984 — Consolidated test result: AUTH suite (§7.1)

**Sources:** [KS-984 — Claude Result](./KS-984%20-%20Claude%20Result.md) · [KS-984 — Cursor Result](./KS-984%20-%20Cursor%20Result.md)  
**Project KS** · **Jira:** [KS-984](https://gendvn.atlassian.net/browse/KS-984)

| Field | Value |
| --- | --- |
| **Summary** | Dynamo MCP Security QA — **AUTH-01–AUTH-05** (unauthenticated access, token rejection, role scope, tenant isolation, parameter tampering) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — **Security & Abuse-Case Testing** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§7.1** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Agents** | **Claude** (Sonnet 4.6, Claude Code VSCode extension, `mcp-remote`) · **Cursor Agent** (`project-0-GenD-conceptia-dynamo`) |
| **Consolidated report date** | 2026-04-24 |

---

## 1. Executive summary (merged)

| ID | Test | Claude | Cursor | **Consolidated** | Notes |
| --- | --- | :---: | :---: | :---: | --- |
| **AUTH-01** | Unauthenticated SSE | PASS | PASS | **PASS** | **401**, empty body, no fund/token payload in body. Claude captured `WWW-Authenticate` (OAuth resource metadata). |
| **AUTH-02** | Invalid / replayed bearer | PASS (proxy) | PASS (proxy) | **PASS (proxy)** | Synthetic invalid bearer **rejected**; **no** literal replay of a **real expired JWT** in either run (credential-handling gap). |
| **AUTH-03** | Out-of-scope role → **403** | N/E | N/E | **N/E** | No second principal / documented admin-only action; **no 403** on routine calls. |
| **AUTH-04** | Tenant isolation (`get_funds`, `search_aloha_funds`) | PASS (behavioral) | PASS (behavioral) | **PASS (behavioral)** | **`totalRecords: 977`** for **U**; **`search_aloha_funds`** (**`"pe"`**, **`is_owned_by_ks: true`**) → **30** hits, all **`source: solovis`**. Claude added a **second** `get_funds` call to confirm count stability. **Not** a two-tenant negative proof. |
| **AUTH-05** | Parameter tampering / escalation | PASS ⚠️ | PASS | **PASS** ⚠️ | Both: **non-SELECT** blocked; **invalid** `fund_source` rejected; **`sys.tables`** catalog readable (**policy** flag). Claude added: **oversized** `limit`, **ES parse-error** path (**info disclosure** — see §6), extra **`read_data`** probes (union / path-style). |

**Additional HTTP-layer findings** (Claude only in this consolidation; not duplicated by Cursor):

| Finding | Severity |
| --- | :---: |
| `Access-Control-Allow-Origin: *` | Medium |
| No **429** on rapid unauthenticated probes (20× **401**) | Low–Medium |
| `X-Powered-By: Express` | Info |
| PKCE **`plain`** advertised alongside **S256** in OAuth metadata | Low |
| Raw **Elasticsearch** error forwarded from `search_aloha_funds` (index / UUID / node leakage) | Medium |

**Overall consolidated verdict:** **PASS with observations and documented gaps.** Executable AUTH checks align across agents. **AUTH-03** not exercised. **AUTH-02** / **AUTH-04** full negative proofs remain **open** (see §9). Claude surfaced **two medium** items worth tracking: **wildcard CORS** and **ES error verbosity**.

---

## 2. BDD traceability (ticket)

| Scenario | Consolidated outcome |
| --- | --- |
| **S1 — Authorized session** | **PASS** — `get_funds` / `search_aloha_funds` return in-scope structured data for **U**. |
| **S2 — AUTH-01 / 02 / 03** | **AUTH-01 PASS** · **AUTH-02 proxy PASS** · **AUTH-03 N/E** |
| **S3 — AUTH-04 / 05** | **AUTH-04** behavioral **PASS** (single-tenant **U**) · **AUTH-05 PASS** with **`sys.tables`** + (Claude) **ES error** observation |

---

## 3. Test environment

| Item | Claude | Cursor |
| --- | --- | --- |
| **Client** | Claude Code (Sonnet 4.6), VSCode extension, **`mcp-remote`** stdio | Cursor Agent, MCP server id **`project-0-GenD-conceptia-dynamo`** |
| **HTTP probes** | PowerShell **`Invoke-WebRequest`** | PowerShell **`Invoke-WebRequest`** |
| **Tools (live)** | `get_funds`, `search_aloha_funds`, `read_data` | `get_funds`, `search_aloha_funds`, `read_data` |
| **Baseline** | **977** funds; two independent `get_funds` calls for count stability | **977** funds; `get_funds` with **`limit: 5`** for sampling |

---

## 4. Execution detail

### 4.1 AUTH-01 — Unauthenticated **GET** `/dynamo/sse`

- **Request:** no `Authorization`.
- **Result:** **401**, **empty** body (both agents). Claude additionally documented `WWW-Authenticate: Bearer resource_metadata="https://mcp.conceptia.com/.well-known/oauth-protected-resource", scope="openid profile user.read"`.
- **Verdict:** **PASS**.

### 4.2 AUTH-02 — Rejected bearer (proxy)

- **Header:** `Authorization: Bearer invalid.test.token…` (synthetic; wording differs slightly between reports).
- **Result:** **401**, **empty** body.
- **Verdict:** **PASS (proxy)** — real expired-token replay **deferred** (controlled security QA, redacted logs).

### 4.3 AUTH-03 — Out-of-scope role (**403**)

- **Status:** **Not executed** (both). Needs second Azure AD principal with documented lower boundary **or** known admin-only MCP surface.

### 4.4 AUTH-04 — Tenant isolation (behavioral)

- **`get_funds`:** **`totalRecords: 977`** (Cursor: `limit: 5`; Claude: `limit: 1` ×2 for consistency).
- **`search_aloha_funds`:** `search_text: "pe"`, **`is_owned_by_ks: true`** → **30** results, all **`source: solovis`**.
- **Verdict:** **PASS (behavioral)** — no second-tenant disproof available.

### 4.5 AUTH-05 — Parameter tampering

**`read_data` (merged probe set):**

| Probe | Outcome |
| --- | --- |
| `DROP TABLE Fund` | **Blocked** — `SECURITY_VALIDATION_FAILED` / must start with **SELECT** (both). |
| `SELECT TOP 1 * FROM dbo.Fund` | **Cursor:** **success**, one row (full row omitted in Cursor report). |
| `SELECT TOP 1 FundName, ID FROM dbo.Fund` | **Claude:** **`QUERY_EXECUTION_FAILED`** (column `FundName` does not exist — expected schema mismatch). |
| `SELECT name FROM sys.tables WHERE name = 'Fund'` | **success** — catalog row returned (both). |
| `SELECT 1 UNION SELECT password FROM sys.sql_logins` | **Claude:** **`QUERY_EXECUTION_FAILED`** — **PASS**. |
| Path-traversal / odd SQL style | **Claude:** **`QUERY_EXECUTION_FAILED`**. |
| `SELECT TOP 1 * FROM dbo.ThisTableDoesNotExistKS984` | **Cursor:** **`QUERY_EXECUTION_FAILED`**, controlled DB message **without** stack in MCP **`message`**. |

**`get_funds`:**

| Input | Result |
| --- | --- |
| `limit: 9999999` | **Claude:** `success: false` — limit rejected — **PASS**. |

**`search_aloha_funds`:**

| Input | Result |
| --- | --- |
| Invalid `fund_source` | **Rejected** with explicit allow-list **solovis, ALB, aevest, evest** (both; placeholder string differed). |
| `search_text: "'; DROP TABLE funds; --"` | **Claude:** **Elasticsearch** parse failure; raw **ES** error JSON forwarded to client (**index name**, **UUID**, **node id** — **information disclosure**). Injection resistance **PASS**; error hygiene **observation**. |

---

## 5. HTTP-layer security (Claude probes)

- **CORS:** `Access-Control-Allow-Origin: *` with broad methods/headers — recommend tightening to known MCP client origins.
- **Rate limiting:** 20 rapid unauthenticated requests → all **401**, **no 429**.
- **`X-Powered-By: Express`** — recommend disabling.
- **OAuth metadata:** `code_challenge_methods_supported` includes **`plain`** — recommend **S256**-only.
- **TLS:** **1.2** and **1.3** accepted; plain HTTP not offered as a clean downgrade (Claude).

---

## 6. Error hygiene (sample)

- **401** probes: **empty** body at HTTP layer (both).
- **`read_data`:** Short errors on sampled failures; **no** stack/file paths in MCP **`message`** for Cursor’s bogus-table case.
- **`search_aloha_funds`:** **Claude** — **ES** errors may leak infrastructure identifiers (**medium**); should be wrapped generically for clients.

---

## 7. Test matrix (§7.1)

| ID | Happy path | Invalid input | Unauthorized | Network drop | Large dataset |
| --- | :---: | :---: | :---: | :---: | :---: |
| **AUTH-01** | **P** | n/a | n/a | n/a | n/a |
| **AUTH-02** | **P*** | n/a | n/a | n/a | n/a |
| **AUTH-03** | **N/E** | n/a | **N/E** | n/a | n/a |
| **AUTH-04** | **P**† | n/a | **N/E** | n/a | **P** |
| **AUTH-05** | **P** ⚠️ | **P** ⚠️ | n/a | n/a | **P** |

\* Proxy synthetic bearer · † Single-tenant **U** · ⚠️ **`sys.tables`** + **ES** error verbosity (Claude)

---

## 8. Findings, gaps, and follow-ups

| ID | Item | Severity | Source |
| --- | --- | :---: | --- |
| **KS-984-SEC-01** | `search_aloha_funds` forwards raw **Elasticsearch** errors (index, UUID, node) | Medium | Claude |
| **KS-984-SEC-02** | `Access-Control-Allow-Origin: *` on authenticated SSE | Medium | Claude |
| **KS-984-OBS-01** | `read_data` principal can read **`sys.tables`** | Low / policy | Both |
| **KS-984-OBS-02** | No rate limiting observed on unauthenticated probes | Low–Medium | Claude |
| **KS-984-OBS-03** | PKCE **`plain`** in OAuth server metadata | Low | Claude |
| **KS-984-OBS-04** | `X-Powered-By: Express` | Info | Claude |
| **KS-984-GAP-01** | **AUTH-03** not executed — no second identity / entitlement matrix | Open gap | Both |
| **KS-984-GAP-02** | **AUTH-04** — no two-tenant negative proof | Open gap | Both |
| **KS-984-GAP-03** | **AUTH-02** — no replay of **real expired** JWT in redacted controlled run | Open gap | Both |

*(Renumbered duplicate **KS-984-GAP-02** from the Claude-only report: second gap is now **KS-984-GAP-03**.)*

**Suggested next steps**

1. Remediate **KS-984-SEC-01** (wrap **ES** errors) and **KS-984-SEC-02** (restrict CORS).
2. Provision **second** test account / tenant for **AUTH-03** and **AUTH-04** negative tests.
3. Run **AUTH-02** with captured expired token in a **controlled** environment.
4. Align **`read_data`** / catalog visibility with **§1.4** posture.

---

## 9. Dual-agent consistency

| Area | Agreement |
| --- | --- |
| **AUTH-01** | **401**, empty body |
| **AUTH-02** | Proxy **PASS**; same limitation on real JWT replay |
| **AUTH-03** | **N/E** |
| **AUTH-04** | **977** / **30** **`solovis`** results; behavioral only |
| **AUTH-05** | **DROP** blocked; **`fund_source`** validated; **`sys.tables`** visible |
| **HTTP/CORS/rate/PKCE/ES leak** | **Claude only** in this cycle |

---

## 10. Conclusion

**KS-984** §7.1 is **PASS with observations** across **Claude** and **Cursor**: core AUTH behaviors match (**401** without session, synthetic bad token rejected, tenant-consistent reads for **U**, parameter tampering largely blocked). **AUTH-03** remains unrun; **AUTH-02** and **AUTH-04** lack full strength-of-proof without extra identities. The consolidated record adds **Claude-only** **medium** findings (**CORS** `*`, **Elasticsearch** error forwarding) and **low**/info items (**rate limit**, **PKCE plain**, **`X-Powered-By`**) for product/security tracking.

---

*Consolidated from Claude (Sonnet 4.6) and Cursor Agent reports · Guide v1.3 · 2026-04-24*
