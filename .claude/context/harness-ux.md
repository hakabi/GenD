# Context Pack — Harness UX Improvement (QG-138)

**Programme:** improving **QOps Harness**, an internal LLM + Playwright test-ops tool QA uses to generate
and run test cases against Aloha. Harness is internally built, so BA suggestions become dev tickets.

**Jira project QG**, Epic **QG-138**. Live at `qops-harness.lab.gend.vn` (Google SSO — needs the user's
real Chrome; the in-app browser has no session).

> **This program serves the Aloha rewrite.** KS-1102 uses "Playwright / TypeScript / QOps Harness"
> as its test stack, replacing Selenium. Harness improvements are not a side project.

---

## 1. Reading list

| File | For |
|---|---|
| `Harness/Documents/Harness_Session_Handoff.md` | §1 context · §2 conventions · §3 how Harness works end to end · §5 what shipped · §8 the QG ticket index |
| `Harness/Documents/00_Active/Harness_Case_Classification_Plan.md` | §6 status · **§8 divergence register** · §9 open decisions |
| `Harness/Documents/00_Active/Harness_Release_Log.md` | §2 watch list · §3 deploys |
| `Harness/Documents/00_Active/Open_Items.md` | What is blocked on a person |
| `Harness/Documents/05_Session_Notes/Harness_UIUX_Session_Handoff_2026-08-18.md` | Decisions D1–D9, live findings |
| `Harness/Documents/02_Reviews_and_Analysis/Harness_UXUI_Review.md` | Screen-by-screen review, ticket index |
| `Harness/Documents/01_Plans_and_Strategy/Harness_Test_and_UX_Plan.md` | The wider improvement loop |

**Before proposing anything, read §8 of the classification plan and the release log.** The platform keeps
shipping parts of our proposals.

## 2. Design source of truth

`Harness/Harness Page/Harness_UI_Tokens_Shipped_2026-08-20.md` — all 92 CSS custom properties in both
themes, measured live on 20 Aug.

The two 14 Aug `_Jira_Aligned` documents are the *proposal*; they carry superseded-for-values banners and
remain useful only for component specs and reasoning. `Harness/QOps_Harness/css/tokens.css` is a
migration reference, not a target.

**Three traps:**

1. **Dark mode has no shadows.** Depth comes from the surface ladder
   `#161A1D` → `#1D2125` → `#22272B` → `#282E33` → `#2C333A`.
2. **`--radius-pill` is 3px.** Nothing is a capsule.
3. **The font is the OS system stack**, not Söhne.

`<html>` carries `data-appearance` (`day`/`night`/`system`) and `data-theme` (`light`/`dark`). `system`
follows the OS, so honour `prefers-color-scheme` as well as an explicit choice.

## 3. How Harness works

```
create → crew_phase_a_build         "Build test steps"          AI
       → AWAITING_REVIEW            (a milestone, re-enterable)
       → [human clicks Confirm and process]
       → render_nlonly_spec         "Generate Playwright spec"  AI
       → crew_phase_b_migrate       "Migrate step automation"   AI
       → validate_pre_run_spec      "Pre-run validation"        AI
       → execute_run_playwright_spec "Run Playwright"           AI
       → finalize_artifacts         "Commit & open PR"          AI
```

Statuses: `pending → running → awaiting_review → running → failed | successful`.

Sidebar: Requests · Test cases (Failed / All cases / Executed history) · Test groups · Knowledge ·
Dashboards · Settings (nine tabs: Appearance · Configuration · Events · Queue · Secrets · Sessions ·
Projects · Integrations · Maintenance).

## 4. Standing constraint — D9

**Decision D9 (PO, 17 Aug): nothing goes to Jira or Confluence without asking first.** This governs *this
pack only*. It does not extend to the KS programs, which the BA owns.

## 5. Browser rules

Navigate and inspect freely — sub-tabs, side panels and filters are client-side state, not URLs, so an
observe-only pass cannot see the app.

| | |
|---|---|
| **Do** | Nav items, tabs, sub-tabs, rows, side panels, expanders, pagination · type into search and filter boxes · toggle Settings → Appearance to capture both themes · scroll, hover, screenshot |
| **Never** | **New request** · **Confirm and process** · **Retry** · delete or bulk actions on cases · **Upload** / **Use default** on session files · Settings → **Secrets**, **Integrations**, **Maintenance** · Knowledge edits |

The test: *does this create work, spend budget, or change state another person can see?* Restore any
setting you change, and say so.

## 6. Live findings worth knowing

- 87 failing cases, **86 needing triage**, 1 labelled. The labelling features exist and are unused
- `FAILED STEP` renders but is never populated
- 203 distinct `feature` values; `category` is `default` on all cases
- Two measured token defects: `--surface-hover` equals `--surface` in light mode (hover invisible in
  Day); `ai` and `duplicate` status pills are byte-identical in both themes
