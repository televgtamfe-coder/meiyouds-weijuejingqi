import type {SavedReport} from './records';
import {parentExplanation} from './reportContentContract';
const titles=['外观与性状','宝宝背景','重点关注'];
const riskWords=/发热|血丝|灰白|就医|医生|评估|感染|过敏|呕吐|不适|脱水|关注|留意|注意|不能|无法|未能|风险/;
const backgroundWords=/月龄|个月|喂养|母乳|配方|辅食|奶量|睡眠|档案|背景/;
export function deepAnalysisSections(record:SavedReport){
 const r=record.report,groups:string[][]=[[],[],[]],seen=new Set<string>();
 function add(value:string,group?:number){
  const sentences=parentExplanation(value).replace(/[。；;]{2,}/g,'。').match(/[^。！？\n]+[。！？]?/g)||[];
  for(const raw of sentences){const sentence=raw.trim(),key=sentence.replace(/[\s，,。；;！？]/g,'');if(!key||seen.has(key))continue;seen.add(key);
   const target=group??(riskWords.test(sentence)?2:backgroundWords.test(sentence)?1:0);groups[target].push(sentence);
  }
 }
 if(r.deepAnalysis?.length){r.deepAnalysis.forEach((s,i)=>add(s.body,/背景|阶段|喂养/.test(s.title)?1:/留意|关注|观察/.test(s.title)?2:/外观|性状/.test(s.title)?0:Math.min(i,2)));}
 else{
  // Reorganize the original report, preserving symptoms and clinical cautions verbatim.
  r.facts.filter(f=>['颜色','性状'].includes(f.label)).forEach(f=>add([f.detail,f.comparison].filter(Boolean).join('。'),0));
  [r.summary,r.detail,r.cause,...r.evidence].forEach(text=>add(text));
  r.facts.filter(f=>!['颜色','性状'].includes(f.label)).forEach(f=>add([f.value,f.detail,f.comparison].filter(x=>x&&x!=='未提供').join('；')));
 }
 return groups.map((items,i)=>{
  const paragraphs:string[]=[];let paragraph='';
  for(const sentence of items){if(paragraph&&paragraph.length+sentence.length>100){paragraphs.push(paragraph);paragraph='';}paragraph+=sentence;}
  if(paragraph)paragraphs.push(paragraph);
  return {title:titles[i],body:paragraphs.join('\n\n'),paragraphs};
 }).filter(s=>s.body);
}
