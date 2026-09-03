/* CHOREOGRAPHY
   ---------------------------------------------------------------------
   The scroll-driven half of the optics: the hero entrance, the coupling
   between the page and the liquid beneath it, the conduit that fills as the
   record scrolls past, and the depth parallax that keeps the stack feeling
   like layers rather than a list. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/* The hero entrance. The title is cut into characters and each one rises out
   of its own mask with the blur of something coming into focus — the same
   optical language as the reveals, at a larger scale. */
export function heroIntro(tier) {
  if (tier === 'static') return null;

  const lines = [...document.querySelectorAll('.hero__line')];
  const eyebrow = document.querySelector('.hero__eyebrow');
  const foot = document.querySelector('.hero__foot');
  const badge = document.querySelector('.badge');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 16, duration: 0.9 }, 0);

  lines.forEach((line, i) => {
    line.setAttribute('aria-label', line.textContent.trim());
    let targets;
    try {
      // the emphasised word carries a clipped gradient — splitting it into
      // characters would strip the background off every one of them, so it
      // animates as a single unit instead
      const split = new SplitText(line, { type: 'chars', ignore: 'em' });
      targets = [...split.chars];
      line.querySelectorAll('em').forEach((em) => { if (!targets.includes(em)) targets.push(em); });
    } catch {
      targets = [line];
    }
    tl.from(targets, {
      yPercent: 116,
      opacity: 0,
      filter: tier === 'full' ? 'blur(12px)' : 'none',
      rotateX: tier === 'full' ? -55 : 0,
      transformOrigin: '50% 100%',
      duration: 1.25,
      stagger: 0.021,
      onComplete() { targets.forEach((c) => { c.style.filter = ''; }); },
    }, 0.12 + i * 0.09);
  });

  if (badge) {
    // the credential drops in and rocks to rest, like a card set on a table
    tl.from(badge, { opacity: 0, y: 60, rotateX: 18, rotateZ: -5, duration: 1.5 }, 0.4);
    const rows = badge.querySelectorAll('.badge__body > div, .badge__head, .badge__portrait, .badge__strip');
    if (rows.length) tl.from(rows, { opacity: 0, y: 12, duration: 0.7, stagger: 0.055 }, 0.72);
  }
  if (foot) tl.from(foot, { opacity: 0, y: 26, duration: 1.05 }, 0.6);

  return tl;
}

export function initChoreography(tier, getLiquid) {
  const liquid = () => (getLiquid ? getLiquid() : null);

  /* page scroll → the liquid's flow and drain */
  const hero = document.querySelector('.hero');
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => liquid()?.setScroll(self.progress),
      onLeave: () => liquid()?.stop(),
      onEnter: () => liquid()?.start(),
      onEnterBack: () => liquid()?.start(),
      onLeaveBack: () => liquid()?.start(),
    });

    /* the hero itself sinks and defocuses as you leave it — you are
       descending through it, not scrolling past it */
    if (tier === 'full') {
      gsap.to('.hero__lead', {
        y: -70, opacity: 0.15, filter: 'blur(9px)', ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: 0.6 },
      });
      gsap.to('.badge', {
        y: -140, rotateX: -12, opacity: 0.1, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: 0.6 },
      });
    }
  }

  /* the conduit fills as the experience timeline passes */
  const flow = document.getElementById('timelineFill');
  const rail = document.querySelector('.timeline');
  if (flow && rail) {
    gsap.fromTo(flow, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: rail, start: 'top 65%', end: 'bottom 80%', scrub: 0.5 },
    });
  }

  /* each layer is "laid down": a bar of light runs the seam once, on arrival */
  ScrollTrigger.batch('.section + .section', {
    start: 'top 78%',
    onEnter: (batch) => batch.forEach((el) => el.classList.add('layered')),
  });

  if (tier !== 'full') return;

  /* Scroll velocity shears the whole stack, then it springs back — the page
     behaves like a body of glass being pushed, not a list being scrolled.
     One compositor-only transform on <main>, capped hard so it reads as
     material response rather than as a wobble. */
  {
    const root = document.documentElement;
    let shear = 0;
    let target = 0;
    let running = false;

    const quant = (v) => `${v.toFixed(3)}deg`;
    const shearing = (on) => root.classList.toggle('shearing', on);

    ScrollTrigger.create({
      onUpdate: (self) => {
        // getVelocity() is px/s; 4000px/s of flick maps to the full deflection
        target = Math.max(-1.15, Math.min(1.15, self.getVelocity() / -3400));
        if (!running) { running = true; shearing(true); requestAnimationFrame(settle); }
      },
    });

    function settle() {
      shear += (target - shear) * 0.14;
      target *= 0.86;
      root.style.setProperty('--shear', quant(shear));
      if (Math.abs(shear) > 0.004 || Math.abs(target) > 0.004) {
        requestAnimationFrame(settle);
      } else {
        root.style.setProperty('--shear', '0deg');
        // hand <main> back to the page compositor so overlays can blur through it
        shearing(false);
        running = false;
      }
    }
  }

  /* section titles drift against their own section — depth, cheaply */
  document.querySelectorAll('.section__head').forEach((head) => {
    gsap.fromTo(head, { y: 22 }, {
      y: -22, ease: 'none',
      scrollTrigger: { trigger: head.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  });

  /* the laminate band counter-scrolls, so the stack shears slightly */
  const band = document.querySelector('.band');
  if (band) {
    gsap.fromTo(band, { skewY: 0.6 }, {
      skewY: -0.6, ease: 'none',
      scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  }
}
