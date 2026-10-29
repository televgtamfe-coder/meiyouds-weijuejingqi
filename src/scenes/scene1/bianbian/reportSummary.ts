import {readRiskObservations} from './riskObservations';
import {dayShort,shanghaiDate,dayRisk} from './trendData';
import {SavedReport} from './records';
import {riskPresentation} from './riskPresentation';
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
 const seen=new Set([...indicatorDetails(record).map(f=>f.description)].filter(Boolean).map(normalize));
 const paragraphs:string[]=[];
 for(const block of [r.summary,r.detail,r.cause,...r.evidence,...r.facts.filter(f=>['颜色','性状'].includes(f.label)).flatMap(f=>[f.detail,f.comparison])].flatMap(text=>text.split(/\n+/))){
  const unique=(block.match(/[^。！？\n]+[。！？]?/g)||[]).filter(sentence=>{const key=normalize(sentence);if(!key||seen.has(key))return false;seen.add(key);return true;});
  if(unique.length)paragraphs.push(unique.join('').trim());
 }
 return paragraphs;
}

export function riskObservations(record:SavedReport){return readRiskObservations(record.report);}

// Brief factual cross-reference to the same dated records shown in the charts.
export function observationTrendConclusion(record:SavedReport){
 const date=shanghaiDate(new Date(record.createdAt));
 const days=(record.trendSnapshot?.days||[]).filter(d=>d.date<=date).sort((a,b)=>a.date.localeCompare(b.date)).slice(-7);
 if(days.length<3)return '';
 const counts=days.map(d=>d.stools.length),frequency=new Map<number,number>();
 counts.forEach(n=>frequency.set(n,(frequency.get(n)||0)+1));
 const mode=[...frequency].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];
 const range=Math.min(...counts)===Math.max(...counts)?`每天 ${counts[0]} 次`:mode[1]>days.length/2?`多为每天 ${mode[0]} 次`:`每天 ${Math.min(...counts)} 至 ${Math.max(...counts)} 次`;
 const routine=`近 ${days.length} 天${range}`;
 const changes=days.slice(1).map((d,i)=>({day:d,stool:d.stools.length-counts[i],milk:d.loggedMilkMl-days[i].loggedMilkMl,sleep:Math.round((d.sleepHours-days[i].sleepHours)*10)/10,consecutive:Date.parse(d.date)-Date.parse(days[i].date)===86400000})).filter(d=>d.consecutive&&d.stool!==0&&d.milk!==0&&d.sleep!==0).sort((a,b)=>Number(['watch','high'].includes(dayRisk(b.day)))-Number(['watch','high'].includes(dayRisk(a.day)))||Math.abs(b.stool)-Math.abs(a.stool)||b.day.date.localeCompare(a.day.date));
 const focus=changes[0];
 if(!focus)return `${routine}，暂未见排便、奶量和睡眠同日共同变化。`;
 const relation=(focus.milk>0)===(focus.sleep>0)?`奶量与睡眠同步${focus.milk>0?'增加':'减少'}`:`奶量${focus.milk>0?'增加':'减少'}、睡眠${focus.sleep>0?'增加':'减少'}`;
 return `${routine}；${dayShort(focus.day.date)} 排便${focus.stool>0?'增多':'减少'}时，${relation}，值得共同关注。`;
}

// Overview owns the assessment; indicator cards keep only additional physical detail.
export function indicatorDetails(record:SavedReport){
 const summary=observationConclusion(record).replace(/\s+/g,'');
 return appearanceConclusion(record).map(f=>{
  const fact=record.report.facts.find(item=>item.label===f.label);
  const extra=(fact?.detail||'').split(/[，,。；;\n]+/).map(x=>x.trim()).filter(x=>x&&/边缘|颗粒|软块|水分|均匀|分离|泡沫|黏|粘/.test(x)&&!summary.includes(x.replace(/\s+/g,''))&&!/血丝|奶瓣|灰白/.test(x));
  return {...f,description:[...new Set(extra)].slice(0,2).join('；')};
 });
}
export function riskObservationConclusion(record:SavedReport){
 const summary=observationContextIntro(record);
 const missing=riskObservations(record).filter(x=>!summary.includes(x.label)&&!(x.label==='灰白色'&&summary.includes('灰白')));
 return ['疑似少量','疑似大量','发现异常','未见明显'].map(value=>{
  const labels=missing.filter(x=>x.value===value).map(x=>x.label).join('、');
  return !labels?'':value==='发现异常'?`${labels}发现异常`:`${value}${labels}`;
 }).filter(Boolean).join('；');
}
// Highlight complete clauses to preserve qualifications and negations.
export function conclusionSegments(text:string){
 return text.split(/(?<=[，；。！？])/).filter(Boolean).map((value,i)=>({text:value,strong:i===0||/风险|血丝|奶瓣|灰白|增多|减少|增加|偏|异常|尚未明确/.test(value)}));
}

export function observationContextIntro(record:SavedReport){
 return firstObservationSentence(record.report.detail)||firstObservationSentence(record.report.cause)||observationConclusion(record);
}
export function overviewConclusion(record:SavedReport){
 const seen=new Set<string>();
 return [observationContextIntro(record),riskObservationConclusion(record),riskPresentation[record.report.risk].doctor&&!observationContextIntro(record).includes('建议就医')?'建议就医。':''].filter(Boolean).map(text=>/[。！？]$/.test(text)?text:text+'。').filter(text=>{const key=text.replace(/\s+/g,'');if(seen.has(key))return false;seen.add(key);return true;}).join('');
}
