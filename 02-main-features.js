// ── RECIPES ─────────────────────────────────────────────────────────────────
function toggleRecipe(c){c.classList.toggle('open');}

// ── TABS ─────────────────────────────────────────────────────────────────────

var WL_KEY='forge_weights_v1';
function getWeightLog(){return JSON.parse(localStorage.getItem(WL_KEY)||'{}');}
function saveWeightLog(log){localStorage.setItem(WL_KEY,JSON.stringify(log));  try{document.dispatchEvent(new Event('weightLogged'));}catch(e){}
}
function exKey(name){return name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');}
function logExerciseWeight(name){
  var key=exKey(name),input=document.getElementById('wl-input-'+key);if(!input)return;
  var val=parseFloat(input.value);if(!val||val<=0){input.style.borderColor='var(--accent)';setTimeout(function(){input.style.borderColor='';},1000);return;}
  var log=getWeightLog();if(!log[key])log[key]=[];
  var today=forgeLocalDateKey(new Date());
  log[key]=log[key].filter(function(e){return e.date!==today;});
  log[key].push({kg:val,date:today,ts:Date.now()});
  // Keep the complete history so lifetime PRs and long-term trends remain accurate.
  saveWeightLog(log);input.value='';renderExerciseWeightLog(name);
  var allE=log[key]||[];var prevPR=allE.length>1?Math.max.apply(null,allE.slice(0,-1).map(function(e){return e.kg;})):0;
  if(val>prevPR&&prevPR>0&&typeof showToast==='function'){showToast('🏆 NEW PR! '+val+'kg on '+name+'. Next: '+(val+2.5)+'kg',4000);}
  else if(val===prevPR&&prevPR>0&&typeof showToast==='function'){showToast('✓ PR matched! Try '+(val+2.5)+'kg next session',3500);}
  else{showWtToast(name,val);}
}
function renderExerciseWeightLog(name){
  var scrollY=window.scrollY;
  var key=exKey(name),log=getWeightLog(),entries=(log[key]||[]).slice().sort(function(a,b){return b.ts-a.ts;});
  var pr=document.getElementById('wl-pr-'+key);if(pr)pr.textContent=entries.length>0?'PR: '+Math.max.apply(null,entries.map(function(e){return e.kg;}))+'kg':'';
  var hist=document.getElementById('wl-hist-'+key);
  if(hist){hist.innerHTML=!entries.length?'<span class="ex-weight-chip">No entries yet</span>':entries.slice(0,5).map(function(e,i){var d=forgeParseLocalDate(e.date);return '<span class="ex-weight-chip'+(i===0?' latest':'')+'">'+e.kg+'kg · '+d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})+'</span>';}).join('');}

  window.scrollTo(0,scrollY);
}
function showWtToast(name,kg){var t=document.createElement('div');t.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#aaaaaa;color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;z-index:9999;white-space:nowrap;";t.textContent='✓ '+kg+'kg logged for '+name;document.body.appendChild(t);setTimeout(function(){t.style.opacity='0';t.style.transition='opacity 0.3s';setTimeout(function(){t.remove();},300);},2000);}
function initWeightLogs(){
  // Restore weight logs using wname elements
  document.querySelectorAll('.wname').forEach(function(el){
    var name = el.textContent.trim();
    if(name) renderExerciseWeightLog(name);
  });
  // Also pre-fill each input with the most recent weight logged
  var log = getWeightLog();
  document.querySelectorAll('.ex-weight-input').forEach(function(inp){
    var key = inp.id.replace('wl-input-','');
    if(log[key] && log[key].length > 0){
      var last = log[key].slice().sort(function(a,b){return b.ts-a.ts;})[0];
      inp.placeholder = 'Last: ' + last.kg + 'kg';
    }
  });
  // Tap-to-fill: tapping an empty input auto-fills last session's weight,
  // so you don't have to retype it with chalked or fatigued hands
  document.querySelectorAll('.ex-weight-input').forEach(function(inp){
    if(inp.dataset.tapfillBound) return; // avoid double-binding on repeated calls
    inp.dataset.tapfillBound = 'true';
    inp.addEventListener('focus', function(){
      if(!this.value && this.placeholder && this.placeholder.indexOf('Last:') === 0){
        var match = this.placeholder.match(/[\d.]+/);
        if(match) this.value = match[0];
      }
    });
  });
}


// ── CARDS ─────────────────────────────────────────────────────────────────────
function toggleCard(c){c.classList.toggle('open');}
function togglePhase(c){c.classList.toggle('open');}
function chk(e,b){e.stopPropagation();b.classList.toggle('done');}
function toggleMeal(r){r.classList.toggle('open');}

// ── TRAINING TIME ──────────────────────────────────────────────────────────────
function setTime(t){
  document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('btn-'+t).classList.add('active');
  document.querySelectorAll('.schedule-reveal').forEach(s=>s.classList.remove('on'));
  document.getElementById('sched-'+t).classList.add('on');
  localStorage.setItem('apx_time',t);
  const el=document.getElementById('shop-time-display');
  if(el) el.textContent=t==='am'?'your morning training schedule':'your evening training schedule';
}

// ── MEAL PLAN ──────────────────────────────────────────────────────────────────
function switchMeal(t){
  document.querySelectorAll('.mstab').forEach(b=>b.classList.remove('active'));
  document.getElementById('ms-'+t).classList.add('active');
  document.querySelectorAll('.mplan').forEach(p=>p.classList.remove('active'));
  document.getElementById('mp-'+t).classList.add('active');
  localStorage.setItem('apx_meal',t);
}

// ── SHOPPING ──────────────────────────────────────────────────────────────────
function switchShop(t){
  document.querySelectorAll('.shop-tab').forEach(b=>b.classList.remove('active'));
  document.getElementById('sh-'+t+'-btn').classList.add('active');
  document.querySelectorAll('.shop-list-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('sh-'+t).classList.add('active');
  updateShopProgress();
}
function toggleShopItem(btn,id){
  btn.classList.toggle('done');
  const item=document.getElementById(id);
  if(item) item.classList.toggle('done-item');
  const d=JSON.parse(localStorage.getItem('apx_shop')||'{}');
  d[id]=btn.classList.contains('done');
  localStorage.setItem('apx_shop',JSON.stringify(d));
  updateShopProgress();
}
function updateShopProgress(){
  const active=document.querySelector('.shop-list-panel.active');
  if(!active) return;
  const all=active.querySelectorAll('.shop-item');
  const done=active.querySelectorAll('.shop-chk.done');
  const pct=all.length?Math.round(done.length/all.length*100):0;
  document.getElementById('shopProgressFill').style.width=pct+'%';
  document.getElementById('shopProgressText').textContent=done.length+' of '+all.length+' items checked';
}
function clearShop(){
  document.querySelectorAll('.shop-chk').forEach(b=>b.classList.remove('done'));
  document.querySelectorAll('.shop-item').forEach(i=>i.classList.remove('done-item'));
  localStorage.setItem('apx_shop','{}');
  updateShopProgress();
}
function checkAllShop(){
  const active=document.querySelector('.shop-list-panel.active');
  if(!active) return;
  const d=JSON.parse(localStorage.getItem('apx_shop')||'{}');
  active.querySelectorAll('.shop-item').forEach(item=>{
    const btn=item.querySelector('.shop-chk');
    btn.classList.add('done');
    item.classList.add('done-item');
    d[item.id]=true;
  });
  localStorage.setItem('apx_shop',JSON.stringify(d));
  updateShopProgress();
}
function restoreShop(){
  const d=JSON.parse(localStorage.getItem('apx_shop')||'{}');
  for(const id in d){
    if(d[id]){
      const item=document.getElementById(id);
      if(item){item.classList.add('done-item');const b=item.querySelector('.shop-chk');if(b)b.classList.add('done');}
    }
  }
  updateShopProgress();
}

// ── NAVIGATE TO WORKOUT ────────────────────────────────────────────────────────
function goToWorkout(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('tab-program').classList.add('active');
  document.querySelectorAll('.tab')[1].classList.add('active');
  setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},100);
}

