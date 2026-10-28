export type EntryStage='preview'|'profile'|'ready';
export const entryKey='meiyou.bianbian.demo-entry.v12';
export function readEntryStage(profileConfirmed:boolean):EntryStage{
 let raw:string|null=null;try{raw=localStorage.getItem(entryKey);}catch{}if(!raw)try{raw=sessionStorage.getItem(entryKey);}catch{}
 if(raw==='profile')return 'profile';if(raw==='ready')return profileConfirmed?'ready':'profile';return 'preview';
}
export function saveEntryStage(stage:EntryStage){let saved=false;for(const getStorage of [()=>localStorage,()=>sessionStorage]){try{const storage=getStorage();if(stage==='preview')storage.removeItem(entryKey);else storage.setItem(entryKey,stage);saved=true;}catch{}}return saved;}
