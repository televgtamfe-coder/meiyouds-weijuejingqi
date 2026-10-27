import {TrendSet} from './trendData';
const stamp=(d:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
export function routineWindow(data:TrendSet,now=new Date()){
 const date=stamp(now),days=data.days.filter(d=>d.date<date);if(data.days[data.days.length-1]?.date!==date||days.length<3)return null;
 const hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',hour:'2-digit',hourCycle:'h23'}).format(now));
 const bins=Array.from({length:8},(_,i)=>({start:i*3,end:i*3+3,count:days.filter(d=>d.stools.some(s=>Math.floor(Number(s.time.split(':')[0])/3)===i)).length})).filter(b=>b.count>=3);
 if(!bins.length)return null;const next=bins.find(b=>b.start>hour)||bins[0],tomorrow=next.start<=hour;
 const at=new Date(`${date}T${String(next.start).padStart(2,'0')}:00:00+08:00`);if(tomorrow)at.setTime(at.getTime()+86400000);
 return {...next,days:days.length,at,label:`${tomorrow?'明天':'今天'} ${String(next.start).padStart(2,'0')}:00–${String(next.end).padStart(2,'0')}:00`};
}
export function feedingReminder(data:TrendSet){
 const today=data.days[data.days.length-1],yesterday=data.days[data.days.length-2];if(!yesterday)return null;
 const delta=today.loggedMilkMl-yesterday.loggedMilkMl,marked=yesterday.loggedMilkMl>0&&delta/yesterday.loggedMilkMl>=.2&&today.stools.length<=1;
 return {marked,title:marked?'奶量与排便，一起留意':'今天的记录提醒',body:`当天示例奶量 ${today.loggedMilkMl} ml，比前一天${delta>=0?'增加':'减少'} ${Math.abs(delta)} ml；已记录排便 ${today.stools.length} 次。`,attention:marked?'奶量增加而排便较少，值得留意宝宝是否腹胀、肚子发硬或排便费力；这些记录本身不能判断便秘或喂养过量。':'排便次数会有波动，留意宝宝是否排便费力、腹胀或不舒服，不凭一次次数变化判断异常。'};
}
export function reminderCalendar(at:Date){const dt=(d:Date)=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Meiyou//Care Reminder//ZH','BEGIN:VEVENT',`UID:meiyou-diaper-${at.getTime()}@local`,`DTSTAMP:${dt(new Date())}`,`DTSTART:${dt(at)}`,`DTEND:${dt(new Date(at.getTime()+600000))}`,'SUMMARY:宝宝尿布检查提醒（模拟体验）','DESCRIPTION:根据模拟历史时段生成。检查尿布需要时更换；发现排便后及时更换，不必等到提醒时间。','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:检查宝宝尿布，需要时更换','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');}

