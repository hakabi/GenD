# Harness — Session Handoff / Context for a New Session

**Purpose:** carry the full working context of the Harness BA project into a new chat session.
**Role:** you are the **BA**; work with the PO and QA on improving the Harness system.
**Last updated:** 6 August 2026 · **amended 20 August 2026** — §2 mockup convention (light + dark), §5 theme system shipped

> **Start here for context, then go to [`00_Active/README.md`](./00_Active/README.md) for what needs doing.**
> This file explains the project; `00_Active/` is the working desk.

**Since 4 Aug — this session (6 Aug):**

- 🔑 **Classification reframed to THREE fields** — `feature` (`area/sub-area`) · `category` · a namespaced multi-valued `labels[]`. The "five axes" framing is retired: same vocabulary, packaged as the three fields Harness already exposes (the old `label`/suite and `tags[]` now live inside `labels[]` with namespaces; `project` is ambient). Canonical: **taxonomy v3.0** · **plan v1.5** · `01_Plans_and_Strategy/De_Xuat_Phan_Loai_3_Truong_VN.md`. Driven by a **live API measurement (6 Aug)** — see §4.
- **`Harness_Test_and_UX_Plan.md`** (in `01_Plans_and_Strategy/`) refreshed to the current system state (**v3.0**), then corrected so it reflects **one Claude doing both strategy and live-page work** via tools (**v3.1**) — the old "dual-Claude" hand-off model is retired. See its §7.
- **`00_Active/README.md`** reference pointer updated to mark that plan current.
- ⚠️ **Launch future sessions from `D:\source\GenD\Harness`**, not the CES Global working folder. This session was mistakenly rooted in `D:\AI knowledge\Ces Global\thu-muc-lam-viec`, which auto-loaded an unrelated `CLAUDE.md`. Deliverables were still written to GenD on disk — only the session root was wrong.

---

## 1. Project context

- **Harness (QOps Harness)** — an internal, LLM + Playwright test-ops tool QA uses to generate and run test cases against **Aloha**, a financial investment-fund platform (metrics: NAV, Beta, Risk, MTD/QTD/FYTD, Cash Forecast, Rating). Aloha's areas: Public / Private / Pipeline / Total Endowment / Cash Forecast / Risk / Scenario Test.
- **Scope of our work (BA):** QA authors/runs the test cases; **we run the improvement loop** — understand Harness, collect QA feedback, and propose feature/UX changes. Harness is internally built, so suggestions become dev tickets.
- **People → role titles** (used in all deliverables; no personal names/emails): **BA** = the user · **PO** = reviews & implements · **QA** = submit requests, raise feedback.
- **Live URLs:** Harness `https://qops-harness.lab.gend.vn/requests` · Aloha lab `workbench-app.lab.gend.vn` (writable) · Aloha prod `aloha.conceptia.com` (read-only).

## 2. Working conventions

- **Names:** always role titles (BA / PO / QA). No personal names or emails in tickets, docs, or mockups.
- **Technical detail stays as-is:** keep internal step names visible (`crew_phase_a_build`, `render_nlonly_spec`, `crew_phase_b_migrate`, "Quest") — the team relies on them. Do **not** propose renaming them.
- **Tickets:** clean, forward-only suggestions with acceptance criteria, under **Epic QG-138**. Jira: `gendvn.atlassian.net`, project **QG**.
- **Mockups: light *and* dark, always — never one alone.** Harness ships a real **Day / Night / System** switch (Settings → Appearance: *"Choose day, night, or match your operating system. Applies across all QOps Harness screens."*). A single-theme mockup cannot be evaluated against an app the user can flip. **Token source of truth: [`Harness Page/Harness_UI_Tokens_Shipped_2026-08-20.md`](../Harness%20Page/Harness_UI_Tokens_Shipped_2026-08-20.md)** — all 92 properties, both themes, read live from the running app on 20 Aug. The two 14 Aug `_Jira_Aligned` documents are the *proposal* and are now superseded for values (they remain useful for component specs and reasoning). `<html>` carries `data-appearance` (`day`/`night`/`system`) and `data-theme` (`light`/`dark`); because "System" follows the OS, honour `prefers-color-scheme` as well as an explicit choice. HTML, opened in a browser.
  > ⚠️ **Superseded 20 Aug.** This bullet used to read *"dark theme using the real `tokens.css` (green `#10a37f`, Söhne fonts)"*. That described the pre-August app. Söhne is gone — the shipped stack is the OS system font. `QOps_Harness/css/tokens.css` is now a **migration reference only**, not the target.
  > **Two rules that catch people out:** dark mode has **no shadows at all** (depth comes from a five-step surface ladder), and `--radius-pill` is **3px**, so nothing is drawn as a capsule.
