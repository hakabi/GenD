# KS-1078 Consolidated Report — Verify the datalake introspection and query tools

> **Story:** [KS-1078](https://gendvn.atlassian.net/browse/KS-1078) · **Draft ID:** AM-09 · **Epic:** [KS-1066](https://gendvn.atlassian.net/browse/KS-1066)  
> **Endpoint:** `https://mcp.conceptia.com/aloha/mcp` · build **0.9.5**  
> **Sources:** [KS-1078 Cursor Result.md](KS-1078%20Cursor%20Result.md) (2026-08-07 ~08:01–08:37 UTC) · [KS-1078 Claude Result.md](KS-1078%20Claude%20Result.md) (2026-08-07 ~07:55–07:56 UTC)  
> **Clients:** Cursor IDE + Claude Code CLI 2.1.223 (native HTTP only)  
> **Consolidated:** 2026-08-07  
> **Final status:** **FAIL**

---

## Executive verdict

KS-1078 is **FAIL** on both clients. Introspection happy paths work, but invalid-input paths **leak infrastructure detail** (**NEW-16**: full Trino/Java stack + MongoDB catalog prefix on `describe_table`) and `list_tables` returns a raw Python `"unhashable type: 'dict'"`. `get_data` correctly caps rows and rejects DDL/DML fragments, but **`truncated` reports false at the 1000-row ceiling** (**NEW-17**). **O10** confirmed: `smpublic_main_v3` is non-functional over MCP.

No credentials/connection strings observed. Ticket escalation clause on infrastructure disclosure is **flagged for QA lead** (S2 disclosure, not automatic §8 S1 credential stop).

---

## Cross-client agreement

| Check | Cursor | Claude Code | Final |
|---|---|---|---|
| `show_schemas` | **P** (8 schemas) | **P** | **P** |
| `list_tables` solovis | **P** (28) | **P** (28) | **P** |
| Invalid schema | `"unhashable type: 'dict'"` | Same | **F** |
| `describe_table` fund_manager | **P** (78 cols) | **P** | **P** |
| Invalid table stack leak | **F** NEW-16; Cursor notes **`status:success`** | **F** NEW-16 | **F** confirmed |
| `get_data` fund_manager | 695 / truncated false / ~2.2 MB | Same | **P** (cap) |
| Empty `filter_cond` | Same as omit | Byte-identical (ignore ts) | **P** |
| DDL/`;`/UNION/`--`/INSERT reject | **P** | **P** (`;` tested) | **P** |
| Block `rating_detail` | **P** + alt tools | **P** | **P** |
| `fund_ror` at 1000 + truncated | **1000 / truncated:false** | Same NEW-17 | **F** NEW-17 |
| `health_check` | **P** 0.9.5 + uptime | **P** | **P** |
| `smpublic_main_v3` | Flask context error | Same O10 | **F** O10 |
| `get_user_info` | O4 | (not focus) | Carry O4 |

---

## Acceptance criteria — consolidated

| AC | Final |
|---|---|
| `show_schemas` | **Pass** |
| `list_tables` valid / invalid clear | **Pass** / **Fail** |
| `describe_table` valid / invalid clear | **Pass** / **Fail** (NEW-16) |
| `get_data` 1000-row cap | Cap **Pass**; truncation signal **Fail** (NEW-17) |
| Omit filter unbounded | **Pass** (capped) |
| Empty-string filter | **Pass** |
| Reject DDL/DML / `;` / comments / UNION | **Pass** |
| Block `rating_detail` | **Pass** |
| No stacks / infra / raw SQL | **Fail** (NEW-16; SQL echo on success paths) |
| `health_check` | **Pass** |
| `smpublic_main_v3` / O10 | **Fail** (non-functional) |
| Pass rate ≥ 80% | **Fail** |

---

## Findings (merged; ignore Antigravity)

| ID | Finding | Severity | Follow-up |
|---|---|---|---|
| **NEW-16** | Invalid `describe_table` returns Trino stack + `mongodb.<schema>.<table>`; Cursor: outer **`status:success`** | **S2 High** | AM-10 / AM-14; QA lead infra-escalation review |
| **NEW-17** | `truncated:false` when `row_count==1000` on `fund_ror` | **S2 High** | AM-12 / AM-09 |
| list_tables invalid | `"unhashable type: 'dict'"` | S3 Medium | AM-10 |
| **O10** | `smpublic_main_v3` Flask “outside of request context” | S3 Medium | Remove/fix wrapper / AM-13 |
| Wide payload under row cap | ~2.2 MB `fund_manager` | Medium | AM-12 |
| SQL echo | Success payloads include `sql` field | S3 (strict AC) | AM-10 |

---

## Recommendation

- Keep KS-1078 as **FAIL**.  
- Prioritize sanitizing `describe_table` / `list_tables` errors and fixing `truncated`.  
- Remove or repair `smpublic_main_v3` in the MCP catalog.  
- Feed error-quality to **KS-1079 (AM-10)**; payload/truncation to **KS-1081 (AM-12)**; triage **KS-1083 (AM-14)**.
