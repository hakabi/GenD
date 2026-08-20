# US-A3 Result — Regression of the four KS-1047 defects

> **Story:** US-A3 · **Parent:** KS-1062 · **Priority:** Highest
> **Executed:** 2026-08-05 10:50–10:51 UTC
> **Tester:** Bi Haka (hakabi)
> **Client:** Claude Code v2.1.222 (desktop app), native `type: http` transport — **no `mcp-remote` proxy**
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · **Server build:** `0.9.5`
> **Fixtures:** fund 500 (positive), `"Citadel Investment"` (mis-resolving), fund 986 ANTAEUS (wrong match) — all verbatim from KS-1047
> **Single-client caveat:** all results below are from **one** client. US-A3 requires D2 to be tested on two clients; the second client (Antigravity) has **not** been run.

---

## Verdict summary

| Defect | June 2026 status | 2026-08-05 verdict |
|---|---|---|
| **D1** — wrong fund resolution | Open | ❌ **STILL OPEN** — same mechanism, different victim fund |
| **D2** — client appears frozen | Transport changed, unverified | ⚠️ **NOT REPRODUCED as a hang** — but a likely root cause was found |
| **D3** — tool catalog too large | Open | ❌ **STILL OPEN — WORSE** (28 → 34 tools) |
| **D4** — errors not LLM-oriented | Open | ✅ **LARGELY FIXED** — one format defect remains |

**Deployment confirmed live:** `health_check` reports uptime 1,045,742 s ≈ **12.1 days**, placing service start at ~2026-07-24 08:21 UTC — consistent with the 2026-07-23 deployment in KS-1062.

---

## D1 — Wrong fund resolution ❌ STILL OPEN

**Test 1 — candidate search.** `Search_Funds(search_term="Citadel Investment")` returned 4 matches, all source `ALB`:

| Rank | fund_id | fund_name | manager |
|---|---|---|---|
| 1 | 4874 | Citadel Jackson Investment Fund Ltd | Citadel Advisors LLC |
| **2** | **986** | **ANTAEUS INTERNATIONAL INVESTMENTS, LTD.** | Citadel Advisors LLC |
| 3 | 104766 | Citadel Capital Joint Investment Fund | Qalaa Holdings |
| 4 | 200055 | Citadel East Africa Co - Investment Fund | Qalaa Holdings |

Fund **986 is still returned, still ranked #2**. Fund **500 does not appear at all** — its name contains no "Investment" token, and Solovis records are evidently not matched on manager the way ALB records are (986 matched via manager `Citadel Advisors LLC`, not on its own name).

Fund 500 *is* reachable — `Search_Funds("Citadel Kensington Global Strategies")` returns exactly one result, `500`, source `solovis`. So the index is fine; the query behaviour is the problem.

**Test 2 — the actual repro.** `fund_analyzer(search_term="Citadel Investment", start_date=2025-08-01, end_date=2026-06-30)`:

```
"status": "error",
"error": "No Solovis fund details for resolved fund_id='4874'.
  Resolution: {'search_matches': [...4 candidates...],
               'method': 'elasticsearch',
               'resolved_fund_name': 'Citadel Jackson Investment Fund Ltd',
               'resolved_source': 'ALB'}"
```

**The defect is unchanged.** `fund_analyzer` still silently takes the **top Elasticsearch hit** and proceeds without disambiguation. It resolved to an ALB fund with no Solovis data, and failed — the exact failure shape quan documented in June.

The only thing that changed is *which* wrong fund it picks: **986 → 4874**. The acceptance criterion "server does not silently resolve to fund 986" passes on a technicality while the defect it was written to catch is fully intact.

**Acceptance criteria:**
- [x] Verbatim prompt executed
- [x] Does not resolve to 986 — *passes literally, but see above*
- [ ] ❌ Resolves correctly to 500 **or** returns a disambiguation list — **FAIL**: it silently picked one candidate and errored
- [x] `fund_id: "500"` succeeds (see D2 section); `search_term: "Citadel Kensington Global Strategies"` resolves to 500

---

## D2 — Client freeze ⚠️ NOT REPRODUCED — root cause identified

