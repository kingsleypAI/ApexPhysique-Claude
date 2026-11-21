/* FORGE weekly-reset workout sequence.
   Push A starts each Monday. Thursday is the default rest day every week.
   Manual extra rests pause the session queue for the remainder of that week. */
(function(){
  'use strict';
  var KEY='forge_schedule_overrides_v2';
  var ANCHOR=new Date(2026,10,16,12,0,0,0); // Monday: Push A
  var SESSIONS=['pushA','pullA','legsA','pushB','pullB','legsB'];
  var BASE={0:'legsB',1:'pushA',2:'pullA',3:'legsA',4:'rest',5:'pushB',6:'pullB'};
  function key(d){return forgeLocalDateKey(d);}
  function readOverrides(){
    var saved=forgeSafeJSON(localStorage.getItem(KEY)||'{}',{});
    var legacy=forgeSafeJSON(localStorage.getItem('forge_day_override')||'{}',{});
    Object.keys(legacy).forEach(function(k){if(!saved[k]) saved[k]=legacy[k]==='rest'?'rest':'train';});
    return saved;
  }
  function details(id){
    if(id==='rest') return {id:'rest',type:'rest',variant:null};
    return {id:id,type:id.replace(/[AB]$/,'').toLowerCase(),variant:id.slice(-1).toLowerCase()};
  }
  function mondayOf(d){
    var m=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);
    m.setDate(m.getDate()-((m.getDay()+6)%7));
    return m;
  }
  function at(date){
    var d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
    if(d<ANCHOR) return details(BASE[d.getDay()]||'rest');
    var overrides=readOverrides(),monday=mondayOf(d),queue=SESSIONS.slice(),cursor=new Date(monday);
    while(cursor<=d){
      var choice=overrides[key(cursor)];
      var isThursday=cursor.getDay()===4;
      var next;
      if(isThursday && choice!=='train'){
        next='rest'; // Thursday is the recurring weekly recovery day.
      }else if(choice==='rest'){
        next='rest'; // An extra rest pauses, but does not consume, the next session.
      }else{
        next=queue.shift()||'rest';
      }
      if(cursor.getTime()===d.getTime()) return details(next);
      cursor.setDate(cursor.getDate()+1);
    }
    return details('rest');
  }
  window.getWorkoutScheduleEntry=function(date){return at(date instanceof Date?date:new Date(date));};
  window.getWorkoutForDate=function(date){return at(date instanceof Date?date:new Date(date)).type;};
  window.getNextWorkoutScheduleEntry=function(date){
    var d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
    for(var i=1;i<=14;i++){d.setDate(d.getDate()+1);var entry=at(d);if(entry.type!=='rest')return entry;}
    return details('pushA');
  };
  window.setWorkoutRestOverride=function(date,makeRest){
    var overrides=readOverrides();overrides[key(date)]=makeRest?'rest':'train';
    var today=new Date();today.setHours(0,0,0,0);
    Object.keys(overrides).forEach(function(k){
      var parsed=new Date(k+'T12:00:00');
      if(!Number.isFinite(parsed.getTime()) || parsed<ANCHOR || parsed-today>180*86400000) delete overrides[k];
    });
    localStorage.setItem(KEY,JSON.stringify(overrides));
  };
  window.getWorkoutVariantForDate=function(date){
    var entry=at(date);
    return entry.variant||window.getNextWorkoutScheduleEntry(date).variant||'a';
  };
})();