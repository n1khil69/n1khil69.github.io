import { initContactForm } from './ui/contact-form.js';
import './redesign.css';

initContactForm();

const themeToggle = document.getElementById('themeToggle');
function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  themeToggle.querySelector('span').textContent = dark ? 'DARK' : 'LIGHT';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#242d26' : '#b2c7ab';
}
let savedTheme;
try { savedTheme = localStorage.getItem('portfolio-theme'); } catch { /* Optional preference. */ }
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(next);
  try { localStorage.setItem('portfolio-theme', next); } catch { /* Keep session state. */ }
});

const menu = document.getElementById('mobileMenu');
const menuToggle = document.getElementById('menuToggle');
menuToggle.addEventListener('click', () => {
  menu.showModal();
  document.body.classList.add('menu-open');
  menuToggle.setAttribute('aria-expanded', 'true');
});
document.getElementById('menuClose').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => {
  document.body.classList.remove('menu-open');
  menuToggle.setAttribute('aria-expanded', 'false');
});
menu.addEventListener('click', event => {
  if (event.target !== menu) return;
  const bounds = menu.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) menu.close();
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.close();
  const target = document.querySelector(link.hash);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}));

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const companies = ['PWC ACCELERATION CENTERS', 'DELOITTE', 'WIPRO'];
let selectedCareer = 0;
function selectCareer(index, focus = false) {
  selectedCareer = (index + tabs.length) % tabs.length;
  tabs.forEach((tab, i) => {
    const active = i === selectedCareer;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
  document.getElementById('careerPosition').textContent = `0${selectedCareer + 1} / 03 — ${companies[selectedCareer]}`;
  if (focus) tabs[selectedCareer].focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectCareer(i));
  tab.addEventListener('keydown', event => {
    const destinations = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    selectCareer(destinations[event.key], true);
  });
});
document.getElementById('careerPrevious').addEventListener('click', () => selectCareer(selectedCareer - 1));
document.getElementById('careerNext').addEventListener('click', () => selectCareer(selectedCareer + 1));

const clocks = [
  [document.getElementById('istClock'), 'Asia/Kolkata'],
  ...[...document.querySelectorAll('[data-clock]')].map(element => [element, element.dataset.clock]),
].map(([element, timeZone]) => ({ element, format: new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }));
function updateClocks() {
  const now = new Date();
  for (const { element, format } of clocks) {
    element.textContent = format.format(now);
    element.dateTime = now.toISOString();
  }
}
updateClocks();
setInterval(() => { if (!document.hidden) updateClocks(); }, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateClocks(); });

function routeLegacyHash() {
  if (!['#lab', '#terminal', '#signature', '#access'].includes(location.hash)) return;
  history.replaceState(null, '', `${location.pathname}${location.search}#about`);
  document.getElementById('about').scrollIntoView({ behavior: 'instant' });
}
window.addEventListener('hashchange', routeLegacyHash);
routeLegacyHash();
