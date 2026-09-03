/* THE FALLBACK SUBSTRATE
   ---------------------------------------------------------------------
   Canvas2D stand-in for the WebGL liquid, used on the lite tier and if a
   GPU context is lost mid-session. Same idea, cheaper physics: a handful of
   large, slow, additively-blended light blobs drifting under a heavy blur,
   with the pointer dragging one of them. It reads as the same material
   because the glass above blurs it anyway. */

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

  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  const pointer = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };

  const blobs = [
    { c: CYAN, r: 0.52, a: 0.16, sx: 0.00011, sy: 0.00007, px: 0.22, py: 0.24 },
    { c: MAG,  r: 0.44, a: 0.09, sx: -0.00008, sy: 0.00012, px: 0.78, py: 0.70 },
    { c: AMB,  r: 0.38, a: 0.07, sx: 0.00013, sy: -0.00009, px: 0.55, py: 0.10 },
    { c: CYAN, r: 0.30, a: 0.12, sx: -0.00015, sy: -0.00006, px: 0.15, py: 0.82 },
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    pointer.tx = e.clientX / window.innerWidth;
    pointer.ty = e.clientY / window.innerHeight;
  }, { passive: true });

  resize();
  requestAnimationFrame(tick);
}
