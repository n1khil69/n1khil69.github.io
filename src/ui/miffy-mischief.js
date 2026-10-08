import './miffy-mischief.css';
import { bunnySVG, getDressColor, discover } from './miffy-world-shared.js';

/** A visitor starts every bit of mischief. The page remains the playground. */
export function initMiffyMischief() {
  const playground = document.getElementById('miffyPlayground');
  const hero = document.querySelector('.hero__copy');
  const title = document.getElementById('heroTitle');
  const footer = document.querySelector('.footer');
  if (!playground || !hero || !title || !footer || playground.dataset.mischiefReady) return;
  playground.dataset.mischiefReady = 'true';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = [...document.querySelectorAll('main > section, .footer')];
  let escaped = false;
  let typographyTimer;
  let discoTimer;
  let walkTimer;
  let pendingFrame = 0;
  let lastSection;
  let discoOrigin;
  let pendingFocus;

  const latch = document.createElement('div');
  latch.className = 'mm-latch';
  latch.innerHTML = `<button class="mm-button mm-latch__button" type="button" aria-pressed="false" aria-controls="miffyMarginFriend"><span class="mm-latch__icon" aria-hidden="true">⌑</span><span>Let her out</span></button><p class="mm-latch__note">She’s curious about the rest of this page.</p>`;
  playground.append(latch);
  const latchButton = latch.querySelector('button');
  const latchNote = latch.querySelector('p');

  const companion = document.createElement('div');
  companion.id = 'miffyMarginFriend';
  companion.className = 'mm-companion';
  companion.setAttribute('aria-hidden', 'true');
  companion.hidden = true;
  companion.innerHTML = `<span class="mm-companion__bunny">${bunnySVG({ dress: getDressColor() })}</span><span class="mm-companion__perch"></span><span class="mm-companion__suitcase"></span>`;
  document.body.append(companion);

  const homeButton = document.createElement('button');
  homeButton.type = 'button';
  homeButton.className = 'mm-button mm-home';
  homeButton.innerHTML = '<span aria-hidden="true">⌂</span> Bring Miffy home';
  homeButton.hidden = true;
  document.body.append(homeButton);

  const typeControls = document.createElement('div');
  typeControls.className = 'mm-type-controls';
  typeControls.innerHTML = '<button type="button" class="mm-type-button" aria-pressed="false"><span aria-hidden="true">·</span> A little type mischief <span aria-hidden="true">↗</span></button><p class="mm-type-note" role="status" aria-live="polite"></p>';
  hero.append(typeControls);
  const typeButton = typeControls.querySelector('button');
  const typeNote = typeControls.querySelector('p');
  const typography = document.createElement('div');
  typography.className = 'mm-typography';
  typography.setAttribute('aria-hidden', 'true');
  typography.hidden = true;
  typography.innerHTML = `<span class="mm-typography__ladder"></span><span class="mm-typography__bunny">${bunnySVG({ dress: getDressColor() })}</span><span class="mm-typography__dot"></span>`;
  hero.append(typography);

  const secret = document.createElement('div');
  secret.className = 'mm-secret';
  secret.innerHTML = '<button type="button" class="mm-secret__button" aria-label="Start a tiny five-second Miffy disco" aria-controls="miffyAfterHours" aria-pressed="false"><span aria-hidden="true">✳</span></button><p class="mm-secret__note" role="status" aria-live="polite">psst. after hours?</p>';
  footer.querySelector('.footer__brand')?.insertAdjacentElement('afterend', secret);
  const discoButton = secret.querySelector('button');
  const discoNote = secret.querySelector('p');
  const disco = document.createElement('aside');
  disco.id = 'miffyAfterHours';
  disco.className = 'mm-disco';
  disco.setAttribute('aria-label', 'Miffy’s after-hours disco');
  disco.hidden = true;
  disco.innerHTML = `<div class="mm-disco__scenery" aria-hidden="true"><span class="mm-disco__beam mm-disco__beam--one"></span><span class="mm-disco__beam mm-disco__beam--two"></span><div class="mm-disco__ball"><span></span></div><span class="mm-disco__star mm-disco__star--one">✧</span><span class="mm-disco__star mm-disco__star--two">✳</span><span class="mm-disco__star mm-disco__star--three">✧</span><div class="mm-disco__friends">${['#e1a948', '#6692ae', getDressColor(), '#dc8272', '#94a77b'].map((dress, index) => `<span style="--mm-dancer:${index}">${bunnySVG({ dress })}</span>`).join('')}</div></div><div class="mm-disco__caption"><p role="status">A very small after-hours disco.</p><button type="button" class="mm-button">Tidy up early <span aria-hidden="true">×</span></button></div>`;
  document.body.append(disco);
  const discoStop = disco.querySelector('button');

  const status = document.createElement('p');
  status.className = 'mm-sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  document.body.append(status);

  function still() {
    return document.hidden || motionQuery.matches;
  }

  function modalOpen() {
    return Boolean(document.querySelector('dialog[open]'));
  }

  function returnFocus(preferred) {
    if (document.hidden) { pendingFocus = preferred; return; }
    // A later modal owns focus. Never return it to an inert background control.
    if (modalOpen()) return;
    const rect = preferred?.getBoundingClientRect();
    const visible = preferred?.isConnected && !preferred.closest('[hidden], [inert], dialog:not([open])') && rect?.width && rect.bottom > 0 && rect.top < window.innerHeight;
    const target = visible ? preferred : document.getElementById('main');
    target?.focus({ preventScroll: true });
  }

  function syncMotion() {
    [companion, typography, disco, secret, latch].forEach(node => node.classList.toggle('mm-still', still()));
  }

  function placeCompanion() {
    pendingFrame = 0;
    if (!escaped || document.hidden || modalOpen()) return;
    const height = window.innerHeight;
    const width = window.innerWidth;
    const targetY = height * 0.48;
    const section = sections.find(element => {
      const rect = element.getBoundingClientRect();
      return rect.top <= targetY && rect.bottom > targetY;
    }) || sections.reduce((nearest, element) => Math.abs(element.getBoundingClientRect().top - targetY) < Math.abs(nearest.getBoundingClientRect().top - targetY) ? element : nearest);
    const rect = section.getBoundingClientRect();
    const naturalPerch = rect.top + 1;
    // The narrow right gutter is always reserved for her; no text receives a hit target.
    const perchY = naturalPerch > 145 && naturalPerch < height - 130 ? naturalPerch : Math.min(height - 145, Math.max(180, targetY));
    companion.style.setProperty('--mm-perch-y', `${perchY}px`);
    companion.classList.toggle('mm-companion--small', width < 600);
    companion.classList.toggle('mm-companion--light', section.classList.contains('light-section'));
    companion.classList.toggle('mm-companion--footer', section === footer);
    if (section !== lastSection) {
      companion.classList.remove('mm-companion--walking');
      clearTimeout(walkTimer);
      if (!still()) {
        companion.classList.add('mm-companion--walking');
        walkTimer = setTimeout(() => companion.classList.remove('mm-companion--walking'), 900);
      }
      lastSection = section;
    }
  }

  function queueCompanion() {
    if (escaped && !pendingFrame) pendingFrame = requestAnimationFrame(placeCompanion);
  }

  function setEscaped(next) {
    if (next && (document.hidden || modalOpen())) return;
    const restoreFocus = !next && document.activeElement === homeButton;
    escaped = next;
    companion.hidden = !next;
    homeButton.hidden = !next;
    latchButton.setAttribute('aria-pressed', String(next));
    latchButton.lastElementChild.textContent = next ? 'Bring her home' : 'Let her out';
    latchNote.textContent = next ? 'Look along the edge. She’s exploring with you.' : 'She’s curious about the rest of this page.';
    status.textContent = next ? 'Miffy is out exploring the page margins. Bring her home whenever you like.' : 'Miffy is back home. That was a lovely little walk.';
    if (next) {
      discover('escape');
      placeCompanion();
    } else {
      lastSection = null;
      clearTimeout(walkTimer);
      if (restoreFocus) returnFocus(latchButton);
    }
  }

  function stopTypography(announce = true) {
    clearTimeout(typographyTimer);
    typography.hidden = true;
    typography.classList.remove('mm-typography--playing');
    typeButton.setAttribute('aria-pressed', 'false');
    typeButton.innerHTML = '<span aria-hidden="true">·</span> A little type mischief <span aria-hidden="true">↗</span>';
    if (announce) typeNote.textContent = 'She put the full stop back. Mostly.';
  }

  function startTypography() {
    if (!typography.hidden) { stopTypography(); return; }
    if (document.hidden || modalOpen()) return;
    // Read the existing text without wrapping or replacing any heading nodes.
    const text = title.firstChild;
    if (!text || text.nodeType !== Node.TEXT_NODE) return;
    const dotIndex = text.textContent.lastIndexOf('.');
    if (dotIndex < 0) return;
    const range = document.createRange();
    range.setStart(text, dotIndex);
    range.setEnd(text, dotIndex + 1);
    const dot = range.getBoundingClientRect();
    const frame = hero.getBoundingClientRect();
    const heading = title.getBoundingClientRect();
    const dotSize = Math.max(9, Math.min(21, dot.width * 0.7));
    const bunnyWidth = Math.max(30, Math.min(48, heading.width * 0.085));
    const originX = Math.min(frame.width - bunnyWidth, dot.left - frame.left + dot.width * 0.45);
    const originY = dot.bottom - frame.top - dot.height * 0.18;
    typography.style.setProperty('--mm-type-x', `${originX}px`);
    typography.style.setProperty('--mm-type-y', `${originY}px`);
    typography.style.setProperty('--mm-type-size', `${bunnyWidth}px`);
    typography.style.setProperty('--mm-dot-size', `${dotSize}px`);
    typography.style.setProperty('--mm-roll-distance', `${Math.min(originX * 0.65, 170)}px`);
    typography.style.setProperty('--mm-slide-distance', `${Math.min(heading.height * 0.48, 135)}px`);
    typography.hidden = false;
    typography.classList.add('mm-typography--playing');
    typeButton.setAttribute('aria-pressed', 'true');
    typeButton.innerHTML = '<span aria-hidden="true">×</span> Put everything back';
    typeNote.textContent = still() ? 'One tiny rabbit. One borrowed full stop.' : 'Please excuse the very small typesetter.';
    discover('typography');
    typographyTimer = setTimeout(stopTypography, still() ? 4500 : 6800);
  }

  function stopDisco(restore = true) {
    clearTimeout(discoTimer);
    const restoreFocus = disco.contains(document.activeElement);
    disco.hidden = true;
    document.body.classList.remove('mm-party-active');
    discoButton.setAttribute('aria-pressed', 'false');
    discoNote.textContent = 'nothing happened.';
    if (restore && restoreFocus) returnFocus(discoOrigin);
  }

  function startDisco() {
    if (!disco.hidden) { stopDisco(); return; }
    if (document.hidden || modalOpen()) return;
    discoOrigin = document.activeElement;
    disco.hidden = false;
    document.body.classList.add('mm-party-active');
    discoButton.setAttribute('aria-pressed', 'true');
    discoNote.textContent = 'A very important tiny party.';
    discoStop.focus({ preventScroll: true });
    discover('disco');
    discoTimer = setTimeout(stopDisco, 5000);
  }

  latchButton.addEventListener('click', () => setEscaped(!escaped));
  homeButton.addEventListener('click', () => setEscaped(false));
  typeButton.addEventListener('click', startTypography);
  discoButton.addEventListener('click', startDisco);
  discoStop.addEventListener('click', () => stopDisco());
  document.addEventListener('miffy:escape', () => setEscaped(!escaped));
  document.addEventListener('miffy:typography', () => {
    if (document.hidden || modalOpen()) return;
    hero.scrollIntoView({ behavior: 'instant', block: 'center' });
    startTypography();
    typeButton.focus({ preventScroll: true });
  });
  document.addEventListener('miffy:disco', startDisco);
  document.addEventListener('miffy:outfit-change', () => {
    [companion.querySelector('.mm-companion__bunny'), typography.querySelector('.mm-typography__bunny'), disco.querySelector('.mm-disco__friends span:nth-child(3)')].forEach(node => {
      node.innerHTML = bunnySVG({ dress: getDressColor() });
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!disco.hidden) stopDisco();
    if (!typography.hidden) stopTypography();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!disco.hidden) stopDisco();
      if (!typography.hidden) stopTypography(false);
      companion.hidden = true;
      clearTimeout(walkTimer);
      companion.classList.remove('mm-companion--walking');
    } else {
      companion.hidden = !escaped || modalOpen();
      queueCompanion();
      if (pendingFocus) { const target = pendingFocus; pendingFocus = null; returnFocus(target); }
    }
    syncMotion();
  });
  // Native modal dialogs make the rest of the document inert. Clear transient
  // page performances before their only stop controls disappear behind one.
  new MutationObserver(() => {
    const blocked = modalOpen();
    if (blocked) {
      if (!typography.hidden) stopTypography(false);
      if (!disco.hidden) stopDisco(false);
    }
    companion.hidden = !escaped || blocked || document.hidden;
    homeButton.hidden = !escaped || blocked;
    if (!blocked) queueCompanion();
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && !typography.hidden) stopTypography(false);
  }).observe(title);
  window.addEventListener('scroll', queueCompanion, { passive: true });
  window.addEventListener('resize', () => {
    queueCompanion();
    if (!typography.hidden) stopTypography(false);
  }, { passive: true });
  motionQuery.addEventListener('change', syncMotion);
  syncMotion();
}
