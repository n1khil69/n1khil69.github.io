/* Canvas2D "identity graph" — the lightweight fallback used on the lite tier
   and if the WebGL context is lost. Tracks the signal-amber accent token. */

let started = false;

export function initMesh() {
  const canvas = document.getElementById('mesh');
  if (!canvas || started) return;
  started = true;
  canvas.style.display = 'block';

  // single-source the accent: read the --acc-rgb token ("r, g, b")
  const accRgb = getComputedStyle(document.documentElement)
    .getPropertyValue('--acc-rgb').trim() || '255, 176, 46';

  const ctx = canvas.getContext('2d');
  let w, h, dpr, nodes = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK_DIST = 150;
  const MOUSE_DIST = 220;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.min(90, Math.floor((w * h) / 18000));
    nodes = Array.from({ length: target }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
      r: Math.random() * 1.4 + 0.6,
      acc: Math.random() > 0.4,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          ctx.strokeStyle = `rgba(${accRgb}, ${(1 - d / LINK_DIST) * 0.10})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < MOUSE_DIST) {
        ctx.strokeStyle = `rgba(${accRgb}, ${(1 - md / MOUSE_DIST) * 0.30})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = a.acc ? `rgba(${accRgb}, 0.7)` : 'rgba(230, 237, 245, 0.45)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  resize();
  tick();
}
