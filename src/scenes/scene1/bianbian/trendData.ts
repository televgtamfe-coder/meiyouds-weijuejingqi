import type {AnalysisForm} from './analysis';
export type StoolColor='yellow'|'green'|'brown'|'red'|'pale';
export type TrendRisk='low'|'watch'|'high'|'unknown';
export type StoolEvent={time:string;color:StoolColor;risk:TrendRisk};
export type DayTrend={date:string;stools:StoolEvent[];heightCm:number|null;weightKg:number|null;loggedMilkMl:number;feedingCount:number;sleepHours:number;nightWakings:number};
export type TrendSet={source:'mock';days:DayTrend[];note:string};
export const stoolColors:Record<StoolColor,{label:string;fill:string}>={yellow:{label:'黄色',fill:'#d5a637'},green:{label:'绿色',fill:'#6e8c63'},brown:{label:'棕色',fill:'#a77552'},red:{label:'红色',fill:'#cb6565'},pale:{label:'灰白色',fill:'#bcc4c8'}};
export const trendRisks:Record<TrendRisk,{label:string;color:string}>={low:{label:'低',color:'#31977c'},watch:{label:'关注',color:'#d58b22'},high:{label:'高',color:'#df5353'},unknown:{label:'未评估',color:'#999'}};
export function shanghaiDate(value=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(value);const get=(type:string)=>parts.find(x=>x.type===type)!.value;return `${get('year')}-${get('month')}-${get('day')}`;}
export function createMockTrends(now=new Date()):TrendSet{
 const end=new Date(`${shanghaiDate(now)}T12:00:00+08:00`);
 const times=[['07:40','18:10'],['06:50','17:40'],['07:20','13:30','19:10'],['08:10','18:30'],['06:40','11:20','15:30','20:10'],['07:20','14:10','19:00'],['08:10','18:20']];
 const milk=[780,800,790,760,710,750,780],sleep=[14,14.5,14,13.5,12.5,13.5,14],wakes=[2,2,2,3,4,3,2];
 return {source:'mock',note:'以下全部为模拟记录。奶量仅为已记录的瓶喂量，不含未量化的亲喂；身高体重仅有两次测量。风险标记为独立模拟值，不由便便颜色推断。',days:times.map((entries,i)=>({date:shanghaiDate(new Date(end.getTime()-(6-i)*86400000)),stools:entries.map((time,j)=>({time,color:i===4?'green':j%2?'brown':'yellow',risk:i===4?'watch':'low'})),heightCm:i===0?63.2:i===6?63.4:null,weightKg:i===0?6.8:i===6?6.9:null,loggedMilkMl:milk[i],feedingCount:i===4?5:6,sleepHours:sleep[i],nightWakings:wakes[i]}))};
}
export function dayRisk(day:DayTrend):TrendRisk{return day.stools.some(s=>s.risk==='high')?'high':day.stools.some(s=>s.risk==='watch')?'watch':day.stools.length&&day.stools.every(s=>s.risk==='low')?'low':'unknown';}
export function mockDetailDefaults(data:TrendSet):Partial<AnalysisForm>{const day=data.days[data.days.length-1];return {bowelPattern:'usual',frequency:String(day.stools.length),baseline:'2',symptoms:['无以下情况'],notes:'示例记录：近期喂养方式未改变，精神及吃奶状态无明显变化。',mockFields:['bowelPattern','frequency','baseline','symptoms','notes']};}
export function validTrends(value:unknown):value is TrendSet{
 const x=value as TrendSet;
 return !!x&&x.source==='mock'&&typeof x.note==='string'&&Array.isArray(x.days)&&x.days.length===7&&x.days.every(d=>d&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)&&Array.isArray(d.stools)&&d.stools.length<=50&&d.stools.every(s=>s&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)&&Object.prototype.hasOwnProperty.call(stoolColors,s.color)&&Object.prototype.hasOwnProperty.call(trendRisks,s.risk))&&[d.loggedMilkMl,d.feedingCount,d.sleepHours,d.nightWakings].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0)&&[d.heightCm,d.weightKg].every(n=>n===null||typeof n==='number'&&Number.isFinite(n)&&n>0));
}
export const dayShort=(date:string)=>`${Number(date.slice(5,7))}/${Number(date.slice(8,10))}`;
