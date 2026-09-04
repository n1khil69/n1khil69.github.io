/* REVEALS — panes come into focus, they do not fade in.

   Everything on this page is glass, so the entrance is an optical one: a
   pane arrives slightly behind the focal plane, blurred and dim, and settles
   forward until it is sharp. Panes in a group settle in sequence, like a
   stack being squared up.

   Driven by IntersectionObserver rather than ScrollTrigger. Reveals need no
   scrub — only "is this on screen yet" — and an observer answers that from
   what is actually painted, instead of from a scroll position that can go
   stale when the page is scrolled programmatically or by a smooth-scroll
   library. A reveal that fails to fire leaves content invisible, so the
   cheapest, least stateful mechanism is the right one.

   Panes are also hidden from JS rather than CSS, so a script that never runs
   at all still leaves everything readable, and the compositor hint is applied
   per batch rather than declared in CSS for every pane at once. */

import gsap from 'gsap';

export function initReveals(tier) {
  if (tier === 'static') return;

  const panes = [...document.querySelectorAll('.reveal')];
  if (!panes.length) return;

  const from = tier === 'full'
    ? { opacity: 0, y: 46, filter: 'blur(14px)', scale: 0.985 }
    : { opacity: 0, y: 26 };

  gsap.set(panes, from);

  const deep = tier === 'full';

  const settle = (batch) => {
    // hint only the panes actually in flight — a blanket `will-change` in CSS
    // promotes every pane on the page, most of them off-screen, and a phone
    // pays for all of them in GPU memory
    const hint = deep ? 'transform, opacity, filter' : 'transform, opacity';
    batch.forEach((el) => { el.style.willChange = hint; });
    return gsap.to(batch, {
      opacity: 1,
      y: 0,
      // the depth-blur is a full-tier luxury: animating `filter` forces a
      // filter pass per frame per pane, which a phone cannot spare
      ...(deep ? { scale: 1, filter: 'blur(0px)' } : {}),
      duration: deep ? 1.15 : 0.8,
      ease: 'expo.out',
      stagger: 0.09,
      overwrite: true,
      onComplete() {
        /* Hand the pane back to CSS. The tween ends on the identity transform,
           but GSAP leaves `transform: translate(0px, 0px)` inline — and an
           inline transform outranks a stylesheet rule, so it was silently
           killing every `:hover` lift on tiles, credentials, prisms and job
           slabs. Clearing the props also releases the compositor layer. */
        gsap.set(batch, { clearProps: 'transform,filter,willChange' });
      },
    });
  };

  /* Collect everything that crosses in the same frame so neighbours stagger
     together instead of each animating on its own. */
  let queued = [];
  let flush = 0;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      queued.push(e.target);
    }
    if (!queued.length || flush) return;
    flush = requestAnimationFrame(() => {
      flush = 0;
      const batch = queued;
      queued = [];
      settle(batch);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });

  panes.forEach((el) => io.observe(el));
}
