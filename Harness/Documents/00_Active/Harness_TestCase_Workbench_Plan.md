# Test Case Review Workbench — plan

**Status:** 🟡 **DRAFT — for internal review only.** Not agreed, not ticketed, nothing filed in Jira or Confluence.
**Owner:** BA · **Created:** 14 August 2026
**Trigger:** PO feedback on the Timeline mockup — *"requests are just prompts to create test cases; the test cases are the important thing."*
**Companion:** [`03_Mockups/Harness_TestCase_Workbench_Mockup.html`](../03_Mockups/Harness_TestCase_Workbench_Mockup.html)

---

## 0. What changed

The Timeline direction was reviewed and broadly liked, with one objection that invalidates part of it:

> **A request can produce many test cases, and the timeline cannot show that.**
> *"Một Request có thể có nhiều test case ⇒ cách timeline đang không hiện được."*

Plus a sharper framing question from the PO: **requests are not the product.** They are the prompt. The product is the catalog of test cases. So a page built around requests is optimising the wrong object.

This plan keeps what worked in Timeline, demotes it, and rebuilds the page around the test cases and the decisions QA make about them.

**Decisions already taken (14 Aug):**

| Question | Answer |
|---|---|
| Where does case review live? | **Merged into the Requests page.** The separate Case Review screen goes away |
| Who is this page optimised for? | **QA authoring and reviewing cases.** Not dev, not PO |
| Is "extend existing case" acceptable? | **Yes**, in principle. Audit requirements in §5 |
| Pull live catalog data now? | **No.** §3 is written as a spec to run later |

---

## 1. Analysis — does a request still matter after review?

*This was left to me to analyse. Here is the evidence and the recommendation.*

**Evidence it does not matter afterwards**

- Cases inherit `feature` and every `label[]` from the parent; **only `category` differs between siblings** (classification plan §4). Everything needed to find a case later lives on the case.
- The plan deliberately designs the *catalog* as the navigable surface — query-defined groups, coverage heatmap, impact queries. **None of those route through requests.**
- `case_id` is now the unique catalog identity. The request is not needed to address a case.

**Evidence it does matter afterwards**

- QG-147 and QG-149 exist precisely because people ask *"which request produced this?"* — the UX review called it **"the single most repeated confusion."**
- Two facts are only expressible at request level: the **batch summary** (`0 successful, 0 duplicate, 1 failed, 0 rejected`) and **Retry**, which re-runs a batch.

**Recommendation — the request's *role* changes, and the UI should change with it**

| Phase of life | What the request is | What the UI owes it |
|---|---|---|
| **Active** (creation → review) | A **work item demanding a human decision** | Full attention. This is the workbench |
| **Settled** (after confirmation) | **Provenance + a re-runnable batch** | A line in a searchable log, and a back-link from each case |

So: *neither* "dies after review" *nor* "permanent archive". **The Requests page becomes a review inbox** — sorted by who is blocked, not by newest — and settled requests recede. The catalog remains the destination for browsing cases.

> **This also answers the PO's "ai cần coi, cần thiết không?"**
> QA needs to see a request **once, at the review moment**. Nobody needs to watch requests continuously. That is exactly why today's page feels like it is showing you something you do not need.

---

## 2. Candidate use cases — to be proven, not assumed

The PO asked for these to be gathered, listed, and **proven** to be daily needs:
*"gom use case lại, liệt kê ra và coi những use case nào thật sự mọi người cần dùng hàng ngày, cần chứng minh được."*

Below is the candidate list. **Nothing here is assumed true.** §3 says how each gets proven or killed.

