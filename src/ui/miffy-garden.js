/**
 * Miffy's Garden: visitors plant little Bruna-style flowers along the floor of
 * the scene, one per press, until the bed is full. Each visitor's garden is
 * kept in localStorage. Flowers sway when Miffy dances and nod off at night
 * (both in miffy-scene.css).
 */

const STORAGE_KEY = 'miffy_garden';
const FLOOR = 368;
// Beds either side of Miffy, nearest first, inside the part of the scene a phone shows.
const SLOTS = [262, 438, 226, 474, 190, 510];

const white = 'class="miffy-white"';
const ink = 'fill="currentColor" stroke="none"';

function starPoints(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

// Each flower grows up from (0, 0) on the floor; its head is grouped so it can nod off at night.
const FLOWERS = {
  tulip: {
    name: 'tulip',
    line: 'A tulip! Miffy’s garden is growing.',
    art: `<path d="M0 0V-30"/>
      <path ${white} d="M0 -8C7 -11 11 -18 10 -25C4 -22 1 -16 0 -11Z"/>
      <g class="miffy-flower__head"><path ${white} d="M-8 -30C-10 -38 -9 -45 -7 -48L-3 -43L0 -49L3 -43L7 -48C9 -45 10 -38 8 -30C4 -26 -4 -26 -8 -30Z"/></g>`,
  },
  daisy: {
    name: 'daisy',
    line: 'A daisy, just for Miffy.',
    art: `<path d="M0 0V-32"/>
      <path ${white} d="M0 -9C-7 -12 -11 -18 -10 -24C-4 -21 -1 -16 0 -12Z"/>
      <g class="miffy-flower__head">${Array.from({ length: 8 }, (_, i) =>
        `<ellipse ${white} cx="0" cy="-46.5" rx="2.8" ry="6" transform="rotate(${i * 45} 0 -40)"/>`
      ).join('')}<circle ${ink} cx="0" cy="-40" r="3.6"/></g>`,
  },
  pompom: {
    name: 'pom-pom flower',
    line: 'A pom-pom flower, round as a button.',
    art: `<path d="M0 0V-32"/>
      <path ${white} d="M0 -8C7 -11 11 -18 10 -25C4 -22 1 -16 0 -11Z"/>
      <g class="miffy-flower__head"><circle ${ink} cx="0" cy="-40" r="9"/>
      <circle class="miffy-white" stroke="none" cx="-3.2" cy="-43.2" r="1.7"/></g>`,
  },
  bell: {
    name: 'bellflower',
    line: 'A bellflower that rings very, very quietly.',
    art: `<path d="M0 0C0 -22 2 -36 10 -40"/>
      <path ${white} d="M0 -9C-7 -12 -11 -18 -10 -24C-4 -21 -1 -16 0 -12Z"/>
      <g class="miffy-flower__head"><path ${white} d="M5 -39C4 -33 5 -29 3 -26H17C15 -29 16 -33 15 -39C13 -42 7 -42 5 -39Z"/>
      <circle ${ink} cx="10" cy="-23.5" r="1.7"/></g>`,
  },
  star: {
    name: 'star flower',
    line: 'A star flower, fallen from last night’s sky.',
    art: `<path d="M0 0V-31"/>
      <path ${white} d="M0 -8C7 -11 11 -18 10 -25C4 -22 1 -16 0 -11Z"/>
      <g class="miffy-flower__head"><polygon ${white} points="${starPoints(0, -40, 10, 4.4)}"/>
      <circle ${ink} cx="0" cy="-40" r="1.8"/></g>`,
  },
};
const TYPES = Object.keys(FLOWERS);

// A little burst around a new flower's head
const POP = '<g class="miffy-flower__pop"><path d="M-14 -50L-18 -54M14 -50L18 -54M0 -60V-65M-16 -38H-21M16 -38H21"/></g>';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.filter((type) => FLOWERS[type]).slice(0, SLOTS.length) : [];
  } catch {
    return [];
  }
}

function save(beds) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beds));
  } catch {
    /* the garden simply won't be remembered */
  }
}

function flowerMarkup(type, slot, isNew) {
  return `<g class="miffy-flower${isNew ? ' is-new' : ''}" transform="translate(${SLOTS[slot]} ${FLOOR}) scale(1.3)">
    <g class="miffy-flower__grow">${FLOWERS[type].art}${isNew ? POP : ''}</g>
  </g>`;
}

/** Manage the flowers drawn into `layer`, an SVG group in the scene. */
export function createGarden(layer) {
  let beds = load();
  let clearing;
  layer.innerHTML = beds.map((type, slot) => flowerMarkup(type, slot, false)).join('');

  function finishClearing() {
    window.clearTimeout(clearing);
    clearing = undefined;
    layer.innerHTML = '';
    layer.classList.remove('is-clearing');
  }

  return {
    get isFull() {
      return beds.length >= SLOTS.length;
    },

    /** Plant the next flower. Returns its name, caption line and side of Miffy (-1 left, 1 right). */
    plant() {
      if (beds.length >= SLOTS.length) return null;
      if (clearing) finishClearing();
      const previous = beds[beds.length - 1];
      const choices = TYPES.filter((type) => type !== previous);
      const type = choices[Math.floor(Math.random() * choices.length)];
      const slot = beds.length;
      beds = [...beds, type];
      save(beds);
      layer.insertAdjacentHTML('beforeend', flowerMarkup(type, slot, true));
      const flower = layer.lastElementChild;
      window.setTimeout(() => flower.classList.remove('is-new'), 1200);
      return { ...FLOWERS[type], side: SLOTS[slot] < 350 ? -1 : 1 };
    },

    /** Clear the bed, letting the flowers shrink away first. */
    clear() {
      beds = [];
      save(beds);
      layer.classList.add('is-clearing');
      clearing = window.setTimeout(finishClearing, 450);
    },
  };
}
