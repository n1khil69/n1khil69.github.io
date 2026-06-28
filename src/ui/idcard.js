/* Cinematic 3D tilt on the hero identity card: pointer-driven rotateX/Y with
   real depth (the bar/body sit on preserve-3d planes via CSS) plus a tracking
   glare/sheen. Hover devices only — wired behind canHover && !prefersReduced
   in main.js, so touch/reduced-motion keep the flat card. */

import gsap from 'gsap';

export function initIdcard() {
  const card = document.querySelector('.idcard');
  if (!card) return;

  // glare overlay — created here so it only exists on the hover/motion tier
  const glare = document.createElement('span');
  glare.className = 'idcard__glare';
  glare.setAttribute('aria-hidden', 'true');
  card.appendChild(glare);

  const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3' });
  const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3' });
  gsap.set(card, { transformPerspective: 900, transformOrigin: 'center' });

  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY(px * 8);
    rotX(py * -8);
    glare.style.setProperty('--gx', `${(px + 0.5) * 100}%`);
    glare.style.setProperty('--gy', `${(py + 0.5) * 100}%`);
    glare.style.opacity = '1';
  });
  card.addEventListener('pointerleave', () => {
    rotX(0); rotY(0);
    glare.style.opacity = '0';
  });
}
