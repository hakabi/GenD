/** Shared New Request → proposed test cases handoff. */
(function () {
  const STORAGE_KEY = "qops-new-request-params";
  const CASES_KEY = "qops-review-cases";
  const RUN_KEY = "qops-active-run";

  function topicFromInput(text) {
    const line = (text || "").split("\n").map((s) => s.trim()).find(Boolean) || "Primary flow";
    if (line.length <= 52) return line;
    return `${line.slice(0, 49).trim()}…`;
  }

  /** Each variant returns { steps: [{ title, navigate, check }] } */
  function flowStepsFor(topic, variant) {
    const t = topic || "Primary flow";
    const variants = {
      happy: window.QopsNlFlow?.buildTwentyStepCheckout
        ? window.QopsNlFlow.buildTwentyStepCheckout(t)
        : {
            steps: [
              {
                title: `Navigate to feature area for: ${t}`,
                navigate: `Navigate to the application entry point for ${t}`,
                check: "Verify the starting screen is visible and ready (not a blank page or error state)",
              },
              {
                title: `Execute user flow: ${t}`,
                navigate: `Perform the primary user action described: ${t}`,
                check: "Verify the expected outcome is displayed and matches acceptance criteria",
              },
            ],
          },
      invalid: {
        steps: [
          {
            title: `Open form for: ${t}`,
            navigate: `Open the form or flow for: ${t}`,
            check: "Verify the form loads with empty fields and no validation errors",
          },
          {
            title: "Submit invalid input",
            navigate: "Submit invalid or incomplete data",
            check: "Verify validation errors appear without data loss",
          },
        ],
      },
      empty: {
        steps: [
          {
            title: "Open feature with no prior data",
            navigate: "Open the feature with no prior data",
            check: `Verify a guided empty state appears before ${t.toLowerCase()}`,
          },
        ],
      },
      permission: {
        steps: [
          {
            title: "Attempt access without permission",
            navigate: `Attempt ${t.toLowerCase()} as an unauthenticated or under-privileged user`,
            check: "Verify access is blocked with a clear message",
          },
        ],
      },
      alternate: {
        steps: [
          {
            title: "Reach outcome via alternate path",
            navigate: `Reach the same outcome for "${t}" via a secondary navigation path`,
            check: "Verify the result matches the primary path",
          },
        ],
      },
      stale: {
        steps: [
          {
            title: "Begin flow then expire session",
            navigate: `Begin ${t.toLowerCase()} then let the session expire mid-flow`,
            check: "Verify the user is prompted to re-authenticate",
          },
          {
            title: "Resume after re-authentication",
            navigate: "Re-authenticate when prompted",
            check: "Verify the user can resume without losing context",
          },
        ],
      },
      reproduce: {
        steps: [
          {
            title: "Reproduce reported bug",
            navigate: `Follow the steps from the ticket to reproduce: ${t}`,
            check: "Verify the reported issue occurs",
          },
        ],
      },
      verify_fix: {
        steps: [
          {
            title: "Verify fix after deployment",
            navigate: `Repeat the steps from the ticket after the fix: ${t}`,
            check: "Verify the reported issue no longer occurs",
          },
        ],
      },
      adjacent: {
        steps: [
          {
            title: "Exercise adjacent feature",
            navigate: "Exercise a related feature adjacent to the bug fix",
            check: `Verify related functionality still works when the fix for "${t}" is applied`,
          },
        ],
      },
    };
    return variants[variant] || variants.happy;
  }

  function serializeFlowSteps(flowSteps) {
    if (window.QopsNlFlow?.serializeFlow) {
      return window.QopsNlFlow.serializeFlow(flowSteps);
    }
    const lines = [];
    (flowSteps.steps || []).forEach((s, i) => {
      lines.push(`${i + 1}. ${s.title}`);
      if (s.navigate?.trim()) lines.push(`- ${s.navigate.trim()}`);
      if (s.check?.trim()) lines.push(`- ${s.check.trim()}`);
    });
    return lines.join("\n").trim();
  }

  function caseWithFlow(id, title, category, variant, topic) {
    const flowSteps = flowStepsFor(topic, variant);
    return {
      id,
      title,
      category,
      flowSteps: flowSteps.steps,
      flow: serializeFlowSteps(flowSteps),
    };
  }

  function buildProposedCases(params) {
    const flow = (params.user_input || "").trim() || "User completes the described flow successfully.";
    const topic = topicFromInput(flow);
    let id = 1;
    const uid = () => `case-${id++}`;

    const modeMap = {
      single_case: [{ title: topic, category: "positive", variant: "happy" }],
      new_feature: [
        { title: `${topic} — happy path`, category: "positive", variant: "happy" },
        { title: `${topic} — invalid input`, category: "negative", variant: "invalid" },
        { title: `${topic} — empty state`, category: "edge_case", variant: "empty" },
        { title: `${topic} — permission denied`, category: "security", variant: "permission" },
      ],
      existing_feature: [
        { title: `${topic} — regression core path`, category: "positive", variant: "happy" },
        { title: `${topic} — alternate navigation`, category: "positive", variant: "alternate" },
        { title: `${topic} — stale session`, category: "edge_case", variant: "stale" },
      ],
      bug_ticket: [
        { title: `Reproduce: ${topic}`, category: "negative", variant: "reproduce" },
        { title: `Verify fix: ${topic}`, category: "positive", variant: "verify_fix" },
        { title: `${topic} — adjacent flow unaffected`, category: "edge_case", variant: "adjacent" },
      ],
    };

    const seed = modeMap[params.request_mode] || modeMap.new_feature;
    return seed.map((c) => caseWithFlow(uid(), c.title, c.category, c.variant, topic));
  }

  function caseReviewUrl(params, opts) {
    const isSingle = params.request_mode === "single_case";
    const qs = new URLSearchParams({
      mode: isSingle ? "single" : "multi",
      propose: "1",
    });
    if (opts?.embedParams) {
      try {
        qs.set("req", encodeURIComponent(JSON.stringify(params)));
      } catch (_) {}
    }
    return `case-review.html?${qs.toString()}`;
  }

  function persistJson(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function prepareCaseReview(params, extras) {
    const proposed = buildProposedCases(params);
    const runId = `#q-${Date.now().toString(36).slice(-4)}`;
    const run = { id: runId, status: "review", proposedAt: Date.now() };
    const stored =
      persistJson(CASES_KEY, proposed) &&
      persistJson(RUN_KEY, run) &&
      persistJson(STORAGE_KEY, params);
    if (extras?.sources) persistJson("qops-param-sources", extras.sources);
    return {
      proposed,
      runId,
      url: caseReviewUrl(params, { embedParams: !stored }),
    };
  }

  function navigateTo(url) {
    window.location.assign(new URL(url, window.location.href).href);
  }

  function readStoredJson(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  /** Fixtures for reopening completed requests from the queue. */
  const REOPEN_RUNS = {
    "#q-1041": {
      params: {
        request_mode: "existing_feature",
        user_input: "Auth password reset edge cases — expired token, invalid link, and stale session",
        session_file: "sessions/auth-flows.yaml",
      },
      cases: [
        {
          id: "case-1",
          title: "Password reset — valid token",
          category: "positive",
          status: "passed",
          feature: "Auth",
          project: "auth",
          flowSteps: [
            {
              title: "Open reset link from email",
              navigate: "Navigate to the password reset URL from the test inbox",
              check: "Verify the reset form loads with password fields visible",
            },
            {
              title: "Submit new password",
              navigate: "Enter a valid new password and confirm, then submit",
              check: "Verify success message and redirect to sign-in",
            },
          ],
          lastRun: { id: "run-9102", status: "passed", at: "Jul 3, 10:41", duration: "8.2s" },
          runHistory: [
            { id: "run-9102", status: "passed", at: "Jul 3, 10:41", triggeredBy: "queue", ai: 2, auto: 6 },
          ],
        },
        {
          id: "case-2",
          title: "Password reset — expired token",
          category: "negative",
          status: "failed",
          feature: "Auth",
          project: "auth",
          failedStepIndex: 1,
          failedAt: "Jul 3, 10:41",
          failureScreenshotLabel: "Reset form — no expiry error shown",
          failureReason: "Expected inline error for expired token; page shows generic 404 instead.",
          failure:
            "AssertionError: expected visible expiry message\n  at auth-reset.spec.ts:58\n  locator('[data-testid=token-expired]') not visible",
          triage: "unlabeled",
          flowSteps: [
            {
              title: "Open expired reset link",
              navigate: "Navigate to a password reset URL older than 24 hours",
              check: "Verify the reset page loads (even if token is expired)",
            },
            {
              title: "Attempt password submit",
              navigate: "Enter a new password and submit on the expired link",
              check: "Verify an inline expiry error is shown without submitting the form",
            },
          ],
          lastRun: { id: "run-9102", status: "failed", at: "Jul 3, 10:41", duration: "11.1s" },
          runHistory: [
            {
              id: "run-9102",
              status: "failed",
              at: "Jul 3, 10:41",
              triggeredBy: "queue",
              ai: 2,
              auto: 5,
              note: "Failed at Step 2 — expiry banner not visible",
            },
            { id: "run-9088", status: "failed", at: "Jul 2, 14:20", triggeredBy: "Morgan Lee", ai: 2, auto: 5 },
          ],
          editHistory: [
            { by: "AI proposal", action: "Generated from request", at: "Jul 3, 10:38" },
            { by: "Morgan Lee", action: "Edited Step 2 check instruction", at: "Jul 3, 10:39" },
          ],
        },
        {
          id: "case-3",
          title: "Password reset — stale session mid-flow",
          category: "edge_case",
          status: "passed",
          feature: "Auth",
          project: "auth",
          flowSteps: [
            {
              title: "Begin reset then expire session",
              navigate: "Open reset form, wait until session cookie expires",
              check: "Verify form still visible before submit",
            },
            {
              title: "Re-authenticate and resume",
              navigate: "Submit password after session expiry; sign in when prompted",
              check: "Verify user can complete reset without losing entered password",
            },
          ],
          lastRun: { id: "run-9102", status: "passed", at: "Jul 3, 10:41", duration: "14.0s" },
          runHistory: [
            { id: "run-9102", status: "passed", at: "Jul 3, 10:41", triggeredBy: "queue", ai: 2, auto: 8 },
          ],
        },
      ],
    },
    "#q-1040": {
      params: {
        request_mode: "single_case",
        user_input: "API rate limit header validation — Retry-After on 429 responses",
        session_file: "sessions/api-regression.yaml",
      },
      cases: [
        {
          id: "case-1",
          title: "API rate limit header validation",
          category: "negative",
          status: "passed",
          feature: "API",
          project: "api",
          flowSteps: [
            {
              title: "Trigger rate limit response",
              navigate: "Send burst requests until the API returns HTTP 429",
              check: "Verify response status is 429 Too Many Requests",
            },
            {
              title: "Verify Retry-After header",
              navigate: "Inspect response headers on the 429 response",
              check: "Verify Retry-After header is present and is a positive integer",
            },
          ],
          lastRun: { id: "run-9099", status: "passed", at: "Jul 3, 09:22", duration: "6.4s" },
          runHistory: [
            { id: "run-9099", status: "passed", at: "Jul 3, 09:22", triggeredBy: "queue", ai: 2, auto: 4 },
          ],
        },
      ],
    },
  };

  function serializeReopenCases(cases) {
    return cases.map((c) => {
      const copy = { ...c };
      if (copy.flowSteps && !copy.flow) copy.flow = serializeFlowSteps({ steps: copy.flowSteps });
      return copy;
    });
  }

  function prepareReopenReview(runId) {
    const fixture = REOPEN_RUNS[runId];
    if (!fixture) {
      return {
        run: { id: runId, status: "completed", reopenedAt: Date.now() },
        params: readStoredJson(STORAGE_KEY) || {},
        cases: readStoredJson(CASES_KEY) || [],
      };
    }
    const cases = serializeReopenCases(fixture.cases);
    const run = {
      id: runId,
      status: "completed",
      reopenedAt: Date.now(),
      summary: runId === "#q-1041" ? "2 passed, 1 failed" : "1 passed",
    };
    return { run, params: fixture.params, cases };
  }

  function persistReopenReview(payload) {
    persistJson(RUN_KEY, payload.run);
    persistJson(STORAGE_KEY, payload.params);
    persistJson(CASES_KEY, payload.cases);
  }

  window.QopsRequestFlow = {
    STORAGE_KEY,
    CASES_KEY,
    RUN_KEY,
    buildProposedCases,
    caseReviewUrl,
    prepareCaseReview,
    navigateTo,
    readStoredJson,
    flowStepsFor,
    prepareReopenReview,
    persistReopenReview,
    REOPEN_RUNS,
  };
})();
