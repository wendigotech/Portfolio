const vfx = createVfxController();
loadVfxLibrary(vfx);

const div = document.querySelector('.vfx');
const el = document.querySelector('.vfx2')
const el2 = document.querySelector('.vfx3')
const el3 = document.querySelector('.vfx4')
const el4 = document.querySelector('.vfx5')
const el5 = document.querySelector('.vfx6')
// const video = document.querySelector('#myVideo')

const body = document.body;
body.classList.add('js-animate', 'has-js');

(function initThemeToggle() {
    const root = document.documentElement;
    if (!root) return;

    const storageKey = 'portfolio-color-theme';
    const toggle = document.querySelector('[data-theme-toggle]');
    const toggleText = toggle?.querySelector('[data-theme-toggle-text]');
    const prefersDark = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;

    const buildLabel = (nextTheme) => nextTheme === 'light'
        ? 'Zum hellen Modus wechseln'
        : 'Zum dunklen Modus wechseln';

    const safeSetItem = (key, value) => {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Das Speichern der Theme-Einstellung ist nicht möglich.', error);
        }
    };

    const safeGetItem = (key) => {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            console.warn('Das Lesen der Theme-Einstellung ist nicht möglich.', error);
            return null;
        }
    };

    const applyTheme = (theme, { persist = false } = {}) => {
        const safeTheme = theme === 'light' ? 'light' : 'dark';
        root.setAttribute('data-theme', safeTheme);
        if (toggle) {
            const nextTheme = safeTheme === 'light' ? 'dark' : 'light';
            const label = buildLabel(nextTheme);
            toggle.setAttribute('aria-pressed', safeTheme === 'light' ? 'true' : 'false');
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
            if (toggleText) {
                toggleText.textContent = label;
            }
        }

        if (persist) {
            safeSetItem(storageKey, safeTheme);
        }
    };

    const getSystemTheme = () => {
        if (!prefersDark) return 'dark';
        return prefersDark.matches ? 'dark' : 'light';
    };

    const storedTheme = safeGetItem(storageKey);
    if (storedTheme) {
        applyTheme(storedTheme);
    } else {
        applyTheme(getSystemTheme());
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme, { persist: true });
        });
    }

    const handleSystemChange = (event) => {
        const stored = safeGetItem(storageKey);
        if (stored) return;
        applyTheme(event.matches ? 'dark' : 'light');
    };

    if (prefersDark) {
        if (typeof prefersDark.addEventListener === 'function') {
            prefersDark.addEventListener('change', handleSystemChange);
        } else if (typeof prefersDark.addListener === 'function') {
            prefersDark.addListener(handleSystemChange);
        }
    }
}());

function loadVfxLibrary(controller) {
    try {
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const saveData = !!(navigator.connection && navigator.connection.saveData);
        if (prefersReduced || saveData) {
            console.warn('VFX effects disabled — reduced motion or save-data enabled.');
            return;
        }
    } catch (_) { /* ignore */ }
    import("https://esm.sh/@vfx-js/core")
        .then(({ VFX }) => {
            controller.setInstance(new VFX());
        })
        .catch((error) => {
            console.warn('VFX effects disabled — library could not be loaded.', error);
        });
}

function createVfxController() {
    const queue = new Map();
    let instance = null;

    function flushQueue() {
        if (!instance || !queue.size) return;
        queue.forEach((config, element) => {
            instance.add(element, config);
        });
        queue.clear();
    }

    return {
        add(element, config = {}) {
            if (!element) return;
            if (instance) {
                instance.add(element, config);
            } else {
                queue.set(element, config);
            }
        },
        remove(element) {
            if (!element) return;
            if (instance) {
                instance.remove(element);
            } else {
                queue.delete(element);
            }
        },
        setInstance(newInstance) {
            instance = newInstance;
            flushQueue();
        }
    };
}

(function initAccessibleNavigation() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.getElementById('site-menu');
    if (!toggle || !menu) return;

    const mq = window.matchMedia('(min-width: 48rem)');
    const menuLinks = Array.from(menu.querySelectorAll('a[href]'));
    let isMenuOpen = false;

    const setLinksFocusable = (isFocusable) => {
        menuLinks.forEach((link) => {
            if (isFocusable) {
                link.removeAttribute('tabindex');
            } else {
                link.setAttribute('tabindex', '-1');
            }
        });
    };

    function openMenu({ focusFirst = false } = {}) {
        toggle.setAttribute('aria-expanded', 'true');
        try { toggle.setAttribute('aria-label', 'Menü schließen'); } catch (_) {}
        menu.classList.add('is-open');
        isMenuOpen = true;
        if (!mq.matches) {
            setLinksFocusable(true);
            if (focusFirst) {
                window.requestAnimationFrame(() => {
                    menuLinks[0]?.focus();
                });
            }
        } else {
            setLinksFocusable(true);
        }
    }

    function closeMenu({ returnFocus = false } = {}) {
        toggle.setAttribute('aria-expanded', 'false');
        try { toggle.setAttribute('aria-label', 'Menü öffnen'); } catch (_) {}
        menu.classList.remove('is-open');
        isMenuOpen = false;
        if (!mq.matches) {
            setLinksFocusable(false);
        } else {
            setLinksFocusable(true);
        }
        if (returnFocus) {
            toggle.focus();
        }
    }

    function handleChange(e) {
        if (e.matches) {
            openMenu();
        } else {
            closeMenu();
        }
    }

    handleChange(mq);

    if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handleChange);
    } else if (typeof mq.addListener === 'function') {
        mq.addListener(handleChange);
    }

    toggle.addEventListener('click', () => {
        if (mq.matches) return;
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            closeMenu();
        } else {
            openMenu({ focusFirst: true });
        }
    });

    menu.addEventListener('click', (event) => {
        if (mq.matches) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest('a');
        if (link) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (mq.matches) return;
        if (event.key === 'Escape' && isMenuOpen) {
            closeMenu({ returnFocus: true });
        }
    });

    if (!mq.matches) {
        setLinksFocusable(false);
    }
}());

