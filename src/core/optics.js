/* THE LIGHT
   ---------------------------------------------------------------------
   One light source for the whole page. It rests above the fold and drifts
   toward the pointer; every registered pane reads its own angle to it and
   renders a dispersion arc on that edge (`--rim`), plus a specular smear
   where the pointer actually is (`--mx/--my/--sheen`).

   This is what stops the glass reading as "blurred rectangle": the arcs on
   two panes on opposite sides of the viewport lean in opposite directions,
   because they are lit by the same lamp.

   Three modes, because the cost of doing this per frame is not the same
   everywhere:

     'pointer' — a pointer is driving the lamp, so the lighting has to keep
                 up with it: measure and write every frame it moves.
     'settle'  — touch. There is no pointer, so the lamp never moves and the
                 only thing changing a pane's angle is the pane travelling up
                 the viewport. Writing `--rim` invalidates style on the pane
                 and repaints its conic gradient and its backdrop blur, so
                 doing that to every visible pane on every scrolled frame is
                 the single most expensive thing on a phone. Here the lighting
                 updates when a pane arrives and again once scrolling stops.
                 In motion the arcs simply hold, which is invisible while the
                 page is moving and correct the moment it isn't.
     'once'    — reduced motion: light everything once, then never again.

   Cost control throughout: panes register through an IntersectionObserver and
   only the on-screen ones are written to, rects are cached and invalidated on
   scroll/resize, and the loop parks itself when nothing has moved. */

const panes = [];
let lightX = window.innerWidth * 0.5;
let lightY = -window.innerHeight * 0.25;
let targetX = lightX;
let targetY = lightY;
let pointerX = -9999;
let pointerY = -9999;
let dirty = true;
let rectsDirty = true;
let running = false;
let hasPointer = false;

const root = document.documentElement;

function markRects() { rectsDirty = true; dirty = true; }

function measure() {
  for (const pane of panes) {
    if (!pane.visible) continue;
    const r = pane.el.getBoundingClientRect();
    pane.cx = r.left + r.width / 2;
    pane.cy = r.top + r.height / 2;
    pane.left = r.left;
    pane.top = r.top;
    pane.w = r.width || 1;
    pane.h = r.height || 1;
  }
  rectsDirty = false;
}

/* angle from a pane to the lamp, in CSS conic space (0deg = up) */
function litRim(pane) {
  const ang = Math.atan2(lightX - pane.cx, pane.cy - lightY) * (180 / Math.PI);
  const next = `${ang.toFixed(1)}deg`;
  // only touch the property when it actually changed — every write costs a
  // style invalidation, a gradient repaint and a backdrop re-blur
  if (next !== pane.rim) {
    pane.rim = next;
    pane.el.style.setProperty('--rim', next);
  }
}

function relight() {
  if (rectsDirty) measure();
  for (const pane of panes) if (pane.visible) litRim(pane);
}

function frame() {
  if (!running) return;

  // the lamp lags the pointer — light has weight
  lightX += (targetX - lightX) * 0.075;
  lightY += (targetY - lightY) * 0.075;

  if (dirty || Math.abs(targetX - lightX) > 0.4 || Math.abs(targetY - lightY) > 0.4) {
    if (rectsDirty) measure();

    root.style.setProperty('--lx', `${lightX.toFixed(1)}px`);
    root.style.setProperty('--ly', `${lightY.toFixed(1)}px`);

    for (const pane of panes) {
      if (!pane.visible) continue;
      litRim(pane);

      // specular smear: only panes the pointer is near get one
      if (hasPointer) {
        const mx = pointerX - pane.left;
        const my = pointerY - pane.top;
        const near =
          mx > -260 && mx < pane.w + 260 &&
          my > -260 && my < pane.h + 260;
        if (near) {
          pane.el.style.setProperty('--mx', `${mx.toFixed(0)}px`);
          pane.el.style.setProperty('--my', `${my.toFixed(0)}px`);
          if (!pane.lit) { pane.el.style.setProperty('--sheen', '1'); pane.lit = true; }
        } else if (pane.lit) {
          pane.el.style.setProperty('--sheen', '0');
          pane.lit = false;
        }
      }
    }
    dirty = false;
  }

  requestAnimationFrame(frame);
}

export function initOptics({ mode = 'pointer' } = {}) {
  const els = document.querySelectorAll('[data-glass]');
  if (!els.length) return null;

  const io = new IntersectionObserver((entries) => {
    let arrived = false;
    for (const e of entries) {
      const pane = panes.find((p) => p.el === e.target);
      if (!pane) continue;
      pane.visible = e.isIntersecting;
      if (e.isIntersecting) arrived = true;
    }
    markRects();
    // light a pane as it arrives, so it is never seen with a default rim
    if (mode === 'settle' && arrived) schedule();
  }, { rootMargin: '140px' });

  els.forEach((el) => {
    panes.push({ el, visible: false, lit: false, rim: '', cx: 0, cy: 0, left: 0, top: 0, w: 1, h: 1 });
    io.observe(el);
  });

  /* ---- reduced motion: one pass, then nothing moves ---- */
  if (mode === 'once') {
    requestAnimationFrame(() => {
      panes.forEach((p) => { p.visible = true; });
      relight();
    });
    return null;
  }

  /* ---- touch: relight when a pane arrives and when scrolling stops ---- */
  let queued = 0;
  let settleTimer = 0;
  function schedule() {
    if (queued) return;
    queued = requestAnimationFrame(() => { queued = 0; relight(); });
  }

  if (mode === 'settle') {
    window.addEventListener('scroll', () => {
      markRects();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(schedule, 140);
    }, { passive: true });
    window.addEventListener('resize', () => { markRects(); schedule(); });
    schedule();

    return { refresh: () => { markRects(); schedule(); }, stop() { clearTimeout(settleTimer); } };
  }

  /* ---- pointer: the lamp follows, so the lighting runs per frame ---- */
  window.addEventListener('pointermove', (e) => {
    hasPointer = true;
    pointerX = e.clientX;
    pointerY = e.clientY;
    // the lamp only follows part of the way, and never sinks below mid-screen
    targetX = window.innerWidth * 0.5 + (e.clientX - window.innerWidth * 0.5) * 0.85;
    targetY = -window.innerHeight * 0.18 + e.clientY * 0.42;
    dirty = true;
  }, { passive: true });

  window.addEventListener('scroll', markRects, { passive: true });
  window.addEventListener('resize', markRects);
  document.addEventListener('pointerleave', () => {
    hasPointer = false;
    panes.forEach((p) => { if (p.lit) { p.el.style.setProperty('--sheen', '0'); p.lit = false; } });
    dirty = true;
  });

  running = true;
  requestAnimationFrame(frame);

  return {
    refresh: markRects,
    stop() { running = false; },
  };
}
