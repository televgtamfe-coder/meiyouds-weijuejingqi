import {BabyProfile,babyAge,feedingOptions} from './babyProfile';
import {SavedReport,makeRecord,mockRecordsKey,validRecord} from './records';
import {TrendSet,createMockTrends,dayShort} from './trendData';
import {emptyForm} from './analysis';
import {JointAnalysis} from './trendAnalysis';
export function mockHistory(profile:BabyProfile,data:TrendSet):SavedReport[]{
 const states=[
  {risk:'green' as const,color:'黄色',texture:'柔软糊状',mix:'未见明显血丝，未见明显奶瓣，未见明显灰白色。',appearance:'主体呈黄色、质地柔软糊状',assessment:'与当前喂养阶段常见的便便外观相近',detail:'整体较均匀，边缘柔软，水分未见明显增多。',action:'继续记录下一次排便',instruction:'记录下一次排便时间、外观和吃奶睡眠情况，便于与本次对照。',count:2,milk:780,sleep:14},
  {risk:'yellow' as const,color:'黄绿色',texture:'偏稀、夹颗粒',mix:'未见明显血丝，疑似少量奶瓣，未见明显灰白色。',appearance:'呈黄绿色、质地偏稀并夹少量颗粒',assessment:'本次稀软程度较前次记录明显，结合排便增多，需要关注后续变化',detail:'局部可见少量颗粒，水分较前次记录增多，尚未呈明显水样。',action:'留意后续排便及吃奶状态',instruction:'下次排便时记录次数和稀软程度，同时留意尿量、精神及吃奶情况；若持续变稀或出现不适，联系儿科医生。',count:4,milk:710,sleep:12.5},
  {risk:'red' as const,color:'灰白、局部红色',texture:'稀软、夹红色条状物',mix:'疑似大量血丝，未见明显奶瓣，发现灰白色异常区域。',appearance:'局部呈灰白色并夹红色条状物、质地稀软',assessment:'外观偏离这一阶段常见表现，需要医生进一步评估，建议就医',detail:'灰白区域与局部红色条状物较突出，水分增多，照片无法确认红色物质来源。',action:'携带照片和记录联系医生',instruction:'保留本次照片及近期排便、喂养记录，及时联系儿科医生；若伴精神差、明显出血或持续呕吐，请立即就医。',count:3,milk:680,sleep:12}
 ];
 return states.map((s,i)=>{
  const date=data.days[6-i].date,at=new Date(`${date}T21:30:00+08:00`),generated=createMockTrends(at);
  const trend:TrendSet={source:'mock',note:generated.note,days:generated.days};
  const today=trend.days[6],previous=trend.days[5];
  today.stools=['08:10','13:20','18:20','20:10'].slice(0,s.count).map(time=>({time,color:i===2?'pale':i===1?'green':'yellow',risk:i===2?'high':i===1?'watch':'low'}));
  today.loggedMilkMl=s.milk;today.sleepHours=s.sleep;
  const change=(value:number,unit:string)=>value===0?'持平':`${value>0?'增加':'减少'} ${Math.round(Math.abs(value)*10)/10} ${unit}`;
  const stoolChange=change(s.count-previous.stools.length,'次'),milkChange=change(s.milk-previous.loggedMilkMl,'ml'),sleepChange=change(s.sleep-previous.sleepHours,'小时');
  const joint:JointAnalysis={summary:`${dayShort(date)} 排便 ${s.count} 次，已记录奶量 ${s.milk} ml，睡眠 ${s.sleep} 小时。`,domains:[
   {key:'stool',observation:`当天排便 ${s.count} 次`,relation:`较前一天${stoolChange}`},
   {key:'feeding',observation:`当天已记录奶量 ${s.milk} ml`,relation:`较前一天${milkChange}`},
   {key:'sleep',observation:`当天睡眠 ${s.sleep} 小时`,relation:`较前一天${sleepChange}`}
  ],relationships:[`${dayShort(date)} 排便较前一天${stoolChange}，同期奶量${milkChange}、睡眠${sleepChange}，可一起留意这一天的变化。`,'近七天记录包含每日排便时间、次数和同日奶量、睡眠，便于回看变化是否持续。'],plan:[],limitations:['奶量为已记录的瓶喂量。'],alert:i===2?'本次外观有需医生评估的表现。':''};
  const feeding=feedingOptions.find(([key])=>key===profile.feeding)?.[1]||'当前喂养方式';
  const intro=`本次便便${s.appearance}，结合${babyAge(profile.birthDate,at)}、${feeding}背景，${s.assessment}。`;
  const result=makeRecord({kind:'report',risk:s.risk,summary:`${intro}${s.mix}`,detail:`${intro}${s.detail}`,cause:i===0?'本次颜色与质地未见突出异常，继续结合后续排便及日常状态观察。':i===1?'本次排便次数和稀软程度均有变化，奶瓣样颗粒需结合后续清晰照片继续观察。':'本次灰白与红色区域需要进一步核实，不能仅凭照片确定来源。',question:'',facts:[
   {label:'颜色',value:s.color,detail:i===0?'整体呈黄色，未见明显灰白色。':i===1?'主体呈黄绿色，未见明显灰白色。':'可见灰白色异常区域，局部呈红色。',comparison:i===0?'与前次黄色、棕黄色记录接近。':'与前次外观不同。'},
   {label:'性状',value:s.texture,detail:s.detail,comparison:i===0?'整体稀稠程度与前次接近。':'本次水分较前次记录增加。'},
   {label:'可见混合物',value:s.mix,detail:'',comparison:''}
  ],actions:[{title:s.action,items:[s.instruction]}],evidence:[`本次记录于 ${dayShort(date)}，当天排便 ${s.count} 次。`,`同期已记录奶量 ${s.milk} ml，睡眠 ${s.sleep} 小时。`,i===0?'本次未见明显血丝、奶瓣和灰白色区域。':i===1?'本次疑似少量奶瓣，伴排便次数及稀软程度变化。':'灰白色异常区域及疑似血丝是本次需就医评估的重点。']},'',true,{profile,trendSnapshot:trend,jointAnalysis:joint,form:{...emptyForm,...profile,frequency:String(s.count),baseline:'2',bowelPattern:i===0?'usual':'increased',symptoms:['无以下情况'],notes:s.detail,consent:true,trendContext:trend}});
  return {...result,id:`mock-history-${date}-${s.risk}`,createdAt:at.toISOString()};
 });
}
export function loadMockHistory(profile:BabyProfile,data:TrendSet):SavedReport[]{
 try{const saved=JSON.parse(localStorage.getItem(mockRecordsKey)||'null');if(Array.isArray(saved)&&saved.length===3&&saved.every(r=>validRecord(r,true)&&r.demo&&r.profileSnapshot&&r.trendSnapshot&&r.jointAnalysis&&r.formSnapshot))return saved;}catch{}
 const records=mockHistory(profile,data);try{localStorage.setItem(mockRecordsKey,JSON.stringify(records));}catch{}return records;
}
export function historyMonthDay(value:string){const parts=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric'}).formatToParts(new Date(value));return `${parts.find(p=>p.type==='month')!.value}月${parts.find(p=>p.type==='day')!.value}日`;}
