const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const source = readFileSync(`${__dirname}/ProductForm.tsx`, 'utf8');
const position = source.indexOf('const confirmLeave');
const guard = source.slice(source.lastIndexOf('    useEffect(() => {', position), source.indexOf('    function change', position));

function mount(answer) {
  const listeners = {};
  const dirtyRef = { current: true };
  let pushes = 0, backs = 0;
  const history = { state: {}, pushState(state) { this.state = state; pushes++; }, back() { backs++; } };
  const context = vm.createContext({
    dirtyRef, history, location: { href: 'https://local/admin/products/p' },
    useEffect: callback => callback(),
    window: { confirm: () => answer, addEventListener: (name, callback) => { listeners[name] = callback; }, removeEventListener() {} },
    document: { addEventListener() {}, removeEventListener() {} },
  });
  vm.runInContext(stripTypeScriptTypes(guard), context);
  return { listeners, dirtyRef, history, pushes: () => pushes, backs: () => backs };
}

test('cancelled Back keeps unsaved changes on the form', () => {
  const guard = mount(false);
  guard.history.state = {};
  let stopped = false;
  guard.listeners.popstate({ stopImmediatePropagation() { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(guard.backs(), 0);
  assert.equal(guard.pushes(), 2);
  assert.equal(guard.dirtyRef.current, true);
});

test('confirmed Back navigates once and lets the next history event through', () => {
  const guard = mount(true);
  guard.history.state = {};
  let stops = 0;
  guard.listeners.popstate({ stopImmediatePropagation() { stops++; } });
  guard.listeners.popstate({ stopImmediatePropagation() { stops++; } });
  assert.equal(guard.backs(), 1);
  assert.equal(stops, 1);
  assert.equal(guard.dirtyRef.current, false);
});

test('reload warns only when there are unsaved changes', () => {
  const guard = mount(false);
  let prevented = 0;
  const event = { preventDefault() { prevented++; } };
  guard.listeners.beforeunload(event);
  assert.equal(prevented, 1);
  guard.dirtyRef.current = false;
  guard.listeners.beforeunload(event);
  assert.equal(prevented, 1);
});
