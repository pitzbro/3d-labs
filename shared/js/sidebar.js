const sidebar = document.querySelector('.sidebar');

sidebar.onclick = (ev) => ev.stopPropagation();

function myFunction(x) {
  if (x.matches) { // If media query matches
    sidebar.classList.remove('open');
  } else {
    sidebar.classList.add('open');
  }
}

// Create a MediaQueryList object
var x = window.matchMedia("(orientation: portrait)");

// Call listener function at run time
myFunction(x);

// Attach listener function on state changes
x.addEventListener("change", function() {
  myFunction(x);
});