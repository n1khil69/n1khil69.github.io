import './miffy-house.css';
import { bunnySVG, getDressColor, isNight, setNight, discover, makeDialog } from './miffy-world-shared.js';
import { WARDROBE, applyOutfit, getSavedOutfit } from './miffy-wardrobe.js';
import { drawMiffy, outlined } from './miffy-shape.js';

const svg = (content, viewBox = '0 0 100 100') => `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${content}</svg>`;

const TOYS = {
  cloud: { name: 'A little cloud', label: 'Cloud', drawing: svg('<path d="M21 70C2 70 3 43 21 42C23 17 58 15 66 36C94 29 103 70 78 70Z" fill="#fffdf6"/>') },
  water: { name: 'A watering can', label: 'Watering can', drawing: svg('<path d="M28 43H65V79H28ZM65 50C90 34 94 70 65 68M28 57L10 38L5 42L28 73M38 43V30H55" fill="#a8beb2"/><path d="M5 26L3 22M15 22L14 16M23 25L24 20"/>') },
  balloon: { name: 'A red balloon', label: 'Balloon', drawing: svg('<ellipse cx="48" cy="32" rx="24" ry="29" fill="#e57762"/><path d="M48 61L44 67H52ZM48 67C38 79 59 82 47 97"/>') },
  tea: { name: 'A teacup', label: 'Teacup', drawing: svg('<path d="M20 46H66V62C66 84 20 84 20 62Z" fill="#fffdf6"/><path d="M66 49C89 42 89 69 66 65M12 83H78M33 32C24 23 41 20 33 11M51 32C43 23 60 20 51 11"/>') },
  moon: { name: 'A pocket moon', label: 'Moon', drawing: svg('<path d="M70 12C20 14 18 70 76 68C42 110-5 53 26 24C39 11 54 7 70 12Z" fill="#e7b754"/><path d="M77 29V41M71 35H83M88 53V59M85 56H91"/>') },
};

const roomBackdrop = () => `<svg class="miffy-house__backdrop" viewBox="0 0 760 450" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="houseWallpaper" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M17.5 0V35" stroke="#c7b3a3" stroke-opacity=".16"/></pattern>
    <pattern id="houseRug" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 9H18M9 0V18" stroke="#d99d87" stroke-opacity=".3"/></pattern>
  </defs>
  <path d="M0 0H760V450H0Z" fill="#efe4d2"/><path d="M0 0H760V303H0Z" fill="url(#houseWallpaper)"/>
  <path d="M0 303H760V450H0Z" fill="#dfc9ae"/><path d="M0 303H760M0 309H760" stroke="#9c8066" stroke-width="2"/>
  <g stroke="#aa8c70" stroke-opacity=".24"><path d="M0 355H760M0 410H760M145 309L90 450M304 309L280 450M456 309L480 450M615 309L672 450"/></g>
  <ellipse cx="379" cy="377" rx="196" ry="46" fill="#f9eed8" stroke="#987963" stroke-width="2"/><ellipse cx="379" cy="377" rx="177" ry="34" fill="url(#houseRug)" stroke="#d49b82"/>
  <g stroke="#423b33" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M65 127H202V138H65Z" fill="#b8926d"/><path d="M82 138V154M185 138V154"/>
    <path d="M83 96H115L111 125H87Z" fill="#dca58d"/><path d="M99 97V73M98 85C70 84 80 59 99 76M100 90C124 82 122 67 100 79" fill="#9dac87"/>
    <path d="M137 125V83H149V125M150 125V77H165V125M168 125L161 88L172 86L179 125" fill="#f3e3ba"/>
    <rect x="236" y="58" width="65" height="77" rx="2" fill="#e2bb8d"/><rect x="244" y="66" width="49" height="61" fill="#fffae8"/>
    <path d="M258 103C247 92 260 83 260 87C255 67 266 71 266 87C272 69 282 74 276 91C285 103 271 113 258 103Z" fill="#fff"/><circle cx="263" cy="98" r="1" fill="#423b33" stroke="none"/><circle cx="273" cy="98" r="1" fill="#423b33" stroke="none"/>
    <path d="M588 364C574 353 564 373 577 378H592ZM611 364C625 353 635 373 622 378H607Z" fill="#d7a061"/>
  </g>
  <text x="650" y="423" font-family="Georgia, serif" font-size="12" fill="#80674f" text-anchor="middle">a place for small things</text>
</svg>`;

