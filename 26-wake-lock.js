var _wakeLock = null;
async function requestWakeLock(){
  try{
    if('wakeLock' in navigator){
      _wakeLock = await navigator.wakeLock.request('screen');
    }
  }catch(e){}
}
function releaseWakeLock(){
  try{ if(_wakeLock){ _wakeLock.release(); _wakeLock = null; } }catch(e){}
}
// Wake lock is auto-released by the browser when the tab is hidden —
// re-acquire it on return if the rest timer is still running
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState === 'visible' && typeof _mRun !== 'undefined' && _mRun){
    requestWakeLock();
  }
});
