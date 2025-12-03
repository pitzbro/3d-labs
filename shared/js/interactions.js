// shared/js/interactions.js
// Global sidebar toggle + shared pointer → scene update wiring.
//
// Expects projects to optionally define:
//   window.updateTypography = function({ x, y }) { ... }
//
// And to mark the interaction area with:
//   data-interactions-target
// or fall back to <canvas>.

(function () {
  // === 1. Global sidebar toggle =======================================

  var toggleButtons = document.querySelectorAll(".toggle-sidebar-btn");

  toggleButtons.forEach(function (button) {
    var sidebar = button.closest(".sidebar");
    if (!sidebar) return;

    // Initial aria state
    var isOpen = sidebar.classList.contains("open");
    button.setAttribute("aria-pressed", String(isOpen));

    button.addEventListener("click", function () {
      var nowOpen = sidebar.classList.toggle("open");
      button.setAttribute("aria-pressed", String(nowOpen));
    });
  });

  // === 2. Shared pointer interactions =================================

  // Project-specific callback – must be defined by the sandbox
  var callback = window.updateTypography;
  if (typeof callback !== "function") {
    return; // no pointer wiring if project doesn't opt in
  }

  // Prefer explicit target; fall back to canvas (for WebGL project)
  var target =
    document.querySelector("[data-interactions-target]") ||
    document.querySelector("canvas");

  if (!target) return;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getNormalizedCoords(event) {
    var rect = target.getBoundingClientRect();
    var x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    var y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    return { x: x, y: y };
  }

  function handlePointerMove(event) {
    var coords = getNormalizedCoords(event);
    callback(coords);
  }

  target.addEventListener("pointermove", handlePointerMove, { passive: true });
})();
