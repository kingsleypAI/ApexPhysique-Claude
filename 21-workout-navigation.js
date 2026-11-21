function goToTodayWorkout(){
  navTo('program','Workouts');
  setTimeout(function(){
    try{ setWorkoutView('today'); }catch(e){}
    var todayType = getTodayWorkout();
    var targetType = todayType === 'rest' ? getNextWorkoutScheduleEntry(new Date()).type : todayType;
    var target = document.getElementById(targetType);
    if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
  }, 150);
}
