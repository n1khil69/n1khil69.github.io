import './miffy-planet.css';
import { bunnySVG, dressPaint, isNight, discover, makeDialog } from './miffy-world-shared.js';

// Every visual and hit area uses this one coordinate system and rotation pivot.
const PLANET = { width: 720, height: 590, x: 360, y: 350, radius: 170, limit: 55 };
const HOUSE = { x: 274, y: 63, width: 104, height: 118 };
const WALKER = { width: 48, height: 72, sole: 214.22 / 240 };
const percent = (value, size) => `${value / size * 100}%`;
const worldPosition = `--planet-pivot-x:${percent(PLANET.x, PLANET.width)};--planet-pivot-y:${percent(PLANET.y, PLANET.height)}`;
const housePosition = `left:${percent(HOUSE.x, PLANET.width)};top:${percent(HOUSE.y, PLANET.height)};width:${percent(HOUSE.width, PLANET.width)};height:${percent(HOUSE.height, PLANET.height)}`;
const walkerPosition = `left:${percent(PLANET.x - WALKER.width / 2, PLANET.width)};top:${percent(PLANET.y - PLANET.radius - WALKER.height * WALKER.sole, PLANET.height)};width:${percent(WALKER.width, PLANET.width)};height:${percent(WALKER.height, PLANET.height)};--planet-sole:${percent(WALKER.sole, 1)}`;

const planetArtwork = `
  <svg class="miffy-planet__drawing" viewBox="0 0 720 590" fill="none" aria-hidden="true">
    <defs>
      <clipPath id="miffyPlanetEarth"><circle cx="360" cy="350" r="170"/></clipPath>
      <pattern id="miffyPlanetPaper" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="5" cy="6" r=".7" fill="#656562" opacity=".18"/><circle cx="14" cy="15" r=".5" fill="#656562" opacity=".15"/></pattern>
    </defs>
    <g class="miffy-planet__dress-defs"></g>
    <g class="miffy-planet__wheel" stroke="#272821" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="360" cy="350" r="177" fill="#f5f5f1" stroke="none"/>
      <circle cx="360" cy="350" r="170" fill="#d6d6d1"/>
      <g clip-path="url(#miffyPlanetEarth)">
        <path d="M161 337Q259 287 355 310T550 330V426Q458 397 363 439T160 421Z" fill="#e6e6e1" stroke="none"/>
        <path d="M172 436Q279 390 361 433T546 434V530H172Z" fill="#bdbdb8" stroke="none"/>
        <path d="M173 496Q280 459 367 483T544 480" stroke="#898986" stroke-width="2"/>
        <path d="M320 176L323 300L303 327M323 290L351 319M321 239L297 253M325 305L326 353L309 373M326 353L348 370" stroke="#787875" stroke-width="3"/>
        <path d="M469 226L442 320L456 341M448 300L420 321M442 321L431 365L410 379M432 360L448 379" stroke="#787875" stroke-width="3"/>
        <path d="M201 273Q246 210 288 189Q360 161 417 190Q486 221 520 288Q452 255 377 267Q285 269 201 306Z" fill="#f0f0ec"/>
        <path d="M205 281Q279 246 365 258Q454 237 515 280" stroke="#8e8e8a" stroke-width="2"/>
        <path d="M197 304Q271 271 344 284Q432 269 526 302" stroke="#979793" stroke-width="2"/>
        <circle cx="360" cy="350" r="170" fill="url(#miffyPlanetPaper)" stroke="none"/>
        <g stroke-width="2"><path d="M265 355L257 367M266 360L276 362M481 400L475 407"/><path d="M384 465L388 468M268 464L272 466M406 329L409 332"/><ellipse cx="293" cy="420" rx="9" ry="5" fill="#9b9b97"/><ellipse cx="399" cy="394" rx="6" ry="4" fill="#e0e0dc"/><ellipse cx="369" cy="487" rx="8" ry="4" fill="#e0e0dc"/></g>
        <g class="miffy-planet__seed" transform="translate(349 402)"><ellipse rx="23" ry="15" fill="#fafaf6"/><path d="M-11 -1q4 5 8 0M4 -1q4 5 8 0" stroke-width="2"/><path d="M0 -14Q-6 -28 3 -35Q14 -27 0 -14" fill="#93938f" stroke-width="2"/></g>
      </g>
      <path d="M282 177H370V181Q325 177 282 201Z" fill="#f0f0ec" stroke-width="2"/>
      <g class="miffy-planet__home">
        <path d="M286 177V112H366V177Z" fill="#efefeb"/>
        <path d="M274 115L326 69L378 115Z" fill="#868683"/>
        <path d="M346 86V63H360V98" fill="#868683"/>
        <rect x="298" y="126" width="19" height="22" rx="2" fill="#cfcfcb"/>
        <path d="M307 127V147M299 137H316" stroke-width="2"/>
        <path d="M331 176V140Q343 123 355 140V176" fill="#a7a7a3"/>
        <circle cx="349" cy="153" r="1.7" fill="#272821" stroke="none"/>
        <path d="M323 181L361 181" stroke-width="5"/>
        <path class="miffy-planet__chimney" d="M353 53Q339 44 351 33T349 14" stroke="#b1b1ad" stroke-width="3"/>
      </g>
      <g transform="translate(467 216) rotate(30)">
        <path d="M0 0V-76M0 -34L-14 -51M0 -48L15 -62" fill="none" stroke-width="5"/>
        <path d="M-26 -92Q-24 -122 0 -123Q25 -121 26 -93Q46 -83 31 -62Q20 -48 0 -55Q-22 -47 -34 -64Q-45 -82 -26 -92Z" fill="#969692"/>
        <circle cx="-16" cy="-79" r="5" fill="#9a9a96" stroke="none"/><circle cx="13" cy="-97" r="5" fill="#9a9a96" stroke="none"/>
      </g>
      <g transform="translate(232 233) rotate(-32)">
        <path d="M-38 0V-63M43 0V-63" stroke-width="3"/>
        <path d="M-38 -58Q4 -43 43 -58" stroke-width="2"/>
        <path d="M-28 -53L-13 -50L-7 -22Q-22 -18 -35 -25Z" fill="var(--planet-dress, #868683)" stroke-width="2"/>
        <path d="M11 -50L25 -54L34 -28Q23 -23 9 -24Z" fill="#eaeae6" stroke-width="2"/>
        <path d="M-24 -59V-49M-15 -57V-48M14 -56V-48M22 -58V-50" stroke-width="2"/>
      </g>
      <g transform="translate(393 184) rotate(10)" stroke-width="2.5"><path d="M0 0V-23M0 -8L-9 -14M0 -12L8 -18" stroke="#8d8d89"/><path d="M-8 -24Q-13 -32 -5 -35Q0 -44 5 -35Q13 -32 8 -24Z" fill="#bebeba"/></g>
      <g transform="translate(497 259) rotate(47)" stroke-width="2"><path d="M0 0V-19M0 -6L-7 -11" stroke="#8d8d89"/><path d="M-7 -22Q-8 -31 0 -27Q8 -31 7 -22Q0 -17 -7 -22Z" fill="#999995"/></g>
    </g>
  </svg>`;

