// ── TRACKING ──────────────────────────────────────────────────────────────────
const TRK_KEY = 'apx_tracking_v1';
let trkData = JSON.parse(localStorage.getItem(TRK_KEY) || '{"weights":{},"lifts":{},"measurements":{},"notes":{}}');

const LIFT_KEYS = ['bench','squat','row','pullup','ohp'];
let activeLift = 'bench';

function saveTrk(){ localStorage.setItem(TRK_KEY, JSON.stringify(trkData)); }

// Populate week selectors 1-12
function populateWeekSelects(){
  const ids = ['weightWeek','liftWeek','measWeek','noteWeek'];
  ids.forEach(id => {
    const sel = document.getElementById(id);
    if(!sel) return;
    const cur = getCurrentWeek();
    sel.innerHTML = '';
    for(let w=1;w<=16;w++){
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = 'Week ' + w + (w===cur?' (current)':'');
      if(w===cur) opt.selected = true;
      sel.appendChild(opt);
    }
  });
}

// ── WEIGHT ────────────────────────────────────────────────────────────────────
function logWeight(){
  const val = parseFloat(document.getElementById('weightInput').value);
  const week = parseInt(document.getElementById('weightWeek').value);
  if(!val || val < 40 || val > 300){ alert('Please enter a valid weight (40–300kg)'); return; }
  if(!week){ alert('Please select a week'); return; }
  trkData.weights[week] = val;
  saveTrk();
  document.getElementById('weightInput').value = '';
  renderWeightChart();
  renderWeightHistory();
  renderSummary();
  checkPhotoReminder();
}



