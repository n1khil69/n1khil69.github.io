# nikhil.sharma — portfolio

Personal portfolio of **Nikhil Sharma**, Cyber Identity Consultant (Saviynt Certified Advanced IGA Professional).

Dark, glassmorphic single-page site with an animated identity-graph particle mesh, scroll-triggered reveals, animated counters, a skills marquee, bento expertise grid, and an experience timeline.

## Stack

- **Vite** — build & dev server
- Vanilla HTML / CSS / JS — no framework, no runtime dependencies
- Google Fonts: Space Grotesk, Inter, JetBrains Mono

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to ./dist
npm run preview  # serve the dist build locally
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages (Settings → Pages → Source = GitHub Actions).

## Layout

- `index.html` — all markup (hero, about, expertise, experience, credentials, contact)
- `styles.css` — design system: dark theme, emerald/cyan accents, glass panels
- `main.js` — particle mesh canvas, scroll reveals, counters, nav, mobile menu
- `public/favicon.svg` — site icon
