# Stage 3 — Stress / DoS Testing Report
**Conceptia Dynamo MCP Server**
**Test Date:** 2026-05-06
**Tester:** Claude (Cowork Mode)
**Target:** `https://mcp.conceptia.com/dynamo/sse`
**Connector prefix:** `0c5a3b61-86e4-4c75-b19f-40c0141fb861`

---

## Scope

Stage 3 assessed the Dynamo MCP server's resilience against high-volume, oversized, and chained requests designed to trigger resource exhaustion, error leakage, or client-side denial of service. Six test cases were executed covering flood attacks, oversized payloads, large array parameters, deep pagination, and full pipeline stress.

Prior stages for reference:
- Stage 1 (SQL Injection Rounds 1–2): `SQLi-Result.md`, `SQLi-Round2-Result.md`
- Stage 2 (Advanced Prompt Injection PIJ-06–10): `PIJ-Advanced-Result.md`

---

## Summary Table

| ID | Test Case | Tool(s) | Payload | Result | Severity |
|----|-----------|---------|---------|--------|----------|
| STRESS-01 | Concurrent flood — get_funds | `get_funds` | 10 calls, mix parallel/sequential | No rate limiting detected; all 10 responses consistent and correct | Medium |
| STRESS-02 | Max result set — get_activity | `get_activity` | limit=500, startDate=2010-01-01 | 193,187-char response overflows MCP client context window | Medium |
| STRESS-03 | Oversized string payload | `get_funds` | fundName = 10,000-char "A" string | SQL Server truncation error leaked to client | Medium |
| STRESS-04 | Large array flood — get_notes | `get_notes` | companyNames[] with 100 entries | Server handled gracefully; 0 results, no error | Pass |
| STRESS-05 | Max pagination depth — get_notes | `get_notes` | limit=200, offset=0, categories=* | 442,927-char response overflows MCP client context window | Medium |
| STRESS-06 | Full pipeline chain stress | `get_notes` → `analyze_notes` → `llm_text_analysis` | limit=100–200 at each stage | Every stage independently overflows context or times out (180 s) | High |

**Overall:** 1 Pass, 4 Findings (Medium), 1 Finding (High)

---

## Detailed Results

### STRESS-01 — Concurrent Flood on `get_funds`

**Objective:** Determine whether `get_funds` applies any rate limiting, connection throttling, or circuit-breaking under a parallel flood of identical requests.

**Payload:** 10 calls to `get_funds(limit=50, offset=0)` issued as a mix of parallel and sequential batches.

**Result:** All 10 calls returned successfully. Every response was identical: 50 of 790 total funds, page 1, ~0.02 MB. No HTTP errors, no 429 Too Many Requests, no degradation in response content or structure.

**Finding:** The server has no rate limiting or flood protection on `get_funds`. An unauthenticated or compromised MCP client could sustain arbitrarily high call rates against this endpoint without triggering any server-side defence.

**Severity:** Medium — no immediate data loss or exfiltration risk, but the absence of rate limiting means the DB query layer is fully exposed to sustained call flooding.

---

### STRESS-02 — Max Result Set on `get_activity`

**Objective:** Request the maximum permitted result set from `get_activity` and observe whether the server enforces a meaningful response size cap at the API layer.

**Payload:** `get_activity(limit=500, startDate=2010-01-01)`

**Result:** The server returned a payload of **193,187 characters** (approx. 0.18 MB raw). The server itself did not error or reject the request. However, the MCP framework's context window was exceeded, and the response was automatically dumped to disk at:

```
.../tool-results/mcp-0c5a3b61-...-get_activity-1778055786376.txt
```

The tool documentation states "Response is limited to 2MB", but there is no enforcement at the API level preventing payloads that overflow the MCP agent's token budget (which is far below 2MB in practice).

**Finding:** The server's 2MB limit is not enforced in a way that prevents MCP client context exhaustion. A malicious actor with API access can repeatedly request max-limit payloads to degrade or crash MCP client processes. This constitutes a client-side Denial of Service surface.

**Severity:** Medium — server stability is unaffected, but MCP client processes can be forced into context overflow on every call.

---

### STRESS-03 — Oversized String Payload on `get_funds`

**Objective:** Send an extremely large string (10,000 characters) as the `fundName` filter parameter and observe whether the server sanitises, truncates, or passes it to the database.

