import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

// Exercise the real state modules with storage failure/corruption. No browser,
// network or contact-form submissions are involved in these regression tests.
async function visit({ blocked = false, saved = {} } = {}) {
  const storage = new Map(Object.entries(saved));
  const elements = [];
  const events = new Map();
  const node = () => {
    const listeners = new Map();
    const attributes = new Map();
    const classes = new Set();
    const element = {
      dataset: {}, style: { setProperty() {} }, children: [], innerHTML: '',
      classList: { add: x => classes.add(x), toggle(x, yes) { if (yes) classes.add(x); else classes.delete(x); } },
      setAttribute: (key, value) => attributes.set(key, value),
      getAttribute: key => attributes.get(key),
      appendChild(child) { this.children.push(child); },
      append(child) { this.children.push(child); }, remove() {},
      addEventListener(type, listener) { listeners.set(type, listener); },
      click() { listeners.get('click')?.({ stopPropagation() {} }); },
      querySelector: () => null, querySelectorAll: () => [],
    };
    elements.push(element);
    return element;
  };
  const parents = new Map(['.hero-art', '.stats .stat:first-child', '.career-row:first-child', '.footer__bottom'].map(key => [key, node()]));
  const document = {
    body: node(), documentElement: node(),
    createElement: node,
    getElementById: id => elements.find(element => element.id === id),
    querySelector: selector => parents.get(selector) || null,
    addEventListener(type, listener) { const list = events.get(type) || []; list.push(listener); events.set(type, list); },
    dispatchEvent(event) { events.get(event.type)?.forEach(listener => listener(event)); },
  };
  const localStorage = {
    getItem(key) { if (blocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
    setItem(key, value) { if (blocked) throw new Error('Storage blocked'); storage.set(key, value); },
  };
  const context = vm.createContext({
    document, localStorage, console, setTimeout: () => 0, clearTimeout() {},
    window: { getComputedStyle: () => ({ position: 'relative' }), matchMedia: () => ({ matches: false }) },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  });
  // Cache the pending module, not the finished one: two imports of the same file
  // can race here, and each must get the one shared instance, as in a browser.
  const modules = new Map();
  function moduleFor(url) {
    if (!modules.has(url)) {
      modules.set(url, url.endsWith('.css')
        ? Promise.resolve(new vm.SyntheticModule([], () => {}, { context, identifier: url }))
        : readFile(fileURLToPath(url), 'utf8').then(source => new vm.SourceTextModule(source, { context, identifier: url })));
    }
    return modules.get(url);
  }
  const load = async (file) => {
    const module = await moduleFor(new URL(`../src/ui/${file}.js`, import.meta.url).href);
    await module.link((specifier, parent) => moduleFor(new URL(specifier, parent.identifier).href));
    await module.evaluate();
    return module;
  };
  const shared = await load('miffy-world-shared');
  await load('miffy-hunt');
  const ns = async file => (await modules.get(new URL(`../src/ui/${file}.js`, import.meta.url).href)).namespace;
  return { hunt: await ns('miffy-hunt'), wardrobe: await ns('miffy-wardrobe'), shared: shared.namespace, parents, node, storage, events };
}

const ALL_FOUND = JSON.stringify({ hero: true, about: true, experience: true, footer: true });

test('blocked storage still permits outfits, all four discoveries, and the polka dot unlock', async () => {
  const v = await visit({ blocked: true });
  const wardrobe = v.node();
  v.wardrobe.renderWardrobeStudio(wardrobe);
  assert.equal(v.wardrobe.getSavedOutfit(), 'ink');
  v.wardrobe.applyOutfit('graphite');
  assert.equal(v.wardrobe.getSavedOutfit(), 'graphite');
  assert.equal(v.shared.getDressColor(), '#4a4a46');
  assert.doesNotMatch(wardrobe.innerHTML, /Polka Dot/);
  v.hunt.initMiffyHunt();
  for (const parent of v.parents.values()) parent.children[0].click();
  assert.equal(v.hunt.isMiffyHuntComplete(), true);
  assert.match(wardrobe.innerHTML, /Polka Dot/);
  assert.equal(v.events.get('miffy:hunt-complete').length, 1);
  v.wardrobe.applyOutfit('polka');
  assert.equal(v.wardrobe.getSavedOutfit(), 'polka');
  assert.match(v.shared.bunnySVG(), /<pattern id="wonderDress\d+"/);
  v.shared.discover('house');
  v.shared.discover('house');
  assert.equal(v.shared.getDiscoveries().length, 1);
});

test('corrupt progress and invalid outfit values recover to a usable visit', async () => {
  for (const outfit of ['__proto__', 'constructor', 'toString', '{broken']) {
    const v = await visit({ saved: { miffy_hunt_spots: '{broken', miffy_wardrobe_outfit: outfit, miffy_wonder_discoveries: '{}' } });
    assert.equal(v.hunt.isMiffyHuntComplete(), false);
    assert.equal(v.wardrobe.getSavedOutfit(), 'ink', `saved outfit ${outfit}`);
    assert.equal(v.shared.getDiscoveries().length, 0);
    v.wardrobe.renderWardrobeStudio(v.node());
    v.wardrobe.applyOutfit(outfit);
    assert.equal(v.wardrobe.getSavedOutfit(), 'ink', `applied outfit ${outfit}`);
  }
});

test('completed hunt and outfit survive a fresh visit; discovery writes are idempotent', async () => {
  const v = await visit({ saved: { miffy_hunt_spots: ALL_FOUND, miffy_hunt_completed: 'true', miffy_wardrobe_outfit: 'polka', miffy_wonder_discoveries: '["house"]' } });
  assert.equal(v.hunt.isMiffyHuntComplete(), true);
  assert.equal(v.wardrobe.getSavedOutfit(), 'polka');
  v.shared.discover('photo'); v.shared.discover('photo');
  assert.deepEqual(JSON.parse(v.storage.get('miffy_wonder_discoveries')), ['house', 'photo']);
  // Each drawing carries its own pattern, so ids must never collide in the page.
  const first = v.shared.bunnySVG();
  const second = v.shared.bunnySVG();
  assert.notEqual(first.match(/pattern id="([^"]+)/)[1], second.match(/pattern id="([^"]+)/)[1]);
});

test('a saved secret dress that was never unlocked falls back to the default', async () => {
  for (const outfit of ['polka', 'hearts']) {
    const v = await visit({ saved: { miffy_wardrobe_outfit: outfit, miffy_hunt_spots: 'null' } });
    assert.equal(v.wardrobe.getSavedOutfit(), 'ink', outfit);
  }
});

test('solid outfits paint directly; friends keep their own colours', async () => {
  const v = await visit({ saved: { miffy_wardrobe_outfit: 'stone' } });
  assert.doesNotMatch(v.shared.bunnySVG(), /<pattern/);
  assert.match(v.shared.bunnySVG(), /fill="#9a9a93"/);
  assert.match(v.shared.bunnySVG({ dress: '#4a4a46' }), /fill="#4a4a46"/);
  assert.match(v.shared.bunnySVG({ dress: 'url(javascript:alert(1))' }), /fill="#101010"/);
});
