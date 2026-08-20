# Harness — Test-Case Classification: Plan, Spec & Status

**Owner:** BA · **Version:** 1.5 · **Created:** 3 August 2026 · **Status table last updated:** 6 August 2026
**Epic:** [QG-138 — Harness Automation Test](https://gendvn.atlassian.net/browse/QG-138)
**Mockup:** [`Harness_TestCaseFactory_Workflow_Mockup.html`](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html) · overview: [`Harness_Workflow_Overview_Mockup.html`](../03_Mockups/Harness_Workflow_Overview_Mockup.html)
**The standard:** [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) — the vocabulary itself lives there
**Release tracking:** [`Harness_Release_Log.md`](./Harness_Release_Log.md) — Harness ships several times a day
**Tiếng Việt:** [`Harness_Case_Classification_Plan_VN.md`](./Harness_Case_Classification_Plan_VN.md) — translation of v1.3. **This English file is authoritative**; update it first, then re-translate the changed section.

> **This is the single document for this initiative.** Proposal (§1–§5), build status (§6), health metrics (§7),
> **divergence register (§8)**, open decisions (§9) and future backlog (§10).
>
> **§6 is the only place status is recorded.** Update it there and nowhere else.
>
> **§8 is where to look if you want to know how our proposal differs from what Harness actually does today.**
> Harness is being built in parallel with this plan; several items have already been delivered, and one may
> collide with existing work. Read §8 before presenting anything to the PO.
>
> **Framing update (6 Aug — v1.5).** The scheme is now expressed as **three fields** — `feature`
> (`area/sub-area`), `category`, and a namespaced multi-valued `labels[]` — matching the three fields Harness
> already exposes. The old "five axes" put `label` (suite) and `tags[]` in separate columns; those now live
> **inside `labels[]`** with namespaces (`suite:`, `fund:`, `env:`, `pri:`, `metric:`, `jira:`). `project` is an
> ambient selector, not a classification field. **No vocabulary changed** — see
> [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) v3.0 and
> [`De_Xuat_Phan_Loai_3_Truong_VN.md`](../01_Plans_and_Strategy/De_Xuat_Phan_Loai_3_Truong_VN.md).

---

## 1. Summary — one page for the PO

**The problem.** Test cases are generated from free-text prompts. The fields that should group them — `Feature` and `Labels` — are free text filled in by an LLM, and they have collapsed.

**Measured on the live system, 4 August 2026:**

| | |
|---|---|
| Cases in the catalog | **287** |
| Distinct `Feature` / `Labels` values | **~237** |
| Of those, values that are truncated case titles | **~202** |
| Effective cases per grouping value | **≈ 1.2** |

**The grouping axis is not grouping anything. It is functioning as a second ID.**

**The proposal.** Give Harness a closed vocabulary for the fields it already has, classify each request against it at ingest, and let group membership be definable as a query rather than a hand-ticked list.

**Why now.** `Feature` is a **directory on disk** and a **Playwright tag**. Every drifted value permanently fragments the test repo and breaks tag-based runs. Waiting does not mean "messier labels later" — it means more directories to migrate and a longer backfill.

**What it costs.** Less than first estimated. Facet filtering shipped on 3 Aug, semantic dedupe shipped on 1 Aug, and Test groups shipped on 3 Aug. What remains is mostly **governance**, not construction — see §8.

---

## 2. The problem, with evidence

All observed on the live system, not inferred.

**2.1 The vocabulary has collapsed.** 237 distinct values for 287 cases. The ~35 values that are genuinely meaningful show the drift pattern clearly:

| One intent | Values actually in use |
|---|---|
| **Risk** | `risk-dashboard` · `risk-history` · `risk-scenario-testing` · `public-fund-risk` · `total-endowment-risk` · `total-endowment-risk-history` · `total-endowment-risk-tab` |
| **Pipeline** | `pipeline` · `pipeline-navigation` · `pipeline-tab` |
| **Search** | `search` · `fund-search` · `search-and-navigation` |
| **Overview** | `endowment-overview` · `overview-fund-selection` · `public-fund-overview` |
| **Rating** | `rating` · `fund-rating` |

Seven values for Risk alone. Mixed into the same pickers are project names (`aloha`, `harness`), suite names (`regression`, `demo-only`) and ticket codes (`FNC-001`, `PL-UI`, `UI-001`) — three different axes sharing one field.

**2.2 The other ~202 values are truncated case titles**, cut mid-word at ~47 characters:

```
all-cases-list-loads-with-pagination-or-scrollab
app-redirects-to-case-review-with-case-review-pa
application-loads-without-redirect-loop-and-disp
calendar-table-is-displayed-when-clicking-the-ca
```

A value that applies to exactly one case groups nothing.

**2.3 `Feature` is load-bearing twice.** Help text: *"Folder the generated test lands in. Auto-detected if left blank."* The generated artefacts:

```
tests/playwright/aloha/generated/public-fund-risk/risk-model-dashboard-…-461dc2.spec.ts
… @aloha @public-fund-risk @qops › Click Risk tab and verify dashboard elements
```

So `--grep @risk` returns nothing useful, because the tag is `@public-fund-risk`, `@risk-dashboard`, or `@total-endowment-risk-tab` depending on who wrote the prompt.

**2.4 Volume is still climbing.** ~94 distinct testable behaviours across Aloha; ~260–320 cases at full fund-scope coverage. The catalog is already at 287.

---

## 3. Scope

**In scope** — a closed governed vocabulary; automatic classification at ingest with a human fallback; label-scoped duplicate detection; query-defined group membership.

**Out of scope** — how cases are generated or executed; internal step names (`crew_phase_a_build`, `render_nlonly_spec`, …) which the team relies on; the Aloha application; re-authoring existing cases (BACKFILL relabels, it does not rewrite).

---

## 4. How it works

The full flow is drawn in [the workflow mockup](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html). In words — **each §5 item is named in bold where it appears**, so this section doubles as a map into the specs:

A QA writes a request in plain English, optionally naming the area. Harness validates the request (**`VALIDATE`** — today this check is far thinner than it appears), then classifies it (**`CLASSIFY`**) — deterministic keyword rules first because they are free, then the LLM for whatever the rules could not resolve, always choosing from a closed list supplied by the Knowledge base (**`VOCAB`**). If the classifier is not confident, the request lands in a "Needs labeling" queue (**`QUEUE`**) rather than being guessed at.

The request is checked for duplication against prior requests in the same area. Harness builds the test steps, expands them into a family of cases where the mode calls for it, and each generated case inherits the parent's `feature` and `labels[]` (**`MODEL`**) — only the `category` (test type) differs between siblings. Each case is checked against existing cases in the same group before entering the catalog.

QA reviews and confirms, the automation is built and executed, and failures are triaged. Because every case carries labels, failures cluster by area instead of arriving as a flat list.

Finally the labels make the catalog navigable: groups can be defined by query so new cases join automatically (**`GROUPS`**), a coverage grid shows which area × type combinations are empty (**`HEATMAP`**), and an impact query answers which cases touch a given financial metric. Those gaps drive the next request — the loop closes.

> **Two items are deliberately absent above.** **`BACKFILL`** is a one-time migration over the 287 existing
> cases, not part of this steady-state flow. **`FILTERS`** was delivered by the platform on 3 Aug, so there is
> no future work left to describe.
>
> **The two duplicate checks** in the second paragraph are Gate C (request-level) and Gate E (case-level) from
> the mockup. Neither is a separate build item — Harness already ships vector/ANN dedupe, so our contribution
> is scoping it by labels. See §8 D3.

**Vocabulary is not defined here.** It lives in [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) so it can be copied into the Knowledge base as `project/aloha/ALOHA-TAXONOMY.md`.

### 4.1 A worked example

A real request — `#c1017339-45b`, submitted 3 August 2026. Below is how it would travel under §5, followed by what actually happened to it on the day.

**What QA writes**

```
Project: aloha
Area: risk                        ← optional; the classifier infers it if omitted
Go to workbench-app.lab.gend.vn
Assume the menu 'Public Fund' is displayed.
Click on the 'Risk' tab.
Verify the 'Risk Model Dashboard' is displayed.
Verify the 'Total Risk' table is displayed.
Verify the 'Download Report' button is displayed.
```

**How it travels**

| # | Stage | Item | What happens |
|---|---|---|---|
| 1 | Gate A | **`VALIDATE`** | `Project: aloha` present ✓ · target URL present ✓ · `Risk` is a real Aloha tab ✓ → passes silently. Had it read `Fun Setup`, it would offer *"did you mean Fund Setup?"* **before** submit, not after a failed run |
| 2 | Rules pass | **`CLASSIFY`** | `'Risk' tab` → `feature: risk` · `'Public Fund'` → `fund:public` · `workbench-app.lab.gend.vn` → `env:lab` · `Total Risk` → `metric:risk`. Deterministic, no tokens spent |
| 3 | LLM pass | **`CLASSIFY`** + **`VOCAB`** | Only `sub_area` is still open. Picks `dashboard` from the closed list. **Cannot invent `public-fund-risk`** — that value is not in the vocabulary |
| 4 | Gate B | **`QUEUE`** | Confidence `0.94` ≥ 0.80 → applied automatically. Below the threshold it would wait in the Needs-labeling queue instead of being guessed |
| 5 | Gate C | *(§8 D3)* | Compared for duplicates against prior requests in `aloha/risk/dashboard` only — about 7 candidates, not 287 |
| 6 | Generate | *(exists)* | Test Feature mode expands it into a family: positive / negative / boundary |
| 7 | Inherit | **`MODEL`** | Every child inherits `feature:risk/dashboard` and every label (`fund:public`, `env:lab`, `metric:risk`). Only `category` differs between siblings |
| 8 | Gate E | *(§8 D3)* | Each generated case is checked against those same ~7 before entering the catalog |

**The labels it ends up carrying**

```json
{ "project": "aloha", "feature": "risk/dashboard",
  "category": "positive",
  "labels": ["suite:smoke", "fund:public", "env:lab", "pri:P1", "metric:risk"] }
```

**What that unlocks the moment it lands**

| Query | Returns |
|---|---|
| `--grep @risk` | every Risk case, across all four fund tabs |
| `feature:risk AND label:smoke` | a **`GROUPS`** suite this case joins **without anyone editing the group** |
| `metric:risk` | the impact set — what must re-run if the risk calculation changes |
| **`HEATMAP`** cell `risk × negative` | whether that combination is still uncovered |

**What actually happened to this request on 3 August**

| | Observed |
|---|---|
| `Feature` | **`public-fund-risk`** — invented by the LLM. Now a directory on disk *and* a Playwright tag |
| `Labels` | *(empty)* |
| Cases produced | one, named **"Direct test"** |
| `--grep @risk` | returns nothing — the tag is `@public-fund-risk` |
| Grouping value shared with | no other case |

Same prompt, same system. The only difference is whether the vocabulary is closed.

### 4.2 The same example, mapped onto the three fields

The taxonomy is still **faceted** — but delivered through **three fields**, defined in [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) §1. Here is where each dimension of the example above actually gets its value:

| Field | Dimension(s) | Value in the example | Filled at | By |
|---|---|---|---|---|
| `project` *(ambient)* | app under test | `aloha` | Phase 1 — the `Project:` line, pre-filled from the sidebar default | *(exists)* |
| **`feature`** | area **+ sub-area** | `risk/dashboard` | Phase 2 — `'Risk' tab` matched a keyword; sub-area from the LLM pass | **`CLASSIFY`**, constrained by **`VOCAB`** |
| **`category`** | test type | `positive` | Phase 3 — assigned per generated case | *(exists — auto-assigned today)* |
| **`labels[]`** | suite + fund + env + priority + metric (namespaced) | `suite:smoke` · `fund:public` · `env:lab` · `pri:P1` · `metric:risk` | Phase 2, rules pass — all came from prompt text | **`MODEL`** makes it a namespaced array, **`CLASSIFY`** fills it |

**Three things this table makes visible.**

**Only `category` differs between siblings.** When the family expands to positive / negative / boundary, `feature` and every `labels[]` value are inherited **identically** — `category` is the sole variable. That is exactly what "inherit the parent's labels" means, and it is why a family stays together as a group.

**The expensive step does the least work.** The deterministic rules pass fills `feature`'s area and every `labels[]` value straight from prompt text. The LLM is asked for one thing only: the `feature` sub-area. That is the whole cost argument for rules-before-LLM.

**`feature` and `category` are single-valued and closed; `labels[]` is multi-valued and namespaced.** That split is deliberate: closed single values make grouping deterministic (a case is in exactly one leaf group), while the namespaced multi-valued `labels[]` is what makes cross-cutting queries possible. `metric:risk` and `fund:public` cut *across* areas — they could never do that if they were folded into `feature`.

**And that is precisely what went wrong.** The observed value `public-fund-risk` is **`feature` and a `fund:` label fused into a single token** — the feature area (`risk`) welded to the fund scope (`fund:public`). One value doing two jobs is why **twenty** live Risk variants exist, why `--grep @risk` returns nothing useful, and why 313 cases produced 203 `feature` values.

| Query in §4.1 | Fields it uses |
|---|---|
| `--grep @risk` | `feature` |
| `feature:risk AND labels contains suite:smoke` | `feature` + `labels[]` |
| `labels contains metric:risk` | `labels[]` |
| **`HEATMAP`** grid | **`feature` × `category`** — the grid *is* two fields crossed |

---

## 5. The changes

**The full set, in build order.** Items are named, not numbered — the set has changed twice already
(FILTERS was delivered by the platform, VALIDATE was added later), and any numbering would go out of
sequence again. Sections below follow this order.

| | Item | One line |
|---|---|---|
| 1 | **`VOCAB`** | Close the vocabulary on `Feature` and `Labels` — **ship first** |
| 2 | **`MODEL`** | Add `feature` sub-area; make `labels[]` a namespaced array |
| 3 | **`CLASSIFY`** | Classify each request at intake |
| 4 | **`QUEUE`** | "Needs labeling" queue for low-confidence results |
| 5 | **`BACKFILL`** | Re-classify the 287 existing cases — must follow `VOCAB` |
| 6 | **`GROUPS`** | Query-defined membership for the groups that already exist |
| 7 | **`HEATMAP`** | Coverage grid on the Dashboard — build last |
| — | **`VALIDATE`** | Validate the request at intake (Gate A). **Outside the chain** — blocks nothing, ship any time after §9 decision 1. Described second below because it pairs with `VOCAB` in the same dialog |
| ✅ | ~~`FILTERS`~~ | Facet filters on the Cases list — **delivered by the platform 3 Aug** |

> **Note on naming.** These were `T1`–`T9` until 4 Aug. They were renamed because the numbers implied a
> sequence they never had, and because `Harness_UXUI_Review.md` already uses `T1`–`T5` for a different set
> of cross-cutting UX themes. Mapping is in the changelog.

### VOCAB — Enforce a closed vocabulary on `Feature` and `Labels`

**The highest-value change, and the one that must ship first.** Both fields accept anything, so every request can mint a new value — which is how 287 cases produced 237 values. `Feature` becomes a directory and a Playwright tag, so the damage is permanent rather than cosmetic.

Replace free-text entry with selection from the approved list. Authors who need a new value request it; the request goes to whoever owns the vocabulary (§9, decision 3).

*Accepted when:*
- `Feature` and `Labels` can only be set to approved values, from the UI **and** from the LLM path
- An author can request a new value without being blocked from finishing their request
- An unapproved value gives a clear message naming the nearest approved value
- Existing values still display on old cases — nothing breaks retroactively

### VALIDATE — Validate the request at intake (Gate A)

**The `1 / 2 required` meter does not validate what it appears to.** Verified 3 Aug by reading every field badge on a fresh dialog, then the logic in `QOps_Harness/index.html`:

```js
if (p.request_mode) filled++;                    // always true — request_mode has a default
if (p.user_input.trim()) filled++;               // the prompt — the only one that can fail
if (p.session_file || p.request_mode) filled++;  // always true — see §10
submitBtn.disabled = !p.user_input.trim() || !ticketOk;
```

The effective rule is **"the prompt is not blank"**. Nothing checks that `Project: aloha` is present or spelled correctly, that a URL exists, or that a feature name is real — which is the failure behind the parked open case (a "Fun Setup" typo fails silently after the run, not before it).

This is a **new capability, not an improvement**. Failure behaviour is the PO's call — §9 decision 1; recommendation is auto-suggest, never block.

*Accepted when:*
- A request missing a project, a target, or a recognisable action is flagged **before** submission
- The flag names the problem and offers a corrected value acceptable in one click
- A likely typo in a feature or menu name is surfaced as a suggestion
- The author can always override and submit anyway

> **The readiness meter itself is out of scope for VALIDATE — the PO owns it.** On 4 Aug the PO confirmed it is
> meant to show *the number of fields still needing input*, that it is currently mismatched, and that it will
> **either be removed or corrected**. Probable cause in §10.
>
> **Keep the two separate.** Once corrected, the dialog will honestly report "0 fields still need input" —
> and still accept a request with a `Fun Setup` typo. VALIDATE is not satisfied until something checks *content*.

### MODEL — Add the `feature` sub-area; make `labels[]` a namespaced array

`category` already exists and is auto-assigned; a `Labels` multi-select already exists. What is missing is the second level of `feature` (the sub-area) and a namespace convention on `labels[]`.

*Accepted when:*
- A case's `feature` can carry a sub-area (`area/sub-area`, ≤ 2 levels)
- `labels[]` accepts multiple **namespaced** values (`suite:`, `fund:`, `env:`, `pri:`, `metric:`, `jira:`) and returns them as a list from the API
- Both appear on the case detail panel and in any case export

### CLASSIFY — Classify at ingest

Deterministic keyword rules first, LLM for the remainder, vocabulary read from the Knowledge base — which already injects per-project markdown into the generation agent, so no new configuration store is needed. The classifier must never invent a value; if nothing fits it returns `unclassified` with an explanation.

*Accepted when:*
- Every new request receives `project`, `feature` (with sub-area), `category` and namespaced `labels[]`
- The classifier returns a confidence score and a short rationale
- Out-of-vocabulary values are never produced; `unclassified` is returned instead
- Updating the Knowledge markdown updates the classifier

### QUEUE — "Needs labeling" queue

Where low-confidence and `unclassified` requests wait for a human. The Case Review triage panel already implements the pattern — clone it.

*Accepted when:*
- Below-threshold requests appear in a dedicated queue rather than being auto-applied
- A reviewer can set correct values in one screen without reopening the request
- The queue shows a count, so it is visible when it grows
- Clearing an item records who labelled it

### BACKFILL — Backfill existing cases

Runs the classifier over the catalog. Must come **after** VOCAB, or cases get labelled twice. **Scope is now known: 287 cases, ~237 distinct values, ~202 of them single-use.**

*Accepted when:*
- Every existing case has been through the classifier
- Low-confidence results go to the QUEUE queue rather than being applied silently
- A before/after report shows the distinct-value count falling toward the target
- No case is modified other than its classification fields

### GROUPS — Query-defined group membership *(rewritten — see §8 D2)*

**Test groups shipped on 3 Aug and membership is a static list.** The group editor offers *Add cases from catalog* — filter, tick, **Add selected** — plus per-row **Remove**. The filters are a finding aid, not a membership rule; nothing re-evaluates, so a new matching case does **not** join a group until somebody remembers to tick it.

The original GROUPS ("build saved-query suites") is therefore obsolete. What remains is much smaller: **add a query-defined membership mode to the groups that already exist.**

*Accepted when:*
- A group can be defined by a saved filter (e.g. `feature:risk AND label:smoke`) instead of an explicit list
- A newly created case matching the filter appears in the group without anyone editing it
- Static and query-defined groups can coexist; existing groups are unaffected
- The group shows how many cases currently match before it runs

### HEATMAP — Coverage heatmap

A `feature` × `category` grid of case counts on the Dashboard. Empty cells are the backlog. Build last — only worth looking at once real label data exists.

*Accepted when:*
- The grid shows counts for every area × type combination
- Empty and thin cells are visually distinct
- Clicking a cell opens the Cases list filtered to it

### ~~FILTERS — Facet filters on the Cases list~~ ✅ **DELIVERED 3 Aug 2026**

Shipped as `feat(web-ui): add CaseFilterBar and wire Cases toolbars`. The All cases page now filters on **Search · Feature · Labels · Status · Reason**, with Feature and Labels as multi-selects. QG-139's prompt-search item is covered by the same work. **No further action.**

---

## 6. Status — **the only place status is recorded**

**Last updated:** 4 August 2026 · **Updated by:** BA

Status values: `Idea` · `Specified` · `In Jira` · `In progress` · `Built` · `Verified` · `Delivered by platform`

| # | Change | Status | Jira | Note |
|---|---|---|---|---|
| VOCAB | Closed vocabulary on `Feature` + `Labels` | Specified | — | **Ship first.** 237 values / 287 cases. Blocks BACKFILL |
| VALIDATE | Validate the request at intake (Gate A) | Specified | — | Not an improvement — current check is only "prompt is not blank". Blocked on §9 decision 1. Readiness counter is a separate PO-owned fix |
| MODEL | Add `feature` sub-area; make `labels[]` namespaced | Specified | — | Smaller — `Labels` and `Category` already exist |
| CLASSIFY | Classify at ingest | Specified | — | Vocabulary sourced from Knowledge |
| QUEUE | "Needs labeling" queue | Specified | — | Clone the Case Review triage pattern |
| BACKFILL | Backfill existing cases | Specified | — | **Scope known: 287 cases.** Must follow VOCAB |
| GROUPS | Query-defined group membership | Specified (**rewritten**) | — | Test groups shipped 3 Aug with static membership. Now an add-on, not a build |
| HEATMAP | Coverage heatmap | Specified | — | Build last |
| ~~FILTERS~~ | ~~Facet filters on Cases list~~ | ✅ **Delivered by platform** | — | Shipped 3 Aug (`603ecde`). Closed |

**Build order:** VOCAB → MODEL → CLASSIFY → QUEUE → BACKFILL → GROUPS → HEATMAP
**VALIDATE sits outside that chain** — it blocks nothing and can ship whenever the PO settles §9 decision 1. Pairing it with VOCAB is efficient: both change the New Request dialog.

**Measured baseline (4 Aug 2026)** — re-measure after BACKFILL:

| Metric | Value |
|---|---|
| Cases in catalog | 287 |
| Distinct `Feature` / `Labels` values | ~237 |
| Single-use values (truncated titles) | ~202 |
| Meaningful values | ~35 |
| Target after VOCAB + BACKFILL | ~45 leaf groups |

**Supporting artefacts**

| Artefact | Status |
|---|---|
| Taxonomy standard (`Aloha_Test_Case_Taxonomy.md`) | Draft v2.x — awaiting PO sign-off |
| Workflow mockup | Verified against live system 4 Aug 2026 |
| Vocabulary published to Knowledge as `project/aloha/ALOHA-TAXONOMY.md` | Not started — **blocked on §9 decision 5 (Phase A taxonomy)** |
| Golden set of 30–50 hand-labelled cases | Not started |
| Catalog baseline | ✅ Obtained 4 Aug — see above |

---

## 7. How we monitor it

| Metric | Target | Why it matters |
|---|---|---|
| **Distinct `Feature` values** | 237 → ~45 | The single clearest sign the vocabulary is holding |
| **% of cases classified** | > 95% | The complement is the "Needs labeling" backlog |
| **Needs-labeling queue depth** | stable, not growing | A growing queue means the vocabulary does not fit reality — fix the vocabulary, not the queue |
| **Classifier accuracy on the golden set** | ≥ 90% `feature`, ≥ 80% `sub_area` | Prevents silent drift |
| **Leaf group size** | 8–15 cases | Over ~25 split, under 3 merge |
| **Coverage grid gaps** | shrinking | The backlog, made visible |

**If VALIDATE ships:** track how often validation interrupts, and how often the suggestion is accepted unchanged. ~5% interruption is a safety net; 80% means the defaults are wrong. Acceptance near 100% means it should have applied the fix silently.

**Newly available:** `feat(web-ui): show last Playwright duration on cases and requests` (4 Aug) persists run duration. Duration per feature area would show which parts of Aloha are slow to test — candidate addition once labels are trustworthy.

---

## 8. Divergence register — where the system differs from this plan

**Read this before presenting anything.** Harness is being built in parallel. Every row was verified on the live system or in the release notes; none is inferred from documentation.

| # | What this plan proposed | What the system actually does | Verdict | Action |
|---|---|---|---|---|
| **D1** | **FILTERS** — build facet filters on the Cases list | Shipped 3 Aug: Search · Feature · Labels · Status · Reason, multi-select | ✅ **Delivered** | FILTERS closed. No work |
| **D2** | **GROUPS** — suites as saved queries so cases self-file | **Test groups** shipped 3 Aug with cron scheduling, webhooks, nesting, manual run, status/history — but **membership is a hand-ticked static list** | ⚠️ **Partial, different shape** | GROUPS rewritten as *add query membership to existing groups*. Much smaller |
| **D3** | **Gate C / E** — build label-scoped duplicate detection | Spec 039 (1 Aug) already ships a **Chroma vector index with ANN shortlisting in layered dedup search** | ⚠️ **Different mechanism, complementary** | Reframe as *"scope the existing ANN shortlist by labels"*, not *"build dedupe"*. Cheaper argument |
| **D4** | Our taxonomy is the classification scheme for Aloha cases | A **"Phase A taxonomy"** already exists — `fix(catalog): prefer managed app_project for Phase A taxonomy`, 4 Aug | 🔴 **Unknown — possible collision** | **Blocking.** §9 decision 5. Do not publish the vocabulary until answered |
| **D5** | Case IDs of the form `ALO-CF-HYPFLOW-003` | `case_id` is now **the unique catalog identity**, with a repair CLI (`repair-catalog-case-ids --apply`), 3 Aug | ⚠️ **Conflict risk** | Our IDs must sit **alongside** `case_id`, never replace it. Treat ours as a display/grouping alias |
| **D6** | Triage vocabulary is 6 values (`unlabeled / product_bug / test_bug / flaky / env / wont_fix`) | Live **Reason** filter offers **4**: `Unlabeled · Product bug · Test defect · Feature unavailable` | ✏️ **Correction** | The 6-value list came from the repo's design copy, not the product. Live is authoritative — see §11 |
| **D7** | Groups needed building from scratch | Groups already have cron schedules, webhooks, parent/child nesting with a resolve set, manual runs, status & history, and a **Groups** tab on each case | ✅ **System ahead of plan** | Adopt what exists. Do not re-specify any of it |
| **D8** | ~45 leaf groups for ~300 cases (6–15 cases each) | 237 distinct values for 287 cases — **≈ 1.2 cases per value** | 🔴 **Gap quantified** | The target is unchanged; the distance to it is now measured. Strengthens VOCAB and sizes BACKFILL |
| **D9** | `Feature` is free text filled by the LLM | Confirmed — and it is populated with the **truncated case title** for ~202 of 287 cases | ✅ **Confirmed, worse than described** | Already reflected in §2 |

**How to use this table.** When a T-item is challenged, check here first — the answer is usually that the platform already did part of it. When adding a new proposal, add a row here rather than silently assuming the system does not already have it.

---

## 9. Open decisions

**5. 🔴 What is "Phase A taxonomy"? — PO. BLOCKING.**

> `fix(catalog): prefer managed app_project for Phase A taxonomy` — 4 Aug 2026, commit `5235d30`

There is an existing taxonomy workstream with its own phase naming, and it is being actively worked on. **Do not publish our vocabulary to the Knowledge base, and do not present it to the PO as a new idea, until this is answered.**

*Questions to ask:*
1. What does Phase A taxonomy classify — cases, projects, or something else?
2. Where is it documented, and is there a Phase B?
3. Does it define a controlled vocabulary, or only a data model?
4. Should our Aloha vocabulary sit inside it, extend it, or replace it?

*Until answered, treat §§2–7 of this plan as a proposal for a slot that may already be filled.*

**1. Gate A behaviour — PO.** Block and require a fix, auto-suggest a correction for one-click confirmation, or just warn? *Recommendation: auto-suggest.* Blocking turns QA into string-formatters; warning keeps today's silent failures.

> **Reframe this when you take it to the PO.** The question has been discussed as *"should we tighten
> validation?"* — but VALIDATE establishes there is effectively **no** validation beyond a non-empty prompt.
> The choice is not tighter-vs-looser; it is whether to have the check at all.
>
> **Do not let this close on the counter fix.** Two separate things:
>
> | | Status |
> |---|---|
> | The `n / n required` counter is wrong | PO confirmed 4 Aug — fix pending |
> | Nothing verifies `Project:`, the URL, or a typo | **Open — this decision** |

**2. Backfill or label-forward — PO.** Relabel the catalog (BACKFILL) or label new cases only? *Recommendation: backfill* — 287 cases with 202 single-use values will not age out on their own, and the `Feature` directories are a migration cost either way.

**3. Vocabulary ownership — PO.** Who approves a new area or sub-area: PO alone, or PO plus QA Lead? Without a named owner the list either freezes or drifts.

**4. Add `lab` to the Environment enum — PO/dev.** Values are `Platform default` / `sandbox` / `production`; the QA Test Plan mandates `workbench-app.lab.gend.vn`. The prompt URL does win at run time, so this is cosmetic — but the chat says *"I've set the environment to sandbox as requested"* when no such request was made.

**6. Golden set — BA/QA.** Who hand-labels the 30–50 cases used to measure classifier accuracy? `Harness_Golden_Case_Template.xlsx` may already exist — only an orphaned lock file is in the repo.

---

## 10. Backlog

**From the classification work**

- **Subsumption detection.** Duplicate checking has three outcomes, not two: exact duplicate, semantic duplicate, and *subsumption* — a new case that is a superset of an existing one (existing asserts NAV is numeric; new asserts NAV **and** Beta). Subsumption passes a duplicate check and gets created as a near-twin. Most common in practice, and the quiet cause of catalog bloat. Right action: *"extend the existing case?"*
- **Level 3 — coverage-driven generation.** The heatmap proposes the requests that fill empty cells. Only meaningful once HEATMAP has real data.
- **Expand the `metric:` facet** as new Aloha metrics ship.

**Adjacent fixes noticed while verifying**

- **Dead condition in the readiness meter — likely the cause of the mismatch the PO described.** In `QOps_Harness/index.html` → `updateReadiness()`:

  ```js
  if (p.request_mode) filled++;                    // always true — request_mode has a default
  if (p.user_input.trim()) filled++;               // the prompt — the only one that can fail
  if (p.session_file || p.request_mode) filled++;  // always true — the `|| p.request_mode` makes
                                                   // the session_file half unreachable
  ```

  Two of three conditions can never fail, so the counter permanently over-reports. **Hand this to the PO before he chooses** — knowing the cause is a stuck `||` probably makes *correct it* cheaper than *remove it*.

- **New request dialog opens pre-filled with a previous request** and cannot be cleared; queue selection cannot be deselected. Bug tickets drafted 3 Aug. Possibly a regression from `d0b06e7` / `603ecde`, which both touched Cases/Groups UI the evening before it was seen.
- **Surface the spec slug in Case Review.** The UI shows "Direct test"; the generated spec is `risk-model-dashboard-total-risk-table-and-download-report-461dc2`. The good name exists — it just is not displayed.
- **Failure output stops one level too high.** A failed run reports `Playwright run failed (exit 1)` without naming the failing assertion. QG-139's "output tracking" item, reproduced 3 Aug.
- **Fix the false confirmation message** described in §9 decision 4.

---

## 11. Reference

| Term | Meaning |
|---|---|
| **Field / facet** | A classification dimension. Delivered through three fields — `feature`, `category`, `labels[]` — the last multi-valued and namespaced, so it carries several dimensions at once |
| **Area** | The Aloha module a case belongs to. Stored in Harness's `feature` field |
| **Sub-area** | Second level under an area, e.g. `risk/dashboard`. Maximum depth two |
| **Leaf group** | An area + sub-area pair. Sized at 8–15 cases |
| **Query-defined group** | A group whose membership is a saved filter. Cases join by matching — *not* how groups work today (§8 D2) |
| **Golden set** | 30–50 hand-labelled cases used to measure classifier accuracy over time |
| **`unclassified`** | The classifier's honest "I don't know". A work queue, never a resting place |
| **Reason** *(live)* | Harness's triage field. **Four** values: `Unlabeled` · `Product bug` · `Test defect` · `Feature unavailable`. Distinct from `category` (positive/negative/…) |

**Related documents**

| Document | What it holds |
|---|---|
| [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) | The vocabulary and governance rules — the standard itself |
| [`Harness_Release_Log.md`](./Harness_Release_Log.md) | Deploy tracking + impact analysis + watch list |
| [`Harness_TestCaseFactory_Workflow_Mockup.html`](../03_Mockups/Harness_TestCaseFactory_Workflow_Mockup.html) | The detailed workflow picture |
| [`Harness_Workflow_Overview_Mockup.html`](../03_Mockups/Harness_Workflow_Overview_Mockup.html) | One-screen overview, for presenting |
| [`QA_Test_Plan.md`](../04_QA_Reference/QA_Test_Plan.md) | QA's plan; §3 seeded this taxonomy, §9 lists their tool asks |
| [`Harness_UXUI_Review.md`](../02_Reviews_and_Analysis/Harness_UXUI_Review.md) | Screen-by-screen review + QG-138 ticket index |

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-08-06 | 1.5 | **Reframed to three fields** (`feature` · `category` · namespaced `labels[]`) to match the fields Harness exposes; merged the old `label`/`tags[]` axes into `labels[]`; `project` called out as ambient. Updated the worked example, §4.2 field-mapping table, and MODEL/CLASSIFY items. Live baseline refreshed to 313 cases / 203 `feature` values / Risk split across 20 values. Vocabulary unchanged — see taxonomy v3.0 |
| 2026-08-04 | 1.4 | **Renamed all items from `T1`–`T9` to semantic IDs** and reordered §5 to match the build order. The numbers implied a sequence they never had, and collided with the unrelated `T1`–`T5` cross-cutting themes in `Harness_UXUI_Review.md`. Mapping: `T2`→**VOCAB** · `T9`→**VALIDATE** · `T1`→**MODEL** · `T3`→**CLASSIFY** · `T4`→**QUEUE** · `T8`→**BACKFILL** · `T6`→**GROUPS** · `T7`→**HEATMAP** · `T5`→**FILTERS**. Added an index at the top of §5 |
| 2026-08-04 | 1.3 | Live investigation of Test groups and the Cases catalog. **Added §8 divergence register.** FILTERS closed as delivered; GROUPS rewritten (groups exist, membership is static); baseline measured at 287 cases / ~237 values; `Reason` corrected to 4 values; **Phase A taxonomy raised as blocking decision 5** |
| 2026-08-04 | 1.2 | PO confirmed the readiness counter is mismatched. Scoped it out of VALIDATE; strengthened §9 decision 1; promoted the `session_file` dead condition to probable root cause |
| 2026-08-03 | 1.1 | Added VALIDATE — validate the request at intake |
| 2026-08-03 | 1.0 | Created |