- **Work-item IDs are names, not numbers** — `VOCAB`, `VALIDATE`, `CLASSIFY`, `QUEUE`, `MODEL`, `BACKFILL`, `GROUPS`, `HEATMAP`, `FILTERS`. They were `T1`–`T9` until 4 Aug; renamed because numbers implied a sequence they never had **and collided with the unrelated `T1`–`T5` UX themes in `Harness_UXUI_Review.md`**. Do not reintroduce numbered IDs.
- **Bilingual docs:** the **English file is always authoritative**; `_VN.md` files are reading copies for the team. Edit English first, then re-translate the changed section. ⚠️ Only the **English** taxonomy goes to the Knowledge base — the classifier reads it and every vocabulary value is an English identifier.
- **Live access:** `qops-harness.lab.gend.vn` uses Google SSO and needs **the user's real Chrome** (`mcp__claude-in-chrome__*`). The in-app browser has no session.
- **One Claude, not two.** A single session both holds strategy *and* drives the live page through the browser tool — there is no "Claude App vs Claude in Chrome" hand-off to maintain. For a heavy full-app screen-walk, quarantine the noise in a browsing subagent. (Corrected 6 Aug; see `Harness_Test_and_UX_Plan.md` §7.)

## 3. How Harness actually works — verified end to end, 3 Aug 2026

Walked live by creating and running request `#c1017339-45b`.

**Request lifecycle**

```
create  →  crew_phase_a_build          "Build test steps"           AI
        →  AWAITING_REVIEW             (a milestone, not just a status; re-enterable)
        →  [human clicks Confirm and process]
        →  render_nlonly_spec          "Generate Playwright spec"   AI
        →  crew_phase_b_migrate        "Migrate step automation"    AI
        →  validate_pre_run_spec       "Pre-run validation"         AI
        →  execute_run_playwright_spec "Run Playwright"             AI
        →  finalize_artifacts          "Commit & open PR"           AI
```

Statuses: `pending → running → awaiting_review → running → failed | successful`. Every milestone on the observed run carried an **AI** badge — no `Auto` steps at all.

**Case structure.** A case holds **Steps**; each step is one `NAVIGATE` action plus one or more `VALIDATION` assertions. A 6-line prompt compressed into 2 steps / 4 validations.

**New Request parameters (the real field list)**

| Field | Type | Note |
|---|---|---|
| Request mode | enum ×4 | Single test case · new feature · existing feature · bug ticket |
| Test request | text | populated from chat |
| Session file | enum | `aloha-auth.json`, `harness/session-harness-login.json`, … |
| App project | enum | `aloha` · `harness` |
| Knowledge context | multi-select | `project/aloha/README.md`, `project/aloha/aloha.md`. *"JSON locator bundles are never sent to the LLM"* |
| Environment | enum | `Platform default` · `sandbox` · `production` — **no `lab` value** |
| **Feature** | **free text** | *"Folder the generated test lands in. Auto-detected if left blank."* |
| **Labels** | **free-create** | *"Extra labels (e.g. smoke, regression)"* |
| Category | auto | assigned by the LLM (`positive` observed) |

**`Feature` is load-bearing twice** — it is simultaneously a **directory on disk** and a **grep-able Playwright tag**:

```
tests/playwright/aloha/generated/public-fund-risk/risk-model-dashboard-…-461dc2.spec.ts
… @aloha @public-fund-risk @qops › Click Risk tab and verify dashboard elements
```

