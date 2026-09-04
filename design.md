# Optics — Design & Architecture

Reference documentation for the portfolio of **Nikhil Sharma** (Senior Associate,
Cyber Identity). Describes the site *as built*: the design language, the four-layer
glass construction, the liquid substrate, the motion and sound layers, and the
performance / accessibility model.

---

## 1. The idea

The page is a **stack of laminated glass credentials suspended over a lit liquid
substrate**. You descend through it layer by layer.

That is not decoration for its own sake — it is the subject matter. Identity
governance is about controlled transparency: who can see through to what, and on
whose authority. So the site is literally made of glass, every pane is edge-lit by
one shared light, and the chrome around it (a clearance rail, a credential badge, a
shell, a decision engine) is the vocabulary of an access system.

Three rules keep it from becoming generic "glassmorphism":

1. **Colour comes out of the physics, not out of a brand palette.** The base is
   near-monochrome obsidian. Every hue on the page — cyan, magenta, gold — is a
   *dispersion fringe* at the edge of a pane, produced by a light source with a
   position. Amber is reserved for one meaning: *live / granted*.
2. **One light, honoured everywhere.** A single lamp drifts toward the pointer.
   Every pane computes its own angle to it, so two panes on opposite sides of the
   viewport lean their highlights in opposite directions. This is the single
   biggest reason the glass reads as material rather than as blur.
3. **Glass needs something to bend.** A survey lattice and two raking light bars
   sit behind everything, so blur has structure to smear and edges have something
   to interrupt. Glass over an empty void is just a grey rectangle.

> Design history: this replaced a "Refined Cyber" version (charcoal + a single
> signal-amber accent, hard-edged panels, an explicit *no glassmorphism* rule) and,
> before that, an "Acid Brutalist" one. The engine is largely the same; the art
> direction is a deliberate reversal, and the type went from grotesque display to
> editorial serif.

---

## 2. Design language

### Colour tokens (`styles.css` `:root`)

