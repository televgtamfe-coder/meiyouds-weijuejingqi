import type {AnalysisForm} from './analysis';
export type StoolColor='yellow'|'green'|'brown'|'red'|'pale';
export type TrendRisk='low'|'watch'|'high'|'unknown';
export type StoolEvent={time:string;color:StoolColor;risk:TrendRisk};
export type DayTrend={date:string;stools:StoolEvent[];heightCm:number|null;weightKg:number|null;loggedMilkMl:number;feedingCount:number;sleepHours:number;nightWakings:number};
export type MonthTrend={label:string;days:DayTrend[]};
export type MonthComparison={previous:MonthTrend;current:MonthTrend;comparisonDays:number};
export type TrendSet={source:'mock';days:DayTrend[];note:string;months?:MonthComparison};
export const stoolColors:Record<StoolColor,{label:string;fill:string}>={yellow:{label:'黄色',fill:'#d5a637'},green:{label:'绿色',fill:'#6e8c63'},brown:{label:'棕色',fill:'#a77552'},red:{label:'红色',fill:'#cb6565'},pale:{label:'灰白色',fill:'#bcc4c8'}};
export const trendRisks:Record<TrendRisk,{label:string;color:string}>={low:{label:'健康',color:'#23866c'},watch:{label:'关注',color:'#387cb6'},high:{label:'就医',color:'#c74858'},unknown:{label:'未评估',color:'#387cb6'}};
export function shanghaiDate(value=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(value);const get=(type:string)=>parts.find(x=>x.type===type)!.value;return `${get('year')}-${get('month')}-${get('day')}`;}
export function createMockTrends(now=new Date()):TrendSet{
 const end=new Date(`${shanghaiDate(now)}T12:00:00+08:00`);
 const times=[['07:40','18:10'],['06:50','17:40'],['07:20','13:30','19:10'],['08:10','18:30'],['06:40','11:20','15:30','20:10'],['07:20','14:10','19:00'],['08:10','18:20']];
 const milk=[780,800,790,760,710,750,780],sleep=[14,14.5,14,13.5,12.5,13.5,14],wakes=[2,2,2,3,4,3,2];
 const result:TrendSet={source:'mock',note:'以下全部为模拟记录。奶量仅为已记录的瓶喂量，不含未量化的亲喂；身高体重仅有两次测量。风险标记为独立模拟值，不由便便颜色推断。',days:times.map((entries,i)=>({date:shanghaiDate(new Date(end.getTime()-(6-i)*86400000)),stools:entries.map((time,j)=>({time,color:i===4?'green':j%2?'brown':'yellow',risk:i===4?'watch':'low'})),heightCm:i===0?63.2:i===6?63.4:null,weightKg:i===0?6.8:i===6?6.9:null,loggedMilkMl:milk[i],feedingCount:i===4?5:6,sleepHours:sleep[i],nightWakings:wakes[i]}))};
 return {...result,months:createMonthComparison(now,result.days)};
}
export function dayRisk(day:DayTrend):TrendRisk{return day.stools.some(s=>s.risk==='high')?'high':day.stools.some(s=>s.risk==='watch')?'watch':day.stools.length&&day.stools.every(s=>s.risk==='low')?'low':'unknown';}
export function mockDetailDefaults(data:TrendSet):Partial<AnalysisForm>{const day=data.days[data.days.length-1];return {bowelPattern:'usual',frequency:String(day.stools.length),baseline:'2',symptoms:['无以下情况'],notes:'示例记录：近期喂养方式未改变，精神及吃奶状态无明显变化。',mockFields:['bowelPattern','frequency','baseline','symptoms','notes']};}
function validDay(d:DayTrend){return !!d&&/^\d{4}-\d{2}-\d{2}$/.test(d.date)&&Array.isArray(d.stools)&&d.stools.length<=50&&d.stools.every(s=>s&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time)&&Object.prototype.hasOwnProperty.call(stoolColors,s.color)&&Object.prototype.hasOwnProperty.call(trendRisks,s.risk))&&[d.loggedMilkMl,d.feedingCount,d.sleepHours,d.nightWakings].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0)&&[d.heightCm,d.weightKg].every(n=>n===null||typeof n==='number'&&Number.isFinite(n)&&n>0);}
export function validTrends(value:unknown):value is TrendSet{
 const x=value as TrendSet;if(!x||x.source!=='mock'||typeof x.note!=='string'||!Array.isArray(x.days)||x.days.length!==7||!x.days.every(validDay))return false;
 if(x.months===undefined)return true;
 const m=x.months;if(!m||!Number.isInteger(m.comparisonDays)||m.comparisonDays<1)return false;
 return [m.previous,m.current].every(v=>v&&typeof v.label==='string'&&Array.isArray(v.days)&&v.days.length>=m.comparisonDays&&v.days.length<=31&&v.days.every(validDay));
}
export const dayShort=(date:string)=>`${Number(date.slice(5,7))}/${Number(date.slice(8,10))}`;

