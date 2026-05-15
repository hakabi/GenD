# KS-980 — Cursor QA Result (Second Time Test)

## Dynamo MCP QA — Activity, notes, and `analyze_notes` (Section 5.4, guide v1.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
| **Epic** | Dynamo MCP — Functional E2E Validation ([KS-999](https://gendvn.atlassian.net/browse/KS-999)) |
| **Guide ref** | Section **5.4** — Activity & notes · v1.4 appendix |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Cursor — Composer |
| **MCP server** | `user-conceptia-dynamo` |
| **Tools under test** | `get_activity`, `get_notes`, `analyze_notes` |
| **Overall result** | **PASS (Scenario 1) / PASS (Scenario 2) / PASS (Scenario 3)** |

---

## Summary

Baseline fund **59 North Partners, LP** (from **`get_funds`**). **`get_activity`** uses **`fundNames: ["59 North Partners, LP"]`** (≥1 filter). **`get_notes`** has **no `fundNames`** in the MCP schema — filter used: **`companyNames: ["59 North Capital Management"]`**, **`includeBody: false`**, **`limit: 15`** (aligns with **KS-992** cross-tool “company/manager” pattern in ticket).

**Scenario 1:** Activity returned **30** rows (**41** total). **`Date`** field is **non-increasing (newest first)** — e.g. top row **`2026-04-30T09:44:46.000Z`**, then **`2026-03-31…`**. **Documented server ordering** (not oldest-first strict chronology). Two identical **`get_activity`** calls produced **matching** payloads for the first page.

**`get_notes`:** **15** of **19** Investment Due Diligence notes; **`Body_Plaintext`: `null`** when **`includeBody: false`** (explicit absence).

**`analyze_notes`:** **`success: true`**, **`message`:** `Analyzed 19 note(s).` — `summary` includes **subjects and dates** that align with **`get_notes`** / activity IDs (e.g. “July 2025 - Gregg Wolfson <> KAY Update”, “2025-06-24 - 59 North Meeting (NYC) - Sutton”). **Grounding:** themes are traceable to returned note metadata — **not** scored as generic boilerplate in this sample. **Full JSON ~187 KB** — not pasted here; stored in agent run output only; per ticket, attach full JSON outside chat for long threads.

**Scenario 2:** Invalid fund on **`get_activity`** → empty **`data`**. Bogus company on **`get_notes`** → empty **`data`**. No foreign-user note bodies.

**Scenario 3:** Notes with **`includeBody: false`** show **explicit null bodies**; analysis still runs on server-side note corpus (**19** notes) — if product intended “no bodies ⇒ no analysis,” that would be a **product** gap; observed behavior **does not invent** placeholder note rows.

---

## Test execution

### Parameters

| Tool | Parameters |
|---|---|
| `get_activity` | `fundNames: ["59 North Partners, LP"]`, `limit: 30`, `offset: 0` (×2 identical) |
| `get_notes` | `companyNames: ["59 North Capital Management"]`, `includeBody: false`, `limit: 15`, `offset: 0` |
| `analyze_notes` | `companyNames: ["59 North Capital Management"]`, `limit: 50` |
| **Error probes** | `get_activity` + `fundNames: ["ZZZ_NO_FUND_KS980"]`; `get_notes` + `companyNames: ["ZZZ_NONEXISTENT_COMPANY_KS980"]` |

### Ordering note (5.4)

| Observation | Verdict |
|---|---|
| **`Date` descending** on first page | **PASS** with **documented ordering rule** (newest activity first) |

---

## Security scan

| Check | Result |
|---|---|
| Tokens in output | **None** observed in sampled fields |
| Cross-tenant leak | **None** in invalid-filter probes |

**PII / egress:** Ticket warns full note bodies may appear when **`includeBody: true`** — this run kept **`includeBody: false`** for listing; **`analyze_notes`** response may still contain **embedded note text** on the server side — treat artifact as **confidential** if archived.

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Info | **`get_notes`** cannot filter by **fund name** in schema — used **manager `companyNames`** instead. | **Documented** per KS-992-style mapping |
| N-01 | Info | **`analyze_notes`** output **large** (~187 KB JSON) — use pagination / external log store per guide §8. | **Informational** |

---

## Test matrix — Section 5.4 Activity/Notes (this run)

| Row | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.4 Activity/Notes** | **P** | **P** | **n/a*** | **n/a*** | **n/a*** |

\*Dedicated OAuth / Wi‑Fi kill not re-run here; **Large dataset** not stress-tested to failure (sample limits only).

---

## Evidence

- **Tools:** `get_activity`, `get_notes`, `analyze_notes` on **`user-conceptia-dynamo`**.  
- **Fund / manager:** **59 North Partners, LP** / **59 North Capital Management**.

---

## Verdict

**PASS / PASS / PASS** for Scenarios 1–3 under v1.4, with **activity sort order** and **`get_notes` fund vs company filter** documented.

---

*Generated: 2026-05-13 · Source: [KS-980](https://gendvn.atlassian.net/browse/KS-980) · Path: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-980 - Cursor Result.md`*
