/* THE LIGHT
   ---------------------------------------------------------------------
   One light source for the whole page. It rests above the fold and drifts
   toward the pointer; every registered pane reads its own angle to it and
   renders a dispersion arc on that edge (`--rim`), plus a specular smear
   where the pointer actually is (`--mx/--my/--sheen`).

   This is what stops the glass reading as "blurred rectangle": the arcs on
   two panes on opposite sides of the viewport lean in opposite directions,
   because they are lit by the same lamp.

   Cost control: panes register through an IntersectionObserver and only the
   on-screen ones are written to, rects are cached and invalidated on
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

      // angle from the pane to the lamp, in CSS conic space (0deg = up)
      const ang = Math.atan2(lightX - pane.cx, pane.cy - lightY) * (180 / Math.PI);
      pane.el.style.setProperty('--rim', `${ang.toFixed(1)}deg`);

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

export function initOptics({ live = true } = {}) {
  const els = document.querySelectorAll('[data-glass]');
  if (!els.length) return null;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const pane = panes.find((p) => p.el === e.target);
      if (pane) pane.visible = e.isIntersecting;
    }
    markRects();
  }, { rootMargin: '140px' });

  els.forEach((el) => {
    panes.push({ el, visible: false, lit: false, cx: 0, cy: 0, left: 0, top: 0, w: 1, h: 1 });
    io.observe(el);
  });

  if (!live) {
    // static tier: one measurement, one lighting pass, then nothing moves
    requestAnimationFrame(() => {
      panes.forEach((p) => { p.visible = true; });
      measure();
      panes.forEach((p) => {
        const ang = Math.atan2(lightX - p.cx, p.cy - lightY) * (180 / Math.PI);
        p.el.style.setProperty('--rim', `${ang.toFixed(1)}deg`);
      });
    });
    return null;
  }

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
