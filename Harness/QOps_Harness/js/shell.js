(function () {
  const NAV = [
    { id: "requests", label: "Requests", href: "index.html", top: true, icon: "requests" },
    {
      id: "cases",
      label: "Test cases",
      icon: "cases",
      children: [
        { id: "cases-triage", label: "Failed", href: "cases.html?view=triage", icon: "filter" },
        { id: "cases-all", label: "All cases", href: "cases.html?view=all", icon: "list" },
        { id: "runs", label: "Executed history", href: "runs.html", icon: "history" },
      ],
    },
    { id: "knowledge", label: "Knowledge", icon: "knowledge", knowledgeTree: true },
    { id: "dashboard", label: "Dashboard", href: "dashboard.html", top: true, icon: "dashboard" },
  ];

  const KNOWLEDGE_SCOPES = ["global", "project", "agents"];

  const page = document.body.dataset.page || "";
  const knowledgeFile = document.body.dataset.knowledgeFile || "";
  const knowledgeAgent = document.body.dataset.knowledgeAgent || "";

  function getSubpage() {
    const fromDataset = document.body.dataset.subpage || "";
    if (fromDataset) return fromDataset;
    if (page === "cases") {
      const view = new URLSearchParams(location.search).get("view");
      return view === "all" ? "all" : "triage";
    }
    return "";
  }

  function navIconMarkup(name) {
    if (!name || !window.odIcon) return "";
    const svg = window.odIcon(name);
    if (!svg) return "";
    return `<span class="nav-icon" aria-hidden="true">${svg}</span>`;
  }

  function chevronMarkup(expanded) {
    const svg = window.odIcon ? window.odIcon("chevron") : "";
    return `<span class="nav-chevron" aria-hidden="true" style="${expanded ? "transform:rotate(90deg)" : ""}">${svg || "›"}</span>`;
  }

  function normalizeScope(scope) {
    return scope === "agents" ? "agents" : scope;
  }

  function isActive(item) {
    const subpage = getSubpage();
    if (item.id === page) return true;
    if (subpage && item.id === subpage) return true;
    if (page === "cases" && item.id === "cases-triage" && subpage !== "all") return true;
    if (page === "cases" && item.id === "cases-all" && subpage === "all") return true;
    if (page === "runs" && item.id === "runs") return true;
    if (page === "knowledge" && item.id === "knowledge-scope" && item.scope === normalizeScope(subpage)) {
      return !knowledgeFile;
    }
    return false;
  }

  function isFileActive(scope, path) {
    if (page !== "knowledge") return false;
    if (scope === "agents") return false;
    return normalizeScope(getSubpage()) === scope && knowledgeFile === path;
  }

  function isAgentFileActive(agentId, filePath) {
    if (page !== "knowledge") return false;
    return normalizeScope(getSubpage()) === "agents" && knowledgeAgent === agentId && knowledgeFile === filePath;
  }

  function agentExpanded(agentId) {
    if (page !== "knowledge") return false;
    return normalizeScope(getSubpage()) === "agents" && knowledgeAgent === agentId;
  }

  function roleBadgeMarkup(role) {
    const cls = role === "soul" ? "soul" : role === "memory" ? "memory" : "reference";
    const label = role === "soul" ? "SOUL" : role === "memory" ? "Memory" : "Ref";
    return `<span class="nav-role-badge nav-role-badge--${cls}">${label}</span>`;
  }

  function scopeExpanded(scope) {
    if (page !== "knowledge") return false;
    return normalizeScope(getSubpage()) === scope;
  }

  function groupExpanded(group) {
    if (group.id === "cases" && (page === "cases" || page === "runs")) return true;
    if (group.id === "knowledge" && page === "knowledge") return true;
    return group.children?.some((c) => isActive(c));
  }

  function renderScopeFiles(K, scope, files) {
    const parts = [];
    const { folders, loose } = K.groupFiles(files);

    loose.forEach((path) => {
      const href = K.fileHref(scope, path);
      const active = isFileActive(scope, path);
      parts.push(
        `<a class="nav-item nav-item--file" href="${href}" title="${path}"${active ? ' aria-current="page"' : ""}>` +
          `${navIconMarkup("file")}<span>${path}</span></a>`
      );
    });

    Object.keys(folders)
      .sort()
      .forEach((folder) => {
        parts.push(`<div class="nav-folder" data-folder="${folder}">`);
        parts.push(
          `<span class="nav-folder-label">${navIconMarkup("folder")}<span>${folder}/</span></span>`
        );
        folders[folder].forEach(({ full, name }) => {
          const href = K.fileHref(scope, full);
          const active = isFileActive(scope, full);
          parts.push(
            `<a class="nav-item nav-item--file nav-item--nested" href="${href}" title="${full}"${active ? ' aria-current="page"' : ""}>` +
              `${navIconMarkup("file")}<span>${name}</span></a>`
          );
        });
        parts.push(`</div>`);
      });

    return parts.join("");
  }

  function renderAgentsScope(K) {
    const parts = [];
    const scope = "agents";
    const label = K.SCOPE_LABELS[scope] || scope;
    const expanded = scopeExpanded(scope);
    const agents = K.AGENTS || [];

    parts.push(`<div class="nav-subgroup" data-scope="${scope}">`);
    parts.push(
      `<button type="button" class="nav-subgroup-label" aria-expanded="${expanded}" aria-controls="nav-knowledge-${scope}">`,
      `<span class="nav-label-row">${navIconMarkup("folder")}<span>${label}</span></span>`,
      chevronMarkup(expanded),
      `</button>`
    );
    parts.push(`<div id="nav-knowledge-${scope}" class="nav-subgroup-panel"${expanded ? "" : " hidden"}>`);

    agents.forEach((agent) => {
      const aExpanded = agentExpanded(agent.id);
      parts.push(`<div class="nav-agent-group" data-agent="${agent.id}">`);
      parts.push(
        `<button type="button" class="nav-agent-label" aria-expanded="${aExpanded}" aria-controls="nav-agent-${agent.id}">`,
        `<span class="nav-label-row">${navIconMarkup("agent")}<span>${agent.name}</span></span>`,
        chevronMarkup(aExpanded),
        `</button>`
      );
      parts.push(`<div id="nav-agent-${agent.id}" class="nav-agent-panel"${aExpanded ? "" : " hidden"}>`);
      (agent.files || []).forEach((file) => {
        const href = K.fileHref(scope, file.path, agent.id);
        const active = isAgentFileActive(agent.id, file.path);
        const title = `${agent.name} · ${file.label}`;
        parts.push(
          `<a class="nav-item nav-item--role" href="${href}" title="${title}" aria-label="${title}"${active ? ' aria-current="page"' : ""}>` +
            `${roleBadgeMarkup(file.role)}</a>`
        );
      });
      parts.push(`</div></div>`);
    });

    parts.push(`</div></div>`);
    return parts.join("");
  }

  function renderKnowledgeTree() {
    const K = window.KNOWLEDGE;
    if (!K) return "";

    const parts = [];
    KNOWLEDGE_SCOPES.forEach((scope) => {
      if (scope === "agents") {
        parts.push(renderAgentsScope(K));
        return;
      }

      const label = K.SCOPE_LABELS[scope] || scope;
      const expanded = scopeExpanded(scope);
      const files = K.FILES[scope] || [];

      parts.push(`<div class="nav-subgroup" data-scope="${scope}">`);
      parts.push(
        `<button type="button" class="nav-subgroup-label" aria-expanded="${expanded}" aria-controls="nav-knowledge-${scope}">`,
        `<span class="nav-label-row">${navIconMarkup("folder")}<span>${label}</span></span>`,
        chevronMarkup(expanded),
        `</button>`
      );
      parts.push(`<div id="nav-knowledge-${scope}" class="nav-subgroup-panel"${expanded ? "" : " hidden"}>`);
      parts.push(renderScopeFiles(K, scope, files));
      parts.push(`</div></div>`);
    });

    return parts.join("");
  }

  function renderNav() {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar) return;

    const parts = [
      `<div class="sidebar-brand"><h1>QOps <span>Harness</span></h1><p>Web UI for test ops</p></div>`,
      `<nav class="sidebar-nav" aria-label="Primary">`,
    ];

    NAV.forEach((entry) => {
      if (entry.top) {
        parts.push(
          `<a class="nav-item nav-item--top" href="${entry.href}"${isActive(entry) ? ' aria-current="page"' : ""}>` +
            `${navIconMarkup(entry.icon)}<span>${entry.label}</span></a>`
        );
        return;
      }

      if (entry.knowledgeTree) {
        const expanded = groupExpanded(entry);
        parts.push(`<div class="nav-group" data-group="${entry.id}">`);
        parts.push(
          `<button type="button" class="nav-group-label" aria-expanded="${expanded}" aria-controls="nav-${entry.id}">`,
          `<span class="nav-label-row">${navIconMarkup(entry.icon)}<span>${entry.label}</span></span>`,
          chevronMarkup(expanded),
          `</button>`
        );
        parts.push(`<div id="nav-${entry.id}" class="nav-group-panel"${expanded ? "" : " hidden"}>`);
        parts.push(renderKnowledgeTree());
        parts.push(`</div></div>`);
        return;
      }

      if (!entry.children) return;
      const expanded = groupExpanded(entry);
      parts.push(`<div class="nav-group" data-group="${entry.id}">`);
      parts.push(
        `<button type="button" class="nav-group-label" aria-expanded="${expanded}" aria-controls="nav-${entry.id}">`,
        `<span class="nav-label-row">${navIconMarkup(entry.icon)}<span>${entry.label}</span></span>`,
        chevronMarkup(expanded),
        `</button>`
      );
      parts.push(`<div id="nav-${entry.id}"${expanded ? "" : ' hidden'}>`);
      entry.children.forEach((child) => {
        parts.push(
          `<a class="nav-item" href="${child.href}"${isActive(child) ? ' aria-current="page"' : ""}>` +
            `${navIconMarkup(child.icon)}<span>${child.label}</span></a>`
        );
      });
      parts.push(`</div></div>`);
    });

    parts.push(`</nav>`);
    const settingsIcon = window.odIcon ? window.odIcon("settings") : "";
    const settingsActive = page === "settings";
    parts.push(
      `<div class="sidebar-footer"><a class="settings-link${settingsActive ? " is-active" : ""}" href="settings.html"${settingsActive ? ' aria-current="page"' : ""}>`,
      settingsIcon ? `<span class="nav-icon" aria-hidden="true">${settingsIcon}</span>` : "",
      `<span>Settings</span></a></div>`
    );

    sidebar.innerHTML = parts.join("");

    sidebar.querySelectorAll(".nav-group-label, .nav-subgroup-label, .nav-agent-label").forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.hidden = open;
        const chev = btn.querySelector(".nav-chevron");
        if (chev) chev.style.transform = open ? "" : "rotate(90deg)";
      });
    });
  }

  function initMobile() {
    const sidebar = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    const toggle = document.getElementById("mobile-nav-toggle");
    if (!sidebar || !toggle) return;

    function close() {
      sidebar.classList.remove("open");
      backdrop?.classList.remove("open");
    }
    function open() {
      sidebar.classList.add("open");
      backdrop?.classList.add("open");
    }

    toggle.addEventListener("click", () => {
      sidebar.classList.contains("open") ? close() : open();
    });
    backdrop?.addEventListener("click", close);
    sidebar.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  }

  renderNav();
  initMobile();
})();