(function initScrollSpyNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.header .menu a[href^="#"]'));
    if (!navLinks.length) return;

    const observedSections = navLinks
        .map((link) => {
            const hash = link.getAttribute('href');
            if (!hash) return null;
            const id = decodeURIComponent(hash).replace(/^#/, '');
            if (!id) return null;
            const section = document.getElementById(id);
            if (!section) return null;
            link.dataset.sectionId = id;
            return { id, section, link };
        })
        .filter(Boolean);

    if (!observedSections.length) return;

    let activeId = '';

    function setActive(id) {
        if (!id || activeId === id) return;
        activeId = id;
        navLinks.forEach((link) => {
            const matches = link.dataset.sectionId === id;
            link.classList.toggle('is-active', matches);
            if (matches) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, {
        rootMargin: '-55% 0px -40% 0px',
        threshold: 0
    });

    observedSections.forEach(({ section }) => {
        spyObserver.observe(section);
    });

    const initialSection = observedSections.find(({ section }) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2;
    }) || observedSections[0];

    if (initialSection) {
        setActive(initialSection.id);
    }

    window.addEventListener('hashchange', () => {
        const { hash } = window.location;
        if (!hash) return;
        const id = decodeURIComponent(hash).replace(/^#/, '');
        if (!id) return;
        const hasSection = observedSections.some(({ section }) => section.id === id);
        if (hasSection) {
            setActive(id);
        }
    });
}());

(function toggleHeroSlideshowsOnMobile() {
    const slideshows = Array.from(document.querySelectorAll('.grid-main-hero .tech-slideshow'));
    if (!slideshows.length || typeof window.matchMedia !== 'function') return;

    const mobileQuery = window.matchMedia('(max-width: 48rem)');

    const applyVisibility = (isMobile) => {
        slideshows.forEach((slideshow) => {
            if (isMobile) {
                slideshow.setAttribute('hidden', '');
                slideshow.setAttribute('aria-hidden', 'true');
            } else {
                slideshow.removeAttribute('hidden');
                slideshow.removeAttribute('aria-hidden');
            }
        });
    };

    applyVisibility(mobileQuery.matches);

    const handleChange = (event) => {
        applyVisibility(event.matches);
    };

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', handleChange);
    } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(handleChange);
    }
}());

(function initTechSlideshowReveal() {
    const slideshows = document.querySelectorAll('.tech-slideshow');
    if (!slideshows.length) return;

    slideshows.forEach((slideshow) => {
        let frameRequested = false;
        let lastPointer = { x: 0, y: 0 };

        const updatePointerPosition = () => {
            const rect = slideshow.getBoundingClientRect();
            const x = lastPointer.x - rect.left;
            const y = lastPointer.y - rect.top;
            const clampedX = Math.max(0, Math.min(rect.width, x));
            const clampedY = Math.max(0, Math.min(rect.height, y));
            slideshow.style.setProperty('--pointer-x', `${clampedX}px`);
            slideshow.style.setProperty('--pointer-y', `${clampedY}px`);
        };

        const handlePointerMove = (event) => {
            if (event.pointerType === 'touch') return;
            slideshow.classList.add('is-pointer-active');
            lastPointer = {
                x: event.clientX,
                y: event.clientY
            };
            if (frameRequested) return;
            frameRequested = true;
            window.requestAnimationFrame(() => {
                updatePointerPosition();
                frameRequested = false;
            });
        };

        const handlePointerLeave = () => {
            slideshow.classList.remove('is-pointer-active');
            const rect = slideshow.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            lastPointer = { x: centerX, y: centerY };
            updatePointerPosition();
        };

        slideshow.addEventListener('pointermove', handlePointerMove);
        slideshow.addEventListener('pointerenter', handlePointerMove);
        slideshow.addEventListener('pointerleave', handlePointerLeave);
        slideshow.addEventListener('pointercancel', handlePointerLeave);

        Object.defineProperty(slideshow, '__refreshPointer', {
            value: () => {
                if (slideshow.classList.contains('is-pointer-active')) {
                    updatePointerPosition();
                }
            },
            configurable: true
        });

        const rect = slideshow.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        lastPointer = { x: centerX, y: centerY };
        updatePointerPosition();
    });
}());