| Token | Value | Role |
|-------|-------|------|
| `--void` | `#04060A` | page substrate — near-black with a cold undertone |
| `--text` | `#EDF2F9` | primary type |
| `--text-2` | `#94A2B4` | body / secondary |
| `--text-3` | `#56616F` | mono labels |
| `--text-4` | `#4A5665` | quietest chrome |
| `--spec-c` | `#7FE7FF` | **cyan** dispersion (the key light's colour) |
| `--spec-m` | `#FF79C0` | **magenta** dispersion |
| `--spec-y` | `#FFD08A` | **gold** dispersion |
| `--live` | `#FFB44D` | amber — live, granted, active. Nothing else. |
| `--deny` | `#FF6E85` | rose — refused, conflict, error. Nothing else. |

Glass body tints and edge hairlines are written inline in the `.glass` stack
rather than tokenised — each variant tunes its own alphas, and a shared token
would only be indirection.

Live values written by JS: `--lx` / `--ly` (the lamp, viewport px), `--shear`
(scroll-velocity deflection). Per-pane: `--rim` (angle to the lamp),
`--mx` / `--my` / `--sheen` (the pointer's specular smear).

Layout: `--maxw: 1320px`, `--gutter: clamp(20px, 5vw, 84px)`, radii
`--r-lg/md/sm/pill`, easings `--ease`, `--ease-glass`, `--spring`.

### Type

The tension between an **editorial serif** and **machine mono** is the voice: an
institution's letterhead crossed with a terminal.

| Family | Role |
|--------|------|
| **Instrument Serif** | display — hero, section titles, card headings, stat numerals, the revealed email |
| **Inter Tight** | body copy |
| **JetBrains Mono** | all chrome — nav, labels, eyebrows, the badge record, shell, engine log, rail, footer |

| Token | Value |
|-------|-------|
| `--fs-display` | `clamp(52px, 8.6vw, 128px)` |
| `--fs-title` | `clamp(38px, 5.6vw, 76px)` |
| `--fs-lede` | `clamp(19px, 1.9vw, 24px)` |
| `--fs-body` | `clamp(15.5px, 1.02vw, 17px)` |
| `--fs-small` | `14.5px` |
| `--fs-label` | `11px` |

Display type is **etched**: a light lip on top, shadow beneath. Exactly one word
per heading is set in italic and filled with the prism gradient
(cyan → white → magenta → gold) via `background-clip: text`.

### Register

The copy is deliberately plain: sections are named for what they contain
(*Expertise*, *Experience*, *Credentials*), claims are specific and verifiable,
and there are no jokes, slogans or easter eggs. The terminal returns real
content for every command; the simulator's log is the vocabulary a real IGA
platform uses. The visual language carries the personality so the writing does
not have to.

---

## 3. The glass construction

`.glass` is four optical layers, and every pane on the site is built from it:

| Layer | Implementation | What it does |
|-------|----------------|--------------|
| **body** | `backdrop-filter: blur(calc(var(--blur) * var(--blur-k))) saturate(1.7) brightness(1.03)` over a layered tint, the first layer being `linear-gradient(calc(var(--rim) + 180deg), …)` | the pane, brightened on the side facing the lamp |
| **thickness** | a stack of `inset` box-shadows: a top lip, a bottom bounce, a 1px bevel ring, an inner top bloom | reads as a bevelled edge with depth |
| **rim** (`::before`) | a `conic-gradient(from calc(var(--rim) - 62deg), …)` masked to a 1px ring with `mask-composite: exclude` | the **dispersion arc** — cyan → white → magenta on the lit edge, a gold ghost opposite |
| **sheen** (`::after`) | `radial-gradient` at `--mx/--my`, `mix-blend-mode: plus-lighter`, faded by `--sheen` | the specular smear under the pointer |

Variants: `--blur`, `--rim-o` (rim strength) and the tint stack are what change.
`--blur-k` is the global cost knob: backdrop blur is the most expensive thing on
the page, so the lite tier and anything under 900px run it at `.62`.

- `.glass` — default pane (nav capsule, tiles, job slabs, credentials, contact)
- `.glass--deep` — heavier, darker, brighter rim (badge, shell, engine, dialog)
- `.glass--sheet` — a thin reading surface, not a card (the about copy)
- `.refracts` — opts a pane into genuine refraction (see below)
- `.glass--onblur` — a pane sitting **inside** an already-blurred overlay. A
  nested `backdrop-filter` samples an empty backdrop and contributes nothing, so
  these drop the blur and compensate with a denser fill; the overlay does the
  defocusing. Used by the shortcuts dialog and the mobile drawer.

### Genuine refraction

`index.html` carries an **optics bench**: a hidden `<svg>` of filters
(`#op-refract`, `#op-lens`, `#op-fuse`) built from `feTurbulence` +
`feDisplacementMap`, with the lens filter additionally splitting R and B through
`feColorMatrix` + `feOffset` for a real chromatic edge.

`core/capabilities.js` **probes** whether the engine honours an SVG filter
reference inside `backdrop-filter` (set it, read it back — engines that don't
support it drop the declaration). Blink says yes; WebKit and Gecko say no. On a
pass, `html.refraction` is set and `.refracts` panes and the lens cursor start
warping what is behind them for real. Everywhere else the layered-blur
construction stands on its own — nothing is missing, only the warp.

Refraction is expensive, so it is full-tier only and applied to exactly two
things: the credential badge and the cursor.

---

## 4. Page structure

Source of truth: `index.html`.

| Section | Notes / JS hooks |
|---------|------------------|
| Optics bench | `svg.optics-bench` — `#op-refract`, `#op-lens`, `#op-fuse` |
| Boot | `#boot` — a counter, a stage line, and an **iris** of two glass leaves that part (`.boot--done`) |
| Atmosphere | `#field` (WebGL liquid), `#mesh` (Canvas2D fallback), `.lattice`, `.caustic`, `.vignette`, `.grain`, `#lens` |
| Nav | `#nav` capsule (`.scrolled`, `.hidden`), `#navPuck` (the mercury puck), `#sfxToggle`, `#navBurger` → `#mobileMenu` |
| Clearance rail | `#rail` / `#railFill` — depth gauge + clickable layer ticks (desktop) |
| Hero | `.hero__line` (char-split mask reveal, one prism-gradient `em`), `.badge` (`[data-tilt]`, `.badge__foil`, `.badge__glare`, `#istClock` in the record header) |
| Band | `#marqueeTrack` (duplicated for a seamless loop) + `.band__sweep` |
| About | `.about__copy` (`.glass--sheet`), `.prism__num[data-count][data-suffix]` counters |
| Expertise | `.bento` / `.tile` |
| Experience | `.timeline__conduit` + `#timelineFill` (scrubbed light conduit), `.job__slab` |
| Credentials | `.cred` (`[data-tilt]`, `.cred__holo` holographic laminate) |
| Terminal | `#term`, `#termOut`, `#termForm`, `#termInput`, `#termScreen` |
| Simulator | `#accessSim` — `.asim__stage`, `#asimLog`, `#asimVerdict`, `#asimGrant`/`#asimDeny`/`#asimBuild`, `#asimBuilder`, `#asimReplay` |
| Shortcuts | `#shortcuts` dialog, `#kbdClose`, footer trigger `#kbdHint` |
| Contact | `#revealEmail`, `#contactGranted`, `#emailLink`, `#copyEmail` (gated email) |
| Footer | `#footClock`, `#kbdHint` |

`404.html` shares `styles.css`, is intentionally **JS-free**, and is pure CSS optics.

---

## 5. Architecture (`src/`)

Entry: `index.html` → `<script type="module" src="/src/main.js">`.

```
core/capabilities.js   tier + refraction probe (the only place either is decided)
core/optics.js         THE LIGHT — the lamp, and the per-pane rim/sheen registry
core/lenis.js          smooth scroll, bridged to ScrollTrigger (full tier only)

webgl/liquid.js        the substrate shader (three.js, one full-screen quad)

ui/lens.js             the glass cursor + magnetic buttons
ui/tilt.js             [data-tilt] 3D + hero parallax
ui/preloader.js        the iris handshake
ui/sfx.js              synthesised interface sound (opt-in)
ui/nav.js              capsule state, scroll-spy, the mercury puck, drawer
ui/rail.js             the clearance rail
ui/terminal.js         the shell (tab-complete, history, matrix easter egg)
ui/accessSim.js        the access-decision engine
ui/contact.js          runtime-assembled email reveal
ui/decode.js           scramble-decrypt for mono labels
ui/clock.js            live IST clocks
ui/marquee.js          the laminate band loop
ui/mesh.js             Canvas2D substrate (lite tier / context loss)

scroll/reveals.js      panes settle into focus (depth-blur, not fade), via IO
scroll/counters.js     stat prisms
scroll/choreography.js hero entrance, scroll coupling, shear, laminate pass
```

### The light (`core/optics.js`)

One lamp, resting above the fold, drifting toward the pointer with lag. Panes
register through `[data-glass]`; an `IntersectionObserver` tracks which are
on-screen, rects are cached and invalidated on scroll/resize, and a single rAF
loop writes `--rim` (and `--mx/--my/--sheen` for panes near the pointer) only for
visible panes, parking itself when nothing has moved.

On the static tier it runs **once** and stops: the panes are still correctly lit,
they just stop tracking.

### The substrate (`webgl/liquid.js`)

One fragment shader: caustic light knots (four folds of the standard pool-caustic
fold, sampled per channel for dispersion) over a domain-warped flow, a slower
deeper sheet, a lamp falloff, a decaying pointer ripple, a warm counter-bounce,
vignette, scroll drain, and a dither pass to kill banding in the very dark
gradients.

- It renders **below native resolution** (capped so the buffer stays near 1400px
  wide) — it sits under 20–34px of backdrop blur, so the saving is free.
- Every additive term is capped, so mean luma stays far under the CI wash guard.
- `ripple(x, y)`, `flare()` and `setScroll()` are the page's handles on it. A
  `ns:pulse` CustomEvent (dispatched by the shell, the engine and the contact
  reveal) is what lets a decision *land* in the liquid.

### Motion inventory

| Effect | Where |
|--------|-------|
| Iris handshake, staged | `ui/preloader.js` |
| Char-split hero rise out of masks, with blur + rotateX | `scroll/choreography.js` |
| Hero sinks and defocuses as you leave it | `scroll/choreography.js` |
| Panes settle *into focus* rather than fading in | `scroll/reveals.js` |
| Scroll-velocity **shear** of the whole stack, capped and sprung | `scroll/choreography.js` → `--shear` |
| **Laminate pass** — a bar of light runs each section seam, once | `.section.layered::after` |
| Light conduit filling down the record | `#timelineFill` |
| Mercury puck under the nav | `ui/nav.js` |
| Lens: lag, magnetic pull, swell into a labelled pill, press-squeeze, drops a ripple | `ui/lens.js` |
| Magnetic buttons with an elastic return + a travelling specular | `ui/lens.js`, `.btn::after` |
| 3D tilt with depth planes and a tracking glare | `ui/tilt.js` |
| Holographic laminate on the credentials and badge | `.cred__holo`, `.badge__foil` |
| Scramble-decrypt on mono labels | `ui/decode.js` |
| Raking light bars behind the lattice | `.lattice::after` |

### Sound (`ui/sfx.js`)

"SFX" cuts both ways here. Every sound is **synthesised at runtime** — struck
partials for glass, filtered noise for air, a generated impulse response for the
room — so there are no audio files and no network cost. Voices: `tick`, `tap`,
`open`, `sweep`, `grant`, `deny`, `key`.

It is **off by default**. The `AudioContext` is not constructed until the visitor
presses the toggle (itself the required user gesture), the choice is remembered in
`localStorage`, and a remembered *on* is still re-armed behind the next gesture
rather than auto-playing. `s` toggles it from the keyboard. Nothing on the page
depends on it.

---

## 6. Performance & capability tiers

`core/capabilities.js` is the only place the tier is decided.

| Tier | When | What runs |
|------|------|-----------|
| `full` | desktop, hover + fine pointer, WebGL2, ≥4 cores/memory | liquid substrate, Lenis, lens, tilt, live light, shear, refraction (if probed) |
| `lite` | touch / low-power / ≤768px / no WebGL2 | Canvas2D substrate, native scroll, live light, no lens or tilt |
| `static` | `prefers-reduced-motion` | everything in its final state; one lighting pass, then nothing moves |

`?tier=full|lite|static` forces a tier (used for debugging and for CI's WebGL
screenshot).

Budget notes: `three` is behind a dynamic import so it never reaches the lite
tier; `gsap`, `lenis` and `three` are split into cacheable chunks; the lens, tilt
and the Canvas2D fallback are all dynamically imported; the substrate pauses on
`visibilitychange` and when the hero scrolls away; reveals release their
`will-change` on completion.

### The compositing budget

The atmosphere is the part that can quietly ruin a phone. Measured on a 412px
viewport at dpr 2, an early version of this design held **145 composited layers**
and never reached a still frame — Chrome for Android answers that by evicting and
re-rasterising layers, which is seen as **flicker**. Four rules keep it in check,
and any change to the atmosphere should be re-measured against them:

1. **No blur filter over a gradient.** `filter: blur()` on `.caustic`,
   `.lattice::after` and `.hero__bloom` each cost an oversized layer that has to
   be re-filtered whenever it moves — over radial gradients that are already
   soft, for no visible difference. Widen the colour stops instead.
2. **Oversized fixed layers are sized to their animation, not rounded up.**
   `inset: -50%` is four times the area of `inset: 0`. The drift/rake/grain
   keyframes translate by ≤3%, so the insets are ~6–12%.
3. **`mix-blend-mode` forces the whole document to composite**, so the grain
   layer is dropped entirely on touch (`html[data-tier="lite"]`, plus a
   `(hover: none)` fallback for when the script has not run). The atmosphere also
   stops animating there.
4. **No blanket `will-change`.** A declaration on `.reveal` promoted every pane
   on the page at once, most of them off-screen. `scroll/reveals.js` hints only
   the batch it is animating and releases it on completion.

Two more mobile-specific rules live in the substrate modules:

- **Half-resolution, frame-capped, visibility-paused.** `ui/mesh.js` draws its
  buffer at half resolution and caps to 30fps. It is five overlapping radial
  gradients composited with `lighter` — pure overdraw — and nothing in it has an
  edge sharp enough to notice the difference.
- **A height-only viewport change is not a resize.** Android's URL bar slides in
  and out as you scroll and fires `resize` each time; re-allocating a drawing
  buffer mid-scroll flashes. Both `ui/mesh.js` and `webgl/liquid.js` ignore
  height-only changes under 20% and resize on width changes or rotations.

How to re-measure, with Playwright driving a phone profile under CPU throttling:
`LayerTree.enable` for the layer count, and `requestAnimationFrame` deltas for
frame pacing. Idle should reach the frame cap and scrolling should hold well
under ~15 stalls over 50ms per 200 frames.

### Mobile is frosted, not refractive

`backdrop-filter` is the design's signature and, on a phone, half of every
scrolled frame. Measured on a Pixel profile under 4x CPU throttling: **66.6ms**
median frame with it against **33.4ms** without, and **99 stalls over 50ms per
200 frames against 7**. It is not one expensive pane — the cost is spread evenly,
so removing a few changes nothing measurable (blur on the nav and badge alone
still cost 66.6ms). That is what unsmooth scrolling was.

The blur exists to diffuse whatever is behind the glass. Behind these panes the
only high-frequency detail is the survey lattice; the caustic wash and the
substrate are already smooth gradients. So on touch **the lattice is dropped, and
with nothing left to diffuse the blur is dropped too** — replaced by
`--pane-tint`, a slot every pane variant carries and which is `transparent`
everywhere else. Panes stay translucent over a smooth wash, which is what the
blur was resolving to anyway, and keep their dispersion rim, thickness,
directional lighting and shadows.

The overlays keep a (reduced) blur: they defocus the page deliberately, they are
never on screen during a scroll, and each is a one-off.

Scroll handlers are on the same hot path and read no layout: `ui/rail.js` and
`ui/nav.js` measure offsets on resize, read only `scrollY`, batch into a frame,
and write classes only on change; the rail does nothing at all while it is
CSS-hidden. `core/optics.js` runs in `settle` mode on touch — writing `--rim`
invalidates a pane's style and repaints its gradient, so it relights when a pane
arrives and again once scrolling stops rather than every frame.

---

## 7. Accessibility

- Every animation is gated on `prefers-reduced-motion`; the static tier renders
  the resolved end state of the counters, the reveals and the decision engine.
- `.reveal` elements are hidden **from JS, not CSS**, so a script failure can
  never leave content invisible. They are un-hidden by an `IntersectionObserver`
  rather than a ScrollTrigger: a reveal needs no scrub, only "is this on screen
  yet", and an observer answers that from what is actually painted instead of
  from a scroll position that can go stale under programmatic or smooth scroll.
  A reveal that fails to fire leaves content invisible, so it gets the cheapest,
  least stateful mechanism available.
- Split hero lines keep an `aria-label` of the real sentence; scrambled labels
  pin `aria-label` to the final string before the first frame.
- The lens is an optical layer, not a cursor replacement: it is hover + fine
  pointer only, and everything works with the native cursor if it never loads.
- Full keyboard model: `g`+letter navigation, `/` for the shell, `?` for the
  shortcuts dialog, `s` for sound, `Esc` to dismiss. Keys are never hijacked
  while a form field or the shell has focus. The dialog traps and restores focus.
- Visible `:focus-visible` rings in the key light's colour; a skip link.
- Decorative layers are all `aria-hidden`.

---

## 8. Two traps worth remembering

**The CSS minifier eats the standard property.** Writing
`backdrop-filter` *and* `-webkit-backdrop-filter` by hand makes the build
collapse them to the prefixed form alone — which modern Blink does not accept,
silently disabling every pane's blur in production while dev looks fine. So:
**write only the standard property** and let `build.cssTarget` in
`vite.config.ts` generate the prefixes. The same applies to `mask`,
`mask-composite` and `background-clip`.

This bites in both directions and it is easy to walk into twice: a hand-prefixed
`backdrop-filter: none` was collapsed the same way, so a rule meant to *turn the
blur off* on mobile silently did nothing. Verify after any change:

```bash
npm run build && grep -o "[-a-z]*backdrop-filter:" dist/assets/*.css | sort | uniq -c
# both forms must appear, in equal numbers
```

The counts matching is necessary but not sufficient — check the *computed* value
on a real element too, since a dropped declaration in one rule can hide behind
correct counts elsewhere.

**A transform on `<main>` blinds the overlays.** A persistent
`transform` / `will-change: transform` promotes `<main>` to its own render
surface, and a fixed overlay's `backdrop-filter` cannot sample through one — the
dialog and drawer stop defocusing the page. The scroll shear therefore applies
the transform only while it is actually shearing (`html.shearing`), and hands
`<main>` back the moment it settles.

---

## 9. Checks

`npm run build` must be clean. `.github/workflows/visual-check.yml`
(manual, `workflow_dispatch`) drives the built site through Playwright at four
viewports plus a reduced-motion pass, and fails on:

- any console or page error,
- a missing hero title or about section,
- **mean luma > 120** on the hero — the guard against a substrate or glass change
  washing the page out. The design is near-black by intent; it currently sits
  around 30.

Screenshots upload as a CI artifact.
