import type {AnalysisForm} from './analysis';
import type {SavedReport} from './records';

export const previousBowelKey='meiyou.bianbian.previous-bowel.v1';
const fields=['bowelPattern','frequency','baseline'];
export type PreviousBowel=Pick<AnalysisForm,'bowelPattern'|'frequency'|'baseline'|'mockFields'>;
export function bowelSnapshot(value:unknown):PreviousBowel|null {
 if(!value||typeof value!=='object')return null;
 const f=value as AnalysisForm;
 if(!['diarrhea','increased','usual','decreased','constipation'].includes(f.bowelPattern||''))return null;
 if(![f.frequency,f.baseline].every(v=>typeof v==='string'&&(v===''||/^\d+$/.test(v)&&Number(v)<=50)))return null;
 return {bowelPattern:f.bowelPattern,frequency:f.frequency,baseline:f.baseline,mockFields:Array.isArray(f.mockFields)?f.mockFields.filter(k=>fields.includes(k)):[]};
}
export function loadPreviousBowel(records:SavedReport[]):PreviousBowel|null {
 try{const raw=localStorage.getItem(previousBowelKey);if(raw!==null)return bowelSnapshot(JSON.parse(raw));}catch{/* Fall back to a saved report when storage is unavailable. */}
 for(const r of [...records].filter(r=>!r.demo).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt))){const value=bowelSnapshot(r.formSnapshot);if(value)return value;}
 return null;
}
export function savePreviousBowel(value:PreviousBowel|null){try{localStorage.setItem(previousBowelKey,JSON.stringify(value));}catch{/* Current-page state still retains the last values. */}}
export function reusePreviousBowel(form:AnalysisForm,previous:PreviousBowel|null):AnalysisForm {
 if(!previous)return form;
 return {...form,...previous,mockFields:[...(form.mockFields||[]).filter(k=>!fields.includes(k)),...(previous.mockFields||[])]};
}