(function initTechSlideshowMarquee() {
    const slideshows = document.querySelectorAll('.tech-slideshow');
    if (!slideshows.length) return;

    const states = Array.from(slideshows, (slideshow) => {
        const tracks = Array.from(slideshow.querySelectorAll('.tech-slideshow__track'));
        if (!tracks.length) return null;

        const trackStates = tracks.map((track) => {
            const prefersUp = track.classList.contains('tech-slideshow__track--up');
            const durationAttr = parseFloat(track.getAttribute('data-scroll-duration') || '');
            const duration = Number.isFinite(durationAttr) && durationAttr > 0 ? durationAttr : 32;
            const inner = track.querySelector('.tech-slideshow__inner') || track;

            return {
                container: track,
                inner,
                direction: prefersUp ? -1 : 1,
                duration,
                speed: 0,
                halfHeight: 0,
                value: 0
            };
        });

        return {
            slideshow,
            tracks: trackStates
        };
    }).filter(Boolean);

    if (!states.length) return;

    const reduceMotionQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const mobileQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(max-width: 48rem)')
        : null;

    const resetToStatic = () => {
        states.forEach((state) => {
            state.tracks.forEach((trackState) => {
                const { inner } = trackState;
                trackState.speed = 0;
                trackState.halfHeight = 0;
                trackState.value = 0;
                if (inner) {
                    inner.style.transform = 'translateY(0px)';
                }
            });
        });
    };

    const recalc = () => {
        states.forEach((state) => {
            state.tracks.forEach((trackState) => {
                const { inner, direction, duration } = trackState;
                if (!inner) return;

                if (mobileQuery && mobileQuery.matches) {
                    trackState.speed = 0;
                    trackState.value = 0;
                    inner.style.transform = 'translateY(0px)';
                    return;
                }

                const scrollHeight = inner.scrollHeight;
                const halfHeight = scrollHeight / 2;

                trackState.halfHeight = halfHeight;

                if (!halfHeight || !Number.isFinite(duration) || duration <= 0) {
                    trackState.speed = 0;
                    trackState.value = 0;
                    inner.style.transform = 'translateY(0px)';
                    return;
                }

                trackState.speed = halfHeight / duration;
                trackState.value = direction === 1 ? -halfHeight : 0;
                inner.style.transform = `translateY(${trackState.value}px)`;
            });
        });
    };

    const scheduleRecalc = () => {
        recalc();
    };

    recalc();

    if (document.readyState === 'complete') {
        scheduleRecalc();
    } else {
        window.addEventListener('load', scheduleRecalc, { once: true });
    }

    let resizeRaf = 0;
    window.addEventListener('resize', () => {
        if (resizeRaf) {
            cancelAnimationFrame(resizeRaf);
        }
        resizeRaf = requestAnimationFrame(() => {
            resizeRaf = 0;
            scheduleRecalc();
        });
    });

    let paused = (reduceMotionQuery ? reduceMotionQuery.matches : false)
        || (mobileQuery ? mobileQuery.matches : false);

    const handleReduceMotion = (event) => {
        paused = event.matches || (mobileQuery ? mobileQuery.matches : false);
        if (!paused) {
            scheduleRecalc();
        }
    };

    if (reduceMotionQuery) {
        if (typeof reduceMotionQuery.addEventListener === 'function') {
            reduceMotionQuery.addEventListener('change', handleReduceMotion);
        } else if (typeof reduceMotionQuery.addListener === 'function') {
            reduceMotionQuery.addListener(handleReduceMotion);
        }
    }

    const handleMobileChange = (event) => {
        if (event.matches) {
            paused = true;
            resetToStatic();
        } else {
            paused = reduceMotionQuery ? reduceMotionQuery.matches : false;
            scheduleRecalc();
        }
    };

    if (mobileQuery) {
        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', handleMobileChange);
        } else if (typeof mobileQuery.addListener === 'function') {
            mobileQuery.addListener(handleMobileChange);
        }
    }

    let previousTimestamp = null;

    const step = (timestamp) => {
        if (previousTimestamp === null) {
            previousTimestamp = timestamp;
        }

        const delta = timestamp - previousTimestamp;
        previousTimestamp = timestamp;

        if (!paused && delta > 0) {
            states.forEach((state) => {
                let pointerRefreshed = false;
                state.tracks.forEach((trackState) => {
                    const { inner, direction, speed, halfHeight } = trackState;
                    if (!inner || !speed || !halfHeight) return;

                    trackState.value += direction * speed * (delta / 1000);

                    if (direction === -1) {
                        while (trackState.value <= -halfHeight) {
                            trackState.value += halfHeight;
                        }
                    } else {
                        while (trackState.value >= 0) {
                            trackState.value -= halfHeight;
                        }
                    }

                    inner.style.transform = `translateY(${trackState.value}px)`;
                });

                if (!pointerRefreshed && state.slideshow.classList.contains('is-pointer-active')) {
                    const refresh = state.slideshow.__refreshPointer;
                    if (typeof refresh === 'function') {
                        refresh();
                        pointerRefreshed = true;
                    }
                }
            });
        }

        requestAnimationFrame(step);
    };

    if (mobileQuery && mobileQuery.matches) {
        resetToStatic();
    }

    document.addEventListener('visibilitychange', () => {
        paused = document.visibilityState === 'hidden'
            || (reduceMotionQuery ? reduceMotionQuery.matches : false)
            || (mobileQuery ? mobileQuery.matches : false);
    });

    requestAnimationFrame(step);
}());

