# KS-978 — Cursor QA Result (Third Time Test)

## Dynamo MCP QA — Validate fund description for a known fund (Section 5.2 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Story** | US-E3-02 — Validate fund description and ratings for a known FUND_ID |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Scope executed** | Jira description **Updated requirements — guide v1.5 (10-tool MCP inventory)** only |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **5.2**; stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tools under test** | `get_fund_description` (primary); `get_funds` (cross-tool consistency) |
| **Tools descoped** | `get_rating_summary`, `get_rating_details` — **permanently removed** (2026-05-07 production hardening) |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)** |

---

## Summary

Section **5.2** passes all three scenarios under **guide v1.5** with the Conceptia Dynamo MCP connector **Connected**. Two consecutive `get_fund_description` calls for **59 North Partners, LP** returned **byte-identical** single-row payloads with **`Description` present**, stable GUID **`D7879DB7-E230-4191-8849-DE4B7B64626C`**, and **`Name` / `FundManagerName`** aligned with a `get_funds` filter on **`fundName: "59 North"`**.

**Scenario 2** returns the documented soft-empty shape for synthetic **`ZZZ_NONEXISTENT_FUND_KS978_QA`**: **`success: true`**, **`data: []`**, **`recordCount: 0`** — no foreign rows, no invented fund object.

**Scenario 3** confirms **`2026 Fund`** returns **`Description: null`** explicitly in JSON with stable GUID **`3F554983-6C4B-470F-B7A0-AC823EA4AFD1`**.

**v1.5 inventory:** Rating tools remain **absent** from the Cursor MCP registry (removed 2026-05-07). No credential material observed in any tool output.

---

## v1.5 requirements executed (KS-978 updated section)

| v1.5 requirement | Status |
|---|---|
| **A.** Preconditions — MCP connected; `get_fund_description` registered | **PASS** |
| **B.** Two-call `get_fund_description` consistency for known fund | **PASS** |
| **B.** Cross-tool alignment — `get_funds` ↔ `get_fund_description` on `Name`, `FundManagerName` | **PASS** |
| **B.** Fund GUID stable via `get_fund_description` | **PASS** — `D7879DB7-E230-4191-8849-DE4B7B64626C` |
| **B.** `Description` non-null for described fund; explicit `null` for undescribed fund | **PASS** |
| **C.** Invalid fund — controlled empty result | **PASS** |
| **D.** Rating tools — permanently removed, not invoked | **S** — absent from v1.5 inventory |
| **Security** — no credential material in output | **PASS** |

---

## Test execution

### Preconditions

**Connector state:** Connected / Ready (`user-conceptia-dynamo`).

**Prompt (natural language):** *Fetch the full details of fund 59 North Partners, LP, including its description, and confirm consistency with the fund list.*

| Step | Tool | Parameters (material) |
|---|---|---|
| Cross-tool baseline | `get_funds` | `fundName: "59 North"`, `limit: 5`, `offset: 0` |
| Happy path A / B | `get_fund_description` | `fundName: "59 North Partners, LP"`, `limit: 5`, `offset: 0` (×2) |
| Edge null description | `get_fund_description` | `fundName: "2026 Fund"`, `limit: 5`, `offset: 0` |
| Invalid / inaccessible | `get_fund_description` | `fundName: "ZZZ_NONEXISTENT_FUND_KS978_QA"`, `limit: 5`, `offset: 0` |

---

### Scenario 1 — Happy path: **PASS**

#### `get_funds` — filtered baseline (`fundName: "59 North"`)

| Field | Value |
|---|---|
| **`success`** | `true` |
| **`Name`** (row 1) | 59 North Partners, LP |
| **`FundManagerName`** | 59 North Capital Management |
| **Cross-tool alignment** | **PASS** — no contradiction with describe output |

#### `get_fund_description` — two identical calls

| Call | `recordCount` | `ID` (GUID) | `Name` | `FundManagerName` | `Description` |
|---:|---:|---|---|---|---|
| 1 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | **Present** (non-null narrative text) |
| 2 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | *(identical to call 1)* |

**Two-call consistency:** **PASS** — byte-identical payloads on all compared fields.

#### v1.5 field checklist (§B)

| Requirement | Result |
|---|---|
| Fund name consistent across both tools | **PASS** |
| `FundManagerName` consistent across both tools | **PASS** |
| `Description` non-null for 59 North | **PASS** |
| Fund GUID stable across calls | **PASS** |
| No JWT / refresh token / password in JSON | **PASS** |
| Fund GUID on `get_funds` list row | **Absent** — F-01 persists; GUID from describe only |

