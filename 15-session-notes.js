// ── SESSION NOTES ─────────────────────────────────────────────────
var NOTE_KEY = 'apx_notes_v1';

function saveSessionNote(day, text){
  var notes = JSON.parse(localStorage.getItem(NOTE_KEY)||'{}');
  var today = forgeLocalDateKey(new Date());
  if(!notes[today]) notes[today] = {};
  notes[today][day] = text;
  localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  var status = document.getElementById('note-status-'+day);
  if(status){ status.textContent = 'Saved ' + new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); }
}

function loadSessionNotes(){
  var notes = JSON.parse(localStorage.getItem(NOTE_KEY)||'{}');
  var today = forgeLocalDateKey(new Date());
  var todayNotes = notes[today] || {};
  ['push','pull','legs'].forEach(function(day){
    var el = document.getElementById('note-'+day);
    if(el && todayNotes[day]) el.value = todayNotes[day];
  });
}
