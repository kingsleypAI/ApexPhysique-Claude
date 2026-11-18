// ── MOTIVATION & ILLNESS SYSTEM ──────────────────────────────────
var MOTIV_KEY = 'apx_motiv_v1';

var MOTIV_CONTENT = {
  normal: '<div style="font-size:12px;color:var(--mid);">You\'re feeling good. Keep going — you\'re 13.3kg down and building the Tom Hardy physique. Stay consistent.</div>',

  low: '<div style="display:flex;flex-direction:column;gap:10px;">'
    + '<div style="font-size:13px;font-weight:700;color:var(--white);margin-bottom:4px;">Motivation is temporary. Results are permanent.</div>'
    + '<div style="font-size:12px;color:var(--mid);line-height:1.7;">You\'ve lost 13.3kg. Sub-100kg. Sub-20% BF. Shoulders wider. People are noticing. <strong style="color:var(--white);">That didn\'t happen by accident — it happened because you showed up.</strong></div>'
    + '<div style="background:var(--surface);border-radius:8px;padding:10px 12px;">'
    + '<div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--accent-text);margin-bottom:6px;">When motivation is low — do this</div>'
    + '<div style="display:flex;flex-direction:column;gap:6px;">'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:var(--accent-text);">①</span><span><strong style="color:var(--white);">Just get there.</strong> Don\'t plan a session. Just walk to the gym. The hardest part is leaving.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:var(--accent-text);">②</span><span><strong style="color:var(--white);">Use ⚡ 30-Min mode.</strong> 3 supersets, done. You will always feel better after than before.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:var(--accent-text);">③</span><span><strong style="color:var(--white);">Look at your progress.</strong> 110kg → 98.7kg. That\'s real. The person who started this programme earned every kg.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:var(--accent-text);">④</span><span><strong style="color:var(--white);">Week 7 is the hardest.</strong> This is exactly when most people quit. The ones who don\'t are the ones who look completely different in 12 weeks.</span></div>'
    + '</div></div>'
    + '<div style="background:rgba(200,16,46,0.06);border-left:3px solid var(--accent);padding:10px 12px;border-radius:0 6px 6px 0;">'
    + '<div style="font-size:11px;color:var(--mid);line-height:1.6;"><strong style="color:var(--white);">Remember why you started.</strong> You wanted to look like Tom Hardy in Warrior. You wanted to be lean. You wanted to feel strong. None of that changed — only your energy today did.</div>'
    + '</div></div>',

  ill: '<div style="display:flex;flex-direction:column;gap:10px;">'
    + '<div style="font-size:13px;font-weight:700;color:var(--white);margin-bottom:4px;">Rest. Recover. Come back stronger.</div>'
    + '<div style="font-size:12px;color:var(--mid);line-height:1.7;">Training while ill is counterproductive — your immune system needs the resources your muscles would use. <strong style="color:var(--white);">One week off will not undo 7 weeks of work.</strong> Your muscle memory is permanent.</div>'
    + '<div style="background:var(--surface);border-radius:8px;padding:10px 12px;">'
    + '<div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#aaaaaa;margin-bottom:6px;">What to do while ill</div>'
    + '<div style="display:flex;flex-direction:column;gap:6px;">'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:#aaaaaa;">①</span><span><strong style="color:var(--white);">Keep protein high.</strong> 200g+ protein prevents muscle loss even without training. Shakes count.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:#aaaaaa;">②</span><span><strong style="color:var(--white);">Sleep as much as possible.</strong> GH peaks during deep sleep. This is passive recovery and passive fat loss.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:#aaaaaa;">③</span><span><strong style="color:var(--white);">Stay hydrated.</strong> 11 glasses minimum. Dehydration makes illness worse and slows recovery.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:#aaaaaa;">④</span><span><strong style="color:var(--white);">Take your supplements.</strong> Vitamin D3 and Omega 3 both support immune function. Magnesium helps sleep quality.</span></div>'
    + '<div style="font-size:12px;color:var(--mid);display:flex;gap:8px;"><span style="color:#aaaaaa;">⑤</span><span><strong style="color:var(--white);">Light walk only if symptom-free below the neck.</strong> Runny nose = fine to walk. Chest/fever = complete rest.</span></div>'
    + '</div></div>'
    + '<div style="background:rgba(200,16,46,0.06);border-left:3px solid #aaaaaa;padding:10px 12px;border-radius:0 6px 6px 0;">'
    + '<div style="font-size:11px;color:var(--mid);line-height:1.6;"><strong style="color:var(--white);">Your last rest week you still lost 1.5kg</strong> and came back gaining 0.8kg of lean mass. Rest works. Trust it.</div>'
    + '</div></div>'
};

function setMotivationMode(mode){
  localStorage.setItem(MOTIV_KEY, mode);
  renderMotivationCard(mode);
  // Update button styles
  ['low','ill','normal'].forEach(function(m){
    var btn = document.getElementById('btnMotiv' + m.charAt(0).toUpperCase() + m.slice(1));
    if(!btn) return;
    var active = m === mode;
    var colors = {low:'var(--accent)', ill:'#aaaaaa', normal:'#9a9a9a'};
    btn.style.background = active ? 'rgba(255,255,255,0.15)' : 'var(--surface)';
    btn.style.borderColor = active ? colors[m] : 'var(--border)';
    btn.style.color       = active ? colors[m] : 'var(--mid)';
  });
}

function renderMotivationCard(mode){
  var el = document.getElementById('motivationContent');
  if(!el) return;
  el.innerHTML = MOTIV_CONTENT[mode] || MOTIV_CONTENT['normal'];
}

function initMotivation(){
  var saved = localStorage.getItem(MOTIV_KEY) || 'low';
  setMotivationMode(saved);
}
