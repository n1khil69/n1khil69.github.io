/* NAV — the capsule, the mercury puck, and the drawer.

   The puck is the detail that sells it: a bead of liquid glass that slides
   and stretches under whichever link is active, rather than an underline
   snapping between positions.

   The scroll handler is on the hot path, so it reads no layout: section
   offsets are measured on resize, the handler reads only `scrollY`, the work
   is batched into a frame, and classes are written only when they change —
   each write to the capsule invalidates a backdrop-filtered subtree. Under
   900px the links are hidden entirely, so the scroll-spy half is skipped. */

export function initNav() {
  const nav = document.getElementById('nav');
  const puck = document.getElementById('navPuck');
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const linkBar = document.querySelector('.nav__links');

  let activeLink = null;
  let offsets = [];
  let viewport = window.innerHeight;
  let spy = false;
  let queued = 0;
  let lastScrolled = null;
  let lastHidden = null;

  function movePuck(link) {
    if (!puck || !link) return;
    const host = link.parentElement.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    puck.style.width = `${r.width}px`;
    puck.style.transform = `translate(${r.left - host.left}px, -50%)`;
    puck.classList.add('on');
  }

  let lastY = window.scrollY;

  /* the only layout reads, and they run on resize rather than on scroll */
  function measure() {
    viewport = window.innerHeight;
    spy = !!linkBar && getComputedStyle(linkBar).display !== 'none';
    offsets = sections.map((s) => s.offsetTop);
    if (activeLink) movePuck(activeLink);
    apply();
  }

  function apply() {
    queued = 0;
    const y = window.scrollY;

    if (nav) {
      const scrolled = y > 30;
      if (scrolled !== lastScrolled) { nav.classList.toggle('scrolled', scrolled); lastScrolled = scrolled; }
      // the capsule retracts on a decisive scroll down, returns on any scroll up
      const hidden = y > 460 && y > lastY + 4;
      if (hidden !== lastHidden) { nav.classList.toggle('hidden', hidden); lastHidden = hidden; }
    }
    lastY = y;

    if (!spy) return; // the links are not on screen; nothing to highlight

    const line = y + viewport * 0.35;
    let current = null;
    for (let i = 0; i < sections.length; i++) if (offsets[i] <= line) current = sections[i];

    const nextActive = current
      ? links.find((a) => a.getAttribute('href') === `#${current.id}`) || null
      : null;

    if (nextActive !== activeLink) {
      links.forEach((a) => a.classList.toggle('active', a === nextActive));
      activeLink = nextActive;
      if (activeLink) movePuck(activeLink);
      else puck?.classList.remove('on');
    }
  }

  function onScroll() {
    if (queued) return;
    queued = requestAnimationFrame(apply);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
  measure();

  // the puck also previews wherever you are pointing
  links.forEach((a) => {
    a.addEventListener('pointerenter', () => movePuck(a));
  });
  document.querySelector('.nav__links')?.addEventListener('pointerleave', () => {
    if (activeLink) movePuck(activeLink); else puck?.classList.remove('on');
  });

  // drawer
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  function setOpen(open) {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}
