# Design and implementation

## Visual direction

“Identity, by design” is a monochrome editorial portfolio. Large grotesque
headlines, italic serif accents, small monospace labels, and thin rules provide
hierarchy. Ink (`#101010`) and paper (`#f0f0ec`) sections establish a clear rhythm;
neutral grays support secondary information. The canvas sculpture gives the hero
one focal point while the profile remains normal selectable HTML.

The content sequence is introduction, expertise, career, a playful Miffy scene,
credentials, and contact. Expertise and additional career detail use native
`details`/`summary` controls to keep the first reading concise. Professional
history, credentials, and contact information live in `index.html`.

## Active architecture

`index.html` imports `src/main.js`. The active browser graph has no third-party
runtime libraries: animation, interaction, and scrolling use browser APIs.

| File | Responsibility |
| --- | --- |
| `styles.css` | Shared tokens, fluid type, section grids, component states, responsive and print rules |
| `src/main.js` | Mobile dialog, section navigation, IST clock, reading progress, and Miffy integrations |
| `src/ui/identity-art.js` | Canvas2D point sphere, projected wire geometry, orbits, subtle pointer response |
| `src/ui/miffy-scene.js` | Interactive Miffy scene, Day/Night world cycle, activities, and motion lifecycle |
| `src/ui/miffy-shape.js` | Miffy's shapes after Dick Bruna, shared by the scene, delivery card, hunt peekers, and icons |
| `src/ui/miffy-wardrobe.js` | Miffy Wardrobe Studio: monochrome tones, patterns, and the hunt's secret dress |
| `src/ui/miffy-garden.js` | Miffy's Garden: flowers visitors plant beside Miffy, remembered per visitor |
| `src/ui/miffy-surprise.js` | A hidden surprise for Sanguuuu: five quick taps on Miffy open a love note and unlock a hearts dress; afterwards Miffy greets her by name. Pressing and holding Miffy makes her blush (in `miffy-scene.js`) |
| `src/ui/miffy-hunt.js` | Portfolio-wide peek-a-boo scavenger hunt across 4 secret locations |
| `src/ui/contact-form.js` | In-page contact delivery, Miffy paper plane express, honest failure states, and provider receipt |
| `404.html` | Script-free error page sharing the visual language |

Vite builds the two HTML entries for hosting at the domain root. The deployment
workflow uses Node.js 24. No preloader, custom scroll engine, or WebGL context is
needed to read the page.

## Responsive layout and performance

Fluid gutters and type scale between compact phones and wide screens. At the
mobile breakpoint, the desktop navigation becomes a dialog and the content grids
stack. Narrow-screen rules also reflow the Miffy scene, its controls, and contact
details. Interactive text inputs use a readable mobile font size. Native scrolling
and semantic links preserve ordinary browser navigation.

The identity sculpture draws locally generated geometry into one Canvas2D
surface. It caps device pixel ratio at two, uses fewer geometry points on compact
canvases, and targets 30 fps for compact or coarse-pointer devices and 60 fps for
larger fine-pointer devices. Drawing pauses when the canvas is offscreen or the
document is hidden. Reduced motion produces a still composition and responds to
preference changes while the page is open. The canvas is decorative and does not
capture touch gestures.

Entrance animations are enhancements to already-visible content. Reading
progress updates are batched through `requestAnimationFrame`. The clock refreshes
periodically and on return to a visible document.

## Miffy scene and accessibility

The personal interlude pairs an interactive Miffy illustration with playful
activities (waving, dancing, napping, paper plane, ball, peekaboo, balloon), a
real-time Day/Night celestial cycle synced to Gurugram IST hours (at night Miffy
sleeps in striped pajamas under the stars), a monochrome Wardrobe Studio (ink,
graphite, stone, paper, and a Breton stripe), and Miffy's Garden, where each press
of "Plant a flower" sprouts a random flower (tulip, daisy, pom-pom, bellflower, or
star flower) beside her, up to six. Planted flowers are remembered per visitor,
sway when Miffy dances, and nod off at night. A portfolio-wide
peek-a-boo scavenger hunt hides 4 mini-Miffys across the site, unlocking a secret
Polka Dot dress upon discovery. Like the rest of the site, the scene stays
monochrome: the wardrobe changes only Miffy's dress, never the page's colours.
The scene is built with local SVG and browser-native controls,
so it needs no downloaded animation library or external artwork service.
Existing `#signature`, `#terminal`, and `#access` links lead to the scene's `#lab`
section. The previous studio and terminal panels have been removed.

Visitors can choose an activity, tap Miffy herself, or request a surprise from a
shuffled activity set that avoids repetitions until each activity has appeared.
Native buttons support touch and keyboard activation; a status region announces actions
requested by the visitor. Automatic activity changes do not interrupt screen
reader output. A motion control lets visitors pause the scene. Reduced motion
keeps activities available as static poses, and automatic activity stops while
the scene is offscreen or the document is hidden.

The mobile navigation uses a native modal `dialog` with a close button and Escape
support. Section links close the dialog and focus their destination. The page
also provides a skip link, visible keyboard focus, descriptive form labels,
direct email access, reduced-motion CSS, and a print stylesheet. Core profile
content stays available without JavaScript; a scene note explains the interactive
requirement.

## Contact delivery

The contact form requires name, email, and message fields, and includes a
honeypot. Native browser validation runs before submission, including when
JavaScript is off. With JavaScript, the form posts to FormSubmit's AJAX endpoint
(`https://formsubmit.co/ajax/nikhil.sharma275@gmail.com`), launches Miffy's paper
plane, and shows the delivery card only when FormSubmit confirms success. A
failed request or a form still awaiting activation keeps the draft and offers
the direct email link; the page never reports a message as sent without that
confirmation. Without JavaScript, the form makes a native POST to
`https://formsubmit.co/nikhil.sharma275@gmail.com`, where FormSubmit shows its
CAPTCHA; the return query string then shows a receipt acknowledgement, which
does not prove email delivery.

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
