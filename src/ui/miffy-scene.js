import './miffy-scene.css';
import { renderWardrobeStudio } from './miffy-wardrobe.js';
import { createGarden } from './miffy-garden.js';
import { drawMiffy, outlined } from './miffy-shape.js';

const scenes = {
  idle: { caption: 'Just happy to be here.', number: '01', duration: 0 },
  wave: { caption: 'Oh, hello there.', number: '02', duration: 3600 },
  hop: { caption: 'Dancing to a song only she can hear.', number: '03', duration: 6000 },
  nap: { caption: 'A very important little nap.', number: '04', duration: 6200 },
  plane: { caption: 'A little daydream, cleared for takeoff.', number: '05', duration: 7200 },
  ball: { caption: 'Just one more bounce.', number: '06', duration: 6400 },
  peek: { caption: 'Now you see her. Now you almost don’t.', number: '07', duration: 6800 },
  balloon: { caption: 'Some days, you just go with the float.', number: '08', duration: 7200 },
  plant: { caption: 'A little something for the garden.', number: '09', duration: 2600 },
};

// Miffy stands on the floor line at the centre of the 700 × 440 stage.
const miffy = drawMiffy(350, 164, 1.4);

const activities = [
  ['plane', 'Paper plane', '↗'],
  ['ball', 'Play ball', '◒'],
  ['peek', 'Peekaboo', '⊙'],
  ['balloon', 'Float away', '♧'],
  ['hop', 'Little dance', '♫'],
  ['nap', 'Doze off', '☾'],
];

function getISTHour() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === 'hour');
    return hourPart ? parseInt(hourPart.value, 10) : 3;
  } catch {
    return 3;
  }
}

