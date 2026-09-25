import { initIdentityArt } from './ui/identity-art.js';
import { initMiffyScene } from './ui/miffy-scene.js';
import { initContactForm } from './ui/contact-form.js';
import { initMiffyHunt } from './ui/miffy-hunt.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Each enhancement stands on its own; the document is readable without JavaScript.
initMiffyScene();
initContactForm();
initIdentityArt(document.getElementById('identity-art'));
initMiffyHunt();

const menu = document.getElementById('mobileMenu');
const menuToggle = document.getElementById('menuToggle');
const closeMenu = () => menu.close();
menuToggle.addEventListener('click', () => {
  menu.showModal();
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
});
document.getElementById('menuClose').addEventListener('click', closeMenu);
// Wrap Tab within the open menu, as a modal should, instead of letting focus
// escape to the browser.
menu.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const items = [...menu.querySelectorAll('a[href], button:not([disabled])')];
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
menu.addEventListener('close', () => {
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const target = document.querySelector(link.hash);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}));
window.matchMedia('(min-width: 761px)').addEventListener('change', e => {
  if (e.matches && menu.open) closeMenu();
});

// Keep old playground bookmarks useful after replacing those features.
function routeLabHash() {
  if (['#terminal', '#signature', '#access'].includes(location.hash)) {
    history.replaceState(null, '', `${location.pathname}${location.search}#lab`);
    document.getElementById('lab').scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}
window.addEventListener('hashchange', routeLabHash);
routeLabHash();

const clock = document.getElementById('istClock');
const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
function updateClock() { clock.textContent = `${formatter.format(new Date())} IST · UTC +05:30`; }
updateClock();
setInterval(() => { if (!document.hidden) updateClock(); }, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClock(); });

const progress = document.getElementById('readingProgress');
let progressPending = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
  progressPending = false;
}
function requestProgress() {
  if (!progressPending) { progressPending = true; requestAnimationFrame(updateProgress); }
}
window.addEventListener('scroll', requestProgress, { passive: true });
window.addEventListener('resize', requestProgress, { passive: true });
new ResizeObserver(requestProgress).observe(document.body);
updateProgress();

// Animate on arrival, never hide offscreen content while waiting for JavaScript.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!reducedMotion.matches) entry.target.classList.add('is-entering');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => {
  revealObserver.observe(element);
  element.addEventListener('animationend', () => element.classList.remove('is-entering'), { once: true });
});
