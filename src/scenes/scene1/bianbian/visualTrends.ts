import {DayTrend,MonthComparison,TrendSet,monthComparisonSummary} from './trendData';
export function monthMetrics(data:MonthComparison){
 const summary=monthComparisonSummary(data),previous=data.previous.days.slice(0,data.comparisonDays),current=data.current.days.slice(0,data.comparisonDays);
 const flagged=(days:DayTrend[])=>days.reduce((sum,d)=>sum+d.stools.filter(s=>s.risk==='watch'||s.risk==='high').length,0);
 const growth=(days:DayTrend[],key:'heightCm'|'weightKg')=>{const points=days.filter(d=>d[key]!==null);return points.length<2?null:Number((points[points.length-1][key]!-points[0][key]!).toFixed(2));};
 return [
  {key:'stool',label:'便便次数',unit:'次',previous:summary.previous.stoolTotal,current:summary.current.stoolTotal},
  {key:'risk',label:'需关注记录',unit:'次',previous:flagged(previous),current:flagged(current)},
  {key:'milk',label:'日均已记录奶量',unit:'ml',previous:summary.previous.milkAverage,current:summary.current.milkAverage},
  {key:'sleep',label:'日均睡眠',unit:'小时',previous:summary.previous.sleepAverage,current:summary.current.sleepAverage},
  {key:'height',label:'身高记录变化',unit:'cm',previous:growth(previous,'heightCm'),current:growth(current,'heightCm')},
  {key:'weight',label:'体重记录变化',unit:'kg',previous:growth(previous,'weightKg'),current:growth(current,'weightKg')},
 ];
}
export function deltaLabel(previous:number|null,current:number|null,unit:string){if(previous===null||current===null)return '记录不足';const delta=Number((current-previous).toFixed(2));return delta===0?'与上月持平':`${delta>0?'增加':'减少'} ${Math.abs(delta)} ${unit}`;}
export function focusDay(data:TrendSet){const scores=data.days.map(d=>d.stools.filter(s=>s.risk==='watch'||s.risk==='high').length);return Math.max(...scores)>0?scores.indexOf(Math.max(...scores)):data.days.length-1;}
export function relationTracks(data:TrendSet){return [
 {key:'stool',label:'便便次数',unit:'次',color:'#e85287',values:data.days.map(d=>d.stools.length),min:0,max:Math.max(5,...data.days.map(d=>d.stools.length))},
 {key:'milk',label:'已记录奶量',unit:'ml',color:'#d89745',values:data.days.map(d=>d.loggedMilkMl),min:Math.floor(Math.min(...data.days.map(d=>d.loggedMilkMl))/100)*100,max:Math.ceil((Math.max(...data.days.map(d=>d.loggedMilkMl))+1)/100)*100},
 {key:'sleep',label:'睡眠时长',unit:'小时',color:'#648fb9',values:data.days.map(d=>d.sleepHours),min:Math.max(0,Math.floor(Math.min(...data.days.map(d=>d.sleepHours)))-1),max:Math.ceil(Math.max(...data.days.map(d=>d.sleepHours)))+1},
 ];}
export function dayChanges(data:TrendSet,index:number){return relationTracks(data).map(s=>{const value=s.values[index],prev=index>0?s.values[index-1]:null,delta=prev===null?null:Number((value-prev).toFixed(1));return {...s,value,change:delta===null?'本周首日':delta===0?'与前日相同':`比前日${delta>0?'增加':'减少'} ${Math.abs(delta)} ${s.unit}`};});}
