import './miffy-world.css';
import { bunnySVG, getDressColor, makeDialog, discover, getDiscoveries } from './miffy-world-shared.js';
import { WARDROBE, getSavedOutfit, applyOutfit } from './miffy-wardrobe.js';

const flower = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="#dfb259" stroke="#38382c" stroke-width="2"><path d="M50 85V48M50 70Q25 50 28 74Q38 82 50 78" fill="#8b9b75"/><path d="M50 45C22 58 22 25 40 30C28 3 64 3 60 29C86 16 91 50 66 50C75 75 41 76 50 45Z"/><circle cx="51" cy="40" r="9" fill="#f9f0d9"/></g></svg>`;
const postcard = `<svg viewBox="0 0 180 130" aria-hidden="true"><g transform="rotate(-8 90 65)" stroke="#39382c" stroke-width="2"><rect x="24" y="14" width="133" height="102" rx="3" fill="#fffdf4"/><path d="M91 30V100M105 65H142M105 79H135M105 94H143"/><rect x="120" y="24" width="24" height="26" fill="#ddbe79"/><path d="M36 78L51 58L65 70L78 52V96H36Z" fill="#9ba685"/></g></svg>`;
const houseIcon = `<svg viewBox="0 0 180 130" aria-hidden="true"><g stroke="#39382c" stroke-width="2.4" stroke-linejoin="round"><path d="M39 61L91 18L142 61V116H39Z" fill="#f7efd9"/><path d="M27 64L91 10L154 64" fill="none"/><path d="M78 116V76H104V116" fill="#b37b5a"/><rect x="49" y="69" width="19" height="23" fill="#dfb259"/><path d="M58 69V92M49 80H68"/><path d="M117 90V72M107 79H127"/><circle cx="95" cy="98" r="2"/></g></svg>`;

export function initMiffyWorld() {
  const playground = document.getElementById('miffyPlayground');
  if (!playground || document.getElementById('miffyWorldMap')) return;
  const hub = document.createElement('div');
  hub.id = 'miffyWorldMap';
  hub.className = 'wonder-map';
  hub.innerHTML = `<div class="wonder-map__heading"><div><span class="wonder-eyebrow">FIELD NOTES FROM A VERY SMALL WORLD</span><h3>She has a whole life<br><em>behind this page.</em></h3></div><p>Follow a little curiosity.<br>There’s always room for you.</p></div>
    <div class="wonder-map__cards">
      <button type="button" data-world-action="open-house" class="wonder-map__card"><span class="wonder-map__art">${houseIcon}</span><span class="wonder-eyebrow">01 / A SECRET ADDRESS</span><strong>Come on in.</strong><span>Peel back the paper. Make yourself at home.</span><i aria-hidden="true">↗</i></button>
      <button type="button" data-world-action="open-toys" class="wonder-map__card"><span class="wonder-map__art wonder-map__flower">${flower}</span><span class="wonder-eyebrow">02 / LITTLE EXPERIMENTS</span><strong>What if…?</strong><span>A drawer full of things that go together.</span><i aria-hidden="true">↗</i></button>
      <button type="button" data-world-action="photo" class="wonder-map__card"><span class="wonder-map__art">${postcard}</span><span class="wonder-eyebrow">03 / SOMETHING TO KEEP</span><strong>A day with Miffy.</strong><span>Three little pictures. One lovely memory.</span><i aria-hidden="true">↗</i></button>
    </div>
    <div class="wonder-map__trails" role="group" aria-label="More little adventures"><span class="wonder-eyebrow">TAKE A DETOUR</span><button type="button" data-world-action="open-planet">✧ Tiny planet</button><button type="button" data-world-action="escape">↗ Let her out</button><button type="button" data-world-action="typography">Aa Letter playground</button><button type="button" data-world-action="disco">✳ After hours</button></div>
    <button type="button" class="wonder-invitation is-ready" id="miffyTeaInvite" aria-label="Open your tea party invitation"><span class="wonder-invitation__envelope" aria-hidden="true">✉</span><span><strong>A seat saved for you.</strong><small>The kettle’s on. Come over for a very small tea party.</small></span><span aria-hidden="true">↗</span></button>
    <div class="wonder-map__foot"><span id="wonderDiscoveryCount" class="wonder-eyebrow"></span><span class="wonder-eyebrow">NO HURRY. YOU’RE IN GOOD COMPANY.</span></div><p class="wonder-sr" id="wonderMapStatus" role="status"></p>`;
  playground.append(hub);
  const picnic = initPicnic();
  const photo = initPhotoBooth();
  hub.addEventListener('click', event => {
    const action = event.target.closest('[data-world-action]')?.dataset.worldAction;
    if (!action) return;
    if (action === 'photo') photo();
    else document.dispatchEvent(new CustomEvent(`miffy:${action}`));
  });
  const invitation = hub.querySelector('#miffyTeaInvite');
  invitation.addEventListener('click', picnic);
  document.addEventListener('miffy:open-photo', photo);
  const updateCount = () => { hub.querySelector('#wonderDiscoveryCount').textContent = `${String(getDiscoveries().length).padStart(2, '0')} LITTLE MEMORIES COLLECTED`; };
  updateCount();
  document.addEventListener('miffy:discovery', updateCount);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateMotion = () => {
    document.documentElement.dataset.wonderMotion = document.hidden ? 'paused' : motion.matches ? 'reduced' : 'running';
  };
  motion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  updateMotion();
}

function initPicnic() {
  const dialog = makeDialog('miffyPicnic', 'Tea at ours?', `<div class="wonder-picnic"><div class="wonder-picnic__sky"><span>✧</span><p>Tea tastes better together.<br><em>We saved you the best spot.</em></p><span>✧</span></div><div class="wonder-picnic__friends" aria-label="Four Miffys together at a picnic"></div><div class="wonder-picnic__blanket"><div class="wonder-picnic__cups" aria-hidden="true">${[1,2,3,4,5].map(() => '<span class="wonder-cup"><i></i><svg viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 17H34V31C34 43 8 43 8 31Z" fill="#fff8e7"/><path d="M34 20C49 16 48 34 34 32M4 44H41"/><path d="M10 21H32" stroke="#a97743"/></svg></span>').join('')}</div><button type="button" class="wonder-biscuit" aria-label="Have a flower biscuit">✿</button><span class="wonder-picnic__seat">YOUR PLACE ♡</span></div><div class="wonder-picnic__actions"><button type="button" class="wonder-button" data-pour>Pour tea for everyone</button><button type="button" class="wonder-button wonder-button--quiet" data-picnic-photo>Take a little picture ↗</button></div><p role="status" class="wonder-caption" data-picnic-caption>The kettle’s on. Stay as long as you like.</p></div>`);
  const stage = dialog.querySelector('.wonder-picnic');
  dialog.querySelector('[data-pour]').addEventListener('click', () => {
    stage.classList.toggle('is-poured');
    const poured = stage.classList.contains('is-poured');
    dialog.querySelector('[data-pour]').textContent = poured ? 'Another little round?' : 'Pour tea for everyone';
    dialog.querySelector('[data-picnic-caption]').textContent = poured ? 'Five warm cups. A very good little afternoon.' : 'A fresh pot is on its way.';
  });
  dialog.querySelector('.wonder-biscuit').addEventListener('click', event => {
    const eaten = event.currentTarget.classList.toggle('is-nibbled');
    dialog.querySelector('[data-picnic-caption]').textContent = eaten ? 'Just a little nibble. Miffy brought plenty.' : 'One more biscuit, especially for you.';
  });
  dialog.querySelector('[data-picnic-photo]').addEventListener('click', () => { dialog.close(); document.dispatchEvent(new CustomEvent('miffy:open-photo')); });
  return () => {
    dialog.querySelector('.wonder-picnic__friends').innerHTML = ['#b47d60', '#e0bd68', getDressColor(), '#829578'].map((dress, index) => `<span style="--friend-turn:${index % 2 ? 5 : -5}deg">${bunnySVG({ dress, pose: index === 2 ? 'wave' : 'stand' })}</span>`).join('');
    discover('picnic'); dialog.showModal();
  };
}

function initPhotoBooth() {
  const dialog = makeDialog('miffyPhotoBooth', 'A day with Miffy.', `<div class="wonder-photo"><div class="wonder-photo__studio"><div class="wonder-photo__camera"><span class="wonder-eyebrow">THE VERY SMALL PHOTO BOOTH</span><div class="wonder-photo__subject"></div><span class="wonder-photo__curtain wonder-photo__curtain--left"></span><span class="wonder-photo__curtain wonder-photo__curtain--right"></span><span class="wonder-photo__floor"></span></div><label class="wonder-photo__outfit">Today’s little outfit<select id="wonderPhotoOutfit"></select></label><fieldset class="wonder-photo__stickers"><legend>Add a little something</legend><button type="button" data-sticker="stars" aria-pressed="true">✧ Stars</button><button type="button" data-sticker="flowers" aria-pressed="false">✿ Flowers</button><button type="button" data-sticker="hearts" aria-pressed="false">♡ Love</button></fieldset><button type="button" class="wonder-button" data-photo-capture>Make a little memory <span aria-hidden="true">◎</span></button><p class="wonder-caption" role="status" data-photo-status>No camera needed. Just your favourite rabbit.</p></div><div class="wonder-photo__result"><div class="wonder-photo__print" aria-label="Your three-frame Miffy photo strip"></div><button type="button" class="wonder-button wonder-button--quiet" data-photo-download disabled>Save your photo strip ↓</button><span class="wonder-eyebrow">A KEEPSAKE, JUST FOR YOU.</span></div></div>`);
  const stickers = new Set(['stars']);
  let captured = false;
  let shutterTimer;
  let imageSource = '';
  const status = dialog.querySelector('[data-photo-status]');
  const select = dialog.querySelector('select');
  const capture = dialog.querySelector('[data-photo-capture]');
  const download = dialog.querySelector('[data-photo-download]');
  const camera = dialog.querySelector('.wonder-photo__camera');
  function render() {
    dialog.querySelector('.wonder-photo__subject').innerHTML = bunnySVG({ pose: 'wave' });
    imageSource = photoStrip(stickers);
    dialog.querySelector('.wonder-photo__print').innerHTML = captured ? imageSource : `<div class="wonder-photo__empty">${postcard}<p>A tiny day.<br>Waiting to happen.</p><span class="wonder-eyebrow">THREE PICTURES / ONE MEMORY</span></div>`;
    download.disabled = !captured;
  }
  select.addEventListener('change', () => {
    applyOutfit(select.value);
    render();
  });
  dialog.querySelectorAll('[data-sticker]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.sticker;
    if (stickers.has(key)) stickers.delete(key); else stickers.add(key);
    button.setAttribute('aria-pressed', String(stickers.has(key)));
    render();
  }));
  capture.addEventListener('click', () => {
    clearTimeout(shutterTimer);
    capture.disabled = true;
    camera.classList.add('is-shooting');
    status.textContent = 'One hello. One surprise. One very important nap…';
    const still = document.documentElement.dataset.wonderMotion !== 'running';
    shutterTimer = setTimeout(() => {
      captured = true;
      capture.disabled = false;
      camera.classList.remove('is-shooting');
      capture.innerHTML = 'One more little memory <span aria-hidden="true">◎</span>';
      discover('photo'); render();
      status.textContent = 'Your pictures are ready. Decorate them and take them home.';
    }, still ? 0 : 1300);
  });
  dialog.addEventListener('close', () => { clearTimeout(shutterTimer); capture.disabled = false; camera.classList.remove('is-shooting'); });
  download.addEventListener('click', async () => {
    if (!captured) return;
    download.disabled = true;
    const source = new Blob([imageSource], { type: 'image/svg+xml;charset=utf-8' });
    let sourceURL;
    try {
      sourceURL = URL.createObjectURL(source);
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = sourceURL; });
      const canvas = document.createElement('canvas');
      canvas.width = 720; canvas.height = 1470;
      canvas.getContext('2d').drawImage(img, 0, 0);
      const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!png) throw new Error('Image export unavailable');
      saveBlob(png, 'a-little-day-with-miffy.png');
      status.textContent = 'A little day, saved as a picture. Come back for another.';
    } catch {
      saveBlob(source, 'a-little-day-with-miffy.svg');
      status.textContent = 'Your photo strip was saved as an SVG picture.';
    } finally {
      if (sourceURL) URL.revokeObjectURL(sourceURL);
      download.disabled = false;
    }
  });
  document.addEventListener('miffy:outfit-change', () => { if (dialog.open) { select.value = getSavedOutfit(); render(); } });
  return () => {
    select.innerHTML = Object.values(WARDROBE).map(outfit => `<option value="${outfit.id}">${outfit.name}</option>`).join('');
    select.value = getSavedOutfit(); render(); dialog.showModal();
  };
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function photoStrip(stickers) {
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());
  const placeBunny = (x, y, size, pose, dress) => bunnySVG({ pose, dress }).replace('<svg ', `<svg x="${x}" y="${y}" width="${size}" height="${size * 1.5}" `);
  const scenes = [
    placeBunny(252, 22, 200, 'wave'),
    placeBunny(202, 22, 200, 'stand') + placeBunny(378, 96, 142, 'wave', '#d8ac61'),
    placeBunny(175, 80, 172, 'sleep') + placeBunny(343, 80, 172, 'sleep', '#d8ac61') + '<path d="M128 272Q310 224 545 272V320H128Z" fill="#91a286" stroke="#39382c" stroke-width="3"/><text x="480" y="72" font-size="24" fill="#666">z z z</text>',
  ];
  const decor = `${stickers.has('stars') ? '<path d="M90 55V95M70 75H110M555 240V270M540 255H570" stroke="#a77a38" stroke-width="4"/>' : ''}${stickers.has('flowers') ? '<g fill="#d9a55d"><circle cx="90" cy="258" r="14"/><circle cx="118" cy="258" r="14"/><circle cx="104" cy="244" r="14"/><circle cx="104" cy="272" r="14"/><circle cx="104" cy="258" r="10" fill="#fff8e7"/></g>' : ''}${stickers.has('hearts') ? '<path d="M528 86C475 47 513 28 528 48C546 27 582 47 528 86Z" fill="#c38179"/>' : ''}`;
  const stamp = getDiscoveries().includes('picnic') ? 'TEA PARTY CLUB' : `${getDiscoveries().length} LITTLE MEMORIES`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1470" viewBox="0 0 720 1470" role="img" aria-label="Three pictures of Miffy: a hello, a friend, and a nap"><rect width="720" height="1470" fill="#faf5e8"/><rect x="18" y="18" width="684" height="1434" rx="3" fill="none" stroke="#d4c9b0"/><text x="360" y="75" text-anchor="middle" font-family="Georgia,serif" font-size="33" fill="#333328">A little day spent here.</text>${scenes.map((art, i) => `<g transform="translate(40 ${110 + i * 380})"><rect width="640" height="338" rx="2" fill="${['#ece5d6','#eee0c4','#dedfcf'][i]}"/><path d="M35 309H605" stroke="#b1ad97"/>${decor}${art}<text x="12" y="365" font-family="monospace" font-size="15" fill="#756f61">0${i + 1} / ${['OH, HELLO.', 'BETTER WITH A FRIEND.', 'A VERY IMPORTANT NAP.'][i]}</text></g>`).join('')}<text x="360" y="1302" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#333328">Miffy &amp; you</text><text x="360" y="1340" text-anchor="middle" font-family="monospace" font-size="16" fill="#756f61">${date.toUpperCase()} · GURUGRAM TIME</text><rect x="223" y="1370" width="274" height="37" rx="18" fill="none" stroke="#8a9676"/><text x="360" y="1395" text-anchor="middle" font-family="monospace" font-size="14" fill="#56664a">${stamp}</text><text x="360" y="1434" text-anchor="middle" font-family="monospace" font-size="12" fill="#8a8271">NIKHIL SHARMA / A LITTLE HAPPY PLACE</text></svg>`;
}
