# Claude Code Session Handoff — Aloha MCP QA Verification Cycle

> **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066) — Aloha MCP QA verification cycle for the Streamable HTTP endpoint
> **Session tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport, server id `conceptia-aloha`)
> **Session dates:** 2026-08-07 through 2026-08-10
> **Purpose of this file:** so the next session (human or agent) can pick up exactly where this one stopped, without re-deriving context.

---

## 1. What's done vs. what's left

| Draft ID | Jira Key | Story | Status this session |
|---|---|---|---|
| AM-01 | [KS-1070](https://gendvn.atlassian.net/browse/KS-1070) | Client setup & OAuth | ✅ Tested — [result](KS-1070%20Claude%20Result.md) |
| AM-02 | [KS-1071](https://gendvn.atlassian.net/browse/KS-1071) | Tool inventory & catalog audit | ✅ Tested — [result](KS-1071%20Claude%20Result.md) |
| AM-03 | [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) | Fund search & resolution | ✅ Tested — [result](KS-1072%20Claude%20Result.md) |
| AM-04 | [KS-1073](https://gendvn.atlassian.net/browse/KS-1073) | `fund_analyzer` deep dive | ✅ Tested — [result](KS-1073%20Claude%20Result.md) |
| AM-05 | [KS-1074](https://gendvn.atlassian.net/browse/KS-1074) | Returns & performance tools | ✅ Tested — [result](KS-1074%20Claude%20Result.md) |
| AM-06 | [KS-1075](https://gendvn.atlassian.net/browse/KS-1075) | Benchmark & CRBM tools | ✅ Tested — [result](KS-1075%20Claude%20Result.md) |
| AM-07 | [KS-1076](https://gendvn.atlassian.net/browse/KS-1076) | Fee, IR & liquidity tools | ✅ Tested — [result](KS-1076%20Claude%20Result.md) |
| AM-08 | [KS-1077](https://gendvn.atlassian.net/browse/KS-1077) | Ratings & user-scoping | ✅ Tested — [result](KS-1077%20Claude%20Result.md) — **read §3 below first** |
| AM-09 | [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) | Datalake introspection | ✅ Tested — [result](KS-1078%20Claude%20Result.md) |
| AM-10 | [KS-1079](https://gendvn.atlassian.net/browse/KS-1079) | Error quality catalogue | ✅ Tested (consolidation only) — [result](KS-1079%20Claude%20Result.md) |
| AM-11 | [KS-1080](https://gendvn.atlassian.net/browse/KS-1080) | Auth/TLS/transport/session | ✅ Tested — [result](KS-1080%20Claude%20Result.md) |
| AM-12 | [KS-1081](https://gendvn.atlassian.net/browse/KS-1081) | Payload limits | ✅ Tested — [result](KS-1081%20Claude%20Result.md) |
| AM-13 | [KS-1082](https://gendvn.atlassian.net/browse/KS-1082) | Agent usability | ✅ Tested — [result](KS-1082%20Claude%20Result.md) |
| AM-14 | [KS-1083](https://gendvn.atlassian.net/browse/KS-1083) | Triage & file defects | ❌ **Not started** — see §4 |
| AM-15 | [KS-1084](https://gendvn.atlassian.net/browse/KS-1084) | Evidence pack & verdict | ❌ **Not started** — blocked on AM-14 |

**13 of 15 stories tested this session.** AM-14 and AM-15 are QA-Lead synthesis work over everything already gathered (my results + Cursor's + Antigravity's) — they don't need new live tool calls, just judgment and writing.

---

## 2. The single most important open decision for whoever does AM-14/AM-15

The plan's exit criteria (`aloha_mcp_uat_plan.md` §11.1) state: **"A confirmed S1 on user scoping (O4) is an automatic Fail regardless of every other result."**

O4 (`get_user_info` never receives an identity, despite completed OAuth) is confirmed — for the **fourth** time, across Cursor, Antigravity, and Claude Code. But in [KS-1077 Claude Result.md](KS-1077%20Claude%20Result.md) I found the *consequence* is different from what the plan feared: `list_rating_details_by_user` **fails closed** (explicit "no identity" message, empty list) rather than serving one shared account's data to everyone. I classified this as **S2 (broken feature)**, not automatic S1 (data exposure), because no actual cross-user data was ever returned to anyone — but I explicitly flagged this as **my own judgment call, not a final answer**, since the S1/S2 distinction here determines the entire cycle's verdict.

**Whoever picks up AM-14 needs to explicitly confirm or overturn this classification before writing the verdict in AM-15.** Don't let it default to either answer by inertia — read KS-1077's "Why I did not fire a stop-and-escalate" section and make the call deliberately.

---

## 3. Cross-cutting patterns — don't triage these as N separate bugs

Four defect patterns recurred across multiple, unrelated tools this session. Each is one underlying root cause wearing different tool names — AM-14 should file each as **one** defect with multiple occurrences listed as evidence, not as separate tickets:

| Pattern | Occurrences | Root-cause hypothesis |
|---|---|---|
| **Silent empty success** on invalid/mismatched input (`status: success`, 0 rows, no error) | `get_fund_returns` (invalid fund_id, KS-1074), `get_benchmark_history` (name instead of bbg_id, KS-1075) | Shared `DatalakeApi` query helper doesn't distinguish "not found" from "legitimately zero rows" |
| **Misleading generic error** on inverted date ranges ("no data found" instead of "dates are backwards") | `calculate_annualized_returns`, `calculate_drawdown` (KS-1074), `calculate_crbm_returns` (KS-1075) | Same class of query-helper issue as above — only `get_fund_returns` has real Pydantic validation for this |
| **Raw internal error leaked to client** | `list_tables` raw Python `TypeError` (KS-1078), `describe_table` full Trino/Java stack trace revealing MongoDB backend (KS-1078, **the worst single finding this session**), `smpublic_main_v3` raw Flask error (KS-1078), `Search_Funds` raw Elasticsearch exception on special chars (KS-1072) | No centralized exception handler wrapping tool logic before it reaches the MCP response |
| **No response-size cap** | `fund_analyzer` (585K–638K chars, KS-1073), `get_fund_crbm` (370K, KS-1075), `get_fee_model_defaults` (555K, KS-1081), `get_data` on wide tables (2.28M — the largest payload measured all session, KS-1078/1081), `ir_model`, `get_liquidity_parameters` | These tools have no size/row ceiling at all; only `get_data`/`query_fund_manager` have a 1000-row cap, and even that cap's `truncated` signal is broken (never fires `true`, KS-1078 NEW-17) |

Also worth carrying into AM-14 as its own line: **O7 (Python dict-repr in error text) is confirmed but isolated to `fund_analyzer`** — checked all ~22 other catalogued errors, the pattern doesn't appear elsewhere.

---

## 4. What AM-14 (KS-1083) and AM-15 (KS-1084) actually need

Neither needs new tool calls. AM-14 needs:
- Pull every finding out of the 13 Claude result files above (each has a "Findings" table) plus Cursor's and Antigravity's Jira comments on KS-1070–1074.
- Merge duplicates using §3's cross-cutting patterns.
- Assign S1–S4 severities per plan §7.4 — I did **not** assign final severities in every file; I gave my own read (e.g. "S2 High") but AM-14 owns the authoritative severity call.
- Resolve the discrepancies I flagged against Antigravity's self-reported PASSes — notably **KS-1074 (I found it should be FAIL, not the 100% PASS Antigravity posted)** and **KS-1070 (Antigravity used `mcp-remote`, not native HTTP, contradicting AC1)**.
- File S1/S2 bugs per the `[MCP-Aloha] Bug: <description>` convention.

AM-15 needs the §2 decision made first, then: pull safe-usage guidance from [KS-1081](KS-1081%20Claude%20Result.md), state the verdict (Pass / Pass with findings / Fail) with evidence citations, and post the summary comment on [KS-1066](https://gendvn.atlassian.net/browse/KS-1066).

**My honest read, not a substitute for AM-14's own analysis:** given confirmed FAILs on KS-1073, KS-1074, KS-1078, and KS-1079 (each below the 80% bar or with an S2), the cycle is very unlikely to land on plain "Pass." The real question AM-15 has to answer is Pass-with-findings vs. Fail, which hinges entirely on the §2 O4 classification.

---

## 5. Tester coverage per ticket (who tested what)

| Ticket | Cursor | Antigravity | Claude Code (this session) |
|---|---|---|---|
| KS-1070 | Partial (1 client only) | Yes (PASS, but see transport concern) | Yes |
| KS-1071 | Yes (34-tool baseline) | Yes (PASS) | Yes — schema-diffed identical to Cursor's baseline |
| KS-1072 | — | Yes (PASS) | Yes — found 1 defect Antigravity missed |
| KS-1073 | — | Yes (FAIL, confirmed O1/O2/O3) | Yes — confirmed + 2 new defects |
| KS-1074 | — | Yes (100% PASS claimed) | Yes — **overturns** Antigravity's PASS |
| KS-1075 | — | — | Yes — **first tester** |
| KS-1076 | — | — | Yes — **first tester** |
| KS-1077 | — | — | Yes — **first tester**, highest-risk story |
| KS-1078 | — | — | Yes — **first tester** |
| KS-1079 | — | — | Yes — **first tester**, consolidation |
| KS-1080 | — | — | Yes — **first tester** |
| KS-1081 | — | — | Yes — **first tester** |
| KS-1082 | — | — | Yes — **first tester**, self-assessed with disclosed limitation |

Every "first tester" ticket (KS-1075–1082, 8 of 15) has never had a second-client run at all — plan §11 exit criterion 1 ("≥2 MCP clients") is not met for those, strictly speaking. Worth a call on whether that's acceptable to close AM-14/15 or needs a second pass first.

---

## 6. Operational gotchas for the next session

- **`conceptia-aloha`'s OAuth token expires mid-session** — happened twice this session (once between KS-1076 and KS-1077's start, once mid-KS-1081). Symptom: `MCP server "conceptia-aloha" requires re-authorization (token expired)`. Fix: ask the user to run `claude` in an interactive terminal → `/mcp` → `conceptia-aloha` → Authenticate, then retry. This is itself indirect evidence for KS-1070/1080's "session persistence" open question — session lifetime is shorter than a multi-day testing cycle.
- **Large tool responses auto-offload to disk.** When a tool result exceeds the harness's token limit, it's saved to `tool-results/*.txt` and only a pointer + size comes back into context. This is what made KS-1073/1078/1081's multi-hundred-KB and multi-MB payload testing safe to do live — use `Bash`/`grep`/`wc` on the saved file rather than trying to read it back in full.
- **`atlassian-rovo` (Jira access) also disconnects and reconnects periodically**, independent of `conceptia-aloha`. If `getJiraIssue`/`editJiraIssue` calls fail with "no such tool," a `ToolSearch` for `select:mcp__atlassian-rovo__<toolname>` usually finds it again without needing user action.
- **Fund 500** (Citadel Kensington Global Strategies Fund Ltd., source `solovis`) is the standing test fixture used throughout — matches the plan's own fixture list (`aloha_mcp_uat_plan.md` §4).

---

## 7. Non-testing work also done this session

- **`aloha_mcp_uat_tickets.md`** (`Aloha Server/Test Guide/`) updated with a full Draft-ID ↔ Jira-key mapping table, and every `AM-XX` cross-reference throughout the file annotated with its real `KS-XXXX` key.
- **8 live Jira ticket descriptions** (KS-1070, 1071, 1075, 1076, 1079, 1080, 1083, 1084) had stale placeholder links like `[AM-12](.../browse/AM-12)` — pasted verbatim from the original draft file, pointing at a non-existent/wrong issue — corrected to point at the real tickets (e.g. `[KS-1081](.../browse/KS-1081)`). Confirmed via the update responses that all 8 now resolve correctly.

---

## 8. File index

All paths relative to `Aloha Server/`:

- `Test Guide/aloha_mcp_uat_plan.md` — the QA plan (scope, fixtures, severity rubric, exit criteria)
- `Test Guide/aloha_mcp_uat_tickets.md` — ticket drafts, now mapped to real Jira keys
- `baseline/aloha-tool-inventory-2026-08-05.md`, `baseline/aloha-tool-inventory-2026-08-06.md` — prior tool catalog snapshots (Claude Code and Cursor respectively)
- `Test Result/KS-1070 Cursor Result.md`, `KS-1071 Cursor Result.md` — Cursor's original results
- `Test Result/KS-1070 through KS-1082 Claude Result.md` (13 files) — this session's results
- `Test Result/Claude Session Handoff.md` — this file