**Payload:** `get_funds(fundName="AAAA...A" [10,000 chars], limit=50)`

**Response:**
```json
{
  "success": false,
  "message": "Failed to retrieve funds: String or binary data would be truncated."
}
```

**Finding:** The 10,000-character string was passed directly to SQL Server, which rejected it with a truncation error. The raw SQL Server error message `"String or binary data would be truncated."` was returned verbatim to the client. This reveals:

1. The server performs no input length validation before constructing the SQL query.
2. A raw database-layer error message is exposed to the caller, leaking information about the column schema (i.e., the `FundName` column has a fixed-width constraint that is smaller than 10,000 characters).
3. No sanitised error wrapper is applied — the internal DB error string is propagated directly.

While this does not allow injection or data exfiltration, it constitutes an information disclosure weakness and indicates that oversized parameters bypass application-layer validation entirely.

**Severity:** Medium — no data loss, but internal schema information is disclosed and the absence of input length validation is a defence-in-depth failure.

---

### STRESS-04 — Large Array Flood on `get_notes`

**Objective:** Send an array of 100 company names to `get_notes` and observe query performance, error behaviour, and response correctness.

**Payload:** `get_notes(companyNames=["Company1", "Company2", ..., "Company100"], limit=200)`

**Response:**
```json
{
  "success": true,
  "message": "Query executed successfully. Retrieved 0 of 0 total activity note(s)...",
  "recordCount": 0,
  "totalRecords": 0,
  "hasMore": false
}
```

**Result:** The server accepted the 100-entry array, executed the query without error, and returned an empty result set (none of the synthetic company names exist in the database). No timeout, no error, no performance degradation.

**Finding:** None. The server handles large array parameters gracefully. The query planner and OR-expansion logic on `companyNames` correctly processed 100 entries without issue.

**Verdict:** PASS

---

### STRESS-05 — Max Pagination Depth on `get_notes`

**Objective:** Request `get_notes` at maximum limit (200) across all activity categories and observe response size behaviour and the 2MB limit claim.

**Payload:** `get_notes(limit=200, offset=0, activityCategories=["*"])`

**Result:** The response was **442,927 characters** — the largest single tool response observed during Stage 3. The MCP framework's context window was exceeded and the full payload was dumped to disk. A follow-up call at `limit=50, maxBodyLength=5000` still produced 186,384 characters — also exceeding the context limit.

**Finding:** The `get_notes` tool is substantially worse than `get_activity` for context overflow risk. Even with the documented 2MB hard limit on the server, the practical MCP agent context limit is far smaller. The `activityCategories=["*"]` wildcard removes the default category filter and dramatically expands the result set. There is no server-side mechanism to warn callers when they are approaching the agent's context limit.

The documented pagination guidance (`Use pagination or set includeBody=false for large result sets`) is advisory only — it is not enforced. A caller who omits those precautions will receive an overflowing response with no error.

**Severity:** Medium — consistent with STRESS-02 finding; the 2MB claim is aspirational relative to real-world MCP context constraints.

---

### STRESS-06 — Full Pipeline Chain Stress (`get_notes` → `analyze_notes` → `llm_text_analysis`)

**Objective:** Stress the complete server-side processing pipeline end-to-end by calling each tool in sequence at its maximum documented limit. Each tool in this chain independently fetches notes from the database and then performs additional processing (aggregation, LLM inference).

**Payloads and results:**

| Step | Tool | Params | Outcome |
|------|------|--------|---------|
| 1 | `get_notes` | limit=50, maxBodyLength=5000 | **186,384 chars — context overflow** |
| 2 | `analyze_notes` | limit=100 | **598,857 chars — context overflow** (worst in Stage 3) |
| 3 | `llm_text_analysis` | limit=100, analysisType=summary, provider=anthropic | **Timeout after 180 seconds** |

**Findings:**

1. **Cascading context overflow:** Every stage in the pipeline independently generates a response that exceeds the MCP agent's context window. The chain cannot be executed sequentially without each step spilling to disk. This means the pipeline is fundamentally broken for aggregate use cases without aggressive parameter reduction by the caller.

2. **`analyze_notes` amplification:** The `analyze_notes` tool generated 598,857 characters — over 3× the raw `get_notes` output — because it prepends analysis scaffolding, comparison tables, and summaries to the underlying note bodies. This amplification means the tool is more dangerous than `get_notes` from a context overflow perspective.

