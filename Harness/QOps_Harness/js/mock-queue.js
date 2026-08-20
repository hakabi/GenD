/** Synthetic request queue for UI stress-testing (?mockQueue=100 on /requests). */
(function () {
  "use strict";

  const INPUTS = [
    "Checkout coupon flow — mobile regression",
    "Auth password reset edge cases",
    "API rate limit header validation",
    "Guest checkout — full purchase E2E",
    "Admin dashboard export CSV",
    "Stripe webhook retry handling",
    "Search autocomplete latency",
    "Profile avatar upload limits",
    "Notification preferences sync",
    "SSO login redirect loop",
    "Cart persistence across sessions",
    "Promo code stacking rules",
    "Inventory reservation timeout",
    "Refund partial order flow",
    "GDPR data export request",
  ];

  const MODES = ["single_case", "new_feature", "existing_feature", "bug_ticket"];
  const MODE_LABELS = {
    single_case: "single case",
    new_feature: "new feature",
    existing_feature: "existing feature",
    bug_ticket: "bug ticket",
  };
  const STATUSES = ["completed", "completed", "completed", "running", "awaiting_review", "queued"];

  function padId(n) {
    return String(1000 + n);
  }

  function pick(list, index) {
    return list[index % list.length];
  }

  function buildMockParents(count) {
    const n = Math.max(1, Math.min(Number(count) || 100, 500));
    const parents = [];
    for (let i = 0; i < n; i += 1) {
      const id = `#q-${padId(i)}`;
      parents.push({
        quest_id: id,
        runId: id,
        user_input: `${pick(INPUTS, i)} (#${i + 1})`,
        status: pick(STATUSES, i + Math.floor(i / 7)),
        request_mode: pick(MODES, i),
        mode: MODE_LABELS[pick(MODES, i)],
        session: i % 3 === 0 ? "sessions/auth-flows.yaml" : i % 3 === 1 ? "sessions/mobile-checkout.yaml" : "sessions/api-regression.yaml",
      });
    }
    return parents;
  }

  function buildLongPlaywrightLog(seed) {
    const lines = [
      "Running 1 test using 1 worker",
      "",
      `  ✓  ${seed} › setup › load session file (412ms)`,
      `  ✓  ${seed} › Step 1 · Navigate to checkout (1.2s)`,
      `  ✓  ${seed} › Step 2 · Add item to cart (890ms)`,
      `  ✓  ${seed} › Step 3 · Open cart drawer (640ms)`,
    ];
    for (let i = 4; i <= 18; i += 1) {
      lines.push(`  ✓  ${seed} › Step ${i} · Intermediate checkout action (${400 + (i * 37) % 900}ms)`);
    }
    lines.push(
      "",
      `  ✘  ${seed} › Step 19 · Submit expired coupon (30.1s)`,
      "",
      "    Error: locator.click: Timeout 30000ms exceeded.",
      "    Call log:",
      "      - waiting for getByRole('button', { name: 'Apply coupon' })",
      "      -   locator resolved to <button disabled aria-busy=\"true\">Apply coupon</button>",
      "      -   element is not enabled",
      "      - retrying click action",
      "      -   waiting 500ms",
      ""
    );
    for (let r = 1; r <= 24; r += 1) {
      lines.push(`      - retry #${r} — still disabled (aria-busy=true)`);
    }
    lines.push(
      "",
      "       at stepAI (/tests/checkout.spec.ts:142:11)",
      "       at TestCaseRunner.runStep (/harness/runner.ts:88:5)",
      "",
      "  attachment #1: screenshot (image/png) ─── failure-at-step-19.png",
      "  attachment #2: trace (application/zip) ─── trace.zip",
      "",
      "  Slow test file: checkout.spec.ts (31.2s)",
      "  1 failed",
      "  18 passed (31.2s)"
    );
    return lines.join("\n");
  }

  function mockStructuredActivity(parent) {
    const base = Number.parseInt(String(parent.runId).replace(/\D/g, ""), 10) % 24 || 9;
    const ts = (h, m, s) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const seed = String(parent.runId || "q-mock").replace("#", "");
    const linked = mockLinkedCases(parent);
    const activity = [];
    let seq = 1;

    const push = (name, content, opts = {}) => {
      activity.push({
        ts: opts.ts || ts(base, 4, seq % 50),
        text: name,
        detail: content,
        cls: opts.cls || "",
        level: opts.level || "info",
        meta: opts.meta || {},
        seq,
      });
      seq += 1;
    };

    push("Request queued", "Request queued");
    push("Worker assigned — loading session", "Worker assigned — loading session");
    push("Request started — generating test cases", "Request started — generating test cases", { cls: "ok" });
    push("CrewAI planner invoked", "CrewAI planner invoked", { meta: { phase: "setup", agent_role: "Planner" } });
    push("LLM proposed cases from request", "LLM proposed cases from request");
    if (parent.status === "awaiting_review") {
      push("Awaiting user review…", "Awaiting user review…");
      return activity;
    }
    push("User confirmed cases — enqueue child runs", "User confirmed cases — enqueue child runs", { cls: "ok" });

    const stepTitles = [
      "Navigate to application entry",
      "Open target feature area",
      "Perform primary user action",
      "Verify expected UI outcome",
      "Submit form or confirm action",
      "Validate success state",
    ];

    linked.forEach((c, ci) => {
      const childId = c.id;
      const total = linked.length;
      push(`Child run ${ci + 1}/${total} started`, `Running case ${ci + 1}: ${c.title}`, {
        meta: { child_id: childId, proposed_case_id: c.id },
      });

      const stepCount = Math.max(2, Math.min(c.stepCount || 2, 6));
      for (let si = 1; si <= stepCount; si += 1) {
        const title = stepTitles[(si - 1) % stepTitles.length];
        const isRunningCase = parent.status === "running" && ci === linked.length - 1 && si === stepCount;
        const isFailedCase = c.status === "failed" && si === stepCount - 1;

        if (si % 2 === 1 || c.stepCount <= 2) {
          push(
            `Step ${si} · ${title} — navigate`,
            `Navigate to the target screen for ${title.toLowerCase()}`,
            { meta: { child_id: childId, proposed_case_id: c.id } }
          );
        }
        if (si % 2 === 0 || c.stepCount <= 2) {
          push(
            `Step ${si} · ${title} — verify`,
            `Verify the UI shows the expected result after ${title.toLowerCase()}`,
            { meta: { child_id: childId, proposed_case_id: c.id } }
          );
        }

        if (ci === 0 && si === 1) {
          push("Playwright executor attached", "Automation script available for this case", {
            meta: { child_id: childId },
          });
        }

        if (isFailedCase) {
          push(
            `Step ${si} · Playwright step failed — selector timeout`,
            buildLongPlaywrightLog(seed),
            {
              cls: "error",
              level: "error",
              meta: { child_id: childId, proposed_case_id: c.id },
            }
          );
          push("Screenshot captured — failure-at-step.png", "Screenshot captured — failure-at-step.png", {
            meta: { child_id: childId },
          });
          break;
        }

        if (isRunningCase) {
          push(`Step ${si} · AI executor running`, "CrewAI executor evaluating UI state…", {
            meta: { child_id: childId, agent_role: "Executor", task_name: "UI evaluation" },
          });
          break;
        }
      }

      if (parent.status === "completed") {
        push(`Child run ${ci + 1}/${total} passed`, `Case completed: ${c.title}`, {
          cls: "ok",
          meta: { child_id: childId },
        });
      }
    });

    if (parent.status === "completed") {
      push("Request completed — see Executed history", "Request completed — see Executed history", { cls: "ok" });
    }

    return activity;
  }

  function mockActivityFor(parent) {
    return mockStructuredActivity(parent);
  }

  function parseMockCount(raw) {
    if (raw == null || raw === "" || raw === "0" || raw === "false") return 0;
    if (raw === "1" || raw === "true") return 100;
    const n = Number.parseInt(String(raw), 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 100;
  }

  function resolveMockCount() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("mockQueue")) return parseMockCount(params.get("mockQueue"));
    const bodyCount = document.body?.dataset?.mockQueue;
    if (bodyCount) return parseMockCount(bodyCount);
    return 0;
  }

  let cachedParents = null;

  function getMockQueueData(limit) {
    const total = resolveMockCount();
    if (!total) return null;
    if (!cachedParents) cachedParents = buildMockParents(total);
    const cap = Math.min(limit || total, cachedParents.length);
    return { parents: cachedParents.slice(0, cap), total: cachedParents.length };
  }

  function findMockParent(runId) {
    if (!cachedParents) getMockQueueData(500);
    return cachedParents?.find((p) => p.runId === runId || p.quest_id === runId) || null;
  }

  function mockLinkedCases(parent) {
    const titleBase = String(parent.user_input || "Test case").replace(/\s*\(#\d+\)\s*$/, "").trim();
    const mode = parent.request_mode || "single_case";
    const status = parent.status;

    function caseStatus(defaultStatus) {
      if (status === "awaiting_review") return "proposed";
      if (status === "completed") return defaultStatus;
      if (status === "running") return "running";
      return "pending";
    }

    if (mode === "single_case") {
      return [
        {
          id: "case-primary",
          title: titleBase,
          category: "positive",
          categoryLabel: "Positive",
          status: caseStatus("passed"),
          stepCount: 2,
        },
      ];
    }

    if (mode === "existing_feature") {
      return [
        { id: "ef-1", title: `${titleBase} — happy path`, category: "positive", categoryLabel: "Positive", status: caseStatus("passed"), stepCount: 4 },
        { id: "ef-2", title: `${titleBase} — alternate route`, category: "positive", categoryLabel: "Positive", status: caseStatus("passed"), stepCount: 3 },
        { id: "ef-3", title: `${titleBase} — invalid input`, category: "negative", categoryLabel: "Negative", status: caseStatus("failed"), stepCount: 2 },
        { id: "ef-4", title: `${titleBase} — permission denied`, category: "edge_case", categoryLabel: "Edge case", status: caseStatus("passed"), stepCount: 2 },
      ];
    }

    if (mode === "new_feature") {
      return [
        { id: "nf-1", title: `${titleBase} — core flow`, category: "positive", categoryLabel: "Positive", status: caseStatus("proposed"), stepCount: 5 },
        { id: "nf-2", title: `${titleBase} — empty state`, category: "edge_case", categoryLabel: "Edge case", status: caseStatus("proposed"), stepCount: 2 },
        { id: "nf-3", title: `${titleBase} — regression guard`, category: "negative", categoryLabel: "Negative", status: caseStatus("proposed"), stepCount: 3 },
      ];
    }

    if (mode === "bug_ticket") {
      return [
        { id: "bug-1", title: `${titleBase} — reproduce bug`, category: "negative", categoryLabel: "Negative", status: caseStatus("failed"), stepCount: 3 },
        { id: "bug-2", title: `${titleBase} — verify fix`, category: "positive", categoryLabel: "Positive", status: caseStatus("passed"), stepCount: 2 },
      ];
    }

    return [{ id: "case-1", title: titleBase, category: "positive", categoryLabel: "Positive", status: caseStatus("proposed"), stepCount: 2 }];
  }

  function mockActivityEvents(parent) {
    return mockActivityFor(parent).map((line, index) => {
      const isErr = line.cls === "error" || line.level === "error";
      return {
        id: `mock-ev-${index}`,
        name: line.text,
        content: line.detail || line.text,
        type: isErr ? "error" : line.cls === "ok" ? "ok" : "info",
        level: isErr ? "error" : line.level || "info",
        sequence: line.seq || index + 1,
        timestamp: line.ts,
        meta: line.meta || {},
      };
    });
  }

  function mockQuestDetail(parent) {
    const idx = Number.parseInt(String(parent.quest_id).replace(/\D/g, ""), 10) || 0;
    const day = 3 + (idx % 20);
    const hour = 8 + (idx % 12);
    const submittedAt = `2026-07-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:12:00Z`;
    const startedAt =
      parent.status !== "queued"
        ? `2026-07-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:14:00Z`
        : null;
    const completedAt =
      parent.status === "completed"
        ? `2026-07-${String(day).padStart(2, "0")}T${String(hour + 1).padStart(2, "0")}:02:00Z`
        : null;

    return {
      parent: {
        quest_id: parent.quest_id,
        user_input: parent.user_input,
        status: parent.status,
        request_mode: parent.request_mode,
        session_file: parent.session,
        submitted_at: submittedAt,
        submitted_by: idx % 4 === 0 ? "cli" : idx % 3 === 0 ? "qa@example.com" : "product@example.com",
        started_at: startedAt,
        completed_at: completedAt,
        review_status: parent.status === "awaiting_review" ? "pending" : parent.status === "completed" ? "confirmed" : null,
        outcome_summary: parent.status === "completed" ? "All child runs passed" : "",
        children_total: parent.request_mode === "single_case" ? 1 : parent.request_mode === "existing_feature" ? 4 : 3,
        children_complete: parent.status === "completed" ? (parent.request_mode === "single_case" ? 1 : 4) : 0,
        queue_position: idx % 5 === 0 ? 1 : 0,
        input_type: "natural_language",
      },
      activity: mockActivityEvents(parent),
      linkedCases: mockLinkedCases(parent),
      reviewUpdatedAt: parent.status === "awaiting_review" ? submittedAt : null,
      pr_url: parent.status === "completed" && idx % 7 === 0 ? "https://github.com/org/repo/pull/1042" : null,
    };
  }

  window.QopsMockQueue = {
    resolveMockCount,
    getMockQueueData,
    findMockParent,
    mockActivityFor,
    mockQuestDetail,
    mockLinkedCases,
  };
})();
