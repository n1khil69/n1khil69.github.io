/**
 * Miffy's Wardrobe & Colorway Studio
 * Dick Bruna's iconic color palette: Cobalt Blue, Canary Yellow, Poppy Red, Meadow Green,
 * Classic Obsidian/Ink, Cyber Identity Agent, and the secret Rainbow Dream.
 */

export const WARDROBE = {
  ink: {
    id: 'ink',
    name: 'Editorial Ink',
    color: '#101010',
    accent: '#333332',
    label: 'Classic',
  },
  blue: {
    id: 'blue',
    name: 'Bruna Blue',
    color: '#004d9c',
    accent: '#004d9c',
    label: 'Cobalt',
  },
  yellow: {
    id: 'yellow',
    name: 'Bruna Yellow',
    color: '#fec200',
    accent: '#fec200',
    label: 'Canary',
  },
  red: {
    id: 'red',
    name: 'Bruna Red',
    color: '#de2b18',
    accent: '#de2b18',
    label: 'Poppy',
  },
  green: {
    id: 'green',
    name: 'Bruna Green',
    color: '#007a3d',
    accent: '#007a3d',
    label: 'Meadow',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Identity',
    color: '#161922',
    accent: '#ffb44d',
    label: 'PwC Amber',
    isCyber: true,
  },
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow Dream',
    color: 'url(#miffyRainbowGrad)',
    accent: '#ff79c0',
    label: 'Rainbow',
    secret: true,
  },
};

const STORAGE_KEY = 'miffy_wardrobe_outfit';

export function getSavedOutfit() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'ink';
  } catch {
    return 'ink';
  }
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
  const root = document.documentElement;

  // Set Miffy dress fill variable
  root.style.setProperty('--miffy-dress-color', outfit.color);
  root.style.setProperty('--miffy-accent', outfit.accent);

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
  const isRainbowUnlocked = localStorage.getItem('miffy_hunt_completed') === 'true';

  const outfitsToShow = Object.values(WARDROBE).filter(
    (o) => !o.secret || isRainbowUnlocked
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
            const style = o.id === 'rainbow'
              ? 'background: linear-gradient(135deg, #de2b18, #fec200, #007a3d, #004d9c);'
              : `background: ${o.color};`;
            return `
            <button
              type="button"
              class="miffy-swatch ${isSelected ? 'is-active' : ''}"
              data-outfit="${o.id}"
              aria-label="${o.name} outfit"
              aria-pressed="${isSelected}"
              title="${o.name}"
              style="${style}"
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

  // Listen for unlock events from the scavenger hunt
  document.addEventListener('miffy:hunt-complete', () => {
    renderWardrobeStudio(container);
  });
}
