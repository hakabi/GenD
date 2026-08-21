# Open Questions — Aloha Modernization

**One list of everything blocked on a person rather than on work.** If a row has been sitting more than a
week, chase it. When a question closes, move it to §4 with the outcome and add the decision to
[`Decision_Log.md`](./Decision_Log.md) — **do not delete the row**.

**Owner:** BA · **Last updated:** 21 August 2026

---

## 1. Waiting on KS

| # | Question | Raised | Blocks | Status |
|---|---|---|---|---|
| **Q1** | 🔴 **Scenario Testing — relocation or removal?** The design's Risk Model has 3 tabs (Output · Parameters · History). Production appears to have 4, the extra being Scenario Testing. **But Scenario Test exists in the design** as the default tab of the *Equity Beta Model*, fully built. So: is it moving, and is the Equity Beta version the same function — or does a real gap remain in Risk? | 21 Aug | KS-1102 scope · Risk Model milestone | Not yet asked |
| **Q2** | **Pipeline module** — no counterpart anywhere in the design's navigation. Intentionally out of scope, or an omission? Production evidence: `Harness/Aloha Page/Pipeline Page.jpg` | 21 Aug | KS-1102 scope | Not yet asked |
| **Q3** | **Liquidity sidebar home** — no counterpart in the design's navigation. Out of scope or omitted? | 21 Aug | KS-1102 scope | Not yet asked |
| **Q4** | **Owned by KS filter** — no counterpart in the design's navigation. Out of scope or omitted? | 21 Aug | KS-1102 scope | Not yet asked |
| **Q5** | **Postgres go/no-go thresholds.** What measured result would make KS say *no*? Without a falsification condition the POC cannot conclude | 21 Aug | KS-1103 benchmark design | Not yet asked |

> **Q1–Q4 are the four "known gaps" listed on KS-1102 itself.** The epic asks for them to be confirmed
> with KS. Q1 has moved on from the epic's framing — see [`Gap_Analysis_Design_vs_Prod.md`](../01_UI_Rewrite_KS-1102/Gap_Analysis_Design_vs_Prod.md).
>
> **Take Q1–Q4 to KS in one conversation.** They are all "is this in scope?" and splitting them across
> four exchanges wastes the customer's time.

## 2. Waiting on PO / dev

| # | Question | Raised | Blocks | Status |
|---|---|---|---|---|
| **Q6** | **Radius scale.** The customer handoff has no radius system — observed values are ad hoc from 2px to 9px. M0 must choose one and record it | 21 Aug | KS-1105 (M0) design tokens | Not yet asked |
| **Q7** | **Heading weight.** Inter ships at 300/400/500 in the handoff. Is 500 the ceiling for headings, or is a heavier weight wanted? | 21 Aug | KS-1105 (M0) design tokens | Not yet asked |
| **Q8** | **Staging URL and domain** for the new Angular app — not yet recorded anywhere | 21 Aug | KS-1105 (M0) deploy | Not yet asked |
| **Q9** | **Airflow subset selection.** Which workflows migrate first, and who chooses? The epic says "the engineer picks a subset" without naming criteria | 21 Aug | KS-1104 scope | Not yet asked |

## 3. Waiting on QA

| # | Question | Raised | Blocks | Status |
|---|---|---|---|---|
| **Q10** | **Excel manual test inventory.** KS-1102 requires rewriting the Excel manual tests. Where do they live now, and how many are there? | 21 Aug | KS-1102 test rewrite sizing | Not yet asked |
| **Q11** | **Dual-run UI validation scope.** QA validates Airflow dual-run on "Aloha + Workbench UI" — which screens, and what counts as a match? | 21 Aug | KS-1104 validation design | Not yet asked |

## 4. Closed

*Nothing closed yet. When a question closes, move its row here with the answer and the date, and add the
decision to [`Decision_Log.md`](./Decision_Log.md).*

---

## Evidence that still needs checking

Not blocked on a person — blocked on someone looking. Anyone can clear these.

| # | Item | Where |
|---|---|---|
| **E1** | **The production side of Q1 is unverified.** The "prod has 4 tabs" claim rests on four screenshot *filenames*, not on the images or the live app. There is also a separate `Scenario Test Tab.jpg` whose relationship to the Risk tab screenshots is unknown | `Harness/Aloha Page/` |
| **E2** | Confirm Pipeline, Liquidity and Owned-by-KS against the **live** app, not only the screenshots, before taking Q2–Q4 to KS | `aloha.conceptia.com` (read-only) |
