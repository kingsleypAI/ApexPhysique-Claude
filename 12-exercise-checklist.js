// ── EXERCISE CHECKLIST ───────────────────────────────────────────
var DONE_KEY = 'apx_done_v1';

function readAllDoneData(){
  var all=typeof forgeSafeJSON==='function'?forgeSafeJSON(localStorage.getItem(DONE_KEY)||'{}',{}):{};
  if(!all||typeof all!=='object'||Array.isArray(all))return {};
  if(all.date&&all.done){var migrated={};migrated[all.date]=all.done;localStorage.setItem(DONE_KEY,JSON.stringify(migrated));return migrated;}
  return all;
}
function getDoneData(){
  // Returns today's done object {key: bool}
  var all = readAllDoneData();
  var today = forgeLocalDateKey(new Date());
  // Migrate old format {date, done} to new date-keyed format
  if(all.date && all.done){
    var migrated = {};
    migrated[all.date] = all.done;
    localStorage.setItem(DONE_KEY, JSON.stringify(migrated));
    all = migrated;
  }
  return {date: today, done: all[today] || {}};
}
function getAllDoneData(){
  return readAllDoneData();
}
function saveDoneData(d){
  var all = getAllDoneData();
  var today = forgeLocalDateKey(new Date());
  all[today] = d.done;
  localStorage.setItem(DONE_KEY, JSON.stringify(all));
}

function toggleExDone(name){
  var key = name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  var d = getDoneData();
  var wasChecking = !d.done[key];
  d.done[key] = !d.done[key];
  saveDoneData(d);
  renderDoneState();

  // Ticking a Post-Session Cardio card also marks today in the real cardio
  // tracker (apx_cardio_v1) so the home screen's Cardio card and weekly
  // log stay in sync with what's actually ticked in the workout
  if(key === 'post_session_cardio_20_min'){
    try{
      var curWeek = getCurrentWeek();
      var dayIdx = jsToIdx(new Date().getDay());
      var cardioKey = 'w'+curWeek+'d'+dayIdx;
      cardioData[cardioKey] = !!d.done[key];
      saveCardio();
      renderCardioWeek();
    }catch(e){}
  }
  // Auto-start the rest timer when a set is checked off (not when unchecking) —
  // but skip it if this was the last visible exercise in today's session, since
  // there's nothing left to rest for and a 90-second buzz on the way out is just noise
  if(wasChecking){
    try{
      var todayType = typeof getTodayWorkout==='function' ? getTodayWorkout() : null;
      var todayContainer = todayType ? document.getElementById(todayType) : null;
      var visibleTicks = todayContainer ? Array.prototype.slice.call(todayContainer.querySelectorAll('.wcard')).filter(function(card){
        return card.style.display !== 'none';
      }).map(function(card){ return card.querySelector('.ex-tick'); }).filter(Boolean) : [];
      var allDone = visibleTicks.length > 0 && visibleTicks.every(function(t){ return t.classList.contains('done'); });
      if(allDone){
        if(typeof showToast==='function') showToast('🏆 Workout complete! Great session.', 4000);
      } else {
        if(!_mRun){ miniStartStop(); }
        else { _mRem=_mTime; miniUpdDisplay(); } // restart if already running
      }
    }catch(e){}
  }
}

function renderDoneState(){
  var d = getDoneData();
  var done = d.done||{};
  document.querySelectorAll('.ex-tick').forEach(function(btn){
    var key=btn.id.replace('tick-','');
    var isDone=!!done[key];
    btn.classList.toggle('done',isDone);
    var wcard=btn.closest('.wcard');
    if(wcard) wcard.classList.toggle('done-card',isDone);
  });
  // Progress bars calculated from currently VISIBLE exercise cards only —
  // with the A/B day split, 3 of each day's exercises are hidden on any
  // given day, so counting against the full 8-exercise list would cap
  // completion at ~62% even when every visible exercise is ticked.
  var dayIds = {'push-day':'push', 'pull-day':'pull', 'leg-day':'legs'};
  Object.keys(dayIds).forEach(function(barKey){
    var container = document.getElementById(dayIds[barKey]);
    var bar = document.getElementById('bar-'+barKey);
    if(!container || !bar) return;
    var visibleCards = Array.prototype.slice.call(container.querySelectorAll('.wcard')).filter(function(card){
      return card.style.display !== 'none';
    });
    if(!visibleCards.length) return;
    var doneCount = visibleCards.filter(function(card){
      var tick = card.querySelector('.ex-tick');
      if(!tick) return false;
      var key = tick.id.replace('tick-','');
      return !!done[key];
    }).length;
    bar.style.width = Math.round((doneCount/visibleCards.length)*100)+'%';
  });
}

// ── TIMER NOTIFICATION ────────────────────────────────────────────
function requestNotifPermission(){
  if('Notification' in window && Notification.permission==='default'){
    Notification.requestPermission();
  }
}

function fireTimerNotification(){
  document.title='REST DONE — GO! \ud83d\udcaa';
  setTimeout(function(){ document.title='FORGE'; }, 4000);
  if('Notification' in window && Notification.permission==='granted'){
    var n=new Notification('Rest Over — Go! \ud83d\udcaa',{
      body:'Time for the next set.',
      icon:'./assets/icons/icon-192.png',
      tag:'forge-timer',
      renotify:true
    });
    setTimeout(function(){ n.close(); }, 5000);
  }
  if(navigator.vibrate) navigator.vibrate([300,100,300,100,300]);
}
