// Handler checks against TSX emitted to .a11y-check by the documented tsc command.
// This does not replace a mounted React/Radix browser test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let state;
const react = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  createContext: () => ({}),
  useId: () => 'test', useRef: () => ({ current: null }), useEffect: () => {},
  useState: initial => [state ?? initial, () => {}],
};
const jsx = (type, props) => ({ type, props });
const radix = new Proxy({}, { get: (_, key) => `radix.${key}` });
const TERMS = new Proxy({}, { get: (_, key) => key });
function load(file) {
  const output = fs.readFileSync(file.replace('components/admin/', '.a11y-check/').replace(/\.tsx$/, '.js'), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(output, {
    module, exports: module.exports,
    require: name => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name.startsWith('@radix-ui/')) return radix;
      if (name.endsWith('.css')) return {};
      if (name.endsWith('/font')) return { adminFont: { variable: 'font' } };
      if (name.endsWith('/taxonomy')) return { TERMS, MESSAGES: { typeToConfirm: v => v } };
      return new Proxy({}, { get: (_, key) => key });
    },
    document: { activeElement: opener }, HTMLElement: Element,
  }, { filename: file });
  return module.exports;
}
function walk(node, predicate) {
  if (!node || typeof node !== 'object') return [];
  return [...(predicate(node) ? [node] : []), ...[node.props?.children].flat(Infinity).flatMap(child => walk(child, predicate))];
}
class Element { isConnected = true; focused = false; focus() { this.focused = true; } }
const opener = new Element();
const root = 'components/admin/';
// Parse every TSX primitive and shell, including unchanged callers of the shared Modal.
for (const file of fs.readdirSync(root + 'ui').filter(f => f.endsWith('.tsx'))) load(root + 'ui/' + file);
load(root + 'AdminShell.tsx');
const { IndexTable } = load(root + 'ui/IndexTable.tsx');
const table = IndexTable({ columns: [{ key: 'name', label: 'Name', render: r => r.id }], rows: [{ id: 'a' }, { id: 'b' }], rowKey: r => r.id, caption: 'Products', selectable: true });
const cells = walk(table, n => n.type === 'td');
assert.equal(cells.filter(n => n.props.tabIndex === 0).length, 1);
let focused;
const dom = { tBodies: [{ rows: [0, 1].map(r => ({ cells: [0, 1].map(c => ({ focus: () => { focused = [r, c]; } })) })) }] };
function key(cell, name, extra = {}) {
  const currentTarget = { closest: () => dom };
  let prevented = false;
  cell.props.onKeyDown({ key: name, target: currentTarget, currentTarget, preventDefault: () => { prevented = true; }, ...extra });
  return prevented;
}
assert(key(cells[0], 'ArrowDown')); assert.deepEqual(focused, [1, 0]);
key(cells[0], 'ArrowRight'); assert.deepEqual(focused, [0, 1]);
key(cells[0], 'ArrowUp'); assert.deepEqual(focused, [0, 0]);
key(cells[0], 'End', { ctrlKey: true }); assert.deepEqual(focused, [1, 1]);
key(cells[3], 'Home', { ctrlKey: true }); assert.deepEqual(focused, [0, 0]);
assert.equal(key(cells[0], 'ArrowDown', { target: {} }), false);
assert.equal(key(cells[0], 'Tab'), false);
assert.equal(key(cells[0], 'ArrowDown', { altKey: true }), false);
state = { row: 99, column: 99 };
const shrunk = IndexTable({ columns: [{ key: 'n', label: 'Name', render: () => 'x' }], rows: ['a'], rowKey: r => r, caption: 'Products' });
assert.equal(walk(shrunk, n => n.type === 'td')[0].props.tabIndex, 0);
state = undefined;
const { Modal } = load(root + 'ui/Modal.tsx');
const dialog = Modal({ open: true, onOpenChange() {}, title: 'Title', description: 'Body', children: 'Child' });
const content = walk(dialog, n => n.type === 'radix.Content')[0];
assert.equal(Object.hasOwn(content.props, 'aria-describedby'), false);
content.props.onOpenAutoFocus();
let restored = false;
content.props.onCloseAutoFocus({ preventDefault: () => { restored = true; } });
assert(restored && opener.focused);
opener.isConnected = false;
content.props.onCloseAutoFocus({ preventDefault: () => assert.fail('Removed opener must not receive focus') });
const { Menu } = load(root + 'ui/Menu.tsx');
const menu = Menu({ ariaLabel: 'Actions', items: [{ label: 'Disabled', href: '/bad', disabled: true }] });
assert.equal(walk(menu, n => n.type === 'radix.Content')[0].props.loop, true);
assert.equal(walk(menu, n => n.type === 'radix.Item')[0].props.asChild, false);
const { ConfirmDialog } = load(root + 'ui/ConfirmDialog.tsx');
let confirmed = 0;
for (const [typed, loading, expected] of [['wrong', false, 0], ['DELETE', true, 0], ['DELETE', false, 1]]) {
  state = typed;
  const confirm = ConfirmDialog({ open: true, onOpenChange() {}, title: 'Delete', body: 'Body', confirmLabel: 'Delete', destructive: true, typeToConfirm: 'DELETE', loading, onConfirm: () => confirmed++ });
  const formComponent = confirm.props.children;
  const form = formComponent.type(formComponent.props);
  assert.equal(walk(form, n => n.type === 'Button' && n.props.type === 'submit')[0].props.variant, 'destructive');
  form.props.onSubmit({ preventDefault() {} });
  assert.equal(confirmed, expected);
}
console.log('PASS: emitted TSX, table roving keys/bounds/control isolation, dialog focus-return handlers, menu loop/disabled links, confirmation guards.');
const css = fs.readFileSync(root + 'tokens.css', 'utf8');
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):#([\da-f]{6})/gi)].map(m => [m[1], m[2]]));
function luminance(hex) {
  return hex.match(/../g).map(n => parseInt(n, 16) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
}
for (const [fg, bg, minimum] of [['text', 'surface', 4.5], ['text-muted', 'bg', 4.5], ['primary', 'surface', 4.5], ['primary', 'primary-soft', 4.5], ['success', 'success-soft', 4.5], ['warning', 'warning-soft', 4.5], ['danger', 'danger-soft', 4.5], ['focus-ring', 'bg', 3], ['control-border', 'surface', 3]]) {
  const values = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => b - a);
  const ratio = (values[0] + .05) / (values[1] + .05);
  assert(ratio >= minimum, `${fg}/${bg}: ${ratio}`);
  console.log(`${fg}/${bg}: ${ratio.toFixed(2)}:1 (minimum ${minimum})`);
}
