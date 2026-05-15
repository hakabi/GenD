# KS-989 — Cursor QA Result: Establish Accounts and MCP Black-Box Test Data Baseline

| Field | Value |
|-------|-------|
| **Ticket** | [KS-989](https://gendvn.atlassian.net/browse/KS-989) — Dynamo MCP QA — Establish accounts and MCP black-box test data baseline |
| **Epic** | Dynamo MCP — Environment, Access & Connectivity |
| **Story / user story** | Internal QA tester — Azure AD identity, 2–3 fund identifiers from MCP, saved tool-output references for consistent downstream black-box tests (no Dynamo UI baseline) |
| **Jira status (at read)** | In Progress |
| **Tester** | Cursor agent — Conceptia Dynamo MCP (`user-conceptia-dynamo`) |
| **Test date** | 2026-04-30 |
| **Guide reference** | Dynamo MCP Server — QA Testing Guide v1.3 — section 2.1–section 2.3 (accounts, test data baseline, black-box rules) |
| **MCP endpoint** | `https://mcp.conceptia.com/dynamo/sse` |
| **Overall status** | **PASS** (live MCP verification + existing workspace evidence) |

---

## 1. Traceability to ticket requirements

| Requirement (Jira) | Cursor execution |
|--------------------|------------------|
| Complete **OAuth for MCP**; **do not** use `https://dynamo.dynamosoftware.com/` to validate | **Not repeated interactively in this session.** Tool calls succeeded against **Conceptia Dynamo MCP**, indicating an **active authenticated session** in Cursor (connector/session managed outside this chat). **No** Dynamo web login used. |
| Obtain **2–3 fund names/IDs** from `get_funds` (or `search_aloha_funds`); store **JSON/text** baseline — no UI screenshots | **`get_funds`** executed (see section 3). **Three** baseline funds **reconciled** with team baseline and prior `fund-ids-2026-04-21.json`. Numeric internal IDs: **not** present in MCP row shape — **Name** is the stable key (**consistent with Jira comment / Claude result**). |
| Permissions inferred **only** from MCP returns | Observed **`success: true`** with **non-empty** fund list and **`totalRecords: 981`** — identity has broad read access at this layer. |
| Local folder `~/dynamo-mcp-tests/` and `logs/YYYY-MM-DD/` | On this workstation, **`C:\Users\XPS 9520\dynamo-mcp-tests`** exists with **`baseline/`**, **`logs/2026-04-21/`**, **`payloads/`**, **`reports/`** (see section 4). Ticket path is satisfied via Windows user profile equivalent of `~`. |

---

## 2. Test environment

| Item | Value |
|------|-------|
| OS / shell | Windows 10 (build 26200); PowerShell |
| MCP server | Conceptia Dynamo (`user-conceptia-dynamo`) |
| Transport | HTTP/SSE (per configured MCP URL above) |
| Black-box scope | **section 1.1** — judgments from MCP tool outputs only; no Dynamo Software UI |

---

## 3. Live MCP test — `get_funds`

**Invocation:** `get_funds` with `limit: 5`, `offset: 0` (no filters).

**Outcome:**

| Field | Value |
|--------|--------|
| **`success`** | `true` |
| **`message`** | Query executed successfully |
| **`recordCount`** | 5 |
| **`totalRecords`** | **981** |
| **`hasMore`** | `true` |

**Interpretation:** At least one fund returned (**981** total visible to this identity). **OAuth / authorization** for tool execution is **effective** for this run (**Scenario 1 — happy path** prerequisite met).

**Baseline fund sample (cross-check vs Jira / prior baseline):**

| Role | Fund name (MCP `Name` today) | Notes |
|------|------------------------------|--------|
| **PRIMARY** | 59 North Partners, LP | Vintage **2019** returned in **`Vintage/InceptionNew`** field (baseline JSON used combined display string **"… (Vintage 2019)"** — same entity, **display evolution only**) |
| **SECONDARY** | 2026 Fund | Still present in first page; pipeline **1 - Pre-One Pager** |
| **EDGE** | 5AM Ventures IV, LP | Exited pipeline; usable as edge fixture |

**Count drift vs 2026-04-21 baseline file:** `fund-ids-2026-04-21.json` records **`total_funds": 977`**. This run shows **`981`** — **+4 funds** since that capture (operational data growth; **not** a test failure).

**Redaction (section 8):** Full row payloads are **not** pasted here. Sample fields above are the minimum needed for traceability.

---

## 4. Workspace / folder evidence

**Ticket-specified tree (effective path on this machine):**

```
C:\Users\XPS 9520\dynamo-mcp-tests\
├── baseline\
│   ├── fund-ids-2026-04-21.json
│   ├── runbook-2026-04-21.md
│   └── runbook-stub-2026-04-21.md
├── logs\
│   └── 2026-04-21\
│       └── E1_automated_evidence_2026-04-21T144256Z.json
├── payloads\
├── reports\
│   └── E1_test_report_2026-04-21.md
```

**Repo mirror for narratives / suite results:**

`D:\source\GenD\Dynamo Server\Test Result\` — contains per-ticket **Claude** and **Cursor** markdown results (including this file).

---

## 5. BDD scenarios (ticket)

### Scenario 1 — Happy path

- **Given** an identity approved for Conceptia MCP testing  
- **When** MCP `get_funds` runs after an authenticated session  
- **Then** **≥ 1** fund is returned and names can be recorded for baseline  

**Result: PASS** — **`totalRecords: 981`**, sample names aligned with established PRIMARY / SECONDARY / EDGE fixtures.

### Scenario 2 — Error path (OAuth failure / 401)

- **Given** OAuth fails or tools return **401**  
- **When** the tester proceeds  
- **Then** work is blocked without using Dynamo web login to diagnose  

**Result: N/A for this run** — **no** **401** observed; session was already valid. Prior Jira history documents the **blocked-then-fixed** path from 2026-04-21 CLI run.

### Scenario 3 — Edge case (zero funds)

- **Given** zero funds for the identity  
- **When** documented  
- **Then** use **skipped** or team placeholders  

**Result: N/A** — non-zero fund count confirmed (**981**).

---

## 6. Test case matrix (E1-01-T1 … T4)

| Test ID | Description | Result |
|---------|-------------|--------|
| **E1-01-T1** | Folder structure `~/dynamo-mcp-tests/` with **logs**, **baseline**, **payloads**, **reports** | **PASS** — verified on disk (**section 4**) |
| **E1-01-T2** | Runbook / baseline reference | **PASS** — `baseline/runbook-2026-04-21.md` + **Testing Guide v1.3** referenced in Jira |
| **E1-01-T3** | Azure AD OAuth completes; **≥ 1** fund via MCP | **PASS** (this session: **implicit** active MCP auth + **`get_funds` success**) |
| **E1-01-T4** | **2–3** fund names from MCP; JSON baseline | **PASS** — live MCP confirms three named fixtures; **`fund-ids-2026-04-21.json`** remains on-disk baseline (counts refreshed: **981**) |

---

## 7. Definition of Done — status

| Criterion | Status |
|-----------|--------|
| Authorized identity via OAuth | **Met** (MCP tool success; **no** interactive OAuth step re-executed in Cursor this day) |
| **≥ 2** fund names from MCP | **Met** — **3**-fund baseline reaffirmed |
| Tool outputs as black-box baseline (no UI screenshots) | **Met** — baseline JSON on disk + this report |
| Workspace folder structure | **Met** — **section 4** |
| Permissions from MCP returns only | **Met** |
| No credential material in outputs | **Met** |

**Overall: PASS**

---

## 8. Gaps / notes for auditors

1. **Fresh OAuth UI drill** was **not** repeated in this Cursor session; evidence is **operational MCP success** plus **existing** 2026-04-21 OAuth completion in Jira comments. If policy requires **same-day** interactive OAuth proof from Cursor, call that out as a **separate** explicit test step.  
2. **New evidence JSON under** `logs/2026-04-30/` **was not written** in this pass — only this **`KS-989 - Cursor Result.md`** under the repo **Test Result** path (per your save instruction). Say the word if you want a **`get_funds`** snapshot file added under **`dynamo-mcp-tests/logs/2026-04-30/`**.

---

*Report generated: 2026-04-30*  
*Sources: Jira **KS-989** via Atlassian MCP (`jira_get_issue`); live **`get_funds`** via **`user-conceptia-dynamo`**; directory listing of **`C:\Users\XPS 9520\dynamo-mcp-tests`***  
