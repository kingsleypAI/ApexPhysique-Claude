// ── ALDI BUDGET MEAL ROTATION ─────────────────────────────────────
var LUNCH_ROTATION = {
  1: {name:'Paprika chicken & lentil bowl', desc:'135g chicken · 65g dry lentils · 20g dry rice · vegetables'},
  2: {name:'Chicken & lentil curry', desc:'135g chicken · 65g dry lentils · curry spices · vegetables'},
  3: {name:'Chilli tomato chicken pot', desc:'135g chicken · 65g dry lentils · tomato · chilli · vegetables'},
  4: {name:'Garlic herb chicken bowl', desc:'135g chicken · 65g dry lentils · garlic herbs · 20g rice'},
  5: {name:'Smoky paprika lentil bowl', desc:'135g chicken · 65g dry lentils · smoked paprika · vegetables'},
  6: {name:'Cumin & tomato chicken dhal', desc:'135g chicken · 65g dry lentils · cumin · tomato · vegetables'},
  0: {name:'Fajita chicken & lentils', desc:'135g chicken · 65g dry lentils · fajita-style seasoning · vegetables'}
};

var PROTEIN_SNACK_ROTATION = {
  1: {name:'Cottage cheese protein bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · herbs'},
  2: {name:'Garlic & herb cottage bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · garlic'},
  3: {name:'Peppery yoghurt cottage bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · black pepper'},
  4: {name:'Cottage cheese protein bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · herbs'},
  5: {name:'Garlic & herb cottage bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · garlic'},
  6: {name:'Peppery yoghurt cottage bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · black pepper'},
  0: {name:'Cottage cheese protein bowl', desc:'250g low-fat cottage cheese · 200g fat-free Greek-style yoghurt · herbs'}
};

function updateMealRotation(){
  try{
    var today = new Date().getDay(); // 0=Sun, 1=Mon, ... 6=Sat
    var lunch = LUNCH_ROTATION[today];
    var snack = PROTEIN_SNACK_ROTATION[today];

    var lunchNameEl = document.getElementById('mealLunchName');
    var lunchDescEl = document.getElementById('mealLunchDesc');
    var snackNameEl = document.getElementById('mealSnackName');
    var snackDescEl = document.getElementById('mealSnackDesc');

    if(lunchNameEl && lunch){ lunchNameEl.textContent = lunch.name; }
    if(lunchDescEl && lunch){ lunchDescEl.textContent = lunch.desc; }
    if(snackNameEl && snack){ snackNameEl.textContent = snack.name; }
    if(snackDescEl && snack){ snackDescEl.textContent = snack.desc; }
  }catch(e){}
}
