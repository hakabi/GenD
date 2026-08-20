# Harness UI/UX — Session Handoff (part 2)

**Owner:** BA · **Session date:** 18–19 August 2026 · **Status:** 🟡 Draft work, nothing scheduled
**Continues:** [`Harness_UIUX_Session_Handoff_2026-08-18.md`](./Harness_UIUX_Session_Handoff_2026-08-18.md) — read that first
**Parent context:** [`Harness_Session_Handoff.md`](../Harness_Session_Handoff.md)

---

## 0. What this session was

Part 1 ended with the test-case page assessed against the live system. This session moved to **the Request page**, and answered three questions in order:

1. What should the Request page look like, given that requests are prompts and cases are the product?
2. **How should a request show the cases it produced?** — the question that mattered most
3. How do the list and the detail connect?

It produced three mockups and, along the way, **reversed one decision from part 1**. See §1.

---

## 1. Decisions

### 1.1 New decisions

| # | Decision | When |
|---|---|---|
| **D10** | All Request-page designs pair with test-case direction **B** + the Trust panel — same visual language, differing in what a request *is* | 18 Aug |
| **D11** | Each case row shows **all three layers**: full name, one plain sentence of what it verifies, and area · type · priority tags | 18 Aug |
| **D12** | Design for **~15 cases visible at once**, grouped by category — not a collapse-by-default model | 18 Aug |
| **D13** | Request detail opens as a **full page with its own URL** — not a modal, not an overlay drawer | 19 Aug |
| **D14** | The right-hand **preview pane is removed** from the list; the detail page replaces it | 19 Aug |
| **D15** | **Cases becomes the first and default tab** on the detail page; Info / Execution / History move there as supporting tabs | 19 Aug |
| **D16** | **Category groups are collapsible.** State remembered per user; *Needs your decision* always opens expanded | 19 Aug |
| **D17** | The list **keeps today's raw truncated prompt**. No derived title, no glossary. The full prompt lives on the detail page | 19 Aug |
| **D18** | **D2 (card board) is kept as a live alternative** to D1, not discarded — same chrome, different tab body | 19 Aug |

### 1.2 ⚠️ Decision reversed

> **D4 from part 1 is no longer in force.**
>
> Part 1 recorded: *"Case review moves to a 4th tab under Test Cases (Proposed)."*
>
> **19 Aug: the left navigation stays exactly as it is today** — Requests · Test cases (Failed / All cases / Executed history) · Test groups · Knowledge · Dashboards. No nav change of any kind.
>
> **Consequence:** the request detail's **Cases tab is currently the only place newly generated cases can be reviewed.** That is workable — arguably better, since the batch stays together — but there is **no cross-request "what needs my decision today" view**. If QA start asking for one, that is when a Proposed tab earns its place. It is marked *not built yet* in the navigation mockup.

---

## 2. What was produced

All in `Documents/03_Mockups/`. Nothing filed in Jira or Confluence.

| File | What it is |
|---|---|
| **`Harness_Request_UI_Matched_ABC.html`** | Request page matched 1:1 to test-case directions A / B / C — inherits both palette and organising idea from each |
| **`Harness_Request_CaseFirst_Three_Designs.html`** | **The main output.** Three ways to show the cases a request produced: D1 grouped list · D2 card board · D3 expandable sheet. 15 cases, 3 needing a decision, in each |
| **`Harness_Request_Navigation_Mockup.html`** | How list and detail connect. Four frames: widened list · detail as grouped list (2a) · detail as card board (2b) · supporting tabs (3). Plus URL map, interaction spec, and why not a modal |

Still current from part 1 and not superseded: `Harness_Request_UI_Three_Directions.html` — it asks a different question (*what is a request*: a delivery, a process, or a filter) rather than *which layout*.

---

## 3. The three case-first designs

Each shows the same request — 15 cases, 3 needing a decision — with the request shrunk to a header strip.

| | Idea | Strength | Weakness |
|---|---|---|---|
| **D1 · Grouped list** | Cases in one list grouped by category, decisions pulled to the top | Names and purposes never truncated; group headers double as bulk-accept targets | Tallest; the request header scrolls away unless pinned |
| **D2 · Card board** | One column per category | Whole batch on one screen; the *shape* of coverage is instantly readable, including what is missing | Card width forces shorter names; no equivalent of collapsing, so large batches scroll badly |
| **D3 · Expandable sheet** | Dense table, rows expand in place to show steps and expected results | The only one that lets QA verify a case is *correct*, not just plausible; conflict resolution sits beside the evidence | Densest; least friendly to a newcomer |

**Recommendation: D1 as the default, D2 as a per-user view toggle.** Their chrome is identical, so supporting both is cheap once either exists. D3 is the one to revisit when generation is trusted less.

---

## 4. Navigation model

```
/requests                        the list  (preview pane removed)
/requests/REQ-1042               detail, Cases tab (default)
/requests/REQ-1042?tab=info      the prompt and attributes
/requests/REQ-1042?tab=execution the run log
/requests/REQ-1042?tab=history   lifecycle events
```

