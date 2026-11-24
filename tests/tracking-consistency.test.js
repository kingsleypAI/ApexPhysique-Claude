const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const main = fs.readFileSync(path.join(__dirname, '..', '02-main-features.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

test('cardio rest day follows the shared movable workout schedule', () => {
  const cardio = main.slice(main.indexOf('function renderCardioWeek'), main.indexOf('// ── DELOAD HIGHLIGHTING'));
  assert.match(cardio, /getWorkoutScheduleEntry\(date\)/);
  assert.match(cardio, /entry\.type==='rest'/);
  assert.match(cardio, /isScheduledRest\(curWeek,d\)/);
  assert.match(cardio, /!isScheduledRest\(curWeek,d\) && cardioData/);
  assert.doesNotMatch(cardio, /const dtype = \['workout','workout','workout','rest'/);
});

test('water progress, glass controls and daily limit consistently use eleven glasses', () => {
  const water = main.slice(main.indexOf('function renderWater'), main.indexOf('// ── CARDIO TRACKER'));
  assert.match(html, /id="waterCount">0<\/span><span class="home-track-unit">\/ 11/);
  assert.match(water, /const target = 11/);
  assert.match(water, /i<target/);
  assert.match(water, /createElement\('button'\)/);
  assert.match(water, /aria-pressed/);
  assert.match(main, /if\(d\.count >= 11\) return/);
});

test('service worker cache is refreshed for the tracking consistency update', () => {
  assert.match(serviceWorker, /const CACHE_NAME='forge-static-v\d+'/);
});
