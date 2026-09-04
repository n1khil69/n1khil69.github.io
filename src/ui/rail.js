/* THE PROGRESS RAIL
   ---------------------------------------------------------------------
   A depth gauge pinned to the right edge: how far down the page you are,
   and which section you are inside. It doubles as navigation — the ticks
   are clickable.

   CSS hides it under 1180px, so on a phone none of this is on screen. It
   still has to not cost anything: reading `offsetTop` and `scrollHeight`
   inside a scroll handler forces a synchronous layout on every scroll
   event, which is the same price whether or not anyone can see the result.
   So the offsets are measured once (and on resize), the handler only reads
   `scrollY`, the work is batched into a frame, and when the rail is hidden
   it does nothing at all. */

export function initRail({ onSection } = {}) {
  const rail = document.getElementById('rail');
  const fill = document.getElementById('railFill');
  if (!rail || !fill) return;

  const ticks = [...rail.querySelectorAll('li')];
  const targets = ticks.map((li) => ({ el: document.querySelector(li.dataset.target), li }));

  ticks.forEach((li) => {
    li.style.pointerEvents = 'auto';
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      document.querySelector(li.dataset.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  let active = null;
  let shown = false;
  let offsets = [];
  let scrollMax = 0;
  let viewport = 0;
  let lastFill = '';
  let lastOn = null;
  let queued = 0;

  /* the only layout reads on this module's hot path, and they happen on
     resize rather than on scroll */
  function measure() {
    shown = getComputedStyle(rail).display !== 'none';
    if (!shown) return;
    viewport = window.innerHeight;
    scrollMax = document.documentElement.scrollHeight - viewport;
    offsets = targets.map((t) => (t.el ? t.el.offsetTop : Infinity));
    apply();
  }

  function apply() {
    queued = 0;
    if (!shown) return;

    const y = window.scrollY;

    const p = scrollMax > 0 ? Math.min(1, Math.max(0, y / scrollMax)) : 0;
    const h = `${(p * 100).toFixed(2)}%`;
    if (h !== lastFill) { fill.style.height = h; lastFill = h; }

    const on = y > 120;
    if (on !== lastOn) { rail.classList.toggle('on', on); lastOn = on; }

    const line = y + viewport * 0.4;
    let current = null;
    for (let i = 0; i < targets.length; i++) if (offsets[i] <= line) current = targets[i];

    if (current && current !== active) {
      ticks.forEach((li) => li.classList.remove('on'));
      current.li.classList.add('on');
      if (active) onSection?.(current.li.dataset.target);
      active = current;
    }
  }

  function onScroll() {
    if (!shown || queued) return;
    queued = requestAnimationFrame(apply);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  // the page grows as fonts land and reveals settle; re-measure when it does
  if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
  measure();
}
