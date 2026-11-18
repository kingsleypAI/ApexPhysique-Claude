function toggleNav(){
  var b=document.getElementById('hamburgerBtn'),d=document.getElementById('navDrawer'),k=document.getElementById('navBackdrop');
  if(!d||!b||!k)return;
  if(d.classList.contains('open')){closeNav();}
  else{
    b.classList.add('open');d.classList.add('open');k.classList.add('open');
    b.setAttribute('aria-expanded','true');
    d.setAttribute('aria-hidden','false');
    k.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    var first=d.querySelector('.nav-item');
    if(first)first.focus();
  }
}
function closeNav(){
  ['hamburgerBtn','navDrawer','navBackdrop'].forEach(function(id){
    var e=document.getElementById(id);if(e)e.classList.remove('open');
  });
  var b=document.getElementById('hamburgerBtn'),d=document.getElementById('navDrawer'),k=document.getElementById('navBackdrop');
  if(b){b.setAttribute('aria-expanded','false');b.focus();}
  if(d)d.setAttribute('aria-hidden','true');
  if(k)k.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){
  var d=document.getElementById('navDrawer');
  if(!d||!d.classList.contains('open'))return;
  if(e.key==='Escape'){e.preventDefault();closeNav();return;}
  if(e.key==='Tab'){
    var items=Array.prototype.slice.call(d.querySelectorAll('.nav-item[tabindex="0"]'));
    if(!items.length)return;
    var first=items[0],last=items[items.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
document.addEventListener('keydown',function(e){
  var item=e.target.closest&&e.target.closest('.nav-item[role="button"]');
  if(item&&(e.key==='Enter'||e.key===' ')){e.preventDefault();item.click();}
});
var NAV_LABELS={
  schedule:'Overview',program:'Workouts',nutrition:'Nutrition',
  recipes:'Recipes',shopping:'Shopping',timer:'Timer',
  tracker:'Progress',tracking:'Tracking',calories:'Calories',
  next:'After Week 12',deload:'Deload Guide',strava:'Strava'
};

// ── NAVIGATION SOUND ─────────────────────────────────────────────
var _audioCtx = null;
function playNavTick(){
  try{
    if(!_audioCtx) _audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    var ctx = _audioCtx;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  }catch(e){}
}

function navTo(id,label){
  document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
  var sec=document.getElementById('tab-'+id);
  if(sec) sec.classList.add('active');
  // Sticky rest timer only makes sense on the Workouts tab
  var stickyBar = document.getElementById('stickyTimerBar');
  var stickyWrap = document.getElementById('stickyTimerPresetsWrap');
  if(stickyBar) stickyBar.style.display = (id==='program') ? 'flex' : 'none';
  if(stickyWrap && id!=='program') stickyWrap.style.display = 'none';
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  var ni=document.getElementById('nav-'+id);
  if(ni) ni.classList.add('active');
  closeNav();
  window.scrollTo(0,0);
  if(id==='program') setTimeout(function(){try{initWorkoutView();}catch(e){}},50);
  if(id==='tracker') setTimeout(function(){try{renderExercisePRsGrid();}catch(e){};try{buildMonthCalendar();}catch(e){}},50);
  if(id==='schedule') setTimeout(function(){try{renderHomePRs();}catch(e){};try{buildHomeWeeklyStrip();}catch(e){}},50);
  playNavTick();
}
function switchTab(id,el){navTo(id,NAV_LABELS[id]||id);}


function toggleVideoPlayer(vid_id){
  var player = document.getElementById('vp-'+vid_id);
  var thumb = document.getElementById('vt-'+vid_id);
  if(!player || !thumb) return;
  if(player.style.display === 'none'){
    player.style.display = 'block';
    thumb.style.display = 'none';
  } else {
    player.style.display = 'none';
    thumb.style.display = 'block';
  }
}
