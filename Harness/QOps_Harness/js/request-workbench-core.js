/**
 * Pure helpers for Request workbench — field prefs, attributes, history.
 * Kept in sync with qops_harness/web/request_display_fields.py
 */
(function (root, factory) {
  const core = factory(root);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = core;
  } else {
    root.QopsRequestWorkbenchCore = core;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  const INFO_FIELDS_STORAGE_PREFIX = "qops.request.infoFields.";

  const INFO_FIELD_DEFS = [
    { id: "status", label: "Status", defaultOn: true },
    { id: "request_mode", label: "Request mode", defaultOn: true },
    { id: "input_type", label: "Input type", defaultOn: false },
    { id: "session_file", label: "Session", defaultOn: false },
    { id: "ticket_issue_key", label: "Ticket key", defaultOn: false },
    { id: "ticket_url", label: "Ticket URL", defaultOn: false },
    { id: "review_status", label: "Review status", defaultOn: false },
    { id: "outcome", label: "Outcome", defaultOn: false },
    { id: "outcome_summary", label: "Outcome summary", defaultOn: false },
    { id: "submitted_at", label: "Created time", defaultOn: true },
    { id: "submitted_by", label: "Created by", defaultOn: true },
    { id: "started_at", label: "Started at", defaultOn: false },
    { id: "completed_at", label: "Completed at", defaultOn: false },
    { id: "queue_position", label: "Queue position", defaultOn: false },
    { id: "child_progress", label: "Child run progress", defaultOn: false, computed: true },
    { id: "pr_url", label: "Pull request", defaultOn: false, computed: true },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function prefsUserKey() {
    const doc = root.document;
    const email = doc?.getElementById("auth-user-email")?.textContent?.trim();
    if (email && email.includes("@")) return email.toLowerCase();
    return "local";
  }

  function defaultFieldPrefs() {
    const prefs = {};
    INFO_FIELD_DEFS.forEach((f) => {
      prefs[f.id] = Boolean(f.defaultOn);
    });
    return prefs;
  }

  function loadInfoFieldPrefs() {
    const storage = root.localStorage;
    if (!storage) return defaultFieldPrefs();
    const key = INFO_FIELDS_STORAGE_PREFIX + prefsUserKey();
    try {
      const raw = storage.getItem(key);
      if (!raw) return defaultFieldPrefs();
      const parsed = JSON.parse(raw);
      const prefs = defaultFieldPrefs();
      if (parsed && typeof parsed === "object") {
        INFO_FIELD_DEFS.forEach((f) => {
          if (typeof parsed[f.id] === "boolean") prefs[f.id] = parsed[f.id];
        });
      }
      return prefs;
    } catch (_) {
      return defaultFieldPrefs();
    }
  }

  function saveInfoFieldPrefs(prefs) {
    const storage = root.localStorage;
    if (!storage) return;
    const key = INFO_FIELDS_STORAGE_PREFIX + prefsUserKey();
    try {
      storage.setItem(key, JSON.stringify(prefs));
    } catch (_) {
      /* storage blocked */
    }
  }

  function formatTimestamp(value) {
    if (!value) return null;
    const s = String(value).trim();
    if (!s) return null;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return s;
  }

  function attributeValue(req, fieldId) {
    switch (fieldId) {
      case "status":
        return req.status || null;
      case "request_mode":
        return req.modeLabel || req.request_mode || req.mode || null;
      case "input_type":
        return req.input_type || null;
      case "session_file":
        return req.session_file || req.session || null;
      case "ticket_issue_key":
        return req.ticket_issue_key || null;
      case "ticket_url":
        return req.ticket_url || null;
      case "review_status":
        return req.review_status || null;
      case "outcome":
        return req.outcome || null;
      case "outcome_summary":
        return req.outcome_summary || null;
      case "submitted_at":
        return formatTimestamp(req.submitted_at) || req.submitted_at || null;
      case "submitted_by":
        return req.submitted_by || null;
      case "started_at":
        return formatTimestamp(req.started_at) || req.started_at || null;
      case "completed_at":
        return formatTimestamp(req.completed_at) || req.completed_at || null;
      case "child_progress": {
        const total = Number(req.children_total);
        if (!total) return null;
        const done = Number(req.children_complete) || 0;
        return `${done} / ${total} complete`;
      }
      case "queue_position": {
        const pos = Number(req.queue_position);
        return pos > 0 ? String(pos) : null;
      }
      case "pr_url":
        return req.pr_url || null;
      default:
        return null;
    }
  }

  function renderAttributeRow(def, req) {
    const raw = attributeValue(req, def.id);
    if (raw == null || raw === "") return "";
    let dd;
    if (def.id === "pr_url" || def.id === "ticket_url") {
      const url = escapeHtml(String(raw));
      dd = `<a href="${url}" class="request-workbench__link" target="_blank" rel="noopener noreferrer">${url}</a>`;
    } else if (def.id === "session_file") {
      dd = `<code class="request-workbench__mono">${escapeHtml(String(raw))}</code>`;
    } else {
      dd = escapeHtml(String(raw));
    }
    return `<div><dt>${escapeHtml(def.label)}</dt><dd>${dd}</dd></div>`;
  }

  function isErrorEvent(event) {
    const level = String(event.level || "").toLowerCase();
    const type = String(event.type || "").toLowerCase();
    if (level === "error" || level === "critical") return true;
    if (type === "error" || type === "fail" || type === "failed") return true;
    if (event.isError === true) return true;
    return false;
  }

  function pushMilestone(entries, { at, sortKey, who, what }) {
    entries.push({
      at: at || "—",
      sortKey: sortKey || "",
      who: who || "—",
      what,
      kind: "milestone",
    });
  }

  function buildHistoryEntries(req, events, typeLabels) {
    const entries = [];
    const who = req.submitted_by || "—";
    const status = String(req.status || "").toLowerCase();
    const outcome = String(req.outcome || "").toLowerCase();

    if (req.submitted_at) {
      pushMilestone(entries, {
        at: formatTimestamp(req.submitted_at) || req.submitted_at,
        sortKey: req.submitted_at,
        who,
        what: "Request created",
      });
    }

    if (status === "queued" || Number(req.queue_position) > 0) {
      pushMilestone(entries, {
        at: formatTimestamp(req.submitted_at) || req.submitted_at || "—",
        sortKey: req.submitted_at || "",
        who,
        what: "Queued for processing",
      });
    }

    if (req.started_at) {
      pushMilestone(entries, {
        at: formatTimestamp(req.started_at) || req.started_at,
        sortKey: req.started_at,
        who,
        what: "Processing started",
      });
    }

    if (status === "awaiting_review") {
      pushMilestone(entries, {
        at: formatTimestamp(req.started_at || req.submitted_at) || "—",
        sortKey: req.started_at || req.submitted_at || "",
        who,
        what: "Awaiting case review",
      });
    }

    if (req.review_updated_at) {
      pushMilestone(entries, {
        at: formatTimestamp(req.review_updated_at) || req.review_updated_at,
        sortKey: req.review_updated_at,
        who,
        what: "Review session updated",
      });
    }

    if (req.review_status === "confirmed") {
      pushMilestone(entries, {
        at: formatTimestamp(req.completed_at || req.started_at) || "—",
        sortKey: req.completed_at || req.started_at || "",
        who,
        what: "Review confirmed — execution queued",
      });
    }

    const childrenTotal = Number(req.children_total) || 0;
    const childrenComplete = Number(req.children_complete) || 0;
    if (childrenTotal > 0 && childrenComplete > 0 && childrenComplete < childrenTotal) {
      pushMilestone(entries, {
        at: formatTimestamp(req.started_at || req.submitted_at) || "—",
        sortKey: req.started_at || req.submitted_at || "",
        who,
        what: `Run in progress — ${childrenComplete} / ${childrenTotal} cases`,
      });
    }
    if (childrenTotal > 0 && childrenComplete === childrenTotal) {
      pushMilestone(entries, {
        at: formatTimestamp(req.completed_at || req.started_at) || "—",
        sortKey: req.completed_at || req.started_at || "",
        who,
        what: "All test cases executed",
      });
    }

    if (status === "failed" || status === "error" || outcome === "failed") {
      pushMilestone(entries, {
        at: formatTimestamp(req.completed_at || req.started_at) || "—",
        sortKey: req.completed_at || req.started_at || "",
        who,
        what: req.outcome_summary ? `Request failed — ${req.outcome_summary}` : "Request failed",
      });
    }

    if (req.completed_at && status !== "failed" && status !== "error" && outcome !== "failed") {
      pushMilestone(entries, {
        at: formatTimestamp(req.completed_at) || req.completed_at,
        sortKey: req.completed_at,
        who,
        what: req.outcome_summary ? `Request completed — ${req.outcome_summary}` : "Request completed",
      });
    }

    (events || []).forEach((ev) => {
      const typeLabel = typeLabels[ev.type] || ev.type || "Event";
      entries.push({
        at: ev.timestamp || (ev.sequence != null ? `#${ev.sequence}` : "—"),
        sortKey: ev.timestamp || String(ev.sequence ?? "").padStart(8, "0"),
        who: typeLabel,
        what: ev.name || "Event",
        kind: isErrorEvent(ev) ? "error" : "event",
        eventId: ev.id,
      });
    });

    entries.sort((a, b) => String(a.sortKey).localeCompare(String(b.sortKey)));
    return entries;
  }

  return {
    INFO_FIELDS_STORAGE_PREFIX,
    INFO_FIELD_DEFS,
    escapeHtml,
    prefsUserKey,
    defaultFieldPrefs,
    loadInfoFieldPrefs,
    saveInfoFieldPrefs,
    formatTimestamp,
    attributeValue,
    renderAttributeRow,
    isErrorEvent,
    buildHistoryEntries,
  };
});
