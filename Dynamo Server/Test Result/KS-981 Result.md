# KS-981 — Final Result: Validate `list_table`, `describe_table`, `read_data` (section 5.5 / section 1.4)

| Field | Value |
| --- | --- |
| **Jira** | [KS-981](https://gendvn.atlassian.net/browse/KS-981) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **section 5.5** · **section 1.4** (HIGH) |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-981 - Claude Result.md` (**Claude Cowork**) · `KS-981 - Cursor Result.md` (**Cursor Agent**) |
| **Consolidation date** | 2026-04-25 |

---

## 1. Executive summary

**Ticket:** `list_table` → `describe_table` (funds / **`Fund`**) → `read_data` (first 10 rows); **describe** and **read** must be **type-consistent**; **section 1.4** high-risk tools tracked separately. Tools may be **removed or restricted** in production (guide).

| Area | Claude Cowork | Cursor | Merged |
| --- | :---: | :---: | --- |
| **section 1.4 — Tool presence** | All three **executed** | All three **executed** | **PASS** — in this Conceptia build |
| **Scenario 1 — Happy path** | **PASS** — 2,171 tables; `Fund` found; `describe`("Fund") **338** cols; 6-col `read` + **59 North** GUID vs **KS-978** | **PASS** — 2,171 tables; `describe`("Fund"); `SELECT TOP 10 *` → **10** rows, first row **385** keys | **PASS** — chain works; **338** (describe) vs **385** (`SELECT *` row keys) **delta** documented (**F-05**) |
| **Scenario 2 — Invalid table** | **`describe`**: invalid → `success`+`[]` ; **`describe`("dbo.Fund")** → `[]` (**F-01**); `read` invalid *not* in Claude write-up | `read_data` on bogus object → **clear SQL error**; `describe` invalid → `success`+`[]` | **PASS** — **`read_data`**: explicit failure (Cursor); **`describe_table`**: no error string (**F-03**) |
| **Scenario 3 — Wide / TOP 10** | `SELECT TOP 10 *` — **10** rows, **385** cols/row, ~**145K** chars | Same pattern; **~136.5 KB** agent capture; **385** keys row 0 | **PASS** — `TOP` honored; cap is **query-side** (see **F-04**) |
| **Credentials in output** | **PASS** (no tokens) | **PASS** (spot-check) | **PASS** |
| **Authorization / cross-tenant** | Black-box; no second user | Assumed OAuth scope | **Not** a separate **BLOCKED** leg — see **KS-992** for ES vs CRM scope elsewhere |

**Overall:** **PASS** for section 5.5 on **both** clients, with **HIGH** items (**F-02**, **F-04**) and **low/info** API-shape items (**F-01**, **F-03**, **F-05**, **F-06**) for production / integration.

---

## 2. Client coverage

| Client | Role in this package |
| --- | --- |
| **Claude Cowork** | 338-column **describe** analysis; 6-field **read** + **type matrix**; **59 North** GUID = **KS-978**; **invalid** + **`dbo.Fund` describe**; **338 vs 385** column delta; **HIGH** production gates (**F-02**, **F-04**); PII note |
| **Cursor** | **`list_table` count** parse (2,171); **`SELECT *`** 10× wide row; **invalid** strings `KS981_*`; **JSON** key sanitization + **`_tmpstmp_` Buffer**; `read_data` error message verbatim |

---

## 3. Test environment (combined)

| Item | Claude (2026-04-24) | Cursor (2026-04-25) |
| --- | --- | --- |
| **Client** | Claude Cowork Desktop (Cowork mode) | Cursor Agent |
| **Endpoint** | `https://mcp.conceptia.com/dynamo/sse` | Same |
| **Primary table** | `Fund` | `Fund` / `dbo.Fund` in SQL text |
| **`list_table` items** | 2,171 (reported) | 2,171 (parsed) |

---

## 4. section 1.4 — High-risk tool checklist (merged)

| Tool | Claude summary | Cursor summary | Merged |
| --- | --- | --- | --- |
| **`list_table`** | 2,171 names; **F-02** production gate (allow-list / remove) | Large payload (~95.6 KB one-line in Cursor capture) | **PASS** — full schema surface exposed |
| **`describe_table`** | **F-01** — no `dbo.` prefix; **F-03** empty success | `Fund` + invalid → patterns above | **PASS** with **F-01** / **F-03** |
| **`read_data`** | 6-col + `SELECT *` tests; **F-04** no server **TOP** | Invalid table → `QUERY_EXECUTION_FAILED` | **PASS**; **F-04** for unbounded `SELECT` risk |

---

## 5. Scenario 1 — Happy path (merged facts)

| Fact | Source |
| --- | --- |
| **`list_table` includes `dbo.Fund`** | Both |
| **Table count** | **2,171** (both) |
| **`describe_table("Fund")` column definitions** | **338** (Claude count); Cursor: “large / multi-hundred” (aligned) |
| **`read_data` — guide-style “10 rows”** | Claude: 6 columns + `ORDER BY` + 59 North spot query; Cursor: `SELECT TOP 10 * FROM dbo.Fund` |
| **First `Fund` row (name)** | `36 South` (both runs, consistent) |
| **Wide row** | `SELECT *` first row: **385** top-level keys (Claude + Cursor) |
| **59 North `ID` vs KS-978** | **Claude** — `D7879DB7-E230-4191-8849-DE4B7B64626C` **match** |

**Merged verdict:** **PASS** — list/describe/read are **functionally** coherent; type checks on key fields (**Claude** matrix) and **Cursor** `SELECT *` shape; **F-01**, **F-05**, **F-06** cover naming/delta/serialization details.

---

## 6. Scenario 2 — Error / ambiguous inputs

| Test | Outcome (merged) |
| --- | --- |
| **`read_data` — invalid object** (Cursor) | `success: false`, message includes *Invalid object name* — **PASS** (clear) |
| **`describe_table` — invalid name** (Claude `ZZZ...`, Cursor `KS981_Invalid...`) | `success: true`, `columns: []` — no distinct error code (**F-03**) |
| **`describe_table("dbo.Fund")`** (Claude only) | `columns: []` — same as invalid; use **`Fund`** without prefix (**F-01**) |

**Merged verdict:** **PASS** for “no cross-table dump”; **F-01** and **F-03** for **describe** API ergonomics.

---

## 7. Scenario 3 — Row cap and wide rows

| Metric | Claude | Cursor (representative) |
| --- | --- | --- |
| `SELECT TOP 10 *` rows | 10 | 10 |
| Columns per row (wide) | 385 | 385 (keys in row 0) |
| Payload scale | ~145,000 characters | ~136.5 KB agent file |
| **Server-side** row limit | **None** in tool — only SQL `TOP` (**F-04**) | Same finding |

**Merged verdict:** **PASS** — `TOP 10` honored; **F-04** for production hardening on **read_data**.

---

## 8. Security — credential material (Claude-led)

| Material | Merged |
| --- | :---: |
| Raw JWT / Bearer / password / client secret in tool output (Claude + Cursor) | **No** (Claude scan; Cursor spot-check) |
| PII in sampled **Fund** rows (Claude) | **No** in scope shown |

---

## 9. Merged findings register

| ID | Topic | Severity | Source |
| --- | --- | --- | --- |
| **KS-981-F-01** | **`describe_table`**: `tableName` must be table only (**`Fund`**). **`"dbo.Fund"`** returns **empty** `columns` (Claude) — **misaligned** with `list_table`’s `dbo.*` display. | Low | Claude (primary) |
| **KS-981-F-02** | **`list_table`**: **2,171** unscoped table names — **full DB schema** exposure. **Production:** allow-list, remove, or scope. | **HIGH** (prod gate) | Claude |
| **KS-981-F-03** | **`describe_table`**: **invalid** / **empty**-schema cases return **`success: true`** + `columns: []` — no **table-not-found** signal (Claude + Cursor). | Low | Merged |
| **KS-981-F-04** | **`read_data`**: free-form `SELECT` — no **server** row cap; caller must use **`TOP`**. | **HIGH** (prod gate) | Claude (primary) |
| **KS-981-F-05** | **338** `describe` columns vs **385** properties on **`SELECT *`** row (47 delta) — computed/virtual/expanded surface (Claude). | Info | Claude |
| **KS-981-F-06** | **`read_data`** JSON: keys may **drop/sanitize** punctuation vs **`describe`** `name` (e.g. `Highmm` vs `High(mm)`); **`_tmpstmp_`** as **`Buffer`** in JSON, not a plain datetime string (Cursor). | Low | Cursor |

*Sub-report ID mapping: Cursor **F-01** (JSON keys / **Buffer**) → **F-06** here; Cursor **F-02** (empty **describe**) → subsumed in **F-03** here; Cursor **F-03** (large **list_table**) → **F-02** (HIGH) here. Claude F-01–F-05 are folded into **F-01**–**F-05** above; no duplicate HIGH rows.*

---

## 10. BDD acceptance criteria — final

| Scenario | Merged result | Evidence |
| --- | :---: | --- |
| **1** — list includes funds table; describe + read **consistent** | **PASS** (with F-01, F-05, F-06) | section 5, sub-reports section 4 / section 5 |
| **2** — invalid → error or **safe** result; no unrelated dump | **PASS** (read clear; describe empty) | section 6 |
| **3** — >10 / wide: only **10** returned as specified | **PASS** | section 7 |

---

## 11. Definition of Done — checklist

| Criterion | Status |
| --- | :---: |
| section 5.5 list → describe → read | ✅ |
| section 1.4 checklist in this report (section 4) | ✅ |
| Invalid paths exercised | ✅ |
| Wide / `TOP` behavior documented | ✅ |
| Findings + HIGH gates logged | ✅ |
| Evidence: merged + two sub-reports | ✅ |

---

## 12. Paste-ready Jira comment

*KS-981 **merged** (Claude Cowork + Cursor) — section 5.5 / section 1.4: **`list_table`**, **`describe_table`**, **`read_data`*** — **Scenario 1–3 PASS**. **2,171** tables; **`Fund`** found; **describe**("Fund") **338** columns; **`SELECT TOP 10 *`** **10** rows, **385** keys/row, ~**140K+** chars. **59 North** GUID **matches KS-978** (Claude). **`read_data`** invalid table → **clear error**; **`describe`**: invalid + **`dbo.Fund`** → **`success` + `[]`** (**F-01**, **F-03**). **HIGH:** **F-02** unscoped `list_table`; **F-04** no server row cap. **F-05** 338 vs 385 columns; **F-06** JSON key / `Buffer` note (Cursor). Evidence: **`KS-981 Result.md`**, `KS-981 - Claude Result.md`, `KS-981 - Cursor Result.md`.*

---

## 13. References

| Document | Path |
| --- | --- |
| **This consolidated result** | `Dynamo Server/Test Result/KS-981 Result.md` |
| Claude (338 cols, 59 North, HIGH findings, 6-col read) | `Dynamo Server/Test Result/KS-981 - Claude Result.md` |
| Cursor (385 keys, invalid `read` message, Buffer note) | `Dynamo Server/Test Result/KS-981 - Cursor Result.md` |
| QA guide section 5.5, section 1.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Story | `Jira Ticket/dynamo_mcp_testing_stories.md` (US-E3-05) |
| **KS-978** (59 North GUID) | Cited in Claude sub-report |

---

## 14. Appendix — Claude: sample type-conformance table (6-column read)

*From `KS-981 - Claude Result.md` section 4 T1-C — all six columns conform to `describe_table` types (`uniqueidentifier`, `nvarchar`, `datetime` / null).*

| Column | `describe` type | `read` sample |
| --- | --- | --- |
| `ID` | uniqueidentifier | `C8F6985B-…` |
| `Name` | nvarchar | `36 South` |
| `Description` | nvarchar | `null` or string |
| `DateCreated` / `LastModified` | datetime | ISO 8601 UTC |
