/**
 * Build grouped execution view: request setup → test cases → steps → navigate/check or AI/automation phases.
 * UI-first heuristics until activity events carry richer meta from the backend.
 */
(function () {
  "use strict";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isErrorEvent(event) {
    if (!event) return false;
    const level = String(event.level || "").toLowerCase();
    const type = String(event.type || "").toLowerCase();
    return level === "error" || type === "error";
  }

  function normStatus(raw) {
    const s = String(raw || "").toLowerCase();
    if (["passed", "pass", "completed", "successful", "ok"].includes(s)) return "passed";
    if (["failed", "fail", "error"].includes(s)) return "failed";
    if (["running", "in_progress"].includes(s)) return "running";
    if (["skipped"].includes(s)) return "skipped";
    if (["proposed", "awaiting_review", "pending", "queued"].includes(s)) return "pending";
    return "pending";
  }

  function eventText(event) {
    const parts = [event.name || ""];
    if (typeof event.content === "string") parts.push(event.content);
    return parts.join(" ").toLowerCase();
  }

  function isSetupEvent(event, text) {
    if (event.meta?.phase === "setup") return true;
    if (event.meta?.child_id) return false;
    const patterns = [
      "request queued",
      "worker assigned",
      "generating test cases",
      "crewai planner",
      "parsing natural-language",
      "llm proposed",
      "review session",
      "awaiting user review",
      "user confirmed cases",
      "enqueue child",
      "preflight",
      "quest started",
    ];
    return patterns.some((p) => text.includes(p));
  }

  function parseChildRun(text) {
    const m = text.match(/child run\s*(\d+)\s*\/\s*(\d+)/i) || text.match(/case\s*(\d+)\s*\/\s*(\d+)/i);
    if (m) return { index: Number.parseInt(m[1], 10), total: Number.parseInt(m[2], 10) };
    const started = text.match(/child run\s*(\d+)\s*started/i) || text.match(/running case\s*(\d+)/i);
    if (started) return { index: Number.parseInt(started[1], 10), total: null };
    return null;
  }

  function parseStep(text) {
    const m = text.match(/step\s*(\d+)(?:\s*[·•\-—]\s*(.+?))?(?:\s*\(|$)/i);
    if (!m) return null;
    return { index: Number.parseInt(m[1], 10), title: (m[2] || "").trim() || `Step ${m[1]}` };
  }

  function inferRunKind(text, meta) {
    if (text.includes("playwright") || text.includes("automation") || text.includes(".spec.ts")) {
      return "automation";
    }
    if (meta.agent_role || meta.task_name || text.includes("crewai") || text.includes("agent")) {
      return "ai";
    }
    return null;
  }

  function createStep(index, title) {
    return {
      id: `step-${index}`,
      index,
      title: title || `Step ${index}`,
      status: "pending",
      runKind: null,
      navigate: { status: "pending", events: [] },
      check: { status: "pending", events: [] },
      aiPhases: [],
      automation: { status: "pending", events: [] },
      events: [],
    };
  }

  function ensureAiPhase(step, label, kind) {
    let phase = step.aiPhases.find((p) => p.kind === kind);
    if (!phase) {
      phase = { id: `${step.id}-${kind}`, kind, label, status: "pending", events: [] };
      step.aiPhases.push(phase);
    }
    return phase;
  }

  function attachToStep(step, event, text, meta) {
    step.events.push(event);
    if (isErrorEvent(event)) step.status = "failed";

    const kind = inferRunKind(text, meta);
    if (kind === "automation") {
      step.runKind = "automation";
      step.automation.events.push(event);
      if (isErrorEvent(event)) step.automation.status = "failed";
      else if (step.automation.status !== "failed") step.automation.status = "running";
      return;
    }

    if (kind === "ai" || meta.agent_role || meta.task_name) {
      step.runKind = step.runKind || "ai";
      const aiKind = meta.task_name ? "task" : meta.agent_role ? "agent" : "ai";
      const label = meta.task_name || meta.agent_role || "AI step";
      const phase = ensureAiPhase(step, label, aiKind);
      phase.events.push(event);
      if (isErrorEvent(event)) {
        phase.status = "failed";
        step.status = "failed";
      } else if (phase.status !== "failed") phase.status = "running";
      return;
    }

    if (text.includes("verify") || text.includes("check") || text.includes("assert")) {
      step.check.events.push(event);
      if (isErrorEvent(event)) step.check.status = "failed";
      else if (step.check.status !== "failed") step.check.status = step.check.events.length ? "passed" : "pending";
    } else if (text.includes("navigate") || text.includes("click") || text.includes("goto")) {
      step.navigate.events.push(event);
      if (isErrorEvent(event)) step.navigate.status = "failed";
      else if (step.navigate.status !== "failed") step.navigate.status = step.navigate.events.length ? "passed" : "pending";
    }

    if (step.status !== "failed" && step.events.length) step.status = "running";
  }

  function findCase(cases, { index, childId, meta, linkedCases }) {
    if (childId) {
      const byChild = cases.find((c) => c.childId === childId);
      if (byChild) return byChild;
    }
    if (meta?.proposed_case_id) {
      const byId = cases.find((c) => c.id === meta.proposed_case_id);
      if (byId) return byId;
    }
    if (index != null && index > 0) {
      if (cases[index - 1]) return cases[index - 1];
      if (linkedCases?.[index - 1]) {
        const lc = linkedCases[index - 1];
        return cases.find((c) => c.id === lc.id) || cases[index - 1];
      }
    }
    return null;
  }

  function deriveCaseStatus(caseNode) {
    if (caseNode.steps.some((s) => s.status === "failed")) return "failed";
    if (caseNode.steps.some((s) => s.status === "running")) return "running";
    if (caseNode.steps.length && caseNode.steps.every((s) => s.status === "passed")) return "passed";
    if (caseNode.events.some(isErrorEvent)) return "failed";
    if (caseNode.events.some((e) => String(e.name || "").toLowerCase().includes("started"))) return "running";
    return caseNode.status || "pending";
  }

  function buildExecutionTree(events, linkedCases) {
    const sorted = [...(events || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    const setup = { id: "setup", label: "Request setup", status: "pending", events: [] };
    const cases = (linkedCases || []).map((c, i) => ({
      id: c.id || `case-${i + 1}`,
      title: c.title || `Case ${i + 1}`,
      category: c.categoryLabel || c.category || "",
      status: normStatus(c.status),
      runKind: null,
      childId: c.childId || c.child_id || null,
      steps: [],
      events: [],
    }));

    if (!cases.length) {
      cases.push({
        id: "case-primary",
        title: "Test case",
        category: "",
        status: "pending",
        runKind: null,
        childId: null,
        steps: [],
        events: [],
      });
    }

    let currentCase = null;

    for (const event of sorted) {
      const text = eventText(event);
      const meta = event.meta || {};

      if (isSetupEvent(event, text)) {
        setup.events.push(event);
        continue;
      }

      const child = parseChildRun(text);
      if (child || meta.child_id) {
        currentCase =
          findCase(cases, {
            index: child?.index,
            childId: meta.child_id,
            meta,
            linkedCases,
          }) || currentCase;
        if (currentCase) {
          currentCase.events.push(event);
          if (text.includes("started") || text.includes("running")) currentCase.status = "running";
          if (text.includes("passed") || text.includes("completed")) currentCase.status = "passed";
          if (isErrorEvent(event) || text.includes("failed")) currentCase.status = "failed";
          const rk = inferRunKind(text, meta);
          if (rk) currentCase.runKind = rk;
        }
        continue;
      }

      const stepInfo = parseStep(text);
      if (stepInfo && currentCase) {
        let step = currentCase.steps.find((s) => s.index === stepInfo.index);
        if (!step) {
          step = createStep(stepInfo.index, stepInfo.title);
          currentCase.steps.push(step);
        }
        attachToStep(step, event, text, meta);
        continue;
      }

      if (currentCase) {
        currentCase.events.push(event);
        const rk = inferRunKind(text, meta);
        if (rk) currentCase.runKind = rk;
        if (isErrorEvent(event)) currentCase.status = "failed";
        continue;
      }

      setup.events.push(event);
    }

    if (setup.events.length) {
      setup.status = setup.events.some(isErrorEvent) ? "failed" : "complete";
    } else {
      setup.status = "pending";
    }

    cases.forEach((c) => {
      c.steps.sort((a, b) => a.index - b.index);
      c.steps.forEach((step) => {
        if (step.status === "pending" && step.events.length) {
          step.status = step.events.some(isErrorEvent) ? "failed" : "passed";
        }
        if (step.runKind === "automation" && step.automation.status === "running" && !step.events.some(isErrorEvent)) {
          step.automation.status = "passed";
        }
      });
      c.status = deriveCaseStatus(c);
      if (!c.runKind) {
        c.runKind = c.steps.some((s) => s.runKind === "automation")
          ? "automation"
          : c.steps.some((s) => s.runKind === "ai")
            ? "ai"
            : null;
      }
    });

    return { setup, cases };
  }

  function collectNodeEvents(node) {
    if (!node) return [];
    if (node.events?.length) return node.events;
    if (node.type === "step") {
      return [
        ...(node.navigate?.events || []),
        ...(node.check?.events || []),
        ...(node.automation?.events || []),
        ...(node.aiPhases || []).flatMap((p) => p.events || []),
        ...(node.events || []),
      ];
    }
    return [];
  }

  function countErrorsInTree(tree) {
    let n = 0;
    const walk = (evs) => {
      (evs || []).forEach((e) => {
        if (isErrorEvent(e)) n += 1;
      });
    };
    walk(tree.setup?.events);
    tree.cases?.forEach((c) => {
      walk(c.events);
      c.steps?.forEach((s) => walk(collectNodeEvents({ ...s, type: "step" })));
    });
    return n;
  }

  function findFirstErrorNode(tree) {
    if (tree.setup?.events?.some(isErrorEvent)) return { kind: "setup", id: "setup" };
    for (const c of tree.cases || []) {
      for (const s of c.steps || []) {
        if (s.status === "failed" || collectNodeEvents({ ...s, type: "step" }).some(isErrorEvent)) {
          return { kind: "step", id: `${c.id}:${s.index}`, caseId: c.id, stepIndex: s.index };
        }
      }
      if (c.status === "failed" || c.events.some(isErrorEvent)) {
        return { kind: "case", id: c.id };
      }
    }
    return null;
  }

  window.QopsRequestExecutionTree = {
    buildExecutionTree,
    collectNodeEvents,
    countErrorsInTree,
    findFirstErrorNode,
    isErrorEvent,
    normStatus,
    escapeHtml,
  };
})();
