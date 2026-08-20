# GenD — Four-Agent BA Workbench

**Design spec** · **Status:** approved in chat, pending written review
**Owner:** BA · **Date:** 20 August 2026
**Scope:** Harness + Aloha · **Target:** Claude Code subagents in `D:\source\GenD\.claude\agents\`

---

## 1. Goal

Give the BA four named, reusable Claude Code subagents that carry this project's conventions
in their own prompts, so those conventions stop having to be re-explained at the start of
every session:

| # | Agent | Job |
|---|---|---|
| 1 | `harness-planner` | Turn a problem or goal into a written plan |
| 2 | `harness-ba` | Write user stories, acceptance criteria and supporting BA documents |
| 3 | `harness-designer` | Produce UI/UX mockups |
| 4 | `harness-reviewer` | Check a deliverable against house rules and BA quality |

**Non-goal:** replacing BA judgement. Every agent produces a draft; the BA promotes it.

---

## 2. Decisions

| # | Decision | Rationale |
|---|---|---|
| **A1** | Agents live as **Claude Code subagents in this repo**, not claude.ai Projects | Only option with file access, MCP access and version control |
| **A2** | **Manual relay** orchestration, not an automatic pipeline | A wrong premise must not propagate into three downstream artifacts. See §3.1 |
| **A3** | BA agent has **no Jira write tools** — markdown drafts only | Honours decision D9 (17 Aug): nothing to Jira without asking |
| **A4** | Context scope is **Harness + Aloha**; Dynamo excluded | Dynamo is not part of the current improvement loop |
| **A5** | Mockups use the **Jira/Atlassian-aligned** system, **light and dark together** | Follows decisions D2 and D3 (14 Aug), which supersede the older dark-only `tokens.css` convention in handoff §2 |
| **A6** | Designer gets **real-Chrome browser access** | `qops-harness.lab.gend.vn` is behind Google SSO; the in-app browser has no session |
| **A7** | Planner and BA get **three read-only Jira tools** | Duplicate detection against QG-138 and KS-1066 |
| **A8** | Reviewer gets **no write tool and no external access** | A reviewer that can edit will silently "fix" instead of reporting |

---

## 3. Architecture

### 3.1 Manual relay — and why not a pipeline

Subagents share no memory. Each runs in a fresh context window, returns a report, and is
gone. "Multi-agent" therefore means: **who writes which file, and who reads it next.**

Under manual relay the BA drives each hop:

```
BA asks for a plan
   |-> harness-planner   --writes-->  plans/<slug>_plan.md
BA reads it, corrects it, then asks for tickets
   |-> harness-ba        --reads plan, writes-->  tickets/<slug>_tickets.md
BA asks for a mockup
   |-> harness-designer  --reads both, writes-->  mockups/<slug>_mockup.html
BA asks for a review
   |-> harness-reviewer  --reads all three, reports in chat-->  (no file)
