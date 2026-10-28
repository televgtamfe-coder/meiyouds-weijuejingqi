import {SavedReport} from './records';
import {feedingOptions,complementaryOptions} from './babyProfile';
export function reportContext(record:SavedReport){
 const p=record.profileSnapshot;
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(record.createdAt));
 const day=record.trendSnapshot?.days.find(d=>d.date===date);
 return [{label:'喂养背景',value:p?[feedingOptions.find(([v])=>v===p.feeding)?.[1],complementaryOptions.find(([v])=>v===p.complementary)?.[1],['mixed','pure_formula'].includes(p.feeding)?p.formula:''].filter(Boolean).join(' · '):'本次未保存喂养资料'},
 {label:'睡眠背景',value:day?`${day.sleepHours} 小时 · 夜醒 ${day.nightWakings} 次（同日模拟记录）`:'本次没有同日睡眠记录'}];
}
