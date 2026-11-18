function setManualWeek(){
  var w = prompt('Enter your current programme week number:', String(typeof getCurrentWeek==='function' ? getCurrentWeek() : 1));
  if(!w || isNaN(w)) return;
  w = Math.max(parseInt(w,10), 1);
  // Calculate what start date would give us this week
  var start = new Date();
  start.setDate(start.getDate() - ((w - 1) * 7));
  // Set to Monday of that week
  var day = start.getDay();
  var diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0,0,0,0);
  localStorage.setItem('apx_program_start', start.toISOString());
  alert('Programme set to Week ' + w + '. Reloading...');
  location.reload();
}