No hang occurred. All 8 calls in this session returned in roughly 0.3–3 s. Native HTTP transport was used, so the SSE path implicated in KS-1047 was never exercised.

**However — a strong candidate root cause was found.**

`fund_analyzer(fund_id="500", …)` with **all seven optional slices explicitly set to `false`** returned:

> **613,731 characters across 19,713 lines** — exceeding this client's limit; the harness spilled it to a file rather than rendering it.

That is the *minimum* possible response from this tool. Its defaults are `include_* = true` for all eight slices, so **a default `fund_analyzer` call returns substantially more than 613 KB.**

### Root cause: `start_date` is ignored for payload scoping

The call requested `start_date: 2025-08-01`. Date values found in the returned payload:

| Measure | Value |
|---|---|
| Earliest `Date` in payload | **1995-07-31** |
| Latest `Date` in payload | 2026-06-30 |
| `Date` values **before** requested `start_date` | **3,194 of 3,293** |
| `Date` values **after** requested `end_date` | 0 |

`end_date` is honoured. **`start_date` is not** — the tool returns ~31 years of history regardless. Note that `start_date` is `fund_analyzer`'s *only required parameter*.

Metrics are windowed correctly (the payload's own trailer reads `"source": "default_last_1_year"`, `"first_included_month_end": "2025-07-31"`), so the computation respects the period — only the **raw series it ships back** does not.

This is a complete and sufficient explanation for D2's signature: the server finishes the work, then emits a payload large enough that the client cannot render it. Under SSE with defaults on, that reads to a user as a frozen client.

**Acceptance criteria:**
- [x] `fund_analyzer` on fund 500 returns within a documented time — yes, ~3 s server-side
- [ ] ❌ Result reaches the client — **FAIL**: exceeded client limits even with all slices disabled
- [ ] ⬜ Tested on both clients — **NOT DONE**, single client only
- [x] Long-running/large call never hangs indefinitely — it errored cleanly rather than hanging
- [ ] ⬜ Minimum 10 calls — only 8 executed

**D2 cannot be closed from this run.** Re-test on Antigravity, and with default slices, before issuing a verdict.

---

## D3 — Tool catalog too large ❌ STILL OPEN, WORSE

Full detail in [`baseline/aloha-tool-inventory-2026-08-05.md`](../baseline/aloha-tool-inventory-2026-08-05.md).

**34 tools** against quan's June baseline of ~28 — the catalog **grew by six**.

Three pairs are self-declared duplicates, and one pair was confirmed byte-identical in this run: `Search_Funds` and `search_funds` returned the same 4-fund payload differing only in timestamp. They differ **only by capitalisation** of the tool name.

| Duplicate | Evidence |
|---|---|
| `search_funds` ≡ `Search_Funds` | Description: *"Alias for Search_Funds"*; identical output confirmed live |
| `rating_detail` ≡ `get_rating_details` | Description: *"Same as get_rating_details"* |
| `rating_summary` ≡ `get_rating_summary` | Description: *"Same as get_rating_summary"* |

Plus four overlapping fund-search entry points (`Search_Funds`, `search_funds`, `search_all_funds`, `search_albourne_funds`).

A dedicated fund-search tool **does** now exist — that half of quan's June complaint is addressed. But it arrived as four near-identical tools rather than one.

---

## D4 — Error quality ✅ LARGELY FIXED

This is the clear improvement in the build.

**Invalid search.** `Search_Funds(search_term="99999999")`:

```json
{ "status": "error",
  "error": "No funds found matching '99999999' in Elasticsearch indexes." }
```

Explicit error — **not** a silent empty success. That avoids the repeated Dynamo failure pattern (KS-1029/1030/1031/1041).

**Failed resolution.** The D1 error above now carries the full candidate list, the resolution `method`, and both `resolved_fund_name` and `resolved_source`. An agent receiving it has everything needed to retry with a specific `fund_id`. Compare KS-1047's complaint: *"terse 'record not found' with no resolution candidates, no suggested fund_id, no next step."* That is resolved.

No stack traces, no SQL, no internal paths, no connection strings appeared in any error.

**One defect remains.** The resolution detail is a **Python `dict` repr embedded inside the `error` string** — note the single quotes: `{'search_matches': [...], 'method': 'elasticsearch'}`. It is not JSON and not a structured field. An agent must parse Python-repr out of free text to use it. The *content* is right; the *format* is not machine-readable.

**Acceptance criteria:**
- [x] Invalid input returns a structured, actionable error
- [x] Error includes resolution candidates and a next step
- [x] No raw SQL, stack traces, internal paths or connection strings
- [ ] ⚠️ Machine-readable — **partial**: Python-repr inside a string, not JSON

---

## New defects found (not in KS-1047)

| ID | Finding | Severity |
|---|---|---|
| **N1** | `fund_analyzer` ignores `start_date` when scoping returned time series — ships full history from 1995 (3,194 of 3,293 dates fall outside the requested window). Its only required parameter has no effect on payload size | **High** |
| **N2** | `fund_analyzer` returns 613 KB with **all** optional slices disabled — no server-side cap. Defaults are all-on, so typical calls are far larger | **High** |
| **N3** | `get_user_info` returns `"No user email found in request headers"` **despite a completed OAuth session**. User identity is not forwarded to the service. Consequence: the user-scoped rating tools (`get_rating_details`, `rating_detail`, `list_rating_details_by_user`) fall back to `MCP_DEFAULT_USER_EMAIL` — a single shared identity for every authenticated caller | **High** |
| **N4** | `fund_id` type is inconsistent across tools: `Search_Funds` returns `"4874"` (string), `search_all_funds` returns `4874` (number) for the same logical field | Medium |

**N3 is the one to escalate first.** It is live confirmation of finding F4 from the inventory, and it means "user-scoped" rating data is not scoped to the calling user at all. This was **not** probed further — testing whether one user can read another's ratings is authorisation testing, explicitly deferred in plan §2.1. Raise it with quan and Kathleen Bui as a design question rather than testing it.

---

## Calls executed (8 total)

| # | Tool | Input | Outcome |
|---|---|---|---|
| 1 | `health_check` | — | success, uptime 12.1 d |
| 2 | `get_user_info` | — | error — no email in headers (**N3**) |
| 3 | `Search_Funds` | `"Citadel Investment"` | 4 matches, 986 present, 500 absent |
| 4 | `search_all_funds` | `"Citadel Investment"` | same 4, all ALB (**N4**) |
| 5 | `search_funds` | `"Citadel Investment"` | identical to #3 (**D3**) |
| 6 | `Search_Funds` | `"Citadel Kensington Global Strategies"` | 1 match → 500, solovis |
| 7 | `fund_analyzer` | `search_term="Citadel Investment"`, slices off | error → resolved 4874 (**D1**) |
| 8 | `fund_analyzer` | `fund_id=500`, slices off | 613 KB overflow (**D2 / N1 / N2**) |

All 8 read-only. No write-capable tool exists in the catalog (see inventory §3). No mutation attempted.

---

## Recommended Jira bugs

| Title | Links to |
|---|---|
| `[MCP-Aloha] Bug: fund_analyzer silently resolves ambiguous search_term to top Elasticsearch hit` | D1, KS-1062 |
| `[MCP-Aloha] Bug: fund_analyzer ignores start_date when scoping returned time series` | N1, KS-1062 |
| `[MCP-Aloha] Bug: fund_analyzer response exceeds client limits with all slices disabled` | N2, D2, KS-1062 |
| `[MCP-Aloha] Bug: user identity not forwarded to service; user-scoped rating tools fall back to shared default account` | N3, KS-1062 |
| `[MCP-Aloha] Bug: tool catalog grew to 34 with three self-declared duplicate aliases` | D3, KS-1062 |
| `[MCP-Aloha] Bug: fund resolution detail returned as Python dict repr inside error string` | D4, KS-1062 |
| `[MCP-Aloha] Bug: fund_id returned as string by Search_Funds and number by search_all_funds` | N4, KS-1062 |

---

## Outstanding before US-A3 can be signed off

1. Re-run D2 on a **second client** (Antigravity) — required by the story
2. Re-run `fund_analyzer` with **default slices** to size the true worst case
3. Complete the **10-call minimum** for D2
4. Q1 (Dev vs Prod endpoint) is **still unanswered** — every result above is from Production
