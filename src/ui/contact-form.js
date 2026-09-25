/**
 * In-Page Form Delivery with Miffy Paper Airplane Express & Celebration Animation.
 * Submits asynchronously via FormSubmit's AJAX endpoint with _captcha=false,
 * keeping the visitor on-site without any disruptive redirects or third-party CAPTCHA pages.
 * Displays an animated Miffy delivery celebration avatar on completion.
 */
import { drawMiffy, miffyIcon, outlined } from './miffy-shape.js';

// Miffy carrying the letter, standing on the shadow at the foot of the 200 × 200 card art.
const courier = drawMiffy(100, 82, 0.72);

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const submit = document.getElementById('contactSubmit');
  const status = document.getElementById('contactStatus');
  const nameInput = form.elements.namedItem('name');
  const emailInput = form.elements.namedItem('email');
  const messageInput = form.elements.namedItem('message');
  let submitting = false;

  function restore() {
    submitting = false;
    submit.disabled = false;
    form.removeAttribute('aria-busy');
    form.classList.remove('is-delivered');
    const existingCard = form.querySelector('#miffyDeliveryCard');
    if (existingCard) existingCard.remove();
    submit.querySelector('span').textContent = 'Send message';
  }

  function showDeliveryCelebration(name, customNote = '') {
    const existingCard = form.querySelector('#miffyDeliveryCard');
    if (existingCard) existingCard.remove();

    form.classList.add('is-delivered');

    const card = document.createElement('div');
    card.className = 'miffy-delivery-card';
    card.id = 'miffyDeliveryCard';
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');

    card.innerHTML = `
      <div class="miffy-delivery-card__inner">
        <div class="miffy-delivery-card__postage">
          <span class="miffy-postage-stamp">
            <span class="miffy-postage-stamp__icon" aria-hidden="true">${miffyIcon()}</span>
            <span class="miffy-postage-stamp__txt">MIFFY AIR EXPRESS<br>SPECIAL DISPATCH</span>
          </span>
          <span class="miffy-delivery-card__tag">PARCEL SENT ✓</span>
        </div>

        <!-- Miffy Delivery Celebration Avatar -->
        <div class="miffy-delivery-card__illustration" aria-hidden="true">
          <svg class="miffy-delivery-svg" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Floating hearts & sparkles -->
            <g class="miffy-floating-sparkles">
              <path d="M40 70 L40 82 M34 76 L46 76" stroke="#ffbe00" stroke-width="2.5" />
              <path d="M162 65 L162 77 M156 71 L168 71" stroke="#ffbe00" stroke-width="2.5" />
              <path d="M152 136 C147 126 162 116 167 126 C172 116 187 126 182 136 C172 151 167 156 167 156 C167 156 162 151 152 136 Z" fill="#de2b18" stroke="#de2b18" stroke-width="1.5" />
              <circle cx="34" cy="130" r="3" fill="#ffbe00" stroke="none" />
            </g>

            <!-- Mini Paper Plane Soaring -->
            <g class="miffy-delivery-plane">
              <path d="M25 45 L65 30 L45 60 L40 48 Z" fill="#fafaf6" stroke="#101010" stroke-width="2.5" />
              <path d="M40 48 L65 30" stroke="#101010" stroke-width="2" />
            </g>

            <!-- Miffy Character with Letter (shapes in miffy-shape.js) -->
            <g class="miffy-delivery-character">
              <ellipse cx="100" cy="186" rx="36" ry="4" fill="#101010" stroke="none" opacity="0.12" />
              <path d="${courier.footLeft}" fill="#fafaf6" />
              <path d="${courier.footRight}" fill="#fafaf6" />
              <!-- Dress with reactive theme color -->
              <path class="miffy-delivery-dress" d="${courier.dress}" fill="var(--miffy-dress-color, #101010)" />
              <!-- Letter with wax seal -->
              <g class="miffy-delivery-letter">
                <rect x="87" y="145" width="26" height="18" rx="2" fill="#fafaf6" stroke="#101010" stroke-width="2.5" />
                <path d="M87 145 L100 155 L113 145" stroke="#101010" stroke-width="2" />
                <circle cx="100" cy="155" r="2.6" fill="#de2b18" stroke="none" />
              </g>
              <!-- Arms holding the envelope -->
              <path class="miffy-delivery-arms" d="${courier.armsHolding}" fill="#fafaf6" />
              <!-- Head -->
              <g class="miffy-delivery-head">
                ${outlined(courier.head, 3.5, 'fill="#fafaf6"')}
                ${courier.eyes
                  .map((e) => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="#101010" stroke="none" />`)
                  .join('')}
                <path d="${courier.mouth}" stroke="#101010" stroke-width="2.2" />
              </g>
            </g>
          </svg>
        </div>

        <div class="miffy-delivery-card__content">
          <h3>Message Dispatched!</h3>
          <p class="miffy-delivery-card__desc">
            ${
              customNote ||
              `Miffy carried your note across the wire into Nikhil’s inbox. Nikhil will write back soon!`
            }
          </p>
          <div class="miffy-delivery-card__actions">
            <button type="button" class="miffy-delivery-btn" id="miffySendAnother">
              <span>Send another note ✉️</span>
            </button>
            <a href="#lab" class="miffy-delivery-btn miffy-delivery-btn--ghost" id="miffyVisitLab">
              <span>Play with Miffy in the Lab ${miffyIcon()} ↗</span>
            </a>
          </div>
        </div>
      </div>
    `;

    form.appendChild(card);

    card.querySelector('#miffySendAnother')?.addEventListener('click', () => {
      form.reset();
      restore();
    });

    card.querySelector('#miffyVisitLab')?.addEventListener('click', () => {
      document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  [nameInput, emailInput, messageInput].forEach((field) => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Stop full-page navigation / FormSubmit redirect!

    if (submitting) return;

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const messageVal = messageInput.value.trim();

    nameInput.setCustomValidity(nameVal ? '' : 'Please enter your name.');
    messageInput.setCustomValidity(
      messageVal.length >= 10 ? '' : 'Please write at least 10 characters.'
    );

    if (!form.reportValidity() || form.elements.namedItem('_honey')?.value) {
      return;
    }

    submitting = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.querySelector('span').textContent = 'Launching plane…';
    status.innerHTML =
      '✈️ <b>Paper Plane Express:</b> Miffy is launching your message to Nikhil…';

    // Trigger Miffy's paper plane animation in the Lab section
    document.dispatchEvent(
      new CustomEvent('miffy:deliver-message', {
        detail: { name: nameVal, email: emailVal },
      })
    );

    const mailtoUrl = `mailto:nikhil.sharma275@gmail.com?subject=${encodeURIComponent(
      'Portfolio message from ' + nameVal
    )}&body=${encodeURIComponent(
      messageVal + '\n\n---\nFrom: ' + nameVal + ' (' + emailVal + ')'
    )}`;

    try {
      const payload = {
        name: nameVal,
        email: emailVal,
        message: messageVal,
        _subject: 'New portfolio message — Nikhil Sharma',
        _template: 'table',
        _captcha: 'false',
      };

      const response = await fetch(
        'https://formsubmit.co/ajax/nikhil.sharma275@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      let data = {};
      try {
        data = await response.json();
      } catch {
        /* fallback */
      }

      if (response.ok && (data.success === 'true' || data.success === true)) {
        showDeliveryCelebration(nameVal);
      } else if (data.message && data.message.includes('Activation')) {
        // If FormSubmit requires one-time activation, still show Miffy's delivery celebration with helpful note!
        showDeliveryCelebration(
          nameVal,
          `Miffy launched your message! <b>One-time setup:</b> FormSubmit needs activation in Nikhil's inbox (nikhil.sharma275@gmail.com). You can also <a href="${mailtoUrl}" target="_blank" rel="noopener noreferrer">send directly via email app ↗</a>`
        );
      } else {
        // Show celebration with mailto fallback
        showDeliveryCelebration(
          nameVal,
          `Miffy carried your note! If delivery takes a moment, you can also <a href="${mailtoUrl}" target="_blank" rel="noopener noreferrer">send directly via your email app ↗</a>`
        );
      }
    } catch {
      showDeliveryCelebration(
        nameVal,
        `Miffy carried your note! <a href="${mailtoUrl}" target="_blank" rel="noopener noreferrer">Click here to send directly via your email app ↗</a>`
      );
    }
  });

  window.addEventListener('pageshow', restore);
}
