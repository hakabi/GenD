# Jira Ticket Drafts — Aloha MCP QA Verification Cycle

> **Status:** DRAFT — **nothing has been created in Jira**
> **Version:** 2.0 · **Prepared:** 2026-08-05
> **Companion:** `aloha_mcp_uat_plan.md`
> **Structure:** 1 Epic + 15 Stories. Fresh tree — not linked to any prior ticket.
> **Suggested labels:** `aloha-mcp`, `qa`, `verification-2026-08`
> **Blocked by:** plan §9 Q1 and Q2 must be answered before AM-01 starts

---

## How to create this in Jira

1. Create the **Epic** (§ Epic below).
2. Create all 15 stories as children of that Epic.
3. Link dependencies with **"is blocked by"** per the table in §Dependency links.
4. Apply labels to every issue.
5. Replace the draft IDs `AM-01`…`AM-15` in the Test Result folder with the real Jira keys once assigned.

### Definition of Done — applies to every story

Checklist executed · evidence stored under `Aloha Server/Test Result/` · all evidence redacted per plan §7.3 · result peer-reviewed by one other QA · every failure has a linked defect with a severity · sign-off recorded in the QA tracker.

### Dependency links

| Story | is blocked by |
|---|---|
| AM-02 | AM-01 |
| AM-03 | AM-02 |
| AM-04 | AM-03 |
| AM-05 | AM-02 |
| AM-06 | AM-02 |
| AM-07 | AM-02 |
| AM-08 | AM-02 |
| AM-09 | AM-02 |
| AM-10 | AM-05, AM-06, AM-07, AM-08, AM-09 |
| AM-11 | AM-01 |
| AM-12 | AM-04 |
| AM-13 | AM-02 |
| AM-14 | AM-03, AM-10, AM-11, AM-12, AM-13 |
| AM-15 | AM-14 |

---

# EPIC — Aloha MCP QA Verification Cycle

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

# AM-01 — Set up MCP clients and complete OAuth

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

**Note:** use different QA accounts on the two clients where possible — AM-08 needs two distinct identities.

---

# AM-02 — Capture tool inventory and audit catalog quality

**Type:** Story · **Priority:** Highest · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-01

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
- [ ] Tools with **no required parameters** that can return all funds listed separately — these feed AM-12

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

# AM-03 — Verify fund search and resolution correctness

**Type:** Story · **Priority:** Highest · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-02

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

# AM-04 — Verify `fund_analyzer` parameter handling and payload scoping

**Type:** Story · **Priority:** Highest · **Owner:** QA-B · **Est:** 1.5 d · **Blocked by:** AM-03

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

# AM-05 — Smoke-test returns and performance tools

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-02

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

# AM-06 — Smoke-test benchmark and CRBM tools

**Type:** Story · **Priority:** Medium · **Owner:** QA-C · **Est:** 0.5 d · **Blocked by:** AM-02

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
- [ ] ⚠️ `get_fund_crbm` **with `fund_id` omitted** — documented as returning **all funds**. Record the response size. If unbounded, file a defect and feed it to AM-12
- [ ] `calculate_crbm_returns` happy path plus inverted date range
- [ ] Date ranges honoured in returned series — same check as AM-04/O2
- [ ] Pass rate ≥ 80%

**Test steps**
1. Resolve a benchmark name → `bbg_id`.
2. Happy path on all three tools.
3. Omit `fund_id` on `get_fund_crbm`; measure the response.
4. Negative inputs: unknown `bbg_id`, name-instead-of-id, inverted dates.

---

# AM-07 — Smoke-test fee, IR and liquidity model tools

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-02

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
- [ ] ⚠️ `ir_model` **with `fund_ids` omitted** — documented as returning **all public-sleeve funds**. Record response size; feed to AM-12
- [ ] `calculate_liquidity_cost` happy path plus invalid fund
- [ ] ⚠️ `get_liquidity_parameters` with `fund_id` omitted — documented as returning **all funds**. Record size
- [ ] `query_fund_manager` respects its column allowlist; requesting a non-allowlisted column returns a clear error, not a raw DB error
- [ ] `query_fund_manager` respects its documented 64-column / 1000-row caps
- [ ] Numeric parameters reject string input, or coerce it in a documented way
- [ ] Pass rate ≥ 80%

---

# AM-08 — Verify ratings tools and user-scoping behaviour

**Type:** Story · **Priority:** **Highest** · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-02

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

# AM-09 — Verify datalake introspection tools

**Type:** Story · **Priority:** High · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-02

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

# AM-10 — Verify error quality and LLM-oriented failure handling

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-05, AM-06, AM-07, AM-08, AM-09

**Summary**
`Aloha MCP QA - Verify that errors are structured, actionable and agent-consumable`

**Description**
As a QA engineer, I need every failure mode assessed for whether an **agent** can act on it, since this server is consumed by LLM clients rather than humans. A technically-correct error that an agent cannot parse still blocks the workflow.

This story consolidates the error observations from AM-05 through AM-09 rather than generating new traffic.

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

# AM-11 — Verify authentication, transport and session behaviour

**Type:** Story · **Priority:** High · **Owner:** QA-C · **Est:** 1 d · **Blocked by:** AM-01

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
- [ ] **O9 dispositioned** — can PKCE `plain` be removed? Is open registration intentional and rate-limited? (plan §9 Q6)
- [ ] **O4 dispositioned** jointly with AM-08 — is identity forwarding intended? (plan §9 Q3)
- [ ] Error bodies contain no stack traces, internal paths or secrets
- [ ] A burst of ~50 rapid calls produces a 429 or graceful backoff and **does not crash the service**

**Explicitly out of scope:** injection payloads, prompt-injection suites, chained exfiltration, cross-account probing. If any surfaces accidentally, stop and escalate per plan §8.

---

# AM-12 — Verify payload limits and client compatibility

**Type:** Story · **Priority:** High · **Owner:** QA-B · **Est:** 1 d · **Blocked by:** AM-04

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

# AM-13 — Assess agent usability and tool selection

**Type:** Story · **Priority:** Medium · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-02

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

# AM-14 — Triage findings and file defects

**Type:** Story · **Priority:** High · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-03, AM-10, AM-11, AM-12, AM-13

**Summary**
`Aloha MCP QA - Triage all findings and file severity-rated defects`

**Description**
As a QA Lead, I need every finding triaged, deduplicated and filed with a severity, so the service owners receive one coherent, prioritised defect list instead of scattered observations.

**Acceptance criteria**
- [ ] All findings across AM-03…AM-13 collected into one triage sheet
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

# AM-15 — Assemble evidence pack and issue QA verdict

**Type:** Story · **Priority:** High · **Owner:** QA Lead · **Est:** 1 d · **Blocked by:** AM-14

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
- [ ] Safe-usage guidance from AM-12 published for the team — what to avoid until fixes land
- [ ] Recommendation on whether a follow-up security cycle is warranted, with evidence
- [ ] Recommendation on whether the server is ready for wider team adoption
- [ ] Summary comment posted on the Epic; Epic transitioned

**Verdict guidance**

| Verdict | Condition |
|---|---|
| **Pass** | No S1 or S2 open; smoke pass rate ≥ 80%; auth clean |
| **Pass with findings** | Usable, but named S2/S3 defects remain open with tickets filed |
| **Fail** | Any **S1** confirmed, or a stop-and-escalate trigger fired, or smoke pass rate < 80% |

**A confirmed S1 on user scoping (O4 / AM-08) is an automatic Fail** regardless of every other result.

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
| Severity | S1–S4 per plan §7.4, assigned at triage in AM-14 |
