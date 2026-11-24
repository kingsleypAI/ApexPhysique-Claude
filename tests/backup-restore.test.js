const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', '06-backup-restore.js'), 'utf8');

function createHarness(initial = {}) {
  const values = new Map(Object.entries(initial));
  let failOnKey = null;
  const localStorage = {
    get length() { return values.size; },
    key(i) { return Array.from(values.keys())[i] ?? null; },
    getItem(k) { return values.has(k) ? values.get(k) : null; },
    setItem(k, v) {
      if (k === failOnKey) throw new Error('simulated storage quota error');
      values.set(k, String(v));
    },
    removeItem(k) { values.delete(k); }
  };
  const context = { localStorage, Blob, URL, document: {}, setTimeout, forgeLocalDateKey: () => '2026-11-24' };
  vm.runInNewContext(source, context, { filename: '06-backup-restore.js' });
  return { api: context, values, failOn(key) { failOnKey = key; } };
}

test('restore replaces all FORGE keys but leaves unrelated browser storage untouched', () => {
  const h = createHarness({ apx_old: 'old', forge_pref: 'old-pref', unrelated: 'keep' });
  const count = h.api.forgeRestoreBackupData({ apx_new: 'new', forge_pref: 'new-pref' });
  assert.equal(count, 2);
  assert.equal(h.values.has('apx_old'), false);
  assert.equal(h.values.get('apx_new'), 'new');
  assert.equal(h.values.get('forge_pref'), 'new-pref');
  assert.equal(h.values.get('unrelated'), 'keep');
});

test('invalid FORGE values are rejected before any storage changes', () => {
  const h = createHarness({ apx_existing: 'safe' });
  assert.throws(() => h.api.forgeRestoreBackupData({ apx_new: { bad: true } }), /invalid FORGE data/i);
  assert.equal(h.values.get('apx_existing'), 'safe');
  assert.equal(h.values.has('apx_new'), false);
});

test('failed writes roll back removed and overwritten FORGE keys', () => {
  const h = createHarness({ apx_old: 'old', forge_keep: 'original', unrelated: 'untouched' });
  h.failOn('apx_new');
  assert.throws(() => h.api.forgeRestoreBackupData({ apx_new: 'new', forge_keep: 'replacement' }), /rolled back/i);
  assert.equal(h.values.get('apx_old'), 'old');
  assert.equal(h.values.get('forge_keep'), 'original');
  assert.equal(h.values.has('apx_new'), false);
  assert.equal(h.values.get('unrelated'), 'untouched');
});

test('empty or non-FORGE backups are rejected', () => {
  const h = createHarness();
  assert.throws(() => h.api.forgeGetBackupEntries({ unrelated: 'x' }), /No FORGE data/i);
  assert.throws(() => h.api.forgeGetBackupEntries({ apx_x: 1 }), /invalid FORGE data/i);
});
