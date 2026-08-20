# Jira Ticket Drafts — Aloha MCP QA Verification Cycle

> **Status:** **CREATED IN JIRA AND EXECUTED.** All 1 Epic + 15 Stories exist under [KS-1066](https://gendvn.atlassian.net/browse/KS-1066). The cycle ran and closed 2026-08-11 with verdict **FAIL**; **12 bugs** were filed (KS-1085…KS-1096). Epic status: Development Complete — QA closed, remediation owned by engineering. Draft IDs below are kept as stable cross-reference anchors; real keys are mapped in §Draft ID ↔ Jira key mapping and annotated inline throughout this file.
> **Version:** 2.0 · **Prepared:** 2026-08-05 · **Mapped to Jira:** 2026-08-07 · **Status annotations added:** 2026-08-14
> **Companion:** `aloha_mcp_uat_plan.md` · **Findings index:** `Findings Register.md` (same folder)
> **Structure:** 1 Epic + 15 Stories.
> **Suggested labels:** `aloha-mcp`, `qa`, `verification-2026-08`
> **Blocked by:** plan §9 Q1 and Q2 must be answered before AM-01 (KS-1070) starts — ⚠️ *in practice the cycle started with no written answer recorded for either; see plan §9 status table*

> **This file remains a pre-cycle ticket draft.** The acceptance criteria below are the ones the stories were created with, not a record of what was found. They are **not** retrofitted with execution findings — those live in `Findings Register.md` (canonical, cross-cycle) and `Test Result/KS-1066 All Findings and Bugs Report.md` (this cycle's compilation). What has been added is **status only**: per-story verdicts in the mapping table, and corrections where this file's own statements about Jira went stale.
>
> **Reusing these tickets for the re-test?** Read report **§7** first — it revises the story set: a mandatory date-window scoping column across all ~12 date-taking tools (asserting both that returned dates are in-window *and* that derived statistics are computed only from in-window data), a new cross-tool numeric-consistency story, an optional-parameter coverage rule, a catalog-wide completeness-signal audit, and scripting the 34-tool smoke pass.

---

## Draft ID ↔ Jira key mapping

| Draft ID | Jira Key | Story | Cycle verdict |
|---|---|---|---|
| Epic | [KS-1066](https://gendvn.atlassian.net/browse/KS-1066) | Aloha MCP - QA verification cycle | **FAIL** |
| AM-01 | [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) | Connect two MCP clients and complete OAuth | Pass with findings |
| AM-02 | [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) | Capture tool inventory and audit catalog quality | Pass with findings |
| AM-03 | [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) | Verify fund search and resolution correctness | Pass with findings |
| AM-04 | [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) | Verify `fund_analyzer` parameter handling and payload scoping | **FAIL** |
| AM-05 | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) | Smoke-test returns and performance tools | **FAIL** |
| AM-06 | [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) | Smoke-test benchmark and CRBM tools | Pass with findings |
| AM-07 | [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) | Smoke-test fee, IR and liquidity model tools | Pass with findings |
| AM-08 | [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) | Verify ratings tools and user-scoping behaviour | **FAIL (O4)** |
| AM-09 | [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) | Verify datalake introspection tools | **FAIL** |
| AM-10 | [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) | Verify error quality and LLM-oriented failure handling | **FAIL** |
| AM-11 | [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) | Verify authentication, TLS, transport and session behaviour | Pass with findings |
| AM-12 | [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) | Verify payload limits and client compatibility | Pass with findings |
| AM-13 | [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) | Assess agent usability and tool selection | Pass with findings |
| AM-14 | [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) | Triage findings and file defects | Pass |
| AM-15 | [KS-1084](https://gendvn.atlassian.net/browse/KS-1084) | Assemble evidence pack and issue QA verdict | Pass (deliverable) |

Confirmed 2026-08-07 by fetching all 16 issues directly from Jira (`gendvn.atlassian.net`, cloud id `a5cab9f1-9fa7-40f1-9025-cd77c2fdcfb4`) and matching summaries verbatim against the drafts below. Verdicts added 2026-08-14 from `Test Result/KS-1066 …Report.md` §5, itself compiled by reading all 27 live issues under the epic.

### Bugs filed by this cycle — 12

Filed under AM-14 (KS-1083); none existed when this file was drafted. Full detail in the report §2; canonical finding-ID mapping in `Findings Register.md` §2.

| Key | Summary | Priority |
|---|---|---|
| [KS-1085](https://gendvn.atlassian.net/browse/KS-1085) | `fund_analyzer` silently picks top hit on ambiguous `search_term` and crashes instead of disambiguating (O1+O2+O3) | Medium ⚠️ |
| [KS-1086](https://gendvn.atlassian.net/browse/KS-1086) | `fund_analyzer` `search_term` overrides an explicit valid `fund_id` | High |
| [KS-1087](https://gendvn.atlassian.net/browse/KS-1087) | `get_fund_returns` returns silent empty success for invalid `fund_id` | High |
| [KS-1088](https://gendvn.atlassian.net/browse/KS-1088) | `fund_analyzer` accepts malformed dates without validation | High |
| [KS-1089](https://gendvn.atlassian.net/browse/KS-1089) | `intraday_fund_returns` returns all zeros (non-functional) | High |
| [KS-1090](https://gendvn.atlassian.net/browse/KS-1090) | `get_benchmark_history` silent empty when a name is used instead of `bbg_id` | High |
| [KS-1091](https://gendvn.atlassian.net/browse/KS-1091) | `get_fee_model_defaults` fields do not compose into `fee_model` | High |
| [KS-1092](https://gendvn.atlassian.net/browse/KS-1092) | `get_data` `truncated` flag false when the 1000-row cap is hit | High |
| [KS-1093](https://gendvn.atlassian.net/browse/KS-1093) | No payload byte cap on omit-filter and wide `get_data` responses | High |
| [KS-1094](https://gendvn.atlassian.net/browse/KS-1094) | OAuth identity not forwarded — ratings fail-closed (O4) | High |
| [KS-1095](https://gendvn.atlassian.net/browse/KS-1095) | `describe_table` invalid input leaks Trino/MongoDB stack traces | High |
| [KS-1096](https://gendvn.atlassian.net/browse/KS-1096) | `calculate_drawdown` headline metrics ignore the requested date window | High |

All twelve are **S2 High** by the plan's rubric. ⚠️ **KS-1085 is the odd one out in Jira, and stays that way by decision.** It carries **no labels at all** and priority **Medium**, where the other eleven carry `S2`/`MCP-Aloha`/`AM-14` and priority High. It was filed by a different QA (Ha Khoa Dinh, who is also its assignee) before the labelling convention existed. **Decision 2026-08-14: treat KS-1085 as an independent ticket and leave its metadata alone.** Consequence to remember: **a Jira `labels = S2` filter returns 11 bugs, not 12** — use the [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) triage comment or `Findings Register.md` as the authoritative set. Recorded in register §4.1.

### Scope decision 2026-08-14 — Option 2: the bugs stay under KS-1066

The 12 bugs were **not** split into a separate remediation epic. KS-1066 keeps them and stays open through remediation. Because its four original acceptance criteria are pure *verification* criteria — all satisfiable while 12 bugs sit open — the epic would otherwise have had **no defined close trigger**. Its description now carries two sets:

- **Part A — verification.** The original four, with outcomes recorded.
- **Part B — remediation and re-test.** New, and the actual close trigger: a build later than `0.9.5`, all 12 bugs resolved or owner-deferred, KS-1096/KS-1088 verified against their *amended* scope, NEW-21…NEW-25 dispositioned, the re-test executed, and plan §9 Q1/Q2/Q3/Q6/Q7/Q10 answered in writing.

### Tickets created 2026-08-14

| Key | Type | Parent | Purpose |
|---|---|---|---|
| [KS-1098](https://gendvn.atlassian.net/browse/KS-1098) | Epic | — | Re-test cycle against a remediated build. Carries the five revisions from report §7. **Links `blocks` → KS-1066**, giving that epic its close trigger |
| [KS-1099](https://gendvn.atlassian.net/browse/KS-1099) | Story | KS-1098 | Script the 34-tool smoke pass as a repeatable asset. Do this *before* the re-test executes |
| [KS-1100](https://gendvn.atlassian.net/browse/KS-1100) | Story | KS-1066 | Two-client confirmation of NEW-21…NEW-25, then file or dismiss. They are single-client drafts and must not be filed as-is |

All three assigned to Bình Hà Khoa.

### Acceptance criteria annotated in Jira — all 15 stories + the epic, 2026-08-14

Every story's acceptance criteria in Jira now carry a per-criterion outcome. **Convention:** `[x]` = *executed and result recorded*, **not** *passed* — each line carries an inline `PASS` / `FAIL (ticket)` / `PARTIAL` / `NOT EVIDENCED` tag. Blanket-ticking was rejected deliberately: on a FAIL story it would have hidden the failure behind a row of green boxes, exactly when a reviewer most needs to see it.

**Gaps the pass surfaced — none of these were visible from the consolidated comments alone:**

| Story | Gap |
|---|---|
| [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) | **The S1 gate was never tested.** The two-QA-account comparison that would demonstrate shared-identity scoping could not run — a second Azure AD account was never available. Both accounts would have returned empty anyway under O4, so the test could not have distinguished correct scoping from shared scoping. *"No S1"* means **not demonstrated**, not **ruled out** |
| [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) | Root cause of the above — one QA account for the whole cycle. Also the `AC5-gap`: no timed restart log was ever captured |
| [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) | Two confirmed defects never filed — `smpublic_main_v3`/O10 (its own AC requires a defect) and the `list_tables` raw Python error |
| [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) | Its own criterion reads *"no **error** contains raw SQL"* — NEW-23's SQL echo appears on **success**, so it slips the wording. Widen to "no response" |
| [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) | TLS 1.0/1.1 rejection never verified (Schannel limitation); revoked-session path never tested; no 429 ever observed under burst |
| [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) | 6 of 15 criteria failed; `end_date` default and type-coercion never evidenced; per-slice size table never recorded |
| [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) | AC cites a "64-column" cap; the live allowlist is **31**. Row cap never actually reached on this table |
| [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) | No complete 34-tool byte table; 4 of 6 omit-filter tools measured |
| [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) | Triage had **no second reviewer** — the Claude write-up was absent at consolidate time. Deferred-finding reasons exist only in the repo, never in Jira |
| [KS-1084](https://gendvn.atlassian.net/browse/KS-1084) | Verdict published but **never evidenced as circulated to the service owners** — while six owner questions remain unanswered |

**Antigravity's results diverge, and lean lenient.** It graded [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) **100% PASS** where Cursor and Claude Code both found FAIL; called [KS-1075](https://gendvn.atlassian.net/browse/KS-1075)'s silent-empty defect *"handled without server error"*; and contradicted the O6 type-inconsistency finding on [KS-1072](https://gendvn.atlassian.net/browse/KS-1072). Its comments are retained on the tickets for the record and marked as not counted.

**Dead links re-verified 2026-08-14** — still live in Ha Khoa Dinh's comments on KS-1071 (`AM-12`), KS-1075 (`AM-12` ×2), KS-1078 (`NEW-16`, `NEW-17`) and KS-1081 (`NEW-19`). Still needs his permission.

### Remediation status — live check 2026-08-14

**Six of the 12 bugs are In Progress, assigned to `quan`:** KS-1091, KS-1092, KS-1093, KS-1094, KS-1095, KS-1096 — including both P0s. The remaining six sit at Development Complete. **No new build had shipped as of the last `health_check` (2026-08-12, still `0.9.5`)**, so nothing is re-verified yet.

> ⚠️ **Two confirmed defects still have no ticket.** `smpublic_main_v3` / O10 is non-functional over MCP, and [KS-1078](https://gendvn.atlassian.net/browse/KS-1078)'s acceptance criteria explicitly require a defect to be filed for it. `list_tables` returns a raw Python `unhashable type: 'dict'` on an invalid `db_name`. Both were consciously left unfiled on 2026-08-14; they are recorded on the KS-1066 description under *Known gaps carried openly*.

**Remediation priority as filed:** **P0** KS-1094, KS-1095 · **P1** KS-1085, KS-1086, KS-1087, KS-1089, KS-1090, KS-1096 · **P2** KS-1088, KS-1091, KS-1092, KS-1093 · **P3** the deferred S3/S4 set in the KS-1083 triage sheet.

> **Two bugs need re-scoping before anyone picks them up** — a fix matching the current ticket wording would leave the defect partly live:
> - **[KS-1096](https://gendvn.atlassian.net/browse/KS-1096)** reads *"headline metrics reference dates outside the window"*. Live re-test shows **every statistic except `total_periods`** is computed over the fund's full 348-month history. Correcting only the date fields would leave `number_down_months`, `top_3_losses` and the drawdown magnitudes wrong.
> - **[KS-1088](https://gendvn.atlassian.net/browse/KS-1088)** has a root cause now identified: `start_date`/`end_date` carry **no `pattern`** constraint while their `custom_*` siblings all do. It merges with the deferred NEW-10 as one fix — and a regex alone is insufficient, since `2026-13-45` matches it and needs a server-side calendar check.
>
> Both amendments are recorded in `Findings Register.md` §4.

> ⚠️ **Dead draft-ID links in live Jira — sweep complete 2026-08-12.** Pasting draft IDs verbatim from this file produced links like `[AM-12](https://gendvn.atlassian.net/browse/AM-12)` and `[NEW-5](https://gendvn.atlassian.net/browse/NEW-5)` in live issues. No Jira project is keyed `AM` or `NEW`, so those URLs 404. This file's inline references are correct (mapped to the real `KS-xxxx` keys throughout).
>
> **Full sweep, 2026-08-12 — complete.** All 28 issues under the epic were scanned, descriptions **and** comments. **52 dead `browse/NEW-nn` / `browse/AM-nn` links were removed from 20 locations.** Where a finding has a real ticket the reference now points at it (NEW-7→KS-1089, NEW-8→KS-1096, NEW-11→KS-1090, NEW-12/13→KS-1091, NEW-15→KS-1094, NEW-16→KS-1095, NEW-17→KS-1092, AM-12→KS-1081, AM-05…AM-09→KS-1074…KS-1078). Deferred findings with no ticket (NEW-6, 9, 14, 18, 19, 20) are now plain text marked *deferred*.
>
> **Previously listed as outstanding, now resolved:** KS-1086's `browse/NEW-5` — removed. KS-1081's three links and KS-1088's `browse/NEW-4` — confirmed corrected.
>
> **Scanned and clean, no change needed:** KS-1070, KS-1071, KS-1072, KS-1073, **KS-1084**, KS-1085, KS-1087, KS-1093.
>
> ⚠️ **One contradiction, unresolved — check before spending time on it.** The note above originally flagged **KS-1084**'s description as carrying a literal `[AM-12](…/browse/AM-12)`, and `Test Result/KS-1066 …Report.md` **§7** still recommends fixing *"the literal `[AM-12](…/browse/AM-12)` draft links still present in live ticket descriptions"*. But that same report's **§4.3** sweep table lists KS-1084 as **clean**, and the only `AM-nn` links it records removing were 6 in the **KS-1066 verdict comment** (AM-05, AM-09, AM-12, AM-15). Either the KS-1084 link was cleared during the sweep and §7 is stale, or §4.3 missed it. Re-read KS-1084's live description before acting.
>
> **~7 dead links remain, deliberately left:** all inside comments authored by another QA (Ha Khoa Dinh) — KS-1071 `20722`, KS-1075 `20747`, KS-1076 `20748`, KS-1078 `20750`, KS-1081 `20753`. Editing another person's comment was judged out of scope. Raise with them, or authorise a second pass. Tracked in `Findings Register.md` §4.1.

> **Where `NEW-nn` findings live:** this file defines only the draft story IDs `AM-01`–`AM-15`. Findings raised *during* execution are numbered `NEW-nn` and are indexed in **`Aloha Server/Findings Register.md`** — not here, and not in the plan. Both Test Guide files are pre-cycle design documents and should not be retrofitted with execution findings.

---

## How to create this in Jira

1. Create the **Epic** (§ Epic below). — ✅ done, [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
2. Create all 15 stories as children of that Epic. — ✅ done, see mapping table above
3. Link dependencies with **"is blocked by"** per the table in §Dependency links. — confirmed present on the issues checked this cycle (KS-1070–1084 all show `is blocked by` links in Jira)
4. Apply labels to every issue. — ✅ all 15 stories verified carrying `aloha-mcp`, `qa`, `verification-2026-08` (live check 2026-08-14). **Bugs use a different label set** (`S2`, `MCP-Aloha`, `AM-14`) and KS-1085 carries none — left that way by decision, see the bug table above
5. ~~Replace the draft IDs `AM-01 (KS-1070)`…`AM-15 (KS-1084)` in the Test Result folder with the real Jira keys once assigned.~~ **Done** — every `Aloha Server/Test Result/*.md` file already cites its real Jira key alongside the draft ID.

### Definition of Done — applies to every story

Checklist executed · evidence stored under `Aloha Server/Test Result/` · all evidence redacted per plan §7.3 · result peer-reviewed by one other QA · every failure has a linked defect with a severity · sign-off recorded in the QA tracker.

### Dependency links

| Story | is blocked by |
|---|---|
| AM-02 (KS-1071) | AM-01 (KS-1070) |
| AM-03 (KS-1072) | AM-02 (KS-1071) |
| AM-04 (KS-1073) | AM-03 (KS-1072) |
| AM-05 (KS-1074) | AM-02 (KS-1071) |
| AM-06 (KS-1075) | AM-02 (KS-1071) |
| AM-07 (KS-1076) | AM-02 (KS-1071) |
| AM-08 (KS-1077) | AM-02 (KS-1071) |
| AM-09 (KS-1078) | AM-02 (KS-1071) |
| AM-10 (KS-1079) | AM-05 (KS-1074), AM-06 (KS-1075), AM-07 (KS-1076), AM-08 (KS-1077), AM-09 (KS-1078) |
| AM-11 (KS-1080) | AM-01 (KS-1070) |
| AM-12 (KS-1081) | AM-04 (KS-1073) |
| AM-13 (KS-1082) | AM-02 (KS-1071) |
| AM-14 (KS-1083) | AM-03 (KS-1072), AM-10 (KS-1079), AM-11 (KS-1080), AM-12 (KS-1081), AM-13 (KS-1082) |
| AM-15 (KS-1084) | AM-14 (KS-1083) |

---

# EPIC (KS-1066) — Aloha MCP QA Verification Cycle

**Type:** Epic · **Priority:** High · **Labels:** `aloha-mcp`, `qa`, `verification-2026-08`

**Summary**
`Aloha MCP - QA verification cycle for the Streamable HTTP endpoint`

**Description**

Verify that the Conceptia Aloha MCP server (`https://mcp.conceptia.com/aloha/mcp`, build `0.9.5`) is fit for the team to depend on for day-to-day fund analysis.

The server exposes **34 tools** across fund search, returns and performance, benchmarks and CRBM, fee/IR/liquidity modelling, ratings, and datalake introspection. A schema audit of all 34 found **no write-capable tool** — this cycle authorises **read-only** testing only.

This cycle establishes its own evidence from scratch. It covers:

- Client connectivity and OAuth (2 clients)
- Tool inventory and catalog quality
- Functional correctness of every tool group
- Parameter handling, especially date-range scoping
- Payload size and client compatibility
- Error quality and agent-oriented failure handling
- Authentication, transport and session behaviour
- Agent usability and tool selection

**Outcome:** an evidence-backed QA verdict — Pass / Pass with findings / Fail — with every defect filed and severity-rated.

**Acceptance criteria**
- [ ] All 15 child stories closed or explicitly deferred with a reason
- [ ] All ten pre-cycle observations (plan §3.2, O1–O10) dispositioned
- [ ] Exit criteria in plan §11 confirmed line by line
- [ ] Verdict published and circulated to the service owners

---

# AM-01 (KS-1070) — Set up MCP clients and complete OAuth

**Type:** Story · **Priority:** Highest · **Owner:** QA Lead · **Est:** 0.5 d · **Blocked by:** plan §9 Q1, Q2

**Summary**
`Aloha MCP QA - Connect two MCP clients to the Aloha endpoint and complete OAuth`

**Description**
As a QA engineer, I need at least two MCP clients authenticated against `https://mcp.conceptia.com/aloha/mcp`, so that every later story runs against the real deployed surface and client-specific defects are detectable.

This is the gating story. Nothing else starts until it passes.

**Acceptance criteria**
- [ ] `conceptia-aloha` configured using native HTTP transport: `{ "type": "http", "url": "https://mcp.conceptia.com/aloha/mcp" }` — **not** `npx mcp-remote`
- [ ] OAuth completes via browser on **two** clients (Claude Code + Antigravity) — no raw JWT or token paste at any point
- [ ] Each QA authenticates with their **own** Azure AD account
- [ ] Client name and version recorded for each — these become matrix columns in later stories
- [ ] Connection survives a client restart without re-authentication
- [ ] Time to first successful tool list recorded per client

**Test steps**
1. Add the server block to the client config (plan §6.1).
2. Authenticate from an interactive terminal: `claude` → `/mcp` → select `conceptia-aloha` → Authenticate.
3. **Restart the client** — a session started before authentication will not pick up the token (confirmed 2026-08-05).
4. Confirm the tool list loads. Record the count.
5. Restart again; confirm the session persists without re-auth.
6. Repeat for client 2.

**Evidence**
Screenshot of the OAuth prompt and connected state; redacted config; one log per client.

**Note:** use different QA accounts on the two clients where possible — AM-08 (KS-1077) needs two distinct identities.

> ⚠️ **What actually ran: Cursor IDE + Claude Code CLI 2.1.223**, both native HTTP — not Claude Code + Antigravity as drafted above. **Antigravity was excluded from the acceptance criteria** because it self-reported an `mcp-remote` transport, which fails the first AC on this story and risks a silent SSE fallback, so its results could not be attributed to the Streamable HTTP surface under test. Recorded as NEW-1 in `Findings Register.md`. Settle the supported-client list via plan §9 Q9 before the re-test.
>
> ⚠️ **One AC was never properly evidenced.** *"Connection survives a client restart without re-authentication"* — no client produced a timed stop→start→no-reauth log; all evidence is informal cross-session pickup. Recorded as the `AC5-gap` process item. Capture it explicitly next cycle.

---

# AM-02 (KS-1071) — Capture tool inventory and audit catalog quality

**Type:** Story · **Priority:** Highest · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-01 (KS-1070)

**Summary**
`Aloha MCP QA - Capture the full tool inventory and audit catalog quality`

**Description**
As a QA engineer, I need a complete, dated inventory of every tool the Aloha MCP exposes, with each one classified, so that the rest of the cycle is designable and the team has a drift baseline for future deployments.

**This story unblocks six others. Prioritise it on day 1.**

A starting inventory exists at `baseline/aloha-tool-inventory-2026-08-05.md` (34 tools). **Verify it — do not assume it is still accurate.**

**Acceptance criteria**
- [ ] Full tool list captured and saved to `baseline/aloha-tool-inventory-{date}.md`
- [ ] Tool count compared against the 34 baseline; any delta named tool-by-tool
- [ ] For each tool: name, description, required params, optional params, return shape, and **read / compute / write** classification
- [ ] Any write-capable tool flagged and **reported to the service owners before further testing** — this changes the cycle's risk profile
- [ ] Inventory verified identical across both clients; a per-client difference is a defect
- [ ] Duplicate and near-duplicate tools identified explicitly
- [ ] Tools with **no required parameters** that can return all funds listed separately — these feed AM-12 (KS-1081)

**Test steps**
1. Export the full tool list from client 1, then client 2. Diff them.
2. Capture each tool's input schema.
3. Classify read / compute / write.
4. Cross-check against the 2026-08-05 baseline and record deltas.
5. Build the duplicate list.

**Known starting point (verify, don't trust)**

| Group | Count |
|---|---|
| Fund search & resolution | 5 |
| Bundled analysis | 2 |
| Returns & performance | 7 |
| Benchmarks & CRBM | 3 |
| Fees, IR & liquidity | 6 |
| Ratings | 5 |
| Datalake introspection | 6 |
| **Total** | **34** |

Three self-declared duplicate aliases were found (O5): `search_funds`≡`Search_Funds`, `rating_detail`≡`get_rating_details`, `rating_summary`≡`get_rating_summary`.

**Evidence**
Inventory file, schema capture, per-client diff, duplicate list.

---

# AM-03 (KS-1072) — Verify fund search and resolution correctness

**Type:** Story · **Priority:** Highest · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Verify fund search and resolution across the five search tools`

**Description**
As a QA engineer, I need the five fund-search tools verified for correctness and consistency, so that the team can trust fund identification — the entry point to nearly every other tool.

Tools in scope: `Search_Funds`, `search_funds`, `search_all_funds`, `search_albourne_funds`, `search_crbm_index`.

**Acceptance criteria**
- [ ] Exact-name query `"Citadel Kensington Global Strategies"` returns exactly fund `500`, source `solovis`
- [ ] Ambiguous query `"Citadel Investment"` returns its candidate set; the set is recorded in full
- [ ] Results are consistent across the search tools for the same term; any divergence documented
- [ ] `search_funds` and `Search_Funds` confirmed identical or divergent — settles **O5**
- [ ] **O6 checked:** `fund_id` return type compared across tools. `Search_Funds` returned string `"4874"`, `search_all_funds` returned number `4874` on 2026-08-05
- [ ] Non-existent term `99999999` returns an explicit error — **not** a silent empty success
- [ ] Empty string `""` and whitespace-only input do **not** return the full fund set
- [ ] Special characters and very long input handled without a raw server error
- [ ] Solovis funds are reachable via search; note which queries surface them and which do not
- [ ] `search_crbm_index` resolves a known benchmark name to a `bbg_id`

**Test steps**
1. Run each of the 5 tools with each fixture from plan §4.
2. Tabulate: tool × fixture → result count, ids returned, id type, source.
3. Run the negative inputs: `99999999`, `""`, whitespace, 500-char string, `!@#$%`.
4. Diff `search_funds` vs `Search_Funds` byte-for-byte, ignoring timestamps.

**Evidence**
Result matrix, raw JSON per call.

**Watch for:** empty or whitespace filters treated as "no filter" and returning the full record set — a pattern seen repeatedly on the sibling Dynamo server.

---

# AM-04 (KS-1073) — Verify `fund_analyzer` parameter handling and payload scoping

**Type:** Story · **Priority:** Highest · **Owner:** QA-B · **Est:** 1.5 d · **Blocked by:** AM-03 (KS-1072)

**Summary**
`Aloha MCP QA - Verify fund_analyzer parameter handling, resolution and payload scoping`

**Description**
As a QA engineer, I need `fund_analyzer` verified in depth, because it is the flagship bundled-analysis tool, it fans out to eight optional components, and the pre-cycle probe found three separate problems in it.

**This is the highest-risk single tool in the catalog.**

**Pre-cycle observations to confirm**

| Obs | Detail |
|---|---|
| **O1** | With `search_term="Citadel Investment"` it silently resolved to the **top hit** (`4874`) and failed with *"No Solovis fund details for resolved fund_id='4874'"*. No disambiguation offered |
| **O2** | With `start_date=2025-08-01` the response contained dates back to **1995-07-31** — 3,194 of 3,293 date values fell outside the requested window. `end_date` **was** honoured |
| **O3** | With `fund_id=500` and **all seven optional slices set false**, the response was **613,731 characters / 19,713 lines** |

**Acceptance criteria**

*Resolution*
- [ ] `fund_id=500` happy path returns a coherent result
- [ ] `search_term="Citadel Kensington Global Strategies"` resolves to 500
- [ ] `search_term="Citadel Investment"` either resolves correctly **or returns a disambiguation list** — silently picking one candidate is a **Fail**
- [ ] Passing both `fund_id` and `search_term` has documented, sensible precedence
- [ ] Passing neither returns a clear error

*Date handling (O2)*
- [ ] `start_date` scopes the returned series, not only the computed metrics
- [ ] `end_date` scopes the returned series
- [ ] Inverted range (`start_date` **after** `end_date`) is **rejected**, not silently accepted
- [ ] Future dates and malformed dates (`2026-13-45`, `not-a-date`) return clear errors
- [ ] Omitting `end_date` uses a documented default

*Payload (O3)*
- [ ] Response size recorded for: all slices off · each slice on individually · all slices on (default)
- [ ] A documented, enforced upper bound exists — **or** its absence is filed as a defect
- [ ] Default configuration is usable by a normal MCP client without overflow

*Invalid input*
- [ ] `fund_id=99999999` returns a structured error with a next step
- [ ] String passed where a number is expected, and vice versa, handled cleanly

**Test steps**
1. Baseline: `fund_id=500`, all `include_*` **false**, 1-month range. Record exact byte size.
2. Repeat enabling one slice at a time — build a per-slice size table.
3. Repeat with defaults (all on). **Expect a very large response — save to file, do not render.**
4. Re-run step 1 with a 1-month range and grep the returned dates for anything outside it.
5. Run the resolution and invalid-input cases.

**Testing tip:** save large responses to file and analyse structurally (`grep`, `wc`, date-range extraction) rather than reading them in full — reading a 614 KB response into an agent client will exhaust its context.

**Evidence**
Per-slice size table, date-range extraction output, resolution transcripts, raw JSON.

---

# AM-05 (KS-1074) — Smoke-test returns and performance tools

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Smoke-test the returns and performance tool group`

**Description**
As a QA engineer, I need the seven returns and performance tools exercised on happy path and invalid input, so their correctness is established independently of `fund_analyzer`.

**Tools:** `get_fund_returns`, `get_top_funds_by_returns`, `get_bottom_funds_by_returns`, `calculate_annualized_returns`, `intraday_fund_returns`, `calculate_drawdown`, `equity_beta`.

**Acceptance criteria**
- [ ] Each tool run on a happy path with fund 500 or an equivalent valid fixture
- [ ] Each tool run with invalid input: bad id, wrong type, empty string, **inverted date range**
- [ ] No tool returns a **silent empty success** for invalid input
- [ ] No tool returns an unbounded payload that overflows the client
- [ ] `get_top_funds_by_returns`, `get_bottom_funds_by_returns` and `calculate_annualized_returns` document a conditional requirement (`period_months` **or** both dates) that their schema does **not** enforce — verify what happens when neither is supplied, and when both are
- [ ] Top and bottom tools return **disjoint, correctly ordered** result sets for the same period
- [ ] `intraday_fund_returns` (renamed from `fund_returns`) confirmed working; note the rename anywhere it appears in team docs
- [ ] `calculate_drawdown` output sanity-checked: max drawdown negative, recovery months non-negative
- [ ] Results recorded in the matrix, one sheet per client
- [ ] Pass rate ≥ 80% of non-`n/a` cells

**Matrix format**

| Tool | Happy path | Invalid id | Wrong type | Empty/null | Inverted dates | Large result | Client | Tester | Date UTC | Notes |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|---|---|---|

`P` Pass · `F` Fail (defect key in Notes) · `B` Blocked · `S` Skipped · `n/a`

---

# AM-06 (KS-1075) — Smoke-test benchmark and CRBM tools

**Type:** Story · **Priority:** Medium · **Owner:** QA-C · **Est:** 0.5 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Smoke-test the benchmark and CRBM tool group`

**Description**
As a QA engineer, I need the benchmark and CRBM tools verified, so that risk and attribution workflows depending on them are trustworthy.

**Tools:** `get_benchmark_history`, `get_fund_crbm`, `calculate_crbm_returns`. Uses `search_crbm_index` for id resolution.

**Acceptance criteria**
- [ ] `search_crbm_index` resolves a known benchmark name to a `bbg_id`
- [ ] `get_benchmark_history` returns history for that `bbg_id` over a bounded range
- [ ] Passing a benchmark **name** where a `bbg_id` is expected returns a clear error that names the fix
- [ ] `get_fund_crbm` with a valid `fund_id` returns that fund's CRBM
- [ ] ⚠️ `get_fund_crbm` **with `fund_id` omitted** — documented as returning **all funds**. Record the response size. If unbounded, file a defect and feed it to AM-12 (KS-1081)
- [ ] `calculate_crbm_returns` happy path plus inverted date range
- [ ] Date ranges honoured in returned series — same check as AM-04 (KS-1073)/O2
- [ ] Pass rate ≥ 80%

**Test steps**
1. Resolve a benchmark name → `bbg_id`.
2. Happy path on all three tools.
3. Omit `fund_id` on `get_fund_crbm`; measure the response.
4. Negative inputs: unknown `bbg_id`, name-instead-of-id, inverted dates.

---

# AM-07 (KS-1076) — Smoke-test fee, IR and liquidity model tools

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Smoke-test the fee, IR and liquidity model tool group`

**Description**
As a QA engineer, I need the modelling tools verified, so that fee and liquidity analysis produced through MCP can be relied on.

**Tools:** `fee_model`, `get_fee_model_defaults`, `ir_model`, `calculate_liquidity_cost`, `get_liquidity_parameters`, `query_fund_manager`.

**Acceptance criteria**
- [ ] `get_fee_model_defaults` returns defaults for fund 500
- [ ] ⚠️ `fee_model` requires **15 parameters** — verify whether `get_fee_model_defaults` output can be fed straight into it. If the two do not compose, file a usability defect: the tool is effectively unusable by an agent otherwise
- [ ] `fee_model` happy path with a complete valid parameter set
- [ ] `fee_model` with one required parameter missing returns a clear error naming the parameter
- [ ] `ir_model` happy path with explicit `fund_ids`
- [ ] ⚠️ `ir_model` **with `fund_ids` omitted** — documented as returning **all public-sleeve funds**. Record response size; feed to AM-12 (KS-1081)
- [ ] `calculate_liquidity_cost` happy path plus invalid fund
- [ ] ⚠️ `get_liquidity_parameters` with `fund_id` omitted — documented as returning **all funds**. Record size
- [ ] `query_fund_manager` respects its column allowlist; requesting a non-allowlisted column returns a clear error, not a raw DB error
- [ ] `query_fund_manager` respects its documented 64-column / 1000-row caps
- [ ] Numeric parameters reject string input, or coerce it in a documented way
- [ ] Pass rate ≥ 80%

---

# AM-08 (KS-1077) — Verify ratings tools and user-scoping behaviour

**Type:** Story · **Priority:** **Highest** · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Verify the ratings tools and confirm user-scoping behaviour`

**Description**
As a QA engineer, I need the ratings tools verified — in particular **whether user-scoped data is actually scoped to the calling user**.

**Tools:** `get_rating_details`, `rating_detail`, `get_rating_summary`, `rating_summary`, `list_rating_details_by_user`.

> ⚠️ **This story carries the cycle's highest risk. Read the boundary below before starting.**

**Background (O4)**
On 2026-08-05, `get_user_info` returned *"No user email found in request headers"* **despite a fully completed OAuth session**. Three of these tools accept an optional `user` parameter that overrides `X-User-Email`, and their descriptions document a fallback to `MCP_DEFAULT_USER_EMAIL` when the header is absent.

If identity never reaches the service, user-scoped rating data may be served from a **single shared account for every caller**.

**Testing boundary — do not cross**

✅ **In scope:** confirm whether *your own* identity reaches the service; confirm what identity the tools operate as when no `user` is supplied; compare results between two QA accounts to see whether they differ.

🚫 **Out of scope:** deliberately supplying **another person's** email to the `user` parameter to read their data. That is authorisation testing, explicitly deferred (plan §2.2).

If results are identical across two distinct QA accounts, **that alone is the finding** — it demonstrates the scoping problem without anyone accessing another person's data. File it as **S1** and escalate per plan §8.

**Acceptance criteria**
- [ ] `get_user_info` result recorded for **both** QA accounts, on both clients
- [ ] Whether OAuth identity reaches the service is stated definitively
- [ ] `list_rating_details_by_user` run with **no** `user` parameter from two different QA accounts; results compared
- [ ] If the two accounts return identical user-scoped data → **S1 defect, stop and escalate**
- [ ] `get_rating_details` and `get_rating_summary` happy path with a valid `id`
- [ ] `rating_detail` vs `get_rating_details` compared — settles the duplicate question (O5)
- [ ] `rating_summary` vs `get_rating_summary` compared
- [ ] Invalid `id` returns a structured error
- [ ] No personal data beyond the tester's own appears in any evidence; redact before attaching

**Evidence**
Redacted transcripts from both accounts, side-by-side comparison, `get_user_info` output per account.

---

# AM-09 (KS-1078) — Verify datalake introspection tools

**Type:** Story · **Priority:** High · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Verify the datalake introspection and query tools`

**Description**
As a QA engineer, I need the schema-introspection and generic query tools verified, since they expose the broadest data surface in the catalog and are the most likely to leak internal detail.

**Tools:** `show_schemas`, `list_tables`, `describe_table`, `get_data`, `health_check`, `get_user_info`.

**Acceptance criteria**
- [ ] `show_schemas` returns a schema list
- [ ] `list_tables` works for a valid `db_name`; invalid `db_name` returns a clear error, **not** a raw database error
- [ ] `describe_table` works for a valid table; invalid table returns a clear error
- [ ] `get_data` happy path returns rows and respects its documented **1000-row cap**
- [ ] `get_data` with `filter_cond` omitted does **not** return an unbounded set beyond the cap
- [ ] `get_data` with an **empty-string** `filter_cond` is treated as no filter — confirm it does not bypass the cap
- [ ] `get_data` confirmed to reject DDL/DML as documented (`;`, SQL comments, `UNION`, `INSERT`/`UPDATE`/`DELETE`/`DROP`). **Submit these as ordinary invalid input to confirm rejection — do not craft bypass payloads.** Injection testing is out of scope (plan §2.2)
- [ ] The blocked-table restriction (`rating_detail` via `get_data`) is enforced
- [ ] No response contains raw SQL, stack traces, internal paths, hostnames or connection strings
- [ ] `health_check` returns build version and uptime
- [ ] ⚠️ `smpublic_main_v3` — takes **no parameters** yet its description says it requires a Flask JSON body via HTTP proxy (O10). Call it and record what happens. If non-functional over MCP, file a defect

**Escalation:** if any response reveals infrastructure detail (hostnames, credentials, connection strings), stop and escalate per plan §8.

---

# AM-10 (KS-1079) — Verify error quality and LLM-oriented failure handling

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-05 (KS-1074), AM-06 (KS-1075), AM-07 (KS-1076), AM-08 (KS-1077), AM-09 (KS-1078)

**Summary**
`Aloha MCP QA - Verify that errors are structured, actionable and agent-consumable`

**Description**
As a QA engineer, I need every failure mode assessed for whether an **agent** can act on it, since this server is consumed by LLM clients rather than humans. A technically-correct error that an agent cannot parse still blocks the workflow.

This story consolidates the error observations from AM-05 (KS-1074) through AM-09 (KS-1078) rather than generating new traffic.

**Acceptance criteria**
- [ ] Every error message collected across the cycle catalogued by tool and input class
- [ ] Each error rated: **Actionable** (says what to do next) / **Informative** (says what went wrong) / **Terse** (neither)
- [ ] ≥ 80% of errors rated Actionable or Informative
- [ ] No error contains raw SQL, stack traces, internal paths, hostnames or connection strings
- [ ] **O7 dispositioned:** on 2026-08-05 `fund_analyzer` returned its resolution detail as a **Python `dict` repr embedded in a string** (single quotes, not JSON). Confirm whether this is still the case and whether it appears in other tools. The content is useful; the format is not machine-readable
- [ ] Errors that *should* offer recovery candidates (failed fund resolution, unknown benchmark, invalid table) actually do
- [ ] No tool anywhere in the cycle returned a **silent empty success** on invalid input — a full list of any that did

**Evidence**
Error catalogue table: tool · input · error text · rating · machine-readable Y/N · defect key.

---

# AM-11 (KS-1080) — Verify authentication, TLS, transport and session behaviour

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-01 (KS-1070)

**Summary**
`Aloha MCP QA - Verify authentication, TLS, transport and session behaviour`

**Description**
As a QA engineer, I need authentication and transport behaviour confirmed, so that obvious exposure is ruled out before the team adopts the server more widely.

This is **not** a penetration test. It covers checks that cost minutes.

**Pre-cycle results — verify, then attach rather than re-deriving**

| Obs | Check | 2026-08-05 result |
|---|---|---|
| — | Unauthenticated `POST /aloha/mcp` | **401** + spec-compliant `WWW-Authenticate` ✅ |
| **O8** | Legacy `/aloha/sse` | **401, not 404** — route still live ⚠️ |
| **O9** | PKCE methods advertised | `S256` **and `plain`** ⚠️ |
| **O9** | Dynamic client registration | `/register` open, `token_endpoint_auth_methods_supported: ["none"]` ⚠️ |
| **O4** | Identity forwarding | `get_user_info` → no email despite valid OAuth ⚠️ |

**Acceptance criteria**
- [ ] Unauthenticated calls rejected with 401 and a correct `WWW-Authenticate` header
- [ ] **No** tool callable without authentication — spot-check at least 5 tools across different groups
- [ ] TLS 1.2+ negotiated; TLS 1.0/1.1 rejected
- [ ] No plaintext HTTP served
- [ ] Session survives client restart; expired or revoked session cannot call tools; re-auth works cleanly
- [ ] **O8 dispositioned** — is `/aloha/sse` decommissioned or intentionally retained? Confirm with the service owners (plan §9 Q7)
- [ ] **O9 dispositioned** — can PKCE `plain` be removed? Is open registration intentional and rate-limited? (plan **§9 Q10** — *corrected 2026-08-14: this line and the findings report both cited "§9 Q6", but Q6 is the duplicate-alias question. The plan had no O9 question at all until Q10 was added*)
- [ ] **O4 dispositioned** jointly with AM-08 (KS-1077) — is identity forwarding intended? (plan §9 Q3)
- [ ] Error bodies contain no stack traces, internal paths or secrets
- [ ] A burst of ~50 rapid calls produces a 429 or graceful backoff and **does not crash the service**

**Explicitly out of scope:** injection payloads, prompt-injection suites, chained exfiltration, cross-account probing. If any surfaces accidentally, stop and escalate per plan §8.

---

# AM-12 (KS-1081) — Verify payload limits and client compatibility

**Type:** Story · **Priority:** High · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-04 (KS-1073)

**Summary**
`Aloha MCP QA - Verify response payload limits and client compatibility`

**Description**
As a QA engineer, I need response sizes measured across the catalog, because an oversized response is functionally identical to a broken tool — the client cannot consume it, and to a user it looks like a hang.

**Background (O3):** `fund_analyzer` on one fund with **all optional slices disabled** returned 613,731 characters. Several other tools return **all funds** when their optional `fund_id` is omitted.

**Acceptance criteria**
- [ ] Response size measured for every tool on a typical call, recorded in bytes
- [ ] Tools exceeding **100 KB** on a typical call listed as a risk set
- [ ] The "returns everything when the optional filter is omitted" set measured: `get_fund_crbm`, `get_fee_model_defaults`, `get_liquidity_parameters`, `ir_model`, `get_top_funds_by_returns`, `get_bottom_funds_by_returns`
- [ ] Whether **any** server-side cap exists is stated definitively
- [ ] Behaviour compared across both clients — where does each break?
- [ ] Failure mode characterised: does an oversized response **error cleanly, truncate, or hang?** A hang is materially worse than an error and must be filed at higher severity
- [ ] At least **10 consecutive** large calls run; no indefinite hang observed
- [ ] Recommended safe-usage guidance drafted for the team (which slices to disable, which filters to always supply)

**Test steps**
1. For each tool, run a typical call and record exact byte size.
2. For the "returns everything" set, run with and without the optional filter; compare.
3. Repeat the largest calls on client 2.
4. Run 10 consecutive large calls; watch for hangs.

**Evidence**
Size table (tool · params · bytes · client · outcome), safe-usage guidance draft.

---

# AM-13 (KS-1082) — Assess agent usability and tool selection

**Type:** Story · **Priority:** Medium · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-02 (KS-1071)

**Summary**
`Aloha MCP QA - Assess whether an agent can select the right tool from the catalog`

**Description**
As a QA engineer, I need to know whether an LLM agent can navigate a **34-tool** catalog and reach a correct answer, because tool-surface usability is a functional property of an MCP server, not a cosmetic one.

**Acceptance criteria**
- [ ] Cold-start prompts run with **no tool hints**, recording tool calls made, whether the first choice was sensible, and whether the task completed:
  - *"Analyse the Citadel Kensington Global Strategies fund."*
  - *"What were the top 10 funds by return last year?"*
  - *"What is the liquidity cost of fund 500?"*
  - *"Which funds does Citadel Advisors manage?"*
- [ ] Number of tool calls to reach a correct answer recorded per prompt
- [ ] Every wrong-path selection recorded with the tool chosen and why it was plausible
- [ ] **Duplicate-alias impact assessed (O5):** does the agent ever pick between `search_funds` and `Search_Funds`, or between `rating_detail` and `get_rating_details`? Record any observed confusion
- [ ] Overlap between the four fund-search tools assessed — is it clear from the descriptions alone which to use?
- [ ] `fee_model`'s 15 required parameters assessed: can an agent assemble a valid call unaided, or does it need `get_fee_model_defaults` first with no hint that it should?
- [ ] Consolidation recommendation drafted: which tools could merge or be hidden, with reasoning

**Evidence**
Transcript per prompt, tool-call counts, consolidation recommendation.

**Note:** this story evaluates the **catalog**, not the agent. Run the same prompts on both clients to separate catalog problems from client-specific behaviour.

---

# AM-14 (KS-1083) — Triage findings and file defects

**Type:** Story · **Priority:** High · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-03 (KS-1072), AM-10 (KS-1079), AM-11 (KS-1080), AM-12 (KS-1081), AM-13 (KS-1082)

**Summary**
`Aloha MCP QA - Triage all findings and file severity-rated defects`

**Description**
As a QA Lead, I need every finding triaged, deduplicated and filed with a severity, so the service owners receive one coherent, prioritised defect list instead of scattered observations.

**Acceptance criteria**
- [ ] All findings across AM-03 (KS-1072)…AM-13 (KS-1082) collected into one triage sheet
- [ ] Duplicates merged; each finding traced to its originating story
- [ ] Severity assigned per plan §7.4 (S1–S4), with the rationale recorded
- [ ] Every S1 and S2 has a filed Jira bug, titled `[MCP-Aloha] Bug: <description>`, linked to the Epic
- [ ] S3 and S4 filed or explicitly deferred with a reason
- [ ] All ten pre-cycle observations O1–O10 dispositioned: **confirmed defect** / **by design** / **not reproducible**
- [ ] Every bug carries: reproduction steps, exact input, actual vs expected, client + version, redacted evidence
- [ ] Any S1 confirmed → escalated immediately per plan §8, not held for the verdict

**Triage sheet format**

| Finding | Source story | Severity | Type | Reproducible | Bug key | Disposition |
|---|---|---|---|---|---|---|

---

# AM-15 (KS-1084) — Assemble evidence pack and issue QA verdict

**Type:** Story · **Priority:** High · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-14 (KS-1083)

**Summary**
`Aloha MCP QA - Assemble the evidence pack and issue the QA verdict`

**Description**
As a QA Lead, I need a single consolidated verdict on the Aloha MCP server, so the team can make an informed adoption decision and the service owners have a clear remediation list.

**Acceptance criteria**
- [ ] One result document per story under `Aloha Server/Test Result/`
- [ ] Every log carries: test ID · UTC timestamp · tester · client + version · exact input · transcript · expected vs actual · Pass/Fail/Blocked
- [ ] All evidence **redacted** per plan §7.3
- [ ] Exit criteria in plan §11 confirmed line by line
- [ ] Verdict stated explicitly: **Pass** / **Pass with findings** / **Fail**
- [ ] Verdict rationale references specific evidence, not impressions
- [ ] Prioritised remediation list produced for the service owners, S1 first
- [ ] Safe-usage guidance from AM-12 (KS-1081) published for the team — what to avoid until fixes land
- [ ] Recommendation on whether a follow-up security cycle is warranted, with evidence
- [ ] Recommendation on whether the server is ready for wider team adoption
- [ ] Summary comment posted on the Epic; Epic transitioned

**Verdict guidance**

| Verdict | Condition |
|---|---|
| **Pass** | No S1 or S2 open; smoke pass rate ≥ 80%; auth clean |
| **Pass with findings** | Usable, but named S2/S3 defects remain open with tickets filed |
| **Fail** | Any **S1** confirmed, or a stop-and-escalate trigger fired, or smoke pass rate < 80% |

**A confirmed S1 on user scoping (O4 / AM-08 (KS-1077)) is an automatic Fail** regardless of every other result.

---

## Ticket conventions used above

| Convention | Rule |
|---|---|
| Story summary | `Aloha MCP QA - <action>` |
| Bug titles | `[MCP-Aloha] Bug: <description>` |
| Description | User-story form: *As a QA engineer, I need… so that…* |
| Acceptance criteria | Checkbox list, each item independently verifiable |
| Evidence | Named explicitly on every story |
| Traceability | Every story links to the Epic; every bug links to its originating story |
| Severity | S1–S4 per plan §7.4, assigned at triage in AM-14 (KS-1083) |
