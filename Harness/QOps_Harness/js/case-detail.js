/** Reusable test case detail panel with stepAI-style NL flow editor. */
(function () {
  const CATEGORY_OPTIONS = [
    { value: "positive", label: "Positive" },
    { value: "negative", label: "Negative" },
    { value: "edge_case", label: "Edge case" },
    { value: "performance", label: "Performance" },
    { value: "security", label: "Security" },
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  class CaseDetail {
    constructor(options) {
      this.root = options.root;
      this.mode = options.mode || "multi";
      this.readOnly = !!options.readOnly;
      this.embedded = !!options.embedded;
      this.actions =
        options.actions ?? (options.mode === "single" ? "none" : "full");
      this.onChange = options.onChange || (() => {});
      this.onSave = options.onSave || (() => {});
      this.onDelete = options.onDelete || (() => {});
      this.onDuplicate = options.onDuplicate || (() => {});
      this._case = null;
      this._dirty = false;
      this._flowModel = { steps: [] };
      this._renderShell();
    }

    _renderShell() {
      const showSave = !this.readOnly && (this.actions === "save" || this.actions === "full");
      const showExtras = !this.readOnly && this.actions === "full";
      this.root.innerHTML = `
        <div class="case-detail${this.embedded ? " case-detail--embedded" : ""}" data-component="case-detail">
          <header class="case-detail__header">
            <h2>
              <span data-ref="title">Case detail</span>
              <span class="case-detail__dirty" data-ref="dirty">Unsaved</span>
            </h2>
            <div class="case-detail__meta" data-ref="meta">
              <span class="case-detail__cat" data-ref="catBadge">Positive</span>
              <span class="case-detail__step-count" data-ref="stepCount">0 steps</span>
            </div>
            <p class="case-detail__hint" data-ref="hint">Select a case to edit its details.</p>
          </header>
          <div class="case-detail__body" data-ref="body" hidden>
            <div class="field">
              <label for="cd-title">Title</label>
              <input id="cd-title" type="text" data-ref="titleInput" required />
            </div>
            <div class="field">
              <label for="cd-category">Category</label>
              <select id="cd-category" data-ref="categorySelect">
                ${CATEGORY_OPTIONS.map((o) => `<option value="${o.value}">${o.label}</option>`).join("")}
              </select>
            </div>
            <div class="field nl-flow-editor" data-ref="flowEditor">
              <div class="nl-flow-editor__head">
                <div>
                  <label>Natural-language flow</label>
                  <p>Each numbered <strong>Step</strong> is one <code>stepAI()</code> call — Navigate + Check are the two instructions inside it.</p>
                  <div class="nl-flow-editor__structure" aria-hidden="true">stepAI(page, 'Step title', ['Navigate…', 'Verify…'])</div>
                </div>
              </div>
              <div class="nl-flow-editor__steps" data-ref="flowSteps"></div>
              <div class="nl-flow-editor__foot" data-ref="flowFoot" ${this.readOnly ? "hidden" : ""}>
                <button type="button" class="btn btn-secondary btn-small" data-action="add-step" data-icon="plus">Add step</button>
              </div>
            </div>
            <div class="form-actions" data-ref="actions" ${showSave ? "" : "hidden"}>
              <button type="button" class="btn btn-teal btn-small" data-action="save" data-icon="save">Save changes</button>
              ${showExtras ? `<button type="button" class="btn btn-secondary btn-small" data-action="duplicate" data-icon="copy">Duplicate</button>
              <button type="button" class="btn btn-danger btn-small" data-action="delete" data-icon="trash">Delete case</button>` : ""}
            </div>
          </div>
          <p class="case-detail__idle" data-ref="idle">Select a case to edit its details.</p>
        </div>
      `;

      this.refs = {};
      this.root.querySelectorAll("[data-ref]").forEach((el) => {
        this.refs[el.dataset.ref] = el;
      });

      this.root.addEventListener("input", (e) => this._onInput(e));
      this.root.addEventListener("change", (e) => this._onChange(e));
      this.root.addEventListener("click", (e) => this._onClick(e));

      if (window.enhanceButtons) enhanceButtons(this.root);
    }

    setHint(text) {
      this.refs.hint.textContent = text;
    }

    setDirty(dirty) {
      this._dirty = dirty;
      this.refs.dirty.classList.toggle("is-visible", dirty);
    }

    _updateMeta() {
      const steps = this._flowModel?.steps?.length || 0;
      const cat = this.refs.categorySelect?.value || "positive";
      const catLabel = CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat;
      if (this.refs.catBadge) this.refs.catBadge.textContent = catLabel;
      if (this.refs.stepCount) {
        this.refs.stepCount.textContent = `${steps} step${steps === 1 ? "" : "s"}`;
      }
    }

    isDirty() {
      return this._dirty;
    }

    getCaseData() {
      if (!this._case) return null;
      const flow = window.QopsNlFlow.serializeFlow(this._flowModel);
      return {
        ...this._case,
        title: this.refs.titleInput.value.trim() || "Untitled case",
        category: this.refs.categorySelect.value,
        flow,
        flowSteps: JSON.parse(JSON.stringify(this._flowModel.steps)),
      };
    }

    syncToCase() {
      if (!this._case) return null;
      const data = this.getCaseData();
      Object.assign(this._case, data);
      this.setDirty(false);
      this.refs.title.textContent = data.title;
      return data;
    }

    setCase(caseObj) {
      this._case = caseObj;
      this._failedStepIndex =
        caseObj && caseObj.failedStepIndex != null ? caseObj.failedStepIndex : null;
      if (!caseObj) {
        this.refs.body.hidden = true;
        this.refs.idle.hidden = false;
        this.refs.hint.hidden = false;
        this.refs.title.textContent = "Case detail";
        this.setDirty(false);
        return;
      }

      this.refs.body.hidden = false;
      this.refs.idle.hidden = true;
      this.refs.hint.hidden = true;
      this.refs.titleInput.value = caseObj.title || "";
      this.refs.categorySelect.value = caseObj.category || "positive";
      this.refs.title.textContent = caseObj.title || "Case detail";

      const nl = window.QopsNlFlow;
      if (caseObj.flowSteps) {
        if (Array.isArray(caseObj.flowSteps) && caseObj.flowSteps[0]?.navigate !== undefined) {
          this._flowModel = { steps: JSON.parse(JSON.stringify(caseObj.flowSteps)) };
        } else if (caseObj.flowSteps[0]?.actions) {
          this._flowModel = nl.normalizeModel({ groups: caseObj.flowSteps });
        } else {
          this._flowModel = nl.normalizeModel({ steps: caseObj.flowSteps });
        }
      } else {
        this._flowModel = nl.parseFlow(caseObj.flow || "");
      }

      this._renderFlowEditor();
      this._updateMeta();
      this.setDirty(false);

      if (this.readOnly) {
        this.refs.titleInput.readOnly = true;
        this.refs.categorySelect.disabled = true;
      }
    }

    _renderFlowEditor() {
      const container = this.refs.flowSteps;
      const steps = this._flowModel.steps || [];

      container.innerHTML = steps
        .map((step, si) => {
          const stepNum = si + 1;
          const readonly = this.readOnly ? "readonly" : "";
          const removeBtn =
            this.readOnly || steps.length <= 1
              ? ""
              : `<button type="button" class="btn btn-icon-only btn-small" data-action="remove-step" data-si="${si}" data-icon="trash" data-icon-only="true" data-label="Remove step ${stepNum}">Remove</button>`;

          return `
            <article class="nl-flow-step${this._failedStepIndex === si ? " nl-flow-step--failed" : ""}" data-si="${si}">
              <header class="nl-flow-step__head">
                <span class="nl-flow-step__num" aria-label="Step ${stepNum}">Step ${stepNum}</span>
                <span class="nl-flow-step__api" aria-hidden="true">stepAI</span>
                <input
                  class="nl-flow-step__title"
                  type="text"
                  value="${escapeHtml(step.title || "")}"
                  placeholder="Step title (e.g. Navigate to Askii and verify UI)"
                  data-si="${si}"
                  data-field="step-title"
                  ${readonly}
                  aria-label="Step ${stepNum} title"
                />
                ${removeBtn}
              </header>
              <div class="nl-flow-step__subs">
                <div class="nl-flow-sub nl-flow-sub--navigate">
                  <span class="nl-flow-sub__label">Navigate</span>
                  <textarea
                    class="nl-flow-sub__text"
                    rows="2"
                    placeholder="Navigate to… / Click on… / Open…"
                    data-si="${si}"
                    data-field="navigate"
                    ${readonly}
                  >${escapeHtml(step.navigate || "")}</textarea>
                </div>
                <div class="nl-flow-sub nl-flow-sub--check">
                  <span class="nl-flow-sub__label">Check</span>
                  <textarea
                    class="nl-flow-sub__text"
                    rows="2"
                    placeholder="Verify… / Confirm… / Assert…"
                    data-si="${si}"
                    data-field="check"
                    ${readonly}
                  >${escapeHtml(step.check || "")}</textarea>
                </div>
              </div>
            </article>`;
        })
        .join("");

      if (window.enhanceButtons) enhanceButtons(container);
    }

    _renumberAndEmit() {
      this._renderFlowEditor();
      this._updateMeta();
      this.setDirty(true);
      this.refs.title.textContent = this.refs.titleInput.value.trim() || "Untitled case";
      this.onChange(this.getCaseData());
    }

    _emitChange() {
      this.setDirty(true);
      this.refs.title.textContent = this.refs.titleInput.value.trim() || "Case detail";
      this._updateMeta();
      this.onChange(this.getCaseData());
    }

    _onInput(e) {
      const t = e.target;

      if (t === this.refs.titleInput) {
        this._emitChange();
        return;
      }

      const si = parseInt(t.dataset.si, 10);
      if (Number.isNaN(si) || !this._flowModel.steps[si]) return;

      if (t.dataset.field === "step-title") {
        this._flowModel.steps[si].title = t.value;
        this._emitChange();
        return;
      }
      if (t.dataset.field === "navigate") {
        this._flowModel.steps[si].navigate = t.value;
        this._emitChange();
        return;
      }
      if (t.dataset.field === "check") {
        this._flowModel.steps[si].check = t.value;
        this._emitChange();
      }
    }

    _onChange(e) {
      if (e.target === this.refs.categorySelect) {
        this._renumberAndEmit();
      }
    }

    _onClick(e) {
      const btn = e.target.closest("[data-action]");
      if (!btn || this.readOnly) return;

      const action = btn.dataset.action;
      const si = parseInt(btn.dataset.si, 10);

      if (action === "remove-step") {
        if (this._flowModel.steps.length <= 1) return;
        this._flowModel.steps.splice(si, 1);
        this._renumberAndEmit();
        return;
      }
      if (action === "add-step") {
        this._flowModel.steps.push(window.QopsNlFlow.emptyStep("New step"));
        this._renumberAndEmit();
        return;
      }
      if (action === "save") {
        this.syncToCase();
        this.onSave(this.getCaseData());
        return;
      }
      if (action === "delete") {
        this.onDelete(this.getCaseData());
        return;
      }
      if (action === "duplicate") {
        this.onDuplicate(this.getCaseData());
      }
    }

    /** Static read-only renderer for embedding in cases.html etc. */
    static renderFlowPreview(container, caseObj) {
      const nl = window.QopsNlFlow;
      let model;
      if (caseObj.flowSteps) {
        if (caseObj.flowSteps[0]?.navigate !== undefined) {
          model = { steps: caseObj.flowSteps };
        } else if (caseObj.flowSteps[0]?.actions) {
          model = nl.normalizeModel({ groups: caseObj.flowSteps });
        } else {
          model = nl.normalizeModel({ steps: caseObj.flowSteps });
        }
      } else {
        model = nl.parseFlow(caseObj.flow || "");
      }
      model = nl.normalizeModel(model);

      container.innerHTML = `<div class="nl-flow-readonly">${model.steps
        .map((step, si) => {
          const stepNum = si + 1;
          return `
            <article class="nl-flow-step nl-flow-step--readonly">
              <header class="nl-flow-step__head">
                <span class="nl-flow-step__num">Step ${stepNum}</span>
                <span class="nl-flow-step__title-read">${escapeHtml(step.title || "Step")}</span>
              </header>
              <div class="nl-flow-step__subs">
                <div class="nl-flow-sub nl-flow-sub--navigate">
                  <span class="nl-flow-sub__label">Navigate</span>
                  <p class="nl-flow-sub__read">${escapeHtml(step.navigate || "—")}</p>
                </div>
                <div class="nl-flow-sub nl-flow-sub--check">
                  <span class="nl-flow-sub__label">Check</span>
                  <p class="nl-flow-sub__read">${escapeHtml(step.check || "—")}</p>
                </div>
              </div>
            </article>`;
        })
        .join("")}</div>`;
    }
  }

  window.QopsCaseDetail = CaseDetail;
})();
