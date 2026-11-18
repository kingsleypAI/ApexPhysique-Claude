/* FORGE performance insights, achievements and accurate timers. */
(function(){
  'use strict';
  var restDeadline=0,restTick=null,sessionStartedAt=0;
  function esc(s){return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function todayKey(){return forgeLocalDateKey(new Date());}
  // Per-exercise logger removed: weight and reps are entered in the main workout logger.
  function startSetRest(){
    restDeadline=Date.now()+90000;
    if(restTick)clearInterval(restTick);
    function tick(){
      var remaining=Math.max(0,Math.ceil((restDeadline-Date.now())/1000));
      document.querySelectorAll('[data-forge-timer]').forEach(function(el){el.textContent=remaining?'Rest timer · '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'):'Rest complete · next set when ready';});
      if(!remaining){clearInterval(restTick);restTick=null;if(typeof fireTimerNotification==='function')fireTimerNotification();if(typeof playBeep==='function')playBeep();}
    }
    tick();restTick=setInterval(tick,250);
  }
  function countSessions(done){var total=0;Object.keys(done||{}).forEach(function(k){if(done[k]&&Object.values(done[k]).filter(Boolean).length>=4)total++;});return total;}
  function buildInsights(){
    var host=document.getElementById('homePRsCard');if(!host||document.getElementById('forgeInsights'))return;
    var panel=document.createElement('section');panel.id='forgeInsights';panel.className='forge-panel';
    panel.innerHTML='<div class="forge-panel-head"><div><div class="forge-kicker">FORGE PERFORMANCE</div><div class="forge-panel-title">Weekly report & achievements</div></div><span style="font-size:20px">📈</span></div><div id="forgeMetrics" class="forge-metric-grid"></div><div id="forgeAchievements" class="forge-achievements"></div><div id="forgeWeeklyReport" class="forge-report"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="forge-action" id="forgeRefreshReport">REFRESH REPORT</button><button class="forge-action secondary" id="forgeCopyReport">COPY SUMMARY</button></div>';
    host.parentNode.insertBefore(panel,host);
    panel.addEventListener('click',function(e){if(e.target.id==='forgeRefreshReport')renderInsights();if(e.target.id==='forgeCopyReport')copyReport();});
    renderInsights();
  }
  var latestReport='';
  function renderInsights(){
    var metrics=document.getElementById('forgeMetrics'),ach=document.getElementById('forgeAchievements'),report=document.getElementById('forgeWeeklyReport');if(!metrics||!ach||!report)return;
    var done=typeof getAllDoneData==='function'?getAllDoneData():forgeSafeJSON(localStorage.getItem('apx_done_v1')||'{}',{});
    var sessions=countSessions(done),today=new Date(),weekDays=[];
    for(var i=6;i>=0;i--){var d=new Date(today);d.setDate(today.getDate()-i);weekDays.push(forgeLocalDateKey(d));}
    var weekSessions=weekDays.filter(function(k){return done[k]&&Object.values(done[k]).filter(Boolean).length>=4;}).length;
    var weekExercises=weekDays.reduce(function(n,k){return n+(done[k]?Object.values(done[k]).filter(Boolean).length:0);},0);
    var weights=typeof getCheckinHistory==='function'?getCheckinHistory():forgeSafeJSON(localStorage.getItem('apx_checkin_v1')||'[]',[]);
    var weightText='—';if(weights.length&&weights[0].weight){weightText=Number(weights[0].weight).toFixed(1)+' kg';if(weights.length>1&&weights[1].weight)weightText+=' ('+(Number(weights[0].weight)-Number(weights[1].weight)>0?'+':'')+(Number(weights[0].weight)-Number(weights[1].weight)).toFixed(1)+')';}
    var calories=forgeSafeJSON(localStorage.getItem('apx_calories_v1')||'{}',{}),kcalDays=[],proteinDays=[];
    weekDays.forEach(function(k){var entries=Array.isArray(calories[k])?calories[k]:[];if(entries.length){kcalDays.push(entries.reduce(function(n,e){return n+(Number(e.kcal)||0);},0));proteinDays.push(entries.reduce(function(n,e){return n+(Number(e.protein)||0);},0));}});
    var avgKcal=kcalDays.length?Math.round(kcalDays.reduce((a,b)=>a+b,0)/kcalDays.length):null;
    var avgProtein=proteinDays.length?Math.round(proteinDays.reduce((a,b)=>a+b,0)/proteinDays.length):null;
    var waterHistory=forgeSafeJSON(localStorage.getItem('forge_water_history_v1')||'{}',{}),waterDays=weekDays.filter(function(k){return waterHistory[k]!=null;}),avgWater=waterDays.length?(waterDays.reduce(function(n,k){return n+(Number(waterHistory[k])||0);},0)/waterDays.length).toFixed(1):null;
    var prLog=forgeSafeJSON(localStorage.getItem('forge_weights_v1')||'{}',{}),prCount=Object.keys(prLog).filter(function(k){return Array.isArray(prLog[k])&&prLog[k].length>0;}).length;
    metrics.innerHTML='<div class="forge-metric"><strong>'+weekSessions+'/7</strong><span>Training sessions this week</span></div><div class="forge-metric"><strong>'+weekExercises+'</strong><span>Exercises ticked this week</span></div><div class="forge-metric"><strong>'+sessions+'</strong><span>Lifetime logged sessions</span></div><div class="forge-metric"><strong>'+weightText+'</strong><span>Latest weigh-in · change vs prior</span></div><div class="forge-metric"><strong>'+(avgWater===null?'—':avgWater)+'</strong><span>Glasses of water/day · '+waterDays.length+' logged days</span></div>';
    var awards=[{n:'First session',ok:sessions>=1,e:'🏁'},{n:'5 sessions',ok:sessions>=5,e:'🔥'},{n:'10 sessions',ok:sessions>=10,e:'⚡'},{n:'25 sessions',ok:sessions>=25,e:'🥉'},{n:'50 sessions',ok:sessions>=50,e:'🥈'},{n:'100 sessions',ok:sessions>=100,e:'🥇'},{n:'Strength tracker',ok:prCount>=3,e:'💪'}];
    ach.innerHTML=awards.map(function(a){return '<span class="forge-achievement'+(a.ok?' earned':'')+'">'+a.e+' '+a.n+(a.ok?' ✓':' 🔒')+'</span>';}).join('');
    var lines=['LAST 7 DAYS','Training: '+weekSessions+' complete sessions · '+weekExercises+' exercises ticked','Strength records: '+prCount+' exercises with weight history','Nutrition: '+(avgKcal===null?'No calorie entries logged this week':avgKcal+' kcal/day average across '+kcalDays.length+' logged days')+' · '+(avgProtein===null?'protein not logged':avgProtein+' g/day average'), 'Hydration: '+(avgWater===null?'No water history logged yet':avgWater+' glasses/day across '+waterDays.length+' logged days'), 'Latest bodyweight: '+weightText, 'Focus: aim for consistent sessions, keep training consistently, progress your lifts, and compare like-for-like weekly averages.'];
    latestReport=lines.join('\n');report.textContent=latestReport;
  }
  function copyReport(){if(!latestReport)return;var done=function(){if(typeof showToast==='function')showToast('Weekly summary copied',1800);};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(latestReport).then(done).catch(function(){fallbackCopy();});else fallbackCopy();function fallbackCopy(){var t=document.createElement('textarea');t.value=latestReport;document.body.appendChild(t);t.select();try{document.execCommand('copy');done();}catch(e){}t.remove();}}
  function updatePhaseCycleLabels(){
    if(typeof getCurrentWeek!=='function')return;
    var week=getCurrentWeek(),cycleStart=Math.floor((week-1)/6)*6+1;
    var labels=document.querySelectorAll('.phase-wks');
    var values=['Weeks '+cycleStart+'–'+(cycleStart+1)+' · Volume','Weeks '+(cycleStart+2)+'–'+(cycleStart+3)+' · Power','Weeks '+(cycleStart+4)+'–'+(cycleStart+5)+' · Definition'];
    labels.forEach(function(el,i){if(values[i])el.textContent=values[i];});
  }
  // Accurate countdowns based on timestamps: browser throttling/backgrounding no longer loses seconds.
  window.startStopTimer=function(){
    if(typeof rRun==='undefined')return;
    if(rRun){clearInterval(rInt);rRun=false;document.getElementById('startStopBtn').textContent='RESUME';document.getElementById('timerLabel').textContent='Paused';return;}
    if(rRem===0)rRem=rTime;var end=Date.now()+rRem*1000;rRun=true;document.getElementById('startStopBtn').textContent='PAUSE';document.getElementById('timerLabel').textContent='Resting...';
    clearInterval(rInt);rInt=setInterval(function(){rRem=Math.max(0,Math.ceil((end-Date.now())/1000));updTimer();if(rRem<=0){clearInterval(rInt);rRun=false;document.getElementById('startStopBtn').textContent='START';document.getElementById('timerLabel').textContent='⚡ Go!';if(typeof fireTimerNotification==='function')fireTimerNotification();if(typeof playBeep==='function')playBeep();}},250);
  };
  window.miniStartStop=function(){
    if(_mRun){clearInterval(_mInt);_mInt=null;_mRun=false;releaseWakeLock();document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='RESUME';});return;}
    if(_mRem<=0)_mRem=_mTime;restDeadline=Date.now()+_mRem*1000;_mRun=true;requestWakeLock();document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='PAUSE';});clearInterval(_mInt);
    _mInt=setInterval(function(){_mRem=Math.max(0,Math.ceil((restDeadline-Date.now())/1000));miniUpdDisplay();if(_mRem<=0){clearInterval(_mInt);_mInt=null;_mRun=false;releaseWakeLock();document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='START';});document.querySelectorAll('.mini-timer-display').forEach(function(d){d.textContent='GO!';});if(typeof fireTimerNotification==='function')fireTimerNotification();if(typeof playBeep==='function')playBeep();}},250);
  };
  window.miniReset=function(){clearInterval(_mInt);_mInt=null;_mRun=false;releaseWakeLock();_mRem=_mTime;miniUpdDisplay();document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='START';});};
  window.toggleWorkout=function(){
    if(wRun){wSec=Math.floor((Date.now()-sessionStartedAt)/1000);clearInterval(wInt);wRun=false;document.getElementById('workoutBtn').textContent='RESUME';return;}
    sessionStartedAt=Date.now()-wSec*1000;wRun=true;document.getElementById('workoutBtn').textContent='PAUSE';clearInterval(wInt);
    wInt=setInterval(function(){wSec=Math.floor((Date.now()-sessionStartedAt)/1000);var h=Math.floor(wSec/3600),m=Math.floor((wSec%3600)/60).toString().padStart(2,'0'),s=(wSec%60).toString().padStart(2,'0');var el=document.getElementById('workoutDisplay');if(el)el.textContent=(h>0?h+':':'')+m+':'+s;},500);
  };
  document.addEventListener('visibilitychange',function(){if(!document.hidden){if(_mRun)miniUpdDisplay();if(typeof updateHomeStats==='function')updateHomeStats();}});
  document.addEventListener('DOMContentLoaded',function(){
    buildInsights();updatePhaseCycleLabels();
  });
  window.addEventListener('load',function(){buildInsights();updatePhaseCycleLabels();});
})();
