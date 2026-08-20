# Manual Test Script — Risk ▸ **Output** sub-tab (Aloha)

> **Version:** 1.0 · **Written:** 18 August 2026 · **Author:** QA
> **Feature under test:** `risk/*` — the **Output** sub-tab of the **Risk** tab
> **Environment:** `https://workbench-app.lab.gend.vn/#/endowment` (lab — safe to interact) · `labels: env:lab`
> **Standards this file obeys:** [`Aloha_Test_Case_Taxonomy.md`](../01_Plans_and_Strategy/Aloha_Test_Case_Taxonomy.md) (vocabulary) · [`QA_Test_Plan.md`](./QA_Test_Plan.md) (assertion rules) · [`test_case_inventory.md`](./test_case_inventory.md) (where results get tracked)
> **How to read this:** Part A is the "how to be a QA" walkthrough. Part D is the script itself. If you only run one thing today, run **Part E, Wave 1**.

---

## Part A — What a QA actually does when a test task lands

This is the generic process, told through *this exact task* so you can see each step done for real.
Seven steps. Steps 1–3 are the ones beginners skip, and skipping them is why test suites rot.

### Step 0 — Read the ticket and find your **oracle**

An **oracle** is "the thing that tells me whether what I'm looking at is right." Without one you
cannot test — you can only describe. Before writing a single case, answer:

| Question | Answer for this task |
|---|---|
| What is the requirement document? | *None found for Risk ▸ Output.* → **You must ask the PO/BA.** Record the gap. |
| Is there a design/mockup? | `Harness/Aloha Page/Risk Tab.jpg` (captured 2 July 2026) — usable as a **structural** baseline |
| Is there a prior test run? | No manual pass on record for this sub-tab |
| Who decides "the number is wrong"? | **Product Owner.** A QA cannot self-certify financial maths |

> **The beginner's mistake:** starting to write cases before you know who your oracle is. When you hit
> "is 81.64% correct?", the answer isn't in the UI. Note the question and keep moving — see §G3.

**Your four oracles here, ranked by how much you can use them alone:**

1. **Internal consistency** (strongest, needs nobody): does the page agree with itself? Percentages sum to 100%, subtotals equal their parts, chart matches its table. **Most of this script is this.**
2. **Structural** (needs nobody): does everything render — no blanks, no `NaN`, no `undefined`, no infinite spinner.
3. **Comparative**: does the same screen behave the same across fund scopes and across days.
4. **Absolute correctness** (needs the PO): is 16.95% the true risk of Equity Beta. **Out of your hands — always escalate.**

### Step 1 — Take a tour *before* you write anything ("exploratory charter")

Spend **45–60 minutes** just using the feature with no script. Goal: build the mental model. Write
down every question, not answers. In this session the tour produced Part B below — including **two
candidate defects found before a single test case existed.** That is normal, and it is the
highest-value hour of the whole task.

Tour checklist:
- Click every control once. Note what changed and what did not.
- Open DevTools ▸ Network. **Which API feeds this screen?** (Here: `GET /page/risk_model`.)
- Change the surrounding context — fund tab, refresh, window width — and see if the screen follows.
- Try to break it: double-click, refresh mid-load, navigate away and back.

### Step 2 — Decompose the surface into a **testable element inventory**

Turn one screen into a list of independently testable blocks. Each block becomes a **group** of test
cases and maps to a `feature` sub-area from the taxonomy. Doing this makes coverage *countable*
instead of a feeling. The inventory is Part B §B1 — **7 blocks, 34 cases**.

### Step 3 — Rank by **risk**, not by screen order

You will never have time to test everything. Rank each block on:

- **Impact** — if this is wrong, what happens? Aloha is a $14.8B endowment tool. A wrong risk number
  is a *decision* defect. A misaligned legend is cosmetic.
- **Likelihood** — new code, complex maths, and cross-scope logic break most often.
- **Detectability** — a blank page is caught by anyone; a subtly wrong percentage ships silently.
  **Low detectability raises priority**, because you are the only person who will catch it.

That ranking is what produces the execution order in Part E. *"What should I test first?"* is answered
by this step, not by intuition.

### Step 4 — Write the cases: naming, labelling, grouping → **Part C**

### Step 5 — Set up preconditions and test data

For this feature: a logged-in user (SSO — never attempt the sign-in yourself), the lab environment,
and a browser with DevTools available. No data seeding needed — this sub-tab is **read-only**, so no
case here carries the `writes-data` lifecycle label. That is a genuinely low-risk feature to be given
as a first task.

### Step 6 — Execute, and record **evidence as you go**

