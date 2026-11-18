function stepWeight(inputId, delta){
  var inp = document.getElementById(inputId);
  if(!inp) return;
  var cur = parseFloat(inp.value) || 0;
  var next = Math.max(0, cur + delta);
  inp.value = (next % 1 === 0) ? next.toFixed(0) : next.toFixed(1);
}
