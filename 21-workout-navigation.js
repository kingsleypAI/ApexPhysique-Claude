function goToTodayWorkout(){
  navTo('program','Workouts');
  setTimeout(function(){
    try{ setWorkoutView('today'); }catch(e){}
    var todayType = getTodayWorkout();
    var target = document.getElementById(todayType === 'rest' ? DAY_TO_WORKOUT[(new Date().getDay()+1)%7] : todayType);
    if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  }, 150);
}
