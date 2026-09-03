/* Interactive terminal — a keyboard-driven summary of the profile.
   Tab completes, ↑/↓ recalls history. Every command returns real content;
   there are no gag responses. */

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
      ['sys', 'available commands:'],
      ['', '  whoami        profile summary'],
      ['', '  skills        platforms, connectors and languages'],
      ['', '  experience    employment history'],
      ['', '  certs         certifications'],
      ['', '  contact       email and profile links'],
      ['', '  history       commands entered this session'],
      ['', '  date          current time (IST)'],
      ['', '  echo <text>   print the given text'],
      ['', '  clear         clear the screen'],
      ['sys', 'Tab completes a command. ↑/↓ recalls history.'],
    ],
    whoami: () => [
      ['', 'Nikhil Sharma — Senior Associate, Cyber Identity'],
      ['', 'PwC Acceleration Centers · Gurugram, India'],
      ['', 'Saviynt Certified Advanced IGA Professional'],
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
      ['html', `email:    <a href="mailto:${addr}">${addr}</a>`],
      ['html', 'linkedin: <a href="https://www.linkedin.com/in/nikhil-sharma275" target="_blank" rel="noopener">/in/nikhil-sharma275</a>'],
      ['html', 'github:   <a href="https://github.com/n1khil69" target="_blank" rel="noopener">@n1khil69</a>'],
    ],
    email: () => COMMANDS.contact(),
    clear: () => { out.innerHTML = ''; return []; },
    history: () => history.length
      ? history.map((c, i) => ['', `  ${String(i + 1).padStart(3)}  ${c}`])
      : [['sys', 'history is empty.']],
    date: () => [['', new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Kolkata',
    }).format(new Date()) + ' IST']],
    echo: arg => [['', arg || '']],
  };

  function print(kind, text) {
    const p = document.createElement('p');
    p.className = 'term__line' + (kind && kind !== 'html' ? ` term__line--${kind}` : '');
    if (kind === 'html') p.innerHTML = text;
    else p.textContent = text;
    out.appendChild(p);
  }

  /* every command run pushes light into the substrate below the page */
  const pulse = (sound) => {
    const r = screen.getBoundingClientRect();
    document.dispatchEvent(new CustomEvent('ns:pulse', {
      detail: { x: r.left + r.width / 2, y: r.top + r.height / 2, sound },
    }));
  };

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
    const lines = fn ? fn(rest.join(' ')) : [['err', `nikhil-sh: command not found: ${cmd}. Type 'help' for the list.`]];
    lines.forEach(([kind, text]) => print(kind, text));
    screen.scrollTop = screen.scrollHeight;
    pulse(lines.some(([k]) => k === 'err') ? 'deny' : 'key');
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
