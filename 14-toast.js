function showToast(msg, duration){
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:30px;font-size:13px;font-weight:600;z-index:9999;border:1px solid var(--accent);box-shadow:0 4px 20px rgba(0,0,0,0.5);white-space:nowrap;transition:opacity 0.3s;pointer-events:none;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){
    t.style.opacity='0';
    setTimeout(function(){t.remove();},300);
  }, duration||2500);
}
