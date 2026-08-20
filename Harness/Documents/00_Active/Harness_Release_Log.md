# Harness — Release Log & Change Tracking

**Owner:** BA · **Source:** Teams → *KS Investment Front Office Application Project* → **QOps Harness** channel
**Captured:** 7 August 2026 (auto) · **Covers:** 31 Jul – 6 Aug 2026
**Deploy cards posted by:** Workflows bot (template used by the PO) · **Host user:** `QuanPLA`

> **Purpose.** Harness ships several times a day. QA test against a moving target, and our
> classification plan is being written against a system that is changing underneath it. This file is the
> record of what changed and what it means for our workstream.
>
> **How to update.** Open the QOps Harness channel, copy any new *"deploy completed (release notes ok)"*
> card into §3 newest-first, then update §2 if it touches our plan. Cards with *"no new notes"* only need a
> one-line row. Takes about two minutes per deploy.
>
> **Health warning.** §2 is read from commit messages, not from using the product. Every claim there is a
> lead to verify in the UI, not a fact. Verified items are marked ✅.

---

## 1. What is being built — the spec streams

Release notes are prefixed by spec number. Three streams are active:

| Stream | Theme | Status |
|---|---|---|
| **Spec 039** | **Catalog vector index** — Chroma backend, dual-write vectors, ANN shortlist in layered dedup search | Shipped 31 Jul |
| **Spec 040** | **NATS event bus** — Execution steps driven from a NATS queue, Playwright step emits bridged to `emit_status`, embedded NATS in the harness image | Shipped 31 Jul, hardened through 4 Aug |
| **Spec 041** | **Test groups** — CRUD, membership, nesting, schedules, webhooks, manual runs, status & history | Shipped 3 Aug (two waves) |

Deploys go to two targets: **`sandboxes`** (frequent, most changes land here first) and **`gend`** (fewer — this is the environment behind `qops-harness.lab.gend.vn`). Release notes are computed relative to the last **gend** deploy.

---

## 2. Impact on the classification workstream — **read this before the next PO conversation**

### Needs BA review

*Auto-flagged from release notes only. Nothing here is verified; none of it changes any §4 watch-list status.*

- [ ] `48335c5` - "fix(042): rename Dashboard copy to Trends & taxonomy" - may relate to §8 row D4 / §9 decision 5 (Phase A taxonomy). Not verified.
- [ ] `48335c5` - "feat(042): Feature & label aggregate API" - may relate to §8 row D9 (Feature/Labels values) and §8 row D8 (distinct-value baseline). Not verified.
- [ ] `48335c5` - "feat(042): Feature & label dashboard UI and filters" - may relate to §8 row D1 (Cases filtering / CaseFilterBar) and §8 row D9 (Feature/Labels values). Not verified.
- [ ] `48335c5` - "feat(042): feature-label unique-case metrics + step counts" - may relate to §8 row D8 (cases-per-value baseline). Not verified.
- [ ] `48335c5` - "feat(cases): Configure columns popover on All cases table" - may relate to §8 row D1 (Cases list). Not verified.
- [ ] `e57dd3f` - "docs(dox): note Groups CaseFilterBar + taxonomy script requirement" - may relate to §8 row D4 / §9 decision 5 (Phase A taxonomy), and §8 rows D1 (CaseFilterBar) and D2 (group membership). Not verified.
- [ ] `e57dd3f` - "fix(web-ui): restore Feature/Labels on group add-cases filters" - may relate to §8 row D2 (group membership) and §8 row D9 (Feature/Labels values). Not verified.
- [ ] `2148711` - "feat(platform): denormalize effective session paths for fast case lists" - may relate to §8 row D1 (Cases list). Not verified.
- [ ] `2148711` - "fix(web-ui): show loading state instead of empty cases flash" - may relate to §8 row D1 (Cases list / CaseFilterBar). Not verified.
- [ ] `2148711` - "fix(spec): surface search-catalog import validation errors" - may relate to §8 row D3 (catalog / dedup search) and §9 decision 1 (request validation). Not verified.
- [ ] `2148711` - "feat(gitnexus): attach import_from hints to lib search results (QG-154)" - may relate to a QG-### ticket key (QG-154); no §8 row or §9 decision matched. Not verified.
- [ ] `2148711` - "fix(test-repo): preserve project helper barrel on scaffold overlay (QG-154)" - may relate to a QG-### ticket key (QG-154); no §8 row or §9 decision matched. Not verified.

