/* REVEALS — panes come into focus, they do not fade in.

   Everything on this page is glass, so the entrance is an optical one: a
   pane arrives slightly behind the focal plane, blurred and dim, and settles
   forward until it is sharp. Cards in a group settle in sequence, like a
   stack being squared up.

   Hidden from JS rather than CSS, so a script failure can never leave the
   content invisible. */

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function initReveals(tier) {
  if (tier === 'static') return;

  const from = tier === 'full'
    ? { opacity: 0, y: 46, filter: 'blur(14px)', scale: 0.985 }
    : { opacity: 0, y: 26 };

  gsap.set('.reveal', from);

  ScrollTrigger.batch('.reveal', {
    start: 'top 90%',
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: tier === 'full' ? 1.15 : 0.8,
      ease: 'expo.out',
      stagger: 0.09,
      overwrite: true,
      onComplete() {
        // release the compositor layer once each pane has landed
        batch.forEach((el) => { el.style.willChange = 'auto'; el.style.filter = ''; });
      },
    }),
  });
}
