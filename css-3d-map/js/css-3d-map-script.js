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
    asset.style.top = `${top + height / 2 - 10}px`;

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

  updateCodePreview()

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
    // Update the code preview with the current cube transform
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

  // Reset map to default settings (sliders, CSS vars, code preview)
  window.resetMapDefaults = function () {
    // numeric values; applyControl will add units via formatValue()
    window.setControlValue("rZ", 5);    // 5deg
    window.setControlValue("rX", 35);   // 35deg
    window.setControlValue("rY", 1);    // 1deg
    window.setControlValue("tY", -7);   // -7%
    window.setControlValue("tX", 10);   // 10%
    window.setControlValue("tZ", -61);  // -61px
    window.setControlValue("sC", 0.8);  // 0.8 (unitless)
    // applyControl already calls moveAssets(), which calls updateCodePreview()
  };

  window.onresize = () => moveAssets();
})();

// Code 
function updateCodePreview() {
  const codeEl = document.querySelector(".map-code");
  const cube = document.querySelector(".cube");

  if (!cube || !codeEl) return;

  const style = getComputedStyle(cube);
  const transform = style.transform || "none";

  codeEl.textContent = `${transform};`;
}

// scroll behavior
const scrollPlayBtn = document.querySelector(".scroll-animatioin-play-btn");

if (scrollPlayBtn) {
  let speed = 14;
  let rafId = null;
  let isAutoScrolling = false;
  let isPaused = false;

  function getScrollInfo() {
    const doc = document.documentElement;
    const body = document.body;

    const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
    const scrollHeight = Math.max(
      body.scrollHeight,
      doc.scrollHeight,
      body.offsetHeight,
      doc.offsetHeight
    );
    const viewportHeight = window.innerHeight || doc.clientHeight;

    return { scrollTop, scrollHeight, viewportHeight };
  }

  function autoScrollStep() {
    if (isPaused) return;

    const { scrollTop, scrollHeight, viewportHeight } = getScrollInfo();
    const maxScrollTop = scrollHeight - viewportHeight;

    if (scrollTop >= maxScrollTop) {
      // Animation finished
      isAutoScrolling = false;
      rafId = null;
      scrollPlayBtn.textContent = "Play scroll animation";
      scrollPlayBtn.dataset.scrollAnimation = 'paused'

      // Jump instantly to top
      window.scrollTo(0, 0);

      // Reset map to default pose if helper exists
      if (typeof window.resetMapDefaults === "function") {
        window.resetMapDefaults();
      }

      return;
    }

    window.scrollBy(0, speed);
    rafId = requestAnimationFrame(autoScrollStep);
  }


  function startAutoScroll() {
    isAutoScrolling = true;
    isPaused = false;
    scrollPlayBtn.textContent = "Pause scroll animation";
    scrollPlayBtn.dataset.scrollAnimation = 'playing'
    autoScrollStep();
  }

  function pauseAutoScroll() {
    isPaused = true;
    scrollPlayBtn.textContent = "Play scroll animation";
    scrollPlayBtn.dataset.scrollAnimation = 'paused'
  }

  function resumeAutoScroll() {
    isPaused = false;
    scrollPlayBtn.textContent = "Pause scroll animation";
    scrollPlayBtn.dataset.scrollAnimation = 'playing'
    autoScrollStep();
  }

  scrollPlayBtn.addEventListener("click", () => {
    if (!isAutoScrolling) {
      // First time pressing Play
      startAutoScroll();
    } else if (isPaused) {
      // Resume
      resumeAutoScroll();
    } else {
      // Pause
      pauseAutoScroll();
    }
  });
}