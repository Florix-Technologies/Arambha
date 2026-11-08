const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');

test('dashboard links resolve to existing admin pages', () => {
  const screen = readFileSync(path.join(__dirname, 'DashboardScreen.tsx'), 'utf8');
  assert.doesNotMatch(screen, /basePath|managementHref/, 'dashboard no longer takes link-base props');
  const links = [...screen.matchAll(/href=(?:"([^"]+)"|\{((?:`[^`]*`|[^}])*)\})/g)].map(match => match[2] ?? JSON.stringify(match[1]));
  assert.equal(links.length, 6, 'add-product (x2), category, product (x2) and subcategory links are covered');
  const params = { key: 'gallery', p: { id: 'p1' }, sub: { category: 'gallery', id: 's1' } };
  for (const expression of links) {
    const href = vm.runInNewContext(expression, params);
    assert.match(href, /^\/admin(\/|$)/, `${href} stays inside /admin`);
    // Dynamic segments are folder names ([category], [id], ...), so match each URL segment to a literal or dynamic folder.
    let dir = path.join(root, 'app/admin/(screens)');
    for (const segment of href.split('/').slice(2)) {
      const next = [segment, ...['[category]', '[subcategoryId]', '[id]']].map(name => path.join(dir, name)).find(existsSync);
      assert.ok(next, `${href} has no folder for "${segment}"`);
      dir = next;
    }
    assert.ok(existsSync(path.join(dir, 'page.tsx')), `${href} must have a page`);
  }
});
