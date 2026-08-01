// ============================================================
// Deterrents against casual inspection (right-click, DevTools
// shortcuts, view-source, text selection, drag-copy). None of
// this stops a determined visitor — the full HTML/CSS/JS is
// always downloaded to render the page, so it can always be
// read via curl, a proxy, or DevTools opened before this script
// runs. This only removes the easy/obvious paths for casual users.
// ============================================================
(function () {
  const ALLOW_SELECTION_IN = ["INPUT", "TEXTAREA"];

  // Block the context menu everywhere except form fields (so users can
  // still right-click to use spellcheck/paste suggestions in inputs).
  document.addEventListener("contextmenu", (e) => {
    if (!ALLOW_SELECTION_IN.includes(e.target.tagName)) e.preventDefault();
  });

  // Block common "view source / open devtools / save page" shortcuts.
  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    const blockedCombo =
      key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(key)) || // DevTools panels
      (e.ctrlKey && ["U", "S"].includes(key)) ||                    // view-source / save
      (e.metaKey && e.altKey && ["I", "J", "C"].includes(key));      // Mac DevTools
    if (blockedCombo) e.preventDefault();
  });

  // Block text selection and drag-out (e.g. dragging an image to save it),
  // except inside form fields where selection is needed to edit values.
  document.addEventListener("selectstart", (e) => {
    if (!ALLOW_SELECTION_IN.includes(e.target.tagName)) e.preventDefault();
  });
  document.addEventListener("dragstart", (e) => {
    if (!ALLOW_SELECTION_IN.includes(e.target.tagName)) e.preventDefault();
  });

  // Best-effort DevTools-open indicator (heuristic, not reliable — easily
  // bypassed by undocking DevTools or resizing the window manually).
  let warned = false;
  function checkDevtoolsSize() {
    const threshold = 160;
    const isOpen = window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold;
    if (isOpen && !warned) {
      warned = true;
      console.log("%cHeads up", "font-size:18px;font-weight:bold;color:#DC2626;");
      console.log("This UI and its design are not licensed for reuse. If you're here to copy it, please don't.");
    }
    if (!isOpen) warned = false;
  }
  window.addEventListener("resize", checkDevtoolsSize);
  setInterval(checkDevtoolsSize, 1000);
})();
