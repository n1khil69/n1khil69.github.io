# Design & Architecture — n1khil69.github.io

Reference documentation for the portfolio of **Nikhil Sharma** (Senior Associate,
Cyber Identity). Describes the site *as built* — the design system, the
interactive 3D hero, the motion layer, and the performance/accessibility model.

---

## 1. Overview

A single-page portfolio with a bold, experimental **"Acid Brutalist"** aesthetic
(near-black canvas, bone-white type, one electric-lime accent) anchored by an
interactive **three.js identity node-lattice** — a glowing graph of nodes and
connections that echoes the site's narrative: *"I build the systems that decide
who gets access."*

- **No framework.** Hand-written HTML/CSS + vanilla ES modules.
- **Build:** [Vite](https://vitejs.dev). **Deploy:** GitHub Actions → GitHub Pages.
- **Dependencies:** `three` (WebGL), `gsap` (ScrollTrigger + SplitText), `lenis`
  (smooth scroll). That's it.

---

## 2. Design language

### Color tokens (`styles.css` `:root`)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0a0a0a` | near-black page canvas |
| `--bg-2` | `#0e0e0e` | subtle alt background (marquee, contact) |
| `--surface` | `#141414` | panels / hover states |
| `--surface-2` | `#181818` | bars (id-card, terminal) |
| `--line` | `rgba(244,241,234,.12)` | hairline borders / 1px grid |
| `--line-soft` | `rgba(244,241,234,.06)` | faint dividers |
| `--text` | `#f4f1ea` | bone-white body/display text |
| `--muted` | `#8a8a82` | secondary text |
| `--faint` | `#5a5a54` | tertiary / footer |
| `--acc` | `#ccff00` | **electric lime** — the single accent |
| `--acc-dim` | `#9fcc00` | pressed / secondary lime |
| `--acc-glow` | `rgba(204,255,0,.35)` | glow / shadow tint |

Layout tokens: `--maxw: 1320px`, `--gutter: clamp(20px, 5vw, 84px)`,
`--ease: cubic-bezier(0.22, 1, 0.36, 1)`.

### Typography (Google Fonts)

- **Space Grotesk** — display: oversized, uppercase, tight tracking. Hero/section titles.
- **Inter** — body copy.
- **JetBrains Mono** — micro-labels, eyebrows (`[ 01 / what i do ]`), the terminal, the id-card.

All sizing is fluid via `clamp()`. The hero headline caps at `110px`
(`clamp(34px, 8vw, 110px)`) and each scripted line is `white-space: nowrap` so it
never breaks mid-word.

### Motifs

Exposed 1px vertical grid (`.grid-lines`), hard-edged panels (no glassmorphism),
film **grain** + **scanline** overlays, **glitch / RGB-split** on hover for elements
with `data-text`, a difference-blend **custom cursor**, a kinetic skills **marquee**,
and lime-on-near-black contrast throughout. `::selection` is lime-on-black.

---

## 3. Page structure

Source of truth: `index.html`. Order and the DOM hooks each part depends on:

| Section | Notes / JS hooks |
|---------|------------------|
| Preloader | `#boot`, `#bootCount`, `#bootBar`, `#bootStatus` — lime 0→100 counter, slides away |
| Ambient layers | `#lattice` (WebGL), `#mesh` (Canvas2D fallback), `.grid-lines`, `.grain`, `.scanline`, `#scrollProgress`, `#cursor` |
| Nav | `#nav` (scrolled state), `.nav__links a` (scroll-spy), `#navBurger` + `#mobileMenu` |
| Hero | `.hero__line` (mask-reveal targets), `.idcard` with `#istClock` |
| Marquee | `#marqueeTrack` (duplicated for seamless loop) |
| About | `.stat__num[data-count][data-suffix]` counters |
| Expertise | `.bento` / `.card` (cursor-tracked `--mx/--my` glow) |
| Experience | `.timeline`, `#timelineFill` (scrubbed rail), `.job`, `.job__node--live` |
| Credentials | `.creds` / `.cred` |
| Terminal | `#term`, `#termOut`, `#termForm`, `#termInput`, `#termScreen` |
| Contact | `#revealEmail`, `#contactGranted`, `#emailLink`, `#copyEmail` (gated email) |
| Footer | `#footClock` |

`404.html` shares `styles.css`, is intentionally **JS-free**, and is styled in the
same palette.

---

## 4. Architecture (`src/`)

Entry point is `index.html` → `<script type="module" src="/src/main.js">`.

```
src/
  main.js                  bootstrap: compute tier, wire modules, init order
  core/
    capabilities.js        single `tier` = 'full' | 'lite' | 'static' (+ flags)
    lenis.js               Lenis init + ScrollTrigger bridge (gsap.ticker driven)
  webgl/
    lattice.js             the three.js identity node-lattice (inline GLSL)
  scroll/
    choreography.js        hero intro, WebGL scroll-coupling, timeline scrub, parallax
    reveals.js             batched .reveal animations (JS-set hidden start state)
    counters.js            stat counters via ScrollTrigger
  ui/
    preloader.js  cursor.js  nav.js  marquee.js  terminal.js
    contact.js    clock.js   idcard.js  mesh.js (Canvas2D fallback)
scripts/
  visual-check.mjs         headless Playwright smoke test (manual)
```

**Init order (`main.js`):** always-on UI (nav, clock, terminal, contact, marquee,
scroll-progress) → cursor/idcard if `hover` and not reduced → reveals + counters →
if `static`, remove preloader and stop → else run preloader, then `startVisual()`
(Lenis on full, choreography, dynamic-import the lattice on full / Canvas2D mesh
otherwise, hero intro, `ScrollTrigger.refresh()`, visibility pause). Consolidated on
a single `gsap.ticker` RAF rather than many loops.

---

## 5. Capability tiers (`src/core/capabilities.js`)

A single exported `tier` governs how much motion/WebGL a device gets:

- **`static`** — `prefers-reduced-motion: reduce`. All content rendered in final
  state; no WebGL, no Lenis, no animation.
- **`lite`** — touch / `(pointer: coarse)` / no hover / `deviceMemory ≤ 4` /
  `hardwareConcurrency ≤ 4` / no WebGL2 / viewport ≤ 768px. Native scroll, no Lenis,
  **the `three` chunk is never downloaded** (dynamic import is skipped), lightweight
  Canvas2D `#mesh` ambient instead.
- **`full`** — everything else (desktop, capable GPU). WebGL lattice + Lenis +
  scrubbed scroll.

Override for debugging/CI: append `?tier=full` (or `lite`/`static`) to the URL.

---

## 6. The WebGL lattice (`src/webgl/lattice.js`)

Three layers in one scene, drawn with custom `ShaderMaterial` + additive blending,
soft circular sprites computed in-shader (no textures):

- **Ambient point field** — ~11k points (full) scaled by viewport area
  (`min(11000, w*h/200)`), dim, lime concentrating near the cursor.
- **Graph nodes** — ~360 brighter lime points.
- **Connections** — each node linked to its 2 nearest neighbours as `LineSegments`.

All motion is **GPU/uniform-driven** — no per-particle JS. A shared GLSL `displace()`
function is injected into both the point and line vertex shaders so connected nodes
and their links always move together. Uniforms:

- `uTime` — gentle breathing flow field.
- `uMouse` — smoothed cursor "well" (repulsion + local brightening).
- `uScroll` — 0→1 from a hero ScrollTrigger; disperses the lattice and dollies the camera.

**Performance:** `setPixelRatio(min(dpr, 2))` (1.5 on lite), point size
`uSize * … * (12.0 / -mv.z)` (perspective-attenuated, ~a few px), render loop paused
when the hero scrolls off-screen and on `document.hidden`. On `webglcontextlost` it
falls back to the Canvas2D `#mesh`.

> **Note — past bug.** An earlier point-size factor of `300.0 / -mv.z` produced
> ~250px sprites; 48k additive lime points then saturated the whole hero to flat lime.
> Fixed by realistic sizing (`12.0 / -mv.z`), far fewer/dimmer points, and a darker
> base colour. The visual check (§10) now includes a pixel-brightness assertion that
> fails on a recurrence.

---

## 7. Motion system

- **GSAP** (`gsap.registerPlugin(ScrollTrigger, SplitText)` — SplitText is free as of
  GSAP 3.13+):
  - Hero title **mask-reveal** — each `.hero__line` is split to chars and animated up
    from behind an `overflow: hidden` mask, after the preloader clears.
  - **Batched reveals** (`scroll/reveals.js`) — `.reveal` elements animate in via
    `ScrollTrigger.batch`. Their hidden start state is set in **JS** (`gsap.set`), not
    CSS, so a JS failure never leaves content stuck invisible and CSS transitions never
    fight GSAP's per-frame writes.
  - **Timeline rail scrub** — `#timelineFill` `scaleY` 0→1 across the experience section.
  - **Counters** (`scroll/counters.js`), **desktop hero parallax** (`gsap.matchMedia`).
- **Lenis** (`core/lenis.js`) — smooth scroll on the **full tier only** (native momentum
  on touch), bridged to ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` and
  driven from `gsap.ticker`.
- **Custom cursor + magnetic buttons** (`ui/cursor.js`) — `gsap.quickTo`, gated on
  `(hover: hover)`.

**Accessibility:** split-text elements get an `aria-label` of the full string; skip
link; semantic landmarks; full `static` path; `ScrollTrigger.refresh()` on
`document.fonts.ready`.

---

## 8. Performance & accessibility summary

- `three` is loaded with a **dynamic `import()`**, so it ships as its own chunk and is
  only fetched on the full tier (never on lite/static).
- Vite `manualChunks` splits `three` / `gsap` / `lenis` into cacheable vendor chunks.
  Gzipped: three ≈ 116 KB (lazy), gsap ≈ 49 KB, lenis ≈ 5 KB.
- DPR caps, off-screen/hidden render pausing, no Lenis on touch.
- Reduced-motion users get all content immediately with no WebGL/animation.

---

## 9. Build, tooling & deploy

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (`localhost:5173`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the built `dist/` |

`vite.config.ts`: `base: '/'`, `target: es2022`, two entries (`index.html`,
`404.html`), and the `manualChunks` vendor split.

**Deploy** (`.github/workflows/deploy.yml`): push to `main` → `npm ci` → `npm run build`
→ upload `dist/` → GitHub Pages. Keep `package-lock.json` in sync (CI uses `npm ci`).

---

## 10. Verification

`scripts/visual-check.mjs` + `.github/workflows/visual-check.yml` — a headless
**Playwright** smoke test that loads the built site across mobile/tablet/laptop/desktop
+ reduced-motion, asserts **no console/page errors**, that the hero renders, and a
**pixel-brightness guard** (mean luma via `sharp`) that fails on a washed-out hero. The
desktop pass uses `?tier=full` so the WebGL path is actually exercised (CI runners have
few cores and would otherwise fall to `lite`). Screenshots upload as an artifact.

> **Constraint:** the Playwright Chromium binary download is blocked both locally and on
> this repo's default GitHub-hosted runners, so the workflow is **`workflow_dispatch`-only
> with fail-fast timeouts** — run it manually from a network whose runners can reach the
> Playwright CDN. Day-to-day, `npm run build` is the hard gate and the live site is the
> visual check.

---

## 11. Editing guide / conventions

- **Colours/spacing** live as CSS custom properties in `styles.css` `:root` — change
  them there, not inline. The accent is a single token (`--acc`); keep it that way.
- **Add a section:** mirror the `.section` + `.section__head` (`[ NN / TITLE ]` eyebrow)
  pattern in `index.html`; add `.reveal` to elements that should animate in; add the nav
  link. New interactive behaviour goes in its own `src/ui/*.js` module, wired from
  `main.js`.
- **Keep `404.html` JS-free** (it must load instantly and never pull the WebGL/GSAP chunks).
- **Respect the tiers:** anything decorative/heavy must be gated behind `tier` and degrade
  to a readable static state.
- Run `npm run build` before committing; commit the updated `package-lock.json` when
  dependencies change.
