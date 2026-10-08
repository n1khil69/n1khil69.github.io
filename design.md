# Design and implementation

## Visual direction

The portfolio takes its editorial direction from https://mijobello.com/:
sage (`#b2c7ab`), burgundy (`#6a0c06`), oversized lowercase Space Grotesk headings,
thin ruled grids, and a panoramic image above the nameplate. Original local SVG
Miffy illustrations replace the reference's photography. A deep green dark theme
uses the same layout. Profile content remains normal selectable HTML.

The content sequence is introduction, career, expertise,
credentials, and contact. Career entries use keyboard-accessible tabs and arrows;
expertise uses native `details`/`summary`. Professional history, credentials, and
contact information live in `index.html`.

## Active architecture

`index.html` imports `src/main.js`. The active browser graph has no third-party
runtime libraries: animation, interaction, and scrolling use browser APIs.

| File | Responsibility |
| --- | --- |
| `styles.css` | Shared tokens, fluid type, section grids, component states, responsive and print rules |
| `src/main.js` | Navigation dialog, career tabs, theme preference, world clocks, and legacy bookmark redirects |
| `src/redesign.css` | Miffy and contact-form integration with the editorial grid |
| `scripts/make-editorial-art.mjs` | Generates the two original SVG illustrations in `public/art` |
| `src/ui/miffy-shape.js` | Miffy's shapes after Dick Bruna, shared by the scene, delivery card, hunt peekers, and icons |
| `src/ui/contact-form.js` | Contact submission, verified provider success, failure/retry, and in-form failure recovery |
| `404.html` | Script-free error page sharing the visual language |

Vite builds the two HTML entries for hosting at the domain root. The deployment
workflow uses Node.js 24. No preloader, custom scroll engine, or WebGL context is
needed to read the page.

## Responsive layout and performance

Fluid gutters and type scale between compact phones and wide screens. At the
mobile breakpoint, the content grids stack and the panorama uses one image.
Navigation uses a dialog on all sizes. Narrow-screen rules reflow the Miffy scene, its controls, and contact
details. Interactive text inputs use a readable mobile font size. Native scrolling
and semantic links preserve ordinary browser navigation.

The hero uses local SVG illustrations. Clocks refresh while the document is visible.
The interactive Miffy playground and scavenger hunt are removed, including their
hero/footer launch controls and roaming character. Static illustrations remain.
Dark-mode experience cards use forest, moss, and slate green instead of the light
palette's burgundy, cream, and peach.

Navigation uses a native dialog with Escape and focus restoration. The page has
keyboard-accessible career tabs, a skip link, visible focus, form labels, and
responsive grids. Core profile content remains readable without JavaScript.

## Contact delivery details

The contact form submits through FormSubmit's AJAX endpoint, with a native POST
fallback when JavaScript is off. It validates input, includes a honeypot, times
out after 20 seconds, and shows success only for an explicit successful response.
Failed or uncertain delivery preserves the note and offers retry.

FormSubmit requires the recipient to activate the form using a confirmation
email triggered by the first submission from the deployed site. No private
credentials are stored in the repository. The owner must activate and then
verify real inbox delivery separately; automated checks mock the POST and never
contact the live delivery endpoint.

## Verification

Run `npm run build` before reviewing the production preview. The manual Visual
Check workflow captures desktop and mobile screenshots and checks the resulting
page at 320, 390, 768, 1280, and 1920 pixels. Its checks cover document overflow,
runtime errors, disclosure expansion, mobile dialog focus/dismissal, Miffy scene
controls and keyboard operation, contact form
validation and a mocked POST, reduced motion, direct links, and a script-free
profile. Screenshots support visual
review; automated checks do not claim a complete accessibility audit.
