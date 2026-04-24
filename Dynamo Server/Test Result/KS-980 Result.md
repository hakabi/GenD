# KS-980 — Final Result: Validate `get_activity`, `get_notes`, and `analyze_notes` (Section 5.4)

| Field | Value |
| --- | --- |
| **Jira** | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **Section 5.4** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-980 - Claude Result.md` (**Claude Cowork**) · `KS-980 - Cursor Result.md` (**Cursor Agent**) |
| **Consolidation date** | 2026-04-24 |

---

## 1. Executive summary

**Ticket:** Black-box validation of **`get_activity`** (fund-scoped timeline), **`get_notes`** and **`analyze_notes`** (company-scoped text and analysis): chronological activity, note bodies that support grounded analysis, invalid input and edge cases; **MCP only**.

**Baseline:** **59 North Partners, LP** (activity) / **59 North Capital Management** (notes and analysis).

| Area | Claude Cowork | Cursor | Merged |
| --- | :---: | :---: | --- |
| **Scenario 1 — Happy path** (activity order, notes ↔ analysis) | **PASS** (40 activities; **19** notes in analysis corpus; 7 highlight keywords traced to bodies) | **PASS** (40 activities; **73** note rows with `activityCategories: ["*"]`; **19** analyzed; ID/subject cross-alignment) | **PASS** — both confirm **Date DESC** activity; grounded **`analyze_notes`**; see **Section 4.1** for **19 vs 73** |
| **Scenario 2 — Invalid fund / scope** | **PASS** (`ZZZNONEXISTENTFUND99999` → empty activity) | **PASS** (`KS980_INVALID_FUND_XYZ_000` → empty) | **PASS** — `success: true`, empty `data`, no observed leakage |
| **Scenario 2 — Second identity (unauthorized)** | *Not a separate test leg* | **OPEN** (documented) | **OPEN (documented)** — no second Entra user; optional future fixture |
| **Scenario 3 — Empty / insufficient notes** | **PASS** (2026 Fund → Phoenix Equity note with **`Body_Plaintext: null`** when `includeBody=false`; **`analyze_notes`** not invoked for that leg) | **PASS** (bogus company → **`analyze_notes`** `total: 0`; plus **2026 Fund** fund-name vs company-name illustration) | **PASS** — two complementary edge legs; see **Section 6** |
| **Large dataset / payload** | **Noted** (~**192k** chars full **`analyze_notes`** response for 19 long bodies) | **Noted** (**73** rows with broad category filter; pagination / 2 MB guidance) | **PASS** (observed) — callers should cap bodies / paginate |

**Overall:** **PASS** for executed Section 5.4 BDD rows. **OPEN:** second-user authorization-negative (**Cursor**). Remaining items are **low / info** (API shape, integration guidance, empty-`success` pattern), not functional failures of the happy path.

---

## 2. Client coverage

| Client | Role in this package |
| --- | --- |
| **Claude Cowork** | Detailed Scenario 1 tables (activity sort, first 5 notes, 7 keyword grounding quotes), **`themes: []`** observation, invalid fund JSON, 2026 Fund **null-body** edge with `includeBody=false`, security credential scan, appendix JSON |
| **Cursor** | Live **`fundNames` / `companyNames`** parameter names, **`activityCategories: ["*"]`** breadth (**73** `totalRecords`), explicit **`analyze_notes`** zero-note run, **OPEN** on strict “fund-only” note proof, second-user **OPEN** |

---

## 3. Test environment (combined)

| Item | Claude | Cursor |
| --- | --- | --- |
| **Report / run date** | 2026-04-24 | 2026-04-24 |
| **Client** | Claude Cowork Desktop (Cowork mode) | Cursor Agent |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` | Same (MCP `user-conceptia-dynamo`) |
| **Activity filter** | Described as `filterType="fund"` in prose (maps to **`fundNames`**) | `fundNames: ["59 North Partners, LP"]` |
| **Notes filter** | `filterType="company"` in prose (maps to **`companyNames`**); default category = **Investment Due Diligence** (implicit in Claude’s first **`get_notes`** leg) | `companyNames` + explicit **`activityCategories: ["*"]`** for broad note set |

---

## 4. Scenario 1 — Happy path

### 4.1 Aligned facts (59 North)

