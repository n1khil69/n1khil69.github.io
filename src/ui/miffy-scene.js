import './miffy-scene.css';

const scenes = {
  idle: { caption: 'Just happy to be here.', number: '01', duration: 0 },
  wave: { caption: 'Oh, hello there.', number: '02', duration: 3600 },
  hop: { caption: 'Dancing to a song only she can hear.', number: '03', duration: 6000 },
  nap: { caption: 'A very important little nap.', number: '04', duration: 6200 },
  plane: { caption: 'A little daydream, cleared for takeoff.', number: '05', duration: 7200 },
  ball: { caption: 'Just one more bounce.', number: '06', duration: 6400 },
  peek: { caption: 'Now you see her. Now you almost don’t.', number: '07', duration: 6800 },
  balloon: { caption: 'Some days, you just go with the float.', number: '08', duration: 7200 },
};

const activities = [
  ['plane', 'Paper plane', '↗'], ['ball', 'Play ball', '◒'],
  ['peek', 'Peekaboo', '⊙'], ['balloon', 'Float away', '♧'],
  ['hop', 'Little dance', '♫'], ['nap', 'Doze off', '☾'],
];

export function initMiffyScene() {
  const scene = document.getElementById('miffyScene');
  if (!scene || scene.dataset.initialized) return;
  scene.dataset.initialized = 'true';
  scene.classList.add('miffy-scene');
  scene.dataset.state = 'idle';
  scene.dataset.motion = 'running';
  scene.dataset.visible = 'false';
  scene.innerHTML = `
    <div class="miffy-scene__stage">
      <div class="miffy-scene__corner" aria-hidden="true"><span>MIFFY’S LITTLE WORLD</span><span>NOTHING URGENT HERE.</span></div>
      <button type="button" class="miffy-scene__play" id="miffyCharacter" aria-label="Say hello to Miffy">
        <svg class="miffy-scene__drawing" viewBox="0 0 700 440" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="miffyTitle miffyDescription">
          <title id="miffyTitle">Miffy, in her happy place</title>
          <desc id="miffyDescription">Miffy with gently curved ears, round cheeks, tiny dot eyes, her little cross-mouth and a black dress. Choose an adventure below, or tap her to say hello.</desc>
          <path class="miffy-scene__floor" d="M60 368H640"/>
          <ellipse class="miffy-shadow" cx="350" cy="368" rx="75" ry="5"/>
          <g class="miffy-star" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M476 132C475 148 471 153 455 154C471 155 475 160 476 176C477 160 482 155 498 154C482 153 477 148 476 132Z"/>
          </g>
          <g class="miffy-sparkles" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M235 183V197M228 190H242"/>
            <path d="M459 262V272M454 267H464"/>
            <path d="M265 118V126M261 122H269"/>
          </g>
          <g class="miffy-plane-trail" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 7" stroke-linecap="round" aria-hidden="true"><path d="M409 275C520 248 552 116 442 111C368 108 337 160 404 162C453 164 461 135 438 109"/></g>
          <g class="miffy-balloon" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path class="miffy-balloon__string" d="M468 167C464 208 424 229 407 292"/><ellipse class="miffy-white" cx="468" cy="123" rx="29" ry="39"/><path class="miffy-black" d="M466 162L462 169H474L470 162"/><path d="M451 109Q454 99 461 98" stroke-width="2"/></g>
          <g class="miffy-character" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
            <g class="miffy-feet">
              <path class="miffy-white" d="M316 337C306 341 303 350 305 357C310 364 331 366 341 361L342 337Z"/>
              <path class="miffy-white" d="M358 337L359 361C370 366 390 364 395 357C397 350 394 341 384 337Z"/>
            </g>
            <g class="miffy-arm miffy-arm--left">
              <path class="miffy-white" d="M294 285C284 287 275 296 278 304C280 313 290 315 297 309L307 297Z"/>
              <path class="miffy-black" d="M315 259C305 263 291 275 286 286L303 301L326 273Z"/>
            </g>
            <g class="miffy-arm miffy-arm--right">
              <path class="miffy-white" d="M406 285C416 287 425 296 422 304C420 313 410 315 403 309L393 297Z"/>
              <path class="miffy-black" d="M385 259C395 263 409 275 414 286L397 301L374 273Z"/>
            </g>
            <path class="miffy-black miffy-dress" d="M315 255Q350 263 385 255L403 337Q352 349 297 337Z"/>
            <g class="miffy-head">
              <path class="miffy-white" d="M304 163C297 146 288 111 295 87C301 65 313 64 322 83C333 105 341 133 346 154Q350 153 354 154C357 131 362 102 375 81C386 63 397 69 401 90C407 114 399 145 392 163C410 176 423 195 423 217C423 247 396 265 351 265C307 265 278 248 277 220C275 197 286 177 304 163Z"/>
              <g class="miffy-eyes miffy-eyes--open" fill="currentColor" stroke="none"><ellipse cx="321" cy="219" rx="2.8" ry="3.4"/><ellipse cx="379" cy="219" rx="2.8" ry="3.4"/></g>
              <g class="miffy-eyes miffy-eyes--closed" stroke-width="2.7"><path d="M317 219Q321 223 325 219M375 219Q379 223 383 219"/></g>
              <path d="M346 240L354 247M354 240L346 247" stroke-width="2.8"/>
            </g>
            <g class="miffy-greeting"><path class="miffy-black" d="M391 273L404 249L423 259L412 284Z"/><path class="miffy-white" d="M405 248C401 239 405 229 413 228C422 227 431 239 431 246C431 254 422 259 416 255Z"/></g>
          </g>
          <g class="miffy-plane" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" aria-hidden="true"><path class="miffy-white" d="M-24 1L29-16L-6 24L-10 7Z"/><path d="M-10 7L29-16M-6 24L1 7"/></g>
          <g class="miffy-ball" stroke="currentColor" stroke-width="3" aria-hidden="true"><circle class="miffy-white" r="23"/><path class="miffy-black" d="M0-23A23 23 0 0 1 0 23C-12 13-12-13 0-23Z"/><path d="M-22-7C-9 0 9 0 22-7" stroke-width="1.6"/></g>
          <g class="miffy-peek" aria-hidden="true"><path d="M130 300H570V440H130Z" fill="var(--miffy-paper)"/><path d="M205 300H495" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text class="miffy-boo" x="449" y="285" fill="currentColor">boo.</text></g>
          <g class="miffy-music" fill="currentColor" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M238 230V203L250 199V225M461 263V237L473 234V259"/><ellipse cx="234" cy="231" rx="5" ry="3"/><ellipse cx="246" cy="226" rx="5" ry="3"/><ellipse cx="457" cy="264" rx="5" ry="3"/><ellipse cx="469" cy="260" rx="5" ry="3"/></g>
          <g class="miffy-sleep" fill="currentColor" aria-hidden="true"><text x="431" y="209">z</text><text x="449" y="186">z</text><text x="467" y="161">z</text></g>
          <g class="miffy-hop-lines" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M265 342L260 329M438 342L443 329"/></g>
        </svg>
      </button>
      <div class="miffy-scene__footnote" aria-hidden="true"><span>TAP MIFFY TO SAY HELLO</span><span class="miffy-scene__scene-number">MOMENT <span id="miffyNumber">01</span> / 08</span></div>
    </div>
    <div class="miffy-scene__activities" role="group" aria-label="Choose Miffy’s next adventure">${activities.map(([key, label, icon]) => `<button type="button" class="miffy-scene__activity" data-miffy-activity="${key}" aria-pressed="false"><span aria-hidden="true">${icon}</span>${label}</button>`).join('')}</div>
    <div class="miffy-scene__bar">
      <p id="miffyCaption" class="miffy-scene__caption">${scenes.idle.caption}</p>
      <div class="miffy-scene__actions" aria-label="Play with Miffy">
        <button type="button" id="miffySurprise" class="miffy-scene__action">Surprise me <span aria-hidden="true">✳</span></button>
        <button type="button" id="miffyMotion" class="miffy-scene__motion" aria-label="Pause motion" aria-pressed="false"><span class="miffy-scene__motion-icon" aria-hidden="true">Ⅱ</span><span class="miffy-scene__motion-label">Pause</span></button>
      </div>
    </div>
    <p class="miffy-scene__status" id="miffyStatus" role="status" aria-live="polite" aria-atomic="true"></p>
  `;

  const caption = scene.querySelector('#miffyCaption');
  const number = scene.querySelector('#miffyNumber');
  const status = scene.querySelector('#miffyStatus');
  const motionButton = scene.querySelector('#miffyMotion');
  const motionIcon = motionButton.querySelector('.miffy-scene__motion-icon');
  const motionLabel = motionButton.querySelector('.miffy-scene__motion-label');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  let inView = false;
  let idleTimer;
  let actionTimer;
  let state = 'idle';
  let lastActivity = 'idle';
  let activityBag = [];
  const activityButtons = [...scene.querySelectorAll('[data-miffy-activity]')];

  function canAnimate() {
    return !userPaused && !reducedMotion.matches && inView && !document.hidden;
  }

  function clearTimers() {
    window.clearTimeout(idleTimer);
    window.clearTimeout(actionTimer);
    idleTimer = undefined;
    actionTimer = undefined;
  }

  function chooseScene() {
    if (!activityBag.length) activityBag = Object.keys(scenes).filter(key => key !== 'idle');
    let options = activityBag.filter(option => option !== lastActivity);
    if (!options.length) options = Object.keys(scenes).filter(key => key !== 'idle' && key !== lastActivity);
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
      activityBag = activityBag.filter(key => key !== next);
    }
    // A repeated hello deserves a fresh wave, including on touch screens.
    scene.dataset.state = 'idle';
    void scene.offsetWidth;
    scene.dataset.state = state;
    caption.textContent = scenes[state].caption;
    number.textContent = scenes[state].number;
    activityButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.miffyActivity === state)));
    if (userInitiated) status.textContent = scenes[state].caption;
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
    motionButton.setAttribute('aria-label', reduced ? 'Motion reduced by your device' : userPaused ? 'Resume motion' : 'Pause motion');
    motionIcon.textContent = userPaused || reduced ? '▷' : 'Ⅱ';
    motionLabel.textContent = reduced ? 'Still mode' : userPaused ? 'Resume' : 'Pause';
    if (state === 'idle') scheduleIdle();
    else scheduleReturn();
  }

  scene.querySelector('#miffyCharacter').addEventListener('click', () => setScene('wave', true));
  activityButtons.forEach(button => button.addEventListener('click', () => setScene(button.dataset.miffyActivity, true)));
  scene.querySelector('#miffySurprise').addEventListener('click', () => setScene(chooseScene(), true));
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    updateMotion();
    status.textContent = userPaused ? 'Taking a quiet moment. Motion paused.' : 'Back to a little fun. Motion resumed.';
  });
  document.addEventListener('visibilitychange', updateMotion);
  reducedMotion.addEventListener('change', updateMotion);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const nextVisibility = entries[0].isIntersecting;
      if (inView === nextVisibility) return;
      inView = nextVisibility;
      updateMotion();
    }, { threshold: 0.15 });
    observer.observe(scene);
  } else {
    inView = true;
  }
  updateMotion();
}
