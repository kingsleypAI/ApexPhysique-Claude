// ── DATA BACKUP & RESTORE ────────────────────────────────────────
function forgeOwnedStorageKeys(){
  var keys=[];
  for(var i=0;i<localStorage.length;i++){
    var k=localStorage.key(i);
    if(k && (/^(apx_|forge_)/.test(k))) keys.push(k);
  }
  return keys.sort();
}
function exportData(){
  const data={};
  forgeOwnedStorageKeys().forEach(k=>{const v=localStorage.getItem(k);if(v!==null)data[k]=v;});
  const backup={app:'FORGE',version:2,exported:new Date().toISOString(),data:data};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download='forge-backup-'+forgeLocalDateKey(new Date())+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function importData(){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.onchange=function(e){
    const file=e.target.files&&e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      try{
        const backup=JSON.parse(ev.target.result);
        if(!backup || !backup.data || typeof backup.data!=='object' || Array.isArray(backup.data)) throw new Error('This is not a valid FORGE backup.');
        const entries=Object.entries(backup.data).filter(([k,v])=>/^(apx_|forge_)/.test(k)&&typeof v==='string');
        if(!entries.length) throw new Error('No FORGE data was found in this backup.');
        if(!confirm('Restore '+entries.length+' FORGE data items? Current data will be replaced. Export a backup first if you have not already.')) return;
        entries.forEach(([k,v])=>localStorage.setItem(k,v));
        alert('FORGE data restored. The app will now reload.');location.reload();
      }catch(err){alert('Restore failed: '+err.message);}
    };
    reader.onerror=function(){alert('Could not read that backup file.');};
    reader.readAsText(file);
  };
  input.click();
}

function resetProgramStart(){
  if(!confirm('Reset program start date to today? This will recalculate your current week.')) return;
  const START_KEY = 'apx_program_start';
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0,0,0,0);
  localStorage.setItem(START_KEY, monday.toISOString());
  location.reload();
}
