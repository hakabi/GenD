# KS-977 — Test Result: Validate OAuth and fund list via `get_funds` (§5.1)

| Field | Value |
| --- | --- |
| **Jira** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **§5.1** |
| **MCP** | `conceptia-dynamo` |
| **Tester / agent** | Cursor Agent (live tool invocation) |
| **Report date** | 2026-04-24 |
| **Last updated** | 2026-04-25 |

---

## 1. Executive summary

**Requirement:** Prove end-to-end auth (OAuth via MCP bridge) and basic read access by listing the **first five** accessible funds with **`get_funds`**, with **repeat-call consistency** (black box; no UI comparison).

| Result | Notes |
| --- | --- |
| **PASS (Scenario 1)** | Two back-to-back `get_funds` calls (`limit: 5`, `offset: 0`) returned **`success: true`**, **5** rows each, **`totalRecords: 977`**, and **byte-identical ordering and field values** for all five funds. **No** JWT, refresh token, or password strings appeared in tool output. |
| **PASS (Scenario 2)** | With **Dynamo MCP disabled** in Cursor, a follow-up request to list five funds produced a **clear tool-layer failure** (“MCP server does not exist” / connector unavailable). The agent **did not** return a silent empty success or **invent** fund rows. |
| **BLOCKED (Scenario 3)** | No **Dynamo / Entra test identity** available with **zero** funds or **fewer than five** funds in scope; edge case **cannot be executed honestly** until such a user is provisioned. |

**Caveat vs acceptance wording (“fund ID”):** The returned objects include **`Name`**, **`AssetClassName`**, and rich metadata, but **no explicit `FundId` / GUID field** in this payload shape. For repeatability, **`Name` + `DateCreated` + `LastModified`** (and manager fields) act as a stable black-box fingerprint for the sampled rows. See **§5**.

**Optional follow-up:** Scenario 2 **expired-OAuth / 401** path not exercised separately (disconnect leg covered).

---

## 2. Ticket traceability

| Theme | Evidence |
| --- | --- |
| Prompt intent §5.1 | *“List the first 5 funds I have access to (via MCP).”* → `get_funds` with `limit: 5`. |
| Expected fields | **Name**, **AssetClassName** (and sub-asset / pipeline / manager fields) on each row. |
| Black-box validation | **Two** calls same session; first-five **names and asset classes** unchanged. |
| Security | Output inspected for credential material — **none** observed. |
| UI/UX | MCP connector **connected** (calls succeeded). OAuth popup flow is **client UI**; not screen-captured per security note. |

---

## 3. Test execution

### 3.1 Tool and parameters

| Call | Tool | Arguments |
| --- | --- | --- |
| **A** | `get_funds` | `limit: 5`, `offset: 0` |
| **B** | `get_funds` | `limit: 5`, `offset: 0` |

### 3.2 Outcome summary

| Field | Call A | Call B |
| --- | --- | --- |
| `success` | `true` | `true` |
| `recordCount` | 5 | 5 |
| `totalRecords` | 977 | 977 |
| `hasMore` | `true` | `true` |
| Payload parity (first 5) | — | **Matches A exactly** (names, asset classes, timestamps). |

### 3.3 First five funds (both calls — redacted to ticket-relevant columns)

| # | Name | AssetClassName |
| --- | --- | --- |
| 1 | 2026 Fund | Private Equity |
| 2 | 36 South | Absolute Return |
| 3 | 59 North Partners, LP | Absolute Return |
| 4 | 5AM Ventures IV, LP | Private Equity |
| 5 | 5AM Ventures V, L.P. | Private Equity |

*Full JSON retained in session logs; avoid publishing raw manager/contact fields externally per guide **§8**.*

---

## 4. BDD acceptance criteria

| Scenario | Status | Evidence / note |
| --- | :---: | --- |
| **1 — Happy path** | **PASS** | Five funds returned; **Name** + **AssetClassName** present; repeat call **consistent**. |
| **2 — Error path** | **PASS** | **Dynamo MCP turned off** in Cursor; prompt *“List the first 5 funds…”* → tool unavailable; **clear failure**, no fabricated list. *(OAuth-expiry leg optional / not run.)* |
| **3 — Edge case (0 or &lt;5 funds)** | **BLOCKED** | **No Dynamo user** provisioned for **0** or **&lt;5** funds in scope; cannot validate “actual count without inventing funds” for that fixture. |

### 4.1 Scenario 2 — detail (disconnect)

| Step | Observation |
| --- | --- |
| Precondition | `conceptia-dynamo` **disabled** / not connected in Cursor. |
| Action | User asks agent to list first five funds via MCP. |
| Expected (ticket) | Clear failure; **not** silent empty success. |
| Actual | MCP tool invocation failed at client (**server does not exist** / not available); assistant reported inability to run `get_funds` and gave reconnect guidance — **no invented fund names**. |

### 4.2 Scenario 3 — block reason

| Item | Detail |
| --- | --- |
| **Blocker** | No **test account** with **zero** or **partial (&lt;5)** fund access in Dynamo for MCP OAuth. |
| **Current tenant** | Primary tester path shows **977** funds (`totalRecords` on happy-path calls). |
| **To unblock** | Provision a **low-scope** Entra/Dynamo user, complete MCP OAuth, run `get_funds` `limit: 5`; expect `recordCount` / `totalRecords` to reflect truth with **no** padded rows. |

---

## 5. Findings

| ID | Severity | Description |
| --- | --- | --- |
| **KS-977-F-01** | **Low / doc–payload** | Ticket and §5.1 text ask for **“fund ID”**; observed `get_funds` rows **omit an explicit ID/GUID** field. **Mitigation for QA:** use **Name** (+ **DateCreated**) for black-box stability until ID is exposed or AC is revised to “identifier or equivalent.” |

---

## 6. Definition of Done (ticket checklist)

| Criterion | Status |
| --- | :---: |
| §5.1 happy path with `get_funds` | ✅ |
| Repeat call consistency | ✅ |
| No credential leakage in output | ✅ |
| BDD Scenario 1 | ✅ |
| BDD Scenario 2 (MCP disconnected) | ✅ |
| BDD Scenario 3 (0 / &lt;5 funds) | **BLOCKED** — no suitable Dynamo test user |
| Evidence saved | ✅ (this file) |

---

## 7. Paste-ready Jira comment

*KS-977 §5.1: **Scenario 1 PASS** — `get_funds` `limit: 5` ×2: `success: true`, 5/977 rows, **identical** first-five **Name** + **AssetClassName**; no tokens in output. **Scenario 2 PASS** — Dynamo MCP **disabled**: clear failure, **no** invented funds. **Scenario 3 BLOCKED** — no Dynamo user with **0** or **&lt;5** funds to test. **KS-977-F-01:** no explicit **fund ID** in payload. Evidence: `Dynamo Server/Test Result/KS-977 Result.md`.*

---

## 8. References

| Document | Path |
| --- | --- |
| Testing guide §5.1 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Story source | `Jira Ticket/dynamo_mcp_testing_stories.md` (US-E3-01) |