Evidence = screenshot + the numbers you compared + timestamp + build/environment. Not "it looked
fine." Rule of thumb: **if a developer would have to reproduce it themselves to believe you, your
evidence is not enough.** Log *observations* even when a case passes — the `As of` date, the API
status code.

### Step 7 — Report: verdict, defects, and what you could not answer

Three outputs, always:

1. **Run result** — pass/fail per case, into `test_case_inventory.md`.
2. **Defects** — one ticket per independent problem, using the template in Part F.
3. **Open questions** — everything your oracle couldn't answer. This list is a deliverable, not a
   failure. §G3 is mine.

---

## Part B — Tour results (18 August 2026, live lab)

### B1 — Element inventory: what is actually inside Risk ▸ Output

Verified live. The Risk tab contains **four sub-tabs — `Output` · `Parameters` · `History` ·
`Scenario Testing`** — and `Output` is the default. Output itself contains **7 functional blocks**:

| # | Block | What it is | Taxonomy `feature` |
|---|---|---|---|
| 0 | Sub-tab bar | 4 buttons, `Output` active by default | `risk/subtabs` |
| 1 | As-of stamp | `As of 2026-08-17 06:20 HST` | `risk/dashboard` |
| 2 | Download Report | one button, top-left | `risk/report-download` |
| 3 | **Total Risk as of `<date>`** | table, 6 cols × 11 rows: 8 category rows + `Total Beta`, `Total Alpha`, `Total FAD` | `risk/total-risk-table` |
| 4 | **Risk Allocation by Asset Class** | pie chart (canvas) + HTML legend, 8 entries | `risk/allocation-chart` |
| 5 | **Top Risk Contributors** | bar chart (canvas), 5 bars | `risk/top-contributors` |
| 6 | **Top Ten Contributors … (by Index)** | table, 5 cols × 10 rows | `risk/top-ten-tables` |
| 6 | **Top Ten Contributors … (by Region)** | table, 4 cols × 10 rows | `risk/top-ten-tables` |
| 6 | **Top Ten Manager Contributors to Risk** | table, 3 cols × 10 rows | `risk/top-ten-tables` |

**Constraints confirmed live — these shrink the test scope, which is good news:**

- Tables have **no sort, no filter, no pagination, no per-table export.** Do not write cases for
  features that do not exist. (Checked: no `aria-sort`, no pointer cursor, no sort affordance on any header cell.)
- Charts are **canvas** (Chart.js), not SVG — their content is not in the DOM and must be read visually.
- The whole sub-tab is **read-only**. No inputs, no saves.
- **API:** `Output` → `GET https://workbench-api-sandbox.lab.gend.vn/page/risk_model` (200).
  `Parameters` → `GET .../page/risk_params/latest` (200). Useful for separating UI bugs from data bugs.

### B2 — Two candidate defects found during the tour

> Written as **observations pending PO confirmation**, not as confirmed bugs. That distinction matters:
> a QA who files "bugs" that turn out to be by-design loses credibility fast.

**OBS-1 — Risk ▸ Output shows identical content for Total Endowment, Public Fund and Private Fund.**

Switching the fund scope changes the header strip but **not one digit** of the Output tab:

| Fund scope | Equity Beta (header) | NAV (header) | Total Risk table, `Equity - Beta` row |
|---|---|---|---|
| Total Endowment | 0.763 | 14.78 Billion | 73.58% · 5.00% · 16.95% · 11.81% · 81.64% |
| Public Fund | 0.593 | 7.46 Billion | 73.58% · 5.00% · 16.95% · 11.81% · 81.64% |
| Private Fund | 1.171 | 5.97 Billion | 73.58% · 5.00% · 16.95% · 11.81% · 81.64% |

Corroborating evidence: switching to Public Fund fired **no new `/page/risk_model` request**, and the
endpoint carries **no fund/scope query parameter**. Note also that `Risk 14.5%` and `% Illiquid 40.4%`
in the header strip are identical across all three funds, while `Equity Beta` and `NAV` differ.

*Interpretation is the PO's, not yours.* Two readings are possible: (a) the risk model is computed only
at total-endowment level and is intentionally shown unfiltered, or (b) fund scoping is not wired up.
**Ask before filing.** Covered by **TC-31**.

**OBS-2 — First render of the fund sub-navigation takes roughly 20–30 seconds.**

On a cold load of `#/endowment`, the header strip appears in about 5 s but the
`Overview / … / Risk / …` sub-nav is absent from the DOM for a further 15–25 s, with no spinner and no
skeleton. A user — or an automated test — will conclude the Risk tab does not exist. No console errors
were raised. Covered by **TC-32**.

---

## Part C — "Do we need a test suite?" and how to organise the cases

