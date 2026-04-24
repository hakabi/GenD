# KS-978 — Final Result: Validate fund description and ratings for a known fund (§5.2)

| Field | Value |
| --- | --- |
| **Jira** | [KS-978](https://gendvn.atlassian.net/browse/KS-978) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.2** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-978 - Claude Result.md` (**Claude Cowork**) · `KS-978 - Cursor Result.md` (**Cursor Agent**) |
| **Consolidation date** | 2026-04-25 |

---

## 1. Executive summary

**Ticket:** As internal QA, validate **`get_fund_description`**, **`get_rating_summary`**, and **`get_rating_details`** (with **`get_funds`** / **`search_aloha_funds`** as needed) so description and ratings are **non-contradictory** for the same fund, **nulls are explicit**, and **dates/timezone** are clear from the **payload** (black box — no UI).

| Area | Claude Cowork | Cursor | Merged |
| --- | :---: | :---: | --- |
| **Scenario 1 — Happy path** (59 North / **`28582`** solovis) | ✅ PASS | ✅ PASS | **PASS** |
| **Scenario 2 — Non-existent name / id** | ✅ PASS | ✅ PASS | **PASS** |
| **Scenario 3 — Explicit nulls** (description or nullable fields) | ✅ PASS (2026 Fund `Description: null`) | ✅ PASS (sampled `get_funds` nulls) | **PASS** |
| **`get_rating_details`** (user-scoped) | ✅ PASS (empty for **`hakhoabinh@gmail.com`** — by design) | ✅ PASS (empty for **`binh.ha@conceptia.com`**) | **PASS** (contract; **no** populated detail rows in either run) |
| **Security** (no creds in tool output) | ✅ PASS | ✅ PASS | **PASS** |

**Overall:** **PASS** for §5.2 **Scenarios 1–3** on **two independent clients**. **Rating detail rows** are **empty** for both test UPNs used — consistent with **user-scoped** FAD behavior (Claude documents **non-KS** AAD; Cursor uses program **@conceptia.com**). **No** contradiction between **summary** scores and **empty** details; **not** a tool failure. For **non-empty** detail line QA, use a **KS AAD UPN** with known FAD data (per Claude runbook note).

**Baseline fund:** **59 North Partners, LP** · MSSQL **GUID** `D7879DB7-E230-4191-8849-DE4B7B64626C` · Solovis **`fund_id`**: **`28582`**.

---

## 2. Client coverage

| Client | Role in this package |
| --- | --- |
| **Claude Cowork** | Full identity-chaining write-up, **T1–T1-G** matrix, **UTC** date table, **Scenario 3** **2026 Fund** explicit `Description: null`, **`is_owned_by_ks=true`** on search, **non-KS** tester UPN for details |
| **Cursor** | `get_funds` path context, **`search_aloha_funds`** default search, **Scenario 2** numeric invalid id, program **`user`** for details (`binh.ha@conceptia.com`), **KS-977-F-01**-class **missing `FundId`** on `get_funds` |

---

## 3. Test environment (combined)

| Item | Claude | Cursor |
| --- | --- | --- |
| **Client** | Claude Cowork Desktop (Cowork mode) | Cursor Agent |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` | same (via workspace MCP) |
| **`get_rating_details` `user`** | `hakhoabinh@gmail.com` (non-KS AAD) | `binh.ha@conceptia.com` (program / MCP default user) |
| **`search_aloha_funds` (59 North)** | `search_text="59 North"`, **`is_owned_by_ks: true`** | `search_text: "59 North"` (default index behavior) |
| **Scenario 2 — bad name** | `ZZZNONEXISTENTFUND99999` | `ZZZ_NONEXISTENT_FUND_XYZ` |
| **Scenario 2 — bad rating id** | `ZZZNONEXISTENT99999` (string) | `999999999` (numeric) |

---

## 4. Scenario 1 — Happy path (merged)

**Aligned outcome (both):** **Name**, **manager**, **description** (59 North), and **`get_rating_summary`** dimensions **match**; **`get_funds`** **cross-references** align; **no** credential material in samples.

| Step | Evidence |
| --- | --- |
| **`get_fund_description`** | **GUID** + text description + manager — **Claude T1-A** / **Cursor §4.3** |
| **`search_aloha_funds`** | **`28582`**, **solovis**, name match — **T1-B** / **Cursor §4.2** |
| **`get_rating_summary`** | `rating_name` **59 North Partners, LP** · scores **6/6/6/6** · **avg conviction 5** — **T1-C** / **Cursor §4.4** |
| **`get_rating_details`** | **`success: true`**, **`data: []`** for both UPNs — no fabricated rows — **T1-D** / **Cursor §4.5** |
| **`get_funds`** | Manager, pipeline, asset class, **UTC** dates — **T1-E** (Claude) / **Cursor** context row |

**Cross-tool consistency** (abridged): see **Claude** §4 **T1-F** for the full attribute matrix.

**Dates:** **Claude** §4 **T1-G** — **`get_funds`** datetimes are **ISO 8601 UTC** (`Z`); description/summary tools carry **no** date fields in this test.

---

## 5. Scenario 2 — Error / empty (merged)

| Probe | Claude | Cursor | Merged |
| --- | --- | --- | --- |
| **Non-existent `fundName`** | Empty `data`, `recordCount: 0`, `success: true` | Empty `data`, `success: true` | **PASS** — no cross-fund leak |
| **Non-existent rating `id`** | Empty `data`, `success: true` | Empty `data`, `success: true` | **PASS** |

**Merged verdict:** **PASS** per ticket AC (“**controlled** error or **empty** authorized result”). **Finding:** see **F-01** —many responses use **`success: true` + empty `data`** instead of a hard error code.

---

## 6. Scenario 3 — Explicit nulls (merged)

| Source | Evidence |
| --- | --- |
| **Claude** | **2026 Fund** — `get_fund_description` returns **`"Description": null`** as JSON `null` (no placeholder string). **§6 T3-A** |
| **Cursor** | Nullable fields on **59 North** in **`get_funds`** (e.g. **`AuditorName: null`**) — explicit in payload |

**Merged verdict:** **PASS** — null/missing values are **not** silently omitted as if absent from schema; no invented placeholder ratings or description text (Claude edge case is the **stronger** sign-off for **AC Scenario 3**).

---

## 7. Security — credential material

| Material | Claude | Cursor | Merged |
| --- | :---: | :---: | :---: |
| Raw JWT / Bearer / password / client secret in tool JSON | **No** | **No** | **No** |

---

## 8. Merged findings register

| ID | Topic | Severity | Source |
| --- | --- | --- | --- |
| **KS-978-F-01** | **“Soft empty”** — not-found / invalid id often returns **`success: true`** with **empty** `data` (not `404` / `success: false`); integrators should check **`recordCount` / `data.length`**. | Low | **Claude** (primary) · **Cursor** (invalid id variant) |
| **KS-978-F-02** | **ID multiplicity** — **MSSQL `ID` (Guid)** in `get_fund_description` vs **ES `fund_id`** in **`search_aloha_funds` / `get_rating_*`**; **`get_funds`** has **no** single **`FUND_ID`** in observed payload (cf. **KS-977-F-01**). **Black-box chain:** name → **search** → ratings **`id`**. | Low / doc–payload | **Claude** F-02 + **Cursor** F-01 |
| **KS-978-F-03** | **`get_rating_details` empty** for tested UPNs — **hakhoabinh@gmail.com** (Claude, non-KS) and **binh.ha@conceptia.com** (Cursor). **User-scoped**; **not** a defect — populated rows need UPN with FAD data (Claude: **KS** AAD for full line items). | Info / by design | **Claude** F-03 · **Cursor** F-02 |
| **KS-978-F-04** | **Date/time** visibility: **`get_fund_description`** / **`get_rating_summary`** show **no** date fields; **UTC** on **`get_funds`** only in this test. | Info | **Claude** F-04 |

*Original **Claude** per-file **F-01**–**F-04** are **folded** into the table above to avoid duplicate IDs.*

---

## 9. BDD acceptance criteria — final

| Scenario | Result | Evidence |
| --- | :---: | --- |
| **1 — Happy path** | **PASS** | **§4**; both clients |
| **2 — Error path** | **PASS** | **§5** |
| **3 — Edge (nulls explicit)** | **PASS** | **§6** (Claude **2026 Fund**; Cursor nullables) |

---

## 10. Definition of Done — checklist

| Criterion | Status |
| --- | ---: |
| `get_fund_description` + `get_rating_summary` + `get_rating_details` + `get_funds` (consistency) | ✅ |
| `search_aloha_funds` / **id** chain documented | ✅ |
| Non-contradictory description vs ratings (summary) | ✅ |
| Null edge explicit | ✅ |
| Scenario 2 — invalid / empty | ✅ |
| No credential leakage in samples | ✅ |
| Findings logged | ✅ |
| Evidence — **merged** + `KS-978 - * Result.md` | ✅ |

---

## 11. Paste-ready Jira comment

*KS-978 **merged** (Claude Cowork + Cursor) **§5.2: PASS** — **59 North** / **`28582` (solovis)**: description, rating summary, `get_funds` **aligned**; **`get_rating_details`** **success** with **empty** `data` for both UPNs (**user-scoped**, no fab rows). **Scenarios 2–3 PASS** (Claude: **2026 Fund** `Description: null`). **F-01** soft-empty API shape; **F-02** Guid vs ES id vs `get_funds`; **F-03** empty details / KS UPN for rows; **F-04** dates on `get_funds` only. **No** tokens in output. **Evidence:** **`KS-978 Result.md`** + `KS-978 - Claude Result.md` + `KS-978 - Cursor Result.md`.*

---

## 12. References

| Document | Path |
| --- | --- |
| **This consolidated result** | `Dynamo Server/Test Result/KS-978 Result.md` |
| Claude (matrices, UTC table, 2026 Fund null) | `Dynamo Server/Test Result/KS-978 - Claude Result.md` |
| Cursor (numeric invalid id, `binh.ha@` details) | `Dynamo Server/Test Result/KS-978 - Cursor Result.md` |
| QA guide §5.2 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Related (fund list / id) | `Dynamo Server/Test Result/KS-977 Result.md` |

---

## 13. Appendix — Claude: 2026 Fund null description (Scenario 3)

*From `KS-978 - Claude Result.md` §6.*

```json
{
  "ID": "3F554983-6C4B-470F-B7A0-AC823EA4AFD1",
  "Name": "2026 Fund",
  "SimpleSearchField": "2026 Fund",
  "FundManagerName": "Phoenix Equity",
  "Description": null
}
```
