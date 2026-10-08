import { drawMiffy, outlined } from './miffy-shape.js';
import { WARDROBE, getSavedOutfit } from './miffy-wardrobe.js';

const discoveries = new Set();
const dialogOpeners = new WeakMap();
let drawingId = 0;
try {
  const saved = JSON.parse(localStorage.getItem('miffy_wonder_discoveries') || '[]');
  if (Array.isArray(saved)) saved.filter(x => typeof x === 'string').forEach(x => discoveries.add(x));
} catch { /* A private visit still gets the whole world. */ }

export function getDiscoveries() { return [...discoveries]; }
export function discover(id) {
  if (discoveries.has(id)) return;
  discoveries.add(id);
  try { localStorage.setItem('miffy_wonder_discoveries', JSON.stringify([...discoveries])); } catch { /* optional persistence */ }
  document.dispatchEvent(new CustomEvent('miffy:discovery', { detail: { id, discoveries: [...discoveries] } }));
}
export function getDressColor() {
  const color = (WARDROBE[getSavedOutfit()] || WARDROBE.ink).color;
  return color.startsWith('#') ? color : '#c480a6';
}
export function isNight() {
  const preference = document.documentElement.dataset.miffyTime;
  if (preference) return preference === 'night';
  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
  return hour >= 19 || hour < 6;
}
export function setNight(night) {
  document.documentElement.dataset.miffyTime = night ? 'night' : 'day';
  document.dispatchEvent(new CustomEvent('miffy:time-change'));
}

export function bunnySVG({ dress = getDressColor(), pose = 'stand', className = '', boots = false } = {}) {
  const m = drawMiffy(80, 85, .91);
  const rainbow = getSavedOutfit() === 'rainbow' && dress === getDressColor();
  const gradientId = `wonderRainbow${++drawingId}`;
  const gradient = rainbow ? `<defs><linearGradient id="${gradientId}" x2="1" y2="1"><stop stop-color="#de2b18"/><stop offset=".33" stop-color="#fec200"/><stop offset=".66" stop-color="#007a3d"/><stop offset="1" stop-color="#004d9c"/></linearGradient></defs>` : '';
  const paint = rainbow ? `url(#${gradientId})` : /^#[\da-f]{3,8}$/i.test(dress) ? dress : '#101010';
  const safeClass = className.replace(/[^a-zA-Z0-9 _-]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 240" class="wonder-bunny ${safeClass}" aria-hidden="true" focusable="false">${gradient}<g stroke="#26251f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${boots ? '<path d="M55 192H71V207H55ZM89 192H105V207H89Z" fill="#e6b74f"/>' : ''}<path d="${m.footLeft}${m.footRight}" fill="${boots ? '#e6b74f' : '#fffdf5'}"/><path d="${m.armLeft}${pose === 'wave' ? m.armRaised : m.armRight}" fill="#fffdf5"/><path d="${m.dress}" fill="${paint}"/>${outlined(m.head, 3, 'fill="#fffdf5"')}${pose === 'sleep' ? `<path d="${m.closedEyes}" fill="none"/>` : m.eyes.map(e => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="#26251f" stroke="none"/>`).join('')}<path d="${m.mouth}" fill="none"/></g></svg>`;
}

export function makeDialog(id, title, content) {
  const dialog = document.createElement('dialog');
  dialog.id = id;
  dialog.className = 'wonder-dialog';
  dialog.setAttribute('aria-labelledby', `${id}Title`);
  dialog.innerHTML = `<header class="wonder-dialog__header"><div><span class="wonder-eyebrow">A LITTLE WORLD / MIFFY & YOU</span><h2 id="${id}Title">${title}</h2></div><button type="button" class="wonder-dialog__close" data-wonder-close aria-label="Close ${title}">Close <span aria-hidden="true">×</span></button></header><div class="wonder-dialog__body">${content}</div>`;
  document.body.append(dialog);
  const nativeOpen = dialog.showModal.bind(dialog);
  dialog.showModal = () => {
    if (dialog.open) return;
    const active = document.activeElement;
    const outgoing = active?.closest('dialog.wonder-dialog');
    dialogOpeners.set(dialog, outgoing ? dialogOpeners.get(outgoing) : active);
    document.querySelectorAll('dialog.wonder-dialog[open]').forEach(other => other.close());
    nativeOpen();
    document.body.classList.add('wonder-modal-open');
  };
  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-wonder-close]')) dialog.close();
    if (event.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    if (!dialog.open && !document.querySelector('dialog.wonder-dialog[open]')) {
      document.body.classList.remove('wonder-modal-open');
      const target = dialogOpeners.get(dialog);
      if (target?.isConnected && !target.closest('[hidden], [inert], dialog:not([open])') && target.getClientRects().length) {
        target.focus({ preventScroll: true });
      } else {
        document.querySelector('#miffyWorldMap button')?.focus({ preventScroll: true });
      }
    }
  });
  return dialog;
}
