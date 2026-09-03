/* THE CLEARANCE RAIL
   ---------------------------------------------------------------------
   A depth gauge pinned to the right edge: how far down the laminate stack
   you are, and which layer you are inside. It doubles as navigation —
   the ticks are clickable — and as the page's only persistent chrome
   besides the nav capsule. Desktop only (hidden under 1180px in CSS). */

export function initRail({ onSection } = {}) {
  const rail = document.getElementById('rail');
  const fill = document.getElementById('railFill');
  if (!rail || !fill) return;

  const ticks = [...rail.querySelectorAll('li')];
  const targets = ticks.map((li) => document.querySelector(li.dataset.target)).map((el, i) => ({ el, li: ticks[i] }));

  ticks.forEach((li) => {
    li.style.pointerEvents = 'auto';
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      document.querySelector(li.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  let active = null;

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    fill.style.height = `${(p * 100).toFixed(2)}%`;
    rail.classList.toggle('on', window.scrollY > 120);

    const line = window.scrollY + window.innerHeight * 0.4;
    let current = null;
    for (const t of targets) {
      if (t.el && t.el.offsetTop <= line) current = t;
    }
    if (current && current !== active) {
      ticks.forEach((li) => li.classList.remove('on'));
      current.li.classList.add('on');
      if (active) onSection?.(current.li.dataset.target);
      active = current;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