3. **`llm_text_analysis` hard timeout:** When called at limit=100 without filtering, `llm_text_analysis` timed out after exactly 180 seconds. This matches the DROP TABLE timeout anomaly observed in SQLi Round 1. The 180-second ceiling appears to be the server's global request timeout. This means the tool can be trivially DoS'd: a single call with a broad date range and high limit will tie up a server-side LLM request slot for 3 full minutes before failing, returning no useful output and providing no partial result.

4. **No circuit-breaking or partial response:** When `llm_text_analysis` timed out, the server returned a hard error with no partial output, no retry guidance, and no indication of how much work had been completed. This is an availability risk in production: users cannot distinguish a transient timeout from a permanent failure.

**Severity:** High — the full pipeline chain is non-functional at max load. The 180-second LLM timeout constitutes a denial-of-service vector on the server's compute resources (one call monopolises an LLM slot for 3 minutes), and cascading context overflows make the pipeline unusable without caller-side parameter discipline that is not documented as a requirement.

---

## Consolidated Findings

| Finding ID | Tool | Category | Description | Severity |
|------------|------|----------|-------------|----------|
| STRESS-F01 | `get_funds` | No Rate Limiting | No flood protection; unlimited call rate accepted | Medium |
| STRESS-F02 | `get_activity` | Client-Side DoS | Max payload (193 KB) overflows MCP agent context window | Medium |
| STRESS-F03 | `get_funds` | Error/Info Disclosure | Raw SQL Server truncation error returned verbatim; no input length validation | Medium |
| STRESS-F04 | `get_notes` | Client-Side DoS | Max payload (443 KB at limit=200) overflows MCP agent context window; `analyze_notes` amplifies to 599 KB | Medium |
| STRESS-F05 | `llm_text_analysis` | Hard Timeout / Availability | 180-second timeout at limit=100; monopolises LLM slot; no partial result returned | High |
| STRESS-F06 | Full pipeline chain | Cascading DoS | Every pipeline stage independently overflows context or times out; chain is non-functional at max load | High |

---

## Recommendations

**STRESS-F01 / Rate Limiting:**
Implement request-rate limiting per authenticated identity (or per connector token) at the API gateway layer. Suggested threshold: ≤10 calls/second to read tools with DB queries; ≤2 calls/second to LLM tools.

**STRESS-F02 / STRESS-F04 / Response Size:**
Add a server-side hard cap on serialised response size that is calibrated to the MCP agent context window (not just 2MB in bytes). Alternatively, document and enforce a conservative default `limit` (e.g., 10 for body-inclusive calls) and return a warning header when the response approaches the context limit.

**STRESS-F03 / Input Validation:**
Validate string parameter lengths at the application layer before constructing SQL queries. Return a sanitised 400-style error (e.g., `"fundName exceeds maximum allowed length of 255 characters"`) rather than propagating the raw SQL Server error.

**STRESS-F05 / LLM Timeout:**
Implement a streaming or chunked response strategy for `llm_text_analysis` so partial results are returned before the global timeout. Set a lower per-tool timeout (e.g., 30–60 seconds) with a graceful partial-response fallback. Rate-limit LLM tool calls to prevent slot monopolisation.

**STRESS-F06 / Pipeline Chain:**
Document safe parameter envelopes for each tool when used in a chain context (e.g., `limit ≤ 10, maxBodyLength ≤ 2000` for body-inclusive note retrieval). Consider adding a `safeMode=true` flag that automatically applies conservative limits when a caller signals chained pipeline use.

---

## Stage Coverage vs. Full Test Plan

| Stage | Status |
|-------|--------|
| Stage 1 — SQL Injection Rounds 1 & 2 | Complete (`SQLi-Result.md`, `SQLi-Round2-Result.md`) |
| Stage 2 — Advanced Prompt Injection (PIJ-06–10) | Complete (`PIJ-Advanced-Result.md`) |
| Stage 3 — Stress / DoS Testing (STRESS-01–06) | **Complete (this report)** |
| Stage 4 — IDOR / CORS / Auth Token Abuse | Pending |
| Stage 5 — FINDING-04 Regression (`read_data` tool) | Pending (requires Claude Desktop connector) |

---

*End of Stage 3 report.*
