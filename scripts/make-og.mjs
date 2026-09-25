/* Generate the portfolio's monochrome social card and app icons. */
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(new URL('../public/', import.meta.url));
mkdirSync(output, { recursive: true });
const ink = '#101010';
const paper = '#f0f0ec';
function star(cx, cy, radius, weight) {
  return `<g stroke="${paper}" stroke-width="${weight}">${Array.from({length:4}, (_, i) => {
    const angle = i * Math.PI / 4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `<path d="M${cx-x} ${cy-y}L${cx+x} ${cy+y}"/>`;
  }).join('')}</g>`;
}
function icon(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect width="100" height="100" rx="21" fill="${ink}"/>${star(50,50,31,5)}</svg>`;
}
let sphere = '';
for (let row = -7; row <= 7; row++) {
  const latitude = row * Math.PI / 16;
  const y = Math.sin(latitude) * 172;
  const r = Math.cos(latitude) * 172;
  sphere += `<ellipse cx="0" cy="${y}" rx="${r}" ry="${r*.16}" fill="none" stroke="#62625e" stroke-width=".7"/>`;
  for (let column=0; column<58; column++) {
    const a = column * Math.PI * 2 / 58;
    sphere += `<circle cx="${Math.cos(a)*r}" cy="${y+Math.sin(a)*r*.16}" r="1.2" fill="${paper}" opacity="${.2+.5*(Math.sin(a)+1)/2}"/>`;
  }
}
for (let col=1;col<7;col++) sphere += `<ellipse cx="0" cy="0" rx="${Math.abs(Math.cos(col*Math.PI/14))*172}" ry="172" fill="none" stroke="#52524e" stroke-width=".6"/>`;
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="${ink}"/>
${star(76,65,18,2.5)}
<g fill="${paper}" font-family="Arial, Helvetica, sans-serif"><text x="110" y="63" font-size="14" font-weight="600">NIKHIL SHARMA</text><text x="110" y="83" font-size="10" letter-spacing="1.5" fill="#93938c">IDENTITY ENGINEER</text></g>
<text x="1140" y="72" font-family="monospace" font-size="10" text-anchor="end" fill="#93938c">GURUGRAM, INDIA</text>
<path d="M60 112H1140" stroke="#363631"/>
<text x="56" y="280" font-family="Arial, Helvetica, sans-serif" font-size="126" letter-spacing="-8" fill="${paper}">Identity.</text>
<text x="60" y="415" font-family="Georgia, Times New Roman, serif" font-style="italic" font-size="122" letter-spacing="-6" fill="${paper}">By design.</text>
<g transform="translate(907 328) rotate(-18)">${sphere}<ellipse rx="218" ry="59" fill="none" stroke="#a6a69d" stroke-width="1" transform="rotate(-28)"/><ellipse rx="208" ry="79" fill="none" stroke="#54544c" stroke-width=".6" transform="rotate(64)"/><circle cx="182" cy="-105" r="4" fill="${paper}"/></g>
<text x="62" y="467" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#a3a39b">Complex identity systems. Beautifully engineered.</text>
<path d="M60 529H1140" stroke="#363631"/>
<text x="62" y="570" font-family="monospace" font-size="11" fill="#b3b3aa">SENIOR ASSOCIATE, CYBER IDENTITY · PwC ACCELERATION CENTERS</text>
<text x="1140" y="570" text-anchor="end" font-family="monospace" font-size="10" fill="#93938c">n1khil69.github.io</text>
</svg>`;
writeFileSync(`${output}/favicon.svg`, icon(32));
for (const [name, svg] of [['og.png',social],['icon-192.png',icon(192)],['icon-512.png',icon(512)]]) {
  const info = await sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile(`${output}/${name}`);
  console.log(`${name}: ${info.width} × ${info.height}, ${(info.size/1024).toFixed(1)} KB`);
}
