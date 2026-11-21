// ── MONTHLY SESSION CALENDAR ─────────────────────────────────────
var _calYear  = new Date().getFullYear();
var _calMonth = new Date().getMonth(); // 0-indexed

// Day type by JS getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
var CAL_DAY_TYPE = {0:'legs',1:'push',2:'pull',3:'legs',4:'rest',5:'push',6:'pull'};
var CAL_DAY_COLOUR = {push:'var(--accent)',pull:'#aaaaaa',legs:'#888888',rest:'var(--border2)'};
var CAL_DAY_LABEL  = {push:'Push',pull:'Pull',legs:'Legs',rest:'Rest'};

function buildMonthCalendar(){
  var el = document.getElementById('monthCalendar');
  if(!el) return;

  var now   = new Date();
  var year  = _calYear;
  var month = _calMonth;
  var monthName = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'][month];

  var firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  var daysInMonth = new Date(year, month+1, 0).getDate();

  // Monday-first: adjust firstDay (0=Mon..6=Sun)
  var startOffset = (firstDay === 0) ? 6 : firstDay - 1;

  // Get done data to know which days have ticked exercises
  var doneRaw = (typeof getAllDoneData==='function') ? getAllDoneData() : JSON.parse(localStorage.getItem('apx_done_v1')||'{}');

  // Build HTML
  var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">'
    +'<button onclick="calPrevMonth()" style="background:var(--surface);border:1px solid var(--border);color:var(--mid);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:16px;-webkit-tap-highlight-color:transparent;">‹</button>'
    +'<div style="text-align:center;">'
    +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:var(--white);">'+monthName+'</div>'
    +'<div style="font-size:10px;color:var(--grey);">'+year+'</div>'
    +'</div>'
    +'<button onclick="calNextMonth()" style="background:var(--surface);border:1px solid var(--border);color:var(--mid);padding:6px 12px;border-radius:6px;cursor:pointer;font-size:16px;-webkit-tap-highlight-color:transparent;">›</button>'
    +'</div>';

  // Day headers Mon-Sun
  var dayHeaders = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:4px;">';
  dayHeaders.forEach(function(d){
    html += '<div style="text-align:center;font-size:9px;font-weight:700;letter-spacing:0.06em;color:var(--grey);padding:2px 0;">'+d+'</div>';
  });
  html += '</div>';

  // Calendar grid
  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">';

  // Empty cells before first day
  for(var i=0;i<startOffset;i++){
    html += '<div></div>';
  }

  for(var d=1;d<=daysInMonth;d++){
    var date = new Date(year, month, d);
    var jsDay = date.getDay();
    var dayType = getWorkoutForDate(date);
    var colour  = CAL_DAY_COLOUR[dayType] || 'var(--border2)';
    var label   = CAL_DAY_LABEL[dayType]  || '';
    var dateStr = year+'-'+(month+1<10?'0'+(month+1):(month+1))+'-'+(d<10?'0'+d:d);

    var isToday   = (d===now.getDate() && month===now.getMonth() && year===now.getFullYear());
    var isFuture  = date > now;
    var isPast    = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if session was done (any exercises ticked that day)
    var doneThatDay = doneRaw[dateStr] ? Object.values(doneRaw[dateStr]).filter(Boolean).length : 0;
    var sessionDone = doneThatDay > 0; // Any logged exercise marks training activity

    var opacity = isFuture ? '0.25' : '1';
    var bg = sessionDone
      ? colour
      : (isToday ? 'rgba(255,255,255,0.15)' : 'var(--surface)');
    var border = isToday ? '2px solid var(--accent)' : '1px solid var(--border)';
    var textCol = sessionDone ? '#fff' : (isFuture ? 'var(--grey)' : 'var(--mid)');
    var dayNumCol = isToday ? 'var(--accent)' : (sessionDone ? '#fff' : 'var(--white)');

    html += '<div style="border-radius:6px;padding:4px 2px;text-align:center;background:'+bg+';border:'+border+';opacity:'+opacity+';min-height:44px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;">'
      +'<div style="font-size:12px;font-weight:700;color:'+dayNumCol+';">'+d+'</div>'
      +(dayType!=='rest' ? '<div style="font-size:7px;font-weight:700;letter-spacing:0.04em;color:'+(sessionDone?'rgba(255,255,255,0.8)':colour)+';text-transform:uppercase;">'+label+'</div>' : '')
      +'</div>';
  }

  html += '</div>';

  // Legend
  html += '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px;">';
  [{t:'push',l:'Push'},{t:'pull',l:'Pull'},{t:'legs',l:'Legs'},{t:'rest',l:'Rest'}].forEach(function(item){
    html += '<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--grey);">'
      +'<div style="width:8px;height:8px;border-radius:2px;background:'+CAL_DAY_COLOUR[item.t]+';"></div>'
      +'<span>'+item.l+'</span></div>';
  });
  html += '</div>';

  el.innerHTML = html;
}

function calPrevMonth(){
  _calMonth--;
  if(_calMonth < 0){ _calMonth=11; _calYear--; }
  buildMonthCalendar();
}
function calNextMonth(){
  _calMonth++;
  if(_calMonth > 11){ _calMonth=0; _calYear++; }
  buildMonthCalendar();
}