**Sidebar / IA:** Requests · Test cases (Failed / All cases / Executed history) · **Test groups (Current status / Groups / History)** · Knowledge · Dashboard · Settings.

## 4. Catalog baseline — measured 4 Aug, refreshed live 6 Aug 2026

| | 4 Aug | **Live 6 Aug** (`/api/platform/cases`) |
|---|---|---|
| Cases in catalog | 287 | **313** (245 aloha + 68 harness) |
| Distinct `feature` values | ~237¹ | **203** |
| `feature` used exactly once | ~202 | **165** |
| `category` | — | **`default` on all 313** (auto-classify does nothing) |
| `labels[]` | — | **not a case field**; suggestion pool polluted with Jira keys + project names |
| Risk split across | 7 | **20 `feature` values** |

¹ The 4 Aug ~237 counted `feature` + `labels` together; the live figure is `feature` alone.

Risk's twenty values include `public-fund-risk`, `total-endowment-risk`, `total-endowment-risk-tab`… — fund scope fused into `feature`. Project names, suite names and ticket codes shared the same picker as feature areas. **The `feature` field is functioning as a second ID.** These figures were pulled read-only from the live API (method saved as the `harness-catalog-api` memory). Re-measure after `BACKFILL`.

## 5. What the platform shipped recently (and why it matters to us)

Three spec streams landed 1–3 Aug. Several overlap our proposal — **read the divergence register (§8 of the classification plan) before presenting anything.**

| Spec | What | Effect on us |
|---|---|---|
| **039** | Chroma vector index, **ANN shortlisting in layered dedup search** | Dedupe already exists. Our contribution is *scoping it by labels*, not building it |
| **040** | NATS event bus driving Execution steps | Context only |
| **041** | **Test groups** — CRUD, membership, nesting, cron schedules, webhooks, manual runs, status/history | Membership is a **hand-ticked static list**, verified 4 Aug. `GROUPS` survives, rewritten as *add query membership to the groups that already exist* |
| — | `feat(web-ui): add CaseFilterBar` | **`FILTERS` delivered.** Cases now filter on Search · Feature · Labels · Status · Reason |
| — | **Light/dark theme system + app-wide restyle** *(measured live 20 Aug)* | **D2 and D3 have effectively shipped.** Settings → Appearance offers **Day / Night / System**; the app renders in the Atlassian palette, not the old dark green. Settings has grown to nine tabs (Appearance · Configuration · Events · Queue · Secrets · Sessions · Projects · Integrations · Maintenance). All 92 tokens captured in [`Harness Page/Harness_UI_Tokens_Shipped_2026-08-20.md`](../Harness%20Page/Harness_UI_Tokens_Shipped_2026-08-20.md). **Every mockup must ship both themes** — see §2. Measurement also surfaced **five findings**, two of them candidate QG-138 bugs: `--surface-hover` is identical to `--surface` in light mode (hover is invisible in Day), and the `ai` and `duplicate` status pills are byte-identical in both themes |

🔴 **`fix(catalog): prefer managed app_project for Phase A taxonomy` (4 Aug)** — an existing taxonomy workstream. **Blocking.** See §7.

## 6. The classification workstream — this session's main output

**The problem:** test cases are generated from free-text prompts; the fields that should group them are free text filled by an LLM, and they have collapsed (§4).

**The proposal:** a closed vocabulary for the fields Harness already has, classification at request ingest, and group membership definable as a query.

**Single document:** [`00_Active/Harness_Case_Classification_Plan.md`](./00_Active/Harness_Case_Classification_Plan.md) — proposal, item specs, status (§6), metrics (§7), **divergence register (§8)**, open decisions (§9), backlog (§10).

**Build order:** `VOCAB → MODEL → CLASSIFY → QUEUE → BACKFILL → GROUPS → HEATMAP` · `VALIDATE` outside the chain · `FILTERS` delivered.

Key positions established, so they are not re-derived:

