/**
 * Portfolio-Wide Peek-a-boo Scavenger Hunt
 * Hides 4 subtle, interactive mini-Miffys across the portfolio.
 * Finding all 4 unlocks the secret "Rainbow Dream" outfit in the Wardrobe Studio.
 */

import './miffy-hunt.css';

const SPOTS = [
  {
    id: 'hero',
    name: 'Hero Art Frame',
    selector: '.hero-art',
    className: 'miffy-peeker--hero',
    hint: 'Peeking above the Identity Field canvas',
  },
  {
    id: 'about',
    name: 'About Stats',
    selector: '.stats .stat:first-child',
    className: 'miffy-peeker--about',
    hint: 'Resting atop the 4+ Years stat card',
  },
  {
    id: 'experience',
    name: 'Experience Record',
    selector: '.career-row:first-child',
    className: 'miffy-peeker--experience',
    hint: 'Checking out the PwC team row',
  },
  {
    id: 'footer',
    name: 'Footer Clock',
    selector: '.footer__bottom',
    className: 'miffy-peeker--footer',
    hint: 'Tucked in near the bottom copyright',
  },
];

const STORAGE_SPOTS = 'miffy_hunt_spots';
const STORAGE_COMPLETED = 'miffy_hunt_completed';

function getFoundSpots() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SPOTS)) || {};
  } catch {
    return {};
  }
}

function saveFoundSpot(id) {
  const found = getFoundSpots();
  found[id] = true;
  try {
    localStorage.setItem(STORAGE_SPOTS, JSON.stringify(found));
    const allFound = SPOTS.every((s) => found[s.id]);
    if (allFound) {
      localStorage.setItem(STORAGE_COMPLETED, 'true');
    }
  } catch {
    /* ignore */
  }
}

export function initMiffyHunt() {
  const foundSpots = getFoundSpots();

  // Create or retrieve HUD tracker
  let hud = document.getElementById('miffyHuntHud');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'miffyHuntHud';
    hud.className = 'miffy-hunt-hud';
    hud.setAttribute('role', 'region');
    hud.setAttribute('aria-label', 'Miffy Scavenger Hunt progress');
    document.body.appendChild(hud);
  }

  function updateHud() {
    const found = getFoundSpots();
    const count = SPOTS.filter((s) => found[s.id]).length;
    const total = SPOTS.length;
    const allDone = count === total;

    hud.innerHTML = `
      <span class="miffy-hunt-hud__icon" aria-hidden="true">🐰</span>
      <span>MIFFY HUNT: <b class="miffy-hunt-hud__count">${count}</b>/${total}</span>
      ${allDone ? '<span class="miffy-hunt-hud__sparkle" aria-hidden="true">★</span>' : ''}
    `;

    hud.setAttribute('title', allDone ? 'All Miffys found! Rainbow Dress unlocked!' : 'Click to jump to Miffy’s Lab');
    hud.onclick = () => {
      document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' });
    };
  }

  function showCompletionToast() {
    if (document.getElementById('miffyHuntToast')) return;

    const toast = document.createElement('div');
    toast.id = 'miffyHuntToast';
    toast.className = 'miffy-hunt-toast';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <h4><span>🎉</span> You found all 4 Miffys!</h4>
      <p>Congratulations! You’ve unlocked the secret <b>Rainbow Dream</b> dress in Miffy’s Wardrobe Studio in the Lab section below!</p>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.5s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 8000);
  }

  // Inject peeker buttons into each spot
  SPOTS.forEach((spot) => {
    const parent = document.querySelector(spot.selector);
    if (!parent) return;

    // Ensure relative positioning on parent for absolute placement
    const computedPos = window.getComputedStyle(parent).position;
    if (computedPos === 'static') {
      parent.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `miffy-peeker ${spot.className}`;
    btn.setAttribute('aria-label', `Find Miffy at ${spot.name}`);
    btn.dataset.spotId = spot.id;

    const isAlreadyFound = Boolean(foundSpots[spot.id]);
    if (isAlreadyFound) {
      btn.classList.add('is-found');
    }

    btn.innerHTML = `
      <svg viewBox="0 0 100 110" fill="none" stroke="#101010" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <g class="peeker-ears">
          <path d="M32 60 C 26 35, 24 15, 34 8 C 44 2, 50 20, 48 60" fill="#fafaf6" />
          <path d="M52 60 C 50 20, 56 2, 66 8 C 76 15, 74 35, 68 60" fill="#fafaf6" />
        </g>
        <path d="M18 78 C 14 62, 30 60, 50 60 C 70 60, 86 62, 82 78 C 80 94, 68 102, 50 102 C 32 102, 20 94, 18 78 Z" fill="#fafaf6" />
        <ellipse cx="36" cy="78" rx="2.5" ry="3.2" fill="#101010" stroke="none" />
        <ellipse cx="64" cy="78" rx="2.5" ry="3.2" fill="#101010" stroke="none" />
        <path d="M46 86 L 54 94 M 54 86 L 46 94" stroke="#101010" stroke-width="3.5" />
      </svg>
    `;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const currentFound = getFoundSpots();
      const wasFound = currentFound[spot.id];

      // Star burst effect
      const burst = document.createElement('div');
      burst.className = 'peeker-star-burst';
      burst.innerHTML = `
        <svg viewBox="0 0 100 100" fill="none" stroke="#ffbe00" stroke-width="3">
          <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" />
        </svg>
      `;
      btn.appendChild(burst);
      setTimeout(() => burst.remove(), 750);

      if (!wasFound) {
        saveFoundSpot(spot.id);
        btn.classList.add('is-found');
        updateHud();

        const count = SPOTS.filter((s) => getFoundSpots()[s.id]).length;
        if (count === SPOTS.length) {
          showCompletionToast();
          document.dispatchEvent(new CustomEvent('miffy:hunt-complete'));
        }
      }
    });

    parent.appendChild(btn);
  });

  updateHud();
}
