import type {Report} from './analysis';

export const riskObservationValues=['未发现','少量','大量'] as const;
type ObservationValue=typeof riskObservationValues[number];
export type StructuredRiskObservations=Partial<Record<'blood'|'milk_curds'|'pale',{status:ObservationValue;evidence:string}>>;
const items=[{key:'blood',label:'血丝',pattern:/血丝|血迹/},{key:'milk_curds',label:'奶瓣',pattern:/奶瓣/},{key:'pale',label:'灰白色',pattern:/灰白色|灰白|陶土色/}] as const;
const uncertain=/待确认|待核实|尚未明确|未明确|不详|不清晰|可能|无法|不能|未能|不排除|难以|不确定|历史|此前|之前|既往|如果|若|建议|注意|需|但|不明显/;
const negative=/^(?:未检测到|未观察到|未检出|未发现|未见|没有|无)(?:明显|可见)?/;
export const riskObservationContract='必须独立观察本次照片的血丝、奶瓣、灰白色。返回 risk_observations 对象，键为 blood、milk_curds、pale，每项包含 status 和 evidence。status 只能为“未发现”“少量”“大量”。这些字段仅描述照片中可见表现的数量或范围，不代表诊断；灰白色用可见范围判断，不可仅由发现异常推定大量，evidence 为本次照片的具体观察依据。三项均须返回，不可从总体低风险、月龄、喂养或历史推定未见异常。照片确实不可判断时该项返回 null 并在 follow_up_question 说明需要更清晰照片，不得编造阴性。同时在 objective_facts.foreign_bodies.detail 写出“血丝：状态；奶瓣：状态；灰白色：状态”，兼容既有报告格式。客观描述与这些字段必须一致。';

export function normalizeRiskObservations(value:unknown):StructuredRiskObservations {
 const result:StructuredRiskObservations={};
 if(!value||typeof value!=='object')return result;
 for(const {key} of items){
  const field=(value as Record<string,unknown>)[key];if(!field||typeof field!=='object')continue;
  const {status:rawStatus,evidence}=field as {status:string;evidence:string};
  const status=(({未见明显:"未发现",疑似少量:"少量",疑似大量:"大量"} as Record<string,string>)[rawStatus]||rawStatus) as ObservationValue;
  if(riskObservationValues.includes(status)&&typeof evidence==='string'&&evidence.trim()&&!uncertain.test(evidence))result[key]={status,evidence:evidence.trim()};
 }
 return result;
}

// Legacy reports may describe the same observation in prose instead of structured fields.
export function readRiskObservations(report:Report){
 const structured=normalizeRiskObservations(report.riskObservations);
 const clauses=report.facts.filter(f=>['颜色','性状','可见混合物','血丝','奶瓣','灰白色'].includes(f.label)).flatMap(f=>[f.value,f.detail].filter(Boolean).map(t=>['血丝','奶瓣','灰白色'].includes(f.label)?`${f.label}：${t}`:t)).flatMap(text=>text.split(/[，,。；;！？\n]/)).map(text=>text.trim());
 return items.map(item=>{
  const states=new Set<string>(),values=new Set<string>();
  const explicit=structured[item.key];
  if(explicit){states.add(explicit.status==='未发现'?'absent':'present');if(explicit.status!=='未发现')values.add(explicit.status);}
  for(const raw of [...clauses,...(explicit?[explicit.evidence]:[])]){
   if(!item.pattern.test(raw)||/历史|此前|之前|既往|如果|若|建议|注意|需|但/.test(raw))continue;
   if(uncertain.test(raw)){states.add('unknown');continue;}
   let clean=raw.replace(/\s+/g,'').replace(/^(?:(?:本次)?(?:照片|图片|图|示例)(?:中|内)?|本次|便便中|便便)/,'');
   const nounFirst=clean.match(/^((?:血丝|血迹|奶瓣|灰白色|灰白|陶土色)(?:(?:、|和|及|或)(?:血丝|血迹|奶瓣|灰白色|灰白|陶土色))*)(?:均|都)?[：:]?(未见明显|未检测到|未观察到|未检出|未发现|未见|没有|无|阴性|疑似少量|疑似大量|少量|大量|发现异常)$/);
   if(nounFirst)clean=`${nounFirst[2]==='阴性'?'未见':nounFirst[2]}${nounFirst[1]}`;
   if(negative.test(clean)&&!/(?:可见|伴有|存在|少量|大量|较多|增多|减少|增加|变化)/.test(clean.replace(negative,'')))states.add('absent');
   else if(!/未|无|不|没有/.test(clean)&&(/^(?:疑似|可见|发现|伴有|存在|有|少量|大量|明显|呈|以)/.test(clean)||clean.match(item.pattern)?.index===0)){
    const value=/大量|较多/.test(clean)?'大量':/少量|少许|零星/.test(clean)?'少量':!clean.includes('疑似')&&(item.label!=='奶瓣'||clean.includes('异常'))?'发现异常':'';
    states.add(value?'present':'unknown');if(value)values.add(value);
   }
  }
  if(values.size>1)values.delete('发现异常');
  const state=states.size===1&&values.size<=1?[...states][0]:'unknown';
  return {label:item.label,state,value:state==='absent'?'未发现':state==='present'?[...values][0]:''};
 });
}
export function riskQuantity(value:string){return ({'未发现':'未发现','少量':'少量','大量':'大量','未见明显':'未发现','疑似少量':'少量','疑似大量':'大量'} as Record<string,string>)[value]||'';}
export function missingRiskLabels(report:Report){return readRiskObservations(report).filter(x=>!riskQuantity(x.value)).map(x=>x.label);}
export function missingRiskMessage(report:Report){const labels=missingRiskLabels(report);return labels.length?`${labels.join('、')}的观察信息不完整，${['red','orange'].includes(report.risk)?'请优先向医生提供原始照片与宝宝情况。':'请重新拍摄清晰照片进行分析。'}`:'';}
