/* GSAP scroll choreography: hero entrance, WebGL scroll-coupling,
   timeline-rail scrub, and a touch of desktop parallax. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/* the hero title mask-reveal — runs once the preloader clears */
export function heroIntro(tier) {
  if (tier === 'static') return null;

  const lines = [...document.querySelectorAll('.hero__line')];
  const eyebrow = document.querySelector('.hero__eyebrow');
  const foot = document.querySelector('.hero__foot');
  const idcard = document.querySelector('.idcard');
  const splits = [];

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 14, duration: 0.6 }, 0);

  lines.forEach((line, i) => {
    line.setAttribute('aria-label', line.textContent.trim());
    let targets;
    try {
      const split = new SplitText(line, { type: 'chars' });
      splits.push(split);
      targets = split.chars;
    } catch {
      targets = [line];
    }
    tl.from(targets, {
      yPercent: 118, opacity: 0, duration: 0.9, stagger: 0.02,
    }, 0.1 + i * 0.08);
  });

  if (idcard) tl.from(idcard, { opacity: 0, y: 34, duration: 0.8 }, 0.32);
  if (foot) tl.from(foot, { opacity: 0, y: 22, duration: 0.8 }, 0.46);
  return tl;
}

export function initChoreography(tier, getLattice) {
  const lattice = () => (getLattice ? getLattice() : null);

  // couple page scroll → WebGL lattice dispersion, and pause it off-screen
  const hero = document.querySelector('.hero');
  if (hero) {
    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: (self) => { const l = lattice(); if (l) l.setScroll(self.progress); },
      onLeave: () => { const l = lattice(); if (l) l.stop(); },
      onEnter: () => { const l = lattice(); if (l) l.start(); },
      onEnterBack: () => { const l = lattice(); if (l) l.start(); },
      onLeaveBack: () => { const l = lattice(); if (l) l.start(); },
    });
  }

  // experience timeline rail fills as you scroll the section
  const fill = document.getElementById('timelineFill');
  const tlEl = document.querySelector('.timeline');
  if (fill && tlEl) {
    gsap.fromTo(fill, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: tlEl, start: 'top 65%', end: 'bottom 80%', scrub: true },
    });
  }
}
