import type {SavedReport} from './records';
import {parentExplanation} from './reportContentContract';
export function deepAnalysisSections(record:SavedReport){
 const r=record.report,seen=new Set<string>();
 const clean=(text:string)=>parentExplanation(text).split(/(?<=[。！？])/).filter(s=>{const key=s.replace(/\s/g,'');if(!key||seen.has(key))return false;seen.add(key);return true;}).join('');
 if(r.deepAnalysis?.length)return r.deepAnalysis.map(s=>({...s,body:clean(s.body)})).filter(s=>s.body);
 // Existing reports retain their original clinical statements; only the presentation is reorganized.
 const appearance=r.facts.filter(f=>['颜色','性状'].includes(f.label)).flatMap(f=>[f.detail,f.comparison]).filter(Boolean).join('。');
 return [{title:'外观与性状解读',body:clean(appearance)},
  {title:'本次表现解读',body:clean([r.summary,r.detail,r.cause].filter(Boolean).join('。'))},
  {title:'补充观察',body:clean([...r.evidence,...r.facts.filter(f=>!['颜色','性状'].includes(f.label)).map(f=>[f.value,f.detail,f.comparison].filter(Boolean).join('；'))].join('。'))}].filter(x=>x.body);
}
