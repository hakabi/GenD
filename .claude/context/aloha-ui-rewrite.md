# Context Pack — Aloha UI Rewrite (KS-1102)

**Program:** Aloha UI Modernization — AngularJS → **Angular 22**, new repo, new domain, cut over after
KS UAT. **Jira project KS**, Epic **[KS-1102](https://gendvn.atlassian.net/browse/KS-1102)**.

**Sequence:** Program 1 (this) → Program 3 (Postgres, KS-1103) → Program 2 (Airflow, KS-1104).

> **Repository home: [`Aloha Modernization/`](../../Aloha%20Modernization/)** *(created 21 Aug 2026)*.
> Start at its `README.md`, then `Aloha Modernization/00_Program/Program_Charter.md`. Several documents there are deliberate
> skeletons awaiting an answer — they say so at the top. The epics remain the authority for scope and
> ticket status; read them directly.

---

## 1. Scope, from the epic

- Full UI revamp matching the customer design — functional **and** brand guidelines
- Framework rewrite: AngularJS → Angular 22, **new repo**; the old app is maintained in parallel until
  cutover
- Deployed on the **same server**, **new domain**; switch to prod after KS UAT
- Milestone-based KS reviews on **staging**
- Excel manual test rewrite + **Playwright / TypeScript / QOps Harness** — replaces Selenium
- **UI only.** API changes are separate tickets and are deliberately not linked

> **Harness and Aloha are coupled here.** QOps Harness is the test tool for this rewrite. Improvements to
> Harness (`harness-ux` pack) directly serve this program — do not treat them as unrelated projects.

## 2. Milestones

| Story | Milestone |
|---|---|
| [KS-1105](https://gendvn.atlassian.net/browse/KS-1105) | **M0** — Angular 22 foundation, shell, auth (MSAL), deploy, design tokens + light/dark theme, route skeleton, chart wrapper spike, Playwright + Harness bootstrap. *No KS demo.* |
| [KS-1106](https://gendvn.atlassian.net/browse/KS-1106) | **M1** — At a Glance KPIs (NAV, Risk %, Equity Beta, Illiquid, Unfunded). **First KS review.** |

Further children exist under the epic — query Jira rather than assuming this list is complete:

```
project = KS AND parent = KS-1102 ORDER BY key ASC
```

## 3. Repository documents

| File | Role |
|---|---|
| `Aloha Modernization/README.md` | Entry point — the three programmes, where things live, conventions |
| `Aloha Modernization/00_Program/Program_Charter.md` | Scope, dependencies, what is out of scope, roles |
| `Aloha Modernization/00_Program/Decision_Log.md` | **Every decision, dated.** Check before re-deciding something |
| `Aloha Modernization/00_Program/Open_Questions.md` | **Everything blocked on a person.** Do not duplicate a row that already exists |
| `Aloha Modernization/00_Program/Glossary.md` | Terms, systems, roles, the two Jira projects |
| `Aloha Modernization/01_UI_Rewrite_KS-1102/Gap_Analysis_Design_vs_Prod.md` | The four known gaps, with evidence and verification status per gap |
| `Aloha Modernization/01_UI_Rewrite_KS-1102/screenshots/README.md` | Index of production screenshots and which gap each bears on |

## 3b. Design source of truth

| File | Role |
|---|---|
| `Aloha Modernization/01_UI_Rewrite_KS-1102/Design_Reference.md` | ⭐ **Read this.** Tokens (both themes), route skeleton, model tabs, component vocabulary, open questions |
| `Aloha Modernization/01_UI_Rewrite_KS-1102/source/index.html` | The raw customer handoff — *KSBE IMG Endowment Dashboard*. **1.88 MB; do not read it whole.** Grep or extract specific selectors only |
| `Harness/Aloha Page/*.jpg` | Production screenshots — the current app. **Indexed** in `Aloha Modernization/01_UI_Rewrite_KS-1102/screenshots/README.md`, which says what each one bears on |

**Theme:** dark is the default (`:root`), light is the override (`[data-theme="light"]`) — the opposite
of Harness. Inter (300/400/500) + IBM Plex Mono. Tailwind-family palette with semantic `--up` / `--dn`
finance colours. **Never apply Harness's Atlassian tokens here.**

## 4. Known gaps vs production — confirm with KS

The epic flags four. Current state of each:

| Gap | Status |
|---|---|
| **Risk Model Scenario Testing tab** (prod 4 tabs, design 3) | **Design side confirmed** — Risk has Output · Parameters · History. But Scenario Test *exists* in the design as the default tab of the **Equity Beta Model**. So the question is relocation vs removal, not omission. See the design reference §5 |
| **Pipeline module** | No counterpart in the design's navigation. Production evidence: `Harness/Aloha Page/Pipeline Page.jpg` |
| **Liquidity sidebar home** | No counterpart in the design's navigation |
| **Owned by KS filter** | No counterpart in the design's navigation |

The production side of the Scenario comparison is **inferred from screenshot filenames**, not verified.
Open the images or the live app before taking it to KS.

## 5. Live systems

- Aloha lab — `workbench-app.lab.gend.vn` — **writable**, treat as read-only
- Aloha prod — `aloha.conceptia.com` — read-only
- Staging for this program — new domain, same server. **Not yet recorded here**; add the URL when M0 lands

Both need the user's real Chrome. The in-app browser has no session.

## 6. Ticket conventions

Project **KS**, parent **KS-1102**. Match the structure the existing children use — read
[KS-1105](https://gendvn.atlassian.net/browse/KS-1105) before drafting: `## Milestone` heading,
`### Deliverables` bullets, `### Acceptance` as a checkbox list, `### Parent` naming the epic key.

These epics are **assigned to the BA**, who created them. The Harness-workstream rule D9 ("nothing to
Jira without asking") came from the PO about Harness UX proposals and does **not** govern this program.
Agents still have no write tools — but the reason here is the missing confirmation gate, not D9.

## 7. What "review and edit these tickets" means

The current job is **refinement across ~28 issues**, not authoring. Output one file per epic, with a row
per ticket:

| Key | Verdict | Current | Proposed | Why |
|---|---|---|---|---|

Verdicts: **OK** · **needs edit** · **needs split** · **duplicate** · **missing prerequisite**.

One batch file beats 28 separate drafts. The BA marks which rows to apply, and applies them.
