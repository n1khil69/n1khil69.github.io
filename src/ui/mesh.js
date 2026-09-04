/* THE FALLBACK SUBSTRATE
   ---------------------------------------------------------------------
   Canvas2D stand-in for the WebGL liquid, used on the lite tier and if a
   GPU context is lost mid-session. Same idea, cheaper physics: a handful of
   large, slow, additively-blended light blobs drifting, with the pointer
   dragging one of them. It reads as the same material because the glass
   above blurs it anyway.

   This is the lite tier's atmosphere, so it runs on the weakest hardware in
   the audience and has to be cheap on purpose:

   · the buffer is drawn at half resolution and scaled up by CSS — five
     overlapping radial gradients composited with `lighter` is pure overdraw,
     and quartering the pixels quarters the cost. Nothing here has an edge
     sharp enough to notice.
   · frames are capped rather than free-running. This is a slow drift; at 30fps
     it looks identical and leaves the phone's budget for scrolling.
   · it stops entirely when the tab is hidden.
   · a viewport height change on its own does not resize it. Chrome for Android
     fires `resize` every time the URL bar slides, and re-allocating the buffer
     mid-scroll is visible as a flash. */

let started = false;

export function initMesh() {
  const canvas = document.getElementById('mesh');
  if (!canvas || started) return;
  started = true;
  canvas.style.display = 'block';

  const css = (n, f) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
  const CYAN = css('--spec-c', '#7fe7ff');
  const MAG = css('--spec-m', '#ff79c0');
  const AMB = css('--live', '#ffb44d');

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  let w = 0, h = 0, scale = 1, lastW = 0, lastH = 0;
  let running = true;
  let last = 0;
  const FRAME_MS = 1000 / 30;
  const pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };

  const blobs = [
    { c: CYAN, r: 0.52, a: 0.16, sx: 0.00011, sy: 0.00007, px: 0.22, py: 0.24 },
    { c: MAG,  r: 0.44, a: 0.09, sx: -0.00008, sy: 0.00012, px: 0.78, py: 0.70 },
    { c: AMB,  r: 0.38, a: 0.07, sx: 0.00013, sy: -0.00009, px: 0.55, py: 0.10 },
    { c: CYAN, r: 0.30, a: 0.12, sx: -0.00015, sy: -0.00006, px: 0.15, py: 0.82 },
  ];

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    // half resolution, capped: this is a soft wash under 14-30px of backdrop blur
    scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
    canvas.width = Math.max(1, Math.floor(w * scale));
    canvas.height = Math.max(1, Math.floor(h * scale));
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    lastW = w; lastH = h;
  }

  /* Android's URL bar makes the viewport shorter and taller as you scroll,
     firing `resize` each time. Re-allocating the buffer for that flashes, so
     only a real width change (or a large height change, i.e. a rotation)
     counts as a resize. */
  function onResize() {
    const nw = window.innerWidth, nh = window.innerHeight;
    if (nw === lastW && Math.abs(nh - lastH) < lastH * 0.2) { w = nw; h = nh; return; }
    resize();
  }

  function blob(x, y, radius, colour, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, hexA(colour, alpha));
    g.addColorStop(0.55, hexA(colour, alpha * 0.34));
    g.addColorStop(1, hexA(colour, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function hexA(hex, a) {
    const n = hex.replace('#', '');
    const v = n.length === 3 ? n.split('').map((c) => c + c).join('') : n;
    const r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function tick(t) {
    if (!running) return;
    requestAnimationFrame(tick);
    if (t - last < FRAME_MS) return;
    last = t;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    const short = Math.min(w, h);
    blobs.forEach((b, i) => {
      const x = (b.px + Math.sin(t * b.sx + i) * 0.12) * w;
      const y = (b.py + Math.cos(t * b.sy + i * 1.7) * 0.12) * h;
      blob(x, y, b.r * short, b.c, b.a);
    });

    // the lamp the pointer carries
    blob(pointer.x * w, pointer.y * h, short * 0.30, CYAN, 0.10);

    ctx.globalCompositeOperation = 'source-over';
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { running = false; return; }
    if (!running) { running = true; last = 0; requestAnimationFrame(tick); }
  });

  window.addEventListener('resize', onResize);
  window.addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX / window.innerWidth;
    pointer.ty = e.clientY / window.innerHeight;
  }, { passive: true });

  resize();
  requestAnimationFrame(tick);
}