### C1 — Short answer: **yes, but a suite here is a saved query, not a folder**

Your taxonomy standard already settles this (§4: *"A group is a saved query, not a folder"*). You do
not create a `Risk Output` folder and drag cases into it. You **label** each case, and a suite is
whatever matches a filter. New cases join automatically; nothing goes stale.

Build **three** suites off this one script:

| Suite | Query | Size | When it runs | Purpose |
|---|---|---|---|---|
| **Smoke** | `project:aloha AND feature:risk* AND labels contains suite:smoke` | 8 cases, ~20 min | every build | "is Risk ▸ Output alive at all" |
| **Regression** | `project:aloha AND feature:risk*` | all 34, ~3 h | every release | full coverage |
| **Data integrity** | `project:aloha AND feature:risk* AND category:data-integrity` | 15 cases | after any model or calculation change | the money cases |

The third one needs **no new labelling** — `category` already carries it. That is the whole point of a
faceted scheme: one case, many suites, no duplication.

### C2 — How to name a case

Convention from the taxonomy (§2.5): **`<expected-behavior>-when-<action>`**

- ✅ `risk-allocation-column-sums-to-100-when-output-tab-loads`
- ✅ `output-subtab-is-active-when-risk-tab-opens`
- ❌ `Test risk table` — no expected behaviour, no trigger, unfilterable, ages badly
- ❌ `TC-11` on its own — an ID is not a name

The rule forces you to state the **expected result in the title**. If you cannot, you have not decided
what "pass" means — which means the case is not ready to be written.

### C3 — How to label a case (this answers *"how do I arrange them in the same function"*)

Three fields, per the standard. **Never invent a value.**

| Field | Single/multi | Value for this feature |
|---|---|---|
| `project` | ambient, set once | `aloha` |
| `feature` | exactly 1 | `risk/<sub-area>` — one of `subtabs` · `dashboard` · `total-risk-table` · `allocation-chart` · `top-contributors` · `top-ten-tables` · `report-download` |
| `category` | exactly 1 | `positive` · `negative` · `boundary` · `data-integrity` |
| `labels[]` | 0..n, **namespaced** | `suite:*` · `fund:*` · `env:lab` · `pri:P1..P3` · `metric:risk` · `jira:KS-xxxx` |

**The one thing to get right:** *fund scope goes in `labels: fund:*`, never in `feature`.* Writing
`feature: total-endowment-risk` is exactly the mistake that produced **20 different `feature` values
for one Risk area** in the live catalog. `feature: risk/total-risk-table` + `labels: fund:public` keeps
a search for `risk` returning every Risk case across every fund.

**Grouping and IDs:**

- **Group ID** = `aloha/risk/<sub-area>` — e.g. `aloha/risk/total-risk-table`
- **Case ID** = `ALO-RISK-<SUBAREA>-NNN` — e.g. `ALO-RISK-TRT-003`
- Cases of the same function share the group ID and the sub-area prefix. **That is the arrangement** —
  you never need a folder.

### C4 — The assertion rule that matters most on this feature

From `QA_Test_Plan.md` §2: **never hard-code a data value.** Lab data ≠ production data, and it changes
daily. `Assert NAV = 14.78 Billion` is a case that fails tomorrow for no reason, and it trains the team
to ignore failures.

- ❌ `Assert Equity - Beta risk allocation is 81.64%`
- ✅ `Assert the Risk Allocation column sums to 100.00% ± 0.05`
- ✅ `Assert the pie legend percentage for Equity Beta equals that row's Risk Allocation cell`

Every data-integrity case below is written as a **relative** assertion for this reason. Observed values
appear only in italics, as a sanity check for the day the script was written.

---

## Part D — The test script (34 cases)

**Reading a case:** `Pre` = preconditions · `Steps` = what you do · `Exp` = what must be true to pass.
All cases carry `project: aloha`, `labels: env:lab`, and default `labels: fund:total-endowment` unless
stated. **[S]** marks membership of the smoke suite.

**Global precondition (all cases):** logged into `workbench-app.lab.gend.vn` as a normal user; the
Total Endowment tab selected; the fund sub-nav rendered (see OBS-2 — allow 30 s).

---

### Group 1 — `aloha/risk/subtabs` — entry and sub-tab navigation

**TC-01 · `ALO-RISK-SUB-001` · `output-subtab-is-active-when-risk-tab-opens` [S]**
`category: positive` · `labels: suite:smoke, pri:P1`
- Pre: on Total Endowment, any tab.
- Steps: 1. Click **Risk** in the fund sub-nav. 2. Observe the sub-tab bar.
- Exp: the heading **Risk Model Dashboard** is shown; the sub-tab bar shows exactly `Output`,
  `Parameters`, `History`, `Scenario Testing`; **Output** is visually active; the Output content
  (As-of stamp + Total Risk table) renders without any further user action.

