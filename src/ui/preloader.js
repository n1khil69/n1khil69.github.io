/* THE OPENING
   ---------------------------------------------------------------------
   A short, restrained load state: a counter, a stage line, and two leaves
   of an iris that part to reveal the page.

   Resolves once the leaves are moving, so the hero entrance overlaps the
   opening rather than waiting behind it. Shown once per session. */

import gsap from 'gsap';

const STAGES = [
  'INITIALISING',
  'LOADING ASSETS',
  'PREPARING INTERFACE',
  'READY',
];

export function runPreloader(reduced, { onOpen } = {}) {
  return new Promise((resolve) => {
    const boot = document.getElementById('boot');
    if (!boot) { resolve(); return; }

    if (reduced || sessionStorage.getItem('bootShown')) {
      boot.remove();
      resolve();
      return;
    }
    sessionStorage.setItem('bootShown', '1');
    document.documentElement.classList.add('lenis-stopped');

    const countEl = document.getElementById('bootCount');
    const barEl = document.getElementById('bootBar');
    const statusEl = document.getElementById('bootStatus');
    const counter = { v: 0 };
    let stage = -1;
    let done = false;

    function open() {
      if (done) return;
      done = true;
      onOpen?.();
      boot.classList.add('boot--done');
      document.documentElement.classList.remove('lenis-stopped');
      resolve();
      // the iris leaves keep travelling for a beat after the page is live
      setTimeout(() => boot.remove(), 1200);
    }

    const tl = gsap.timeline({ onComplete: open });

    tl.to(counter, {
      v: 100,
      duration: 2.1,
      // a real instrument doesn't ramp linearly — it catches, then releases
      ease: 'steps(48)',
      onUpdate() {
        const v = Math.round(counter.v);
        if (countEl) countEl.textContent = String(v).padStart(3, '0');
        if (barEl) barEl.style.width = `${v}%`;
        const s = Math.min(STAGES.length - 1, Math.floor(v / 26));
        if (s !== stage && statusEl) {
          stage = s;
          statusEl.textContent = STAGES[s];
        }
      },
    });
    tl.to({}, { duration: 0.3 }); // let READY land

    boot.addEventListener('click', () => tl.progress(1));
  });
}
