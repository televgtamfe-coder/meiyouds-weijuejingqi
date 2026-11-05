import {parentExplanation} from './reportContentContract';
import {SavedReport} from './records';
export function importantActions(record:SavedReport){
 const seen=new Set<string>(),all=record.report.actions.flatMap(g=>g.items.map(action=>({title:g.title,action}))).filter(p=>{const key=p.action.replace(/\s/g,'');if(seen.has(key))return false;seen.add(key);return true;});
 const urgent=all.filter(p=>['优先处理','就医提示'].includes(p.title)),rest=all.filter(p=>!urgent.includes(p));
 const structured=(record.report.actionPlan||[]).map(a=>({title:a.title,action:`${a.when}：${a.steps.join('；')}${a.watchFor?'。'+a.watchFor:''}`}));
 const priority=urgent.length?[{title:'优先关注',action:urgent.map(p=>p.action).join('；')}]:[];
 const items=[...priority,...(structured.length?structured:rest)];
 return items.slice(0,3).map(p=>{
  let action=parentExplanation(p.action);
  if(!priority.includes(p)&&!structured.length&&/^(继续记录|持续记录|记录每天|观察并记录)/.test(action))action='下次排便时，在自然光下拍摄便便并记下时间、颜色和稀稠程度；当天每次排便都记一笔，便于和前一天逐项对照。';
  else if(!priority.includes(p)&&!structured.length&&/(维持|保持).{0,8}喂养节奏/.test(action))action='下一次喂奶时，记录喂奶时间、已知奶量，以及是否出现呕吐或明显不适；亲喂只记录时长，不估算奶量。';
  return {...p,action};
 });
}
