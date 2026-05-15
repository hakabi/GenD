# KS-985 — Cursor QA Result (Second Time Test)

## Dynamo MCP Security QA — INJ suite (Section 7.2, guide v1.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-985](https://gendvn.atlassian.net/browse/KS-985) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) |
| **Guide ref** | **§7.2** Input validation & injection |
| **Stories ref** | `dynamo_mcp_testing_stories_v1.2.md` — US-E4-02 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Agent** | Cursor — Composer |
| **MCP** | `user-conceptia-dynamo` |
| **Overall** | **PARTIAL** — representative probes only; full payload library not attached |

---

## Summary

v1.4 scope: **seven** live tools + **`read_data` S**. Legacy story text referencing **“13 tools”** is **superseded** by the ticket **v1.4 appendix** (see **`E4_Jira_v1.4_description_blocks.md`** → **KS-985** block).

### Executed probes (this session)

| ID | Probe | Result |
|---|---|---|
| **INJ-01** (partial) | `get_funds` + `fundName: "'; DROP TABLE Fund;--"` | **Empty** `data`, **no** raw SQL / stack in tool JSON |
| **INJ-06** (spot) | `get_funds` + numeric `fundName` (**12345**) | **200-style success** with **3** funds — suggests **loose coercion**; document under hygiene / schema strictness (**F-01**), not silent crash |

### Not executed here

- **INJ-02**–**INJ-05** full matrices, oversized JSON, SSRF across all parameters — requires dedicated payload runbook and non-prod fixtures per guide **§7.2** / **§8**.

### `read_data`

All **INJ-01** / **INJ-06** rows that require SQL against **`read_data`**: **S** until tool registers (**KS-981** pattern).

---

## Findings

| ID | Severity | Description |
|---|---|---|
| F-01 | Low | Numeric value in string-typed filter may be **coerced** rather than rejected — validate vendor JSON Schema enforcement roadmap. |

---

## Evidence

- **MCP:** `get_funds` calls documented in §Summary.

---

*Generated: 2026-05-13 · Path: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-985 - Cursor Result.md`*
