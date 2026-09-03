/* Pointer-driven 3D on anything marked [data-tilt].

   The credential and the certification cards are physical objects: they
   rotate toward the pointer on real perspective, their inner planes sit at
   different depths (CSS translateZ), and a glare tracks across the laminate.
   Hover devices with motion allowed only. */

import gsap from 'gsap';

export function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach((host) => {
    const card = host.querySelector('.badge__card, .cred') || host;
    const glare = host.querySelector('.badge__glare');
    const strength = card.classList.contains('cred') ? 6 : 11;

    gsap.set(card, { transformPerspective: 1200, transformOrigin: 'center' });
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.7, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.7, ease: 'power3' });

    host.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * strength * 2);
      rx(py * -strength * 2);
      if (glare) {
        glare.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
        glare.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
        glare.style.opacity = '1';
      }
    });

    host.addEventListener('pointerleave', () => {
      rx(0); ry(0);
      if (glare) glare.style.opacity = '0';
    });
  });
}

/* Hero parallax: the title and the credential drift against each other, so
   the hero has depth before you have scrolled a pixel. */
export function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const title = hero.querySelector('.hero__lead');
  const badge = hero.querySelector('.badge');
  const bloom = hero.querySelector('.hero__bloom');
  if (!title || !badge) return;

  const tx = gsap.quickTo(title, 'x', { duration: 0.9, ease: 'power3' });
  const ty = gsap.quickTo(title, 'y', { duration: 0.9, ease: 'power3' });
  const bx = gsap.quickTo(badge, 'x', { duration: 0.9, ease: 'power3' });
  const by = gsap.quickTo(badge, 'y', { duration: 0.9, ease: 'power3' });
  const lx = bloom ? gsap.quickTo(bloom, 'x', { duration: 1.4, ease: 'power2' }) : null;
  const ly = bloom ? gsap.quickTo(bloom, 'y', { duration: 1.4, ease: 'power2' }) : null;

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    tx(dx * 12); ty(dy * 7);
    bx(dx * -22); by(dy * -13);
    if (lx) { lx(dx * 90); ly(dy * 60); }
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    tx(0); ty(0); bx(0); by(0);
    if (lx) { lx(0); ly(0); }
  });
}
