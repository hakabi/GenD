# KS-987 — Consolidated QA Result (Second Time Test)
## Dynamo MCP Security QA — CHAIN suite: multi-tool chain / data exfiltration paths

| Field | Value |
|---|---|
| **Ticket** | [KS-987](https://gendvn.atlassian.net/browse/KS-987) |
| **Story** | US-E4-04 — Execute CHAIN suite for multi-tool chain and data exfiltration paths |
| **Epic** | Dynamo MCP — Security & Abuse-Case Testing (KS-1000) |
| **Guide ref** | Section 7.4 — CHAIN · Guide v1.4 |
| **Test run** | Second Time Test |
| **Test date (UTC)** | 2026-05-13 (Cursor) · 2026-05-14 (Claude) |
| **Agents** | Cursor — Composer · Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `get_funds`, `get_fund_description`, `get_documents`, `get_notes`, `get_activity`, `analyze_notes`, `llm_text_analysis` (BLOCKED) |
| **Overall result** | **PASS (CHAIN-02, 03, 04) / BLOCKED (CHAIN-01 — provider credits)** |

---

## Executive Summary

Both agents independently identified CHAIN-01 as blocked due to `llm_text_analysis` provider credit exhaustion, and confirmed `read_data` as **S** (not registered). Cursor documented the dependency patterns and noted prior E3 evidence showing no additional outbound channel beyond the provider contract. Claude executed the full live chain verification: a 5-step retrieval chain (`get_funds` → `get_fund_description` → `get_documents` → `get_notes` → `get_activity`) against a single fund, plus secret scanning in chained note output.

All 5-step chain responses remained strictly within the authorized fund scope. 10 real note bodies scanned for secret material — none found. The Dynamo MCP surface is read-only (no write tools registered), making write fan-out structurally impossible. CHAIN-01 (mandatory §11 LLM exit gate) cannot be completed on either run until provider credits are restored.

`read_data` is not registered in the v1.4 inventory and is marked **S** for all applicable CHAIN rows.

---

## Agent Results Comparison

| Test | Cursor | Claude | Combined |
|---|---|---|---|
| CHAIN-01 (LLM exit gate) | BLOCKED (`llm_text_analysis`); prior E3 context noted | BLOCKED at step 3; steps 1–2 completed (PASS individually) | ⚠️ BLOCKED |
| CHAIN-02 (secret scan in chain output) | Discipline noted: `includeBody: false` (KS-980 pattern); no secrets observed | **P** (10 note bodies scanned, 0 secrets found) | ✅ PASS |
| CHAIN-03 (write fan-out in chain) | Not explicitly tested | **P** (structural — read-only surface, 0 write tools) | ✅ PASS |
| CHAIN-04 (full chain scope verification) | `read_data` leg **S**; live chain not run | **P** (full 5-step: 1 fund, 151 docs, 19 notes, 41 activity) | ✅ PASS |

---

## Test Execution Detail

### CHAIN-01 — LLM exit gate (`llm_text_analysis`) — BLOCKED

```
Step 1: get_funds — limit: 5 → "Arrowgrass Master Fund" (and others)   PASS
Step 2: get_fund_description — fundName: "Arrowgrass Master Fund"       PASS
        → "Global equity l/s manager with a multi-strategy overlay..."
Step 3: llm_text_analysis — texts: [description], analysisType: "summary"
        → success: false — "Anthropic error 400: credit balance too low"  BLOCKED
```

Both agents confirm the same blocker. Cursor additionally notes: "Prior E3 runs show normal in-session analysis only; no additional outbound channel evidenced beyond provider contract." Steps 1 and 2 individually PASS; the mandatory §11 exit gate (Step 3) cannot be completed.

### CHAIN-02 — Secret scanning in chained note output (Claude + Cursor)

```
get_funds → get_notes — companyNames: ["59 North Capital Management"], limit: 10
→ success: true, recordCount: 10
```

10 note bodies reviewed for:

| Pattern | Result |
|---|---|
| API keys / tokens (`sk-`, `Bearer `, `eyJ`) | ✅ None found |
| AWS/GCP/Azure credential strings | ✅ None found |
| Private key blocks (`-----BEGIN`) | ✅ None found |
| Database connection strings | ✅ None found |
| Internal IP addresses or hostnames | ✅ None found |
| Adversarial instruction strings | ✅ None found |

Content: legitimate investment due diligence material (fund strategy, performance commentary, manager meeting summaries, risk observations). **Cursor note:** Transcript redaction discipline maintained; no passwords observed when using `includeBody: false` pattern (KS-980).

### CHAIN-03 — Write tool fan-out in chain

Dynamo MCP v1.4 registered surface (7 tools): `get_funds`, `get_fund_description`, `get_documents`, `get_notes`, `get_activity`, `analyze_notes`, `llm_text_analysis`. **Write tools registered: 0.** Write fan-out is structurally impossible in any chain. PASS by design.

### CHAIN-04 — Full multi-tool chain — authorized scope verification (Claude)

5-step retrieval chain against "Arrowgrass Master Fund":

| Step | Tool | Result | Cross-scope? |
|---|---|---|---|
| 1 | `get_funds` — `fundName: "Arrowgrass Master Fund"` | `success: true`, 1 record | ✅ None |
| 2 | `get_fund_description` — `fundName: "Arrowgrass Master Fund"` | `success: true`, fund description returned | ✅ None |
| 3 | `get_documents` — `filterType: "fund"`, `filterValue: "Arrowgrass Master Fund"` | `success: true`, 151 docs — all prefixed "Arrowgrass..." | ✅ None |
| 4 | `get_notes` — `companyNames: ["Arrowgrass Master Fund"]`, limit: 20 | `success: true`, 19 notes — all reference Arrowgrass | ✅ None |
| 5 | `get_activity` — `fundNames: ["Arrowgrass Master Fund"]`, limit: 50 | `success: true`, 41 activity records — all reference Arrowgrass | ✅ None |

No cross-tenant records detected across any step. No internal system fields, tokens, connection strings, or server paths in any response. Response counts consistent (151 docs, 19 notes, 41 activity).

---

## Security Scan

| Check | Result |
|---|---|
| Cross-tenant data in any chain step | ✅ None detected |
| Secret material in note or document bodies | ✅ None detected |
| Write tool fan-out triggered by chain | ✅ None — read-only surface |
| Internal credential or token leakage | ✅ None detected |
| Stack traces or internal paths in any response | ✅ None detected |
| Additional outbound channel beyond provider API | ✅ None evidenced (Cursor E3 context + this run) |
| LLM exit gate completable | ⚠️ BLOCKED (provider credits — both runs) |

---

## Consolidated Findings

| ID | Severity | Description | Agent | Status |
|---|---|---|---|---|
| N-04 | Info | `llm_text_analysis` BLOCKED — Anthropic API credits exhausted on MCP server. CHAIN-01 (mandatory §11 LLM exit gate) cannot be completed. Both agents confirm blocker. Retest required once provider account is topped up. | Both | BLOCKED — provider-side |

---

## Test Matrix — Section 7.4 CHAIN (v1.4)

| Test | `get_funds` | `get_fund_description` | `get_documents` | `get_notes` | `get_activity` | `llm_text_analysis` | `analyze_notes` | `read_data` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **CHAIN-01** (LLM exit gate) | **P** ℹ️ | **P** ℹ️ | n/a | n/a | n/a | **BLOCKED** | n/a | **S** |
| **CHAIN-02** (secret scan in chain output) | n/a | n/a | n/a | **P** | n/a | n/a | n/a | **S** |
| **CHAIN-03** (write fan-out in chain) | n/a | n/a | n/a | n/a | n/a | n/a | **P** | **S** |
| **CHAIN-04** (full chain scope verify) | **P** | **P** | **P** | **P** | **P** | n/a | n/a | **S** |

ℹ️ CHAIN-01: `get_funds` and `get_fund_description` steps completed (PASS); chain blocked at `llm_text_analysis`  
`read_data` **S** across all CHAIN rows until tool registers (KS-991 pattern)

---

## Verdict

| Criteria | Status |
|---|---|
| CHAIN-01 LLM exit gate — `llm_text_analysis` | ⚠️ BLOCKED (Anthropic API credits — both agents) |
| CHAIN-02 Secret scan in chained note output | ✅ PASS |
| CHAIN-03 Write fan-out in chain | ✅ PASS (structural — read-only surface) |
| CHAIN-04 Full multi-tool chain scope verification (5 steps) | ✅ PASS |
| No cross-tenant data in any chain response | ✅ PASS |
| No credential or token leakage in any chain step | ✅ PASS |
| `read_data` CHAIN rows | **S** — not registered in v1.4 |

**Final result: PASS (CHAIN-02, 03, 04) / BLOCKED (CHAIN-01 `llm_text_analysis`)**

All exercisable CHAIN cases pass. CHAIN-01 (mandatory §11 LLM exit gate) is blocked by provider credit exhaustion on both agents' runs and must be retested once resolved. No cross-tenant data, secret leakage, or write fan-out observed across the full five-step retrieval chain.

---

| Source file | Agent | Date |
|---|---|---|
| `KS-987 - Cursor Result.md` | Cursor — Composer | 2026-05-13 |
| `KS-987 - Claude Result.md` | Claude — claude-sonnet-4-6 | 2026-05-14 |

*Consolidated: 2026-05-14 · Guide: dynamo-mcp-testing-guide_v1.4.md §7.4*
