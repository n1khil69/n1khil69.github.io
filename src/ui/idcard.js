/* 3D tilt on the hero identity card. hover devices only. */

import gsap from 'gsap';

export function initIdcard() {
  const card = document.querySelector('.idcard');
  if (!card) return;
  const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
  const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
  gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' });

  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY(px * 10);
    rotX(py * -10);
  });
  card.addEventListener('pointerleave', () => { rotX(0); rotY(0); });
}
