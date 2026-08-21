# GenD — House Rules

**Every agent reads this first, on every task, whatever the workstream.** These are craft rules, not
project rules — they do not change when the context pack changes.

Working root: `D:\source\GenD`. All paths are relative to it.

---

## 1. People and names

- In **our own deliverables** — plans, tickets, mockups, documents — refer to people by **role**:
  **BA** (the user), **PO** (reviews and implements), **QA** (submit requests, raise feedback),
  **KS** (the customer, Kamehameha Schools).
- **Reading identities is allowed.** Jira shows real assignee names and email addresses; you may read
  them, reason about them, and state who owns or is assigned to an issue when that is the point of the
  task — routing, ownership, workload, "who should answer this".
- **Do not carry identities into published artefacts.** Mockup copy, ticket descriptions and documents
  meant for the team use role titles. The distinction is *working context* (identities fine) versus
  *published deliverable* (roles).

## 2. Language

- The **English file is always authoritative**. `_VN.md` files are reading copies for the team.
- Edit English first, then re-translate the changed section. Never draft the Vietnamese independently.
- Only English goes to the Harness Knowledge base — the classifier reads it and every vocabulary value
  is an English identifier.

## 3. Evidence

- **Check whether it already shipped before calling it new.** This is the most expensive mistake in this
  project's history: in August a full UI/UX workstream designed features that had already been built.
- Distinguish **"there is no screen"** from **"the screen exists but no data reaches it"**. The second is
  far more common here and needs no design work at all.
- State what you checked and did **not** find. Negative evidence saves the next person the search.
- Mark an assumption as an assumption. A draft with a flagged unknown beats one that states a guess as
  fact.

## 4. Writing

- **Acceptance criteria must be testable** by someone who was not in the conversation. "Works correctly"
  and "is intuitive" are not criteria.
- **Recommend one option.** A plan that lists choices without picking one is unfinished.
- **Forward-only.** Propose the change; do not relitigate how the code got this way.
- Write for a developer who has attended none of our meetings.

## 5. Vocabulary that must not change

- **Harness internal step names stay visible and unrenamed:** `crew_phase_a_build`, `render_nlonly_spec`,
  `crew_phase_b_migrate`, `validate_pre_run_spec`, `execute_run_playwright_spec`, `finalize_artifacts`,
  and "Quest". The team relies on them.
- **Harness work-item IDs are names, not numbers:** `VOCAB`, `VALIDATE`, `CLASSIFY`, `QUEUE`, `MODEL`,
  `BACKFILL`, `GROUPS`, `HEATMAP`, `FILTERS`. Never reintroduce `T1`–`T9`.
- The Harness **Environment enum has no `lab` value.** Never write a criterion that assumes one.

## 6. Where output goes

Agents write **only** to `Harness/Documents/06_Agent_Drafts/` — `plans/`, `tickets/`, `mockups/`.

Never write to `00_Active/`, `01_Plans_and_Strategy/`, `03_Mockups/`, `Jira Ticket/`, `Harness Page/`,
`Aloha Server/`, or `.claude/`. The BA promotes a draft to its real home; you do not.

**Filename contract** — one slug ties a chain together:

```
plans/YYYY-MM-DD_<kebab-slug>_plan.md
tickets/YYYY-MM-DD_<kebab-slug>_tickets.md
mockups/YYYY-MM-DD_<kebab-slug>_mockup.html
```

If the BA gives you a slug, or points you at an earlier file in the chain, reuse that slug exactly.

## 7. Jira

Site `gendvn.atlassian.net`, cloud id `a5cab9f1-9fa7-40f1-9025-cd77c2fdcfb4`.

**No agent has Jira write access.** No create, edit, transition or comment tool appears in any allowlist.
You produce a file; the BA applies it. Never state that you have created, updated or commented on an
issue, and never ask for write access.

Reading is encouraged — check for an existing ticket before proposing a new one. If a ticket already
covers the ground, say so and propose an **edit to it** rather than a duplicate.

If the Atlassian connector is unauthorized the tools will error. Do not stall: fall back to the repo's
ticket indexes and say in your output that the duplicate check is incomplete.

## 8. Two design systems — never mix them

| | **Harness** | **Aloha redesign** |
|---|---|---|
| Base | Light | **Dark** |
| Font | OS system stack + Fira Code | Inter + IBM Plex Mono |
| Palette | Atlassian `#0052CC` / `#0C66E4` | Tailwind family `#3b82f6` / `#10b981` / `#f43f5e` |
| Truth | `Harness/Harness Page/Harness_UI_Tokens_Shipped_2026-08-20.md` | `Aloha Modernization/01_UI_Rewrite_KS-1102/Design_Reference.md` |

Applying one system's tokens to the other's screens produces confidently wrong output.
