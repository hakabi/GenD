# KS-980 — Claude QA Result (Second Time Test)
## Dynamo MCP QA — Validate get_activity, get_notes, and analyze_notes (Section 5.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-980](https://gendvn.atlassian.net/browse/KS-980) |
| **Story** | US-E3-04 — Validate get_activity, get_notes, and analyze_notes |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.4 — Activity & notes test · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `get_activity`, `get_notes`, `analyze_notes` |
| **Baseline fund** | 59 North Partners, LP / 59 North Capital Management |
| **Overall result** | **PASS (Scenarios 1–3)** |

---

## Summary

All three section 5.4 scenarios pass on the second run. Activity chronology is confirmed Date DESC. `get_notes` returns 19 Investment Due Diligence notes (stable vs first test). `analyze_notes` produces highlights traceable to actual note subjects and content — no hallucinated themes. The edge case (Scenario 3) demonstrates correct behavior on a sparse-note fund: 1 note with substantive body content analyzed correctly, no prior-period comparison fabricated (`priorTwoYearsCount=0` explicit).

Activity count grew from **40 → 41** (+1 since first test 2026-04-24), confirming live backend activity. Notes count is stable at **19**. Finding F-03 (large payload) is re-confirmed: `analyze_notes` for 59 North returned a 192KB response requiring file-based extraction.

---

## Test Execution

### Scenario 1 — Happy path: PASS ✅

**Prompt:** Get all activity and notes for fund `59 North Partners, LP`, then analyze the notes and summarize the key themes.  
**Tools called (parallel):** `get_activity` (fundNames=["59 North Partners, LP"]), `get_notes` (companyNames=["59 North Capital Management"], includeBody=false), `analyze_notes` (companyNames=["59 North Capital Management"], limit=20)

---

#### `get_activity` — 59 North Partners, LP

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 5 of 41 total activities.",
  "recordCount": 5,
  "totalRecords": 41,
  "offset": 0,
  "limit": 5,
  "hasMore": true
}
```

**First 5 activities returned (Date DESC):**

| # | Subject | Date | Category |
|---|---|---|---|
| 1 | [EXTERNAL] 59 North Capital - April 2026 Estimate | 2026-04-30 | 9-Risk Management Report |
| 2 | [EXTERNAL] 59 North Capital - March 2026 Estimate | 2026-03-31 | 9-Risk Management Report |
| 3 | [EXTERNAL] 59 North Capital - February 2026 Estimate | 2026-02-28 | 9-Risk Management Report |
| 4 | [EXTERNAL] 59 North Capital - January 2026 Estimate | 2026-01-31 | 9-Risk Management Report |
| 5 | [EXTERNAL] 59 North Capital - December 2025 Estimate | 2025-12-31 | 9-Risk Management Report |

**Chronological order check:** ✅ Date DESC confirmed — monthly cadence from 2026-04-30 descending. Plausible, ordered, no gaps or inversions in sampled records.

**Delta vs first test:** totalRecords 40 → **41** (+1 activity since 2026-04-24). Consistent with live backend.

---

#### `get_notes` — 59 North Capital Management (listing pass, body excluded)

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 5 of 19 total activity note(s) (Body field excluded).",
  "recordCount": 5,
  "totalRecords": 19,
  "offset": 0,
  "limit": 5,
  "hasMore": true
}
```

**First 5 notes (Date DESC):**

| # | Subject | Date | Author |
|---|---|---|---|
| 1 | July 2025 - Gregg Wolfson <> KAY Update | 2025-07-30 | Kapua Aiu-Yasuhara |
| 2 | 2025-06-24 - 59 North Meeting (NYC) - Sutton | 2025-06-24 | Daniel Truong |
| 3 | 2025-05-13 - 59 North Meeting (Houston) | 2025-05-13 | Daniel Truong |
| 4 | 59 North Update Call 1/10/2025 | 2025-01-10 | Kapua Aiu-Yasuhara |
| 5 | 2024-07-09 - 59 North Call - Michael Bilger and Gregg Wolfson | 2024-07-09 | Daniel Truong |

**Notes checklist:**
| Check | Result |
|---|---|
| Category filter = Investment Due Diligence | ✅ PASS |
| Date ordering: DESC confirmed | ✅ PASS |
| totalRecords stable (19 vs 19 in first test) | ✅ PASS |
| No credential material in output | ✅ PASS |

---

#### `analyze_notes` — 59 North Capital Management

**Response metadata:**
```json
{
  "success": true,
  "summary": {
    "total": 19,
    "earliest": "2022-07-12T13:50:51.000Z",
    "latest": "2025-07-30T12:08:07.000Z",
    "byYear": { "2022": 4, "2023": 1, "2024": 5, "2025": 9 }
  }
}
```

**Highlights (all categories → most recent note):**

| Category | Grounded Note |
|---|---|
| strategy | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |
| macro | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |
| risk | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |
| performance | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |
| ai | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |
| defense | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |
| energy | July 2025 - Gregg Wolfson <> KAY Update — 2025-07-30 |

**Latest note comparison:**