// ── REST TIMER ─────────────────────────────────────────────────────────────────
var rTime=90,rRem=90,rInt=null,rRun=false;
function setTimer(s,btn){
  rTime=s;rRem=s;rRun=false;clearInterval(rInt);
  document.getElementById('startStopBtn').textContent='START';
  document.getElementById('timerLabel').textContent='Ready';
  updTimer();
  document.querySelectorAll('.pbtn').forEach(b=>b.classList.remove('sel'));
  if(btn)btn.classList.add('sel');
}

function updTimer(){
  const m=Math.floor(rRem/60).toString().padStart(2,'0');
  const s=(rRem%60).toString().padStart(2,'0');
  document.getElementById('timerDisplay').textContent=m+':'+s;
}
function startStopTimer(){
  if(rRun){
    clearInterval(rInt);rRun=false;
    document.getElementById('startStopBtn').textContent='RESUME';
    document.getElementById('timerLabel').textContent='Paused';
  } else {
    if(rRem===0){rRem=rTime;updTimer();}
    rRun=true;
    document.getElementById('startStopBtn').textContent='PAUSE';
    document.getElementById('timerLabel').textContent='Resting...';
    rInt=setInterval(()=>{
      rRem--;updTimer();
      if(rRem<=0){
        clearInterval(rInt);rRun=false;
        document.getElementById('startStopBtn').textContent='START';
        document.getElementById('timerLabel').textContent='⚡ Go!';
        document.getElementById('timerDisplay').textContent='00:00';
        if(navigator.vibrate)navigator.vibrate([300,100,300,100,300]);
      }
    },1000);
  }
}
function resetTimer(){
  clearInterval(rInt);rRun=false;rRem=rTime;
  document.getElementById('startStopBtn').textContent='START';
  document.getElementById('timerLabel').textContent='Ready';
  updTimer();
}

// ── SESSION TIMER ──────────────────────────────────────────────────────────────
var wSec=0,wInt=null,wRun=false;
function toggleWorkout(){
  if(wRun){clearInterval(wInt);wRun=false;document.getElementById('workoutBtn').textContent='RESUME';}
  else {
    wRun=true;document.getElementById('workoutBtn').textContent='PAUSE';
    wInt=setInterval(()=>{
      wSec++;
      const h=Math.floor(wSec/3600);
      const m=Math.floor((wSec%3600)/60).toString().padStart(2,'0');
      const s=(wSec%60).toString().padStart(2,'0');
      document.getElementById('workoutDisplay').textContent=(h>0?h+':':'')+m+':'+s;
    },1000);
  }
}

