# Harness — UX/UI Investigation & Improvement Proposal

**Author:** Business Analyst (BA)
**Date:** 6 July 2026
**Inputs:** Live Harness screens (Dashboard, Requests, All cases, Executed history, Failed) + MS Teams thread with the PO and QA
**Related:** [QG-139](https://gendvn.atlassian.net/browse/QG-139), `Harness_Feedback_Tracker.xlsx`

---

## 0. Purpose & how to read this

The PO asked for a proper BA request: *"what I need is your input — where to put it, how it looks, how it's used, what the use cases are… a request from a BA should have full technical detail and the idea behind it."* The PO has already deployed a **"Created by"** field on the request Info tab, but says it's still hard to use and needs a filter design from BA.

This document delivers that in two layers:

1. **Section 2 — the priority proposal**: request ownership, identification and filtering (the exact thing the PO asked for), with placement, behavior, use cases, edge cases, technical notes, and acceptance criteria.
2. **Sections 3–4 — a full screen-by-screen audit** of the six Harness pages, flagging what is unreasonable and what to change (placeholder vs. new feature), so the PO gets the broader picture too.

Every recommendation is tagged **[Placeholder OK]**, **[Reposition]**, **[New feature]**, or **[Bug]** so the intent is unambiguous.

---

## 1. Headline findings (the five that matter most)

1. **Requests are anonymous and unscannable.** The queue shows only a truncated UUID, a status pill, and a mode label. You cannot see *who created it, when, or what it was about* without opening each one. This is the exact pain in the Teams thread and the top priority (Section 2).
2. **"AI steps = 0" on every run.** The Dashboard KPI, the AI-step-ratio chart (0%), and the step-mix chart (only purple "Automation" bars) all say no AI steps have ever run. For a system branded "LLM-powered test ops," this needs an answer: is the AI path wired up, switched off, or just not captured? (Section 4.2)
3. **A failure screenshot shows the wrong website.** In Executed history, a failed run's evidence thumbnail shows "OOYOD — Projected Cash Flow" (an unrelated marketing/template site), not Aloha. Either the automation drifted to a search result or the session/login failed and landed elsewhere. This is a trust red flag worth a root-cause check. (Section 3.4)
4. **The All-cases detail panel is duplicated.** Selecting one case renders the Info/Steps/History block and "Last run" section stacked several times down the right panel. This looks like a rendering bug. (Section 3.3)
5. **The taxonomy is unused.** Category is "default" everywhere and cases are "unlabeled." That empties out the Dashboard's taxonomy breakdown and makes filtering pointless — it's the root cause behind several QG-139 items. (Section 4.3)

---

## 2. PRIORITY PROPOSAL — Request ownership, identification & filtering

> This is the BA request the PO asked for. It resolves the Teams discussion (ownership + "which request is mine") and turns the raw "add a Created by field" idea into a designed feature.

### 2.1 Problem statement

From the Teams thread (paraphrased and translated):

- **BA:** Long-term there will be many requests, some with near-identical inputs. I recognize one but can't be sure it's mine — I have to remember the request ID to check.
- **QA:** We each need our own identifier so that when we look back we can trace our requests, and later search / edit / delete our own ones.
- **PO:** I've deployed a "Created by" field on the request Info, but it's still hard to use. We probably need a filter — but where and how? Need BA to design it.

**Core problem:** Harness has no concept of *"my work"* in the request list. Ownership exists in the data (now "Created by"), but it is not visible where scanning happens (the queue) and cannot be filtered or searched. So users cannot answer three everyday questions: *Which of these are mine? Which one was the request I ran yesterday? Have I already submitted something like this?*

### 2.2 Use cases / user stories

- **U1 — Find my work.** As a QA user, I want to see only the requests I created, so I can track my own series of tests without scrolling through everyone's.
- **U2 — Recognize a request at a glance.** As a user, I want each queue row to show a readable title, who created it, and when, so I can identify a request without opening it.
- **U3 — Avoid duplicates.** As a user, before I submit, I want to search my previous requests by content, so I don't re-run something I (or a teammate) already did.
- **U4 — Trace back later.** As a user, I want a short, memorable request reference I can copy and paste into Teams/Jira, so I can point a teammate to the exact request. (Today people paste raw UUIDs.)
- **U5 — Review a person's activity.** As the PO/BA, I want to filter requests by creator and date, so I can review what one user submitted during a sprint.

### 2.3 Root cause

The request queue is an **anonymous list**. Ownership was bolted onto the Info tab (one record at a time) instead of the list (where scanning and filtering happen). Adding the field without surfacing it in the list is why the PO says it "still feels hard to use." The fix is not another field — it's **making ownership visible and filterable at the list level**.

### 2.4 Recommendation A — Enrich the queue row **[New feature / Reposition]**

Today each queue row shows: short UUID · status pill · mode. Change each row to show four scannable facts:

```
┌──────────────────────────────────────────────────────────────┐
│ REQ-1042   ● successful                                        │
│ Navigate to Risk tab, filter risk report by date…             │  ← title preview (1 line, truncated)
│ 👤 QA · 5 Jul, 11:50 PM · 5 cases                       │  ← creator · created time · case count
└──────────────────────────────────────────────────────────────┘
```

Why: this single change answers U1 and U2 directly. The creator and timestamp are the two facts the Teams thread was missing, and the title preview removes the need to open a request just to recognize it.

### 2.5 Recommendation B — Filter & search toolbar **[New feature]** — *the "where to put the filter" answer the PO asked for*

Add a filter bar **directly under the existing "Show 20 / Refresh" row, above the QUEUE list** — i.e. it filters the list it sits on top of. Controls, left to right:

1. **"My requests" toggle (primary control).** A single click filters to `created_by = current user`. This is the 80% case from the Teams thread, so it gets the most prominent, one-click treatment (a toggle/segmented control, default off). Place it first.
2. **Created by** dropdown — select any user (defaults to "Anyone"). Covers U5 for PO/BA review. Populated from users who have created requests.
3. **Status** dropdown — All / Successful / Failed / Duplicate / Rejected (mirrors the outcomes already shown on the Dashboard).
4. **Search box** with placeholder `Search request text or REQ ID…` — searches the request prompt body and the reference. Debounced; does **not** trigger the jarring full refresh. Answers U3.
5. **Date range** (created between) — optional, collapsed by default to keep the bar light.

Placement rationale: filters belong **on top of the data they filter**, in the same column as the queue — not in the right-hand detail panel (which is about one record) and not on a separate settings page. This keeps the mental model "the list I'm looking at is the list I'm filtering." The "My requests" toggle is deliberately separated from the dropdowns because it's a quick, high-frequency action, not a rarely-touched filter.

### 2.6 Recommendation C — Human-friendly request reference **[New feature]**

Replace (or supplement) the raw UUID `c5ffec6f-42a6-40f2-8226-6dd29602a59b` with a short sequential reference like **REQ-1042**, shown on the row, in the Info tab, and with a one-click **Copy** button. Keep the UUID internally; show the friendly ID to humans. This resolves U4 and the Teams pain of "having to remember the ID" — people can paste "REQ-1042" into Teams/Jira instead of a 36-char UUID.

### 2.7 Behavior & defaults

- Default view: **all requests**, newest first (the current lack of ordering was a QG-139 complaint too — enforce created-desc sort).
- "My requests" persists across page reloads (remember the user's last choice).
- Filters combine with AND; an active-filter count badge shows how many are applied, with a "Clear" link.
- Empty state when "My requests" returns nothing: *"You haven't created any requests in this range."*

### 2.8 Edge cases

- **Legacy requests** created before "Created by" existed → show creator as **"Unknown"** and group them under that in the filter, rather than hiding them.
- **Identity display**: show a display name but filter on the account email, since email is the stable key (as the QA user suggested in the thread).
- **Permissions**: confirm with PO whether every user may see all requests (shared queue) or only their own. The design supports both — "My requests" is a filter, not a security boundary; if isolation is required that's a separate access-control decision.
- **Sorting vs. filtering**: keep them independent (a user may filter to "mine" and still sort by status).

### 2.9 Technical notes for dev (the "technical back" the PO wants)

- The data already exists: `created_by` is now captured on the request. This is primarily an **exposure** task, not new data capture.
- **List API**: add `created_by`, `created_at`, `title`, and `status` to the request-list endpoint payload so the queue can render them without N extra calls. Add query params `?created_by=`, `?status=`, `?q=` (full-text on prompt), `?from=&to=`.
- **Friendly ID**: add a sequential `ref_no` column (or derive a short code) at request creation; index it and the UUID.
- **Search**: index the request prompt text; debounce client-side (≥300 ms) and cap results.
- **Indexes**: `(created_by, created_at desc)` to keep "My requests, newest first" fast as volume grows — which is precisely the long-term concern the BA raised.

### 2.10 Acceptance criteria

- [ ] Each queue row shows title preview, creator, created timestamp, status, case count, and a friendly REQ-#### reference.
- [ ] A "My requests" toggle filters to the current user in one click and persists across reloads.
- [ ] Created-by, Status, Date-range filters and a content/ID search are available above the queue and combine correctly.
- [ ] Default order is newest-first; legacy requests show creator "Unknown."
- [ ] A Copy button copies the friendly reference.

---

## 3. Screen-by-screen audit

### 3.1 Requests

Beyond Section 2:

- **Events tab shows 733 events** dominated by low-signal entries (Quest started, Agent started/completed). The "Errors only" toggle is good **[Placeholder OK]**, but add a collapsed/grouped view (group by child run/case) so the useful events aren't buried. **[New feature]**
- **History tab is genuinely good** — the Lifecycle timeline and the "Batch complete: 3 successful, 0 duplicate, 2 failed, 0 rejected" summary are exactly the right altitude. **Promote that batch summary** to the request header (Info tab / queue row) so it's visible without opening History. **[Reposition]**
- **Session controls** (Upload / dropdown / Use default) are prominent but cryptic for non-experts. Add a one-line helper under them explaining what a session file is and when to override. **[Placeholder OK — add helper text]**

### 3.2 Dashboard

- **Charts are mostly empty whitespace** because the date window (07 Jun–04 Jul) is far wider than where data exists. Default the window to the last active period (or auto-fit to data), and show a clean "No runs in this range" state instead of near-empty axes. **[Reposition/behavior]**
- **Date pickers use MM/DD/YYYY.** For a VN team that reads DD/MM, "06/07" vs "07/06" is genuinely ambiguous. Standardize the display format and label it. **[Bug — i18n]**
- **Taxonomy breakdown is not clickable** and every Category is "default." Make each feature row click through to its filtered cases, and — once tagging exists (QG-139 #2) — group by real category. **[New feature]**
- **Export CSV** is a nice touch and partially covers the QG-139 activity-log export ask. **[Placeholder OK]**
- **"Include inactive"** checkbox has no explanation. Add a tooltip. **[Placeholder OK]**

### 3.3 All cases

- **Right detail panel is duplicated** — one selected case renders multiple stacked Info/Steps/History + "Last run" + "Session file" blocks. This reads as a rendering bug (likely appended instead of replaced on selection). **[Bug — high]**
- **Case vs. Feature columns are redundant** (full sentence vs. its slug). Consider collapsing Feature into a secondary line under Case, freeing horizontal space. **[Reposition]**
- **"Danger zone"** button label is vague and sits top-right next to "Run." Rename to what it does (e.g. "Bulk delete") and visually separate destructive actions. **[Reposition — safety]**
- **Triage column** is "unlabeled" for nearly everything — reinforces the taxonomy gap (Section 4.3). **[New feature]**

### 3.4 Executed history

- **Failure screenshot shows an unrelated site (OOYOD).** Investigate whether the automation is landing on a search result / wrong URL, or the session expired and redirected. If evidence points at the wrong page, the "failed" verdict may be masking a navigation/session defect rather than an Aloha bug. **[Bug — investigate, high]**
- **Failed step message is good** ("Action failed — no reliable locator", return code 1) — keep it and, where possible, name the locator/selector that failed so the QA/dev can act. **[Placeholder OK — enrich]**
- **Console output** is raw dotenvx noise by default. Collapse env/boot lines and surface the meaningful Playwright output first. **[Reposition]**
- **AI / Auto columns** are a good idea, but AI is always 0 (Section 4.2). **[Placeholder OK — pending 4.2]**

### 3.5 Failed

- **The triage taxonomy is excellent** (App bug / Test script / New feature / Needs triage) — this is the single best-designed part of Harness and directly supports our BA loop. But **9 of 10 sit in "Needs triage"**, so the mechanism isn't being used. Make assigning a reason faster (inline on the row, keyboard-friendly) and consider prompting for it right when a failure appears. **[Reposition / process]**
- **"Failure screenshot at step" is an empty placeholder** — evidence isn't captured or isn't loading. Diagnosis depends on this; confirm screenshots are being saved and rendered. **[Bug]**
- **Error output shows a file path** (`test-results/…/error-context.md`) instead of the content. Surface the error-context inline (expandable) so QA doesn't have to hunt for the file. This overlaps directly with QG-139 "Output Tracking." **[New feature]**
- **Provenance is empty** (Created —, Last updated —). Populate it. **[Bug]**
- **"Delete case" lives at the bottom of a failure-triage view**, and a red floating PDF icon overlaps the panel. Move destructive actions out of the triage flow and clarify the PDF icon's purpose (export report?). **[Reposition — safety]**

---

## 4. Cross-cutting issues

### 4.1 Ownership & identity (covered in Section 2) — top priority.

### 4.2 The "AI steps = 0" question
Every surface that mentions AI reads zero: the KPI, the ratio chart, the step-mix, and both the Executed-history AI columns. For an LLM-powered harness this is the most important thing to clarify before we recommend AI-related UX. **Question for PO/dev:** is the AI/agent path disabled, failing silently, or simply not emitting telemetry? The answer changes whether "AI step ratio" is a useful chart or dead UI that should be hidden until wired up. **[Bug or Placeholder-to-hide — needs answer]**

### 4.3 The taxonomy is empty
Category "default" + cases "unlabeled" everywhere means the Dashboard taxonomy breakdown, the All-cases Label filter, and any per-feature reporting are all effectively inert. This is the shared root cause behind QG-139 items #2 (tagging) and the Dashboard/Triage gaps. Standing up real tags/categories unlocks several features at once — recommend it as an early, high-leverage investment. **[New feature]**

### 4.4 Evidence capture
Two screens (Executed history, Failed) show evidence problems — a wrong-site screenshot and an empty screenshot placeholder. If failure evidence is unreliable, QA cannot trust or triage results. Treat evidence capture (screenshot + inline error-context) as a reliability fix, not a nice-to-have. **[Bug]**

---

## 5. What to send the PO next (request package)

For the PO's ask specifically, the package to hand over is:

1. **This proposal, Section 2** — the designed ownership/identification/filtering feature with placement, behavior, edge cases, technical notes, and acceptance criteria.
2. **The mockup** `Harness_Requests_Mockup.html` — an annotated before/after of the Requests page showing exactly where the "My requests" toggle, filters, search, and enriched rows go.
3. **The tracker** `Harness_Feedback_Tracker.xlsx` — updated with these findings (FB-012…020, FS-012…018) and priorities, so this sits inside the same backlog as QG-139.

Recommended first build (highest value / lowest effort): **Recommendation A (enrich queue rows) + the "My requests" toggle**. Those two alone resolve the Teams thread. Friendly IDs, full filters, and search follow.

---

## 6. Open questions for the PO / team

1. **Access model:** should every user see all requests (shared queue with "My requests" as a convenience filter), or should users only see their own? This changes whether ownership is a filter or a permission.
2. **AI path (4.2):** is the AI/agent step path active? If not, should AI-related charts be hidden until it is?
3. **Friendly ID:** OK to introduce a sequential REQ-#### reference alongside the UUID, or is there a reason the UUID must be the only identifier?
4. **Evidence:** are failure screenshots expected to be captured today? The empty placeholder and the wrong-site image suggest the pipeline needs a look.

---

*Prepared for review with the Product Owner (PO) and QA. Section 2 is ready to become a Jira request; the mockup and tracker accompany it.*