(function initBackgroundVideo() {
    const video = document.getElementById('myVideo');
    if (!video) return;

    const playSafely = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(() => {
                /* Suppress autoplay rejections; background video is non-critical */
            });
        }
    };

    const enableVideo = () => {
        if (!video.hasAttribute('autoplay')) {
            video.setAttribute('autoplay', '');
        }
        video.classList.remove('is-disabled');
        playSafely();
    };

    const disableVideo = () => {
        video.pause();
        video.removeAttribute('autoplay');
        video.classList.add('is-disabled');
    };

    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReduceMotion = (event) => {
        if (event.matches) {
            disableVideo();
        } else {
            enableVideo();
        }
    };

    handleReduceMotion(reduceMotionQuery);
    if (typeof reduceMotionQuery.addEventListener === 'function') {
        reduceMotionQuery.addEventListener('change', handleReduceMotion);
    } else if (typeof reduceMotionQuery.addListener === 'function') {
        reduceMotionQuery.addListener(handleReduceMotion);
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.saveData) {
        const highQualitySources = video.querySelectorAll('source[data-quality="high"]');
        highQualitySources.forEach((source) => {
            source.removeAttribute('src');
            source.parentElement?.removeChild(source);
        });
        video.load();
    }

    video.addEventListener('loadeddata', () => {
        video.classList.add('is-ready');
        if (!video.classList.contains('is-disabled')) {
            playSafely();
        }
    }, { once: true });
}());

vfx.add(div, { shader: "warpTransition", overflow: 0 });
vfx.add(el, { shader: "slitScanTransition", overflow: 0 });
vfx.add(el2, { shader: "pixelateTransition", overflow: 0 });
vfx.add(el3, { shader: "rgbShift", overflow: 0 });
vfx.add(el4, { shader: "rainbow", overflow: 0 });
vfx.add(el5, { shader: "sinewave", overflow: 0 });
// vfx.add(video, { shader: "focusTransition", overflow: 100 });


// | "uvGradient"
// | "rainbow"
// | "glitch"
// | "rgbGlitch"
// | "rgbShift"
// | "shine"
// | "blink"
// | "spring"
// | "duotone"
// | "tritone"
// | "hueShift"
// | "sinewave"
// | "pixelate"
// | "halftone"
// | "slitScanTransition"
// | "warpTransition"
// | "pixelateTransition"
// | "focusTransition";



// Scroll driven section reveals
(function initScrollScenes() {
    const scenes = Array.from(document.querySelectorAll('[data-scroll-scene]'));
    if (!scenes.length) return;

    const thresholds = [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1];
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const { target, intersectionRatio, isIntersecting } = entry;
            target.classList.toggle('is-scene-visible', isIntersecting);
            const progress = Math.max(0, Math.min(1, intersectionRatio || (isIntersecting ? 1 : 0)));
            target.style.setProperty('--scene-progress', progress.toFixed(3));
            if (!isIntersecting && progress === 0) {
                target.classList.remove('is-scene-visible');
            }
        });
    }, {
        threshold: thresholds,
        rootMargin: '0px 0px -10% 0px'
    });

    scenes.forEach((scene) => revealObserver.observe(scene));
}());

