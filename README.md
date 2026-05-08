<<<<<<< HEAD

=======
# nik.io — Saviynt / IGA portfolio

A portfolio site built around what I actually do: identity governance on **Saviynt EIC** (ARS, IGA, AAG, CPAM, certifications, custom connectors).

## Stack

- **Vite + React + TypeScript**
- **three.js / @react-three/fiber / drei / postprocessing** — hero sigil + scrollytelling lifecycle scene
- **lenis** — smooth scroll
- **@chenglou/pretext** — shape-aware text layout for the manifesto block (no DOM reads)
- **tailwindcss** — utility styling

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to ./dist
npm run preview  # serve the dist build locally
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages. In the repo's *Settings → Pages*, set **Source = GitHub Actions** once.

## Layout

- `src/components/Hero.tsx` — full-bleed 3D hero (torus-knot sigil, particle halo, postFX)
- `src/components/Manifesto.tsx` — pretext-laid-out prose
- `src/components/Lifecycle.tsx` — sticky scrollytelling JML/ARS/CERT scene
- `src/components/Modules.tsx` — Saviynt EIC module cards (3D tilt)
- `src/components/Projects.tsx` — case studies
- `src/components/Timeline.tsx` — career line
- `src/components/Contact.tsx` — terminal-style contact
- `src/data/content.ts` — single source of truth for prose, projects, modules

The legacy single-file experiments live under `_legacy/` for reference.
>>>>>>> 1bddb56 (fix text overlap issues and migrate to React build)
