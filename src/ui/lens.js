/* THE LENS
   ---------------------------------------------------------------------
   The cursor is a physical piece of glass, not a drawn dot. It carries the
   page's own refraction filter, so whatever passes under it genuinely bends
   and splits into a chromatic fringe.

   Behaviour is the point:
     · it lags, then overshoots and settles — glass has mass
     · near an interactive element it is *pulled*, then swells into a
       labelled pill and fuses with the element's own highlight
     · pressing squeezes it; releasing drops a ring into the liquid below

   Hover + fine pointer only. Everything here is decoration: the native
   cursor keeps working if any of it fails. */

import gsap from 'gsap';

const HOT = 'a, button, input, label, [data-tilt], .tile, .cred, .prism, .asim__chip, .rail__ticks li';

export function initLens({ onPress } = {}) {
  const lens = document.getElementById('lens');
  if (!lens) return null;
  const label = document.getElementById('lensLabel');

  document.body.classList.add('has-lens');

  const x = gsap.quickTo(lens, 'x', { duration: 0.42, ease: 'power3' });
  const y = gsap.quickTo(lens, 'y', { duration: 0.42, ease: 'power3' });

  let hovered = null;
  let raw = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  function move(e) {
    raw = { x: e.clientX, y: e.clientY };
    lens.style.opacity = '1';

    // magnetic pull: inside a hot target the lens drifts toward its centre
    if (hovered) {
      const r = hovered.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const pull = r.width > 260 ? 0.06 : 0.26;
      x(e.clientX + (cx - e.clientX) * pull);
      y(e.clientY + (cy - e.clientY) * pull);
    } else {
      x(e.clientX);
      y(e.clientY);
    }
  }

  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', () => { lens.style.opacity = '0'; });

  window.addEventListener('pointerdown', () => lens.classList.add('down'));
  window.addEventListener('pointerup', () => {
    lens.classList.remove('down');
    onPress?.(raw.x, raw.y);
  });

  /* delegated so it covers everything, including nodes added later */
  document.addEventListener('pointerover', (e) => {
    const hit = e.target.closest?.(HOT);
    if (!hit || hit === hovered) return;
    hovered = hit;
    const text = hit.dataset?.lens
      || hit.closest('[data-lens]')?.dataset.lens
      || (hit.tagName === 'INPUT' ? 'type' : '');
    if (label) label.textContent = text;
    lens.classList.toggle('hot', !!text);
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    if (!hovered) return;
    if (e.relatedTarget && hovered.contains(e.relatedTarget)) return;
    hovered = null;
    lens.classList.remove('hot');
    if (label) label.textContent = '';
  }, { passive: true });

  return { lens };
}

/* Buttons lean toward the pointer and spring back — the same physical
   language as the lens, applied to the things it lands on. */
export function initMagnets() {
  document.querySelectorAll('.btn, .nav__mark, .sfx').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'elastic.out(1, 0.5)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'elastic.out(1, 0.5)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.28);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