---

### Scenario 2 — Error path (non-existent fund): **PASS**

| Field | Value |
|---|---|
| **Request** | `fundName: "ZZZ_NONEXISTENT_FUND_KS978_QA"` |
| **`success`** | `true` |
| **`data`** | `[]` |
| **`recordCount`** | `0` |
| **Other-tenant / stray rows** | **None** |

**Verdict:** **PASS** — controlled empty authorized result; integrators must check `recordCount` (F-02 persists).

---

### Scenario 3 — Edge case (`Description` null): **PASS**

| Field | Value |
|---|---|
| **Request** | `fundName: "2026 Fund"` |
| **`ID` (GUID)** | `3F554983-6C4B-470F-B7A0-AC823EA4AFD1` |
| **`Description`** | **`null`** (explicit JSON null) |
| **Invented rating or narrative filler** | **None** |

**Verdict:** **PASS** — null field reported explicitly per v1.5 BDD.

---

### Ratings tools (v1.5 descoped)

Per v1.5 inventory and ticket updated requirements: **`get_rating_summary`** and **`get_rating_details`** were **not** executed. Both tools are **absent** from the Cursor MCP registry (removed 2026-05-07).

| Tool | v1.5 inventory | Cursor registry |
|---|---|---|
| `get_rating_summary` | Removed 2026-05-07 | **Absent** |
| `get_rating_details` | Removed 2026-05-07 | **Absent** |

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| Refresh token or client secret in output | **None** observed |
| Password or API key string in output | **None** observed |
| Cross-fund data in invalid-fund probe | **None** |

**Security verdict:** **PASS**

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | `get_funds` list projection omits Fund **GUID** / `ID`; use **Name**-based pairing or `get_fund_description` for `ID`. | **Persists** |
| F-02 | Low | Not-found queries return `success: true` + `data: []` — callers must check `recordCount`, not `success` alone. | **Persists — known API shape** |
| F-04 | Info | Date fields only visible on `get_funds`; `get_fund_description` carries no datetime fields in this payload. | **Persists — by design** |
| Rating tools removed | Info | `get_rating_summary` and `get_rating_details` permanently removed 2026-05-07 | **Confirmed S — v1.5 inventory** |
| N-01 | Info | 59 North GUID stable vs. prior runs (`D7879DB7-…`); 2026 Fund GUID stable (`3F554983-…`). | **Informational** |

---

## Test matrix row — Section 5.2 Fund fetch (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.2 Fund fetch** | **P** | **P** | n/a | n/a | n/a | n/a |

*Per guide v1.5 section 6: Unauthorized user, Network drop, Large dataset, and VULN probe are **n/a** for row 5.2.*

---

## Comparison across test runs

| Dimension | First (2026-04-25) | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| Scenario 1 | PASS | PASS | **PASS** |
| Scenario 2 | PASS | PASS | **PASS** |
| Scenario 3 | PASS | PASS | **PASS** |
| 59 North GUID | D7879DB7-… | D7879DB7-… | **D7879DB7-… (stable)** |
| Rating tools | Tested | S (removed) | **S (removed — v1.5 confirmed)** |
| MCP connector | Connected | Connected | **Connected** |

---

## Evidence

| Item | Detail |
|---|---|
| **Primary tool** | `get_fund_description` × 2 — `fundName: "59 North Partners, LP"` |
| **Cross-tool** | `get_funds` — `fundName: "59 North"` |
| **Edge / error** | `get_fund_description` — `"2026 Fund"`, `"ZZZ_NONEXISTENT_FUND_KS978_QA"` |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **Black-box rule** | No Dynamo UI accessed |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-978 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.2 happy path executable | **PASS** |
| Two-call `get_fund_description` consistency | **PASS** |
| Cross-tool `get_funds` alignment | **PASS** |
| Scenario 2 empty / controlled outcome | **PASS** |
| Scenario 3 explicit `null` `Description` | **PASS** |
| Rating tools per v1.5 | **S (skipped)** — documented |
| No credential leakage | **PASS** |
| v1.5 updated requirements section | **PASS** |

**Final result: PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)**

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-978 Jira — **Updated requirements — guide v1.5 (10-tool MCP inventory)** · Guide: `dynamo-mcp-testing-guide_v1.5.md`*
