/* Production-preview regression checks and screenshots. Requires Playwright's
   Chromium browser; run explicitly or through the manual Visual Check workflow. */
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const SHOTS = 'shots';
const CONTACT_ENDPOINT = 'https://formsubmit.co/nikhil.sharma275@gmail.com';
const LINKEDIN = 'https://www.linkedin.com/in/n1khil/';
const MIFFY_ACTIVITIES = ['wave', 'hop', 'nap', 'plane', 'ball', 'peek', 'balloon'];
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

async function checkMiffyScene(page, reduced = false) {
  const scene = page.locator('#miffyScene');
  await scene.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#miffyScene')?.dataset.visible === 'true');
  assert.ok(await scene.locator('svg').first().isVisible(), 'Miffy artwork is missing');
  assert.equal(await page.locator('#signatureStudio, #signatureTab, #terminalTab, #termInput').count(), 0,
    'a removed studio or terminal control remains');
  assert.equal(await page.locator('#miffyCharacter').getAttribute('aria-label'), 'Say hello to Miffy');
  assert.equal(await page.locator('#miffyStatus').getAttribute('role'), 'status');

  const hello = page.locator('#miffyCharacter');
  await hello.focus();
  await hello.press('Enter');
  await page.waitForFunction(() => document.querySelector('#miffyScene')?.dataset.state === 'wave');
  assert.ok((await page.locator('#miffyStatus').textContent()).trim(), 'a user action was not announced');
  await hello.press('Tab');
  assert.ok(!(await focused(page, '#miffyCharacter')), 'Miffy control trapped Tab');

  const activityButtons = page.locator('[data-miffy-activity]');
  assert.equal(await activityButtons.count(), 6, 'the activity picker is incomplete');
  for (const activity of MIFFY_ACTIVITIES.filter(activity => activity !== 'wave')) {
    const button = page.locator(`[data-miffy-activity="${activity}"]`);
    await button.click();
    assert.equal(await scene.getAttribute('data-state'), activity, `${activity} did not start`);
    assert.equal(await button.getAttribute('aria-pressed'), 'true', `${activity} does not expose its selected state`);
    assert.equal(await page.locator('[data-miffy-activity][aria-pressed="true"]').count(), 1,
      'more than one activity appears selected');
    const bounds = await button.boundingBox();
    assert.ok(bounds.width >= 44 && bounds.height >= 44, `${activity} has a small touch target`);
    assert.ok((await page.locator('#miffyCaption').textContent()).trim(), `${activity} has no visible caption`);
  }

  const beforeSurprise = await scene.getAttribute('data-state');
  await page.locator('#miffySurprise').click();
  const afterSurprise = await scene.getAttribute('data-state');
  assert.ok(MIFFY_ACTIVITIES.includes(afterSurprise), 'surprise selected an unknown activity');
  assert.notEqual(afterSurprise, beforeSurprise, 'surprise did not choose a different activity');
  assert.ok((await page.locator('#miffyCaption').textContent()).trim(), 'Miffy has no visible caption');
  await page.locator('#miffyCharacter').click();
  await page.waitForFunction(() => document.querySelector('#miffyScene')?.dataset.state === 'wave');

  const motion = page.locator('#miffyMotion');
  if (reduced) {
    assert.equal(await scene.getAttribute('data-motion'), 'reduced');
    assert.ok(await motion.isDisabled(), 'motion can be enabled despite the device preference');
    assert.equal(await motion.getAttribute('aria-label'), 'Motion reduced by your device');
    assert.equal(await scene.evaluate(element => element.getAnimations({ subtree: true })
      .filter(animation => animation.playState === 'running').length), 0,
    'Miffy animations are running with reduced motion');
  } else {
    await motion.click();
    assert.equal(await motion.getAttribute('aria-pressed'), 'true');
    assert.equal(await motion.getAttribute('aria-label'), 'Resume motion');
    assert.equal(await scene.getAttribute('data-motion'), 'paused');
    await hello.click();
    assert.equal(await scene.getAttribute('data-state'), 'wave', 'paused controls cannot select a static pose');
    await motion.click();
    assert.equal(await motion.getAttribute('aria-pressed'), 'false');
    assert.equal(await scene.getAttribute('data-motion'), 'running');
  }
  await noOverflow(page, 'Miffy scene');
}

async function checkMiffyShuffle(page) {
  const scene = page.locator('#miffyScene');
  await scene.scrollIntoViewIfNeeded();
  const seen = [];
  for (let count = 0; count < MIFFY_ACTIVITIES.length * 2; count += 1) {
    await page.locator('#miffySurprise').click();
    const activity = await scene.getAttribute('data-state');
    assert.ok(MIFFY_ACTIVITIES.includes(activity), 'surprise chose an unknown activity');
    assert.notEqual(activity, seen.at(-1), 'surprise repeated the previous activity');
    seen.push(activity);
  }
  for (let start = 0; start < seen.length; start += MIFFY_ACTIVITIES.length) {
    assert.equal(new Set(seen.slice(start, start + MIFFY_ACTIVITIES.length)).size,
      MIFFY_ACTIVITIES.length, 'the surprise sequence repeated before showing every activity');
  }
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
  assert.equal(await page.locator('.contact__email').getAttribute('href'),
    'mailto:nikhil.sharma275@gmail.com');
  const linkedIn = page.locator('a[href*="linkedin.com/"]');
  assert.ok(await linkedIn.count(), 'LinkedIn link is missing');
  for (const link of await linkedIn.all()) assert.equal(await link.getAttribute('href'), LINKEDIN);
}

