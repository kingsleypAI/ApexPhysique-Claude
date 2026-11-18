// ── MEAL VARIETY ROTATION ────────────────────────────────────────
var LUNCH_ROTATION = {
  1: {name:'Lunch', desc:'0% Greek yoghurt · mixed berries · honey · 1 scoop protein powder'},
  2: {name:'Lunch — wrap', desc:'Wrap · ham or chicken slices · light mayo · lettuce'},
  3: {name:'Lunch', desc:'0% Greek yoghurt · mixed berries · honey · 1 scoop protein powder'},
  4: {name:'Lunch — boiled eggs', desc:'2 boiled eggs · ready-salted crisps · apple'},
  5: {name:'Lunch', desc:'0% Greek yoghurt · mixed berries · honey · 1 scoop protein powder'},
  6: {name:'Lunch — noodle pot', desc:'Instant noodle pot · tin of tuna or chicken mixed in'},
  0: {name:'Lunch — wrap', desc:'Wrap · ham or chicken slices · light mayo · lettuce'}
};

var TUNA_ROTATION = {
  1: {name:'Tuna — after work', desc:'1 can tuna in spring water, drained — straight after work, before dinner'},
  2: {name:'Tinned chicken — after work', desc:'1 pack tinned chicken breast, drained — straight after work, before dinner'},
  3: {name:'Tuna — after work', desc:'1 can tuna in spring water, drained — straight after work, before dinner'},
  4: {name:'Tuna — after work', desc:'1 can tuna in spring water, drained — straight after work, before dinner'},
  5: {name:'Tinned chicken — after work', desc:'1 pack tinned chicken breast, drained — straight after work, before dinner'},
  6: {name:'Tuna — after work', desc:'1 can tuna in spring water, drained — straight after work, before dinner'},
  0: {name:'Tuna — after work', desc:'1 can tuna in spring water, drained — straight after work, before dinner'}
};

function updateMealRotation(){
  try{
    var today = new Date().getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    var lunch = LUNCH_ROTATION[today];
    var tuna  = TUNA_ROTATION[today];

    var lunchNameEl = document.getElementById('mealLunchName');
    var lunchDescEl = document.getElementById('mealLunchDesc');
    var tunaNameEl  = document.getElementById('mealTunaName');
    var tunaDescEl  = document.getElementById('mealTunaDesc');

    if(lunchNameEl && lunch){ lunchNameEl.textContent = lunch.name; }
    if(lunchDescEl && lunch){ lunchDescEl.textContent = lunch.desc; }
    if(tunaNameEl && tuna){ tunaNameEl.textContent = tuna.name; }
    if(tunaDescEl && tuna){ tunaDescEl.textContent = tuna.desc; }
  }catch(e){}
}
