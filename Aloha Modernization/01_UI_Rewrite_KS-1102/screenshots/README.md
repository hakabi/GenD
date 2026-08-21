# Production screenshots — index

**The images are not stored here.** They live in [`../../../Harness/Aloha Page/`](../../../Harness/Aloha%20Page/)
— 12 files, ~14 MB, captured **2 July 2026**.

They were left in place deliberately: `Harness/Documents/04_QA_Reference/Risk_Output_Manual_Test_Script.md`
and the Harness session handoff both reference that path. Copying 14 MB to gain a tidier tree would create
two sources of truth for the same evidence.

**This file is the index** — what each screenshot shows and which question it bears on.

---

## The images

| File | Screen | Bears on |
|---|---|---|
| `Cash Forecast Dashboard Tab.jpg` | Cash Forecast → Dashboard | Design has Dashboard · Historical Flows · Details |
| `Cash Forecast Details Tab.jpg` | Cash Forecast → Details | " |
| `Cash Forecast Historical Flows Tab.jpg` | Cash Forecast → Historical Flows | " |
| `Risk Tab.jpg` | Risk Model, base view | **G1** |
| `Risk Tab with Parameters subtab.jpg` | Risk Model → Parameters | **G1** |
| `Risk Tab with History subtab.jpg` | Risk Model → History | **G1** |
| `Risk Tab with Scenario Testing.jpg` | Risk Model → Scenario Testing | **G1 — the decisive one** |
| `Scenario Test Tab.jpg` | ⚠️ Unclear — a standalone Scenario screen, or the same view? | **G1 — resolve this** |
| `Pipeline Page.jpg` | Pipeline module | **G2** |
| `Public Page.jpg` | Public Funds | Design has Public Funds |
| `Private Page.jpg` | Private Funds | Design has Private Funds |
| `Total Endownment Page.jpg` | Total Endowment | No counterpart in the design's navigation — **possible fifth gap, not on the epic's list** |

## Two things this index surfaces

**1. `Scenario Test Tab.jpg` is unexplained.** There is both a `Risk Tab with Scenario Testing.jpg` *and*
a `Scenario Test Tab.jpg`. If they show different screens, production may have Scenario in two places,
which changes the G1 conversation again. **Open both.**

**2. Total Endowment may be a fifth gap.** A production screenshot exists, and the design's twelve
navigation destinations do not include it. KS-1102 lists only four known gaps and this is not among them.
Worth checking before the KS conversation rather than after.

## Capturing new screenshots

Aloha production is `aloha.conceptia.com` (read-only); the lab is `workbench-app.lab.gend.vn`
(**writable — treat as read-only**). Both need the user's real Chrome; the in-app browser has no session.

New captures for **this programme** go in this folder with a date prefix —
`2026-08-21_Risk_Model_Scenario_Tab.jpg` — rather than back into `Harness/Aloha Page/`, which is the
older Harness-era collection.
