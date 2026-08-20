# Aloha Test-Case Taxonomy — the standard

**Version:** 3.0 · **Owner:** BA · **Status:** Draft — **do not publish to Knowledge yet** · **Last changed:** 6 August 2026
**Tiếng Việt:** [`Aloha_Test_Case_Taxonomy_VN.md`](./Aloha_Test_Case_Taxonomy_VN.md) — for reading only. **This English file is the one that goes to Knowledge**, because the classifier reads it and every vocabulary value is an English identifier.

> ⛔ **Blocked before publication.** A **"Phase A taxonomy"** already exists in the platform
> (`fix(catalog): prefer managed app_project for Phase A taxonomy`, 4 Aug 2026). Until the PO confirms what it
> covers, this file must not be copied into the Knowledge base — see decision 5 in
> [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md) §9.

> **This file is the vocabulary itself — nothing else.** The proposal, build plan, status and open decisions
> live in [`Harness_Case_Classification_Plan.md`](../00_Active/Harness_Case_Classification_Plan.md).
>
> **This file is written to be copied verbatim into the Harness Knowledge base as
> `project/aloha/ALOHA-TAXONOMY.md`**, where the classifier reads it. Keep it self-contained and free of
> project chatter for that reason.

> **v3.0 — three fields, not five axes.** The scheme is now expressed as the **three fields Harness already
> has** — `feature`, `category`, `labels[]` — rather than five separate axes. No information is lost: the
> cross-cutting dimensions (suite, fund, environment, priority, metric, ticket) live inside the multi-valued
> **namespaced** `labels[]` field. **The vocabulary values are unchanged from v2.1** — only the framing and the
> home of the suite/tags values moved. See the changelog.

---

## 0. Canonical field names

Harness's case object already carries the three classification fields this standard governs, plus an ambient
project selector and a separate failure-triage field. `QA_Test_Plan.md` §3 uses some of the same words for
different things, so one naming must win. **Harness's field names are canonical** — they are already in code,
in the API and on screen.

| Concept | Canonical field | QA_Test_Plan §3 calls it |
|---|---|---|
| Aloha module (Risk, Overview, …) + sub-area | **`feature`** (`area/sub-area`, ≤ 2 levels) | "Category" |
| Intent (positive / negative / …) | **`category`** | "Tags → Type" |
| Everything cross-cutting (suite, fund, env, metric, priority, ticket) | **`labels[]`** (namespaced, multi-valued) | "Tags → Type" |
| Application under test | `project` *(ambient selector — chosen once, not a classification field)* | — |
| Failure classification | `triage` / **`Reason`** in the UI | "Triage" |

When reading QA's plan, translate accordingly.

> **`Reason` is not `category`.** The live Cases page shows a **Reason** filter — that is the *triage* field
> (why a run failed), with four values: `Unlabeled` · `Product bug` · `Test defect` · `Feature unavailable`.
> It is set **after** a run. `category` (§2.3) is set **when the case is written** and describes intent.
> Two different things that both look like "type" in a filter bar.

---

## 1. Three fields, many dimensions

A case is never one thing. `scenario-negative-input-no-nan` is Scenario Test **and** negative **and** P1 **and**
lab-only **and** touches NAV. So classification stays **faceted** — but it is delivered through **three fields**,
not five separate columns. The trick is that `labels[]` is **multi-valued and namespaced**, so it carries
several dimensions at once (`fund:public` and `metric:nav` are different dimensions living in the same field,
still queried independently).

**Three fields (columns on screen):**

| # | Field | Vocabulary | Values per case |
|---|---|---|---|
| 1 | **`feature`** (`area/sub-area`) | closed, ≤ 2 levels | exactly 1 area (+ optional sub-area) |
| 2 | **`category`** | closed | exactly 1 |
| 3 | **`labels[]`** | closed, **namespaced** | 0 or more |

**Plus one ambient selector:** `project` (`aloha` / `harness` / `dynamo`) — set once at the sidebar, not tagged
per case.

