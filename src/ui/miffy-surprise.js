/**
 * A hidden surprise for Sanguuuu, who loves Miffy. Tapping Miffy five times in
 * quick succession (see miffy-scene.js) opens a love note, while Miffy hugs a
 * heart as little hearts float up around her. The surprise also unlocks and
 * puts on the secret Sanguuuu's Hearts dress in the wardrobe.
 */

import { miffyIcon } from './miffy-shape.js';
import { unlockOutfit, saveOutfit } from './miffy-wardrobe.js';

const r = (v) => Math.round(v * 10) / 10;

/** A heart centred on (cx, cy), about 2.4·s wide. */
export function heartPath(cx, cy, s) {
  const x = (v) => r(cx + v * s);
  const y = (v) => r(cy + v * s);
  return (
    `M${x(0)} ${y(0.8)}C${x(-1.2)} ${y(0)} ${x(-1.1)} ${y(-0.95)} ${x(-0.55)} ${y(-0.95)}` +
    `C${x(-0.25)} ${y(-0.95)} ${x(0)} ${y(-0.75)} ${x(0)} ${y(-0.5)}` +
    `C${x(0)} ${y(-0.75)} ${x(0.25)} ${y(-0.95)} ${x(0.55)} ${y(-0.95)}` +
    `C${x(1.1)} ${y(-0.95)} ${x(1.2)} ${y(0)} ${x(0)} ${y(0.8)}Z`
  );
}

const sealHeart = `<svg class="miffy-letter__seal" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <circle cx="20" cy="20" r="19" fill="#101010"/>
  <path d="${heartPath(20, 21, 9)}" fill="#fafaf6"/>
</svg>`;

/** Build the love note. `onClose` runs whenever it is closed. */
export function createSurprise(onClose) {
  const letter = document.createElement('dialog');
  letter.className = 'miffy-letter';
  letter.id = 'miffyLetter';
  letter.setAttribute('aria-labelledby', 'miffyLetterTitle');
  letter.innerHTML = `
    <div class="miffy-letter__paper">
      ${sealHeart}
      <p class="miffy-letter__eyebrow">A SECRET NOTE, JUST FOR</p>
      <h2 class="miffy-letter__title" id="miffyLetterTitle">Sanguuuu</h2>
      <p>Miffy asked me to pass on a secret: you’re her very favourite visitor.</p>
      <p>I told her she’ll have to share, because you’re my favourite too. Thank you for
        making ordinary days feel like a page from a Miffy book: simple, bright, and full of joy.</p>
      <p class="miffy-letter__sign">With all my love,<br>Nikhil</p>
      <p class="miffy-letter__gift"><span aria-hidden="true">${miffyIcon()}</span>
        Miffy is wearing your dress today. It stays in her wardrobe, just for you.</p>
      <button type="button" class="miffy-letter__close" id="miffyLetterClose">Keep it close <span aria-hidden="true">♡</span></button>
    </div>
  `;
  document.body.appendChild(letter);

  letter.querySelector('#miffyLetterClose').addEventListener('click', () => letter.close());
  // A tap on the dimmed backdrop (outside the paper) closes the note too.
  letter.addEventListener('click', (event) => {
    if (event.target === letter) letter.close();
  });
  letter.addEventListener('close', onClose);

  return {
    get isOpen() {
      return letter.open;
    },
    open() {
      unlockOutfit('hearts');
      saveOutfit('hearts');
      document.dispatchEvent(new CustomEvent('miffy:surprise', { detail: { outfit: 'hearts' } }));
      if (!letter.open) letter.showModal();
    },
  };
}