| Field | Claude | Cursor |
| --- | --- | --- |
| **`get_activity` `totalRecords`** | 40 | 40 |
| **Activity sort** | **Date** descending (newest first) | Same (strictly non-increasing **`Date`**) |
| **`analyze_notes` message** | `Analyzed 19 note(s).` | `Analyzed 19 note(s).` |
| **`get_notes` note universe** | **19** total when scoped to diligence-style listing (`totalRecords: 19` on first leg) | **73** `totalRecords` with **`activityCategories: ["*"]`** (includes risk reports, IR email threads, etc.) |

**Reconciliation:** **`analyze_notes`** with **`companyNames: ["59 North Capital Management"]`** operated on a **19-note** corpus in both runs (same analyzed count). **Cursor**’s **73** reflects **all** activity categories in **`get_notes`**; **Claude**’s **19** matches the subset consistent with **Investment Due Diligence**-heavy listing — both are valid; integration docs should state which category scope matches product intent.

### 4.2 Cross-tool alignment

- **Latest note:** **July 2025 - Gregg Wolfson <> KAY Update** / **2025-07-30** — **Claude** and **Cursor** agree with **`comparison.latest`** / **`summary.latest`**.
- **Cursor** additionally verified shared **`ID`** between **`get_activity`** and **`get_notes`** (e.g. **March 2026 Estimate** row).

### 4.3 Grounding (`analyze_notes`)

**Claude** traced **7** highlight dimensions (**strategy**, **macro**, **risk**, **performance**, **ai**, **defense**, **energy**) to concrete phrases in note bodies. **Cursor** confirmed **`highlights`** / **`comparison`** snippets match portfolio and meeting content (not generic boilerplate).

**Merged verdict:** **PASS**.

---

## 5. Scenario 2 — Error path (invalid fund)

| Source | Invalid input | Outcome |
| --- | --- | --- |
| **Claude** | `ZZZNONEXISTENTFUND99999` | `success: true`, `data: []`, `recordCount: 0` |
| **Cursor** | `KS980_INVALID_FUND_XYZ_000` | `success: true`, `data: []`, `totalRecords: 0` |

**Merged verdict:** **PASS** — soft-empty pattern (aligns with **KS-978** / **KS-979**).

**Not executed:** Separate signed-in user denied access to an existing fund (**OPEN** — **Cursor**; see **Section 8**).

---

## 6. Scenario 3 — Edge cases

| Leg | Claude | Cursor | Merged |
| --- | --- | --- | --- |
| **A — 2026 Fund / Phoenix Equity** | 1 activity; **`get_notes`** with **`includeBody=false`** → **`Body_Plaintext: null`**; **`analyze_notes`** not called (avoid LLM on empty corpus) | `get_notes` with **`companyNames: ["Phoenix Equity"]`**, **`includeBody: true`** → **1** row with substantive **Body_Plaintext** (same activity **`ID`** as activity row) | **PASS** for *explicit empty / non-analyzable* representation (**Claude** null-body leg); **Cursor** proves when body is requested, content is present — document **`includeBody`** semantics |
| **B — Zero-note analysis** | *(not run)* | **`analyze_notes`** on bogus company → **`total: 0`**, empty **`highlights`**, **`comparison: null`** | **PASS** — no invented themes |
| **C — Fund name vs company** | Implied via **F-01** | Explicit table: **`companyNames: ["2026 Fund"]`** → **0** rows; **`["Phoenix Equity"]`** → aligned row | **Documented** — chain must resolve **fund → manager company** |

---

## 7. Security — credential material

| Material | Claude transcript / output | Cursor |
| --- | :---: | --- |
| Raw JWT / Bearer / password / secret / API key in tool output | **No** | *(same session class)* |

**Merged:** **PASS**.

---

## 8. Merged findings register

| ID | Topic | Severity | Source |
| --- | --- | --- | --- |
| **KS-980-F-01** | **Fund name** drives **`get_activity`** (`fundNames`); **company / manager name** drives **`get_notes`** and **`analyze_notes`** (`companyNames`). Single “fund id” string does not work across the chain — resolve via **`Companies`** on activity, **`get_funds`**, or integration map | Low / integration (Cursor: Medium / doc–API) | Both |
| **KS-980-F-02** | Invalid fund/company often returns **`success: true`** + empty **`data`** — callers must check **`recordCount`** / **`data.length`** (pattern per **KS-978** / **KS-979**) | Low | Claude |
| **KS-980-F-03** | **`analyze_notes`** can return **large** payloads (**~192k** chars for 19 long bodies per **Claude**); use **`maxBodyLength`**, pagination on **`get_notes`**, or post-process before UI | Low | Claude |
| **KS-980-F-04** | **`themes`** array **empty** while **`highlights`** populated — clarify with vendor whether deprecated, optional, or parameter-gated | Info | Claude |
| **KS-980-F-05** | **`get_activity`** is **newest-first**; if product requires **oldest-first**, document or change sort | Low | Cursor |
| **KS-980-F-06** | Second **Entra** identity for true **unauthorized** scenario **not** run | **OPEN** (policy) | Cursor |

