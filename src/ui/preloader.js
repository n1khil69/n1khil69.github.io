/* cinematic preloader — lime counter 0→100 + bar, then slide away.
   resolves when the splash is gone so the hero entrance can fire. */

import gsap from 'gsap';

const STATUSES = [
  'VERIFYING VISITOR IDENTITY',
  'CHECKING ENTITLEMENTS',
  'EVALUATING SOD POLICIES',
  'ACCESS GRANTED',
];

export function runPreloader(reduced) {
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
    document.body.style.overflow = 'hidden';

    const countEl = document.getElementById('bootCount');
    const barEl = document.getElementById('bootBar');
    const statusEl = document.getElementById('bootStatus');
    const counter = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        boot.classList.add('boot--done');
        document.documentElement.classList.remove('lenis-stopped');
        document.body.style.overflow = '';
        boot.addEventListener('transitionend', () => boot.remove(), { once: true });
        resolve();
      },
    });

    tl.to(counter, {
      v: 100, duration: 1.9, ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(counter.v);
        if (countEl) countEl.textContent = String(v).padStart(3, '0');
        if (barEl) barEl.style.width = v + '%';
        if (statusEl) statusEl.textContent = STATUSES[Math.min(STATUSES.length - 1, Math.floor(v / 25))];
      },
    });
    tl.to({}, { duration: 0.35 }); // let "ACCESS GRANTED" breathe

    // allow click-to-skip
    boot.addEventListener('click', () => tl.progress(1));
  });
}
