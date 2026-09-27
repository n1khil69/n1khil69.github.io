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
  // The dialog's close event, which resets the toggle, fires a task after it hides.
  await page.waitForFunction(() => document.querySelector('#menuToggle').getAttribute('aria-expanded') === 'false');
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

async function checkMiffyGarden(page) {
  const scene = page.locator('#miffyScene');
  await scene.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#miffyScene')?.dataset.visible === 'true');
  const plant = page.locator('#miffyPlant');
  const flowers = page.locator('#miffyGarden .miffy-flower');
  assert.equal(await flowers.count(), 0, 'a new visitor’s garden is not empty');
  assert.match(await plant.textContent(), /Plant a flower/);
  assert.equal(await plant.evaluate(button => Boolean(button.closest('[aria-hidden="true"]'))), false,
    'the plant button is hidden from assistive technology');
  const bounds = await plant.boundingBox();
  assert.ok(bounds.height >= 20 && bounds.width >= 44, 'the plant button is too small to tap');
  for (let planted = 1; planted <= 6; planted += 1) {
    await plant.click();
    assert.equal(await flowers.count(), planted, `flower ${planted} did not appear`);
    assert.equal(await scene.getAttribute('data-state'), 'plant');
    assert.ok((await page.locator('#miffyStatus').textContent()).trim(), 'planting was not announced');
  }
  assert.match(await plant.textContent(), /New garden/, 'a full garden does not offer a fresh start');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await flowers.count(), 6, 'the garden was not remembered');
  await plant.click();
  await page.waitForFunction(() => !document.querySelector('#miffyGarden .miffy-flower'));
  assert.match(await plant.textContent(), /Plant a flower/);
  assert.equal(await page.locator('#miffySecurityToggle, .miffy-audit-card').count(), 0, 'the old audit card remains');
}

async function checkMiffySurprise(page) {
  const miffy = page.locator('#miffyCharacter');
  const letter = page.locator('#miffyLetter');
  await page.locator('#miffyScene').scrollIntoViewIfNeeded();
  for (let tap = 1; tap <= 4; tap += 1) await miffy.click();
  assert.equal(await letter.evaluate(dialog => dialog.open), false, 'the surprise opened too early');
  await miffy.click();
  await page.waitForFunction(() => document.getElementById('miffyLetter')?.open);
  assert.match(await letter.textContent(), /Sanguuuu/);
  assert.ok(await letter.evaluate(dialog => dialog.contains(document.activeElement)), 'focus did not move into the note');
  assert.equal(await page.locator('#miffyScene').getAttribute('data-state'), 'love');
  assert.equal(await page.locator('[data-outfit="hearts"]').getAttribute('aria-pressed'), 'true',
    'the surprise did not put on the hearts dress');
  await noOverflow(page, 'surprise note');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('miffyLetter').open);
  assert.ok(await focused(page, '#miffyCharacter'), 'closing the note did not return focus to Miffy');

  // Having found it, she is remembered: Miffy greets her by name on the next visit.
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#miffyScene').scrollIntoViewIfNeeded();
  await expectText(page, '#miffyCaption', 'Sanguuuu');
  assert.equal(await page.locator('#miffyScene').getAttribute('data-state'), 'wave');
}

async function checkMiffyBlush(page) {
  const miffy = page.locator('#miffyCharacter');
  await page.locator('#miffyScene').scrollIntoViewIfNeeded();
  assert.doesNotMatch(await page.locator('#miffyCaption').textContent(), /Sanguuuu/,
    'a new visitor was greeted as Sanguuuu');
  const box = await miffy.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(1500);
  await page.mouse.up();
  assert.equal(await page.locator('#miffyScene').getAttribute('data-state'), 'blush', 'holding Miffy did not make her blush');
  await expectText(page, '#miffyStatus', 'blush');
}

// The site is ink and paper: no painted colour in the given parts of the page.
async function expectMonochrome(page, selector) {
  const tinted = await page.locator(selector).evaluateAll(roots => {
    const channels = value => value.match(/\d+(\.\d+)?/g)?.slice(0, 3).map(Number) || [];
    const found = [];
    for (const root of roots) {
      for (const element of [root, ...root.querySelectorAll('*')]) {
        const style = getComputedStyle(element);
        for (const property of ['color', 'backgroundColor', 'borderTopColor', 'outlineColor', 'fill', 'stroke']) {
          const value = style[property];
          if (!value.startsWith('rgb')) continue;
          const [r, g, b] = channels(value);
          if (Math.max(r, g, b) - Math.min(r, g, b) > 12) found.push(`${element.tagName.toLowerCase()}.${element.getAttribute('class') || ''} ${property} ${value}`);
        }
      }
    }
    return found.slice(0, 5);
  });
  assert.deepEqual(tinted, [], `${selector} is not monochrome`);
}

async function closeDialog(page, id) {
  await page.keyboard.press('Escape');
  await page.waitForFunction(id => !document.getElementById(id).open, id);
}

