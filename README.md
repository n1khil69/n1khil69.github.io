# Nikhil Sharma — Identity, by design

Personal portfolio of Nikhil Sharma, Senior Associate, Cyber Identity at PwC
Acceleration Centers and Saviynt Certified Advanced IGA Professional.

An editorial layout inspired by [Mijobello](https://mijobello.com/) pairs sage
green and burgundy, oversized lowercase typography, thin grid lines, and original
Miffy illustrations. Career tabs, live world clocks, and a persistent light/dark
theme complement the Miffy illustrations. The layout uses native scrolling
and respects reduced-motion preferences.

## Develop

Use Node.js 24, matching the deployment workflow.

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production output in dist/
npm run preview  # preview the production build
npm run og       # regenerate the monochrome social card and icons
node scripts/make-editorial-art.mjs # regenerate the local SVG illustrations
```

The browser entry uses vanilla HTML, CSS, and JavaScript with no third-party
runtime libraries. Vite handles development and production builds. Google Fonts
provides Space Grotesk, Instrument Serif, and JetBrains Mono with system fallbacks.

## Interactions

- Browse career entries with tabs, previous/next buttons, or arrow keys.
- Expand expertise with native disclosure controls.
- Switch between light and dark themes; the preference is saved when storage is available.
- Open the navigation dialog; Escape dismisses it.
- Send a message through the contact form.

The Miffy playground, hunt, roaming character, and related controls have been removed.
Static illustrations remain. Old playground bookmarks redirect to the introduction.
Dark experience artwork uses coordinated forest, moss, and slate green surfaces.

## Contact form setup

The contact form posts to FormSubmit for `nikhil.sharma275@gmail.com`.
JavaScript uses its AJAX endpoint with a 20-second timeout; without JavaScript
the form uses a native HTTPS POST. The site includes a honeypot and browser
validation. A celebration appears only after an explicit successful response.
Failure, activation, and uncertain delivery states preserve the visitor's note,
enable retry without displaying a direct email address. No API key or server secret is included.

**One-time activation is required.** Submit the form from the deployed site,
then open FormSubmit's confirmation email in the recipient inbox and activate
the form. Verify delivery with a further submission after activation. Until this
is done, the site cannot guarantee that messages reach the inbox. Live email
delivery has not been verified as part of these code changes.

The provider's successful response confirms acceptance, not independent inbox
delivery. Automated contact tests stub the transport and never send real email.

## Checks and deployment

`npm run test:miffy` runs state regression tests for blocked/corrupt storage,
outfit persistence, independent day/night state, and unique SVG gradient IDs.
It uses Node's VM-module support and makes no network requests.
`npm run test:contact` checks delivery failures, retry, and confirmed success.

`npm run build` builds both the portfolio and the 404 page. Pushing to `main`
runs `.github/workflows/deploy.yml` and publishes `dist/` to GitHub Pages.

The manual **Visual Check** workflow builds the site, runs
`scripts/visual-check.mjs`, and uploads screenshots. It checks widths of 320,
390, 768, 1280, and 1920 pixels, horizontal overflow, runtime errors, navigation,
keyboard operation, removal of playground controls, dark artwork, contact form
validation and mocked submission, and reduced motion.
It requires access to the Playwright Chromium download service.

To run the same checks locally, install the optional test tools, start
`npm run preview` in another terminal, then run:

```bash
npm install --no-save --package-lock=false playwright@1.49.0
npx playwright install chromium
node scripts/visual-check.mjs
```

`BASE_URL` overrides the default preview URL, `http://localhost:4173/`. The script
is a runnable check, not a record that it has been executed against this revision;
use its output or a workflow run to confirm the result.

## Source map

- `index.html`: profile content, semantic sections, disclosures, dialog, Miffy scene.
- `styles.css`: sage/burgundy tokens, typography, responsive layout, motion, print.
- `src/main.js`: navigation, career tabs, themes, world clocks, and Miffy integrations.
- `src/redesign.css`: component integration with the editorial design.
- `scripts/make-editorial-art.mjs`: generates the original local SVG illustrations.
- `src/ui/miffy-shape.js`: Miffy drawn after Dick Bruna, shared by every Miffy on the site.
- `src/ui/contact-form.js`: confirmed provider success, retry, and in-form failure recovery.
- `public/`: social card, icons, manifest, robots, and sitemap.

See [design.md](design.md) for implementation and accessibility details.
