# KS-984 — Consolidated test result: AUTH suite (section 7.1)

**Sources:** [KS-984 — Claude Result](./KS-984%20-%20Claude%20Result.md) · [KS-984 — Cursor Result](./KS-984%20-%20Cursor%20Result.md)  
**Project KS** · **Jira:** [KS-984](https://gendvn.atlassian.net/browse/KS-984)

| Field | Value |
| --- | --- |
| **Summary** | Dynamo MCP Security QA — **AUTH-01–AUTH-05** (unauthenticated access, token rejection, role scope, tenant isolation, parameter tampering) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — **Security & Abuse-Case Testing** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **section 7.1** |
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
| **AUTH-05** | Parameter tampering / escalation | PASS ⚠️ | PASS | **PASS** ⚠️ | Both: **non-SELECT** blocked; **invalid** `fund_source` rejected; **`sys.tables`** catalog readable (**policy** flag). Claude added: **oversized** `limit`, **ES parse-error** path (**info disclosure** — see section 6), extra **`read_data`** probes (union / path-style). |

**Additional HTTP-layer findings** (Claude only in this consolidation; not duplicated by Cursor):

| Finding | Severity |
| --- | :---: |
| `Access-Control-Allow-Origin: *` | Medium |
| No **429** on rapid unauthenticated probes (20× **401**) | Low–Medium |
| `X-Powered-By: Express` | Info |
| PKCE **`plain`** advertised alongside **S256** in OAuth metadata | Low |
| Raw **Elasticsearch** error forwarded from `search_aloha_funds` (index / UUID / node leakage) | Medium |

**Overall consolidated verdict:** **PASS with observations and documented gaps.** Executable AUTH checks align across agents. **AUTH-03** not exercised. **AUTH-02** / **AUTH-04** full negative proofs remain **open** (see section 9). Claude surfaced **two medium** items worth tracking: **wildcard CORS** and **ES error verbosity**.

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

## 7. Test matrix (section 7.1)

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
4. Align **`read_data`** / catalog visibility with **section 1.4** posture.

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

**KS-984** section 7.1 is **PASS with observations** across **Claude** and **Cursor**: core AUTH behaviors match (**401** without session, synthetic bad token rejected, tenant-consistent reads for **U**, parameter tampering largely blocked). **AUTH-03** remains unrun; **AUTH-02** and **AUTH-04** lack full strength-of-proof without extra identities. The consolidated record adds **Claude-only** **medium** findings (**CORS** `*`, **Elasticsearch** error forwarding) and **low**/info items (**rate limit**, **PKCE plain**, **`X-Powered-By`**) for product/security tracking.

---

*Consolidated from Claude (Sonnet 4.6) and Cursor Agent reports · Guide v1.3 · 2026-04-24*

---

## Updated requirements — guide v1.4 (8-tool MCP inventory)

**Effective:** May 2026 (customer confirmation)  
**Sources:** `Dynamo Server/Test Guide/dynamo-mcp-testing-guide_v1.4.md`; `Dynamo Server/Test Guide/dynamo_mcp_testing_stories_v1.2.md`  
**Scope note:** This section supplements the description above. It does not replace or rewrite earlier text (including legacy BDD wording).

### User Story (v1.4)

> As an **Internal QA Tester**, I want **Microsoft OAuth (Azure AD) and MCP session boundaries** proven through **unauthenticated transport checks**, **non-replayable tokens**, and **tenant-scoped tool responses** on the **customer-confirmed 8-tool surface** so that **guide section 7.1 (AUTH)** and the **security exit criteria in section 11** pass **without** Dynamo Software UI, **without** raw tokens in transcripts, and **without** cross-tenant or "silent success" fund payloads on auth failure.

### Overview (v1.4)

This story executes **guide section 7.1 — Authentication & Authorization (AUTH)** using the **v1.4 tool inventory** in **guide section 1.3**. Preconditions follow **guide section 2** (authorized Azure AD identity, black-box rule **section 1.1**). Enumeration and per-tool schemas: [**KS-991**](https://gendvn.atlassian.net/browse/KS-991) (sections 4.1–4.2). Cross-tool filter semantics (fund vs company naming, mandatory filters): [**KS-992**](https://gendvn.atlassian.net/browse/KS-992). **No** comparison to `https://dynamo.dynamosoftware.com/` or exported UI entitlement lists.

**v1.4 inventory:** **7** tools available today; **`read_data`** **planned**. This ticket exercises **AUTH-01–AUTH-05** against the **registered** tools below. **Out of scope:** `describe_table`, `get_rating_details`, `get_rating_summary`, `list_table`, `search_aloha_funds` — if they appear in a client registry, treat as **inventory drift** (**guide section 9**) and refresh **KS-991**.

| # | Tool | Relevance to this ticket |
|---:|---|---|
| 1 | `analyze_notes` | **Out of scope** for minimal AUTH pass — not used to prove AUTH-01/02/04; optional session smoke only if program requires |
| 2 | `get_activity` | **In scope** — **AUTH-05** parameter / filter tampering; fund scoping via `fundNames` (runtime ≥1 filter per **KS-991**) |
| 3 | `get_documents` | **In scope** — **AUTH-05**; `filterType`/`filterValue` / categories / dates; **`excludeContent: true`** preferred to respect **2MB** cap |
| 4 | `get_fund_description` | **In scope** — **AUTH-05** string filters; optional **identity cross-check** with `get_funds` rows (**Name** / manager alignment) |
| 5 | `get_funds` | **In scope — primary** — **AUTH-04** tenant isolation and **repeat-call** authorized fund set; baseline happy-path session |
| 6 | `get_notes` | **In scope** — **AUTH-05**; default category behavior per schema; **`includeBody: false`** for listing passes unless case requires body |
| 7 | `llm_text_analysis` | **Out of scope** for minimal AUTH pass — not required to close AUTH-01/04; use only if program explicitly chains (document separately) |
| 8 | `read_data` | **Planned / S** — **AUTH-05** includes `read_data` **when live**; until registered in **KS-991**, mark **`read_data`** sub-cases **S** with enumeration proof |

**Section 1.4:** Only **`read_data`** is **HIGH** risk when live; not applicable to this ticket's **`read_data`** leg until the tool registers.

### Detailed requirements (v1.4)

#### A. Preconditions and dependencies

Complete **E1** connectivity / OAuth / enumeration stories per Epic as applicable ([**KS-989**](https://gendvn.atlassian.net/browse/KS-989), [**KS-990**](https://gendvn.atlassian.net/browse/KS-990), [**KS-976**](https://gendvn.atlassian.net/browse/KS-976), [**KS-991**](https://gendvn.atlassian.net/browse/KS-991)) before treating failures as **product** defects.

Confirm **every tool invoked** for AUTH is registered and matches **KS-991** (expected **7** tools today).

**Black-box rule:** infer correctness from MCP outputs only — **401/403** vs **empty authorized** vs **happy success**; repeat-call stability; plausible field sets; **no** Dynamo UI cross-check.

#### B. AUTH case execution (guide section 7.1)

| ID | Test | Tool(s) (v1.4) | Expected |
|---:|---|---|---|
| **AUTH-01** | Unauthenticated connection to SSE endpoint | — (HTTP/SSE to `https://mcp.conceptia.com/dynamo/sse`) | **401 Unauthorized**; **no** fund rows or tokens in body |
| **AUTH-02** | Replay captured / expired OAuth token | — (same host) | Token rejected; **clean** JSON error; **no** silent fund success |
| **AUTH-03** | Invoke tool outside authorized scope | **Any** tool in **section 1.3** (e.g. `get_funds`) after session invalidation | **403** or MCP bridge error; **no** partial tenant payloads |
| **AUTH-04** | Access funds belonging to another tenant | **`get_funds`** (+ behavioral spot checks on overlapping **`get_*`** reads if used) | Only **authorized** tenant data; repeat identical calls — **consistent** sampled keys (`Name` + attributes, or **ID** if exposed) |
| **AUTH-05** | Manipulate tool parameters to escalate scope | **`get_funds`**, **`get_fund_description`**, **`get_documents`**, **`get_notes`**, **`get_activity`**, **`read_data` (when live)** | Validation / **empty authorized** / explicit error — **not** widened cross-tenant rows |

**Credential hygiene:** No raw **JWT**, refresh token, client secret, or password strings in chat transcripts, Jira, or shared logs — **stop**, redact, file defect per **guide sections 8–9** if leaked.

**Transport vs MCP bridge:** Document separately: **HTTP 401** from gateway, **MCP `-32000` transport**, and **IDE "server does not exist"** after connector removal — all valid "failure visibility" classes for **Scenario 2** (see **KS-977** evidence patterns).

#### C. Evidence pack and matrix (optional stretch)

Store **redacted** transcript + saved tool/HTTP JSON under `~/dynamo-mcp-tests/logs/YYYY-MM-DD/` per **guide section 8**.

**Test matrix (guide section 6):** Security suite feeds **section 11** exit gates with **AUTH**; coordinate row/column coverage with [**KS-993**](https://gendvn.atlassian.net/browse/KS-993). Capture **Unauthorized user** / **Network drop** cells where AUTH overlaps functional matrix work (**KS-977**).

#### D. Explicit exclusions (this ticket)

**`read_data`** (guide **section 5.5** tabular read story **KS-981**): **S** until registered — do not claim AUTH-05 `read_data` leg **P** without **KS-991** proof.

**`search_aloha_funds`** (guide **section 5.6**), **ratings**, **warehouse discovery tools**: **S** — not in v1.4 customer surface.

### UI/UX & front-end considerations (v1.4)

Capture connector **Connected / Ready** state **without** screenshots of secrets or OAuth codes.

Document client state flow: **Pre-auth → Auth in progress → Ready → Error** (e.g. **401**) with **guide section 9** first actions on failure.

### Acceptance criteria (BDD, v1.4)

*Scenario 1 — Happy path (authorized session)*

**Given** OAuth completed successfully for an authorized tester identity and the tools under test are registered per **KS-991**  
**When** the tester runs **AUTH-03/04** style calls (e.g. `get_funds` with normal parameters, optional overlapping `get_*` reads)  
**Then** responses show only **in-scope** tenant data; repeat calls in the same session are **consistent** on sampled keys; **no** secrets in JSON; **no** invented rows

*Scenario 2 — Error path (AUTH-01, AUTH-02, AUTH-03)*

**Given** no valid session (**AUTH-01**), or replayed / forged / expired bearer (**AUTH-02**), or tools invoked after forced disconnect / revocation (**AUTH-03**)  
**When** the tester hits the MCP host and/or invokes tools  
**Then** the user sees a **clear failure** (**401/403**, MCP bridge error, or explicit unauthorized message) — **not** a silent "success" fund list that contradicts the failure state

*Scenario 3 — Edge case (AUTH-05 + empty scope)*

**Given** crafted parameters intended to widen reads or reference non-existent funds, or an identity with **zero** rows in scope  
**When** the targeted **`get_*`** tools run  
**Then** the response is **validation error**, **empty authorized** (`success: true` with `recordCount: 0` is acceptable **only** when documented as authorized-empty), or scoped data — **never** cross-tenant rows; the agent must **not** invent funds

### Definition of Done (v1.4)

Unchanged from the **Definition of Done** block in the **original** description above; for QA execution, interpret as: **section 7.1** evidence stored (redacted), **AUTH** matrix / **section 11** inputs updated, defects linked if any, and peer review where applicable.

*(Refer to the verbatim **Definition of Done** checklist in the original ticket body above this v1.4 appendix.)*
