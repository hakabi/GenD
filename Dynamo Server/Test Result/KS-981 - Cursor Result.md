# KS-981 — Test Result: Validate `list_table`, `describe_table`, `read_data` (§5.5 / §1.4)

| Field | Value |
| --- | --- |
| **Jira** | [KS-981](https://gendvn.atlassian.net/browse/KS-981) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.5** (tools **§1.4** HIGH) |
| **MCP** | `conceptia-dynamo` |
| **Tester / agent** | Cursor Agent (live tool invocation) |
| **Report date** | 2026-04-25 |

---

## 1. Executive summary

**Requirement:** Black-box chain: **list** tables → **describe** the **Fund** (funds) table → **read** the **first 10** rows. Verify **`describe_table`** column metadata **aligns** with keys/types returned by **`read_data`**. **§1.4:** these three tools are **HIGH** risk; results recorded separately here.

| Area | Result | Notes |
| --- | :---: | --- |
| **Scenario 1 — Happy path** | **PASS (with naming caveat)** | `dbo.Fund` present; `describe_table("Fund")` + `read_data` `SELECT TOP 10 *` → **10** rows, plausible fund names/IDs; **type** alignment OK on spot-check |
| **Scenario 2 — Error path** | **PASS (read_data)** / **Caveat (describe_table)** | Invalid SQL table → **clear failure** on `read_data`. Invalid **`describe_table`** name → `success: true`, **`columns: []`** (no error string) — see §5 & findings |
| **Scenario 3 — Edge (≤10 rows, wide row)** | **PASS** | `TOP 10` on **`Fund`**; ~**139K** char JSON for 10 rows (many columns) — response returned without timeout in this session |
| **Authorization / tenant** | **Assumed (OAuth scope)** | No second identity run — same model as other Dynamo MCP QA; **not** a BLOCKED test leg here |
| **No credential material** | **PASS** (spot-check) | No JWT/password strings in the sampled tool **messages** / visible payload |

**Overall:** **PASS** for functional §5.5 on this build; **F-01** documents **column-name** mapping between `describe_table` and `read_data` JSON for columns whose SQL names use **`/`**, **`(`**, **`)`**, etc.

---

## 2. §1.4 — High-risk tool checklist (ticket requirement)

| Tool | In build (this run) | Result (smoke) |
| --- | :---: | --- |
| `list_table` | Yes | **PASS** — `success: true`, large table list (see §4) |
| `describe_table` | Yes | **PASS** — `Fund` schema returned; **invalid** name: empty columns (see §5) |
| `read_data` | Yes | **PASS** — `SELECT` only; **invalid** object: explicit error (see §5) |

---

## 3. Ticket traceability

| Theme | Evidence |
| --- | --- |
| Prompt (guide §5.5) | *List tables → describe funds table → read first 10 rows* — executed as `list_table` → `describe_table("Fund")` → `read_data(SELECT TOP 10 * FROM dbo.Fund)` |
| Consistency describe ↔ read | Column **types** and **semantics** align on samples; **name** strings for some columns differ after JSON key sanitization (**F-01**) |
| Row limit | **`TOP 10`** — message: *"Retrieved **10** record(s)"* |
| Invalid input | `describe_table` + `read_data` with bogus names (§5) |
| Not in production | N/A — tools **present** in this Conceptia build |

---

## 4. Test execution — `list_table`

**Call:** `list_table` with `parameters: []` (all accessible schemas / default listing per descriptor).

| Field | Value |
| --- | --- |
| `success` | `true` |
| `message` | *List tables executed successfully* |
| **Items** | **2,171** `TableName` entries (parsed from MCP JSON output) |

**Observations:** `dbo.Fund` is **present** in the set (funds-related table — satisfies *“set including a funds-related table”*). Payload is **large** (agent capture ~**95.6 KB** one-line JSON) — same class as **KS-991** (huge `list_table` list).

**Verdict:** **PASS** for discovery and presence of **Fund**.

---

## 5. Test execution — `describe_table` + `read_data` (happy path)

**Target table:** `Fund` (MCP: `tableName: "Fund"` — resolves to `dbo.Fund`).

### 5.1 `describe_table` — `tableName: "Fund"`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `columns` | **Large** column array — each item has **`name`**, **`type`** (e.g. `ID` → `uniqueidentifier`, `Name` → `nvarchar`, `DateCreated` → `datetime`) — full count not pinned in a saved log; visually matches a **multi-hundred** column `Fund` table in Dynamo |

*No per-column **description** text in this API shape — only name + type.*

### 5.2 `read_data` — `SELECT TOP 10 * FROM dbo.Fund`

| Field | Value |
| --- | --- |
| `success` | `true` |
| `message` | *Query executed successfully. Retrieved **10** record(s)* |
| `data` | **10** objects (rows) |

**Spot-check (row shape):** First row includes **`Name`**: `"36 South"`, **`ID`**: GUID, **`DateCreated`** / **`LastModified`**: ISO datetimes — plausible CRM fund row.

**Type alignment:** e.g. `Name` is string, `ID` is GUID string, timestamps ISO — consistent with `describe_table` **types** for those columns.

**Verdict (Scenario 1):** **PASS** for count, plausibility, and type-level consistency.

**Caveat (Scenario 1 / F-01):** `describe_table` returns SQL column names with punctuation (e.g. `High(mm)`, `Depthofexperience/team`). `read_data` JSON keys for the same fields are often **sanitized** (e.g. `Highmm`, `Depthofexperienceteam`). Integrators should not rely on raw string equality for every column. **`_tmpstmp_`** in read is a **Buffer** object, not a datetime literal.

---

## 6. Test execution — Scenario 2 (invalid table)

| Step | Call | Outcome |
| --- | --- | --- |
| **A** | `describe_table` — `tableName: "KS981_InvalidTable_XYZ"` | `success: true`, **`columns: []`** (empty) |
| **B** | `read_data` — `SELECT TOP 10 * FROM dbo.KS981_InvalidTable_XYZ` | `success: false`, `error: "QUERY_EXECUTION_FAILED"`, **message** contains *`Invalid object name 'dbo.KS981_InvalidTable_XYZ'`* |

**Verdict:** **`read_data`:** **PASS** — clear, non-leaking failure; no dump of other tables.  

**`describe_table`:** **Caveat** — does **not** return an explicit error code; **empty** `columns` with **`success: true`**. Callers should treat `columns.length === 0` as *unknown/invalid* (analogous to **KS-978-F-01** / **KS-979** empty-success patterns on other tools).

---

## 7. Test execution — Scenario 3 (row cap + wide row)

| Item | Value |
| --- | --- |
| **Query** | `SELECT TOP 10 * FROM dbo.Fund` |
| **Rows returned** | **10** (Fund has many more than 10 rows in production data) |
| **Width** | **Fund** is very wide; full **10**-row response ~**136.5 KB** in agent capture (first row **385** keys) |
| **Performance** | Acceptable in this run (no client timeout) |

**Verdict:** **PASS** — only **10** rows returned; wide payload is an expected **§1.4** exposure (document for security review, not a functional defect).

---

## 8. BDD — Cursor verdict

| Scenario | Status | Notes |
| --- | :---: | --- |
| **1 — Happy path** | **PASS (caveat)** | Chain works; see **F-01** re: column name sanitization |
| **2 — Error path** | **PASS / caveat** | `read_data` **clear error**; `describe_table` **empty** success |
| **3 — Edge (many rows / wide row)** | **PASS** | `TOP 10` honored; **Fund** is wide; response size noted |

---

## 9. Findings

| ID | Severity | Description |
| --- | --- | --- |
| **KS-981-F-01** | **Low** | **`describe_table`** `name` strings may **not** match **`read_data`** JSON **keys** where SQL column names include **`/`, `(`, `)`** (e.g. `Highmm` vs `High(mm)`). **`_tmpstmp_`** (timestamp) is a **`Buffer`** in read JSON, not a datetime string. |
| **KS-981-F-02** | **Low** | **`describe_table`** on **invalid** `tableName` returns **`success: true`** with **`columns: []`** — no explicit error; consumers must use empty list as signal. |
| **KS-981-F-03** | **Info** | **`list_table`** returns a **very large** inventory (**2,171** `TableName` entries in this run) — **schema surface exposure**; expected for §1.4. |

---

## 10. Definition of Done (Cursor)

| Criterion | Status |
| --- | :---: |
| §5.5 chain: list → describe → read | ✅ |
| `Fund` in `list_table` | ✅ |
| 10 rows from `read_data` with `TOP 10` | ✅ |
| Invalid table error path (read) | ✅ |
| §1.4 high-risk row in this report (§2) | ✅ |
| Findings logged | ✅ |

---

## 11. Paste-ready Jira comment (Cursor)

*KS-981 **Cursor** (§5.5, §1.4): **`list_table`** **PASS** — **2,171** tables, includes **`dbo.Fund`**. **`describe_table`("Fund")** **PASS** — large `name`/`type` list. **`read_data`** `SELECT TOP 10 * FROM dbo.Fund` **PASS** — **10** rows; first row **385** keys. **Invalid table:** `read_data` **clear error**; `describe_table` → **`success` + empty `columns`**. **F-06 (merged):** key/name sanitization + **`_tmpstmp_` Buffer** — see merged findings. **Merged report:** `Dynamo Server/Test Result/KS-981 Result.md` (+ Claude sub-report).*

---

## 12. References

| Document | Path |
| --- | --- |
| Testing guide §5.5, §1.4 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Story / matrix | `Jira Ticket/dynamo_mcp_testing_stories.md` (US-E3-05) |
| Baseline (tool inventory) | `Dynamo Server/Test Result/KS-991 - Cursor Result.md` |
| Merged result (Claude + Cursor) | `Dynamo Server/Test Result/KS-981 Result.md` |