> **Three fields, but no dimension is lost.** The dimensions (area, sub-area, intent, suite, fund, environment,
> priority, metric, ticket) all survive — `feature` and `category` are single-valued; the rest ride inside the
> namespaced `labels[]`. Field count is three; dimension count is unchanged.

---

## 2. Vocabulary

### 2.1 `project` *(ambient)*
`aloha` · `harness` · `dynamo` *(reserved)*

### 2.2 `feature` — 10 areas, frozen

Level 1 is closed. Level 2 (`sub-area`) is extensible **by approval only**. **Maximum depth is two** — deeper
trees rot. Written as `area/sub-area`, e.g. `risk/dashboard`.

| Area | Sub-areas |
|---|---|
| `navigation` | `app-load` · `session-auth` · `fund-tabs` · `tab-switching` · `deep-link` · `browser-history` |
| `overview` | `header-metrics` · `asset-tree` · `sort` · `filters` · `rating-dialog` · `charts` · `fad-percent` · `benchmarks` |
| `risk` | `dashboard` · `total-risk-table` · `allocation-chart` · `top-contributors` · `top-ten-tables` · `subtabs` · `parameters` · `history` · `report-download` |
| `scenario-test` | `input-table` · `recalculation` · `prior-day-comparison` · `row-expansion` · `search-filter` · `print` · `reset-on-refresh` |
| `return-public` | `tab-load` · `returns-table` · `period-metrics` |
| `return-private` | `tab-load` · `returns-table` · `period-metrics` |
| `liquidity` | `tab-load` · `liquidity-table` |
| `search-export` | `fund-search` · `search-empty-state` · `excel-export` · `csv-export` · `print` |
| `cash-forecast` | `cf-navigation` · `forecast-params` · `summary-card` · `projected-balance-chart` · `hypothetical-flows` · `calculate-impact` · `drill-down` · `historical-net-flow` · `historical-calls-distributions` · `pct-of-nav-table` · `details-transactions` · `fad-beta-autofetch` · `cf-export` |
| `fund-admin` | `fund-setup` · `upload` · `permissions` |

If nothing fits, use **`unclassified`** and raise a vocabulary request. **Never invent a value.**

### 2.3 `category` — test type
`positive` · `negative` · `boundary` · `security` · `data-integrity`

`data-integrity` is separate from `negative` deliberately: on a financial platform, "the number is wrong" is a
different failure from "the button is broken" — different severity, different owner, and it needs the Product
Owner as oracle. *(`accessibility` deferred.)*

### 2.4 `labels[]` — namespaced, multi-valued

**This one field holds every cross-cutting dimension.** Every value **must** carry a namespace prefix (except
the lifecycle flags). This is what keeps `labels[]` from collapsing into the free-text bag it is today.

| Namespace | Values |
|---|---|
| `suite:` | `smoke` · `regression` · `bug-repro` · `exploratory` · `uat` |
| `fund:` | `total-endowment` · `public` · `private` · `pipeline` |
| `env:` | `lab` · `conceptia` |
| `pri:` | `P1` · `P2` · `P3` |
| `metric:` | `nav` · `beta` · `risk` · `mtd` · `qtd` · `fytd` · `rating` · `unfunded` · `illiquid` · `fad` |
| `jira:` | any issue key, e.g. `KS-963` |
| lifecycle *(no prefix)* | `writes-data` · `flaky` · `quarantine` · `deprecated` |

`suite:` is what used to be its own `label` field — it now lives inside `labels[]`, namespaced, so "which suite"
stays queryable (`labels contains suite:smoke`).

`writes-data` replaces the inventory's "Conceptia-ready = Never" column — same meaning, machine-readable.

`metric:` exists to answer *"the NAV calculation changed — which cases must re-run?"* across every area.

### 2.5 Identifiers

