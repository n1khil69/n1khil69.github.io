/* email reveal — address assembled at runtime, kept out of markup to deter scrapers */

export function initContact() {
  const revealBtn = document.getElementById('revealEmail');
  const granted = document.getElementById('contactGranted');
  const link = document.getElementById('emailLink');
  const copyBtn = document.getElementById('copyEmail');
  if (!revealBtn || !granted || !link) return;

  const addr = ['nikhil', '.', 'sharma', '275'].join('') + '@' + ['gmail', 'com'].join('.');

  revealBtn.addEventListener('click', () => {
    link.textContent = addr;
    link.href = 'mailto:' + addr;
    revealBtn.hidden = true;
    granted.hidden = false;
    const r = granted.getBoundingClientRect();
    document.dispatchEvent(new CustomEvent('ns:pulse', {
      detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, sound: 'grant' },
    }));
  });

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(addr);
      copyBtn.textContent = '✓ COPIED';
      setTimeout(() => { copyBtn.textContent = 'COPY ADDRESS'; }, 2000);
    } catch {
      copyBtn.textContent = addr;
    }
  });
}