- **No RAG for the vocabulary.** It is ~800 tokens, closed, and the classifier must see it whole — retrieval would return a subset and break it. Inject it via the Knowledge base, which already pushes per-project markdown into the agent. RAG belongs where Spec 039 already put it: the case catalog.
- **Constrain with a JSON-schema `enum`, not a prompt instruction.** Turns *"should not invent a value"* into *"cannot"*.
- **`VALIDATE` is a new capability, not an improvement.** The `n / n required` meter validates only that the prompt is non-empty — two of its three conditions can never fail. The PO confirmed on 4 Aug that the counter is mismatched and will be removed or corrected; **that fix does not deliver `VALIDATE`**.

## 7. Open items — one list, not here

**Everything blocked on a person lives in [`00_Active/Open_Items.md`](./00_Active/Open_Items.md):** 6 PO decisions, 2 drafted-but-unfiled bugs, 4 small fixes. Do not duplicate them into this file.

🔴 **The one blocking everything:** *what is "Phase A taxonomy"?* Until the PO answers, the vocabulary cannot be published to Knowledge and the proposal cannot be presented as new. Four specific questions are in the plan, §9 decision 5.

*Still open from earlier sessions and not yet in `Open_Items.md`:*

- **Queue-load failure** — "Could not load queue", Refresh doesn't recover, backend `no such table: tenants`. Never ticketed.
- **"My requests" default empty state** reads as broken for a user with no requests.
- **TEST CASES counter shows 0** — root-caused to `requests-page.js` calling `setQueueParents(parents)` without counts, zeroing `_caseRunCounts`. Safer fix: make `setQueueParents` only update counts when the argument is supplied. Still reproducing 3 Aug.

## 8. Jira — Epic QG-138 and children

| Key | Type | Summary | Mockup |
|-----|------|---------|--------|
| **QG-139** | Story | Harness UX Feedback (prompt search, tagging, assignee filter, refresh rate, log export, output tracking, case→request mapping, stopping condition, duplicate validation, Runs-row nav, line-level errors) | — |
| **QG-141** | Story | Requests — filtering, identification & search | `Harness_Requests_Mockup.html` |
| **QG-142** | Bug | AI steps = 0 on every run *(AI steps now visible in Execution — re-verify or rescope)* | — |
| **QG-143** | Bug | All-cases detail panel duplicated/stacked on selection | — |
| **QG-144** | Bug | Failure screenshot shows unrelated website | — |
| **QG-146** | Story | New request — clarify test mode | `Harness_RequestMode_Mockup.html` |
| **QG-147** | Story | Show Request → Cases → Runs hierarchy with breadcrumbs | `Harness_ObjectModel_Mockup.html` |
| **QG-148** | Story | Explain the Knowledge base + link it from the request flow | — |
| **QG-149** | Story | Requests — cross-links to Cases, Runs & Knowledge | — |
| **QG-150** | Story | Explain the waiting states + state-aware output empty-state | `Harness_WaitingStates_Mockup.html` |
| **QG-151** | Story | Keep status consistent on Retry | `Harness_RetryStatus_Mockup.html` |
| **QG-152** | Story | Queue & running notification area — *shipped, with the counter bug in §7* | `Harness_NotificationArea_Mockup.html` |
| **QG-153** | — | Queue-limit select — *seen in release notes 4 Aug, not raised by us. First QG key the dev has cited in a deploy card* | — |

**Nothing from the classification workstream is filed yet** — every row in the plan's §6 has `—` in its Jira column.

## 9. Automation running

**Task: *Harness Scan*** — daily 09:30, in the Scheduled section of the Claude app.
Reads the Teams **QOps Harness** channel → appends new deploys to §3 of the release log → drops candidates into a **"⬜ Needs BA review"** list at the top of §2. It never promotes, deletes, or changes a watch-list status; that judgment stays with the BA.

