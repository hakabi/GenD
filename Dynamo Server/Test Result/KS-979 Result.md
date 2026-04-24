# KS-979 — Final Result: List fund documents via `get_documents` (§5.3)

| Field | Value |
| --- | --- |
| **Jira** | [KS-979](https://gendvn.atlassian.net/browse/KS-979) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.3** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-979 - Claude Result.md` (**Claude Cowork**) · `KS-979 - Cursor Result.md` (**Cursor Agent**) |
| **Consolidation date** | 2026-04-25 |

---

## 1. Executive summary

**Ticket:** Black-box **`get_documents`** validation: filenames, document categories, and dates; **two** consecutive calls for the same fund return the **same** document **identifiers** for the same page; **MCP only** (no external document portal).  

**Baseline fund:** **59 North Partners, LP** — **148** total documents (matches **KS-991** / **KS-992**; confirmed by both clients).

| Area | Claude Cowork | Cursor | Merged |
| --- | :---: | :---: | --- |
| **Scenario 1 — Happy path** (repeat calls, stable IDs) | **PASS** (`limit: 5` ×2, byte match first 5) | **PASS** (`limit: 10` ×2, same 10 `ID`s) | **PASS** — first **five** `ID`s **identical** across both runs; `totalRecords: 148` |
| **Scenario 2 — Invalid / unknown fund** | **PASS** (`ZZZNONEXISTENTFUND99999` → empty) | **PASS** (`KS979_INVALID_FUND_ID_XYZ_000` → empty) | **PASS** — `success: true`, `data: []`, **no** cross-fund / cross-tenant rows |
| **Scenario 2 — Second identity (unauthorized)** | *Not a separate test leg* | **OPEN** (documented) | **OPEN (documented)** — no second Entra user; **acceptable for sign-off** per test plan; optional future fixture |
| **Scenario 3 — Zero-document fund** | **PASS** (2026 Fund) | **PASS** (2026 Fund) | **PASS** |
| **Credential scan** (tool output) | **PASS** (no tokens) | *(same session class)* | **PASS** |

**Overall:** **PASS** for all executed §5.3 BDD rows. **F-06** remains **OPEN** (policy-only); all other open items in the findings register are **low / info** (API shape and integration guidance), not functional failures.

---

## 2. Client coverage

| Client | Role in this package |
| --- | --- |
| **Claude Cowork** | Full 5×5 happy-path table, byte-for-byte Call 1 vs 2, field observations (sort `DateCreated` DESC, categories string, `FullFileName` pattern), `success`+empty for invalid, sample JSON, security note |
| **Cursor** | 10×10 repeat check (broader first page), distinct invalid string, **second-user** gap explicitly **OPEN** |

---

## 3. Test environment (combined)

| Item | Claude | Cursor |
| --- | --- | --- |
| **Report / run date** | 2026-04-24 | 2026-04-25 |
| **Client** | Claude Cowork Desktop (Cowork mode) | Cursor Agent |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` | Same (MCP) |
| **Content field** | `excludeContent: true` (all calls) | `excludeContent: true` (all calls) |
| **Happy-path params** | `filterType: fund`, `filterValue: "59 North Partners, LP"`, `limit: 5`, `offset: 0` | Same + **`limit: 10`** for repeatability window |

---

## 4. Scenario 1 — Happy path (repeat-call stability)

### 4.1 Aligned facts

| Field | Claude (×2) | Cursor (×2) |
| --- | --- | --- |
| `success` | `true` / `true` | `true` / `true` |
| `recordCount` (page) | 5 / 5 | 10 / 10 |
| `totalRecords` | 148 / 148 | 148 / 148 |
| `hasMore` | `true` / `true` | `true` / `true` |

**First five document `ID`s** — same in **Claude** and **Cursor** (and in the same order as the first five rows in Cursor’s 10-row window):

1. `F3B57C4F-151F-4616-AF7A-47193C5E6D50`  
2. `B0472C00-F21D-4C4E-9744-F82E00471C72`  
3. `1BACA3EF-6718-49FD-9257-4FA1B4AA57A3`  
4. `F09A42B2-3639-421A-8D1B-8A44374EEDF4`  
5. `9856EE85-92F1-457D-BF3C-EDAFCFE352D3`  

*Claude: “byte-for-byte identical” across Call 1 and Call 2 for those five records (all listed fields), including `totalRecords=148` vs **KS-991** baseline.*

### 4.2 Sort order (Claude, black box)

**Inferred:** `DateCreated` **descending** (newest first) — stable between Claude’s two calls.

### 4.3 Merged verdict

**PASS** — Two independent MCP clients; same fund; **148** document universe; first-page identifiers **match** for the shared prefix; no drift between 2026-04-24 (Claude) and 2026-04-25 (Cursor) on counts or first-five IDs.

---

## 5. Scenario 2 — Error path (invalid fund name)

| Source | `filterValue` (invalid) | Outcome |
| --- | --- | --- |
| **Claude** | `ZZZNONEXISTENTFUND99999` | `success: true`, `data: []`, `recordCount: 0` |
| **Cursor** | `KS979_INVALID_FUND_ID_XYZ_000` | `success: true`, `data: []`, `recordCount: 0` |

**Merged verdict:** **PASS** — empty authorized set; no documents from other funds observed.

**Not executed:** A **separate** signed-in user **denied** access to a fund that still **exists** (true **authorization** negative). Tracked as **KS-979-F-06** (OPEN, documented) — see §8.

---

## 6. Scenario 3 — Edge case (zero documents)

| Source | `filterValue` | Outcome |
| --- | --- | --- |
| **Claude** | `2026 Fund` | `data: []`, `totalRecords: 0` |
| **Cursor** | `2026 Fund` | `data: []`, `totalRecords: 0` |

**Claude context:** 2026 Fund in **1 - Pre-One Pager**; empty state is plausible for a new pipeline fund.

**Merged verdict:** **PASS** — no invented filenames or padded rows.

---

## 7. Security — credential material

| Material | Detected (Claude transcript / tool output review) |
| --- | :---: |
| Raw JWT / Bearer / refresh / password / client secret / API key | **No** |

---

## 8. Merged findings register

| ID | Topic | Severity | Source |
| --- | --- | --- | --- |
| **KS-979-F-01** | Story / AC use **`<FUND_ID>`**; tool expects **`filterValue`** = **fund `Name`** (string). Use `get_funds` **Name** to drive `get_documents` in black-box tests | Low / doc–payload | Cursor |
| **KS-979-F-02** | Invalid or unknown fund returns **`success: true`** with **empty** `data` (not HTTP-style error) — same pattern as **KS-978-F-01**; callers should check `recordCount` / `data.length` | Low | Claude |
| **KS-979-F-03** | **`Documentcategories`** is a **semicolon-delimited string** (sometimes multi-label), not a JSON array | Low / integration | Claude |
| **KS-979-F-04** | **`Documentdate`** for some rows is **UTC midnight** (date-only semantics); **UI** may truncate to calendar date | Info | Claude |
| **KS-979-F-05** | **`FileName`** often stores **GUID**; human-readable name is in **`Title`** — prefer **Title** for display, **ID** / `FileName` for identity | Info | Claude |
| **KS-979-F-06** | **Second Entra / Dynamo identity** for true “unauthorized” scenario **not** run; **documented as OPEN** — sufficient for current sign-off unless security policy mandates | OPEN (policy) | Cursor |

*Renumbering note: Claude’s file labeled **F-01** (empty success) and **F-02** (categories) are merged here as **F-02** and **F-03** to reserve **F-01** for Cursor’s **FUND_ID / name** finding (aligns with **KS-977** merge practice).*

---

## 9. BDD acceptance criteria — final

| Scenario | Merged result | Evidence |
| --- | :---: | --- |
| **1 — Happy path** (≥1 doc; two calls; stable names/types/dates) | **PASS** | §4; both clients; first 5 `ID`s align |
| **2 — Error path** (invalid / no auth to fund) | **PASS** (invalid name) + **F-06** (no second user) | §5; §8 |
| **3 — Edge case** (zero documents) | **PASS** | §6 |

---

## 10. Definition of Done — checklist

| Criterion | Status |
| --- | :---: |
| `get_documents` happy path (fund with documents) | ✅ |
| Repeat-call **identifier** stability (shared window) | ✅ |
| Invalid fund → no leakage / empty list | ✅ |
| Zero-document fund | ✅ |
| Findings + integration notes logged | ✅ |
| Second-user auth negative | **OPEN** (documented) — **F-06** |
| Evidence: merged + **Claude** + **Cursor** sub-reports | ✅ |

---

## 11. Paste-ready Jira comment

*KS-979 **merged** (Claude Cowork + Cursor) — §5.3 **`get_documents`**: **Scenario 1 PASS** — **59 North Partners, LP**; `totalRecords` **148**; repeat calls **identical** document **IDs** (Claude 5×2 byte match; Cursor 10×2, first five match Claude). **Scenario 2 PASS** — bad fund names → **empty** `data`, **no** cross-fund rows. **Scenario 3 PASS** — **2026 Fund** → **0** docs, no placeholders. **Security:** no tokens in output (Claude). **OPEN** — **F-06** second Entra user not run (documented). **Findings:** **F-01** `FUND_ID` vs **fund name**; **F-02** `success`+empty; **F-03**–**F-05** API shape. Evidence: **`KS-979 Result.md`**, `KS-979 - Claude Result.md`, `KS-979 - Cursor Result.md`.*

---

## 12. References

| Document | Path |
| --- | --- |
| **This consolidated result** | `Dynamo Server/Test Result/KS-979 Result.md` |
| Claude (tables, byte match, field notes, JSON sample) | `Dynamo Server/Test Result/KS-979 - Claude Result.md` |
| Cursor (10-doc window, second-user OPEN) | `Dynamo Server/Test Result/KS-979 - Cursor Result.md` |
| QA guide §5.3 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Story | `Jira Ticket/dynamo_mcp_testing_stories.md` (US-E3-03) |

---

## 13. Appendix — Claude: sample document row (Call 1, record 1)

*Abridged from `KS-979 - Claude Result.md` §3.*

```json
{
  "ID": "F3B57C4F-151F-4616-AF7A-47193C5E6D50",
  "Title": "59 North Annual Notice (2026).pdf",
  "FileName": "F3B57C4F-151F-4616-AF7A-47193C5E6D50.pdf",
  "Documentcategories": "1-ODD Material; Other;",
  "Documentdate": "2026-04-14T12:38:27.117Z",
  "Funds": "59 North Partners, LP;",
  "IsLatest": true
}
```
