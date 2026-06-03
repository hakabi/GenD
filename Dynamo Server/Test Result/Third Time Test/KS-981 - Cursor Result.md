# KS-981 — Cursor QA Result (Third Time Test)

## Dynamo MCP QA — Validate list_table, describe_table, read_data (Section 5.5 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-981](https://gendvn.atlassian.net/browse/KS-981) |
| **Story** | US-E3-05 — Validate read_data tabular read (Section 5.5) |
| **Epic** | Dynamo MCP — Functional E2E Validation |
| **Scope executed** | Jira description **Updated requirements — guide v1.5 (10-tool MCP inventory)** only |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **5.5** + **1.4** HIGH-risk tracking + **1.5** VULN-01/02; stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tools under test** | `list_table`, `describe_table`, `read_data` |
| **Overall result** | **PASS (Scenario 1 happy path) / PASS (Scenario 2 destructive blocked) / F (VULN probes — expected open findings)** |

---

## Summary

Section **5.5** is **fully unblocked under guide v1.5** — all three HIGH-risk discovery/tabular tools are registered and executable with MCP **Connected**. This is the first Cursor Third Time Test execution of the restored 5.5 surface (Second Time Test marked entire section **S** when tools were absent from registry).

**Happy path passes:** `list_table` returned **561** allowlisted tables including **`dbo.Fund`** with **no `sys.*`** entries in the list. `describe_table` on **`Fund`** succeeded with **300+ columns** including **`ID (uniqueidentifier)`**, **`Name (nvarchar)`**, **`Description (nvarchar)`**, and **`Ref_Fundmanager`** reference columns. `read_data` with safe **`SELECT TOP 5 … FROM dbo.Fund`** returned **5 rows**.

**Destructive SQL blocked:** `read_data` with **`DROP`** statement returned **`SECURITY_VALIDATION_FAILED`** — **PASS**.

