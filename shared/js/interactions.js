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

  // === 2. Shared drag interactions ====================================

  var callback = window.updateTypography;
  if (typeof callback !== "function") {
    return; // project didn't opt in
  }

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

  // --- Seed center from project globals if available (WebGL topography) ---

  // Default center: middle of normalized space
  var center = { x: 0.5, y: 0.5 };

  // If the project exposes cameraHeight / cameraPan like topography.js,
  // use them to derive an approximate initial center that matches
  // the initial render.
  if (
    typeof window.cameraHeight === "number" &&
    typeof window.cameraPan === "number"
  ) {
    var CAMERA_RANGE = 3000; // must match the constant used in updateTypography

    var x0 = 1 + window.cameraPan / CAMERA_RANGE;
    var y0 = 1 - window.cameraHeight / CAMERA_RANGE;

    center = {
      x: clamp(x0, 0, 1),
      y: clamp(y0, 0, 1),
    };
  }

  var isDragging = false;
  var dragOrigin = null;        // where this drag started (normalized)
  var lastMapped = null;        // last mapped coords of current drag

  function handleDragMove(event) {
    var current = getNormalizedCoords(event);

    if (!dragOrigin) {
      dragOrigin = { x: current.x, y: current.y };
    }

    var dx = current.x - dragOrigin.x;
    var dy = current.y - dragOrigin.y;

    // Apply movement relative to the persistent center
    var mappedX = clamp(center.x + dx, 0, 1);
    var mappedY = clamp(center.y + dy, 0, 1);

    lastMapped = { x: mappedX, y: mappedY };

    callback({
      x: mappedX,
      y: mappedY,
      raw: current,
      origin: dragOrigin,
      center: center,
    });
  }

  target.style.cursor = "grab";

  target.addEventListener("pointerdown", function (ev) {
    isDragging = true;
    dragOrigin = getNormalizedCoords(ev); // don't call callback on click
    target.style.cursor = "grabbing";

    if (target.setPointerCapture) {
      try {
        target.setPointerCapture(ev.pointerId);
      } catch (e) {
        // ignore
      }
    }
  });

  target.addEventListener("pointermove", function (ev) {
    if (!isDragging) return;
    handleDragMove(ev);
  });

  function stopDrag(ev) {
    if (lastMapped) {
      // Persist the final position as the new center for the next drag
      center = { x: lastMapped.x, y: lastMapped.y };
    }

    isDragging = false;
    dragOrigin = null;
    lastMapped = null;
    target.style.cursor = "grab";

    if (ev && ev.pointerId != null && target.releasePointerCapture) {
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch (e) {
        // ignore
      }
    }
  }

  target.addEventListener("pointerup", stopDrag);
  target.addEventListener("pointercancel", stopDrag);
})();
