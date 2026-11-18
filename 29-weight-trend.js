function renderWeightTrend(){
  try{
    var history = typeof getCheckinHistory==='function' ? getCheckinHistory() : [];
    var svg = document.getElementById('trendSparkline');
    var summary = document.getElementById('trendSummary');
    if(!svg || !summary) return;
    if(history.length < 2) {
      svg.innerHTML = '';
      summary.textContent = history.length ? 'Log more check-ins to see trend' : '';
      summary.style.color = 'var(--accent-text)';
      return;
    }
    // history[0] is newest, so reverse for chronological order
    var chrono = history.slice().reverse();
    var weights = chrono.map(function(h){ return Number(h.weight); }).filter(function(w){ return Number.isFinite(w) && w > 0; });
    if(weights.length < 2){
      svg.innerHTML = '';
      summary.textContent = 'Log more check-ins to see trend';
      summary.style.color = 'var(--accent-text)';
      return;
    }

    var minW = Math.min.apply(null, weights);
    var maxW = Math.max.apply(null, weights);
    var range = (maxW - minW) || 1;
    var w = 300, h = 40, pad = 4;

    var points = weights.map(function(wt, i){
      var x = pad + (i / (weights.length-1)) * (w - pad*2);
      var y = h - pad - ((wt - minW) / range) * (h - pad*2);
      return x + ',' + y;
    });

    var first = weights[0];
    var last = weights[weights.length-1];
    var diff = (last - first).toFixed(1);
    var diffLabel = diff < 0 ? diff + 'kg' : '+' + diff + 'kg';
    var color = diff < 0 ? '#4caf7d' : (diff > 0 ? 'var(--accent)' : 'var(--grey)');

    summary.textContent = diffLabel + ' over ' + weights.length + ' check-ins';
    summary.style.color = color;

    svg.innerHTML = '<polyline points="' + points.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      points.map(function(p, i){
        var isLast = i === points.length-1;
        var coords = p.split(',');
        return '<circle cx="'+coords[0]+'" cy="'+coords[1]+'" r="'+(isLast?4:2.5)+'" fill="'+color+'"/>';
      }).join('');
  }catch(e){}
}
