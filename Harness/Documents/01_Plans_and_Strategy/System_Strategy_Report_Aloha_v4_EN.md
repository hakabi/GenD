# System Strategy Note — Standardizing Harness Test Classification for Aloha

**Author:** BA · **Audience:** Product Owner / Leadership · **Epic:** QG-138
**Scope:** Aloha financial platform · Harness automation system · **Date:** 6 August 2026
**Standard it refers to:** [`Aloha_Test_Case_Taxonomy.md`](./Aloha_Test_Case_Taxonomy.md) · **Plan:** [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md)
**Tiếng Việt:** [`System_Strategy_Report_Aloha_v4_VN.md`](./System_Strategy_Report_Aloha_v4_VN.md) — reading copy. **This English file is authoritative.**

> **Purpose.** A one-read explanation for leadership of *why* we standardize Harness test classification, and *why the answer is three closed fields rather than free-text labels* — written to be checked against the live system, not against a slide.

---

## 1. The problem, in measured numbers

Test cases in Harness are generated from free-text prompts. The two fields meant to *group* them — `Feature` and `Labels` — are free text filled in by a human or an LLM, and they have collapsed. Measured live on the Harness API, 6 August 2026:

| | |
|---|---|
| Cases in the catalog | **313** (245 aloha + 68 harness) |
| Distinct `feature` values | **203** |
| Of those, single-use truncated titles | **165** |
| `category` (auto-assigned) | **`default` on all 313** |
| The "Risk" intent, split across | **20 `feature` values** |

**The `feature` field is not grouping anything — it is functioning as a second ID.** One intent, "Risk", is spread across **twenty** values today (`risk-dashboard`, `public-fund-risk`, `total-endowment-risk-tab`, …). Mixed into the same pickers are project names, suite names and ticket codes — three different dimensions sharing one field.

These are not projected figures. They are what the catalog contains right now.

---

## 2. The objection this note exists to answer

> *"QA can already select or type any label they want. Why impose a rigid classification and slow the team down?"*

The answer is the difference between **manual freedom** and **data integrity**.

**2.1 Free typing is not control — it is controlled chaos.** The dropdowns today are already polluted with behavioural sentences masquerading as labels (`calendar-table-is-displayed-when-clicking-the-calendar`). Free entry does not give QA control; it lets every request mint a new value. That is exactly how 313 cases produced 203 `feature` values.

**2.2 The taxonomy removes work from QA — it does not add it.**

| | Today (free labels) | Proposed (auto-classified) |
|---|---|---|
| What QA does | Recalls or scrolls hundreds of past labels, invents one under pressure | Writes the request in plain English |
| Who classifies | The person, inconsistently | Deterministic keyword rules first, a constrained LLM only for what's left |
| QA's remaining job | Hope the label matches something | Glance at a pre-filled preview and confirm |

The three fields are filled **for** QA at ingest. QA does not memorise the vocabulary — the system proposes it and QA reviews. The framework **removes cognitive load; it does not add a form to fill.**

---

## 3. What structural collapse costs, if we leave it

Grounded in the numbers in §1, not hypotheticals:

1. **Retrieval failure.** "Run every `risk` case" cannot be satisfied, because the same intent lives under twenty values. `--grep @risk` returns the fraction that happened to be tagged `@risk` and misses the rest. On a financial platform, a missed test is a bug that reaches production.
2. **Duplication.** When an existing case can't be found by name, it gets rewritten. The catalog grows in size without growing in coverage. *(Note: the platform already ships semantic de-duplication — Spec 039 — so our job is to scope that check by label, not to build de-dup from scratch. See §6.)*
3. **Coverage blindness.** A coverage dashboard built on garbage tags reports false confidence — "Cash Forecast fully covered" when the number is driven by single-use labels. Leadership then decides on hallucinated data.
4. **Maintenance drag.** When a requirement changes, a closed vocabulary updates one key; free-text drift means hunting hundreds of variants by hand.
5. **Cost.** Redundant cases lengthen CI runs, and letting the LLM invent tags spends tokens producing the very mess we then pay to clean up.

---

## 4. The proposal — three *fields*, not five *levels*

The single most important point for this discussion: **this is not a five-level tree.** A deep hierarchy would be exactly the complexity leadership is right to fear. It uses the **three fields Harness already has** — set once, queried in any combination, all on **one screen**. It stays faceted: `labels[]` is multi-valued and namespaced, so it carries several dimensions at once without adding columns:

| # | Field | Example value | Vocabulary |
|---|---|---|---|
| 1 | **`feature`** (`area/sub-area`) | `cash-forecast/hypothetical-flows` | closed, **max 2 levels deep** |
| 2 | **`category`** | `negative` | closed |
| 3 | **`labels[]`** (namespaced) | `suite:regression` · `fund:total-endowment` · `env:lab` · `metric:nav` · `jira:KS-963` | closed |

*(Plus `project` — an ambient app selector, chosen once, not a per-case field.)*

Two design choices matter to leadership specifically:

