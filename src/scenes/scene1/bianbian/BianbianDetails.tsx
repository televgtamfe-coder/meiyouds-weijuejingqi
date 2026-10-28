import { FormEvent } from 'react';
import { AnalysisForm } from './analysis';
import { Icon } from './ui';
export const bowelOptions=[['diarrhea','腹泻'],['increased','次数增多'],['usual','和平时一样'],['decreased','次数减少'],['constipation','便秘']];
const symptoms=['无以下情况','发热','呕吐','精神差','持续哭闹','便中有血','尿量减少'];
export function BianbianDetails({image,form,onChange,onSubmit,onPhoto,error,question,busy,repeat=false}:{repeat?:boolean;image:string;form:AnalysisForm;onChange:(form:AnalysisForm)=>void;onSubmit:(e:FormEvent)=>void;onPhoto:()=>void;error:string;question:string;busy:boolean}) {
 function set<K extends keyof AnalysisForm>(key:K,value:AnalysisForm[K]){onChange({...form,[key]:value,mockFields:(form.mockFields||[]).filter(k=>k!==key)});}
 return <><form id="br-analysis" className="br-scroll br-details" onSubmit={onSubmit}>
  <div className="br-photo-preview"><img src={image} alt="已选择的便便照片"/><button type="button" onClick={onPhoto} disabled={busy}><Icon name="edit"/>更换照片</button></div>
  <section className="br-details-card">{!repeat&&<fieldset><legend>排便情况</legend><p>和宝宝平时相比，最近有什么变化？</p><div className="br-patterns" role="group" aria-label="排便变化">{bowelOptions.map(([v,label])=><button type="button" key={v} aria-pressed={form.bowelPattern===v} onClick={()=>set('bowelPattern',v)}>{label}</button>)}</div></fieldset>}
   <details className="br-more-details" open><summary>{repeat?'伴随症状':'补充排便次数与伴随情况'}<span>选填</span></summary>{!repeat&&<div className="br-number-fields"><label>近 24 小时排便<input type="number" inputMode="numeric" min="0" max="50" step="1" placeholder="次数" value={form.frequency} onChange={e=>set('frequency',e.target.value)}/></label><label>平时每天<input type="number" inputMode="numeric" min="0" max="50" step="1" placeholder="次数" value={form.baseline} onChange={e=>set('baseline',e.target.value)}/></label></div>}<p className="br-support">伴随情况，可多选</p><div className="br-symptoms">{symptoms.map(s=><button type="button" key={s} aria-pressed={form.symptoms.includes(s)} onClick={()=>set('symptoms',s===symptoms[0]?[s]:form.symptoms.includes(s)?form.symptoms.filter(x=>x!==s):[...form.symptoms.filter(x=>x!==symptoms[0]),s])}>{s}</button>)}</div></details>
   <div className="br-notes"><label htmlFor="br-notes">补充说明<span>选填</span></label><p>例如喂养变化、持续时间或不适表现</p><textarea id="br-notes" rows={4} maxLength={500} placeholder="在这里补充宝宝的近况…" value={form.notes} onChange={e=>set('notes',e.target.value)}/><small className="br-count">{form.notes.length}/500</small></div>
  </section>
  <div className="br-feedback" aria-live="polite">{error&&<p className="br-error" role="alert">{error}</p>}{question&&<section className="br-followup"><strong>还需要补充一点信息</strong><p>{question}</p><p>请在补充说明中填写后重新提交。</p></section>}</div>
  <label className="br-consent"><input type="checkbox" checked={form.consent} onChange={e=>set('consent',e.target.checked)}/><span>同意上传照片与填写资料进行分析，并将照片和报告保存至服务器。</span></label>
 </form><footer className="br-action-footer"><button type="submit" form="br-analysis" className="br-primary" disabled={busy}>{busy?'正在读取照片…':'开始分析'}</button></footer></>;
}