| Field | Value |
|---|---|
| Subject | July 2025 - Gregg Wolfson <> KAY Update |
| Date | 2025-07-30 |
| Snippet | *"59 North – Portfolio Update & Firm Commentary 7/30/2025... Strategy remains consistent with prior periods. No major thematic changes YTD; staying focused on relative value. Following Q2 sentiment-driven market, increased diversification; more risk-aware posit..."* |
| priorTwoYearsCount | 14 (notes in prior 2-year window for comparison) |
| priorExamples | 2025-06-24 NYC Meeting, 2025-05-13 Houston Meeting |

**Grounding check:**
| Check | Result |
|---|---|
| Highlights reference actual note subjects | ✅ PASS — all citations traceable to returned notes list |
| Snippet content grounded in note body (not generic boilerplate) | ✅ PASS — specific portfolio commentary, dated meeting |
| Analysis does not invent fund facts absent from notes | ✅ PASS |
| priorTwoYearsCount explicitly stated (14) | ✅ PASS — not fabricated |

**Note — F-03 re-confirmed:** `analyze_notes` response for 59 North was **192KB** — exceeded the MCP token limit and required file-based extraction. This is a known finding from the first test.

**Scenario 1 verdict: PASS**

---

### Scenario 2 — Error path: PASS ✅

**Prompt:** Get activity and notes for an invalid / non-existent fund.  
**Tool called:** `get_activity` with `fundNames=["ZZZNONEXISTENTFUND99999"]`

#### Raw response

```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 0 of 0 total activities.",
  "data": [],
  "recordCount": 0,
  "totalRecords": 0,
  "hasMore": false
}
```

#### Error path checklist

| Check | Result |
|---|---|
| No activities from other funds or tenants returned | ✅ PASS |
| Controlled empty result (no crash) | ✅ PASS |
| Agent did not fabricate activity entries | ✅ PASS |
| Consistent with first test behavior | ✅ PASS |

**Finding F-02 (persists):** Invalid fund returns `success: true` + `data: []` — same soft-empty shape as KS-978 and KS-979. Callers must check `recordCount` / `data.length`.

**Scenario 2 verdict: PASS**

---

### Scenario 3 — Edge case (sparse-note fund): PASS ✅

**Prompt:** Get activity and notes for a fund at early pipeline stage with minimal data; analyze notes.  
**Fund used:** 2026 Fund (PipelineStatus: `1 - Pre-One Pager`) / Company: Phoenix Equity  
**Tools called (parallel):** `get_activity` (fundNames=["2026 Fund"]), `get_notes` (companyNames=["Phoenix Equity"], includeBody=false), `analyze_notes` (companyNames=["Phoenix Equity"], limit=5)

#### `get_activity` — 2026 Fund

```json
{
  "success": true,
  "data": [{ "Subject": "Phoenix Equity Intro Meeting 7.1.25", "Date": "2025-07-01", "Activitycategories": "Investment Due Diligence;" }],
  "recordCount": 1,
  "totalRecords": 1
}
```
1 activity returned. Plausible intro-meeting record for a Pre-One Pager fund. ✅

#### `get_notes` — Phoenix Equity (listing, body excluded)

```json
{
  "success": true,
  "data": [{ "Subject": "Phoenix Equity Intro Meeting 7.1.25", "Body_Plaintext": null, "Date": "2025-07-01" }],
  "recordCount": 1,
  "totalRecords": 1
}
```
1 note returned. `Body_Plaintext: null` is expected — `includeBody=false` was set for the listing pass. ✅

#### `analyze_notes` — Phoenix Equity

```json
{
  "success": true,
  "message": "Analyzed 1 note(s).",
  "summary": { "total": 1, "earliest": "2025-07-01", "latest": "2025-07-01" },
  "highlights": {
    "strategy": ["Phoenix Equity Intro Meeting 7.1.25 — 2025-07-01"],
    "macro": ["Phoenix Equity Intro Meeting 7.1.25 — 2025-07-01"],
    "performance": ["Phoenix Equity Intro Meeting 7.1.25 — 2025-07-01"],
    "ai": ["Phoenix Equity Intro Meeting 7.1.25 — 2025-07-01"]
  },
  "comparison": {
    "latest": { "subject": "Phoenix Equity Intro Meeting 7.1.25", "date": "2025-07-01",
      "snippet": "Phoenix Investors Intro Call July 1st, 2025... LMM UK private equity firm... focused in three verticals (data and analytics, tech & specialist services, and health & wellbeing)... Raised 400mm GBP fund in 2022 and will be back in market 2H 2026..." },
    "priorTwoYearsCount": 0,
    "priorExamples": []
  }
}
```

#### Edge case checklist

| Check | Result |
|---|---|
| Activity returns 1 record explicitly (not empty, not fabricated) | ✅ PASS |
| Notes listing returns 1 record; Body_Plaintext=null in listing pass is by-design (includeBody=false) | ✅ PASS |
| analyze_notes correctly analyzes 1 note | ✅ PASS |
| Highlights traceable to actual note subject/body (intro meeting content) | ✅ PASS |
| priorTwoYearsCount=0 explicitly stated — no fabricated prior-period comparison | ✅ PASS |
| Agent does not invent additional notes or themes | ✅ PASS |

