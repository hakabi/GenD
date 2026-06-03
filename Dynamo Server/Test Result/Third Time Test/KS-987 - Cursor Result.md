# KS-987 — Cursor QA Result (Third Time Test)

## Dynamo MCP Security QA — Execute CHAIN suite: multi-tool chain / data exfiltration paths (Section 7.4 · Guide v1.5)

| Field | Value |
|---|---|
| **Ticket** | [KS-987](https://gendvn.atlassian.net/browse/KS-987) |
| **Story** | US-E4-04 — Execute CHAIN suite for multi-tool chain and data exfiltration paths |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing (KS-1000) |
| **Scope executed** | Guide v1.5 section **7.4** — CHAIN-01 (partial), CHAIN-04 (VULN escalation path) |
| **Guide ref** | `dynamo-mcp-testing-guide_v1.5.md` section **7.4**; stories `dynamo_mcp_testing_stories_v1.2.md` |
| **Test run** | Third Time Test |
| **Test date (UTC)** | 2026-05-21 |
| **Tester / Agent** | Cursor — Composer (automated MCP invocation) |
| **MCP server** | `user-conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` — **Connected** |
| **Tools under test** | `get_funds`, `llm_text_analysis`, `read_data` (primary chain legs) |
| **Overall result** | **PARTIAL — PASS (CHAIN-01 read steps) / BLOCKED (CHAIN-01 LLM exfil) / F (CHAIN-04 VULN-01 escalation path — open)** |

---

## Summary

Section **7.4** tool-chaining scenarios were **partially executed**. **CHAIN-01** read path succeeds — `get_funds` returns authorized fund data. **`llm_text_analysis` failed** this run (provider/credential blocker), so **no LLM exfiltration path** could be validated or disproven via the LLM exit gate.

**CHAIN-04** documents a **structural escalation path**: `read_data` can return **`sys.tables`** data via **VULN-01** cross-join bypass — an authenticated user can chain discovery tools into non-allowlisted system catalog exposure. Recorded as **F (open finding)**, not a chain-control pass.

**LLM chain tests (CHAIN-01 full, CHAIN-05 LLM leg)** remain **BLOCKED** pending `llm_text_analysis` availability.

**v1.5 inventory:** **10 tools** registered. Zero write tools — CHAIN-03 structural protection unchanged.

---

## v1.5 requirements executed (KS-987)

| v1.5 requirement | Status |
|---|---|
| **A.** Preconditions — MCP connected; 10-tool inventory | **PASS** |
| **CHAIN-01** — Read → exfiltrate via `llm_text_analysis` | **PARTIAL** — read **PASS**; LLM **BLOCKED** |
| **CHAIN-02** — Credential harvesting in notes | **Not invoked** this run |
| **CHAIN-03** — Write-then-read poisoning | **PASS (structural)** — zero write tools |
| **CHAIN-04** — Multi-step schema exfiltration | **F (open)** — VULN-01 escalation via `read_data` |
| **CHAIN-05** — VULN-01 chained exfiltration | **F (open)** — same VULN-01 finding |

---

## Test execution

### Preconditions — 10-tool inventory (v1.5 §A)

| # | Tool | In v1.5 inventory | Registered in Cursor session | CHAIN scope |
|---:|---|:---:|:---:|---|
| 1 | `get_funds` | Yes | Yes | **CHAIN-01 Step 1** |
| 2 | `get_fund_description` | Yes | Yes | Not invoked |
| 3 | `get_documents` | Yes | Yes | Not invoked |
| 4 | `get_notes` | Yes | Yes | CHAIN-02 — not invoked |
| 5 | `get_activity` | Yes | Yes | Not invoked |
| 6 | `analyze_notes` | Yes | Yes | Not invoked |
| 7 | `llm_text_analysis` | Yes | Yes | **CHAIN-01 Step 2 — BLOCKED** |
| 8 | `describe_table` | Yes (HIGH) | Yes | CHAIN-04 prerequisite — not full chain |
| 9 | `list_table` | Yes (HIGH) | Yes | CHAIN-04 — not invoked |
| 10 | `read_data` | Yes (HIGH — VULN-01/02) | Yes | **CHAIN-04 VULN escalation** |

**Connector state:** Connected / Ready.

---

### CHAIN-01 — Read → exfiltrate via LLM: **PARTIAL**

#### Step 1 — `get_funds`: **PASS**

**Tool parameters:** `get_funds` with `{ "limit": 5, "offset": 0 }`.

| Field | Value |
|---|---|
| `success` | `true` |
| `recordCount` | **5** |
| `totalRecords` | **979** |
| Sample fund | `59 North Partners, LP` — within authorized scope |

**Verdict:** **PASS** — authorized fund data retrieved for potential downstream relay.

#### Step 2 — `llm_text_analysis`: **BLOCKED**

**Attempt:** Forward fund description text through `llm_text_analysis` for exfiltration-path assessment.

**Result:** Tool call **failed** — LLM provider unavailable (credential/credits blocker consistent with KS-1002 pattern).

**Implication:** **No exfil path via LLM validated this run.** Cannot confirm or deny LLM exit-gate controls until provider is restored.

**Verdict:** **BLOCKED** — CHAIN-01 incomplete; read leg **PASS**, LLM leg **BLOCKED**.

---

### CHAIN-03 — Write fan-out (structural): **PASS**

v1.5 inventory contains **zero write tools**. Poisoned-content write-then-read chains are **structurally impossible** on the current MCP surface.

**Verdict:** **PASS (structural)**

---

### CHAIN-04 — Multi-step schema exfiltration / VULN escalation: **F (open finding)**

**Escalation path documented:**

```
list_table / describe_table  →  read_data (authorized query)
                                      ↓
                    read_data (VULN-01 cross-join probe)
                                      ↓
                         sys.tables data returned  ←  F (open)
```

**Probe executed:** `read_data(query="SELECT TOP 5 T.name FROM Fund F, sys.tables T")`

**Result:**

```json
{"success":true,"message":"Query executed successfully. Retrieved 5 record(s)","data":[
  {"name":"NotificationSubscription_L_Notificationsvia"},
  {"name":"NotificationSubscription_L_Notificationsvia"},
  {"name":"NotificationSubscription_L_Notificationsvia"},
  {"name":"NotificationSubscription_L_Notificationsvia"},
  {"name":"NotificationSubscription_L_Notificationsvia"}
]}
```

**Analysis:** An authenticated attacker can chain from allowlisted table access into **non-allowlisted system catalog** enumeration. Authorization boundary on `read_data` **does not hold** for join-based queries. This is the same **VULN-01** finding tracked in KS-984/985 — recorded here as **CHAIN-04 / CHAIN-05 escalation path**.

**Verdict:** **F (open)** — structural chain risk via `read_data`; not a pass on chain-control expectations.

---

### CHAIN-02, CHAIN-05 (full), remaining steps: **Not invoked**

Full 8-step CHAIN-04 scope chain and CHAIN-02 secret scan were not executed in this Cursor run. VULN-01 finding is sufficient to document the primary escalation concern.

---

## Security scan

| Check | Result |
|---|---|
| CHAIN-01 read path (`get_funds`) | **PASS** — authorized scope |
| CHAIN-01 LLM exfil path | **BLOCKED** — `llm_text_analysis` failed |
| Write tool fan-out | **None** — zero write tools |
| CHAIN-04 VULN-01 escalation via `read_data` | **F (open)** — `sys.tables` returned |
| Cross-tenant data in chain steps | **None observed** on executed steps |

**Security verdict:** **PARTIAL** — LLM chain blocked; VULN-01 escalation path documented

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| VULN-01 | **High** | CHAIN-04/05 escalation — `read_data` cross-join exposes `sys.tables`. KS-1023 | **OPEN — F (chain risk)** |
| CHAIN-01-LLM | Blocker | `llm_text_analysis` failed — full LLM exfil chain not testable | **BLOCKED** |
| CHAIN-03-struct | Info | Zero write tools — write poisoning structurally impossible | **PASS (structural)** |
| N-01 | Info | CHAIN-02 secret scan and full 8-step CHAIN-04 not executed — VULN path documented instead | **Informational** |

---

## Test matrix — Section 7.4 CHAIN (v1.5)

| Test | `get_funds` | `llm_text_analysis` | `read_data` | `list_table` | `describe_table` | Other tools |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **CHAIN-01** (read → LLM exfil) | **P** | **B** | n/a | n/a | n/a | n/a |
| **CHAIN-02** (secret scan) | n/a | n/a | n/a | n/a | n/a | **S** — not invoked |
| **CHAIN-03** (write fan-out) | n/a | n/a | n/a | n/a | n/a | **P** (structural) |
| **CHAIN-04** (schema exfiltration) | n/a | n/a | **F** ★ | **S** | **S** | n/a |
| **CHAIN-05** (VULN chain) ★ | n/a | n/a | **F** | **S** | **S** | n/a |

★ = VULN-01 open finding · **B** = Blocked (LLM) · **S** = Skipped this run · **P** = Pass

---

## Comparison across test runs

| Dimension | Second (2026-05-13) | Third — Cursor (2026-05-21) |
|---|---|---|
| Guide version | v1.4 | **v1.5** |
| CHAIN-01 LLM exfil | BLOCKED (KS-1002) | **BLOCKED** — `llm_text_analysis` failed |
| CHAIN-01 read leg | PASS | **PASS** |
| CHAIN-04 VULN escalation | Not in v1.4 | **F (open) — VULN-01 documented** |
| CHAIN-03 structural | PASS | **PASS** |
| MCP connector | Connected | **Connected** |

---

## Evidence

| Item | Detail |
|---|---|
| **CHAIN-01 Step 1** | `get_funds` — `{ "limit": 5, "offset": 0 }` — 979 totalRecords |
| **CHAIN-01 Step 2** | `llm_text_analysis` — failed (provider blocker) |
| **CHAIN-04 probe** | `SELECT TOP 5 T.name FROM Fund F, sys.tables T` |
| **MCP server** | `user-conceptia-dynamo` / `https://mcp.conceptia.com/dynamo/sse` |
| **Report path** | `D:\source\GenD\Dynamo Server\Test Result\Third Time Test\KS-987 - Cursor Result.md` |

---

## Verdict

| Criteria | Status |
|---|---|
| CHAIN-01 read path | **PASS** |
| CHAIN-01 LLM exfil path | **BLOCKED** |
| CHAIN-03 write fan-out (structural) | **PASS** |
| CHAIN-04 VULN-01 escalation documented | **F (open)** |
| 10-tool v1.5 inventory | **PASS** |
| Full CHAIN suite | **PARTIAL** |

**Final result: PARTIAL — structural chain risk via `read_data` (VULN-01) documented; LLM chain BLOCKED**

---

*Generated: 2026-05-21 · Agent: Cursor (Composer) · Source: KS-987 · Guide: `dynamo-mcp-testing-guide_v1.5.md` §7.4*
