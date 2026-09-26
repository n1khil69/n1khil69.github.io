/**
 * Miffy's Wardrobe Studio
 * A monochrome wardrobe that matches the site: ink, graphite, stone and paper
 * tones, a Breton stripe, the Cyber Identity outfit with its lanyard badge, and
 * two secret dresses: Polka Dot, unlocked by the scavenger hunt, and
 * Sanguuuu's Hearts, unlocked by the hidden surprise (miffy-surprise.js).
 * Patterned dresses are SVG patterns defined in the Miffy scene.
 */

export const WARDROBE = {
  ink: {
    id: 'ink',
    name: 'Editorial Ink',
    color: '#101010',
  },
  graphite: {
    id: 'graphite',
    name: 'Graphite',
    color: '#4a4a46',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    color: '#9a9a93',
  },
  paper: {
    id: 'paper',
    name: 'Paper White',
    color: '#fafaf6',
  },
  stripe: {
    id: 'stripe',
    name: 'Breton Stripe',
    color: 'url(#miffyStripe)',
    swatch: 'repeating-linear-gradient(180deg, #101010 0 3px, #fafaf6 3px 6px)',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Identity',
    color: '#262625',
    isCyber: true,
  },
  polka: {
    id: 'polka',
    name: 'Polka Dot',
    color: 'url(#miffyPolka)',
    swatch: 'radial-gradient(#fafaf6 1.5px, transparent 2px) 0 0 / 7px 7px, #101010',
    unlock: 'miffy_hunt_completed',
  },
  hearts: {
    id: 'hearts',
    name: 'Sanguuuu’s Hearts',
    color: 'url(#miffyHearts)',
    swatch: "#fafaf6 url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22%3E%3Cpath d=%22M8 11.7C3.2 8.5 3.6 4.7 5.8 4.7C7 4.7 8 5.5 8 6.5C8 5.5 9 4.7 10.2 4.7C12.4 4.7 12.8 8.5 8 11.7Z%22 fill=%22%23101010%22/%3E%3C/svg%3E') center / 10px 10px",
    unlock: 'miffy_sanguuuu_surprise',
  },
};

// Secret dresses unlocked during this visit, for browsers that block storage.
const unlockedNow = new Set();
let listening = false;

const STORAGE_KEY = 'miffy_wardrobe_outfit';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function isUnlocked(outfit) {
  return !outfit.unlock || unlockedNow.has(outfit.id) || readStorage(outfit.unlock) === 'true';
}

/** Unlock a secret dress, for this visit and (where storage allows) for good. */
export function unlockOutfit(id) {
  const outfit = WARDROBE[id];
  if (!outfit?.unlock) return;
  unlockedNow.add(id);
  try {
    localStorage.setItem(outfit.unlock, 'true');
  } catch {
    /* unlocked for this visit only */
  }
}

export function getSavedOutfit() {
  const saved = readStorage(STORAGE_KEY);
  return WARDROBE[saved] ? saved : 'ink';
}

export function saveOutfit(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function applyOutfit(id, notify = true) {
  const outfit = WARDROBE[id] || WARDROBE.ink;

  // Set Miffy dress fill variable
  document.documentElement.style.setProperty('--miffy-dress-color', outfit.color);

  // Toggle cyber badge visibility class if applicable
  const character = document.querySelector('.miffy-character');
  if (character) {
    character.classList.toggle('miffy-character--cyber', Boolean(outfit.isCyber));
  }

  saveOutfit(outfit.id);

  if (notify) {
    document.dispatchEvent(new CustomEvent('miffy:outfit-change', { detail: outfit }));
  }
}

export function renderWardrobeStudio(container, preferredOutfit) {
  if (!container) return;

  const currentOutfitId = WARDROBE[preferredOutfit] ? preferredOutfit : getSavedOutfit();
  const outfitsToShow = Object.values(WARDROBE).filter(isUnlocked);

  container.innerHTML = `
    <div class="miffy-wardrobe" role="group" aria-label="Miffy's Wardrobe">
      <span class="miffy-wardrobe__title">
        <span class="miffy-wardrobe__icon" aria-hidden="true">⚲</span> WARDROBE:
      </span>
      <div class="miffy-wardrobe__swatches">
        ${outfitsToShow
          .map((o) => {
            const isSelected = o.id === currentOutfitId;
            return `
            <button
              type="button"
              class="miffy-swatch ${isSelected ? 'is-active' : ''}"
              data-outfit="${o.id}"
              aria-label="${o.name} outfit"
              aria-pressed="${isSelected}"
              title="${o.name}"
              style="background: ${o.swatch || o.color};"
            >
              <span class="miffy-swatch__check" aria-hidden="true">✓</span>
            </button>
          `;
          })
          .join('')}
      </div>
      <span class="miffy-wardrobe__label" id="miffyWardrobeLabel">
        ${(WARDROBE[currentOutfitId] || WARDROBE.ink).name}
      </span>
    </div>
  `;

  const labelEl = container.querySelector('#miffyWardrobeLabel');
  const buttons = container.querySelectorAll('.miffy-swatch');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const outfitId = btn.dataset.outfit;
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      const outfit = WARDROBE[outfitId];
      if (outfit && labelEl) {
        labelEl.textContent = outfit.name;
      }
      applyOutfit(outfitId);
    });
  });

  // Apply on load
  applyOutfit(currentOutfitId, false);

  // Show a secret dress as soon as it's unlocked; the surprise also puts it on.
  if (!listening) {
    listening = true;
    document.addEventListener('miffy:hunt-complete', () => renderWardrobeStudio(container));
    document.addEventListener('miffy:surprise', (event) => renderWardrobeStudio(container, event.detail?.outfit));
  }
}
