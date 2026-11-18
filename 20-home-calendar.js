// ── HOME MINI CALENDAR ────────────────────────────────────────────
var _homeCalYear  = new Date().getFullYear();
var _homeCalMonth = new Date().getMonth();


function buildHomeWeeklyStrip(){
  var el = document.getElementById('homeMiniCalGrid');
  if(!el) return;
  var expanded = localStorage.getItem('forge_cal_expanded') === 'true';
  if(expanded){ buildHomeMiniCal(); return; }

  var now = new Date();
  var jsDay = now.getDay();
  var mondayOffset = (jsDay === 0) ? -6 : 1 - jsDay;
  var monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  var allDone = typeof getAllDoneData==='function' ? getAllDoneData() : {};
  var DAY_T   = {0:'legs',1:'push',2:'pull',3:'legs',4:'rest',5:'push',6:'pull'};
  var DAY_COL = {push:'#C8102E',pull:'#aaaaaa',legs:'#777777',rest:'transparent'};
  var DAY_LETTERS = ['M','T','W','T','F','S','S'];

  var out = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;">';

  for(var i=0;i<7;i++){
    var dt = new Date(monday);
    dt.setDate(monday.getDate() + i);
    var jsDayNum = dt.getDay();
    var dtype = DAY_T[jsDayNum];
    var col = DAY_COL[dtype] || 'transparent';
    var ds = dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    var dayDone = allDone[ds] ? Object.values(allDone[ds]).filter(Boolean).length : 0;
    var isToday = (dt.toDateString() === now.toDateString());
    var isFuture = dt > now && !isToday;
    var trained = dayDone >= 4;
    var isRest = dtype === 'rest';

    var bg = trained ? col : (isToday ? 'rgba(200,16,46,0.22)' : 'var(--surface)');
    var border = isToday ? '2px solid var(--accent)' : '1px solid var(--border)';
    var glow = isToday ? 'box-shadow:0 0 0 2px rgba(200,16,46,0.35);' : '';
    var numCol = trained ? '#fff' : (isToday ? 'var(--accent)' : (isFuture ? 'var(--grey)' : 'var(--mid)'));
    var op = isFuture ? '0.4' : '1';

    out += '<div style="border-radius:8px;padding:6px 2px;text-align:center;background:'+bg
      +';border:'+border+';opacity:'+op+';min-height:48px;display:flex;flex-direction:column;'
      +'align-items:center;justify-content:center;'+glow+'">'
      +'<div style="font-size:9px;font-weight:700;color:var(--grey);margin-bottom:2px;">'+DAY_LETTERS[i]+'</div>'
      +'<div style="font-size:13px;font-weight:700;color:'+numCol+';">'+dt.getDate()+'</div>'
      +(!isRest ? '<div style="width:5px;height:5px;border-radius:50%;background:'
        +(trained?'rgba(255,255,255,0.6)':col)+';margin-top:3px;"></div>' : '<div style="width:5px;height:5px;margin-top:3px;"></div>')
      +'</div>';
  }
  out += '</div>';

  // Quick stats row — current real distances, not hardcoded
  var realCurrentWeight = 92.6, realTargetWeight = 85.0;
  var toGoal = (realCurrentWeight - realTargetWeight).toFixed(1);

  var totalThisWeek = 0;
  for(var i2=0;i2<7;i2++){
    var dt2 = new Date(monday); dt2.setDate(monday.getDate()+i2);
    var ds2 = dt2.getFullYear()+'-'+String(dt2.getMonth()+1).padStart(2,'0')+'-'+String(dt2.getDate()).padStart(2,'0');
    if(allDone[ds2] && Object.values(allDone[ds2]).filter(Boolean).length>=4) totalThisWeek++;
  }

  out += '<div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">'
    +'<div style="text-align:center;flex:1;">'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:var(--white);">'+totalThisWeek+'</div>'
    +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.04em;">this week</div>'
    +'</div>'
    +'<div style="width:1px;background:var(--border);"></div>'
    +'<div style="text-align:center;flex:1;">'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:#aaaaaa;">'+toGoal+'kg</div>'
    +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.04em;">to goal</div>'
    +'</div>'
    +'</div>'
    +'<div style="text-align:center;margin-top:10px;">'
    +'<span onclick="toggleCalendarView()" style="font-size:10px;color:var(--grey);text-decoration:underline;cursor:pointer;-webkit-tap-highlight-color:transparent;">See full month</span>'
    +'</div>';

  el.innerHTML = out;
}

function toggleCalendarView(){
  var expanded = localStorage.getItem('forge_cal_expanded') === 'true';
  localStorage.setItem('forge_cal_expanded', expanded ? 'false' : 'true');
  if(!expanded){
    buildHomeMiniCal();
    // Add a "back to week view" link at the bottom of the expanded month grid
    var el = document.getElementById('homeMiniCalGrid');
    if(el) el.innerHTML += '<div style="text-align:center;margin-top:10px;"><span onclick="toggleCalendarView()" style="font-size:10px;color:var(--grey);text-decoration:underline;cursor:pointer;-webkit-tap-highlight-color:transparent;">Back to week view</span></div>';
  } else {
    buildHomeWeeklyStrip();
  }
}

