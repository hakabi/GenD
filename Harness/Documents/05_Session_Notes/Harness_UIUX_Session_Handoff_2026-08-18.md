# Harness UI/UX — Session Handoff

**Owner:** BA · **Session dates:** 14–18 August 2026 · **Status:** 🟡 Draft work, nothing scheduled
**Parent context:** [`Harness_Session_Handoff.md`](../Harness_Session_Handoff.md) — read that first for project-wide context
**Related:** [`Harness_Test_and_UX_Plan.md`](../01_Plans_and_Strategy/Harness_Test_and_UX_Plan.md) · [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md)

---

## 0. What this session was

A UI/UX workstream that started as *"the current UI looks boring, give us options"* and ended somewhere more useful: **a verified gap analysis of the live system**, plus draft designs for the test-case and request pages.

It ran in three arcs:

1. **Visual direction** — ten style options, narrowed to a Jira/Atlassian-aligned system, written up and published to Confluence
2. **Test case handling** — reframed after PO feedback that *requests are just prompts; the test cases are the product*
3. **Verification against reality** — explored Qase as a comparator, then the live Harness system, which changed several conclusions

**The most important outcome is not a design.** It is the finding in §4: most of what was proposed already exists in some form, and the real gap is data not reaching screens that are already built.

---

## 1. Decisions taken

| # | Decision | Taken by | When |
|---|---|---|---|
| D1 | Scope is **restyle + relayout**, not a full IA rebuild | PO/BA | 14 Aug |
| D2 | Adopt the Atlassian design system **as values in our own code** — not `@atlaskit` | BA rec., accepted | 14 Aug |
| D3 | **Light and dark specified together**, in phase 1 — not dark later | BA rec., accepted | 14 Aug |
| D4 | Case review moves to a **4th tab under Test Cases** ("Proposed"), not the Requests page | PO | 18 Aug |
| D5 | All Request-page designs pair with **test-case direction B** + Trust panel | PO | 18 Aug |
| D6 | **"Extend existing case"** is acceptable in principle (subsumption resolution) | PO | 17 Aug |
| D7 | **Direction A dropped** — overtaken by what shipped | BA rec., pending confirm | 18 Aug |
| D8 | **No live API pull** for the Phase 0 measurements | PO | 17 Aug |
| D9 | **Nothing to Jira**, and no further Confluence pages without asking | PO | 17 Aug |

---

## 2. What was produced

### 2.1 In Confluence — space **QG**, under [UI for Harness System - Jira Design](https://gendvn.atlassian.net/wiki/spaces/QG/pages/534544386)

| Page | ID | Ver | Content |
|---|---|---|---|
| 1. Decision Memo — Adopt a Shared UI System | `534675457` | v2 | The argument for a UI system, three options, cost, risks, 3 decisions requested |
| 2. Visual Comparison — Current vs Jira-Aligned | `534708226` | v3 | Requests page before/after, change table mapped to existing QG tickets |
| 3. UI Style Guide — Tokens and Components | `534740993` | v3 | Colour, type, spacing, 7 components, accessibility, migration from `tokens.css` |
| 4. Rollout Plan — Phases, Tickets and Risks | `534741018` | v2 | 4 phases, 7 proposed tickets, relationship to QG-141…152, risks, measures |
| 5. Dark Mode — Jira-Aligned Token Set | `534904834` | v1 | Dark token set, the six rules, migration from the existing dark theme |

> A sixth page, **"Harness UI style guide"** (`534642709`), was created by the PO to hold an attached HTML file. It sits unnumbered next to page 3 with a near-identical name. **Decide whether to rename it as an attachments page or fold it in.**

### 2.2 In the repository

