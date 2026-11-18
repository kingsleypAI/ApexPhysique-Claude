function playBeep(){
  try{
    var ctx = new (window.AudioContext||window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.4);
    osc.start(); osc.stop(ctx.currentTime+0.4);
    setTimeout(function(){
      var osc2=ctx.createOscillator(), gain2=ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.frequency.value=1046; osc2.type='sine';
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.4);
      osc2.start(); osc2.stop(ctx.currentTime+0.4);
    }, 200);
  }catch(e){}
}