- **`feature` is capped at 10 business areas, two levels deep — deliberately frozen.** Every new value is a future retrieval failure. Growth is resisted by design.
- **`data-integrity` is its own test type, separate from `negative`.** On a financial platform, "the number is wrong" is a different, higher-severity failure than "the button is broken" — it needs the Product Owner as the oracle. Splitting it out is a financial-correctness safeguard, not bureaucracy.

---

## 5. What it looks like in the tool — "Smart Matrix Ingest"

```
+-------------------------------------------------------------------------+
| HARNESS — TEST CASE INGEST                                              |
+-------------------------------------------------------------------------+
| Prompt: [ Test the hypothetical flows in Cash Forecast and assert the  |
|           NAV error on an invalid amount... ]                           |
+-------------------------------------------------------------------------+
| Auto-classification preview (deterministic rules + constrained LLM):    |
|   Project   : aloha                              (ambient)              |
|   Feature   : cash-forecast/hypothetical-flows   (rule + LLM · 0.93)    |
|   Category  : negative                           (keyword rule)         |
|   Labels[]  : suite:regression · fund:total-endowment · env:lab ·       |
|              pri:P1 · metric:nav · jira:KS-963                          |
+-------------------------------------------------------------------------+
| Status: READY                                    [ Confirm & Commit ]   |
+-------------------------------------------------------------------------+
```

- **Soft validation.** A non-vocabulary value raises a suggestion ("did you mean *cash-forecast*?"), never a hard block — QA can always override.
- **Coverage heatmap.** Once labels are trustworthy, a `feature` × `category` grid shows leadership where real coverage is thin — transparency free of tag distortion.

---

## 6. Honest scope — what is already built, what remains

This is **not a greenfield build.** Much of the surrounding machinery shipped in the platform on 1–3 August. What remains is **mostly governance, not construction** — which makes this a cheaper ask than it first appears.

| Capability | State | Our remaining work |
|---|---|---|
| Facet filters on the Cases list | ✅ **Shipped 3 Aug** | none — done |
| Semantic de-duplication (Chroma / ANN, Spec 039) | ✅ **Exists** | scope the existing check by label |
| Test groups (CRUD, scheduling, nesting) | ✅ **Shipped 3 Aug** | add *query-defined* membership to what exists |
| Closed vocabulary on `Feature` / `Labels` (**VOCAB**) | ⬜ to build — **ship first** | the core change |
| `feature` sub-area + namespaced `labels[]` (**MODEL**) | ⬜ small | `Category`/`Labels` already exist |
| Classify at ingest (**CLASSIFY**) | ⬜ to build | vocabulary read from the Knowledge base |
| "Needs labeling" queue (**QUEUE**) | ⬜ to build | clone the existing Case-Review triage pattern |
| Backfill the 313 existing cases (**BACKFILL**) | ⬜ after VOCAB | one-time migration, scope known |
| Coverage heatmap (**HEATMAP**) | ⬜ last | only useful once labels are real |

**Migration target:** the 203 live `feature` values collapse to **~45 stable leaf groups** for the expected ~260–320 cases at full coverage — roughly 6–15 cases per group instead of ≈1.5.

---

## 7. How classification stays trustworthy

The obvious leadership question is *"what if the AI mislabels a financial test?"* — so the design assumes it will, sometimes, and contains it:

- **Confidence gate.** A classification at **≥ 0.80** is applied automatically; **below that it goes to a human "Needs labeling" queue** rather than being guessed.
- **The classifier cannot invent values.** It is constrained to the approved list by schema, not by a polite instruction — if nothing fits it returns `unclassified` with a reason, and that becomes a work item, never a silent bad label.
- **Measured accuracy.** A golden set of 30–50 hand-labelled cases holds the classifier to **≥ 90 % on `feature`, ≥ 80 % on the `feature` sub-area**, re-checked so drift is caught early.

---

## 8. Alignment check and next step

**One thing must be confirmed before we publish this vocabulary.** The platform already carries a workstream referred to as *"Phase A taxonomy"* (commit `5235d30`, 4 Aug — *"prefer managed app_project for Phase A taxonomy"*). Before the Aloha vocabulary is copied into the Knowledge base, we need the PO to confirm how the two relate:

1. What does "Phase A taxonomy" classify — cases, projects, or something else?
2. Does it define a controlled vocabulary, or only a data model?
3. Should the Aloha vocabulary **sit inside it, extend it, or replace it?**

This note therefore proposes the Aloha vocabulary as the **domain-specific classification layer for Aloha**, designed to plug into whatever governance framework the PO prefers — *not* as a competing new system. Confirming that fit is the first action, before any rollout.

**Recommended sequence:** confirm Phase-A alignment → ship **VOCAB** (close the fields) → **MODEL** / **CLASSIFY** / **QUEUE** → **BACKFILL** the 313 cases → add query membership to groups → **HEATMAP** last.

---

## 9. Bottom line

Standardizing on three fields does not burden QA — it *removes* the labelling decision from QA and hands it to deterministic rules with an LLM fallback and a human safety net. It is largely a governance change on top of machinery the platform already shipped. And on a financial platform, a clean classification foundation is not tidiness for its own sake — it is what keeps a Risk or NAV test from silently going missing.

*Prepared by the BA under Epic QG-138. Figures verified against the live Harness API, 6 August 2026.*
