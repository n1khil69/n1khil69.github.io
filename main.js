/* Nikhil Sharma — portfolio interactions */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- boot splash: plays once per session ---------- */
(() => {
  const boot = document.getElementById('boot');
  if (!boot) return;
  if (prefersReduced || sessionStorage.getItem('bootShown')) {
    boot.remove();
    return;
  }
  sessionStorage.setItem('bootShown', '1');
  document.body.style.overflow = 'hidden';
  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    boot.classList.add('boot--done');
    document.body.style.overflow = '';
    boot.addEventListener('transitionend', () => boot.remove(), { once: true });
  }
  setTimeout(dismiss, 1700);
  boot.addEventListener('click', dismiss);
})();

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
      c: Math.random() > 0.45 ? '196, 181, 253' : '240, 171, 252',
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      if (n.life !== undefined) {
        n.life -= 0.006;
        n.vx *= 0.985;
        n.vy *= 0.985;
      }
    }
    nodes = nodes.filter(n => n.life === undefined || n.life > 0);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.13;
          ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
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
        ctx.strokeStyle = `rgba(232, 121, 249, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${a.c ?? '196, 181, 253'}, ${0.55 * (a.life ?? 1)})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // clicking anywhere sparks a short-lived burst of nodes that weave into the mesh
  window.addEventListener('click', e => {
    if (e.target.closest('a, button, input, .term')) return;
    for (let i = 0; i < 7; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 1.6;
      nodes.push({
        x: e.clientX, y: e.clientY,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        r: Math.random() * 1.6 + 0.8,
        life: 1,
        c: Math.random() > 0.5 ? '196, 181, 253' : '240, 171, 252',
      });
    }
  });
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

/* ---------- scroll progress bar ---------- */
(() => {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- cursor glow ---------- */
(() => {
  const glow = document.getElementById('cursorGlow');
  if (!glow || prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
  window.addEventListener('pointermove', e => {
    glow.style.opacity = '1';
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
  document.documentElement.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
})();

/* ---------- magnetic buttons ---------- */
(() => {
  if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
})();

/* ---------- 3D tilt on the identity card ---------- */
(() => {
  const card = document.querySelector('.idcard');
  if (!card || prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${py * -10}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
})();

/* ---------- interactive terminal ---------- */
(() => {
  const out = document.getElementById('termOut');
  const form = document.getElementById('termForm');
  const input = document.getElementById('termInput');
  const screen = document.getElementById('termScreen');
  if (!out || !form || !input) return;

  const addr = ['nikhil', '.', 'sharma', '275'].join('') + '@' + ['gmail', 'com'].join('.');
  const history = [];
  let histIdx = -1;

  const COMMANDS = {
    help: () => [
      ['sys', 'authorized commands:'],
      ['', '  whoami        identity summary'],
      ['', '  skills        what I work with'],
      ['', '  experience    where I\'ve worked'],
      ['', '  certs         certifications'],
      ['', '  contact       request access to my inbox'],
      ['', '  history       what you typed'],
      ['', '  date          server time (IST)'],
      ['', '  echo <text>   say it back'],
      ['', '  matrix        ...you\'ll see'],
      ['', '  clear         wipe the screen'],
      ['sys', 'tab completes. ↑/↓ recalls. some commands need elevated privileges.'],
    ],
    whoami: () => [
      ['', 'Nikhil Sharma — Senior Associate, Cyber Identity @ PwC AC'],
      ['', 'Saviynt Certified Advanced IGA Professional · Gurugram, IN'],
    ],
    skills: () => [
      ['', 'platforms:   Saviynt EIC, Saviynt SSM 5.5x'],
      ['', 'connectors:  Azure AD/B2C, ServiceNow, SAP, CyberArk, REST, ADSI'],
      ['', 'languages:   Java, SQL, Python, Shell'],
      ['', 'iga:         JML lifecycle, access certification, SoD, audit reporting'],
    ],
    experience: () => [
      ['', '2026—now   PwC Acceleration Centers · Senior Associate, Cyber Identity'],
      ['', '2024—2026  Deloitte · Cyber Identity Consultant'],
      ['', '2021—2024  Wipro · Senior Cyber Security Analyst'],
    ],
    exp: () => COMMANDS.experience(),
    certs: () => [
      ['ok', '✓ Saviynt Certified Advanced IGA Professional'],
      ['ok', '✓ Saviynt Certified IGA Professional'],
      ['ok', '✓ Microsoft AZ-900 Fundamentals'],
    ],
    contact: () => [
      ['ok', '✓ access granted'],
      ['html', `email: <a href="mailto:${addr}">${addr}</a>`],
      ['html', 'linkedin: <a href="https://www.linkedin.com/in/nikhil-sharma275" target="_blank" rel="noopener">/in/nikhil-sharma275</a>'],
      ['html', 'github: <a href="https://github.com/n1khil69" target="_blank" rel="noopener">@n1khil69</a>'],
    ],
    email: () => COMMANDS.contact(),
    clear: () => { out.innerHTML = ''; return []; },
    sudo: arg => arg === 'hire-nikhil'
      ? [['ok', '[sudo] privilege check… passed ✓'], ['ok', 'provisioning role: YOUR_TEAM → nikhil.sharma'], ['', 'ticket auto-approved. drafting offer letter…']]
      : [['err', `sudo: ${arg || ''}: not in the sudoers file. this incident will be reported.`]],
    saviynt: () => [['', 'the platform that pays my bills ✦']],
    ls: () => [['', 'expertise/  experience/  credentials/  inbox.lock']],
    pwd: () => [['', '/home/nikhil/portfolio']],
    history: () => history.length
      ? history.map((c, i) => ['', `  ${String(i + 1).padStart(3)}  ${c}`])
      : [['sys', 'history is empty.']],
    date: () => [['', new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Kolkata',
    }).format(new Date()) + ' IST']],
    echo: arg => [['', arg || '']],
    matrix: () => {
      if (prefersReduced) return [['err', 'matrix: denied — motion is disabled on this device.']];
      startMatrix();
      return [['ok', 'wake up, neo… (click or Esc to exit)']];
    },
  };

  function startMatrix() {
    const c = document.createElement('canvas');
    c.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(5,7,11,0.92);cursor:pointer';
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    const g = c.getContext('2d');
    const fontSize = 16;
    const cols = Math.floor(c.width / fontSize);
    const drops = Array.from({ length: cols }, () => Math.random() * -40);
    const glyphs = 'アイウエオカキクケコサシスセソ0123456789ACDEGIJMNSVY{}<>/=';
    let alive = true;
    function stop() {
      alive = false;
      c.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') stop(); }
    c.addEventListener('click', stop);
    document.addEventListener('keydown', onKey);
    setTimeout(stop, 9000);
    (function rain() {
      if (!alive) return;
      g.fillStyle = 'rgba(5, 7, 11, 0.08)';
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#a78bfa';
      g.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        g.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, y * fontSize);
        drops[i] = y * fontSize > c.height && Math.random() > 0.97 ? 0 : y + 1;
      });
      requestAnimationFrame(rain);
    })();
  }

  function print(kind, text) {
    const p = document.createElement('p');
    p.className = 'term__line' + (kind && kind !== 'html' ? ` term__line--${kind}` : '');
    if (kind === 'html') p.innerHTML = text;
    else p.textContent = text;
    out.appendChild(p);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    history.push(raw);
    histIdx = history.length;
    print('cmd', raw);
    const [cmd, ...rest] = raw.toLowerCase().split(/\s+/);
    const fn = COMMANDS[cmd];
    const lines = fn ? fn(rest.join(' ')) : [['err', `nikhil-sh: command not found: ${cmd} — try 'help'`]];
    lines.forEach(([kind, text]) => print(kind, text));
    screen.scrollTop = screen.scrollHeight;
  });

  let tabMatches = [];
  let tabIdx = 0;
  input.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const prefix = input.value.trim().toLowerCase();
      if (!tabMatches.length) {
        tabMatches = Object.keys(COMMANDS).filter(c => c.startsWith(prefix)).sort();
        tabIdx = 0;
      }
      if (tabMatches.length) {
        input.value = tabMatches[tabIdx % tabMatches.length];
        tabIdx++;
      }
      return;
    }
    tabMatches = [];
    if (e.key === 'ArrowUp' && histIdx > 0) {
      histIdx--;
      input.value = history[histIdx];
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      histIdx = Math.min(histIdx + 1, history.length);
      input.value = history[histIdx] ?? '';
    }
  });

  screen.addEventListener('click', () => input.focus());
})();