// ── TRACKER DATA ───────────────────────────────────────────────────────────────
const DAYS=['M','T','W','T','F','S','S'];
const DTYPE=['workout','workout','workout','rest','workout','workout','workout'];
const ICONS=['💪','💪','🦵','😴','💪','💪','🦵'];
let tData=JSON.parse(localStorage.getItem('apx_tracker')||'{}');

// Open-ended: 3 phases cycling every 6 weeks, repeating indefinitely
function getPhaseBlock(curWeek){
  var cycleLen = 6, cycleNum = Math.floor((curWeek-1)/cycleLen), posInCycle = ((curWeek-1)%cycleLen)+1;
  var blockStart = cycleNum*cycleLen+1;
  var defs = [
    {num:1,name:'Foundation', sub:'Build the base. Master form before load.', span:[1,2]},
    {num:2,name:'Strength',   sub:'Heavier loads, raw power.',                span:[3,4]},
    {num:3,name:'Definition', sub:'Reveal the work. Lean and powerful.',      span:[5,6]}
  ];
  var d = defs.find(function(x){return posInCycle>=x.span[0]&&posInCycle<=x.span[1];}) || defs[0];
  var wks = [];
  for(var i=d.span[0]; i<=d.span[1]; i++) wks.push(blockStart+i-1);
  return {num:d.num, name:d.name, sub:d.sub+' (cycle '+(cycleNum+1)+')', wks:wks};
}
const PHASES=[0,1,2].map(function(i){ return getPhaseBlock(i*2+1); }); // legacy reference, first cycle only

function getCurrentWeek(){
  // Open-ended: total weeks since programme start, uncapped
  const START_KEY = 'apx_program_start';
  let startStr = localStorage.getItem(START_KEY);
  if(!startStr){
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0,0,0,0);
    startStr = monday.toISOString();
    localStorage.setItem(START_KEY, startStr);
  }
  const start = new Date(startStr);
  const now = new Date();
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const currentDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const elapsed = Math.floor((currentDay - startDay) / (1000 * 60 * 60 * 24 * 7));
  return Math.max(elapsed + 1, 1); // no upper cap — open-ended
}

function getMonthsIn(){
  const week = getCurrentWeek();
  return Math.round((week / 4.345) * 10) / 10; // weeks to months, 1 decimal
}
function getCurrentPhase(w){
  return getPhaseBlock(w); // returns {num,name,sub,wks} — same shape updatePhaseCard expects
}

// ── SAVE & REFRESH (single entry point for all data changes) ──────────────────
function saveAndRefresh(){
  localStorage.setItem('apx_tracker',JSON.stringify(tData));
  buildTracker();
}

// ── TODAY CARD ─────────────────────────────────────────────────────────────────
const DAY_NAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const WORKOUT_SCHEDULE=[
  {name:'Push Day',  sub:'Chest · Shoulders · Triceps', icon:'fa-dumbbell', emoji:'🏋️', type:'workout'},
  {name:'Pull Day',  sub:'Back · Lats · Biceps',        icon:'fa-people-pulling', emoji:'💪', type:'workout'},
  {name:'Leg Day',   sub:'Quads · Hamstrings · Core',   icon:'fa-person-running', emoji:'🦵', type:'workout'},
  {name:'Rest Day',  sub:'Recovery · Eat well · Sleep', icon:'fa-bed', emoji:'😴', type:'rest'},
  {name:'Push Day',  sub:'Chest · Shoulders · Triceps', icon:'fa-dumbbell', emoji:'🏋️', type:'workout'},
  {name:'Pull Day',  sub:'Back · Lats · Biceps',        icon:'fa-people-pulling', emoji:'💪', type:'workout'},
  {name:'Leg Day',   sub:'Quads · Hamstrings · Core',   icon:'fa-person-running', emoji:'🦵', type:'workout'},
];
// Map JS getDay() (0=Sun) to our Mon-first index (0=Mon..6=Sun)
function jsToIdx(jsDay){return jsDay===0?6:jsDay-1;}

function logToday(){
  const idx=jsToIdx(new Date().getDay());
  var todayWorkoutType = getTodayWorkout();
  if(todayWorkoutType==='rest') return;
  const curWeek=getCurrentWeek();
  const key='w'+curWeek+'d'+idx;
  tData[key]=!tData[key];
  saveAndRefresh();
  renderTodayCard();
}

function logDay(week, dayIdx){
  if(DTYPE[dayIdx]==='rest') return;
  const key='w'+week+'d'+dayIdx;
  tData[key]=!tData[key];
  saveAndRefresh();
  renderTodayCard();
}

