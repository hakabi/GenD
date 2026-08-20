/**
 * Reusable case workbench: Info · Steps · History.
 * Steps tab holds the stepAI flow; Edit toggles inline editor on Steps.
 */
(function () {
  const TRIAGE_LABELS = [
    { value: "unlabeled", label: "Unlabeled" },
    { value: "product_bug", label: "Product bug" },
    { value: "test_bug", label: "Test bug" },
    { value: "flaky", label: "Flaky" },
    { value: "env", label: "Environment" },
    { value: "wont_fix", label: "Won't fix" },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function failedStepLabel(c) {
    if (c.failedStepIndex == null || !c.flowSteps?.length) return "";
    const step = c.flowSteps[c.failedStepIndex];
    if (!step) return "";
    return `Step ${c.failedStepIndex + 1}: ${step.title || "Untitled step"}`;
  }

  function renderFailureBlock(c, opts = {}) {
    const failedLabel = failedStepLabel(c);
    const lastRun = c.lastRun || {};
    const screenshotLabel = c.failureScreenshotLabel || "Failure screenshot at step";
    const showMeta = opts.showMeta !== false;

    return `
      <div class="case-workbench__section case-workbench__failure">
        <h3 class="case-workbench__section-title">Last failure</h3>
        ${failedLabel ? `<p class="case-workbench__failed-at"><strong>Failed at ${escapeHtml(failedLabel)}</strong></p>` : ""}
        ${showMeta && (c.feature || c.project || c.failedAt || lastRun.at)
          ? `<p class="case-workbench__meta-line">${escapeHtml(c.feature || "")}${c.feature && c.project ? " · " : ""}${escapeHtml(c.project || "")}${(c.failedAt || lastRun.at) ? ` · ${escapeHtml(c.failedAt || lastRun.at)}` : ""}</p>`
          : ""}
        <div class="case-workbench__screenshot" role="img" aria-label="${escapeHtml(screenshotLabel)}">
          <div class="case-workbench__screenshot-inner">
            <span class="case-workbench__screenshot-badge">Screenshot</span>
            <span class="case-workbench__screenshot-hint">${escapeHtml(screenshotLabel)}</span>
            ${failedLabel ? `<span class="case-workbench__screenshot-step">${escapeHtml(failedLabel)}</span>` : ""}
          </div>
        </div>
        <div class="case-workbench__error">
          <h4>Error output</h4>
          <pre>${escapeHtml(c.failure || "No output captured.")}</pre>
        </div>
        ${c.failureReason ? `<p class="case-workbench__why"><strong>Why:</strong> ${escapeHtml(c.failureReason)}</p>` : ""}
      </div>`;
  }

  function renderProvenanceBlock(rowsHtml) {
    return `
      <div class="case-workbench__section case-workbench__quick">
        <h3 class="case-workbench__section-title">Provenance</h3>
        <dl class="case-workbench__dl">
          ${rowsHtml}
        </dl>
      </div>`;
  }

  class CaseWorkbench {
    constructor(options) {
      this.root = options.root;
      this.context = options.context || "library";
      this.requestContext = options.requestContext || null;
      this.editorActions = options.editorActions || "save";
      this.editorMode = options.editorMode || "multi";
      this.onCaseChange = options.onCaseChange || (() => {});
      this.onSave = options.onSave || (() => {});
      this.onDelete = options.onDelete || (() => {});
      this.onDuplicate = options.onDuplicate || (() => {});
      this.onTriageSave = options.onTriageSave || (() => {});
      this.defaultTab = options.defaultTab || "info";
      this.showTriage = options.showTriage !== false;
      this._case = null;
      this._tab = this.defaultTab;
      this._editing = false;
      this._editor = null;
      this._renderShell();
    }

    _renderShell() {
      this.root.innerHTML = `
        <div class="case-workbench" data-component="case-workbench">
          <div class="case-workbench__idle" data-ref="idle">
            <div class="empty-state">
              <p class="empty-state__title" data-ref="idleTitle">Select a test case</p>
              <p class="empty-state__hint" data-ref="idleText">Info for failure context and triage · Steps for the flow · History for runs.</p>
            </div>
          </div>
          <div class="case-workbench__panel" data-ref="panel" hidden>
            <header class="case-workbench__hero">
              <div class="case-workbench__hero-top">
                <h2 class="case-workbench__title" data-ref="heroTitle">—</h2>
                <span class="case-workbench__status" data-ref="heroStatus"></span>
              </div>
              <div class="case-workbench__chips" data-ref="heroChips"></div>
            </header>
            <nav class="case-workbench__tabs" role="tablist" aria-label="Case sections">
              <button type="button" class="case-workbench__tab" role="tab" id="wb-tab-info" data-tab="info" aria-controls="wb-pane-info" aria-selected="true">Info</button>
              <button type="button" class="case-workbench__tab" role="tab" id="wb-tab-steps" data-tab="steps" aria-controls="wb-pane-steps">Steps</button>
              <button type="button" class="case-workbench__tab" role="tab" id="wb-tab-history" data-tab="history" aria-controls="wb-pane-history">History</button>
            </nav>
            <div class="case-workbench__body">
              <section class="case-workbench__pane" id="wb-pane-info" data-pane="info" role="tabpanel" aria-labelledby="wb-tab-info">
                <div class="case-workbench__info-view" data-ref="infoView"></div>
              </section>
              <section class="case-workbench__pane" id="wb-pane-steps" data-pane="steps" role="tabpanel" aria-labelledby="wb-tab-steps" hidden>
                <div class="case-workbench__steps-toolbar" data-ref="stepsToolbar">
                  <button type="button" class="btn btn-teal btn-small" data-action="start-edit" data-icon="edit">Edit test case</button>
                  <div class="case-workbench__edit-actions" data-ref="editActions" hidden>
                    <button type="button" class="btn btn-secondary btn-small" data-action="cancel-edit" data-icon="x">Cancel</button>
                    <button type="button" class="btn btn-teal btn-small" data-action="save-edit" data-icon="save">Save changes</button>
                  </div>
                </div>
                <div class="case-workbench__steps-view" data-ref="stepsView"></div>
                <div class="case-workbench__steps-editor" data-ref="editorWrap" hidden>
                  <div data-ref="editorMount"></div>
                </div>
              </section>
              <section class="case-workbench__pane" id="wb-pane-history" data-pane="history" role="tabpanel" aria-labelledby="wb-tab-history" hidden></section>
            </div>
          </div>
        </div>`;

      this.refs = {};
      this.root.querySelectorAll("[data-ref]").forEach((el) => {
        this.refs[el.dataset.ref] = el;
      });
      this.panes = {};
      this.root.querySelectorAll("[data-pane]").forEach((el) => {
        this.panes[el.dataset.pane] = el;
      });

      this.root.querySelectorAll(".case-workbench__tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (this._editing && btn.dataset.tab !== "steps") {
            this.setEditing(false);
          }
          this.setTab(btn.dataset.tab);
        });
      });

      this.refs.stepsToolbar.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]")?.dataset.action;
        if (action === "start-edit") this.setEditing(true);
        if (action === "cancel-edit") this.setEditing(false);
        if (action === "save-edit") this._saveFromEditor();
      });

      this._editor = new window.QopsCaseDetail({
        root: this.refs.editorMount,
        embedded: true,
        mode: this.editorMode,
        actions: this.editorActions,
        onChange: (data) => {
          if (!this._case || !data) return;
          Object.assign(this._case, data);
          this._renderHero();
          this.onCaseChange(data);
        },
        onSave: (data) => {
          if (this._case && data) Object.assign(this._case, data);
          this._renderHero();
          this._renderSteps();
          this.onSave(data);
          this.setEditing(false);
        },
        onDelete: () => this.onDelete(this._case),
        onDuplicate: () => this.onDuplicate(this._case),
      });
      this._editor.setHint("");
    }

    setIdleText(text) {
      this.refs.idleText.textContent = text;
    }

    setTab(tab) {
      this._tab = tab;
      this.root.querySelectorAll(".case-workbench__tab").forEach((btn) => {
        const on = btn.dataset.tab === tab;
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.tabIndex = on ? 0 : -1;
      });
      Object.entries(this.panes).forEach(([key, pane]) => {
        pane.hidden = key !== tab;
      });
    }

    setEditing(on) {
      if (on === this._editing) return;
      if (!on && this._editor?.isDirty?.()) {
        this._editor.syncToCase?.();
      }
      this._editing = on;
      this._applyEditingState();
    }

    _applyEditingState() {
      const editing = this._editing;
      this.refs.stepsView.hidden = editing;
      this.refs.editorWrap.hidden = !editing;
      this.refs.stepsToolbar.querySelector("[data-action='start-edit']").hidden = editing;
      this.refs.editActions.hidden = !editing;
      if (editing) {
        this.setTab("steps");
        this._editor.setCase(this._case);
        if (window.enhanceButtons) enhanceButtons(this.refs.stepsToolbar);
      } else {
        this._renderSteps();
      }
    }

    _saveFromEditor() {
      const data = this._editor.syncToCase?.();
      if (data && this._case) {
        Object.assign(this._case, data);
        this._renderHero();
        this.onSave(data);
      }
      this.setEditing(false);
    }

    setCase(caseObj, opts = {}) {
      this._case = caseObj;
      if (opts.tab) this._tab = opts.tab;
      this._editing = !!opts.editing;

      if (!caseObj) {
        this.refs.idle.hidden = false;
        this.refs.panel.hidden = true;
        this._editing = false;
        this._editor.setCase(null);
        return;
      }

      this.refs.idle.hidden = true;
      this.refs.panel.hidden = false;
      this._renderHero();
      this._renderInfo();
      this._renderSteps();
      this._renderHistory();
      this._editor.setCase(caseObj);
      this.setTab(this._tab);
      this._applyEditingState();
    }

    _renderHero() {
      const c = this._case;
      this.refs.heroTitle.textContent = c.title || "Untitled case";

      const status = c.status || (this.context === "review" ? "proposed" : "unknown");
      let statusClass = "case-workbench__status--pass";
      let statusLabel = status;
      if (status === "failed") {
        statusClass = "case-workbench__status--fail";
        statusLabel = "Failed";
      } else if (status === "passed") {
        statusLabel = "Passed";
      } else if (status === "proposed") {
        statusClass = "case-workbench__status--proposed";
        statusLabel = "Proposed";
      } else if (status === "unknown") {
        statusLabel = "";
      }
      this.refs.heroStatus.className = `case-workbench__status ${statusClass}`;
      this.refs.heroStatus.textContent = statusLabel;
      this.refs.heroStatus.hidden = !statusLabel;

      const steps = c.flowSteps?.length || 0;
      const chips = [
        c.feature,
        c.project,
        `${steps} step${steps === 1 ? "" : "s"}`,
        c.label,
      ].filter(Boolean);

      this.refs.heroChips.innerHTML = chips
        .map((t) => `<span class="case-workbench__chip">${escapeHtml(t)}</span>`)
        .join("");
    }

    _stepsForCase(c) {
      return c.flowSteps?.length
        ? c.flowSteps
        : window.QopsNlFlow?.parseFlow(c.flow || "")?.steps || [];
    }

    _renderStepPreview(steps, c) {
      if (!steps?.length) {
        return `<p class="case-workbench__empty-preview">No steps yet — click <strong>Edit test case</strong> on the Steps tab.</p>`;
      }

      const failedIdx = c?.failedStepIndex;

      const listHtml = steps
        .map(
          (s, i) => `
          <li class="case-workbench__step-preview-item${failedIdx === i ? " is-failed" : ""}" id="step-preview-${i + 1}">
            <span class="case-workbench__step-preview-badge">Step ${i + 1}</span>
            <div class="case-workbench__step-preview-body">
              <strong>${escapeHtml(s.title || "Untitled step")}</strong>
              <div class="case-workbench__step-preview-row">
                <span class="case-workbench__step-preview-kind case-workbench__step-preview-kind--nav">Navigate</span>
                <span>${escapeHtml(s.navigate || "—")}</span>
              </div>
              <div class="case-workbench__step-preview-row">
                <span class="case-workbench__step-preview-kind case-workbench__step-preview-kind--check">Check</span>
                <span>${escapeHtml(s.check || "—")}</span>
              </div>
            </div>
          </li>`
        )
        .join("");

      return `
        <div class="case-workbench__step-preview-scroll">
          <ol class="case-workbench__step-preview-list">${listHtml}</ol>
        </div>`;
    }

    _bindTriageForm(pane, c) {
      const form = pane.querySelector("[data-ref='triageForm']");
      if (!form) return;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        c.triage = form.querySelector("#wb-triage-label").value;
        c.triageNotes = form.querySelector("#wb-triage-notes").value;
        const statusEl = pane.querySelector("[data-ref='triageStatus']");
        if (statusEl) {
          statusEl.textContent = "Saved";
          setTimeout(() => { statusEl.textContent = ""; }, 2000);
        }
        this.onTriageSave(c);
      });
    }

    _triageSection(c) {
      if (!this.showTriage || c.status !== "failed") return "";
      return `
        <form class="case-workbench__section case-workbench__triage block-card" data-ref="triageForm">
          <h3 class="case-workbench__section-title">Triage</h3>
          <div class="field">
            <label for="wb-triage-label">Reason</label>
            <select id="wb-triage-label" name="triage">
              ${TRIAGE_LABELS.map(
                (o) =>
                  `<option value="${o.value}"${c.triage === o.value ? " selected" : ""}>${o.label}</option>`
              ).join("")}
            </select>
          </div>
          <div class="field">
            <label for="wb-triage-notes">Notes</label>
            <textarea id="wb-triage-notes" name="notes" placeholder="What caused the failure? Next steps…">${escapeHtml(c.triageNotes || "")}</textarea>
          </div>
          <button type="submit" class="btn btn-teal btn-small" data-icon="save">Save triage</button>
          <span class="case-workbench__triage-status" data-ref="triageStatus"></span>
        </form>`;
    }

    _renderInfo() {
      const c = this._case;
      const pane = this.refs.infoView;
      if (!c || !pane) return;

      const req = this.requestContext || {};
      const isFailed = c.status === "failed";
      const isReopen = this.requestContext?.reopened === true;
      const lastRun = c.lastRun || {};

      let contextBlock = "";
      if (this.context === "review") {
        if (isFailed) {
          contextBlock = renderFailureBlock(c);
        } else if (isReopen && lastRun.status === "passed") {
          contextBlock = `
            <div class="case-workbench__section case-workbench__last-run">
              <h3 class="case-workbench__section-title">Last run</h3>
              <p class="case-workbench__meta-line">
                <span class="status-pass">Passed</span>
                · ${escapeHtml(lastRun.at || "—")}
                ${lastRun.duration ? ` · ${escapeHtml(lastRun.duration)}` : ""}
              </p>
              ${lastRun.id ? `<p class="case-workbench__meta-line"><a href="runs.html?case=${encodeURIComponent(c.title)}&run=${encodeURIComponent(lastRun.id)}" class="case-workbench__inline-link">View run ${escapeHtml(lastRun.id)} →</a></p>` : ""}
            </div>`;
        }
        if (req.user_input) {
          contextBlock += `
            <div class="case-workbench__section">
              <h3 class="case-workbench__section-title">Test request</h3>
              <blockquote class="case-workbench__request-quote">${escapeHtml(req.user_input)}</blockquote>
            </div>`;
        }
        contextBlock += this._triageSection(c);
        pane.innerHTML = `
          ${contextBlock}
          ${renderProvenanceBlock(`
            <dt>Source</dt>
            <dd>${escapeHtml(c.createdBy || "AI proposal")}</dd>
            <dt>Request mode</dt>
            <dd>${escapeHtml(req.request_mode_label || req.request_mode || "—")}</dd>
            <dt>Session</dt>
            <dd>${escapeHtml(req.session_file || "Platform default")}</dd>
            <dt>Category</dt>
            <dd>${escapeHtml(c.category || "—")}</dd>`)}`;
      } else {
        if (isFailed) {
          contextBlock = renderFailureBlock(c);
        } else {
          contextBlock = `
            <div class="case-workbench__section case-workbench__last-run">
              <h3 class="case-workbench__section-title">Last run</h3>
              <p class="case-workbench__meta-line">
                <span class="status-pass">Passed</span>
                · ${escapeHtml(lastRun.at || c.lastRunAt || "—")}
                ${lastRun.duration ? ` · ${escapeHtml(lastRun.duration)}` : ""}
              </p>
              ${lastRun.id ? `<p class="case-workbench__meta-line"><a href="runs.html?case=${encodeURIComponent(c.title)}" class="case-workbench__inline-link">View run ${escapeHtml(lastRun.id)} →</a></p>` : ""}
            </div>`;
        }
        contextBlock += this._triageSection(c);
        pane.innerHTML = `
          ${contextBlock}
          ${renderProvenanceBlock(`
            <dt>Created</dt>
            <dd>${escapeHtml(c.createdBy || "—")}${c.createdAt ? ` · ${escapeHtml(c.createdAt)}` : ""}</dd>
            <dt>Last updated</dt>
            <dd>${escapeHtml(c.updatedBy || c.createdBy || "—")}${c.updatedAt ? ` · ${escapeHtml(c.updatedAt)}` : ""}</dd>
            <dt>Category</dt>
            <dd>${escapeHtml(c.category || "—")}</dd>`)}`;
      }

      this._bindTriageForm(pane, c);
      if (window.enhanceButtons) enhanceButtons(pane);
    }

    _renderSteps() {
      const c = this._case;
      const pane = this.refs.stepsView;
      if (!c || !pane || this._editing) return;

      const steps = this._stepsForCase(c);
      pane.innerHTML = this._renderStepPreview(steps, c);
    }

    _renderHistory() {
      const c = this._case;
      const pane = this.panes.history;
      const runs = c.runHistory || [];

      if (this.context === "review" && !runs.length && !(c.editHistory || []).length) {
        const isReopen = this.requestContext?.reopened === true;
        pane.innerHTML = `
          <div class="case-workbench__section">
            <h3 class="case-workbench__section-title">${isReopen ? "No run history" : "Before processing"}</h3>
            <p class="case-workbench__history-note">${isReopen ? "This case has no recorded runs yet." : "Run history will appear here after you confirm and execute this request. Edits you make in this review session are tracked below."}</p>
            ${isReopen ? "" : `<ul class="case-workbench__audit-list">
              <li class="case-workbench__audit-item">
                <span class="case-workbench__audit-who">${escapeHtml(c.createdBy || "AI proposal")}</span>
                <span class="case-workbench__audit-what">Generated proposed case</span>
                <span class="case-workbench__audit-when">${escapeHtml(c.createdAt || "Just now")}</span>
              </li>
            </ul>`}
          </div>`;
        return;
      }

      const runRows = runs.length
        ? runs
            .map(
              (r) => `
            <li class="case-workbench__run-item">
              <div class="case-workbench__run-head">
                <span class="case-workbench__run-id">${escapeHtml(r.id)}</span>
                <span class="case-workbench__run-status ${r.status === "failed" ? "status-fail" : "status-pass"}">${escapeHtml(r.status)}</span>
              </div>
              <div class="case-workbench__run-meta">
                <span>${escapeHtml(r.at || "—")}</span>
                ${r.triggeredBy ? `<span>by ${escapeHtml(r.triggeredBy)}</span>` : ""}
                ${r.ai != null ? `<span>AI ${r.ai} · Auto ${r.auto}</span>` : ""}
              </div>
              ${r.note ? `<p class="case-workbench__run-note">${escapeHtml(r.note)}</p>` : ""}
              <a href="runs.html?case=${encodeURIComponent(c.title)}&run=${encodeURIComponent(r.id)}" class="case-workbench__run-link">Open in executed history →</a>
            </li>`
            )
            .join("")
        : `<li class="case-workbench__run-empty">No runs recorded for this case yet.</li>`;

      const edits = (c.editHistory || []).map(
        (e) => `
          <li class="case-workbench__audit-item">
            <span class="case-workbench__audit-who">${escapeHtml(e.by)}</span>
            <span class="case-workbench__audit-what">${escapeHtml(e.action)}</span>
            <span class="case-workbench__audit-when">${escapeHtml(e.at)}</span>
          </li>`
      ).join("");

      pane.innerHTML = `
        <div class="case-workbench__section">
          <h3 class="case-workbench__section-title">Run history</h3>
          <ul class="case-workbench__run-list">${runRows}</ul>
        </div>
        ${
          edits
            ? `<div class="case-workbench__section">
          <h3 class="case-workbench__section-title">Edit history</h3>
          <ul class="case-workbench__audit-list">${edits}</ul>
        </div>`
            : ""
        }`;
    }

    getEditor() {
      return this._editor;
    }

    isDirty() {
      return this._editing && (this._editor?.isDirty?.() || false);
    }

    syncToCase() {
      if (this._editing) return this._editor?.syncToCase?.();
      return null;
    }

    setRequestContext(ctx) {
      this.requestContext = ctx;
      if (this._case) this._renderInfo();
    }
  }

  window.QopsCaseWorkbench = CaseWorkbench;
})();
