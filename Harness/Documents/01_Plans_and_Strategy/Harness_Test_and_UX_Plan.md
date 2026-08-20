# Harness — Feedback-Driven Improvement Plan (BA)

**Owner:** Business Analyst (BA)
**Version:** 3.1 · **Created:** 6 July 2026 · **Updated:** 6 August 2026
**Related work:** Epic [QG-138 — Harness Automation Test](https://gendvn.atlassian.net/browse/QG-138) · seed story [QG-139 — Harness UX Feedback](https://gendvn.atlassian.net/browse/QG-139)
**Status:** Living document — the **wider improvement loop**. The deep initiative it spawned lives in its own file.

---

> **What this document is.** The repeatable loop the BA runs around Harness: *understand the tool → collect QA feedback → analyse and prioritise → propose dev tickets*. The method below is unchanged since v2; what has changed is the **state of the system underneath it**, and that is what v3 updates.
>
> **Two things have since grown their own homes — check them before acting on anything here:**
>
> | Spun-out artifact | Where | Why it left this file |
> |---|---|---|
> | **Classification workstream** | [`00_Active/Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md) | The largest Phase 2 output so far — a closed vocabulary + classification at ingest. Big enough to need a single dedicated document (proposal, specs, status, **divergence register**, decisions) |
> | **Release log** | [`00_Active/Harness_Release_Log.md`](../00_Active/Harness_Release_Log.md) | Harness now ships **several times a day**. Phase 1 intake has a second stream besides QA feedback: what the platform changes underneath us |
>
> **Read [`Harness_Session_Handoff.md`](../Harness_Session_Handoff.md) first for full project context.** This plan is the *method*; that file is the *current state* verified end-to-end on 3–4 Aug.

---

## 0. Scope of this plan (read first)

**We do not create or run test cases for Harness. The QA team owns that.** They use Harness to author and run test cases against Aloha.

Our job (the BA working with Claude, here) is the **improvement loop around Harness**:

> Understand how Harness works → collect QA's feedback while they use it → analyze and prioritize that feedback → propose concrete feature and UX improvements → hand them to the Harness dev team as tickets.

QG-139 is the seed of this work: the first batch of feedback, already captured. This plan turns that one-off into a repeatable process. **The loop has run for a month now** — QG-139 expanded into the QG-141…QG-152 story/bug family, and the classification initiative grew out of it.

Guiding principle stays the same: **Functionality First, UX/UI Second.** Feedback that points to broken or untrustworthy behavior outranks feedback about polish.

**Who does what:**

| Activity | Owner |
|---|---|
| Author & run Harness test cases against Aloha | **QA team** |
| Report pain, gaps, and ideas while using Harness | QA team → to us |
| Understand Harness features and states | **Us (BA + Claude)** — Claude drives the live page via the browser tool |
| Collect, structure, cluster, prioritize feedback | **Us (BA + Claude)** |
| Track what the platform ships underneath us | **Us (BA + Claude)** — fed by the Release Log |
| Propose feature/UX improvements as dev tickets | **Us** |
| Build the improvements | Harness dev team (internal) |
| Confirm correct Aloha financial values when needed | Product Owner (oracle) |

---

## 1. Context in one page

**Aloha** is the product QA tests: an investment-fund platform where investors evaluate public and private funds (metrics: NAV, Beta, Risk, MTD, QTD, FYTD, Cash Forecast, Rating) and decide whether to invest. Areas: Public / Private / Pipeline / Total Endowment / Cash Forecast / Risk / Scenario Test. Correctness is high-stakes.

**Harness (QOps Harness)** is the internally built, LLM + Playwright tool QA uses to generate and run those test cases. The long-term goal is fully automated LLM-driven testing. As of early August it is **maturing quickly** — it ships several times a day, and its catalog already holds **287 cases**.

**Our angle:** we're not judging Aloha and we're not judging QA's test cases. We're improving **Harness the tool** so QA can test faster and trust results more. The best signal for what to improve is QA's lived experience (QG-139) *plus* what the platform is quietly changing under us (the Release Log).

**Maturity read — QG-139 signal (Jul) vs. verified state (6 Aug):**

| Dimension | Signal in QG-139 (Jul) | State on 6 Aug |
|---|---|---|
| **Filtering / search** | No prompt search, tags, or assignee filter — *Missing* | ✅ **Facet filters delivered** — `CaseFilterBar`: Search · Feature · Labels · Status · Reason, Feature/Labels as multi-selects (verified 4 Aug). Assignee filter still open |
| **Grouping** | *(not raised in QG-139)* | ✅ **Test groups shipped** (Spec 041) — CRUD, nesting, cron, webhooks, manual runs, status/history, per-case Groups tab. **Membership is a static list** — query membership is the open ask (`GROUPS`) |
| **Traceability** | Hard to map case → request — *Weak* | ↗ Improving — `case_id` is now the **unique catalog identity** (repair CLI shipped); each case has a Groups tab. Request → Cases → Runs breadcrumbs still a story (QG-147 / QG-149) |
| **Result visibility** | Only Pass/Fail, no actual output — *Weak* | ⚠ Still weak — the good spec name exists but the UI shows **"Direct test"**; a failed run reports `Playwright run failed (exit 1)` without naming the failing assertion |
| **Reporting / export** | No activity-log export — *Missing* | ⬜ Still open (QG-139). New signal: last Playwright run **duration** is now persisted and displayed |
| **Control** | Stopping condition unclear — *Rough* | ⬜ Still rough (QG-139). Queue/notification area shipped (QG-152) — but with a **readiness-counter bug** (root cause found; see the classification plan §10) |
| **UX polish** | Jarring refresh — *Rough* | ↗ Notification/queue area landed (QG-152); the refresh-feel fix is not separately confirmed |

Read: Harness has moved from *"works on the happy path but hard to trace, verify, and scale"* to ***"filterable and groupable, but still hard to verify a Pass — and its grouping labels have collapsed."*** The label collapse is now its own initiative (§6a).

---

## 2. The plan at a glance

Three short, overlapping phases. All three are now **running**, not pending.

| Phase | Question it answers | Primary tool | Output | State (6 Aug) |
|---|---|---|---|---|
| **Phase 0 — Feature Discovery** | What does Harness actually do? | Claude in Chrome on the live page | A Feature Map (screen/feature inventory) | ✅ **Substantially complete** — walked end-to-end 3 Aug |
| **Phase 1 — Feedback Intake & Analysis** | What do QA struggle with, and what is the platform changing? | Feedback tracker + interviews **+ Release Log** | Clustered, prioritized backlog | 🔄 Ongoing — now **two intake streams** |
| **Phase 2 — Feature & UX Recommendations** | What should we change, and how? | Recommendation template + QG-139 | Dev-ready improvement tickets | 🔄 Active — QG-141…152 filed; classification workstream is the largest output |

Phase 0 gave us the map so we can interpret feedback intelligently. Phase 1 is the ongoing intake engine. Phase 2 is our deliverable to the dev team.

---

## 3. Phase 0 — Feature Discovery *(substantially complete)*

We had no spec, so we mapped Harness ourselves before proposing changes. **This is now done:** the tool was walked end-to-end on 3 August by creating and running request `#c1017339-45b`, and verified again on 4 August. The map is no longer a thing to *produce* — it is a thing to *maintain* as the platform ships.

**What the Feature Map now consists of:**

| Artifact | Holds |
|---|---|
| [`Harness_Session_Handoff.md`](../Harness_Session_Handoff.md) §3 | The verified request lifecycle, case structure, and the real New Request field list |
| [`Harness_UXUI_Review.md`](../02_Reviews_and_Analysis/Harness_UXUI_Review.md) | Screen-by-screen review + Function↔UI map + ticket index (primary reference) |
| [`Harness_TestCaseFactory_Workflow_Mockup.html`](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html) | The classification workflow drawn out, verified against the live system |

**Verified facts worth keeping in front of you** (from the walk):

- **Request lifecycle:** `create → crew_phase_a_build → AWAITING_REVIEW → (human Confirm) → render_nlonly_spec → crew_phase_b_migrate → validate_pre_run_spec → execute_run_playwright_spec → finalize_artifacts`. Every milestone carries an **AI** badge — no `Auto` steps.
- **`Feature` is load-bearing twice** — it is simultaneously a **directory on disk** *and* a grep-able **Playwright tag**. This is why its drift is permanent, not cosmetic (§6a).
- **Sidebar / IA:** Requests · Test cases (Failed / All cases / Executed history) · Test groups (Current status / Groups / History) · Knowledge · Dashboard · Settings.

> **Maintenance, not rediscovery.** Because Harness ships several times a day, the map goes stale on its own. That is what the **Release Log** is for (§4.1) — it turns "keep the map current" into a daily two-minute triage instead of a periodic re-walk.

---

## 4. Phase 1 — Feedback Intake & Analysis (our engine)

The ongoing heart of the scope: systematically turn *what QA experience* **and** *what the platform ships* into structured, prioritized input.

### 4.1 How input reaches us — now two streams

**Stream 1 — QA feedback (as before).** Give QA one low-friction way to report, and we do the structuring — don't ask busy testers to fill long forms. Channels: a running feedback log (`Harness_Feedback_Tracker.xlsx`), a Jira label QA can tag on issues, and short shadowing sessions. Claude in Chrome can shadow a live QA session and capture the exact screens/steps behind a complaint.

> ⚠ **The tracker is dormant** — untouched since 7 Jul. Confirm with the QA Lead whether QA still use it; if not, the intake channel needs rethinking (§9).

**Stream 2 — Platform change (new since v2).** Harness ships several times a day, and QA test against a moving target. The **Release Log** captures every deploy from the QOps Harness channel and flags which commits may touch our workstream. This is a genuine addition to the loop: a "delivery" underneath us can quietly **close** one of our recommendations (FILTERS), **reshape** it (GROUPS), or **collide** with it (Phase A taxonomy). A daily *Harness Scan* automation feeds this stream (§7).

### 4.2 Categorize every item

Tag each piece of input so patterns emerge:

- **Functional bug** — Harness does the wrong thing (highest priority; may block QA's trust in results).
- **Missing feature** — a capability QA needs that doesn't exist (e.g., tagging, export).
- **Traceability gap** — QA can't tell what belongs to what (case → request, output → result).
- **UX friction** — it works but is slow, confusing, or uncomfortable (e.g., jarring refresh).
- **Performance** — slowness, lost runs, queue confusion.
- **Platform divergence** *(new)* — the platform shipped something that overlaps, changes, or conflicts with one of our proposals. Logged in the classification plan's **divergence register (§8)**, not just as a feedback row.

### 4.3 Prioritize with Impact × Effort

Score each cluster: **Impact** (how much it blocks or slows QA, how many testers hit it) against **Effort** (rough build cost, confirmed later with dev). Four buckets — Do first / Do next / Plan carefully / Nice to have — applied in §6.

> **Effort now has a discount.** Several proposals cost less than first estimated because the platform already built the hard part: dedupe is vector/ANN already (Spec 039), groups already exist (Spec 041), facet filters already ship (`CaseFilterBar`). **Check the divergence register before you size anything** — the answer is often "the platform did most of it."

### 4.4 Cluster, don't list

Ten complaints about "I can't find my stuff" may all point to one root cause (no filtering/tagging). Our value-add over a raw feedback dump is grouping symptoms into root causes so dev fixes causes, not symptoms. The clearest example is §6a: seven "Risk" grouping values, an empty `--grep @risk`, and 287 cases producing 237 labels are **one** root cause — an open vocabulary — not three complaints.

---

## 5. Phase 1 applied: QG-139 as our first intake

QG-139 is still the seed. Clustered by category, with what a month of platform change has done to each:

- **Traceability:** test-case → request mapping; output tracking; Runs-row → details navigation. *Partly moved — `case_id` is now unique identity; breadcrumbs still open (QG-147/149).*
- **Missing features:** prompt search; test-case tagging & filtering; filter by assignee; activity-log export; line-by-line error tracking. *Prompt search + tagging/filtering **delivered** via `CaseFilterBar`; assignee filter, export, line-level errors still open.*
- **UX friction / control:** refresh rate; stopping-condition workflow; duplicate validation. *Duplicate validation **reframed** — semantic dedupe already exists (§6 #9); refresh partly addressed by the notification area (QG-152).*

These still map almost one-to-one onto real needs — the feedback was genuine. Concrete recommendations and their current status are in §6.

---

## 6. Phase 2 — Feature & UX Recommendations

Our deliverable to the dev team. Each recommendation has a *placement* and a *default behavior* so it can be built without another meeting. Because **Harness is internally built, these become development tickets we can implement directly**. The **Status** column reflects what the platform has verifiably shipped as of 6 Aug — treat anything not marked delivered as still open.

| # | Recommendation | Status (6 Aug) |
|---|---|---|
| **6** | **Output tracking (highest value).** On Test Case Details, an **"Actual Output"** section beside Expected, so QA can eyeball whether a "Pass" is truly correct. | ⬜ **Open — top priority.** Live symptoms: the case shows **"Direct test"** while the real spec name exists but isn't surfaced; a failure reports `exit 1` without the assertion |
| **10** | **Navigation from Runs tab.** Whole Runs row clickable to Test Case Details, with a hover state. | ⬜ Open (QG-139). Cheap, high-satisfaction win |
| **4** | **Refresh frequency.** Replace aggressive auto-refresh with a manual **Refresh** + "updated 30s ago", or targeted row-level live updates. | ↗ Partly addressed — queue/notification area shipped (QG-152), *with* a readiness-counter bug. Refresh-feel fix not confirmed |
| **5** | **Activity-log download.** **Download** button on the log panel exporting `.txt` / `.md`, with a date-range picker. | ⬜ Open (QG-139) |
| **2** | **Test-case tagging & filtering.** Tag field on create/edit; tags as filter chips atop the lists. | ✅ **Facet filters delivered** (`CaseFilterBar`: Feature · Labels multi-select). The *deeper* answer — closing the vocabulary so tags mean something — is the classification workstream (§6a) |
| **3** | **Filter by assignee.** "Assignee" dropdown + one-click **"My tasks"** toggle; secondary sort by created-date. | ⬜ Open |
| **7** | **Test-case → request mapping.** Persistent **Request ID / name** breadcrumb on every result row and details page, clickable to the parent. | ↗ Partly — `case_id` is now the unique catalog identity. Breadcrumbs are stories QG-147 / QG-149 (mockups drafted) |
| **8** | **Stopping-condition UX.** Plain-language options in the run-setup panel + a clear "fired because…" indicator. | ⬜ Open (QG-150 waiting-states is adjacent). Needs discovery screenshots |
| **9** | **Duplicate validation.** On generate/submit, warn "Possible duplicate of #123 — create anyway / merge?" | ♻ **Reframed.** Semantic dedupe **already exists** — Spec 039 ships a Chroma vector index with ANN shortlisting. The "exact vs. semantic" question is answered (**vector**). What remains: **scope the ANN shortlist by labels** + surface the warning. Now Gate C/E of the classification plan, not a build-from-scratch |
| **11** | **Line-by-line prompt error tracking.** Line breaks in the prompt input; on failure, cite the exact line. | ⬜ Open — "Failure output stops one level too high" reproduced 3 Aug. Engineering-heavier |
| **1** | **Prompt search.** Search box on the prompt/request list; search body text; debounce. | ✅ **Delivered** — covered by `CaseFilterBar` free-text search (debounced). QG-141 also covers request-side search |

**Priority snapshot (refreshed):**

| Priority | Items |
|---|---|
| **Do first** (high impact, low effort) | #6 output tracking, #10 row navigation |
| **Do next** (high impact, higher effort) | #3 assignee filter, #7 request mapping, #5 log export |
| **Plan carefully** (needs design/rules) | #8 stopping condition, #11 line-level errors |
| **Reframed / delivered** | #9 duplicate validation *(→ label-scope existing ANN)*, #2 tagging/filtering, #1 prompt search, #4 refresh |

> **QG-139 fanned out into stories.** The eleven items above are now tracked across the QG-141…QG-152 family under Epic QG-138 (see the handoff §8 ticket index). QG-139 itself stays as the original feedback record.

### 6a. The classification workstream — the largest Phase 2 output

The single biggest thing this loop produced does not fit in a row above, so it has its own document: [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md).

**The root cause, stated once:** the fields that should *group* cases — `Feature` and `Labels` — are free text filled by an LLM, and they have collapsed. **287 cases have produced ~237 distinct grouping values** (~202 of them single-use truncated titles); the grouping axis is functioning as a second ID. Because `Feature` is a directory *and* a Playwright tag, every drifted value permanently fragments the repo.

**The proposal, in one line:** give Harness a **closed vocabulary** for the fields it already has, **classify at ingest**, and let group membership be a **query** rather than a hand-ticked list. Build order: `VOCAB → MODEL → CLASSIFY → QUEUE → BACKFILL → GROUPS → HEATMAP`, with `VALIDATE` outside the chain and `FILTERS` already delivered.

**Why it lives elsewhere:** it needs a proposal, per-item acceptance criteria, a status table, a **divergence register** (what the platform already shipped), and open PO decisions — more than a UX-recommendation row can carry. **This plan owns the *loop*; that plan owns the *initiative*.**

🔴 **It is blocked on one question:** a *"Phase A taxonomy"* workstream already exists on the platform side (`fix(catalog): prefer managed app_project for Phase A taxonomy`, 4 Aug). **Until the PO explains what Phase A taxonomy classifies, our vocabulary cannot be published to the Knowledge base and the proposal cannot be presented as new.** This is the top open item across the whole project.

---

## 7. How the BA and Claude work together — one session, not two

**One Claude, here, does both jobs.** This plan originally split the work across a "Strategic Brain" (Claude App) and a separate "On-Ground Explorer" (Claude in Chrome), as if they were two actors the BA had to shuttle captures between. **That split was a false constraint** — it came from not knowing that a single Claude session can both hold the strategy *and* drive the browser through a tool. It can. There is no hand-off protocol to keep in sync, and nothing to serialize and paste "back."

**The two jobs are now two modes of one session:**

- **Strategy** (the default) — holds the Feature Map, the feedback tracker, the release log, and this plan; clusters feedback; drafts recommendations and tickets. Works the files directly.
- **Live-page** — when Claude needs to *see* the actual Harness/Aloha screens (verify a bug, walk a new screen, read a real dialog), it calls the **browser tool**, drives the page itself, and folds what it finds straight back into the strategy work in the same breath.

**The one real prerequisite.** `qops-harness.lab.gend.vn` sits behind Google SSO, so Claude reaches it through the **user's real Chrome** (`mcp__claude-in-chrome__*`), which must be open and logged in. The in-app browser has no session there. This is a *tooling* requirement — a tool Claude calls — **not a second Claude**.

**When to still keep browsing at arm's length.** A full screen-walk produces many screenshots and long page dumps that can crowd out the strategic thread. For that, Claude can dispatch a **browsing subagent** with its own context that returns only the findings — the BA still never ferries captures by hand; the noisy part is just quarantined. Reach for it on a whole-app walk; skip it for "check this one dialog."

**Automation.** A scheduled **Harness Scan** runs daily at 09:30: it reads the Teams *QOps Harness* channel, appends new deploys to the Release Log §3, and drops candidates into a **"⬜ Needs BA review"** list at the top of §2. It never promotes, deletes, or changes a watch-list status — that judgment stays with the BA. (A disabled twin, `harness-release-log-sync`, is a cold spare — never run both.)

**Efficiency rules:** shared vocabulary (identical screen names + Feedback IDs), small batches (5–10 items), and the record format in §8 — now an *optional* way to keep a capture worth keeping, not a required handoff.

---

## 8. Record formats (optional)

Two formats. Neither is a hand-off protocol between two Claudes any more (§7). **§8.1** is an *optional* way to write down a screen capture worth keeping — Claude already holds it in-session, so use it only when the note should outlive the session (e.g. a durable Feature-Map entry). **§8.2** is still a real intake format: it structures feedback that arrives from *outside* the session — a QA report — which genuinely does need bringing in.

### 8.1 Phase 0 — Feature Discovery capture (Markdown, one block per screen)

```markdown
## Screen: <name>
Reached via: <navigation path>
Purpose (your guess): <one line>

### Elements
- <element> — type: <button/input/dropdown/...> — appears to: <action>

### States observed
- Empty / Loading / Success / Error: <what you see, how triggered>

### Text captured
- Labels / placeholders / tooltips / error messages: <verbatim>

### Notes / confusions
- <anything surprising, missing, or unclear>
```

### 8.2 Phase 1 — QA feedback item (JSON, one object per item)

```json
{
  "feedback_id": "FB-012",
  "date": "2026-07-06",
  "source": "QA",
  "harness_area": "Runs tab",
  "category": "Traceability gap",
  "description": "Can't tell which request a result belongs to",
  "impact": "High",
  "frequency": "3 testers raised it",
  "linked_jira": "QG-139",
  "status": "New"
}
```

Send me a batch as a JSON array and I'll cluster by root cause, prioritize, and draft the recommendation/dev tickets directly.

> **Platform-change items** don't use this schema — they go straight into the Release Log §2 and, where they touch a proposal, into the classification plan's divergence register (§8).

---

## 9. Immediate next steps

Ordered by what unblocks the most.

1. 🔴 **Ask the PO what "Phase A taxonomy" is.** Four specific questions in the classification plan §9 decision 5. **Nothing in the classification workstream should be presented until this is answered** — it may already define part of the vocabulary, or conflict with it.
2. **Send the PO the readiness-meter root cause** — the stuck `||` in `updateReadiness()` makes two of three conditions always true. He is mid-decision between *removing* and *correcting* the counter; the root cause probably makes *correct* the cheaper option.
3. **Re-test the New-request pre-fill bug before filing it.** Three deploys on 4 Aug (`8375e81`, `729ad15`) reworked the same New Request `app_project` binding; the behaviour may already have changed.
4. **File the classification items in Jira** under Epic QG-138 once Phase A is settled, and paste the keys into that plan's §6 (all rows currently read `—`).
5. **Settle the Feedback Tracker question with QA** — dormant since 7 Jul; if unused, Stream 1 intake needs rethinking.
6. **Get a CSV export of the Cases list** if one becomes available — it would firm up the ~237 figure and size `BACKFILL` precisely.
7. **Check the Release Log changelog each morning** (~09:40) — a new row means the scheduled *Harness Scan* fired.

---

## 10. Confirmed decisions & remaining open questions

**Confirmed:**

- **Scope:** QA owns test-case creation/execution. We own the Harness improvement loop (discovery, feedback intake/analysis, feature/UX recommendations).
- **Harness architecture:** internally built — recommendations convert directly into development tickets.
- **Oracle of truth:** the Product Owner authoritatively confirms correct Aloha financial values, on the rare occasions we need one to judge a feedback item.
- **QG-139:** stays as-is in Jira as the original feedback record; its items are tracked forward in the QG-141…152 family.
- **Phase 0 is complete:** the tool is mapped and verified; the map is now *maintained* via the Release Log, not re-produced.

**Still open:**

1. 🔴 **What is "Phase A taxonomy"?** — PO. **Blocking** the classification workstream (see §6a and §9 step 1).
2. **Cycle deliverable:** what does the PO want at the end of a cycle — a prioritized backlog, a shipped set of quick wins, or both? Sets how far into Phase 2 we drive.
3. **Feedback Tracker:** is Stream 1 still alive, or does QA intake need a new channel? — QA Lead.

Everything blocked on a specific person is consolidated in [`00_Active/Open_Items.md`](../00_Active/Open_Items.md) — do not duplicate it here.

---

*Living document. Hand me QA feedback (§8.2) and I'll fold it into the Feature Map and dev-ready recommendations; I capture live-page detail myself via the browser tool (§7), no shuttling required. For the classification initiative and the daily platform-change stream, follow the two spun-out documents linked at the top.*

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-08-06 | 3.1 | **Corrected the operating model — one Claude, not two.** The "dual-Claude" split (Strategic Brain + On-Ground Explorer, with a capture hand-off between them) was a false constraint: a single session both holds strategy and drives the browser via a tool. Rewrote §7 to "one session, two modes" (with the SSO/real-Chrome prerequisite kept as a *tooling* fact and a browsing-subagent note for heavy walks), collapsed the §0 owner rows, and reframed §8 from a hand-off protocol to *optional* record formats |
| 2026-08-06 | 3.0 | **Brought up to date with the verified system state (3–6 Aug).** Marked **Phase 0 complete**; rewrote the §1 maturity read as Jul-signal vs. 6-Aug-state (FILTERS/Test groups/`case_id` delivered). Added the **second intake stream** (Release Log / platform ships daily) and a **platform-divergence** category to §4. Added a **Status** column to §6 and reframed #9 duplicate validation (dedupe already exists via Spec 039), #1/#2 (covered by `CaseFilterBar`). Added **§6a — the classification workstream** and its 🔴 Phase A blocker. Renamed *Chrome Extension* → *Claude in Chrome*; documented the scheduled *Harness Scan*. Rewrote §9 next steps and §10 decisions; wired in the sibling documents and adopted their house style |
| 2026-07-06 | 2.0 | Draft v2 — scope narrowed to feedback + feature suggestions |
