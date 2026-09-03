/* NAV — the capsule, the mercury puck, and the drawer.

   The puck is the detail that sells it: a bead of liquid glass that slides
   and stretches under whichever link is active, rather than an underline
   snapping between positions. */

export function initNav() {
  const nav = document.getElementById('nav');
  const puck = document.getElementById('navPuck');
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  let activeLink = null;

  function movePuck(link) {
    if (!puck || !link) return;
    const host = link.parentElement.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    puck.style.width = `${r.width}px`;
    puck.style.transform = `translate(${r.left - host.left}px, -50%)`;
    puck.classList.add('on');
  }

  let lastY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 30);
      // the capsule retracts on a decisive scroll down, returns on any scroll up
      nav.classList.toggle('hidden', y > 460 && y > lastY + 4);
    }
    lastY = y;

    const line = y + window.innerHeight * 0.35;
    let current = null;
    for (const s of sections) if (s.offsetTop <= line) current = s;

    links.forEach((a) => a.classList.toggle('active', !!current && a.getAttribute('href') === `#${current.id}`));

    const nextActive = links.find((a) => a.classList.contains('active')) || null;
    if (nextActive !== activeLink) {
      activeLink = nextActive;
      if (activeLink) movePuck(activeLink);
      else puck?.classList.remove('on');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { if (activeLink) movePuck(activeLink); });
  onScroll();

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
