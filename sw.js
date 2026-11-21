const CACHE_NAME='forge-static-v18';
const CORE=[
 './','./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png',
 './app.css','./forge-redesign.css',
 './00-core.js','./01-navigation.js','./02-main-features.js','./03-body-tracking.js','./04-pwa-register.js',
 './05-food-scanner.js','./06-backup-restore.js','./07-workout-badges.js','./08-manual-week.js',
 './09-checkins.js','./10-today-workout.js','./11-rest-timer.js','./12-exercise-checklist.js',
 './13-personal-records.js','./14-toast.js','./15-session-notes.js','./16-short-workout-mode.js',
 './17-motivation.js','./18-month-calendar.js','./19-home-stats.js','./20-home-calendar.js',
 './21-workout-navigation.js','./22-youtube.js','./23-debounce.js','./24-weight-stepping.js',
 './25-audio-feedback.js','./26-wake-lock.js','./27-meal-rotation.js','./28-home-progress.js',
 './29-weight-trend.js','./30-workout-split.js','./31-forge-enhancements.js','./32-workout-schedule.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res;}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
  return;
 }
 event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req)));
});
