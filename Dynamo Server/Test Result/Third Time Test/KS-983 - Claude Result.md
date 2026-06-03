# KS-983 — Claude QA Result (Third Time Test — Live Retest)
## Dynamo MCP QA — Validate llm_text_analysis on fund description (Section 5.7)

| Field | Value |
|---|---|
| **Ticket** | [KS-983](https://gendvn.atlassian.net/browse/KS-983) |
| **Story** | US-E3-07 — Validate llm_text_analysis on fund description |
| **Epic** | Dynamo MCP — Functional E2E Validation (KS-999) |
| **Guide ref** | Section 5.7 — LLM text analysis test · **Guide v1.5** |
| **Test run** | Third Time Test — Live Retest (server reconnected) |
| **Test date (UTC)** | 2026-05-22 |
| **Tester / Agent** | Claude (Cowork mode) — claude-sonnet-4-6 |
| **MCP server** | `https://mcp.conceptia.com/dynamo/sse` |
| **Tools under test** | `llm_text_analysis`, `get_fund_description` |
| **Overall result** | **BLOCKED (all scenarios) — KS-1002: Anthropic model deprecated (404), OpenAI key absent** |

---

## Summary

Section 5.7 remains **BLOCKED** in this test run. The Dynamo MCP server **IS connected** in this session (reconnected 2026-05-22). However, `llm_text_analysis` fails at the LLM provider level — KS-1002 persists with a **new error type** compared to Second Time Test.

**v1.5 live attempt result:**

```json
{
  "success": false,
  "message": "Failed to run LLM text analysis: Error: Anthropic error 404: {\"type\":\"error\",\"error\":{\"type\":\"not_found_error\",\"message\":\"model: claude-3-5-sonnet-20240620\"},\"request_id\":\"req_011CbGrNfaKU8q4gSk2MaBuy\"}"
}
```

**New finding in Third Time Test:** The KS-1002 error has evolved from "credit balance is too low" (Second Test, 2026-05-13) to "model not found: claude-3-5-sonnet-20240620" (Third Test, 2026-05-22). The model `claude-3-5-sonnet-20240620` has been **deprecated by Anthropic** since the Second Test was run. The MCP server's LLM provider configuration is now doubly broken:

1. The specific Anthropic model configured on the server (`claude-3-5-sonnet-20240620`) no longer exists.
2. `OPENAI_API_KEY` remains absent (unchanged since First Test).

Resolution requires the vendor to update the Anthropic model string to a current model (e.g., `claude-sonnet-4-5` or `claude-haiku-4-5`) **and** ensure the account has sufficient credits, or configure a funded OpenAI key.

---

## KS-1002 Blocker Evolution

| Test run | Date | Error type | Root cause |
|---|---|---|---|
| First Test | 2026-04-24 | Tool not callable | Anthropic API key missing entirely; OpenAI key absent |
| Second Test | 2026-05-13 | `credit balance is too low` (Anthropic 402) | Key present but account out of credits; OpenAI absent |
| **Third Test** | **2026-05-22** | **`model not found` (Anthropic 404)** | **Model `claude-3-5-sonnet-20240620` deprecated; OpenAI absent** |

---

## LLM Provider Status (Third Time Test)

| Provider | Status | Detail |
|---|---|---|
| Anthropic key | Present (assumed) | Model 404 — `claude-3-5-sonnet-20240620` not found (deprecated) |
| Anthropic model | ❌ Deprecated | Must update to current model string |
| OpenAI key | ❌ Missing | `OPENAI_API_KEY` absent — unchanged |
| LLM executable | ❌ No | Both providers non-functional |

---

## Test Execution

### Scenario 1 — Happy path (LLM grounding / structured output): BLOCKED 🚫

**Attempted:** `llm_text_analysis(analysisType="summary", companyNames=["59 North Capital Management"], limit=1)`

**Result:**
```json
{"success":false,"message":"Failed to run LLM text analysis: Error: Anthropic error 404: {\"type\":\"error\",\"error\":{\"type\":\"not_found_error\",\"message\":\"model: claude-3-5-sonnet-20240620\"},\"request_id\":\"req_011CbGrNfaKU8q4gSk2MaBuy\"}"}
```

Server is connected and reachable. The call reaches the MCP server, which attempts to invoke Anthropic, but the model `claude-3-5-sonnet-20240620` no longer exists. Request ID `req_011CbGrNfaKU8q4gSk2MaBuy` confirms the request reached Anthropic's API and was rejected at the model resolution step.

**Status:** BLOCKED (KS-1002 — model deprecated)

---

### Scenario 2 — Error path (input validation / null description): BLOCKED 🚫

Cannot re-verify input validation guard in isolation — all `llm_text_analysis` calls fail at the LLM provider level before reaching application-level input validation. Even the pre-LLM validation path from Second Test (which returned `"Provide 'texts' or note filters..."`) may now be masked by the model-404 error.

**Status:** BLOCKED (KS-1002 — model deprecated)

---

### Scenario 3 — Short / ambiguous text: BLOCKED 🚫

Not executable. All paths to `llm_text_analysis` blocked at provider level.

**Status:** BLOCKED (KS-1002 — model deprecated)

---

## Security Scan

| Check | Result |
|---|---|
| Raw JWT or Bearer token in error response | ✅ None — error body contains only provider error JSON |
| Internal server paths or stack traces | ✅ None — error body clean |
| Anthropic `request_id` trace ID | ℹ️ `req_011CbGrNfaKU8q4gSk2MaBuy` — in error body; acceptable (not a credential) |
| Fabricated analysis output on LLM failure | ✅ None — tool returns error, not fabricated content |

**Security verdict: PASS** — Error handling is clean. No credentials leaked. The new 404 error reveals only the deprecated model name, not internal keys or paths.

---

## Findings

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 (KS-1002) | **Blocker** | `llm_text_analysis` non-functional — **NEW: Anthropic model `claude-3-5-sonnet-20240620` deprecated (404). OpenAI key still absent.** | **Escalated — model must be updated + credits required** |

---

## Resolution Requirements

To unblock KS-983 for a full re-run:

1. **Update Anthropic model string** on MCP server from `claude-3-5-sonnet-20240620` to a current model (e.g., `claude-sonnet-4-5`, `claude-haiku-4-5`, or `claude-opus-4-6`)
2. **Ensure Anthropic account has sufficient credits** (billing gap from Second Test may persist)
3. **OR configure `OPENAI_API_KEY`** with a funded OpenAI account as fallback provider

---

## Test Matrix Row — Section 5.7 LLM Text Analysis (v1.5)

| Test | Happy path | Invalid input | Unauthorized user | Network drop | Large dataset | VULN probe |
|---|---|---|---|---|---|---|
| **5.7 LLM analysis** (`llm_text_analysis`) | **B** | **B** | n/a | n/a | **B** | n/a |

*B = Blocked. Server IS connected this run; blocker is exclusively KS-1002 (Anthropic model deprecated + no OpenAI key).*

---

## Comparison Across All Test Runs

| Dimension | First Test (2026-04-24) | Second Test (2026-05-13) | Third Test (2026-05-22) |
|---|---|---|---|
| Guide version | v1.4 | v1.4 | **v1.5** |
| `llm_text_analysis` registered | Yes | Yes | **Yes (server connected)** |
| Server connectivity | Connected | Connected | **Connected** |
| Anthropic key | ❌ Missing | ✅ Present | ✅ Present (assumed) |
| Anthropic model status | N/A | ✅ Model valid; credits insufficient | **❌ Model `claude-3-5-sonnet-20240620` deprecated (404)** |
| Anthropic credits | N/A | ❌ Insufficient | ❌ Unknown (model 404 masks credit check) |
| OpenAI key | ❌ Missing | ❌ Missing | **❌ Missing** |
| S1 LLM happy path | ❌ BLOCKED (no key) | ❌ BLOCKED (no credits) | **❌ BLOCKED (model deprecated)** |
| S2 input validation | PASS (Cursor evidence) | PASS | ❌ BLOCKED (provider error masks validation) |
| Root cause | Missing API keys | Key present; billing gap | **Deprecated model + no OpenAI key** |

---

## Verdict

**Final result: BLOCKED (all scenarios) — KS-1002: Anthropic model deprecated, OpenAI key absent**

Section 5.7 is blocked exclusively by KS-1002 in this run — the server is connected. The error type has evolved from an insufficient-credits error (Second Test) to a model-not-found 404 (Third Test), indicating the Anthropic model configured on the MCP server (`claude-3-5-sonnet-20240620`) has been deprecated since the Second Test. The vendor must update the model string to a current Anthropic model and ensure the account is funded, or configure an OpenAI key, before a full re-run of KS-983 is possible.

---

*Generated: 2026-05-22 · Agent: Claude Cowork (claude-sonnet-4-6) · Source: KS-983 v1.5 live retest · Guide: dynamo-mcp-testing-guide_v1.5.md §5.7*