| # | Use case | Who | Claimed frequency | How we prove it |
|---|---|---|---|---|
| **U1** | Review a fresh batch and decide what enters the catalog | QA author | Every request | Count requests reaching `awaiting review` per week |
| **U2** | Resolve a duplicate / subsumption without leaving the page | QA author | Whenever dedupe fires | Measure duplicate rate per batch |
| **U3** | See what is waiting on **me** across all requests | QA author | Daily, first thing | Count concurrent unreviewed requests, and how long they wait |
| **U4** | Bulk-accept the clean cases in a batch | QA author | Every request | Ratio of clean to conflicted cases per batch |
| **U5** | See coverage gaps in what was generated | QA author / lead | Per request | Category distribution — are security/performance cases ever generated? |
| **U6** | Find the request that produced a case I am looking at | QA, dev | Occasional | Count of cases whose provenance is currently ambiguous |
| **U7** | Re-run a failed batch | QA author | On failure | Retry frequency |
| **U8** | Resolve a low-confidence classification (`Needs labelling`) | QA author | When Gate B fires | Count of requests below the 0.80 threshold |
| **U9** | ⚠️ **Compare two requests** | ? | **PO doubts this is needed** | Look for any evidence of it happening. **Kill unless proven** |
| **U10** | ⚠️ **Watch a run progress live** | ? | **Unproven** | Does anyone open a running request? **Kill unless proven** |
| **U11** | Audit who approved or extended what | QA lead | Rare, compliance | Ask the QA lead directly |

**U9 and U10 are the two the mockup deliberately leaves out.** If Phase 0 shows demand, they come back. If not, we have removed two features nobody needed — which is itself a result worth reporting.

---

## 3. Phase 0 — prove the use cases with real data

**Not yet run.** The read-only catalog API needs a signed-in browser session; this section is the spec for whoever runs it.

Endpoints (per prior verification):
- `GET /api/platform/cases?view=all` → `{cases:[...], total}` — each case has `case_id`, `catalog_path`, `project`, `category`, `feature`, `name`, `triage{label}`, `last_run`, `spec_path`
- `GET /api/platform/projects`
- `GET /api/platform/taxonomy/suggestions`

### Measurements

| # | Question | Method | Which use case it settles |
|---|---|---|---|
| M1 | **How many cases does a request actually produce?** Distribution, not average | Group cases by originating request; report median, p90, max | Sizes the review screen. Is 15 real or a strawman? |
| M2 | **What is the real duplicate rate per batch?** | Count `duplicate` outcomes against total generated | **U2** — if it is 1%, the decision band is over-built. If 20%, it is the whole page |
| M3 | **Split of duplicate types** — exact vs semantic vs subsumption | May need a log query rather than the API | Determines whether **Extend** is worth backend work |
| M4 | **How many requests sit unreviewed, and for how long?** | Count `awaiting review`, measure age | **U3** — proves or kills the inbox framing |
| M5 | **Category distribution across all 313 cases** | Group by `category` | **U5** — `category` was `"default"` for all 313 on 6 Aug. If still true, generation is not producing families at all, and this plan's premise needs revisiting |
| M6 | **Does anyone reopen a settled request?** | Access logs, or ask QA | Settles §1 with evidence rather than my reasoning |
| M7 | **Retry frequency** | Count retried requests | **U7** |
| M8 | **Requests below the 0.80 confidence gate** | Count | **U8** |

> ### ⚠️ M5 is a premise check, and it should be run first
> Memory of the 6 Aug measurement: **`category` was `"default"` for all 313 cases** — auto-classification was doing nothing. This whole design assumes a request fans out into a *family* of categorised siblings (positive / negative / boundary / …).
>
> **If M5 shows `category` is still uniformly `"default"`, the sibling-family grouping in the mockup has nothing to group by**, and the classification workstream has to land before this UI is worth building. **Run M5 before anything else.**

### Output of Phase 0

One page: each use case marked **Proven / Weak / Killed**, with the number beside it. That page is what goes to the PO — it answers *"cần chứng minh được"* with data rather than opinion.

---

## 4. The design

Detail and visuals in the mockup. The four load-bearing ideas:

### 4.1 The page is an inbox, not a queue
Renamed **Review**. Three filters: **Needs me · Running · Settled**. Default is *Needs me*, sorted by wait time. A request with nothing waiting on a human does not compete for attention.

### 4.2 Timeline demoted to a spine
One horizontal line — Created → Classified → Generated → **Review** → Execute. Passed stages collapse to a label and timestamp. **The stage you are on expands into the actual work.** At Review that is the case family; at Execute it is run progress. One request, one spine, one expanded working area.

This keeps what the PO liked about Timeline while fixing the "many cases" objection: the timeline stops trying to *be* the content and becomes the frame around it.

### 4.3 Two bands, decisions first

```
3 need your decision      ← expanded, one card each, with diffs and verbs
12 ready to create        ← collapsed, grouped by category, one bulk action
```