Several items in the last week overlap [`Harness_Case_Classification_Plan.md`](./Harness_Case_Classification_Plan.md). Some of our T-items may be partly or wholly delivered already.

### 🔴 P1 — "Phase A taxonomy" already exists

> `fix(catalog): prefer managed app_project for Phase A taxonomy` — 4 Aug, commit `5235d30`

There is an existing taxonomy workstream with its own phase naming. **Find out what "Phase A taxonomy" covers before presenting our proposal** — it may already define part of the vocabulary, or conflict with it. This is the single most important follow-up in this document.

*Question for the PO:* what is Phase A taxonomy, what does it classify, and where is it documented?

### ✅ RESOLVED — Test groups (Spec 041) is **not** GROUPS

Twenty `feat(041)` commits shipped on 3 Aug delivering a full **Test groups** feature: CRUD, membership, nesting with a "resolve set", cron schedules and a ticker, webhooks, manual runs, status and history, and a Groups tab in the case workbench.

**Verified in the UI on 4 Aug: membership is a static list.** The group editor offers *Add cases from catalog* — filter, tick checkboxes, **Add selected (N)** — with a per-row **Remove**. The filters inside a group are a finding aid, not a membership rule. Nothing re-evaluates, so **a new matching case does not join a group** until somebody remembers to tick it.

So 041 delivers the plumbing around suites and none of the self-filing. **GROUPS survives**, rewritten from *"build saved-query suites"* to *"add a query-defined membership mode to the groups that already exist"* — a much smaller change with a real feature to attach to.

What 041 gave us that the plan never specified: cron scheduling (the `Nightly` group runs `0 2 * * *` UTC), webhooks, parent/child nesting, Run now, and per-case group membership. **Adopt all of it; do not re-specify any of it.**

### ✅ RESOLVED — Cases filtering **is** FILTERS. Closed.

> `feat(web-ui): add CaseFilterBar and wire Cases toolbars` — 3 Aug, `603ecde`
> `fix(web-ui): debounce Cases free-text search` — 3 Aug
> `fix(platform): filter Cases sidebar project by app_project` — 4 Aug

Verified 4 Aug: the All cases page filters on **Search · Feature · Labels · Status · Reason**, with Feature and Labels as multi-selects, and case detail carries **Info / Steps / History / Groups**. **FILTERS is closed as delivered by the platform**, and QG-139's prompt-search item is covered by the same work.

### 🟠 P2 — Semantic dedupe already exists (Spec 039)

> `feat(039): add Chroma catalog vector index backend`
> `feat(039): ANN Given shortlist in layered dedup search`
> `feat(039): dual-write catalog vectors and expose index stats`

Duplicate detection is already **vector-based with an ANN shortlist**, not just text matching. This does **not** make our Gate C / Gate E redundant — it makes them cheaper to add. Label-scoping narrows the ANN candidate set before the vector search runs, which improves precision and cost. Reframe the dedupe argument as *"scope the existing ANN search by labels"* rather than *"build dedupe"*.

### 🟡 P3 — Case identity changed

> `fix(catalog): make case_id the unique catalog identity` — 3 Aug
> `docs(catalog): record case_id uniqueness and repair CLI`
> `fix(catalog): sync index path on case upsert; join list on case_id` — 4 Aug

`case_id` is now the unique identity, with a repair CLI (`repair-catalog-case-ids --apply`). Check this against our proposed `ALO-CF-HYPFLOW-003` case-ID convention — we may need to sit alongside `case_id` rather than replace it.

### 🟡 P3 — New metric available for monitoring

> `feat(web-ui): show last Playwright duration on cases and requests` — 4 Aug
> `feat(platform): persist last Playwright wall-clock duration`

Run duration is now persisted and displayed. Candidate addition to §7 of the plan — duration per feature area would show which parts of Aloha are slow to test.

### 🟠 P2 — New Request `app_project` binding reworked, same day as our bug report

> `feat(requests): resolve app_project from form or sidebar fallback` — 4 Aug, `8375e81`
> `fix(requests): keep sidebar project in New Request dialog` — 4 Aug, `8375e81`
> `fix(requests): prefer sidebar over default app_project seeds` — 4 Aug, `729ad15`

Three deploys between 12:01 and 12:29 all reworking how the New Request dialog resolves `app_project` — form value, sidebar value, or default seed.

