<!-- Confluence page body: Skill Classification for ATL (source for MCP createConfluencePage) -->

## Document control

| Field | Value |
| --- | --- |
| **Title (Jira/Confluence request)** | Skill Classification for ATL — *ATL = Automation Testing Lifecycle.* |
| **Primary sources** | Repo: `Automation Workflow/skill-classification.md`, `Automation Workflow/atl version 2.md`; Confluence parent: [Automation Testing Lifecycle (ATL) Workflow](https://gendvn.atlassian.net/wiki/spaces/QG/pages/463175682/Automation+Testing+Lifecycle+ATL+Workflow) |
| **Definition: “Full automation”** | An agent skill can run **lights-out** when: (1) inputs are machine-readable without interactive clarification, (2) outputs are written to known paths or APIs, (3) **stop conditions** are explicit and machine-detectable, (4) **validation** can be expressed as checks (schema, diff, exit code, Jira response codes). **Excluded** from this list: human approval gates, pure policy one-liners, and steps that **require** subjective human judgment without a tool-backed evidence artifact. **Borderline** skills are listed under *Semi-automated* at the end. |

---

## Summary — fully automatable skills (ATL v2 alignment)

| # | Skill identifier | ATL v2 / classification ref | One-line role |
| --- | --- | --- | --- |
| 1 | `analyze-synthesize-ks-ticket` | Phase 1 | Ingest Jira ticket(s) → synthesized requirements `.md` |
| 2 | `save-timestamped-markdown` | P1b / utility | Deterministic filename + write |
| 3 | `ks-requirements-to-qg-tasks` | Phase 2 | Requirements doc → QG Epic / Stories / Sub-tasks |
| 4 | `parse-atl-requirements-markdown` | P2a | Normalise Phase 1 markdown into structured test model |
| 5 | `apply-qg-issue-naming-convention` | P2b | Enforce `[PHASE 2] <Summary>` (and related QG rules) |
| 6 | `create-jira-epic` / `create-jira-stories` / `create-jira-subtasks` | P2c | Atomic Jira CRUD (when invoked with complete payloads) |
| 7 | `xpath-to-csharp-pom` | §3.1 | Page URL + context → unique XPath set |
| 8 | `validate-xpaths-against-jira-scenarios` | §3.2 / P3.2 | Compare XPath inventory vs Phase 2 Jira scenario fields |
| 9 | `pom-to-csharp-page` | §3.2–3.3 / P3.4 | Validate branch + emit `pom.md` under `docs/aloha/user-steps/<module>/` |
| 10 | `log-xpath-mismatch-discrepancies` | §3.2 fail path | Structured discrepancy log when validation fails |
| 11 | `load-project-test-constitution` | Phase 4 auto-read | Read `constitution.md` + template paths into prompt context |
| 12 | `map-jira-stories-to-nunit-scenarios` | Phase 4 | Jira story/test fields → scenario matrix for codegen |
| 13 | `merge-pom-markdown-into-test-code` | Phase 4 / P4c | Merge `pom.md` locators into generated C# structure |
| 14 | `generate-nunit-tests-from-jira-and-pommd` | Phase 4 umbrella | Jira + `pom.md` + constitution + templates → `.cs` tests |
| 15 | `run-autotest` | §5.1 | Compose `dotnet test` (+filters, `-p:Platform=x64`) → exit code + logs |
| 16 | `parse-dotnet-trx-and-console` | §5.1 / P5.2a | `.trx` + console → structured pass/fail model |
| 17 | `summarize-failed-test-cases` | §5.2.1 / P5.2b | Failed test list + message + stack per TC |
| 18 | `generate-isolated-bug-repro` | §5.2.2 / P5.2c | Per failure → `Isolated_Bug_Repro_<ID>.cs` |
| 19 | `generate-test-execution-summary` | §5.2 pass / P5-pass | All-green consolidated summary |
| 20 | `ingest-failed-test-artifacts` | §6.1 (use **§5.1** console, not “Step 4”) | Priority merge: console summary + `TestResults/*.trx` |
| 21 | `crossref-failure-to-pom-markdown` | §6.1 extract / P6.1b | Map failing line/XPath → `pom.md` / locator entry |
| 22 | `write-failure-investigation-report` | §6.3 / P6.3 | `TestResults/FailureReport_<YYYYMMDD_HHMMSS>.md` with required sections |
| 23 | `xpath-doc-generator` | §6.4 🟡 | Regenerate / patch XPath documentation for affected elements |
| 24 | `create-qg-bug-with-evidence` | §6.4 🔴 / P6.4c | QG Bug + attachments + Epic link (API-automatable) |

---

## Detailed skill specifications

Each block uses the same column semantics: **Inputs**, **Outputs**, **Stop conditions**, **Validation**.

### 1. `analyze-synthesize-ks-ticket` (Phase 1)

| Dimension | Specification |
| --- | --- |
| **Inputs** | **Required:** Jira project + ticket key(s) or numeric IDs for `<TICKET_ID>` (e.g. `KS-939`); read permissions for issue fields, description, comments, attachments metadata. **Optional:** output directory root; naming override; locale for dates. |
| **Outputs** | Markdown file: `\<Ticket Summary\>_YYYYMMDD_HHMMSS.md` (per ATL v2); embedded sections: scope, acceptance hints, open questions, trace to source fields. |
| **Stop conditions** | Ticket **404** / permission denied; empty description **and** no usable comments; Jira rate limit / timeout after bounded retries; attachment fetch failure if synthesis depends on binary (stop with partial + list missing refs). |
| **Validation** | File exists on disk; non-zero length; contains ticket key in header; timestamp in filename matches UTC or documented TZ; spot-check: every `[TBD]` explicitly listed if present in source; **regression:** re-run on fixture JSON produces stable golden diff (minus timestamp). |

### 2. `save-timestamped-markdown` (utility / P1b)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Base name (sanitised from Ticket Summary), target folder URI, markdown body string, timestamp source (system clock vs injected). |
| **Outputs** | Single `.md` file path returned to caller. |
| **Stop conditions** | Illegal path characters; directory not writable; disk full; name collision policy = append suffix if “never overwrite” configured. |
| **Validation** | `fs` stat: file size > 0; name regex `.*_\d{8}_\d{6}\.md$` (adjust if schema differs); UTF-8 readable. |

### 3. `ks-requirements-to-qg-tasks` (Phase 2)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Phase 1 requirements `.md`; QG **project key**; Epic/Story/Sub-task issue type mapping; field IDs for test steps / expected results; naming rule `[PHASE 2] <Summary>`. |
| **Outputs** | Created Jira keys (Epic, Stories, Sub-tasks) + URL list + optional echo JSON of created structure. |
| **Stop conditions** | Missing Epic name / Summary; duplicate Epic detection (policy: fail vs reuse); Jira `400` on field payload; partial create → **stop** and return rollback instructions (manual or scripted delete). |
| **Validation** | JQL: `parent in (EpicKey)` returns expected child count; each Story has non-empty test description; Sub-task keys linked; naming convention substring `[PHASE 2]` present on designated issues. |

### 4. `parse-atl-requirements-markdown` (P2a)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Path to Phase 1 `.md`; parser profile version (schema id). |
| **Outputs** | JSON or in-memory model: features, scenarios, steps, expected results, `[TBD]` markers, coverage tags. |
| **Stop conditions** | Markdown not conforming to profile (missing mandatory headings); ambiguous duplicate scenario IDs. |
| **Validation** | JSON schema validation; zero scenarios → fail; `[TBD]` count matches manual grep golden. |

### 5. `apply-qg-issue-naming-convention` (P2b)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Issue type, raw Summary, phase tag (`PHASE 2`), max length. |
| **Outputs** | Transformed Summary string + validation note. |
| **Stop conditions** | Summary exceeds Jira limit after sanitise; forbidden characters after strip. |
| **Validation** | Regex `^\[PHASE 2\]` (or configured prefix); length ≤ Jira limit; no leading/trailing spaces. |

### 6. `create-jira-epic` / `create-jira-stories` / `create-jira-subtasks` (P2c)

| Dimension | Specification |
| --- | --- |
| **Inputs** | For each: project key, issue type, field payload (summary, description, parent key for children), optional labels/components. |
| **Outputs** | Issue `key`, `self` URL, `id`. |
| **Stop conditions** | HTTP **4xx/5xx**; missing required custom field; parent not found; workflow transition not allowed for user. |
| **Validation** | GET issue returns matching Summary; parent link correct; permissions verified. |

### 7. `xpath-to-csharp-pom` (§3.1)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Target **page URL**; auth model (stored session, basic auth, or none); depth scope (same-origin only); max elements; ignore dynamic ids policy. |
| **Outputs** | XPath list (unique, deduped) + optional intermediate JSON; optional stub C# if skill variant includes codegen. |
| **Stop conditions** | Navigation timeout; HTTP **4xx/5xx**; CAPTCHA/interstitial detected; blank DOM snapshot. |
| **Validation** | Every XPath non-empty string; uniqueness ≥ threshold; sample evaluate in headless browser: `count(.) >= 1` for N sampled XPaths; no duplicate locators for distinct semantic labels. |

### 8. `validate-xpaths-against-jira-scenarios` (§3.2)

| Dimension | Specification |
| --- | --- |
| **Inputs** | XPath inventory; Jira Story/Sub-task keys or exported JSON of “required elements” / labels from Phase 2. |
| **Outputs** | Pass/Fail + mismatch report: missing element, extra element, ambiguous match. |
| **Stop conditions** | Cannot fetch Jira; schema mismatch between Phase 2 export and validator version. |
| **Validation** | If pass: every required Jira element has ≥1 matching XPath; if fail: report lists each gap with Jira key + expected label; deterministic on same inputs. |

### 9. `pom-to-csharp-page` (§3.2–3.3)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Validated XPath set; module slug from ticket (e.g. `cash-forecast`); target root `docs/aloha/user-steps/<module>/`; template for `pom.md`. |
| **Outputs** | File `\<module\>-xpath.md` or configured name under target path; UTF-8. |
| **Stop conditions** | Validation branch failed (HALT per ATL v2 — do not emit final `pom.md`); path traversal attempt; module folder creation denied. |
| **Validation** | File exists; contains table or structured blocks for each locator; links back to Jira keys if required; `git diff --stat` non-empty for new module. |

### 10. `log-xpath-mismatch-discrepancies` (§3.2 fail)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Mismatch object from validator; optional correlation ids. |
| **Outputs** | `logs/` or `TestResults/` markdown/JSON artifact + user-visible summary. |
| **Stop conditions** | Log path not writable. |
| **Validation** | Artifact references every failed rule id; timestamps monotonic; PII scrubbed if Jira text contained sensitive data. |

### 11. `load-project-test-constitution` (Phase 4)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Repo root; relative path `constitution.md`; optional template globs. |
| **Outputs** | Parsed text blocks + file checksums for traceability. |
| **Stop conditions** | File missing; encoding not UTF-8; size > safe parse limit. |
| **Validation** | SHA-256 logged; required headings present in constitution; template paths exist on disk. |

### 12. `map-jira-stories-to-nunit-scenarios` (Phase 4)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Jira export (Stories + Sub-tasks); field mapping config (which field → Given/When/Then); data tables location. |
| **Outputs** | Intermediate YAML/JSON “scenario bundle” consumable by codegen. |
| **Stop conditions** | Story missing mandatory test steps; circular dependency between stories. |
| **Validation** | Every Story yields ≥1 test method stub candidate; each step has expected result or explicit `[TBD]` passthrough flag. |

### 13. `merge-pom-markdown-into-test-code` (P4c)

| Dimension | Specification |
| --- | --- |
| **Inputs** | `pom.md` locator blocks; target `.cs` partial classes or codegen AST; naming map XPath id → member name. |
| **Outputs** | Updated `.cs` files or patch hunks. |
| **Stop conditions** | `pom.md` parse error; duplicate member names; XPath id referenced in Jira but absent in `pom.md`. |
| **Validation** | `dotnet build` on affected project (when run as part of pipeline); Roslyn syntax tree parse success; optional formatter applied idempotently. |

### 14. `generate-nunit-tests-from-jira-and-pommd` (Phase 4 umbrella)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Scenario bundle; `pom.md`; constitution; `RiskModelPage.cs` / `RiskModelTest.cs` templates; target namespace/folders. |
| **Outputs** | New or updated `*Tests.cs` and related Page objects per project conventions. |
| **Stop conditions** | Template path missing; codegen template merge conflict unresolved; NUnit package reference missing in csproj (detector). |
| **Validation** | `dotnet build` succeeds; `dotnet test --list-tests` lists new methods; logger calls present per constitution min count rule (if defined). |

### 15. `run-autotest` (§5.1)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Solution or project path; test filter (class/method/multi-method); enforced `-p:Platform=x64`; logger verbosity string. |
| **Outputs** | Exit code; console log; `TestResults/*.trx` paths; duration metrics. |
| **Stop conditions** | `dotnet` not on PATH; solution load error; test host crash; hung run beyond watchdog timeout. |
| **Validation** | Exit code 0 implies `.trx` outcome `completed` with `counters/@failed=0` (cross-check); non-zero exit must correlate with failed>0 or build error in `.trx` or stderr. |

### 16. `parse-dotnet-trx-and-console` (P5.2a)

| Dimension | Specification |
| --- | --- |
| **Inputs** | One or more `.trx` paths; optional raw console text blob. |
| **Outputs** | JSON model: `{ results: [{ name, outcome, errorInfo, stackTrace }] }`. |
| **Stop conditions** | Malformed XML; TRX from wrong test adapter version (unknown schema); file locked. |
| **Validation** | Sum of `outcome` counts matches TRX counters; spot-check three known tests from golden TRX fixture. |

### 17. `summarize-failed-test-cases` (P5.2b)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Output of parser (failed subset only). |
| **Outputs** | Human-readable Markdown table + machine JSON for downstream Phase 6. |
| **Stop conditions** | Empty failed list (no-op with explicit “no failures” record). |
| **Validation** | Row count = failed count in TRX; each row includes non-truncated stack policy (e.g. max chars with ellipsis marker). |

### 18. `generate-isolated-bug-repro` (P5.2c)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Single failure record; template `Isolated_Bug_Repro.cs`; usings and namespace; target folder. |
| **Outputs** | `Isolated_Bug_Repro_<ID>.cs` per failure or batched file per policy. |
| **Stop conditions** | Template missing; `<ID>` sanitisation collision. |
| **Validation** | File compiles in isolation project (if exists); running repro reproduces same exception class (best-effort). |

### 19. `generate-test-execution-summary` (all pass)

| Dimension | Specification |
| --- | --- |
| **Inputs** | TRX + environment metadata (branch, commit SHA, agent version). |
| **Outputs** | Markdown/HTML summary under `TestResults/` or Confluence-ready snippet. |
| **Stop conditions** | TRX indicates failures (caller should not invoke this skill — stop). |
| **Validation** | Document lists total tests, duration, environment; links to TRX path. |

### 20. `ingest-failed-test-artifacts` (§6.1)

| Dimension | Specification |
| --- | --- |
| **Inputs** | **Priority 1:** Phase **5.1** console capture (correct ATL v2 reference — doc typo “Step 4”); **Priority 2:** `TestResults/*.trx` sorted by last modified desc. |
| **Outputs** | Unified failure model consumed by investigation. |
| **Stop conditions** | Neither console nor TRX available; TRX/console mismatch (counts) → stop with diagnostic mode flag. |
| **Validation** | Cross-check: failed test names appear in both sources or documented exception if console partial. |

### 21. `crossref-failure-to-pom-markdown` (P6.1b)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Failure model row; `pom.md` path from Phase 3; stack line map config. |
| **Outputs** | Enriched row: `{ xpath, pomSection, elementLabel }` or explicit `unresolved`. |
| **Stop conditions** | `pom.md` missing; XPath not found in `pom.md`. |
| **Validation** | For resolved rows, substring search finds locator id; line numbers reported within ±N lines of truth on fixture file. |

### 22. `classify-failure-via-live-ui-check` (§6.2) — *borderline*

| Dimension | Specification |
| --- | --- |
| **Inputs** | Page URL per TC; auth; expected state spec from Jira; headless vs headed mode. |
| **Outputs** | Label: 🔴 App / 🟡 XPath / 🟠 Script + evidence object (screenshot path, DOM snippet hash). |
| **Stop conditions** | Login failure; 2FA wall; page not reachable; element wait timeout. |
| **Validation** | Decision tree from ATL v2 encoded as unit-testable state machine with **golden** synthetic DOM fixtures; live runs require non-flaky waits (explicit timeouts logged). **Semi-automated** if human must confirm screenshots. |

### 23. `write-failure-investigation-report` (§6.3)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Classified failures + evidence; timestamp; optional repo link. |
| **Outputs** | `TestResults/FailureReport_<YYYYMMDD_HHMMSS>.md` matching section template in ATL v2. |
| **Stop conditions** | Write permission denied; filename collision (append suffix). |
| **Validation** | Markdown contains `## Summary` table with exact column headers; per-TC `###` headings; classification ∈ allowed enum. |

### 24. `investigate-failed-tests` (Phase 6 umbrella)

| Dimension | Specification |
| --- | --- |
| **Inputs** | Phase 5 failure bundle; optional `pom.md` path; Jira QG context; browser MCP availability flag. |
| **Outputs** | Orchestrated sequence: ingest → crossref → (optional) live classify → report → (optional) Jira create. |
| **Stop conditions** | Any sub-skill hard stop propagates; partial mode if browser unavailable (document “manual classification required”). |
| **Validation** | End-to-end golden: given fixture TRX + fixture `pom.md`, output report matches snapshot (minus volatile timestamps). |

### 25. `xpath-doc-generator` (§6.4 🟡)

| Dimension | Specification |
| --- | --- |
| **Inputs** | List of affected elements/XPath ids from report; repo paths for docs; style guide version. |
| **Outputs** | Updated markdown/JSON under docs tree; optional PR patch. |
| **Stop conditions** | Unknown element id; git dirty state when policy requires clean worktree. |
| **Validation** | Doc diff touches only allowed paths; each id appears exactly once in changelog section. |

### 26. `create-qg-bug-with-evidence` (§6.4 🔴)

| Dimension | Specification |
| --- | --- |
| **Inputs** | QG project key; Epic link key; repro steps; stack; expected vs actual; attachment paths (screenshots/logs). |
| **Outputs** | Jira Bug `key`; comment with deep links; remote links if used. |
| **Stop conditions** | Attachment upload failure; Epic link permission denied; duplicate detector (optional) suggests existing bug. |
| **Validation** | Issue type = Bug; Epic link present; all mandatory custom fields populated; attachments size < limit. |

---

## Semi-automated, orchestrator, or excluded (for transparency)

| Item | Reason |
| --- | --- |
| Human “Continue / approve preview” gates (where used in related QA workflows) | Requires human input — not lights-out. |
| `route-atl-remediation` (thin routing table) | Policy text; usually embedded in `investigate-failed-tests`. |
| `atl-phase-3-pom-pipeline` / `atl-phase-5-execute-and-branch` | Orchestration glue; not a single I/O bounded skill. |
| Pure **HALT / STOP** branches | Inline guardrails, not standalone skills. |

---

## Traceability

| ATL v2 section | Primary skills |
| --- | --- |
| Phase 1 | `analyze-synthesize-ks-ticket`, `save-timestamped-markdown` |
| Phase 2 | `ks-requirements-to-qg-tasks`, `parse-atl-requirements-markdown`, `apply-qg-issue-naming-convention`, Jira atomics |
| §3.1–3.3 | `xpath-to-csharp-pom`, `validate-xpaths-against-jira-scenarios`, `pom-to-csharp-page`, `log-xpath-mismatch-discrepancies` |
| Phase 4 | `load-project-test-constitution`, `map-jira-stories-to-nunit-scenarios`, `merge-pom-markdown-into-test-code`, `generate-nunit-tests-from-jira-and-pommd` |
| §5.1–5.2 | `run-autotest`, `parse-dotnet-trx-and-console`, `summarize-failed-test-cases`, `generate-isolated-bug-repro`, `generate-test-execution-summary` |
| Phase 6 | `ingest-failed-test-artifacts`, `crossref-failure-to-pom-markdown`, `classify-failure-via-live-ui-check`, `write-failure-investigation-report`, `investigate-failed-tests`, `xpath-doc-generator`, `create-qg-bug-with-evidence` |

---

*Generated for Confluence publication under QA-GENERIC (QG).*
