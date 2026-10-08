/* Production-preview regression checks and screenshots. Requires Playwright's
   Chromium browser; run explicitly or through the manual Visual Check workflow. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const SHOTS = 'shots';
const CONTACT_ENDPOINT = 'https://formsubmit.co/nikhil.sharma275@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/n1khil/';
mkdirSync(SHOTS, { recursive: true });

const viewports = [
  { name: 'phone-small', width: 320, height: 740 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1920, height: 1080 },
];
const failures = [];
const browser = await chromium.launch();

async function expectText(page, selector, text, timeout = 5000) {
  await page.waitForFunction(({ selector, text }) =>
    document.querySelector(selector)?.textContent.includes(text), { selector, text }, { timeout });
}

async function noOverflow(page, state) {
  const size = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  assert.ok(size.content <= size.viewport + 1,
    `${state}: horizontal overflow (${size.content}px content, ${size.viewport}px viewport)`);
}

async function focused(page, selector) {
  return page.locator(selector).evaluate(element => element === document.activeElement);
}

async function capturePage(page, name) {
  // Bypass smooth scrolling during capture. Each section gets a frame for its
  // arrival animation to register before taking the full-page image.
  await page.evaluate(async () => {
    for (const section of document.querySelectorAll('main > section')) {
      section.scrollIntoView({ behavior: 'instant' });
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: `${SHOTS}/${name}-full.png`, fullPage: true, animations: 'disabled' });
}

async function checkMobileMenu(page) {
  const toggle = page.locator('#menuToggle');
  if (!(await toggle.isVisible())) return;
  await toggle.click();
  await page.locator('#mobileMenu').waitFor({ state: 'visible' });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.locator('#menuClose').focus();
  await page.keyboard.press('Shift+Tab');
  assert.ok(await page.locator('#mobileMenu').evaluate(menu => menu.contains(document.activeElement)),
    'mobile dialog let keyboard focus leave its contents');
  await page.keyboard.press('Escape');
  await page.locator('#mobileMenu').waitFor({ state: 'hidden' });
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.ok(await focused(page, '#menuToggle'), 'Escape did not restore focus to the menu button');
  await toggle.click();
  await page.locator('#mobileMenu a[href="#about"]').click();
  await page.locator('#mobileMenu').waitFor({ state: 'hidden' });
  assert.ok(await focused(page, '#about'), 'mobile section navigation did not focus its destination');
  await noOverflow(page, 'after mobile navigation');
}

async function checkRemovedPlayground(page) {
  assert.equal(await page.locator('#lab, #miffyPlayground, #miffyWorldMap, #miffyScene, #miffyHuntHud, .miffy-peeker, .wonder-dialog, .mm-home, .mm-type-controls, .mm-disco, #miffyPlanetPortal').count(), 0, 'removed playground returned');
  assert.equal(await page.locator('a[href="#lab"]').count(), 0, 'link to removed section remains');
}

async function checkContactMarkup(page) {
  const form = page.locator('#contactForm');
  assert.equal(await form.getAttribute('action'), CONTACT_ENDPOINT);
  assert.equal((await form.getAttribute('method')).toLowerCase(), 'post');
  for (const name of ['name', 'email', 'message']) {
    assert.ok(await form.locator(`[name="${name}"]`).evaluate(input => input.required),
      `${name} is not a required contact field`);
  }
  assert.equal(await form.locator('[name="email"]').getAttribute('type'), 'email');
  assert.equal(await form.locator('[name="_captcha"][value="false"]').count(), 0,
    'the form disables provider spam protection');
  assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
  assert.equal(await page.locator('.contact__form-link').getAttribute('href'), '#contactForm');
  const linkedIn = page.locator('a[href*="linkedin.com/"]');
  assert.ok(await linkedIn.count(), 'LinkedIn link is missing');
  for (const link of await linkedIn.all()) assert.equal(await link.getAttribute('href'), LINKEDIN);
}

async function checkContactSubmission(page) {
  await checkContactMarkup(page);
  let submissions = 0;
  await page.route('https://formsubmit.co/**', async route => {
    submissions++;
    assert.equal(route.request().method(), 'POST');
    assert.equal(route.request().url(), 'https://formsubmit.co/ajax/nikhil.sharma275@gmail.com');
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:submissions>1})});
  });
  await page.locator('#contactSubmit').click();
  assert.equal(submissions,0);
  await page.locator('#contactName').fill('Test Visitor');
  await page.locator('#contactEmail').fill('visitor@example.invalid');
  await page.locator('#contactMessage').fill('Mock message: typography and identity.');
  await page.locator('#contactSubmit').click();
  await expectText(page,'#contactStatus','did not confirm');
  assert.ok(await page.locator('#contactSubmit').isEnabled());
  assert.equal(await page.locator('#miffyDeliveryCard').count(),0);
  await page.locator('#contactSubmit').click();
  await page.locator('#miffyDeliveryCard').waitFor({state:'visible'});
  assert.equal(submissions,2);
}

async function withPage(name, options, run) {
  const context = await browser.newContext(options);
  // Delivery tests install their own mock. Every other context is prevented
  // from reaching the mail provider, including script-free form submissions.
  await context.route('https://formsubmit.co/**', route => route.abort('blockedbyclient'));
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await run(page);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    await page.screenshot({ path: `${SHOTS}/${name}-failure.png`, animations: 'disabled' }).catch(() => {});
  } finally {
    if (errors.length) failures.push(`${name}: runtime/console errors: ${[...new Set(errors)].join(' | ')}`);
    await context.close();
  }
}

try {
  for (const viewport of viewports) {
    const { name, width, height } = viewport;
    await withPage(name, { viewport: { width, height }, hasTouch: width < 761 }, async page => {
      assert.ok(await page.locator('#heroTitle').isVisible(), 'hero is missing');
      for (const id of ['about', 'expertise', 'experience', 'credentials', 'contact']) {
        assert.ok(await page.locator(`#${id}`).isVisible(), `${id} section is missing`);
      }
      await noOverflow(page, 'initial page');
      await page.screenshot({ path: `${SHOTS}/${name}-top.png`, animations: 'disabled' });
      await checkMobileMenu(page);
      const disclosure = page.locator('.expertise-item').nth(1);
      await disclosure.locator('summary').click();
      assert.ok(await disclosure.evaluate(element => element.open), 'expertise disclosure did not expand');
      await noOverflow(page, 'expanded expertise');
      await disclosure.locator('summary').click();
      await checkRemovedPlayground(page);
      await page.locator('#careerNext').click();
      assert.equal(await page.locator('#careerTab1').getAttribute('aria-selected'),'true');
      await page.locator('#themeToggle').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
      for (const [index, color] of ['rgb(52, 70, 61)', 'rgb(57, 68, 56)', 'rgb(61, 72, 67)'].entries()) {
        await page.locator('#careerTab'+index).click();
        assert.equal(await page.locator('#careerPanel'+index+' .career-art').evaluate(el=>getComputedStyle(el).backgroundColor),color);
      }
      await page.locator('#themeToggle').click();
      await checkContactMarkup(page);
      await capturePage(page, name);
    });
  }

  await withPage('reduced-motion', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }, async page => {
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.equal(await page.locator('.wonder-dialog[open]').count(), 0);

    await checkRemovedPlayground(page);
    await noOverflow(page, 'reduced motion');
    await capturePage(page, 'reduced-motion');
  });

  await withPage('motion-change', { viewport: { width: 390, height: 844 } }, async page => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await checkRemovedPlayground(page);
  });


  await withPage('direct-links', { viewport: { width: 1280, height: 800 } }, async page => {
    for (const hash of ['#lab', '#signature', '#terminal', '#access']) {
      await page.goto(new URL(hash, BASE).href, { waitUntil: 'networkidle' });
      assert.ok(await page.locator('#about').isVisible(), `${hash} deep link has no destination`);
      await page.waitForFunction(() => window.location.hash === '#about');
      await checkRemovedPlayground(page);
    }
    await page.goto(new URL('404.html', BASE).href, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('a[href="/"]').isVisible(), '404 has no visible return-home link');
    await noOverflow(page, '404');
  });

  await withPage('contact-form', { viewport: { width: 390, height: 844 } }, checkContactSubmission);

  await withPage('without-javascript', { viewport: { width: 390, height: 844 }, javaScriptEnabled: false }, async page => {
    assert.ok(await page.locator('#heroTitle').isVisible());
    assert.ok(await page.locator('#experience').isVisible());
    assert.ok(await page.locator('.contact__form-link').isVisible());
    await checkContactMarkup(page);
    assert.ok(await page.locator('#contactForm').isVisible());
    assert.equal(await page.locator('#lab').count(), 0);
    await page.screenshot({ path: `${SHOTS}/without-javascript.png`, fullPage: true });
  });
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`VISUAL CHECK FAILED:\n - ${failures.join('\n - ')}`);
  process.exitCode = 1;
} else {
  console.log('Visual and interaction checks passed at all five widths, with reduced motion and without JavaScript.');
}