async function checkMiffyWorld(page) {
  const hub = page.locator('#miffyWorldMap');
  await hub.scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.mm-latch, .miffy-house-invitation').count(), 0,
    'the Lab repeats its own "Let her out" or house entrances');
  await expectMonochrome(page, '#miffyWorldMap, .hero-art, .mm-secret');

  // The house: focus moves in, the bed has one Miffy at a time, and focus comes home.
  const houseCard = hub.locator('[data-world-action="open-house"]');
  await houseCard.click();
  await page.waitForFunction(() => document.getElementById('miffySecretHouse')?.open);
  assert.ok(await page.locator('#miffySecretHouse').evaluate(dialog => dialog.contains(document.activeElement)),
    'focus did not move into the house');
  await expectMonochrome(page, '#miffySecretHouse');
  const opacity = selector => page.locator(selector).first().evaluate(element => Number(getComputedStyle(element).opacity));
  const settled = () => page.waitForFunction(() => !document.querySelector('#miffySecretHouse').getAnimations({ subtree: true })
    .some(animation => animation.playState === 'running' && animation.transitionProperty === 'opacity'));
  assert.equal(await opacity('.house-bed-sleeper'), 0, 'an awake Miffy is also asleep in bed');
  const bed = page.locator('[data-house="bed"]');
  await bed.click();
  await settled();
  assert.equal(await bed.getAttribute('aria-pressed'), 'true');
  assert.equal(await opacity('.house-bed-sleeper'), 1, 'Miffy did not get into bed');
  assert.equal(await opacity('.house-bunny'), 0, 'a second Miffy stayed up while one sleeps');
  await bed.click();
  await settled();
  assert.equal(await opacity('.house-bunny'), 1, 'Miffy did not get up again');
  await page.locator('.house-drawer__handle').click();
  await page.locator('[data-toy="cloud"]').click();
  await page.locator('[data-toy="water"]').click();
  await page.locator('[data-house="give"]').click();
  assert.equal(await page.locator('.miffy-house').getAttribute('data-play'), 'rain', 'cloud + watering can did not make rain');
  // Toys appear at a visible size, in place, and in view below the dialog header.
  const give = async (...toys) => {
    await page.locator('[data-house="reset"]').click();
    for (const toy of toys) await page.locator(`[data-toy="${toy}"]`).click();
    await page.locator('[data-house="give"]').click();
  };
  const layout = () => page.evaluate(() => {
    const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
    return { room: box('.miffy-house__room'), header: box('#miffySecretHouse .wonder-dialog__header'),
      balloon: box('.house-play-balloon ellipse'), moon: box('.house-moon-chair svg'), table: box('.house-table'), cups: box('.house-cups') };
  });
  const middle = rect => rect.left + rect.width / 2;
  await give('balloon');
  let toys = await layout();
  assert.ok(toys.balloon.width > toys.room.width * 0.04, 'the balloon is too small to see');
  assert.ok(toys.room.top >= toys.header.bottom - 1, 'the room is hidden under the dialog header');
  await give('moon', 'tea');
  toys = await layout();
  assert.ok(toys.moon.width > toys.room.width * 0.15, 'the moon chair is too small to see');
  assert.ok(Math.abs(middle(toys.cups) - middle(toys.table)) < toys.room.width * 0.05, 'the teacups are off the table');
  await noOverflow(page, 'house');
  await closeDialog(page, 'miffySecretHouse');
  assert.ok(await focused(page, '#miffyWorldMap [data-world-action="open-house"]'), 'closing the house lost focus');

  // The planet turns by keyboard or buttons, and its door leads into the house.
  await page.locator('#miffyPlanetPortal').click();
  await page.waitForFunction(() => document.getElementById('miffyPlanetDialog')?.open);
  await expectMonochrome(page, '#miffyPlanetDialog');
  const turn = () => page.locator('.miffy-planet__stage').evaluate(stage => stage.style.getPropertyValue('--planet-turn'));
  await page.locator('[data-planet-turn="18"]').click();
  assert.equal(await turn(), '18deg', 'the turn button did not turn the planet');
  await page.locator('#miffyPlanetRotation').focus();
  await page.keyboard.press('End');
  assert.equal(await turn(), '55deg', 'the rotation slider does not work from the keyboard');
  assert.ok(await page.locator('[data-planet-turn="18"]').isDisabled(), 'the planet turns past its limit');
  await page.locator('#miffyPlanetRotation').fill('0');
  await page.locator('.miffy-planet__door').click();
  await page.waitForFunction(() => document.getElementById('miffySecretHouse')?.open && !document.getElementById('miffyPlanetDialog').open);
  await closeDialog(page, 'miffySecretHouse');

  // The photo booth makes a picture to take home.
  await hub.locator('[data-world-action="photo"]').click();
  await page.waitForFunction(() => document.getElementById('miffyPhotoBooth')?.open);
  await page.locator('[data-photo-capture]').click();
  const download = page.locator('[data-photo-download]');
  await page.waitForFunction(() => !document.querySelector('[data-photo-download]').disabled, null, { timeout: 5000 });
  const [file] = await Promise.all([page.waitForEvent('download'), download.click()]);
  assert.match(file.suggestedFilename(), /^a-little-day-with-miffy\.(png|svg)$/);
  await closeDialog(page, 'miffyPhotoBooth');

  // "Let her out" is one toggle; bringing her home returns focus to it.
  const escape = hub.locator('[data-world-action="escape"]');
  await escape.click();
  assert.equal(await escape.getAttribute('aria-pressed'), 'true');
  assert.ok(await page.locator('#miffyMarginFriend').isVisible(), 'Miffy did not go out');
  await page.locator('.mm-home').click();
  assert.equal(await escape.getAttribute('aria-pressed'), 'false');
  assert.ok(await focused(page, '#miffyWorldMap [data-world-action="escape"]'), 'bringing Miffy home lost focus');

  // Finding every hidden Miffy unlocks the Polka Dot dress and the tea party.
  // The floating hunt badge only appears once the hunt has begun.
  const hud = page.locator('#miffyHuntHud');
  assert.ok(await hud.evaluate(badge => badge.hidden), 'the hunt badge covers the page before the hunt starts');
  for (const peeker of await page.locator('.miffy-peeker').all()) {
    await peeker.scrollIntoViewIfNeeded();
    await peeker.click();
    assert.equal(await hud.evaluate(badge => badge.hidden), false, 'the hunt badge did not appear once the hunt began');
  }
  await page.locator('[data-outfit="polka"]').waitFor({ state: 'attached' });
  await page.locator('.wonder-tea-note [data-tea-open]').click();
  await page.waitForFunction(() => document.getElementById('miffyPicnic')?.open);
  await closeDialog(page, 'miffyPicnic');

  // Over the contact form the hunt badge steps aside rather than cover a field.
  await page.locator('#contactForm').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.getElementById('miffyHuntHud').classList.contains('is-tucked'));
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
  let reply = { status: 200, body: '{"success":"false","message":"Something went wrong."}' };
  // With JavaScript the form posts to FormSubmit's AJAX endpoint. Answer it
  // locally: no test message reaches FormSubmit.
  await page.route('https://formsubmit.co/**', async route => {
    submissions += 1;
    submitted = route.request();
    await route.fulfill({ status: reply.status, contentType: 'application/json', body: reply.body });
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

  // A failed delivery must not look like a sent message, and must keep the draft.
  await page.locator('#contactSubmit').click();
  await expectText(page, '#contactStatus', 'didn’t go through');
  assert.equal(submissions, 1);
  assert.equal(await page.locator('#miffyDeliveryCard').count(), 0, 'a failed delivery showed the sent card');
  assert.equal(await page.locator('#contactMessage').inputValue(), 'Mock message: typography & identity.',
    'a failed delivery lost the draft');
  assert.ok(await page.locator('#contactSubmit').isEnabled(), 'a failed delivery left the form disabled');
  assert.match(await page.locator('#contactStatus a').getAttribute('href'), /^mailto:nikhil\.sharma275@gmail\.com\?/);

  // A confirmed delivery shows the card with the request the provider expects.
  reply = { status: 200, body: '{"success":"true","message":"The form was submitted successfully."}' };
  await page.locator('#contactSubmit').click();
  await page.locator('#miffyDeliveryCard').waitFor();
  assert.equal(submissions, 2);
  assert.equal(submitted.method(), 'POST');
  assert.equal(submitted.url(), CONTACT_ENDPOINT.replace('formsubmit.co/', 'formsubmit.co/ajax/'));
  const data = submitted.postDataJSON();
  assert.equal(data.name, 'Test Visitor + Miffy');
  assert.equal(data.email, 'visitor@example.com');
  assert.equal(data.message, 'Mock message: typography & identity.');
  assert.ok(data._subject, 'contact subject is missing');
  assert.ok(data._template, 'contact template is missing');
  await page.locator('#miffySendAnother').click();
  assert.ok(await page.locator('#contactSubmit').isVisible(), 'the form did not come back');
  assert.equal(await page.locator('#contactMessage').inputValue(), '', 'the form was not reset');

  // Returning from the no-JavaScript provider flow shows a receipt.
  const returnURL = new URL(BASE);
  returnURL.search = '?message=submitted';
  returnURL.hash = '#contact';
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

  await withPage('miffy-garden', { viewport: { width: 390, height: 844 } }, checkMiffyGarden);

  await withPage('miffy-surprise', { viewport: { width: 390, height: 844 } }, checkMiffySurprise);

  await withPage('miffy-blush', { viewport: { width: 1280, height: 800 } }, checkMiffyBlush);

  await withPage('miffy-world', { viewport: { width: 1280, height: 800 }, acceptDownloads: true }, checkMiffyWorld);

  await withPage('miffy-world-phone', { viewport: { width: 390, height: 844 }, hasTouch: true, acceptDownloads: true }, checkMiffyWorld);

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