**Lead to verify:** we reported that morning that the dialog opens carrying a previous request's content and cannot be cleared. These commits touch the same dialog's state resolution. Either they partially address it, or they are an adjacent fix to the same underlying "dialog state is not reset" defect.

*Action: re-open New request after this build and check whether the pre-fill still occurs.* Do not close the bug ticket on the strength of commit messages alone.

### ⚪ Context — multi-project work is active

> `fix(catalog): skip foreign test-cases trees during multi-project sync`
> `docs(dox): record catalog app_project ownership guardrails`

`app_project` (`aloha` / `harness`) is being hardened as an ownership boundary. Consistent with our axis 1, and confirms multi-project is real rather than theoretical.

---

## 3. Release log — newest first

### 6 August 2026 (Thu)

**`3c8937c` → `gend`** · started 18:32 · completed 18:36 — *card says "release notes skipped — release notes unavailable (LLM failed or not configured)"*

**`48335c5` → `gend`** · started 13:49 · completed 13:54

- **New:**
  - `feat(042)` scaffold Feature & label shell + Vite entry
  - `feat(042)` add Dashboards nav group and feature-label route
  - `feat(042)` Feature & label aggregate API
  - `feat(042)` Feature & label dashboard UI and filters
  - `feat(042)` Feature & label design parity and testids
  - `feat(042)` feature-label unique-case metrics + step counts
  - `feat(042)` Feature & label step columns UI
  - `feat(cases)` CaseListItem-backed All-table column registry and prefs
  - `feat(cases)` Configure columns popover on All cases table
- **Update:** `chore(042)` sync test-helpers canonical step telemetry modes · `docs(042)` Dashboards Feature & label DOX · `docs(042)` Feature & label unique-case metrics and step fields · `docs(dox)` never hand-edit shared helpers in sibling test-scripts repos · `docs(dox)` Cases All column config prefs and registry
- **Fix:** `fix(042)` rename Dashboard copy to Trends & taxonomy · `fix(platform)` map legacy `stagehand*` telemetry modes to AI counts · `fix(scripts)` host-build web-ui in `run-local-gend-db` · `fix(web)` treat stagehand step modes as AI in execution tree

> First appearance of a **Spec 042** stream — release notes only; no conclusion drawn about its scope.
> The `3c8937c` card carries no release notes, so nothing is recorded for it beyond the deploy itself.

### 5 August 2026 (Wed)

**`e57dd3f` → `gend`** · started 16:37 · completed 16:39

- **New:** (none)
- **Update:** `docs(dox)` note Groups CaseFilterBar + taxonomy script requirement
- **Fix:** `fix(web-ui)` restore Feature/Labels on group add-cases filters

**`e57dd3f` → `gend`** · started 14:21 · completed 14:23

- **New:** `feat(web-ui)` show step instructions in Execution detail
- **Update:** `docs` GitNexus Fetch Main + Execution screenshot/log contracts · `docs(dox)` document finalize-before-Playwright retry contract
- **Fix:** `fix(web)` show failure screenshots on failed run nodes · `fix(services)` mark last Playwright step failed on hard exit · `fix(services)` refresh GitNexus only on Fetch Main · `fix(web)` nest Playwright logs under open step · `fix(pipeline)` commit and open PR before Playwright

**`2536aea` → `gend`** · started 11:06 · completed 11:10 — no new notes

**`2148711` → `gend`** · started 07:42 · completed 07:44

- **New:** (none)
- **Update:** (none)
- **Fix:** `fix(web-ui)` show loading state instead of empty cases flash · `fix(web)` restore queue/detail scroll after testid island wrappers

**`2148711` → `gend`** · started 07:00 · completed 07:05

- **New:**
  - `feat(web)` add Maintenance Sync case sessions control and API
  - `feat(platform)` denormalize effective session paths for fast case lists
  - `feat(web)` add data-testid on vanilla JS, login, and coverage tests
  - `feat(web-ui)` add exhaustive data-testid attributes across React islands
  - `feat(settings)` add Install npm deps button on Projects
  - `feat(gitnexus)` attach `import_from` hints to lib search results (**QG-154**)