export function initMiffyScene() {
  const scene = document.getElementById('miffyScene');
  if (!scene || scene.dataset.initialized) return;
  scene.dataset.initialized = 'true';
  scene.classList.add('miffy-scene');
  scene.dataset.state = 'idle';
  scene.dataset.motion = 'running';
  scene.dataset.visible = 'false';

  // Determine initial day/night state from live IST hour
  const currentISTHour = getISTHour();
  const isNightInitial = currentISTHour < 6 || currentISTHour >= 19;
  let isNight = isNightInitial;
  scene.dataset.time = isNight ? 'night' : 'day';

  scene.innerHTML = `
    <div class="miffy-scene__stage" id="miffyStage">
      <div class="miffy-scene__corner">
        <span class="miffy-scene__world" aria-hidden="true">MIFFY’S LITTLE WORLD</span>
        <div class="miffy-corner-controls">
          <button type="button" class="miffy-plant-toggle" id="miffyPlant">
            <span id="miffyPlantIcon" aria-hidden="true">✿</span>
            <span id="miffyPlantText">Plant a flower</span>
          </button>
          <button type="button" class="miffy-time-toggle" id="miffyTimeToggle">
            <span id="miffyTimeIcon" aria-hidden="true">${isNight ? '☾' : '☼'}</span>
            <span id="miffyTimeText">${isNight ? 'Night (IST)' : 'Day (IST)'}</span>
          </button>
        </div>
      </div>

      <button type="button" class="miffy-scene__play" id="miffyCharacter" aria-label="Say hello to Miffy">
        <svg class="miffy-scene__drawing" viewBox="0 0 700 440" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="miffyTitle miffyDescription">
          <title id="miffyTitle">Miffy, in her happy place</title>
          <desc id="miffyDescription">Miffy as Dick Bruna drew her: two tall upright ears, a wide round head, two dot eyes, her little cross mouth and a simple dress you can recolour. Choose an adventure below, or tap her to say hello.</desc>

          <defs>
            <!-- Wardrobe: Breton Stripe dress -->
            <pattern id="miffyStripe" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="5" fill="#101010" />
              <rect y="5" width="10" height="5" fill="#fafaf6" />
            </pattern>

            <!-- Wardrobe: secret Polka Dot dress -->
            <pattern id="miffyPolka" width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#101010" />
              <circle cx="3.5" cy="3.5" r="2.4" fill="#fafaf6" />
              <circle cx="10.5" cy="10.5" r="2.4" fill="#fafaf6" />
            </pattern>

            <!-- Night pajamas: the chosen dress colour striped with white -->
            <pattern id="miffyPajamaStripe" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect class="miffy-pajama-stripe" width="6" height="12" />
              <rect x="6" width="6" height="12" fill="#fafaf6" />
            </pattern>
          </defs>

          <!-- Floor & Ground Shadow -->
          <path class="miffy-scene__floor" d="M60 368H640"/>
          <ellipse class="miffy-shadow" cx="350" cy="368" rx="75" ry="5"/>

          <!-- Miffy's Garden: flowers planted by visitors (miffy-garden.js) -->
          <g class="miffy-garden" id="miffyGarden" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"></g>

          <!-- Sun and moon share one group so phones can bring them in from the cropped edge -->
          <g class="miffy-sky">
          <!-- Day: Smiling Sun -->
          <g class="miffy-celestial miffy-sun" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle class="miffy-white" cx="140" cy="110" r="28" />
            <!-- Sun rays -->
            <path d="M140 70V60M140 150V160M90 110H100M180 110H190M105 75L112 82M168 138L175 145M105 145L112 138M168 82L175 75" stroke-width="3" />
            <!-- Smiling Sun face -->
            <ellipse cx="132" cy="107" rx="2" ry="2.5" fill="#101010" stroke="none" />
            <ellipse cx="148" cy="107" rx="2" ry="2.5" fill="#101010" stroke="none" />
            <path d="M134 118Q140 123 146 118" stroke="#101010" stroke-width="2" fill="none" />
          </g>

          <!-- Night: Friendly Crescent Moon & Stars -->
          <g class="miffy-celestial miffy-moon" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path class="miffy-white" d="M152 82C130 84 116 102 118 124C120 144 136 158 156 156C140 152 132 136 134 120C136 104 144 92 152 82Z" />
            <!-- Sleeping Moon eye & smile -->
            <path d="M132 118Q135 122 138 118" stroke="#101010" stroke-width="2" />
            <path d="M133 128Q136 131 140 129" stroke="#101010" stroke-width="1.8" />
          </g>
          </g>

          <g class="miffy-celestial miffy-night-stars" stroke="#f0f0ec" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path class="miffy-wide-only" d="M210 95V105M205 100H215" />
            <path d="M275 130V138M271 134H279" />
            <path class="miffy-wide-only" d="M530 80V90M525 85H535" />
            <path class="miffy-wide-only" d="M580 125V133M576 129H584" />
          </g>

          <!-- Idle Floating Star (Day/Default) -->
          <g class="miffy-star" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M476 132C475 148 471 153 455 154C471 155 475 160 476 176C477 160 482 155 498 154C482 153 477 148 476 132Z"/>
          </g>

          <!-- Sparkles -->
          <g class="miffy-sparkles" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M235 183V197M228 190H242"/>
            <path d="M459 262V272M454 267H464"/>
            <path class="miffy-wide-only" d="M265 118V126M261 122H269"/>
          </g>

          <!-- Paper Plane Trail -->
          <g class="miffy-plane-trail" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 7" stroke-linecap="round" aria-hidden="true">
            <path d="M409 275C520 248 552 116 442 111C368 108 337 160 404 162C453 164 461 135 438 109"/>
          </g>

          <!-- Balloon Activity -->
          <g class="miffy-balloon" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path class="miffy-balloon__string" d="M468 167C464 208 424 229 406 302"/>
            <ellipse class="miffy-white" cx="468" cy="123" rx="29" ry="39"/>
            <path class="miffy-black" d="M466 162L462 169H474L470 162"/>
            <path d="M451 109Q454 99 461 98" stroke-width="2"/>
          </g>

          <!-- The Character: Miffy, after Dick Bruna (shapes in miffy-shape.js) -->
          <g class="miffy-character" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
            <g class="miffy-arm miffy-arm--left"><path class="miffy-white" d="${miffy.armLeft}"/></g>
            <g class="miffy-arm miffy-arm--right"><path class="miffy-white" d="${miffy.armRight}"/></g>
            <g class="miffy-greeting"><path class="miffy-white" d="${miffy.armRaised}"/></g>
            <g class="miffy-feet">
              <path class="miffy-white" d="${miffy.footLeft}"/>
              <path class="miffy-white" d="${miffy.footRight}"/>
            </g>
            <path class="miffy-black miffy-dress" d="${miffy.dress}"/>

            <!-- Optional Cyber Identity Lanyard Badge on Chest -->
            <g class="miffy-cyber-badge" aria-hidden="true">
              <rect x="345" y="286" width="10" height="13" rx="1.5" fill="#fafaf6" stroke="#101010" stroke-width="1.4"/>
              <circle cx="350" cy="289" r="1.5" fill="#101010"/>
              <path d="M350 277 L350 286" stroke="#fafaf6" stroke-width="1.8"/>
            </g>

            <g class="miffy-head">
              ${outlined(miffy.head, 4.5, 'class="miffy-white"')}
              <g class="miffy-eyes miffy-eyes--open" fill="currentColor" stroke="none">
                ${miffy.eyes.map((e) => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}"/>`).join('')}
              </g>
              <g class="miffy-eyes miffy-eyes--closed" stroke-width="2.7">
                <path d="${miffy.closedEyes}"/>
              </g>
              <path d="${miffy.mouth}" stroke-width="2.8"/>
            </g>
          </g>

          <g class="miffy-plane" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" aria-hidden="true">
            <path class="miffy-white" d="M-24 1L29-16L-6 24L-10 7Z"/>
            <path d="M-10 7L29-16M-6 24L1 7"/>
          </g>
          <g class="miffy-ball" stroke="currentColor" stroke-width="3" aria-hidden="true">
            <circle class="miffy-white" r="23"/>
            <path class="miffy-black" d="M0-23A23 23 0 0 1 0 23C-12 13-12-13 0-23Z"/>
            <path d="M-22-7C-9 0 9 0 22-7" stroke-width="1.6"/>
          </g>
          <g class="miffy-peek" aria-hidden="true">
            <path class="miffy-peek-wall" d="M130 300H570V900H130Z"/>
            <path class="miffy-peek-line" d="M205 300H495" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <text class="miffy-boo" x="470" y="290" fill="currentColor">boo.</text>
          </g>
          <g class="miffy-music" fill="currentColor" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M238 230V203L250 199V225M461 263V237L473 234V259"/>
            <ellipse cx="234" cy="231" rx="5" ry="3"/>
            <ellipse cx="246" cy="226" rx="5" ry="3"/>
            <ellipse cx="457" cy="264" rx="5" ry="3"/>
            <ellipse cx="469" cy="260" rx="5" ry="3"/>
          </g>
          <g class="miffy-sleep" fill="currentColor" aria-hidden="true">
            <text x="431" y="209">z</text>
            <text x="449" y="186">z</text>
            <text x="467" y="161">z</text>
          </g>
          <g class="miffy-hop-lines" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M265 342L260 329M438 342L443 329"/>
          </g>
        </svg>
      </button>

      <div class="miffy-scene__footnote" aria-hidden="true">
        <span id="miffyFootnoteText">TAP MIFFY TO SAY HELLO</span>
        <span class="miffy-scene__scene-number">MOMENT <span id="miffyNumber">01</span> / 09</span>
      </div>
    </div>

    <!-- Wardrobe Studio (Dick Bruna Palette Selector) -->
    <div class="miffy-scene__wardrobe" id="miffyWardrobeContainer"></div>

    <!-- Activity Selector Buttons -->
    <div class="miffy-scene__activities" role="group" aria-label="Choose Miffy’s next adventure">
      ${activities
        .map(
          ([key, label, icon]) =>
            `<button type="button" class="miffy-scene__activity" data-miffy-activity="${key}" aria-pressed="false"><span aria-hidden="true">${icon}</span>${label}</button>`
        )
        .join('')}
    </div>

    <!-- Bar with Caption and Motion Controls -->
    <div class="miffy-scene__bar">
      <p id="miffyCaption" class="miffy-scene__caption">${scenes.idle.caption}</p>
      <div class="miffy-scene__actions" aria-label="Play with Miffy">
        <button type="button" id="miffySurprise" class="miffy-scene__action">Surprise me <span aria-hidden="true">✳</span></button>
        <button type="button" id="miffyMotion" class="miffy-scene__motion" aria-label="Pause motion" aria-pressed="false">
          <span class="miffy-scene__motion-icon" aria-hidden="true">Ⅱ</span>
          <span class="miffy-scene__motion-label">Pause</span>
        </button>
      </div>
    </div>
    <p class="miffy-scene__status" id="miffyStatus" role="status" aria-live="polite" aria-atomic="true"></p>
  `;

  const caption = scene.querySelector('#miffyCaption');
  const number = scene.querySelector('#miffyNumber');
  const status = scene.querySelector('#miffyStatus');
  const footnoteText = scene.querySelector('#miffyFootnoteText');
  const timeToggleBtn = scene.querySelector('#miffyTimeToggle');
  const timeIcon = scene.querySelector('#miffyTimeIcon');
  const timeText = scene.querySelector('#miffyTimeText');
  const motionButton = scene.querySelector('#miffyMotion');
  const motionIcon = motionButton.querySelector('.miffy-scene__motion-icon');
  const motionLabel = motionButton.querySelector('.miffy-scene__motion-label');
  const wardrobeContainer = scene.querySelector('#miffyWardrobeContainer');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let userPaused = false;
  let inView = false;
  let idleTimer;
  let actionTimer;
  let state = 'idle';
  let lastActivity = 'idle';
  let activityBag = [];
  const activityButtons = [...scene.querySelectorAll('[data-miffy-activity]')];

  // Initialize Wardrobe Studio
  renderWardrobeStudio(wardrobeContainer);

  // Miffy's Garden
  const garden = createGarden(scene.querySelector('#miffyGarden'));
  const plantButton = scene.querySelector('#miffyPlant');
  const plantIcon = plantButton.querySelector('#miffyPlantIcon');
  const plantText = plantButton.querySelector('#miffyPlantText');

  function updatePlantButton() {
    plantIcon.textContent = garden.isFull ? '↺' : '✿';
    plantText.textContent = garden.isFull ? 'New garden' : 'Plant a flower';
  }
  updatePlantButton();

  function updateTimeMode() {
    scene.dataset.time = isNight ? 'night' : 'day';
    timeIcon.textContent = isNight ? '☾' : '☼';
    timeText.textContent = isNight ? 'Night (IST)' : 'Day (IST)';
    timeToggleBtn.setAttribute('aria-label', `${timeText.textContent}: switch to ${isNight ? 'day' : 'night'}`);

    if (state === 'idle') {
      caption.textContent = isNight
        ? 'Sleeping under the stars. Shh… z z z'
        : scenes.idle.caption;
      footnoteText.textContent = isNight
        ? 'TAP SLEEPY MIFFY TO GENTLY WAKE HER'
        : 'TAP MIFFY TO SAY HELLO';
    }
  }
  updateTimeMode();

  timeToggleBtn.addEventListener('click', () => {
    isNight = !isNight;
    updateTimeMode();
  });

  function canAnimate() {
    return !userPaused && !reducedMotion.matches && inView && !document.hidden;
  }

  function clearTimers() {
    window.clearTimeout(idleTimer);
    window.clearTimeout(actionTimer);
    idleTimer = undefined;
    actionTimer = undefined;
  }

  const STANDARD_ACTIVITIES = ['wave', 'hop', 'nap', 'plane', 'ball', 'peek', 'balloon'];

  function chooseScene() {
    if (!activityBag.length) {
      activityBag = STANDARD_ACTIVITIES.slice();
    }
    let options = activityBag.filter((option) => option !== lastActivity);
    if (!options.length) {
      options = STANDARD_ACTIVITIES.filter((key) => key !== lastActivity);
    }
    return options[Math.floor(Math.random() * options.length)];
  }

  function scheduleIdle() {
    window.clearTimeout(idleTimer);
    if (!canAnimate()) return;
    idleTimer = window.setTimeout(() => setScene(chooseScene()), 8000 + Math.random() * 4000);
  }

  function scheduleReturn() {
    if (!canAnimate() || state === 'idle') return;
    actionTimer = window.setTimeout(() => setScene('idle'), scenes[state].duration);
  }

  function setScene(next, userInitiated = false) {
    clearTimers();
    state = next;
    if (next !== 'idle') {
      lastActivity = next;
      activityBag = activityBag.filter((key) => key !== next);
    }

    scene.dataset.state = 'idle';
    void scene.offsetWidth;
    scene.dataset.state = state;

    if (state === 'idle' && isNight) {
      caption.textContent = 'Sleeping under the stars. Shh… z z z';
    } else {
      caption.textContent = scenes[state].caption;
    }

    number.textContent = scenes[state].number;
    activityButtons.forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.miffyActivity === state))
    );

    if (userInitiated) status.textContent = caption.textContent;
    if (state === 'idle') scheduleIdle();
    else scheduleReturn();
  }

  function updateMotion() {
    clearTimers();
    const reduced = reducedMotion.matches;
    scene.dataset.motion = reduced ? 'reduced' : userPaused ? 'paused' : 'running';
    scene.dataset.visible = String(inView && !document.hidden);
    motionButton.disabled = reduced;
    motionButton.setAttribute('aria-pressed', String(userPaused || reduced));
    motionButton.setAttribute(
      'aria-label',
      reduced ? 'Motion reduced by your device' : userPaused ? 'Resume motion' : 'Pause motion'
    );
    motionIcon.textContent = userPaused || reduced ? '▷' : 'Ⅱ';
    motionLabel.textContent = reduced ? 'Still mode' : userPaused ? 'Resume' : 'Pause';
    if (state === 'idle') scheduleIdle();
    else scheduleReturn();
  }

  // Tapping Miffy
  scene.querySelector('#miffyCharacter').addEventListener('click', () => {
    if (isNight && state === 'idle') {
      setScene('wave', true);
      caption.textContent = 'Sleepy Miffy woke up to say hello from Gurugram.';
      status.textContent = caption.textContent;
    } else {
      setScene('wave', true);
    }
  });

  activityButtons.forEach((button) =>
    button.addEventListener('click', () => setScene(button.dataset.miffyActivity, true))
  );

  scene.querySelector('#miffySurprise').addEventListener('click', () => setScene(chooseScene(), true));

  plantButton.addEventListener('click', () => {
    if (garden.isFull) {
      garden.clear();
      setScene('idle', true);
      caption.textContent = 'Fresh soil, ready for new flowers.';
    } else {
      const flower = garden.plant();
      // Miffy turns to look at her new flower.
      scene.style.setProperty('--miffy-look', `${flower.side * 7}deg`);
      setScene('plant', true);
      caption.textContent = isNight ? `A sleepy ${flower.name}, tucked in for the night.` : flower.line;
      if (garden.isFull) caption.textContent += ' The garden is full, and Miffy is very proud.';
    }
    status.textContent = caption.textContent;
    updatePlantButton();
  });

  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    updateMotion();
    status.textContent = userPaused
      ? 'Taking a quiet moment. Motion paused.'
      : 'Back to a little fun. Motion resumed.';
  });

  // Listen for paper plane message delivery from Contact Form
  document.addEventListener('miffy:deliver-message', (e) => {
    setScene('plane', true);
    const sender = e.detail?.name ? `${e.detail.name}’s` : 'your';
    caption.textContent = `Paper Plane Express: launching ${sender} message to Nikhil’s inbox.`;
    status.textContent = caption.textContent;
  });

  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const nextVisibility = entries[0].isIntersecting;
        if (inView === nextVisibility) return;
        inView = nextVisibility;
        updateMotion();
      },
      { threshold: 0.15 }
    );
    observer.observe(scene);
  } else {
    inView = true;
  }
  updateMotion();
}