function renderTodayCard(){
  const jsDay=new Date().getDay();
  const idx=jsToIdx(jsDay);
  // Respect a manual "swap today" override if one is set for today's date,
  // mapping the override's workout type to the matching WORKOUT_SCHEDULE entry
  var info = WORKOUT_SCHEDULE[idx];
  try{
    var overrides = JSON.parse(localStorage.getItem('forge_day_override')||'{}');
    var todayStr = forgeLocalDateKey(new Date());
    if(overrides[todayStr]){
      var typeToInfo = {push:0, pull:1, legs:2, rest:3};
      var overrideIdx = typeToInfo[overrides[todayStr]];
      if(overrideIdx !== undefined) info = WORKOUT_SCHEDULE[overrideIdx];
    }
  }catch(e){}
  const curWeek=getCurrentWeek();
  const phase=getCurrentPhase(curWeek);
  const key='w'+curWeek+'d'+idx;
  const isLogged=!!tData[key];
  const isRest=info.type==='rest';

  // Header info
  const eyebrow=document.getElementById('todayEyebrow');
  if(eyebrow) eyebrow.innerHTML='<span class="today-eyebrow-dot"></span><span>'+DAY_NAMES[jsDay].toUpperCase()+' · WEEK '+curWeek+'</span>';
  const icon=document.getElementById('todayIcon');
  if(icon){icon.textContent=info.emoji||'🏋️';icon.setAttribute('aria-label',info.name);}
  const name=document.getElementById('todayName');
  if(name) name.textContent=info.name;
  const sub=document.getElementById('todaySub');
  if(sub) sub.textContent=info.sub;
  const wb=document.getElementById('todayWeekBig');
  if(wb) wb.textContent='Wk '+curWeek;
  const pb=document.getElementById('todayPhaseBig');
  if(pb) pb.textContent=phase.name;

  // Button
  const btn=document.getElementById('todayLogBtn');
  const btnIcon=document.getElementById('todayBtnIcon');
  const btnText=document.getElementById('todayBtnText');
  if(btn&&btnIcon&&btnText){
    if(isRest){
      btn.className='today-log-btn rest-day';
      btnIcon.textContent='😴'; btnIcon.style.fontSize='16px'; btnText.textContent='REST DAY — RECOVER WELL';
    } else if(isLogged){
      btn.className='today-log-btn logged';
      btnIcon.style.fontSize=''; btnIcon.textContent='✓'; btnText.textContent='SESSION LOGGED — WELL DONE';
    } else {
      btn.className='today-log-btn';
      btnIcon.style.fontSize=''; btnIcon.textContent='＋'; btnText.textContent="LOG TODAY'S SESSION";
    }
  }

  // Week strip — tap any day to toggle
  const strip=document.getElementById('todayWeekStrip');
  if(!strip) return;
  strip.innerHTML='';
  for(let d=0;d<7;d++){
    const dk='w'+curWeek+'d'+d;
    const done=!!tData[dk];
    const isToday=(d===idx);
    const isRestD=(DTYPE[d]==='rest');
    const div=document.createElement('div');
    let cls='today-strip-day';
    if(isToday) cls+=' sd-today';
    if(done) cls+=' sd-done';
    if(isRestD) cls+=' sd-rest';
    div.className=cls;
    div.innerHTML='<div class="sd-name">'+DAYS[d]+'</div><div class="sd-dot"></div>';
    if(!isRestD){
      div.style.cursor='pointer';
      div.setAttribute('data-week',curWeek);
      div.setAttribute('data-day',d);
      div.addEventListener('click', function(){
        const w=parseInt(this.getAttribute('data-week'));
        const dd=parseInt(this.getAttribute('data-day'));
        logDay(w,dd);
      });
    }
    strip.appendChild(div);
  }
}

// ── TRACKER BUILDER ────────────────────────────────────────────────────────────
function buildTracker(){
  const curWeek=getCurrentWeek();
  const c=document.getElementById('weeklyTracker');
  if(!c) return;
  c.innerHTML='';
  for(let w=1;w<=16;w++){
    const wd=document.createElement('div');
    let wClass='trkr-week';
    if(w===curWeek) wClass+=' current-week';
    else if(w<curWeek) wClass+=' past-week';
    else wClass+=' future-week';
    wd.className=wClass;
    const phLabel=w===1?'Phase 1':w===5?'Phase 2':w===9?'Phase 3':'';
    const phHtml=phLabel?'<span style="font-size:8px;letter-spacing:2px;color:var(--accent-text);margin-left:6px;opacity:0.7">'+phLabel+'</span>':'';
    wd.innerHTML='<div class="trkr-week-title">Wk '+w+phHtml+'</div>';
    const dd=document.createElement('div');
    dd.className='trkr-days';
    for(let d=0;d<7;d++){
      const key='w'+w+'d'+d;
      const el=document.createElement('div');
      el.className='trkr-day '+DTYPE[d];
      if(tData[key]) el.classList.add('completed');
      el.innerHTML='<span class="di">'+(tData[key]?'✓':ICONS[d])+'</span><span class="dl">'+DAYS[d]+'</span>';
      if(DTYPE[d]!=='rest'){
        el.setAttribute('data-week',w);
        el.setAttribute('data-day',d);
        el.addEventListener('click', function(){
          const ww=parseInt(this.getAttribute('data-week'));
          const dd2=parseInt(this.getAttribute('data-day'));
          logDay(ww,dd2);
        });
      }
      dd.appendChild(el);
    }
    wd.appendChild(dd);
    c.appendChild(wd);
  }
  updProgress();
  updatePhaseCard();
  updatePhaseBadges();
  renderTodayCard();
  calcWorkoutTime();
}

function updProgress(){
  let done=0,streak=0;
  for(const k in tData){if(tData[k])done++;}
  // streak: count consecutive from latest backwards
  let counting=false;
  outer: for(let w=12;w>=1;w--){
    for(let d=6;d>=0;d--){
      if(DTYPE[d]==='rest') continue;
      if(tData['w'+w+'d'+d]){counting=true;streak++;}
      else if(counting){break outer;}
    }
  }
  const pct=Math.round(done/72*100);
  const pdEl=document.getElementById('progressPct'); if(pdEl) pdEl.textContent=pct+'%';
  const dcEl=document.getElementById('daysCompleted'); if(dcEl) dcEl.textContent=done;
  const pcEl=document.getElementById('progressCircle'); if(pcEl) pcEl.style.strokeDashoffset=339-(339*pct/100);
  const scEl=document.getElementById('streakCount'); if(scEl) scEl.textContent=streak;
  const cwEl=document.getElementById('currentWeekNum'); if(cwEl) cwEl.textContent=getCurrentWeek();
}

