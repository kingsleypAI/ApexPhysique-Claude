// ── A/B DAY SPLIT — follows the shared dynamic workout sequence ──
function getABVariant(){
  return getWorkoutVariantForDate(new Date());
}

function applyABVariant(){
  try{
    var variant = getABVariant();
    document.querySelectorAll('.wcard[data-variant]').forEach(function(card){
      var cardVariant = card.getAttribute('data-variant');
      card.style.display = (cardVariant === 'both' || cardVariant === variant) ? '' : 'none';
    });
  }catch(e){}
}
