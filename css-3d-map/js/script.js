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
  };