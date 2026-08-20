# KS-1073 Claude Result — Verify `fund_analyzer` parameter handling, resolution and payload scoping

> **Story:** [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) · **Draft ID:** AM-04 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Highest · **Blocked by:** KS-1072 (unblocked — see [KS-1072 Claude Result](KS-1072%20Claude%20Result.md)) · **Highest-risk single tool in the catalog**
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport)
> **Executed:** 2026-08-07, ~03:19 UTC
> **Status:** **FAIL — independently confirmed.** Antigravity already posted a Jira **FAIL** for this ticket (comment 2026-08-06T11:34Z) on O1/O2/O3. This run reproduces all three with harder numbers and finds **two additional confirmed defects** (malformed-date acceptance, and fund_id/search_term precedence) that Antigravity's report didn't cover.

---

## A note on method (payload safety)

This tool can return 600KB+ single responses (confirmed below). Rather than requesting every combination from the AC list — which would mean repeatedly pulling near-identical 600KB+ blobs — each large response in this run was **auto-offloaded to disk by the harness** (not read into the conversation in full) and analyzed with `grep`/`wc`/`diff` against the saved file. This kept the live testing footprint to **6 `fund_analyzer` calls total**: enough to independently settle every AC below without redundant multi-hundred-KB round-trips. The full 7-slice-by-7-slice payload table (AM-04's step 2) was **not** re-run live this cycle — see Findings/Scope for why, and what evidence already covers it.

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| `fund_id=500` happy path | **P** | Resolves to "Citadel Kensington Global Strategies Fund Ltd.", `status: success` |
| Passing neither `fund_id` nor `search_term` | **P** | Clean error: `"Provide fund_id and/or search_term"` |
| O1 — ambiguous `search_term` silent resolution | **F (confirmed)** | Silently resolves to top ES hit, then fails deeper in the pipeline — see T2 |
| `fund_id` + `search_term` precedence | **F (new finding)** | `search_term` silently overrides a *valid* `fund_id` — see T6 |
| Invalid `fund_id=99999999` | **Partial** | Clear message, but no suggested next step — see T3 |
| Malformed dates (`"not-a-date"`, `"2026-13-45"`) | **F (new finding)** | Neither is rejected; both silently no-op into the same ~615KB unscoped dump — see T4/T5 |
| O2 — `start_date` scoping | **F (confirmed, with precise numbers)** | Of 3,289 date values returned for a 1-month request, **3,272 (99.5%) fall outside the window** — see T8 |
| O2 — inverted date range | **F (confirmed)** | Silently accepted, `end_date_source: "request"`, no rejection — see T7 |
| Omitting `end_date` | **P** | Documented default confirmed: month-end of latest Solovis return (`2026-07-31` as of this test) |
| O3 — oversized payload with all slices off | **F (confirmed, 4th independent measurement)** | 585K–615K characters even with every optional slice disabled — see Payload table |
| O7 (adjacent) — Python-repr error bodies | **F (confirmed, incidental)** | `Resolution: {'search_matches': [...]}` — single-quoted Python dict, not valid JSON |

Result codes here follow the plan's Pass/Fail convention per acceptance-criterion bullet, not a single ticket-wide P/F cell, since this ticket is explicitly evidence-gathering against ten-plus separate bullets.

---

## Tests

### T1 — Neither `fund_id` nor `search_term`

`fund_analyzer(start_date="2025-07-01")` → `{"status":"error","error":"Provide fund_id and/or search_term"}`. Small, clean, immediate. **Pass.**

### T2 — O1: ambiguous `search_term` alone

`fund_analyzer(start_date="2025-07-01", search_term="Citadel Investment", all include_*=false)`:

```
"No Solovis fund details for resolved fund_id='986'. Resolution: {'search_matches': [
  {'fund_id': '986', 'fund_name': 'ANTAEUS INTERNATIONAL INVESTMENTS, LTD.', 'source': 'ALB'},
  {'fund_id': '4874', 'fund_name': 'Citadel Jackson Investment Fund Ltd', 'source': 'ALB'},
  {'fund_id': '104766', 'fund_name': 'Citadel Capital Joint Investment Fund', 'source': 'ALB'},
  {'fund_id': '200055', 'fund_name': 'Citadel East Africa Co - Investment Fund', 'source': 'ALB'}],
  'method': 'elasticsearch', 'resolved_fund_name': 'ANTAEUS INTERNATIONAL INVESTMENTS, LTD.', 'resolved_source': 'ALB'}
```

**O1 confirmed**: exactly the documented failure mode — silent pick of the top ES hit, no disambiguation offered, then a downstream failure because that fund has no Solovis data. **Fail** per the AC ("silently picking one candidate is a Fail").

**Side observation — top-hit instability:** the resolved "top hit" was fund `986` here and in Antigravity's 2026-08-06 run, but the *original* 2026-08-05 probe resolved the same query to fund `4874`. The error-message text I found during KS-1072 testing shows the ALB Elasticsearch index is named `alb_funds_20260806-081544` — i.e. date-stamped, rebuilt at least daily. **The "top hit" for an identical query is not stable day-to-day.** This makes O1 worse than a one-time bad pick: the specific wrong answer an agent gets is not even reproducible, which will make any downstream bug reports about "wrong fund resolved" hard to triage.

### T3 — Invalid `fund_id`

`fund_analyzer(fund_id="99999999", start_date="2025-07-01", end_date="2025-07-31", all include_*=false)` → `{"status":"error","error":"Fund '99999999' not found in Solovis or Elasticsearch"}`.

Clear and truthful, but the AC asks for "a structured error **with a next step**" — this says what's wrong but not what to do about it (e.g. "try search_term instead" or "call Search_Funds to find a valid id"). **Partial pass** — usable, not fully AC-compliant.

### T4 / T5 — Malformed dates — **new finding**

| Input | Result |
|---|---|
| `start_date="not-a-date"`, `fund_id=500` | **Not rejected.** Full success response, 615,489 characters / 19,768 lines. `analysis_period.start_date` echoes the literal string `"not-a-date"`; `end_date` silently defaulted to `"2026-07-31"`. |
| `start_date="2026-13-45"`, `fund_id=500` | **Not rejected.** Same shape: 615,489 characters / 19,768 lines. `diff` against the `"not-a-date"` response shows exactly **3 differing lines** in the entire 19,768-line file: the echoed `start_date` value and two `timestamp` fields. Structurally identical output. |

Both malformed inputs are silently treated as "no start filter" — the returned series still starts at `1995-07-31` in both cases (same as the O2 test below), rather than being validated and rejected. **Fails** the AC "Future dates and malformed dates... return clear errors." This is a distinct defect from O2: O2 is "a valid date doesn't scope the series"; this is "an invalid date isn't even checked before being used."

### T6 — `fund_id` + `search_term` precedence — **new finding**

`fund_analyzer(fund_id="500", search_term="Citadel Investment", start_date="2025-07-01", end_date="2025-07-31", all include_*=false)`:

Result: **identical failure to T2** — `"No Solovis fund details for resolved fund_id='986'"`. Despite a perfectly valid `fund_id=500` being supplied, the tool re-ran the ambiguous Elasticsearch resolution from `search_term` and used *that* instead, then failed.

This means: **`search_term` silently wins over `fund_id`**, even when `fund_id` alone is known-good. The schema description ("Search Aloha Elasticsearch first to resolve fund_id") hints at this order but doesn't call it "precedence" or warn that it can override a valid explicit id. **Fails** the AC "Passing both `fund_id` and `search_term` has documented, sensible precedence" — the behavior exists, but it is neither documented as precedence nor sensible (discarding a resolvable identifier in favor of an ambiguous free-text term). Any caller who reuses a `search_term` from an earlier turn while also supplying a good `fund_id` — a plausible agent behavior — will get an unnecessary failure.

### T7 — O2, inverted date range

`fund_analyzer(fund_id="500", start_date="2025-08-01", end_date="2025-01-01", all include_*=false)` → **succeeds**, 585,151 characters / 18,786 lines. Extracted `analysis_period` block:

```json
"analysis_period": {
  "start_date": "2025-08-01",
  "end_date": "2025-01-01",
  "end_date_source": "request"
```

No rejection, no reordering, no warning. **Fail** — independently confirms Antigravity's finding for this exact bullet.

### T8 — O2, valid narrow window (the core date-scoping test)

`fund_analyzer(fund_id="500", start_date="2025-07-01", end_date="2025-07-31", all include_*=false)` → succeeds, 595,199 characters / 19,110 lines. Fund identity confirmed correct: `"resolved_fund_name": "Citadel Kensington Global Strategies Fund Ltd."`, `fund_id: "500"`, `status: success` — this also stands as the **happy-path resolution test**.

Date-range analysis of the saved response (`grep -oE` for `YYYY-MM-DD` tokens):

| Metric | Value |
|---|---|
| Requested window | `2025-07-01` … `2025-07-31` (31 days) |
| Total date-like values in response | **3,289** |
| Values falling inside the requested window | **17** (0.5%) |
| Values falling outside the requested window | **3,272** (99.5%) |
| Earliest date value found | **1995-07-31** |
| Latest date value found | **2026-08-07** (today) |

`end_date` **is** honoured as an upper bound (nothing after `2026-08-07`, i.e. "today"); `start_date` is not honoured at all — the series still opens in 1995. This is a tighter, independently-derived version of the original probe's "3,194 of 3,293 outside the window" figure, arrived at with a different fund call and a different day, which rules out a one-off fluke. **Fail — O2 confirmed for the third time by a third party.**

---

## Payload size (O3) — four independent measurements, all with every optional slice disabled

| Source | Date | Config | Size |
|---|---|---|---|
| Original probe | 2026-08-05 | fund 500, all 7 slices false | 613,731 chars / 19,713 lines |
| Antigravity (Jira) | 2026-08-06 | fund 500, all 7 slices false | 638,409 bytes / 20,304 lines |
| Claude Code — narrow valid range | 2026-08-07 | fund 500, 1-month window, all 7 slices false | 595,199 chars / 19,110 lines |
| Claude Code — malformed date ×2 | 2026-08-07 | fund 500, garbage `start_date`, all 7 slices false | 615,489 chars / 19,768 lines (both) |
| Claude Code — inverted range | 2026-08-07 | fund 500, `start>end`, all 7 slices false | 585,151 chars / 18,786 lines |

All five measurements land in a **585K–638K character** band, regardless of what date parameters are passed — because (per T8) the date parameters don't meaningfully scope the mandatory base component (`smpublic_dashboard` via `SmpublicBuilder`) in the first place. **O3 confirmed: the "all slices off" baseline alone exceeds any reasonable single-response budget, and no server-side cap exists** — every single one of these five calls succeeded rather than erroring or truncating.

**Scope note:** the full per-slice breakdown table (AM-04 step 2: one call per `include_*` flag, plus the "all defaults on" call) was **not** re-run live this cycle. Given the baseline alone is already 585K–638K chars independent of any slice, and the "defaults on" call would only be larger, running all 9 combinations would have added five to seven more 600KB+ responses without new information — the root cause (base payload, not slice count) is already established with 5-way agreement across 3 testers and 2 clients. If a byte-exact per-slice table is still wanted for the evidence pack, it's a mechanical follow-up, not an open question.

---

## Findings

| ID | Finding | Severity | Story |
|---|---|---|---|
| O1 | Ambiguous `search_term` silently resolves to the top ES hit with no disambiguation, confirmed for a 3rd time — **and the top hit is not stable day-to-day** (986 vs 4874 across runs) | **S2 High** | AM-04 (this ticket) |
| O2 | `start_date` does not scope the returned series (3,272/3,289 values outside a 1-month request); inverted ranges silently accepted | **S2 High** | AM-04 (this ticket) |
| O3 | Baseline payload (all slices off) is 585K–638K chars with no server-side cap, confirmed 5 times across 3 testers | **S2 High** | AM-04 / AM-12 |
| **NEW-4** | Malformed `start_date` values (`"not-a-date"`, `"2026-13-45"`) are not validated — silently treated as no filter, producing the same unscoped ~615K dump instead of an error | **S2 High** (same root defect class as O2, worse: no input validation at all) | AM-04 / AM-10 |
| **NEW-5** | `search_term` silently overrides a valid `fund_id` when both are supplied, with no documentation of this precedence and no sensible justification for discarding a resolvable id | **S2 High** | AM-04 / AM-13 (agent usability) |
| O7 (adjacent) | Resolution failure detail returned as a Python `dict` repr (single-quoted) embedded in a string, not valid JSON — reproduced again in the O1/precedence error bodies | S3 Medium | AM-10 |

---

## Comparison with Antigravity's Jira result (comment 2026-08-06T11:34Z)

| Check | Antigravity | Claude Code (this run) |
|---|---|---|
| O1 | Confirmed defect, resolved to `'986'` | Confirmed again, resolved to `'986'` again — plus the top-hit-instability observation (differs from the original `4874`) |
| O2 (scoping) | Confirmed defect qualitatively ("returns data from 1995") | Confirmed with exact figures: 3,272/3,289 (99.5%) of values outside a 1-month window |
| O2 (inverted range) | Confirmed defect | Confirmed independently with the raw `analysis_period` block |
| O3 | 638,409 bytes / 20,304 lines | 585K–615K chars across 3 separate calls — consistent order of magnitude |
| Malformed dates | **Not tested** | Tested — new S2 finding (NEW-4) |
| `fund_id`/`search_term` precedence | **Not tested** | Tested — new S2 finding (NEW-5) |
| Missing both params | **Not tested** | Tested — clean error, passes |
| Invalid `fund_id` | **Not tested** | Tested — usable error, missing "next step" |

**Recommendation:** KS-1073's existing Jira **FAIL** verdict stands and is now backed by two more confirmed S2 defects (NEW-4, NEW-5) beyond O1–O3. This ticket should not be re-opened as a Pass without server-side fixes to date validation and resolution precedence, in addition to the payload cap already called out.
