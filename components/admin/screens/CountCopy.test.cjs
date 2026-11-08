const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { stripTypeScriptTypes } = require('node:module');
const vm = require('node:vm');
const context = vm.createContext({});
const source = readFileSync(`${__dirname}/../../../lib/admin/taxonomy.ts`, 'utf8').replace(/export /g, '');
vm.runInContext(stripTypeScriptTypes(source) + ';globalThis.messages = MESSAGES;', context);

test('count copy agrees for zero, one and multiple items', () => {
  const m = context.messages;
  for (const n of [0, 1, 2]) {
    assert.equal(m.productCount(n), `${n} product${n === 1 ? '' : 's'}`);
    assert.equal(m.subcategoryCount(n), `${n} ${n === 1 ? 'subcategory' : 'subcategories'}`);
    assert.equal(m.filesUploaded(n), `${n} file${n === 1 ? '' : 's'} uploaded`);
    assert.equal(m.deleteHasProducts(n), `This subcategory has ${m.productCount(n)}. Choose what happens to ${n === 1 ? 'it' : 'them'}.`);
    assert.equal(m.moveProducts(n, 'Chairs'), `Move ${m.productCount(n)} to Chairs`);
    assert.equal(m.deleteWithProducts(n), `Delete subcategory and its ${m.productCount(n)}`);
    assert.equal(m.emptyAlert(n), `${m.subcategoryCount(n)} ${n === 1 ? "is empty, so it's" : "are empty, so they're"} hidden from the website menu.`);
  }
});
