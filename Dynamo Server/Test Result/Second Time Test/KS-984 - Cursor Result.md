# KS-984 — Cursor QA Result (Second Time Test)

## Dynamo MCP Security QA — AUTH suite (Section 7.1, guide v1.4)

| Field | Value |
|---|---|
| **Ticket** | [KS-984](https://gendvn.atlassian.net/browse/KS-984) |
| **Epic** | [KS-1000](https://gendvn.atlassian.net/browse/KS-1000) — Dynamo MCP — Security & Abuse-Case Testing |
| **Guide ref** | **§7.1** Authentication & Authorization · `dynamo-mcp-testing-guide_v1.4.md` |
| **Stories ref** | `dynamo_mcp_testing_stories_v1.2.md` — US-E4-01 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 |
| **Agent** | Cursor — Composer |
| **MCP** | `user-conceptia-dynamo` (7 tools + `read_data` **not** registered) |
| **Overall** | **PARTIAL / DOCUMENTED** — full AUTH matrix not exhaustively re-run; smoke + inventory alignment per v1.4 |

---

## Summary

This report **aligns execution posture** with **guide v1.4 §1.3–1.4** and the **updated Jira appendix** (8-tool surface; `search_aloha_funds` **out of scope**). **AUTH-01/02** at the HTTP boundary are **cross-referenced** to **KS-977** (`curl` to `https://mcp.conceptia.com/dynamo/sse` — **401** + JSON for missing/invalid Bearer). **Authenticated** **`get_funds`** remains the primary **tenant-scope** probe (**AUTH-04** behavioral baseline).

**AUTH-05 / `read_data`:** **S (skipped)** — `read_data` absent from client registry (see **KS-991** / **KS-981** evidence pattern).

**Spot checks (this session):**

| Probe | Observation | AUTH mapping |
|---|---|---|
| `get_funds` + `fundName: "'; DROP TABLE Fund;--"` | `success: true`, `data: []`, `recordCount: 0` — **no** SQL error leakage in JSON | Sanitization / empty result (overlaps **INJ-01**; no auth bypass) |
| `get_funds` + wrong type (`fundName` numeric) | Server returned **3** rows (first page) — **type coercion** at boundary | Log as **INJ-06** / validation hygiene (**KS-985**); not an AUTH pass/fail by itself |

---

## v1.4 requirements (ticket appendix)

Canonical text for editors / Jira: see **`E4_Jira_v1.4_description_blocks.md`** → **Block for KS-984**.

---

## Security verdict (this Cursor pass)

| ID | Status | Notes |
|---|---|---|
| AUTH-01 / 02 (HTTP) | **P** (by reference) | **KS-977** §2.A |
| AUTH-03 | **n/a** | No 403-only scenario isolated in this pass |
| AUTH-04 | **P** (smoke) | Consistent authorized `get_funds` pages in-session |
| AUTH-05 (`read_data`) | **S** | Tool not registered |

---

## Evidence

- **MCP:** `get_funds` adversarial string probe (this run).  
- **Cross-ticket:** **KS-977** — Cursor result for **§5.1** / HTTP **401** / disconnect error strings.

---

*Generated: 2026-05-13 · Path: `D:\source\GenD\Dynamo Server\Test Result\Second Time Test\KS-984 - Cursor Result.md`*
