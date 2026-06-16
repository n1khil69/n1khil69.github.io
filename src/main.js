/* Bootstrap — compute capability tier, wire always-on UI, then lazily layer on
   the heavy motion (Lenis + WebGL) only where the device can take it. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

import { tier, prefersReduced, canHover } from './core/capabilities.js';
import { initNav } from './ui/nav.js';
import { initClock } from './ui/clock.js';
import { initTerminal } from './ui/terminal.js';
import { initContact } from './ui/contact.js';
import { initAccessSim } from './ui/accessSim.js';
import { initMarquee } from './ui/marquee.js';
import { initCursor } from './ui/cursor.js';
import { initIdcard } from './ui/idcard.js';
import { initHeroScan } from './ui/heroScan.js';
import { initReveals } from './scroll/reveals.js';
import { initDecode } from './ui/decode.js';
import { initCounters } from './scroll/counters.js';
import { runPreloader } from './ui/preloader.js';
import { initChoreography, heroIntro } from './scroll/choreography.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---- scroll progress bar (works with native scroll or Lenis) ---- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---- WebGL fallback: reveal the Canvas2D mesh ---- */
function ensureMeshFallback() {
  import('./ui/mesh.js').then(({ initMesh }) => initMesh());
}

function boot() {
  // always-on: content & lightweight UI for every tier
  initNav();
  initClock();
  initTerminal();
  initContact();
  initAccessSim(tier); // static → final resolved state; lite/full → animated on scroll-in
  initMarquee(prefersReduced);
  initScrollProgress();

  if (canHover && !prefersReduced) {
    initCursor();
    initIdcard();
    initHeroScan();
  }

  // reveals + counters handle every tier internally (static = final state)
  initReveals(tier);
  initDecode(tier);
  initCounters(tier);

  // reduced motion: render everything in final state, no preloader / WebGL
  if (tier === 'static') {
    document.getElementById('boot')?.remove();
    return;
  }

  let field = null;
  const getField = () => field;

  async function startVisual() {
    if (tier === 'full') {
      try {
        const { initLenis } = await import('./core/lenis.js');
        initLenis();
      } catch { /* native scroll is fine */ }
    }

    initChoreography(tier, getField);
    heroIntro(tier); // set hero start-state immediately (before any await)

    if (tier === 'full') {
      try {
        const { createField } = await import('./webgl/field.js');
        const canvas = document.getElementById('field');
        field = createField(canvas, { tier, onContextLost: ensureMeshFallback });
        field.start();
      } catch {
        ensureMeshFallback();
      }
    } else {
      ensureMeshFallback(); // lite tier → Canvas2D ambient
    }

    ScrollTrigger.refresh();

    // pause WebGL when the tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (!field) return;
      document.hidden ? field.stop() : field.start();
    });
  }

  runPreloader(prefersReduced).then(startVisual);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
