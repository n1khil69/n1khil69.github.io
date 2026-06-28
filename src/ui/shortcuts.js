/* Keyboard shortcuts + help dialog.
   g-leader "go to" navigation, / to focus the terminal, ? for the shortcuts
   dialog, Esc to dismiss. Always-on across every tier — keyboard nav is an
   accessibility win, not decoration. Navigation reuses the existing nav links
   so scrolling behaves exactly like a mouse click (Lenis/native, mobile-menu
   close). Never hijacks keys while the CLI or a form field is focused. */

export function initShortcuts(prefersReduced) {
  const overlay = document.getElementById('shortcuts');
  const closeBtn = document.getElementById('kbdClose');
  const hint = document.getElementById('kbdHint');

  // g + letter → the matching nav-link target
  const GOTO = {
    h: '#top', a: '#about', e: '#expertise', x: '#experience',
    c: '#credentials', t: '#terminal', s: '#access', m: '#contact',
  };

  const navLink = (hash) =>
    document.querySelector(`#nav a[href="${hash}"], #mobileMenu a[href="${hash}"]`);

  const goto = (hash) => {
    const link = navLink(hash);
    if (link) { link.click(); return; } // reuse existing scroll behaviour
    document.querySelector(hash)?.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth', block: 'start',
    });
  };

  const isTyping = (el) =>
    !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  const focusTerminal = () => {
    const input = document.getElementById('termInput');
    if (!input) return;
    goto('#terminal');
    setTimeout(() => input.focus(), prefersReduced ? 0 : 120);
  };

  /* ---- help dialog ---- */
  let lastFocus = null;
  const isOpen = () => !!overlay?.classList.contains('open');
  const openHelp = () => {
    if (!overlay || isOpen()) return;
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };
  const closeHelp = () => {
    if (!overlay || !isOpen()) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  };
  const toggleHelp = () => (isOpen() ? closeHelp() : openHelp());

  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeHelp(); });
  closeBtn?.addEventListener('click', closeHelp);
  hint?.addEventListener('click', openHelp);

  /* ---- key handling ---- */
  let leader = false;
  let leaderTimer = 0;
  const clearLeader = () => { leader = false; clearTimeout(leaderTimer); };

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Esc dismisses (works even from inputs / open dialog)
    if (e.key === 'Escape') {
      if (isOpen()) { closeHelp(); return; }
      const menu = document.getElementById('mobileMenu');
      if (menu?.classList.contains('open')) { document.getElementById('navBurger')?.click(); return; }
      if (isTyping(document.activeElement)) document.activeElement.blur();
      clearLeader();
      return;
    }

    if (isTyping(document.activeElement)) return; // leave the CLI / forms alone

    if (leader) {
      const hash = GOTO[e.key.toLowerCase()];
      clearLeader();
      if (hash) { e.preventDefault(); goto(hash); }
      return;
    }

    if (e.key === 'g') {
      leader = true;
      clearTimeout(leaderTimer);
      leaderTimer = setTimeout(clearLeader, 1200);
    } else if (e.key === '/') {
      e.preventDefault();
      focusTerminal();
    } else if (e.key === '?') {
      e.preventDefault();
      toggleHelp();
    }
  });
}
