# KS-977 — Final Result: Validate OAuth and fund list via `get_funds` (section 5.1)

| Field | Value |
| --- | --- |
| **Jira** | [KS-977](https://gendvn.atlassian.net/browse/KS-977) |
| **Epic** | [KS-999](https://gendvn.atlassian.net/browse/KS-999) — Dynamo MCP — **Functional E2E Validation** |
| **Guide** | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` **section 5.1** |
| **MCP** | `conceptia-dynamo` · `https://mcp.conceptia.com/dynamo/sse` |
| **Sources merged** | `KS-977 - Claude Result.md` (**Claude Cowork**) · `KS-977 - Cursor Result.md` (**Cursor Agent**) |
| **Consolidation date** | 2026-04-25 |

---

## 1. Executive summary

**Ticket:** End-to-end OAuth (Microsoft/Azure AD) through the MCP bridge; **`get_funds`** returns plausible fund data with **repeat-call consistency**; **no credential leakage** (black box — no UI comparison).

| Area | Claude Cowork | Cursor | Merged |
| --- | :---: | :---: | --- |
| Scenario 1 — Happy path (`get_funds` ×2) | ✅ PASS | ✅ PASS | **PASS** |
| Scenario 2 — Error / disconnect | ✅ PASS (pre-auth disconnected) | ✅ PASS (MCP disabled → clear tool failure) | **PASS** |
| Scenario 3 — 0 or &lt;5 funds | *Reported “not triggered” with 977 funds* | **BLOCKED** (no low-scope test user) | **BLOCKED** |
| Security scan (tokens in output) | ✅ PASS | ✅ PASS | **PASS** |

**Overall:** **PASS** for section 5.1 functional and security expectations on **Scenario 1–2**. **Scenario 3** is **BLOCKED** until a Dynamo/Entra identity with **zero** or **&lt;5** funds is provisioned; the merged program treats “not triggered” as **not** equivalent to an executed edge-case **PASS**.

---

## 2. Client coverage

| Client | Role in this package |
| --- | --- |
| **Claude Cowork** | OAuth state narrative, extended field checks, security scan matrix, full consistency table, JSON sample (59 North), session re-auth note |
| **Cursor** | Repeat-call summary, **Scenario 2** MCP-off procedure, **Scenario 3** block rationale, **fund ID vs payload** finding |

---

## 3. Test environment (combined)

| Item | Claude | Cursor |
| --- | --- | --- |
| Client | Claude Cowork Desktop (Cowork mode) | Cursor Agent |
| Auth | Microsoft OAuth via Cowork Connectors | OAuth via Cursor MCP (when connected) |
| Notable | Session expired once mid-program — re-authenticated before run | Scenario 2: connector **disabled** for negative test |
| `totalRecords` (happy path) | 977 | 977 |

---

## 4. Scenario 1 — Execution summary

### 4.1 Parameters (both clients)

`get_funds` with **`limit: 5`**, **`offset: 0`** (two consecutive calls, same session).

### 4.2 Outcome (aligned)

| Field | Call 1 / A | Call 2 / B |
| --- | --- | --- |
| `success` | `true` | `true` |
| `recordCount` | 5 | 5 |
| `totalRecords` | 977 | 977 |
| `hasMore` | `true` | `true` |
| Payload parity (first 5) | — | **Identical** (names, asset classes, pipeline, dates, managers, responsible names — Claude byte-for-byte note) |

### 4.3 First five funds — core columns

| # | Fund name | Asset class | Sub-asset (Claude) | Pipeline | Fund manager (Claude) |
| --- | --- | --- | --- | --- | --- |
| 1 | 2026 Fund | Private Equity | Buyout and Growth Equity | 1 - Pre-One Pager | Phoenix Equity |
| 2 | 36 South | Absolute Return | Relative Value | X - Exited | 36 South Capital Advisors |
| 3 | 59 North Partners, LP | Absolute Return | Equity Hedge | P - Portfolio | 59 North Capital Management |
| 4 | 5AM Ventures IV, LP | Private Equity | Venture Capital | X - Exited | 5AM Ventures |
| 5 | 5AM Ventures V, L.P. | Private Equity | Venture Capital | X - Exited | *(null — see finding)* |

*Claude: full consistency matrix vs Call 2 — see source file section 4 T2.*

### 4.4 Sample record — 59 North Partners, LP (Call 1)

Full JSON is inlined in **section 13.2** below (matches KS-991 / KS-992 baseline per Claude).

---

## 5. Scenario 2 — Error path (merged evidence)

| Source | Precondition | Result |
| --- | --- | --- |
| **Claude** | Connector **disconnected** (session expired) before re-OAuth | Not a silent empty list; re-auth → **Connected**; tools callable |
| **Cursor** | **`conceptia-dynamo`** **disabled** in Cursor | Tool error (**MCP server does not exist** / unavailable); agent **did not** fabricate five funds |

**Merged verdict:** **PASS** — clear failure or recovery path; **no** invented fund list presented as success.

---

## 6. Scenario 3 — Edge case (0 or &lt;5 funds)

| Status | Rationale |
| --- | --- |
| **BLOCKED** | No **Dynamo / Entra test user** with **0** or **&lt;5** funds in scope (Cursor). Current tester path: **977** funds. |

**To unblock:** Provision low-scope user → OAuth → `get_funds` `limit: 5` → assert `recordCount` / `totalRecords` match reality without padded rows. *(Claude source marked edge case “not triggered”; merged report uses **BLOCKED** for traceability.)*

---

## 7. Security — credential material

Scanned tool output / transcripts (per Claude checklist):

| Material | Detected |
| --- | :---: |
| Raw JWT / Bearer / refresh / password / client secret / API key | **No** |

---

## 8. Merged findings register

| ID | Topic | Severity | Source |
| --- | --- | --- | --- |
| **KS-977-F-01** | Ticket / section 5.1 ask for **“fund ID”**; **`get_funds` payload has no explicit FundId / GUID** — use **Name** + **DateCreated** (etc.) for black-box identity until schema or AC updated | Low / doc–payload | Cursor |
| **KS-977-F-02** | **5AM Ventures V** — null **`FundManagerName`** / **`FundManagerPrimaryContactName`** (source data gap, not tool defect) | Info | Claude |
| **KS-977-F-03** | OAuth **session expiry** between sessions → re-authentication required (connector behavior) | Info / by design | Claude |

*Note: Claude’s original **KS-977-F-01** (null manager) is renumbered **F-02** here to avoid collision with Cursor **F-01** (missing ID field).*

---

## 9. BDD acceptance criteria — final

| Scenario | Result | Evidence |
| --- | :---: | --- |
| **1 — Happy path** | **PASS** | section 4; two clients |
| **2 — Error path** | **PASS** | section 5 |
| **3 — Edge case** | **BLOCKED** | section 6 |

---

## 10. Definition of Done — checklist

| Criterion | Status |
| --- | :---: |
| OAuth + `get_funds` section 5.1 happy path | ✅ |
| Repeat-call consistency | ✅ |
| No credential leakage | ✅ |
| Scenario 2 disconnect / failure behavior | ✅ |
| Scenario 3 with 0 / &lt;5 funds | **BLOCKED** (fixture) |
| Findings logged | ✅ |
| Evidence — merged report + sub-reports | ✅ |

---

## 11. Paste-ready Jira comment

*KS-977 **merged** (Claude Cowork + Cursor): section 5.1 **Scenario 1 PASS** — `get_funds` `limit: 5` ×2, **977** total funds, **identical** first five; **no** tokens in output. **Scenario 2 PASS** — disconnect / MCP-off: **clear failure**, no invented funds. **Scenario 3 BLOCKED** — no test user with **0** or **&lt;5** funds. **Findings:** **F-01** missing explicit fund ID in payload vs AC wording; **F-02** null manager on fund 5 (data); **F-03** OAuth re-auth between sessions. Evidence: **`KS-977 Result.md`** + `KS-977 - Claude Result.md` + `KS-977 - Cursor Result.md`.*

---

## 12. References

| Document | Path |
| --- | --- |
| **This consolidated result** | `Dynamo Server/Test Result/KS-977 Result.md` |
| Claude (extended tables, security scan, JSON sample) | `Dynamo Server/Test Result/KS-977 - Claude Result.md` |
| Cursor (Scenario 2–3 detail, F-01 doc/payload) | `Dynamo Server/Test Result/KS-977 - Cursor Result.md` |
| QA guide section 5.1 | `Dynamo Server/Test Guide/dynamo-mcp-testing-guide.md` |
| Story | `Jira Ticket/dynamo_mcp_testing_stories.md` (US-E3-01) |

---

## 13. Appendix — Claude Cowork: Call 2 & consistency (verbatim)

*Sourced from `KS-977 - Claude Result.md` section 4 T2 and section 7.*

### 13.1 `get_funds` Call 2 — raw response summary

**Parameters:** `limit=5`, `offset=0` *(identical to Call 1)*

```
success: true
message: "Query executed successfully. Retrieved 5 of 977 total fund(s)."
recordCount: 5
totalRecords: 977
hasMore: true
```

**Consistency comparison — Call 1 vs Call 2:**

| Fund Name | Call 1 Asset Class | Call 2 Asset Class | Call 1 Pipeline | Call 2 Pipeline | Match |
| --- | --- | --- | --- | --- | --- |
| 2026 Fund | Private Equity | Private Equity | 1 - Pre-One Pager | 1 - Pre-One Pager | ✅ |
| 36 South | Absolute Return | Absolute Return | X - Exited | X - Exited | ✅ |
| 59 North Partners, LP | Absolute Return | Absolute Return | P - Portfolio | P - Portfolio | ✅ |
| 5AM Ventures IV, LP | Private Equity | Private Equity | X - Exited | X - Exited | ✅ |
| 5AM Ventures V, L.P. | Private Equity | Private Equity | X - Exited | X - Exited | ✅ |

**Result:** 100% consistent — all names, asset classes, sub-asset classes, pipeline statuses, dates, managers, and responsible persons are **byte-for-byte identical** across both calls (Claude).

**Invented fund check:** All five fund names are plausible; manager, asset class, and lifecycle data are coherent. No fabricated or contradictory entries observed. `totalRecords=977` matches across both calls and aligns with the KS-991 baseline count.

### 13.2 Fund sample — full detail (Call 1, record 3: 59 North Partners, LP)

```json
{
  "Name": "59 North Partners, LP",
  "Vintage/InceptionNew": "2019",
  "DateCreated": "2022-07-11T22:30:44.027Z",
  "LastModified": "2026-03-25T17:36:48.253Z",
  "ResponsibleName": "Kapua Aiu-Yasuhara",
  "SecondaryResponsibleName": "Daniel Truong",
  "LastActivityDate": "2026-03-31T13:04:15.000Z",
  "LastActivitySubject": "[EXTERNAL] 59 North Capital - March 2026 Estimate",
  "FundManagerName": "59 North Capital Management",
  "FundManagerPrimaryContactName": "Gregg Wolfson",
  "PipelineStatus": "P - Portfolio",
  "AssetClassName": "Absolute Return",
  "SubAssetClassName": "Equity Hedge",
  "SubAssetClass2Name": "Not Applicable",
  "SubAssetClass3Name": "Not Applicable",
  "AuditorName": null,
  "FundLiquidityTypeName": "General",
  "MostRecentFinancialStatementDate": "2025-12-31T00:00:00.000Z"
}
```

*Cross-reference: Matches data observed in KS-991 and KS-992 testing for this fund — no drift (Claude).*
