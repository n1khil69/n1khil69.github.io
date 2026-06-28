# Design & Architecture — n1khil69.github.io

Reference documentation for the portfolio of **Nikhil Sharma** (Senior Associate,
Cyber Identity). Describes the site *as built* — the design system, the ambient
WebGL field, the motion layer, and the performance/accessibility model.

---

## 1. Overview

A single-page portfolio with a restrained, premium **"Refined Cyber"** aesthetic:
deep charcoal, ice-white type, and a single **signal-amber accent used as a
spotlight** (never a wash). The security/identity narrative — *"I build the systems
that decide who gets access"* — is carried by the copy, the monospace technical
chrome, and an interactive terminal, while a **subtle multi-layer textural WebGL
field** drifts behind the type as atmosphere (not a focal "particle" effect).

- **No framework.** Hand-written HTML/CSS + vanilla ES modules.
- **Build:** [Vite](https://vitejs.dev). **Deploy:** GitHub Actions → GitHub Pages.
- **Dependencies:** `three` (WebGL), `gsap` (ScrollTrigger + SplitText), `lenis`
  (smooth scroll).
- **Share / PWA / SEO:** Open Graph + Twitter card (`public/og.png`, 1200×630), JSON-LD `Person`,
  `manifest.webmanifest`, `robots.txt` + `sitemap.xml` — the social/install/crawl polish. The card
  and PWA icons are rendered from the sigil by `scripts/make-og.mjs` (`npm run og`).

> Design history: this replaced an earlier loud "Acid Brutalist" version (lime-on-black +
> a generic three.js node-lattice) that read as harsh and amateur. The redesign keeps the
> same engine but fixes art direction: restrained accent, intentional type scale, a composed
> hero, and an atmospheric field instead of a particle backdrop.

---

## 2. Design language

### Color tokens (`styles.css` `:root`)

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0E1116` | deep charcoal page canvas (not pure black) |
| `--bg-2` | `#0B0E12` | inset wells (marquee, terminal, contact panel) |
| `--surface` | `#161B22` | panels / hover states |
| `--surface-2` | `#1C232C` | bars (id-card, terminal) |
| `--line` | `rgba(176,197,224,.10)` | cool hairline borders / 1px grid |
| `--line-soft` | `rgba(176,197,224,.05)` | faint dividers |
| `--text` | `#E6EDF5` | ice-white body/display text |
| `--muted` | `#7D8590` | secondary text + technical labels |
| `--faint` | `#4C5562` | tertiary / footer |
| `--acc` | `#FFB02E` | **signal amber** — the single accent, used sparingly |
| `--acc-rgb` | `255, 176, 46` | accent channels, for `rgba(var(--acc-rgb), x)` washes |
| `--acc-hi` | `#FFC661` | lighter amber for the primary-CTA hover |
| `--acc-dim` | `#C97E12` | deeper bronze (secondary field tone) |
| `--acc-soft` | `rgba(var(--acc-rgb),.08)` | faint accent washes (chips, hover glow) |
| `--acc-glow` | `rgba(var(--acc-rgb),.30)` | glow / shadow tint |
| `--on-acc` | `#1B1303` | dark warm text on amber fills |
| `--err` | `#FF6A7D` | reserved for genuine error semantics only |

Layout: `--maxw: 1280px`, `--gutter: clamp(22px, 5vw, 88px)`, `--ease: cubic-bezier(0.22,1,0.36,1)`.

### Type scale (intentional, not clamp-on-everything)

Body is the primary readable size; monospace is demoted to quiet 12px chrome.

| Token | Value | Use |
|-------|-------|-----|
| `--fs-display` | `clamp(44px, 7vw, 96px)` | hero + contact titles |
| `--fs-title` | `clamp(30px, 4.5vw, 58px)` | section titles |
| `--fs-lede` | `clamp(20px, 2.2vw, 26px)` | about lede |
| `--fs-body` | `clamp(16px, 1.05vw, 18px)` | **primary body copy** |
| `--fs-small` | `15px` | cards, list items, credentials |
| `--fs-label` | `12px` | mono eyebrows / labels / nav |

- **Space Grotesk** — display (sentence-case, tight tracking).
- **Inter** — body.
- **JetBrains Mono** — eyebrows, labels, nav, terminal, id-card, data.

### Motifs

Exposed 1px vertical grid (`.grid-lines`), film **grain** + faint **scanline** overlays,
a difference-blend **custom cursor**, a kinetic skills **marquee**, hard-edged panels (no
glassmorphism), and a subtle amber textural field behind everything. `::selection` is amber.

### Accent policy (the key discipline)

Amber is a **spotlight**, allowed only on: the primary CTA + hover, `:focus-visible`,
ghost-button/link/card hover, the active nav indicator, the scroll moments
(`.scroll-progress`, `.timeline__fill`), terminal "ok/granted" + contact "ACCESS GRANTED",
and 1–2 key emphases (the single hero accent word, the about-lede `em`, the id-card live
status, the `NS` sigil). It is **not** used on section eyebrows, labels, badges, separators,
bullets, or stat numbers — those are muted/faint.

---

## 3. Page structure

Source of truth: `index.html`. Order and the DOM hooks each part depends on:

| Section | Notes / JS hooks |
|---------|------------------|
| Preloader | `#boot`, `#bootCount`, `#bootBar`, `#bootStatus` — amber 0→100 counter, slides away |
| Ambient layers | `#field` (WebGL), `#mesh` (Canvas2D fallback), `.grid-lines`, `.grain`, `.scanline`, `#scrollProgress`, `#cursor` |
| Nav | `#nav` (scrolled state), `.nav__links a` (scroll-spy), `#navBurger` + `#mobileMenu` |
| Hero | `.hero__line` (mask-reveal targets, full-width 3-line statement, one amber word), `.hero__sweep` (one-time entrance light-sweep), `.hero__eyebrow-cmd` (one-time `whoami` decrypt), `.hero__scan` (cursor-reactive spotlight), `.idcard` (3D-tilt + `.idcard__glare`) with `#istClock` |
| Marquee | `#marqueeTrack` (duplicated for seamless loop) |
| About | `.stat__num[data-count][data-suffix]` counters |
| Expertise | `.bento` / `.card` (cursor-tracked `--mx/--my` glow) |
| Experience | `.timeline`, `#timelineFill` (scrubbed rail), `.job`, `.job__node--live` |
| Credentials | `.creds` / `.cred` (outline chips, amber left-border on hover) |
| Terminal | `#term`, `#termOut`, `#termForm`, `#termInput`, `#termScreen` |
| Access decision | `#access` / `#accessSim` — pipeline (`.asim__stage`), `#asimLog`, `#asimVerdict`, scenario toggle (`#asimGrant`/`#asimDeny`/`#asimBuild`), `#asimReplay`. Two grounded preset scenarios (clean joiner GRANT, mover SoD-conflict DENY) **plus a `build` mode** (`#asimBuilder`, role chips `#asimRoles`, entitlement chips `#asimEnts`): the visitor assembles a request and the engine runs it against an SoD ruleset live |
| Shortcuts | `#shortcuts` keyboard help dialog (`#kbdClose`); footer trigger `#kbdHint`. Hooks for `ui/shortcuts.js` |
| Contact | `#revealEmail`, `#contactGranted`, `#emailLink`, `#copyEmail` (gated email) |
| Footer | `#footClock`, `#kbdHint` (hover-only "press ? for shortcuts") |

`404.html` shares `styles.css`, is intentionally **JS-free**, and is styled in the same palette.

---

## 4. Architecture (`src/`)

Entry point is `index.html` → `<script type="module" src="/src/main.js">`.

```
src/
  main.js                  bootstrap: compute tier, wire modules, init order
  core/
    capabilities.js        single `tier` = 'full' | 'lite' | 'static' (+ ?tier= override)
    lenis.js               Lenis init + ScrollTrigger bridge (gsap.ticker driven)
  webgl/
    field.js               the textural fbm shader field (inline GLSL)
  scroll/
    choreography.js        hero intro, WebGL scroll-coupling, timeline scrub
    reveals.js             batched .reveal animations (JS-set hidden start state)
    counters.js            stat counters via ScrollTrigger
  ui/
    preloader.js  cursor.js  nav.js  marquee.js  terminal.js
    contact.js    clock.js   idcard.js  mesh.js (Canvas2D fallback)
    accessSim.js  the access-decision simulator (presets + "build your own" SoD mode)
    decode.js     scramble/"decrypt" text reveal (+ reusable scramble())
    heroScan.js   cursor-reactive hero "scan" spotlight + pointer parallax
    shortcuts.js  keyboard layer: g-leader nav, / focus CLI, ? help dialog
scripts/
  visual-check.mjs         headless Playwright smoke test (manual)
  make-og.mjs              renders public/og.png + PWA icons via sharp (run: npm run og)
```

**Init order (`main.js`):** always-on UI → cursor/idcard if `hover` and not reduced →
reveals + counters → if `static`, remove preloader and stop → else run preloader, then
`startVisual()` (Lenis on full, choreography, dynamic-import the field on full / Canvas2D
mesh otherwise, hero intro, `ScrollTrigger.refresh()`, visibility pause).

---

## 5. Capability tiers (`src/core/capabilities.js`)

- **`static`** — `prefers-reduced-motion`. All content in final state; no WebGL/Lenis/animation.
- **`lite`** — touch / coarse pointer / `deviceMemory ≤ 4` / `hardwareConcurrency ≤ 4` / no WebGL2 /
  ≤ 768px. Native scroll, **the `three` chunk is never downloaded**, Canvas2D `#mesh` fallback.
- **`full`** — desktop, capable GPU. WebGL field + Lenis + scrubbed scroll.

Override for debugging/CI: append `?tier=full` (or `lite`/`static`).

---

## 6. The WebGL field (`src/webgl/field.js`)

A single full-screen fragment shader — **no points, no graph, no particles**. It renders
**two domain-warped fbm layers** over the charcoal base (a primary flowing layer + a slower,
larger-scale depth layer), with faint signal-amber highlights, a deeper bronze depth tone, a
slow diagonal **scan-sweep**, and an edge vignette: atmosphere only.

- Geometry: one `PlaneGeometry(2,2)` spanning clip space (vertex shader bypasses the camera).
- Uniforms: `uTime` (slow drift), `uMouse` (smoothed, nudges the warp — not a "cursor well"),
  `uScroll` (0→1 from the hero ScrollTrigger; settles the field to flat charcoal as the hero
  leaves), `uResolution`, plus `uColorBg`/`uColorAcc`/`uColorAcc2` — read from the CSS tokens
  (`--bg`/`--acc`/`--acc-dim`) via `getComputedStyle` at init, so the palette is single-sourced.
- Amber contribution is intentionally **low** — the glow cap was lowered to `glow ≤ 0.11`
  (amber is higher-luma than the old cyan), with the depth/scan terms lower still, all
  edge-vignetted, so mean luma stays far below the visual-check's 120 threshold.

**Lifecycle / perf:** `createField(canvas, { tier, onContextLost }) → { start, stop, setScroll,
resize, dispose }` — the same contract the old module used, so `main.js`/`choreography.js` are
unchanged apart from the import. `setPixelRatio(min(dpr, 2))` (1.5 on lite); rAF paused when the
hero scrolls off-screen and on `document.hidden`; `webglcontextlost` → Canvas2D `#mesh` fallback.

> The brightness guard in `scripts/visual-check.mjs` exists because an earlier shader once
> saturated the whole hero — keep the amber subtle.

---

## 7. Motion system

- **GSAP** (`ScrollTrigger` + free `SplitText`): hero title mask-reveal (each `.hero__line`
  split to chars behind an `overflow:hidden` mask), batched `.reveal` (hidden start state set in
  **JS**, not CSS, so a JS failure never hides content), timeline-rail scrub (`#timelineFill`),
  stat counters.
- **Lenis** — smooth scroll on the **full tier only**, bridged to ScrollTrigger via `gsap.ticker`.
- **Custom cursor + gentle magnetic buttons** (`ui/cursor.js`), gated on `(hover: hover)`.
- **Decode / "decrypt"** (`ui/decode.js`): mono `[data-decode]` labels (section eyebrows + contact
  eyebrow) scramble through glyphs then resolve on scroll-in; it only rewrites `textContent` (opacity
  stays owned by `.reveal`) and pins `aria-label` to the final string. A reusable `scramble()` powers
  the one-time hero `whoami` decrypt, sequenced inside `heroIntro`.
- **Access-decision sim** (`ui/accessSim.js`): a GSAP timeline staggers a six-stage pipeline + mono
  log + verdict; **auto-runs once on scroll-in (no pin)**, replayable, with a GRANT/DENY scenario
  toggle. A third **`build` mode** lets the visitor pick a role + entitlement chips; `buildScenario()`
  assembles the steps and evaluates them against a small SoD ruleset (`SOD_RULES`) to GRANT or DENY
  live (the replay button becomes EVALUATE). Static tier renders the resolved end-state instantly.
- **Keyboard layer** (`ui/shortcuts.js`): always-on (every tier). `g`-leader "go to" navigation
  reuses the existing nav links, `/` focuses the CLI, `?` toggles an accessible help dialog
  (`#shortcuts`, focus restored on close), `Esc` dismisses. Never fires while an input/CLI is focused;
  honours reduced-motion (instant scroll, no transitions).
- **Hero scan** (`ui/heroScan.js`): a cursor-reactive amber spotlight (`.hero__scan`, default
  `opacity:0`, alpha ≤ 0.10, vignette-masked → stays under the luma guard) plus subtle pointer
  parallax on the title/id-card; gated exactly like the cursor.
- **Hero entrance assembly** (`scroll/choreography.js` `heroIntro`): on top of the SplitText
  line mask-reveal, a one-time amber **light-sweep** (`.hero__sweep`, created + removed by JS)
  crosses the title, and the id-card lands then assembles **row-by-row**. Static tier: no-op.
- **3D id-card** (`ui/idcard.js`): pointer-driven `rotateX/Y` (±8°) with real depth — the
  bar/body sit on `translateZ` planes (`transform-style: preserve-3d`) — plus a pointer-tracked
  `.idcard__glare` sheen (created in JS, `mix-blend:screen`, default `opacity:0` so it never
  affects the luma screenshot). Gated on `canHover && !prefersReduced`; touch/static stay flat.
- The accent word glows subtly on hover (no glitch/RGB-split — that was the old loud signature).

**Accessibility:** split-text elements get an `aria-label` of the full string; skip link;
semantic landmarks; full `static` path; `ScrollTrigger.refresh()` on `document.fonts.ready`.

---

## 8. Performance & accessibility summary

- `three` loads via a **dynamic `import()`**, shipped as its own chunk, only on the full tier.
- Vite `manualChunks` splits `three` / `gsap` / `lenis` into cacheable vendor chunks.
- DPR caps, off-screen/hidden render pausing, no Lenis on touch, larger body type for readability.
- Reduced-motion users get all content immediately with no WebGL/animation.

---

## 9. Build, tooling & deploy

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (`localhost:5173`) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the built `dist/` |

`vite.config.ts`: `base: '/'`, `target: es2022`, two entries (`index.html`, `404.html`), and the
`manualChunks` vendor split. **Deploy** (`.github/workflows/deploy.yml`): push to `main` → `npm ci`
→ `npm run build` → GitHub Pages. Keep `package-lock.json` in sync (CI uses `npm ci`).

---

## 10. Verification

`scripts/visual-check.mjs` + `.github/workflows/visual-check.yml` — a headless **Playwright**
smoke test across mobile/tablet/laptop/desktop + reduced-motion: asserts no console/page errors,
that the hero renders, and a **pixel-brightness guard** (mean luma < 120 via `sharp`) that fails on
a washed-out hero. The desktop pass uses `?tier=full` to exercise the WebGL path.

> **Constraint:** the Playwright Chromium download is blocked both locally and on this repo's
> default runners, so the workflow is **`workflow_dispatch`-only with fail-fast timeouts** — run it
> manually from a network whose runners can reach the Playwright CDN. Day-to-day, `npm run build` is
> the hard gate and the live site is the visual check.

---

## 11. Editing guide / conventions

- **Colours/spacing/type** live as CSS custom properties in `styles.css` `:root`. The accent is a
  single token (`--acc`) — keep it rare per the accent policy in §2.
- **Add a section:** mirror the `.section` + `.section__head` (`[ NN / TITLE ]` muted eyebrow)
  pattern; add `.reveal` to elements that animate in; add the nav link. New behaviour goes in its
  own `src/ui/*.js` module wired from `main.js`.
- **Keep `404.html` JS-free** (it must load instantly and never pull the WebGL/GSAP chunks).
- **Respect the tiers:** anything decorative/heavy must be gated behind `tier` and degrade to a
  readable static state.
- Run `npm run build` before committing; commit the updated `package-lock.json` when deps change.
