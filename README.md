# Nikhil Sharma — Identity, by design

Personal portfolio of Nikhil Sharma, Senior Associate, Cyber Identity at PwC
Acceleration Centers and Saviynt Certified Advanced IGA Professional.

A monochrome editorial layout pairs oversized typography, alternating dark and
paper sections, and a locally generated Canvas2D identity sculpture. A playful
Miffy scene adds a personal moment of monochrome fun. The layout adapts
from narrow phones to large desktop screens, uses native scrolling, and respects
reduced-motion preferences.

## Develop

Use Node.js 24, matching the deployment workflow.

```bash
npm ci
npm run dev      # http://localhost:5173
npm run build    # production output in dist/
npm run preview  # preview the production build
npm run og       # regenerate the monochrome social card and icons
```

The browser entry uses vanilla HTML, CSS, and JavaScript with no third-party
runtime libraries. Vite handles development and production builds. Google Fonts
provides Inter Tight, Instrument Serif, and JetBrains Mono with system fallbacks.

## Interactions

- Expand expertise and career details using their native disclosure controls.
- Choose a Miffy activity: wave, dance, nap, paper plane, ball, peekaboo, or balloon.
  Surprise mode shuffles the activities without repeating one until the set is
  complete.
- Pause the scene's motion at any time. Reduced-motion preferences keep the
  activities available as static poses.
- Open the mobile navigation as a modal dialog; Escape dismisses it.
- Send a message through the contact form, or use the direct email link.

## Contact form setup

The contact form makes a native HTTPS POST to FormSubmit for
`nikhil.sharma275@gmail.com`. FormSubmit handles the email delivery and CAPTCHA;
the site includes a honeypot field and browser validation. No API key or server
secret is included in the site. The form works without JavaScript; JavaScript
adds a return URL and a submission handoff state.

**One-time activation is required.** Submit the form from the deployed site,
then open FormSubmit's confirmation email in the recipient inbox and activate
the form. Verify delivery with a further submission after activation. Until this
is done, the site cannot guarantee that messages reach the inbox. Live email
delivery has not been verified as part of these code changes.

After the provider returns to `?message=submitted#contact`, the page shows a
receipt message. This is a provider-return acknowledgement, not an independent
verification of inbox delivery. The automated checks intercept the provider
endpoint and never send real email.

## Checks and deployment

`npm run build` builds both the portfolio and the 404 page. Pushing to `main`
runs `.github/workflows/deploy.yml` and publishes `dist/` to GitHub Pages.

The manual **Visual Check** workflow builds the site, runs
`scripts/visual-check.mjs`, and uploads screenshots. It checks widths of 320,
390, 768, 1280, and 1920 pixels, horizontal overflow, runtime errors, navigation,
keyboard operation, Miffy's activity picker and motion controls, contact form
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
- `styles.css`: monochrome tokens, typography, responsive layout, motion, print.
- `src/main.js`: navigation, legacy section links, clock,
  reading progress, and optional entrance animations.
- `src/ui/identity-art.js`: decorative Canvas2D sculpture and its lifecycle.
- `src/ui/miffy-scene.js`: interactive Miffy scene and its motion lifecycle.
- `src/ui/contact-form.js`: form handoff state and provider-return receipt.
- `public/`: social card, icons, manifest, robots, and sitemap.

See [design.md](design.md) for implementation and accessibility details.
