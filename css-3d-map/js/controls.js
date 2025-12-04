// controls.js
(function () {
  var root = document.documentElement;
  var cubeWrap = document.querySelector(".cube-wrap") || root;
  var controlsRoot = document.querySelector(".controls");
  if (!controlsRoot) return;

  var inputs = controlsRoot.querySelectorAll('input.gui-input[type="range"]');
  var militaryBtn = controlsRoot.querySelector(".btn-military");

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function formatValue(name, value) {
    switch (name) {
      case "rZ":
      case "rX":
      case "rY":
        return value + "deg";
      case "tY":
      case "tX":
        return value + "%";
      case "tZ":
        return value + "px";
      case "sC":
        return value; // scale is unitless
      default:
        return value;
    }
  }

  function cssVarName(name) {
    // Map slider name -> CSS custom property
    // e.g. rZ -> --rZ, tX -> --tX, etc.
    return "--" + name;
  }

  function applyControl(input) {
    if (!input || !input.name) return;

    var name = input.name;
    var rawValue = parseFloat(input.value);

    if (isNaN(rawValue)) return;

    var min = input.min !== "" ? parseFloat(input.min) : rawValue;
    var max = input.max !== "" ? parseFloat(input.max) : rawValue;
    var step = input.step !== "" ? Math.abs(parseFloat(input.step)) : null;

    var clamped = clamp(rawValue, min, max);
    if (step && step > 0) {
      clamped = Math.round(clamped / step) * step;
    }

    // Write the (possibly adjusted) value back into the input
    input.value = clamped;

    var formatted = formatValue(name, clamped);
    var varName = cssVarName(name);

    // Update CSS custom property on the map container
    cubeWrap.style.setProperty(varName, formatted);

    // Update the visible <span> text inside the label
    var labelSpan = input.parentElement && input.parentElement.querySelector("span");
    if (labelSpan) {
      labelSpan.textContent = formatted;
    }
  }

  // Wire up all sliders
  inputs.forEach(function (input) {
    input.addEventListener("input", function () {
      applyControl(input);
    });

    // Seed CSS vars and labels from initial values
    applyControl(input);
  });

  // Military mode toggle
  if (militaryBtn) {
    militaryBtn.addEventListener("click", function () {
      document.body.classList.toggle("military");
    });
  }

  // --- Public helper so other scripts (drag, etc.) can sync sliders ---

  window.setControlValue = function (name, value) {
    var input = controlsRoot.querySelector('input.gui-input[name="' + name + '"]');
    if (!input) return;

    input.value = value;
    applyControl(input);
  };
})();