// Scroll storytelling timeline & accent transitions
(function initScrollStorytelling() {
    const scenes = Array.from(document.querySelectorAll('[data-scroll-scene]'));
    if (!scenes.length) return;

    const reduceMotionQuery = typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    if (reduceMotionQuery && reduceMotionQuery.matches) {
        return;
    }

    const storyEl = document.createElement('div');
    storyEl.className = 'scroll-storyline';
    storyEl.setAttribute('aria-hidden', 'true');

    const innerEl = document.createElement('div');
    innerEl.className = 'scroll-storyline__inner';
    storyEl.appendChild(innerEl);

    const trackEl = document.createElement('div');
    trackEl.className = 'scroll-storyline__track';
    const progressEl = document.createElement('div');
    progressEl.className = 'scroll-storyline__progress';
    trackEl.appendChild(progressEl);
    innerEl.appendChild(trackEl);

    const listEl = document.createElement('ol');
    listEl.className = 'scroll-storyline__list';
    innerEl.appendChild(listEl);

    const scenesData = scenes.map((scene, index) => {
        const title = (scene.dataset.sceneTitle || scene.querySelector('h1, h2, h3, summary')?.textContent || `Abschnitt ${index + 1}`).trim();

        const itemEl = document.createElement('li');
        itemEl.className = 'scroll-storyline__item';
        itemEl.setAttribute('data-scene-index', String(index));

        const triggerEl = document.createElement('button');
        triggerEl.type = 'button';
        triggerEl.className = 'scroll-storyline__trigger';
        triggerEl.setAttribute('aria-current', 'false');
        const labelText = title.trim();
        const ariaLabel = labelText ? `Abschnitt "${labelText}" anzeigen` : 'Abschnitt anzeigen';
        triggerEl.setAttribute('aria-label', ariaLabel);
        if (scene.id) {
            triggerEl.setAttribute('data-target-id', scene.id);
        }

        const dotEl = document.createElement('span');
        dotEl.className = 'scroll-storyline__dot';

        const labelEl = document.createElement('span');
        labelEl.className = 'scroll-storyline__label';
        labelEl.textContent = title;

        triggerEl.appendChild(dotEl);
        triggerEl.appendChild(labelEl);
        itemEl.appendChild(triggerEl);
        listEl.appendChild(itemEl);

        triggerEl.addEventListener('click', (event) => {
            event.preventDefault();
            if (!scene) return;
            const blockOption = scene.id === 'home' ? 'start' : 'center';
            scene.scrollIntoView({ behavior: 'smooth', block: blockOption });
            if (scene.id) {
                try {
                    history.replaceState(null, '', `#${scene.id}`);
                } catch (_) { /* no-op */ }
            }
            const focusTarget = scene.querySelector('h1, h2, h3, summary, [tabindex]:not([tabindex="-1"])');
            if (focusTarget && typeof focusTarget.focus === 'function') {
                window.setTimeout(() => {
                    try {
                        focusTarget.focus({ preventScroll: true });
                    } catch (_) {
                        focusTarget.focus();
                    }
                }, 450);
            }
        });

        return {
            element: scene,
            marker: itemEl,
            dot: dotEl,
            trigger: triggerEl,
            title,
            top: 0,
            height: 0,
            bottom: 0,
            progress: 0
        };
    });

    if (!scenesData.length) return;

    innerEl.style.setProperty('--marker-count', String(scenesData.length));
    document.body.appendChild(storyEl);
    document.body.classList.add('has-scroll-story');

    let activeScene = null;
    let rafId = 0;
    let totalStart = 0;
    let totalEnd = 0;

    const setActiveScene = (next) => {
        if (activeScene === next) return;
        if (activeScene) {
            activeScene.element.classList.remove('is-scene-active');
            activeScene.marker.classList.remove('is-active');
            if (activeScene.trigger) {
                activeScene.trigger.setAttribute('aria-current', 'false');
            }
        }
        activeScene = next || null;
        if (!activeScene) return;

        activeScene.element.classList.add('is-scene-active');
        activeScene.marker.classList.add('is-active');
        if (activeScene.trigger) {
            activeScene.trigger.setAttribute('aria-current', 'true');
        }
    };

    const updateMeasurements = () => {
        totalStart = Number.POSITIVE_INFINITY;
        totalEnd = Number.NEGATIVE_INFINITY;
        scenesData.forEach((data) => {
            const rect = data.element.getBoundingClientRect();
            data.top = window.scrollY + rect.top;
            data.height = rect.height;
            data.bottom = data.top + data.height;
            if (data.top < totalStart) totalStart = data.top;
            if (data.bottom > totalEnd) totalEnd = data.bottom;
        });

        if (!Number.isFinite(totalStart)) {
            totalStart = window.scrollY;
            totalEnd = totalStart + window.innerHeight;
        }
    };

    const updateProgress = () => {
        rafId = 0;
        const viewportMid = window.scrollY + window.innerHeight * 0.5;
        let candidate = null;

        scenesData.forEach((data) => {
            const rangeStart = data.top - window.innerHeight * 0.35;
            const rangeEnd = data.bottom + window.innerHeight * 0.35;
            const denominator = Math.max(rangeEnd - rangeStart, data.height, 1);
            let progress = 0;
            if (viewportMid >= rangeStart && viewportMid <= rangeEnd) {
                const raw = (viewportMid - rangeStart) / denominator;
                progress = Math.max(0, Math.min(1, raw));
            }
            data.progress = progress;
            data.element.style.setProperty('--scene-progress', progress.toFixed(3));
            data.marker.style.setProperty('--marker-progress', progress.toFixed(3));

            if (progress >= 0.45 && (!candidate || progress > candidate.progress)) {
                candidate = data;
            }
        });

        if (!candidate) {
            candidate = scenesData.reduce((best, data) => {
                if (!best || data.progress > best.progress) {
                    return data;
                }
                return best;
            }, null);
        }

        setActiveScene(candidate);

        const totalRange = Math.max(totalEnd - totalStart, window.innerHeight, 1);
        const totalProgress = Math.max(0, Math.min(1, (viewportMid - totalStart) / totalRange));
        const totalProgressValue = Number.parseFloat(totalProgress.toFixed(3));
        const totalProgressString = Number.isFinite(totalProgressValue) ? totalProgressValue.toString() : '0';
        progressEl.style.setProperty('--story-progress', totalProgressString);
        progressEl.style.transform = `scaleY(${totalProgressString})`;
    };

    const requestUpdate = () => {
        if (rafId) return;
        rafId = window.requestAnimationFrame(updateProgress);
    };

    const handleScroll = () => requestUpdate();
    const handleResize = () => {
        updateMeasurements();
        requestUpdate();
    };

    updateMeasurements();
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    if (typeof ResizeObserver === 'function') {
        const resizeObserver = new ResizeObserver(() => {
            updateMeasurements();
            requestUpdate();
        });
        scenesData.forEach((data) => resizeObserver.observe(data.element));
    }
}());

