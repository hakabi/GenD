# Glossary — Aloha Modernization

Terms that appear in these documents, the epics, or the design handoff. Written for someone joining the
programme who has not been in the meetings.

**Owner:** BA · **Last updated:** 21 August 2026

---

## Systems

| Term | Meaning |
|---|---|
| **Aloha** | The financial investment-fund platform being modernised. Metrics include NAV, Beta, Risk, MTD/QTD/FYTD, Cash Forecast, Rating |
| **Aloha lab** | `workbench-app.lab.gend.vn` — the writable test environment |
| **Aloha production** | `aloha.conceptia.com` — read-only |
| **Workbench** | The admin/operations UI alongside Aloha. QA validates Airflow dual-run against both |
| **QOps Harness** | Internal LLM + Playwright test-ops tool. **The test stack for this programme**, replacing Selenium. Improvement work tracked separately under Jira **QG** |
| **Trino** | The distributed query engine. **Kept** through the Postgres POC — only the adapter changes |
| **Digdag** | The current workflow orchestrator, being replaced by Airflow |
| **Solovis · Evestment · Cambridge · Dynamo** | Upstream data sources. Structure documented in existing KAM pages — see [`Prior_Art.md`](../02_Postgres_POC_KS-1103/Prior_Art.md) |

## Programme vocabulary

| Term | Meaning |
|---|---|
| **KS** | Kamehameha Schools — the customer. Also the Jira project key, and the Confluence space is **KAM** |
| **KSBE IMG** | Kamehameha Schools Bernice Pauahi Bishop Estate, Investment Management Group. The branding on the design handoff |
| **Handoff** | The customer-supplied design, `01_UI_Rewrite_KS-1102/source/index.html` — *KSBE IMG Endowment Dashboard* |
| **M0, M1, …** | Milestones under KS-1102. M0 is foundation with no KS demo; M1 is the first KS review |
| **Go / no-go** | The KS decision closing KS-1103. No-go means Mongo stays and production is unchanged |
| **Dual-run** | Running Digdag and Airflow on the same schedule and comparing output before disabling Digdag |
| **Cutover** | Switching the new Angular app to production, after KS UAT |

## Design vocabulary

From the handoff. Full detail in [`Design_Reference.md`](../01_UI_Rewrite_KS-1102/Design_Reference.md).

| Term | Meaning |
|---|---|
| **`--up` / `--dn`** | Semantic finance colours — gain and loss. Each has a `-lt` alpha tint for backgrounds |
| **`t1`–`t4`** | The four-step text ramp, brightest to dimmest |
| **`bg`–`bg4`** | The four-step surface ramp |
| **`data-theme`** | Attribute on `<html>`. **Dark is the default**; `light` is the override — the opposite of Harness |
| **At a Glance** | The Overview landing screen. KPIs: NAV, Risk %, Equity Beta, Illiquid, Unfunded |
| **Scenario Test** | Beta-scenario modelling. In the design it sits under the **Equity Beta Model**; in production it appears under the Risk Model. See [`Gap_Analysis_Design_vs_Prod.md`](../01_UI_Rewrite_KS-1102/Gap_Analysis_Design_vs_Prod.md) |

## Roles

**BA** owns these documents and the backlog · **PO** reviews and prioritises · **dev** implements ·
**QA** tests · **KS** is the customer and owns UAT and the Postgres decision.

Real names and email addresses stay in Jira. These documents use roles.

## Two Jira projects, do not confuse them

| Key | Project | Relevant epics |
|---|---|---|
| **KS** | Kamehameha Schools | **KS-1102 · KS-1103 · KS-1104** (this programme) · KS-1066 (MCP QA, separate) |
| **QG** | QA-GENERIC | QG-138 — QOps Harness improvement |
