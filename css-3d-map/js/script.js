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
    asset.style.top = `${top + height / 2 + 2}px`;

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
    // int = setInterval(() => {
    //   console.log(
    //     "prec",
    //     parseFloat(prec).toFixed(1),
    //     "animationPrec",
    //     parseFloat(animationPrec).toFixed(1)
    //   );
    //   if (parseFloat(prec).toFixed(1) <= parseFloat(animationPrec).toFixed(1)) {
    //     console.log("pausing animation!");
    //     clearInterval(int);
    //     svg.pauseAnimations();
    //   }
    // }, 0.01);
  } else if (st < lastScrollTop) {
    console.log("scrolled up", animation.getCurrentTime());
    // animation.endElement(0);
    // svg.pauseAnimations();
    // svg.setCurrentTime(0);
    // clearInterval(int);
  } // else was horizontal scroll
  lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
}

// Allow shared/js/interactions.js to drive this scene
window.updateTypography = function ({ x, y }) {
  // x,y in [0,1] relative to .cube-wrap

  // Map pointer to rotations:
  const rotateY = (x - 0.5) * 60; // -30deg .. +30deg
  const rotateX = (y - 0.5) * -60; // +30deg .. -30deg

  document.documentElement.style.setProperty("--rY", `${rotateY.toFixed(1)}deg`);
  document.documentElement.style.setProperty("--rX", `${rotateX.toFixed(1)}deg`);
};