| File | Location | What it is |
|---|---|---|
| `Harness_UI_Style_Guide_Jira_Aligned.md` / `.html` | `Harness/Harness Page/` | Style guide, two editions |
| `Harness_UI_DarkMode_Jira_Aligned.md` / `.html` | `Harness/Harness Page/` | Dark token set + light/dark side-by-side mockup |
| `Harness_TestCase_Workbench_Plan.md` | `Documents/00_Active/` | Plan for the case-review workbench: use cases, Phase 0 spec, the verbs |
| `Harness_TestCase_Workbench_Mockup.html` | `Documents/03_Mockups/` | Review workbench, 11 numbered callouts + explanation |
| `Harness_TestCase_UI_Three_Directions.html` | `Documents/03_Mockups/` | Directions A/B/C **with build status marked against the live system** |
| `Harness_Request_UI_Three_Directions.html` | `Documents/03_Mockups/` | Request directions R1/R2/R3 |
| `Harness_TestCase_Workflow_AsIs_Mockup.html` | `Documents/03_Mockups/` | **As-is workflow swimlanes**, 11 branches, 10 gaps, status vocabulary |

> ### ⚠️ Not yet in the repository
> Three documents exist **only in a temporary scratchpad** and will be lost when it is cleared. Their content is in Confluence, but the source files are not in git:
> `Harness_UI_System_Decision_Memo.md` · `Harness_UI_Current_vs_Jira_Comparison.html` · `Harness_UI_System_Rollout_Plan.md`
>
> **Action:** copy them into `Documents/00_Active/` and `Documents/03_Mockups/` if the source files are wanted.

---

## 3. The design directions, in short

### Test case page

| | Idea | Verdict after checking the live system |
|---|---|---|
| **A · Familiar** | Today's teal style, extended with a feature tree | **Drop.** Largely already shipped |
| **B · Repository** | Governed table, filters, side panel — Qase's model | **~60% already exists.** All cases is this minus the governed columns. Cheapest path |
| **C · Coverage** | Feature × category matrix; per-case **Trust panel** | Matrix blocked on classification. **Trust panel is the high-value part** and its telemetry already exists |

### Request page — all pair with B

| | Idea | Note |
|---|---|---|
| **R1 · Receipt** | A request is a *delivery* — rows lead with what it produced | Recommended shape |
| **R2 · Diagnostic** | A request is a *process* — stage bar, plain-language failure cause | Recommended for the panel |
| **R3 · Source** | A request is a *filter* — no Requests page at all | Hold. Too bold while generation is unreliable |

**Recommendation:** R1's shape with R2's failure card inside it.

---

## 4. Live system findings — 18 August 2026

Observed directly on `qops-harness.lab.gend.vn`. **This is the section that matters most.**

### 4.1 Test Cases has been rebuilt

Three sub-tabs now exist: **Failed · All cases · Executed history**.

- **Failed** is a triage console with five counters and filters on search, feature, labels and reason
- **All cases** is a real catalog table — `Case | Feature | Project | Triage | Last run` — with Configure columns, bulk select and a side panel
- **Executed history** treats runs as first-class objects with IDs, spec paths, return codes and a **View request** link

### 4.2 The features exist and are not being used

| Observation | Value |
|---|---|
| Failing cases | **87** |
| Labelled *App bug* | **0** |
| Labelled *Test script* | **1** |
| Labelled *New feature* | **0** |
| **Needs triage** | **86** |
| `Triage` column in All cases | `unlabeled` on every row |
| `FAILED STEP` in run detail | `—` (field renders, never populated) |
| AI steps / Automation / AI fallback counters | `0` |
| Telemetry | `Incomplete` |

### 4.3 Feature drift is visible in the live catalog

Clean values (`auth`, `cash-forecast`) sit beside truncated titles used as grouping keys
(`application-loads-without-redirect-loop-and-disp`, `calendar-table-is-displayed-when-clicking-the-ca`).

**This confirms the 6 Aug measurement live** — 203 distinct feature values, `category` = `default` throughout.

### 4.4 The Requests page is still the July build

Stacked chrome bands, native `<select>` dropdowns, hash IDs, identically-truncated titles. It is the only screen not modernised.

### 4.5 🔴 A request reports the opposite of the truth

Request `#3ae938b9-e89`:

