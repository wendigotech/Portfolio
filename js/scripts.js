// add magic mouse
// initialize magic mouse (gated for performance and accessibility)
(function initMagicMouse() {
    try {
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
        var saveData = !!(navigator.connection && navigator.connection.saveData);
        if (prefersReduced || !finePointer || saveData) return;
        var init = function () {
            var options = {
                outerStyle: 'circle',
                hoverEffect: 'pointer-overlay',
                hoverItemMove: false,
                defaultCursor: false,
                outerWidth: 50,
                outerHeight: 50,
            };
            if (typeof magicMouse === 'function') {
                magicMouse(options);
            }
        };
        if ('requestIdleCallback' in window) {
            requestIdleCallback(init, { timeout: 1500 });
        } else {
            setTimeout(init, 500);
        }
    } catch (_) { /* no-op */ }
})();

// initialize
let bp = BiggerPicture({
    target: document.body,
})

// grab image links
let imageLinks = document.querySelectorAll('.images > a, .project-showcase__slide')

// add click listener to open BiggerPicture
for (let link of imageLinks) {
    link.addEventListener("click", openGallery);
}

// function to open BiggerPicture
function openGallery(e) {
    e.preventDefault()
    bp.open({
        items: imageLinks,
        el: e.currentTarget,
    })
}
