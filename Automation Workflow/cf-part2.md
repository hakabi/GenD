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