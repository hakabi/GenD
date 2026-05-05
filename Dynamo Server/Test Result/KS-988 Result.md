# KS-988 — Consolidated QA Result (TLS, CORS, OAuth, Rate Limit, Errors)

| Field | Value |
|--------|--------|
| **Ticket** | [KS-988](https://gendvn.atlassian.net/browse/KS-988) — Dynamo MCP Security QA: TLS, CORS, OAuth lifecycle, rate limiting, error hygiene |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing |
| **Overall status** | **PARTIAL PASS** — transport and error hygiene largely strong; **CORS**, **rate limiting**, and **full TLS cipher proof** carry open items / observations |
| **Execution date** | 2026-04-28 |
| **Methodology** | Per **Dynamo MCP Server — QA Testing Guide** v1.3 (**section 7.5 Transport Security (TLS)**): black-box validation through MCP and, where noted, raw HTTP (**section 1.1**). |
| **Sources merged** | **Claude** — *KS-988 - Claude_Report.md* (Cowork sandbox; OAuth expiry lifecycle; **50×** MCP **`get_funds`** burst; **`describe_table`** / **`read_data`** error probes). **Cursor** — *KS-988 - Cursor Report.md* (**Windows `curl`**, **OPTIONS**/CORS, **55×** HTTPS GET burst, **10×** MCP burst). |

---

## 1. Alignment with the testing guide

Guide reference: `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` — **section 7.5** (TLS enforcement, CORS, OAuth, rate limiting, error hygiene).

| Guide theme | Consolidated application |
|-------------|--------------------------|
| **HTTPS / TLS** | Cursor **`curl`** confirms redirect off HTTP and TLS without cert errors; Claude confirms MCP sessions run over **`https://mcp.conceptia.com/dynamo/sse`** without downgrade indicators. Full cipher/TLS-version enumeration best confirmed externally (**section 7.5** bullets). |
| **CORS** | Cursor-only direct **`OPTIONS`** evidence (**OBS-1**). Claude could not reach origin from sandbox (**B-2** there). |
| **OAuth** | Claude observed **expired token → re-auth → success** (**PASS**). Cursor did not run lifecycle drills independently (**gap** superseded by Claude where applicable). |
| **Rate limiting** | Both sessions: **no 429** at tested volumes → merged **TLS-F01 / observation**. |
| **Error hygiene** | Claude **`describe_table`** empty schema + **`read_data`** invalid object; Cursor **`read_data`** DROP + **`llm_text_analysis`** key errors — **PASS** sampling. |

---

## 2. Executive summary

**Cursor** executed **protocol-level** checks from a normal desktop environment: **`http://`** → **307** → **`https://`**; **`https://`** HEAD/**GET** → **401** + JSON + **`WWW-Authenticate: Bearer`**; **TLS** via **Schannel** without verification errors in the trace; **CORS** **`OPTIONS`** returned **204** with **`Access-Control-Allow-Origin: *`** (**OBS-1** — does not match strict “reject unauthorized origins” wording). **55** rapid unauthenticated **`curl`** GETs: **55× 401**, **no 429**. **10** rapid MCP **`get_funds`**: all **`success: true`**.

**Claude** ran from a **Cowork sandbox** that **blocks** direct **`curl`/openssl** to **`mcp.conceptia.com`**, so **TLS-01–03** were **PARTIAL** in that report pending external commands. **Independently**, Claude validated **OAuth token expiry handling** (**connector disconnected → re-auth → restored**) (**PASS**). Claude fired **50** consecutive MCP **`get_funds`** calls — **no throttling**, documented as **TLS-F01** (informational). Claude exercised **`describe_table`** (missing table → empty columns) and **`read_data`** (invalid object name → structured **`QUERY_EXECUTION_FAILED`**) — **PASS** for hygiene vs stacks/paths.

**Together:** HTTPS usage, redirect behavior, OAuth renewal behavior, and sampled MCP errors support a **solid baseline**. Remaining gaps are **CORS policy vs ticket strictness** (**OBS-1**), **lack of observed rate limits** (**TLS-F01**), **Cipher/TLS-version proof** (run **`openssl`/`nmap`** from non-sandbox), and **optional explicit revocation testing** if required by audit.

---

## 3. Scenario matrix (merged mapping)

Aligned with Claude’s **TLS-01–TLS-06** labels and Cursor sections.

| ID | Topic | Claude | Cursor | Consolidated |
|----|-------|--------|--------|--------------|
| **TLS-01** | HTTP cleartext / downgrade | Sandbox blocked HTTP probe (**PARTIAL**) | **307** redirect to HTTPS — **PASS** (probe) | ✅ **PASS** (Cursor evidence); Claude adds MCP-only HTTPS inference |
| **TLS-02** | TLS ≥ 1.2, weak ciphers | Sandbox blocked **`openssl`** (**PARTIAL**) | TLS established, **no** verify errors in **`curl -vk`** snippet | ⚠️ **PARTIAL** — recommend **`openssl s_client` / `nmap ssl-enum-ciphers`** externally |
| **TLS-03** | CORS | Sandbox blocked (**PARTIAL**) | **OPTIONS** → **204**, **`Allow-Origin: *`** (**OBS-1**) | ⚠️ **OBS-1** — permissive wildcard vs ticket strict wording |
| **TLS-04** | OAuth expiry / re-auth | ✅ **PASS** (expired connector token → re-auth works) | OAuth drill **not run** separately (**superseded** by Claude) | ✅ **PASS** for observed lifecycle · revocation drill optional |
| **TLS-05** | Rate limiting (**50+** calls) | **50×** MCP **`get_funds`** — **no 429** (**TLS-F01**) | **55×** **`curl`** GET + **10×** MCP — **no 429** | ⚠️ **OBS / TLS-F01** — no throttle observed |
| **TLS-06** | Error hygiene | **`describe_table`** / **`read_data`** samples ✅ | **`read_data`** / **`llm_text_analysis`** samples ✅ | ✅ **PASS** (sampled paths) |

---

## 4. Findings & observations

| ID | Source | Summary |
|----|--------|---------|
| **OBS-1** | Cursor | **`Access-Control-Allow-Origin: *`** on **`OPTIONS`** — review vs KS-988 expectation for browser-originated abuse cases. |
| **TLS-F01** | Claude (merged Cursor) | **No** rate limiting (**429**) observed across **50** MCP **`get_funds`** (Claude) plus **55** HTTP + **10** MCP (Cursor). Amplifies bulk-read concerns tied to **KS-987** **`read_data`** exposure — informational / operational hardening. |
| **B-2** (Claude only) | Claude report | Sandbox **allowlist** blocked direct **`mcp.conceptia.com`** probes — overcome by Cursor runs for TLS/CORS layers. |

Cross-suite references (**KS-987** FINDING-03 / FINDING-04) noted in Claude TLS-F01 narrative — not duplicated here beyond pointing to remediation urgency.

---

## 5. Definition of Done (ticket) — consolidated

| Criterion | Status |
|-----------|--------|
| TLS **1.2+** / cipher posture proved end-to-end | **Partial** — Cursor confirms TLS works; **cipher enumeration** recommended |
| HTTPS-only / no abusive HTTP API | **Met** (**307** redirect path — Cursor) |
| CORS aligns with “unauthorized origins rejected” | **Not met as written** (**OBS-1**) |
| OAuth expiry / re-auth | **Met** (Claude connector observation) · revocation **optional** |
| **50+** rapid calls — graceful | **Met** (no crash); **429** **not** seen (**TLS-F01**) |
| Errors lack stacks/paths/secrets | **Met** (samples) |

---

## 6. Recommended next steps

1. Run **`openssl s_client`** / **`nmap --script ssl-enum-ciphers`** from approved infrastructure against **`mcp.conceptia.com:443`** (closes TLS-02 proof gap).
2. Decide on **CORS** policy vs **`Allow-Origin: *`** (**OBS-1**) — architecture sign-off or ticket text update.
3. Evaluate **rate limiting** (**TLS-F01**) — per-session limits + **429**/**Retry-After** if risk accepted.
4. Optional: formal **token revocation** test script for auditors (Cursor section 5).
5. Keep **KS-988** bundle with **KS-987** remediation tracking where TLS-F01 interacts with **`read_data`** scope.

---

## 7. Reference documents

| Document | Role |
|----------|------|
| `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` | **section 7.5** TLS, CORS, OAuth, rate limits, errors |
| `Dynamo Server/Test Result/KS-988 - Claude_Report.md` | OAuth PASS, **50×** MCP burst, TLS-F01, sandbox limits, MCP error probes |
| `Dynamo Server/Test Result/KS-988 - Cursor Report.md` | **`curl`** TLS/CORS/rate evidence, **OBS-1**, dual-provider LLM error samples |

---

*Consolidated report generated — merges Claude + Cursor KS-988 against testing guide v1.3.*