```

The 18 August UI/UX session is the argument for this. The planning work there was sound, but
the *premise* — that the Test Cases page lacked features — was wrong; the page had been
rebuilt. Only a human check against the live system caught it. An automatic pipeline would
have carried that wrong premise into tickets and mockups before anyone saw output.

**Upgrade path:** the file contract below is identical under an automatic pipeline. If manual
relay proves reliable, chaining it is one new slash-command file, not a redesign.

### 3.2 The drafts quarantine

```
Harness/Documents/06_Agent_Drafts/
├── README.md      promote / delete / leave rules
├── plans/
├── tickets/
└── mockups/
```

Agents write **only** here. They never write to `00_Active/`, `03_Mockups/`,
`01_Plans_and_Strategy/`, `Jira Ticket/` or `Aloha Server/`.

This mirrors the *Harness Scan* scheduled task, which already drops candidates into a
"Needs BA review" list and never promotes, deletes or changes status. Same contract, same
three verbs: **promote · delete · leave**.

### 3.3 The filename contract

One slug ties a chain together. No tooling, no index, no database.

```
plans/2026-08-20_failed-step-population_plan.md
tickets/2026-08-20_failed-step-population_tickets.md
mockups/2026-08-20_failed-step-population_mockup.html
```

Format: `YYYY-MM-DD_<kebab-slug>_<kind>.<ext>`. The BA names the slug on the first invocation
and passes it to every later agent.

---

## 4. Agent specifications

Shared by all four: role titles only (BA / PO / QA), never personal names or emails; English
is authoritative, Vietnamese files are reading copies.

### 4.1 `harness-planner`

**Purpose.** Turn a problem, goal or piece of feedback into a written plan: what the real
problem is, what already exists, options with trade-offs, a recommendation, a build order,
and any decision that must go to a person.

**Model:** opus · **Writes:** `06_Agent_Drafts/plans/`

**Tools:** `Read`, `Grep`, `Glob`, `Write`,
`mcp__atlassian-rovo__searchJiraIssuesUsingJql`, `mcp__atlassian-rovo__getJiraIssue`,
`mcp__atlassian-rovo__getAccessibleAtlassianResources`

No `Bash`. `Read`/`Grep`/`Glob` cover everything the planner needs to read, and withholding
`Bash` is what makes the "agents write only to `06_Agent_Drafts/`" guarantee in §5 real rather
than advisory — a shell can write anywhere.

**Reading list.**

| File | For |
|---|---|
| `Harness/Documents/Harness_Session_Handoff.md` | §1 project context, §2 conventions, §8 QG ticket index |
| `Harness/Documents/00_Active/Harness_Case_Classification_Plan.md` | §6 status, **§8 divergence register**, §9 open decisions |
| `Harness/Documents/00_Active/Harness_Release_Log.md` | §2 watch list, §3 deploys |
| `Harness/Documents/00_Active/Open_Items.md` | What is already blocked on a person |
| `Harness/Documents/05_Session_Notes/Harness_UIUX_Session_Handoff_2026-08-18.md` | Decisions D1–D9, live-system findings |
| `Harness/Documents/01_Plans_and_Strategy/Harness_Test_and_UX_Plan.md` | The wider improvement loop |
| `Aloha Server/Test Guide/Findings Register.md` | Cross-cycle Aloha findings (Aloha work only) |

**Hard rules.**

1. **Never call something new without checking whether it already shipped.** Read the
   divergence register (§8) and the release log first. State explicitly in the plan what
   already exists and what is genuinely missing.
2. Distinguish *no screen* from *screen exists but has no data*. The 18 Aug finding was that
   most gaps were the second kind and needed no design work at all.
3. Anything blocked on a person becomes a proposed row for `Open_Items.md` — do not duplicate
   existing rows.
4. Recommend one option. Do not present a neutral survey.

**Output shape.** Problem · What already exists (with evidence) · Options and trade-offs ·
Recommendation · Build order · Decisions needed from PO/QA · What was checked and not found.

### 4.2 `harness-ba`

**Purpose.** Write Jira-ready user stories, acceptance criteria, bug reports and the
supporting BA documents (workflow descriptions, as-is/to-be narratives).

**Model:** opus · **Writes:** `06_Agent_Drafts/tickets/`

**Tools:** `Read`, `Grep`, `Glob`, `Write`, `Edit`,
`mcp__atlassian-rovo__searchJiraIssuesUsingJql`, `mcp__atlassian-rovo__getJiraIssue`,
`mcp__atlassian-rovo__getAccessibleAtlassianResources`

**No create, edit, transition, comment or Confluence-write tool exists in its allowlist.**
This is the mechanical enforcement of D9 — not a prompt instruction that can be argued with.

**Two house styles, by project.**

| Project | Epic | Convention source |
|---|---|---|
| **QG** — Harness improvement | QG-138 | `Harness_Session_Handoff.md` §8 · `02_Reviews_and_Analysis/Harness_UXUI_Review.md` ticket index · `Open_Items.md` BUG-1 as the bug-format exemplar |
| **KS** — Aloha MCP QA | KS-1066 | `Aloha Server/Test Guide/aloha_mcp_uat_tickets.md` — the authoritative exemplar |

Jira site: `gendvn.atlassian.net`, cloud id `a5cab9f1-9fa7-40f1-9025-cd77c2fdcfb4`.

**The draft-ID pattern.** Because nothing is filed automatically, every draft gets a stable
local ID and a mapping table the BA fills in after filing by hand — exactly the pattern
already used in `aloha_mcp_uat_tickets.md`:

```
| Draft ID | Jira Key  | Story | Status |
|----------|-----------|-------|--------|
| HN-01    | (unfiled) | ...   | not filed |
```

**Hard rules.**

1. Never call a Jira write tool — it has none. Output is a markdown file.
2. Never propose renaming internal step names: `crew_phase_a_build`, `render_nlonly_spec`,
   `crew_phase_b_migrate`, `validate_pre_run_spec`, `execute_run_playwright_spec`,
   `finalize_artifacts`, "Quest". The team relies on them.
3. Work-item IDs are names (`VOCAB`, `CLASSIFY`, `BACKFILL`), never `T1`–`T9`.
4. Suggestions are forward-only, with acceptance criteria.
5. The Environment enum has **no `lab` value** — do not write criteria that assume one.
6. Search Jira for an existing ticket before drafting a new one; if one exists, say so and
   propose an edit instead.
7. Vietnamese copies only on request, translated from the approved English.

### 4.3 `harness-designer`

**Purpose.** Two deliverable types:

1. **Mockups** — static HTML of Harness and Aloha screens in the Jira/Atlassian-aligned design
   system, light and dark specified together.
2. **Current-vs-proposed comparison** — screenshot the live screen, put it beside the
   proposal, and state what changed and why. This is the deliverable that matters most while
   the dev is shipping fast: it is the only way to tell whether a proposal is still needed.
   Precedent exists — Confluence page 2, *"Visual Comparison — Current vs Jira-Aligned"*.

Type 2 is why the browser rules below permit clicking. A comparison the agent cannot navigate
to is a comparison it has to guess at, and guessing is what produced the wrong premise on
18 Aug.

**Model:** opus · **Writes:** `06_Agent_Drafts/mockups/`

**Tools:** `Read`, `Grep`, `Glob`, `Write`, `Edit`, plus real-Chrome (Google SSO session):
`mcp__claude-in-chrome__navigate`, `mcp__claude-in-chrome__read_page`,
`mcp__claude-in-chrome__get_page_text`, `mcp__claude-in-chrome__find`,
`mcp__claude-in-chrome__tabs_context_mcp`, `mcp__claude-in-chrome__computer`

`computer` gives click, type and screenshot in one tool — they cannot be separated. The
boundary below is therefore a **prompt** constraint, not a tool constraint: the one place in
this design where a rule is not mechanically enforced. Noted rather than papered over.

**Token source of truth.**

| File | Role |
|---|---|
| `Harness/Harness Page/Harness_UI_Tokens_Shipped_2026-08-20.md` | ⭐ **The source of truth.** All 92 properties in both themes, measured live from the running app on 20 Aug |
| `Harness/Harness Page/Harness_UI_Style_Guide_Jira_Aligned.md` | Component specs, accessibility, reasoning. **Superseded for values** |
| `Harness/Harness Page/Harness_UI_DarkMode_Jira_Aligned.md` | The 14 Aug dark *proposal*. **Superseded for values** — the shipped dark theme differs materially |
| `Harness/QOps_Harness/css/tokens.css` | Migration reference only. Not the target |

**Three things the designer must not get wrong**, all verified on 20 Aug:

1. **Dark mode has no shadows.** `--elev-raised`, `--elev-overlay`, `--shadow-soft` and
   `--shadow-dialog` are all `none`. Depth comes from a five-step surface ladder
   (`#161A1D` → `#1D2125` → `#22272B` → `#282E33` → `#2C333A`).
