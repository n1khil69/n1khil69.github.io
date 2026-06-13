/* Headless smoke test + screenshot capture.
   Drives the built site (served by `vite preview`) across several viewports,
   fails on any console / page error, a missing hero, or a "washed out" hero
   (a pixel-brightness guard against the WebGL lattice saturating the screen),
   and saves screenshots to ./shots for upload as a CI artifact.
   Runs in CI where a browser is reachable — locally the Chromium CDN is
   blocked by the egress allowlist. */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const SHOTS = 'shots';
mkdirSync(SHOTS, { recursive: true });

const viewports = [
  { n: 'mobile', w: 360, h: 780 },
  { n: 'tablet', w: 768, h: 1024 },
  { n: 'laptop', w: 1280, h: 800 },
  { n: 'desktop', w: 1920, h: 1080, forceFull: true }, // exercise the WebGL path
];

const failures = [];
const browser = await chromium.launch({
  args: ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader'],
});

async function meanLuma(file) {
  const { channels } = await sharp(file).stats();
  const [r, g, b] = channels.map(c => c.mean);
  return { luma: 0.299 * r + 0.587 * g + 0.114 * b, r, g, b };
}

for (const v of viewports) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  const url = v.forceFull ? `${BASE}?tier=full` : BASE;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(v.forceFull ? 4500 : 3800); // preloader + intro (+WebGL warmup)

  const top = `${SHOTS}/${v.n}-top.png`;
  await page.screenshot({ path: top });

  if (!(await page.locator('.hero__title').isVisible())) failures.push(`${v.n}: hero title not visible`);
  if (!(await page.locator('#about').isVisible())) failures.push(`${v.n}: about section missing`);

  // brightness guard: the design is near-black; a full lime/white wash spikes luma
  const { luma, r, g, b } = await meanLuma(top);
  if (luma > 120) {
    failures.push(`${v.n}: hero too bright (mean luma ${luma.toFixed(0)}, rgb ${r.toFixed(0)}/${g.toFixed(0)}/${b.toFixed(0)}) — possible WebGL wash`);
  }

  // scroll the whole page so reveals fire, then full-page shot
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(res => setTimeout(res, 220));
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOTS}/${v.n}-full.png`, fullPage: true });

  if (errors.length) failures.push(`${v.n}: console errors -> ${errors.join(' || ')}`);
  await ctx.close();
}

// reduced-motion pass (content static, no WebGL/errors)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  if (!(await page.locator('.hero__title').isVisible())) failures.push('reduced: hero title not visible');
  await page.screenshot({ path: `${SHOTS}/reduced-motion.png`, fullPage: true });
  if (errors.length) failures.push(`reduced: page errors -> ${errors.join(' || ')}`);
  await ctx.close();
}

await browser.close();

if (failures.length) {
  console.error('VISUAL CHECK FAILED:\n - ' + failures.join('\n - '));
  process.exit(1);
}
console.log('Visual check passed for all viewports.');
