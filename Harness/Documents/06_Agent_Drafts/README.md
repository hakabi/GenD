# 06_Agent_Drafts — the quarantine

**Nothing in this folder is approved.** It is where the agents put their output so it can be read before
it goes anywhere. Treat every file here the way you treat the ⬜ list in
[`Harness_Release_Log.md`](../00_Active/Harness_Release_Log.md) §2 — raw material, sorted for you, with
the judgement still yours.

Created 20 August 2026 · restructured 21 August 2026 to roles + context packs.

---

## The three verbs

| | |
|---|---|
| **Promote** | It is good → move it to its real home (below) and delete the draft |
| **Delete** | Wrong or overtaken → remove it |
| **Leave** | Not sure yet → it stays until you are |

Agents never promote, never delete, and never write outside this folder.

| From | To |
|---|---|
| `plans/` | `../00_Active/` if it becomes a live workstream · `../01_Plans_and_Strategy/` if reference |
| `tickets/` | Jira, filed or edited by hand |
| `mockups/` | `../03_Mockups/` for Harness · `Aloha Server/Redesign and Migration/` for Aloha |

---

## Four roles × five workstreams

There are **four agents**, one per role. The *workstream* is a **context pack** you name when you invoke
one. Adding a new programme means writing one pack file — not four new agents.

| Agent | Writes | Outside reach |
|---|---|---|
| `gend-planner` | `plans/` | Jira **read** only |
| `gend-ba` | `tickets/` | Jira **read** only — it cannot file anything |
| `gend-designer` | `mockups/` | Real Chrome, inspect-only |
| `gend-reviewer` | **nothing** | None. Reports in chat, cannot edit |

| Context pack | Programme | Jira |
|---|---|---|
| `harness-ux` | QOps Harness improvement | **QG** · Epic QG-138 |
| `aloha-ui-rewrite` | Aloha Angular 22 rewrite | **KS** · Epic KS-1102 |
| `aloha-mcp-qa` | Aloha MCP verification | **KS** · Epic KS-1066 |
| `aloha-data-platform` | Postgres POC + Airflow migration | **KS** · KS-1103 / KS-1104 |

`_house-rules.md` is read by every agent on every task and holds the rules that never change.

Definitions: [`.claude/agents/`](../../../.claude/agents/) · packs: [`.claude/context/`](../../../.claude/context/)
Design rationale: [`docs/superpowers/specs/2026-08-20-gend-multi-agent-design.md`](../../../docs/superpowers/specs/2026-08-20-gend-multi-agent-design.md)

## How to run them

**Always name the pack.** Without it the agent will stop and ask — the packs use different Jira projects,
different design systems and, in one case, a governed ID namespace.

> use gend-planner, context `aloha-ui-rewrite`, to work out whether the Scenario Testing tab is a gap or a relocation — slug `scenario-tab-gap`

Then, once you have read and corrected the plan:

> use gend-ba, context `aloha-ui-rewrite`, to draft the KS question from `06_Agent_Drafts/plans/2026-08-21_scenario-tab-gap_plan.md`

**Drive one hop at a time.** Each agent starts with an empty context window and knows nothing you said in
the main chat — only its own instructions, its pack, and the files you point it at. Reading the plan
before tickets are written from it is what stops a wrong premise propagating into three artefacts.

## Refining an epic

For "review and edit this epic and its children", ask for **one file per epic**, not one per ticket:
structural findings first, then a row per ticket with **key · verdict · what is wrong · proposed text**.
You mark the rows to apply; applying them stays with you, because a subagent cannot pause to confirm.

## The filename contract

```
plans/2026-08-21_scenario-tab-gap_plan.md
tickets/2026-08-21_scenario-tab-gap_tickets.md
mockups/2026-08-21_scenario-tab-gap_mockup.html
```

`YYYY-MM-DD_<kebab-slug>_<kind>.<ext>`. Name the slug once and pass the same one down the chain. There is
no index and no tooling — the shared slug *is* the link.