- Header shows **`AWAITING_REVIEW`**, waiting **3h 38m**
- Execution tab shows **`Draft structured intents` FAILED** and **`Build test steps` FAILED**
- Raw cause printed verbatim: `Database error: (code: 1) no such table: tenants`
- Its one case, *Direct test*, is `PENDING` with no steps

**No cases were produced and no review is pending, but the UI says a person is holding it up.** A second request (`REQ-1039` equivalent) broke at the same stage minutes earlier.

### 4.6 Internal vocabulary reaching users

`Quest started` · `crew_phase_a_draft_intents` · `crew_phase_a_build` · `Child run started` · `Phase B started` — plus the raw database error above.

---

## 5. What Qase gave us

Explored `app.qase.io` and executed a real test run end to end (created run `R-1` in the DEMO project).

| Pattern | Why it matters here |
|---|---|
| **Governed property fields** — severity, priority, behavior, type, is-flaky, layer, automation status, muted | A ready-made closed vocabulary. Directly answers the classification problem |
| **Five run verdicts** — passed · failed · **blocked** · skipped · **invalid** | Harness has one word for "app broken", "environment down" and "the generated test is wrong" |
| **Actual result per step**, with attachments | This is QG-139 #6, implemented at step granularity |
| **Run as an object with an ID**, listed on the case | Gives Request → Cases → Runs traceability without breadcrumbs |
| **Field-level change history** (`Manual → Automated`) | The audit model "extend existing" needs |
| **Shared Steps** | Prevents a class of duplication rather than detecting it afterwards |

---

## 6. Open items

| # | Item | Owner | Note |
|---|---|---|---|
| O1 | **Why is triage not happening?** 86 of 87 unlabelled | QA / PO | Workflow or ownership question, not design. One conversation |
| O2 | **Populate `FAILED STEP`** | Dev | Field already renders. Highest value, no new UI. QG-139 #6 |
| O3 | **Complete run telemetry** | Dev | Unlocks the Trust panel without building direction C |
| O4 | Two draft bug tickets offered, not written: **internal jargon in user-facing steps**, **raw DB error shown to users** | BA | Awaiting go-ahead |
| O5 | Copy the three scratchpad files into the repo | BA | See §2.2 warning |
| O6 | Decide fate of Confluence page `534642709` | BA/PO | Duplicate-looking name |
| O7 | Phase 0 measurements not run — live API access declined | PO | Spec is written in the workbench plan §3 |
| O8 | Confirm D7 (drop direction A) | PO | BA recommendation only |
| O9 | Atlassian token values quoted from memory | Dev | Verify at `atlassian.design` before coding |

---

## 7. Recommended next steps

1. **O1 and O2 first.** Neither needs a new screen. If triage starts happening and failing steps get recorded, several proposed features stop being necessary.
2. **Then O3** — telemetry — which turns the Trust panel into a display job rather than a build.
3. **Then extend All cases toward direction B** — governed columns, sortable headers, saved views, plus muted and flaky as real state.
4. **Then the Requests page** — R1 shape with R2's failure card. The single highest-value rule: *derive status from what was produced, and never show `awaiting_review` on a request that generated nothing.*
5. **Hold the coverage matrix** until classification lands.

> **The one-line version for the PO:** the screens are further along than we assumed; what is missing is data reaching them, and three of the five next steps require no design work at all.

---

## 8. Working notes for whoever picks this up

- **Live Harness needs real Chrome** (Google SSO). The in-app browser lands on the sign-in page. See the `harness-live-access` note
- **Confluence pages are created via the Atlassian MCP tools.** Attachments are *not* possible through them — HTML files must be dragged in by hand
- **The mockups are static HTML** using the Jira-aligned light theme. Design C's dark version exists in this session's history if the dark theme is revisited
- **Nothing in this session has been ticketed.** Per D9, that is deliberate

---

## Changelog

| Date | Change |
|---|---|
| 2026-08-18 | Created. Covers the 14–18 Aug UI/UX workstream |
