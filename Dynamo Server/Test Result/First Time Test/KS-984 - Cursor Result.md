# KS-984 — Test Result: AUTH suite (section 7.1) — **Cursor**

| Field | Value |
| --- | --- |
| **Jira** | [KS-984](https://gendvn.atlassian.net/browse/KS-984) |
| **Summary** | Dynamo MCP Security QA — **AUTH-01–AUTH-05** (unauthenticated access, token rejection, scope, tenant isolation, parameter tampering) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — **Security & Abuse-Case Testing** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **section 7.1** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **MCP server id (Cursor)** | `project-0-GenD-conceptia-dynamo` |
| **Tester / agent** | **Cursor Agent** |
| **Report date** | 2026-04-24 |

---

## 1. Executive summary

| ID | Test | Execution | Result | Notes |
| --- | --- | --- | :---: | --- |
| **AUTH-01** | Unauthenticated **GET** to SSE | PowerShell **`Invoke-WebRequest`** · no `Authorization` | **PASS** | **401**; response **body length 0** (no fund payload, no token material in body). |
| **AUTH-02** | Invalid / non-session bearer | Same URL · `Authorization: Bearer invalid.test.token.replay` | **PASS (proxy)** | **401**; empty body. *True “replay of captured expired JWT” not performed* (no captured token used — avoids handling real secrets). **Invalid** bearer is **rejected** cleanly. |
| **AUTH-03** | Tool outside authorized **role** scope → **403** | — | **N/E** | No **second identity** or documented **admin-only** MCP action available in this run; **no 403** observed on routine **`get_funds`** / **`search_aloha_funds`**. |
| **AUTH-04** | Tenant isolation · **`get_funds`**, **`search_aloha_funds`** | Authenticated MCP session | **PASS (behavioral)** | **`get_funds`** (`limit: 5`) reports **`totalRecords: 977`** for **U**; **`search_aloha_funds`** (`search_text: "pe"`, **`is_owned_by_ks: true`**) returns **30** hits, all **`source: solovis`**. **Cannot** prove absence of another tenant’s rows **without** a second-tenant account — black-box **consistency** for **U** only. |
| **AUTH-05** | Parameter manipulation / escalation · **`read_data`**, **`search_aloha_funds`** | See **section 4** | **PASS** | **Non-SELECT** rejected; **invalid** `fund_source` rejected; **bogus table** → controlled DB error string **without** stack trace in MCP message. **Observation:** **`SELECT`** against **`sys.tables`** **succeeded** (catalog visibility for the DB principal — **not** the same as cross-tenant row leak; flag for **policy** if catalog reads must be restricted). |

**BDD (ticket):**

| Scenario | Merged outcome |
| --- | --- |
| **S1 — Authorized session** | **PASS** — normal **`get_funds`** / **`search_aloha_funds`** return structured in-tenant data for **U**. |
| **S2 — AUTH-01 / 02 / 03** | **AUTH-01 PASS** · **AUTH-02 proxy PASS** · **AUTH-03 N/E** |
| **S3 — AUTH-04 / 05** | **AUTH-04** behavioral **PASS** (caveat) · **AUTH-05 PASS** with **sys.tables** note |

**Overall:** **PASS with gaps** — **AUTH-03** not exercised; **AUTH-02** not a literal replay test; **AUTH-04** not a two-tenant proof; recommend **follow-up** with **second tenant** / **low-privilege** principal for **AUTH-03** and **AUTH-04** negative tests.

---

## 2. AUTH-01 — Unauthenticated SSE

| Field | Value |
| --- | --- |
| **Request** | `GET https://mcp.conceptia.com/dynamo/sse` |
| **Auth** | None |
| **HTTP status** | **401** |
| **Response body** | **Empty** (`BodyLength: 0` in probe script) |

**Verdict:** **PASS** — aligns with guide expectation (**no** unauthenticated data on this probe).

---

## 3. AUTH-02 — Rejected bearer (proxy for bad token)

| Field | Value |
| --- | --- |
| **Request** | `GET` same URL |
| **Header** | `Authorization: Bearer invalid.test.token.replay` |
| **HTTP status** | **401** |
| **Response body** | **Empty** |

**Verdict:** **PASS (proxy)** — synthetic token **not** accepted. **Full AUTH-02** (replay of a **real expired** OAuth token) **deferred** to avoid logging or pasting live JWT material.

---

## 4. AUTH-05 — Parameter tampering (`read_data`, `search_aloha_funds`)

### 4.1 `read_data`

| Probe | Outcome |
| --- | --- |
| `DROP TABLE Fund` | **`success: false`** · `Security validation failed: Query must start with SELECT…` · `error: SECURITY_VALIDATION_FAILED` |
| `SELECT TOP 1 * FROM dbo.Fund` | **`success: true`** — one row returned (full row omitted from this report). |
| `SELECT name FROM sys.tables WHERE name = 'Fund'` | **`success: true`** — catalog query returned expected metadata row. |
| `SELECT TOP 1 * FROM dbo.ThisTableDoesNotExistKS984` | **`success: false`** · `Invalid object name…` · `error: QUERY_EXECUTION_FAILED` |

### 4.2 `search_aloha_funds`

| Probe | Outcome |
| --- | --- |
| `search_text: "pe"`, `fund_source: "__INVALID_ESCALATION_XYZ__"` | **`success: false`** · message lists allowed sources: **solovis, ALB, aevest, evest** |

**Verdict:** **PASS** for **destructive** SQL block, **invalid** `fund_source`, and **safe** SQL error shape on bad object name. **Policy note:** **`sys.tables`** readable via **`read_data`** — assess whether that meets **section 1.4** / deployment **hardening** expectations (separate from **cross-tenant** row access).

---

## 5. AUTH-04 — Tenant isolation (behavioral)

**Authenticated checks:**

- **`get_funds`** · `limit: 5`, `offset: 0` → **`success: true`**, **`totalRecords: 977`**, sample funds include names consistent with KS portfolio context (e.g. **59 North Partners, LP**).
- **`search_aloha_funds`** · `search_text: "pe"`, **`is_owned_by_ks: true`** → **`success: true`**, **30** records, **all** **`source: solovis`**.

**Verdict:** **PASS (behavioral, single user U)** — no **cross-tenant** claim **proven** or **disproven** without another tenant’s credentials.

---

## 6. AUTH-03 — Out-of-scope role (403)

**Status:** **Not executed.** Would require e.g. a **low-privilege** AAD user, a **known forbidden** tool parameter, or **documented** entitlement matrix. **No 403** was triggered in this session.

---

## 7. Error hygiene (sample)

- **401** responses: **empty** body on probes (**section 7.5**-friendly at HTTP layer for this check).
- **`read_data`** failure messages: short **English** error strings; **no** internal file paths or stack dumps observed in MCP **`message`** fields for sampled failures.

---

## 8. Test matrix (section 7.1 — this run)

| ID | Result |
| --- | :---: |
| AUTH-01 | **P** |
| AUTH-02 | **P*** (proxy) |
| AUTH-03 | **N/E** |
| AUTH-04 | **P**† (behavioral) |
| AUTH-05 | **P** |

\* **P** proxy · † single-tenant · **N/E** not executed

---

## 9. Follow-ups

| Item | Owner |
| --- | --- |
| **AUTH-03** matrix with **403** expectations | QA + IdP / MCP config owner |
| **AUTH-04** two-tenant negative test | Second test account |
| **AUTH-02** expired **real** token replay (controlled, **redacted** logs) | Security QA |
| **Policy** on **`read_data`** + **`sys`** catalog | Align with **section 1.4** high-risk tool posture |

---

## 10. Conclusion

**KS-984** section 7.1 was **partially executed** from **Cursor**: **AUTH-01** and **AUTH-05** show **strong** behavior (**401** without session, **SQL** guardrails, **`fund_source`** validation). **AUTH-02** is **partially** covered via **synthetic** bearer rejection. **AUTH-03** and **full** **AUTH-04** **negative** proof remain **open** pending **additional** identities and test design.

---

*Report: Cursor Agent · Guide v1.3*
