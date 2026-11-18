function updateHomeRealStats(){
  // Populate home stats from the latest check-in while allowing weight-only
  // or body-fat-only entries. Derived lean/fat mass needs both measurements.
  try{
    var history = typeof getCheckinHistory==='function' ? getCheckinHistory() : [];
    if(!history.length) return;
    var latest = history[0];
    var weight = Number(latest.weight), bf = Number(latest.bf);
    var hasWeight = latest.weight != null && latest.weight !== '' && isFinite(weight) && weight > 0;
    var hasBF = latest.bf != null && latest.bf !== '' && isFinite(bf) && bf > 0 && bf < 100;

    var wEl = document.getElementById('homeStatWeight');
    var bfEl = document.getElementById('homeStatBF');
    if(hasWeight && wEl) wEl.textContent = weight.toFixed(1)+'kg';
    if(bfEl) bfEl.textContent = hasBF ? bf.toFixed(1)+'%' : '—';

    var rbsW = document.getElementById('rbsWeight');
    var rbsBF = document.getElementById('rbsBF');
    var rbsLean = document.getElementById('rbsLean');
    var rbsFat = document.getElementById('rbsFat');
    if(hasWeight && rbsW) rbsW.textContent = weight.toFixed(1)+'kg';
    if(rbsBF) rbsBF.textContent = hasBF ? bf.toFixed(1)+'%' : '—';
    if(hasWeight && hasBF){
      var fatMass = +(weight * bf / 100).toFixed(1);
      var leanMass = +(weight - fatMass).toFixed(1);
      if(rbsLean) rbsLean.textContent = leanMass.toFixed(1)+'kg';
      if(rbsFat) rbsFat.textContent = fatMass.toFixed(1)+'kg';
    } else {
      if(rbsLean) rbsLean.textContent = '—';
      if(rbsFat) rbsFat.textContent = '—';
    }

    if(hasWeight){
      var gymStart = 102.0, target = 85.0;
      var downFromStart = +(gymStart - weight).toFixed(1);
      var toGo = Math.max(0, +(weight - target).toFixed(1));
      var headline = document.getElementById('progBannerHeadline');
      var sub = document.getElementById('progBannerSub');
      var kgNow = document.getElementById('progBannerKgNow');
      if(headline) headline.textContent = '🔥 '+downFromStart.toFixed(1)+'kg down'+(hasBF?' · '+bf.toFixed(1)+'% BF':'')+' · 85kg target';
      if(sub) sub.innerHTML = '120kg pre-tracking → 102.0kg gym start → <strong style="color:var(--accent-text);">'+weight.toFixed(1)+'kg</strong> → 85kg target. '+(toGo===0?'Goal reached!':toGo.toFixed(1)+'kg to go.');
      if(kgNow) kgNow.textContent = weight.toFixed(1);
    }
  }catch(e){}
}
function updateCheckinCountdown(){
  try{
    var history = typeof getCheckinHistory==='function' ? getCheckinHistory() : [];
    var dateEl = document.getElementById('nextCheckinDate');
    var daysEl = document.getElementById('nextCheckinDays');
    if(!dateEl || !daysEl || !history.length) return;
    var lastDate = forgeParseLocalDate(history[0].date);
    if(!lastDate || !isFinite(lastDate.getTime())) return;
    var nextDue = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 14);
    var today = new Date();
    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Compare calendar dates, not elapsed 24-hour periods, to avoid DST/time-of-day drift.
    var daysLeft = Math.round((Date.UTC(nextDue.getFullYear(),nextDue.getMonth(),nextDue.getDate()) - Date.UTC(todayStart.getFullYear(),todayStart.getMonth(),todayStart.getDate())) / 86400000);
    if(daysLeft <= 0){
      daysEl.textContent = 'Due now';
    } else {
      daysEl.textContent = daysLeft + ' day' + (daysLeft===1?'':'s');
    }
    var opts = {weekday:'long', day:'numeric', month:'long'};
    dateEl.textContent = nextDue.toLocaleDateString('en-GB', opts);
  }catch(e){}
}
