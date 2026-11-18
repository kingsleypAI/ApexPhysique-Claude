// ── WORKOUT WEEK BADGE ───────────────────────────────────────────
function updateWorkoutBanners(){
  try{
    var week = getCurrentWeek();
    var phase = getCurrentPhase(week);
    var phaseName = phase ? phase.name : 'Foundation';
    var badge = 'Week ' + week + ' · ' + phaseName;
    document.querySelectorAll('.day-banner-inner').forEach(function(b){
      var existing = b.querySelector('.day-banner-week');
      if(!existing){
        var span = document.createElement('div');
        span.className = 'day-banner-week';
        span.textContent = badge;
        b.appendChild(span);
      } else {
        existing.textContent = badge;
      }
    });
  }catch(e){}
}