export function createMonthComparison(now:Date,week:DayTrend[]):MonthComparison{
 const today=shanghaiDate(now),year=Number(today.slice(0,4)),month=Number(today.slice(5,7)),day=Number(today.slice(8));
 const prev=new Date(Date.UTC(year,month-2,1)),prevYear=prev.getUTCFullYear(),prevMonth=prev.getUTCMonth()+1;
 const previousCount=new Date(Date.UTC(year,month-1,0)).getUTCDate(),comparisonDays=Math.min(day,previousCount);
 function generate(y:number,m:number,count:number,current:boolean):MonthTrend{
  const label=`${y}年${m}月`,days:DayTrend[]=[];
  for(let n=1;n<=count;n++){
   const date=`${y}-${String(m).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
   const existing=week.find(d=>d.date===date);if(existing){days.push({...existing,stools:existing.stools.map(s=>({...s}))});continue;}
   const stoolCount=[2,2,3,2,2,3,2][(n-1)%7],measured=[1,8,15,22,comparisonDays,count].includes(n);
   const ratio=(n-1)/Math.max(1,count-1);
   days.push({date,stools:Array.from({length:stoolCount},(_,i)=>({time:['08:10','17:40','20:20'][i],color:i%2?'brown':'yellow',risk:'low'})),heightCm:measured?Number(((current?62.3:60.8)+ratio*(current?1.1:1.2)).toFixed(1)):null,weightKg:measured?Number(((current?6.6:6.2)+ratio*(current?0.3:0.4)).toFixed(2)):null,loggedMilkMl:(current?770:740)+[0,20,-10,10,-20,30,0][(n-1)%7],feedingCount:6,sleepHours:(current?14:14.5)+[0,.5,0,-.5,0,.5,-.5][(n-1)%7],nightWakings:[2,2,3,2,2,3,2][(n-1)%7]});
  }return {label,days};
 }
 return {previous:generate(prevYear,prevMonth,previousCount,false),current:generate(year,month,day,true),comparisonDays};
}
export function monthComparisonSummary(data:MonthComparison){
 function summarize(month:MonthTrend){const days=month.days.slice(0,data.comparisonDays);const avg=(get:(d:DayTrend)=>number)=>Number((days.reduce((n,d)=>n+get(d),0)/days.length).toFixed(1));return {days:days.length,stoolTotal:days.reduce((n,d)=>n+d.stools.length,0),stoolAverage:avg(d=>d.stools.length),milkAverage:avg(d=>d.loggedMilkMl),sleepAverage:avg(d=>d.sleepHours),nightWakingAverage:avg(d=>d.nightWakings),growthMeasurements:days.filter(d=>d.heightCm!==null||d.weightKg!==null).map(d=>({date:d.date,heightCm:d.heightCm,weightKg:d.weightKg}))};}
 return {comparisonDays:data.comparisonDays,previous:summarize(data.previous),current:summarize(data.current)};
}
