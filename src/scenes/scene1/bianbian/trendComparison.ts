import {TrendSet} from './trendData';
export function relativeChange(values:(number|null)[]){
 const base=values.find(v=>v!==null);if(base===undefined||base===null||base<=0)return values.map(()=>null);
 return values.map(v=>v===null?null:Math.round((v-base)/base*1000)/10);
}
export function comparisonSeries(data:Pick<TrendSet,'days'>,includeHeight=false){
 const specs=[
  {key:'stool',label:'便便次数',unit:'次',color:'#e85287',dash:'',values:data.days.map(d=>d.stools.length)},
  {key:'weight',label:'体重',unit:'kg',color:'#aa83b9',dash:'5 4',values:data.days.map(d=>d.weightKg)},
  {key:'feeding',label:'已记录奶量',unit:'ml',color:'#d89745',dash:'',values:data.days.map(d=>d.loggedMilkMl)},
  {key:'sleep',label:'睡眠时长',unit:'小时',color:'#648fb9',dash:'2 3',values:data.days.map(d=>d.sleepHours)},
 ];
 if(includeHeight)specs.splice(1,0,{key:'height',label:'身高',unit:'cm',color:'#46a99d',dash:'7 3',values:data.days.map(d=>d.heightCm)});
 return specs.map(s=>({...s,changes:relativeChange(s.values)}));
}
export function comparisonScale(data:Pick<TrendSet,'days'>,includeHeight=false){const values=comparisonSeries(data,includeHeight).flatMap(s=>s.changes).filter((v):v is number=>v!==null);const min=Math.min(-25,Math.floor(Math.min(0,...values)/25)*25),max=Math.max(25,Math.ceil(Math.max(0,...values)/25)*25);return {min,max,ticks:[max,0,min]};}