This is the direct answer to *"hiển thị tối ưu cho Human Review"*. The screen opens on the work, not the inventory. Answering *"15 test cases trong đó có 3 duplicate thì hiển thị sao?"* — **the 3 come to the top and the 12 become one row.**

### 4.4 The family header carries inherited labels once
Siblings share `feature` and all `labels[]`. Shown once at the top, tagged *"inherited by all 15 cases"*, with only `category` varying per case. Fifteen rows of identical chips is noise.

---

## 5. The verbs — the actual gap

`case-review.html` today offers exactly four actions: **Add case · Edit · Delete · Confirm and process.** There is **no verb that resolves a duplicate**, and none at all for subsumption. That is why QA cannot decide *"có cho tạo tiếp hay không"* — the tool gives them nothing to decide with.

| Situation | Verb | Effect | Backend impact |
|---|---|---|---|
| Clean | **Accept** | Case enters catalog | None — exists |
| Unwanted | **Reject** | Discarded, reason recorded | Small — store reason |
| Exact duplicate | **Merge** | Not created; request links to existing case | Medium — provenance link |
| Semantic duplicate | **Merge** / **Reject** | As above | As above |
| **Subsumption** | **Extend existing** | Existing case gains the new assertions | **Largest — see below** |
| Genuinely distinct | **Keep both** *(reason required)* | Both created | Small — store reason |

### 5.1 "Extend existing" — approved 14 Aug, specification needed

It mutates an already-approved case, so it needs more than a button:

1. **Version history on the case.** Extending creates v2; v1 stays readable.
2. **Audit entry** — who extended it, from which request, when, what was added.
3. **The previous run result must be invalidated.** The case has changed; its last "Passed" no longer describes the current case. Showing a stale pass on a changed case would be worse than the problem this solves.
4. **A size limit, or at least a warning.** A case extended five times is probably two cases. Suggest flagging at three.
5. **Reversibility** — an extension must be undoable back to v1.

> **Item 3 is the one to raise with the dev team first.** It is invisible in the UI but it is the difference between this being a useful feature and a source of false confidence.

### 5.2 "Keep both" requires a reason
Deliberate friction. It is the cheap default, and it is how you get 203 distinct feature values across 313 cases. One free-text line, stored on the case, visible in the catalog.

---

## 6. Risks and open questions

| # | Risk / question | Why it matters |
|---|---|---|
| R1 | **M5 may invalidate the premise** | If `category` is still `"default"` everywhere, there are no families to group. **Check first** |
| R2 | **Duplicate rate may be too low to justify the decision band** | If M2 shows 1%, the band is over-engineered — collapse it to a single inline warning |
| R3 | **Merging Case Review into Requests deletes a screen** | Existing links, bookmarks and any QA muscle memory break. Needs a redirect and a heads-up |
| R4 | **"Extend" changes the meaning of an approved case** | See §5.1. Do not ship without the audit trail |
| R5 | **This is IA work, not styling** | It does not overlap the Atlassian-alignment proposal; it should not be bundled with it or it will be judged as one decision |
| Q1 | Can QA *edit* a generated case before accepting, or only accept/reject? | Today Edit exists. Keeping it adds a mode to every card |
| Q2 | Who resolves a low-confidence classification — the author or a lead? | Determines whether `Needs labelling` belongs in the same inbox |
| Q3 | Does "Reject" delete the case or archive it? | Affects whether rejected cases are learnable signal |

---

## 7. Phases

| Phase | Work | Output | Gate to next |
|---|---|---|---|
| **0** | Run the §3 measurements | One page: each use case Proven / Weak / Killed | **M5 must pass** or stop and fix classification first |
| **1** | Review the surviving use cases with QA | Agreed list of daily needs | PO sign-off on scope |
| **2** | Refine this mockup against the surviving use cases only | Revised mockup | QA walkthrough |
| **3** | Specify the verbs, especially Extend (§5.1) | Behaviour spec for the dev team | Dev feasibility check |
| **4** | Write tickets | Stories under QG-138 | — |

**Nothing goes to Jira or Confluence until Phase 4**, and not before the PO has seen Phase 0's numbers.

---

## Changelog

| Date | Change |
|---|---|
| 2026-08-14 | Created as draft. Reframed from request-centric to case-centric after PO feedback |