**TC-02 · `ALO-RISK-SUB-002` · `output-content-restores-when-returning-from-another-subtab`**
`category: positive` · `labels: suite:regression, pri:P2`
- Steps: 1. From Output, click **Parameters**; wait for load. 2. Click **History**. 3. Click **Output**.
- Exp: Output re-renders fully — As-of stamp, all four tables, both charts. No blank panel, no stale
  content from the previous sub-tab, no duplicated blocks. (Instrumented check: a fresh
  `GET /page/risk_model` fires and returns 200.)

**TC-03 · `ALO-RISK-SUB-003` · `only-one-subtab-is-active-at-a-time`**
`category: positive` · `labels: suite:regression, pri:P3`
- Steps: click each of the four sub-tabs in turn.
- Exp: exactly one sub-tab carries the active style at any moment, and it is always the one whose
  content is displayed. Never a state where the highlight and the content disagree.

**TC-04 · `ALO-RISK-SUB-004` · `output-subtab-state-is-defined-when-page-is-refreshed-on-risk-tab`**
`category: positive` · `labels: suite:regression, pri:P3`
- Steps: 1. Navigate to Risk ▸ Output. 2. Press F5.
- Exp: **agree the expected behaviour with the PO first.** Either the app returns to Risk ▸ Output
  (deep link preserved) *or* it returns to Overview (documented reset). Record which. Fail only on a
  third outcome — blank page, error, or the sub-nav never appearing.

---

### Group 2 — `aloha/risk/dashboard` — as-of stamp and header reconciliation

**TC-05 · `ALO-RISK-DASH-001` · `as-of-timestamp-is-present-and-well-formed-when-output-loads` [S]**
`category: data-integrity` · `labels: suite:smoke, pri:P1, metric:risk`
- Exp: the stamp reads `As of YYYY-MM-DD HH:MM HST`; the date is a real calendar date; it is **not in
  the future**; it is not `Invalid Date`, `NaN`, `1970-01-01`, or blank.

**TC-06 · `ALO-RISK-DASH-002` · `as-of-date-matches-total-risk-table-heading`**
`category: data-integrity` · `labels: suite:regression, pri:P2`
- Steps: compare the `As of <date>` stamp with the `Total Risk as of <date>` heading.
- Exp: the **date portions are identical**. *(Observed 18 Aug: both `2026-08-17` — consistent.)* A
  mismatch means two data sources disagree, and is a P1 escalation.

**TC-07 · `ALO-RISK-DASH-003` · `header-risk-percentage-reconciles-to-total-fad-risk`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: compare the `Risk` figure in the fund header strip with the `Risk` cell of the `Total FAD` row
  of the Total Risk table.
- Exp: they agree within rounding — the header shows 1 dp and the table 2 dp, so
  `|header − table| ≤ 0.05`. *(Observed: header 14.5%, Total FAD 14.46% → passes.)*
- Note: run this once per fund scope. It is the case most likely to expose OBS-1.

**TC-08 · `ALO-RISK-DASH-004` · `no-nan-or-blank-values-appear-anywhere-on-output-tab` [S]**
`category: data-integrity` · `labels: suite:smoke, pri:P1`
- Steps: scroll the entire Output tab top to bottom.
- Exp: no `NaN`, `undefined`, `null`, `Infinity`, bare `-`, or empty cell in any of the four tables or
  two chart legends. Genuine zeros must render as `0.00%`, never as blank.

---

### Group 3 — `aloha/risk/report-download` — Download Report

**TC-09 · `ALO-RISK-RPT-001` · `report-file-downloads-when-download-report-is-clicked` [S]**
`category: positive` · `labels: suite:smoke, pri:P1`
- Steps: click **Download Report**; wait up to 30 s.
- Exp: a file is delivered; the filename is meaningful and dated; size > 0; it opens without a repair
  prompt. Record the exact filename and format — no spec exists for it yet (see §G3 Q3).

**TC-10 · `ALO-RISK-RPT-002` · `downloaded-report-values-match-the-on-screen-tables`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: open the downloaded file; compare the `Total FAD` row and three sampled category rows against
  the screen.
- Exp: identical values and identical as-of date. **This is the highest-value case in the group** — an
  export that silently diverges from the screen is the classic financial-reporting defect.