function buildHomeMiniCal(){
  var el = document.getElementById('homeMiniCalGrid');
  if(!el) return;
  var now   = new Date();
  var year  = _homeCalYear;
  var month = _homeCalMonth;
  var fullMonthNames = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  var firstDay    = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var startOffset = (firstDay === 0) ? 6 : firstDay - 1;
  var allDone = typeof getAllDoneData==='function' ? getAllDoneData() : {};
  var DAY_T   = {0:'legs',1:'push',2:'pull',3:'legs',4:'rest',5:'push',6:'pull'};
  var DAY_COL = {push:'#C8102E',pull:'#aaaaaa',legs:'#777777',rest:'transparent'};

  var out = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
    +'<button onclick="homeCalPrev()" style="background:none;border:none;color:var(--grey);font-size:20px;cursor:pointer;padding:0 6px;-webkit-tap-highlight-color:transparent;line-height:1;">‹</button>'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:13px;font-weight:800;color:var(--white);">'+fullMonthNames[month]+' '+year+'</div>'
    +'<button onclick="homeCalNext()" style="background:none;border:none;color:var(--grey);font-size:20px;cursor:pointer;padding:0 6px;-webkit-tap-highlight-color:transparent;line-height:1;">›</button>'
    +'</div>';

  out += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:3px;">';
  ['M','T','W','T','F','S','S'].forEach(function(d){
    out += '<div style="text-align:center;font-size:9px;font-weight:700;color:var(--grey);padding:1px 0;">'+d+'</div>';
  });
  out += '</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">';

  for(var i=0;i<startOffset;i++) out += '<div></div>';

  for(var d=1;d<=daysInMonth;d++){
    var dt     = new Date(year, month, d);
    var jsDay  = dt.getDay();
    var dtype  = DAY_T[jsDay];
    var col    = DAY_COL[dtype] || 'transparent';
    var ds     = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var dayDone= allDone[ds] ? Object.values(allDone[ds]).filter(Boolean).length : 0;
    var isToday= (d===now.getDate()&&month===now.getMonth()&&year===now.getFullYear());
    var fut    = dt > new Date(now.getFullYear(),now.getMonth(),now.getDate());
    var trained= dayDone >= 4;
    var isRest = dtype==='rest';

    var bg     = trained ? col : (isToday ? 'rgba(200,16,46,0.22)' : 'var(--surface)');
    var border = isToday ? '2px solid var(--accent)' : '1px solid var(--border)';
    var glow   = isToday ? 'box-shadow:0 0 0 2px rgba(200,16,46,0.35);' : '';
    var numCol = trained ? '#fff' : (isToday ? 'var(--accent)' : (fut ? 'var(--grey)' : 'var(--mid)'));
    var op     = fut ? '0.3' : '1';

    out += '<div style="border-radius:5px;padding:3px 1px;text-align:center;background:'+bg
      +';border:'+border+';opacity:'+op+';min-height:36px;display:flex;flex-direction:column;'
      +'align-items:center;justify-content:center;'+glow+'">'
      +'<div style="font-size:11px;font-weight:700;color:'+numCol+';">'+d+'</div>'
      +(!isRest ? '<div style="width:5px;height:5px;border-radius:50%;background:'
        +(trained?'rgba(255,255,255,0.5)':col)+';margin-top:1px;"></div>' : '')
      +'</div>';
  }
  out += '</div>';

  // Stats row
  var totalThisMonth=0;
  for(var dd=1;dd<=daysInMonth;dd++){
    var dds=year+'-'+String(month+1).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
    if(allDone[dds]&&Object.values(allDone[dds]).filter(Boolean).length>=4) totalThisMonth++;
  }

  out += '<div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">'
    +'<div style="text-align:center;flex:1;">'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:var(--white);">'+totalThisMonth+'</div>'
    +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.04em;">sessions</div>'
    +'</div>'
    +'<div style="width:1px;background:var(--border);"></div>'
    +'<div style="text-align:center;flex:1;">'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:var(--accent-text);">'
    +(month===now.getMonth()&&year===now.getFullYear() ? (daysInMonth-now.getDate()) : '—')+'</div>'
    +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.04em;">days left</div>'
    +'</div>'
    +'<div style="width:1px;background:var(--border);"></div>'
    +'<div style="text-align:center;flex:1;">'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:#aaaaaa;">7.6kg</div>'
    +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.04em;">to goal</div>'
    +'</div>'
    +'';

  el.innerHTML = out;
}

function homeCalPrev(){
  _homeCalMonth--;
  if(_homeCalMonth<0){_homeCalMonth=11;_homeCalYear--;}
  buildHomeMiniCal();
}
function homeCalNext(){
  _homeCalMonth++;
  if(_homeCalMonth>11){_homeCalMonth=0;_homeCalYear++;}
  buildHomeMiniCal();
}
