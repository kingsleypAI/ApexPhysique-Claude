// PWA SERVICE WORKER
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js', {scope: './'})
    .then(function(reg){
      // Force update check on every load
      reg.update();
    })
    .catch(function(err){ console.log('SW failed:', err); });
}
// Leave the browser's native install / Add to Home Screen experience enabled.
// Detect if running in standalone (installed PWA) mode
if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone){
  document.documentElement.setAttribute('data-pwa','true');
}


// App installed successfully;
