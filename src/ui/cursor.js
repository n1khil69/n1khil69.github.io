/* custom cursor (dot + lagging ring) + magnetic buttons. hover devices only. */

import gsap from 'gsap';

export function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  const xDot = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
  const yDot = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
  const xRing = gsap.quickTo(ring, 'x', { duration: 0.32, ease: 'power3' });
  const yRing = gsap.quickTo(ring, 'y', { duration: 0.32, ease: 'power3' });

  window.addEventListener('pointermove', e => {
    cursor.style.opacity = '1';
    xDot(e.clientX); yDot(e.clientY);
    xRing(e.clientX); yRing(e.clientY);
  });
  document.documentElement.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });

  // hot state over interactive elements
  document.querySelectorAll('a, button, input, .card, .term').forEach(el => {
    el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hot'));
    el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hot'));
  });

  // magnetic buttons
  document.querySelectorAll('.btn').forEach(btn => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.5);
    });
    btn.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });

  // cursor-tracked glow on bento cards (CSS custom props)
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}
