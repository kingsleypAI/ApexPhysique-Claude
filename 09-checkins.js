// ── CHECK-IN REMINDER ─────────────────────────────────────────────
var CHECKIN_KEY = 'apx_checkin_v1';

function getLastCheckin(){
  return JSON.parse(localStorage.getItem(CHECKIN_KEY)||'null');
}

function logCheckin(weight, bf){
  var data = {
    date: forgeLocalDateKey(new Date()),
    weight: weight||null,
    bf: bf||null,
    ts: Date.now()
  };
  var history = getCheckinHistory();
  history.unshift(data);
  localStorage.setItem(CHECKIN_KEY, JSON.stringify(history.slice(0,20)));
  // Bridge to body tracking weight chart
  if(weight){
    try{
      var td = JSON.parse(localStorage.getItem(TRK_KEY)||'{"weights":{},"lifts":{},"measurements":{},"notes":{}}');
      var week = typeof getCurrentWeek==='function' ? getCurrentWeek() : 1;
      td.weights[week] = weight;
      localStorage.setItem(TRK_KEY, JSON.stringify(td));
      if(typeof renderWeightChart==='function') renderWeightChart();
      if(typeof renderSummary==='function') renderSummary();
    }catch(e){}
  }
  renderCheckinBanner();
  try{updateHomeRealStats();}catch(e){}
  try{updateCheckinCountdown();}catch(e){}
}

function getCheckinHistory(){
  var stored = localStorage.getItem(CHECKIN_KEY);
  if(!stored) return [];
  var val = JSON.parse(stored);
  return Array.isArray(val) ? val : [val];
}

function renderCheckinBanner(){
  var banner = document.getElementById('checkinBanner');
  if(!banner) return;
  var history = getCheckinHistory();
  var last = history[0];
  var today = new Date();

  if(!last){
    // Never checked in — show prompt
    banner.style.display = 'block';
    banner.innerHTML = buildCheckinBanner('first');
    return;
  }

  var lastDate = forgeParseLocalDate(last.date);
  var daysSince = Math.floor((today - lastDate) / (1000*60*60*24));

  if(daysSince >= 14){
    banner.style.display = 'block';
    banner.innerHTML = buildCheckinBanner('due', daysSince, last);
  } else {
    banner.style.display = 'block';
    banner.innerHTML = buildCheckinStatus(daysSince, last, history);
  }
}

function buildCheckinBanner(type, days, last){
  if(type === 'first'){
    return '<div style="background:rgba(200,16,46,0.1);border:1px solid rgba(255,255,255,0.4);border-radius:10px;padding:14px;">'
      +'<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent-text);margin-bottom:6px;">📊 Log First Check-In</div>'
      +'<div style="font-size:12px;color:var(--mid);margin-bottom:10px;">Log your current weight and body fat % from the gym scale to start tracking your progress properly.</div>'
      +'<div style="display:flex;gap:8px;">'
      +'<input type="number" inputmode="decimal" id="ciWeightDue" placeholder="Weight (kg)" step="0.1" style="flex:1;background:var(--surface);border:1px solid var(--border2);color:var(--white);font-size:16px;padding:8px 10px;outline:none;border-radius:6px;">'
      +'<input type="number" inputmode="decimal" id="ciBFDue" placeholder="BF %" step="0.1" style="flex:1;background:var(--surface);border:1px solid var(--border2);color:var(--white);font-size:16px;padding:8px 10px;outline:none;border-radius:6px;">'
      +'</div>'
      +'<button onclick="submitCheckin()" style="width:100%;margin-top:8px;padding:10px;background:var(--accent);border:none;color:#fff;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;border-radius:6px;-webkit-tap-highlight-color:transparent;">Log Check-In</button>'
      +'</div>';
  }
  var overdue = days - 14;
  return '<div style="background:rgba(200,16,46,0.1);border:1px solid rgba(255,255,255,0.4);border-radius:10px;padding:14px;">'
    +'<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent-text);margin-bottom:6px;">⏰ Check-In Due'+(overdue>0?' ('+overdue+'d overdue)':'')+'</div>'
    +'<div style="font-size:12px;color:var(--mid);margin-bottom:4px;">Last check-in: <strong style="color:var(--white);">'+last.date+'</strong>'
    +(last.weight?' · '+last.weight+'kg':'')+(last.bf?' · '+last.bf+'% BF':'')+'</div>'
    +'<div style="font-size:11px;color:var(--mid);margin-bottom:10px;">'+days+' days since last weigh-in. Head to the gym scale and come back to log it.</div>'
    +'<div style="display:flex;gap:8px;">'
    +'<input type="number" inputmode="decimal" id="ciWeight" placeholder="Weight (kg)" step="0.1" style="flex:1;background:var(--surface);border:1px solid var(--border2);color:var(--white);font-size:16px;padding:8px 10px;outline:none;border-radius:6px;">'
    +'<input type="number" inputmode="decimal" id="ciBF" placeholder="BF %" step="0.1" style="flex:1;background:var(--surface);border:1px solid var(--border2);color:var(--white);font-size:16px;padding:8px 10px;outline:none;border-radius:6px;">'
    +'</div>'
    +'<button onclick="submitCheckin()" style="width:100%;margin-top:8px;padding:10px;background:var(--accent);border:none;color:#fff;font-family:Space Grotesk,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;border-radius:6px;-webkit-tap-highlight-color:transparent;">Log Check-In</button>'
    +'</div>';
}

