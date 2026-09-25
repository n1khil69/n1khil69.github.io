/**
 * Miffy's Wardrobe Studio
 * A monochrome wardrobe that matches the site: ink, graphite, stone and paper
 * tones, a Breton stripe, the Cyber Identity outfit with its lanyard badge, and
 * the secret Polka Dot dress unlocked by the scavenger hunt. Patterned dresses
 * are SVG patterns defined in the Miffy scene.
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
    secret: true,
  },
};

const STORAGE_KEY = 'miffy_wardrobe_outfit';

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
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

export function renderWardrobeStudio(container) {
  if (!container) return;

  const currentOutfitId = getSavedOutfit();
  const isSecretUnlocked = readStorage('miffy_hunt_completed') === 'true';

  const outfitsToShow = Object.values(WARDROBE).filter(
    (o) => !o.secret || isSecretUnlocked
  );

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

  // Show the secret dress once the scavenger hunt is complete.
  if (!isSecretUnlocked) {
    document.addEventListener('miffy:hunt-complete', () => renderWardrobeStudio(container), { once: true });
  }
}
