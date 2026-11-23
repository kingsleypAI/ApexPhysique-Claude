/* FORGE weekly shopping and spend tracker. Keeps legacy monthly checks separate. */
(function(){
  'use strict';
  var MONTHLY_BUDGET=150;
  var ITEMS={
    'si-budget-chicken':['1.89kg','£8.90',38.16],
    'si-budget-yoghurt':['2.8kg','£4.17',17.88],
    'si-budget-cottage':['1.75kg','£4.96',21.25],
    'si-budget-lentils':['930g','£1.66',7.12],
    'si-budget-eggs':['21 eggs','£3.47',14.85],
    'si-budget-oats':['140g','£0.20',0.85],
    'si-budget-rice':['140g','£0.12',0.52],
    'si-budget-veg':['1.4kg','£1.39',5.94],
    'si-budget-fruit':['7 bananas','£1.09',4.68],
    'si-budget-tomatoes':['700g','£0.80',3.44],
    'si-budget-onions':['350g onions + 350g carrots','£0.79',3.40],
    'si-budget-potatoes':['1.2kg','£0.93',3.98],
    'si-budget-bread':['about ½ loaf','£0.37',1.58],
    'si-budget-milk':['1.05L','£0.82',3.50],
    'si-budget-apples':['470g','£0.82',3.50],
    'si-budget-flavour':['Weekly share of allowance','£1.40',6.00]
  };
  var mode='weekly',weeklyKey='';
  function safeRead(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch(e){return {};}}
  function mondayKey(){
    var d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function key(){return 'forge_shop_week_'+weeklyKey;}
  function currentState(){return safeRead(mode==='weekly'?key():'apx_shop');}
  function writeState(d){try{localStorage.setItem(mode==='weekly'?key():'apx_shop',JSON.stringify(d));}catch(e){}}
  function money(n){return '£'+n.toFixed(2);}
  function addControls(){
    var host=document.querySelector('#tab-shopping .shop-toggle');
    if(!host||document.getElementById('forgeShopView'))return;
    var wrap=document.createElement('div');wrap.id='forgeShopView';wrap.style.cssText='display:flex;gap:8px;margin:12px 0 8px;';
    wrap.innerHTML='<button type="button" data-view="weekly" style="flex:1;padding:10px;border-radius:9px;border:1px solid var(--accent);background:rgba(139,92,246,.18);color:var(--white);font-weight:700">7-day shop</button><button type="button" data-view="monthly" style="flex:1;padding:10px;border-radius:9px;border:1px solid var(--border2);background:var(--surface);color:var(--mid);font-weight:700">30-day basket</button>';
    host.parentNode.insertBefore(wrap,host);
    wrap.addEventListener('click',function(e){var b=e.target.closest('button[data-view]');if(b)setMode(b.dataset.view);});
    var note=document.createElement('div');note.id='forgeShopNote';note.style.cssText='font-size:10px;color:var(--grey);line-height:1.5;margin:0 0 10px;';
    note.textContent='Weekly quantities are 7-day portions from the 30-day plan; costs are averaged estimates, not exact pack prices. Chilled items can be bought weekly at Aldi.';
    wrap.parentNode.insertBefore(note,host);
    var spend=document.createElement('div');spend.id='forgeShopSpend';spend.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0;';
    spend.innerHTML='<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px"><div id="forgeShopSpendLabel" style="font-size:9px;color:var(--grey);text-transform:uppercase">Checked this week</div><div id="forgeShopSpendValue" style="font-size:19px;font-weight:800;color:var(--white)">£0.00</div></div><div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px"><div id="forgeShopBudgetLabel" style="font-size:9px;color:var(--grey);text-transform:uppercase">Weekly allowance</div><div id="forgeShopBudgetValue" style="font-size:19px;font-weight:800;color:var(--accent-text)">£35.00</div></div>';
    var progress=document.getElementById('shopProgressFill');
    if(progress&&progress.parentNode.parentNode)progress.parentNode.parentNode.parentNode.insertBefore(spend,progress.parentNode.parentNode);
    var actions=document.createElement('div');actions.id='forgeShopActions';actions.style.cssText='display:flex;gap:8px;margin:8px 0 12px;';
    actions.innerHTML='<button type="button" id="forgeShopCheckAll" style="flex:1;padding:9px;border:1px solid var(--border2);border-radius:8px;background:var(--surface);color:var(--white);font-size:10px;font-weight:700">CHECK VISIBLE ITEMS</button><button type="button" id="forgeShopReset" style="padding:9px 12px;border:1px solid var(--border2);border-radius:8px;background:var(--surface);color:var(--mid);font-size:10px;font-weight:700">RESET</button>';
    var list=document.getElementById('sh-food');if(list)list.parentNode.insertBefore(actions,list);
    actions.addEventListener('click',function(e){if(e.target.id==='forgeShopCheckAll')checkVisible();if(e.target.id==='forgeShopReset')resetVisible();});
  }
  function rows(){return Array.from(document.querySelectorAll('#sh-food .shop-item'));}
  function setMode(next){
    mode=next==='monthly'?'monthly':'weekly';
    document.querySelectorAll('#forgeShopView button').forEach(function(b){var on=b.dataset.view===mode;b.style.background=on?'rgba(139,92,246,.18)':'var(--surface)';b.style.borderColor=on?'var(--accent)':'var(--border2)';b.style.color=on?'var(--white)':'var(--mid)';});
    document.getElementById('forgeShopSpendLabel').textContent=mode==='weekly'?'Checked this week':'Checked basket value';
    document.getElementById('forgeShopBudgetLabel').textContent=mode==='weekly'?'Weekly allowance':'Monthly ceiling';
    document.getElementById('forgeShopBudgetValue').textContent=money(mode==='weekly'?35:MONTHLY_BUDGET);
    document.getElementById('forgeShopNote').textContent=mode==='weekly'?'7-day usage guide based on your 30-day portions. Costs are averaged estimates, not exact pack prices; buy chilled food weekly at Aldi. Your tick-off resets automatically each Monday.':'Full 30-day quantities and estimated basket costs. This is the complete planned basket, not a requirement to buy chilled dairy all at once.';
    rows().forEach(function(row){
      var id=row.id,meta=ITEMS[id],qty=row.querySelector('.shop-item-qty');
      if(!qty||!meta)return;
      if(!qty.dataset.monthText)qty.dataset.monthText=qty.textContent;
      qty.textContent=mode==='weekly'?meta[0]+' · '+meta[1]:qty.dataset.monthText;
    });
    restoreVisible();render();
  }
  function restoreVisible(){
    var d=currentState();
    rows().forEach(function(row){var b=row.querySelector('.shop-chk');if(!b)return;var done=!!d[row.id];b.classList.toggle('done',done);row.classList.toggle('done-item',done);});
  }
  function checkedSpend(){
    return rows().reduce(function(sum,row){var b=row.querySelector('.shop-chk'),m=ITEMS[row.id];return sum+(b&&b.classList.contains('done')&&m?m[2]*(mode==='weekly'?7/30:1):0);},0);
  }
  function render(){
    var all=rows().filter(function(row){return !!row.querySelector('.shop-chk');}),done=all.filter(function(row){return row.querySelector('.shop-chk').classList.contains('done');});
    var pct=all.length?Math.round(done.length/all.length*100):0,spend=checkedSpend();
    var fill=document.getElementById('shopProgressFill'),txt=document.getElementById('shopProgressText');
    if(fill)fill.style.width=pct+'%';
    if(txt)txt.textContent=done.length+' of '+all.length+' items checked · '+money(spend)+' checked';
    document.getElementById('forgeShopSpendValue').textContent=money(spend);
    var limit=mode==='weekly'?35:MONTHLY_BUDGET,remaining=limit-spend;
    var budget=document.getElementById('forgeShopBudgetValue');budget.textContent=money(Math.max(0,remaining))+' left';
    budget.style.color=remaining<0?'#ff8585':'var(--accent-text)';
  }
  function toggle(btn,id){
    var row=document.getElementById(id);if(!row)return;
    var d=currentState(),done=!(d[id]===true);d[id]=done;writeState(d);
    btn.classList.toggle('done',done);row.classList.toggle('done-item',done);render();
  }
  function checkVisible(){
    var d=currentState();rows().forEach(function(row){var b=row.querySelector('.shop-chk');if(!b)return;d[row.id]=true;b.classList.add('done');row.classList.add('done-item');});writeState(d);render();
  }
  function resetVisible(){
    var d=currentState();rows().forEach(function(row){var b=row.querySelector('.shop-chk');if(!b)return;delete d[row.id];b.classList.remove('done');row.classList.remove('done-item');});writeState(d);render();
  }
  function init(){
    weeklyKey=mondayKey();addControls();
    var apple=document.querySelector('#sh-food .shop-item:not([id])');
    if(apple){apple.id='si-budget-apples';var b=document.createElement('button');b.type='button';b.className='shop-chk';b.textContent='✓';b.onclick=function(){window.toggleShopItem(this,apple.id);};apple.insertBefore(b,apple.firstChild);}
    window.toggleShopItem=toggle;window.updateShopProgress=render;
    var original=window.switchShop;window.switchShop=function(t){if(typeof original==='function')original(t);render();};
    setMode('weekly');
    window.addEventListener('storage',function(e){if(e.key===key()){restoreVisible();render();}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();