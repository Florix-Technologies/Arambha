const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');

test('live dashboard catalog actions resolve to an existing management page', () => {
  const page = readFileSync(path.join(root, 'app/admin-v2/(screens)/page.tsx'), 'utf8');
  const screen = readFileSync(path.join(__dirname, 'DashboardScreen.tsx'), 'utf8');
  const managementHref = page.match(/managementHref="([^"]+)"/)?.[1];
  const links = [...screen.matchAll(/href=\{((?:`[^`]*`|[^}])*)\}/g)].map(match => match[1]);
  assert.equal(links.length, 3, 'category, quick action and empty-state links are covered');
  for (const expression of links) {
    const previewHref = vm.runInNewContext(expression, { managementHref: undefined, basePath: '/admin-preview', key: 'gallery' });
    assert.ok(existsSync(path.join(root, 'app/admin-preview/(screens)', previewHref.replace('/admin-preview/', ''), 'page.tsx')), `${previewHref} must keep its preview page`);
    for (const key of ['furniture', 'interiors', 'gallery']) {
      const href = vm.runInNewContext(expression, { managementHref, basePath: '/admin-v2', key });
      assert.ok(existsSync(path.join(root, 'app', href, 'page.tsx')), `${href} must have a page`);
    }
  }
});

