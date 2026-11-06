Guidance for AI coding agents working in this repository

- Purpose: This is a small static portfolio site (HTML/CSS/JS) created with Pinegrow and hand-edited assets. Keep changes minimal, preserve visual layout, and prefer non-breaking, incremental edits.

- Project layout and important files:
  - `index.html` — single-page portfolio; primary DOM anchors used by scripts include the VFX elements (classes vfx to vfx6), the hero background video (id myVideo), the image gallery links (images > a), slider containers and controls (slider / prev / next) and the particles container (particles-js).
  - `js/main.js` — main interactive logic. Uses ESM import from `https://esm.sh/@vfx-js/core` and manipulates VFX instances. Avoid changing the VFX wiring unless fixing bugs. The file contains IntersectionObserver and simple slider logic.
  - `js/particlesGL.min.js` — third-party particle background; leave as-is unless updating the library.
  - `css/style.css` and `css/inter.css` — styling and variable fonts. The project uses modern CSS features (dvw, dvh, animation-timeline, oklch, variable fonts). Keep responsive rules and prefers-reduced-motion blocks intact.
  - `pinegrow.json` and `_pgbackup/` — Pinegrow project metadata/backups. Pinegrow may have generated structure; avoid hand-editing these unless working inside Pinegrow.

- Quick engineering contract for agent edits
  - Inputs: small, well-scoped changes (fix an accessibility attribute, correct image srcset, tidy a JS event listener). Output: a single commit with minimal edits and a short changelog line. Error modes: broken layout, JS runtime errors, missing assets.

- Project-specific conventions and patterns
  - Minimal tooling: this is a static site — there is no package.json, build step or tests. Edits should be hand-editable HTML/CSS/JS. If adding dependencies, prefer CDN links (existing pattern uses CDN for `bigger-picture` and `@vfx-js/core`).
  - DOM hooks: Many scripts select elements by class names (e.g. `.vfx`, `.images > a`, `.slider`, `.prev`, `.next`). Refactors must preserve these selectors or update both HTML and JS together.
  - Accessibility: interactive controls are styled inputs/anchors; prefer progressive enhancement (keep functional anchors/forms intact). When adding ARIA or keyboard support, add and test locally.
  - Performance & motion: site intentionally uses video background and many CSS/JS animations. Respect `prefers-reduced-motion` rules already present — mirror this behavior when adding new animations.

- Debugging & local validation
  - To preview, open `index.html` in a browser (no build). Use a local static server if CORS blocks CDN ESM imports (e.g., `python -m http.server 8000`).
  - When editing `js/main.js` (ES module import from CDN), test in a local server; file:// may block module imports.

- Safe change examples (do these)
  - Fix broken image paths in `index.html` and update corresponding `srcset` entries.
  - Add ARIA labels to the hamburger menu (`.menu-btn`, `.menu-icon`) and ensure keyboard operability.
  - Replace a deprecated CDN with a newer release — update the script tag and quick smoke test in browser.

- Risky changes to avoid (don't do these without confirmation)
  - Replacing the VFX library or wholesale rewrites of `js/main.js` — visual behavior is tightly coupled to class names and DOM structure.
  - Removing `pinegrow.json` or editing `_pgbackup/` entries — these may be used by Pinegrow or for rollback.
  - Changing CSS custom properties or removing `prefers-reduced-motion` rules.

- Examples drawn from repo
  - When adjusting VFX behavior, update `js/main.js` lines that call `vfx.add(..., { shader: "warpTransition" })` — ensure the element exists in `index.html` (e.g., `.vfx`, `.vfx2`).
  - The slider uses `.slider`, `.prev`, `.next` and a global `slideIndex` variable. Small bug fixes (bounds checking, missing `.prev` when DOM changes) are welcome.

- Commit/message guidance
  - Use short, descriptive commit messages: `fix: alt text for capoeira poster`, `chore: update CDN of bigger-picture to 1.1.12`, `feat: add keyboard support to slider`.

If anything here is unclear or you'd like conventions tightened (testing commands, preferred CDNs, or commit rules), tell me which section to expand.