function renderWeightChart(){
  const svg = document.getElementById('weightChart');
  const empty = document.getElementById('weightChartEmpty');
  const entries = Object.entries(trkData.weights).map(([w,v])=>({w:+w,v:+v})).sort((a,b)=>a.w-b.w);
  if(entries.length < 1){ svg.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  const W=320, H=140, pad={t:10,r:16,b:24,l:36};
  const iW=W-pad.l-pad.r, iH=H-pad.t-pad.b;
  const vals = entries.map(e=>e.v);
  const minV = Math.min(...vals)-2, maxV = Math.max(...vals)+2;
  const xS = w => pad.l + ((w-1)/(16-1||1))*iW;
  const yS = v => pad.t + iH - ((v-minV)/(maxV-minV||1))*iH;

  let out = `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  // Grid lines
  for(let i=0;i<=4;i++){
    const y = pad.t + (iH/4)*i;
    const val = maxV - ((maxV-minV)/4)*i;
    out += `<line x1="${pad.l}" y1="${y}" x2="${W-pad.r}" y2="${y}" stroke="#252525" stroke-width="1"/>`;
    out += `<text x="${pad.l-4}" y="${y+4}" text-anchor="end" fill="#6e6e6e" font-size="9">${val.toFixed(0)}</text>`;
  }
  // Week markers
  [1,4,8,12,16].forEach(w=>{
    const x=xS(w);
    out+=`<text x="${x}" y="${H-4}" text-anchor="middle" fill="#6e6e6e" font-size="9">W${w}</text>`;
  });
  // Trend line (simple moving average)
  if(entries.length >= 2){
    let tPts = entries.map(e=>`${xS(e.w)},${yS(e.v)}`).join(' ');
    out += `<polyline points="${tPts}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-dasharray="4,3"/>`;
  }
  // Actual line
  if(entries.length >= 2){
    let pts = entries.map(e=>`${xS(e.w)},${yS(e.v)}`).join(' ');
    out += `<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
  }
  // Dots
  entries.forEach(e=>{
    out += `<circle cx="${xS(e.w)}" cy="${yS(e.v)}" r="4" fill="var(--accent)" stroke="#0a0a0a" stroke-width="2"/>`;
    out += `<text x="${xS(e.w)}" y="${yS(e.v)-8}" text-anchor="middle" fill="#f2efe8" font-size="9">${e.v}</text>`;
  });
  out += '</svg>';
  svg.outerHTML = out;
}

function renderWeightHistory(){
  const wrap = document.getElementById('weightHistoryWrap');
  const tbody = document.getElementById('weightHistoryBody');
  if(!wrap||!tbody) return;
  const entries = Object.entries(trkData.weights).map(([w,v])=>({w:+w,v:+v})).sort((a,b)=>b.w-a.w);
  if(entries.length===0){ wrap.style.display='none'; return; }
  wrap.style.display='block';
  tbody.innerHTML='';
  entries.forEach((e,i)=>{
    const prev = entries[i+1];
    let changeHtml='<span class="change-same">—</span>';
    if(prev){
      const diff=(e.v-prev.v).toFixed(1);
      const cls=diff<0?'change-up':diff>0?'change-down':'change-same';
      const sign=diff>0?'+':'';
      changeHtml=`<span class="${cls}">${sign}${diff}kg</span>`;
    }
    tbody.innerHTML+=`<tr>
      <td>Week ${e.w}</td>
      <td>${e.v}kg</td>
      <td>${changeHtml}</td>
      <td><button class="delete-row-btn" onclick="deleteWeight(${e.w})">✕</button></td>
    </tr>`;
  });
}

function deleteWeight(week){
  delete trkData.weights[week];
  saveTrk(); renderWeightChart(); renderWeightHistory(); renderSummary();
}

function renderSummary(){
  const entries = Object.entries(trkData.weights).map(([w,v])=>({w:+w,v:+v})).sort((a,b)=>a.w-b.w);
  const sw = document.getElementById('trk-start-weight');
  const cw = document.getElementById('trk-current-weight');
  const ch = document.getElementById('trk-weight-change');
  if(entries.length===0){
    if(sw) sw.textContent='—'; if(cw) cw.textContent='—'; if(ch){ch.textContent='—';ch.className='summary-num';}
    return;
  }
  const first=entries[0].v, last=entries[entries.length-1].v;
  const diff=(last-first).toFixed(1);
  if(sw) sw.textContent=first+'kg';
  if(cw) cw.textContent=last+'kg';
  if(ch){
    const sign=diff>0?'+':'';
    ch.textContent=sign+diff+'kg';
    ch.className='summary-num '+(diff<0?'pos':diff>0?'neg':'');
  }
}

// ── LIFTS ─────────────────────────────────────────────────────────────────────
function logLifts(){
  const week = parseInt(document.getElementById('liftWeek').value);
  if(!week) return;
  if(!trkData.lifts[week]) trkData.lifts[week]={};
  let saved=false;
  LIFT_KEYS.forEach(k=>{
    const inp=document.getElementById('lift-'+k);
    if(inp&&inp.value!==''){
      trkData.lifts[week][k]=parseFloat(inp.value);
      saved=true;
    }
  });
  if(!saved){ alert('Enter at least one lift weight'); return; }
  saveTrk();
  LIFT_KEYS.forEach(k=>{
    const inp=document.getElementById('lift-'+k);
    if(inp) inp.value='';
  });
  renderLiftChart();
  renderPRs();
}

function renderPRs(){
  LIFT_KEYS.forEach(k=>{
    const prEl=document.getElementById('pr-'+k);
    if(!prEl) return;
    let maxVal=0;
    Object.values(trkData.lifts).forEach(entry=>{
      if(entry[k]&&entry[k]>maxVal) maxVal=entry[k];
    });
    prEl.textContent=maxVal>0?'PR: '+maxVal+'kg':'';
  });
}

function setActiveLift(lift){
  activeLift=lift;
  document.querySelectorAll('.lift-toggle-btn').forEach(b=>{
    b.classList.toggle('active-lift', b.getAttribute('data-lift')===lift);
  });
  renderLiftChart();
}

function renderLiftChart(){
  const svgId='liftChart', emptyId='liftChartEmpty';
  const svgEl=document.getElementById(svgId);
  const emptyEl=document.getElementById(emptyId);
  if(!svgEl||!emptyEl) return;

  const entries=[];
  for(let w=1;w<=16;w++){
    if(trkData.lifts[w]&&trkData.lifts[w][activeLift]!=null){
      entries.push({w,v:trkData.lifts[w][activeLift]});
    }
  }
  if(entries.length<1){ svgEl.innerHTML=''; emptyEl.style.display='block'; return; }
  emptyEl.style.display='none';

  const W=320,H=140,pad={t:10,r:16,b:24,l:36};
  const iW=W-pad.l-pad.r,iH=H-pad.t-pad.b;
  const vals=entries.map(e=>e.v);
  const minV=Math.max(0,Math.min(...vals)-10),maxV=Math.max(...vals)+10;
  const xS=w=>pad.l+((w-1)/(16-1||1))*iW;
  const yS=v=>pad.t+iH-((v-minV)/(maxV-minV||1))*iH;

  let out=`<svg class="chart-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  for(let i=0;i<=4;i++){
    const y=pad.t+(iH/4)*i;
    const val=maxV-((maxV-minV)/4)*i;
    out+=`<line x1="${pad.l}" y1="${y}" x2="${W-pad.r}" y2="${y}" stroke="#252525" stroke-width="1"/>`;
    out+=`<text x="${pad.l-4}" y="${y+4}" text-anchor="end" fill="#6e6e6e" font-size="9">${val.toFixed(0)}</text>`;
  }
  [1,4,8,12,16].forEach(w=>{
    out+=`<text x="${xS(w)}" y="${H-4}" text-anchor="middle" fill="#6e6e6e" font-size="9">W${w}</text>`;
  });
  if(entries.length>=2){
    const pts=entries.map(e=>`${xS(e.w)},${yS(e.v)}`).join(' ');
    out+=`<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`;
  }
  entries.forEach(e=>{
    out+=`<circle cx="${xS(e.w)}" cy="${yS(e.v)}" r="4" fill="var(--accent)" stroke="#0a0a0a" stroke-width="2"/>`;
    out+=`<text x="${xS(e.w)}" y="${yS(e.v)-8}" text-anchor="middle" fill="#f2efe8" font-size="9">${e.v}</text>`;
  });
  out+='</svg>';
  svgEl.outerHTML=out;
}

