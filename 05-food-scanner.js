// ══ OPEN FOOD FACTS + CAMERA BARCODE SCANNER ═════════════════════
var _offStream = null;
var _offScanInterval = null;

// Treat product-database text as untrusted before placing it in HTML.
function offEsc(value){return String(value==null?'':value).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c];});}

async function offSearch(){
  var q=(document.getElementById('offSearchInput')||{}).value;
  if(!q||!q.trim())return;
  q=q.trim();
  var el=document.getElementById('offResults');
  el.innerHTML='<div style="font-size:12px;color:var(--grey);padding:8px 0;">Searching…</div>';
  try{
    var r=await fetch('https://world.openfoodfacts.org/cgi/search.pl?search_terms='+encodeURIComponent(q)+'&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments');
    var d=await r.json();
    var prods=(d.products||[]).filter(function(p){var n=p.nutriments||{};return p.product_name&&Number.isFinite(Number(n['energy-kcal_100g']!=null?n['energy-kcal_100g']:n['energy-kj_100g']));});
    if(!prods.length){el.innerHTML='<div style="font-size:12px;color:var(--grey);padding:8px 0;">No results. Try different search or log manually.</div>';return;}
    window._offProds=prods;
    offRenderResults(prods);
  }catch(e){el.innerHTML='<div style="font-size:12px;color:var(--accent-text);padding:8px 0;">Search failed. Check connection.</div>';}
}

// ── Camera barcode scanner ────────────────────────────────────────
async function offStartScan(){
  var wrap=document.getElementById('offScannerWrap');
  var status=document.getElementById('offScanStatus');

  // Check BarcodeDetector support
  if(!('BarcodeDetector' in window)){
    // Fallback: show manual input
    document.getElementById('offBarcodeWrap').style.display='block';
    return;
  }

  // Request camera
  try{
    _offStream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}
    });
  }catch(e){
    // Camera denied or unavailable — fallback to manual
    document.getElementById('offBarcodeWrap').style.display='block';
    return;
  }

  var video=document.getElementById('offScanVideo');
  video.srcObject=_offStream;
  await video.play();
  wrap.style.display='block';
  status.textContent='Scanning — hold steady over a barcode';

  // Create detector
  var detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code']});

  _offScanInterval=setInterval(async function(){
    if(video.readyState<video.HAVE_ENOUGH_DATA)return;
    try{
      var codes=await detector.detect(video);
      if(codes&&codes.length>0){
        var code=codes[0].rawValue;
        clearInterval(_offScanInterval);
        _offScanInterval=null;
        status.textContent='✓ Barcode detected: '+code;
        setTimeout(function(){offStopScan();},600);
        offFetchBarcode(code);
      }
    }catch(e){}
  },300);
}

function offStopScan(){
  if(_offScanInterval){clearInterval(_offScanInterval);_offScanInterval=null;}
  if(_offStream){_offStream.getTracks().forEach(function(t){t.stop();});_offStream=null;}
  var video=document.getElementById('offScanVideo');
  if(video){video.srcObject=null;}
  var wrap=document.getElementById('offScannerWrap');
  if(wrap)wrap.style.display='none';
}

