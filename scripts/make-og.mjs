/* Generates the social share card + PWA icons from inline SVG, in the actual
   "Refined Cyber" palette (charcoal #0e1116 + signal amber #ffb02e), rasterized
   with sharp. Run once after editing: `node scripts/make-og.mjs`. The outputs land
   in public/ (which Vite copies to the dist root) and are committed.

   favicon.svg shares the same amber sigil so the brand reads consistently. Display
   text falls back to a system grotesque (Liberation/DejaVu) since Space Grotesk
   isn't installed for the rasterizer — the amber sigil + palette carry the brand. */

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(here, '../public');
mkdirSync(PUBLIC, { recursive: true });

const BG = '#0e1116';
const ACC = '#ffb02e';
const ON_ACC = '#1b1303';
const TEXT = '#e6edf5';
const MUTED = '#7d8590';
const LINE = 'rgba(176,197,224,0.10)';
const SANS = 'Liberation Sans, DejaVu Sans, sans-serif';
const MONO = 'DejaVu Sans Mono, Liberation Mono, monospace';

/* faint vertical grid lines, mirroring the site's .grid-lines motif */
function gridLines(w, h, step = 150) {
  let out = '';
  for (let x = step; x < w; x += step) {
    out += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="${LINE}" stroke-width="1"/>`;
  }
  return out;
}

/* ---- 1200×630 Open Graph card ---- */
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <g opacity="0.6">${gridLines(1200, 630)}</g>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="${LINE}" stroke-width="1"/>
  <!-- top accent hairline -->
  <rect x="80" y="80" width="120" height="3" fill="${ACC}"/>

  <!-- sigil -->
  <rect x="80" y="108" width="74" height="74" fill="${ACC}"/>
  <text x="117" y="160" font-family="${SANS}" font-weight="700" font-size="36"
        fill="${ON_ACC}" text-anchor="middle">NS</text>

  <!-- mono eyebrow -->
  <text x="80" y="246" font-family="${MONO}" font-size="22" letter-spacing="2"
        fill="${MUTED}">~/nikhil $ whoami</text>

  <!-- headline -->
  <g font-family="${SANS}" font-weight="700" font-size="78" letter-spacing="-2">
    <text x="78" y="350" fill="${TEXT}">I build the systems</text>
    <text x="78" y="440" fill="${TEXT}">that decide <tspan fill="${ACC}">who</tspan></text>
    <text x="78" y="530" fill="${TEXT}">gets access.</text>
  </g>

  <!-- footer -->
  <text x="80" y="600" font-family="${MONO}" font-size="20" letter-spacing="1" fill="${MUTED}">
    NIKHIL SHARMA <tspan fill="${ACC}">·</tspan> SENIOR ASSOCIATE, CYBER IDENTITY <tspan fill="${ACC}">·</tspan> PwC AC
  </text>
  <g transform="translate(1040, 588)">
    <circle cx="0" cy="0" r="6" fill="${ACC}"/>
    <text x="16" y="6" font-family="${MONO}" font-size="20" letter-spacing="1" fill="${MUTED}">active</text>
  </g>
</svg>`;

/* ---- square app icon (charcoal field, amber sigil) ---- */
function iconSvg(size) {
  const s = size;
  const pad = Math.round(s * 0.16);
  const inner = s - pad * 2;
  const r = Math.round(s * 0.04);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${BG}"/>
  <rect x="${pad}" y="${pad}" width="${inner}" height="${inner}" rx="${r}" fill="${ACC}"/>
  <text x="${s / 2}" y="${s / 2}" font-family="${SANS}" font-weight="700"
        font-size="${Math.round(inner * 0.5)}" fill="${ON_ACC}"
        text-anchor="middle" dominant-baseline="central">NS</text>
</svg>`;
}

const jobs = [
  { name: 'og.png', svg: ogSvg, w: 1200, h: 630 },
  { name: 'icon-512.png', svg: iconSvg(512), w: 512, h: 512 },
  { name: 'icon-192.png', svg: iconSvg(192), w: 192, h: 192 },
];

for (const j of jobs) {
  const info = await sharp(Buffer.from(j.svg))
    .png({ compressionLevel: 9 })
    .toFile(resolve(PUBLIC, j.name));
  console.log(`✓ public/${j.name}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)}kb`);
}
console.log('done.');
