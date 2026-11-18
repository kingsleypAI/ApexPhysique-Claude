// ── DEBOUNCE HELPER ───────────────────────────────────────────────
var _debounceTimers = {};
function debounce(key, fn, delay){
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(fn, delay || 300);
}
