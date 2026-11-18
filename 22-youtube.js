function openYT(vid_id){
  var appUrl = 'vnd.youtube://shorts/' + vid_id;
  var webUrl = 'https://www.youtube.com/shorts/' + vid_id;
  var start = Date.now();
  setTimeout(function(){
    if(Date.now() - start < 1500) window.open(webUrl, '_blank');
  }, 800);
  try { window.location = appUrl; } catch(e) { window.open(webUrl,'_blank'); }
}