- **Update:** `test+docs` cover effective session sync and document Maintenance path · `docs` require harness UI data-testid on new and changed controls · `docs(services)` note queue re-resolves stale parent `repo_root` · `docs` document Install npm + Playwright Settings repair path · `docs` note Install npm deps for Docker `node_modules` volumes · `docs(web)` note incremental Execution feed and heartbeat scope capture · `docs(events)` note PTY streaming, bound emit, and Playwright heartbeats · `docs(local)` document per-project host test-repo mounts · `docs` local testing runbook and QG-154 DOX notes
- **Fix:** `fix(queue)` re-resolve project checkout before Playwright runs · `fix(settings)` restore npm install and Playwright browser install on Projects button · `fix(local)` keep checkout `node_modules` on Linux Docker volumes · `fix(ui)` smooth Execution updates and nest Playwright heartbeats · `fix(playwright)` stream live Execution updates during long runs · `fix(spec)` surface search-catalog import validation errors · `fix(test-repo)` preserve `export * from` in helper barrel merge · `fix(playwright)` warn when checkout alias restore fails · `fix(session)` align case UI and queue parents with `by_project` sessions · `fix(session)` prefer `by_project` session over stale global override · `fix(test-repo)` recreate Playwright aliases after wiped `node_modules` · `fix(events)` import asyncio at module scope for NATS bridge · `fix(test-repo)` preserve project helper barrel on scaffold overlay (**QG-154**)

> Two deploys of the **same commit `2148711`** to `gend` 37 minutes apart, each with its own release-notes
> card. Transcribed as posted; no conclusion drawn about why.

### 4 August 2026 (Tue)

**`76481a3` → `gend`** · started 14:28 · completed 14:30

- **New:** (none)
- **Update:** Document local gend-sandbox DB copy workflow for pre-deploy testing
- **Fix:** honor Show queue-limit select without page reload (**QG-153**) · lock queue-limit-select refetch (**QG-153**)

> First release notes to cite a **QG** ticket key — QG-153 is in the same project as our Epic QG-138, and
> covers the "Show 5 / 20 / 100" selector on the Requests queue.

**`729ad15` → `gend`** · started 12:27 · completed 12:29

- **New:** (none)
- **Update:** `docs(dox)` prefer sidebar over non-empty default `app_project` seeds · `test(requests)` cover default-seed and DOM sidebar project binding
- **Fix:** `fix(requests)` prefer sidebar over default `app_project` seeds

**`8375e81` → `gend`** · started 12:01 · completed 12:06

- **New:** `feat(requests)` resolve `app_project` from form or sidebar fallback
- **Update:** `docs(dox)` document New Request `app_project` sidebar binding · `test(requests)` lock sidebar `app_project` binding in New Request
- **Fix:** `fix(requests)` keep sidebar project in New Request dialog