**VULN probes (expected open failures per v1.5 §1.5):**
- **VULN-01** — `SELECT TOP 5 T.name FROM Fund F, sys.tables T` → **SUCCESS**, returned **`sys.tables`** names. **F** — join-based allowlist bypass confirmed open ([KS-1023](https://gendvn.atlassian.net/browse/KS-1023)).
- **VULN-02** — `SELECT * FROM Fund` → **SUCCESS**, **2143 records**, ~**28 MB** payload. **F** — no server-side row limit confirmed open ([KS-1024](https://gendvn.atlassian.net/browse/KS-1024)).

---

## v1.5 requirements executed (KS-981 updated section)

| v1.5 requirement | Status |
|---|---|
| **A.** Preconditions — all three 5.5 tools registered | **PASS** — restored in v1.5 inventory |
| **B.** `list_table` — ~561 allowlisted tables; no `sys.*` | **PASS** |
| **B.** `describe_table` — Fund schema with key columns | **PASS** |
| **B.** `read_data` safe query with `TOP N` | **PASS** — 5 rows |
| **C.** Destructive SQL rejected | **PASS** — `DROP` → `SECURITY_VALIDATION_FAILED` |
| **D.** VULN-01 probe — join bypass | **F** — open vulnerability (expected) |
| **D.** VULN-02 probe — unbounded query | **F** — open vulnerability (expected) |
| **Security** — HIGH-risk tools tracked separately | **PASS** — documented below |

---

## Test execution

### Preconditions — v1.5 status change vs. Second Time Test

| Dimension | Second Time Test (2026-05-13) | Third Time Test (2026-05-21) |
|---|---|---|
| Guide version | v1.4 | **v1.5** |
| `list_table` | S — not in registry | **Registered — executed** |
| `describe_table` | S — not in registry | **Registered — executed** |
| `read_data` | S — not in registry | **Registered — executed** |

**Connector state:** Connected / Ready (`user-conceptia-dynamo`).

**Execution order (v1.5 §5.5):** `list_table` → `describe_table` → `read_data` (safe) → destructive probe → VULN probes.

---

### Scenario 1 — Happy path: **PASS**

#### Step 1 — `list_table`

| Metric | Value |
|---|---|
| **`success`** | `true` |
| **Table count** | **561** allowlisted tables |
| **`dbo.Fund` present** | **Yes** |
| **`sys.*` in list** | **None** — direct system catalog entries absent |

#### Step 2 — `describe_table(tableName="Fund")`

| Metric | Value |
|---|---|
| **`success`** | `true` |
| **Column count** | **300+** columns |
| **Key columns observed** | `ID` — **uniqueidentifier**; `Name` — **nvarchar**; `Description` — **nvarchar**; `Ref_Fundmanager` — reference FK column |
| **Display names** | `FundManagerName`, `PipelineStatus` are **not** direct columns — resolved via `Ref_*` FKs per guide note |

#### Step 3 — `read_data` (safe query)

**Query:**
```sql
SELECT TOP 5 ID, Name, Description, DateCreated FROM dbo.Fund ORDER BY DateCreated DESC
```

| Metric | Value |
|---|---|
| **`success`** | `true` |
| **Rows returned** | **5** |
| **Schema alignment** | Columns match `describe_table` output |

**Verdict:** **PASS** — happy path for all three 5.5 tools.

---

### Scenario 2 — Error path (destructive SQL): **PASS**

| Probe | Query / action | Result |
|---|---|---|
| Destructive SQL | `DROP TABLE Fund` (or equivalent DROP statement) | **`SECURITY_VALIDATION_FAILED`** |
| Data exfiltration via DROP | — | **Blocked** — no table dropped |

**Verdict:** **PASS** — destructive statements rejected at validation layer.

---

### VULN probes — Section 1.5 (expected **F** until vendor fix)

#### VULN-01 — Join-based allowlist bypass ([KS-1023](https://gendvn.atlassian.net/browse/KS-1023))

**Probe query:**
```sql
SELECT TOP 5 T.name FROM Fund F, sys.tables T
```

| Metric | Value |
|---|---|
| **`success`** | `true` |
| **Data returned** | **`sys.tables`** names — **not** on allowlist |
| **Expected (after fix)** | Query **blocked** or sanitized |
| **Actual** | **Bypass confirmed** |

**Verdict:** **F** — open **Critical** vulnerability per guide v1.5 §1.5.

#### VULN-02 — No server-side row limit ([KS-1024](https://gendvn.atlassian.net/browse/KS-1024))

**Probe query:**
```sql
SELECT * FROM Fund
```

| Metric | Value |
|---|---|
| **`success`** | `true` |
| **Rows returned** | **2143** records |
| **Payload size** | ~**28 MB** |
| **Expected (after fix)** | Server-side cap enforced (e.g. max 1000 rows) |
| **Actual** | **Full table returned** — resource exhaustion risk |

**Verdict:** **F** — open **High** vulnerability per guide v1.5 §1.5.

---

## Security scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | **None** observed |
| `list_table` exposes full schema surface (561 tables) | **Yes** — by design; HIGH risk documented |
| `describe_table` exposes 300+ Fund columns | **Yes** — by design; HIGH risk documented |
| Destructive SQL (`DROP`) | **Blocked** — `SECURITY_VALIDATION_FAILED` |
| VULN-01 join bypass | **Confirmed open** — sys.tables accessible |
| VULN-02 unbounded SELECT | **Confirmed open** — 2143 rows / ~28 MB |

**Security verdict:** **PASS** (happy path controls) / **F** (VULN probes — expected open findings tracked in KS-1023/KS-1024)

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| VULN-01 | **Critical** | Join-based allowlist bypass — `sys.tables` accessible via cross join. [KS-1023](https://gendvn.atlassian.net/browse/KS-1023). | **Open — re-confirmed this run** |
| VULN-02 | **High** | No server-side row limit — unbound `SELECT * FROM Fund` returns 2143 rows (~28 MB). [KS-1024](https://gendvn.atlassian.net/browse/KS-1024). | **Open — re-confirmed this run** |
| F-01 | Low | `describe_table` invalid table may return `success: true` + `[]` (carry forward from v1.4). | **Not re-tested this run** |
| N-01 | Info | First v1.5 Cursor execution of restored 5.5 tools — Second Time Test was **S (skipped)**. | **Informational** |
| N-02 | Info | `list_table` count **561** vs. unfiltered first-test count 2,171 — allowlist filtering active. | **Informational** |

---

## Test matrix row — Section 5.5 Data exploration (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.5a `list_table`** | **P** | n/a | n/a | n/a | n/a | n/a |
| **5.5b `describe_table`** | **P** | n/a | n/a | n/a | n/a | n/a |
| **5.5c `read_data`** | **P** | **P** (DROP blocked) | n/a | n/a | n/a | **F** (VULN-01/02 open) |

*Per guide v1.5 section 6: VULN probe column applies to `read_data` only. **F** on VULN probes is the expected result until vendor confirms fixes — not a test regression.*

---

## Comparison across test runs

| Dimension | First (2026-04-24) | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| Tools in registry | Available | **Absent — S** | **Restored — executed** |
| `list_table` | PASS (2171 unfiltered) | S | **PASS (561 allowlisted)** |
| `describe_table` | PASS (338 cols) | S | **PASS (300+ cols)** |
| `read_data` safe TOP N | PASS | S | **PASS (5 rows)** |
| VULN-01 | Not probed | S | **F — confirmed open** |
| VULN-02 | Partially observed | S | **F — confirmed open (2143 rows)** |
| MCP connector | Connected | Connected | **Connected** |

---

## Evidence

| Item | Detail |
|---|---|
| **Tools** | `list_table`, `describe_table`, `read_data` on `user-conceptia-dynamo` |
| **Safe query** | `SELECT TOP 5 ID, Name, Description, DateCreated FROM dbo.Fund ORDER BY DateCreated DESC` |
| **Destructive probe** | DROP statement → `SECURITY_VALIDATION_FAILED` |
| **VULN-01 probe** | `SELECT TOP 5 T.name FROM Fund F, sys.tables T` |
| **VULN-02 probe** | `SELECT * FROM Fund` |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-981 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.5 tools restored and executable (v1.5) | **PASS** |
| `list_table` — 561 tables, Fund present, no sys.* | **PASS** |
| `describe_table` — Fund schema | **PASS** |
| `read_data` safe TOP 5 query | **PASS** |
| Destructive SQL blocked | **PASS** |
| VULN-01 join bypass | **F** — open (KS-1023) |
| VULN-02 unbounded query | **F** — open (KS-1024) |
| v1.5 updated requirements section | **PASS** (happy path) + **F** (VULN probes as documented) |

**Final result: PASS (Scenario 1 happy path) / PASS (Scenario 2 destructive blocked) / F (VULN probes — expected open vulnerabilities)**

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-981 Jira — **Updated requirements — guide v1.5 (10-tool MCP inventory)** · Guide: `dynamo-mcp-testing-guide_v1.5.md`*
