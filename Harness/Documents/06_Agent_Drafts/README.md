# 06_Agent_Drafts — the quarantine

**Nothing in this folder is approved.** It is where the four agents put their output so it can be read
before it goes anywhere. Treat every file here the way you treat the ⬜ list in
[`Harness_Release_Log.md`](../00_Active/Harness_Release_Log.md) §2 — raw material, sorted for you, with
the judgement still yours.

Created 20 August 2026.

---

## The three verbs

For each draft, do one of three things:

| | |
|---|---|
| **Promote** | It is good → move it to its real home (below) and delete the draft |
| **Delete** | It is wrong or overtaken → remove it |
| **Leave** | Not sure yet → it stays until you are |

Agents never promote, never delete, and never write outside this folder. That is deliberate — they sort
the raw material, you make the calls.

## Where a promoted draft goes

| From | To |
|---|---|
| `plans/` | `../00_Active/` if it becomes a live workstream · `../01_Plans_and_Strategy/` if it is reference |
| `tickets/` | Jira, filed by hand · keep the markdown in `Jira Ticket/` if it is worth an anchor |
| `mockups/` | `../03_Mockups/` |

---

## The four agents

| Agent | Writes | Can it reach outside? |
|---|---|---|
| `harness-planner` | `plans/` | Jira **read** only |
| `harness-ba` | `tickets/` | Jira **read** only — it cannot file anything |
| `harness-designer` | `mockups/` | Real Chrome, inspect-only |
| `harness-reviewer` | **nothing** | No. It reports in chat and cannot edit |

Definitions live in [`.claude/agents/`](../../../.claude/agents/). Design rationale is in
[`docs/superpowers/specs/2026-08-20-gend-multi-agent-design.md`](../../../docs/superpowers/specs/2026-08-20-gend-multi-agent-design.md).

## How to run them

Ask in plain language — no special syntax:

> use harness-planner to plan how we populate FAILED STEP, slug `failed-step-population`

Then, once you have read and corrected the plan:

> use harness-ba to draft tickets from `06_Agent_Drafts/plans/2026-08-20_failed-step-population_plan.md`

**Drive one hop at a time.** Each agent starts with an empty context window and knows nothing you said
in the main chat — it only knows its own instructions and the files you point it at. That is why you
read the plan before tickets are written from it: a wrong premise would otherwise propagate silently
into three artifacts.

## The filename contract

One slug ties a chain together:

```
plans/2026-08-20_failed-step-population_plan.md
tickets/2026-08-20_failed-step-population_tickets.md
mockups/2026-08-20_failed-step-population_mockup.html
```

Format: `YYYY-MM-DD_<kebab-slug>_<kind>.<ext>`. Name the slug on the first invocation and pass the same
one to every later agent. There is no index and no tooling — the shared slug *is* the link.
