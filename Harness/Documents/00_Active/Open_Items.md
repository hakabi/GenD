# Open Items — bugs and decisions waiting on someone

**Owner:** BA · **Last updated:** 4 August 2026

> One list of everything that is blocked on a person rather than on work. If an item has been sitting for
> more than a week, chase it. When an item closes, move it to §3 with the outcome — do not delete it.
>
> Detail lives elsewhere; this file is the chase list. Decisions link into
> [`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md) §9.

---

## 1. Decisions waiting on the PO

| # | Question | Since | Blocks | Status |
|---|---|---|---|---|
| **D5** | 🔴 **What is "Phase A taxonomy"?** What does it classify, where is it documented, does it define a controlled vocabulary, and should ours sit inside it, extend it, or replace it? | 4 Aug | Publishing the vocabulary to Knowledge · presenting the whole proposal | **Not yet asked** |
| **D1** | **Gate A behaviour** — block and require a fix, auto-suggest a correction, or warn only? *Recommend auto-suggest.* | ~Jul (parked) | VALIDATE | Parked with PO |
| **D2** | **Backfill or label-forward?** Relabel all 287 cases, or label new ones only? *Recommend backfill.* | 3 Aug | BACKFILL | Not yet asked |
| **D3** | **Vocabulary ownership** — who approves a new area or sub-area: PO alone, or PO + QA Lead? | 3 Aug | VOCAB governance | Not yet asked |
| **D4** | **Add `lab` to the Environment enum?** Cosmetic — the prompt URL wins at run time — but the chat falsely says *"set to sandbox as requested"*. | 3 Aug | — | Not yet asked |
| **D6** | **Golden set** — who hand-labels 30–50 cases to measure classifier accuracy? `Harness_Golden_Case_Template.xlsx` may exist; only an orphaned lock file is in the repo. | 3 Aug | Accuracy metric | Not yet asked · BA/QA |

**When taking D1 to the PO, reframe it.** It has been discussed as *"should we tighten validation?"* — but
there is effectively **no** validation beyond "the prompt is not blank". The choice is whether to have the
check at all. And do not let it close on the readiness-counter fix: those are two separate things.

---

## 2. Bugs drafted, not yet filed

Both found 3 Aug on `qops-harness.lab.gend.vn`. Full ticket text is in the session transcript; summaries here.

### BUG-1 — "New request" opens pre-filled with a previous request
**Priority:** High · **Component:** Requests → New test request · **Epic:** QG-138 · **Status:** ⬜ Not filed

Clicking **New request** does not open an empty form — it restores the conversation, assistant reply and
parameters from an earlier request, and the content cannot be cleared. The readiness meter already reads
*Ready to propose cases* and **Review proposed cases** is enabled before anything is typed. `Request mode`,
`Test request` and `App project` show the `chat` badge, wrongly implying the values came from this conversation.

*Impact:* a user who opens New request and submits without typing generates a case for the **previous**
request — a silent duplicate against the wrong feature. No workaround.

*Note for dev:* likely stale dialog state rather than binding to the selected queue row — the content shown
belonged to an older `Upload` request while a different row was selected. Opening and closing via **Cancel**
did not reproduce it; check whether **X** / Esc / navigation skip the reset.

> ⚠️ **Re-test before filing.** Three deploys on 4 Aug (`8375e81`, `729ad15`) reworked New Request
> `app_project` binding. They may have changed this behaviour. Verify on the current build first.

### BUG-2 — Queue selection cannot be cleared
**Priority:** Low · **Component:** Requests → queue · **Status:** ⬜ Not filed

Once a request row is selected there is no way to deselect it; the detail pane always shows something.
Minor alone, but a stale selection makes it hard to tell whether the pane reflects a current action or a leftover.

### BUG-3 — Step generation fails permanently when a request asks to *report* a value
**Priority:** High · **Component:** Requests → step generation (`build_steps_task`) · **Epic:** QG-138 · **Status:** ✅ Filed as [QG-161](https://gendvn.atlassian.net/browse/QG-161)

Found 18 Aug on `qops-harness.lab.gend.vn` (request `#732e3daa`). Full ticket text:
[`BUG-3_Step_Generation_Report_Value.md`](./BUG-3_Step_Generation_Report_Value.md).

A request ending in *"Report the Weight number of Total Fad"* fails `build_steps_task` guardrail validation on
all 6 retries (`Invalid steps JSON: Extra data: line 5 column 1 (char 105)`) and produces a `BUILD_FAILED` case
with zero steps. Deleting **only** that final line makes the identical prompt build 4 correct steps — the step
schema `{title, navigate, checks[]}` has no field for returning a value.

*Impact:* any "validate X, then report Y" request is unbuildable, and the failure reads as success — the
request ends `awaiting_review`, not `failed`, with **Confirm and process** enabled on an empty case.

---

## 3. Small fixes noticed, not yet raised

| Item | Where | Status |
|---|---|---|
| **Dead condition in the readiness meter** — `if (p.session_file \|\| p.request_mode)` is always true, so the `session_file` half is unreachable and the counter over-reports. Likely the "mismatch" the PO described on 4 Aug. **Send him this** — it probably makes *correct it* cheaper than *remove it*. | `QOps_Harness/index.html` → `updateReadiness()` | ⬜ Not sent |
| **Spec slug not surfaced in Case Review** — UI shows "Direct test"; the generated spec is `risk-model-dashboard-total-risk-table-and-download-report-461dc2`. The good name already exists, it just is not displayed. | Case Review | ⬜ Not raised |
| **Failure output stops one level too high** — a failed run reports `Playwright run failed (exit 1)` without naming the failing assertion. This is QG-139's "output tracking" item, reproduced 3 Aug. | Execution → Output | ⬜ Not raised |
| **False confirmation message** — chat says *"I've set the environment to sandbox as requested"* when no such request was made. See D4. | New request chat | ⬜ Not raised |

---

## 4. Closed

*Nothing yet. When an item closes, move it here with the date and the outcome — the history is useful when
the same question comes back.*

---

## Changelog

| Date | Change |
|---|---|
| 2026-08-04 | Created. Seeded with 6 PO decisions, 2 drafted bugs, 4 small fixes |
