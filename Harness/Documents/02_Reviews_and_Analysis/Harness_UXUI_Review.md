# Harness — UX/UI Review & Function↔UI Map

**Author:** Business Analyst (BA)
**Purpose:** Make the Harness UI *clear* and ensure it *matches its functions*. Review only — no code changes.
**Scope:** All 11 screens of the QOps Harness front-end.
**Basis:** `QOps_Harness/` source (HTML/CSS/JS + `tokens.css` design system), page screenshots, `Readme.txt` function list, and the Aloha screens under test.

> **Action needed from you first:** validate **Part A** (the derived function list). Everything downstream maps to it, so a quick confirm/correct there makes the rest accurate.

---

## Part A — Harness functions (derived — please validate)

Compiled from `Readme.txt` + the code and screens. Confirm or correct before we lock the map.

**Core request / generation functions**

1. **Single Test Case** — create one known test case; the system auto-checks for duplicates and blocks a duplicate with a "duplicate" result.
2. **Test Feature (new)** — describe a feature; AI generates a grouped list of cases (positive, negative, security, boundary…).
3. **Execute Feature** — same as Test Feature, but **runs** the cases immediately instead of only creating them.
4. **Test Bug** — create a case for a specific bug; it is expected to **fail on first run** (bug not fixed yet).

**Supporting functions**

5. **Tag / Label** — label cases to filter and batch-run by feature group.
6. **AI Fallback** — if the automation (Playwright) script can't run, the system auto-switches to running via AI.

**Platform capabilities (from the IA)**

7. **Requests queue** — submit, track, and inspect test requests.
8. **Case review** — review/edit/approve AI-proposed cases before they run.
9. **Test-case catalog** — All cases / Failed / triage.
10. **Executed history (Runs)** — Playwright run log, pass/fail, output.
11. **Dashboard** — pass rate, step mix, taxonomy.
12. **Knowledge** — agent knowledge base that feeds generation.
13. **Session management** — auth session for the target app (Aloha).
14. **Settings** — theme (Day / Night / System).

**Open issues the PO already flagged (Readme):** no grouping by feature/creator; tag & level not shown on the main screen; in-UI guidance is thin; no mobile testing yet.

---

## Part B — Function↔UI traceability map

Verdict key: **Clear** = obvious in the UI · **Partial** = present but weak/buried · **Unclear** = present but confusing/mislabeled · **Missing** = function has no clear UI home.

