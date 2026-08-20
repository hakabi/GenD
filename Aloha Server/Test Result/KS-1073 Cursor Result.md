# KS-1073 Cursor Result — Verify fund_analyzer parameter handling and payload scoping

> **Story:** [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) · **Draft ID:** AM-04 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Client:** Cursor IDE / `user-conceptia-aloha` (native HTTP)  
> **Tester:** Bình Hà Khoa  
> **Executed:** 2026-08-07 ~03:44–04:06 UTC  
> **Status:** **FAIL**

---

## Verdict summary

Pre-cycle observations **O1, O2, O3 all confirmed**. Additional Failures: inverted dates accepted; malformed `start_date` accepted; `search_term` overrides `fund_id` when both supplied.

| Observation | Result | Detail |
|---|---|---|
| **O1** Silent ambiguous resolve | **CONFIRMED FAIL** | `"Citadel Investment"` → silently picks **986** (top ES hit), errors *No Solovis fund details…*; 4 candidates in error payload, no disambiguation list for agent to choose |
| **O2** `start_date` does not scope series | **CONFIRMED FAIL** | Requested 2025-08-01…2025-08-31; payload dates **1995-07-31 … 2026-08-07** (364 unique dates; **362 outside** window) |
| **O3** Huge payload all slices off | **CONFIRMED FAIL** | **596,839 bytes / 19,164 lines** for fund 500 with all `include_*` false — no server-side cap observed |

**Overall:** **FAIL** — flagship tool not fit for normal agent use until O1–O3 (and date validation) are fixed.

---

## Acceptance criteria matrix

### Resolution

| Criterion | Result |
|---|---|
| `fund_id=500` happy path coherent | **P*** (returns success object; payload oversized — see O3) |
| `search_term` exact name → 500 | **P** (resolves; same oversized payload) |
| Ambiguous `search_term` → correct **or** disambiguation | **F** — silent pick of 986 |
| Both `fund_id` + `search_term` sensible precedence | **F** — `search_term="Citadel Investment"` **overrides** `fund_id="500"` → still resolves 986 |
| Neither → clear error | **P** — `Provide fund_id and/or search_term` |

### Date handling (O2)

| Criterion | Result |
|---|---|
| `start_date` scopes returned series | **F** |
| `end_date` scopes returned series | Partial — `analysis_period.end_date` recorded; series still spans decades |
| Inverted range rejected | **F** — success with `start_date > end_date` in `analysis_period` |
| Malformed dates clear error | **F** — `start_date="not-a-date"` accepted; still huge success payload |
| Omitting `end_date` documented default | Not fully retested this run |

### Payload (O3)

| Criterion | Result |
|---|---|
| Size all slices off recorded | **P** (measured) — **596,839 B** |
| Enforced upper bound | **F** — none observed |
| Default usable without overflow | **F** — minimum config already ~597 KB |

### Invalid input

| Criterion | Result |
|---|---|
| `fund_id=99999999` structured error | **P** — `Fund '99999999' not found in Solovis or Elasticsearch` |
| Type coercion edge | Not fully exercised |

---

## Key tests

### T01 — O1 ambiguous resolution

| Field | Value |
|---|---|
| Input | `search_term="Citadel Investment"`, `start_date=2025-08-01`, `end_date=2026-06-30`, all `include_*=false` |
| Actual | **error**: No Solovis details for `fund_id='986'`. Resolution lists 4 ALB matches; `resolved_fund_name=ANTAEUS…`, `method=elasticsearch` |
| Note | Error embeds **Python dict repr** (O7 format). Rank #1 is **986** (was 4874 in Aug-05 probe) — defect is still silent top-hit pick |
| Result | **F** |

### T02 — O3 baseline size (`fund_id=500`, Aug 2025, all slices off)

| Field | Value |
|---|---|
| Bytes / lines | **596,839 / 19,164** |
| `analysis_period` | start `2025-08-01`, end `2025-08-31`, `end_date_source=request` |
| Dates in payload | min **1995-07-31**, max **2026-08-07**; unique 364; **362 outside** requested window |
| Log | `logs/KS-1073_baseline_slices_off.txt` |
| Result | **F** (O2+O3) |

### T03 — Exact `search_term` → 500

| Field | Value |
|---|---|
| Input | `search_term="Citadel Kensington Global Strategies"`, same dates, slices off |
| Actual | success; `fund_id="500"`; resolution via search match solovis |
| Size | **597,032 B / 19,171 lines** |
| Dates | same O2 pattern (1995→2026) |
| Log | `logs/KS-1073_exact_search_term.txt` |
| Result | Resolution **P**; payload/date **F** |

### T04 — Precedence both params

| Field | Value |
|---|---|
| Input | `fund_id="500"` **and** `search_term="Citadel Investment"` |
| Expected | Prefer explicit `fund_id=500` **or** documented rule |
| Actual | **error** resolving to **986** via search — **ignores fund_id** |
| Result | **F** |

### T05 — Neither id nor term

| Actual | `Provide fund_id and/or search_term` |
| Result | **P** |

### T06 — Invalid fund id

| Actual | `Fund '99999999' not found in Solovis or Elasticsearch` |
| Result | **P** |

### T07 — Inverted dates

| Field | Value |
|---|---|
| Input | `start_date=2025-08-01`, `end_date=2025-01-01`, `fund_id=500`, slices off |
| Actual | **success**; `analysis_period` keeps inverted range; **585,151 B** |
| Log | `logs/KS-1073_inverted_dates.txt` |
| Result | **F** |

### T08 — Malformed `start_date`

| Field | Value |
|---|---|
| Input | `start_date="not-a-date"`, `end_date=2025-08-31`, `fund_id=500` |
| Actual | **success**; `analysis_period.start_date` literally `"not-a-date"`; **596,839 B** |
| Log | `logs/KS-1073_malformed_date.txt` |
| Result | **F** |

---

## Findings (for AM-14)

| ID | Finding | Severity |
|---|---|---|
| **O1** | Silent top-hit resolve on ambiguous `search_term` (now #1 = 986) | **S2 High** |
| **O2** | `start_date` does not scope returned time series | **S2 High** |
| **O3** | ~597 KB response with all optional slices disabled; no cap | **S2 High** |
| **NEW-P1** | When both provided, `search_term` overrides `fund_id` | **S2 High** |
| **NEW-D1** | Inverted date range accepted | **S3 Medium** |
| **NEW-D2** | Malformed `start_date` accepted | **S3 Medium** |
| **O7** | Failure detail as Python `dict` repr in string | **S3 Medium** |

---

## Evidence index

| File | Purpose |
|---|---|
| `logs/KS-1073_baseline_slices_off.txt` | O2/O3 baseline |
| `logs/KS-1073_exact_search_term.txt` | Exact-name resolve |
| `logs/KS-1073_inverted_dates.txt` | Inverted range |
| `logs/KS-1073_malformed_date.txt` | Bad start_date |
| This report | `KS-1073 Cursor Result.md` |

---

## Recommendation

- Mark KS-1073 **FAIL** for Cursor.
- Do **not** treat `fund_analyzer` as agent-safe until O1–O3 and date validation are fixed.
- Feed sizes into KS-1081 (AM-12); feed O1/precedence into KS-1079 (AM-10) / AM-14.