- **Group ID** — `aloha/cash-forecast/hypothetical-flows`
- **Case ID** — `ALO-CF-HYPFLOW-003` *(display/grouping alias; sits alongside Harness's own `case_id`, never replaces it)*
- **Case name** — unchanged convention: `<expected-behavior>-when-<action>`,
  e.g. `rating-dialog-appears-when-clicking-final-fund`

---

## 3. Assignment rules

Classification happens **at request ingest**. Later cleanup passes never happen.

1. **Normalize** the prompt.
2. **Rule pass** — deterministic keyword matching. Free, so it runs first and resolves the majority.
3. **LLM pass** — only for what the rules left open, choosing from this vocabulary.
4. **Confidence gate** — at or above 0.80 apply automatically; below, route to a human.

**Binding constraint on the classifier:** *choose only from the lists in §2. If no value fits, return
`unclassified` and explain why. Never create a new value. Every `labels[]` value must be namespaced.*

Indicative keyword rules:

| Prompt contains | Assigns |
|---|---|
| `Scenario Test tab` | `feature: scenario-test` |
| `Cash Forecast` + `Historical` | `feature: cash-forecast/historical-net-flow` |
| `Public Fund tab` | `labels: fund:public` |
| `Export Excel` | `feature: search-export/excel-export` |
| `NaN`, `not blank`, `numeric` | `category: data-integrity` |
| `NAV`, `Beta`, `% of FAD` | `labels: metric:nav`, `metric:beta`, `metric:fad` |
| `smoke`, `regression` | `labels: suite:smoke`, `suite:regression` |
| `workbench-app.lab.gend.vn` | `labels: env:lab` |

Required classifier output — **three fields plus the ambient project**:

```json
{
  "project":  "aloha",
  "feature":  "cash-forecast/hypothetical-flows",
  "category": "negative",
  "labels":   ["suite:regression", "fund:total-endowment", "env:lab", "pri:P1", "metric:nav", "jira:KS-963"],
  "confidence": 0.91,
  "rationale":  "Prompt saves a hypothetical flow then asserts an error on an invalid amount."
}
```

---

## 4. Grouping rules

**A group is a saved query, not a folder.** `project:aloha AND feature:cash-forecast AND labels contains suite:smoke`.
New matching cases join automatically; nothing is copied and nothing goes stale.

**Ordered journeys are the exception.** Use an explicit sequence only where state genuinely carries between
steps — *enter Scenario Flow → assert recalculation → refresh → assert reset*. They cost more to maintain, so
use them sparingly.

**Leaf-size rule.** Aim for **8–15 cases per sub-area**.

- Over ~25 → split the sub-area
- Under 3 → merge it

This is the health check that keeps the taxonomy honest as the catalog grows. The vocabulary above is sized
for ~45 leaf groups against an expected ~260–320 cases at full coverage — roughly 6 per group today, 12–15 at
full coverage.

---

## 5. Migration — mapping today's values onto these three fields

Measured on the live catalog, 6 August 2026: **313 cases carrying 203 distinct `feature` values**, of which
**165 are truncated case titles used once each**. Roughly 29 are meaningful. `category` is `default` on all 313;
`labels[]` is effectively unused (and its autocomplete pool is already polluted with Jira keys and project
names). This is the `alias → canonical` map §6 requires.

### 5.1 Alias map

| Value in use today | Maps to | |
|---|---|---|
| `public-fund-risk` · `total-endowment-risk` · `total-endowment-risk-tab` · `risk-dashboard` | `feature: risk/dashboard` | + `labels: fund:*` from the prefix |
| `risk-history` · `total-endowment-risk-history` | `feature: risk/history` | + `fund:` |
| `risk-scenario-testing` | `feature: risk/subtabs` | *not* `scenario-test` — this is the Risk tab's sub-tab |
| `scenario-test` | `feature: scenario-test/input-table` | |
| `endowment-overview` · `public-fund-overview` | `feature: overview/header-metrics` | + `labels: fund:*` |
| `overview-fund-selection` | `feature: overview/asset-tree` | |
| `rating` · `fund-rating` | `feature: overview/rating-dialog` | |
| `search` · `fund-search` · `search-and-navigation` | `feature: search-export/fund-search` | |
| `export-excel` | `feature: search-export/excel-export` | |
| `fund-nav-validation` | `feature: overview/header-metrics` + `labels: metric:nav` | |
| `cash-forecast` | `feature: cash-forecast/*` | already correct — needs a sub-area |
| `pipeline` · `pipeline-tab` · `pipeline-navigation` | `feature: navigation/fund-tabs` + `labels: fund:pipeline` | |
| `private-fund` · `total-endowment` | `feature: navigation/fund-tabs` + `labels: fund:*` | |
| `fund-setup` · `total-endowment-upload` | `feature: fund-admin/fund-setup \| upload` | |
| `settings-projects` | `project: harness` — not an Aloha case | |
| `aloha` · `harness` *(as feature/label)* | `project` — wrong field, drop | |
| `regression` · `demo-only` | `labels: suite:regression` — namespace it | |
| `FNC-001` · `PL-UI` · `UI-001` | `labels: jira:*` — namespace it | |
| *~165 truncated case titles* | **`unclassified`** → re-classify from the prompt | |

### 5.2 Two lessons this map encodes

**Fund scope was being folded into the area.** `public-fund-risk` and `total-endowment-risk` are the same
area tested against different funds. Moving scope into a `labels: fund:*` value is what collapses **twenty**
live Risk `feature` values into one — and is what makes `--grep @risk` return every Risk case across all funds.

**Three things were sharing the feature field.** Project names, suite names and ticket keys all ended up in the
same pickers as feature areas. Each now has a home: `project` (ambient), `labels: suite:*`, `labels: jira:*`.

---

## 6. Governance

| Rule | Detail |
|---|---|
| Source of truth | This file, versioned, published to Knowledge as `project/aloha/ALOHA-TAXONOMY.md` |
| Change process | BA proposes → PO approves → version bump → re-classify `unclassified` only |
| Aliases | Maintain an `alias → canonical` map so retired values migrate forward instead of forking |
| Review cadence | Monthly — unclassified queue, leaf sizes, pending sub-area requests |
| Accuracy | Golden set of 30–50 hand-labelled cases; target ≥ 90% on `feature`, ≥ 80% on `sub-area` |

**Two non-negotiables.** (1) **Closed vocabulary** — all three fields only accept approved values; free text is
what produced 203 values for 313 cases. (2) **`labels[]` is namespaced** — a value without a prefix is rejected;
an open `labels[]` bag collapses exactly like `feature` did.

**Resist growth.** The vocabulary is deliberately frozen at 10 areas / 5 types / a fixed set of namespaces.
Every new value is a retrieval failure waiting to happen — a case filed under a value nobody else thinks to
search.

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2026-08-06 | 3.0 | **Reframed from "five axes" to "three fields"** (`feature` · `category` · `labels[]`), matching the three fields Harness already exposes. Merged the old `label` (suite) and `tags[]` axes into one **namespaced** `labels[]` field (`suite:`, `fund:`, `env:`, `pri:`, `metric:`, `jira:`, lifecycle); `project` is now called out as an ambient selector, not a classification field. **Vocabulary values unchanged.** Refreshed §5 baseline to the live 6 Aug measurement (313 cases / 203 feature values / 165 single-use / Risk split across 20 values). Added the two non-negotiables (closed vocabulary + namespaced labels) to §6 |
| 2026-08-04 | 2.1 | Added §5 migration/alias map seeded from the 35 meaningful values in the live catalog (287 cases, ~237 values). Clarified that the UI's **Reason** field is triage, not `category`, and carries four values |
| 2026-08-03 | 2.0 | Trimmed to the standard alone. Proposal, tickets, live findings and open questions moved to `Harness_Case_Classification_Plan.md` |
| 2026-08-03 | 1.1 | Added §10 verified-live findings |
| 2026-07-31 | 1.0 | Initial draft |
