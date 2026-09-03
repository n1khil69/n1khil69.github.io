/* Generates the social share card, PWA icons and favicon from inline SVG in the
   site's "Optics" palette (obsidian #04060A, prism cyan/magenta/gold, amber for
   live status), rasterised with sharp. Run after editing: `npm run og`. Outputs
   land in public/ (Vite copies them to the dist root) and are committed.

   The card is built from the same parts as the page: a survey lattice, a pane of
   glass with a lit edge, the hexagon sigil, and the headline with its one
   dispersed word. Display text falls back to a system serif/grotesque — the
   rasteriser has no webfonts — so the palette and the sigil carry the brand. */

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(here, '../public');
mkdirSync(PUBLIC, { recursive: true });

const VOID = '#04060A';
const CYAN = '#7FE7FF';
const MAGENTA = '#FF79C0';
const GOLD = '#FFD08A';
const LIVE = '#FFB44D';
const TEXT = '#EDF2F9';
const MUTED = '#94A2B4';
const FAINT = '#4A5665';
const LINE = 'rgba(190,224,255,0.07)';

const SERIF = 'Liberation Serif, DejaVu Serif, Times New Roman, serif';
const MONO = 'DejaVu Sans Mono, Liberation Mono, monospace';

/* the survey lattice the glass sits on */
function lattice(w, h, step = 104) {
  let out = '';
  for (let x = step; x < w; x += step) out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${LINE}" stroke-width="1"/>`;
  for (let y = step; y < h; y += step) out += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${LINE}" stroke-width="1"/>`;
  return out;
}

/* the hexagon sigil, matching the one in the nav capsule */
function sigil(x, y, size, stroke) {
  const s = size / 32;
  return `<g transform="translate(${x},${y}) scale(${s})" fill="none" stroke="${stroke}"
      stroke-width="1.7" stroke-linejoin="round">
    <path d="M16 2.6 27.4 9v14L16 29.4 4.6 23V9L16 2.6Z"/>
    <path d="M11.4 21V11l9.2 10V11" stroke-width="2.4"/>
  </g>`;
}

/* ---- 1200×630 Open Graph card ---- */
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="prism" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0%" stop-color="${CYAN}"/>
      <stop offset="38%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="${MAGENTA}"/>
      <stop offset="100%" stop-color="${GOLD}"/>
    </linearGradient>
    <linearGradient id="pane" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.075)"/>
      <stop offset="46%" stop-color="rgba(255,255,255,0.018)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.05)"/>
    </linearGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0.6">
      <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.75"/>
      <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="62%" stop-color="${MAGENTA}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0.2"/>
    </linearGradient>
    <radialGradient id="lamp" cx="0.24" cy="0.1" r="0.85">
      <stop offset="0%" stop-color="${CYAN}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${CYAN}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bounce" cx="0.86" cy="0.94" r="0.7">
      <stop offset="0%" stop-color="${LIVE}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${LIVE}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${VOID}"/>
  <g>${lattice(1200, 630)}</g>
  <rect width="1200" height="630" fill="url(#lamp)"/>
  <rect width="1200" height="630" fill="url(#bounce)"/>

  <!-- the pane -->
  <rect x="56" y="52" width="1088" height="526" rx="30" fill="url(#pane)"/>
  <rect x="56.5" y="52.5" width="1087" height="525" rx="30" fill="none" stroke="url(#rim)" stroke-width="1.4"/>

  ${sigil(104, 100, 40, CYAN)}
  <text x="158" y="128" font-family="${MONO}" font-size="19" letter-spacing="3.4" fill="${TEXT}">NIKHIL SHARMA</text>
  <text x="104" y="176" font-family="${MONO}" font-size="15" letter-spacing="3.2" fill="${MUTED}">IDENTITY GOVERNANCE ENGINEER</text>

  <g font-family="${SERIF}" font-size="78">
    <text x="102" y="288" fill="${TEXT}">Enterprise identity</text>
    <text x="102" y="374" fill="${TEXT}"><tspan font-style="italic" fill="url(#prism)">governance</tspan>, built</text>
    <text x="102" y="460" fill="${TEXT}">for audit<tspan fill="${CYAN}">.</tspan></text>
  </g>

  <line x1="104" y1="506" x2="1096" y2="506" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <text x="104" y="542" font-family="${MONO}" font-size="16" letter-spacing="2.4" fill="${MUTED}">
    SENIOR ASSOCIATE, CYBER IDENTITY <tspan fill="${FAINT}">·</tspan> PwC AC <tspan fill="${FAINT}">·</tspan> SAVIYNT EIC
  </text>
  <g transform="translate(972, 536)">
    <circle cx="0" cy="0" r="5" fill="${LIVE}"/>
    <text x="15" y="5" font-family="${MONO}" font-size="15" letter-spacing="2.4" fill="${LIVE}">GURUGRAM, IN</text>
  </g>
</svg>`;

/* ---- square app icon: the sigil on obsidian, lit from above ---- */
function iconSvg(size) {
  const s = size;
  const r = Math.round(s * 0.22);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#101722"/>
      <stop offset="100%" stop-color="${VOID}"/>
    </linearGradient>
    <linearGradient id="e" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${CYAN}"/>
      <stop offset="55%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="${MAGENTA}"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${r}" fill="url(#g)"/>
  <rect x="1" y="1" width="${s - 2}" height="${s - 2}" rx="${r - 1}" fill="none"
        stroke="url(#e)" stroke-opacity="0.55" stroke-width="${Math.max(1, s * 0.008)}"/>
  ${sigil(s * 0.2, s * 0.2, s * 0.6, '#EDF2F9')}
</svg>`;
}

/* favicon shares the icon geometry, kept as vector */
writeFileSync(resolve(PUBLIC, 'favicon.svg'), iconSvg(32).trim() + '\n');
console.log('✓ public/favicon.svg');

const jobs = [
  { name: 'og.png', svg: ogSvg },
  { name: 'icon-512.png', svg: iconSvg(512) },
  { name: 'icon-192.png', svg: iconSvg(192) },
];

for (const j of jobs) {
  const info = await sharp(Buffer.from(j.svg)).png({ compressionLevel: 9 }).toFile(resolve(PUBLIC, j.name));
  console.log(`✓ public/${j.name}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)}kb`);
}
console.log('done.');
