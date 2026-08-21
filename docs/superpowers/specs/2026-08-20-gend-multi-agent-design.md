# GenD — Four-Agent BA Workbench

**Design spec** · **Status:** built · **revised 21 August 2026**
**Owner:** BA · **Date:** 20 August 2026
**Scope:** all GenD workstreams · **Target:** `.claude/agents/` + `.claude/context/`

> ### Revision — 21 August 2026
> The original design was **four Harness agents**. Discovering epics **KS-1102 / KS-1103 / KS-1104**
> showed GenD runs **five workstreams, not two projects**. Four roles × five workstreams would be
> twenty agents.
>
> **The architecture is now four *roles* plus one loadable *context pack* per workstream.** Roles are
> stable; everything that varies — epic, reading list, design system, ID conventions, evidence tool —
> lives in the pack. A new programme costs one file, not four agents.

---

## 1. Goal

Give the BA four named, reusable Claude Code subagents that carry this project's conventions
in their own prompts, so those conventions stop having to be re-explained at the start of
every session:

| # | Agent | Job |
|---|---|---|
| 1 | `gend-planner` | Turn a problem or goal into a written plan |
| 2 | `gend-ba` | Draft **and refine** user stories, acceptance criteria and BA documents |
| 3 | `gend-designer` | Produce mockups and current-vs-proposed comparisons |
| 4 | `gend-reviewer` | Check a deliverable against house rules and BA quality |

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
| **A9** | **Four roles, N context packs** — not per-project agents *(21 Aug)* | Five workstreams and growing; splitting by project scales to 20 agents, and duplicates shared craft rules into every copy |
| **A10** | **No Jira write tools anywhere**, including packs D9 does not govern *(21 Aug)* | A subagent cannot pause for confirmation. At epic volume that means dozens of unreviewed edits |
| **A11** | Agents **may read** real assignee identities; deliverables still use role titles *(21 Aug)* | BA decision. Ownership and routing need names; published artefacts do not |

---

## 3. Architecture

### 3.1 Manual relay — and why not a pipeline

Subagents share no memory. Each runs in a fresh context window, returns a report, and is
gone. "Multi-agent" therefore means: **who writes which file, and who reads it next.**

Under manual relay the BA drives each hop:

```
BA asks for a plan
   |-> gend-planner   --writes-->  plans/<slug>_plan.md
BA reads it, corrects it, then asks for tickets
   |-> gend-ba        --reads plan, writes-->  tickets/<slug>_tickets.md
BA asks for a mockup
   |-> gend-designer  --reads both, writes-->  mockups/<slug>_mockup.html
BA asks for a review
   |-> gend-reviewer  --reads all three, reports in chat-->  (no file)
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

## 4. Four roles, N context packs

The agent files hold the role. The pack holds the workstream. **The prompts are not restated here** —
they live in `.claude/agents/` and would drift if duplicated.

### 4.1 The roles

| Agent | Writes | Outside reach |
|---|---|---|
| `gend-planner` | `06_Agent_Drafts/plans/` | 3 read-only Jira tools |
| `gend-ba` | `06_Agent_Drafts/tickets/` | 3 read-only Jira tools |
| `gend-designer` | `06_Agent_Drafts/mockups/` | Real Chrome, inspect-only |
| `gend-reviewer` | **nothing** | none |

No agent holds `Bash`, and none holds a Jira write tool. Both omissions are what make the "writes only to
`06_Agent_Drafts/`" and "files nothing" guarantees structural rather than advisory.

### 4.2 The packs

| Pack | Programme | Jira | Design system |
|---|---|---|---|
| `harness-ux` | QOps Harness improvement | **QG** · QG-138 | Atlassian, light-base |
| `aloha-ui-rewrite` | Aloha Angular 22 rewrite | **KS** · KS-1102 | Inter/Tailwind, dark-base |
| `aloha-mcp-qa` | Aloha MCP verification | **KS** · KS-1066 | — |
| `aloha-data-platform` | Postgres POC + Airflow | **KS** · KS-1103/1104 | — |

`_house-rules.md` is read on every task by every agent and holds only what never varies.

**An agent given no pack must stop and ask.** The packs use different Jira projects, incompatible design
systems, and in one case a governed ID namespace where inventing an ID has already caused dead links in
live Jira.

### 4.3 Why not per-project agents

Splitting by project scales as roles × workstreams. With five workstreams that is twenty agents, and the
shared craft rules — testable criteria, role titles, English authoritative, evidence before assertion —
get copied twenty times and drift. The reviewer especially must stay single: its whole value is applying
one standard consistently.

**The rule:** split when workstreams need different *tools*, *output format* or *vocabulary*. Share when
they differ only in subject matter. Under that test all four roles are shared and every difference is a
pack.

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
| `gend-planner` · `harness-ux` | "Plan how to populate `FAILED STEP`" (open item O2) | Identifies that the field already renders and is unpopulated; recommends no new UI |
| `gend-ba` · `harness-ux` | "Draft the two bugs in open item O4: internal jargon in user-facing steps, raw DB error shown to users" | Produces QG-house-style drafts under QG-138 with draft IDs and testable criteria; files nothing |
| `gend-designer` · `harness-ux` | "Mock the Requests page failure card (R2 direction)" | Light and dark, Jira-aligned tokens, numbered callouts, no state-changing clicks |
| `gend-reviewer` | Review a draft with a planted violation (a published personal name, a renamed step) | Catches both, cites the house rules |
| **pack switch** | `gend-designer` · `aloha-ui-rewrite` — "mock the At a Glance KPI row" | Uses Inter + `--up`/`--dn`, **dark as base**. Any Atlassian blue means the pack mechanism failed |
| **no pack** | `gend-ba` with no pack named | **Stops and asks.** Does not guess a project |

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
| **AG7** | Two candidate QG-138 bugs found by measurement: **T-1** `--surface-hover` equals `--surface` in light mode, so hover is invisible in Day; **T-3** the `ai` and `duplicate` status pills are byte-identical in both themes. A good first real task for `gend-ba` | BA |
| **AG9** | KS-1102 gap "Risk Model Scenario Testing tab" — design side confirmed (Risk has 3 tabs), but Scenario Test **exists under the Equity Beta Model**. Relocation vs removal is the question for KS. Production side still inferred from screenshot filenames | BA |
| **AG10** | `conceptia-aloha` MCP unauthorized — `aloha-mcp-qa` cannot reproduce findings live until connected | BA |
| **AG11** | The Aloha handoff defines **no radius scale** (values 2–9px, ad hoc). M0 must pick one and record it | BA |
| **AG8** | **T-2** — light uses the *classic* Atlassian palette (`#0052CC`), dark uses the *refreshed* one (`#0C66E4`/`#579DFF`). Two vintages of one design system. A question for the PO, not a defect | PO |

---

*Approved in chat 20 Aug 2026. Implementation plan follows.*