function buildCheckinStatus(days, last, history){
  var next = 14 - days;
  var prevWeight = history.length > 1 ? history[1].weight : null;
  var diff = (prevWeight && last.weight) ? (last.weight - prevWeight).toFixed(1) : null;
  var diffStr = diff ? (diff > 0 ? '+'+diff : diff)+'kg' : '';

  // Milestone check
  var milestones = [
    {w:99, label:'Sub-100kg 🎯', achieved: last.weight && last.weight < 100},
    {w:95, label:'Milestone: 95kg 🎯', achieved: last.weight && last.weight <= 95},
    {w:90, label:'Milestone: 90kg 🎯', achieved: last.weight && last.weight <= 90},
    {w:85, label:'Goal weight: 85kg 🏆', achieved: last.weight && last.weight <= 85},
  ];
  var nextMilestone = milestones.find(function(m){ return !m.achieved; });
  var kmToGo = nextMilestone && last.weight ? (last.weight - nextMilestone.w).toFixed(1) : null;

  return '<div style="background:var(--surface);border-radius:10px;padding:12px 14px;">'
    +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    +'<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--grey);">Next Check-In</div>'
    +'<div style="font-size:12px;font-weight:700;color:var(--white);">'+next+' days</div>'
    +'</div>'
    +'<div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:10px;">'
    +'<div style="height:100%;width:'+(days/14*100)+'%;background:var(--accent);border-radius:2px;transition:width 0.3s;"></div>'
    +'</div>'
    +'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--mid);">'
    +'<span>Last: <strong style="color:var(--white);">'+(last.weight||'—')+'kg</strong>'+(diffStr?' <span style="color:'+(diff<0?'#aaaaaa':'var(--accent)')+';">'+diffStr+'</span>':'')+' · '+(last.bf||'—')+'% BF</span>'
    +(nextMilestone?'<span style="color:var(--accent-text);">'+kmToGo+'kg to '+nextMilestone.label+'</span>':'<span style="color:#aaaaaa;">All milestones hit! 🏆</span>')
    +'</div>'
    +'</div>';
}

function submitCheckin(){
  var wEl = document.getElementById('ciWeight')||document.getElementById('ciWeightDue');
  var bEl = document.getElementById('ciBF')||document.getElementById('ciBFDue');
  var w = parseFloat(wEl ? wEl.value : '')||null;
  var b = parseFloat(bEl ? bEl.value : '')||null;
  if(!w && !b){ alert('Enter at least your weight'); return; }
  logCheckin(w, b);

  // Check milestones — updated for current progress (past 100kg and 95kg already)
  if(w && w <= 85){
    setTimeout(function(){
      alert('🏆 GOAL WEIGHT REACHED: 85kg hit. You did it.');
    }, 300);
  } else if(w && w <= 90){
    setTimeout(function(){
      alert('🎯 MILESTONE: 90kg broken! Getting close to target now.');
    }, 300);
  }
}

// Log initial check-in from real gym scale data
function initCheckin(){
  var history = getCheckinHistory();
  // Always merge the known real readings into history by date — any seed date
  // not already present in storage gets added. This means future readings
  // added to this seed array will always apply, with no manual guard date
  // to remember to update (the previous version broke silently because of
  // exactly that kind of manual guard going stale).
  var seed = [
    {date:'2026-11-05', weight:92.6, bf:18.1, ts: new Date('2026-11-05').getTime()},
    {date:'2026-10-22', weight:94.0, bf:19.5, ts: new Date('2026-10-22').getTime()},
    {date:'2026-10-15', weight:93.2, bf:19.3, ts: new Date('2026-10-15').getTime()},
    {date:'2026-10-01', weight:95.6, bf:20.2, ts: new Date('2026-10-01').getTime()},
    {date:'2026-09-20', weight:95.3, bf:22.4, ts: new Date('2026-09-20').getTime()},
    {date:'2026-09-10', weight:98.3, bf:20.6, ts: new Date('2026-09-10').getTime()},
    {date:'2026-08-24', weight:98.7, bf:19.9, ts: new Date('2026-08-24').getTime()},
    {date:'2026-08-14', weight:97.7, bf:19.9, ts: new Date('2026-08-14').getTime()},
    {date:'2026-07-27', weight:99.2, bf:20.8, ts: new Date('2026-07-27').getTime()},
    {date:'2026-07-18', weight:101.0, bf:21.0, ts: new Date('2026-07-18').getTime()},
    {date:'2026-07-14', weight:102.0, bf:20.7, ts: new Date('2026-07-14').getTime()}
  ];
  var existingDates = {};
  history.forEach(function(h){ existingDates[h.date] = true; });
  var missing = seed.filter(function(s){ return !existingDates[s.date]; });
  var needsUpdate = missing.length > 0;
  if(history.length === 0 || needsUpdate){
    // Merge missing seed entries into history, then sort newest-first
    var merged = history.concat(missing);
    merged.sort(function(a,b){ return forgeParseLocalDate(b.date) - forgeParseLocalDate(a.date); });
    var seedForStorage = merged;
    // Also seed body tracking weight chart
    try{
      var tdSeed = JSON.parse(localStorage.getItem(TRK_KEY)||'{"weights":{},"lifts":{},"measurements":{},"notes":{}}');
      if(!tdSeed.weights[3]) tdSeed.weights[3] = 102.0;
      if(!tdSeed.weights[4]) tdSeed.weights[4] = 101.0;
      if(!tdSeed.weights[5]) tdSeed.weights[5] = 99.2;
      if(!tdSeed.weights[6]) tdSeed.weights[6] = 97.7;
      if(!tdSeed.weights[7]) tdSeed.weights[7] = 98.7;
      localStorage.setItem(TRK_KEY, JSON.stringify(tdSeed));
    }catch(e){}
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(seedForStorage));
  }
  renderCheckinBanner();
}