// use vfx-js slitScanTransition on sections on scroll 


const sections = document.querySelectorAll('section h1, section h2, section h3');
const options = {
    root: null,
    rootMargin: '2px',
    threshold: 0.3,
};

const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('intersecting');
            vfx.add(entry.target, { shader: "slitScanTransition", overflow: 0 });
        } else {
            entry.target.classList.remove('intersecting');
            vfx.remove(entry.target);
        }
    });
}, options);

sections.forEach((section, index) => {
    if (index !== 0) {
        observer2.observe(section);
    }
});

// use vfx-js warpTransition on img on hover

/* document.querySelectorAll('img').forEach(img => {
    img.addEventListener('mouseenter', () => {
        vfx.add(img, { shader: "warpTransition", overflow: 0 });
    });

    img.addEventListener('mouseleave', () => {
        vfx.remove(img);
    });
}); */


// --- Video mask on pointer move ----------------------------------------------------
// Draws the background video into a canvas and erases circular areas at pointer
// positions so parts of the video 'disappear' on mouse move. Holes fade out.
(function initVideoMask() {
    const video = document.getElementById('myVideo');
    if (!video) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'video-mask-canvas';
    canvas.style.position = 'fixed';
    canvas.style.left = '0';
    canvas.style.top = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    // video mask should be above the video but behind content; CSS sets #video-mask-canvas to z-index: -1
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let overlayFill = 'rgba(4, 6, 12, 0.72)';

    const updateVisualTokens = () => {
        const styles = window.getComputedStyle(document.documentElement);
        const overlayValue = styles.getPropertyValue('--video-overlay').trim();
        if (overlayValue) {
            overlayFill = overlayValue;
        }
        const filterValue = styles.getPropertyValue('--video-filter').trim();
        canvas.style.filter = filterValue || 'none';
    };

    updateVisualTokens();

    const themeObserver = new MutationObserver((mutations) => {
        if (mutations.some((mutation) => mutation.attributeName === 'data-theme')) {
            updateVisualTokens();
        }
    });

    themeObserver.observe(document.documentElement, { attributes: true });

    function resize() {
        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const ripples = [];
    const maxRipples = 30;
    const defaultRadius = 90; // px
    const fadeMs = 1000;

    document.addEventListener('pointermove', (e) => {
        // Use client coordinates
        const x = e.clientX;
        const y = e.clientY;
        ripples.push({ x, y, life: 0, maxLife: fadeMs, radius: defaultRadius * (0.7 + Math.random() * 0.6) });
        if (ripples.length > maxRipples) ripples.shift();
    }, { passive: true });

    let last = performance.now();

    function render(now) {
        const dt = now - last; last = now;

        // draw video frame scaled to cover the canvas (object-fit: cover behaviour)
        try {
            ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
            const vw = video.videoWidth, vh = video.videoHeight;
            const cw = canvas.width / dpr, ch = canvas.height / dpr;
            if (vw && vh) {
                const scale = Math.max(cw / vw, ch / vh);
                const sw = vw * scale, sh = vh * scale;
                const sx = (cw - sw) / 2, sy = (ch - sh) / 2;
                ctx.drawImage(video, sx, sy, sw, sh);
            } else {
                ctx.drawImage(video, 0, 0, cw, ch);
            }
        } catch (err) {
            // drawing the video can fail if video isn't ready or cross-origin; if so, disable effect
            console.warn('Video mask draw failed — disabling video mask effect.', err);
            canvas.remove();
            themeObserver.disconnect();
            return;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = overlayFill;
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        ctx.restore();

        // add ripples as soft dark overlays that follow the pointer
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        for (let i = ripples.length - 1; i >= 0; i--) {
            const p = ripples[i];
            p.life += dt;
            const t = Math.min(1, p.life / p.maxLife);
            if (t >= 1) { ripples.splice(i, 1); continue; }
            const radius = p.radius;
            const intensity = 0.65 * (1 - t);
            const gradient = ctx.createRadialGradient(p.x, p.y, radius * 0.15, p.x, p.y, radius);
            gradient.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        requestAnimationFrame(render);
    }

    if (video.readyState >= 2) {
        last = performance.now();
        requestAnimationFrame(render);
    } else {
        video.addEventListener('canplay', () => { last = performance.now(); requestAnimationFrame(render); }, { once: true });
    }

})();
// --- end video mask ---------------------------------------------------------------

(function initProjectShowcase() {
    const showcases = Array.from(document.querySelectorAll('[data-project-showcase]'));
    if (!showcases.length) return;
    showcases.forEach((showcase) => {

    const detailItems = Array.from(showcase.querySelectorAll('details[data-project-id]'));
    const previewItems = Array.from(showcase.querySelectorAll('[data-project-gallery] [data-project-id]'));
    const prevButton = showcase.querySelector('[data-showcase-prev]');
    const nextButton = showcase.querySelector('[data-showcase-next]');
    const exitButton = showcase.querySelector('[data-showcase-exit]');
    if (!detailItems.length || !previewItems.length) return;

    const detailIndexById = new Map();
    detailItems.forEach((detail, index) => {
        const id = detail.dataset.projectId;
        if (id) {
            detailIndexById.set(id, index);
        }
    });

    const previewById = new Map(previewItems.map(preview => [preview.dataset.projectId, preview]));
    const previewControlsValue = previewItems.map(preview => preview.id).filter(Boolean).join(' ');
    const fallbackPreview = previewItems[0] ?? null;

    const projectStates = new Map();

    previewItems.forEach((preview) => {
        const projectId = preview.dataset.projectId;
        if (!projectId) return;

        const slides = Array.from(preview.querySelectorAll('[data-showcase-slide]'));
        const dots = Array.from(preview.querySelectorAll('[data-showcase-dot]'));

        const state = {
            preview,
            slides,
            dots,
            index: 0
        };

        slides.forEach((slide, idx) => {
            slide.dataset.showcaseSlide = String(idx);
            const isInitiallyActive = preview.classList.contains('is-active') && slide.classList.contains('is-active');
            slide.classList.toggle('is-active', isInitiallyActive);
            slide.setAttribute('aria-hidden', isInitiallyActive ? 'false' : 'true');
            slide.setAttribute('tabindex', isInitiallyActive ? '0' : '-1');
            if (isInitiallyActive) {
                state.index = idx;
            } else {
                slide.classList.remove('is-active');
            }
        });

        dots.forEach((dot, idx) => {
            dot.dataset.showcaseDot = String(idx);
            const isInitiallyActive = preview.classList.contains('is-active') && idx === state.index;
            dot.classList.toggle('is-active', idx === state.index);
            dot.setAttribute('aria-selected', isInitiallyActive ? 'true' : 'false');
            dot.setAttribute('tabindex', isInitiallyActive ? '0' : '-1');
            dot.addEventListener('click', () => handleDotClick(projectId, idx));
        });

        projectStates.set(projectId, state);
    });

    projectStates.forEach((state) => {
        setProjectSlide(state, state.index || 0);
    });

    if (previewControlsValue) {
        prevButton?.setAttribute('aria-controls', previewControlsValue);
        nextButton?.setAttribute('aria-controls', previewControlsValue);
        exitButton?.setAttribute('aria-controls', previewControlsValue);
    }

    let currentIndex = detailItems.findIndex(item => item.hasAttribute('open'));
    let isSyncing = false;

    function setSummaryExpandedState(detail, expanded) {
        const summary = detail.querySelector('summary');
        if (summary) {
            summary.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        }
    }

    function setProjectSlide(state, targetIndex, { focusImage = false } = {}) {
        if (!state || !state.slides.length) return;
        const safeIndex = ((targetIndex % state.slides.length) + state.slides.length) % state.slides.length;
        state.index = safeIndex;

        const isPreviewActive = state.preview.classList.contains('is-active') || state.preview.classList.contains('is-fallback');

        state.slides.forEach((slide, idx) => {
            const isActive = idx === safeIndex && isPreviewActive;
            slide.classList.toggle('is-active', isActive);
            slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            slide.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        state.dots.forEach((dot, idx) => {
            const isActive = idx === safeIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-selected', isPreviewActive && isActive ? 'true' : 'false');
            dot.setAttribute('tabindex', isPreviewActive ? (isActive ? '0' : '-1') : '-1');
        });

        if (focusImage && isPreviewActive) {
            const slide = state.slides[safeIndex];
            if (slide && typeof slide.focus === 'function') {
                slide.focus();
            }
        }
    }

    function updateSlideControls(activeId) {
        const state = activeId ? projectStates.get(activeId) : null;
        const hasSlides = !!(state && state.slides.length > 1);
        const ariaDisabled = hasSlides ? 'false' : 'true';
        if (prevButton) {
            prevButton.toggleAttribute('disabled', !hasSlides);
            prevButton.setAttribute('aria-disabled', ariaDisabled);
        }
        if (nextButton) {
            nextButton.toggleAttribute('disabled', !hasSlides);
            nextButton.setAttribute('aria-disabled', ariaDisabled);
        }
    }

    function syncPreviews(activeId) {
        let hasActive = false;
        previewItems.forEach(preview => {
            const id = preview.dataset.projectId;
            const state = id ? projectStates.get(id) : null;
            const isActive = typeof activeId === 'string' && id === activeId;
            preview.classList.toggle('is-active', isActive);
            preview.classList.remove('is-fallback');
            preview.setAttribute('tabindex', isActive ? '0' : '-1');
            preview.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            if (state) {
                setProjectSlide(state, state.index || 0);
            }
            if (isActive) {
                hasActive = true;
            }
        });

        if (!hasActive && fallbackPreview) {
            fallbackPreview.classList.add('is-fallback');
            fallbackPreview.setAttribute('tabindex', '0');
            fallbackPreview.setAttribute('aria-hidden', 'false');
            const fallbackId = fallbackPreview.dataset.projectId;
            const fallbackState = fallbackId ? projectStates.get(fallbackId) : null;
            if (fallbackState) {
                setProjectSlide(fallbackState, fallbackState.index || 0);
            }
        }

        updateSlideControls(hasActive ? activeId : '');
    }

    function updateState(hasActive) {
        showcase.dataset.state = hasActive ? 'active' : 'idle';
        if (exitButton) {
            exitButton.toggleAttribute('disabled', !hasActive);
            exitButton.setAttribute('aria-disabled', hasActive ? 'false' : 'true');
        }
    }

    detailItems.forEach(detail => {
        setSummaryExpandedState(detail, detail.hasAttribute('open'));
    });

    function activate(index) {
        if (isSyncing || !detailItems.length) return;
        const safeIndex = ((index % detailItems.length) + detailItems.length) % detailItems.length;
        const activeId = detailItems[safeIndex].dataset.projectId;
        const state = activeId ? projectStates.get(activeId) : null;

        isSyncing = true;

        detailItems.forEach((item, idx) => {
            const isTarget = idx === safeIndex;
            item.toggleAttribute('open', isTarget);
            item.classList.toggle('is-active', isTarget);
            setSummaryExpandedState(item, isTarget);
        });

        if (state) {
            state.index = 0;
        }

        syncPreviews(activeId);
        updateState(true);
        currentIndex = safeIndex;

        requestAnimationFrame(() => {
            isSyncing = false;
        });
    }

    function clearActive() {
        if (isSyncing) return;
        isSyncing = true;

        detailItems.forEach(item => {
            item.removeAttribute('open');
            item.classList.remove('is-active');
            setSummaryExpandedState(item, false);
        });

        currentIndex = -1;
        syncPreviews(null);
        updateState(false);

        requestAnimationFrame(() => {
            isSyncing = false;
        });
    }

    function handleDotClick(projectId, targetIndex) {
        const state = projectStates.get(projectId);
        if (!state) return;

        const detailIndex = detailIndexById.get(projectId);
        if (typeof detailIndex === 'number' && currentIndex !== detailIndex) {
            activate(detailIndex);
            requestAnimationFrame(() => {
                const activeState = projectStates.get(projectId);
                if (activeState) {
                    setProjectSlide(activeState, targetIndex, { focusImage: true });
                }
            });
            return;
        }

        setProjectSlide(state, targetIndex, { focusImage: true });
    }

    if (currentIndex >= 0) {
        activate(currentIndex);
    } else {
        syncPreviews(null);
        updateState(false);
    }

    detailItems.forEach((item, index) => {
        const summary = item.querySelector('summary');
        if (summary) {
            summary.addEventListener('click', (event) => {
                event.preventDefault();
                if (isSyncing) return;
                if (currentIndex === index) {
                    clearActive();
                    return;
                }
                activate(index);
            });

            summary.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    if (isSyncing) return;
                    if (currentIndex === index) {
                        clearActive();
                        return;
                    }
                    activate(index);
                }
            });

            if (!summary.hasAttribute('aria-controls')) {
                const preview = previewById.get(item.dataset.projectId);
                if (preview?.id) {
                    summary.setAttribute('aria-controls', preview.id);
                }
            }
        }

        item.addEventListener('toggle', () => {
            if (isSyncing) return;
            if (item.open) {
                activate(index);
            } else if (currentIndex === index) {
                clearActive();
            }
        });
    });

    function showRelativeSlide(offset) {
        if (!detailItems.length) return;
        if (currentIndex === -1) {
            const targetIndex = offset >= 0 ? 0 : detailItems.length - 1;
            activate(targetIndex);
            return;
        }

        const activeDetail = detailItems[currentIndex];
        const activeId = activeDetail?.dataset.projectId;
        const state = activeId ? projectStates.get(activeId) : null;
        if (!state || !state.slides.length) return;

        const nextIndex = ((state.index + offset) % state.slides.length + state.slides.length) % state.slides.length;
        setProjectSlide(state, nextIndex, { focusImage: true });
    }

    prevButton?.addEventListener('click', () => showRelativeSlide(-1));
    nextButton?.addEventListener('click', () => showRelativeSlide(1));
    exitButton?.addEventListener('click', () => clearActive());

    showcase.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const visual = event.target instanceof Element ? event.target.closest('[data-project-gallery]') : null;
        if (!visual) return;
        event.preventDefault();
        showRelativeSlide(event.key === 'ArrowRight' ? 1 : -1);
    });
    });
})();

(function initBackToTop() {
    const button = document.querySelector('[data-back-to-top]');
    if (!button) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function toggleVisibility() {
        const show = window.scrollY > 400;
        button.classList.toggle('is-visible', show);
    }

    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    button.addEventListener('click', () => {
        const behavior = prefersReducedMotion.matches ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior });
    });
}());
