/* animated stat counters, fired by ScrollTrigger when each enters view */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function initCounters(tier) {
  const nums = document.querySelectorAll('.stat__num');
  nums.forEach(el => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';

    if (tier === 'static') { el.textContent = target + suffix; return; }

    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target, duration: 1.4, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
        });
      },
    });
  });
}
