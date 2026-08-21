# 1. UI Rewrite — KS-1102

**AngularJS → Angular 22.** New repo, same server, new domain, cut over to production after KS UAT.

**Epic:** [KS-1102](https://gendvn.atlassian.net/browse/KS-1102) · **Status:** To Do · **Owner:** BA

---

## What is here

| File | What it is |
|---|---|
| [`Design_Reference.md`](./Design_Reference.md) | ⭐ **The source of truth for design values.** Tokens in both themes, route skeleton, model tabs, component vocabulary — extracted from the handoff |
| [`Gap_Analysis_Design_vs_Prod.md`](./Gap_Analysis_Design_vs_Prod.md) | The four known gaps between the design and production, with the evidence for each |
| `source/index.html` | The customer handoff, untouched. **1.88 MB — do not open it expecting to read it** |
| `mockups/` | Our own mockups. Empty until there is something to show |
| [`screenshots/`](./screenshots/) | Index of production screenshots, which live in `Harness/Aloha Page/` |

## Milestones

| Story | Milestone | KS demo? |
|---|---|---|
| [KS-1105](https://gendvn.atlassian.net/browse/KS-1105) | **M0** — Angular 22 foundation: repo, staging deploy, MSAL auth, app shell, **design tokens + light/dark**, route skeleton, base API layer, chart wrapper spike, Playwright + Harness bootstrap | No |
| [KS-1106](https://gendvn.atlassian.net/browse/KS-1106) | **M1** — At a Glance KPIs (NAV, Risk %, Equity Beta, Illiquid, Unfunded), wired to existing APIs | **Yes — first KS review** |

More children exist under the epic. This table is not authoritative — query Jira:

```
project = KS AND parent = KS-1102 ORDER BY key ASC
```

## Before you build anything

**Read [`Design_Reference.md`](./Design_Reference.md), not `source/index.html`.** The handoff is 1.88 MB:
roughly 1.5 MB is base64-embedded Inter fonts plus two inline fund-table blobs of 441 KB and 909 KB. The
token definitions are buried in it. The reference file was extracted by parsing the source, not
transcribed by eye.

### Three things the handoff will catch you out on

1. **Dark is the default theme.** `<html data-theme="dark">`; light is the override. This is the opposite
   of QOps Harness, and mixing the two systems produces output that looks polished and is wrong in every
   value.
2. **There is no radius scale.** Observed values run 2px, 3px, 4px, 5px, 7px, 9px with no system. **M0 has
   to pick one and record it** — tracked as Q6 in [`Open_Questions.md`](../00_Program/Open_Questions.md).
3. **Inter ships at 300/400/500 only.** If headings need heavier, that is a decision, not an assumption —
   Q7.

## M0 has a deliverable already sitting here

KS-1105 requires *"Route skeleton matching design sidebar order"* and *"empty routes for all sidebar
destinations"*. That order is extracted and ready in
[`Design_Reference.md`](./Design_Reference.md) §4 — twelve destinations across four groups: Overview,
Performance, Models, Funds.

It also requires *"design tokens + light/dark theme"*. Both complete token sets are in §2 of the same
file.

## Open questions blocking scope

Four of them, all "is this in scope?" — **take them to KS in one conversation**, not four. See
[`Open_Questions.md`](../00_Program/Open_Questions.md) Q1–Q4 and the evidence in
[`Gap_Analysis_Design_vs_Prod.md`](./Gap_Analysis_Design_vs_Prod.md).
