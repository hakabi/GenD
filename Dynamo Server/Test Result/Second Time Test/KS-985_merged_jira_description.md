### [KS-985] US-E4-02 — Execute INJ suite: SQL, command, path, SSRF, JSON, types

**Ticket Title:** `Dynamo MCP Security QA - Execute INJ suite for SQL, command, path, SSRF, JSON, types`  
**Jira:** [KS-985](https://gendvn.atlassian.net/browse/KS-985) | **Epic:** [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — Security & Abuse-Case Testing

**User Story:**
> As an **Internal QA Tester**, I want **adversarial inputs on all tools in the 8-tool inventory** so that **injection and malformed input do not crash the server or leak internals**.

**Overview:**
Section 7.2 covers INJ-01 through INJ-06 across the tool surface: SQL/command/path/SSRF, oversized JSON, and wrong types — expect sanitization, validation errors, or safe rejection without 500s exposing internals.

**Detailed Requirements:**

| ID | Test | Tool(s) | Expected |
|----|------|---------|----------|
| INJ-01 | SQL injection via fund ID parameter | `get_funds`, `read_data` | Query sanitized, no raw SQL error |
| INJ-02 | Command injection via text parameters | `llm_text_analysis`, `analyze_notes` | Input sanitized, no shell execution |
| INJ-03 | Path traversal via document retrieval | `get_documents` | Access restricted to authorized paths |
| INJ-04 | SSRF via URL-like parameters | Any URL-accepting parameter | Internal network not reachable |
| INJ-05 | Oversized / deeply nested JSON input | Any tool | Graceful rejection, no crash |
| INJ-06 | Wrong data types in parameters | All tools in Section 1.3 (guide v1.4) | Schema validation rejects cleanly |

- Maintain a **payload library** (redacted) attached to QA workspace, not public repos.

**Acceptance Criteria (BDD):**

*Scenario 1 — Happy path (baseline)*
- **Given** minimal valid parameters for each tool
- **When** a normal request is sent
- **Then** the tool succeeds or returns a business-level empty result without injection payloads in the response

*Scenario 2 — Error path (INJ-01–04)*
- **Given** representative SQL, shell, path traversal, and SSRF payloads directed at the appropriate parameters
- **When** each relevant tool is invoked
- **Then** inputs are **sanitized or rejected**, there is **no command execution**, **no arbitrary file read**, and **no internal network fetch**

*Scenario 3 — Edge case (INJ-05, INJ-06)*
- **Given** oversized or deeply nested JSON and deliberately wrong types
- **When** tools are called
- **Then** the server returns **schema validation errors** or safe rejection **without process crash**

**Definition of Done:** *(verbatim block above)*

---

## Updated requirements — guide v1.4

*May 2026 customer confirmation · Maps to `dynamo-mcp-testing-guide_v1.4.md` §7.2, §1.3, §8–9 · Epic [KS-1000](https://gendvn.atlassian.net/browse/KS-1000)*

### User Story (v1.4)

> As an **Internal QA Tester**, I want **structured adversarial inputs** exercised against **each parameter surface** of the **customer-confirmed Dynamo MCP tools** so that **SQL, command, path, SSRF, oversized JSON, and type confusion** are either **sanitized, rejected, or safely empty** — **without** process crash, **without** raw database or filesystem errors in the MCP JSON, and **without** “success” envelopes that hide injection outcomes.

### Overview (v1.4)

**§7.2 (INJ)** applies to the **seven live tools** today; **`read_data`** participates in **INJ-01 / INJ-05 / INJ-06** only after vendor registration (guide **§1.4** HIGH-risk). Legacy “13 tool” language is **retired** for execution scope — out-of-scope tools must **not** be used to claim INJ coverage.

Injection testing is **read-only** from the tester’s perspective but may stress upstream query builders; coordinate with Conceptia if production-like tenants are used. Payload sets must stay **redacted** off public Git (guide **§8**).

### Detailed requirements (v1.4)

#### A. Preconditions

- Tool schemas frozen or versioned per [**KS-991**](https://gendvn.atlassian.net/browse/KS-991); note server build/date if headers exist.
- Per-tool **parameter inventory** (required vs optional, string vs number vs array) before fuzzing — wrong-type cases (**INJ-06**) must target **real** fields.

#### B. INJ case depth (§7.2)

| ID | v1.4 depth expectation |
|---|---|
| **INJ-01** | SQL / NoSQL-style metacharacters in **`get_funds`** / **`get_fund_description`** string filters; add **`read_data`** only when live. Expect **empty/safe result** or validation — **never** stack trace or `SELECT` echo. |
| **INJ-02** | Shell / PowerShell-style tokens in **`llm_text_analysis`** (`texts`, `instructions`) and **`analyze_notes`**-adjacent free text if exposed. Expect model/host to treat as **literal text** — no OS execution evidence. |
| **INJ-03** | Path / traversal strings in **`get_documents`** `filterValue` and similar. Expect **authorized** document set only. |
| **INJ-04** | URL-like strings in any parameter that accepts URLs per schema; confirm **no** internal network SSRF indicators (latency-only inconclusive — document). |
| **INJ-05** | Payloads approaching **2MB** / deep nesting on each tool; expect **bounded** error, not OOM crash. |
| **INJ-06** | Systematic wrong types (number for string, object for scalar, arrays where forbidden); expect **schema validation** errors — document if server **coerces** instead (track as hygiene finding). |

#### C. Payload library and safety

- Maintain versioned **payload list** (SQLi, XSS-like, Unicode escapes, homoglyphs) in QA workspace; rotate after vendor patches.
- Stop on first **500** with internal path — file defect, do not continue blind fuzz until triaged (guide **§9**).

### UI/UX & front-end considerations (v1.4)

- Agents may **paraphrase** errors — always persist **raw MCP JSON** for INJ verdicts.
- Large `analyze_notes` / `llm_text_analysis` responses: attach **externally** per §8; link path in Jira.

### Acceptance criteria (BDD, v1.4)

*Scenario 1 — Baseline sanity*  
**Given** minimal valid calls per live tool  
**When** executed  
**Then** responses are normal success or **business-empty** — not injection echoes.

*Scenario 2 — Attack payloads INJ-01–04*  
**Given** representative malicious strings mapped to the table above  
**When** each targeted tool runs  
**Then** **no command execution**, **no arbitrary file read proof**, **no SSRF confirmation** — only safe rejection or scoped data.

*Scenario 3 — Stress & types INJ-05–06*  
**Given** oversized / mistyped bodies  
**When** submitted  
**Then** **graceful** failure without worker crash; type errors are explicit where possible.

### Definition of Done (v1.4)

- INJ matrix: each **live** tool has **≥1** documented negative case per applicable INJ row; `read_data` rows **S** or **P** post-registration.  
- **No open critical** uncaught 500 / stack leak without defect.
