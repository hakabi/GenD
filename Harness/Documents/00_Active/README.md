# 00_Active — the live desk

**Open this file first.** Everything in this folder needs attention on a cadence. Everything outside it is
reference, artifacts, or history — read on demand, not on a schedule.

Last reorganised: 4 August 2026 · Last updated: 6 August 2026

---

## Daily — about 2 minutes

**1. Open [`Harness_Release_Log.md`](./Harness_Release_Log.md) → §2 "⬜ Needs BA review".**

The *Harness Scan* scheduled task updates this file at 09:30 every morning. It transcribes new deploys into
§3 automatically, and drops anything that *might* matter into a review list at the top of §2.

For each ⬜ item, do one of three things:

| | |
|---|---|
| **Promote** | It matters → write it properly into §2 and/or the plan's §8 divergence register |
| **Delete** | Noise → remove the line |
| **Leave** | Not sure yet → it stays until you are |

The task never promotes, never deletes, and never changes a watch-list status. That is deliberate — it
sorts the raw material, you make the calls.

**2. Sanity check.** If the changelog at the bottom has no row for today *and* Teams shows deploys the log
is missing, the run failed — usually Chrome was closed or the Teams session expired.

---

## Weekly — about 15 minutes

**[`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md)** — three sections, in this order:

- **§8 Divergence register** — where Harness now differs from our proposal. Read before presenting anything to the PO; the platform keeps delivering parts of our plan
- **§6 Status** — the only place status is recorded. Update it here and nowhere else
- **§9 Open decisions** — anything unblocked this week?

**[`Open_Items.md`](./Open_Items.md)** — chase anything sitting on someone else for more than a week.

**[`../02_Reviews_and_Analysis/Harness_Feedback_Tracker.xlsx`](../02_Reviews_and_Analysis/Harness_Feedback_Tracker.xlsx)** —
⚠️ untouched since 7 July. Either QA are not using it or feedback is arriving another way. Worth settling.

---

## The four files

| File | Cadence | What it is |
|---|---|---|
| `README.md` | — | This worklist |
| [`Harness_Release_Log.md`](./Harness_Release_Log.md) | **Daily** | Deploy history + impact flags + watch list. Auto-updated 09:30 |
| [`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md) | Weekly | The classification workstream: proposal, specs, status, divergence, decisions |
| [`Harness_Case_Classification_Plan_VN.md`](./Harness_Case_Classification_Plan_VN.md) | On change | 🇻🇳 Vietnamese translation, for sharing with the team. **The English file is authoritative** — edit it first, then re-translate |
| [`Open_Items.md`](./Open_Items.md) | On change | Bugs and decisions waiting on someone |

---

## Where everything else lives

| Folder | Contains | Read it when |
|---|---|---|
| `01_Plans_and_Strategy/` | `Aloha_Test_Case_Taxonomy.md` — the vocabulary standard *(⛔ blocked on Phase A)* · `Aloha_Test_Case_Taxonomy_VN.md` — 🇻🇳 reading copy, **never publish this one to Knowledge** · `Harness_Test_and_UX_Plan.md` — the wider improvement loop **(current — v3, 6 Aug; parent of the two files above)** | Changing the vocabulary, or onboarding someone |
| `02_Reviews_and_Analysis/` | `Harness_UXUI_Review.md` — screen-by-screen review + QG-138 ticket index · `Harness_Feedback_Tracker.xlsx` | Working on a specific screen |
| `03_Mockups/` | One HTML mockup per ticket, plus the two workflow mockups | Preparing a ticket or a presentation |
| `04_QA_Reference/` | `QA_Test_Plan.md` · `test_case_inventory.md` *(⚠️ superseded — see below)* | Understanding what QA planned |
| `05_Session_Notes/` | Dated summaries and superseded proposals | Archaeology only |

**Entry point for a new session:** [`../Harness_Session_Handoff.md`](../Harness_Session_Handoff.md)

---

## The automation

**Task:** *Harness Scan* — daily 09:30, in the Scheduled section of the Claude app.
**Does:** reads the Teams *QOps Harness* channel → appends new deploys to §3 of the release log → drops
candidates into the §2 review list.
**Needs:** Chrome open, Teams session alive, folder access approved.
**Backup:** a disabled twin, `harness-release-log-sync`, exists at
`C:\Users\XPS 9520\.claude\scheduled-tasks\`. Re-enable it only if *Harness Scan* is deleted — never run both,
or every deploy gets written twice.

---

## Two known stale items

**`04_QA_Reference/test_case_inventory.md`** — last touched 2 July. Lists 19 smoke cases as "Planned" with
blank Harness IDs. The live catalog now holds **287 cases** with filters and groups. Superseded; maintaining
it in parallel is duplicate work. Reduce it to a pointer at the Cases page, or retire it with the QA Lead.

**`Harness_Feedback_Tracker.xlsx`** — see the weekly section above.

---

## The one thing blocking the most work

🔴 **What is "Phase A taxonomy"?** An existing taxonomy workstream surfaced in the 4 Aug release notes.
Until the PO answers, the vocabulary standard cannot be published to the Knowledge base and our proposal
cannot be presented as new. Four specific questions are in
[`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md) §9, decision 5.
