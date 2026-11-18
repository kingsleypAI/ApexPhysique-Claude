// ── 30-MINUTE MODE ────────────────────────────────────────────────
var _30minMode = false;

function toggle30MinMode(){
  _30minMode = !_30minMode;
  localStorage.setItem('apx_30min', _30minMode ? '1' : '0');
  var btn   = document.getElementById('btn30Min');
  var banner= document.getElementById('thirtyMinBanner');
  if(btn){
    btn.style.background = _30minMode ? 'var(--accent)' : 'var(--surface)';
    btn.style.color      = _30minMode ? '#fff' : 'var(--mid)';
    btn.style.border     = _30minMode ? 'none' : '1px solid var(--border)';
  }
  if(banner) banner.style.display = _30minMode ? 'block' : 'none';

  // Show/hide 30-min tips in exercise cards
  document.querySelectorAll('.wcard .wtip span[style*="color:var(--accent-text)"]').forEach(function(s){
    s.style.display = _30minMode ? 'block' : 'none';
  });

  // Update mini timer presets for 30-min mode (shorter rests)
  if(_30minMode){
    showToast('⚡ 30-min mode on — 60s rest, supersets, 3 sets each', 3000);
  } else {
    showToast('Full programme mode restored', 2500);
  }
}

function init30MinMode(){
  // Restore the saved preference directly. Do not call the toggle handler here:
  // it writes to storage and shows user-facing feedback intended for clicks.
  _30minMode = localStorage.getItem('apx_30min') === '1';
  var btn = document.getElementById('btn30Min');
  var banner = document.getElementById('thirtyMinBanner');
  if(btn){
    btn.style.background = _30minMode ? 'var(--accent)' : 'var(--surface)';
    btn.style.color = _30minMode ? '#fff' : 'var(--mid)';
    btn.style.border = _30minMode ? 'none' : '1px solid var(--border)';
  }
  if(banner) banner.style.display = _30minMode ? 'block' : 'none';
  document.querySelectorAll('.wcard .wtip span[style*="color:var(--accent-text)"]').forEach(function(s){
    s.style.display = _30minMode ? 'block' : 'none';
  });
}
