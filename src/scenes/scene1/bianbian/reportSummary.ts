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

export function referenceParagraphs(record:SavedReport){
 const r=record.report,normalize=(text:string)=>text.replace(/\s+/g,'').replace(/[。！？]+$/,'');
 const seen=new Set([observationConclusion(record),...appearanceConclusion(record).map(f=>f.description)].filter(Boolean).map(normalize));
 const paragraphs:string[]=[];
 for(const block of [r.summary,r.detail,r.cause,...r.evidence].flatMap(text=>text.split(/\n+/))){
  const unique=(block.match(/[^。！？\n]+[。！？]?/g)||[]).filter(sentence=>{const key=normalize(sentence);if(!key||seen.has(key))return false;seen.add(key);return true;});
  if(unique.length)paragraphs.push(unique.join('').trim());
 }
 return paragraphs;
}

// Only explicit observations from the current photo are used, never advice or historical comparisons.
export function riskObservations(record:SavedReport){
 const clauses=record.report.facts.filter(f=>['颜色','性状','可见混合物'].includes(f.label)).flatMap(f=>[f.value,f.detail]).flatMap(text=>text.split(/[，,。；;！？\n]/)).map(text=>text.trim());
 return [{label:'血丝',pattern:/血丝|血迹/},{label:'奶瓣',pattern:/奶瓣/},{label:'灰白色',pattern:/灰白色|灰白|陶土色/}].map(item=>{
  const states=new Set<string>();
  for(const clause of clauses){
   if(!item.pattern.test(clause)||/可能|疑似|无法|不能|未能|不排除|难以|不确定|历史|此前|之前|既往|如果|若|需|建议|注意|但|不明显/.test(clause))continue;
   const clean=clause.replace(/^(?:本次(?:照片)?|照片中|图片中|示例中|图中|便便中|便便)/,'');
   if(/^(?:未见|未发现|没有|无)(?:明显|可见)?/.test(clean)&&!/(?:可见|伴有|存在)/.test(clean.replace(/^(?:未见|未发现|没有|无)(?:明显|可见)?/,'')))states.add('absent');
   else if(!/未|无|不|没有/.test(clean)&&(/^(?:可见|发现|伴有|存在|有|少量|明显|呈|以)/.test(clean)||item.pattern.test(clean)&&clean.match(item.pattern)?.index===0))states.add('present');
  }
  const state=states.size===1?[...states][0]:'unknown';
  return {label:item.label,state,value:state==='absent'?'未见明显':state==='present'?'可见':'未明确'};
 });
}
