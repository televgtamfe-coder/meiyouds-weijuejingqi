import {SavedReport} from './records';
export function importantActions(record:SavedReport){
 const seen=new Set<string>(),all=record.report.actions.flatMap(g=>g.items.map(action=>({title:g.title,action}))).filter(p=>{const key=p.action.replace(/\s/g,'');if(seen.has(key))return false;seen.add(key);return true;});
 const urgent=all.filter(p=>['优先处理','就医提示'].includes(p.title)),rest=all.filter(p=>!urgent.includes(p));
 const priority=urgent.length?[{title:'优先关注',action:urgent.map(p=>p.action).join('；')}]:[];
 return [...priority,...rest].slice(0,3);
}
