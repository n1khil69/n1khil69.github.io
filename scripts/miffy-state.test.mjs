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
  const modules = new Map();
  async function moduleFor(url) {
    if (modules.has(url)) return modules.get(url);
    const module = url.endsWith('.css')
      ? new vm.SyntheticModule([], () => {}, { context, identifier: url })
      : new vm.SourceTextModule(await readFile(fileURLToPath(url), 'utf8'), { context, identifier: url });
    modules.set(url, module);
    return module;
  }
  const shared = await moduleFor(new URL('../src/ui/miffy-world-shared.js', import.meta.url).href);
  await shared.link((specifier, parent) => moduleFor(new URL(specifier, parent.identifier).href));
  await shared.evaluate();
  const ns = file => modules.get(new URL(`../src/ui/${file}.js`, import.meta.url).href).namespace;
  return { wardrobe: ns('miffy-wardrobe'), shared: shared.namespace, node, storage, events };
}

test('blocked storage still permits outfits and discoveries without the removed scene', async () => {
  const v = await visit({ blocked: true });
  const wardrobe = v.node();
  v.wardrobe.renderWardrobeStudio(wardrobe);
  assert.equal(v.wardrobe.getSavedOutfit(), 'ink');
  v.wardrobe.applyOutfit('blue');
  assert.equal(v.wardrobe.getSavedOutfit(), 'blue');
  assert.equal(v.shared.getDressColor(), '#004d9c');
  assert.match(wardrobe.innerHTML, /Rainbow Dream/);
  v.wardrobe.applyOutfit('rainbow');
  assert.match(v.shared.bunnySVG(), /linearGradient/);
  v.shared.discover('house');
  v.shared.discover('house');
  assert.equal(v.shared.getDiscoveries().length, 1);
});

test('corrupt progress and invalid outfit values recover to a usable visit', async () => {
  const v = await visit({ saved: { miffy_wardrobe_outfit: '__proto__', miffy_wonder_discoveries: '{}' } });
  assert.equal(v.wardrobe.getSavedOutfit(), 'ink');
  assert.equal(v.shared.getDiscoveries().length, 0);
  v.wardrobe.renderWardrobeStudio(v.node());
});

test('saved outfits survive a fresh visit; discovery writes are idempotent', async () => {
  const v = await visit({ saved: { miffy_wardrobe_outfit: 'rainbow', miffy_wonder_discoveries: '["house"]' } });
  assert.equal(v.wardrobe.getSavedOutfit(), 'rainbow');
  v.shared.discover('photo'); v.shared.discover('photo');
  assert.deepEqual(JSON.parse(v.storage.get('miffy_wonder_discoveries')), ['house', 'photo']);
  const first = v.shared.bunnySVG();
  const second = v.shared.bunnySVG();
  assert.notEqual(first.match(/linearGradient id="([^"]+)/)[1], second.match(/linearGradient id="([^"]+)/)[1]);
});

test('rainbow no longer needs hunt progress', async () => {
  const v = await visit({ saved: { miffy_wardrobe_outfit: 'rainbow' } });
  assert.equal(v.wardrobe.getSavedOutfit(), 'rainbow');
});

test('day and night can change without a scene in the page', async () => {
  const v = await visit();
  v.shared.setNight(true);
  assert.equal(v.shared.isNight(), true);
  v.shared.setNight(false);
  assert.equal(v.shared.isNight(), false);
});
