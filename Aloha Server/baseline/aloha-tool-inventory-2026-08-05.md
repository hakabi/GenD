# Aloha MCP — Tool Inventory Baseline

> **Story:** US-A2 · **Parent:** KS-1062
> **Captured:** 2026-08-05 (UTC)
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` (Streamable HTTP)
> **Client:** Claude Code v2.1.222 (desktop app), native `type: http` transport — no `mcp-remote` proxy
> **Auth:** Microsoft OAuth completed via Claude Code CLI v2.1.222, browser flow, no token paste
> **Method:** Schema capture only. **No Aloha tool was invoked.** Blocking Q2 (write-capability) was still unanswered at capture time.

---

## 1. Headline result

| Metric | June 2026 (quan) | 2026-08-05 | Delta |
|---|---|---|---|
| Tool count | ~28 | **34** | **+6** |
| Dedicated fund-search tool | *"none in the stdio path"* | **4 fund-search tools** | new |
| Write-capable tools | unknown | **0 found** | — |

**D3 (tool catalog too large) has not been addressed — the catalog grew.** quan named ~28 tools as itself a defect; the 2026-07-23 build exposes 34.

---

## 2. Full inventory (34 tools)

R = read · C = compute/derive (reads inputs, returns calculation) · W = write

### 2.1 Fund search & resolution (5)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 1 | `Search_Funds` | R | `search_term` | Returns `fund_id`, `fund_name`, `source` per match |
| 2 | `search_funds` | R | `search_term` | **Self-declared alias of `Search_Funds`** |
| 3 | `search_all_funds` | R | `search_term` | ES across Albourne, Solovis, Alt Evest, Evest |
| 4 | `search_albourne_funds` | R | `search_term` | Albourne (ALB) index only |
| 5 | `search_crbm_index` | R | `names` | Resolves benchmark name → `bbg_id` |

### 2.2 Bundled analysis (2)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 6 | `fund_analyzer` | C | `start_date` | Accepts `fund_id` **or** `search_term`; 8 `include_*` slices all default **true** |
| 7 | `smpublic_main_v3` | C | *(none)* | Takes **no parameters**; description says it "requires Flask JSON body via HTTP proxy" |

### 2.3 Returns & performance (7)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 8 | `get_fund_returns` | R | `fund_ids`, `start_date`, `end_date` | Bulk Solovis monthly net/gross |
| 9 | `get_top_funds_by_returns` | R | *(none)* | Needs `period_months` **or** both dates — not enforced in schema |
| 10 | `get_bottom_funds_by_returns` | R | *(none)* | Same conditional-requirement pattern |
| 11 | `calculate_annualized_returns` | C | `fund_ids` | Same conditional date pattern |
| 12 | `intraday_fund_returns` | R | *(none)* | **"formerly `fund_returns`"** — renamed since June |
| 13 | `calculate_drawdown` | C | `fund_id` | Max drawdown, recovery, down months |
| 14 | `equity_beta` | C | *(none)* | CRBM + benchmark |

### 2.4 Benchmarks & CRBM (3)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 15 | `get_benchmark_history` | R | `benchmark_ids`, `start_date`, `end_date` | Requires Bloomberg ids, not names |
| 16 | `get_fund_crbm` | R | *(none)* | Omitting `fund_id` returns **all funds** |
| 17 | `calculate_crbm_returns` | C | `fund_id`, `start_date`, `end_date` | |

### 2.5 Fees, IR, liquidity (6)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 18 | `fee_model` | C | **15 required params** | Largest required-param surface in the catalog |
| 19 | `get_fee_model_defaults` | R | *(none)* | Omitting `fund_id` returns **all funds** |
| 20 | `ir_model` | C | *(none)* | Omitting `fund_ids` returns **all public-sleeve funds** |
| 21 | `calculate_liquidity_cost` | C | `fund_id` | |
| 22 | `get_liquidity_parameters` | R | *(none)* | Omitting `fund_id` returns **all funds** |
| 23 | `query_fund_manager` | R | `fields` | Allowlisted columns, max 64 cols / 1000 rows |

### 2.6 Ratings (5)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 24 | `get_rating_details` | R | `id` | **User-scoped.** Optional `user` param overrides `X-User-Email` |
| 25 | `rating_detail` | R | `id` | **Self-declared duplicate of `get_rating_details`** |
| 26 | `get_rating_summary` | R | `id` | |
| 27 | `rating_summary` | R | `id` | **Self-declared duplicate of `get_rating_summary`** |
| 28 | `list_rating_details_by_user` | R | *(none)* | **User-scoped.** Optional `user` param overrides `X-User-Email` |

### 2.7 Datalake / schema introspection (6)

| # | Tool | R/C/W | Required | Notes |
|---|---|:--:|---|---|
| 29 | `show_schemas` | R | *(none)* | `SHOW SCHEMAS`, Trino-style |
| 30 | `list_tables` | R | `db_name` | `SHOW TABLES` |
| 31 | `describe_table` | R | `db_name`, `table_name` | `DESCRIBE` |
| 32 | `get_data` | R | `db_name`, `table_name` | Capped `SELECT *` (1000 rows) + free-text `filter_cond` WHERE predicate |
| 33 | `health_check` | R | *(none)* | |
| 34 | `get_user_info` | R | *(none)* | Returns email from forwarded headers |

**Section totals:** 5 + 2 + 7 + 3 + 6 + 5 + 6 = **34**

---

## 3. Answer to blocking Q2 — write capability

**No write-capable tool was found.** All 34 are read or compute. Supporting evidence:

- `get_data` explicitly rejects `;`, SQL comments, `UNION`, and DDL/DML keywords, and is capped at 1000 rows
- The `rating_detail` **table** is blocked from `get_data` (must go through the dedicated rating tools)
- `query_fund_manager` is column-allowlisted (`FUND_MANAGER_MCP_ALLOWED_COLUMNS`)
- No create/update/delete/insert/save/submit verb appears anywhere in the catalog

**Caveat:** this is a judgement from tool *descriptions*, not from observed behaviour. It should be confirmed by quan or Kathleen Bui before it is treated as authoritative. It does, however, lower the risk of proceeding with read-only smoke tests on Production.

---

## 4. Findings raised by this inventory

| ID | Finding | Severity | Story |
|---|---|---|---|
| **F1** | Catalog grew ~28 → **34**. D3 is worse, not fixed | Medium | US-A3 / D3 |
| **F2** | `Search_Funds` and `search_funds` differ **only by capitalisation** and are self-declared aliases. An agent cannot meaningfully choose between them | Medium | US-A3 / D3 |
| **F3** | `rating_detail` ≡ `get_rating_details` and `rating_summary` ≡ `get_rating_summary` — 2 more pure duplicates. **3 of 34 tools are redundant aliases** | Medium | US-A3 / D3 |
| **F4** | `get_user_info` description states *"informational only; **no auth in this service**"* — the service trusts a forwarded `X-User-Email` header; authentication is enforced only at the gateway | **High — verify** | US-A5 |
| **F5** | `get_rating_details`, `rating_detail` and `list_rating_details_by_user` accept an optional `user` parameter that **overrides** `X-User-Email` on user-scoped data. If unvalidated, one user may be able to read another user's ratings | **High — verify** | US-A5 |
| **F6** | Five tools return **all funds** when their optional `fund_id` is omitted (`get_fund_crbm`, `get_fee_model_defaults`, `get_liquidity_parameters`, `ir_model`, and both top/bottom tools). Matches the unbounded-payload pattern from Dynamo (KS-1025, KS-1028, KS-1038, KS-1039) | Medium | US-A4 |
| **F7** | `get_top_funds_by_returns`, `get_bottom_funds_by_returns`, `calculate_annualized_returns` document a conditional requirement ("`period_months` **or** both dates") that the JSON schema does not enforce — `required` is empty | Low | US-A4 |
| **F8** | `get_data.filter_cond` is a free-text SQL WHERE predicate guarded by a **denylist**. Denylists are weaker than allowlists. Injection payloads are out of scope this cycle (plan §2.1) — flagged only | Medium | deferred |
| **F9** | `smpublic_main_v3` exposes **zero parameters** yet claims to need a Flask JSON body via HTTP proxy. Likely non-functional over MCP | Medium | US-A4 |
| **F10** | `intraday_fund_returns` was **renamed** from `fund_returns`. Any saved prompt or doc referencing `fund_returns` is now stale | Low | US-A2 |
| **F11** | `fee_model` requires **15 parameters**. Effectively unusable by an agent without first calling `get_fee_model_defaults` — no such chaining hint in its description | Medium | US-A3 / D3 |

---

## 5. Bearing on the KS-1047 defects

| Defect | Inventory evidence | Status |
|---|---|---|
| **D1** — wrong fund resolution | Fund-search tools now exist (4). But `fund_analyzer.search_term` still says *"Search Aloha Elasticsearch first to resolve fund_id"* — the same auto-resolve path that mis-resolved `"Citadel Investment"` → 986. Mechanism unchanged | **Needs live test** |
| **D2** — client freeze | Cannot be judged from schemas. Note `fund_analyzer` defaults **all 8** `include_*` slices to true — the largest payload is the default, which is the worst case for D2 | **Needs live test** |
| **D3** — catalog too large | 34 tools, 3 pure aliases, 4 overlapping fund searches | **Still open — worse** |
| **D4** — error quality | Cannot be judged from schemas | **Needs live test** |

---

## 6. Reproduction

```json
"conceptia-aloha": { "type": "http", "url": "https://mcp.conceptia.com/aloha/mcp" }
```

Native Claude Code HTTP transport was used deliberately in place of `npx mcp-remote`: it cannot fall back to SSE, so this capture is guaranteed to reflect the Streamable HTTP surface that replaced the legacy endpoint on 2026-06-19.

**Not yet done:** second-client verification. US-A2 requires the inventory to be confirmed identical on a second client; a per-client difference is itself a defect. Antigravity is installed on the test machine and is the intended second client.
