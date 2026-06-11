/* Nikhil Sharma — portfolio interactions */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- identity-graph particle mesh ---------- */
(() => {
  const canvas = document.getElementById('mesh');
  if (!canvas || prefersReduced) return;

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

    const target = Math.min(110, Math.floor((w * h) / 16000));
    nodes = Array.from({ length: target }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.4 + 0.6,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
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
          const alpha = (1 - d / LINK_DIST) * 0.13;
          ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      // brighten links near the cursor
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < MOUSE_DIST) {
        const alpha = (1 - md / MOUSE_DIST) * 0.35;
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(160, 226, 199, 0.55)';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
  resize();
  tick();
})();

/* ---------- nav: scrolled state + active link ---------- */
(() => {
  const nav = document.getElementById('nav');
  const links = [...document.querySelectorAll('.nav__links a')];
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    for (const s of sections) if (s.offsetTop <= y) current = s;
    links.forEach(a => a.classList.toggle('active', current && a.getAttribute('href') === `#${current.id}`));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- mobile menu ---------- */
(() => {
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  function setOpen(open) {
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
})();

/* ---------- scroll reveals ---------- */
(() => {
  const els = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(el => io.observe(el));
})();

/* ---------- animated counters ---------- */
(() => {
  const nums = document.querySelectorAll('.stat__num');
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = target + suffix; continue; }
      const start = performance.now();
      const dur = 1400;
      (function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      })(start);
    }
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

/* ---------- cursor-tracked glow on cards ---------- */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ---------- email reveal (address assembled at runtime, kept out of markup) ---------- */
(() => {
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
  });

  copyBtn?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(addr);
      copyBtn.textContent = '✓ Copied';
      setTimeout(() => { copyBtn.textContent = 'Copy address'; }, 2000);
    } catch {
      copyBtn.textContent = addr;
    }
  });
})();

/* ---------- live IST clocks (hero id-card + footer) ---------- */
(() => {
  const targets = [document.getElementById('istClock'), document.getElementById('footClock')].filter(Boolean);
  if (!targets.length) return;
  const fmt = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
  });
  function update() {
    const t = fmt.format(new Date());
    targets.forEach(el => { el.textContent = el.id === 'istClock' ? `${t} IST` : t; });
  }
  update();
  setInterval(update, 30000);
})();

/* ---------- duplicate marquee content for seamless loop ---------- */
(() => {
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;
})();