// ── MEASUREMENTS ──────────────────────────────────────────────────────────────
function logMeasurements(){
  const week=parseInt(document.getElementById('measWeek').value);
  if(!week) return;
  if(!trkData.measurements[week]) trkData.measurements[week]={};
  const fields=['waist','chest','shoulders','arm','thigh','neck'];
  let saved=false;
  fields.forEach(f=>{
    const inp=document.getElementById('meas-'+f);
    if(inp&&inp.value!==''){
      trkData.measurements[week][f]=parseFloat(inp.value);
      saved=true;
    }
  });
  if(!saved){ alert('Enter at least one measurement'); return; }
  saveTrk();
  fields.forEach(f=>{const inp=document.getElementById('meas-'+f);if(inp)inp.value='';});
  renderMeasHistory();
}

function renderMeasHistory(){
  const wrap=document.getElementById('measHistoryWrap');
  const tbody=document.getElementById('measHistoryBody');
  if(!wrap||!tbody) return;
  const entries=Object.entries(trkData.measurements).map(([w,v])=>({w:+w,...v})).sort((a,b)=>b.w-a.w);
  if(entries.length===0){ wrap.style.display='none'; return; }
  wrap.style.display='block';
  tbody.innerHTML='';
  entries.forEach((e,i)=>{
    const prev=entries[i+1];
    let waistChange='';
    if(prev&&prev.waist&&e.waist){
      const d=(e.waist-prev.waist).toFixed(1);
      const cls=d<0?'change-up':d>0?'change-down':'change-same';
      waistChange=` <span class="${cls}">(${d>0?'+':''}${d})</span>`;
    }
    tbody.innerHTML+=`<tr>
      <td>Week ${e.w}</td>
      <td>${e.waist||'—'}${waistChange}</td>
      <td>${e.chest||'—'}</td>
      <td>${e.shoulders||'—'}</td>
      <td><button class="delete-row-btn" onclick="deleteMeas(${e.w})">✕</button></td>
    </tr>`;
  });
}
function deleteMeas(week){ delete trkData.measurements[week]; saveTrk(); renderMeasHistory(); }

// ── NOTES ────────────────────────────────────────────────────────────────────
function logNote(){
  const week=parseInt(document.getElementById('noteWeek').value);
  const text=document.getElementById('noteInput').value.trim();
  if(!text){ alert('Write something first'); return; }
  trkData.notes[week]=text;
  saveTrk();
  document.getElementById('noteInput').value='';
  renderNote(week);
}

function renderNote(week){
  const display=document.getElementById('noteDisplay');
  if(!display) return;
  const note=trkData.notes[week||getCurrentWeek()];
  if(note){ display.style.display='block'; display.textContent=note; }
  else { display.style.display='none'; }
}

// ── PHOTO REMINDER ────────────────────────────────────────────────────────────
function checkPhotoReminder(){
  const week=getCurrentWeek();
  const el=document.getElementById('photoReminder');
  if(!el) return;
  // Show on weeks 1, 4, 8, 12
  el.style.display=[1,4,8,12].includes(week)?'flex':'none';
}

// ── INIT TRACKING ─────────────────────────────────────────────────────────────
function initTracking(){
  populateWeekSelects();
  renderWeightChart();
  renderWeightHistory();
  renderSummary();
  renderLiftChart();
  renderPRs();
  renderMeasHistory();
  renderNote(getCurrentWeek());
  checkPhotoReminder();
  // Sync start/current weight from real check-in history if available
  try{
    var history = typeof getCheckinHistory==='function' ? getCheckinHistory() : [];
    if(history.length){
      var latest = history[0];
      var earliest = history[history.length-1];
      var startEl = document.getElementById('trk-start-weight');
      var curEl = document.getElementById('trk-current-weight');
      if(startEl && earliest && earliest.weight) startEl.textContent = earliest.weight;
      if(curEl && latest && latest.weight) curEl.textContent = latest.weight;
    }
  }catch(e){}
}
