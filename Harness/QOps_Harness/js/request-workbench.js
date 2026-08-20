/**
 * Request workbench — Info · Execution · History.
 * Field catalog and history logic live in request-workbench-core.js.
 * Execution grouping lives in request-execution-tree.js.
 */
(function () {
  const core = globalThis.QopsRequestWorkbenchCore;
  const execTree = globalThis.QopsRequestExecutionTree;
  if (!core) {
    console.error("request-workbench-core.js must load before request-workbench.js");
    return;
  }

  const {
    INFO_FIELD_DEFS,
    escapeHtml,
    loadInfoFieldPrefs,
    saveInfoFieldPrefs,
    renderAttributeRow,
    isErrorEvent,
    buildHistoryEntries,
  } = core;

  const buildExecutionTree = execTree?.buildExecutionTree || (() => ({ setup: { events: [] }, cases: [] }));
  const collectNodeEvents = execTree?.collectNodeEvents || (() => []);
  const findFirstErrorNode = execTree?.findFirstErrorNode || (() => null);
  const findRunningStepInTree = execTree?.findRunningStepInTree || function findRunningStepInTree(tree) {
    if (!tree?.cases?.length) return null;
    for (const c of tree.cases) {
      for (const step of c.steps || []) {
        if (String(step.status || "").toLowerCase() === "running") {
          return {
            caseTitle: c.title,
            stepIndex: step.index,
            stepTitle: step.title,
            runKind: step.runKind,
          };
        }
      }
    }
    return null;
  };
  const countErrorsInTree = execTree?.countErrorsInTree || (() => 0);

  function truncateTitle(text, max = 72) {
    const t = String(text || "").trim();
    if (!t) return "Untitled request";
    const line = t.split("\n")[0];
    return line.length > max ? line.slice(0, max - 1) + "…" : line;
  }

  function statusClass(status) {
    if (status === "completed" || status === "awaiting_review" || status === "successful") {
      return "request-workbench__status--pass";
    }
    if (status === "failed" || status === "error") return "request-workbench__status--fail";
    if (status === "running") return "request-workbench__status--run";
    return "";
  }

  function caseStatusPill(status) {
    const s = String(status || "").toLowerCase();
    if (s === "failed" || s === "fail" || s === "error") {
      return `<span class="request-workbench__case-status request-workbench__case-status--fail">Failed</span>`;
    }
    if (s === "passed" || s === "pass" || s === "completed" || s === "successful") {
      return `<span class="request-workbench__case-status request-workbench__case-status--pass">Passed</span>`;
    }
    if (s === "proposed" || s === "awaiting_review") {
      return `<span class="request-workbench__case-status request-workbench__case-status--proposed">Proposed</span>`;
    }
    if (s === "running") {
      return `<span class="request-workbench__case-status request-workbench__case-status--run">Running</span>`;
    }
    if (s === "pending" || s === "queued") {
      return `<span class="request-workbench__case-status">Pending</span>`;
    }
    return "";
  }

  class RequestWorkbench {
    constructor(options) {
      this.root = options.root;
      this.onReviewCases = options.onReviewCases || (() => {});
      this.onCaseClick = options.onCaseClick || null;
      this.typeLabels = options.typeLabels || {};
      this.formatLogText = options.formatLogText || ((t) => escapeHtml(t));
      this.previewText = options.previewText || ((e) => e.name || "");
      this._request = null;
      this._tab = "info";
      this._events = [];
      this._selectedNodeKey = null;
      this._executionTree = null;
      this._errorsOnly = false;
      this._infoFieldPrefs = loadInfoFieldPrefs();
      this._settingsOpen = false;
      this._onDocClick = this._handleDocClick.bind(this);
      this._renderShell();
      this._bindTabs();
      this._bindInfoPaneEvents();
    }

    _renderShell() {
      this.root.innerHTML = `
        <div class="request-workbench" data-component="request-workbench">
          <div class="request-workbench__idle" data-ref="idle">
            <div class="empty-state">
              <p class="empty-state__title" data-ref="idleTitle">No request selected</p>
              <p class="empty-state__hint" data-ref="idleHint">Choose a request from the list, or create a new one.</p>
            </div>
          </div>
          <div class="request-workbench__panel" data-ref="panel" hidden>
            <header class="request-workbench__hero">
              <div class="request-workbench__hero-top">
                <h2 class="request-workbench__title" data-ref="heroTitle">—</h2>
                <span class="request-workbench__status" data-ref="heroStatus"></span>
              </div>
              <div class="request-workbench__chips" data-ref="heroChips"></div>
            </header>
            <nav class="request-workbench__tabs" role="tablist" aria-label="Request sections">
              <button type="button" class="request-workbench__tab" role="tab" id="rw-tab-info" data-tab="info" aria-controls="rw-pane-info" aria-selected="true">Info</button>
              <button type="button" class="request-workbench__tab" role="tab" id="rw-tab-events" data-tab="events" aria-controls="rw-pane-events">Execution<span class="request-workbench__tab-live" data-ref="eventsTabLive" hidden aria-hidden="true"></span></button>
              <button type="button" class="request-workbench__tab" role="tab" id="rw-tab-history" data-tab="history" aria-controls="rw-pane-history">History</button>
            </nav>
            <div class="request-workbench__body">
              <section class="request-workbench__pane" id="rw-pane-info" data-pane="info" role="tabpanel" aria-labelledby="rw-tab-info">
                <div class="request-workbench__info" data-ref="infoPane"></div>
              </section>
              <section class="request-workbench__pane" id="rw-pane-events" data-pane="events" role="tabpanel" aria-labelledby="rw-tab-events" hidden>
                <div class="request-workbench__events-toolbar view-toolbar" data-ref="eventsToolbar">
                  <div class="request-workbench__events-toolbar-start">
                    <p class="request-workbench__now-running" data-ref="nowRunning" hidden role="status" aria-live="polite"></p>
                    <label class="request-workbench__filter">
                      <input type="checkbox" data-ref="errorsOnly" />
                      <span>Errors only</span>
                    </label>
                  </div>
                  <span class="request-workbench__events-count" data-ref="eventsCount" aria-live="polite">0 steps</span>
                </div>
                <div class="request-workbench__events-split" data-ref="eventsSplit">
                  <div class="request-workbench__events-list-wrap">
                    <div class="request-workbench__events-list-head">Progress</div>
                    <div class="request-workbench__events-list" data-ref="eventsList" role="tree" aria-label="Test case execution" aria-live="polite" aria-relevant="additions"></div>
                  </div>
                  <aside class="request-workbench__events-detail" data-ref="eventsDetail" aria-label="Step output">
                    <div class="request-workbench__events-detail-head">Output</div>
                    <div class="request-workbench__events-detail-idle" data-ref="eventsDetailIdle">
                      <p class="empty-state__title">No step selected</p>
                      <p class="empty-state__hint">Choose a test case or step on the left to see Navigate / Check actions, automation logs, or AI phases.</p>
                    </div>
                    <div class="request-workbench__events-detail-panel" data-ref="eventsDetailPanel" hidden></div>
                  </aside>
                </div>
              </section>
              <section class="request-workbench__pane" id="rw-pane-history" data-pane="history" role="tabpanel" aria-labelledby="rw-tab-history" hidden>
                <div class="request-workbench__history" data-ref="historyPane"></div>
              </section>
            </div>
          </div>
        </div>`;

      this.refs = {};
      this.root.querySelectorAll("[data-ref]").forEach((el) => {
        this.refs[el.dataset.ref] = el;
      });

      this.refs.errorsOnly?.addEventListener("change", () => {
        this._errorsOnly = Boolean(this.refs.errorsOnly.checked);
        this._renderExecutionFeed();
      });
    }

    _bindTabs() {
      this.root.querySelectorAll(".request-workbench__tab").forEach((btn) => {
        btn.addEventListener("click", () => this.setTab(btn.dataset.tab));
      });
    }

    setTab(tab) {
      if (!["info", "events", "history"].includes(tab)) return;
      this._tab = tab;
      this.root.querySelectorAll(".request-workbench__tab").forEach((btn) => {
        const on = btn.dataset.tab === tab;
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.tabIndex = on ? 0 : -1;
      });
      this.root.querySelectorAll(".request-workbench__pane").forEach((pane) => {
        pane.hidden = pane.dataset.pane !== tab;
      });
      if (tab === "history" && this._request) this._renderHistory(this._request);
      if (tab === "events") this._ensureExecutionSelection();
    }

    _defaultTabForRequest(req) {
      return String(req?.status || "").toLowerCase() === "running" ? "events" : "info";
    }

    _rebuildExecutionTree() {
      if (this._request?.executionTree) {
        this._executionTree = this._request.executionTree;
        return;
      }
      this._executionTree = buildExecutionTree(this._events, this._request?.linkedCases || []);
    }

    _nodeKey(kind, id) {
      return `${kind}:${id}`;
    }

    _parseNodeKey(key) {
      if (!key) return null;
      const i = key.indexOf(":");
      if (i < 0) return null;
      return { kind: key.slice(0, i), id: key.slice(i + 1) };
    }

    _stepStatusClass(status) {
      const s = String(status || "").toLowerCase();
      if (s === "passed") return "exec-node__status--pass";
      if (s === "failed") return "exec-node__status--fail";
      if (s === "running") return "exec-node__status--run";
      if (s === "skipped") return "exec-node__status--skip";
      return "exec-node__status--pending";
    }

    _runKindLabel(kind) {
      if (kind === "automation") return "Automation script";
      if (kind === "ai") return "AI steps";
      return "Pending";
    }

    _handleDocClick(e) {
      if (!this._settingsOpen) return;
      const wrap = this.refs.infoPane?.querySelector(".request-workbench__info-settings");
      if (wrap && !wrap.contains(e.target)) this._closeInfoSettings();
    }

    _closeInfoSettings() {
      this._settingsOpen = false;
      const pop = this.refs.infoPane?.querySelector("[data-ref='infoSettingsPopover']");
      if (pop) pop.hidden = true;
      const btn = this.refs.infoPane?.querySelector('[data-action="info-settings"]');
      btn?.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", this._onDocClick);
    }

    _toggleInfoSettings(btn) {
      const pop = this.refs.infoPane?.querySelector("[data-ref='infoSettingsPopover']");
      if (!pop || !btn) return;
      const willOpen = pop.hidden;
      if (willOpen) {
        pop.hidden = false;
        btn.setAttribute("aria-expanded", "true");
        this._settingsOpen = true;
        document.removeEventListener("click", this._onDocClick);
        setTimeout(() => document.addEventListener("click", this._onDocClick), 0);
        btn.focus();
      } else {
        this._closeInfoSettings();
      }
    }

    _restoreInfoSettingsOpenState() {
      if (!this._settingsOpen) return;
      const pop = this.refs.infoPane?.querySelector("[data-ref='infoSettingsPopover']");
      const btn = this.refs.infoPane?.querySelector('[data-action="info-settings"]');
      if (pop) pop.hidden = false;
      btn?.setAttribute("aria-expanded", "true");
      document.removeEventListener("click", this._onDocClick);
      setTimeout(() => document.addEventListener("click", this._onDocClick), 0);
    }

    _bindInfoPaneEvents() {
      if (this._infoEventsBound || !this.refs.infoPane) return;
      this._infoEventsBound = true;

      this.refs.infoPane.addEventListener("click", (e) => {
        const settingsBtn = e.target.closest('[data-action="info-settings"]');
        if (settingsBtn) {
          e.stopPropagation();
          this._toggleInfoSettings(settingsBtn);
          return;
        }
        if (e.target.closest(".request-workbench__settings-popover")) {
          e.stopPropagation();
        }
      });

      this.refs.infoPane.addEventListener("change", (e) => {
        const input = e.target.closest("input[data-field-id]");
        if (!input || !this._request) return;
        e.stopPropagation();
        this._infoFieldPrefs[input.dataset.fieldId] = input.checked;
        saveInfoFieldPrefs(this._infoFieldPrefs);
        this._refreshAttributesSection(this._request);
      });
    }

    _renderInfoSettingsPopover() {
      const checks = INFO_FIELD_DEFS.map(
        (def) => `
        <label class="request-workbench__settings-option">
          <input type="checkbox" data-field-id="${escapeHtml(def.id)}" ${this._infoFieldPrefs[def.id] ? "checked" : ""} />
          <span>${escapeHtml(def.label)}</span>
        </label>`
      ).join("");

      return `
        <div class="request-workbench__info-settings">
          <button type="button" class="btn btn-secondary btn-small" data-action="info-settings" data-icon="settings" data-label="Customize fields" aria-expanded="false" aria-haspopup="true">Customize fields</button>
          <div class="request-workbench__settings-popover" data-ref="infoSettingsPopover" hidden role="dialog" aria-label="Visible request attributes">
            <p class="request-workbench__settings-title">Show in Info</p>
            <p class="request-workbench__settings-hint">Saved for your account on this browser.</p>
            <div class="request-workbench__settings-list">${checks}</div>
          </div>
        </div>`;
    }

    _renderAttributesSectionInner(req) {
      const visibleDefs = INFO_FIELD_DEFS.filter((def) => this._infoFieldPrefs[def.id]);
      const rows = visibleDefs.map((def) => renderAttributeRow(def, req)).filter(Boolean).join("");

      return `
          <h3 class="request-workbench__section-title">Request attributes</h3>
          ${
            rows
              ? `<dl class="detail-dl detail-dl--compact">${rows}</dl>`
              : `<p class="empty-state__hint" style="margin:0;">No attributes visible — click <strong>Customize fields</strong> above to show status, mode, created time, and more.</p>`
          }`;
    }

    _renderAttributesSection(req) {
      return `
        <div class="request-workbench__section request-workbench__attributes" data-ref="attributesMount">
          ${this._renderAttributesSectionInner(req)}
        </div>`;
    }

    _refreshAttributesSection(req) {
      const mount = this.refs.infoPane?.querySelector('[data-ref="attributesMount"]');
      if (!mount) return;
      mount.innerHTML = this._renderAttributesSectionInner(req);
    }

    reset(message) {
      this._request = null;
      this._events = [];
      this._selectedNodeKey = null;
      this._executionTree = null;
      this._errorsOnly = false;
      this._closeInfoSettings();
      if (this.refs.errorsOnly) this.refs.errorsOnly.checked = false;
      if (this.refs.idle) this.refs.idle.hidden = false;
      if (this.refs.panel) this.refs.panel.hidden = true;
      if (this.refs.idleHint && message) this.refs.idleHint.textContent = message;
      if (this.refs.eventsList) this.refs.eventsList.innerHTML = "";
      this._renderExecutionDetail(null);
      if (this.refs.infoPane) this.refs.infoPane.innerHTML = "";
      if (this.refs.historyPane) this.refs.historyPane.innerHTML = "";
      this._updateExecutionCount();
    }

    setLoading() {
      if (this.refs.idle) this.refs.idle.hidden = true;
      if (this.refs.panel) this.refs.panel.hidden = false;
      this.setTab("info");
      if (this.refs.infoPane) {
        this.refs.infoPane.innerHTML = `<div class="loading-panel"><p class="idle">Loading request…</p></div>`;
      }
      if (this.refs.eventsList) {
        this.refs.eventsList.innerHTML = `<div class="loading-panel"><p class="idle">Loading execution…</p></div>`;
      }
      this._renderExecutionDetail(null);
      if (this.refs.historyPane) {
        this.refs.historyPane.innerHTML = `<div class="loading-panel"><p class="idle">Loading history…</p></div>`;
      }
    }

    setRequest(req) {
      this._request = req;
      if (this.refs.idle) this.refs.idle.hidden = true;
      if (this.refs.panel) this.refs.panel.hidden = false;

      const title = truncateTitle(req.user_input);
      if (this.refs.heroTitle) this.refs.heroTitle.textContent = title;
      if (this.refs.heroStatus) {
        this.refs.heroStatus.textContent = req.status || "—";
        this.refs.heroStatus.className = `request-workbench__status ${statusClass(req.status)}`;
      }
      if (this.refs.heroChips) {
        const shortId = req.shortId || req.quest_id || req.runId || "—";
        const mode = req.modeLabel || req.request_mode || req.mode || "—";
        const caseCount = Array.isArray(req.linkedCases) ? req.linkedCases.length : 0;
        const caseChip =
          caseCount > 0
            ? `<span class="request-workbench__chip">${caseCount} test case${caseCount === 1 ? "" : "s"}</span>`
            : "";
        const runningChip = this._runningChipHtml();
        this.refs.heroChips.innerHTML = `
          <span class="request-workbench__chip">${escapeHtml(shortId)}</span>
          <span class="request-workbench__chip">${escapeHtml(mode)}</span>${caseChip}${runningChip}`;
      }

      this._renderInfo(req);
      this._renderHistory(req);
      this._rebuildExecutionTree();
      if (this._events.length) this._renderExecutionFeed();
      this.setTab(this._defaultTabForRequest(req));
      this._updateRunningContext();
    }

    _runningChipHtml() {
      const status = String(this._request?.status || "").toLowerCase();
      if (status !== "running") return "";
      this._rebuildExecutionTree();
      const active = findRunningStepInTree(this._executionTree);
      if (!active) return `<span class="request-workbench__chip request-workbench__chip--live">Live</span>`;
      const label = active.stepIndex
        ? `Step ${active.stepIndex} running`
        : "Case running";
      return `<span class="request-workbench__chip request-workbench__chip--live">${escapeHtml(label)}</span>`;
    }

    _updateRunningContext() {
      const status = String(this._request?.status || "").toLowerCase();
      const isRunning = status === "running";
      const workbench = this.root.querySelector(".request-workbench");
      workbench?.classList.toggle("request-workbench--live", isRunning);

      if (this.refs.eventsTabLive) {
        this.refs.eventsTabLive.hidden = !isRunning;
      }

      if (!this.refs.nowRunning) return;

      if (!isRunning) {
        this.refs.nowRunning.hidden = true;
        this.refs.nowRunning.textContent = "";
        return;
      }

      this._rebuildExecutionTree();
      const active = findRunningStepInTree(this._executionTree);
      if (!active) {
        this.refs.nowRunning.hidden = false;
        this.refs.nowRunning.textContent = "Request is running — step tree will update as child runs progress.";
        return;
      }

      const kind =
        active.runKind === "automation"
          ? "Automation script"
          : active.runKind === "ai"
            ? "AI phases"
            : "";
      const stepLine = active.stepIndex
        ? `Step ${active.stepIndex}${active.stepTitle ? `: ${active.stepTitle}` : ""}`
        : active.caseTitle || "In progress";
      this.refs.nowRunning.hidden = false;
      this.refs.nowRunning.textContent = [stepLine, kind, active.caseTitle && active.stepIndex ? active.caseTitle : ""]
        .filter(Boolean)
        .join(" · ");
    }

    _renderLinkedCasesSection(req) {
      const cases = Array.isArray(req.linkedCases) ? req.linkedCases : [];
      const status = String(req.status || "").toLowerCase();

      if (!cases.length) {
        if (status === "queued" || status === "running") {
          return `
        <div class="request-workbench__section">
          <h3 class="request-workbench__section-title">Linked test cases</h3>
          <p class="empty-state__hint" style="margin:0;">Test cases will appear here once generation completes.</p>
        </div>`;
        }
        return "";
      }

      const items = cases
        .map((c) => {
          const pill = caseStatusPill(c.status || c.outcome);
          const meta =
            c.stepCount != null
              ? `<span class="request-workbench__case-meta">${escapeHtml(String(c.stepCount))} steps</span>`
              : c.outcomeSummary
                ? `<span class="request-workbench__case-meta">${escapeHtml(c.outcomeSummary)}</span>`
                : "";
          const cat = c.categoryLabel || c.category;
          return `
          <button type="button" class="request-workbench__case-item" data-case-id="${escapeHtml(c.id || "")}" role="listitem">
            <span class="request-workbench__case-main">
              <span class="request-workbench__case-title">${escapeHtml(c.title || "Untitled case")}</span>
              <span class="request-workbench__case-sub">
                ${cat ? `<span class="chip request-workbench__case-cat">${escapeHtml(cat)}</span>` : ""}
                ${meta}
              </span>
            </span>
            ${pill}
          </button>`;
        })
        .join("");

      const hint =
        cases.length === 1
          ? `<p class="request-workbench__section-hint">This request runs one test case.</p>`
          : `<p class="request-workbench__section-hint">${cases.length} test cases linked to this request — click a row to open review.</p>`;

      return `
        <div class="request-workbench__section">
          <div class="request-workbench__section-head">
            <h3 class="request-workbench__section-title">Linked test cases</h3>
            <span class="request-workbench__case-count" aria-label="${cases.length} linked test cases">${cases.length}</span>
          </div>
          ${hint}
          <div class="request-workbench__case-list" role="list">${items}</div>
        </div>`;
    }

    _renderInfo(req) {
      if (!this.refs.infoPane) return;
      const canReview = req.canReview;
      const reviewLabel = req.reviewLabel || "Review cases";
      const reviewBtn = canReview
        ? `<button type="button" class="btn btn-teal btn-small" data-action="review-cases" data-icon="list">${escapeHtml(reviewLabel)}</button>`
        : `<p class="empty-state__hint" style="margin:0;">Request is still processing — watch Execution for live progress by test case and step.</p>`;

      this.refs.infoPane.innerHTML = `
        <div class="request-workbench__info-toolbar">
          ${this._renderInfoSettingsPopover()}
        </div>
        <div class="request-workbench__section">
          <h3 class="request-workbench__section-title">Test request</h3>
          <p class="request-workbench__input-block">${escapeHtml(req.user_input || "—")}</p>
        </div>
        <div class="request-workbench__section">
          <h3 class="request-workbench__section-title">Request ID</h3>
          <p><code class="request-workbench__mono">${escapeHtml(req.quest_id || req.runId || "—")}</code></p>
        </div>
        ${this._renderAttributesSection(req)}
        ${this._renderLinkedCasesSection(req)}
        <div class="request-workbench__section request-workbench__actions">
          <h3 class="request-workbench__section-title">Next step</h3>
          <div class="request-workbench__action-row">${reviewBtn}</div>
        </div>`;

      if (window.enhanceButtons) window.enhanceButtons(this.refs.infoPane);
      this._restoreInfoSettingsOpenState();
      this.refs.infoPane.querySelector('[data-action="review-cases"]')?.addEventListener("click", () => {
        this.onReviewCases(req);
      });
      this.refs.infoPane.querySelectorAll(".request-workbench__case-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const caseId = btn.dataset.caseId;
          const linked = (req.linkedCases || []).find((c) => String(c.id) === String(caseId));
          if (this.onCaseClick) this.onCaseClick(req, linked || { id: caseId });
          else if (req.canReview) this.onReviewCases(req);
        });
      });
    }

    _renderHistory(req) {
      if (!this.refs.historyPane) return;
      const entries = buildHistoryEntries(req, this._events, this.typeLabels);

      if (!entries.length) {
        this.refs.historyPane.innerHTML = `
          <div class="empty-state">
            <p class="empty-state__title">No history yet</p>
            <p class="empty-state__hint">Creation time and live events will appear here as the request progresses.</p>
          </div>`;
        return;
      }

      const milestones = entries.filter((e) => e.kind === "milestone");
      const activity = entries.filter((e) => e.kind === "event" || e.kind === "error");

      const milestoneRows = milestones.length
        ? milestones
            .map(
              (e) => `
            <li class="request-workbench__audit-item request-workbench__audit-item--milestone">
              <span class="request-workbench__audit-when">${escapeHtml(e.at)}</span>
              <span class="request-workbench__audit-what">${escapeHtml(e.what)}</span>
              <span class="request-workbench__audit-who">${escapeHtml(e.who)}</span>
            </li>`
            )
            .join("")
        : "";

      const activityRows = activity.length
        ? activity
            .map((e) => {
              const jump = e.eventId
                ? `<button type="button" class="request-workbench__audit-jump" data-goto-event="${escapeHtml(e.eventId)}" aria-label="View in Execution tab">View</button>`
                : "";
              return `
            <li class="request-workbench__audit-item${e.kind === "error" ? " request-workbench__audit-item--error" : ""}">
              <span class="request-workbench__audit-when">${escapeHtml(e.at)}</span>
              <span class="request-workbench__audit-what">${escapeHtml(e.what)}</span>
              <span class="request-workbench__audit-who">${escapeHtml(e.who)}</span>
              ${jump}
            </li>`;
            })
            .join("")
        : `<li class="request-workbench__audit-empty">No events recorded yet.</li>`;

      this.refs.historyPane.innerHTML = `
        ${
          milestoneRows
            ? `<div class="request-workbench__section">
          <h3 class="request-workbench__section-title">Lifecycle</h3>
          <ul class="request-workbench__audit-list">${milestoneRows}</ul>
        </div>`
            : ""
        }
        <div class="request-workbench__section">
          <h3 class="request-workbench__section-title">Activity log</h3>
          <p class="request-workbench__section-hint">Chronological audit — open Execution for step-level logs.</p>
          <ul class="request-workbench__audit-list">${activityRows}</ul>
        </div>`;

      this.refs.historyPane.querySelectorAll("[data-goto-event]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.gotoEvent;
          const ev = this._events.find((e) => e.id === id);
          if (ev) this.selectEvent(ev, { switchTab: true });
        });
      });
    }

    clearActivity() {
      this._events = [];
      this._selectedNodeKey = null;
      this._executionTree = null;
      if (this.refs.eventsList) this.refs.eventsList.innerHTML = "";
      this._renderExecutionDetail(null);
      this._updateExecutionCount();
      if (this._request && this._tab === "history") this._renderHistory(this._request);
    }

    setActivityEmpty() {
      this._events = [];
      this._selectedNodeKey = null;
      this._executionTree = null;
      if (this.refs.eventsList) {
        this.refs.eventsList.innerHTML = `<div class="empty-state"><p class="empty-state__hint">No execution yet — live progress will appear here grouped by test case and step.</p></div>`;
      }
      this._renderExecutionDetail(null);
      this._updateExecutionCount();
      if (this._request && this._tab === "history") this._renderHistory(this._request);
    }

    appendActivity(event, { autoSelect = false, scrollIntoView = true } = {}) {
      if (!event?.id) return;
      const existing = this._events.findIndex((e) => e.id === event.id);
      if (existing >= 0) this._events[existing] = event;
      else this._events.push(event);

      this._rebuildExecutionTree();
      if (autoSelect) {
        const errNode = findFirstErrorNode(this._executionTree);
        if (errNode) {
          this._selectedNodeKey = this._nodeKey(errNode.kind === "step" ? "step" : errNode.kind, errNode.id);
        }
      }
      this._renderExecutionFeed();

      if (scrollIntoView && this._tab === "events" && this._selectedNodeKey) {
        requestAnimationFrame(() => this._scrollNodeIntoList(this._selectedNodeKey));
      }

      this._updateExecutionCount();
      this._updateRunningContext();
      if (this._request && this._tab === "history") this._renderHistory(this._request);
    }

    appendMockActivity(line, index, { autoSelect = false } = {}) {
      const isErr = line.cls === "error" || line.level === "error";
      const event = {
        id: `mock-${index}`,
        name: line.text,
        content: line.detail || line.text,
        type: isErr ? "error" : line.cls === "ok" ? "ok" : "info",
        level: isErr ? "error" : line.level || "info",
        sequence: index + 1,
        timestamp: line.ts,
        meta: line.meta || {},
      };
      this.appendActivity(event, { autoSelect, scrollIntoView: true });
    }

    selectEvent(event, { switchTab = false } = {}) {
      if (!event) return;
      if (switchTab) this.setTab("events");
      this._rebuildExecutionTree();
      const tree = this._executionTree;
      let found = null;
      for (const c of tree?.cases || []) {
        for (const s of c.steps || []) {
          const evs = collectNodeEvents({ ...s, type: "step" });
          if (evs.some((e) => e.id === event.id)) {
            found = this._nodeKey("step", `${c.id}:${s.index}`);
            break;
          }
        }
        if (found) break;
        if ((c.events || []).some((e) => e.id === event.id)) {
          found = this._nodeKey("case", c.id);
          break;
        }
      }
      if (!found && (tree?.setup?.events || []).some((e) => e.id === event.id)) {
        found = this._nodeKey("setup", "setup");
      }
      this._selectedNodeKey = found;
      this._renderExecutionFeed();
      if (found) requestAnimationFrame(() => this._scrollNodeIntoList(found));
    }

    _ensureExecutionSelection() {
      this._rebuildExecutionTree();
      const tree = this._executionTree;
      if (!tree || (!tree.setup?.events?.length && !tree.cases?.length)) {
        this._selectedNodeKey = null;
        this._renderExecutionDetail(null);
        return;
      }
      if (!this._selectedNodeKey || !this._nodeVisible(this._selectedNodeKey)) {
        const errNode = findFirstErrorNode(tree);
        if (errNode && this._errorsOnly) {
          this._selectedNodeKey =
            errNode.kind === "step"
              ? this._nodeKey("step", errNode.id)
              : this._nodeKey(errNode.kind, errNode.id);
        } else {
          const runningCase = tree.cases?.find((c) => c.status === "running");
          if (runningCase) {
            const runningStep = runningCase.steps?.find((s) => s.status === "running" || s.status === "failed");
            if (runningStep) {
              this._selectedNodeKey = this._nodeKey("step", `${runningCase.id}:${runningStep.index}`);
            } else {
              this._selectedNodeKey = this._nodeKey("case", runningCase.id);
            }
          } else {
            const err = findFirstErrorNode(tree);
            if (err) {
              this._selectedNodeKey =
                err.kind === "step" ? this._nodeKey("step", err.id) : this._nodeKey(err.kind, err.id);
            } else if (tree.cases?.length) {
              const lastCase = tree.cases[tree.cases.length - 1];
              const lastStep = lastCase.steps?.[lastCase.steps.length - 1];
              this._selectedNodeKey = lastStep
                ? this._nodeKey("step", `${lastCase.id}:${lastStep.index}`)
                : this._nodeKey("case", lastCase.id);
            } else {
              this._selectedNodeKey = this._nodeKey("setup", "setup");
            }
          }
        }
      }
      this._renderExecutionFeed();
    }

    _nodeVisible(key) {
      const parsed = this._parseNodeKey(key);
      if (!parsed) return false;
      const tree = this._executionTree;
      if (!tree) return false;
      if (parsed.kind === "setup") {
        if (this._errorsOnly) return tree.setup?.events?.some(isErrorEvent);
        return Boolean(tree.setup?.events?.length);
      }
      if (parsed.kind === "case") {
        const c = tree.cases?.find((x) => x.id === parsed.id);
        if (!c) return false;
        if (this._errorsOnly) {
          return c.status === "failed" || c.steps?.some((s) => s.status === "failed");
        }
        return true;
      }
      if (parsed.kind === "step") {
        const [caseId, stepIndex] = parsed.id.split(":");
        const c = tree.cases?.find((x) => x.id === caseId);
        const step = c?.steps?.find((s) => String(s.index) === String(stepIndex));
        if (!step) return false;
        if (this._errorsOnly) return step.status === "failed";
        return true;
      }
      return false;
    }

    _scrollNodeIntoList(nodeKey) {
      const list = this.refs.eventsList;
      const node = list?.querySelector(`[data-node-key="${CSS.escape(nodeKey)}"]`);
      if (!list || !node) return;
      const listTop = list.scrollTop;
      const listHeight = list.clientHeight;
      const nodeTop = node.offsetTop;
      const nodeHeight = node.offsetHeight;
      if (nodeTop < listTop) list.scrollTop = nodeTop;
      else if (nodeTop + nodeHeight > listTop + listHeight) {
        list.scrollTop = nodeTop + nodeHeight - listHeight;
      }
    }

    _updateExecutionCount() {
      if (!this.refs.eventsCount) return;
      this._rebuildExecutionTree();
      const tree = this._executionTree;
      const caseCount = tree?.cases?.length || 0;
      const stepCount = (tree?.cases || []).reduce((n, c) => n + (c.steps?.length || 0), 0);
      const errors = countErrorsInTree(tree || { setup: { events: [] }, cases: [] });
      if (this._errorsOnly) {
        this.refs.eventsCount.textContent = `Errors only · ${errors} error${errors === 1 ? "" : "s"}`;
      } else {
        this.refs.eventsCount.textContent = `${caseCount} case${caseCount === 1 ? "" : "s"} · ${stepCount} step${stepCount === 1 ? "" : "s"}${errors ? ` · ${errors} error${errors === 1 ? "" : "s"}` : ""}`;
      }
      this._updateRunningContext();
    }

    _renderExecutionFeed() {
      if (!this.refs.eventsList) return;
      this._rebuildExecutionTree();
      const tree = this._executionTree;

      if (!this._events.length) {
        this.setActivityEmpty();
        return;
      }

      const html = this._renderExecutionTreeHtml(tree);
      if (!html.trim()) {
        this.refs.eventsList.innerHTML = `<div class="empty-state"><p class="empty-state__hint">${this._errorsOnly ? "No failed steps in this request." : "No execution data yet."}</p></div>`;
        this._selectedNodeKey = null;
        this._renderExecutionDetail(null);
        this._updateExecutionCount();
        return;
      }

      this.refs.eventsList.innerHTML = html;
      this.refs.eventsList.querySelectorAll("[data-select-node]").forEach((btn) => {
        btn.addEventListener("click", () => {
          this._selectedNodeKey = btn.dataset.selectNode;
          this._renderExecutionFeed();
        });
      });

      this._renderExecutionDetail(this._resolveSelectedNode());
      this._updateExecutionCount();
    }

    _renderExecutionTreeHtml(tree) {
      const parts = [];
      const setup = tree?.setup;
      if (setup?.events?.length) {
        const showSetup = !this._errorsOnly || setup.events.some(isErrorEvent);
        if (showSetup) {
          parts.push(this._renderTreeNode({
            key: this._nodeKey("setup", "setup"),
            title: setup.label || "Request setup",
            subtitle: `${setup.events.length} event${setup.events.length === 1 ? "" : "s"}`,
            status: setup.status,
            depth: 0,
          }));
        }
      }

      (tree?.cases || []).forEach((c, ci) => {
        const caseFailed = c.status === "failed";
        const hasFailedStep = c.steps?.some((s) => s.status === "failed");
        if (this._errorsOnly && !caseFailed && !hasFailedStep) return;

        parts.push(
          this._renderTreeNode({
            key: this._nodeKey("case", c.id),
            title: c.title || `Case ${ci + 1}`,
            subtitle: [c.category, this._runKindLabel(c.runKind)].filter(Boolean).join(" · "),
            status: c.status,
            depth: 0,
            badge: `Case ${ci + 1}`,
          })
        );

        (c.steps || []).forEach((step) => {
          if (this._errorsOnly && step.status !== "failed") return;
          parts.push(
            this._renderTreeNode({
              key: this._nodeKey("step", `${c.id}:${step.index}`),
              title: `Step ${step.index}`,
              subtitle: step.title,
              status: step.status,
              depth: 1,
              runKind: step.runKind,
            })
          );
        });
      });

      return parts.join("");
    }

    _renderTreeNode({ key, title, subtitle, status, depth, badge, runKind }) {
      const selected = this._selectedNodeKey === key;
      const indent = depth ? " exec-node--nested" : "";
      const runChip =
        runKind === "automation"
          ? `<span class="exec-node__kind exec-node__kind--auto">Auto</span>`
          : runKind === "ai"
            ? `<span class="exec-node__kind exec-node__kind--ai">AI</span>`
            : "";
      return `
        <button type="button" class="exec-node${indent}${selected ? " is-selected" : ""}${status === "failed" ? " exec-node--fail" : ""}${status === "running" ? " exec-node--run" : ""}" data-select-node="${escapeHtml(key)}" data-node-key="${escapeHtml(key)}" role="treeitem" aria-selected="${selected ? "true" : "false"}">
          <span class="exec-node__rail" aria-hidden="true"></span>
          <span class="exec-node__body">
            <span class="exec-node__top">
              ${badge ? `<span class="exec-node__badge">${escapeHtml(badge)}</span>` : ""}
              <span class="exec-node__title">${escapeHtml(title)}</span>
              ${runChip}
              <span class="exec-node__status ${this._stepStatusClass(status)}">${escapeHtml(status || "pending")}</span>
            </span>
            ${subtitle ? `<span class="exec-node__subtitle">${escapeHtml(subtitle)}</span>` : ""}
          </span>
        </button>`;
    }

    _resolveSelectedNode() {
      const parsed = this._parseNodeKey(this._selectedNodeKey);
      if (!parsed || !this._executionTree) return null;
      const tree = this._executionTree;
      if (parsed.kind === "setup") return { kind: "setup", node: tree.setup };
      if (parsed.kind === "case") {
        const c = tree.cases?.find((x) => x.id === parsed.id);
        return c ? { kind: "case", node: c } : null;
      }
      if (parsed.kind === "step") {
        const [caseId, stepIndex] = parsed.id.split(":");
        const c = tree.cases?.find((x) => x.id === caseId);
        const step = c?.steps?.find((s) => String(s.index) === String(stepIndex));
        return step ? { kind: "step", node: step, caseNode: c } : null;
      }
      return null;
    }

    _renderExecutionDetail(selection) {
      const idle = this.refs.eventsDetailIdle;
      const panel = this.refs.eventsDetailPanel;
      if (!idle || !panel) return;

      if (!selection?.node) {
        idle.hidden = false;
        panel.hidden = true;
        panel.innerHTML = "";
        return;
      }

      idle.hidden = true;
      panel.hidden = false;

      if (selection.kind === "setup") {
        panel.innerHTML = this._renderSetupDetail(selection.node);
        return;
      }
      if (selection.kind === "case") {
        panel.innerHTML = this._renderCaseDetail(selection.node);
        return;
      }
      panel.innerHTML = this._renderStepDetail(selection.node, selection.caseNode);
    }

    _renderLogEvents(events) {
      if (!events?.length) {
        return `<p class="empty-state__hint">No log output for this selection yet.</p>`;
      }
      return events
        .map((event) => {
          const err = isErrorEvent(event);
          const typeLabel = this.typeLabels[event.type] || event.type || "Log";
          let body = "";
          if (typeof event.content === "string" && event.content.trim()) {
            body = `<pre class="detail-block ansi-log event-detail__log">${this.formatLogText(event.content, { ansi: true })}</pre>`;
          } else {
            body = `<p class="event-detail__inline">${escapeHtml(event.name || "—")}</p>`;
          }
          return `
          <article class="exec-log${err ? " exec-log--error" : ""}">
            <header class="exec-log__head">
              <span class="exec-log__type">${escapeHtml(typeLabel)}</span>
              <strong class="exec-log__name">${escapeHtml(event.name || "Event")}</strong>
              <span class="exec-log__meta">${escapeHtml(event.timestamp || "—")}</span>
            </header>
            ${body}
          </article>`;
        })
        .join("");
    }

    _renderSetupDetail(setup) {
      return `
        <header class="event-detail__head">
          <div class="event-detail__head-main">
            <span class="event-detail__type">Setup</span>
            <h3 class="event-detail__title">${escapeHtml(setup.label || "Request setup")}</h3>
            <p class="event-detail__meta">Queue, session load, case generation, and review handoff</p>
          </div>
        </header>
        <div class="event-detail__body">${this._renderLogEvents(setup.events)}</div>`;
    }

    _renderCaseDetail(caseNode) {
      const stepSummary = (caseNode.steps || [])
        .map((s) => `<li class="exec-summary__step exec-summary__step--${escapeHtml(s.status)}">Step ${s.index}: ${escapeHtml(s.title)}</li>`)
        .join("");
      return `
        <header class="event-detail__head${caseNode.status === "failed" ? " event-detail__head--error" : ""}">
          <div class="event-detail__head-main">
            <span class="event-detail__type">Test case</span>
            <h3 class="event-detail__title">${escapeHtml(caseNode.title || "Test case")}</h3>
            <p class="event-detail__meta">${escapeHtml(this._runKindLabel(caseNode.runKind))} · ${escapeHtml(caseNode.status || "pending")}</p>
          </div>
        </header>
        <div class="event-detail__body">
          ${stepSummary ? `<ul class="exec-summary">${stepSummary}</ul>` : ""}
          ${this._renderLogEvents(caseNode.events)}
        </div>`;
    }

    _renderStepDetail(step, caseNode) {
      const subs = [];
      if (step.navigate?.events?.length || step.navigate?.status !== "pending") {
        subs.push(`
          <section class="exec-sub exec-sub--nav">
            <h4 class="exec-sub__label">Navigate</h4>
            <p class="exec-sub__status ${this._stepStatusClass(step.navigate.status)}">${escapeHtml(step.navigate.status || "pending")}</p>
            ${this._renderLogEvents(step.navigate.events)}
          </section>`);
      }
      if (step.check?.events?.length || step.check?.status !== "pending") {
        subs.push(`
          <section class="exec-sub exec-sub--check">
            <h4 class="exec-sub__label">Check</h4>
            <p class="exec-sub__status ${this._stepStatusClass(step.check.status)}">${escapeHtml(step.check.status || "pending")}</p>
            ${this._renderLogEvents(step.check.events)}
          </section>`);
      }
      if (step.runKind === "automation" && step.automation?.events?.length) {
        subs.push(`
          <section class="exec-sub exec-sub--auto">
            <h4 class="exec-sub__label">Automation script</h4>
            <p class="exec-sub__hint">Playwright script ran instead of AI phases for this step.</p>
            ${this._renderLogEvents(step.automation.events)}
          </section>`);
      }
      if (step.runKind === "ai" && step.aiPhases?.length) {
        step.aiPhases.forEach((phase) => {
          subs.push(`
            <section class="exec-sub exec-sub--ai">
              <h4 class="exec-sub__label">${escapeHtml(phase.label || "AI phase")}</h4>
              <p class="exec-sub__status ${this._stepStatusClass(phase.status)}">${escapeHtml(phase.status || "pending")}</p>
              ${this._renderLogEvents(phase.events)}
            </section>`);
        });
      }
      const extra = step.events?.filter(
        (e) =>
          !step.navigate?.events?.includes(e) &&
          !step.check?.events?.includes(e) &&
          !step.automation?.events?.includes(e) &&
          !(step.aiPhases || []).some((p) => p.events?.includes(e))
      );
      if (extra?.length) {
        subs.push(`<section class="exec-sub">${this._renderLogEvents(extra)}</section>`);
      }

      return `
        <header class="event-detail__head${step.status === "failed" ? " event-detail__head--error" : ""}">
          <div class="event-detail__head-main">
            <span class="event-detail__type">Step ${escapeHtml(String(step.index))}</span>
            <h3 class="event-detail__title">${escapeHtml(step.title || `Step ${step.index}`)}</h3>
            <p class="event-detail__meta">${escapeHtml(caseNode?.title || "")} · ${escapeHtml(this._runKindLabel(step.runKind))}</p>
          </div>
        </header>
        <div class="event-detail__body exec-step-detail">${subs.join("") || this._renderLogEvents(step.events)}</div>`;
    }
  }

  window.QopsRequestWorkbench = {
    RequestWorkbench,
    isErrorEvent,
    INFO_FIELD_DEFS,
    loadInfoFieldPrefs,
    saveInfoFieldPrefs,
    buildHistoryEntries,
    attributeValue: core.attributeValue,
    renderAttributeRow,
    defaultFieldPrefs: core.defaultFieldPrefs,
  };
})();