**TC-11 · `ALO-RISK-RPT-003` · `repeated-clicks-do-not-produce-corrupt-or-partial-downloads`**
`category: negative` · `labels: suite:regression, pri:P3`
- Steps: click **Download Report** three times within two seconds.
- Exp: no console error, no partial or 0-byte file, and the UI stays responsive. Either the button
  disables while a request is in flight, or three identical valid files arrive. Both are acceptable;
  a corrupt file is not.

---

### Group 4 — `aloha/risk/total-risk-table` — the Total Risk table

**TC-12 · `ALO-RISK-TRT-001` · `total-risk-table-renders-all-expected-rows-and-columns` [S]**
`category: positive` · `labels: suite:smoke, pri:P1`
- Exp: six columns — `Category`, `Weight`, `Expected Real Return`, `Risk`, `Marginal Risk`,
  `Risk Allocation`. Rows include the five `- Beta` categories, the three `- Alpha` categories, and the
  three summary rows `Total Beta`, `Total Alpha`, `Total FAD`. Summary rows are visually distinct.

**TC-13 · `ALO-RISK-TRT-002` · `risk-allocation-column-sums-to-100-percent`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: sum the `Risk Allocation` cells of the **eight category rows** — exclude the three summary rows.
- Exp: total = `100.00% ± 0.05`, and the `Total FAD` row's own `Risk Allocation` reads `100.00%`.
  *(Observed: 81.64 + 1.38 + 0.19 + 0.00 + 2.84 + 1.60 + 1.11 + 11.23 = 99.99 → passes within tolerance.)*

**TC-14 · `ALO-RISK-TRT-003` · `total-beta-and-total-alpha-subtotals-equal-their-member-rows`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: sum `Risk Allocation` for the five `- Beta` rows and compare to `Total Beta`. Repeat for the
  three `- Alpha` rows and compare to `Total Alpha`.
- Exp: each subtotal matches its members within `± 0.05`, and `Total Beta + Total Alpha = 100.00%`.
  *(Observed: 86.06 + 13.94 = 100.00 → passes.)*
- Note: `Weight` deliberately does **not** sum to 100% here (`Total FAD` shows 177.26%) — expected for
  a beta/alpha overlay model. **Do not raise a bug for it**; confirm the rule with the PO once and
  record the answer so nobody re-raises it (§G3 Q2).

**TC-15 · `ALO-RISK-TRT-004` · `total-fad-marginal-risk-equals-total-fad-risk`**
`category: data-integrity` · `labels: suite:regression, pri:P2, metric:risk`
- Exp: on the `Total FAD` row, `Risk` = `Marginal Risk`. This is a mathematical identity — the marginal
  risk of the whole portfolio with respect to itself. *(Observed: 14.46% / 14.46% → passes.)* A
  divergence is a genuine model defect and warrants a P1 ticket.

**TC-16 · `ALO-RISK-TRT-005` · `all-percentage-cells-use-consistent-two-decimal-formatting`**
`category: positive` · `labels: suite:regression, pri:P3`
- Exp: every numeric cell is `N.NN%` — two decimals, `%` suffix, the same convention in every row. A
  zero value renders `0.00%` (see the `TIPS - Beta` row).

**TC-17 · `ALO-RISK-TRT-006` · `zero-and-negative-values-render-in-the-house-convention`**
`category: boundary` · `labels: suite:regression, pri:P2`
- Steps: locate a zero row (`TIPS - Beta`) and any negative value across the tab.
- Exp: zero → `0.00%`, never blank or `-`. Negative → the Aloha convention used elsewhere in the app
  (Overview renders negatives in parentheses, e.g. `(0.1%)`). Consistency across tabs is the assertion.

---

### Group 5 — `aloha/risk/allocation-chart` — Risk Allocation by Asset Class

**TC-18 · `ALO-RISK-ALLOC-001` · `pie-chart-and-legend-render-with-all-categories` [S]**
`category: positive` · `labels: suite:smoke, pri:P2`
- Exp: the pie renders (not a blank canvas); the legend lists **eight** entries — Equity Beta, Credit,
  Nominal Bond, TIPS, Real Assets, Equity Alpha, AR, PE/RA — each with a colour swatch and a percentage.

**TC-19 · `ALO-RISK-ALLOC-002` · `legend-percentages-match-the-risk-allocation-column`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: map each legend entry to its Total Risk table row and compare.
- Exp: each legend percentage equals that row's `Risk Allocation` within rounding — legend 1 dp vs
  table 2 dp, so `± 0.05`. *(Observed: legend 81.6% ↔ table 81.64%; 11.2% ↔ 11.23% → passes.)*
- Why it matters: chart and table are usually rendered from the same payload by different code. This is
  where a mapping bug shows up.