2. **`--radius-pill` is 3px.** Nothing is a capsule.
3. **The font is the OS system stack**, not Söhne, not a webfont.

**Pattern exemplars** (match their structure, do not copy their styling):
`03_Mockups/Harness_TestCase_Workbench_Mockup.html` (11 numbered callouts + explanation) ·
`Harness_TestCase_UI_Three_Directions.html` (options with build status marked) ·
`Harness_TestCase_Workflow_AsIs_Mockup.html` (swimlanes).

**Screenshots for current-state reference:** `Harness/Harness Page/*.jpg`,
`Harness/Aloha Page/*.jpg`.

**Hard rules.**

1. **Browser: inspect freely, never trigger work.** The rule is about *which control*, not
   about clicking. Most of Harness is only reachable by clicking — sub-tabs, side panels and
   filters are client-side state, not URLs — so an observe-only agent could not see the app it
   is redesigning.

   | | |
   |---|---|
   | **Do** | Click nav items, tabs and sub-tabs, table rows, side panels, expanders, pagination · type into **search and filter** boxes · toggle **Settings → Appearance** between Day and Night to capture both themes · scroll, hover, screenshot |
   | **Never** | **New request** · **Confirm and process** · **Retry** · Delete or bulk actions on cases · **Upload** / **Use default** on session files · anything under Settings → **Secrets**, **Integrations**, **Maintenance** · Knowledge base edits |
   | **Never, in Aloha** | Any save, edit or submit on `workbench-app.lab.gend.vn` — it is *writable*. `aloha.conceptia.com` is read-only by nature but gets the same treatment |

   The test is *"does this create work, spend budget, or change state another person can
   see?"* Toggling your own theme fails all three and is fine. **Confirm and process** passes
   all three and is not. **If unsure, do not click — report that the screen needs a human.**

