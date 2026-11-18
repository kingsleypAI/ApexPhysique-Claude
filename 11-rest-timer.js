// ── MINI REST TIMER ───────────────────────────────────────────────
var _mTime=90,_mRem=90,_mInt=null,_mRun=false;

function miniSetTimer(s){
  _mTime=s;_mRem=s;_mRun=false;
  clearInterval(_mInt);_mInt=null;
  document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='START';});
  miniUpdDisplay();
  document.querySelectorAll('.mini-preset').forEach(function(b){b.classList.remove('active');});
  // Mark the matching preset active
  var secs={'60':0,'90':1,'120':2,'180':3};
  var idx=secs[String(s)];
  var presets=document.querySelectorAll('.mini-preset');
  if(idx!==undefined && presets[idx]) presets[idx].classList.add('active');

  // Auto-collapse the preset drawer once a duration is picked
  var wrap = document.getElementById('stickyTimerPresetsWrap');
  var expandBtn = document.getElementById('stickyTimerExpandBtn');
  if(wrap && wrap.style.display !== 'none'){
    wrap.style.display = 'none';
    if(expandBtn) expandBtn.textContent = '▴';
  }
}

function miniUpdDisplay(){
  var m=Math.floor(_mRem/60).toString().padStart(2,'0');
  var s=(_mRem%60).toString().padStart(2,'0');
  var displays=document.querySelectorAll('.mini-timer-display');
  displays.forEach(function(d){d.textContent=m+':'+s;});
}

function miniStartStop(){
  if(_mRun){
    clearInterval(_mInt);_mInt=null;_mRun=false;
    releaseWakeLock();
    document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='RESUME';});
  } else {
    if(_mRem<=0){_mRem=_mTime;miniUpdDisplay();}
    _mRun=true;
    requestWakeLock();
    document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='PAUSE';});
    _mInt=setInterval(function(){
      _mRem--;
      miniUpdDisplay();
      if(_mRem<=0){
        clearInterval(_mInt);_mInt=null;_mRun=false;
        document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='START';});
        document.querySelectorAll('.mini-timer-display').forEach(function(d){d.textContent='GO!';});
        if(typeof fireTimerNotification==='function') fireTimerNotification();
        if(typeof playBeep==='function') playBeep();
        setTimeout(function(){
          _mRem=_mTime;miniUpdDisplay();
        },1500);
      }
    },1000);
  }
}

function miniReset(){
  clearInterval(_mInt);_mInt=null;_mRun=false;
  _mRem=_mTime;
  miniUpdDisplay();
  document.querySelectorAll('.mini-start').forEach(function(b){b.textContent='START';});
}

function toggleStickyTimerPresets(){
  var wrap = document.getElementById('stickyTimerPresetsWrap');
  var btn = document.getElementById('stickyTimerExpandBtn');
  if(!wrap || !btn) return;
  var isOpen = wrap.style.display !== 'none';
  wrap.style.display = isOpen ? 'none' : 'block';
  btn.textContent = isOpen ? '▴' : '▾';
}