**TC-20 · `ALO-RISK-ALLOC-003` · `legend-percentages-sum-to-100-percent`**
`category: data-integrity` · `labels: suite:regression, pri:P2`
- Exp: the eight legend percentages sum to `100% ± 0.5` — a wider tolerance, because 1 dp rounding
  accumulates across eight items.

**TC-21 · `ALO-RISK-ALLOC-004` · `zero-value-category-is-listed-without-breaking-the-chart`**
`category: boundary` · `labels: suite:regression, pri:P2`
- Steps: inspect the `TIPS 0.0%` entry.
- Exp: it appears in the legend with its swatch; no visible slice; no gap, artefact, or console error;
  the remaining slices still fill the circle.

**TC-22 · `ALO-RISK-ALLOC-005` · `slice-tooltip-shows-category-and-value-on-hover`**
`category: positive` · `labels: suite:regression, pri:P3`
- Steps: hover the largest slice, then a thin one.
- Exp: a tooltip names the category and its value, and the named category matches the colour hovered.
- ⚠️ If **no** tooltip appears at all: do not fail immediately — no spec exists. Log it as an
  observation and ask the PO whether tooltips are required. Chart.js provides them by default, so
  their absence is worth a question.

---

### Group 6 — `aloha/risk/top-contributors` — Top Risk Contributors bar chart

**TC-23 · `ALO-RISK-TOPC-001` · `bar-chart-renders-five-contributors-in-descending-order` [S]**
`category: positive` · `labels: suite:smoke, pri:P2`
- Exp: five bars, each with an x-axis label; bar heights are non-increasing left to right; the y-axis
  is labelled in percent with a scale that accommodates the tallest bar.

**TC-24 · `ALO-RISK-TOPC-002` · `bar-chart-entries-match-the-top-five-of-the-by-index-table`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: compare the five bar labels and heights against the first five rows of *Top Ten Contributors to
  Equity Beta Risk (by Index)*, column `Risk Allocation % of Total Endowment Risk`.
