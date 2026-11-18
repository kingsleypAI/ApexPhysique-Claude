// ── TODAY'S WORKOUT VIEW ─────────────────────────────────────────
var DAY_TO_WORKOUT = {
  0: 'legs',   // Sunday
  1: 'push',   // Monday
  2: 'pull',   // Tuesday
  3: 'legs',   // Wednesday
  4: 'rest',   // Thursday
  5: 'push',   // Friday
  6: 'pull'    // Saturday
};

var DAY_LABELS = {
  push: {name:'Push Day', sub:'Chest · Shoulders · Triceps', icon:'fa-dumbbell',emoji:'🏋️'},
  pull: {name:'Pull Day', sub:'Back · Lats · Biceps', icon:'fa-people-pulling',emoji:'💪'},
  legs: {name:'Leg Day', sub:'Quads · Hamstrings · Glutes', icon:'fa-person-running',emoji:'🦵'},
  rest: {name:'Rest Day', sub:'Recovery · Eat well · Sleep', icon:'fa-bed',emoji:'😴'}
};

var DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getTodayWorkout(){
  // Check for a one-off manual override for today's date (set via the
  // "Swap today" button) before falling back to the default weekly schedule
  try{
    var overrides = JSON.parse(localStorage.getItem('forge_day_override')||'{}');
    var todayStr = forgeLocalDateKey(new Date());
    if(overrides[todayStr]) return overrides[todayStr];
  }catch(e){}
  var jsDay = new Date().getDay();
  return DAY_TO_WORKOUT[jsDay] || 'rest';
}

function toggleTodayRest(){
  try{
    var overrides = JSON.parse(localStorage.getItem('forge_day_override')||'{}');
    var today = new Date();
    var todayStr = forgeLocalDateKey(today);
    var jsDay = today.getDay();
    var defaultType = DAY_TO_WORKOUT[jsDay] || 'rest';
    var currentType = getTodayWorkout();

    if(currentType === 'rest'){
      // Swapping a rest day TO training: cascade the rest of this week
      // forward by one day, so nothing gets skipped or doubled up —
      // today takes what would normally be tomorrow's session, tomorrow
      // takes what the day after would normally be, and so on through
      // Sunday. The week resets to its normal pattern the following Monday.
      // Days to shift, counting today through Sunday inclusive. Sunday swapping to
      // training has nowhere left to cascade into (the week already ends there), so
      // it just becomes a normal training day with no knock-on effect.
      var daysLeftInWeek = (jsDay === 0) ? 0 : (7 - jsDay) + 1; // e.g. Thursday(4) -> 4 (Thu,Fri,Sat,Sun)
      for(var i=0; i<daysLeftInWeek; i++){
        var d = new Date(today);
        d.setDate(today.getDate() + i);
        var dStr = forgeLocalDateKey(d);
        var sourceDay = (jsDay + i + 1) % 7; // "tomorrow relative to this slot"'s normal workout
        // The final day of the shifted run (the week's last day, Sunday) absorbs the
        // original rest slot that got pushed out, closing the cascade cleanly rather
        // than doubling up whatever Sunday's own normal workout happened to be
        overrides[dStr] = (i === daysLeftInWeek-1) ? 'rest' : (DAY_TO_WORKOUT[sourceDay] || 'rest');
      }
    } else {
      // Swapping a training day TO rest: just rest today, cascade doesn't
      // apply since the review requested only training-day backfills
      overrides[todayStr] = 'rest';
    }

    localStorage.setItem('forge_day_override', JSON.stringify(overrides));
    // Clean up overrides older than a week back, so storage doesn't grow forever.
    // Compare calendar dates only (midnight-to-midnight), not raw millisecond
    // differences — "today" carries the current time-of-day while override keys
    // parse as midnight, so a naive ms diff can misjudge a genuinely future date
    // as already past by up to half a day.
    var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var cleaned = {};
    Object.keys(overrides).forEach(function(d){
      // diff = today minus the override's date: positive for a date in the past,
      // negative for a date still ahead. Keep yesterday (diff=1) through 8 days
      // ahead (diff=-8), which comfortably covers this week's whole cascade.
      var diff = Math.round((todayMidnight - new Date(d)) / 86400000);
      if(diff >= -8 && diff <= 1) cleaned[d] = overrides[d];
    });
    localStorage.setItem('forge_day_override', JSON.stringify(cleaned));
    location.reload();
  }catch(e){}
}

function setWorkoutView(mode){
  localStorage.setItem('apx_workout_view', mode);
  applyWorkoutView(mode);
  // Update button styles
  var btnToday = document.getElementById('btnTodayOnly');
  var btnFull  = document.getElementById('btnFullPlan');
  if(btnToday && btnFull){
    if(mode === 'today'){
      btnToday.style.background = 'var(--accent)';
      btnToday.style.color = '#fff';
      btnToday.style.border = 'none';
      btnFull.style.background = 'var(--surface)';
      btnFull.style.color = 'var(--mid)';
      btnFull.style.border = '1px solid var(--border)';
    } else {
      btnFull.style.background = 'var(--accent)';
      btnFull.style.color = '#fff';
      btnFull.style.border = 'none';
      btnToday.style.background = 'var(--surface)';
      btnToday.style.color = 'var(--mid)';
      btnToday.style.border = '1px solid var(--border)';
    }
  }
}

