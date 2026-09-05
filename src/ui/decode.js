/* "Decrypt" text reveal — mono labels scramble through glyphs then resolve
   left→right as they scroll in (the identity-decryption motif). Targets carry a
   `data-decode` attribute and are JetBrains Mono (fixed-width → no reflow).

   Critically this ONLY rewrites textContent — never opacity/transform — so it
   composes with the .reveal fade (owned by reveals.js) instead of fighting it.

   These targets are decorative index labels ("[ 01 · BACKGROUND ]") that
   restate the heading right beneath them, so they are hidden from assistive
   technology entirely. That is both the right call for a duplicate label and
   the only correct one: `aria-label` is prohibited on a plain <span> or <p>,
   which have no role to label, so it cannot be used to pin the real text
   through the scramble. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

const GLYPHS = '01<>/{}[]#$%&*+=ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/* Scramble `el` to `final`, resolving character by character. Returns the tween
   (or null). Spaces stay fixed so word shape is preserved. */
export function scramble(el, final, opts = {}) {
  if (!el) return null;
  const text = final ?? el.textContent;
  const duration = opts.duration ?? Math.min(1.1, Math.max(0.5, text.length * 0.03));
  const state = { p: 0 };
  return gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate() {
      const reveal = Math.floor(state.p * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        out += i < reveal || c === ' ' ? c : rnd();
      }
      el.textContent = out;
    },
    onComplete() { el.textContent = text; },
    onInterrupt() { el.textContent = text; },
  });
}

export function initDecode(tier) {
  if (tier === 'static') return; // leave final text untouched (reduced motion)

  document.querySelectorAll('[data-decode]').forEach((el) => {
    const final = el.textContent;
    el.setAttribute('aria-hidden', 'true'); // decorative: the heading says it too
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%', // match reveals.js so text resolves as the head fades in
      once: true,
      onEnter: () => {
        try { scramble(el, final); } catch { el.textContent = final; }
      },
    });
  });
}
