# Quick Reference — `analyze-synthesize-ks-ticket`

## Trigger Commands

| Intent | Command |
|---|---|
| Full analysis | `Analyze KS ticket KS-939 and produce a synthesized requirements document.` |
| Short | `Synthesize requirements from KS-939.` |
| Extract | `Read KS-939 and extract all requirements into a requirements file.` |
| Summarize | `Summarize KS-939 requirements.` |
| Compare runs | `So sánh 2 lần chạy skill` / `Compare runs for KS-939` / `Diff between runs` |

---

## Execution Phases

| Phase | Name | Auto? |
|---|---|---|
| Phase 1 | Fetch KS ticket data (summary, description, all comments, reporter, assignee) | ✅ Always |
| Phase 2 | Synthesize & save `_requirements[_<date>].md` | ✅ Always |
| Phase 3 | Present summary in chat | ✅ Always |
| Phase 4 | Generate comparison doc (if prior run exists) | ✅ Auto / On-demand |

---

## Output Location

```
task-analysis-records/
├── <KS-ID>_requirements.md                        ← run 1
├── <KS-ID>_requirements_<YYYYMMDD>.md             ← run 2+
└── <KS-ID>_requirements_comparison_run<N-1>_vs_run<N>.md  ← Phase 4 output
```

---

## File Naming Rules

| Situation | File name |
|---|---|
| First run | `<KS-ID>_requirements.md` |
| Second+ run (same or different day) | `<KS-ID>_requirements_<YYYYMMDD>.md` |
| Multiple runs same day | `<KS-ID>_requirements_<YYYYMMDD>_<HHMM>.md` |
| Compare (with run numbers) | `<KS-ID>_requirements_comparison_run<N-1>_vs_run<N>.md` |
| Compare (with dates) | `<KS-ID>_requirements_comparison_<date1>_vs_<date2>.md` |

---

## Skill Boundary

✅ Fetches ticket + all comments (read-only Jira)
✅ Detects participant roles (reporter = PO; assignee = Dev)
✅ Resolves comment overrides (latest PO comment wins)
✅ Saves `_requirements[_<date>].md` — never overwrites
✅ Reports resolved clarifications & open questions
✅ Auto-generates comparison doc (Phase 4) when previous run exists
❌ Does NOT create any Jira tasks
❌ Does NOT process more than one KS ticket per run

---

## Next Step After This Skill

```
Use create-qg-jira-tasks-from-ks and create QG tasks from
task-analysis-records/<KS-ID>_requirements[_<date>].md
```
