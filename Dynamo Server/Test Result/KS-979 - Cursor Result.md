# KS-979 — Test Result: List fund documents via `get_documents` (section 5.3)

| Field | Value |
| --- | --- |
| **Jira** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **section 5.3** |
| **MCP** | `conceptia-dynamo` |
| **Tester / agent** | Cursor Agent (live tool invocation) |
| **Report date** | 2026-04-25 |

---

## 1. Executive summary

**Requirement:** Black-box validation of **`get_documents`**: filenames, categories, and dates; **two consecutive calls** for the same fund return the **same document identifiers** for the same page; **MCP-only** (no external document portal).

| Area | Result | Notes |
| --- | :---: | --- |
| **Scenario 1 — Happy path** | **PASS** | Fund **59 North Partners, LP** — `limit: 10` ×2: **identical** `ID` sequence; `totalRecords: 148` |
| **Scenario 2 — Error path** | **PASS** (invalid) | Non-existent fund name → **empty** list, `success: true` — **no** cross-fund rows |
| **Scenario 2 — “Unauthorized user”** | **OPEN** (documented) | **Not run:** second Entra identity without access to a real fund. Recorded as **OPEN**; **no further test action** unless program policy explicitly requires a restricted user. |
| **Scenario 3 — Zero documents** | **PASS** | **2026 Fund** — `data: []`, `recordCount: 0` |
| **Tool vs story wording** | **Noted** | Story uses `<FUND_ID>`; tool uses **`filterValue`** = **fund name** (see section 5) |

---

## 2. Ticket traceability

| Theme | Evidence |
| --- | --- |
| Prompt intent section 5.3 | *“List all documents associated with fund `<FUND_ID>`.”* → `get_documents` with `filterType: fund`, `filterValue: "<fund name>"` |
| Metadata | `Title`, `FileName`, `Documentcategories`, `Documentdate` / `DateCreated` / `LastModified` on rows |
| Repeatability | **Call A** vs **Call B** — same 10 `ID`s in order (section 4) |
| Invalid input | Unknown name → empty `data` (acceptable per AC) |
| Portal / SQL | **Not** used (per ticket) |

---

## 3. Test environment

| Item | Value |
| --- | --- |
| Client | Cursor Agent — MCP `user-conceptia-dynamo` |
| Auth | Microsoft OAuth (tester session) |
| Payload size | **`excludeContent: true`** on all calls (metadata-only; 2 MB cap note in tool description) |

---

## 4. Test execution — Scenario 1 (happy path)

**Fund:** `59 North Partners, LP` (**148** documents for this user).

**Parameters (Call A and Call B, identical):**

`filterType: "fund"`, `filterValue: "59 North Partners, LP"`, `limit: 10`, `offset: 0`, `excludeContent: true`

| Metric | Call A | Call B |
| --- | --- | --- |
| `success` | `true` | `true` |
| `recordCount` | 10 | 10 |
| `totalRecords` | 148 | 148 |
| `hasMore` | `true` | `true` |

**Document `ID` sequence (first 10) — both calls:**

1. `F3B57C4F-151F-4616-AF7A-47193C5E6D50`  
2. `B0472C00-F21D-4C4E-9744-F82E00471C72`  
3. `1BACA3EF-6718-49FD-9257-4FA1B4AA57A3`  
4. `F09A42B2-3639-421A-8D1B-8A44374EEDF4`  
5. `9856EE85-92F1-457D-BF3C-EDAFCFE352D3`  
6. `05C2B084-BD9A-4009-B618-C2DA1E74FB01`  
7. `3476D9DA-89A8-43EA-955C-496707807ACB`  
8. `D2873AB6-93FE-4082-BC54-1846140E6029`  
9. `8577E177-01E9-4603-A3E1-24E886083BC4`  
10. `03357C8C-3745-4062-B6FD-A18C20D0B21F`  

**Sample first row:** `Title` = `59 North Annual Notice (2026).pdf`, `Documentcategories` = `1-ODD Material; Other;`, `Documentdate` = `2026-04-14T12:38:27.117Z`

**Verdict:** **PASS** — stable identifiers and counts; sort order unchanged between immediate sequential calls.

---

## 5. Test execution — Scenario 2 (invalid fund name)

**Input:** `filterType: "fund"`, `filterValue: "KS979_INVALID_FUND_ID_XYZ_000"`, `limit: 10`, `offset: 0`, `excludeContent: true`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `data` | `[]` |
| `recordCount` / `totalRecords` | 0 / 0 |

**Verdict:** **PASS** — no documents from other funds or tenants in the result set.

**OPEN (by design for this run):** Second-user / true **authorization** negative (user with no rights to an existing fund) **not** executed. **Documented as OPEN** — sufficient for Cursor sign-off unless policy requires a restricted Entra fixture.

---

## 6. Test execution — Scenario 3 (zero documents)

**Input:** `filterType: "fund"`, `filterValue: "2026 Fund"`, `limit: 10`, `offset: 0`, `excludeContent: true`  
(Consistent with **KS-991** smoke: valid fund, zero document rows.)

| Field | Value |
| --- | --- |
| `success` | `true` |
| `data` | `[]` |
| `totalRecords` | 0 |

**Verdict:** **PASS** — empty list; no placeholder rows.

---

## 7. BDD acceptance criteria (Cursor)

| Scenario | Status | Notes |
| --- | :---: | --- |
| **1 — Happy path** | **PASS** | Repeat calls; stable `ID`s |
| **2 — Error path** | **PASS** | Invalid name → empty |
| **2 — Unauthorized (separate identity)** | **OPEN** | Documented; not blocking Cursor sign-off per test plan |
| **3 — Zero documents** | **PASS** | 2026 Fund |

---

## 8. Findings

| ID | Severity | Description |
| --- | --- | --- |
| **KS-979-F-01** | Low / doc–payload | Story says **`<FUND_ID>`**; `get_documents` expects **fund name** in `filterValue`. Response document key is **`ID`** (GUID). |
| **KS-979-F-02** | **OPEN** (documented) | No second Entra user for auth-negative; **accepted** as OPEN without additional runs. |

---

## 9. Definition of Done (Cursor)

| Criterion | Status |
| --- | :---: |
| section 5.3 happy path + repeatability | ✅ |
| Metadata fields visible | ✅ |
| Invalid fund → no leakage | ✅ |
| Zero-document fund | ✅ |
| Second-user auth-negative | **OPEN** (documented — enough for sign-off here) |
| Evidence in this file | ✅ |

---

## 10. Paste-ready Jira comment (Cursor only)

*KS-979 **Cursor** (section 5.3): **`get_documents`** — **59 North Partners, LP** ×2: same 10 **`ID`**s, **`totalRecords` 148**; invalid fund name → **0** rows; **2026 Fund** → **0** rows. **KS-979-F-01:** param is **fund name**, not numeric fund id. **F-06 (merged):** no second user for true “unauthorized” — **OPEN**, **documented**; no further action unless policy requires. **Merged report:** `Dynamo Server/Test Result/KS-979 Result.md` (+ Claude sub-report).*

---

## 11. References

| Document | Path |
| --- | --- |
| Testing guide section 5.3 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Story | `Jira Ticket/dynamo_mcp_testing_stories.md` (US-E3-03) |
| Merged result (Claude + Cursor) | `Dynamo Server/Test Result/KS-979 Result.md` |
