# Aloha QA Test Plan — QOps Harness

> **Version:** 1.0 · **Date:** 2026-07-02
> **Team:** 3 QA (QA Lead + 2 QA members)
> **Primary environment:** `workbench-app.lab.gend.vn` (lab)
> **Future environment:** `aloha.conceptia.com` (flagged, not tested in wave 1)
> **Scope wave 1:** Overview, Risk, Scenario Test, navigation, search, exports
> **Deferred:** Cash Forecast deep regression (unstable — just implemented; smoke-only until stabilized)

---

## 1. Objective

Use the QOps Harness (LLM + Playwright automation) to build a maintainable automated
regression suite for the Aloha platform, so QA can:

1. Detect regressions on **stable** pages immediately (any failure = real signal).
2. Triage failures fast (App bug / Test script bug / Expected change) via the Harness AI triage.
3. Feed confirmed defects into Jira with evidence (screenshots, steps, logs).
4. Promote the Cash Forecast module into the suite once UAT completes and it stabilizes.

---

## 2. Environment strategy

| Rule | Detail |
|---|---|
| Primary target | `workbench-app.lab.gend.vn` — safe to interact/write |
| Future target | `aloha.conceptia.com` — **read-only until explicitly approved**; do not run write-actions (Scenario inputs, Fund Setup, Upload) there |
| Environment tags | Every case tagged `env-lab`. Cases verified portable later also get `env-conceptia` |
| Prompt convention | The environment appears **only** in the first line of each case prompt: `Go to workbench-app.lab.gend.vn` — one-line change to migrate |
| Inventory column | "Conceptia-ready?" = `Yes` / `Needs review` / `Never` (Never = any case that mutates data) |
| Sessions | `data/sessions/workbench-auth.json` (lab) — keep separate from `aloha-auth.json` (Conceptia) |

**Assertion classes (because lab data ≠ production data):**

- **Structural / behavioral** (~80% of suite): element appears, table expands, dialog opens,
  export downloads, no NaN/blank. Environment-agnostic — ports unchanged.
- **Data-integrity** (relative checks only): children sum to parent, `% of FAD` totals 100%,
  Total Endowment > each component fund. **Never hard-code values** (e.g. "NAV = 7.05B") —
  those differ per environment and per day.

---

## 3. Conventions

### Naming
`<expected-behavior>-when-<action>` — e.g. `rating-dialog-appears-when-clicking-final-fund`
(matches existing case style).

### Category (= Aloha module)
`navigation` · `overview` · `risk` · `scenario-test` · `return-public` · `return-private` ·
`liquidity` · `search-export` · `cash-forecast`

### Tags
- Type: `smoke` · `regression` · `negative` · `boundary` · `security`
- Priority: `P1` · `P2`
- Fund context: `total-endowment` · `public-fund` · `private-fund` · `pipeline`
- Environment: `env-lab` (· `env-conceptia` later)
- Traceability: Jira key when relevant (e.g. `KS-963`)

### Case mix target per feature
~60% positive · 20% negative · 15% boundary · 5% security.

---

## 4. Team assignment (3 QA)

| Owner | Responsibility |
|---|---|
| **QA Lead** | Phase 0 setup (session, conventions, Knowledge tab) · smoke suite · daily triage rotation schedule · weekly report · Harness feature-request liaison with dev |
| **QA-B** | `overview` (largest module) + `search-export` regression suites |
| **QA-C** | `risk` + `scenario-test` + `navigation` regression suites |

Daily triage of "Failing now / Needs triage" rotates across all 3 (one person per day).

---

## 5. Timeline (3 weeks to steady state)

### Week 1 — Foundation + Smoke
1. **Capture lab session:** log in to `workbench-app.lab.gend.vn`, save session via the
   Harness session Upload control as `workbench-auth.json`.
2. **Re-run the 2 failing `rating-dialog…` cases** with the fresh session — expected to pass
   (previous failures were a Q4 login redirect loop / 401, i.e. environment noise).
   This cleans the triage queue and sets a true dashboard baseline.
3. Seed the **Knowledge tab**: Aloha tab structure and URLs, environments note
   (lab = writable, Conceptia = read-only), domain rules (sign convention: Capital Calls
   negative / Distributions positive; default forecast params 8% / 33% / $50M / 20%).
