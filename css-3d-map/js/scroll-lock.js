// Permanently disable user-driven scroll, but allow programmatic scroll
(function () {
    const keysThatScroll = {
        32: true, // space
        33: true, // page up
        34: true, // page down
        35: true, // end
        36: true, // home
        37: true, // left
        38: true, // up
        39: true, // right
        40: true, // down
    };

    function preventDefault(e) {
        e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
        if (keysThatScroll[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    // Lock scroll as soon as the script runs
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", preventDefaultForScrollKeys, false);
})();