function updatePhaseCard(){
  const curWeek=getCurrentWeek();
  const phase=getCurrentPhase(curWeek);
  let phaseDone=0;
  const phaseTotal=phase.wks.length*6;
  phase.wks.forEach(w=>{for(let d=0;d<7;d++){if(DTYPE[d]==='workout'&&tData['w'+w+'d'+d])phaseDone++;}});
  const phasePct=Math.round(phaseDone/phaseTotal*100);
  const weekInPhase=phase.wks.indexOf(curWeek)+1;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('cpTitle','Phase '+phase.num+' — '+phase.name);
  set('cpSub',phase.sub);
  set('cpWeekLabel','Week '+weekInPhase+' of '+phase.wks.length+' in this phase');
  set('cpPct',phasePct+'%');
  set('cpWeekBadge','WEEK '+curWeek);
  const bar=document.getElementById('cpBarFill');if(bar) bar.style.width=phasePct+'%';
  PHASES.forEach(p=>{
    const dot=document.getElementById('dot-p'+p.num);
    const item=document.getElementById('ms-p'+p.num);
    if(!dot||!item) return;
    let pDone=0;
    p.wks.forEach(w=>{for(let d=0;d<7;d++){if(DTYPE[d]==='workout'&&tData['w'+w+'d'+d])pDone++;}});
    if(pDone>=p.wks.length*6){dot.className='unlock-dot done';item.className='unlock-item completed-unlock';}
    else if(p.wks.includes(curWeek)){dot.className='unlock-dot active';item.className='unlock-item active-unlock';}
    else{dot.className='unlock-dot';item.className='unlock-item';}
  });
  const cyclePos = ((curWeek-1) % 6) + 1;
  const bms=[{id:'bm1-badge',w:2},{id:'bm2-badge',w:4},{id:'bm3-badge',w:6}];
  bms.forEach(b=>{
    const e=document.getElementById(b.id);if(!e)return;
    e.className=cyclePos>b.w?'bench-week done-badge':cyclePos===b.w?'bench-week current-badge':'bench-week';
  });
}

function updatePhaseBadges(){
  const curWeek=getCurrentWeek();
  const cyclePos = ((curWeek-1) % 6) + 1;
  document.querySelectorAll('.phase').forEach((ph,i)=>{
    const badge=ph.querySelector('.phase-badge');if(!badge)return;
    const starts=[1,3,5][i], ends=[2,4,6][i];
    if(cyclePos>ends){badge.className='phase-badge done';badge.textContent='Done ✓';}
    else if(cyclePos>=starts){badge.className='phase-badge active';badge.textContent='Active ▶';}
    else{badge.className='phase-badge next';badge.textContent='Upcoming';}
  });
}


// ── WATER TRACKER ────────────────────────────────────────────────────────────
const WATER_KEY = 'apx_water_v1';

function getWaterData(){
  const today = new Date().toDateString();
  const d = JSON.parse(localStorage.getItem(WATER_KEY) || '{}');
  if(d.date !== today) return {date: today, count: 0};
  return d;
}

function saveWaterData(count){
  const today = new Date().toDateString();
  localStorage.setItem(WATER_KEY, JSON.stringify({date: today, count}));
  // Keep a small day-keyed history for weekly insights without changing the legacy current-day format.
  const history = forgeSafeJSON(localStorage.getItem('forge_water_history_v1') || '{}', {});
  history[forgeLocalDateKey(new Date())] = count;
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-120);
  Object.keys(history).forEach(function(k){if(k < forgeLocalDateKey(cutoff)) delete history[k];});
  localStorage.setItem('forge_water_history_v1', JSON.stringify(history));
}

function renderWater(){
  const d = getWaterData();
  const count = d.count;
  const target = 7;
  const countEl = document.getElementById('waterCount');
  const fillEl = document.getElementById('waterBarFill');
  const glassesEl = document.getElementById('waterGlasses');
  if(countEl) countEl.textContent = count;
  if(fillEl) fillEl.style.width = Math.min(100, Math.round(count/target*100)) + '%';
  if(glassesEl){
    glassesEl.innerHTML = '';
    for(let i=0;i<target;i++){
      const g = document.createElement('span');
      g.className = 'water-glass' + (i < count ? ' filled' : '');
      g.textContent = '💧';
      g.onclick = () => { saveWaterData(i+1); renderWater(); };
      glassesEl.appendChild(g);
    }
  }
}

function addWater(){
  const d = getWaterData();
  if(d.count >= 11) return;
  saveWaterData(d.count + 1);
  renderWater();
}

function resetWater(){
  saveWaterData(0);
  renderWater();
}

// ── CARDIO TRACKER ────────────────────────────────────────────────────────────
const CARDIO_KEY = 'apx_cardio_v1';
let cardioData = JSON.parse(localStorage.getItem(CARDIO_KEY) || '{}');

function saveCardio(){ localStorage.setItem(CARDIO_KEY, JSON.stringify(cardioData)); }