*Renumbering: **Claude**’s **F-03** (payload) / **F-04** (**themes**) are preserved here; **Cursor**’s second-user finding becomes **F-06**; **Cursor**’s ordering note becomes **F-05**.*

---

## 9. BDD acceptance criteria — final

| Scenario | Merged result | Evidence |
| --- | :---: | --- |
| **1 — Happy path** | **PASS** | §4; both clients; 40 activities; **19** notes analyzed; grounding |
| **2 — Error path** | **PASS** (invalid) + **F-06** (no second user) | §5; §8 |
| **3 — Edge case** | **PASS** | §6 — null-body leg (**Claude**), zero-note **`analyze_notes`** (**Cursor**), fund vs company illustration (**Cursor**) |

---

## 10. Definition of Done — checklist

| Criterion | Status |
| --- | :---: |
| **`get_activity`** time-ordered log (observed **DESC** by **Date**) | ✅ |
| **`get_notes`** substantive bodies (when **`includeBody`** appropriate) | ✅ |
| **`analyze_notes`** grounded in note content | ✅ |
| Cross-tool alignment (IDs / latest note / corpus size) | ✅ |
| Invalid fund → empty, no leakage | ✅ |
| Edge: insufficient / empty note data explicit | ✅ |
| Large payload / category scope documented | ✅ |
| Findings logged | ✅ |
| Second-user auth negative | **OPEN** — **F-06** |
| Evidence: merged + **Claude** + **Cursor** sub-reports | ✅ |

---

## 11. Paste-ready Jira comment

*KS-980 **merged** (Claude Cowork + Cursor) — Section 5.4 **`get_activity` / `get_notes` / `analyze_notes`**: **Scenario 1 PASS** — **59 North Partners, LP** (**40** activities, **Date** DESC); **59 North Capital Management** — **`analyze_notes`** **19** notes, highlights grounded in bodies (**Claude** keyword trace; **Cursor** ID alignment). **Note:** **`get_notes` `totalRecords`** **73** vs **19** = category scope (**`*`** vs diligence-focused listing). **Scenario 2 PASS** — invalid fund strings → empty activity. **Scenario 3 PASS** — **Claude:** Phoenix Equity **`Body_Plaintext` null** with **`includeBody=false`**; **Cursor:** zero-note **`analyze_notes`** + **2026 Fund** fund-vs-company chain. **Security:** no tokens (**Claude**). **OPEN** — **F-06** second Entra user. **Findings:** **F-01** fund vs company; **F-02** soft-empty; **F-03** payload size; **F-04** empty **`themes`**; **F-05** sort direction. Evidence: **`KS-980 Result.md`**, `KS-980 - Claude Result.md`, `KS-980 - Cursor Result.md`.*

---

## 12. References

| Document | Path |
| --- | --- |
| **This consolidated result** | `Dynamo Server/Test Result/KS-980 Result.md` |
| Claude (keyword grounding, null-body edge, appendix) | `Dynamo Server/Test Result/KS-980 - Claude Result.md` |
| Cursor (broad `get_notes`, zero-note `analyze_notes`, second-user OPEN) | `Dynamo Server/Test Result/KS-980 - Cursor Result.md` |
| QA guide Section 5.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |

---

## 13. Appendix — Claude: `analyze_notes` structure (abridged)

*From `KS-980 - Claude Result.md` appendix (Section 11 in that file).*

```json
{
  "success": true,
  "message": "Analyzed 19 note(s).",
  "summary": {
    "total": 19,
    "earliest": "2022-07-12T13:50:51.000Z",
    "latest": "2025-07-30T12:08:07.000Z",
    "byYear": { "2022": "[4 notes]", "2023": "[1]", "2024": "[10]", "2025": "[4]" }
  },
  "highlights": ["strategy", "macro", "risk", "performance", "ai", "defense", "energy"],
  "themes": [],
  "comparison": {
    "latest": { "subject": "July 2025 - Gregg Wolfson <> KAY Update", "date": "2025-07-30T12:08:07.000Z", "snippet": "..." },
    "priorTwoYearsCount": 14,
    "priorExamples": ["..."]
  },
  "data": ["19 full note objects"]
}
```
