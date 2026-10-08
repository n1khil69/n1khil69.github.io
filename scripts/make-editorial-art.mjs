import { mkdirSync, writeFileSync } from 'node:fs';
import { drawMiffy, outlined } from '../src/ui/miffy-shape.js';

const ink = '#6a0c06';
function bunny(x, y, s, dress = '#d29b75', holding = false) {
  const m = drawMiffy(x, y, s);
  return `<g stroke="${ink}" stroke-width="${2.7 * s}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${m.footLeft} ${m.footRight}" fill="#f6f0df"/>
    <path d="${m.dress}" fill="${dress}"/>
    <path d="${holding ? m.armsHolding : m.armLeft + ' ' + m.armRight}" fill="#f6f0df"/>
    ${outlined(m.head, 2.7 * s, 'fill="#f6f0df"')}
    ${m.eyes.map(e => `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" fill="${ink}" stroke="none"/>`).join('')}
    <path d="${m.mouth}" fill="none"/>
  </g>`;
}
const svg = (box, art) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none">${art}</svg>`;
const flower = (x, y, size=1) => `<g transform="translate(${x} ${y}) scale(${size})" stroke="${ink}" stroke-width="2" stroke-linecap="round"><path d="M0 0V45M0 29Q-20 30-18 17Q-4 17 0 29M0 38Q20 33 17 24Q5 25 0 38"/><path d="M0-7C-14-27-29-2-10 3C-30 13-10 30 0 13C10 30 29 13 11 3C29-2 13-27 0-7Z" fill="#e9c797"/><circle r="6" cy="3" fill="#6a0c06"/></g>`;
mkdirSync('public/art', {recursive:true});
writeFileSync('public/art/miffy-landscape.svg', svg('0 0 1200 560', `
<rect width="1200" height="560" fill="#e3e2ce"/>
<circle cx="892" cy="110" r="52" fill="#d8ad7d"/>
<g stroke="${ink}" stroke-width="1.5" opacity=".5"><path d="M153 141q14-17 28 0q14-17 28 0M213 116q9-11 18 0q9-11 18 0M736 106q10-13 20 0q10-13 20 0"/></g>
<path d="M0 343Q141 243 305 307T603 295T900 268T1200 322V560H0Z" fill="#b6c7aa"/>
<path d="M0 423Q217 334 435 377T816 358T1200 375V560H0Z" fill="#92ab8b"/>
<path d="M0 502Q255 377 533 442T1200 431V560H0Z" fill="#c5cbb0"/>
<path d="M631 367Q562 399 653 438T735 560H900Q750 449 711 432T697 367Z" fill="#e4d9ba"/>
<g stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"><path d="M213 263V164"/><path d="M213 211L175 188M213 235L252 207"/><path d="M213 87C152 88 122 155 155 189C119 237 173 266 214 243C260 269 302 225 273 192C304 152 269 87 213 87Z" fill="#8fa985"/><path d="M213 149V369M213 238L174 211M213 273L251 238"/><path d="M598 364V269L663 222L729 269V364Z" fill="#e8dec4"/><path d="M584 272L663 210L742 272Z" fill="#a8755b"/><path d="M650 364V318a17 17 0 0 1 34 0v46" fill="#b4c0a1"/><rect x="609" y="287" width="23" height="29" fill="#d2b17f"/><path d="M621 287V316M609 301H632"/><circle cx="676" cy="338" r="1.5" fill="${ink}"/><path d="M700 237V211H717V250" fill="#a8755b"/></g>
<path d="M701 190q-10-14 0-25q12-15 0-30" stroke="${ink}" stroke-width="2" opacity=".3"/>
<ellipse cx="871" cy="479" rx="65" ry="8" fill="#758c7040"/>
${bunny(867, 316, 1.08, '#a4654b')}
<g stroke="${ink}" stroke-width="2" stroke-linecap="round"><path d="M1011 427V370M1011 410L996 396M1011 402L1025 385"/><path d="M992 372C984 344 1028 333 1035 360C1046 391 997 397 992 372Z" fill="#aab999"/><path d="M330 451h140M340 451v40M460 451v40M330 431h140M337 411h126M345 411v40M456 411v40"/></g>
${flower(124,465, .75)}${flower(157,487,.6)}${flower(1047,492,.65)}${flower(1101,453,.9)}
<g stroke="${ink}" stroke-width="1.3" opacity=".4"><path d="M511 490l3-11l5 10M284 530l2-10l6 9M966 530l3-12l5 10M58 421l4-11l3 10M1117 399l4-9l4 9"/></g>
`));
writeFileSync('public/art/miffy-study.svg', svg('0 0 720 800', `
<rect width="720" height="800" fill="#d1b5a0"/>
<path d="M100 800V287a260 260 0 0 1 520 0v513" fill="#ebe2ca" stroke="${ink}" stroke-width="2"/>
<path d="M140 520V290a220 220 0 0 1 440 0v230" fill="#b7c5a8" stroke="${ink}" stroke-width="2"/>
<circle cx="434" cy="225" r="47" fill="#e3c291"/>
<path d="M141 383Q262 292 370 383T580 361V519H141Z" fill="#95ac8c"/>
<path d="M360 70V507M140 313H580" stroke="${ink}" stroke-width="2"/>
<path d="M184 549V466a70 70 0 0 1 140 0v83" fill="#a47558" stroke="${ink}" stroke-width="3"/>
${bunny(307, 357, 1.31, '#7d9777', true)}
<g stroke="${ink}" stroke-width="3" stroke-linejoin="round"><ellipse cx="358" cy="558" rx="211" ry="55" fill="#c18d65"/><path d="M147 558v17c0 70 422 70 422 0v-17" fill="#d5ad82"/><path d="M191 592L168 773M525 592L549 773"/><ellipse cx="358" cy="558" rx="211" ry="55" fill="#c79d75"/><path d="M274 535L306 505L393 529L362 566Z" fill="#f2ead4"/><path d="M306 505l42 38l45-14M348 543l14 23" stroke-width="1.6"/><path d="M441 526V559Q459 572 477 559V526Z" fill="#ebe2ca"/><path d="M477 532h11c14 0 11 24-11 20"/><path d="M450 511q-9-11 0-20M464 508q-8-12 0-21" opacity=".5" stroke-width="1.8"/></g>
<g stroke="${ink}" stroke-width="2"><path d="M82 669L98 767H150L166 669Z" fill="#a06c52"/><path d="M123 670V582M121 624Q65 624 74 587Q112 582 121 624M126 649Q177 641 169 611Q135 608 126 649" fill="#899f7c"/></g>
<path d="M0 780H720" stroke="${ink}" stroke-width="1.5"/>
`));
