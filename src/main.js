/* BOOTSTRAP
   ---------------------------------------------------------------------
   Decide how much optics this device can carry, wire the always-on content
   first, then layer the expensive material on top: the moving light, the
   liquid substrate, the lens, the scroll choreography. Every layer above the
   content layer is optional — if any of it fails to load, the page is still
   a complete, readable, navigable document. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { tier, prefersReduced, canHover, finePointer, optics } from './core/capabilities.js';
import { initOptics } from './core/optics.js';
import { initNav } from './ui/nav.js';
import { initRail } from './ui/rail.js';
import { initShortcuts } from './ui/shortcuts.js';
import { initClock } from './ui/clock.js';
import { initTerminal } from './ui/terminal.js';
import { initContact } from './ui/contact.js';
import { initAccessSim } from './ui/accessSim.js';
import { initMarquee } from './ui/marquee.js';
import { initSfx, play } from './ui/sfx.js';
import { initReveals } from './scroll/reveals.js';
import { initDecode } from './ui/decode.js';
import { initCounters } from './scroll/counters.js';
import { runPreloader } from './ui/preloader.js';
import { initChoreography, heroIntro } from './scroll/choreography.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* WebGL fallback: bring up the Canvas2D substrate instead */
function ensureFallbackSubstrate() {
  import('./ui/mesh.js').then(({ initMesh }) => initMesh()).catch(() => {});
}

function boot() {
  const html = document.documentElement;
  html.dataset.tier = tier;
  if (optics) html.classList.add('refraction');

  /* ---- content and chrome: every tier, always ---- */
  initNav();
  initRail({ onSection: () => play('sweep') });
  initShortcuts(prefersReduced);
  initClock();
  initTerminal();
  initContact();
  initAccessSim(tier);
  initMarquee(prefersReduced);
  initSfx({ reduced: prefersReduced });

  initReveals(tier);
  initDecode(tier);
  initCounters(tier);

  /* ---- reduced motion: light the panes once, then stop ---- */
  if (tier === 'static') {
    initOptics({ mode: 'once' });
    document.getElementById('boot')?.remove();
    return;
  }

  // a pointer drives the lamp per frame; touch relights on arrival and on
  // scroll-end, which is where the phone's frame budget was going
  initOptics({ mode: tier === 'full' && canHover && finePointer ? 'pointer' : 'settle' });

  let liquid = null;
  const getLiquid = () => liquid;

  /* the lens and the tilt are hover-device luxuries */
  if (canHover && finePointer) {
    import('./ui/lens.js').then(({ initLens, initMagnets }) => {
      initLens({ onPress: (x, y) => liquid?.ripple(x, y, 1) });
      initMagnets();
    }).catch(() => {});
    import('./ui/tilt.js').then(({ initTilt, initHeroParallax }) => {
      initTilt();
      initHeroParallax();
    }).catch(() => {});
  }

  async function raiseOptics() {
    if (tier === 'full') {
      try {
        const { initLenis } = await import('./core/lenis.js');
        initLenis();
      } catch { /* native scroll is a fine substitute */ }
    }

    initChoreography(tier, getLiquid);
    heroIntro(tier);

    if (tier === 'full') {
      try {
        const { createLiquid } = await import('./webgl/liquid.js');
        liquid = createLiquid(document.getElementById('field'), {
          tier,
          onContextLost: ensureFallbackSubstrate,
        });
        liquid.start();
        liquid.flare(1.2); // the light comes up with the page
      } catch {
        ensureFallbackSubstrate();
      }
    } else {
      ensureFallbackSubstrate();
    }

    ScrollTrigger.refresh();

    document.addEventListener('visibilitychange', () => {
      if (!liquid) return;
      document.hidden ? liquid.stop() : liquid.start();
    });
  }

  /* the page reacts to its own events: a decision, a command, a reveal all
     push light into the liquid underneath */
  document.addEventListener('ns:pulse', (e) => {
    const { x, y, sound } = e.detail || {};
    liquid?.flare(0.9);
    if (typeof x === 'number') liquid?.ripple(x, y, 1.2);
    if (sound) play(sound);
  });

  runPreloader(prefersReduced, { onOpen: () => play('open') }).then(raiseOptics);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
