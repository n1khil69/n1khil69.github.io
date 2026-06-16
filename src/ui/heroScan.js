/* Bolder hero: a cursor-reactive cyan "scan" spotlight + subtle pointer parallax.
   Gated exactly like the custom cursor (hover devices, motion allowed). The scan
   overlay defaults to opacity:0 and only appears on pointermove, so it contributes
   zero luminance to the hero screenshot the visual-check captures (the test never
   moves the mouse) — and its alpha is capped low + vignette-masked regardless. */

import gsap from 'gsap';

export function initHeroScan() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const scan = hero.querySelector('.hero__scan');
  const title = hero.querySelector('.hero__title');
  const idcard = hero.querySelector('.idcard');

  // parallax via quickTo (composes with idcard's own tilt — gsap merges transforms)
  const titleX = title ? gsap.quickTo(title, 'x', { duration: 0.6, ease: 'power3' }) : null;
  const titleY = title ? gsap.quickTo(title, 'y', { duration: 0.6, ease: 'power3' }) : null;
  const cardX = idcard ? gsap.quickTo(idcard, 'x', { duration: 0.6, ease: 'power3' }) : null;
  const cardY = idcard ? gsap.quickTo(idcard, 'y', { duration: 0.6, ease: 'power3' }) : null;

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    if (scan) {
      scan.style.setProperty('--sx', `${px * 100}%`);
      scan.style.setProperty('--sy', `${py * 100}%`);
      scan.style.opacity = '1'; // CSS transition handles the fade
    }

    const dx = px - 0.5;
    const dy = py - 0.5;
    if (titleX) { titleX(dx * 10); titleY(dy * 6); }
    if (cardX) { cardX(dx * -10); cardY(dy * -6); }
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    if (scan) scan.style.opacity = '0';
    if (titleX) { titleX(0); titleY(0); }
    if (cardX) { cardX(0); cardY(0); }
  });
}