- **Whole row is clickable**; the request key is the visual affordance. The checkbox selects without navigating
- `↑ ↓` then `Enter` to open; `Esc` or browser back returns with scroll, filters and selection preserved
- Tab choice is in the URL, so a failure's execution log can be linked directly

**Why a full page and not a modal or drawer:** the task is a 5–10 minute working session across 15 cases, not one short decision. Modals imply finish-or-cancel and break on interruption. Drawers cannot host D2's five columns or D3's expanded steps. And the decisive practical point — **QA will want to paste "look at REQ-1042" into Jira or Slack, and only a URL does that.**

---

## 5. The long-prompt question — decided, and the reasoning removed from the mockup

This was worked through in detail and then deliberately cut from the deliverable, so **this is now the only record of it.**

**The problem.** The mockups originally showed clean titles like *"Risk dashboard — Total Risk table & download report"*. **No such field exists.** The real value is a multi-line script:

```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Risk tab
Click on Output subtab
Validate that after reload, Total Risk as of 2026-08-18 table is being displayed
Report the Weight number of Total Fad
```

**What was investigated.** `Open_Items.md` records that a good name already exists and is not displayed — the generated spec slug, e.g. `risk-model-dashboard-total-risk-table-and-download-report-461dc2`. Three mechanical string operations (strip the `-[0-9a-f]{6}` suffix, hyphens to spaces, capitalise the first letter) turn it into *"Risk model dashboard total risk table and download report"*. No human, no LLM.

**What was decided (D17):** **not to do it now.** Keep today's raw truncated prompt in the list, clamped to two lines so row heights stay uniform. The full prompt is on the detail page under Info, which is what makes truncation acceptable.

**Kept for later, if it is ever wanted:**

- Surface the generated spec slug on the request object — already produced and stored, just not exposed. Would also fix cases displaying as `Direct test` in the catalog, which has the same root cause
- Proper-noun capitalisation from a glossary — the Aloha taxonomy could supply it
- Raise the slug length limit. Live feature values are cut mid-word at ~47 characters (`application-loads-without-redirect-loop-and-disp`). **Whether spec slugs share that limit was never verified** — worth one question to the dev team

**Honest consequence of D17:** rows still look alike at a glance, because every prompt opens with the same project and URL boilerplate. Differentiation now comes entirely from the Outcome, Cases, Needs you and Age columns. That is a real improvement over today, but a different one from what the mockup originally claimed.

---

## 6. Open items

Carried forward from part 1, still open: **O1** why triage is not happening (86 of 87 unlabelled) · **O2** populate `FAILED STEP` · **O3** complete run telemetry · **O4** two bug tickets offered but not written · **O5** copy the three scratchpad files into the repo · **O6** fate of Confluence page `534642709` · **O7** Phase 0 measurements not run · **O8** confirm dropping direction A · **O9** verify Atlassian token values.

New this session:

| # | Item | Note |
|---|---|---|
| **O10** | **Do the two entry points stay in sync?** A case accepted in the request detail must immediately disappear from any Proposed view. If that is expensive, better to know now — two views disagreeing about one case would destroy trust in both | Dev |
| **O11** | **Is the generated spec slug truncated, and at what length?** Only feature values were observed being cut. Not blocking D17, but decides whether the deferred title work is worth doing | Dev |
| **O12** | **Nothing generates the plain-language "what it verifies" line.** Case names exist; a one-sentence purpose does not. All three case-first designs assume it | Dev / PO |
| **O13** | **D1 vs D2 vs D3 not chosen.** Recommendation is D1 default + D2 toggle, unconfirmed | PO |
| **O14** | **Hover-preview on the list deliberately not designed.** Add only if QA ask for it after using the full-page version | BA |

---

## 7. Recommended next steps

Unchanged in priority from part 1 — **the first three still require no design work at all**:

1. Establish why triage is not happening (O1)
2. Populate `FAILED STEP` (O2)
3. Complete run telemetry (O3)
4. Then: choose between D1 / D2 / D3 and confirm the navigation model
5. Then: the list-to-detail change, which is mostly deletion — remove the preview pane, add a route

> **The line to repeat:** the screens are further along than we assumed; what is missing is data reaching them.

---

## 8. Working notes

- **Live Harness needs real Chrome** (Google SSO); the in-app browser lands on the sign-in page
- **Confluence attachments cannot be created through the available tooling** — HTML files must be dragged in by hand
- **Mockup files use HTML entities inconsistently** — some use `&mdash;`/`&middot;`, others the literal characters. Bulk edits by script need to check which before matching
- **Nothing this session has been ticketed**, per D9 in part 1

---

## Changelog

| Date | Change |
|---|---|
| 2026-08-19 | Created. Covers the Request-page workstream, 18–19 Aug. Records the reversal of D4 |