2. Every mockup ships light **and** dark, because the app ships **Day / Night / System**
   (verified live 20 Aug). "System" follows the OS, so honour `prefers-color-scheme` as well
   as an explicit choice. Never dark-only, never light-only.
3. Numbered callouts with a written explanation beneath — a mockup is an argument, not a
   picture.
4. Mark build status against the live system where known: shipped / partial / not built.
5. Self-contained HTML. No CDN links, no external stylesheets.

### 4.4 `harness-reviewer`

**Purpose.** Check a draft against this project's written house rules, against BA quality, and
against internal consistency with existing documents.

**Model:** opus · **Writes: nothing.** **External access: none.**

**Tools:** `Read`, `Grep`, `Glob` — that is the complete list.

Withholding `Write` and `Edit` is deliberate. A reviewer with edit access repairs problems
quietly and the BA never learns the draft was wrong. It reports; the BA decides.

**The house-rules checklist.** Each item is checkable against a written source:

| # | Rule | Source |
|---|---|---|
| 1 | Role titles only (BA / PO / QA); no personal names or emails | Handoff §2 |
| 2 | Internal step names preserved, never renamed | Handoff §2 |
| 3 | Work-item IDs are names, never `T1`–`T9` | Handoff §2 |
| 4 | English authoritative; VN is a reading copy; VN never published to Knowledge | Handoff §2 |
| 5 | Tickets under the right epic (QG-138 / KS-1066), forward-only, with acceptance criteria | Handoff §8 |
| 6 | Nothing filed to Jira or Confluence without asking | Decision D9 |
| 7 | Nothing claimed as "new" without checking the divergence register and release log | Classification plan §8 |
| 8 | No spec assuming a `lab` value in the Environment enum | Handoff §3 |
| 9 | `Open_Items.md` content not duplicated elsewhere | Handoff §7 |

**Beyond the checklist,** the reviewer also judges: is the problem statement supported by
evidence, are acceptance criteria testable, does the draft contradict a document already in
the repo, and is anything asserted that no cited source actually says.

**Output shape.** Findings ranked most-serious first, each with the file, the rule or document
it violates, and the concrete correction. Then an overall verdict: ready to promote / needs
revision / premise is wrong.

---

## 5. Guardrails

- **Fresh context.** An agent knows nothing said in the main session. Everything it needs must
  be in its prompt, its reading list, or the files it is pointed at.
- **No mid-run questions.** An agent cannot stop and ask. It returns; the BA re-invokes.
- **Tight reading lists.** Every file listed is re-read on every run. Lists are per-task, not
  "read the whole repo".