| # | Function | Where it lives in the UI | Verdict | Gap / note |
|---|----------|--------------------------|---------|------------|
| 1 | Single Test Case | New request → mode "Single test case" | **Partial** | Dedupe outcome ("duplicate") shows on Dashboard/queue, but the *reason* and *what to do next* isn't explained at the point of creation. |
| 2 | Test Feature (new) | New request → "Tests for a new feature" → Case review groups (Positive/Negative/Security/Performance/Edge) | **Clear** | Good — groups are visible on Case review. |
| 3 | Execute Feature (create + run) | *No distinct control* — modes don't show "create only" vs "create & run" | **Unclear** | The documented "run immediately" function has no obvious toggle. Users can't tell if a mode just proposes or also runs. |
| 4 | Test Bug | New request → "Tests for a bug ticket" | **Partial** | The "must fail on first run" expectation isn't stated in the UI, so a first-run failure looks like a defect rather than expected behavior. |
| 5 | Tag / Label | Cases page: "Label" filter + "Unlabeled" triage | **Partial** | Tags aren't shown on rows/main screen; almost everything is "Unlabeled." Function exists but isn't usable at a glance (PO's own open issue). |
| 6 | AI Fallback | Requests → **Execution** tab: per-step **Auto vs AI** badges + an "AI STEP" section; Dashboard AI-step widgets | **Partial** | Now visible per run (Auto/AI badges) — big improvement. Dashboard aggregates may still lag; a short legend for Auto vs AI would help. |
| 7 | Requests queue | Requests page | **Clear** | Recently improved (creator, timestamp, filters — QG-141). |
| 8 | Case review | case-review.html | **Clear** | Mode + proposed groups + Confirm and process. |
| 9 | Test-case catalog | Test cases → All / Failed | **Partial** | Flat list, no feature grouping (PO open issue); triage taxonomy strong but under-used. |
| 10 | Executed history (Runs) | Test cases → Executed history + Run review | **Partial** | Output visible on Execution tab; request→case now shown via "Linked test cases" on Info. Still open: case/run **cross-links** and run→request breadcrumb (QG-149 / QG-147). |
| 11 | Dashboard | dashboard.html | **Partial** | Charts sparse; taxonomy "default"/"unlabeled"; ties to #5. |
| 12 | Knowledge | knowledge.html | **Unclear** | Its role in test generation isn't explained; not linked from the request flow, so users won't know it shapes results. |
| 13 | Session management | Requests header (Upload / session dropdown / Use default) | **Partial** | Prominent but cryptic; no helper text on what a session is or when to override. |
| 14 | Settings | settings.html | **Clear** | Simple theme control. |

**Headline:** the biggest *function-vs-UI* gaps are **#3 Execute Feature** (no create-vs-run clarity), **#5 Tag** (not surfaced), and **#12 Knowledge** (role unexplained). These are where the UI does not yet tell the truth about what Harness can do.

> **Update (13 Jul 2026):** since this review, the Request page shipped **Created by** (Info), a **specific-creator filter** (the "All requests" dropdown), **Linked test cases**, and **Auto/AI step badges** on Execution — so #6 improved (Unclear → Partial) and QG-141 L1/R3 are done. Remaining Request-page work is tracked in **QG-141** (REQ-#### · date filter · richer search · ticket link) and **QG-149** (cross-links to Cases/Runs/Knowledge).

---

## Part C — Per-screen review

Severity: **High** = blocks understanding/use · **Med** = friction · **Low** = polish.

### C1. Requests
- **Med** — Session controls (Upload / dropdown / Use default) have no explanation; add one line: *"Session = saved login for Aloha; override to test as a different user."*
- **Med** — The object model (a **Request** proposes **Cases** which produce **Runs**) isn't stated anywhere; this is the root of the recurring "which request does this result belong to" confusion. A short breadcrumb/label pattern would fix it (see cross-cutting T1).
- Recently improved: creator, timestamp, filters (QG-141).

### C2. New request (dialog + `qops-new-request-ux` revision)
- **High** — **Mode labels don't match the functions.** UI: "Single test case / Tests for a new feature / Tests for an existing feature / Tests for a bug ticket." Functions: "Single / Test Feature / Execute Feature / Test Bug." "Execute Feature" (create + run) has no clear home, and "existing feature" vs "new feature" isn't obviously the same axis. Align labels + add one-line descriptions of what each mode *produces* (propose only vs propose + run).
- **Med** — Chat-first flow is nice, but there's no visible hint that **Knowledge** influences generation.
- **Low** — Two new-request files (`new-request.html` stub + `qops-new-request-ux.html`) suggest the flow is mid-migration; converge on one.

### C3. Case review
- **Low** — Strong screen. Groups (Positive/Negative/Security/Performance/Edge) are clear.
- **Med** — No indication of the **Test Bug** "expected to fail first run" rule when the request is a bug ticket.

### C4. Test cases — All cases / Failed
- **High** — **No feature grouping** (PO open issue): a flat catalog doesn't scale. Group/filter by feature + tag.
- **Med** — Triage taxonomy (Product bug / Test bug / Flaky / Unlabeled) is excellent but nearly everything sits "Unlabeled"; make triage faster/inline and show tags on rows.
- **Med** — "Danger zone" / delete affordances need clearer, safer placement.

### C5. Executed history (Runs) + Run review
- **Med** — Run→request/case mapping still weak; add a persistent parent reference.
- **Med** — Console output leads with env/boot noise; surface the meaningful result first.

### C6. Dashboard
- **Med** — Charts are mostly empty space (window wider than data) and taxonomy is "default"/"unlabeled" — reflects #5/#9. Auto-fit the window; make taxonomy rows click-through.
- **Med** — AI-step widgets read 0 everywhere (#6); either fix telemetry or hide until the AI path is live.

### C7. Knowledge
- **High** — **Role unexplained.** It looks like a file list with Global/Project/Agent + "Refresh site knowledge," but nothing says *this is the context the AI uses to generate tests.* Add a one-line purpose and link it from the request flow ("Cases are generated using your Knowledge base").

### C8. Settings
- **Low** — Clean. Theme only. Fine.

### C9. Index / launcher
- **Low** — Acts as the Requests entry; ensure it isn't a confusing duplicate of `requests.html`.

---

## Part D — Cross-cutting themes (fix these once, help every screen)

- **T1 — Make the object model visible.** Everywhere, express **Request → proposes → Cases → produce → Runs**. Consistent breadcrumbs and parent labels remove the single most common confusion.
- **T2 — One vocabulary.** Reconcile documented functions with UI labels (modes), and tame internal jargon surfaced to users (**Quest / Crew / Child run / milestone**). Publish a small glossary and apply it across screens.
- **T3 — Surface the differentiators.** The things that make Harness special — **AI fallback**, **duplicate detection**, **Test-Bug "fails first"**, **tags** — are currently invisible or unexplained. Give each a clear state/label at the moment it matters.
- **T4 — Light in-product guidance.** Empty states, tooltips, and one-line "what is this" helpers (Session, Knowledge, stopping condition). The PO already noted guidance is thin.
- **T5 — Design-token consistency.** A real token system exists (`tokens.css`, OpenAI palette, light+dark). Any new UI (and my mockups) should use these tokens, not ad-hoc colors.

---

## Part E — Recommended BA actions (what to do next)

Priority = Impact × Effort.

| Priority | Item | Form |
|----------|------|------|
| **Do first** | C2 mode labels ↔ functions (+ create-vs-run) | Mockup + ticket |
| **Do first** | T1 object-model breadcrumbs (Request→Cases→Runs) | Mockup + ticket |
| **Do first** | C7 Knowledge purpose + link from request flow | Ticket |
| **Do next** | C4 feature grouping + tag on rows | Mockup + ticket |
| **Do next** | T3 surface AI fallback / duplicate / test-bug states | Ticket(s) |
| **Do next** | C1 session helper text | Ticket |
| **Plan** | Dashboard auto-fit + taxonomy click-through | Ticket |

**Suggested deliverables I can produce (specs + mockups only):**
1. This review + Function↔UI map (here) — *validate Part A.*
2. Mockups (real tokens) for the two top issues: **request-mode clarity** and **object-model breadcrumbs**.
3. A prioritized set of tickets under Epic QG-138, each with acceptance criteria (like QG-141), for the items above.
4. A one-page **terminology glossary** (T2) for the team.

---

## Part F — Open cases (parked)

Items acknowledged but deliberately not ticketed yet — waiting on an owner/decision.

- **New Request input validation (missing/invalid required fields).** A request missing `Project: aloha` (or a malformed prompt) fails easily. Desired behaviour: during the New Request chat, if the LLM detects a missing or invalid required field, it flags it and asks the user to fix it (rather than silently proceeding and failing). **Status: open case, parked for the PO (Quan) to decide/fix later.** Raised by QA (missing-project failure) and assigned by the PO to the BA to track. Behaviour choice (block-and-fix / auto-suggest-and-confirm / warn) to be decided by the PO.

---

## Requests-page ticket index (Epic QG-138)

- **QG-141** — filtering, identification (REQ-####) & search.
- **QG-149** — cross-links to Cases, Runs & Knowledge.
- **QG-150** — explain the waiting states (Pending vs Awaiting review). *Mockup: `Harness_WaitingStates_Mockup.html`.*
- **QG-151** — keep status consistent on Retry. *Mockup: `Harness_RetryStatus_Mockup.html`.*
- **QG-152** — queue & running notification area. *Mockup: `Harness_NotificationArea_Mockup.html`.*
- **QG-146 / QG-147 / QG-148** — request-mode clarity · object-model breadcrumbs · Knowledge purpose.

---

*Prepared as a review artifact. Item 4 (input validation) remains an open case for the PO; everything else above is tracked in QG-138.*