Needs Chrome open, a live Teams session, and folder access approved. A disabled twin, `harness-release-log-sync`, sits at `C:\Users\XPS 9520\.claude\scheduled-tasks\` — re-enable **only** if *Harness Scan* is deleted; never run both.

## 10. Folder structure — `…\Harness\Documents\`

- **`Harness_Session_Handoff.md`** *(root)* — this file; start here for context.
- **`00_Active/`** ⭐ **the live desk — the only folder needing attention on a cadence**
  - `README.md` — **open this first.** Daily (2 min) and weekly (15 min) worklist, map of everything else, state of the automation.
  - `Harness_Release_Log.md` — **daily.** Deploy tracking, auto-updated 09:30. You triage its §2 review list.
  - `Harness_Case_Classification_Plan.md` — **weekly.** The workstream doc. `_VN.md` alongside it.
  - `Open_Items.md` — everything blocked on a person.
- **`01_Plans_and_Strategy/`** *(reference)*
  - `Aloha_Test_Case_Taxonomy.md` — the vocabulary standard alone. ⛔ Blocked on Phase A. `_VN.md` alongside it — **reading only, never publish the VN copy to Knowledge.**
  - `Harness_Test_and_UX_Plan.md` — the wider improvement loop *(current — v3.1, 6 Aug)*.
- **`02_Reviews_and_Analysis/`** *(reference)*
  - `Harness_UXUI_Review.md` — all-screens review + Function↔UI map + Part F + ticket index. *(Primary reference doc. Note: its `T1`–`T5` are UX themes, unrelated to our work items.)*
  - `Harness_Feedback_Tracker.xlsx` — ⚠️ untouched since 7 Jul; confirm QA still use it.
- **`03_Mockups/`** *(dark theme, real tokens)*
  - `Harness_TestCaseFactory_Workflow_Mockup.html` — the classification workflow: 5 phases, gates, work-item index bar, real run as worked example, axis-fusion diagnosis, build order.
  - `Harness_Workflow_Overview_Mockup.html` — the same flow on one screen, for presenting.
  - Per-ticket mockups: `Harness_Requests_Mockup.html` (QG-141) · `Harness_RequestMode_Mockup.html` (QG-146) · `Harness_ObjectModel_Mockup.html` (QG-147) · `Harness_WaitingStates_Mockup.html` (QG-150) · `Harness_RetryStatus_Mockup.html` (QG-151) · `Harness_NotificationArea_Mockup.html` (QG-152) · `Harness_Requests_Mockup_PillConcept.html` · `Harness — Requests redesign mockup.pdf`.
- **`04_QA_Reference/`** *(QA-owned)*
  - `QA_Test_Plan.md` · `Readme.txt` (Harness feature list, VN).
  - `test_case_inventory.md` — ⚠️ **superseded.** Last touched 2 Jul; 19 cases marked "Planned". The live catalog holds 287. Retire or reduce to a pointer, with the QA Lead.
- **`05_Session_Notes/`** *(archive)* — dated summaries, plus `BA_Harness_Optimization_Strategy.md` (original kickoff prompt) and `Harness_UX_Investigation_and_Proposal.md` (superseded by the UXUI Review).

*(Harness front-end source is separate, in `…\Harness\QOps_Harness\`; screenshots in `…\Harness\Harness Page\` and `…\Harness\Aloha Page\`.)*

## 11. Next steps

1. 🔴 **Ask the PO what "Phase A taxonomy" is.** Four questions in the plan §9 decision 5. Nothing else in the workstream should be presented until this is answered.
2. **Send the PO the readiness-meter root cause** — the stuck `||` in `updateReadiness()`. He is mid-decision between removing and correcting the counter; knowing the cause probably makes *correct* the cheaper option.
3. **Re-test BUG-1 before filing it.** Three deploys on 4 Aug reworked the same New Request `app_project` binding; the behaviour may have changed.
4. **Check the release log's changelog each morning** around 09:40 — a new row means the scheduled run fired.
5. **File the classification items in Jira** once Phase A is settled, and paste the keys into the plan's §6.
6. **Get a CSV export of the Cases list** if one becomes available — it would firm up the ~237 figure and size `BACKFILL` precisely.
7. **Settle the Feedback Tracker question** with QA — dormant a month; if unused, the intake channel needs rethinking.

---

*Handoff for continuation in a new session. Working desk: [`00_Active/README.md`](./00_Active/README.md).*
