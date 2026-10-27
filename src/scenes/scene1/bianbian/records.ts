import { Report } from './analysis';
export type SavedReport={id:string;createdAt:string;report:Report;thumbnail:string;demo:boolean};
export const recordsKey='meiyou.bianbian.records.v3';
export const reminderKey='meiyou.bianbian.reminder.v3';
export const reminderSeenKey='meiyou.bianbian.reminder-seen.v3';
export const riskLabels={green:'暂未提示明显异常',yellow:'有变化，需要关注',orange:'需要进一步评估',red:'请优先寻求医疗帮助',unknown:'暂不能确定风险'};
export function makeRecord(report:Report,thumbnail='',demo=false):SavedReport {return {id:crypto.randomUUID(),createdAt:new Date().toISOString(),report,thumbnail,demo};}
function validRecord(v:unknown):v is SavedReport {
 if(!v||typeof v!=='object')return false;
 const x=v as SavedReport,r=x.report;
 return typeof x.id==='string'&&typeof x.createdAt==='string'&&Number.isFinite(Date.parse(x.createdAt))&&typeof x.thumbnail==='string'&&x.demo===false&&!!r&&r.kind==='report'&&['green','yellow','orange','red','unknown'].includes(r.risk)&&['summary','detail','question','cause'].every(k=>typeof r[k as keyof Report]==='string')&&Array.isArray(r.facts)&&r.facts.every(f=>f&&['label','value','detail','comparison'].every(k=>typeof f[k as keyof typeof f]==='string'))&&Array.isArray(r.actions)&&r.actions.every(a=>a&&typeof a.title==='string'&&Array.isArray(a.items)&&a.items.every(i=>typeof i==='string'))&&Array.isArray(r.evidence)&&r.evidence.every(e=>typeof e==='string');
}
export function loadRecords():SavedReport[] {try{const values=JSON.parse(sessionStorage.getItem(recordsKey)||'[]');return Array.isArray(values)?values.filter(validRecord).slice(0,20):[];}catch{return [];}}
export function saveRecord(record:SavedReport) {if(record.demo||!validRecord(record))return false;try{sessionStorage.setItem(recordsKey,JSON.stringify([record,...loadRecords().filter(x=>x.id!==record.id)].slice(0,20)));return true;}catch{return false;}}
export function dateLabel(value:string){return new Date(value).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});}
export function readFlag(key:string){try{return sessionStorage.getItem(key)==='true';}catch{return false;}}
export function writeFlag(key:string,value:boolean){try{sessionStorage.setItem(key,String(value));}catch{/* In-page state remains usable. */}}
export function clearBianbianData(){for(const key of [recordsKey,reminderKey,reminderSeenKey,'meiyou.bianbian.confirmed-profile.v3','meiyou.bianbian.confirmed-profile.v2']){try{sessionStorage.removeItem(key);}catch{/* No inaccessible keys are used. */}}}
export async function createThumbnail(image:string):Promise<string>{const img=new Image();img.src=image;await img.decode();const canvas=document.createElement('canvas');canvas.width=160;canvas.height=Math.round(160*img.height/img.width);if(canvas.height>220){canvas.height=220;canvas.width=Math.round(220*img.width/img.height);}canvas.getContext('2d')?.drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.55);}
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000);}
export function reminderCalendar(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get=(t:string)=>parts.find(x=>x.type===t)?.value||'';
 const date=new Date(`${get('year')}-${get('month')}-${get('day')}T20:00:00+08:00`);if(Number(get('hour'))>=20)date.setTime(date.getTime()+86400000);
 const stamp=(d:Date)=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Meiyou//Bianbian Reminder//ZH-CN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${crypto.randomUUID()}@mybianbian.com`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(date)}`,`DTEND:${stamp(new Date(date.getTime()+5*60000))}`,'RRULE:FREQ=DAILY','SUMMARY:宝宝日常记录','DESCRIPTION:记录今天的排便次数和喂养情况。有不适时请及时咨询医生。','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:宝宝日常记录','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