function toggleCardio(week, day){
  const key = 'w'+week+'d'+day;
  cardioData[key] = !cardioData[key];
  saveCardio();
  renderCardioWeek();
}

function renderCardioWeek(){
  const curWeek = getCurrentWeek();
  const el = document.getElementById('cardioWeekDisplay');
  if(!el) return;
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dtype = ['workout','workout','workout','rest','workout','workout','workout'];
  let html = '<div class="cardio-week-header">Week ' + curWeek + ' — Cardio Sessions</div>';
  for(let d=0;d<7;d++){
    const key = 'w'+curWeek+'d'+d;
    const done = !!cardioData[key];
    const isRest = dtype[d]==='rest';
    const label = isRest ? 'Rest Day' : dayNames[d]+' — Post-Session LISS';
    const sub = isRest ? 'No cardio needed' : '20–30 min walk/cycle · 120–140bpm';
    html += '<div class="cardio-log-row">';
    html += '<div><div class="cardio-day-label">'+label+'</div><div style="font-size:10px;color:var(--grey)">'+sub+'</div></div>';
    if(!isRest){
      html += '<button class="cardio-chk-btn'+(done?' done':'"')+'" onclick="toggleCardio('+curWeek+','+d+')">'+(done?'✓':'')+'</button>';
    } else {
      html += '<span style="font-size:18px">😴</span>';
    }
    html += '</div>';
  }
  el.innerHTML = html;

  // Summary
  let total=0, thisWeek=0, weekStreak=0;
  for(const k in cardioData){ if(cardioData[k]) total++; }
  for(let d=0;d<7;d++){
    if(cardioData['w'+curWeek+'d'+d]) thisWeek++;
  }
  // Week streak — how many consecutive weeks with at least 1 cardio session
  for(let w=curWeek;w>=1;w--){
    let hasCardio=false;
    for(let d=0;d<7;d++){ if(cardioData['w'+w+'d'+d]){ hasCardio=true; break; } }
    if(hasCardio) weekStreak++;
    else break;
  }
  const twEl=document.getElementById('cardioThisWeek');
  const ttEl=document.getElementById('cardioTotal');
  const csEl=document.getElementById('cardioStreak');
  if(twEl) twEl.textContent=thisWeek;
  if(ttEl) ttEl.textContent=total;
  if(csEl) csEl.textContent=weekStreak;
}

// ── DELOAD HIGHLIGHTING ────────────────────────────────────────────────────────
function highlightDeload(){
  const curWeek = getCurrentWeek();
  const deloadWeeks = {4:'deload-w4', 8:'deload-w8', 12:'deload-w12'};
  Object.entries(deloadWeeks).forEach(([w, id]) => {
    const el = document.getElementById(id);
    if(el) el.classList.toggle('active-deload', curWeek === +w);
  });
}


// ── WORKOUT TIME ESTIMATES ────────────────────────────────────────────────────
function calcWorkoutTime(){
  const week = getCurrentWeek();
  // Phase determines rest periods
  let restSecs, setsPerExercise, label;
  if(week <= 4){
    restSecs = 90; setsPerExercise = 4;
    label = 'Phase 1 · 90s rest between sets';
  } else if(week <= 8){
    restSecs = 150; setsPerExercise = 5;
    label = 'Phase 2 · 2.5 min rest between sets';
  } else {
    restSecs = 60; setsPerExercise = 4;
    label = 'Phase 3 · 60s rest · cut phase';
  }

  const setTimeSecs = 45; // avg time to perform a set

  function calcDay(exercises, warmupMins, extraMins){
    const totalSets = exercises * setsPerExercise;
    const setsMins = Math.round((totalSets * setTimeSecs) / 60);
    const restMins = Math.round((totalSets * restSecs) / 60);
    const transMins = 5; // moving between stations
    const total = warmupMins + setsMins + restMins + transMins + (extraMins||0);
    return {total, setsMins, restMins, warmupMins, extraMins: extraMins||transMins};
  }

  // Push: 6 exercises
  const push = calcDay(6, 5, 5);
  // Pull: 6 exercises
  const pull = calcDay(6, 5, 5);
  // Legs: 4 main exercises + 10 min core circuit
  const legs = calcDay(4, 7, 10);

  const days = [
    {prefix:'push', data:push},
    {prefix:'pull', data:pull},
    {prefix:'legs', data:legs},
  ];

  days.forEach(({prefix, data}) => {
    const tEl = document.getElementById(prefix+'TimeMins');
    const dEl = document.getElementById(prefix+'TimeDetail');
    const sEl = document.getElementById(prefix+'SetsMins');
    const rEl = document.getElementById(prefix+'RestMins');
    if(tEl) tEl.textContent = data.total;
    if(dEl) dEl.textContent = label;
    if(sEl) sEl.textContent = data.setsMins;
    if(rEl) rEl.textContent = data.restMins;
  });
}

// ── CALORIE TRACKER ────────────────────────────────────────────────────────────
const CAL_KEY = 'apx_calories_v1';
const CAL_TARGET = 2700;
const CAL_TARGET_REST = 2400;

function calEscapeHTML(value){return String(value==null?'':value).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c];});}
let calOffset = 0; // 0 = today, -1 = yesterday etc.

function getCalKey(offset){
  const d = new Date();
  d.setDate(d.getDate() + (offset||0));
  return forgeLocalDateKey(d); // YYYY-MM-DD
}

