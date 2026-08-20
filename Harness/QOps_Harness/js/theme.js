(function () {
  var STORAGE_KEY = "qops-appearance";
  var MODES = ["day", "night", "system"];

  function getPreference() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return MODES.indexOf(stored) >= 0 ? stored : "system";
    } catch (_e) {
      return "system";
    }
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function resolveTheme(mode) {
    if (mode === "night") return "dark";
    if (mode === "day") return "light";
    return systemPrefersDark() ? "dark" : "light";
  }

  function apply(mode) {
    var pref = mode || getPreference();
    var resolved = resolveTheme(pref);
    var root = document.documentElement;
    root.setAttribute("data-appearance", pref);
    root.setAttribute("data-theme", resolved);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", resolved === "dark" ? "#141414" : "#ffffff");
    }
  }

  function setPreference(mode) {
    if (MODES.indexOf(mode) < 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (_e) {
      /* storage blocked */
    }
    apply(mode);
    window.dispatchEvent(new CustomEvent("qops-appearance-change", { detail: { mode: mode } }));
  }

  apply(getPreference());

  var media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  if (media && media.addEventListener) {
    media.addEventListener("change", function () {
      if (getPreference() === "system") apply("system");
    });
  } else if (media && media.addListener) {
    media.addListener(function () {
      if (getPreference() === "system") apply("system");
    });
  }

  window.QopsTheme = {
    STORAGE_KEY: STORAGE_KEY,
    MODES: MODES,
    getPreference: getPreference,
    setPreference: setPreference,
    resolveTheme: resolveTheme,
    apply: apply,
  };

  function initAppearanceControls(root) {
    root = root || document;
    root.querySelectorAll("[data-appearance-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-appearance-option");
        if (!mode) return;
        setPreference(mode);
        syncAppearanceControls(root);
      });
    });
    syncAppearanceControls(root);
  }

  function syncAppearanceControls(root) {
    root = root || document;
    var current = getPreference();
    root.querySelectorAll("[data-appearance-option]").forEach(function (btn) {
      var mode = btn.getAttribute("data-appearance-option");
      var selected = mode === current;
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      btn.classList.toggle("is-selected", selected);
    });
    var status = root.querySelector("[data-appearance-status]");
    if (status) {
      var labels = { day: "Day", night: "Night", system: "System" };
      var resolved = resolveTheme(current);
      status.textContent =
        current === "system"
          ? "System · " + (resolved === "dark" ? "Night" : "Day") + " (matches OS)"
          : labels[current] + " mode";
    }
  }

  window.QopsTheme.initAppearanceControls = initAppearanceControls;
  window.QopsTheme.syncAppearanceControls = syncAppearanceControls;

  document.addEventListener("DOMContentLoaded", function () {
    initAppearanceControls(document);
  });
})();
