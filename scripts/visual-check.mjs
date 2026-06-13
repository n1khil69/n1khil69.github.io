/* Headless smoke test + screenshot capture.
   Drives the built site (served by `vite preview`) across several viewports,
   fails on any console / page error or missing hero, and saves screenshots
   to ./shots for upload as a CI artifact. Run from CI where a browser is
   reachable — locally the Chromium CDN is blocked by the egress allowlist. */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const SHOTS = 'shots';
mkdirSync(SHOTS, { recursive: true });

const viewports = [
  { n: 'mobile', w: 360, h: 780 },
  { n: 'tablet', w: 768, h: 1024 },
  { n: 'laptop', w: 1280, h: 800 },
  { n: 'desktop', w: 1920, h: 1080 },
];

const failures = [];
const browser = await chromium.launch();

for (const v of viewports) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3800); // preloader (~2.3s) + hero intro

  await page.screenshot({ path: `${SHOTS}/${v.n}-top.png` });

  // assertions
  if (!(await page.locator('.hero__title').isVisible())) failures.push(`${v.n}: hero title not visible`);
  if (!(await page.locator('#about').isVisible())) failures.push(`${v.n}: about section missing`);

  // scroll the full page so reveals fire, then full-page shot
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 220));
    }
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOTS}/${v.n}-full.png`, fullPage: true });

  if (errors.length) failures.push(`${v.n}: console errors -> ${errors.join(' || ')}`);
  await ctx.close();
}

// reduced-motion pass (should render content statically, no WebGL/errors)
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