function applyWorkoutView(mode){
  var todayType = getTodayWorkout();
  var pushDiv = document.getElementById('push');
  var pullDiv = document.getElementById('pull');
  var legsDiv = document.getElementById('legs');
  var phases   = document.querySelectorAll('.phase');
  var header   = document.getElementById('todayWorkoutHeader');
  var card     = document.getElementById('todayWorkoutCard');
  var jsDay    = new Date().getDay();
  var dayLabel = DAY_LABELS[todayType];
  var week     = getCurrentWeek();

  // Failsafe: on rest day, show tomorrow's workout type instead of nothing
  var displayType = todayType;
  if(todayType === 'rest'){
    var tomorrowDay = (jsDay + 1) % 7;
    displayType = DAY_TO_WORKOUT[tomorrowDay] || 'push';
  }

  if(mode === 'today'){
    // Show today's workout, or tomorrow's if resting (never blank)
    if(pushDiv) pushDiv.style.display = displayType==='push'?'block':'none';
    if(pullDiv) pullDiv.style.display = displayType==='pull'?'block':'none';
    if(legsDiv) legsDiv.style.display = displayType==='legs'?'block':'none';
    phases.forEach(function(p){ p.style.display='none'; });

    // Update header
    if(header) header.textContent = DAY_NAMES_SHORT[jsDay].toUpperCase() + ' — ' + (dayLabel?dayLabel.name:'Workouts');

    // Build today summary card
    if(card && dayLabel){
      if(todayType === 'rest'){
        var tomLabel = DAY_LABELS[displayType];
        card.innerHTML = '<div style="background:var(--surface);border-radius:10px;overflow:hidden;">'
          +'<div style="height:3px;background:linear-gradient(90deg,#aaaaaa,#dddddd);"></div>'
          +'<div style="padding:14px;">'
          +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">'
          +'<div style="font-size:32px;"><i class="fa-solid fa-bed"></i></div>'
          +'<div><div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:var(--white);">Rest Day</div>'
          +'<div style="font-size:11px;color:var(--mid);">Recovery is where muscle is built</div></div></div>'
          +'<div style="display:flex;flex-direction:column;gap:8px;">'
          +'<div style="display:flex;gap:10px;align-items:flex-start;font-size:12px;color:var(--mid);"><span style="color:var(--accent-text);flex-shrink:0;">①</span><span><strong style="color:var(--white);">Protein target: 220g+</strong> — muscle repair peaks 24-48h after training. Today matters as much as yesterday.</span></div>'
          +'<div style="display:flex;gap:10px;align-items:flex-start;font-size:12px;color:var(--mid);"><span style="color:var(--accent-text);flex-shrink:0;">②</span><span><strong style="color:var(--white);">Walk if you can</strong> — light movement (not your commute walks) helps flush lactic acid. 20 min casual walk.</span></div>'
          +'<div style="display:flex;gap:10px;align-items:flex-start;font-size:12px;color:var(--mid);"><span style="color:var(--accent-text);flex-shrink:0;">③</span><span><strong style="color:var(--white);">Sleep 8hrs tonight</strong> — tomorrow is '+(tomLabel?tomLabel.name:'training day')+'. GH spikes at night. This is when muscle actually grows.</span></div>'
          +'<div style="display:flex;gap:10px;align-items:flex-start;font-size:12px;color:var(--mid);"><span style="color:var(--accent-text);flex-shrink:0;">④</span><span><strong style="color:var(--white);">Magnesium before bed</strong> — take your 2 caps tonight. Cortisol blunting and deep sleep.</span></div>'
          +'</div>'
          +'<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--grey);">Showing tomorrow\'s '+(tomLabel?tomLabel.name:'workout')+' below so you can preview it ↓</div>'
          +'</div></div>';
      } else {
        card.innerHTML = '<div style="background:rgba(139,92,246,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:12px 14px;">'
          +'<div style="display:flex;align-items:center;gap:10px;">'
          +'<div style="font-size:28px;line-height:1;" role="img" aria-label="'+dayLabel.name+'">'+(dayLabel.emoji||'🏋️')+'</div>'
          +'<div>'
          +'<div style="font-family:Space+Grotesk,sans-serif;font-size:15px;font-weight:800;color:var(--white);">'+dayLabel.name+'</div>'
          +'<div style="font-size:11px;color:var(--mid);">'+dayLabel.sub+'</div>'
          +'</div>'
          +'<div style="margin-left:auto;text-align:right;">'
          +'<div style="font-size:11px;font-weight:700;color:var(--accent-text);">Week '+week+'</div>'
          +'<div style="font-size:10px;color:var(--grey);">'+getCurrentPhase(week).name+'</div>'
          +'</div>'
          +'</div>'
          +'</div>';
      }
    }
  } else {
    // Full view — show everything
    if(pushDiv) pushDiv.style.display = 'block';
    if(pullDiv) pullDiv.style.display = 'block';
    if(legsDiv) legsDiv.style.display = 'block';
    phases.forEach(function(p){ p.style.display=''; });
    if(header) header.textContent = 'TRAINING PLAN';
    if(card) card.innerHTML = '';
  }
  try{applyABVariant();}catch(e){}
  try{updateWorkoutBanners();}catch(e){}
}

function initWorkoutView(){
  var saved = localStorage.getItem('apx_workout_view') || 'today';
  setWorkoutView(saved);
}
