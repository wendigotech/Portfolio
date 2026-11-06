// initialize custom magic cursor (zero-lag hardware-accelerated compositor layer)
(function initMagicMouse() {
    try {
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
        var saveData = !!(navigator.connection && navigator.connection.saveData);
        if (prefersReduced || !finePointer || saveData) return;

        var init = function () {
            if (document.getElementById('magicMouseCursor') || document.getElementById('magicPointer')) return;

            var outer = document.createElement('div');
            outer.id = 'magicMouseCursor';
            document.body.appendChild(outer);

            var pointer = document.createElement('div');
            pointer.id = 'magicPointer';
            document.body.appendChild(pointer);

            var baseSize = 44;
            var pointerHalf = 19;
            var pointerX = -100;
            var pointerY = -100;
            var targetX = -100;
            var targetY = -100;
            var currentX = -100;
            var currentY = -100;
            var outerScale = 1;
            var currentScale = 1;
            var hoveredEl = null;
            var lastTarget = null;
            var hasMoved = false;
            var rafId = 0;
            var scrollRafId = 0;
            var lastFrameTime = 0;

            outer.style.opacity = '0';
            pointer.style.opacity = '0';

            function render(now) {
                rafId = 0;
                var dt = lastFrameTime ? Math.min(64, Math.max(1, now - lastFrameTime)) : 16.67;
                lastFrameTime = now;

                var dx = targetX - currentX;
                var dy = targetY - currentY;
                var ds = outerScale - currentScale;

                if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15 || Math.abs(ds) > 0.005) {
                    var posAlpha = 1 - Math.exp(-dt * 0.048);
                    var scaleAlpha = 1 - Math.exp(-dt * 0.038);
                    currentX += dx * posAlpha;
                    currentY += dy * posAlpha;
                    currentScale += ds * scaleAlpha;
                    outer.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px, ' + currentY.toFixed(1) + 'px, 0) scale(' + currentScale.toFixed(3) + ')';
                    rafId = window.requestAnimationFrame(render);
                } else {
                    lastFrameTime = 0;
                    currentX = targetX;
                    currentY = targetY;
                    currentScale = outerScale;
                    outer.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px, ' + currentY.toFixed(1) + 'px, 0) scale(' + currentScale.toFixed(3) + ')';
                }
            }

            function scheduleRender() {
                if (!rafId) {
                    lastFrameTime = performance.now();
                    rafId = window.requestAnimationFrame(render);
                }
            }

            function updateHoverTarget(el) {
                if (el === hoveredEl) return;
                hoveredEl = el;
                if (el) {
                    outerScale = 1.22;
                    outer.classList.add('is-hover');
                    pointer.classList.add('is-hover', 'pointer-overlay');
                    if (el.classList.contains('magic-hover__square')) {
                        outer.classList.add('cursor-square');
                        pointer.classList.add('cursor-square');
                    } else {
                        outer.classList.remove('cursor-square');
                        pointer.classList.remove('cursor-square');
                    }
                } else {
                    outerScale = 1;
                    outer.classList.remove('is-hover', 'cursor-square');
                    pointer.classList.remove('is-hover', 'pointer-overlay', 'cursor-square');
                }
                scheduleRender();
            }

            document.addEventListener('pointermove', function (e) {
                if (e.pointerType === 'touch') return;
                pointerX = e.clientX;
                pointerY = e.clientY;
                targetX = pointerX - baseSize / 2;
                targetY = pointerY - baseSize / 2;

                if (!hasMoved) {
                    hasMoved = true;
                    currentX = targetX;
                    currentY = targetY;
                    outer.style.opacity = '1';
                    pointer.style.opacity = '1';
                }

                // Zero-latency inner pointer update on compositor layer
                pointer.style.transform = 'translate3d(' + (pointerX - pointerHalf) + 'px, ' + (pointerY - pointerHalf) + 'px, 0)';

                if (e.target !== lastTarget) {
                    lastTarget = e.target;
                    var hoverCandidate = e.target && e.target.closest
                        ? e.target.closest('.magic-hover, a[href], button:not([disabled]), summary')
                        : null;
                    if (hoverCandidate !== hoveredEl) {
                        updateHoverTarget(hoverCandidate);
                    }
                }
                scheduleRender();
            }, { passive: true });

            window.addEventListener('scroll', function () {
                if (!hoveredEl || scrollRafId) return;
                scrollRafId = window.requestAnimationFrame(function () {
                    scrollRafId = 0;
                    if (!hoveredEl) return;
                    var r = hoveredEl.getBoundingClientRect();
                    if (pointerX < r.left || pointerX > r.right || pointerY < r.top || pointerY > r.bottom) {
                        lastTarget = null;
                        updateHoverTarget(null);
                    }
                });
            }, { passive: true });

            document.documentElement.addEventListener('mouseleave', function () {
                hasMoved = false;
                lastTarget = null;
                outer.style.opacity = '0';
                pointer.style.opacity = '0';
                updateHoverTarget(null);
            }, { passive: true });
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(init, { timeout: 600 });
        } else {
            setTimeout(init, 100);
        }
    } catch (_) { /* no-op */ }
})();

// initialize BiggerPicture lightbox if available
if (typeof BiggerPicture === 'function') {
    let bp = BiggerPicture({
        target: document.body,
    });

    let imageLinks = document.querySelectorAll('.images > a, .project-showcase__slide');

    for (let link of imageLinks) {
        link.addEventListener("click", openGallery);
    }

    function openGallery(e) {
        e.preventDefault();
        bp.open({
            items: imageLinks,
            el: e.currentTarget,
        });
    }
}

