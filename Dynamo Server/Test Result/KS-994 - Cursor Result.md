# KS-994 — Cursor QA Result: Capture Standardized Logs, Prompts, Transcripts, and MCP Evidence

| Field | Value |
|-------|-------|
| **Ticket** | [KS-994](https://gendvn.atlassian.net/browse/KS-994) — Dynamo MCP QA: Capture standardized logs, prompts, transcripts, and MCP evidence |
| **Epic** | Dynamo MCP — Evidence, Reporting & Continuous Validation |
| **Jira status (at test)** | To Do |
| **Guide reference** | [Dynamo MCP Server — QA Testing Guide](../Test%20Guide/dynamo-mcp-testing-guide.md) v1.3 — **section 8 What to Log for Every Test** |
| **Tester / harness** | Cursor agent — Conceptia Dynamo MCP (`user-conceptia-dynamo`) |
| **Test date (UTC)** | 2026-04-30 |
| **Overall status** | **PASS** — section 8 field pack demonstrated for a **representative PASS** run; storage path provisioned; **section 8 “exact prompt” rule for direct MCP** confirmed (see section 6) |

---

## 1. What was tested

KS-994 is **process / evidence-quality** validation, not a functional section 5 security suite. Cursor validation consisted of:

1. **Mapping** each section 8 bullet to what this environment can produce without Dynamo UI screenshots (**black-box**).
2. **Executing** one live MCP call (**section 5.1** style — `get_funds`) to generate a **fresh, redacted** evidence artifact.
3. **Writing** the artifact to the guide’s log tree **`~/dynamo-mcp-tests/logs/YYYY-MM-DD/`** (Windows: user profile) **and** mirroring a copy under the repo **Test Result** folder for review.

---

## 2. section 8 field checklist — Cursor session

| section 8 requirement | Met? | How evidenced (this run) |
|----------------|------|-------------------------|
| **Test ID + timestamp (UTC)** | ✅ | Sample run labeled **5.1** / **E5-01**; timestamps **`2026-04-30T13:10:00Z`** in JSON manifests. |
| **Tester + AI agent name/version agent** | ⚠️ / ✅ | **Assignee** on ticket is human owner; this execution is **Cursor agent + MCP**. **Cursor IDE build** was **not** captured (see section 5 — optional follow-up). |
| **MCP server version** | ✅ (N/A) | **null** in manifest — not disclosed in tool payloads; same treatment as Claude report. |
| **Exact prompt used** | ✅ | **Program rule (2026-04-30):** For Cursor runs that invoke MCP **only via direct tool calls** (no chat), the section 8 *exact prompt* is satisfied by recording the **`tool` name and JSON `arguments`** verbatim. **Note:** When the same test is also executed from **natural-language chat**, the **verbatim user message** must still be captured separately; the tool+args remain the machine-verifiable counterpart. |
| **Full agent response / transcript** | ✅ | **Equivalent:** structured tool result + this report narrative; raw multi-field fund rows **not** committed unredacted (section 8 / ticket redaction policy). |
| **Files produced (paths)** | ✅ | See section 3. |
| **Expected vs actual** | ✅ | In redacted JSON **`outcome.expected`** vs **`outcome.actual`**. |
| **Saved MCP tool output** | ✅ | Redacted summaries + pagination facts; not full 981-row dump. |
| **Pass / fail / blocked + root cause** | ✅ | Sample = **PASS**; known **blocked** class elsewhere (e.g. **5.7** / API keys) cross-referenced to **KS-993 - Cursor Result.md**. |
| **Storage `~/dynamo-mcp-tests/logs/YYYY-MM-DD/`** | ✅ | **`C:\Users\XPS 9520\dynamo-mcp-tests\logs\2026-04-30\`** created; artifact written (section 3). |

---

## 3. Files produced (paths)

| Path | Purpose |
|------|---------|
| `C:\Users\XPS 9520\dynamo-mcp-tests\logs\2026-04-30\E5-01_5.1_get-funds_2026-04-30T131000Z_evidence-redacted.json` | **Primary section 8 pack** (predictable name per guide naming guidance). |
| `D:\source\GenD\Dynamo Server\Test Result\KS-994-section8-sample-2026-04-30.json` | **Repo mirror** for reviewers / git (still redacted). |
| `D:\source\GenD\Dynamo Server\Test Result\KS-994 - Cursor Result.md` | This report. |

**Naming:** Used prefix **`E5-01_5.1_get-funds_`** + ISO-ish UTC suffix to align with the guide’s example pattern (`US-E3-02_5.2_..._transcript.txt` adapted to this epic/story).

---

## 4. Live MCP evidence — `get_funds` (representative section 5.1)

**Tool:** `get_funds`  
**Arguments (verbatim):** `{ "limit": 3, "offset": 0 }`  

**Actual (summary):** `success: true`, `recordCount: 3`, `totalRecords: 981`, `hasMore: true`.  
**Expected:** Successful authenticated read; ≥1 fund; no tokens in response.  
**Verdict:** **PASS**

Full row-level JSON from MCP included operational fields (activity subjects, names). **Those fields are not reproduced wholesale** in shared artifacts; the redacted manifest + name list suffices for audit replay of *conclusion* without dumping PII into git.

---

## 5. BDD scenarios (ticket)

| Scenario | Cursor assessment |
|----------|-------------------|
| **1 — Happy path (complete log bundle)** | **PASS** for the **constructed section 8 sample** (section 3–4). Broader program: cumulative evidence across **`KS-xxx - Cursor Result.md`** files from prior runs. |
| **2 — Incomplete bundle** | **Procedure:** mark **blocked/incomplete** if transcript missing (per ticket). Not triggered for this sample. |
| **3 — Redaction** | **PASS** — shared copies use **redacted JSON**; stricter policy: keep unredacted archives **only** in restricted storage (not this repo). |

---

## 6. Policy & optional follow-ups

### section 8 “exact prompt” — Cursor, direct MCP only (confirmed)

**Decision:** For Cursor work that uses **only direct MCP tools** (no NL chat in the test path), treat the **exact prompt** as the **JSON object: `tool` + `arguments`**, logged verbatim in the evidence pack. **Always add a short note** in the pack stating that this run used the *direct MCP* interpretation of section 8 so reviewers do not expect a chat transcript.

**When NL chat is in scope:** Still capture the **copy-pasted user message** as the exact prompt; include **tool+args** as supplemental audit detail.

### Other gaps (unchanged)

1. **Cursor build string** — Not recorded here. If your audit requires it, open **Cursor → Help → About** and paste the build into future section 8 packs.  
2. **MCP server version** — Still **unknown** at tool layer; obtain from **MCP vendor / deployment manifest** if compliance demands a semver.

---

*Report generated: 2026-04-30 (UTC). Live MCP call: `get_funds` via `user-conceptia-dynamo`. **section 8 prompt rule updated:** 2026-04-30 (user confirmation).*