export function initMiffyPlanet() {
  const hero = document.querySelector('.hero-art');
  if (!hero || document.getElementById('miffyPlanetPortal')) return;

  // The existing canvas stays decorative; only the new portal is interactive.
  hero.removeAttribute('aria-hidden');
  hero.querySelectorAll('canvas, .art-label, .art-cross').forEach((element) => element.setAttribute('aria-hidden', 'true'));
  const orbit = document.createElement('div');
  orbit.className = 'miffy-planet-orbit';
  orbit.setAttribute('aria-hidden', 'true');
  orbit.innerHTML = `<div class="miffy-planet-orbit__traveller"><div class="miffy-planet-orbit__bunny">${bunnySVG({ pose: 'wave', className: 'miffy-planet-bunny' })}</div><span class="miffy-planet-orbit__spark">✧</span></div>`;
  hero.appendChild(orbit);

  const portal = document.createElement('button');
  portal.type = 'button';
  portal.id = 'miffyPlanetPortal';
  portal.className = 'miffy-planet-portal';
  portal.setAttribute('aria-label', 'Visit Miffy’s tiny planet');
  portal.innerHTML = '<span class="miffy-planet-portal__star" aria-hidden="true">✧</span><span>A TINY WORLD<br><b>just over here ↗</b></span>';
  hero.appendChild(portal);

  const dialog = makeDialog('miffyPlanetDialog', 'A very small planet.', `
    <div class="miffy-planet">
      <div class="miffy-planet__intro"><span>NO. 01 / A PLACE TO WANDER</span><p>Somewhere between the stars,<br>there is a little place for everything.</p></div>
      <div class="miffy-planet__sky" data-planet-night="${isNight()}">
        <span class="miffy-planet__star miffy-planet__star--one" aria-hidden="true">✧</span><span class="miffy-planet__star miffy-planet__star--two" aria-hidden="true">✦</span><span class="miffy-planet__star miffy-planet__star--three" aria-hidden="true">+</span>
        <span class="miffy-planet__moon" aria-hidden="true"></span>
        <div class="miffy-planet__stage" style="${worldPosition}" role="group" aria-label="Illustrated paper planet. Drag sideways to turn it, or use the controls below.">
          <span class="miffy-planet__shadow" aria-hidden="true"></span>
          <div class="miffy-planet__world">
            ${planetArtwork}
            <div class="miffy-planet__walker-orbit" aria-hidden="true"><div class="miffy-planet__walker" style="${walkerPosition}"><div>${bunnySVG({ pose: 'wave', className: 'miffy-planet-bunny' })}</div></div></div>
            <button class="miffy-planet__door" style="${housePosition}" type="button" aria-label="Knock on the little house and step inside"><span>knock, knock <i aria-hidden="true">↗</i></span></button>
          </div>
        </div>
        <div class="miffy-planet__coordinates" aria-hidden="true"><span>ONE HOUSE.<br>ALL THE SPACE IN THE WORLD.</span><span>GRAVITY: GENTLE<br>RESIDENTS: 01</span></div>
      </div>
      <div class="miffy-planet__caption"><span class="miffy-planet__caption-star" aria-hidden="true">✳</span><p>A house, a tree, a dress in the breeze.<br><em>Even the little seed is having a nap.</em></p></div>
      <div class="miffy-planet__controls"><button type="button" data-planet-turn="-18" aria-label="Turn planet left">←</button><label for="miffyPlanetRotation">TURN YOUR LITTLE WORLD<input id="miffyPlanetRotation" type="range" min="-55" max="55" step="1" value="0" aria-valuetext="Centred"/></label><button type="button" data-planet-turn="18" aria-label="Turn planet right">→</button></div>
      <p class="miffy-planet__hint">Drag the world gently. The little door is always open.</p>
    </div>`);
  dialog.classList.add('miffy-planet-dialog');
  if (!dialog.isConnected) document.body.appendChild(dialog);
  const stage = dialog.querySelector('.miffy-planet__stage');
  const range = dialog.querySelector('#miffyPlanetRotation');
  const turnButtons = dialog.querySelectorAll('[data-planet-turn]');
  const sky = dialog.querySelector('.miffy-planet__sky');
  const world = dialog.querySelector('.miffy-planet');
  const scene = document.getElementById('miffyScene');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroVisible = true;
  let rotation = 0;
  let drag = null;
  let suppressDoorUntil = 0;

  function setRotation(next) {
    rotation = Math.max(-PLANET.limit, Math.min(PLANET.limit, next));
    stage.style.setProperty('--planet-turn', `${rotation}deg`);
    range.value = String(Math.round(rotation));
    const rounded = Math.round(rotation);
    range.setAttribute('aria-valuetext', rounded === 0 ? 'Centred' : `${Math.abs(rounded)} degrees ${rounded < 0 ? 'left' : 'right'}`);
    turnButtons.forEach(button => {
      button.disabled = Number(button.dataset.planetTurn) < 0 ? rotation <= -PLANET.limit : rotation >= PLANET.limit;
    });
  }
  function syncMotion() {
    const paused = motion.matches || document.hidden || scene?.dataset.motion === 'paused';
    orbit.dataset.paused = String(paused || !heroVisible);
    dialog.dataset.planetPaused = String(paused || !dialog.open);
  }
  function syncAppearance() {
    // Her dress on the washing line matches the one she's wearing.
    const dress = dressPaint();
    dialog.querySelector('.miffy-planet__dress-defs').innerHTML = dress.defs;
    // Apply to the element that owns the default, not its overridden ancestor.
    world.style.setProperty('--planet-dress', dress.fill);
    sky.dataset.planetNight = String(isNight());
    for (const wrapper of [orbit.querySelector('.miffy-planet-orbit__bunny'), dialog.querySelector('.miffy-planet__walker > div')]) {
      wrapper.innerHTML = bunnySVG({ pose: 'wave', className: 'miffy-planet-bunny' });
    }
  }
  function openPlanet() {
    if (dialog.open) return;
    syncAppearance();
    setRotation(0);
    dialog.showModal();
    discover('planet');
    syncMotion();
  }
  portal.addEventListener('click', openPlanet);
  document.addEventListener('miffy:open-planet', openPlanet);
  dialog.addEventListener('close', () => {
    if (drag) endDrag({ pointerId: drag.id });
    syncMotion();
  });
  range.addEventListener('input', () => setRotation(Number(range.value)));
  turnButtons.forEach((button) => button.addEventListener('click', () => setRotation(rotation + Number(button.dataset.planetTurn))));
  dialog.querySelector('.miffy-planet__door').addEventListener('click', () => {
    if (performance.now() < suppressDoorUntil) return;
    dialog.close();
    document.dispatchEvent(new CustomEvent('miffy:open-house'));
  });
  stage.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.isPrimary === false || event.target.closest('button')) return;
    drag = { id: event.pointerId, x: event.clientX, rotation, width: stage.clientWidth, moved: false };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointermove', (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 5) drag.moved = true;
    if (drag.moved) {
      stage.classList.add('is-dragging');
      setRotation(drag.rotation + distance / Math.max(1, drag.width) * 160);
    }
  });
  const endDrag = (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    if (drag.moved) suppressDoorUntil = performance.now() + 150;
    drag = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncMotion(); }).observe(hero);
  if (scene) new MutationObserver(() => { syncMotion(); sky.dataset.planetNight = String(isNight()); }).observe(scene, { attributes: true, attributeFilter: ['data-motion', 'data-time'] });
  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('miffy:outfit-change', syncAppearance);
  motion.addEventListener('change', syncMotion);
  syncAppearance();
  syncMotion();
}
