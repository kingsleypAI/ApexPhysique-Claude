const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', '32-workout-schedule.js'), 'utf8');
const SESSION_IDS = ['pushA', 'pullA', 'legsA', 'pushB', 'pullB', 'legsB'];
const WEEK_DATES = Array.from({ length: 7 }, (_, i) => '2026-11-' + String(16 + i).padStart(2, '0') + 'T12:00:00');

function createHarness(today = '2026-11-16T12:00:00') {
  let now = new Date(today);
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now.getTime()])); }
    static now() { return now.getTime(); }
  }
  const values = new Map();
  const alerts = [];
  let reloads = 0;
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  const context = {
    Date: FixedDate,
    localStorage,
    alert(message) { alerts.push(String(message)); },
    location: { reload() { reloads++; } },
    forgeLocalDateKey(date) {
      const d = date instanceof Date ? date : new Date(date);
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    },
    forgeSafeJSON(value, fallback) { try { return JSON.parse(value); } catch (_) { return fallback; } }
  };
  context.window = context;
  vm.runInNewContext(source, context, { filename: '32-workout-schedule.js' });
  return {
    api: context,
    values,
    alerts,
    get reloads() { return reloads; },
    setToday(value) { now = new Date(value); }
  };
}

test('default week contains the six ordered sessions and Thursday rest', () => {
  const { api } = createHarness();
  const entries = WEEK_DATES.map(date => api.getWorkoutScheduleEntry(date));
  assert.deepEqual(entries.map(entry => entry.id), ['pushA', 'pullA', 'legsA', 'rest', 'pushB', 'pullB', 'legsB']);
  assert.equal(entries.filter(entry => entry.type === 'rest').length, 1);
});

test('each weekday can be selected as the single rest day without losing sessions', () => {
  for (let weekday = 0; weekday < 7; weekday++) {
    const h = createHarness();
    assert.equal(h.api.setWorkoutRestDay(WEEK_DATES[weekday]), true);
    const entries = WEEK_DATES.map(date => h.api.getWorkoutScheduleEntry(date));
    assert.equal(entries.filter(entry => entry.type === 'rest').length, 1, 'rest weekday ' + weekday);
    assert.deepEqual(entries.filter(entry => entry.type !== 'rest').map(entry => entry.id), SESSION_IDS, 'session order for rest weekday ' + weekday);
  }
});

test('moving Thursday rest to Friday converts Thursday into Push B', () => {
  const h = createHarness();
  assert.equal(h.api.setWorkoutRestOverride(WEEK_DATES[3], false), true);
  assert.equal(h.api.getWorkoutScheduleEntry(WEEK_DATES[3]).id, 'pushB');
  assert.equal(h.api.getWorkoutScheduleEntry(WEEK_DATES[4]).type, 'rest');
  assert.equal(h.api.getWorkoutScheduleEntry(WEEK_DATES[5]).id, 'pullB');
  assert.equal(h.api.getWorkoutScheduleEntry(WEEK_DATES[6]).id, 'legsB');
});

test('new week returns to Thursday rest and Push A on Monday', () => {
  const h = createHarness();
  h.api.setWorkoutRestDay(WEEK_DATES[5]);
  assert.equal(h.api.getWorkoutScheduleEntry('2026-11-23T12:00:00').id, 'pushA');
  assert.equal(h.api.getWorkoutScheduleEntry('2026-11-26T12:00:00').type, 'rest');
});

test('Sunday rest cannot be moved into the next week by the Today toggle', () => {
  const h = createHarness();
  h.api.setWorkoutRestDay(WEEK_DATES[6]);
  assert.equal(h.api.setWorkoutRestOverride(WEEK_DATES[6], false), false);
  assert.equal(h.api.getWorkoutScheduleEntry(WEEK_DATES[6]).type, 'rest');
  assert.equal(h.alerts.length, 1);
});

test('past rest days cannot be moved after the weekly recovery day has passed', () => {
  const h = createHarness('2026-11-20T12:00:00');
  assert.equal(h.api.setWorkoutRestDay('2026-11-21T12:00:00'), false);
  assert.equal(h.api.getWorkoutScheduleEntry('2026-11-19T12:00:00').type, 'rest');
  assert.equal(h.alerts.length, 1);
});

test('legacy Thursday training override migrates to Friday rest', () => {
  const h = createHarness();
  h.values.set('forge_schedule_overrides_v2', JSON.stringify({ '2026-11-19': 'train' }));
  assert.equal(h.api.getWorkoutScheduleEntry('2026-11-19T12:00:00').id, 'pushB');
  assert.equal(h.api.getWorkoutScheduleEntry('2026-11-20T12:00:00').type, 'rest');
});
