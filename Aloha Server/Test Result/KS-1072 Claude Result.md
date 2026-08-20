# KS-1072 Claude Result — Verify fund search and resolution across the five search tools

> **Story:** [KS-1072](https://gendvn.atlassian.net/browse/KS-1072) · **Draft ID:** AM-03 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)
> **Priority:** Highest · **Blocked by:** KS-1071 (unblocked — see [KS-1071 Claude Result](KS-1071%20Claude%20Result.md))
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**
> **Tester:** Bình Hà Khoa via Claude Code (CLI v2.1.223, native HTTP transport)
> **Executed:** 2026-08-07, ~03:18 UTC
> **Status:** **PASS with one new finding** — Antigravity already posted a Jira **PASS** for this ticket (comment 2026-08-06T11:32Z). This run reproduces their core results and adds a **raw-error-leak defect** they didn't catch, plus a cleaner O6 repro.

---

## Verdict summary

| Area | Result | Notes |
|---|---|---|
| Exact-name resolution (`"Citadel Kensington Global Strategies"` → fund 500) | **P** | Matches Antigravity and Cursor exactly |
| Ambiguous query (`"Citadel Investment"` → 4 candidates) | **P** | 4/4 candidates match the plan's documented fixture set exactly: `986`, `4874`, `104766`, `200055`, all source `ALB` |
| Cross-tool consistency for the same term | **Partial** | Fund set identical across all 4 tools; **fund_id type diverges** — see O6 below |
| `search_funds` ≡ `Search_Funds` (O5) | **P** | Byte-for-byte identical output (ignoring timestamps) on both the exact-name and ambiguous fixtures |
| O6 (fund_id type inconsistency) | **P (settled, with cleaner evidence)** | Confirmed in a single session, same query, same moment: `Search_Funds`/`search_funds` return **string** `fund_id`s (`"986"`); `search_all_funds`/`search_albourne_funds` return **number** `fund_id`s (`986`) — reproducible on demand, not tied to a specific fund |
| Non-existent term (`99999999`) | **P** | Explicit error, not silent empty success |
| Empty string `""` | **P** | Explicit validation error `"search_text is required."` — does not fall back to returning everything |
| Whitespace-only (`"   "`) | **P** | Same validation error as empty string |
| Special characters (`!@#$%^&*()`) | **F — new finding** | See NEW-1 below |
| Very long input (500-char string) | **P** | Clean "no funds found" error, term echoed in full, no crash |
| `search_crbm_index` resolves a benchmark name | **P** | `"MSCI World"` → 14 rows with real `index_id` values (e.g. `NDDUWI Index.USD`) |

Result codes: `P` Pass · `F` Fail · `B` Blocked · `S` Skipped · `n/a`

---

## Tests

### T1 — Exact-name query across search tools

| Tool | `fund_id` | type | `source` |
|---|---|---|---|
| `Search_Funds` | `"500"` | string | `solovis` |
| `search_funds` | `"500"` | string | `solovis` |
| `search_all_funds` | `"500"` | string | `solovis` |
| `search_albourne_funds` | — | n/a | **error**: `"No Albourne funds found matching 'Citadel Kensington Global Strategies' in Elasticsearch."` |

`search_albourne_funds` erroring is **correct behaviour**, not a defect — fund 500 lives in the `solovis` index, not `ALB`, and the tool is scoped to the Albourne index only. Matches Antigravity's finding for the same case.

### T2 — Ambiguous query `"Citadel Investment"` (O1 fixture, cross-tool)

All four tools returned the same 4 funds, all sourced `ALB`:

| fund_id | fund_name | manager |
|---|---|---|
| 986 | ANTAEUS INTERNATIONAL INVESTMENTS, LTD. | Citadel Advisors LLC |
| 4874 | Citadel Jackson Investment Fund Ltd | Citadel Advisors LLC |
| 104766 | Citadel Capital Joint Investment Fund | Qalaa Holdings |
| 200055 | Citadel East Africa Co - Investment Fund | Qalaa Holdings |

This matches the plan's documented fixture (plan §4: "Ambiguous query... returns 4 ALB candidates, none of them 500") exactly.

**O6 — settled with a clean, repeatable fixture:**

| Tool | `fund_id` for "986" | JSON type |
|---|---|---|
| `Search_Funds` | `"986"` | **string** |
| `search_funds` | `"986"` | **string** |
| `search_all_funds` | `986` | **number** |
| `search_albourne_funds` | `986` | **number** |

The type split is consistent and tool-specific (not fund-specific): the two "simple" search tools always quote `fund_id`; the two "full-record" search tools never do. Previously O6 was only documented from a single fund-4874 data point on 2026-08-05; this run confirms it's a structural property of the tool pair, reproducible with any fund on demand.

### T3 — `search_funds` vs `Search_Funds` byte diff (O5)

Called both with `search_term="Citadel Investment"`. Output identical field-for-field (same 4 funds, same order, same string-typed `fund_id`s) except the two `timestamp` fields. Confirms the two are a pure alias pair.

### T4–T6 — Negative inputs

| Input | Result |
|---|---|
| `"99999999"` | `{"status":"error","error":"No funds found matching '99999999' in Elasticsearch indexes."}` — **P** |
| `""` | `{"status":"error","error":"search_text is required."}` — **P** |
| `"   "` (whitespace) | `{"status":"error","error":"search_text is required."}` — **P** |
| 500×`"A"` | `{"status":"error","error":"No funds found matching '<500 A's>' in Elasticsearch indexes."}` — full term echoed back, no truncation, no crash — **P** |

### T7 — Special characters (`!@#$%^&*()`) — **new finding**

```
{"status":"error","error":"Index alb_funds skipped: HTTP 400 {\"error\":{\"root_cause\":[{\"type\":\"query_shard_exception\",\"reason\":\"Failed to parse query [!@#$%^&*()*]\",\"index_uuid\":\"8aHK5R-gQYyYkayNLb0POw\",\"index\":\"alb_funds_20260806-081544\"}], ... \"node\":\"vK6DemWzS3q51Fa-9oUwPg\" ...}"}
```

The call does **not** crash the HTTP endpoint (Antigravity's Jira comment is right about that much), but it returns a **raw Elasticsearch error body** verbatim, including:
- an internal **index UUID** (`8aHK5R-gQYyYkayNLb0POw`)
- an internal **node ID** (`vK6DemWzS3q51Fa-9oUwPg`)
- the **dated internal index name** (`alb_funds_20260806-081544`) — this also reveals the ALB index is rebuilt/snapshotted daily, which is an architecture detail not intended for API consumers

This is not an S1 (no hostnames, credentials, or connection strings — the plan §8 stop-and-escalate bar is not met), but it directly fails the KS-1072 acceptance criterion **"Special characters... handled without a raw server error"** as written. See Findings.

### T8 — `search_crbm_index("MSCI World")`

Resolved 14 rows from `ks_model.benchmark_model`, each with a usable Bloomberg-style `index_id` (e.g. `NDDUWI Index.USD`, `M1WO000G Index.USD`). Confirms the tool works as documented — feed the `index_id` into `get_benchmark_history.benchmark_ids`. Independently reproduces Antigravity's `"S&P 500"` → 16-row result with a different benchmark name.

---

## Findings

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **NEW-1** | Special-character search input (`!@#$%^&*()`) returns a **raw Elasticsearch `query_shard_exception`** body, leaking an index UUID, a node ID, and the dated internal index name. Antigravity's KS-1072 comment describes this as acceptable ("catches the exception, doesn't crash the endpoint") and still marked the ticket a full PASS, but the literal AC text requires it be "handled **without** a raw server error" — this is a raw server error, just a non-fatal one. | **S3 Medium** (info disclosure of internal architecture, not credentials/secrets; error-quality issue) | AM-10 (error quality catalogue); worth a one-line fix to catch `query_shard_exception` and return a clean "invalid search characters" message |
| O5 | `search_funds` ≡ `Search_Funds`, confirmed byte-identical | Medium | AM-13 / triage |
| O6 | `fund_id` type differs by **tool**, not by fund: `Search_Funds`/`search_funds` always return string; `search_all_funds`/`search_albourne_funds` always return number | Low | AM-13 — worth standardizing on one type across the catalog so an agent doesn't need per-tool type-coercion logic |

---

## Comparison with Antigravity's Jira result (comment 2026-08-06T11:32Z)

| Check | Antigravity | Claude Code (this run) |
|---|---|---|
| Exact-name resolution | Tested, matches | Tested, matches |
| Ambiguous query on search tools directly | **Not tested** (they tested ambiguity indirectly via `fund_analyzer` in KS-1073, not via the KS-1072 search tools) | Tested directly on all 4 tools — see T2 |
| O5 (duplicate settlement) | Asserted "same schema and processing," no diff shown | Byte-diffed directly — see T3 |
| O6 (type check) | Tested only with fund 500, both tools returned `"500"` (string) — **no divergence observed**, because 500 happens to come from `solovis` where both tools may format consistently | Tested with the `ALB`-sourced ambiguous set, where the divergence is visible — see T2 |
| Special characters | Tested, called it a pass | Tested, found a raw-error leak — see NEW-1 |
| Empty string `""` | Not explicitly tested (only whitespace) | Tested — see T4–T6 |

**Recommendation:** KS-1072 can stay **PASS** overall (no S1/S2, and 34/34 read-only conclusion holds), but NEW-1 should be logged as an S3 defect before the ticket is considered fully closed, since the current Jira PASS comment doesn't reflect it.
