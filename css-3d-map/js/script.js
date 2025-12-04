const circles = Array.from(document.querySelectorAll("[data-circle]"));
const assets = document.querySelectorAll("[data-asset]");

var svg = document.getElementById("main-svg");
// svg.pauseAnimations();

const animation = document.querySelector("#t-animation");

const animationDur =
  Number(animation.getAttribute("dur").replace("ms", "")) / 1000;

let int = null;
let lastScrollTop = 0;

const clock = document.querySelector(".clock");

window.addEventListener(
  "scroll",
  () => {
    requestAnimationFrame(moveAssets);
  },
  false
);

function moveAssets() {
  const prec =
    window.pageYOffset / (document.body.offsetHeight - window.innerHeight);

  const time = `06:${Math.round(prec * 10) + 12}`;

  clock.innerText = time;

  document.body.style.setProperty("--scroll", prec);

  assets.forEach((asset) => {
    const circle = circles.find(
      (circle) => circle.dataset.circle === asset.dataset.asset
    );
    const { left, top, width, height } = circle.getBoundingClientRect();
    asset.style.left = `${left + width / 2}px`;
    asset.style.top = `${top + height / 2 -10}px`;

    const start = asset.dataset.start;
    const end = asset.dataset.end;

    if (prec >= start && prec <= end) {
      asset.classList.add("active");
      circle.nextElementSibling.classList.add("active");
    } else {
      asset.classList.remove("active");
      circle.nextElementSibling.classList.remove("active");
    }

    // animateTer(prec);
  });
}

// observer
const section = document.querySelector(".territory-observer");
const teritoryObserver = new IntersectionObserver(updateTeritory, {
  rootMargin: "-50% 0%",
});
teritoryObserver.observe(section);

function updateTeritory(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animation.beginElement(0);
    }
  });
}

function animateTer(prec) {
  // clearInterval(int);
  const animationPrec =
    (animation.getCurrentTime() % animationDur) / animationDur;
  var st = window.pageYOffset || document.documentElement.scrollTop;

  if (st > lastScrollTop) {
    console.log("scrolled down starting animation!");
    // svg.unpauseAnimations();
    animation.beginElement(0);
  } else if (st < lastScrollTop) {
    console.log("scrolled up", animation.getCurrentTime());
  } // else was horizontal scroll
  lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
}

// Convenience: linear map normalized [0,1] -> [min,max]
function mapNormToRange(norm, min, max) {
  return min + norm * (max - min);
}

function getRangeMeta(name) {
  var input = document.querySelector('.controls .gui-input[name="' + name + '"]');
  if (!input) return null;

  var min = input.min !== "" ? parseFloat(input.min) : 0;
  var max = input.max !== "" ? parseFloat(input.max) : 1;
  var step = input.step !== "" ? Math.abs(parseFloat(input.step)) : null;

  return { input: input, min: min, max: max, step: step };
}

function quantize(value, step) {
  if (!step || step <= 0) return value;
  return Math.round(value / step) * step;
}

// Called from shared/shared-interactions/interactions.js
window.updateTypography = function (coords) {

  var xNorm = coords && typeof coords.x === "number" ? coords.x : 0.5;
  var yNorm = coords && typeof coords.y === "number" ? coords.y : 0.5;

  // Map drag X -> rotateZ, drag Y -> rotateX
  var rZMeta = getRangeMeta("rZ");
  var rXMeta = getRangeMeta("rX");

  if (!rZMeta || !rXMeta) return;

  var rZValue = mapNormToRange(xNorm, rZMeta.min, rZMeta.max);
  var rXValue = mapNormToRange(yNorm, rXMeta.min, rXMeta.max);

  rZValue = quantize(rZValue, rZMeta.step);
  rXValue = quantize(rXValue, rXMeta.step);

  // Use the helper from controls.js so CSS vars + labels stay in sync
  if (typeof window.setControlValue === "function") {
    window.setControlValue("rZ", rZValue);
    window.setControlValue("rX", rXValue);
  } else {
    // Fallback: directly update inputs if helper not available
    if (rZMeta.input) {
      rZMeta.input.value = rZValue;
      var spanZ = rZMeta.input.parentElement.querySelector("span");
      if (spanZ) spanZ.textContent = rZValue + "deg";
    }
    if (rXMeta.input) {
      rXMeta.input.value = rXValue;
      var spanX = rXMeta.input.parentElement.querySelector("span");
      if (spanX) spanX.textContent = rXValue + "deg";
    }

    var cubeWrap = document.querySelector(".cube-wrap") || document.documentElement;
    cubeWrap.style.setProperty("--rZ", rZValue + "deg");
    cubeWrap.style.setProperty("--rX", rXValue + "deg");
  }

  moveAssets();
};

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

    moveAssets();
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