function getCalData(){
  return JSON.parse(localStorage.getItem(CAL_KEY) || '{}');
}

function saveCalData(data){
  localStorage.setItem(CAL_KEY, JSON.stringify(data));
}

function getDayEntries(dateKey){
  const data = getCalData();
  return data[dateKey] || [];
}

function calChangeDay(dir){
  calOffset += dir;
  if(calOffset > 0) calOffset = 0; // can't go future
  renderCalories();
}

function calAddEntry(){
  const name = document.getElementById('calFoodName').value.trim();
  const kcal = parseInt(document.getElementById('calFoodKcal').value);
  const protein = parseFloat(document.getElementById('calFoodProtein').value) || 0;
  const carbs = parseFloat(document.getElementById('calFoodCarbs').value) || 0;
  const fats = parseFloat(document.getElementById('calFoodFats').value) || 0;

  if(!name){ alert('Please enter a food name'); return; }
  if(!kcal || kcal < 1){ alert('Please enter calories'); return; }

  const dateKey = getCalKey(calOffset);
  const data = getCalData();
  if(!data[dateKey]) data[dateKey] = [];

  const now = new Date();
  const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

  data[dateKey].push({
    id: Date.now(),
    name, kcal, protein, carbs, fats, time
  });

  saveCalData(data);

  // Clear inputs
  ['calFoodName','calFoodKcal','calFoodProtein','calFoodCarbs','calFoodFats'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });

  renderCalories();
}

function calDeleteEntry(dateKey, id){
  const data = getCalData();
  if(!data[dateKey]) return;
  data[dateKey] = data[dateKey].filter(e => e.id !== id);
  saveCalData(data);
  renderCalories();
}

function renderCalories(){
  const dateKey = getCalKey(calOffset);
  const entries = getDayEntries(dateKey);

  // Day label
  const labelEl = document.getElementById('calDayLabel');
  if(labelEl){
    if(calOffset === 0) labelEl.textContent = 'TODAY';
    else if(calOffset === -1) labelEl.textContent = 'YESTERDAY';
    else {
      const d = new Date();
      d.setDate(d.getDate() + calOffset);
      labelEl.textContent = d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}).toUpperCase();
    }
  }

  // Totals
  const totalKcal = entries.reduce((s,e) => s+e.kcal, 0);
  const totalProtein = entries.reduce((s,e) => s+(e.protein||0), 0);
  const totalCarbs = entries.reduce((s,e) => s+(e.carbs||0), 0);
  const totalFats = entries.reduce((s,e) => s+(e.fats||0), 0);
  const target = CAL_TARGET;
  const pct = Math.min(Math.round(totalKcal/target*100), 100);
  const isOver = totalKcal > target;
  const remaining = target - totalKcal;

  // Ring
  const circ = 390;
  const ringEl = document.getElementById('calRingCircle');
  const overEl = document.getElementById('calRingOver');
  if(ringEl){
    ringEl.style.strokeDashoffset = circ - (circ * Math.min(pct,100) / 100);
    ringEl.style.stroke = isOver ? '#ff6b35' : 'var(--accent)';
  }

  // Ring center
  const numEl = document.getElementById('calRingNum');
  if(numEl) numEl.textContent = totalKcal.toLocaleString();

  // Remaining
  const remEl = document.getElementById('calRemaining');
  const remNum = document.getElementById('calRemainingNum');
  if(remEl && remNum){
    if(isOver){
      remNum.textContent = Math.abs(remaining).toLocaleString();
      remNum.className = 'over';
      remEl.innerHTML = remEl.innerHTML.replace('remaining today','over target');
      remEl.querySelector('span').textContent = Math.abs(remaining).toLocaleString();
      remEl.innerHTML = '<span class="over">'+Math.abs(remaining).toLocaleString()+'</span> kcal over target';
    } else {
      remEl.innerHTML = '<span class="under">'+remaining.toLocaleString()+'</span> kcal remaining today';
    }
  }

  // Macros
  const setMacro = (id, val, target, barId) => {
    const el = document.getElementById(id);
    const bar = document.getElementById(barId);
    if(el) el.textContent = Math.round(val);
    if(bar){
      const pct = Math.min(Math.round(val/target*100), 100);
      bar.style.width = pct + '%';
      bar.className = 'cal-macro-fill' + (val > target ? ' over' : '');
    }
  };
  setMacro('calProteinEaten', totalProtein, 230, 'calProteinBar');
  setMacro('calCarbsEaten', totalCarbs, 270, 'calCarbsBar');
  setMacro('calFatsEaten', totalFats, 80, 'calFatsBar');

  // Log body
  const logBody = document.getElementById('calLogBody');
  if(logBody){
    if(entries.length === 0){
      logBody.innerHTML = '<div class="cal-empty">No food logged yet today.<br>Add your first meal above.</div>';
    } else {
      const header = document.getElementById('calLogWrap').querySelector('.cal-log-header-title');
      if(header) header.textContent = entries.length + ' item' + (entries.length>1?'s':'') + ' · ' + totalKcal.toLocaleString() + ' kcal';
      logBody.innerHTML = entries.slice().reverse().map(e =>
        `<div class="cal-entry">
          <div style="flex:1">
            <div class="cal-entry-name">${calEscapeHTML(e.name)}</div>
            <div class="cal-entry-time">${calEscapeHTML(e.time)}</div>
          </div>
          <div class="cal-entry-macro">${e.protein?Math.round(e.protein)+'g':'—'}</div>
          <div class="cal-entry-macro">${e.carbs?Math.round(e.carbs)+'g':'—'}</div>
          <div class="cal-entry-macro">${e.fats?Math.round(e.fats)+'g':'—'}</div>
          <div class="cal-entry-kcal">${e.kcal}</div>
          <button class="cal-del-btn" onclick="calDeleteEntry('${dateKey}',${e.id})">✕</button>
        </div>`
      ).join('');
    }
  }

  // Week summary
  renderCalWeekSummary();
}

