# KS-978 — Cursor QA Result (Second Time Test)

## Dynamo MCP QA — Fund data fetch: `get_funds` ↔ `get_fund_description` (Section 5.2, guide v1.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Story** | US — Validate fund description alignment with list baseline for a known fund (v1.4: **no** ratings tools in registry) |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Guide ref** | Section **5.2** — Fund data fetch · **Updated requirements — guide v1.4** (May 2026) in ticket body |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` (Conceptia Dynamo MCP) — **connected** for this run |
| **Tools under test** | `get_funds`, `get_fund_description` |
| **Out of scope (v1.4 ticket)** | `get_rating_summary`, `get_rating_details` — **S (skipped)** — *not in v1.4 registry* per ticket §C |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)** |

---

## Summary

Execution follows the ticket’s **v1.4 update block** only: **guide section 5.2** using **`get_funds`** and **`get_fund_description`**. **`get_rating_*`** tools are **not** invoked; matrix marks **S** with rationale from [**KS-978**](https://gendvn.atlassian.net/browse/KS-978) ticket text.

**Scenario 1 (happy path):** Baseline page from `get_funds` (`limit: 5`, `offset: 0`) includes **59 North Partners, LP**. Two consecutive `get_fund_description` calls filtered by `fundName: "59 North Partners, LP"` return **byte-identical** single-row payloads. Overlapping business keys **`Name`** and **`FundManagerName`** match the same fund’s `get_funds` row (no contradiction). **`ID` (GUID)** appears **only** in `get_fund_description` — list projection still omits fund **`ID`** on `get_funds` (same pattern as **KS-977**).

**Scenario 2 (error path):** Synthetic non-existent name **`ZZZ_NONEXISTENT_FUND_KS978_QA`** → **`success: true`**, **`data: []`**, **`recordCount: 0`** — **empty authorized result**; no foreign rows, no invented fund object.

**Scenario 3 (null `Description`):** **`2026 Fund`** → `get_fund_description` returns **`"Description": null`** explicitly in JSON — no placeholder narrative.

**Security:** No JWT, refresh token, client secret, or password strings observed in tool JSON.

---

## Test execution

### Prompt and parameters (v1.4)

**Natural-language intent (equivalent to ticket):** Fetch full fund details for a fund from the black-box baseline, including description, aligned with the list tool — **without** ratings APIs (v1.4).

| Step | Tool | Parameters (material) |
|---|---|---|
| Baseline | `get_funds` | `limit: 5`, `offset: 0` |
| Happy path A / B | `get_fund_description` | `fundName: "59 North Partners, LP"`, `limit: 5`, `offset: 0` (×2) |
| Edge null description | `get_fund_description` | `fundName: "2026 Fund"`, `limit: 5`, `offset: 0` |
| Invalid / inaccessible | `get_fund_description` | `fundName: "ZZZ_NONEXISTENT_FUND_KS978_QA"`, `limit: 5`, `offset: 0` |

---

### Scenario 1 — Happy path: **PASS**

#### `get_funds` — row used for pairing (59 North Partners, LP)

| Field | Value |
|---|---|
| **Name** | 59 North Partners, LP |
| **FundManagerName** | 59 North Capital Management |
| **PipelineStatus** | P - Portfolio |
| **AssetClassName** | Absolute Return |
| **SubAssetClassName** | Equity Hedge |
| **ResponsibleName** | Kapua Aiu-Yasuhara |
| **DateCreated** | `2022-07-11T22:30:44.027Z` |
| **LastModified** | `2026-03-25T17:36:48.253Z` |
| **Fund `ID` on list row** | **Absent** (narrow list projection) |

#### `get_fund_description` — two identical calls

| Call | `recordCount` | `ID` (GUID) | `Name` | `FundManagerName` | `Description` (abridged) |
|---|---:|---|---|---|---|
| 1 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | Global equity l/s manager with value orientation… |
| 2 | 1 | `D7879DB7-E230-4191-8849-DE4B7B64626C` | 59 North Partners, LP | 59 North Capital Management | *(same text as call 1)* |

**Pairing verdict:** **`Name`** and **`FundManagerName`** align exactly between `get_funds` and `get_fund_description`. Narrow describe projection does not repeat pipeline / asset-class columns — **no conflict** with list fields that are absent from describe output. **Two-call consistency** on describe: **PASS**.

#### v1.4 checklist (5.2)

| Requirement | Result |
|---|---|
| Black-box baseline from `get_funds` (no UI-exported IDs) | **PASS** |
| Pair same fund by **`Name`** (and document **`ID`** only on describe) | **PASS** |
| Non-contradiction on overlapping attributes | **PASS** |
| Datetime fields: **`Z`** suffix on `get_funds` timestamps | **PASS** — UTC-style in JSON; describe row has **no** datetime fields in this payload |
| No credential leakage | **PASS** |

---

### Scenario 2 — Error path (non-existent / inaccessible identifier): **PASS**

| Field | Value |
|---|---|
| **Request** | `fundName: "ZZZ_NONEXISTENT_FUND_KS978_QA"` |
| **`success`** | `true` |
| **`data`** | `[]` |
| **`recordCount`** | `0` |
| **Other-tenant / stray rows** | **None** |

**Verdict:** **PASS** — meets ticket **“controlled error or empty authorized result”** via **empty authorized** envelope (integrators must still check `recordCount` / `data.length` — see **F-01**).

---

### Scenario 3 — Edge case (`Description` null): **PASS**

| Field | Value |
|---|---|
| **Request** | `fundName: "2026 Fund"` |
| **`Description`** | **`null`** (explicit JSON null) |
| **Invented rating or narrative filler** | **None** |

**Verdict:** **PASS** — absence explicit per v1.4 BDD.

---

### Ratings tools (legacy ticket body vs v1.4)

Per ticket **§C — Ratings (explicit exclusion):** **`get_rating_summary`** / **`get_rating_details`** were **not** executed. Evidence: **S** in matrix below with rationale **not in v1.4 MCP registry** for this customer confirmation.

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| Refresh token or client secret in output | **None** observed |
| Password or API key string in output | **None** observed |

**Security verdict:** **PASS** for observed responses.

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | **`get_funds`** list row has **no** fund **`ID`**; **`get_fund_description`** exposes **`ID` (GUID)**. Pairing for 5.2 uses **`Name`** (and documents GUID from describe only). Same family as **KS-977-F-01**. | **Open / documented** |
| F-02 | Info | Unknown fund name → **`success: true`** + **`data: []`** (not `success: false` / HTTP error). Callers must guard on **`recordCount`**. | **Known API shape** — still satisfies v1.4 “empty authorized result” |
| N-01 | Info | Ratings tools **skipped** by ticket v1.4; legacy story wording retained in Jira but **superseded** for execution. | **Informational** |

---

## Test matrix — Section 5.2 Fund fetch (this run)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | Ratings (`get_rating_*`) |
|---|---|---|---|---|---|---|
| **5.2 Fund fetch** | **P** | **P** | **n/a** | **n/a** | **n/a** | **S** |

- **Happy path:** **P** — `get_funds` + paired `get_fund_description` (59 North); two describe calls identical.  
- **Invalid input:** **P** — synthetic unknown `fundName` → empty `data`, no leakage.  
- **Unauthorized / Network drop:** **n/a** — not re-run here; preconditions per Epic / **KS-977** evidence if needed for OAuth transport.  
- **Large dataset:** **n/a** — not in scope for this focused 5.2 pairing run.  
- **Ratings:** **S** — ticket v1.4: *“Do not execute `get_rating_summary` / `get_rating_details` in v1.4.”*

*Coordinate consolidated totals with [**KS-993**](https://gendvn.atlassian.net/browse/KS-993) per ticket matrix note.*

---

## Evidence

- **MCP:** `get_funds`, `get_fund_description` on **`user-conceptia-dynamo`**.  
- **Fund names** used: **59 North Partners, LP**, **2026 Fund**, synthetic **ZZZ_NONEXISTENT_FUND_KS978_QA**.  
- **Redaction:** Business names and public-style description excerpt only; full multi-paragraph description text not reproduced in full in this artifact (first clause quoted in table).

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.2 v1.4 scope (`get_funds` + `get_fund_description`) | **PASS** |
| Cross-tool non-contradiction (documented overlap) | **PASS** |
| Scenario 2 empty / controlled outcome | **PASS** |
| Scenario 3 explicit `null` `Description` | **PASS** |
| Ratings tools per v1.4 | **S (skipped)** — documented |
| No credential leakage | **PASS** |

**Final:** **PASS (Scenario 1)** / **PASS (Scenario 2)** / **PASS (Scenario 3)**  

---

*Generated: 2026-05-13 · Agent: Cursor (Composer) · Source: [KS-978](https://gendvn.atlassian.net/browse/KS-978) Jira description — **Updated requirements — guide v1.4** · Report path: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-978 - Cursor Result.md`*
