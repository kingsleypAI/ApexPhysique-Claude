// ── EXERCISE PRs + SPARKLINES ────────────────────────────────────
function exKey2(name){ return name.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,''); }

function getAllExercisePRs(){
  var WL_KEY = 'forge_weights_v1';
  var log = typeof forgeSafeJSON==='function' ? forgeSafeJSON(localStorage.getItem(WL_KEY)||'{}',{}) : {};
  if(!log||typeof log!=='object'||Array.isArray(log))log={};
  // Read exercise names live from the DOM (.wname inside each .wcard) rather
  // than a hardcoded list — this was going stale every time an exercise was
  // swapped or renamed, since nothing kept it in sync with the actual cards.
  // Cardio and bodyweight-hold cards with no weight log simply won't have
  // any entries and are skipped below, same as before.
  var seen = {};
  var exercises = [];
  document.querySelectorAll('.wcard .wname').forEach(function(el){
    var name = el.textContent.trim();
    if(name && !seen[name]){ seen[name] = true; exercises.push(name); }
  });
  var prs = [];
  exercises.forEach(function(name){
    var key = exKey2(name);
    var entries = (Array.isArray(log[key])?log[key]:[]).filter(function(e){return e&&Number.isFinite(Number(e.kg))&&Number(e.kg)>0;}).slice().sort(function(a,b){return Number(a.ts||0)-Number(b.ts||0);});
    if(!entries.length) return;
    var pr = Math.max.apply(null, entries.map(function(e){return Number(e.kg);}));
    var last5 = entries.slice(-5).map(function(e){return Number(e.kg);});
    prs.push({name:name, pr:pr, last5:last5, count:entries.length});
  });
  return prs.sort(function(a,b){return b.pr-a.pr;});
}

function prEsc(value){return String(value==null?'':value).replace(/[&<>\"']/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='\"'?'&quot;':'&#39;';});}

function buildSparkline(vals, w, h){
  if(!vals||vals.length<2) return '';
  var min=Math.min.apply(null,vals);
  var max=Math.max.apply(null,vals);
  var range=max-min||1;
  var pts=vals.map(function(v,i){
    var x=Math.round((i/(vals.length-1))*w);
    var y=Math.round(h-((v-min)/range)*h);
    return x+','+y;
  });
  var trend = vals[vals.length-1] >= vals[0] ? 'var(--accent)' : '#aaaaaa';
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" style="display:block;">'
    +'<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+trend+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
    +'</svg>';
}

function renderExercisePRsGrid(){
  var grid = document.getElementById('exercisePRsGrid');
  if(!grid) return;
  var prs = getAllExercisePRs();
  if(!prs.length){
    grid.innerHTML = '<div style="font-size:12px;color:var(--grey);padding:8px 0;">Log weights in Workouts to see your PRs here.</div>';
    return;
  }
  grid.innerHTML = prs.map(function(p){
    var spark = buildSparkline(p.last5, 60, 24);
    var trend = p.last5.length>1 ? (p.last5[p.last5.length-1]>=p.last5[0]?'▲':'▼') : '';
    var tcolor = p.last5.length>1 ? (p.last5[p.last5.length-1]>=p.last5[0]?'var(--accent)':'#aaaaaa') : '';
    return '<div style="background:var(--surface);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:12px;">'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:12px;font-weight:700;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+prEsc(p.name)+'</div>'
      +'<div style="font-size:10px;color:var(--grey);margin-top:2px;">'+p.count+' log'+(p.count!==1?'s':'')+'</div>'
      +'</div>'
      +(spark?'<div style="flex-shrink:0;">'+spark+'</div>':'')
      +'<div style="text-align:right;flex-shrink:0;">'
      +'<div style="font-family:Space+Grotesk,sans-serif;font-size:16px;font-weight:800;color:var(--white);">'+p.pr+'<span style="font-size:10px;color:var(--grey);">kg</span></div>'
      +(trend?'<div style="font-size:10px;font-weight:700;color:'+tcolor+';">'+trend+' PR</div>':'')
      +'</div>'
      +'</div>';
  }).join('');
}

function renderHomePRs(){
  var card = document.getElementById('homePRsCard');
  if(!card) return;
  var prs = getAllExercisePRs();
  if(!prs.length){
    card.innerHTML = '<div style="font-size:11px;color:var(--grey);">Log weights in Workouts to see your PRs here.</div>';
    return;
  }
  // Show top 6 PRs in 2-col grid
  var top = prs.slice(0,6);
  card.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'
    + top.map(function(p){
      var spark = buildSparkline(p.last5, 50, 20);
      return '<div style="background:var(--surface);border-radius:7px;padding:9px 10px;">'
        +'<div style="font-size:10px;color:var(--grey);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;">'+prEsc(p.name)+'</div>'
        +'<div style="display:flex;align-items:center;justify-content:space-between;">'
        +'<div style="font-family:Space+Grotesk,sans-serif;font-size:18px;font-weight:800;color:var(--white);">'+p.pr+'<span style="font-size:9px;color:var(--grey);">kg</span></div>'
        +(spark?'<div>'+spark+'</div>':'')
        +'</div>'
        +'</div>';
    }).join('')
    +'</div>'
    +(prs.length>6?'<div style="font-size:10px;color:var(--grey);text-align:center;margin-top:8px;">+' + (prs.length-6) + ' more in Progress tab</div>':'');
}

// Hook into logExerciseWeight to refresh PRs
var _origLogExWeight = typeof logExerciseWeight === 'function' ? logExerciseWeight : null;
document.addEventListener('weightLogged', function(){
  try{ renderExercisePRsGrid(); }catch(e){}
  try{ renderHomePRs(); }catch(e){}
});
