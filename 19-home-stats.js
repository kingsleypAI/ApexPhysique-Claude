function updateHomeStats(){
  // Count training days using the same rule as the activity report: any ticked exercise.
  var doneRaw = (typeof getAllDoneData==='function') ? getAllDoneData() : JSON.parse(localStorage.getItem('apx_done_v1')||'{}');
  var totalSessions = 0;
  var streak = 0;
  var dates = Object.keys(doneRaw).sort().reverse();
  var today = forgeLocalDateKey(new Date());

  dates.forEach(function(date){
    var d = doneRaw[date];
    if(!d) return;
    if(Object.values(d).some(Boolean)) totalSessions++;
  });

  // Calculate streak
  var checkDate = new Date();
  for(var i=0;i<60;i++){
    var ds = forgeLocalDateKey(checkDate);
    var d = doneRaw[ds];
    var hasActivity = !!(d && Object.values(d).some(Boolean));
    var dayType = typeof getWorkoutForDate==='function' ? getWorkoutForDate(checkDate) : ({0:'legs',1:'push',2:'pull',3:'legs',4:'rest',5:'push',6:'pull'}[checkDate.getDay()]);
    if(hasActivity){ streak++; checkDate.setDate(checkDate.getDate()-1); }
    else if(ds === today || dayType === 'rest') { checkDate.setDate(checkDate.getDate()-1); }
    else break;
  }

  var sessEl = document.getElementById('homeStatSessions');
  var strEl  = document.getElementById('homeStatStreak');
  if(sessEl) sessEl.textContent = totalSessions;
  if(strEl)  strEl.textContent  = streak;
  var sessEl2 = document.getElementById('homeStatSessions2');
  var strEl2  = document.getElementById('homeStatStreak2');
  if(sessEl2) sessEl2.textContent = totalSessions;
  if(strEl2)  strEl2.textContent  = streak;
}
