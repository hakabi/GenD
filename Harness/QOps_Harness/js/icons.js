/** Shared SVG icons + button markup helper (icon + action label). */
(function () {
  const stroke = {
    width: "1.75",
    cap: "round",
    join: "round",
  };

  function svg(paths) {
    return (
      `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">` +
      paths
        .map(
          (d) =>
            `<path d="${d}" stroke="currentColor" stroke-width="${stroke.width}" stroke-linecap="${stroke.cap}" stroke-linejoin="${stroke.join}"/>`
        )
        .join("") +
      `</svg>`
    );
  }

  const ICONS = {
    plus: svg(["M8 3.5v9", "M3.5 8h9"]),
    refresh: svg([
      "M13 8a5 5 0 0 1-8.66 2.5",
      "M3 8a5 5 0 0 1 8.66-2.5",
      "M10.5 2.5V5h-2.5",
      "M5.5 13.5V11H8",
    ]),
    send: svg(["M2.5 8.5l11-4.5-4.5 11-1.5-4.5-4.5-1.5z"]),
    upload: svg(["M8 11V4", "M5.5 6.5 8 4l2.5 2.5", "M3 12.5h10"]),
    revert: svg(["M4 4.5V7H6.5", "M4 7a4.5 4.5 0 1 1 1.3 3.15"]),
    x: svg(["M4.5 4.5l7 7", "M11.5 4.5l-7 7"]),
    "arrow-left": svg(["M6.5 3.5 3 8l3.5 4.5", "M3 8h10"]),
    "arrow-right": svg(["M9.5 3.5 13 8l-3.5 4.5", "M13 8H3"]),
    play: svg(["M5.5 4.5v7l6-3.5-6-3.5z"]),
    download: svg(["M8 3.5v7", "M5.5 8 8 10.5 10.5 8", "M3.5 12.5h9"]),
    filter: svg(["M2.5 4h11", "M5 8h6", "M7 12h2"]),
    save: svg([
      "M3.5 3.5h7l2 2v7.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z",
      "M5.5 3.5V6h5V3.5",
      "M5.5 9.5h5",
    ]),
    copy: svg([
      "M5.5 5.5h6v6h-6z",
      "M4.5 10.5V4.5a1 1 0 0 1 1-1h6",
    ]),
    trash: svg([
      "M3.5 5h9",
      "M6 5V3.5h4V5",
      "M5 5l.5 7.5h5L11 5",
    ]),
    edit: svg([
      "M10.5 2.5l1 1-7 7H3.5v-1l7-7z",
      "M9.5 3.5l3 3",
    ]),
    check: svg(["M3.5 8.5 6.5 11.5 12.5 4.5"]),
    list: svg(["M3.5 4.5h9", "M3.5 8h9", "M3.5 11.5h9", "M2 4.5h.01", "M2 8h.01", "M2 11.5h.01"]),
    sync: svg([
      "M13 8a5 5 0 0 1-8.66 2.5",
      "M3 8a5 5 0 0 1 8.66-2.5",
    ]),
    menu: svg(["M2.5 4h11", "M2.5 8h11", "M2.5 12h11"]),
    requests: svg([
      "M3 4.5h10a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z",
      "M5 7.5h6",
      "M5 10h4",
    ]),
    cases: svg([
      "M4 3.5h8l1.5 1.5V12.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z",
      "M6 7h4",
      "M6 9.5h4",
    ]),
    history: svg([
      "M8 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z",
      "M8 5.5V8l2 1.5",
    ]),
    knowledge: svg([
      "M3.5 4.5h5.5a2 2 0 0 1 2 2v7H5.5a2 2 0 0 1-2-2v-7z",
      "M11 6.5h1.5a2 2 0 0 1 2 2v5",
    ]),
    file: svg([
      "M4.5 3.5h5l2 2v7.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z",
      "M9 3.5V6h2.5",
    ]),
    folder: svg([
      "M2.5 5.5h4l1 1.5h6a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z",
    ]),
    dashboard: svg([
      "M3.5 3.5h3.5v3.5H3.5z",
      "M9 3.5h3.5v5H9z",
      "M3.5 9h5v3.5H3.5z",
      "M10.5 9.5h2v3H10.5z",
    ]),
    agent: svg([
      "M8 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
      "M4.5 12.5c.8-1.8 2.2-2.5 3.5-2.5s2.7.7 3.5 2.5",
    ]),
    chevron: svg(["M6 4l4 4-4 4"]),
    settings: svg([
      "M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
      "M12.5 8.8l.7-.4a.6.6 0 0 0 .2-.8l-.6-1a.6.6 0 0 0-.8-.2l-.8.3a5.5 5.5 0 0 0-.9-.5l-.1-.9a.6.6 0 0 0-.6-.5H7.6a.6.6 0 0 0-.6.5l-.1.9c-.3.1-.6.3-.9.5l-.8-.3a.6.6 0 0 0-.8.2l-.6 1a.6.6 0 0 0 .2.8l.7.4c0 .2-.1.4-.1.7s0 .5.1.7l-.7.4a.6.6 0 0 0-.2.8l.6 1a.6.6 0 0 0 .8.2l.8-.3c.3.2.6.4.9.5l.1.9a.6.6 0 0 0 .6.5h1.2a.6.6 0 0 0 .6-.5l.1-.9c.3-.1.6-.3.9-.5l.8.3a.6.6 0 0 0 .8-.2l.6-1a.6.6 0 0 0-.2-.8l-.7-.4c.1-.2.1-.4.1-.7s0-.5-.1-.7z",
    ]),
    sun: svg([
      "M8 5.5v1.5",
      "M8 10.5v1.5",
      "M5.5 8H4",
      "M12 8h-1.5",
      "M6.1 6.1l-1-1",
      "M10.9 10.9l-1-1",
      "M6.1 9.9l-1 1",
      "M10.9 5.1l-1 1",
      "M8 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
    ]),
    moon: svg([
      "M10.5 3.2a4.5 4.5 0 1 0 2.3 8.3A3.8 3.8 0 0 1 10.5 3.2z",
    ]),
    monitor: svg([
      "M3 4.5h10a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z",
      "M6 11.5h4",
      "M8 11.5v1.5",
    ]),
  };

  function icon(name) {
    return ICONS[name] || "";
  }

  function iconSpan(name) {
    const markup = icon(name);
    if (!markup) return "";
    return `<span class="btn-icon">${markup}</span>`;
  }

  /**
   * @param {object} opts
   * @param {string} opts.icon - icon key
   * @param {string} opts.label - visible action text
   * @param {string} [opts.className='btn btn-secondary']
   * @param {string} [opts.type='button']
   * @param {string} [opts.id]
   * @param {boolean} [opts.disabled]
   * @param {boolean} [opts.iconOnly] - hide label visually, keep for screen readers
   * @param {string} [opts.ariaLabel]
   */
  function odBtn(opts) {
    const {
      icon: iconName,
      label,
      className = "btn btn-secondary",
      type = "button",
      id = "",
      disabled = false,
      iconOnly = false,
      ariaLabel = "",
    } = opts;

    const idAttr = id ? ` id="${id}"` : "";
    const disabledAttr = disabled ? " disabled" : "";
    const aria = ariaLabel || (iconOnly ? label : "");
    const ariaAttr = aria ? ` aria-label="${aria.replace(/"/g, "&quot;")}"` : "";
    const labelHtml = iconOnly
      ? `<span class="btn-label visually-hidden">${label}</span>`
      : `<span class="btn-label">${label}</span>`;

    return (
      `<button type="${type}" class="${className}${iconOnly ? " btn-icon-only" : ""}"${idAttr}${disabledAttr}${ariaAttr}>` +
      iconSpan(iconName) +
      labelHtml +
      `</button>`
    );
  }

  function odLinkBtn(opts) {
    const { href, icon: iconName, label, className = "btn btn-secondary" } = opts;
    return (
      `<a class="${className}" href="${href}">` +
      iconSpan(iconName) +
      `<span class="btn-label">${label}</span></a>`
    );
  }

  function     enhanceButtons(root) {
    const scope = root || document;
    scope.querySelectorAll("button[data-icon], a[data-icon]").forEach((el) => {
      if (el.querySelector(".btn-icon")) return;
      const iconName = el.dataset.icon;
      if (!iconName || !ICONS[iconName]) return;
      const label = el.dataset.label || el.textContent.trim();
      const iconOnly =
        el.classList.contains("btn-icon-only") || el.dataset.iconOnly === "true";
      el.textContent = "";
      el.insertAdjacentHTML(
        "afterbegin",
        iconSpan(iconName) +
          (iconOnly
            ? `<span class="btn-label visually-hidden">${label}</span>`
            : `<span class="btn-label">${label}</span>`)
      );
      if (iconOnly && !el.classList.contains("btn-icon-only")) el.classList.add("btn-icon-only");
      if (iconOnly && !el.getAttribute("aria-label")) el.setAttribute("aria-label", label);
      if (!el.classList.contains("btn")) el.classList.add("btn");
    });
  }

  function setBtnLabel(btn, text) {
    if (!btn) return;
    const label = btn.querySelector(".btn-label") || btn;
    label.textContent = text;
  }

  window.ODIcons = ICONS;
  window.odIcon = icon;
  window.odIconSpan = iconSpan;
  window.odBtn = odBtn;
  window.odLinkBtn = odLinkBtn;
  window.enhanceButtons = enhanceButtons;
  window.setBtnLabel = setBtnLabel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => enhanceButtons());
  } else {
    enhanceButtons();
  }
})();
