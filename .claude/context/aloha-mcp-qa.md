# Context Pack — Aloha MCP QA Verification (KS-1066)

**Programme:** establishing whether the **Aloha MCP server** is fit for the team to rely on, and issuing
a defensible QA verdict backed by evidence.

**Endpoint under test:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP).
**Jira project KS**, Epic **[KS-1066](https://gendvn.atlassian.net/browse/KS-1066)**.

**Cycle 1 status:** executed and closed 2026-08-11, verdict **FAIL**. 12 bugs filed (KS-1085…KS-1096).
Remediation branch merged; server was `0.9.7` at the 19 Aug check. A re-test is expected.

---

## 1. Reading list

| File | Role |
|---|---|
| `Aloha Server/Test Guide/Findings Register.md` | ⭐ **Canonical.** Every finding ID across all cycles, the four ID namespaces, next free ID |
| `Aloha Server/Test Guide/aloha_mcp_uat_plan.md` | The cycle design — purpose, stories, exit criteria. A **pre-cycle** document, deliberately not retrofitted with results |
| `Aloha Server/Test Guide/aloha_mcp_uat_tickets.md` | Ticket drafts + the Draft ID ↔ Jira key mapping. **The house-style exemplar for this pack** |
| `Aloha Server/Test Result/KS-1066 All Findings and Bugs Report.md` | Cycle 1 compilation. **§7 revises the story set for the re-test — read it before reusing the plan** |
| `Aloha Server/baseline/aloha-tool-inventory-*.md` | Dated tool-catalogue snapshots |
| `Aloha Server/Test Result/*.md` | Per-story results, consolidated reports, retest notes |

## 2. 🔴 The four ID namespaces

**These are not interchangeable, and confusing them has already produced dead links in live Jira**
(`browse/NEW-18`, `browse/AM-12` — neither is a Jira key).

| Family | Meaning | A Jira key? |
|---|---|---|
| `NEW-nn` | Finding IDs, cross-cycle | **No** |
| `AM-nn` | Draft story IDs in the UAT plan | **No** |
| `KS-1066`, `KS-1070`…`KS-1084` | Epic and stories | Yes |
| `KS-1085`…`KS-1096` | Bugs filed by cycle 1 | Yes |

**Never invent an ID in this pack.** The Findings Register carries the next free finding ID; read it and
use that. Do not apply the generic draft-ID convention from other packs here — this namespace is
governed.

## 3. Evidence discipline

- **Earlier observations are treated as unverified rumour** until re-established by the current cycle's
  own evidence. This is the plan's explicit stance; keep it.
- A finding needs a reproducible call: the tool, the arguments, the observed response, the expected one.
- Record the **server build** with every finding — behaviour has changed across `0.9.5` → `0.9.7`.
- The register is reconciled line by line against the cycle report. Do not add a finding to one without
  the other.

## 4. Tools

The Aloha MCP tools are the instrument under test — roughly 35 of them (`fund_analyzer`,
`get_fund_returns`, `search_funds`, `equity_beta`, `fee_model`, `ir_model`, rating and datalake tools).

> ⚠️ **The `conceptia-aloha` MCP server is not currently authorized.** Until it is, findings cannot be
> reproduced live — work from the register and the reports, and say plainly in your output that no live
> probe was made. Authorization is done by the BA via `/mcp` in an interactive session.

## 5. Ticket conventions

Project **KS**, parent **KS-1066**. `aloha_mcp_uat_tickets.md` is the exemplar: a Draft ID ↔ Jira key
mapping table at the top, dependency-ordered stories, each written to be picked up and run without
further briefing.

Known weakness to avoid repeating: cycle 1 started with **no written answer recorded** for the plan's §9
Q1 and Q2, which were meant to be blocking. If a story depends on an unanswered question, say so at the
top of the draft.
