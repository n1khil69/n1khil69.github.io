/** Native form delivery works on GitHub Pages and without JavaScript.
 * FormSubmit handles delivery, recipient activation, and its default CAPTCHA.
 * This enhancement only validates whitespace, prevents duplicate submits, and
 * sets a same-site return URL. Never report mailbox delivery from client state.
 */
export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const submit = document.getElementById('contactSubmit');
  const status = document.getElementById('contactStatus');
  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const message = form.elements.namedItem('message');
  const received = new URLSearchParams(location.search).get('message') === 'submitted';
  let submitting = false;
  let resetTimer;

  const pageURL = new URL(location.pathname, location.origin);
  form.elements.namedItem('_url').value = pageURL.href;
  pageURL.searchParams.set('message', 'submitted');
  pageURL.hash = 'contact';
  form.elements.namedItem('_next').value = pageURL.href;

  function restore() {
    clearTimeout(resetTimer);
    submitting = false;
    submit.disabled = false;
    form.removeAttribute('aria-busy');
    submit.querySelector('span').textContent = 'Send message';
    status.textContent = received ? 'Thanks — your message has been submitted.' : '';
  }

  [name, email, message].forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
  });
  form.addEventListener('submit', event => {
    if (submitting) {
      event.preventDefault();
      return;
    }
    name.value = name.value.trim();
    email.value = email.value.trim();
    message.value = message.value.trim();
    name.setCustomValidity(name.value ? '' : 'Please enter your name.');
    message.setCustomValidity(message.value.length >= 10 ? '' : 'Please write at least 10 characters.');
    if (!form.reportValidity() || form.elements.namedItem('_honey').value) {
      event.preventDefault();
      return;
    }
    submitting = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submit.querySelector('span').textContent = 'Continuing…';
    status.textContent = 'Opening secure delivery. Complete the check on the next page.';
    // If navigation never completes, preserve the draft and allow another try.
    resetTimer = setTimeout(() => {
      restore();
      status.textContent = 'The next step hasn’t opened. Try again, or use the email link beside the form.';
    }, 30000);
  });
  // Restore controls when a visitor comes back from the delivery provider.
  window.addEventListener('pageshow', restore);
  restore();
}
