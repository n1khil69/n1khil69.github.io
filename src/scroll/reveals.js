/* scroll reveals for .reveal elements. The CSS hides them by default
   (and the reduced-motion media query shows them) — here we animate them in
   for the full/lite tiers via batched ScrollTriggers. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function initReveals(tier) {
  if (tier === 'static') return; // leave content in its natural (visible) state

  // hide via JS (not CSS) so a JS failure never leaves content stuck hidden
  gsap.set('.reveal', { opacity: 0, y: 24 });

  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      stagger: 0.08, overwrite: true,
    }),
  });
}
