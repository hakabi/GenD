# KS-980 — Test Result: Activity, notes, and `analyze_notes` (Section 5.4)

| Field | Value |
| --- | --- |
| **Jira** | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **Section 5.4** |
| **MCP** | `conceptia-dynamo` |
| **Tester / agent** | Cursor Agent (live tool invocation) |
| **Report date** | 2026-04-24 |

---

## 1. Executive summary

**Requirement:** Black-box validation of **Section 5.4**: chain **`get_activity`** → **`get_notes`** → **`analyze_notes`** for a fund context; activity must be time-ordered; note text must support a grounded analysis (no generic boilerplate); handle invalid scope and empty-note behavior.

| Area | Result | Notes |
| --- | :---: | --- |
| **Scenario 1 — Happy path** | **PASS** | Fund **59 North Partners, LP**: activity **reverse-chronological** by `Date`; notes for derived manager **59 North Capital Management** align with activity rows; `analyze_notes` **highlights/comparison** trace to real subjects and bodies |
| **Scenario 2 — Error path (invalid fund)** | **PASS** | Unknown fund name → **`get_activity`** empty, `success: true`, **no** cross-tenant rows |
| **Scenario 2 — Unauthorized user** | **OPEN** (documented) | **Not run:** second Entra identity without fund access. Same posture as **KS-979** Cursor report |
| **Scenario 3 — Empty / insufficient notes** | **PASS** (tool behavior) | **`analyze_notes`** with filter yielding **0** notes → `total: 0`, empty structured summary; **no** invented narrative |
| **Scenario 3 — “Fund with activity only” (strict AC)** | **OPEN** (tooling) | **`get_notes`** / **`analyze_notes`** accept **`companyNames`**, not **`fundNames`**. Proving “this fund has zero notes” vs “wrong company filter” is **not** first-class without mapping fund → manager company (**2026 Fund** example below) |
| **Large dataset** | **Noted** | 59 North notes: **73** total (`get_notes` with `activityCategories: ["*"]`); responses within **2 MB** guidance with pagination / truncation |

---

## 2. Ticket traceability

| Theme | Evidence |
| --- | --- |
| Prompt intent (Section 5.4) | *“Get all activity and notes for fund `<FUND_ID>`, then analyze…”* → **`get_activity`** with `fundNames: ["<fund name>"]`; notes/analysis via **`companyNames`** derived from activity **`Companies`** (or known manager), see Section 8 |
| Activity chronology | **`Date`** field monotonic **descending** (newest → oldest) on sample pages |
| Notes vs analysis | Overlapping **`ID`** / subjects between **`get_activity`** and **`get_notes`**; **`analyze_notes`** `data` / `comparison` snippets match **`Body_Plaintext`** themes (e.g. portfolio updates, meeting takeaways) |
| Invalid input | Nonsense fund name → empty activity |
| Second-user auth | **OPEN** (documented) |

---

## 3. Test environment

| Item | Value |
| --- | --- |
| Client | Cursor Agent — MCP `user-conceptia-dynamo` |
| Auth | Microsoft OAuth (tester session) |
| Payload | **`get_notes`**: `includeBody: true`, `maxBodyLength` 5000 (happy path sample); pagination where needed |

---

## 4. Test execution — Scenario 1 (happy path)

**Fund:** `59 North Partners, LP`  
**Derived manager (for notes tools):** `59 North Capital Management` (from **`Companies`** on activity rows)

### 4.1 `get_activity`

**Parameters:** `fundNames: ["59 North Partners, LP"]`, `limit: 15`, `offset: 0`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `recordCount` | 15 |
| `totalRecords` | 40 |
| `hasMore` | `true` |

**Chronology:** First-page **`Date`** values run **2026-03-31 → 2025-04-30** (strictly non-increasing). **Interpretation:** API presents a **reverse-chronological** activity log (newest first). **Verdict:** **PASS** for consistent time ordering.

**Sample first row:** `Subject` = `[EXTERNAL] 59 North Capital - March 2026 Estimate`, `ID` = `B1719E28-A551-4E1B-BB9B-16BFF146E350`

### 4.2 `get_notes`

**Parameters:** `companyNames: ["59 North Capital Management"]`, `activityCategories: ["*"]`, `limit: 10`, `offset: 0`, `includeBody: true`, `maxBodyLength: 5000`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `recordCount` | 10 |
| `totalRecords` | 73 |
| `hasMore` | `true` |

**Cross-tool alignment:** Second note row reuses activity **`ID`** `B1719E28-A551-4E1B-BB9B-16BFF146E350` and the same **March 2026 Estimate** subject; body contains **Series B**, **MTD/YTD**, **portfolio exposure** language consistent with diligence / IR content.

**Verdict:** **PASS** — shared identifiers and content across tools.

### 4.3 `analyze_notes`

**Parameters:** `companyNames: ["59 North Capital Management"]`, `limit: 50`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `message` | `Analyzed 19 note(s).` |