function renderCalWeekSummary(){
  const data = getCalData();
  const days = [];
  for(let i=0;i>=-6;i--){
    const key = getCalKey(i);
    const entries = data[key] || [];
    if(entries.length > 0){
      days.push({
        key,
        kcal: entries.reduce((s,e)=>s+e.kcal,0),
        label: i===0?'Today':i===-1?'Yesterday': (() => {
          const d=new Date(); d.setDate(d.getDate()+i);
          return d.toLocaleDateString('en-GB',{weekday:'short'});
        })()
      });
    }
  }

  const summary = document.getElementById('calWeekSummary');
  if(!summary) return;

  if(days.length < 2){
    summary.innerHTML = '<div style="font-size:11px;color:var(--mid);text-align:center;padding:8px 0">Log at least 2 days to see your average</div>';
    return;
  }

  const avg = Math.round(days.reduce((s,d)=>s+d.kcal,0)/days.length);
  const maxKcal = Math.max(...days.map(d=>d.kcal));

  let barsHtml = '<div style="display:flex;gap:4px;align-items:flex-end;height:60px;margin-bottom:6px;">';
  days.slice().reverse().forEach(d => {
    const h = Math.max(4, Math.round((d.kcal/maxKcal)*56));
    const col = d.kcal > 2800 ? '#ff6b35' : d.kcal > 2400 ? 'var(--accent)' : '#aaaaaa';
    barsHtml += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
      <div style="width:100%;height:${h}px;background:${col};border-radius:2px 2px 0 0"></div>
      <div style="font-size:8px;color:var(--grey)">${d.label}</div>
    </div>`;
  });
  barsHtml += '</div>';

  const diffFromTarget = avg - 2800;
  const diffStr = diffFromTarget > 0 ? '+'+diffFromTarget : diffFromTarget.toString();
  const diffCol = Math.abs(diffFromTarget) < 150 ? 'var(--green)' : diffFromTarget > 0 ? '#ff6b35' : 'var(--accent)';

  summary.innerHTML = barsHtml +
    `<div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--border)">
      <div>
        <div style="font-size:10px;color:var(--grey);letter-spacing:1px;text-transform:uppercase">7-day average</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:24px;color:var(--white)">${avg.toLocaleString()} <span style="font-size:13px;color:var(--grey)">kcal</span></div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:var(--grey);letter-spacing:1px;text-transform:uppercase">vs target</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;color:${diffCol}">${diffStr} kcal</div>
      </div>
    </div>`;
}

// ── INIT ───────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded',function(){
  // No auto-logged commute walking — user confirmed not walking to work. Zone 2 cardio logged manually instead.
  try{if(typeof initWeightLogs==='function')initWeightLogs();}catch(e){}
  try{updateWorkoutBanners();}catch(e){}
  try{initCheckin();}catch(e){}
  try{renderDoneState();}catch(e){}
  try{requestNotifPermission();}catch(e){}
  try{if(typeof initTracking==='function')initTracking();}catch(e){}
  try{renderExercisePRsGrid();}catch(e){}
  try{renderHomePRs();}catch(e){}
  try{buildMonthCalendar();}catch(e){}
  try{buildHomeWeeklyStrip();}catch(e){}
  try{updateMealRotation();}catch(e){}
  try{updateCheckinCountdown();}catch(e){}
  try{updateHomeRealStats();}catch(e){}
  try{renderWeightTrend();}catch(e){}
  try{applyABVariant();}catch(e){}
  try{updateWorkoutBanners();}catch(e){}
  try{
    // Ensure program start reflects ~4 months of real training if not set realistically
    var psKey='apx_program_start';
    var ps=localStorage.getItem(psKey);
    if(!ps || (new Date()-new Date(ps))/(1000*60*60*24*7) < 15){
      var backdate=new Date();
      backdate.setDate(backdate.getDate()-119); // ~17 weeks / 4 months ago
      localStorage.setItem(psKey, backdate.toISOString());
    }
  }catch(e){}
  try{updateHomeStats();}catch(e){}
  try{var mEl=document.getElementById('homeStatMonths'); if(mEl) mEl.textContent=getMonthsIn();}catch(e){}
  try{loadSessionNotes();}catch(e){}
  try{init30MinMode();}catch(e){}
  try{initMotivation();}catch(e){}
  try{initWorkoutView();}catch(e){}
  try{buildTracker();}catch(e){}
  try{renderTodayCard();}catch(e){}
  try{initTracking();}catch(e){}
  try{updatePhaseBadges();}catch(e){}
  try{restoreShop();}catch(e){}
  try{var t=localStorage.getItem('apx_time');if(t)setTime(t);}catch(e){}
  try{var m=localStorage.getItem('apx_meal');if(m)switchMeal(m);}catch(e){}
});
