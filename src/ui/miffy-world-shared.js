import { drawMiffy, outlined } from './miffy-shape.js';
import { WARDROBE, getSavedOutfit } from './miffy-wardrobe.js';
import { heartPath } from './miffy-surprise.js';

const INK = '#101010';
const PAPER = '#fafaf6';
const BOOT = '#9a9a93';
// The wardrobe's patterned dresses (drawn in the scene at 1.4×), redrawn for
// these smaller Miffys. Each drawing carries its own copy so it also works
// when exported as a standalone picture.
const DRESS_PATTERNS = {
  stripe: { size: 7, art: `<rect width="7" height="7" fill="${PAPER}"/><rect width="7" height="3.5" fill="${INK}"/>` },
  polka: { size: 9, art: `<rect width="9" height="9" fill="${INK}"/><circle cx="2.25" cy="2.25" r="1.5" fill="${PAPER}"/><circle cx="6.75" cy="6.75" r="1.5" fill="${PAPER}"/>` },
  hearts: { size: 10, art: `<rect width="10" height="10" fill="${PAPER}"/><path d="${heartPath(5, 5.3, 2.5)}" fill="${INK}"/>` },
};

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
/** A solid colour close to Miffy's current outfit, for places too small for a pattern. */
export function getDressColor() {
  const outfit = WARDROBE[getSavedOutfit()];
  return outfit.color.startsWith('#') ? outfit.color : outfit.id === 'hearts' ? PAPER : INK;
}

/**
 * How to paint a dress: `dress` is a solid colour, or leave it out for Miffy's
 * current outfit. Returns the fill and any <defs> the fill needs.
 */
export function dressPaint(dress) {
  if (dress !== undefined) return { fill: /^#[\da-f]{3,8}$/i.test(dress) ? dress : INK, defs: '' };
  const pattern = DRESS_PATTERNS[getSavedOutfit()];
  if (!pattern) return { fill: getDressColor(), defs: '' };
  const id = `wonderDress${++drawingId}`;
  return {
    fill: `url(#${id})`,
    defs: `<defs><pattern id="${id}" width="${pattern.size}" height="${pattern.size}" patternUnits="userSpaceOnUse">${pattern.art}</pattern></defs>`,
  };
}

export function isNight() { return document.getElementById('miffyScene')?.dataset.time === 'night'; }

/** A standing Miffy in a 160 × 240 box, in her current outfit unless `dress` names a colour. */
export function bunnySVG({ dress, pose = 'stand', className = '', boots = false } = {}) {
  const m = drawMiffy(80, 85, .91);
  const paint = dressPaint(dress);
  const safeClass = className.replace(/[^a-zA-Z0-9 _-]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 240" class="wonder-bunny ${safeClass}" aria-hidden="true" focusable="false">${paint.defs}<g stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${boots ? `<path d="M55 192H71V207H55ZM89 192H105V207H89Z" fill="${BOOT}"/>` : ''}<path d="${m.footLeft}${m.footRight}" fill="${boots ? BOOT : PAPER}"/><path d="${m.armLeft}${pose === 'wave' ? m.armRaised : m.armRight}" fill="${PAPER}"/><path d="${m.dress}" fill="${paint.fill}"/>${outlined(m.head, 3, `fill="${PAPER}"`)}${pose === 'sleep' ? `<path d="${m.closedEyes}" fill="none"/>` : m.eyes.map(e => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="${INK}" stroke="none"/>`).join('')}<path d="${m.mouth}" fill="none"/></g></svg>`;
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
