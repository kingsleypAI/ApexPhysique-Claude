const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const nutrition = fs.readFileSync(path.join(__dirname, '..', '34-smart-nutrition.js'), 'utf8');
const main = fs.readFileSync(path.join(__dirname, '..', '02-main-features.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

test('planned meal shortcuts match the agreed daily calorie and protein range', () => {
  const mealSection = nutrition.split('var MEALS=[')[1].split('];')[0];
  const meals = [...mealSection.matchAll(/\{id:'[^']+',name:'[^']+',kcal:(\d+),protein:(\d+)/g)]
    .map(m => ({ kcal: Number(m[1]), protein: Number(m[2]) }));
  assert.equal(meals.length, 4);
  assert.equal(meals.reduce((s, m) => s + m.kcal, 0), 1871);
  assert.equal(meals.reduce((s, m) => s + m.protein, 0), 188);
  assert.ok(meals.reduce((s, m) => s + m.kcal, 0) >= 1700);
  assert.ok(meals.reduce((s, m) => s + m.kcal, 0) <= 1900);
});

test('nutrition shortcuts write to the existing food-log key and preserve unrelated entries', () => {
  assert.match(nutrition, /CAL='apx_calories_v1'/);
  assert.match(nutrition, /arr\.push\(\{id:eid,name:m\.name,kcal:m\.kcal,protein:m\.protein/);
  assert.match(nutrition, /arr=arr\.filter\(function\(e\)\{return e\.id!==done\[id\];\}\)/);
  assert.match(nutrition, /source:'forge-meal-plan'/);
});

test('calorie and protein progress targets use the agreed cut targets', () => {
  assert.match(main, /const CAL_TARGET = 1800;/);
  assert.match(main, /const CAL_TARGET_REST = 1800;/);
  assert.match(main, /setMacro\('calProteinEaten', totalProtein, 180,/);
});

test('smart nutrition script is loaded and included in the service-worker cache', () => {
  assert.match(html, /<script src="\.\/34-smart-nutrition\.js"><\/script>/);
  assert.match(sw, /forge-static-v25/);
  assert.match(sw, /\.\/34-smart-nutrition\.js/);
});

test('home dashboard snapshot is driven by the same food log and meal state', () => {
  assert.match(nutrition, /id='forgeHomeNutritionSnapshot'/);
  assert.match(nutrition, /renderHomeSnapshot\(t,done\)/);
  assert.match(nutrition, /forgeHomeKcalBar/);
  assert.match(nutrition, /forgeHomeProteinBar/);
  assert.match(nutrition, /MEALS\.filter\(function\(m\)\{return !!done\[m\.id\];\}\)/);
  assert.match(nutrition, /insertAdjacentElement\('afterend',card\)/);
});