const windowDrawing = () => svg('<defs><clipPath id="houseWindowPane"><rect x="5" y="5" width="125" height="139" rx="55"/></clipPath></defs><g clip-path="url(#houseWindowPane)"><rect x="5" y="5" width="125" height="139" fill="#c9dfde" class="house-window-sky"/><g class="house-window-day"><circle cx="94" cy="42" r="16" fill="#e9b954"/><path d="M0 116Q37 73 72 112T135 106V149H0Z" fill="#a1b89a"/></g><g class="house-window-night"><path d="M88 23C61 25 65 61 91 55C68 83 39 35 68 23Z" fill="#fae3a1"/><path d="M24 48H31M27 44V52M100 84H109M104 80V89M30 101H35M33 98V104" stroke="#fae3a1"/></g></g><rect x="5" y="5" width="125" height="139" rx="55"/><path d="M67 5V144M5 87H130M0 145H135"/>', '0 0 135 154');
const wardrobeDrawing = () => svg('<path d="M6 20Q50-7 94 20V142H6Z" fill="#9caea0"/><path d="M50 10V142M12 142V151M87 142V151"/><circle cx="42" cy="78" r="2" fill="currentColor"/><circle cx="58" cy="78" r="2" fill="currentColor"/><path d="M17 27H40V126H17ZM61 27H84V126H61Z" stroke-opacity=".3"/>', '0 0 100 154');
const bedDrawing = () => {
  const m = drawMiffy(32, 48, .30);
  const sleeper = `<g class="house-bed-sleeper" transform="rotate(-90 32 48)" stroke-width="1.6"><path d="${m.footLeft}${m.footRight}${m.armLeft}${m.armRight}" fill="#fffdf5"/><path d="${m.dress}" fill="${getDressColor()}"/>${outlined(m.head, 1.3, 'fill="#fffdf5"')}<path d="${m.closedEyes}${m.mouth}"/></g>`;
  return svg(`<path d="M6 12Q28-8 49 12V56H6Z" fill="#e7b38e"/><path d="M9 49H149V92H9Z" fill="#f4dfb9"/><rect x="15" y="34" width="44" height="28" rx="12" fill="#fffbed"/>${sleeper}<path d="M62 49H149V86H62Z" fill="#afbeb3"/><path d="M67 56H144M67 64H144M67 72H144" stroke="#fff" stroke-opacity=".5"/><path d="M8 91H153V99H8ZM16 99V112M143 99V112M151 44V96"/><text class="house-bed-sleeper house-bed-dream" x="82" y="32" stroke="none" fill="#76654e" font-size="13">z z z</text>`, '0 0 161 119');
};

const heldBalloon = () => svg('<path d="M150 17C158 60 117 93 131 139"/><ellipse cx="150" cy="-20" rx="26" ry="37" fill="#e57762"/><path d="M150 17L145 23H155Z" fill="#e57762"/><path d="M137-39Q131-33 132-26" stroke="#fff5e5"/>', '0 0 160 240');
const kettleDrawing = () => svg('<path d="M33 28C33 11 63 11 63 28M28 34C7 24 4 53 26 56"/><path d="M26 34H67L81 23L89 28L70 55C65 86 28 85 26 57Z" fill="#d6a66c"/><path d="M24 34H70M42 24H56M49 19V24"/>', '0 0 100 100');
const lampDrawing = () => svg('<path d="M49 83V116M33 117H66"/><path d="M50 80C42 59 30 37 36 28C43 16 61 18 68 28C74 40 58 64 50 80Z" fill="#e69a59"/><path d="M49 21C33 9 39 1 49 12C54-5 66 0 59 15C76 9 82 17 65 23" fill="#87a57b"/><path d="M40 36L48 39M59 47L64 45M46 55L51 56"/>', '0 0 100 123');