async function checkContactSubmission(page) {
  await checkContactMarkup(page);
  let submitted;
  let submissions = 0;
  // Fulfill the native navigation locally: no test message reaches FormSubmit.
  await page.route('https://formsubmit.co/**', async route => {
    submissions += 1;
    submitted = route.request();
    await route.fulfill({ status: 200, contentType: 'text/html',
      body: '<!doctype html><html lang="en"><title>Mock submission</title><p id="mockReceipt">POST intercepted for testing.</p></html>' });
  });
  const form = page.locator('#contactForm');
  assert.equal(await form.evaluate(element => element.checkValidity()), false,
    'an empty contact form is valid');
  await page.locator('#contactSubmit').click();
  assert.equal(submissions, 0, 'an empty form submitted');
  await page.locator('#contactName').fill('Test Visitor + Miffy');
  await page.locator('#contactEmail').fill('invalid-email');
  await page.locator('#contactMessage').fill('Mock message: typography & identity.');
  assert.equal(await page.locator('#contactEmail').evaluate(input => input.validity.typeMismatch), true);
  await page.locator('#contactSubmit').click();
  assert.equal(submissions, 0, 'a malformed email submitted');
  await page.locator('#contactEmail').fill('visitor@example.com');
  await page.locator('#contactMessage').fill('Short');
  assert.equal(await form.evaluate(element => element.checkValidity()), false,
    'an undersized message is valid');
  await page.locator('#contactMessage').fill('Mock message: typography & identity.');
  assert.equal(await form.evaluate(element => element.checkValidity()), true);
  await page.locator('#contactSubmit').click();
  await page.locator('#mockReceipt').waitFor();
  assert.equal(submissions, 1);
  assert.equal(submitted.method(), 'POST');
  assert.equal(submitted.url(), CONTACT_ENDPOINT);
  const data = new URLSearchParams(submitted.postData());
  assert.equal(data.get('name'), 'Test Visitor + Miffy');
  assert.equal(data.get('email'), 'visitor@example.com');
  assert.equal(data.get('message'), 'Mock message: typography & identity.');
  assert.equal(data.get('_honey'), '');
  assert.ok(data.get('_subject'), 'contact subject is missing');
  assert.ok(data.get('_template'), 'contact template is missing');
  const returnURL = new URL(BASE);
  returnURL.search = '?message=submitted';
  returnURL.hash = '#contact';
  assert.equal(data.get('_next'), returnURL.href);
  await page.goBack({ waitUntil: 'networkidle' });
  assert.ok(await page.locator('#contactSubmit').isEnabled(), 'back navigation left the form disabled');
  await page.goto(returnURL.href, { waitUntil: 'networkidle' });
  await expectText(page, '#contactStatus', 'your message has been submitted');
  assert.ok(await page.locator('#contactSubmit').isEnabled());
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
      assert.ok(await page.locator('.hero__title').isVisible(), 'hero is missing');
      for (const id of ['about', 'expertise', 'experience', 'lab', 'credentials', 'contact']) {
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
      await checkMiffyScene(page);
      await checkContactMarkup(page);
      await capturePage(page, name);
    });
  }

  await withPage('reduced-motion', { viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }, async page => {
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    const first = await page.locator('#identity-art').evaluate(canvas => canvas.toDataURL());
    await page.waitForTimeout(180); // Observe whether reduced-motion artwork changes over time.
    const second = await page.locator('#identity-art').evaluate(canvas => canvas.toDataURL());
    assert.equal(second, first, 'the reduced-motion sculpture is still moving');
    await checkMiffyScene(page, true);
    await noOverflow(page, 'reduced motion');
    await capturePage(page, 'reduced-motion');
  });

  await withPage('motion-change', { viewport: { width: 390, height: 844 } }, async page => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await checkMiffyScene(page, true);
  });

  await withPage('miffy-shuffle', { viewport: { width: 390, height: 844 } }, checkMiffyShuffle);

  await withPage('direct-links', { viewport: { width: 1280, height: 800 } }, async page => {
    for (const hash of ['#lab', '#signature', '#terminal', '#access']) {
      await page.goto(new URL(hash, BASE).href, { waitUntil: 'networkidle' });
      assert.ok(await page.locator('#lab').isVisible(), `${hash} deep link has no destination`);
      await page.waitForFunction(() => window.location.hash === '#lab');
      await page.waitForFunction(() => document.querySelector('#miffyScene')?.dataset.visible === 'true');
    }
    await page.goto(new URL('404.html', BASE).href, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('a[href="/"]').isVisible(), '404 has no visible return-home link');
    await noOverflow(page, '404');
  });

  await withPage('contact-form', { viewport: { width: 390, height: 844 } }, checkContactSubmission);

  await withPage('without-javascript', { viewport: { width: 390, height: 844 }, javaScriptEnabled: false }, async page => {
    assert.ok(await page.locator('.hero__title').isVisible());
    assert.ok(await page.locator('#experience').isVisible());
    assert.ok(await page.locator('.contact__email').isVisible());
    await checkContactMarkup(page);
    assert.ok(await page.locator('#contactForm').isVisible());
    assert.ok(await page.locator('.noscript-note').isVisible());
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
