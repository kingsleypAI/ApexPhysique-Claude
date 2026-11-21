/* FORGE dynamic workout sequence.
   The six-session A/B rotation is continuous; rest days pause the queue.
   Baseline anchor preserves the existing Mon–Sun plan from 16 Nov 2026. */
(function(){
  'use strict';
  var KEY='forge_schedule_overrides_v2';
  var ANCHOR=new Date(2026,10,16,12,0,0,0); // Monday: Push A
  var CYCLE=['pushA','pullA','legsA','rest','pushB','pullB','legsB'];
  var BASE={0:'legsB',1:'pushA',2:'pullA',3:'legsA',4:'rest',5:'pushB',6:'pullB'};
  function key(d){return forgeLocalDateKey(d);}
  function readOverrides(){
    var saved=forgeSafeJSON(localStorage.getItem(KEY)||'{}',{});
    // Preserve any one-off choices made by the previous scheduler.
    var legacy=forgeSafeJSON(localStorage.getItem('forge_day_override')||'{}',{});
    Object.keys(legacy).forEach(function(k){
      if(!saved[k]) saved[k]=legacy[k]==='rest'?'rest':'train';
    });
    return saved;
  }
  function details(id){
    if(id==='rest') return {id:'rest',type:'rest',variant:null};
    var type=id.replace(/[AB]$/,'').toLowerCase();
    return {id:id,type:type,variant:id.slice(-1).toLowerCase()};
  }
  function at(date){
    var d=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
    if(d<ANCHOR) return details(BASE[d.getDay()]||'rest');
    var overrides=readOverrides(),queue=CYCLE.slice(),cursor=new Date(ANCHOR);
    while(cursor<=d){
      var choice=overrides[key(cursor)];
      var next=queue[0];
      if(choice==='rest'){
        next='rest';
        if(queue[0]==='rest') queue.shift(); // Keep the planned rest; only pause when replacing a workout.
      }else{
        if(next==='rest' && choice==='train'){
          queue.shift();
          queue.push('rest'); // Move the planned recovery slot after the remaining sessions.
          next=queue[0];
        }
        queue.shift();
      }
      if(cursor.getTime()===d.getTime()) return details(next);
      if(!queue.length) queue=CYCLE.slice();
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
    var overrides=readOverrides();
    overrides[key(date)]=makeRest?'rest':'train';
    // Keep history for auditability, but cap future manual edits to 180 days.
    var today=new Date();today.setHours(0,0,0,0);
    Object.keys(overrides).forEach(function(k){
      var parsed=new Date(k+'T12:00:00');
      if(!Number.isFinite(parsed.getTime()) || parsed<ANCHOR || parsed-today>180*86400000) delete overrides[k];
    });
    localStorage.setItem(KEY,JSON.stringify(overrides));
  };
  window.getWorkoutVariantForDate=function(date){
    var entry=at(date);
    if(entry.variant) return entry.variant;
    return window.getNextWorkoutScheduleEntry(date).variant||'a';
  };
})();