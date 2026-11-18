// ── A/B DAY SPLIT — reduces volume per session for recovery on a cut ──
// Mon=Push A, Tue=Pull A, Wed=Legs A, Thu=Rest, Fri=Push B, Sat=Pull B, Sun=Legs B
function getABVariant(){
  var day = new Date().getDay(); // 0=Sun..6=Sat
  if(day === 1 || day === 2 || day === 3) return 'a';
  if(day === 5 || day === 6 || day === 0) return 'b';
  return 'a'; // Thursday rest day fallback, doesn't matter
}

function applyABVariant(){
  try{
    var variant = getABVariant();
    document.querySelectorAll('.wcard[data-variant]').forEach(function(card){
      var cardVariant = card.getAttribute('data-variant');
      if(cardVariant === 'both' || cardVariant === variant){
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }catch(e){}
}
