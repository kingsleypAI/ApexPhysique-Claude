/* FORGE nutrition adherence: meal-plan shortcuts, daily targets and weekly consistency. */
(function(){
 'use strict';
 var KEY='forge_nutrition_meals_v1',CAL='apx_calories_v1';
 var TARGET={min:1700,max:1900,protein:180,mid:1800};
 var MEALS=[
  {id:'breakfast',name:'Breakfast · banana yoghurt oats & eggs',kcal:445,protein:28,carbs:48,fats:15,detail:'20g oats · 200g yoghurt · 2 eggs · 1 banana'},
  {id:'lunch',name:'Lunch · paprika chicken, lentil & rice bowl',kcal:549,protein:56,carbs:57,fats:10,detail:'135g chicken · 65g dry lentils · 20g dry rice · vegetables'},
  {id:'snack',name:'Snack · cottage cheese & yoghurt bowl',kcal:329,protein:43,carbs:16,fats:10,detail:'250g cottage cheese · 200g yoghurt'},
  {id:'dinner',name:'Dinner · chilli tomato chicken & lentil pot',kcal:548,protein:61,carbs:47,fats:13,detail:'135g chicken · 65g dry lentils · vegetables · 1 egg'}
 ];
 function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{};}catch(e){return {};}}
 function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
 function day(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
 function cal(){return read(CAL);}
 function entries(){return cal()[day()]||[];}
 function totals(list){return list.reduce(function(t,e){t.kcal+=Number(e.kcal)||0;t.protein+=Number(e.protein)||0;return t;},{kcal:0,protein:0});}
 function ensureHomeSnapshot(){
  var anchor=document.getElementById('homeMiniCal');
  if(!anchor||document.getElementById('forgeHomeNutritionSnapshot'))return;
  var card=document.createElement('section');
  card.id='forgeHomeNutritionSnapshot';
  card.style.cssText='background:var(--surface);border:1px solid var(--border2);border-radius:12px;padding:13px 14px;margin:0 0 14px;';
  card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:11px"><div><div style="font-size:9px;font-weight:800;letter-spacing:.1em;color:var(--accent-text)">TODAY\'S FUEL</div><div style="font-size:14px;font-weight:800;color:var(--white)">Nutrition at a glance</div></div><div id="forgeHomeMealCount" style="font-size:10px;font-weight:800;color:var(--accent-text);white-space:nowrap">0 / 4 meals</div></div>'+
   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">'+
   '<div style="background:var(--card);border:1px solid var(--border);border-radius:9px;padding:10px"><div style="font-size:9px;color:var(--grey);text-transform:uppercase">Calories</div><div id="forgeHomeKcal" style="font-size:21px;font-weight:800;color:var(--white)">0</div><div style="font-size:9px;color:var(--grey)">of 1,700–1,900 kcal</div><div style="height:4px;background:var(--border);border-radius:4px;margin-top:7px;overflow:hidden"><div id="forgeHomeKcalBar" role="progressbar" aria-label="Calories toward 1,900 kcal upper target" aria-valuemin="0" aria-valuemax="1900" aria-valuenow="0" style="height:100%;width:0;background:var(--accent)"></div></div></div>'+
   '<div style="background:var(--card);border:1px solid var(--border);border-radius:9px;padding:10px"><div style="font-size:9px;color:var(--grey);text-transform:uppercase">Protein</div><div id="forgeHomeProtein" style="font-size:21px;font-weight:800;color:var(--white)">0g</div><div style="font-size:9px;color:var(--grey)">of 180g target</div><div style="height:4px;background:var(--border);border-radius:4px;margin-top:7px;overflow:hidden"><div id="forgeHomeProteinBar" role="progressbar" aria-label="Protein toward 180g target" aria-valuemin="0" aria-valuemax="180" aria-valuenow="0" style="height:100%;width:0;background:var(--accent)"></div></div></div></div>'+
   '<div id="forgeHomeNutritionStatus" aria-live="polite" style="font-size:10px;color:var(--mid);line-height:1.5;margin-top:9px">Log food to see today\'s progress.</div>';
  anchor.insertAdjacentElement('afterend',card);
 }
 function renderHomeSnapshot(t,done){
  var card=document.getElementById('forgeHomeNutritionSnapshot');if(!card)return;
  var kcal=document.getElementById('forgeHomeKcal'),protein=document.getElementById('forgeHomeProtein');
  if(!kcal||!protein)return;
  kcal.textContent=Math.round(t.kcal).toLocaleString();protein.textContent=Math.round(t.protein)+'g';
  var kb=document.getElementById('forgeHomeKcalBar'),pb=document.getElementById('forgeHomeProteinBar');
  if(kb){kb.style.width=Math.min(100,t.kcal/TARGET.max*100)+'%';kb.setAttribute('aria-valuenow',String(Math.round(t.kcal)));}
  if(pb){pb.style.width=Math.min(100,t.protein/TARGET.protein*100)+'%';pb.setAttribute('aria-valuenow',String(Math.round(t.protein)));}
  var count=MEALS.filter(function(m){return !!done[m.id];}).length;
  document.getElementById('forgeHomeMealCount').textContent=count+' / 4 meals';
  var msg=t.kcal<TARGET.min?Math.round(TARGET.min-t.kcal)+' kcal to reach your range':t.kcal>TARGET.max?Math.round(t.kcal-TARGET.max)+' kcal above your range':'Inside your calorie range';
  msg+=' · '+(t.protein>=TARGET.protein?'Protein target reached':Math.round(TARGET.protein-t.protein)+'g protein to target');
  document.getElementById('forgeHomeNutritionStatus').textContent=count+' of 4 planned meals added · '+msg;
 }
 function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function ensure(){
  var host=document.getElementById('tab-nutrition');if(!host||document.getElementById('forgeNutritionTracker'))return;
  var box=document.createElement('section');box.id='forgeNutritionTracker';box.style.cssText='background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:14px;margin:0 0 16px;';
  box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px"><div><div style="font-size:10px;color:var(--accent-text);font-weight:800;letter-spacing:.1em">DAILY ADHERENCE</div><div style="font-size:18px;font-weight:800;color:var(--white)">Nutrition tracker</div></div><div id="forgeNutritionDate" style="font-size:10px;color:var(--grey)"></div></div>'+
   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">'+
   '<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:11px"><div style="font-size:9px;color:var(--grey);text-transform:uppercase">Calories logged</div><div id="forgeNutKcal" style="font-size:23px;font-weight:800;color:var(--white)">0</div><div style="font-size:10px;color:var(--grey)">Target 1,700–1,900 kcal</div><div style="height:5px;background:var(--border);border-radius:4px;margin-top:8px;overflow:hidden"><div id="forgeNutKcalBar" style="height:100%;width:0;background:var(--accent)"></div></div></div>'+
   '<div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:11px"><div style="font-size:9px;color:var(--grey);text-transform:uppercase">Protein logged</div><div id="forgeNutProtein" style="font-size:23px;font-weight:800;color:var(--white)">0g</div><div style="font-size:10px;color:var(--grey)">Target 180g+</div><div style="height:5px;background:var(--border);border-radius:4px;margin-top:8px;overflow:hidden"><div id="forgeNutProteinBar" style="height:100%;width:0;background:var(--accent)"></div></div></div></div>'+
   '<div id="forgeNutStatus" style="font-size:11px;color:var(--mid);margin:10px 0 12px;line-height:1.5"></div>'+
   '<div style="font-size:10px;font-weight:800;color:var(--grey);letter-spacing:.08em;margin:8px 0">YOUR FOUR PLANNED MEALS</div><div id="forgeNutMeals" style="display:flex;flex-direction:column;gap:7px"></div>'+
   '<div style="border-top:1px solid var(--border);margin-top:14px;padding-top:12px"><div style="font-size:12px;font-weight:800;color:var(--white)">Weekly consistency</div><div style="font-size:10px;color:var(--grey);margin:3px 0 8px">Based on actual entries saved in your food log. Empty days are not counted as zero.</div><div id="forgeNutWeek" style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px"></div><div id="forgeNutWeekSummary" style="font-size:11px;color:var(--mid);margin-top:9px"></div></div>'+
   '<div style="font-size:9px;color:var(--grey);line-height:1.5;margin-top:10px">Meal shortcuts add the plan estimates to your existing food log. If you change portions or eat something else, use your normal food logging method and the totals update from that same log. Estimates vary by brand and packet label.</div>';
  var first=host.querySelector('.sec-title');if(first&&first.parentNode)first.parentNode.insertBefore(box,first.nextSibling);else host.insertBefore(box,host.firstChild);
 }
 function render(){
  var log=cal(),today=log[day()]||[],t=totals(today),state=read(KEY),done=state[day()]||{};
  renderHomeSnapshot(t,done);
  var kcal=document.getElementById('forgeNutKcal'),prot=document.getElementById('forgeNutProtein');
  if(!kcal||!prot)return;
  document.getElementById('forgeNutritionDate').textContent=new Date().toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
  kcal.textContent=Math.round(t.kcal).toLocaleString();prot.textContent=Math.round(t.protein)+'g';
  document.getElementById('forgeNutKcalBar').style.width=Math.min(100,t.kcal/TARGET.max*100)+'%';
  document.getElementById('forgeNutProteinBar').style.width=Math.min(100,t.protein/TARGET.protein*100)+'%';
  var status=t.kcal<TARGET.min?'Below calorie range by '+Math.round(TARGET.min-t.kcal)+' kcal':t.kcal>TARGET.max?'Above calorie range by '+Math.round(t.kcal-TARGET.max)+' kcal':'Inside your calorie range';
  status+=' · '+(t.protein>=TARGET.protein?'Protein target reached':Math.round(TARGET.protein-t.protein)+'g protein to target');
  document.getElementById('forgeNutStatus').textContent=status;
  document.getElementById('forgeNutMeals').innerHTML=MEALS.map(function(m){
   var on=!!done[m.id];return '<div style="display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid '+(on?'var(--accent)':'var(--border)')+';border-radius:9px;padding:10px"><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:700;color:var(--white)">'+esc(m.name)+'</div><div style="font-size:9px;color:var(--grey);margin-top:3px">'+esc(m.detail)+'</div><div style="font-size:10px;color:var(--accent-text);margin-top:4px">'+m.kcal+' kcal · '+m.protein+'g protein</div></div><button type="button" data-meal="'+m.id+'" style="flex-shrink:0;border:1px solid '+(on?'var(--accent)':'var(--border2)')+';background:'+(on?'rgba(139,92,246,.2)':'var(--surface)')+';color:var(--white);border-radius:8px;padding:8px 10px;font-size:10px;font-weight:800">'+(on?'✓ ADDED':'+ ADD')+'</button></div>';
  }).join('');
  var days=[],weekK=0,weekP=0;
  for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');var arr=log[k]||[],v=totals(arr),has=arr.length>0;days.push({label:d.toLocaleDateString('en-GB',{weekday:'short'}),has:has,kcal:v.kcal,protein:v.protein});if(has){weekK+=v.kcal;weekP+=v.protein;}}
  document.getElementById('forgeNutWeek').innerHTML=days.map(function(d){var good=d.has&&d.kcal>=TARGET.min&&d.kcal<=TARGET.max&&d.protein>=TARGET.protein;return '<div style="text-align:center"><div style="height:48px;border-radius:6px;background:var(--card);border:1px solid var(--border);display:flex;align-items:end;overflow:hidden"><div style="width:100%;height:'+(d.has?Math.max(5,Math.min(100,d.kcal/TARGET.max*100)):0)+'%;background:'+(good?'var(--accent)':'var(--border2)')+'"></div></div><div style="font-size:8px;color:var(--grey);margin-top:4px">'+d.label+'</div><div style="font-size:8px;color:var(--mid)">'+(d.has?Math.round(d.kcal/100)/10+'k':'—')+'</div></div>';}).join('');
  var count=days.filter(function(d){return d.has;}).length;
  document.getElementById('forgeNutWeekSummary').textContent=count?count+' logged day'+(count===1?'':'s')+' · average '+Math.round(weekK/count)+' kcal and '+Math.round(weekP/count)+'g protein · '+days.filter(function(d){return d.has&&d.kcal>=TARGET.min&&d.kcal<=TARGET.max&&d.protein>=TARGET.protein;}).length+' days hit both targets':'No food entries logged this week yet.';
 }
 function toggle(id){
  var state=read(KEY),done=state[day()]||{},log=cal(),arr=log[day()]||[],m=MEALS.find(function(x){return x.id===id;});if(!m)return;
  if(done[id]){arr=arr.filter(function(e){return e.id!==done[id];});delete done[id];}
  else{var eid='forge-meal-'+id+'-'+day();arr.push({id:eid,name:m.name,kcal:m.kcal,protein:m.protein,carbs:m.carbs,fats:m.fats,time:new Date().toTimeString().slice(0,5),source:'forge-meal-plan'});done[id]=eid;}
  log[day()]=arr;state[day()]=done;write(CAL,log);write(KEY,state);render();
 }
 function init(){
  ensure();ensureHomeSnapshot();var box=document.getElementById('forgeNutritionTracker');if(!box)return;
  box.addEventListener('click',function(e){var b=e.target.closest('button[data-meal]');if(b)toggle(b.dataset.meal);});
  render();
  window.addEventListener('storage',function(e){if(e.key===CAL||e.key===KEY)render();});
  var old=window.calAddEntry;if(typeof old==='function'&&!old.__forgeWrapped){window.calAddEntry=function(){old.apply(this,arguments);render();};window.calAddEntry.__forgeWrapped=true;}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.renderForgeNutrition=render;
})();