# Harness Requests Report — 2026-07-27

> **Source:** `https://qops-harness.lab.gend.vn/requests` → "My requests" filter, Show 20
> **Submitted by:** hakhoabinh@gmail.com
> **Covers:** CX-01…CX-05 and DX-01…DX-05 (10 requests total — see [`Session_Summary_2026-07-24.md`](Session_Summary_2026-07-24.md) for the original prompts)
> **Note:** The queue was live during review — a couple of rows changed status mid-review (re-runs in progress). This report reflects state as observed at the time of review.

---

## Access note

The sandboxed preview browser could not reach `qops-harness.lab.gend.vn` (timed out), same limitation noted in the prior session. This time, the user's actual Chrome browser (with its existing Google SSO session) was used instead, and the page loaded successfully.

---

## Summary

| # | Request | Harness ID | Result |
|---|---------|-----------|--------|
| CX-01 | Overview drill-down + data integrity | `bb1314bb` | ✅ **Passed** |
| CX-02 | Sort + filter interaction | `7d40422c` | ✅ **Passed** |
| CX-03 | Cross-fund state isolation on Risk | `a9fc97a2` | ❌ **Failed** |
| CX-04 | Scenario Test recalculation + reset | `6fb7b4fd` | ❌ **Failed** |
| CX-05 | Risk History filter → open report | `0706c843` | ✅ **Passed** |
| DX-01 | Chart vs table consistency | `bfcae757` | ❌ **Failed** |
| DX-02 | Header ↔ Overview reconciliation | `d9be6f94` | ✅ **Passed** |
| DX-03 | Export Excel content validation | `c9696e73` | ⚠️ **Stuck / awaiting_review** |
| DX-04 | Full search journey | `bf5f1a1f` | ✅ **Passed** (all 6 steps) |
| DX-05 | Risk Top-Ten tables integrity | `59b26e90` | ❌ **Failed** |

**Score: 5 passed, 4 failed, 1 stuck at build time.**

---

## Detail on the 5 that didn't pass cleanly

### CX-03 — `a9fc97a2` — Test-script bug, not an app bug
Failed at the "Switch to Private Fund and verify risk update" step with:
```
ReferenceError: clickTab is not defined
```
The generated Playwright spec calls a helper function that doesn't exist.
**Triage: Test Script defect.**

### CX-04 — `6fb7b4fd` — Needs triage
Failed at Step 3, "Validate that no cell displays NaN, undefined, or blank after recalculation" (after entering -50 into Total Cash). No assertion text was captured, so it's unclear whether the app actually rendered NaN/blank or the AI check itself glitched.

Also saw a harness-side warning:
```
branch_checkout_failed: untracked working tree files would be overwritten by checkout
(test-cases/aloha/scenario-test/no-nan-undefined-cells-when-clicking-scenario-test-tab...)
```
This is a repo-hygiene issue (naming collision with a prior generated spec) for the QA Lead — separate from the test result itself.
**Triage: Needs manual review (app vs. AI-check ambiguity) + separate harness repo-hygiene note.**

### DX-01 — `bfcae757` — Test-script/harness bug
Never actually ran Playwright — died during step-building:
```
Case 1 (Direct test) failed: steps_json mapping failed:
- step 0: stepAI instructions must equal steps_json[0].instructions exactly ([]), got ['', '']
```
**Triage: Harness backlog (code-gen bug), not the app.**

### DX-03 — `c9696e73` — Harness bug (different cause than expected)
Also never reached Playwright. The build-phase guardrail failed after 6 retries:
```
Could not generate steps for case 'Direct test': Task failed guardrail validation after 6 retries.
Last error: build_steps_task step 0 ('Navigate to workbench and select Total Endowment') action is
'Navigate to https://workbench-app.lab.gend.vn'. Validation 'Click on the "Total Endowment" tab'
reads like a new action (navigate/click/switch/...), not a validation of this step's action...
```
The AI step-builder kept treating "Click on the Total Endowment tab" as a validation instead of a new instruction and couldn't self-correct.

**Note:** this is *not* the "file-reading limitation" the prior session notes speculated about (`P2-8` backlog item) — the file-read step was never reached at all; the request failed before Playwright ever ran.
**Triage: Harness backlog (step-builder guardrail bug).**

### DX-05 — `59b26e90` — Needs triage
Failed at Step 3 ("Validate Top Ten Contributors table") while the AI (Stagehand) fallback was trying to locate the "Risk Allocation by Asset Class" chart — it never found/confirmed the element and the step failed. Could be a real app issue (chart missing/mislabeled) or an AI-locator issue.
**Triage: Needs manual look — recommend reproducing by hand on Total Endowment → Risk → Output.**

---

## Passed, for completeness

- **CX-01, CX-02, CX-05, DX-02** — clean Playwright pass, artifacts saved.
- **DX-04** — all 6 sub-steps passed (navigate → search → open detail → check rating → close → search no-match), confirming the full journey was genuinely covered, not just the final assertion.

---

## Suggested next actions

| Item | Owner | Notes |
|------|-------|-------|
| File CX-03 (`clickTab` ReferenceError) as Test Script bug | QA team | Generated spec references undefined helper |
| File DX-01 (`steps_json` mapping failure) against Harness backlog | QA Lead | Build-phase bug, blocks case creation |
| File DX-03 (step-builder guardrail loop) against Harness backlog | QA Lead | Replaces/updates the old `P2-8` assumption — root cause is the guardrail retry loop, not file-reading |
| Manually reproduce CX-04 scenario recalculation | QA team | Confirm whether NaN/blank actually appears in-app |
| Manually reproduce DX-05 Risk Allocation chart lookup | QA team | Confirm whether chart element is missing/mislabeled in-app |
| Add all 10 rows to `test_case_inventory.md` | — | Pending, per original session plan |

---

*Report generated 2026-07-27 by reading the Harness Requests queue directly (API-backed) via the user's authenticated Chrome session.*
