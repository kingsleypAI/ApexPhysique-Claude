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
function forgeGetBackupEntries(data){
  if(!data || typeof data!=='object' || Array.isArray(data)) throw new Error('This is not a valid FORGE backup.');
  var entries=Object.entries(data).filter(function(entry){return /^(apx_|forge_)/.test(entry[0]);});
  if(!entries.length) throw new Error('No FORGE data was found in this backup.');
  if(entries.some(function(entry){return typeof entry[1]!=='string';})) throw new Error('This backup contains invalid FORGE data. Nothing has been changed.');
  return entries;
}
function forgeRestoreBackupData(data){
  var entries=forgeGetBackupEntries(data);
  var before={};
  forgeOwnedStorageKeys().forEach(function(k){before[k]=localStorage.getItem(k);});
  var incoming={};
  entries.forEach(function(entry){incoming[entry[0]]=entry[1];});
  try{
    // A restore replaces the complete FORGE data set, not just keys present in the file.
    Object.keys(before).forEach(function(k){if(!Object.prototype.hasOwnProperty.call(incoming,k))localStorage.removeItem(k);});
    entries.forEach(function(entry){localStorage.setItem(entry[0],entry[1]);});
  }catch(writeError){
    try{
      forgeOwnedStorageKeys().forEach(function(k){localStorage.removeItem(k);});
      Object.keys(before).forEach(function(k){localStorage.setItem(k,before[k]);});
    }catch(rollbackError){
      throw new Error('Restore failed and automatic rollback was incomplete. Keep this tab open and export any remaining data. '+rollbackError.message);
    }
    throw new Error('Restore could not be completed. Your previous data has been rolled back. '+writeError.message);
  }
  return entries.length;
}
function importData(){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  input.onchange=function(e){
    const file=e.target.files&&e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=function(ev){
      try{
        if(file.size>10*1024*1024)throw new Error('Backup file is too large (maximum 10MB).');
        const backup=JSON.parse(ev.target.result);
        if(!backup || (backup.app && backup.app!=='FORGE') || !backup.data || typeof backup.data!=='object' || Array.isArray(backup.data)) throw new Error('This is not a valid FORGE backup.');
        const entries=forgeGetBackupEntries(backup.data);
        if(!confirm('Restore '+entries.length+' FORGE data items? All current FORGE data will be replaced. Export a backup first if you have not already.')) return;
        forgeRestoreBackupData(backup.data);
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
