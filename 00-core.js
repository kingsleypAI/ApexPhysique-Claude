/* FORGE core helpers — deliberately global because the legacy app uses classic scripts. */
(function(){
  function pad(n){return String(n).padStart(2,'0');}
  window.forgeLocalDateKey=function(date){
    var d=date instanceof Date?date:new Date(date||Date.now());
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  };
  window.forgeParseLocalDate=function(value){
    if(typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value)){
      var p=value.split('-').map(Number); return new Date(p[0],p[1]-1,p[2],12,0,0,0);
    }
    return new Date(value);
  };
  window.forgeSafeJSON=function(value,fallback){try{return JSON.parse(value);}catch(e){return fallback;}};
})();