**Grounding:** Response includes structured **`highlights`** whose entries are **subject + date** strings matching known notes (e.g. **July 2025 - Gregg Wolfson <> KAY Update**). **`comparison.latest`** / **`priorExamples`** contain **snippets** aligned with meeting-update and portfolio-commentary text (e.g. Q1/Q2 book commentary, meeting takeaways), not generic filler.

**Verdict:** **PASS** — analysis anchored to retrieved note content.

---

## 5. Test execution — Scenario 2 (invalid fund)

**Parameters:** `fundNames: ["KS980_INVALID_FUND_XYZ_000"]`, `limit: 10`, `offset: 0`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `data` | `[]` |
| `totalRecords` | 0 |

**Verdict:** **PASS** — empty authorized result; no leakage.

**OPEN:** True **unauthorized** user (existing fund, no entitlement) **not** executed; same **OPEN** documentation as prior Dynamo MCP Cursor reports.

---

## 6. Test execution — Scenario 3 (empty notes / insufficient data)

### 6.1 Zero-note `analyze_notes`

**Parameters:** `companyNames: ["KS980_NONEXISTENT_COMPANY_XYZ"]`, `limit: 20`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `message` | `Analyzed 0 note(s).` |
| `summary.total` | `0` |
| `highlights` | `{}` |
| `comparison` | `null` |
| `data` | `[]` |

**Verdict:** **PASS** — explicit empty set; **no** fabricated themes in structured output.

### 6.2 Illustration: fund vs company filter (**2026 Fund**)

| Tool | Parameters | Outcome |
| --- | --- | --- |
| `get_activity` | `fundNames: ["2026 Fund"]` | **1** row: **Phoenix Equity** intro meeting, `Funds: 2026 Fund;` |
| `get_notes` | `companyNames: ["2026 Fund"]`, `activityCategories: ["*"]` | **0** rows (mis-scoped: manager is **Phoenix Equity**, not fund name) |
| `get_notes` | `companyNames: ["Phoenix Equity"]`, `activityCategories: ["*"]` | **1** row: **same `ID`** `7272B173-5B0B-44E8-AB55-A198ACF8AAC6` as activity |

**Implication:** Section 5.4’s “fund” prompt is **not** a single-parameter pass-through to **`get_notes`** / **`analyze_notes`**. Testers must **resolve manager/company** from activity (or another source). **Not** a failure of happy-path 59 North flow, but drives **KS-980-F-01** below.

---

## 7. BDD acceptance criteria (Cursor)

| Scenario | Status | Notes |
| --- | :---: | --- |
| **1 — Happy path** | **PASS** | Activity ordering; notes ↔ analysis grounding |
| **2 — Error path** | **PASS** | Invalid fund → empty activity |
| **2 — Unauthorized (separate identity)** | **OPEN** | Documented; not executed |
| **3 — Edge (empty / insufficient notes)** | **PASS** | Zero-note `analyze_notes`; **OPEN** for strict “fund with activity only” proof due to API shape |

---

## 8. Findings

| ID | Severity | Description |
| --- | --- | --- |
| **KS-980-F-01** | Medium / doc–API | Story and guide use **`<FUND_ID>`**; **`get_activity`** supports **`fundNames`**; **`get_notes`** and **`analyze_notes`** filter by **`companyNames`** only. Section 5.4 chains require **fund → company** resolution (see **2026 Fund** illustration). |
| **KS-980-F-02** | Low / ordering semantics | **`get_activity`** returns **newest-first** ordering. If product expectation is **oldest-first**, document or adjust API/sort. |
| **KS-980-F-03** | **OPEN** (documented) | No second Entra user for authorization-negative testing. |

---

## 9. Definition of Done (Cursor)

| Criterion | Status |
| --- | :---: |
| Section 5.4 happy path (three tools) | ✅ |
| Activity time order consistent | ✅ |
| `analyze_notes` grounded in note content | ✅ |
| Invalid fund → no leakage | ✅ |
| Zero-note analysis behavior | ✅ |
| Second-user auth-negative | **OPEN** (documented) |
| Evidence in this file | ✅ |

---

## 10. Paste-ready Jira comment (Cursor only)

*KS-980 **Cursor** (Section 5.4): **`get_activity`** for **59 North Partners, LP** — **40** activities, first page **reverse-chrono**; **`get_notes`** (**59 North Capital Management**, `activityCategories: ["*"]`) — **73** notes, bodies align with activity **`ID`**s; **`analyze_notes`** — **19** notes analyzed, **highlights/comparison** grounded in real snippets. Invalid fund → **0** activities. **`analyze_notes`** on bogus company → **0** notes, empty summary (no invented themes). **KS-980-F-01:** notes/analysis are **company-scoped**, not fund-scoped — derive **`companyNames`** from activity. **F-03:** second-user unauthorized — **OPEN**. Full detail: `Dynamo Server/Test Result/KS-980 - Cursor Result.md`.*

---

## 11. References

| Document | Path |
| --- | --- |
| Testing guide Section 5.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Jira | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
