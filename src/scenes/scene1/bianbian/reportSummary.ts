import {SavedReport} from './records';
import {feedingOptions,complementaryOptions} from './babyProfile';
// Keep complete source sentences so a shortened display never drops half a qualification.
export function firstObservationSentence(value:string){return value.trim().match(/^[^。！？\n]+[。！？]?/)?.[0]||'';}
export function appearanceConclusion(record:SavedReport){return ['颜色','性状'].map(label=>{const fact=record.report.facts.find(f=>f.label===label);return {label,value:fact?.value||'暂无描述',description:firstObservationSentence(fact?.detail||fact?.comparison||'')};});}
export function observationConclusion(record:SavedReport){return firstObservationSentence(record.report.summary)||'本次信息不足，请补充清晰照片与宝宝情况。';}

export function reportContext(record:SavedReport){
 const p=record.profileSnapshot;
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(record.createdAt));
 const days=record.trendSnapshot?.days||[],index=days.findIndex(d=>d.date===date),day=days[index],previous=days[index-1];
 const delta=day&&previous?Math.round((day.sleepHours-previous.sleepHours)*10)/10:null;
 const milkDelta=day&&previous?day.loggedMilkMl-previous.loggedMilkMl:null;
 const milkChange=day?`已记录 ${day.loggedMilkMl} ml${milkDelta===null?'':milkDelta===0?'，与前一天持平':`，较前一天${milkDelta>0?'增加':'减少'} ${Math.abs(milkDelta)} ml`}`:'';
 const change=delta===null?'':delta===0?'与前一天持平':`较前一天${delta>0?'增加':'减少'} ${Math.abs(delta)} 小时`;
 return [{label:'喂养背景',value:p?[feedingOptions.find(([v])=>v===p.feeding)?.[1],complementaryOptions.find(([v])=>v===p.complementary)?.[1],['mixed','pure_formula'].includes(p.feeding)?p.formula:''].filter(Boolean).join(' · '):'本次未保存喂养资料',change:milkChange,mock:!!day},
 {label:'睡眠背景',value:day?`${day.sleepHours} 小时`:'本次没有同日睡眠记录',change,mock:!!day}];
}
