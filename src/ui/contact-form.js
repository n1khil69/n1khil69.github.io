/**
 * In-page contact delivery with Miffy's paper-plane express.
 * With JavaScript the form posts to FormSubmit's AJAX endpoint so the visitor
 * stays on the page; without it, the native POST (with FormSubmit's CAPTCHA)
 * still works. Only a confirmed success shows the delivery card. Anything
 * else keeps the draft and offers the direct email link, so the page never
 * claims a message was sent when it wasn't.
 */
import { drawMiffy, miffyIcon, outlined } from './miffy-shape.js';

// Miffy carrying the letter, standing on the shadow at the foot of the 200 × 200 card art.
const courier = drawMiffy(100, 82, 0.72);

const RECIPIENT = 'nikhil.sharma275@gmail.com';
const AJAX_ENDPOINT = `https://formsubmit.co/ajax/${RECIPIENT}`;

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const submit = document.getElementById('contactSubmit');
  const status = document.getElementById('contactStatus');
  const nameInput = form.elements.namedItem('name');
  const emailInput = form.elements.namedItem('email');
  const messageInput = form.elements.namedItem('message');
  // Set when a visitor returns from the no-JavaScript provider flow.
  const received = new URLSearchParams(location.search).get('message') === 'submitted';
  let submitting = false;

  function restore() {
    submitting = false;
    submit.disabled = false;
    form.removeAttribute('aria-busy');
    form.classList.remove('is-delivered');
    const existingCard = form.querySelector('#miffyDeliveryCard');
    if (existingCard) existingCard.remove();
    submit.querySelector('span').textContent = 'Send message';
    status.textContent = received ? 'Thanks — your message has been submitted.' : '';
  }

  function showFailure(reason, mailtoUrl) {
    restore();
    status.textContent = `${reason} Your draft is still here. `;
    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.textContent = 'Send it by email instead ↗';
    status.append(link);
  }

  function showDeliveryCelebration() {
    const existingCard = form.querySelector('#miffyDeliveryCard');
    if (existingCard) existingCard.remove();

    form.classList.add('is-delivered');

    const card = document.createElement('div');
    card.className = 'miffy-delivery-card';
    card.id = 'miffyDeliveryCard';

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
              <path d="M40 70 L40 82 M34 76 L46 76" stroke-width="2.5" />
              <path d="M162 65 L162 77 M156 71 L168 71" stroke-width="2.5" />
              <path d="M152 136 C147 126 162 116 167 126 C172 116 187 126 182 136 C172 151 167 156 167 156 C167 156 162 151 152 136 Z" fill="currentColor" stroke-width="1.5" />
              <circle cx="34" cy="130" r="3" fill="currentColor" stroke="none" />
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
                <circle cx="100" cy="155" r="2.6" fill="#101010" stroke="none" />
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
          <h3 tabindex="-1">Message Dispatched!</h3>
          <p class="miffy-delivery-card__desc">
            Miffy handed your note to the mail service, and it’s on its way to Nikhil’s inbox. Nikhil will write back soon.
          </p>
          <div class="miffy-delivery-card__actions">
            <button type="button" class="miffy-delivery-btn" id="miffySendAnother">
              <span>Send another note ↺</span>
            </button>
            <a href="#lab" class="miffy-delivery-btn miffy-delivery-btn--ghost" id="miffyVisitLab">
              <span>Play with Miffy in the Lab ${miffyIcon()} ↗</span>
            </a>
          </div>
        </div>
      </div>
    `;

    form.appendChild(card);
    // The form controls are hidden now; move focus so it isn't lost.
    card.querySelector('h3').focus();

    card.querySelector('#miffySendAnother').addEventListener('click', () => {
      form.reset();
      restore();
      nameInput.focus();
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
    status.textContent = 'Paper Plane Express: Miffy is sending your message to Nikhil…';

    // Trigger Miffy's paper plane animation in the Lab section
    document.dispatchEvent(
      new CustomEvent('miffy:deliver-message', {
        detail: { name: nameVal, email: emailVal },
      })
    );

    const mailtoUrl = `mailto:${RECIPIENT}?subject=${encodeURIComponent(
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
        AJAX_ENDPOINT,
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
        showDeliveryCelebration();
      } else if (typeof data.message === 'string' && /activat/i.test(data.message)) {
        // FormSubmit holds messages until the recipient activates the form once.
        showFailure('Not sent yet: this form is waiting for its one-time activation.', mailtoUrl);
      } else {
        showFailure('Your message didn’t go through.', mailtoUrl);
      }
    } catch {
      showFailure('Your message couldn’t be sent. Check your connection and try again.', mailtoUrl);
    }
  });

  window.addEventListener('pageshow', restore);
  restore();
}
