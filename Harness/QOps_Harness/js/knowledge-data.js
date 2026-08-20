/** Shared knowledge scopes, file inventory, agents, and sample content for the prototype. */
(function () {
  const FILES = {
    global: ["README.md", "testing-principles.md"],
    project: [
      "checkout/overview.md",
      "checkout/coupon-rules.md",
      "auth/password-reset.md",
      "api/rate-limits.md",
    ],
  };

  /** Agents use display names in nav; each has SOUL / Memory / Ref files (same filenames across agents). */
  const AGENTS = [
    {
      id: "test-planner",
      name: "Test Planner",
      files: [
        { path: "SOUL.md", role: "soul", label: "SOUL" },
        { path: "memory.md", role: "memory", label: "Memory" },
        { path: "checkout-ref.md", role: "reference", label: "Ref" },
      ],
    },
    {
      id: "playwright-executor",
      name: "Playwright Executor",
      files: [
        { path: "SOUL.md", role: "soul", label: "SOUL" },
        { path: "memory.md", role: "memory", label: "Memory" },
      ],
    },
    {
      id: "case-reviewer",
      name: "Case Reviewer",
      files: [
        { path: "SOUL.md", role: "soul", label: "SOUL" },
        { path: "memory.md", role: "memory", label: "Memory" },
        { path: "triage-ref.md", role: "reference", label: "Ref" },
      ],
    },
  ];

  const SCOPE_LABELS = {
    global: "Global",
    project: "Project",
    agents: "Agent",
  };

  const SCOPE_DESC = {
    global: "Global scope — org-wide testing principles and defaults.",
    project: "Project scope — feature-specific context for this product.",
    agents: "Agent scope — per-agent SOUL, memory, and reference instructions.",
  };

  const ROLE_LABELS = {
    soul: "SOUL",
    memory: "Memory",
    reference: "Ref",
  };

  const CONTENTS = {
    "README.md":
      "# QOps knowledge\n\nOrg-wide defaults for test generation, triage labels, and session handling.",
    "testing-principles.md":
      "# Testing principles\n\n- Prefer user-visible outcomes over implementation detail\n- One assertion theme per case\n- Flaky tests get a triage reason before rerun",
    "checkout/overview.md":
      "# Checkout\n\nCoupon apply, shipping estimator, and payment handoff flows for the storefront.",
    "checkout/coupon-rules.md":
      "# Coupon rules\n\n- Valid codes are 6–12 alphanumeric characters\n- Expired coupons show inline error on apply\n- Stackable coupons are disabled in v2",
    "auth/password-reset.md":
      "# Password reset\n\nReset links expire after 24 hours.\nEmail delivery SLA: 30 seconds in staging.",
    "api/rate-limits.md":
      "# API rate limits\n\nStaging: 120 req/min per API key.\nBurst allowance: 20 requests over 10 seconds.",
    "agents/test-planner/SOUL.md":
      "# Test Planner — SOUL\n\nBreak user intent into discrete test cases with clear preconditions and expected outcomes.",
    "agents/test-planner/memory.md":
      "# Test Planner — Memory\n\nEpisodic log of recent planning sessions and user preferences for case granularity.",
    "agents/test-planner/checkout-ref.md":
      "# Checkout reference\n\nCoupon stack rules and mobile viewport breakpoints for checkout flows.",
    "agents/playwright-executor/SOUL.md":
      "# Playwright Executor — SOUL\n\nRun specs with the selected session file, capture traces on failure, and respect retry policy.",
    "agents/playwright-executor/memory.md":
      "# Playwright Executor — Memory\n\nLast-run artifacts, flaky selectors, and session file overrides.",
    "agents/case-reviewer/SOUL.md":
      "# Case Reviewer — SOUL\n\nSummarize failures, propose triage reasons, and suggest follow-up cases before confirm.",
    "agents/case-reviewer/memory.md":
      "# Case Reviewer — Memory\n\nRecent triage decisions and label conventions used in this project.",
    "agents/case-reviewer/triage-ref.md":
      "# Triage reference\n\nStandard failure categories: env, data, product bug, test bug, flake.",
  };

  function agentById(id) {
    return AGENTS.find((a) => a.id === id) || null;
  }

  function agentFileKey(agentId, filePath) {
    return `agents/${agentId}/${filePath}`;
  }

  function fileHref(scope, path, agentId) {
    const q = new URLSearchParams({ scope });
    if (scope === "agents" && agentId) {
      q.set("agent", agentId);
      q.set("file", path);
    } else {
      q.set("file", path);
    }
    return `knowledge.html?${q.toString()}`;
  }

  function defaultContent(path, agentId) {
    const key = agentId ? agentFileKey(agentId, path) : path;
    return CONTENTS[key] || `# ${path}\n\nAdd project-specific testing context here.`;
  }

  function groupFiles(paths) {
    const folders = {};
    const loose = [];
    (paths || []).forEach((full) => {
      if (full.includes("/")) {
        const idx = full.indexOf("/");
        const folder = full.slice(0, idx);
        const name = full.slice(idx + 1);
        if (!folders[folder]) folders[folder] = [];
        folders[folder].push({ full, name });
      } else {
        loose.push(full);
      }
    });
    return { folders, loose };
  }

  function resolveAgentFile(agentId, filePath) {
    const agent = agentById(agentId);
    if (!agent) return null;
    return agent.files.find((f) => f.path === filePath) || null;
  }

  window.KNOWLEDGE = {
    FILES,
    AGENTS,
    SCOPE_LABELS,
    SCOPE_DESC,
    ROLE_LABELS,
    CONTENTS,
    agentById,
    agentFileKey,
    fileHref,
    defaultContent,
    groupFiles,
    resolveAgentFile,
  };
})();