- **The BA promotes.** Nothing leaves `06_Agent_Drafts/` without a human moving it.
- **No agent writes to Jira, Confluence or Teams.** Ever, under this design.

---

## 6. Failure modes

| Failure | Symptom | Response |
|---|---|---|
| Planner proposes something already shipped | Plan cites no divergence-register check | Reject; the check is rule 1. Consider tightening the prompt |
| BA agent drafts a duplicate ticket | Overlaps an existing QG/KS issue | Jira search is in its rules; verify the connector is authorized |
| Designer's mockup drifts from tokens | Colours not in the style guide | Reviewer catches it; token file is the source of truth |
| Reviewer rubber-stamps | Verdict with no findings on a weak draft | Give it the checklist explicitly in the invocation |
| Atlassian connector unauthorized | Jira tools error | Agents fall back to the repo's ticket index in handoff §8. Authorize via `claude mcp` or `/mcp` in an interactive session |
| Chrome session expired | Designer cannot reach Harness | Open Chrome, sign in with Google SSO, retry |

---

## 7. Verification plan

Each agent gets one smoke task with a known-good answer drawn from existing work:

| Agent | Smoke task | Passes if |
|---|---|---|
| `harness-planner` | "Plan how to populate `FAILED STEP`" (open item O2) | Identifies that the field already renders and is unpopulated; recommends no new UI |
| `harness-ba` | "Draft the two bugs in open item O4: internal jargon in user-facing steps, raw DB error shown to users" | Produces QG-house-style drafts under QG-138 with draft IDs and testable criteria; files nothing |
| `harness-designer` | "Mock the Requests page failure card (R2 direction)" | Light and dark, Jira-aligned tokens, numbered callouts, no state-changing clicks |
| `harness-reviewer` | Review a draft with a planted violation (a personal name, a renamed step) | Catches both, cites handoff §2 |

Run them in that order. If the planner's smoke task fails, fix it before building the rest —
everything downstream reads its output.

---

## 8. Out of scope

- Automatic pipeline slash command — deferred until manual relay proves reliable (§3.1)
- A fifth orchestrator agent — the main session orchestrates
- Any shared state store — files are the state
- Any Jira, Confluence or Teams write path
- Dynamo Server context
- Mirroring the agents into claude.ai Projects for PO/QA

---

## 9. Open items

| # | Item | Owner |
|---|---|---|
| **AG1** | Authorize the `atlassian` connector and `conceptia-aloha`; without it the three Jira tools error | BA |
| **AG2** | Confirm decision D7 (drop direction A) before the designer treats it as settled | PO |
| ~~**AG3**~~ | ~~Handoff §2 still states the dark-only `tokens.css` mockup convention~~ — **done 20 Aug.** §2 rewritten to light + dark; §5 gained a row for the shipped theme system | BA |
| **AG4** | If a 4th Jira tool is ever wanted, `getConfluencePage` opens the QG space UI/UX pages | BA |
| ~~**AG5**~~ | ~~Capture the Night palette and reconcile it~~ — **done 20 Aug.** Both themes measured into `Harness_UI_Tokens_Shipped_2026-08-20.md`; both proposal docs carry a superseded-for-values banner | BA |
| **AG6** | The 18 Aug note "the Requests page is still the July build" is now partly stale — the page is restyled and themed, though native `<select>` dropdowns remain. Re-verify before reusing R1/R2/R3 | BA |
| **AG7** | Two candidate QG-138 bugs found by measurement: **T-1** `--surface-hover` equals `--surface` in light mode, so hover is invisible in Day; **T-3** the `ai` and `duplicate` status pills are byte-identical in both themes. A good first real task for `harness-ba` | BA |
| **AG8** | **T-2** — light uses the *classic* Atlassian palette (`#0052CC`), dark uses the *refreshed* one (`#0C66E4`/`#579DFF`). Two vintages of one design system. A question for the PO, not a defect | PO |

---

*Approved in chat 20 Aug 2026. Implementation plan follows.*
