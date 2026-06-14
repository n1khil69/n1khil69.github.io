/* interactive terminal CLI — identity-aware shell.
   tab-completes, recalls history with ↑/↓, hides a matrix easter egg. */

import { prefersReduced } from '../core/capabilities.js';

export function initTerminal() {
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
    c.style.cssText = 'position:fixed;inset:0;z-index:2000;background:rgba(14,17,22,0.92);cursor:pointer';
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
      g.fillStyle = 'rgba(14, 17, 22, 0.08)';
      g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = '#38e1ff';
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
}
