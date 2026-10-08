import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// The real controller with an isolated DOM and stubbed transport; never sends mail.
async function setup(fetch) {
  const nodes = [];
  function node() {
    const classes = new Set();
    const element = {
      dataset: {}, children: [], attributes: new Map(), listeners: {}, value: '', textContent: '',
      classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
      addEventListener(type, listener) { this.listeners[type] = listener; },
      setAttribute(key, value) { this.attributes.set(key, value); },
      removeAttribute(key) { this.attributes.delete(key); },
      appendChild(child) { this.children.push(child); child.parent = this; },
      replaceChildren(...children) { this.children = children; },
      remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); },
      querySelector(selector) { return this.children.find(c => selector === '#' + c.id) || null; },
      setCustomValidity(value) { this.invalid = value; }, focus() {}, contains() { return false; },
    };
    nodes.push(element);
    return element;
  }
  const form = node(), submit = node(), label = node(), status = node();
  submit.querySelector = () => label;
  const fields = Object.fromEntries(['name', 'email', 'message', '_honey'].map(key => [key, node()]));
  fields.name.value = 'Test <name>';
  fields.email.value = 'test@example.invalid';
  fields.message.value = 'A sufficiently detailed test note. <script>not markup</script>';
  form.elements = { namedItem: name => fields[name] };
  form.reportValidity = () => Object.values(fields).every(f => !f.invalid);
  const document = {
    activeElement: null,
    getElementById: id => ({contactForm:form,contactSubmit:submit,contactStatus:status}[id]),
    createElement: node, createTextNode: textContent => ({ textContent }), dispatchEvent() {},
  };
  const context = vm.createContext({ document, fetch, AbortController, setTimeout, clearTimeout,
    CustomEvent: class {}, window: {addEventListener() {}, matchMedia:()=>({matches:true})} });
  const shape = new vm.SourceTextModule(await readFile(new URL('../src/ui/miffy-shape.js',import.meta.url),'utf8'),{context});
  const controller = new vm.SourceTextModule(await readFile(new URL('../src/ui/contact-form.js',import.meta.url),'utf8'),{context});
  await controller.link(() => shape);
  await controller.evaluate();
  controller.namespace.initContactForm();
  return {form,submit,label,status,fields,send:()=>form.listeners.submit({preventDefault(){}})};
}

for (const [name, transport] of [
  ['network failure', async () => {throw new Error('offline');}],
  ['activation required', async () => ({ok:true,json:async()=>({success:false,message:'Activation required'})})],
  ['unsuccessful API response', async () => ({ok:true,json:async()=>({success:false})})],
  ['HTTP error despite success payload', async () => ({ok:false,json:async()=>({success:true})})],
  ['invalid provider response', async () => ({ok:true,json:async()=>{throw new Error('bad JSON');}})],
]) {
  test(`${name} preserves the note, enables retry, and never claims success`, async () => {
    const visit = await setup(transport);
    await visit.send();
    assert.equal(visit.form.classList.contains('is-delivered'),false);
    assert.equal(visit.submit.disabled,false);
    assert.equal(visit.label.textContent,'Try again');
    assert.match(visit.fields.message.value,/sufficiently detailed/);
    assert.equal(visit.form.attributes.has('aria-busy'),false);
    assert.match(visit.status.textContent, /try again/i);
    assert.ok(!visit.status.children.some(child=>child.href));
    assert.ok(!visit.status.textContent.includes('nikhil.sharma275@gmail.com'));
  });
}

test('only explicit provider success creates the delivery card', async () => {
  const visit = await setup(async () => ({ok:true,json:async()=>({success:true})}));
  await visit.send();
  assert.equal(visit.form.classList.contains('is-delivered'),true);
  assert.ok(visit.form.querySelector('#miffyDeliveryCard'));
  assert.equal(visit.submit.disabled,true);
});

test('a failed submission can be retried successfully', async () => {
  let attempts=0;
  const visit=await setup(async()=>({ok:true,json:async()=>({success:++attempts>1})}));
  await visit.send();
  await visit.send();
  assert.equal(attempts,2);
  assert.equal(visit.form.classList.contains('is-delivered'),true);
});
