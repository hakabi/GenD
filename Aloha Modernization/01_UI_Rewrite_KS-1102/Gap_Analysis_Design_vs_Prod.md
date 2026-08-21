# Gap Analysis — Design vs Production

**Purpose:** establish, with evidence, what exists in production but not in the customer design — so the
four "known gaps" on [KS-1102](https://gendvn.atlassian.net/browse/KS-1102) can be taken to KS as
*questions with evidence attached* rather than as assumptions.

**Owner:** BA · **Last updated:** 21 August 2026

> **Status of this document.** The **design** side is verified — extracted directly from
> [`source/index.html`](./source/index.html). The **production** side is **not** verified: it rests on
> screenshot filenames in `Harness/Aloha Page/`. Clear that before the KS conversation — tracked as E1/E2
> in [`Open_Questions.md`](../00_Program/Open_Questions.md).

---

## Summary

| # | Gap (as KS-1102 states it) | Design side | Verdict |
|---|---|---|---|
| **G1** | Risk Model Scenario Testing tab — *prod has 4 tabs, design has 3* | ✅ Confirmed: 3 tabs | ⚠️ **Misstated.** Not missing — **relocated** |
| **G2** | Pipeline module | Absent from navigation | Likely a genuine omission |
| **G3** | Liquidity sidebar home | Absent from navigation | Likely a genuine omission |
| **G4** | Owned by KS filter | Absent from navigation | Likely a genuine omission |

---

## G1 — Scenario Testing: relocated, not removed

**The epic's framing is wrong, and the correction changes the question.**

### What the design actually contains

| Model | Tabs | Count |
|---|---|---|
| Risk Model | Output · Parameters · History | **3** |
| Cash Forecast Model | Dashboard · Historical Flows · Details | 3 |
| Equity Beta Model | **Scenario Test** · Model Detail | 2 |

The Risk Model having three tabs is **confirmed**. But **Scenario Test is not absent from the design** —
it is the *first and default* tab of the **Equity Beta Model** (`switchBetaTab('scen')`), and it is fully
specified, not a stub:

- A **Test Scenario Input** control
- **Calculate Scenario** and **Reset Flows** actions
- A table carrying *Expected Beta · Current NAV/MV · Scenario Flows ($M) · Scenario NAV · % of Endowment
  (Current) · % of Endowment (Scenario)*
- A footnote: *"NAV IN $ MILLIONS — SCENARIO FLOWS APPLIED AT FUND LEVEL"*
- Expand/collapse behaviour over fund rows within the scenario table

### Why this matters

Asked as the epic frames it — *"the design is missing Scenario Testing"* — KS would reasonably reply
*"add it back to the Risk Model,"* and the team would build a duplicate of something the design already
places elsewhere.

**The question to actually ask:**

> Scenario Test appears in the design under the **Equity Beta Model**, not the Risk Model. Is this a
> deliberate relocation? And is the Equity Beta version the same capability as production's Risk Model
> Scenario Testing — or a narrower beta-specific one, leaving a real gap in Risk?

### Evidence

- **Design:** `source/index.html`, `#model-view-risk` and `#model-view-beta` tab containers
- **Production:** ⚠️ *unverified* — inferred from four filenames in `Harness/Aloha Page/`: `Risk Tab.jpg`,
  `Risk Tab with Parameters subtab.jpg`, `Risk Tab with History subtab.jpg`,
  `Risk Tab with Scenario Testing.jpg`
- **Complication:** a separate `Scenario Test Tab.jpg` also exists in that folder. Its relationship to the
  Risk tab screenshots is **unknown** and may itself indicate that production already has a standalone
  Scenario screen. **Open these images before the KS conversation.**

---

## G2 · G3 · G4 — Pipeline, Liquidity home, Owned by KS filter

None of the three has any counterpart in the design's navigation. The complete design sidebar is:

| Group | Destinations |
|---|---|
| **Overview** | At a Glance · Risk · Allocation · Cash Forecast |
| **Performance** | Summary · Top Funds · Bottom Funds |
| **Models** | Risk Model · Cash Forecast Model · Equity Beta Model |
| **Funds** | Public Funds · Private Funds |

Twelve destinations. No Pipeline, no Liquidity home, no ownership filter.

| Gap | Production evidence | Note |
|---|---|---|
| **G2 Pipeline** | `Harness/Aloha Page/Pipeline Page.jpg` | Screenshot exists — the module is real in production |
| **G3 Liquidity sidebar home** | None on file | Needs a live check |
| **G4 Owned by KS filter** | None on file | A *filter*, not a page — it would not appear in navigation even if in scope. **Check the screens themselves, not the sidebar** |

> **G4 needs care.** The other three are destinations; a filter is a control inside a screen. Concluding
> "not in the navigation, therefore out of scope" is invalid reasoning for G4. Verify against the design's
> fund screens directly.

---

## Recommended next step

**One conversation with KS covering all four**, in this order: G1 (because it is misstated and the
correction is interesting), then G2–G4 as a single scope question.

**Before that conversation:** clear E1 and E2 — open the Risk screenshots and confirm G2–G4 against the
live application. A gap analysis half-built on filenames is not something to take to a customer.
