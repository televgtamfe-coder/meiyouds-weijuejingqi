import type {SavedReport} from './records';
import {shanghaiDate,TrendSet,StoolEvent} from './trendData';
export const regularityKey='meiyou.bianbian.regularity-events.v1';
type Event=StoolEvent&{id:string;createdAt:string;date:string};
function event(record:SavedReport):Event|null{
 if(record.demo||!Number.isFinite(Date.parse(record.createdAt)))return null;
 const text=record.report.facts.find(f=>f.label==='颜色')?.value||'';
 const color:StoolEvent['color']=/灰白|陶土/.test(text)?'pale':/红|血/.test(text)?'red':/绿/.test(text)?'green':/棕|褐/.test(text)?'brown':'yellow';
 return {id:record.id,createdAt:record.createdAt,date:shanghaiDate(new Date(record.createdAt)),time:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(record.createdAt)),color,risk:record.report.risk==='green'?'low':['red','orange'].includes(record.report.risk)?'high':'watch'};
}
function stored():Event[]{const map=new Map<string,Event>();for(const get of [()=>localStorage,()=>sessionStorage])try{const rows=JSON.parse(get().getItem(regularityKey)||'[]');if(Array.isArray(rows))rows.filter(x=>x&&typeof x.id==='string'&&Number.isFinite(Date.parse(x.createdAt))&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&/^\d{2}:\d{2}$/.test(x.time)&&['low','watch','high'].includes(x.risk)&&['yellow','green','brown','red','pale'].includes(x.color)).forEach(x=>map.set(x.id,x));}catch{}return [...map.values()];}
function windowEvents(records:SavedReport[],now:Date){
 const end=shanghaiDate(now),start=shanghaiDate(new Date(new Date(`${end}T12:00:00+08:00`).getTime()-29*86400000));
 const map=new Map(stored().map(x=>[x.id,x]));records.map(event).forEach(x=>{if(x)map.set(x.id,x);});
 return [...map.values()].filter(x=>x.date>=start&&x.date<=end&&Date.parse(x.createdAt)<=now.getTime()).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
}
export function rememberRegularity(records:SavedReport[],now=new Date()){
 const rows=windowEvents(records,now);try{localStorage.setItem(regularityKey,JSON.stringify(rows));sessionStorage.removeItem(regularityKey);}catch{try{sessionStorage.setItem(regularityKey,JSON.stringify(rows));}catch{}}
}
export function regularityTrend(records:SavedReport[],now=new Date()):TrendSet|undefined{
 const events=windowEvents(records,now);if(new Set(events.map(x=>x.date)).size<=7)return;
 const end=new Date(`${shanghaiDate(now)}T12:00:00+08:00`);
 return {source:'records',note:'近期已保存的照片分析记录',days:Array.from({length:7},(_,i)=>{const date=shanghaiDate(new Date(end.getTime()-(6-i)*86400000));return {date,stools:events.filter(x=>x.date===date).map(({time,color,risk})=>({time,color,risk})),heightCm:null,weightKg:null,loggedMilkMl:0,feedingCount:0,sleepHours:0,nightWakings:0};})};
}
