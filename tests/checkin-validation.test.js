const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', '09-checkins.js'), 'utf8');

function harness(initial = {}) {
  const values = new Map(Object.entries(initial));
  const localStorage = {
    getItem(k) { return values.has(k) ? values.get(k) : null; },
    setItem(k, v) { values.set(k, String(v)); },
    removeItem(k) { values.delete(k); }
  };
  const context = {
    localStorage,
    document: { getElementById() { return null; } },
    forgeLocalDateKey: () => '2026-11-24',
    forgeParseLocalDate: value => new Date(value + 'T12:00:00'),
    forgeSafeJSON: (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } },
    TRK_KEY: 'apx_tracking_v1',
    getCurrentWeek: () => 5,
    renderWeightChart() {},
    renderSummary() {},
    alert() {},
    setTimeout() {}
  };
  vm.runInNewContext(source, context, { filename: '09-checkins.js' });
  return { api: context, values };
}

test('valid check-ins are rounded, saved and bridged to body tracking', () => {
  const h = harness();
  h.api.logCheckin('91.74', '20.44');
  const saved = JSON.parse(h.values.get('apx_checkin_v1'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].date, '2026-11-24');
  assert.equal(saved[0].weight, 91.7);
  assert.equal(saved[0].bf, 20.4);
  const tracking = JSON.parse(h.values.get('apx_tracking_v1'));
  assert.equal(tracking.weights[5], 91.7);
});

test('invalid weight and body-fat values are rejected without changing history', () => {
  const h = harness({ apx_checkin_v1: JSON.stringify([{ date: '2026-11-20', weight: 92, bf: 20 }]) });
  assert.throws(() => h.api.logCheckin(0, 20), /Weight must be between 40 and 300/);
  assert.throws(() => h.api.logCheckin(92, 101), /Body fat must be between 1 and 70/);
  assert.throws(() => h.api.logCheckin('not-a-number', null), /Weight must be between 40 and 300/);
  assert.equal(JSON.parse(h.values.get('apx_checkin_v1')).length, 1);
});

test('a second same-day check-in corrects rather than duplicates the date', () => {
  const h = harness();
  h.api.logCheckin(92.1, 20);
  h.api.logCheckin(91.8, 19.8);
  const saved = JSON.parse(h.values.get('apx_checkin_v1'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].weight, 91.8);
  assert.equal(saved[0].bf, 19.8);
});

test('malformed saved history safely reads as empty', () => {
  const h = harness({ apx_checkin_v1: '{broken json' });
  assert.deepEqual(Array.from(h.api.getCheckinHistory()), []);
  assert.equal(h.api.getLastCheckin(), null);
});

test('body-fat-only entries remain supported when weight is blank', () => {
  const h = harness();
  h.api.logCheckin(null, 22.5);
  const saved = JSON.parse(h.values.get('apx_checkin_v1'));
  assert.equal(saved[0].weight, null);
  assert.equal(saved[0].bf, 22.5);
  assert.equal(h.values.has('apx_tracking_v1'), false);
});

test('check-in update advances the service-worker cache', () => {
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  assert.match(sw, /const CACHE_NAME='forge-static-v28'/);
});
