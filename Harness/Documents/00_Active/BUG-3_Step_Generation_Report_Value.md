# BUG-3 — Step generation fails when a request asks to *report* a value

**Priority:** High · **Component:** Requests → step generation (`build_steps_task`) · **Epic:** QG-138 · **Status:** ✅ Filed 18 Aug 2026 as [QG-161](https://gendvn.atlassian.net/browse/QG-161) — assignee Bình Hà Khoa
**Environment:** `qops-harness.lab.gend.vn`, project `aloha`, session `data/sessions/aloha/aloha-auth.json`
**Request:** `#732e3daa` · 18 Aug 2026, 09:02 UTC

---

## Steps to reproduce

**New request** → Single test case → App project `aloha` → Test request:

```
Project: aloha
Go to workbench-app.lab.gend.vn
Click on Risk tab
Click on Output subtab
Validate that after reload, Total Risk as of 2026-08-18 table is being displayed
Report the Weight number of Total Fad
```

Click **Review proposed cases**, wait ~90 s.

## Actual

Case badged `BUILD_FAILED` with zero usable steps (`NAVIGATE —` / `VALIDATION —`):

> build_steps_task **Invalid steps JSON: Extra data: line 5 column 1 (char 105)** — Task failed guardrail
> validation after 6 retries. Also: validate_steps_json must be invoked during this task.

## Expected

Runnable steps — or a fast, clear failure naming the unsupported instruction, instead of 6 retries and an empty case.

---

## Notes for dev

- **The trigger is the last line.** Deleting only `Report the Weight number of Total Fad` makes the identical
  prompt build 4 correct steps. The step schema `{title, navigate, checks[]}` has no field for returning a
  value, so the generator appears to emit a second JSON document — `Extra data` is the `json.loads` error for
  trailing content after a complete JSON value.
- `Draft structured intents` succeeds; `Build test steps` is the failing task.
- **The status is misleading:** after the failure the log downgrades `error` → `warning`, then writes
  *"Built steps for case 1/1"* and *"confirm to run"*. The request ends `awaiting_review`, not `failed`, with
  **Confirm and process** enabled on the empty case.

Activity log: `GET /api/quests/732e3daa-8e8f-4c23-9787-1ef40e089bf8`
