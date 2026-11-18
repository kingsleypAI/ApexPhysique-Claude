function updateHomeRealStats(){
  // Populates every home-screen stat card from the real, latest check-in
  // (getCheckinHistory()[0]) instead of hardcoded numbers that go stale
  // the moment a new check-in is logged. Real progression: 120kg
  // pre-tracking (self-reported, before the Gym Group check-ins began) ->
  // 102.0kg gym start (14 Jul 2026) -> current -> 85kg target.
  try{
    var history = typeof getCheckinHistory==='function' ? getCheckinHistory() : [];
    if(!history.length) return;
    var latest = history[0];
    var weight = latest.weight, bf = latest.bf;
    var fatMass = +(weight * bf / 100).toFixed(1);
    var leanMass = +(weight - fatMass).toFixed(1);
    var gymStart = 102.0, target = 85.0;
    var downFromStart = +(gymStart - weight).toFixed(1);
    var toGo = +(weight - target).toFixed(1);

    var wEl = document.getElementById('homeStatWeight');
    var bfEl = document.getElementById('homeStatBF');
    if(wEl) wEl.textContent = weight.toFixed(1)+'kg';
    if(bfEl) bfEl.textContent = bf.toFixed(1)+'%';

    var rbsW = document.getElementById('rbsWeight');
    var rbsBF = document.getElementById('rbsBF');
    var rbsLean = document.getElementById('rbsLean');
    var rbsFat = document.getElementById('rbsFat');
    if(rbsW) rbsW.textContent = weight.toFixed(1)+'kg';
    if(rbsBF) rbsBF.textContent = bf.toFixed(1)+'%';
    if(rbsLean) rbsLean.textContent = leanMass.toFixed(1)+'kg';
    if(rbsFat) rbsFat.textContent = fatMass.toFixed(1)+'kg';

    var headline = document.getElementById('progBannerHeadline');
    var sub = document.getElementById('progBannerSub');
    var kgNow = document.getElementById('progBannerKgNow');
    if(headline) headline.textContent = '🔥 '+downFromStart.toFixed(1)+'kg down · '+bf.toFixed(1)+'% BF · 85kg target';
    if(sub) sub.innerHTML = '120kg pre-tracking → 102.0kg gym start → <strong style="color:var(--accent-text);">'+weight.toFixed(1)+'kg</strong> → 85kg target. '+toGo.toFixed(1)+'kg to go.';
    if(kgNow) kgNow.textContent = weight.toFixed(1);
  }catch(e){}
}

function updateCheckinCountdown(){
  try{
    var history = typeof getCheckinHistory==='function' ? getCheckinHistory() : [];
    var dateEl = document.getElementById('nextCheckinDate');
    var daysEl = document.getElementById('nextCheckinDays');
    if(!dateEl || !daysEl || !history.length) return;
    var lastDate = forgeParseLocalDate(history[0].date);
    var nextDue = new Date(lastDate);
    nextDue.setDate(nextDue.getDate() + 14);
    var today = new Date();
    var daysLeft = Math.ceil((nextDue - today) / (1000*60*60*24));
    if(daysLeft <= 0){
      daysEl.textContent = 'Due now';
    } else {
      daysEl.textContent = daysLeft + ' day' + (daysLeft===1?'':'s');
    }
    var opts = {weekday:'long', day:'numeric', month:'long'};
    dateEl.textContent = nextDue.toLocaleDateString('en-GB', opts);
  }catch(e){}
}