> ⚠️ **Three deploys in 2.5 hours, all on New Request `app_project` binding.** Directly adjacent to the
> bug we reported the same morning (New Request dialog opens carrying a previous request's content).
> See §2 and watch-list item 5.

**`5235d30` → `gend`** · started 10:59 · completed 11:01 ✅ *(also started to `sandboxes` 10:59)*

- **New:** (none)
- **Update:** `docs(dox)` record catalog `app_project` ownership guardrails
- **Fix:**
  - `fix(platform)` filter Cases sidebar project by `app_project`
  - `fix(catalog)` skip foreign test-cases trees during multi-project sync
  - `fix(catalog)` prefer managed `app_project` for **Phase A taxonomy**

**`6e8d071` → `sandboxes`** · started 09:34, restarted 09:47 · completed 09:54

- **New:**
  - `feat(nats)` add emit capture hook for broker-free smoke tests
  - `feat(web-ui)` show last Playwright duration on cases and requests
  - `feat(platform)` persist last Playwright wall-clock duration
- **Update:** `docs(dox)` preferred quest rebase is local-only until Settings sync · clarify NATS ready-gate and `QOPS_NATS_READY_TIMEOUT_SEC` · note NATS step control plane and duration fields
- **Fix:** exclude Allure upload from Playwright `duration_ms` · exclude local bindings from unbound automation helper scan · `catalog` sync index path on case upsert, join list on `case_id` · `catalog` mark `seen_case_ids` only after successful upserts · `nats` stop marking `connect_failed` on ready timeout · `checkout` rebase preferred branch onto base during prepare · `spec` fail closed on unbound automation helper calls · `nats` harden Playwright step emit and bridge path

> ⚠️ Two "deploy started" cards for the same commit (09:34 and 09:47) with no completion between — likely a failed first attempt.

### 3 August 2026 (Mon)

**`603ecde` → `sandboxes`** · started 22:32 · completed 22:43 — *041 polish + Cases filtering*

- **New:** `feat(041)` filter group run history by `case_id` server-side · polish test-groups Status and History tables · port Groups editor UX with filtered membership · **`feat(web-ui)` add CaseFilterBar and wire Cases toolbars** · `feat(041)` enrich group case APIs with Cases-aligned filters
- **Update:** `test(041)` cover group membership HTTP feature and `q` filters · `docs(041)` record CaseFilterBar and enriched group case APIs · `docs(catalog)` record `case_id` uniqueness and repair CLI
- **Fix:** `web-ui` confirm before deleting a test group · `cli` require explicit ack for `repair-catalog-case-ids --apply` · `web-ui` debounce Cases free-text search · `web-ui` reload group case tables after Clear filters · `catalog` soft-release path collisions instead of hard DELETE · **`catalog` make `case_id` the unique catalog identity** · `041` dedupe group membership lists across `app_project` catalog rows

**`9aa4dee` → `sandboxes`** · started 19:04 · completed 19:23 — *no release notes on the card*

**`d0b06e7` → `sandboxes`** · started 18:06 · completed 18:33 — **★ Spec 041 Test Groups lands**

- **New (20 items):** port test groups detail UX to harness · case workbench Groups membership tab · list test groups for a case · test group status and history UI + API · test group webhook UI + public webhook · test group schedule UI + schedules and ticker · manual test group run UI + API · test group admission and runner · test group nesting UI + nesting and resolve set · test group membership UI + API · test groups manage UI island · test groups CRUD API · test groups store CRUD · add test groups platform migration
- **Update:** `chore(041)` scaffold test groups modules and env knobs · `docs(041)` test-group store lock contract · detail CSS port · case view test group membership · document test groups surfaces
- **Fix:** `fix(041)` serialize test-group admission under `PlatformStore.lock`

**`c57c530` → `sandboxes`** · started 13:03 · completed 13:10 — no new notes

**`a5e97e6` → `sandboxes`** · started 12:22 · completed 12:43

- **New:** (none) · **Update:** `docs(qops)` note scaffold commit propagation to local case branches
- **Fix:** `fix(qops)` restore session-path alias and fan scaffold onto local branches

**`2af527e` → `sandboxes`** · started 09:10 · completed 09:21

- **New:** (none) · **Update:** `docs(qops)` expand Friday changelog for Spec 039/040 themes · `docs(040)` note test-repo NATS helper overlay and `nats` alias
- **Fix:** `fix(040)` overlay NATS step helpers into test-repo checkouts

### 2 August 2026 (Sun)

**`2af527e` → `sandboxes`** · started 11:03 · completed 11:12 — no new commits since last gend deploy

### 1 August 2026 (Fri)

**`2af527e` → `sandboxes`** · started 20:41 · completed 21:49 — **★ Spec 039 + 040 land**

- **New — Spec 040 (NATS):** embed `nats-server` in harness image for moneta · drive Execution steps from NATS queue on I/O thread · include quest/child correlation on NATS step emits · emit Playwright step start/end via `nats.js` · bridge Playwright NATS step events to `emit_status` · add NATS JetStream Compose sidecar and client deps
- **New — Spec 039 (vector catalog):** dual-write catalog vectors and expose index stats · **add Chroma catalog vector index backend** · **ANN Given shortlist in layered dedup search** · add InMemory catalog vector index protocol
- **Update:** `docs(040)` embedded NATS for moneta vs Compose · NATS control plane vs stdout log plane · rewrite platform event bus for NATS + FastStream · `docs(qops)` document `catalog_vector_index` in services DOX
- **Fix:** `fix(040)` await NATS step publish before Playwright work · periodic NATS drain and strict run filter · stop inventing Compose NATS DNS on GKE · `fix(mcp)` scope allowed-host wildcard to explicit port, log ANN dedup fallback

**`6af3945` → `gend`** · started 14:46 · completed 14:47

- **New:** `feat(qops)` run harness Playwright from the image install
- **Update:** `chore(qops)` delete retired design file-sync scripts · retire design file-sync scripts for logic ports · `docs(qops)` document image-owned Playwright and design port skill · note project-scoped maintenance requeue/rerun
- **Fix:** `fix(qops)` avoid nested SQLite txn crash on startup · remove Playwright browser install from Settings UI · scope maintenance requeue/rerun to sidebar project

**`3cf90a6` → `gend`** · started 14:19 — no completion card captured

---

## 4. Watch list

| # | To verify | Why | Status |
|---|---|---|---|
| 1 | What "Phase A taxonomy" is and where it is documented | May overlap or conflict with our vocabulary | 🔴 **Open — BLOCKING.** Raised as decision 5 in the classification plan. Do not publish the vocabulary until answered |
| 2 | Are Test group memberships **queries** or **static lists**? | Decides whether GROUPS is delivered or still needed | ✅ **Answered 4 Aug — static lists.** *Add cases from catalog* → filter, tick, **Add selected**; per-row **Remove**. Filters are a finding aid, not a membership rule. GROUPS survives, rewritten as *add query membership to existing groups* |
| 3 | Which facets does the CaseFilterBar expose? | Decides how much of FILTERS remains | ✅ **Answered 4 Aug — Search · Feature · Labels · Status · Reason**, Feature and Labels as multi-selects. **FILTERS closed as delivered** |
| 4 | Does `case_id` conflict with our `ALO-…` case-ID convention? | Avoid two competing identities | 🟠 **Confirmed as a risk.** `case_id` is the unique catalog identity; our IDs must sit alongside it as a display/grouping alias, never replace it |
| 5 | Is the New-request pre-fill bug a regression from `d0b06e7` or `603ecde`? | Both touched Cases/Groups UI the evening before it was seen | 🟠 **Active.** Three deploys on 4 Aug (`8375e81`, `729ad15`) rework New Request `app_project` binding. Re-test the dialog on this build before closing the ticket |
| 6 | Did the readiness-counter fix ship? | PO said it would be removed or corrected | ⬜ Open — not seen in release notes as of 4 Aug 11:01 |

### Measured while verifying — catalog baseline, 4 August 2026

| Metric | Value | Source |
|---|---|---|
| Cases in catalog | **287** | *"287 candidates match filters"* — Add cases from catalog modal |
| Distinct `Feature` / `Labels` values | **~237** | Cases page filter pickers |
| Values that are truncated case titles | **~202** | Heuristic (5+ hyphen segments) — approximate |
| Meaningful values | **~35** | Manual read |
| **Cases per grouping value** | **≈ 1.2** | Derived |

Seven distinct values exist for Risk alone (`risk-dashboard`, `risk-history`, `risk-scenario-testing`, `public-fund-risk`, `total-endowment-risk`, `total-endowment-risk-history`, `total-endowment-risk-tab`). This is the baseline the classification plan is measured against.

---

## 5. Observations on release practice

- **Cadence is high** — 10 completed deploys in 4 days, mostly to `sandboxes`. QA are testing a target that moves within a working day, which is a plausible contributor to intermittent failures. Worth pairing a failure's timestamp against this log before triaging it as an app bug.
- **`gend` moves less often** than `sandboxes` — two `gend` deploys in the period (1 Aug and 4 Aug). Since `qops-harness.lab.gend.vn` is the `gend` target, our observations of the live tool are pinned to those commits.
- **Release notes are commit messages**, so they describe intent at code level, not user-visible behaviour. Nothing here substitutes for opening the UI.
- **Some cards carry no notes** (`9aa4dee`) or say *"no new notes"* — normal for redeploys of the same commit.

---

## Changelog

| Date | Change |
|---|---|
| 2026-08-07 | Auto-update: added 2 deploys (`48335c5`, `3c8937c`) |
| 2026-08-06 | Auto-update: added 3 deploys (`2536aea`, `e57dd3f`, `e57dd3f`) |
| 2026-08-05 | Auto-update: added 2 deploys (`2148711`, `2148711`) |
| 2026-08-04 | Auto-update (dry run of `harness-release-log-sync`): added 3 deploys — `8375e81`, `729ad15`, `76481a3`. Flagged New Request `app_project` rework into §2; updated watch-list item 5; first QG ticket key (QG-153) seen in release notes |
| 2026-08-04 | Resolved watch items 2 and 3 from the live investigation; added the catalog baseline (287 cases / ~237 values) |
| 2026-08-04 | Created. Captured 31 Jul – 4 Aug from the QOps Harness channel; added impact analysis and watch list |
