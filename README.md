# nikhil.sharma — portfolio

Personal portfolio of **Nikhil Sharma**, Senior Associate, Cyber Identity
(Saviynt Certified Advanced IGA Professional).

A single-page site built as **Optics**: a stack of laminated glass credentials
suspended over a lit liquid substrate. Colour is not painted on — it is
*refracted* out of a near-monochrome obsidian palette at the edges of every
pane, by one light source the whole page shares. Editorial serif etched into
the glass, machine mono for the chrome around it.

The interactive centrepieces are a terminal that answers real questions about
the profile and an access-decision simulator that runs a request through
IDENTIFY → AUTHENTICATE → ENTITLEMENTS → SoD → CERTIFY → DECISION.

The copy is deliberately plain — sections named for what they contain, specific
claims, no slogans or easter eggs. The visual language carries the personality.

## Stack

- **Vite** — build & dev server
- Vanilla HTML / CSS / ES modules — no framework
- `three` (liquid substrate), `gsap` (ScrollTrigger + SplitText), `lenis` (smooth scroll)
- Google Fonts: Instrument Serif, Inter Tight, JetBrains Mono
- WebAudio for the optional interface sound — synthesised, no audio files

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to ./dist
npm run preview  # serve the dist build locally
npm run og       # regenerate the share card, PWA icons and favicon
```

Append `?tier=full`, `?tier=lite` or `?tier=static` to force a capability tier
while developing.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages (Settings → Pages → Source = GitHub Actions).

`.github/workflows/visual-check.yml` is a manual smoke test: it drives the
built site through Playwright across four viewports plus a reduced-motion
pass, fails on console errors or a washed-out hero, and uploads screenshots.

## Layout

- `index.html` — all markup, including the SVG filter bench the refraction uses
- `styles.css` — the design system: tokens, the four-layer glass construction, every component
- `src/core/` — capability tiering and the moving light that lights every pane
- `src/webgl/` — the liquid substrate shader
- `src/ui/` — lens cursor, tilt, terminal, access simulator, preloader, sound, nav, rail
- `src/scroll/` — reveals, counters, scroll choreography
- `public/` — share card, PWA icons, favicon, manifest, robots, sitemap

Full architecture and design rationale: [`design.md`](design.md).