4. Build the **smoke suite** (~20 cases, all 3 QA, split by module ownership).
5. Start daily smoke runs.

### Week 2 — Regression build
- QA-B: Overview asset table + search/export suites (Test Feature mode).
- QA-C: Risk + Scenario Test suites (Test Feature mode).
- Lead: report template, triage cadence live, first weekly report.

### Week 3 — Complete + operationalize
- Finish negative/boundary/security groups per module.
- Tag-based batch regression runs 2–3×/week established.
- Begin using **Test Bug** mode for every manually found defect
  (failing case first → dev fix → case flips green = automatic fix verification).

### Week 4+ — Steady state
- Daily smoke + triage · 2–3×/week full regression · weekly report.
- **Promote Cash Forecast** to full regression when UAT completes and it stabilizes —
  the BDD scenarios in `Jira Ticket/DB and Docs/CF_tickets_breakdown.md` (KS-958…KS-970,
  KS-1049/1050) are ready to feed into Test Feature mode.

---

## 6. Test case catalogue

### 6.1 Smoke suite (~20 cases, tag `smoke`, run daily)

| # | Case | Category |
|---|---|---|
| 1–4 | Each fund tab (Total Endowment, Public, Private, Pipeline) loads with header metrics numeric — Beta, Risk, % Illiquid, NAV, Unfunded not blank/NaN | navigation |
| 5 | Fund-level data separation: Total Endowment NAV > each component fund's NAV | navigation |
| 6 | Overview: Historical Returns chart + Asset Class Breakdown pie render with legends | overview |
| 7 | Overview: asset table renders all top-level rows (Private Equity, Absolute Return, Public Equities, Real Assets, Fixed Income, Total Cash) | overview |
| 8 | Expand category → sub-category → final fund → **Rating dialog appears** (boss's sample prompt) | overview |
| 9 | Search a known fund → detail page/tab appears | search-export |
| 10 | Risk tab: Risk Model Dashboard loads (Total Risk table, allocation pie, Top Risk Contributors) | risk |
| 11 | Scenario Test: input table + Prior Day Comparison load; Total Endowment row = 100% | scenario-test |
| 12 | Export Excel on Overview triggers a valid download | search-export |
| 13 | Return (Public) and Return (Private) tabs load without error | return-* |
| 14 | Liquidity tab loads (or shows intended placeholder state) | liquidity |
| 15 | Saved session opens the app directly — no login redirect | navigation |
| 16–18 | Cash Forecast: each sub-tab (Dashboard, Historical Flows, Details) loads without error — **smoke only, no deep assertions** | cash-forecast |

### 6.2 Overview regression (owner: QA-B)

**Data integrity (relative checks):**
- Child NAV rows sum to parent row; top-level `% of FAD` totals 100%.
- Negative values render in parentheses, e.g. `(0.07)`.
- Benchmark name present for every asset row.

**Interaction:**
- Expand/collapse every tree level; state consistent on re-expand.
- Sort by Asset and Benchmark columns (toggle asc/desc).
- Add Filter applies and clears correctly.
- "Owned by KS" checkbox filters the list.
- Fund drill-down → Rating dialog: correct fund name shown; dialog closes cleanly.

**Per-fund variation (repeat key cases × 4 fund tabs, tag with fund context):**
- Private Fund shows the Venture Capital sub-tree; Pipeline shows Real Assets detail.

**Negative / boundary:**
- Rows with blank return cells render without layout break.
- Very long fund names (e.g. "Sequoia Capital Global Growth Fund III US/India Annex Fund LP") don't overflow.

### 6.3 Risk regression (owner: QA-C)

- Total Risk table: Weight column sums ≈ 100%; Total FAD row highlighted; as-of date shown.
- Risk Allocation pie legend sums to 100%; Top Risk Contributors chart renders ≥ 1 bar.
- Top Ten tables (by Index / Region / Manager) each ≤ 10 rows, sorted descending.
- Sub-tabs Output / Parameters / History / Scenario Testing all switch correctly.
- Download Report produces a file.
- Negative: switch between all 4 fund tabs on Risk — no stale data carry-over.

### 6.4 Scenario Test regression (owner: QA-C)

- Enter a Scenario Flow value → Scenario NAV and % of Endowment recalculate; Total Endowment row updates.
- Boundary inputs: `0`, very large (999999), negative, non-numeric text — graceful handling, totals never NaN.
- Expandable rows (Total Cash sub-rows, Private Equity) expand/collapse.
- Prior Day Comparison: red negatives in parentheses; keyword search filters rows; Print works.
- **Security/safety:** refresh page → scenario inputs reset (sandbox-only, no persisted mutation).

### 6.5 Search, header, cross-cutting (owner: QA-B)

- Search: partial name, exact name, no-match empty state, special characters.
- Fund Setup / Upload buttons open dialogs (note permission-dependent behavior).
- Deep-link URLs restore correct tab; browser back/forward works between tabs.
- Security: unauthenticated deep URL → redirected to login.

### 6.6 Cash Forecast (deferred — smoke only)

Keep cases 16–18 above. When stable, build full suite from `CF_tickets_breakdown.md`
BDD scenarios, priority: KS-963 Hypothetical Flows → KS-964 Calculate Impact →
KS-961 Forecast Parameters → KS-965 Drill-down → KS-967/968 Historical (sign convention) →
KS-970 Details → KS-1050 removal verification.

---

## 7. Example ready-to-paste prompts

**Smoke #8 (boss's sample, adapted to lab):**
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Expand the categories line (in the table listing categories and measures)
Expand more if needed until we see a final fund which cannot be expanded
Click on the Fund
Validate that the Rating dialog for the Fund appears
```

**Scenario Test boundary:**
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Public Fund tab
Click on Scenario Test tab
In the Scenario Flows column, enter -50 for the "Endowment Cash" row
Validate that Scenario NAV recalculates and the Total Endowment row updates
Validate that no cell displays NaN or blank after recalculation
```

**Overview data integrity (relative check):**
```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Total Endowment tab
In the asset table, read the % of FAD value on the Financial Assets row
Validate that it equals 100.0%
Expand Financial Assets and validate every child row has a numeric % of FAD value
```

---

## 8. Monitoring & reporting

| Artifact | Cadence | Purpose |
|---|---|---|
| Dashboard **CSV export** | Weekly | Pass-rate trend, AI-step ratio, failures per feature — raw material for the weekly report |
| Cases page — **Failing now / Needs triage** | Daily (rotating owner) | Classify: App bug → Jira · Test script → fix case · New feature → update case |
| **Runs / live quest logs** | On failure | Root-cause evidence: screenshot at failing step, raw logs |
| `data/sessions/workbench-auth.json` | Before each batch run | #1 historical cause of false failures (auth redirect loop) |
| Knowledge files (`GLOBAL/README.MD`, `QOPS-CONVENTIONS.MD`) | Monthly + after app changes | Keep AI context current (e.g. after KS-1050 removes the as-of picker) |
| [`Harness/test_case_inventory.md`](./test_case_inventory.md) | **After every Harness session** | Traceability matrix: case ↔ Harness slug ↔ owner ↔ last status ↔ Conceptia-ready? |

**Weekly report contents:** pass-rate trend · new cases added · failures by classification
(app bug / script / expected change) · Jira tickets filed from Harness findings ·
AI-fallback rate (rising fallback = decaying selectors = maintenance debt).

---

## 9. Harness feature backlog (requests to dev)

**P1 — needed now**
1. **Session auto-refresh / re-login flow** — eliminates auth-loop false failures.
2. **Filter cases by feature/category/creator** on the main Cases list (boss's open item; taxonomy data already exists).
3. **Show Tag + Level columns** on the Cases screen (boss's open item).
4. **Wire "File a bug" to Jira** — auto-create KS ticket with screenshot + steps from the triage panel.

**P2 — soon**
5. **Base-URL / environment variable per project or run** — cases say "Go to {baseUrl}"; makes the Conceptia migration a config switch instead of editing 80+ cases.
6. **Scheduled runs** (nightly smoke) with email/Slack notification.
7. **Flaky-test detection** — auto-retry once before marking failed; label persistent flappers.
8. **Data-value assertions** — assert numbers/sums, not just element presence (critical for a financial platform).

**P3 — later**
9. Run-history comparison between builds · per-user dashboards · mobile support (already deferred by boss) · richer in-app user guide.

---

## 10. Volume summary

~20 smoke + ~60–80 regression cases, weighted ≈ 40% Overview · 25% Risk ·
20% Scenario Test · 15% search/navigation/exports. Cash Forecast held at 3 smoke
cases until promoted.