async function offFetchBarcode(code){
  var el=document.getElementById('offResults');
  el.innerHTML='<div style="font-size:12px;color:var(--grey);padding:8px 0;">Looking up…</div>';
  try{
    var r=await fetch('https://world.openfoodfacts.org/api/v0/product/'+code+'.json?fields=product_name,brands,nutriments,serving_size,product_quantity,quantity');
    var d=await r.json();
    if(d.status!==1||!d.product||!d.product.nutriments){
      el.innerHTML='<div style="font-size:12px;color:var(--grey);padding:8px 0;">Product not found. Try searching by name.</div>';
      return;
    }
    var p=d.product;
    var nm=(p.product_name||'Unknown').substring(0,50);\n    var safeNm=offEsc(nm);
    var br=p.brands?(p.brands.split(',')[0]).trim():'';\n    var safeBr=offEsc(br);
    var nut=p.nutriments;

    // Work out the full product amount in grams/ml
    // OFF stores quantity e.g. "500 ml", "330ml", "200g", "4x25g"
    var fullGrams=100;
    var qty=p.product_quantity||p.quantity||p.serving_size||'';
    var qmatch=String(qty).match(/(\d+(?:\.\d+)?)\s*(?:ml|g|cl|l)/i);
    if(qmatch){
      var qval=parseFloat(qmatch[1]);
      var qunit=qmatch[0].replace(/[\d.\s]/g,'').toLowerCase();
      if(qunit==='l') qval*=1000;
      if(qunit==='cl') qval*=10;
      fullGrams=Math.round(qval);
    }

    // Nutrition per 100g/ml
    var kcal100=Math.round(nut['energy-kcal_100g']||nut['energy-kcal']||0);
    var prot100=Math.round((nut['proteins_100g']||nut['proteins']||0)*10)/10;
    var carb100=Math.round((nut['carbohydrates_100g']||nut['carbohydrates']||0)*10)/10;
    var fat100 =Math.round((nut['fat_100g']||nut['fat']||0)*10)/10;

    // Totals for the full item
    var f=fullGrams/100;
    var kcal=Math.round(kcal100*f);
    var prot=Math.round(prot100*f*10)/10;
    var carb=Math.round(carb100*f*10)/10;
    var fat =Math.round(fat100*f*10)/10;

    var label=nm+(br?' · '+br:'');
    var sizeStr=fullGrams+(qty&&String(qty).toLowerCase().indexOf('ml')>-1?'ml':'g');

    // Show confirm card — one tap logs it
    el.innerHTML='';
    var card=document.createElement('div');
    card.style.cssText='background:var(--card);border:1px solid rgba(255,255,255,0.35);border-radius:10px;overflow:hidden;';
    card.innerHTML='<div style="height:3px;background:var(--accent);"></div>'
      +'<div style="padding:14px;">'
      +'<div style="font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent-text);margin-bottom:8px;">✓ Barcode matched</div>'
      +'<div style="font-size:15px;font-weight:700;color:var(--white);margin-bottom:2px;">'+safeNm+'</div>'
      +(br?'<div style="font-size:11px;color:var(--grey);margin-bottom:10px;">'+safeBr+'</div>':'<div style="margin-bottom:10px;"></div>')
      +'<div style="display:flex;gap:8px;margin-bottom:12px;">'
      +'<div style="flex:1;background:var(--surface);border-radius:7px;padding:10px;text-align:center;">'
      +'<div style="font-size:20px;font-weight:800;color:var(--white);">'+kcal+'</div>'
      +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.06em;">kcal</div>'
      +'</div>'
      +'<div style="flex:1;background:var(--surface);border-radius:7px;padding:10px;text-align:center;">'
      +'<div style="font-size:20px;font-weight:800;color:var(--white);">'+prot+'g</div>'
      +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.06em;">protein</div>'
      +'</div>'
      +'<div style="flex:1;background:var(--surface);border-radius:7px;padding:10px;text-align:center;">'
      +'<div style="font-size:20px;font-weight:800;color:var(--white);">'+carb+'g</div>'
      +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.06em;">carbs</div>'
      +'</div>'
      +'<div style="flex:1;background:var(--surface);border-radius:7px;padding:10px;text-align:center;">'
      +'<div style="font-size:20px;font-weight:800;color:var(--white);">'+fat+'g</div>'
      +'<div style="font-size:9px;color:var(--grey);text-transform:uppercase;letter-spacing:0.06em;">fat</div>'
      +'</div>'
      +'</div>'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'
      +'<span style="font-size:11px;color:var(--mid);">Serving size:</span>'
      +'<input type="number" id="offScanGrams" value="'+fullGrams+'" min="1" max="5000" style="width:70px;background:var(--surface);border:1px solid var(--border2);color:var(--white);font-size:16px;padding:6px 8px;outline:none;border-radius:5px;text-align:center;">'
      +'<span style="font-size:11px;color:var(--grey);">'+(qty&&String(qty).toLowerCase().indexOf('ml')>-1?'ml':'g')+' (full item: '+sizeStr+')</span>'
      +'</div>'
      +'<button id="offScanLogBtn" style="width:100%;padding:13px;background:var(--accent);border:none;color:#fff;font-family:Space Grotesk,sans-serif;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;border-radius:7px;-webkit-tap-highlight-color:transparent;">Log '+offEsc(nm.split(' ')[0])+'</button>'
      +'</div>';
    el.appendChild(card);

    document.getElementById('offScanLogBtn').addEventListener('click',function(){
      var g=parseFloat(document.getElementById('offScanGrams').value)||fullGrams;
      var ratio=g/100;
      var fLabel=nm+' ('+g+(qty&&String(qty).toLowerCase().indexOf('ml')>-1?'ml':'g')+')';
      var fKcal=Math.round(kcal100*ratio);
      var fProt=Math.round(prot100*ratio*10)/10;
      var fCarb=Math.round(carb100*ratio*10)/10;
      var fFat =Math.round(fat100*ratio*10)/10;
      if(typeof calAddEntry==='function'){
        calAddEntry(fLabel,fKcal,fProt,fCarb,fFat);
      } else {
        var fn2=document.getElementById('calFoodName');
        var fk2=document.getElementById('calFoodKcal');
        var fp2=document.getElementById('calFoodProtein');
        var fc2=document.getElementById('calFoodCarbs');
        var ff2=document.getElementById('calFoodFats');
        if(fn2)fn2.value=fLabel;if(fk2)fk2.value=fKcal;
        if(fp2)fp2.value=fProt;if(fc2)fc2.value=fCarb;if(ff2)ff2.value=fFat;
        if(typeof calAddEntry==='function')calAddEntry();
      }
      el.innerHTML='<div style="font-size:13px;font-weight:700;color:#aaaaaa;padding:10px 0;">✓ '+nm+' logged — '+fKcal+' kcal</div>';
      setTimeout(function(){if(el)el.innerHTML='';},3000);
    });
  }catch(e){
    el.innerHTML='<div style="font-size:12px;color:var(--accent-text);padding:8px 0;">Lookup failed. Check connection.</div>';
  }
}

