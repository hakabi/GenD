# analyze-synthesize-ks-ticket Workflow

## Workflow Overview
This mapping visualizes the full logic flow described in the 7-step process of the `analyze-synthesize-ks-ticket` skill. This QA skill receives a KS Jira ticket (e.g., `KS-939`), interprets the requirements resolution logic between early descriptions and comment threads, and acts entirely automatically before generating finalized markdown requirements. 

### Processing Example
An example output artifact produced by this flow is `task-analysis-records/KS-939_requirements.md`. The workflow pulls all variables from the Jira ticket, specifically resolving points of contention where the most recent comment from the product owner takes precedence over earlier scope rules. Based on these rules, it generates clear functional areas (e.g., "Net Cash Flow Combination Chart") divided into standard QA structures: *Test Objective, Preconditions, Test Steps, and Expected Result*. 

Finally, the end of the sequence contains logic to generate automatic run comparisons. If `KS-939_requirements.md` already exists when the user runs the skill a second time, the flow will automatically execute Step 7, saving an active side-by-side comparison file.

---

## Visual Workflow Diagram

```mermaid
%%{init: { "theme": "default", "themeVariables": { "textColor": "#1a1a1a", "edgeLabelBackground": "#FFFDF5", "lineColor": "#9CA3AF" } } }%%
graph TD
    classDef input fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1a1a1a;
    classDef process fill:#F0FDF4,stroke:#22C55E,stroke-width:2px,color:#1a1a1a;
    classDef gate fill:#FFFBEB,stroke:#F59E0B,stroke-width:2px,color:#1a1a1a;
    classDef output fill:#F0FDF4,stroke:#16A34A,stroke-width:2px,color:#1a1a1a;
    classDef artifact fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1a1a1a;

    A([User provides KS ticket ID e.g., KS-939]):::input --> B[Step 1: Trigger & Intent Recognition]:::process
    B -->|Phase 1 - Ingest| C[Step 2: Fetch KS Ticket Data]:::process
    C -->|Phase 1 - Ingest| D[Step 3: Analyze & Resolve Comments]:::process
    D -->|Phase 2 - Synthesize| E[Step 4: Synthesize & Structure Requirements]:::process
    E -->|Phase 2 - Synthesize| F[/Step 5: Auto-Save Requirements <KS-ID>_requirements.md/]:::artifact
    F -->|Phase 3 - Report| G[Step 6: Present Summary to User]:::output
    G --> H{Phase 4: Previous run exists?}:::gate
    H -->|Yes| I[/Step 7: Generate Comparison Doc compare_run_vs_run.md/]:::artifact
    H -->|No| J([Skill Complete]):::output
    I --> J
    
    linkStyle default stroke:#9CA3AF,stroke-width:2px,color:#1a1a1a;
```

## Detailed Breakdown Matrix

| Step | Scope | Description | Outcome |
|------|-------|-------------|---------|
| **1. Trigger** | Phase 1 | Identifies the trigger condition based on a user mentioning a single KS ticket or explicitly asking for a run comparison. | Evaluates exact intent & starts the core flow. |
| **2. Fetch** | Phase 1 | Collects the `summary`, `description`, full `comment` thread, `assignee`, and `reporter` from the Jira ticket via MCP. | Gathers all raw ticket metadata and contextual depth. |
| **3. Analyze** | Phase 1 | Reads through all comment blocks to calculate overrides. Precedence logic dictates that recent Product Owner comments replace older descriptions. | Applies the standard QA conflict resolution ruleset. |
| **4. Synthesize**| Phase 2 | Structures the validated raw data linearly under *Test Objective*, *Preconditions*, *Test Steps*, and *Expected Result*. | Translates assumptions into robust functional areas. |
| **5. Auto-Save** | Phase 2 | Generates and saves the markdown document natively into the `task-analysis-records/` directory. | Generates the core physical target logic document (e.g., `KS-939_requirements.md`). |
| **6. Summary** | Phase 3 | Formats a summarized chat brief to immediately inform the user where the document has been saved. | Hands off information securely directly back to the active QA engineer. |
| **7. Compare** | Phase 4 | Handled conditionally. Runs a separate logic tier if `task-analysis-records/` already contains a requirement file for this same ticket. | Dumps output directly into a comparison diff file showing `N-1 vs N`. |

> **Process Boundary Note:** This progression represents the entirety of the synthesize workflow. Action deliberately halts after summary & comparison. It **does not** push those final functional requirements into task structures format mapped to QG epics/parents. Instead, the resulting `_requirements.md` artifact feeds directly into the closely related `create-qg-jira-tasks-from-ks` skill.
