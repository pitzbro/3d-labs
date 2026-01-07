const sidebar = document.querySelector('.sidebar');

function myFunction(x) {
  if (x.matches) { // If media query matches
    sidebar.classList.remove('open');
    console.log('matches!!!')
  }
}

// Create a MediaQueryList object
var x = window.matchMedia("(max-width: 860px)");

// Call listener function at run time
myFunction(x);

// Attach listener function on state changes
x.addEventListener("change", function() {
  myFunction(x);
});