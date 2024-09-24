import { VFX } from "https://esm.sh/@vfx-js/core";

const div = document.querySelector('.vfx');
const el = document.querySelector('.vfx2')
const el2 = document.querySelector('.vfx3')
const el3 = document.querySelector('.vfx4')
const el4 = document.querySelector('.vfx5')
const el5 = document.querySelector('.vfx6')
// const video = document.querySelector('#myVideo')

const vfx = new VFX();
vfx.add(div, { shader: "warpTransition", overflow: 20 });
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



// Intersection Observer for scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
});

// Observe each section
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// use vfx-js slitScanTransition on sections on scroll 


const sections = document.querySelectorAll('img');
const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
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

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('mouseenter', () => {
        vfx.add(img, { shader: "warpTransition", overflow: 0 });
    });

    img.addEventListener('mouseleave', () => {
        vfx.remove(img);
    });
});