export function initMiffyHouse() {
  const playground = document.getElementById('miffyPlayground');
  if (!playground || document.getElementById('miffySecretHouse')) return;

  const invitation = document.createElement('div');
  invitation.className = 'miffy-house-invitation';
  invitation.innerHTML = `<p><span>PSST. THERE’S SOMETHING UNDER HERE.</span><em>Every page has a little secret.</em></p><button type="button" class="miffy-house-peel" aria-label="Peel back the page and visit Miffy’s secret house"><span class="miffy-house-peel__light" aria-hidden="true">${svg('<path d="M20 46L50 20L80 46V82H20Z" fill="#ffe7a1"/><path d="M41 82V57H60V82M31 45H38V53H31ZM65 45H72V53H65Z"/>')}</span><span class="miffy-house-peel__paper" aria-hidden="true"></span><span class="miffy-house-peel__label">lift here ↗</span></button>`;
  playground.append(invitation);

  const dialog = makeDialog('miffySecretHouse', 'She’s been here all along.', `
    <p class="miffy-house__intro">Behind the paper, a little home. Come in. Your slippers are by the door.</p>
    <div class="miffy-house" data-time="day" data-lamp="off" data-play="idle">
      <div class="miffy-house__room" role="group" aria-label="Miffy’s miniature home. Choose a piece of furniture to play.">
        ${roomBackdrop()}
        <button type="button" class="house-object house-window" data-house="window" aria-label="Look out of the window and change day or night">${windowDrawing()}<span>change the sky</span></button>
        <button type="button" class="house-object house-bed" data-house="bed" aria-label="Tuck Miffy into bed" aria-pressed="false">${bedDrawing()}<span>tiny nap</span></button>
        <button type="button" class="house-object house-wardrobe" data-house="wardrobe" aria-label="Choose Miffy’s next outfit">${wardrobeDrawing()}<span>dress up</span></button>
        <button type="button" class="house-object house-lamp" data-house="lamp" aria-label="Turn on the carrot lamp" aria-pressed="false">${lampDrawing()}<span>carrot light</span></button>
        <div class="house-table" aria-hidden="true">${svg('<ellipse cx="90" cy="22" rx="81" ry="18" fill="#bf916d"/><path d="M9 22V31C9 53 171 53 171 31V22M33 45L26 90M146 45L155 90"/>', '0 0 180 96')}</div>
        <button type="button" class="house-object house-kettle" data-house="kettle" aria-label="Make two cups of tea">${kettleDrawing()}<span>tea for two</span></button>
        <div class="house-cups" aria-hidden="true">${TOYS.tea.drawing}${TOYS.tea.drawing}</div>
        <div class="house-puddle" aria-hidden="true"></div>
        <div class="house-bunny" aria-hidden="true"><div class="house-moon-chair">${svg('<path d="M20 136C9 208 89 248 149 177C134 274 5 272 7 182C9 164 14 148 20 136Z" fill="#e8bc62"/>', '0 0 160 240')}</div>${bunnySVG({ dress: getDressColor(), className: 'house-character-art' })}<div class="house-play-balloon">${heldBalloon()}</div></div>
        <div class="house-play-cloud" aria-hidden="true">${TOYS.cloud.drawing}</div>
        <div class="house-rain" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--drop:${i}"></i>`).join('')}</div>
        <div class="house-flower" aria-hidden="true">${svg('<path d="M48 91V42M49 76C20 80 22 57 47 69M49 65C73 65 76 43 50 57" fill="#8aa177"/><path d="M50 43C18 61 11 30 33 28C6 10 42-4 49 19C59-9 91 8 71 26C101 33 74 64 59 43Z" fill="#e4ab98"/><circle cx="50" cy="31" r="9" fill="#e8bc62"/>')}</div>
        <span class="house-drag-hint" aria-hidden="true">a little present? drop it here.</span>
      </div>
      <p class="miffy-house__story" role="status" aria-live="polite">She was just putting the kettle on.</p>
      <div class="house-drawer">
        <button type="button" class="house-drawer__handle" aria-expanded="false" aria-controls="miffyToyDrawer"><span>THE VERY IMPORTANT TOY DRAWER</span><i aria-hidden="true"></i><span class="house-drawer__instruction">pull to open ↓</span></button>
        <div id="miffyToyDrawer" class="house-drawer__inside" hidden>
          <p>Choose one or two little things, then give them to Miffy. You can drag them into her room, too.</p>
          <div class="house-toys" role="group" aria-label="Choose toys to give to Miffy">${Object.entries(TOYS).map(([id, toy]) => `<button type="button" draggable="true" data-toy="${id}" aria-label="Choose ${toy.name.toLowerCase()}" aria-pressed="false">${toy.drawing}<span>${toy.label}</span></button>`).join('')}</div>
          <div class="house-drawer__actions"><span class="house-toy-recipe" aria-live="polite">A cloud + a watering can…</span><button type="button" data-house="give" disabled>Give to Miffy ↗</button><button type="button" data-house="reset">Tidy up</button></div>
        </div>
      </div>
    </div>`);
  dialog.classList.add('miffy-house-dialog');
  const house = dialog.querySelector('.miffy-house');
  const room = dialog.querySelector('.miffy-house__room');
  const bunny = dialog.querySelector('.house-bunny');
  const story = dialog.querySelector('.miffy-house__story');
  const drawer = dialog.querySelector('#miffyToyDrawer');
  const handle = dialog.querySelector('.house-drawer__handle');
  const recipe = dialog.querySelector('.house-toy-recipe');
  const give = dialog.querySelector('[data-house="give"]');
  let selected = [];
  let timer;
  let asleep = false;
  let draggedToy = null;

  function paintBunny() {
    bunny.querySelector('.house-character-art')?.remove();
    const floating = ['balloon', 'cloud-balloon'].includes(house.dataset.play);
    const boots = ['rain', 'puddle'].includes(house.dataset.play);
    bunny.insertAdjacentHTML('afterbegin', bunnySVG({ dress: getDressColor(), pose: floating ? 'wave' : 'stand', boots, className: 'house-character-art' }));
    dialog.querySelector('.house-bed svg').outerHTML = bedDrawing();
  }
  function sky() { house.dataset.time = isNight() ? 'night' : 'day'; }
  document.addEventListener('miffy:time-change', sky);
  sky();
  document.addEventListener('miffy:outfit-change', paintBunny);

  function setDrawer(open) {
    handle.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    handle.querySelector('.house-drawer__instruction').textContent = open ? 'tuck away ↑' : 'pull to open ↓';
    if (open) discover('toys');
  }
  function openHouse(withToys = false) {
    sky();
    paintBunny();
    if (!dialog.open) dialog.showModal();
    discover('house');
    if (withToys) {
      setDrawer(true);
      requestAnimationFrame(() => drawer.scrollIntoView({ block: 'nearest', behavior: 'instant' }));
    }
  }
  invitation.querySelector('button').addEventListener('click', () => openHouse());
  document.addEventListener('miffy:open-house', () => openHouse());
  document.addEventListener('miffy:open-toys', () => openHouse(true));
  handle.addEventListener('click', () => setDrawer(drawer.hidden));

  function resetPlay() {
    clearTimeout(timer);
    house.dataset.play = 'idle';
    house.classList.remove('has-tea');
    asleep = false;
    house.classList.remove('is-asleep');
    dialog.querySelector('[data-house="bed"]').setAttribute('aria-pressed', 'false');
    dialog.querySelector('[data-house="bed"]').setAttribute('aria-label', 'Tuck Miffy into bed');
    paintBunny();
  }
  function updateSelection() {
    dialog.querySelectorAll('[data-toy]').forEach(button => button.setAttribute('aria-pressed', String(selected.includes(button.dataset.toy))));
    give.disabled = !selected.length;
    recipe.textContent = selected.length ? selected.map(id => TOYS[id].label).join(' + ') : 'A cloud + a watering can…';
  }
  function chooseToy(id) {
    if (!Object.hasOwn(TOYS, id)) return;
    if (selected.includes(id)) selected = selected.filter(item => item !== id);
    else selected = [...selected.slice(-1), id];
    updateSelection();
  }
  function makeTea() {
    house.classList.add('has-tea');
    discover('tea');
  }
  function play() {
    if (!selected.length) return;
    resetPlay();
    discover('toys');
    const has = id => selected.includes(id);
    if (has('cloud') && has('water')) {
      house.dataset.play = 'rain';
      story.textContent = 'One cloud. One watering can. A perfectly splashable puddle. She fetched her yellow boots.';
      discover('rain');
      timer = setTimeout(() => {
        house.dataset.play = 'puddle';
        story.textContent = 'The rain stopped. The puddle is still excellent.';
      }, 6500);
    } else if (has('moon')) {
      house.dataset.play = 'moon';
      if (has('tea')) makeTea();
      story.textContent = has('tea') ? 'Tea on the moon. No reservation needed.' : 'She borrowed the moon for a rocking chair. It seems quite happy about it.';
      discover('moon');
    } else if (has('balloon')) {
      house.dataset.play = has('cloud') ? 'cloud-balloon' : 'balloon';
      if (has('tea')) makeTea();
      story.textContent = has('cloud') ? 'A balloon, a cloud, and absolutely no plans to come down yet.' : has('water') ? 'She is watering the sky. Perhaps that is where rain comes from.' : has('tea') ? 'Afternoon tea, with a little lift.' : 'The balloon would like to show her the ceiling.';
    } else if (has('tea')) {
      makeTea();
      house.dataset.play = has('cloud') ? 'cloud' : has('water') ? 'flower' : 'idle';
      story.textContent = has('water') ? 'One cup for you. One cup for her. A little drink for the flower, too.' : 'One cup for her. One cup for you. She remembered.';
    } else if (has('water')) {
      house.dataset.play = 'flower';
      story.textContent = 'A little water, a little patience. Something lovely grew between the floorboards.';
      discover('flower');
    } else {
      house.dataset.play = 'cloud';
      story.textContent = 'An indoor cloud. The forecast is soft, with a chance of daydreaming.';
    }
    paintBunny();
    // Keep the result visible after using the drawer below a small viewport.
    room.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  dialog.querySelectorAll('[data-toy]').forEach(button => {
    button.addEventListener('click', () => chooseToy(button.dataset.toy));
    button.addEventListener('dragstart', event => {
      draggedToy = button.dataset.toy;
      event.dataTransfer.setData('text/plain', draggedToy);
      event.dataTransfer.effectAllowed = 'copy';
      room.classList.add('is-dragging');
    });
    button.addEventListener('dragend', () => { draggedToy = null; room.classList.remove('is-dragging'); });
  });
  room.addEventListener('dragover', event => {
    if (!draggedToy) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  room.addEventListener('drop', event => {
    if (!draggedToy) return;
    event.preventDefault();
    const id = draggedToy;
    room.classList.remove('is-dragging');
    draggedToy = null;
    if (!selected.includes(id)) chooseToy(id);
    play();
  });
  dialog.querySelectorAll('[data-house]').forEach(button => button.addEventListener('click', () => {
    switch (button.dataset.house) {
      case 'give': play(); break;
      case 'reset':
        resetPlay();
        selected = [];
        updateSelection();
        story.textContent = 'Everything in its little place. Except the daydreams.';
        break;
      case 'kettle':
        makeTea();
        story.textContent = 'The kettle whistles very quietly. Two cups, because she knew you were coming.';
        break;
      case 'lamp': {
        const on = house.dataset.lamp !== 'on';
        house.dataset.lamp = on ? 'on' : 'off';
        button.setAttribute('aria-pressed', String(on));
        button.setAttribute('aria-label', `Turn ${on ? 'off' : 'on'} the carrot lamp`);
        story.textContent = on ? 'A carrot-shaped glow. Obviously her favourite kind.' : 'A little softer now. The moon can take this shift.';
        break;
      }
      case 'bed': {
        const shouldSleep = !asleep;
        resetPlay();
        asleep = shouldSleep;
        house.classList.toggle('is-asleep', asleep);
        button.setAttribute('aria-pressed', String(asleep));
        button.setAttribute('aria-label', asleep ? 'Wake Miffy from her nap' : 'Tuck Miffy into bed');
        paintBunny();
        story.textContent = asleep ? 'A very important little nap. Please tiptoe past the dreams.' : 'She’s up. There might be biscuits.';
        break;
      }
      case 'wardrobe': {
        const outfits = Object.values(WARDROBE);
        const active = outfits.findIndex(item => item.id === getSavedOutfit());
        const next = outfits[(active + 1) % outfits.length];
        applyOutfit(next.id);
        story.textContent = `She picked ${next.name}. A little occasion, just for today.`;
        break;
      }
      case 'window':
        setNight(!isNight());
        sky();
        story.textContent = isNight() ? 'The sky put its pyjamas on.' : 'Good morning, little world.';
        break;
    }
  }));
  dialog.addEventListener('close', () => {
    clearTimeout(timer);
    draggedToy = null;
    room.classList.remove('is-dragging');
    if (house.dataset.play === 'rain') house.dataset.play = 'puddle';
  });
}