- Exp: the same five names, the same order, and heights consistent with those values.
  *(Observed: Nasdaq ≈ 32%, Russell 2000 Biotech ≈ 5.8%, MSCI World ≈ 4.3%, NASDAQ OMX China
  Technology ≈ 3.3%, Russell 3000 ≈ 3.1% — matches the table's top five → passes.)*

**TC-25 · `ALO-RISK-TOPC-003` · `long-index-labels-remain-readable-and-unclipped`**
`category: positive` · `labels: suite:regression, pri:P3`
- Steps: inspect `NASDAQ OMX China Tec…`; hover it; then repeat at 1280 px and 1920 px browser widths.
- Exp: truncation uses an ellipsis, not a hard cut; labels do not overlap each other or leave the
  canvas; the full name is recoverable (tooltip) or matches the table. The chart must not disappear or
  overflow horizontally at either width.

---

### Group 7 — `aloha/risk/top-ten-tables` — the three Top Ten tables

**TC-26 · `ALO-RISK-TOP10-001` · `each-top-ten-table-renders-exactly-ten-rows` [S]**
`category: boundary` · `labels: suite:smoke, pri:P1`
- Exp: all three tables — by Index, by Region, by Manager — show exactly **ten** data rows, with the
  correct headers (5 / 4 / 3 columns respectively). Not nine, not eleven, no empty filler rows.

**TC-27 · `ALO-RISK-TOP10-002` · `each-top-ten-table-is-sorted-descending-by-its-risk-allocation`**
`category: data-integrity` · `labels: suite:regression, pri:P2, metric:risk`
- Exp: in each table, the last column (`Risk Allocation % of Total Endowment Risk`) is non-increasing
  from top to bottom. A "Top Ten" that is not ordered by its own ranking metric is a defect.

**TC-28 · `ALO-RISK-TOP10-003` · `by-index-total-endowment-share-is-consistent-with-equity-beta-share`**
`category: data-integrity` · `labels: suite:regression, pri:P1, metric:risk`
- Steps: for three sampled rows, compute
  `Risk Allocation % of Equity Beta Risk × (Equity Beta's Risk Allocation from the Total Risk table)`
  and compare with `Risk Allocation % of Total Endowment Risk`.
- Exp: agreement within `± 0.1`. *(Observed: Nasdaq 39.76% × 81.64% = 32.46% vs stated 32.46% —
  exact.)* Also assert, per row, that the Total-Endowment share ≤ the Equity-Beta share.

**TC-29 · `ALO-RISK-TOP10-004` · `no-duplicate-entities-appear-within-a-top-ten-table`**
`category: data-integrity` · `labels: suite:regression, pri:P2`
- Exp: within each table, every Index / Region / Manager name appears at most once. Duplicates indicate
  a broken group-by in the aggregation.

**TC-30 · `ALO-RISK-TOP10-005` · `by-region-weights-stay-within-plausible-bounds`**
`category: boundary` · `labels: suite:regression, pri:P2`
- Exp: `% Weight of Equity Beta` sums to ≤ 100% across the ten regions (ten of possibly more); every
  value lies between 0% and 100%; no region exceeds 100%.

---

### Group 8 — cross-cutting: fund scope and resilience

**TC-31 · `ALO-RISK-DASH-005` · `output-content-changes-when-the-fund-scope-changes`** ⚠️ **currently fails**
`category: data-integrity` · `labels: suite:regression, pri:P1, fund:total-endowment, fund:public, fund:private, metric:risk`
- Steps: 1. Record the `Total FAD` row on **Total Endowment** ▸ Risk ▸ Output. 2. Switch to **Public
  Fund**; open Risk ▸ Output; record. 3. Repeat for **Private Fund**. 4. In DevTools ▸ Network, note
  whether a new `/page/risk_model` request fires on each switch.
- Exp: **to be confirmed with the PO.** If Risk is fund-scoped, each fund must show different figures and
  each switch must refetch. If the model is endowment-level only, the sub-tab should say so — a scope
  caption — rather than silently repeating total-endowment numbers under a Public Fund header.
- Current result: **identical values across all three funds, no refetch** → see **OBS-1**. Hold as
  *pending clarification*; file only after the PO confirms intent.

**TC-32 · `ALO-RISK-DASH-006` · `risk-output-becomes-reachable-within-the-agreed-load-budget`**
`category: negative` · `labels: suite:regression, pri:P2`
- Steps: hard-refresh `#/endowment` with a stopwatch; time until the fund sub-nav (containing **Risk**)
  is clickable; repeat three times.
- Exp: the sub-nav is present within the agreed budget, **and** a loading indicator is visible while the
  user waits. Current: roughly 20–30 s with **no** indicator → see **OBS-2**. No budget is documented
  yet (§G3 Q4), so file this as a UX/performance observation with the three measurements attached.

**TC-33 · `ALO-RISK-DASH-007` · `output-shows-an-error-state-when-the-risk-model-request-fails`**
`category: negative` · `labels: suite:regression, pri:P2`
- Steps: in DevTools ▸ Network, block `*/page/risk_model`, then open Risk ▸ Output.
- Exp: a readable error message with a retry path. **Fail** on any of: a permanently blank panel, an
  infinite spinner, a raw stack trace, or `NaN`/`undefined` leaking into the tables.
- Note: safe to run — request blocking is client-side only and this feature is read-only.

**TC-34 · `ALO-RISK-SUB-005` · `output-tab-remains-usable-at-1280px-width`**
`category: positive` · `labels: suite:regression, pri:P3`
- Steps: resize the browser to 1280 × 800 and re-inspect every block.
- Exp: no horizontal page scroll; tables scroll within their own container if needed; both charts remain
  legible; no overlapping text. 1280 px is the narrowest realistic desktop for this app.

---

## Part E — Execution order and the run sheet

Run in waves. **Stop and report after Wave 1 if it fails** — there is no point testing maths on a screen
that does not load.

| Wave | Cases | Time | Gate |
|---|---|---|---|
| **1 · Smoke** | TC-01, 05, 08, 09, 12, 18, 23, 26 | 20 min | any failure → stop and report immediately |
| **2 · Data integrity (the money)** | TC-06, 07, 10, 13, 14, 15, 19, 20, 24, 27, 28, 29 | 75 min | the cases that justify the whole task |
| **3 · Cross-scope** | TC-31 | 20 min | expect OBS-1; gather evidence, do not file yet |
| **4 · Boundary & format** | TC-16, 17, 21, 30 | 25 min | |
| **5 · Negative & resilience** | TC-11, 32, 33 | 25 min | |
| **6 · UI polish** | TC-02, 03, 04, 22, 25, 34 | 30 min | lowest impact — cut this first if time runs short |

**Why this order?** Step 3 of Part A: impact × likelihood ÷ detectability. On a $14.8B endowment tool, a
silently wrong percentage outranks a clipped chart label every time, and Wave 2 is exactly the set a
user cannot self-check.

**Run sheet — copy this into `test_case_inventory.md` and fill it as you go:**

| Case ID | Name | Suite | Pri | Result | Evidence | Triage | Jira |
|---|---|---|---|---|---|---|---|
| ALO-RISK-SUB-001 | output-subtab-is-active-when-risk-tab-opens | smoke | P1 | | | | |
| … | | | | | | | |

Record for every run: **date and time, environment URL, browser and version, logged-in user, and the
`As of` value on screen.** Without those, a failure cannot be reproduced.

---

## Part F — Defect report template

One ticket per independent problem. Never bundle.

```
Title:       <what is wrong> — <where>
             e.g. "Risk > Output shows identical figures for all three fund scopes"

Environment: workbench-app.lab.gend.vn · Chrome 1xx · user: <you> · 2026-08-18 15:40 HST
Data as of:  2026-08-17 06:20 HST   (the As-of stamp on screen — always include it)
Case ID:     ALO-RISK-DASH-005 (TC-31)

Steps to reproduce:
  1. Open https://workbench-app.lab.gend.vn/#/endowment
  2. Total Endowment > Risk > Output — record the "Equity - Beta" row
  3. Switch to Public Fund > Risk > Output — record the same row
  4. Repeat for Private Fund

Expected:    Risk figures reflect the selected fund scope, or the scope limitation is stated on screen
Actual:      All three scopes show 73.58% / 5.00% / 16.95% / 11.81% / 81.64%, while the header strip
             correctly differs (Beta 0.763 / 0.593 / 1.171; NAV 14.78B / 7.46B / 5.97B)

Evidence:    3 screenshots attached; DevTools shows no new GET /page/risk_model on scope switch,
             and the endpoint carries no fund parameter
Impact:      A user reading Public Fund risk is shown total-endowment risk with no warning —
             a decision-grade data defect
Severity:    High     Priority: P1
Open question: is the risk model intentionally endowment-level only? (asked to PO 2026-08-18)
```

That last line is the professional move. Stating what you do **not** know is what separates a report an
engineer acts on from one they argue with.

---

## Part G — Exit criteria and open questions

### G1 — This task is done when

1. All 34 cases are executed and recorded, or explicitly deferred with a written reason.
2. Wave 1 (smoke) is **100% pass** — anything less blocks the release.
3. Every data-integrity failure has a Jira ticket **or** a written PO ruling that it is by design.
4. `test_case_inventory.md` carries all 34 rows with results.
5. The open questions in §G3 have been sent to the PO/BA. Answers may arrive later; asking is the gate.

### G2 — Not in scope for this pass

Accessibility — deferred by the taxonomy, but noted: both chart canvases have **no `role` and no
`aria-label`**, so they are invisible to screen readers; raise that separately. Also out of scope: load
and performance testing, cross-browser beyond Chrome, the `Parameters` / `History` / `Scenario Testing`
sub-tabs, and production `aloha.conceptia.com`.

### G3 — Open questions for the PO / BA

1. **Is Risk ▸ Output fund-scoped?** Blocks the verdict on TC-31 / OBS-1. *(highest priority)*
2. Is `Weight` in the Total Risk table expected to exceed 100% (`Total FAD` 177.26%)? Assumed yes — a
   beta/alpha overlay — please confirm so it can be documented and never re-raised.
3. What format and contents should **Download Report** produce? No spec exists, so TC-10 currently has
   no absolute oracle.
4. What is the acceptable first-load budget for the fund sub-nav, and should a loading indicator be
   shown? Blocks the verdict on TC-32 / OBS-2.
5. Are chart tooltips a requirement (TC-22)?
6. What is the rounding and tolerance policy for reconciling 1 dp displays against 2 dp tables? This
   script assumes `± 0.05`.

---

## Appendix — glossary for a first QA task

| Term | Meaning here |
|---|---|
| **Oracle** | The source that tells you what "correct" is. Without one you can describe, not test. |
| **Test case** | One question with one unambiguous pass/fail answer. If it needs "and", split it. |
| **Test suite** | A *selection* of cases run together. Here: a saved query over labels, not a folder. |
| **Smoke test** | The 20-minute "is it alive" set. Runs first, gates everything else. |
| **Regression test** | Re-running known-good cases to prove new work broke nothing. |
| **Data integrity** | "The number is wrong" — distinct from "the button is broken." Different severity, different owner. |
| **Boundary case** | Testing the edges: zero, empty, maximum, exactly-ten. Where code most often breaks. |
| **Negative case** | Deliberately doing the wrong or hostile thing, to check the system fails gracefully. |
| **Exploratory testing** | Unscripted but structured investigation. Produces the test cases — not a substitute for them. |
| **Precondition** | State that must exist before the steps are valid. Unstated preconditions are the top cause of "works on my machine." |
| **Evidence** | Screenshot + values compared + timestamp + environment. "It looked fine" is not evidence. |
| **Triage** | Deciding *why* a case failed: app bug / test defect / expected change / feature unavailable. |
| **P1 / P2 / P3** | Priority: fix before release / fix this cycle / fix when convenient. |