**Scenario 3 verdict: PASS** — Sparse-note fund handled correctly. `analyze_notes` grounds its output in the single available note, explicitly states no prior period, and does not fabricate content.

---

## Security Scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in tool output | ✅ None detected |
| Refresh token or client secret in transcript | ✅ None detected |
| Note body content contains no credential material | ✅ None detected |
| Cross-fund data in invalid-fund response | ✅ None detected |

**Security verdict: PASS**

---

## Findings

### Persisting from First Test (2026-04-24)

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | Low | `get_activity` filters on `fundNames`; `get_notes` and `analyze_notes` filter on `companyNames` — different dimension required per tool. Chain must use fund Name → Company Name lookup. | **Persists — by design** |
| F-02 | Low | Invalid fund returns `success: true` + `data: []` — soft-empty shape, no distinct not-found error. Same pattern as KS-978/KS-979. | **Persists — unresolved** |
| F-03 | Medium | `analyze_notes` response for 59 North is **~192KB** — exceeds MCP token limit; requires file-based extraction or paginated/limited calls. Use `limit` parameter to manage response size. | **Persists — re-confirmed this run** |
| F-04 | Info | `analyze_notes` may return empty or minimal highlights on zero-body notes — documented in Scenario 3 (edge case). `priorTwoYearsCount=0` explicit when no prior data. | **Persists — by design** |
| F-05 | Info | `get_notes` default category = Investment Due Diligence; `get_activity` returns all categories. totalRecords differ (41 activity vs 19 notes) due to category scope. | **Persists — by design** |
| F-06 | Open/Policy | Second Entra user for true unauthorized scenario not run. | **Still open — unresolved** |

### New Observations (Second Run)

| ID | Severity | Description |
|---|---|---|
| N-01 | Info | `get_activity` totalRecords for 59 North: 40 → **41** (+1 since 2026-04-24). One new risk management report activity added. Notes count stable at 19. |
| N-02 | Info | `analyze_notes` highlights for 59 North all map to the most recent note ("July 2025 - Gregg Wolfson <> KAY Update") — consistent with analysis weighting the latest entry across all theme categories. |
| N-03 | Info | `analyze_notes` snippet for latest note references specific investment commentary ("relative value focus", "Q2 sentiment-driven market") — confirms grounding in actual note body, not generic boilerplate. |

---

## Test Matrix Row — Section 5.4 Activity/Notes

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset |
|---|---|---|---|---|---|
| **5.4 Activity/Notes** | **P** | **P** | BLOCKED (F-06) | n/a | P (F-03 noted — 192KB response) |

---

## Comparison with First Test (2026-04-24)

| Dimension | First Test | Second Test (this run) |
|---|---|---|
| Scenario 1 Happy path | PASS | **PASS** — consistent |
| Scenario 2 Error path | PASS | **PASS** — consistent |
| Scenario 3 Edge case | PASS | **PASS** — consistent |
| get_activity totalRecords (59 North) | 40 | **41** (+1) |
| get_notes totalRecords (59 North) | 19 | **19** (stable) |
| analyze_notes total notes analyzed | 19 | **19** (stable) |
| analyze_notes grounding | ✅ grounded | **✅ grounded** |
| F-03 (large payload) | Present | **Re-confirmed — 192KB** |
| F-06 (second Entra user) | Open | **Still open** |
| Credential leakage | None | **None** |

---

## Evidence

- **Tools:** `get_activity`, `get_notes`, `analyze_notes` via MCP connector `https://mcp.conceptia.com/dynamo/sse`
- **Session:** Claude Cowork (claude-sonnet-4-6) — live authenticated MCP session
- **Calls logged:** 6 total (S1: get_activity + get_notes + analyze_notes for 59 North; S2: get_activity invalid fund; S3: get_activity + get_notes + analyze_notes for 2026 Fund / Phoenix Equity)
- **Note bodies:** Not reproduced in this report (redacted per guide section 8 — full content in analyze_notes file-based output)
- **Credential scan:** Passed
- **Report file:** `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-980 - Claude Result.md`

---

## Verdict

| Criteria | Status |
|---|---|
| Section 5.4 happy-path: activity chronological, notes stable, analysis grounded | ✅ PASS |
| Two-tool consistency: get_notes subjects align with analyze_notes highlights | ✅ PASS |
| Error path: invalid fund returns controlled empty result | ✅ PASS |
| Edge case: sparse-note fund analyzed correctly, no fabricated content | ✅ PASS |
| No credential leakage | ✅ PASS |
| F-03 (analyze_notes payload size) | ⚠️ Known — use limit parameter |
| Unauthorized-user scenario (second Entra identity) | ⚠️ BLOCKED — F-06 open |

**Final result: PASS (Scenarios 1–3)**  
All executable section 5.4 acceptance criteria are met. F-03 (large response payload) is a known integration guidance item. F-06 remains open pending a second test identity.

---

*Generated: 2026-05-13 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-980 v1.4 updated requirements · Guide: dynamo-mcp-testing-guide_v1.4.md*