// Manual barcode fallback
async function offLookupBarcode(){
  var code=(document.getElementById('offBarcodeInput')||{}).value;
  if(code&&code.trim()) offFetchBarcode(code.trim());
}

function offRenderResults(prods){
  var el=document.getElementById('offResults');
  var rows=prods.map(function(p,i){
    var energy=p.nutriments['energy-kcal_100g'];\n    if(energy==null&&p.nutriments['energy-kj_100g']!=null)energy=Number(p.nutriments['energy-kj_100g'])/4.184;\n    var kcal=Math.round(Number(energy)||0);
    var prot=Math.round(p.nutriments['proteins_100g']||0);
    var carb=Math.round(p.nutriments['carbohydrates_100g']||0);
    var fat=Math.round(p.nutriments['fat_100g']||0);
    var nm=(p.product_name||'Unknown food').substring(0,50);\n    var safeNm=offEsc(nm);
    var br=p.brands?(p.brands.split(',')[0]).substring(0,30):'';\n    var safeBr=offEsc(br);
    var d=document.createElement('div');
    d.className='off-result';
    d.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">'
      +'<div style="flex:1;min-width:0;">'
      +'<div style="font-size:13px;font-weight:600;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+safeNm+'</div>'
      +(br?'<div style="font-size:10px;color:var(--grey);margin-top:1px;">'+safeBr+'</div>':'')
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0;">'
      +'<div style="font-size:16px;font-weight:700;color:var(--white);">'+kcal+'</div>'
      +'<div style="font-size:9px;color:var(--grey);">kcal/100g</div>'
      +'</div></div>'
      +'<div style="display:flex;gap:10px;margin-top:6px;">'
      +'<span style="font-size:10px;color:var(--mid);">P <strong style="color:var(--white);">'+prot+'g</strong></span>'
      +'<span style="font-size:10px;color:var(--mid);">C <strong style="color:var(--white);">'+carb+'g</strong></span>'
      +'<span style="font-size:10px;color:var(--mid);">F <strong style="color:var(--white);">'+fat+'g</strong></span>'
      +'<span style="font-size:10px;color:var(--grey);margin-left:auto;">per 100g</span>'
      +'</div>'
      +'<div style="display:flex;gap:6px;margin-top:8px;">'
      +'<input type="number" id="offG_'+i+'" value="100" min="1" max="2000" style="flex:1;background:var(--surface);border:1px solid var(--border2);color:var(--white);font-size:16px;padding:7px 10px;outline:none;border-radius:5px;">'
      +'<button class="off-add-btn" style="padding:0 16px;background:var(--accent);border:none;color:#fff;font-size:11px;font-weight:700;letter-spacing:0.04em;cursor:pointer;border-radius:5px;-webkit-tap-highlight-color:transparent;">Add</button>'
      +'</div>';
    d.querySelector('.off-add-btn').addEventListener('click',function(e){
      e.stopPropagation();
      offLogProduct(i,nm,kcal,prot,carb,fat);
    });
    return d;
  });
  el.innerHTML='';
  rows.forEach(function(r){el.appendChild(r);});
}

function offLogProduct(idx,name,kcal100,prot100,carb100,fat100){
  var gEl=document.getElementById('offG_'+idx);
  var g=parseFloat(gEl?gEl.value:100)||100;
  var f=g/100;
  var kcal=Math.round(kcal100*f);
  var prot=Math.round(prot100*f);
  var carb=Math.round(carb100*f);
  var fat=Math.round(fat100*f);
  var label=name+' ('+g+'g)';
  if(typeof calAddEntry==='function'){
    calAddEntry(label,kcal,prot,carb,fat);
  } else {
    var fn=document.getElementById('calFoodName');
    var fk=document.getElementById('calFoodKcal');
    var fp=document.getElementById('calFoodProtein');
    var fc=document.getElementById('calFoodCarbs');
    var ff=document.getElementById('calFoodFats');
    if(fn)fn.value=label;if(fk)fk.value=kcal;
    if(fp)fp.value=prot;if(fc)fc.value=carb;if(ff)ff.value=fat;
    if(typeof calAddEntry==='function')calAddEntry();
  }
  document.getElementById('offSearchInput').value='';
  offStopScan();
  var el=document.getElementById('offResults');
  el.innerHTML='<div style="font-size:12px;color:#aaaaaa;padding:8px 0;">✓ '+label+' logged — '+kcal+' kcal</div>';
  setTimeout(function(){if(el)el.innerHTML='';},3000);
}
