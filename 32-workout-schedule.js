/* FORGE six-session weekly sequence with one movable recovery day.
   Thursday is the default rest day; moving it never drops or duplicates a session. */
(function(){
  'use strict';
  var KEY='forge_weekly_rest_days_v1';
  var ANCHOR=new Date(2026,10,16,12,0,0,0); // Monday: Push A
  var SESSIONS=['pushA','pullA','legsA','pushB','pullB','legsB'];
  var BASE={0:'legsB',1:'pushA',2:'pullA',3:'legsA',4:'rest',5:'pushB',6:'pullB'};
  function key(d){return forgeLocalDateKey(d);}
  function mondayOf(d){
    var m=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);
    m.setDate(m.getDate()-((m.getDay()+6)%7));
    return m;
  }
  function weekKey(d){return key(mondayOf(d));}
  function readRestDays(){
    var saved=forgeSafeJSON(localStorage.getItem(KEY)||'{}',{});
    // Migrate an existing one-off rest choice without deleting its original history.
    var legacy=forgeSafeJSON(localStorage.getItem('forge_day_override')||'{}',{});
    Object.keys(legacy).forEach(function(k){
      if(legacy[k]!=='rest') return;
      var parsed=new Date(k+'T12:00:00');
      if(!Number.isFinite(parsed.getTime())) return;
      var wk=weekKey(parsed);
      if(!saved[wk]) saved[wk]=key(parsed);
    });
    return saved;
  }
  function details(id){
    if(id==='rest') return {id:'rest',type:'rest',variant:null};
    return {id:id,type:id.replace(/[AB]$/,'').toLowerCase(),variant:id.slice(-1).toLowerCase()};
  }
  function validRestDay(monday,stored){
    if(!stored) return null;
    var d=new Date(stored+'T12:00:00');
    if(!Number.isFinite(d.getTime())) return null;
    return weekKey(d)===key(monday)?d:null;
  }
  function at(date){
    var d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
    if(d<ANCHOR) return details(BASE[d.getDay()]||'rest');
    var monday=mondayOf(d),restDays=readRestDays();
    var rest=validRestDay(monday,restDays[key(monday)])||new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+3,12);
    if(key(d)===key(rest)) return details('rest');
    var queue=SESSIONS.slice(),cursor=new Date(monday);
    while(cursor<d){
      if(key(cursor)!==key(rest)) queue.shift();
      cursor.setDate(cursor.getDate()+1);
    }
    return details(queue.shift()||'rest');
  }
  function saveRestDays(restDays){
    var today=new Date();today.setHours(12,0,0,0);
    Object.keys(restDays).forEach(function(k){
      var monday=new Date(k+'T12:00:00');
      if(!Number.isFinite(monday.getTime()) || monday<ANCHOR || monday-today>180*86400000) delete restDays[k];
    });
    localStorage.setItem(KEY,JSON.stringify(restDays));
  }
  window.getWorkoutScheduleEntry=function(date){return at(date instanceof Date?date:new Date(date));};
  window.getWorkoutForDate=function(date){return at(date instanceof Date?date:new Date(date)).type;};
  window.getNextWorkoutScheduleEntry=function(date){
    var d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
    for(var i=1;i<=14;i++){d.setDate(d.getDate()+1);var entry=at(d);if(entry.type!=='rest')return entry;}
    return details('pushA');
  };
  // Select the one recovery day for the date's Monday-Sunday week.
  window.setWorkoutRestDay=function(date){
    var d=date instanceof Date?date:new Date(date),monday=mondayOf(d),restDays=readRestDays();
    restDays[key(monday)]=key(d);
    saveRestDays(restDays);
  };
  // Compatibility API used by the existing Today toggle. If today's rest is
  // switched to training, the recovery slot moves to the next day (or Saturday
  // when moving Sunday's rest), so the week always contains exactly one rest.
  window.setWorkoutRestOverride=function(date,makeRest){
    var d=date instanceof Date?date:new Date(date),monday=mondayOf(d);
    var restDays=readRestDays(),current=validRestDay(monday,restDays[key(monday)])||new Date(monday.getFullYear(),monday.getMonth(),monday.getDate()+3,12);
    if(makeRest){
      restDays[key(monday)]=key(d);
    }else if(key(d)===key(current)){
      var moved=new Date(d);
      moved.setDate(moved.getDate()+(d.getDay()===0?-1:1));
      restDays[key(monday)]=key(moved);
    }
    saveRestDays(restDays);
  };
  window.getWorkoutVariantForDate=function(date){
    var entry=at(date);
    return entry.variant||window.getNextWorkoutScheduleEntry(date).variant||'a';
  };
})();